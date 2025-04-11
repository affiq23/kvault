#!/usr/bin/env node

const { program } = require('commander'); // parse user input commands with commander
// import command logic from /commands
const init = require('../commands/init');
const importToken = require('../commands/import-token');
const whoami = require('../commands/whoami');
const add = require('../commands/add')
const logout = require('../commands/logout');

// registers CLI name as "kvault" and sets metadata
program
  .name('kvault')
  .description('Git-style CLI for version-controlled notes')
  .version('0.1.0');

// registers "kvault init" as a command and registers it to init.js
program
  .command('init')
  .description('Initialize a new local knowledge vault')
  .action(init);

// registers "kvault import-token" and link it to import-token.js
program
  .command('import-token <path>')
  .description('Import refresh token and user info from web app')
  .action(importToken);

// registers "whoami command"
program
  .command('whoami')
  .description('Display the current authenticated user')
  .action(whoami);

program
  .command('add <title...>')
  .description('Create and add note')
  .action(add)

  program 
    .command('logout')
    .description("Log out and remove saved token")
    .action(logout)

  // just to get rid of punycode error
process.removeAllListeners('warning'); // clean out global warning handlers

process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    // ignore it
  } else {
    // for all other warnings, log normally
    console.warn(warning);
  }
});


  // start parsing CLI input
program.parse(process.argv);
