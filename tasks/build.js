/**
 * @file Build task for all platforms.
 */

const compile = require(`../utils/compile`);
const log = require(`../utils/log`);

module.exports = async function(config, paths) {
  try {
    log.info(`Building main process...`);
    const res = await compile(require(`../config/build.main.conf`)(config, paths));
    console.log(res);
    log.succeed(`Successfully built main process`);
  }
  catch (err) {
    console.error(err);
    log.fail(`Build failed for main process`);
    process.exit(1);
  }

  try {
    log.info(`Building renderer process...`);
    const res = await compile(require(`../config/build.renderer.conf`)(config, paths));
    console.log(res);
    log.succeed(`Successfully built renderer process`);
  }
  catch (err) {
    console.error(err);
    log.fail(`Build failed for renderer process`);
    process.exit(1);
  }
};
