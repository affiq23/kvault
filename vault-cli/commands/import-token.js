const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { writeConfig } = require('../lib/config');

module.exports = async function (tokenFilePath) {
  // use default Downloads location for v1
  const defaultPath = path.join(require('os').homedir(), 'Downloads', 'kvault-token.json');
  const resolvedPath = path.resolve(tokenFilePath || defaultPath);

  if (!fs.existsSync(resolvedPath)) {
    console.log(chalk.red('Token file not found:'), resolvedPath);
    return;
  }

  if (!fs.existsSync(resolvedPath)) {
    console.log(chalk.red('Token file not found:'), resolvedPath);
    return;
  }

  let tokenData;
  try {
    tokenData = await fs.readJson(resolvedPath);
  } catch (err) {
    console.log(chalk.red('Failed to parse JSON:'), err.message);
    return;
  }

  const { refresh_token, user } = tokenData;

  if (!refresh_token || !user?.id || !user?.email) {
    console.log(chalk.red('Invalid token file. Missing required fields.'));
    return;
  }

  writeConfig({ user, refresh_token });

  console.log(chalk.green('Token imported successfully!'));
  console.log(`🔐 Authenticated as ${chalk.cyan(user.email)}`);
};
