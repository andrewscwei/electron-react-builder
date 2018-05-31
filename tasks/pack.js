/**
 * @file Pack task for Mac and Windows platforms. Packages the Electron
 *       app in the target platform. Option to publish a release draft.
 */

const builder = require(`electron-builder`);
const ce = require(`command-exists`);
const chalk = require(`chalk`);
const log = require(`../utils/log`);
const spawn = require(`../utils/spawn`);
const Platform = builder.Platform;

const BUILDER_IMAGE_WIN = `electronuserland/builder:wine`;

module.exports = async function(config, paths, platform, shouldPublish = false) {
  switch (platform) {
  case `mac`:
    log.info(`Packaging for Mac...`);
    try {
      await builder.build({ targets: Platform.MAC.createTarget(), publish: shouldPublish ? `always` : `never` });
      log.succeed(`Successfully packaged for Mac`);
    }
    catch (err) {
      console.error(err);
      log.fail(`Failed to package for Mac`);
      process.exit(1);
    }
    break;
  case `win`:
    log.info(`Packaging for Windows...`);
    log.info(process.env.CSC_LINK ? `CSC_LINK detected` : `No CSC_LINK found`);
    log.info(process.env.CSC_KEY_PASSWORD ? `CSC_KEY_PASSWORD detected` : `No CSC_KEY_PASSWORD found`);
    log.info(process.env.WIN_CSC_LINK ? `WIN_CSC_LINK detected` : `No WIN_CSC_LINK found`);
    log.info(process.env.WIN_CSC_KEY_PASSWORD ? `WIN_CSC_KEY_PASSWORD detected` : `No WIN_CSC_KEY_PASSWORD found`);

    if (ce.sync(`docker`)) {
      log.info(`Docker detected`);
      log.info(`Mapping ${chalk.cyan(`${paths.base}`)} to ${chalk.cyan(`/app`)}`);
      try {
        await spawn(`docker`, [
          `run`, `--rm`, `-it`,
          `-v`, `${paths.base}:/app`,
          `-e`, `GH_TOKEN=${process.env.GH_TOKEN}`,
          `-e`, `CSC_LINK=${process.env.CSC_LINK}`,
          `-e`, `CSC_KEY_PASSWORD=${process.env.CSC_KEY_PASSWORD}`,
          `-e`, `WIN_CSC_LINK=${process.env.WIN_CSC_LINK}`,
          `-e`, `WIN_CSC_KEY_PASSWORD=${process.env.WIN_CSC_KEY_PASSWORD}`,
          `--workdir`, `/app`,
          BUILDER_IMAGE_WIN,
          `/bin/bash`, `-c`, `/app/node_modules/.bin/electron-builder --win -p ${shouldPublish ? `always` : `never`}`
        ], { stdio: `inherit` });
        log.succeed(`Successfully packaged for Windows`);
      }
      catch (err) {
        console.error(err);
        log.fail(`Failed to package for Windows`);
        process.exit(1);
      }
    }
    else {
      try {
        await builder.build({ targets: Platform.WINDOWS.createTarget(), publish: shouldPublish ? `always` : `never`  });
        log.succeed(`Successfully packaged for Windows`);
      }
      catch (err) {
        console.error(err);
        log.fail(`Failed to package for Windows`);
        process.exit(1);
      }
    }
    break;
  default:
    log.fail(`Unrecognized platform: ${chalk.cyan(platform)}`);
    process.exit(1);
  }
};
