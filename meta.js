/* eslint-disable no-console */

const fs = require(`fs`);
const path = require(`path`);

module.exports = {
  helpers: {
    slugify: (str) => {
      return str.toLowerCase()
        .replace(/\s+/g, `-`)
        .replace(/[^\w-]+/g, ``)
        .replace(/--+/g, `-`)
        .replace(/^-+/, ``)
        .replace(/-+$/, ``);
    },
  },
  prompts: {
    name: {
      type: `string`,
      required: true,
      message: `Project name`,
    },
    repository: {
      type: `string`,
      required: false,
      message: `URL to Git repository for auto-publisher (enter to skip)`,
    },
    description: {
      type: `string`,
      required: false,
      message: `Project description`,
      default: `An electron-react-builder project`,
    },
    author: {
      type: `string`,
      required: false,
      message: `Author`,
    },
  },
  skipInterpolation: [`.*`, `.*/**`, ],
  complete(data) {
    const destDir = path.join(process.cwd(), data.destDirName);
    const filesToCopy = [`jsconfig.json`, `.editorconfig`, `.eslintrc`, `.stylelintrc`, `.nvmrc`, `.gitignore`, `config/app.conf.js`, ];

    filesToCopy.forEach(file => {
      fs.copyFileSync(path.join(__dirname, file), path.join(destDir, file));
    });

    console.log(`\nTo get started:\n`);
    console.log(`  cd ${data.destDirName}`);
    console.log(`  nvm use`);
    console.log(`  yarn`);
    console.log(`  yarn dev\n`);
  },
};
