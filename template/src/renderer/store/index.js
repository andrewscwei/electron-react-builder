import Vue from 'vue';
import Vuex from 'vuex';
import * as common from '@/store/common';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    common: {
      namespaced: true,
      ...common
    }
  }
});