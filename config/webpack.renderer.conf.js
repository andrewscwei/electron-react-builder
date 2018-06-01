/**
 * @file Webpack config for Electron's renderer process.
 */

process.env.BABEL_ENV = `renderer`;

const merge = require(`webpack-merge`);
const path = require(`path`);
const webpack = require(`webpack`);
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
const { dependencies } = require(`../package.json`);

module.exports = function(config, paths) {
  const whitelistedModules = [
    `classnames`,
    `react`,
    `react-dom`,
    `react-intl`,
    `react-redux`,
    `react-router-config`,
    `react-router-dom`,
    `redux`,
    `redux-thunk`,
    `react-transition-group`,
    `styled-components`,
    `styled-normalize`,
    `styled-transition-group`,
    `prop-types`,
    `open`,
    `ip`,
    `electron-store`,
    `electron-log`,
  ];

  const isProduction = process.env.NODE_ENV === `production`;
  const baseWebpackConfig = require(`./webpack.base.conf`)(config, paths);

  return merge(baseWebpackConfig, {
    mode: isProduction ? `production` : `development`,
    externals: [
      ...Object.keys(dependencies || {}).filter(d => !whitelistedModules.includes(d)),
    ],
    module: {
      rules: [{
        test: /\.(jpe?g|png|gif|svg|ico)(\?.*)?$/,
        use: `url-loader?limit=10000&name=images/[name]${isProduction ? `.[hash:6]` : ``}.[ext]`,
      }, {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: `url-loader?limit=10000&name=media/[name]${isProduction ? `.[hash:6]` : ``}.[ext]`,
      }, {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: `url-loader?limit=10000&name=fonts/[name]${isProduction ? `.[hash:6]` : ``}.[ext]`,
      } ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: `index.html`,
        template: path.resolve(paths.input, `renderer`, `index.html`),
        minify: {
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeComments: true,
        },
      }),
      ...isProduction ? [] : [
        new webpack.HotModuleReplacementPlugin(),
      ],
    ],
  });
};
