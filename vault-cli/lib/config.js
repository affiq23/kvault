const path = require('path');
const fs = require('fs');

const vaultPath = path.resolve(__dirname, '../.vault'); // vault-cli/.vault
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

function updateConfig(newData) {
  const current = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    : {};

  const updated = {
    ...current,
    ...newData,
  };

  fs.writeFileSync(configPath, JSON.stringify(updated, null, 2));
}

function readConfig() {
  if (!fs.existsSync(configPath)) {
    return null; // ✅ Don’t throw or exit
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}


function deleteConfig() {
  if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
}

const ensureAuth = () => {
  const config = readConfig();

  if (!config?.user || !config?.refresh_token) {
    console.error('You must be logged in to run this command. Try running import-token and checking if you have your token dowloaded.');
    process.exit(1);
  }

  return config;
};

module.exports = {
  writeConfig,
  updateConfig,
  readConfig,
  deleteConfig,
  vaultPath,
  configPath,
  notesPath,
  ensureAuth
};
