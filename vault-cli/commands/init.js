// load tools for path resolution and output
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
// might need to uninstall chalk 
// npm uninstall chalk
// npm install chalk@4

  // runs when you call kvault init
module.exports = function () { 
    // define path to .vault/ based on current working directory
  const vaultPath = path.join(process.cwd(), '.vault');
  const configPath = path.join(vaultPath, 'config.json');

  // if .vault/ already exists, exit early with warning
  if (fs.existsSync(vaultPath)) {
    console.log(chalk.yellow('⚠️  Vault already initialized in this directory.'));
    return;
  }

  fs.ensureDirSync(vaultPath);   // define path to .vault/

  fs.writeJsonSync(configPath, { // creates config.json
    initialized_at: new Date().toISOString(),
    user: null,
    branch: 'main'
  }, { spaces: 2 });

  // log success
  console.log(chalk.green('✅ Vault initialized successfully!'));
  console.log(`Created ${chalk.cyan('.vault/config.json')}`);
};
