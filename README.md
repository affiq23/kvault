# kvault changelog

running log of all feature additions, changes, in-progress work, known issues, and setup instructions for CLI + front end

---

## setup instructions

### install dependencies
```bash
npm install
```

### link CLI globally
```bash
npm link
```
allows the `kvault` command to be used globally on system anywhere; make sure to run `npm link` inside `kvault/vault-cli` directory.

### initialize new vault
```bash
kvault init
```
creates a `.vault` folder in current directory with config file and notes directory; notes created will be added here.

### authenticate the CLI
1. log in on the kvault web app (not done yet)
2. download CLI token from the "Export CLI Token" button
3. run:
```bash
kvault import-token path/to/token.json
```
stores your refresh token and user info in `.vault/config.json`.

---

## changelog

### 4-10-2025

#### features or working on
- `kvault init` — initializes a new local vault with `.vault/config.json` and `.vault/notes/`
- `kvault import-token [path]` — now defaults to `~/Downloads/kvault-token.json` if no path is provided
- `kvault whoami` — displays authenticated user's email and ID from `.vault/config.json`
- `kvault add <title>` — creates Markdown note with frontmatter and slug
- `kvault logout` —logs out user; deletes the local config and refresh token
- lazy-loading command modules in `bin/index.js` to prevent unintended `ensureAuth()` triggers
- CLI enforces login only on protected commands (add, whoami)
- added support for Supabase `.env` loading inside `vault-cli`
- web auth fully connected with Supabase + Google OAuth
- `Export CLI Token` button in web downloads proper token file
- fixed issue where `.env.local` wasn't loading in `vault-web`
- CLI now reads `.env` regardless of CWD, preventing token/URL missing errors

#### fixes

- fixed hugeeee error with`kvault init` requiring auth when it shouldn't — resolved by using lazy imports in `index.js`
- fixed early auth triggers caused by eager `require()` statements
- still getting some weird issues with the config file in .vault/; keeps pushing to github even while in gitignore

---

## in progress

- `kvault commit` — detect note changes and snapshot into versioned commits
  - plan: use file hashes to change necessary data while keeping rest the same to minimize storage needed

---

## planned

- `kvault push` / `pull` — supabase sync
- `kvault graph` — ASCII DAG log of commits
- `kvault stage` — optional file staging before commit
- web UI dashboard for notes + commit history (big one!)
- markdown editor in-browser
- tag & metadata filters

---

