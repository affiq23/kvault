// load tools for path resolution
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { writeConfig } = require('../lib/config');

// export async function to run when " kvault import-token <path>" is called
module.exports = async function (tokenFilePath) {
  
// handle missing input path
  if (!tokenFilePath) {
    console.log(chalk.red('Please provide a path to the token file.'));
    console.log(`Example: ${chalk.cyan('kvault import-token ~/Downloads/kvault-token.json')}`);
    return;
  }

// makes sure ~ or ./ paths work
  const resolvedPath = path.resolve(tokenFilePath);

    // error handling if file doesn't exist
  if (!fs.existsSync(resolvedPath)) {
    console.log(chalk.red('Token file not found:'), resolvedPath);
    return;
  }

// reads and parses token file
  let tokenData;
  try {
    tokenData = await fs.readJson(resolvedPath);
  } catch (err) {
    console.log(chalk.red('Failed to parse JSON:'), err.message);
    return;
  }

  // extracts token data
  const { refresh_token, user } = tokenData;

  // validates required fields are present
  if (!refresh_token || !user?.id || !user?.email) {
    console.log(chalk.red('Invalid token file. Missing required fields.'));
    return;
  }

  writeConfig({
    user,
    refresh_token
  });
  console.log(chalk.green('✅ Token imported successfully!'));
  console.log(`🔐 Authenticated as ${chalk.cyan(user.email)}`);
};
