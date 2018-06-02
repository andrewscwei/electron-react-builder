/**
 * @file Routes config. By default the routes are inferred from the `pages`
 *       folder. Override the routes if you wish to specify your own.
 */

import App from '@/App';

export default [{
  component: App,
  routes: $routes.map(route => ({
    path: route.path,
    component: require(`@/pages/${route.component}`).default,
  })),
}];
