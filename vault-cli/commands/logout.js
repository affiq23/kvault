const { deleteConfig } = require('../lib/config');
const chalk = require('chalk');

module.exports = function logout() {
  try {
    deleteConfig();
    console.log(chalk.green('Logged out successfully. Token removed.'));
  } catch (err) {
    console.log(chalk.yellow('You are already logged out. No token found.'));
  }
};
  