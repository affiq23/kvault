const chalk = require('chalk');
const { ensureAuth } = require('../lib/config');

module.exports = function () {
  try {
    const { user } = ensureAuth();

    console.log(chalk.green('🔐 You are logged in as:'));
    console.log(`Email: ${chalk.cyan(user.email)}`);
    console.log(`ID: ${chalk.gray(user.id)}`);
  } catch (err) {
    console.error('Failed to authenticate.');
    console.error(err.message);
  }
};
