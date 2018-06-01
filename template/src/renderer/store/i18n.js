const translations = (function() {
  if (process.env.NODE_ENV !== `development`) return $locales;

  // In development, load translations directly from file system so they can be
  // watched.
  let t = {};
  let localeReq = require.context(`@/../../config/locales`, true, /^.*\.json$/);

  localeReq.keys().forEach((path) => {
    const locale = path.replace(`./`, ``).replace(`.json`, ``);
    if (!~Object.keys($locales).indexOf(locale)) return;
    t[locale] = localeReq(path);
  });

  return t;
})();

const initialState = {
  locale: $config.defaultLocale,
  messages: translations[$config.defaultLocale],
};

export const I18N_LOCALE_CHANGED = `@i18n/localeChanged`;

export function changeLocale(locale) {
  return (dispatch) => {
    dispatch({
      type: I18N_LOCALE_CHANGED,
      locale: locale,
    });
  };
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
  case I18N_LOCALE_CHANGED:
    return {
      locale: action.locale,
      messages: translations[action.locale],
    };
  default:
    return state;
  }
}
