/**
 * @file This is a simple Redux counter example that uses `electron-store` for
 *       persistant storage.
 */

import db from 'electron-react-builder/app/plugins/db';

const initialState = {
  count: db.get(`count`) || 0,
};

export const COUNT_CHANGED = `@counter/changed`;
export const COUNT_RESET = `@counter/reset`;

export function increment() {
  return (dispatch) => {
    dispatch({
      type: COUNT_CHANGED,
      by: 1,
    });
  };
}

export function reset() {
  return (dispatch) => {
    dispatch({
      type: COUNT_RESET,
    });
  };
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
  case COUNT_CHANGED: {
    const t = state.count + action.by;
    db.set(`count`, t);
    return { count: t };
  }
  case COUNT_RESET:
    db.set(`count`, 0);
    return { count: 0 };
  default:
    return state;
  }
}
