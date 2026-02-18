import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---- CONFIGURATION ----
const INDEX_NAME = 'Core.stow Asset List';
const LEGACY_INDEX_NAMES = [];
const ASSET_LIST_FILE = 'core-asset-list.txt';
const BUNDLE_PATH = 'public/cdn-assets/Core.stow';
const TARGET_FILES = ['CLAUDE.md', 'AGENTS.md'];
const MIN_PREFIX_SAVINGS = 10;

// ---- RESOLVE PROJECT ROOT ----
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ---- HELPERS ----

function longestCommonPrefix(strings) {
  if (strings.length === 0) return '';
  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (prefix === '') return '';
    }
  }
  return prefix;
}

function parseCategories(text) {
  const categories = [];
  let current = null;

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;

    const headerMatch = line.match(/^---\s+(.+?)\s+---$/);
    if (headerMatch) {
      current = {
        key: headerMatch[1]
          .toLowerCase()
          .replace(/[^a-z0-9 _/]/g, '')
          .replace(/[\s/]+/g, '_'),
        items: [],
      };
      categories.push(current);
    } else if (current) {
      current.items.push(line);
    }
  }

  return categories.filter((c) => c.items.length > 0);
}

function compactCategory(cat) {
  const { key, items } = cat;
  if (items.length === 1) return `${key}:${items[0]}`;

  const prefix = longestCommonPrefix(items);
  const savings = prefix.length * items.length - (prefix.length + items.length);

  if (prefix.length > 0 && savings > MIN_PREFIX_SAVINGS) {
    const suffixes = items.map((i) => i.slice(prefix.length));
    return `${key}:${prefix}{${suffixes.join(',')}}`;
  }
  return `${key}:{${items.join(',')}}`;
}

function buildIndexLine(categories) {
  const parts = [`[${INDEX_NAME}]`, `bundle:${BUNDLE_PATH}`];
  for (const cat of categories) {
    parts.push(compactCategory(cat));
  }
  return parts.join('|');
}

function updateFile(filePath, indexLine) {
  const allNames = [INDEX_NAME, ...LEGACY_INDEX_NAMES];
  let lines = [];

  if (existsSync(filePath)) {
    lines = readFileSync(filePath, 'utf-8').split('\n');
    // Remove any existing index lines (current or legacy names)
    lines = lines.filter((l) => {
      return !allNames.some((name) => l.startsWith(`[${name}]`));
    });
  }

  // Insert index line at the end (after existing content)
  // Trim trailing empty lines, append index, ensure trailing newline
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  lines.push(indexLine);

  writeFileSync(filePath, lines.join('\n') + '\n', 'utf-8');
}

// ---- MAIN ----
const assetListPath = join(ROOT, ASSET_LIST_FILE);
if (!existsSync(assetListPath)) {
  console.log(`Skipping asset index: ${ASSET_LIST_FILE} not found.`);
  process.exit(0);
}

const text = readFileSync(assetListPath, 'utf-8');
const categories = parseCategories(text);
const indexLine = buildIndexLine(categories);

for (const file of TARGET_FILES) {
  const filePath = join(ROOT, file);
  updateFile(filePath, indexLine);
  console.log(`Updated ${file}`);
}
