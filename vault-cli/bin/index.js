#!/usr/bin/env node

const { program } = require('commander');

// CLI metadata
program
  .name('kvault')
  .description('Git-style CLI for version-controlled notes')
  .version('0.1.0');

// Lazy load commands to prevent early `ensureAuth()` errors
program
  .command('init')
  .description('Initialize a new local knowledge vault')
  .action(() => require('../commands/init')());

program
  .command('import-token [path]')
  .description('Import refresh token and user info from web app')
  .action((path) => require('../commands/import-token')(path));

program
  .command('whoami')
  .description('Display the current authenticated user')
  .action(() => require('../commands/whoami')());

program
  .command('add <title...>')
  .description('Create and add note')
  .action((titleWords) => require('../commands/add')(titleWords));

program
  .command('logout')
  .description('Log out and remove saved token')
  .action(() => require('../commands/logout')());

// Suppress punycode warning
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name !== 'DeprecationWarning' || !warning.message.includes('punycode')) {
    console.warn(warning);
  }
});

program.parse(process.argv);
