const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const { formatISO } = require('date-fns');
const { notesPath, ensureAuth } = require('../lib/config');

// require login
function createNote(titleWords) {
  ensureAuth(); // check auth every time the command is run

  if (!fs.existsSync(notesPath)) {
    fs.mkdirSync(notesPath, { recursive: true });
  }

  const title = Array.isArray(titleWords) ? titleWords.join(' ') : titleWords;
  const date = new Date().toISOString().split('T')[0];
  const slug = slugify(title, { lower: true, strict: true });
  const filename = `${date}-${slug}.md`;
  const filepath = path.join(notesPath, filename);

  if (fs.existsSync(filepath)) {
    console.error(`Note "${title}" already exists.`);
    process.exit(1);
  }

  const content = `---\ntitle: ${title}\ncreated: ${formatISO(new Date())}\ntags: []\n---\n\nstart writing here...\n`;

  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`Created new note: .vault/notes/${filename}`);
}

module.exports = createNote;
