/**
 * @file Base Webpack config for both main and renderer Electron processes.
 */

const _ = require(`lodash`);
const chalk = require(`chalk`);
const log = require(`../utils/log`);
const path = require(`path`);
const webpack = require(`webpack`);
const routeUtils = require(`../utils/routes`);
const localeUtils = require(`../utils/locales`);

module.exports = function(config, paths) {
  const isProduction = process.env.NODE_ENV === `production`;
  const routes = routeUtils.generate(config, paths);
  const locales = localeUtils.getLocaleData(paths);
  const useSourceMaps = isProduction ? config.build.sourceMap : config.dev.sourceMap;

  if (process.env.BABEL_ENV === `renderer`) {
    log.info(`Resolved locales: ${Object.keys(locales).map(v => chalk.cyan(v)).join(`, `)}`);
    log.info(`Resolved routes: ${routes.map(route => chalk.cyan(route.path)).join(`, `)}`);
  }

  return {
    mode: isProduction ? `production` : `development`,
    target: `electron-${process.env.BABEL_ENV}`,
    devtool: isProduction && (useSourceMaps ? `source-map` : false) || `#cheap-module-eval-source-map`,
    node: {
      __dirname: !isProduction,
      __filename: !isProduction,
    },
    entry: {
      [process.env.BABEL_ENV]: path.join(paths.input, `${process.env.BABEL_ENV}/index.js`),
    },
    output: {
      filename: `[name].js`,
      libraryTarget: `commonjs2`,
      path: path.join(paths.output, `electron`),
    },
    resolve: {
      extensions: [`.js`, `.jsx`, `.json`, `.node` ],
      alias: {
        '@': path.join(paths.input, process.env.BABEL_ENV),
      },
      modules: [
        path.resolve(paths.base, `node_modules`),
        path.resolve(__dirname, `../node_modules`),
        path.resolve(paths.input, process.env.BABEL_ENV),
      ],
    },
    module: {
      rules: [{
        test: /\.node$/,
        use: `node-loader`,
      }, {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: `babel-loader`,
          options: {
            sourceMaps: useSourceMaps,
            retainLines: true,
            presets: [
              `env`,
              `react`,
            ],
            plugins: [
              `transform-object-rest-spread`,
              `transform-runtime`,
              `transform-decorators-legacy`,
              `transform-class-properties`,
            ],
          },
        },
      } ],
    },
    plugins: [
      new webpack.DefinePlugin({
        '$config': JSON.stringify(config),
        '$routes': JSON.stringify(routes),
        '$locales': JSON.stringify(locales),
        'process.env': _({
          NODE_ENV: `"${process.env.NODE_ENV}"`,
        })
          .assign(config.env && _.mapValues(config.env, (val) => JSON.stringify(val)))
          .value(),
      }),
    ],
  };
};
