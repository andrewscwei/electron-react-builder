/**
 * @file Project scaffolding task.
 */

const _ = require(`lodash`);
const chalk = require(`chalk`);
const fs = require(`fs-extra`);
const inquirer = require(`inquirer`);
const log = require(`../utils/log`);
const path = require(`path`);

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      fileList = walk(path.join(dir, file), fileList);
    }
    else {
      fileList.push(path.join(dir, file));
    }
  });

  return fileList;
}

module.exports = async function() {
  log.info(`Creating a new electron-react-builder project...`);

  let productName, projectName, description, author, repository;

  if (process.env.NODE_ENV === `test`) {
    productName = `Demo`;
    projectName = _.kebabCase(productName);
    description = `An electron-react-builder project`;
    author = `Bot`;
    repository = ``;
  }
  else {
    ({ productName } = await inquirer.prompt([{
      type: `input`,
      name: `productName`,
      message: `Product name:`,
      validate: (t) => {
        if (_.isEmpty(t)) return `Product name is required`;
        return true;
      },
    }]));

    ({ projectName, description, author } = await inquirer.prompt([{
      type: `input`,
      name: `projectName`,
      message: `Project name:`,
      validate: (t) => {
        if (_.isEmpty(t)) return `Project name cannot be blank`;
        if (_.kebabCase(t) !== t) return `Project name must be kebab-cased (i.e. hello-world)`;
        return true;
      },
      default: _.kebabCase(productName),
    }, {
      type: `input`,
      name: `description`,
      message: `Project description:`,
      default: `An electron-react-builder project`,
    }, {
      type: `input`,
      name: `author`,
      message: `Author (i.e. John Doe <john@doe.com>):`,
    }]));

    ({ repository } = await inquirer.prompt([{
      type: `input`,
      name: `repository`,
      message: `Repository URL (i.e. https://github.com/<user_name>/<repo_name>.git):`,
    }]));
  }

  const dir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(dir)) throw new Error(`Target directory ${dir} already exists`);

  fs.mkdirSync(path.resolve(process.cwd(), projectName));

  const files = [
    path.join(__dirname, `../.editorconfig`),
    path.join(__dirname, `../.eslintrc`),
    path.join(__dirname, `../.stylelintrc`),
    path.join(__dirname, `../.nvmrc`),
    path.join(__dirname, `../config/app.conf.js`),
    ...walk(path.resolve(__dirname, `../template`)),
  ];

  for (const file of files) {
    const src = path.join(__dirname, `../`);
    const out = path.relative(src, file).startsWith(`template/`) ? path.relative(path.join(src, `template`), file) : path.relative(src, file);
    const exts = [`.js`, `.jsx`, `.css`, `.yaml`, `.yml`, `.json`, `.html`, `.md`];

    if (_.startsWith(`../`, out)) return;

    const outFile = path.join(dir, out);

    if (~exts.indexOf(path.extname(out))) {
      log.info(`Templating ${chalk.cyan(outFile)}`);

      const s = await fs.readFile(file, `utf8`);
      const t = _.template(s, {
        interpolate: /{{=([\s\S]+?)}}/g,
      });
      const o = t({ projectName, productName, author, description, repository });

      await fs.mkdirs(path.dirname(outFile));
      await fs.writeFile(outFile, o);
    }
    else {
      log.info(`Copying ${chalk.cyan(outFile)}`);
      await fs.mkdirs(path.dirname(outFile));
      await fs.copyFile(file, outFile);
    }
  }

  // Special case to handle .gitignore.
  fs.rename(path.join(dir, `gitignore`), path.join(dir, `.gitignore`));

  log.succeed(`Successfully scaffolded project`);

  console.log(``);
  console.log(`Run the following to start developing:`);
  console.log(`  cd ${projectName}`);
  console.log(`  nvm use`);
  console.log(`  yarn`);
  console.log(`  npm run dev`);
};
