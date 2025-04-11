// load tools for path resolution
const chalk = require('chalk');
const { getSupabaseClient } = require('../lib/supabaseClient');

module.exports = async function () {
  try {
    const { user } = await getSupabaseClient();

    console.log(chalk.green('🔐 You are logged in as:'));
    console.log(`📧 Email: ${chalk.cyan(user.email)}`);
    console.log(`🆔 ID: ${chalk.gray(user.id)}`);
  } catch (err) {
    console.log(chalk.red('❌ Failed to authenticate.'));
    console.error(err.message);
  }
};
