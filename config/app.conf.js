/**
 * @file Default config. Options specified in project specific config files will
 *       overwrite the ones defined here. In essence, this file simply lays out
 *       the default options.
 */

module.exports = {
  // Default locale to use. This is only used if there is more than one
  // locale file in your config.
  defaultLocale: `en`,

  // Time interval to check for updates in milliseconds. Defaults to 2 hours.
  checkUpdateInterval: 60 * 1000,

  // Time it takes for the app to be marked as idle so auto update can kick in,
  // in milliseconds. Defaults to 1 hour.
  idleTimeout: 60 * 60 * 1000,

  // Config for Electron browser window.
  // @see https://electron.atom.io/docs/api/browser-window/
  window: undefined,

  // Define variables to populate the `process.env` namespace in compile time.
  env: undefined,

  // Config for the `build` task.
  build: {
    // Specifies whether JS and CSS sourcemaps are enabled.
    sourceMap: false,
  },

  // Config for the `dev` task.
  dev: {
    // Specifies whether JS and CSS sourcemaps are enabled.
    sourceMap: true,

    // Port for dev server.
    port: 8080,

    // Specifies whether the main process should reload every time a change is
    // made in the main process.
    reloadMainProcess: true,
  },
};
