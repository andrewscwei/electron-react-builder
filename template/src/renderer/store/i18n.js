import { getTranslations } from 'electron-react-builder/app/renderer/plugins/i18n';

const translations = getTranslations();

const initialState = {
  locale: $config.defaultLocale,
  messages: translations[$config.defaultLocale],
};

export const I18N_LOCALE_CHANGED = `@i18n/localeChanged`;

export function changeLocale(locale) {
  return (dispatch) => {
    dispatch({
      type: I18N_LOCALE_CHANGED,
      locale,
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
