/**
 * @file Store for manipulating app locale.
 */

import { getTranslationDict } from 'electron-react-builder/app/plugins/intl';

const translationDict = getTranslationDict();

const initialState = {
  locale: $config.defaultLocale,
  translations: translationDict[$config.defaultLocale],
};

export const INTL_LOCALE_CHANGED = `@intl/localeChanged`;

export function changeLocale(locale) {
  return (dispatch) => {
    dispatch({
      type: INTL_LOCALE_CHANGED,
      locale,
    });
  };
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
  case INTL_LOCALE_CHANGED:
    return {
      locale: action.locale,
      translations: translationDict[action.locale],
    };
  default:
    return state;
  }
}
