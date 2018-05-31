import i18n from '@/plugins/i18n';
import log from 'electron-log';
import router from '@/plugins/router';
import store from '@/store';
import App from '@/App';
import Vue from 'vue';
import VueElectron from 'vue-electron';
import { webFrame, } from 'electron';

log.info(`RENDERER`, `Process started`);

webFrame.setZoomLevelLimits(1, 1);

Vue.use(VueElectron);

/* eslint-disable no-new */
new Vue({
  el: `#app`,
  store,
  i18n,
  router,
  render: h => h(App),
});
