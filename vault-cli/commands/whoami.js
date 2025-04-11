// load tools for path resolution
const chalk = require('chalk');
const { supabase } = require('../lib/supabaseClient');
const { readConfig } = require('../lib/config')

module.exports = async function () {
  try {
    const config = readConfig();
    const user = config.user;

    if (!user) throw new Error("No user in config");

    console.log('🔐 You are logged in as:');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🆔 ID: ${user.id}`);
  } catch (err) {
    console.log('❌ Failed to authenticate.');
    console.error(err.message);
  }
};
