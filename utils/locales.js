/**
 * @file Utility functions for extracting locale information from the project.
 */

const path = require(`path`);
const fs = require(`fs`);

exports.getLocaleData = function(paths) {
  const locales = fs.readdirSync(path.join(paths.base, `config/locales`))
    .filter(v => !(/(^|\/)\.[^/.]/g).test(v))
    .map(val => path.basename(val, `.json`));

  const translations = fs.readdirSync(path.join(paths.base, `config/locales`))
    .filter(v => !(/(^|\/)\.[^/.]/g).test(v))
    .map(val => path.basename(val, `.json`))
    .filter(v => ~locales.indexOf(v))
    .reduce((obj, val) => {
      obj[val] = require(path.join(paths.base, `config/locales`, `${val}.json`));
      return obj;
    }, {});

  return translations;
};
