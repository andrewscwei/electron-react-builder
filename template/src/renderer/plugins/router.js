/**
 * @file Plugin for automatically setting up routes for React router.
 */

import App from '@/App';

export function getRoutes() {
  return [{
    component: App,
    routes: $routes.map(route => ({
      path: route.path,
      component: require(`@/pages/${route.component}`).default,
    })),
  }];
}
