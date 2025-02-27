/* global $config: false */

/**
 * @file Base initialization script for the Electron main process.
 */

import { BrowserWindow, app, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import UpdateStatus from '../enums/UpdateStatus';
import log, { logger } from '../utils/log';

// Set up auto-updater logger.
autoUpdater.logger = logger;
autoUpdater.logger.transports.file.level = `info`;

if (process.env.NODE_ENV === `development`) {
  require(`electron-debug`)();
}

// Main browser window.
let win = undefined;

// Indicates whether the app is idle.
let isIdle = false;

// Indicates whether the app has a new update. This is used by the autoUpdater.
let hasUpdate = false;

// Instance of the interval used for checking updates repeatedly.
let updateInterval = undefined;

/**
 * Creates the main Electron window.
 */
function createWindow() {
  // Merge with options specified in config.
  win = new BrowserWindow(Object.assign({
    // Enable fullscreen in production.
    fullscreen: process.env.NODE_ENV === `production`,
    // Option to set the x and y position of the window in environment variables.
    x: Number(process.env.WINDOW_X) || Number(process.env.WINDOW_Y) || 0,
    y: Number(process.env.WINDOW_Y) || Number(process.env.WINDOW_X) || 0,
  }, $config.window || {}));

  // Load the WWW files.
  if (process.env.NODE_ENV === `development`) {
    win.loadURL(`http://localhost:${$config.dev.port || `8080`}`);
    win.maximize();
  }
  else {
    win.loadURL(`file://${__dirname}/index.html`);
  }

  win.on(`closed`, () => {
    // Dereference the window object, usually you would store windows in an
    // array if your app supports multi windows, this is the time when you
    // should delete the corresponding element.
    win = null;
  });
}

/**
 * Checks for updates.
 */
function checkForUpdates() {
  if (win === undefined) return;

  if (hasUpdate) {
    win.webContents.send(`update-status`, { status: UpdateStatus.DOWNLOADED });
    clearInterval(updateInterval);
    updateInterval = undefined;
  }
  else {
    autoUpdater.checkForUpdates();
  }
}

/**
 * Initializes the Electron main process. Option to specify a callback that gets
 * invoked when app is ready.
 * @param {Function} [readyCallback]
 */
export default function init(readyCallback) {
  app.on(`ready`, () => {
    createWindow();

    // Susbscribe to autoUpdater events.
    autoUpdater.on(`checking-for-update`, () => {
      win.webContents.send(`update-status`, { status: UpdateStatus.CHECKING });
    });

    autoUpdater.on(`update-available`, () => {
      log.info(`New update found`);
      win.webContents.send(`update-status`, { status: UpdateStatus.AVAILABLE });
    });

    autoUpdater.on(`update-not-available`, () => {
      log.info(`No update found`);
      win.webContents.send(`update-status`, { status: UpdateStatus.NOT_AVAILABLE });
    });

    autoUpdater.on(`error`, (err) => {
      log.error(`Error fetching update`, err);
      win.webContents.send(`update-status`, { status: UpdateStatus.ERROR, error: err ? (err.stack || err).toString() : `Error: Unknown` });
    });

    autoUpdater.on(`download-progress`, (progress) => {
      log.info(`Downlownding update...`, progress);

      win.webContents.send(`update-status`, { status: UpdateStatus.DOWNLOADING, progress: progress });

      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = undefined;
      }
    });

    autoUpdater.on(`update-downloaded`, () => {
      log.info(`New update downloaded`);

      win.webContents.send(`update-status`, { status: UpdateStatus.DOWNLOADED });
      hasUpdate = true;

      if (isIdle) {
        log.info(`Update is available, quitting app and applying update now`);
        autoUpdater.quitAndInstall();
      }
    });

    // When app is idle and there is an update, apply it.
    ipcMain.on(`idle`, () => {
      log.info(`App is idle`);

      isIdle = true;

      if (hasUpdate) {
        log.info(`Update is available, quitting app and applying update now`);
        autoUpdater.quitAndInstall();
      }
      else if (process.env.NODE_ENV === `production` && $config.checkUpdateInterval >= 0) {
        // Check for updates constantly on production.
        log.info(`Initiated auto-updater`);

        updateInterval = setInterval(() => {
          log.info(`Automatically checking for update...`);
          checkForUpdates();
        }, $config.checkUpdateInterval);

        // Check for updates immediately after launch.
        checkForUpdates();
      }
    });

    ipcMain.on(`unidle`, () => {
      if (isIdle) {
        log.info(`App is no longer idle`);
        isIdle = false;
      }

      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = undefined;
      }
    });

    // Toggle debug mode for main process.
    ipcMain.on(`toggle-debug-mode`, () => {
      if (log.isEnabled()) {
        log.disable();
        win.webContents.send(`debug-enabled`, false);
        win.webContents.closeDevTools();
      }
      else {
        log.enable();
        win.webContents.send(`debug-enabled`, true);
        win.webContents.openDevTools();
      }
    });

    ipcMain.on(`check-for-updates`, () => {
      checkForUpdates();
    });

    ipcMain.on(`install-updates`, () => {
      if (!hasUpdate) return;
      autoUpdater.quitAndInstall();
    });

    // Install devtools in development.
    if (process.env.NODE_ENV === `development`) {
      let installExtension = require(`electron-devtools-installer`);
      installExtension.default(installExtension.REACT_DEVELOPER_TOOLS)
        .then(name => log.info(`Added DevTools extension: ${name}`))
        .catch(err => log.error(`An error occured while installing devtools:`, err));
    }

    win.webContents.on(`did-finish-load`, () => {
      // Notify the renderer process that on-screen debugging is disabled intially.
      win.webContents.send(`debug-enabled`, log.isEnabled());

      if (log.isEnabled()) {
        win.webContents.openDevTools();
      }
    });

    // Check for updates immediately after launch.
    if (process.env.NODE_ENV === `production` && $config.checkUpdateInterval >= 0) {
      checkForUpdates();
    }

    // Invoke the callback if it is provided.
    if (readyCallback) readyCallback(win);
  });

  // On macOS it's common to re-create a window in the app when the dock icon is
  // clicked and there are no other windows open.
  app.on(`activate`, () => {
    if (win === null) createWindow();
  });

  // When all windows are closed, quit the app.
  app.on(`window-all-closed`, () => {
    // On macOS it is common for applications and their menu bar to stay active
    // until the user quits explicitly with Cmd + Q.
    if (process.platform !== `darwin`) app.quit();
  });
}
