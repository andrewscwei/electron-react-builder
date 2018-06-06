/**
 * @file Internationalization plugin.
 */

export function getTranslationDict() {
  if (process.env.NODE_ENV !== `development`) return $locales;

  // In development, load translations directly from file system so they can be
  // watched.
  let translationDict = {};
  let localeReq = require.context(`@/../../config/locales`, true, /^.*\.json$/);

  localeReq.keys().forEach((path) => {
    const locale = path.replace(`./`, ``).replace(`.json`, ``);
    if (!~Object.keys($locales).indexOf(locale)) return;
    translationDict[locale] = localeReq(path);
  });

  return translationDict;
}
