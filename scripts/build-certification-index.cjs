// Reads only trusted, local authored TypeScript data. No third-party code or network access.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('../apps/learn/node_modules/typescript');
const root = path.resolve(__dirname, '../apps/learn/src/certifications');
const cache = new Map();
function read(name) {
  const file = path.resolve(root, name + '.ts');
  if (!file.startsWith(root + path.sep)) throw new Error('Outside authored data directory');
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  cache.set(file, module.exports);
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(js, { exports: module.exports, module, require: (p) => {
    if (!p.startsWith('./')) throw new Error('Only local authored modules allowed');
    return read(p.slice(2));
  } }, { filename: file, timeout: 3000 });
  return module.exports;
}
const lessons = ['network', 'security', 'cloud', 'operations'].flatMap((name) => read('lessons-' + name)[name + 'Lessons']);
const plans = [...read('plans-network').networkPlans, ...read('plans-other').otherPlans];
if (new Set(lessons.map((l) => l.id)).size !== lessons.length) throw new Error('Duplicate lessons');
if (new Set(plans.map((p) => p.id)).size !== plans.length) throw new Error('Duplicate plans');
for (const p of plans) {
  if (p.weeks.length !== 12 || p.weeks.some((w, i) => w.number !== i + 1 || w.lessons.some((id) => !lessons.some((l) => l.id === id)))) throw new Error('Invalid curriculum: ' + p.id);
}
const index = lessons.map((l) => ({ id: l.id, title: l.title, version: l.version, options: l.question.options.map((o) => o.id), correct: l.question.correct }));
require('../apps/learn/node_modules/prettier').format(JSON.stringify(index), { parser: 'json' }).then((formatted) => {
  fs.writeFileSync(path.join(root, 'lesson-index.json'), formatted);
  console.log(`${plans.length} certifications, ${plans.reduce((n, p) => n + p.weeks.length, 0)} weeks, ${lessons.length} lessons indexed`);
  if (process.argv.includes('--summary')) console.log(JSON.stringify(plans.map((p) => ({ id: p.id, uniqueBaseLessons: new Set(p.weeks.flatMap((w) => w.lessons)).size })), null, 2));
}).catch((e) => { console.error(e); process.exitCode = 1; });
