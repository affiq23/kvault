// load tools for path resolution and output
const fs = require('fs-extra');
const chalk = require('chalk');
const { vaultPath, configPath, writeConfig } = require('../lib/config');

// runs when you call kvault init
module.exports = function () {
  console.log("Looking for vault at:", vaultPath);
  // if .vault/ already exists, exit early with warning
  if (fs.existsSync(configPath)) {
    console.log(chalk.yellow('⚠️  Vault already initialized in this directory.'));
    return;
  }

  // create .vault and config
  fs.ensureDirSync(vaultPath);

  writeConfig({
    initialized_at: new Date().toISOString(),
    user: null,
    branch: 'main'
  });

  console.log(chalk.green('✅ Vault initialized successfully!'));
  console.log(`📁 Vault stored at ${chalk.cyan(vaultPath)}`);
};
