import Vue from 'vue';
import VueI18n from 'vue-i18n';

/**
 * Set up vue-i18n. This script automatically crawls the `config/locales` folder
 * for locale JSON files and adds them to the plugin. The key of the locale
 * is as specified by the basename of the locale files. i.e. The key for
 * `en.json` is `en`.
 *
 * This adds 2 additional global variables accessible in Vue templates:
 *   - `$t()`: This is how you fetch localized strings.
 *     @see {@link http://kazupon.github.io/vue-i18n/en/formatting.html}
 *   - `$locale`: This let's you get or change the current locale. Use
 *                `$locale.change()` or `$locale.current()`.
 *
 * @see {@link https://github.com/kazupon/vue-i18n}
 */
Vue.use(VueI18n);

let messages = {};

let locales = require.context(`@/../../config/locales`, true, /^.*\.json$/);
locales.keys().forEach(path => {
  const basename = path.replace(/^.*[\\\/]/, ``).replace(/\.json$/, ``); // eslint-disable-line no-useless-escape
  messages[basename] = locales(path);
});

const i18n = new VueI18n({
  locale: `en`,
  fallbackLocale: `en`,
  messages
});

// Define `$locale` property so it can be accessed in templates.
Vue.prototype.$locale = {
  change: function(lang) {
    i18n.locale = lang;
  },
  current: function() {
    return i18n.locale;
  }
};

export default i18n;