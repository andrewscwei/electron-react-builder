/**
 * @file Patch task. Replaces config files in the current project with the ones
 *       in `electron-react-builder`'s latest template.
 */

const chalk = require(`chalk`);
const fs = require(`fs-extra`);
const log = require(`../utils/log`);
const path = require(`path`);

module.exports = async function(config, paths) {
  const templateFilesToPatch = [
    `.circleci/config.yml`,
    `jsconfig.json`,
  ];

  const rootFilesToPatch = [
    `.eslintrc`,
    `.stylelintrc`,
    `.editorconfig`,
    `.nvmrc`,
  ];

  log.info(`Patching files: ${templateFilesToPatch.map(val => (chalk.cyan(val))).join(`, `)}, ${rootFilesToPatch.map(val => (chalk.cyan(val))).join(`, `)}...`);

  for (let i = 0; i < templateFilesToPatch.length; i++) {
    const file = templateFilesToPatch[i];

    try {
      await new Promise((resolve, reject) => {
        const rd = fs.createReadStream(path.resolve(__dirname, `../template`, file));
        rd.on(`error`, err => reject(err));
        const wr = fs.createWriteStream(path.resolve(paths.base, file));
        wr.on(`error`, err => reject(err));
        wr.on(`close`, () => resolve());
        rd.pipe(wr);
      });
    }
    catch (err) {
      console.error(err);
      log.error(`Failed to patch ${file} at ${paths.base}`);
      process.exit(1);
    }
  }

  for (let i = 0; i < rootFilesToPatch.length; i++) {
    const file = rootFilesToPatch[i];

    try {
      await new Promise((resolve, reject) => {
        const rd = fs.createReadStream(path.resolve(__dirname, `../`, file));
        rd.on(`error`, err => reject(err));
        const wr = fs.createWriteStream(path.resolve(paths.base, file));
        wr.on(`error`, err => reject(err));
        wr.on(`close`, () => resolve());
        rd.pipe(wr);
      });
    }
    catch (err) {
      console.error(err);
      log.error(`Failed to patch ${file} at ${paths.base}`);
      process.exit(1);
    }
  }

  log.succeed(`Patch completed successfully`);
};
