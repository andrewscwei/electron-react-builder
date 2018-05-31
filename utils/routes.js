/**
 * @file Generates routes by crawling the pages folder.
 */

const _ = require(`lodash`);
const path = require(`path`);
const fs = require(`fs`);

exports.parseDir = function(dir, baseDir = dir) {
  const pages = fs.readdirSync(dir);
  let out = [];

  pages.forEach(filename => {
    if ((/(^|\/)\.[^/.]/g).test(filename)) return;

    const basename = path.basename(filename, `.vue`);

    // Ignore files with certain names (i.e. 404.vue). No need to generate a
    // route for these files.
    if (~[`404`].indexOf(basename)) return;

    // Check if directory. If it is, crawl its contents to determine sub-routes.
    if (basename === filename) return out = out.concat(exports.parseDir(path.join(dir, basename), baseDir));

    // Infer the route for each valid file.
    const tmp = path.join(dir, basename).replace(baseDir, ``)
      .split(`/`)
      .filter(v => v);
    const url = tmp
      .map((v, i)  => {
        // Routes should appear in kebab case.
        const out = _.kebabCase(v);

        // Treat certain keywords as page index.
        return ~[`index`, `home`, `landing`].indexOf(out) && (i === tmp.length - 1) ? `` : out;
      })
      .join(`/`);

    out.push({
      path: `/${url}`,
      component: `${path.join(dir, filename).replace(baseDir, ``)}`.split(`/`).filter(v => v)
        .join(`/`)
    });
  });

  return out;
};

exports.generate = function(config, paths) {
  let locales = fs.readdirSync(path.resolve(paths.base, `config/locales`))
    .filter(v => !(/(^|\/)\.[^/.]/g).test(v))
    .map(val => path.basename(val, `.json`));

  // If there is only one locale, that is the default and therefore does not
  // need to be considered.
  if (locales.length <= 1) {
    locales = [];
  }
  // Otherwise strip the default locale from the locale array. We don't need
  // to generate a prerendered path prefixed with the default locale.
  else {
    locales = locales.filter(locale => locale !== config.defaultLocale);
  }

  // Generate routes based on the pages directory.
  let routes = exports.parseDir(path.resolve(paths.input, `renderer`, `pages`));

  // Generate localized routes for each supported locale if there are multiple
  // supported locales.
  if (locales.length > 0) {
    locales = locales.map(locale => {
      return _.cloneDeep(routes).map(route => {
        route.path = `/${path.join(locale, route.path).split(`/`)
          .filter(v => v)
          .join(`/`)}`;
        return route;
      });
    });
  }

  // Merge the base routes and the localized routes.
  routes = _.flatten(routes.concat(locales));

  // Finally, add the wildcard route at the end to redirect to 404 page.
  if (fs.existsSync(path.resolve(paths.input, `renderer`, `pages`, `404.vue`))) {
    routes.push({
      path: `*`,
      component: `404.vue`
    });
  }

  return routes;
};
