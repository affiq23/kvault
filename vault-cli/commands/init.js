const fs = require('fs-extra');
const chalk = require('chalk');
const { vaultPath, configPath, writeConfig } = require('../lib/config');

module.exports = function () {
  console.log("Looking for vault at:", vaultPath);

  if (fs.existsSync(configPath)) {
    console.log(chalk.yellow('⚠️ Vault already initialized in this directory.'));
    return;
  }

  fs.ensureDirSync(vaultPath);

  writeConfig({
    initialized_at: new Date().toISOString(),
    user: null,
    branch: 'main'
  });

  console.log(chalk.green('Vault initialized successfully!'));
  console.log(`Vault stored at ${chalk.cyan(vaultPath)}`);
};
