/**
 * @file Main Electron process.
 */

import init from 'electron-react-builder/app/main/init';
import log from 'electron-log';

init(win => {
  log.info(`MAIN`, `Process started`);
});
