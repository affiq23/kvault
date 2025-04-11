const path = require('path');
const fs = require('fs');

const vaultPath = path.resolve(__dirname, '../.vault'); // ✅ always anchored to vault-cli/.vault
const configPath = path.join(vaultPath, 'config.json');
const notesPath = path.join(vaultPath, 'notes');

function ensureVaultDirs() {
  if (!fs.existsSync(vaultPath)) fs.mkdirSync(vaultPath);
  if (!fs.existsSync(notesPath)) fs.mkdirSync(notesPath);
}

function writeConfig(data) {
  ensureVaultDirs();
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

function readConfig() {
  if (!fs.existsSync(configPath)) {
    console.error('❌ No config found. Please run `kvault import-token` first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function deleteConfig() {
  if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
}

module.exports = {
  writeConfig,
  readConfig,
  deleteConfig,
  vaultPath,
  configPath,
  notesPath,
};
