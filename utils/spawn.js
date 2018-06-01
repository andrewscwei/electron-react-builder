/**
 * @file Simple promisified spawn wrapper.
 */

const { spawn } = require(`child_process`);

module.exports = function() {
  return new Promise((resolve, reject) => {
    const proc = spawn.apply(null, arguments);

    proc.on(`error`, (err) => {
      return reject(err);
    });

    proc.on(`exit`, (code, signal) => {
      if (code !== 0) return reject(new Error(`Process exited with code ${code} and signal ${signal}`));
      return resolve();
    });
  });
};
