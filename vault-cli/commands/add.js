#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const slugify = require('slugify'); // npm install slugify
const { formatISO } = require('date-fns'); // npm install date-fns

const { notesPath } = require('../lib/config');

// Ensure notes folder exists
if (!fs.existsSync(notesPath)) {
  fs.mkdirSync(notesPath, { recursive: true });
}

// Helper: sanitize file name
function slugFromTitle(title) {
    const date = new Date().toLocaleDateString('en-CA'); // returns YYYY-MM-DD for my timezone
  const slug = slugify(title, { lower: true, strict: true });
  return `${date}-${slug}.md`;
}

// 👇 This is the function you export to index.js
function createNote(titleWords) {
  const title = Array.isArray(titleWords) ? titleWords.join(' ') : titleWords;
  const filename = slugFromTitle(title);
  const filepath = path.join(notesPath, filename);

  if (fs.existsSync(filepath)) {
    console.error(`❌ Note "${title}" already exists.`);
    process.exit(1);
  }

  const content = `---\ntitle: ${title}\ncreated: ${formatISO(new Date())}\ntags: []\n---\n\nStart writing your notes here...\n`;

  fs.writeFileSync(filepath, content, 'utf-8');

  console.log(`✅ Created new note: .vault/notes/${filename}`);
}

module.exports = createNote;

// Optional: allow direct execution for testing
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Please provide a note title.');
    process.exit(1);
  }

  createNote(args);
}
