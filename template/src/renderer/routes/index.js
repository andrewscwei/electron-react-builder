/**
 * @file Routes config.
 */

import App from '@/App';

export default [{
  component: App,
  routes: $routes.map(route => ({
    path: route.path,
    component: require(`@/pages/${route.component}`).default,
  })),
}];
