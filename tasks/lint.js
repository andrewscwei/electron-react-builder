/**
 * @file Lint task. This task lints the input directory with the option to apply
 *       fixes.
 */

const chalk = require(`chalk`);
const log = require(`../utils/log`);
const path = require(`path`);
const spawn = require(`../utils/spawn`);

module.exports = async function(config, paths, shouldLintFix) {
  log.info(shouldLintFix ? `Linting and fixing ${chalk.cyan(paths.input)}...` : `Linting ${chalk.cyan(paths.input)}...`);

  let command = `eslint`;
  let args = [
    `-f`, path.resolve(paths.base, `node_modules/eslint-friendly-formatter`),
    `--ext`, `.js,.vue`,
    `--ignore-path`, `${path.join(paths.base, `.gitignore`)}`,
  ];

  if (shouldLintFix) args.push(`--fix`);
  args.push(paths.input);

  await spawn(command, args, { stdio: `inherit`, });
  log.succeed(`Linter completed successfully`);
};
