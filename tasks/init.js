/**
 * @file Project scaffolding task.
 */

const _ = require(`lodash`);
const fs = require(`fs`);
const inquirer = require(`inquirer`);
const log = require(`../utils/log`);
const path = require(`path`);

module.exports = async function() {
  log.info(`Creating a new electron-react-builder project...`);

  const { projectName, productName, author, description } = await inquirer.prompt([{
    type: `input`,
    name: `projectName`,
    message: `Project name:`,
    validate: (t) => {
      if (_.isEmpty(t)) return `Project name cannot be blank`;
      if (_.kebabCase(t) !== t) return `Project name must be kebab-cased (i.e. hello-world)`;
      return true;
    },
  }, {
    type: `input`,
    name: `productName`,
    message: `Product name:`,
    validate: (t) => {
      if (_.isEmpty(t)) return `Product name is required`;
      return true;
    },
  }, {
    type: `input`,
    name: `description`,
    message: `Project description:`,
    default: `An electron-react-builder project`,
  }, {
    type: `input`,
    name: `author`,
    message: `Author (i.e. John Doe <john@doe.com>):`,
  }]);

  const { repository } = await inquirer.prompt([{
    type: `input`,
    name: `repository`,
    message: `Repository URL (i.e. https://github.com/<user_name>/<repo_name>.git):`,
  }]);

  const dir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(dir)) throw new Error(`Target directory ${dir} already exists`);

  fs.mkdirSync(path.resolve(process.cwd(), projectName));
};
