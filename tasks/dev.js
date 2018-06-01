/**
 * @file Dev task. Runs the Electron app on a web browser with hot module
 *       reloading enabled.
 */

const electron = require(`electron-connect`).server.create();
const log = require(`../utils/log`);
const merge = require(`webpack-merge`);
const path = require(`path`);
const webpack = require(`webpack`);
const WebpackHotMiddleware = require(`webpack-hot-middleware`);
const WebpackDevServer = require(`webpack-dev-server`);

module.exports = async function(config, paths) {
  const mainConfig = require(`../config/webpack.main.conf`)(config, paths);
  const rendererConfig = require(`../config/webpack.renderer.conf`)(config, paths);

  // Default port where dev server listens for incoming traffic.
  const port = process.env.PORT || config.dev.port;

  let hotMiddleware;

  function startMain() {
    return new Promise((resolve, reject) => {
      log.info(`Building main process...`);

      const compiler = webpack(mainConfig);

      if (config.dev.reloadMainProcess) {
        compiler.watch({}, (err, stats) => {
          if (err) {
            console.error(err.stack || err);
            log.fail(`Failed to build main process`);
            return;
          }

          if (stats.hasErrors()) {
            console.error(stats.toString({ chunks: false, colors: true }));
            log.fail(`Failed to build main process`);
            return;
          }

          console.log(stats.toString({ chunks: false, colors: true }));
          log.succeed(`Successfully built main process`);
          electron.restart();
          resolve();
        });
      }
      else {
        compiler.run((err, stats) => {
          if (err) {
            console.error(err.stack || err);
            log.fail(`Failed to build main process`);
            return;
          }

          if (stats.hasErrors()) {
            console.error(stats.toString({ chunks: false, colors: true }));
            log.fail(`Failed to build main process`);
            return;
          }

          console.log(stats.toString({ chunks: false, colors: true }));
          log.succeed(`Successfully built main process`);
          resolve();
        });
      }
    });
  }

  function startRenderer() {
    return new Promise((resolve, reject) => {
      log.info(`Building renderer process...`);

      const compiler = webpack(merge(rendererConfig, {
        entry: {
          renderer: [path.join(__dirname, `dev-client`) ].concat(rendererConfig.entry.renderer),
        },
      }));

      hotMiddleware = WebpackHotMiddleware(compiler, {
        log: false,
        heartbeat: 2000,
      });

      // Force page reload when html-webpack-plugin template changes.
      compiler.plugin(`compilation`, (compilation) => {
        compilation.plugin(`html-webpack-plugin-after-emit`, function(data) {
          hotMiddleware.publish({ action: `reload` });
        });
      });

      compiler.plugin(`done`, (stats) => {
        console.log(stats.toString({ chunks: false, colors: true }));
        log.succeed(`Successfully built renderer process`);
      });

      const server = new WebpackDevServer(compiler, {
        contentBase: paths.base,
        quiet: true,
        before: (app, ctx) => {
          app.use(hotMiddleware);
          ctx.middleware.waitUntilValid(function() {
            resolve();
          });
        },
      });

      server.listen(port);
    });
  }

  try {
    await startRenderer();
    await startMain();
    electron.start();
  }
  catch (err) {
    console.error(err);
  }
};
