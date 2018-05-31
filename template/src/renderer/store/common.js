import db from '@/plugins/db';

export const state = {
  get count() {
    return db.get(`count`) || 0;
  },
  set count(val) {
    db.set(`count`, val);
  }
};

export const mutations = {
  increment(state) {
    state.count++;
  }
};

export const getters = {
  doubleCount(state) {
    return state.count * 2;
  }
};

export const actions = {
  incrementTwice({ commit }) {
    commit(`increment`);
    commit(`increment`);
  }
};