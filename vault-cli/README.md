# @affiq/kvault-cli
Command line interface for kvault, version control note taking system. 
# kvault changelog

running log of all feature additions, changes, in-progress work, known issues, and setup instructions for just command line
---

## setup instructions

### install globally
```bash
npm install -g @affiq/kvault-cli
```

### initialize new vault
```bash
kvault init
```
creates a `.vault` folder in current directory with config file and notes directory; notes created will be added here.

### authenticate the CLI
1. log in at https://kvault.vercel.app
2. download CLI token from the "Export CLI Token" button
3. run:
```bash
kvault import-token 
```
(will automatically search /Downloads)

```bash
/Users/affiq/token.json
```
(to specify path in cases other than Downloads)


stores your refresh token and user info in `.vault/config.json`.

---
