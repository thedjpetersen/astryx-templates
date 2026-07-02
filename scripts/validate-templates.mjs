import * as fs from 'node:fs';
import * as path from 'node:path';

const roots = [
  {name: 'templates', docSuffixes: ['.doc.ts', '.doc.mjs', '.doc.js']},
  {name: 'blocks', docSuffixes: ['.doc.mjs']},
];
const errors = [];
let pairCount = 0;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  return entries.flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

function docSuffix(file, suffixes) {
  return suffixes.find(suffix => file.endsWith(suffix));
}

function validateRoot({name, docSuffixes}) {
  const root = path.resolve(name);
  const ids = new Map();

  if (!fs.existsSync(root)) {
    errors.push(`Missing ${name}/ directory.`);
    return;
  }

  const files = walk(root);
  const docs = files.filter(file => docSuffix(file, docSuffixes));

  if (docs.length === 0) {
    errors.push(`No template docs found under ${name}/.`);
  }

  for (const docPath of docs) {
    const suffix = docSuffix(docPath, docSuffixes);
    const id = path
      .relative(root, docPath)
      .slice(0, -suffix.length)
      .split(path.sep)
      .join('/');
    const sourcePath = docPath.slice(0, -suffix.length) + '.tsx';

    if (ids.has(id)) {
      errors.push(`Duplicate ${name} id "${id}" in ${docPath} and ${ids.get(id)}.`);
    }
    ids.set(id, docPath);

    if (!fs.existsSync(sourcePath)) {
      errors.push(`Template "${name}/${id}" is missing same-stem source ${sourcePath}.`);
    }
  }

  for (const sourcePath of files.filter(file => file.endsWith('.tsx'))) {
    const stem = sourcePath.slice(0, -'.tsx'.length);
    const hasDoc = docSuffixes.some(suffix => fs.existsSync(stem + suffix));
    if (!hasDoc) {
      const id = path.relative(root, sourcePath).slice(0, -'.tsx'.length);
      errors.push(`Template source "${name}/${id}" is missing same-stem doc.`);
    }
  }

  pairCount += ids.size;
}

for (const root of roots) validateRoot(root);

if (errors.length > 0) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Validated ${pairCount} template pair${pairCount === 1 ? '' : 's'}.`);
