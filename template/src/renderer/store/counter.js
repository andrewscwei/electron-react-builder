import db from 'electron-react-builder/app/plugins/db';

const initialState = {
  count: db.get(`count`) || 0,
};

export const COUNT_CHANGED = `@counter/changed`;

export function incrementOnce() {
  return (dispatch) => {
    dispatch({
      type: COUNT_CHANGED,
      by: 1,
    });
  };
}

export function incrementTwice() {
  return (dispatch) => {
    dispatch({
      type: COUNT_CHANGED,
      by: 2,
    });
  };
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
  case COUNT_CHANGED: {
    const t = state.count + action.by;
    db.set(`count`, t);

    return {
      count: t,
    };
  }
  default:
    return state;
  }
}
