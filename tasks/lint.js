/**
 * @file Lint task. This task lints the input directory with the option to apply
 *       fixes.
 */

const chalk = require(`chalk`);
const log = require(`../utils/log`);
const path = require(`path`);
const spawn = require(`../utils/spawn`);

async function lintJS(config, paths, shouldLintFix) {
  let command = `eslint`;
  let args = [
    `-f`, path.resolve(paths.base, `node_modules/eslint-friendly-formatter`),
    `--ext`, `.js,.vue`,
    `--ignore-path`, `${path.join(paths.base, `.gitignore`)}`,
  ];

  if (shouldLintFix) args.push(`--fix`);
  args.push(paths.input);

  await spawn(command, args, { stdio: `inherit` });
}

async function lintCSS(config, paths, shouldLintFix) {
  let command = `stylelint`;
  let args = [
    `"${paths.input}/**/*.js"`,
  ];

  // TODO: StyleLint is not ready for styled-components yet. Skip fix.
  // if (shouldLintFix) args.push(`--fix`);
  args.push(paths.input);

  await spawn(command, args, { stdio: `inherit` });
}

module.exports = async function(config, paths, shouldLintFix) {
  log.info(shouldLintFix ? `Linting and fixing ${chalk.cyan(paths.input)}...` : `Linting ${chalk.cyan(paths.input)}...`);

  await lintJS(config, paths, shouldLintFix);
  await lintCSS(config, paths, shouldLintFix);

  log.succeed(`Linter completed successfully`);
};
