#!/usr/bin/env node

// this is just to test config files if i delete and want to log out of
const fs = require('fs');
const path = require('path');

const { configPath } = require('../lib/config');


module.exports = function logout() {
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
    console.log('👋 Logged out successfully. Token removed.');
  } else {
    console.log('ℹ️ You are already logged out. No token found.');
  }
};