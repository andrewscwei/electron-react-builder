/**
 * @file Custom logger.
 */

import log from 'electron-log';

log.transports.console.format = `{h}:{i}:{s} [{level}] {text}`;
log.transports.rendererConsole.format = `{h}:{i}:{s} [{level}] {text}`;
log.transports.file.format = `{h}:{i}:{s} [{level}] {text}`;

if (process.env.NODE_ENV === `production`) {
  log.transports.console.level = false;
  log.transports.rendererConsole.level = false;
  log.transports.file.level = `info`;
}
else {
  log.transports.console.level = `silly`;
  log.transports.rendererConsole.level = `silly`;
  log.transports.file.level = `silly`;
}

export { log as logger };

export default {
  error: log.error,
  warn: log.warn,
  info: log.info,
  verbose: log.verbose,
  debug: log.debug,
  silly: log.silly,
  enable: function() {
    if (log.transports.rendererConsole.level !== false) return;
    log.transports.rendererConsole.level = `silly`;
  },
  disable: function() {
    if (log.transports.rendererConsole === false) return;
    log.transports.rendererConsole.level = false;
  },
  isEnabled: function() {
    return log.transports.rendererConsole.level !== false;
  },
};
