/**
 * @file Base Webpack config for both main and renderer Electron processes.
 */

const _ = require(`lodash`);
const chalk = require(`chalk`);
const fs = require(`fs`);
const log = require(`../utils/log`);
const path = require(`path`);
const routes = require(`../utils/routes`);
const webpack = require(`webpack`);

module.exports = function(config, paths) {
  const isProduction = process.env.NODE_ENV === `production`;
  const generatedRoutes = routes.generate(config, paths);
  const shouldLint = isProduction ? false : config.dev.linter;
  const locales = fs.readdirSync(path.resolve(paths.base, `config/locales`))
    .filter(v => !(/(^|\/)\.[^/.]/g).test(v))
    .map(val => path.basename(val, `.json`));

  if (process.env.BABEL_ENV === `renderer`) {
    log.info(`Resolved locales: ${locales.map(v => chalk.cyan(v)).join(`, `)}`);
    log.info(`Resolved routes: ${generatedRoutes.map(route => chalk.cyan(route.path)).join(`, `)}`);
  }

  return {
    mode: isProduction ? `production` : `development`,
    target: `electron-${process.env.BABEL_ENV}`,
    devtool: isProduction && (config.build.sourceMap ? `source-map` : false) || `#cheap-module-eval-source-map`,
    node: {
      __dirname: !isProduction,
      __filename: !isProduction
    },
    entry: {
      [process.env.BABEL_ENV]: path.join(paths.input, `${process.env.BABEL_ENV}/index.js`)
    },
    output: {
      filename: `[name].js`,
      libraryTarget: `commonjs2`,
      path: path.join(paths.output, `electron`)
    },
    resolve: {
      extensions: [`.js`, `.json`, `.node`],
      alias: {
        '@': path.join(paths.input, process.env.BABEL_ENV),
      },
      modules: [
        path.resolve(paths.base, `node_modules`),
        path.resolve(__dirname, `../node_modules`),
        path.resolve(paths.input, process.env.BABEL_ENV)
      ]
    },
    module: {
      rules: [{
        test: /\.node$/,
        use: `node-loader`
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: `babel-loader`,
          options: {
            presets: [`env`],
            plugins: [
              `transform-object-rest-spread`,
              `transform-runtime`
            ]
          }
        }
      }]
        .concat(shouldLint ? [{
          test: /\.(js)$/,
          loader: `eslint-loader`,
          enforce: `pre`,
          include: [path.resolve(paths.input, process.env.BABEL_ENV)],
          options: {
            ignorePath: path.join(paths.base, `.gitignore`),
            formatter: require(`eslint-friendly-formatter`)
          }
        }] : [])
    },
    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        '$config': JSON.stringify(config),
        '$routes': JSON.stringify(generatedRoutes),
        '$locales': JSON.stringify(locales),
        'process.env': _({
          NODE_ENV: `"${process.env.NODE_ENV}"`
        })
          .assign(config.env && _.mapValues(config.env, (val) => JSON.stringify(val)))
          .value()
      })
    ]
  };
};
