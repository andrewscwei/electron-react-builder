/**
 * @file Webpack compiler, promisified.
 */

const webpack = require(`webpack`);

module.exports = function(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) return reject(err.stack || err);
      if (stats.hasErrors()) return reject(stats.toString({ chunks: false, colors: true, }));
      resolve(stats.toString({ chunks: false, colors: true, }));
    });
  });
};