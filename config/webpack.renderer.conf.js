/**
 * @file Webpack config for Electron's renderer process.
 */

process.env.BABEL_ENV = `renderer`;

const merge = require(`webpack-merge`);
const path = require(`path`);
const webpack = require(`webpack`);
const CopyWebpackPlugin = require(`copy-webpack-plugin`);
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
const MiniCSSExtractPlugin = require(`mini-css-extract-plugin`);
const OptimizeCSSPlugin = require(`optimize-css-assets-webpack-plugin`);
const { dependencies } = require(`../package.json`);
const { VueLoaderPlugin } = require(`vue-loader`);

module.exports = function(config, paths) {
  /**
   * List of node_modules to include in webpack bundle, required for specific
   * packages like Vue UI libraries that provide pure *.vue files that need
   * compiling.
   * @see {@link https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals}
   */
  const whitelistedModules = [`vue`, `vue-electron`, `vue-router`, `vue-i18n`, `ip`, `vuex`, `electron-store`, `electron-log`];
  const isProduction = process.env.NODE_ENV === `production`;
  const useSourceMap = isProduction ? config.build.sourceMap : config.dev.sourceMap;
  const baseWebpackConfig = require(`./webpack.base.conf`)(config, paths);

  return merge(baseWebpackConfig, {
    mode: isProduction ? `production` : `development`,
    externals: [
      ...Object.keys(dependencies || {}).filter(d => !whitelistedModules.includes(d))
    ],
    resolve: {
      extensions: [`.vue`, `.css`],
      alias: {
        ...(config.bundleCompiler ? { vue$: `vue/dist/vue.esm.js` } : {})
      }
    },
    module: {
      rules: [{
        test: /\.vue$/,
        loader: `vue-loader`
      }, {
        test: /\.(s?css)(\?.*)?$/,
        oneOf: (function() {
          function loaders(modules) {
            return [isProduction ? MiniCSSExtractPlugin.loader : `vue-style-loader`].concat([{
              loader: `css-loader`,
              options: {
                modules: modules,
                importLoaders: 1,
                localIdentName: modules ? `[hash:6]` : undefined,
                minimize: isProduction,
                sourceMap: useSourceMap
              }
            }, {
              loader: `postcss-loader`,
              options: {
                ident: `postcss`,
                sourceMap: useSourceMap,
                browsers: [`last 2 versions`, `ie >= 11`],
                plugins: () => [require(`autoprefixer`)()]
              }
            }, {
              loader: `sass-loader`,
              options: {
                indentedSyntax: false,
                sourceMap: useSourceMap
              }
            }]);
          }

          return [{
            resourceQuery: /module/,
            use: loaders(true)
          }, {
            use: loaders(false)
          }];
        })()
      }, {
        test: /\.html$/,
        use: `vue-html-loader`
      }, {
        test: /\.(jpe?g|png|gif|svg|ico)(\?.*)?$/,
        use: `url-loader?limit=10000&name=images/[name]${isProduction ? `.[hash:6]` : ``}.[ext]`
      }, {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: `url-loader?limit=10000&name=media/[name]${isProduction ? `.[hash:6]` : ``}.[ext]`
      }, {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: `url-loader?limit=10000&name=fonts/[name]${isProduction ? `.[hash:6]` : ``}.[ext]`
      }]
    },
    plugins: [
      new VueLoaderPlugin(),
      new OptimizeCSSPlugin({ cssProcessorOptions: { safe: true } }),
      new MiniCSSExtractPlugin({ filename: `styles.css` }),
      new HtmlWebpackPlugin({
        filename: `index.html`,
        template: path.resolve(paths.input, `renderer`, `index.html`),
        minify: {
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeComments: true
        }
      })
    ]
      .concat(isProduction ? [
        new CopyWebpackPlugin([{
          from: path.join(paths.base, `static`),
          to: path.join(paths.output, `electron/static`),
          ignore: [`.*`]
        }])
      ] : [
        new webpack.HotModuleReplacementPlugin()
      ])
  });
};
