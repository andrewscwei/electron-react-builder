/**
 * @file Project scaffolding task.
 */

const _ = require(`lodash`);
const inquirer = require(`inquirer`);
const log = require(`../utils/log`);

module.exports = async function(paths) {
  log.info(`Creating a new electron-react-builder project...`);

  const { projectName, productName, author, description } = await inquirer.prompt([{
    type: `input`,
    name: `projectName`,
    message: `Project name (kebab-case only, a new directory with the same name will be created in the current working directory):`,
    filter: (t) => _.kebabCase(t),
  }, {
    type: `input`,
    name: `productName`,
    message: `Product name:`,
  }, {
    type: `input`,
    name: `author`,
    message: `Author:`,
  }, {
    type: `input`,
    name: `description`,
    message: `Project description:`,
    default: `An electron-react-builder project`,
  }]);

  const { repository } = await inquirer.prompt([{
    type: `input`,
    name: `repository`,
    message: `Repository URL (i.e. https://github.com/<user_name>/<repo_name>.git):`,
    default: `https://github.com/${author}/${projectName}`,
  }]);
};
