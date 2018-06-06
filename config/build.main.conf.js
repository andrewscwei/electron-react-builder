/**
 * @file Webpack config for Electron's main process.
 */

process.env.BABEL_ENV = `main`;

const path = require(`path`);
const merge = require(`webpack-merge`);
const CopyWebpackPlugin = require(`copy-webpack-plugin`);
const { dependencies } = require(`../package.json`);

module.exports = function(config, paths) {
  const whitelistedModules = [
    `electron-log`,
    `electron-updater`,
    `fs-extra`,
  ];
  const isProduction = process.env.NODE_ENV === `production`;
  const baseWebpackConfig = require(`./build.base.conf`)(config, paths);

  return merge(baseWebpackConfig, {
    entry: {
      main: path.join(paths.input, `main/index.js`),
    },
    externals: [
      ...Object.keys(dependencies || {}).filter(d => !whitelistedModules.includes(d)),
    ],
    plugins: [
      ...!isProduction ? [] : [
        new CopyWebpackPlugin([{
          from: path.join(paths.input, `icons`),
          to: path.join(paths.build, `icons`),
          ignore: [`.*` ],
        }]),
      ],
    ],
  });
};
