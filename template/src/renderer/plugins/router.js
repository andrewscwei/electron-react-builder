import i18n from '@/plugins/i18n';
import Vue from 'vue';
import VueRouter from 'vue-router';

/**
 * Set up vue-router. Routes are automatically populated based on `src/pages`
 * directory or what's defined in `config/routes.conf.json`. The `:lang` param
 * is reserved for switching locales.
 *
 * This adds an additional global variable accessible in Vue templates:
 *   - `$routes`: This is the imported routes file.
 *
 * @see {@link https://github.com/vuejs/vue-router}
 */
Vue.use(VueRouter);

let routes = undefined;

try {
  routes = require(`@/../../config/routes.conf`);
}
catch (err) {
  routes = $routes;
}

const router = new VueRouter({
  mode: `hash`,
  routes: routes.map(val => {
    val.component = require(`@/pages/${val.component}`).default;
    return val;
  })
    .concat([{
      path: `*`,
      redirect: `/`,
    }, ]),
});

router.beforeEach((to, from, next) => {
  window.scrollTo(0, 0);

  const defaultLocale = $locales.length > 1 ? $config.defaultLocale : $locales[0];
  const locale = to.fullPath.split(`/`).filter(v => v)[0] || `en`;

  i18n.locale = ~$locales.indexOf(locale) ? locale : defaultLocale;
  next();
});

// Define `$routes` property so it can be accessed in templates.
Vue.prototype.$routes = routes;

export default router;