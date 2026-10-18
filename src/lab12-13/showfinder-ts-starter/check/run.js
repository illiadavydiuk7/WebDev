/**
 * npm run check — самоперевірка: спершу типи (tsc -p check), потім тести (check/*.test.js),
 * а наприкінці підсумок одним рядком. Не змінюйте цей файл.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { finished } from 'node:stream/promises';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import { fileURLToPath } from 'node:url';

// Тести виконують src/*.ts без компіляції: Node стирає типи сам, починаючи з 22.18.
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 18)) {
  console.error(`Потрібен Node.js 22.18 або новіший, а зараз ${process.version}. Оновіть Node: https://nodejs.org/`);
  process.exit(1);
}

const root = fileURLToPath(new URL('..', import.meta.url));
const tsc = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));
if (!existsSync(tsc)) {
  console.error('Немає node_modules/typescript: спершу виконайте npm install.');
  process.exit(1);
}

console.log('Перевірка типів: tsc -p check\n');
const typecheck = spawnSync(process.execPath, [tsc, '-p', 'check', '--pretty'], { cwd: root, encoding: 'utf8' });
process.stdout.write(typecheck.stdout || '');
process.stderr.write(typecheck.stderr || '');
const typeErrors = typecheck.status === 0 ? 0 : Number(/Found (\d+) error/.exec(typecheck.stdout)?.[1] ?? 1);
if (!typeErrors) console.log('Помилок типів немає.');

console.log('\nТести: node --test check/*.test.js\n');
const files = readdirSync(new URL('.', import.meta.url))
  .filter((name) => name.endsWith('.test.js'))
  .sort()
  .map((name) => fileURLToPath(new URL(name, import.meta.url)));
let passed = 0;
let failed = 0;
const stream = run({ files });
stream.on('test:pass', (event) => {
  if (event.details.type !== 'suite') passed += 1;
});
stream.on('test:fail', (event) => {
  if (event.details.type !== 'suite') failed += 1;
});
const report = stream.compose(spec);
report.pipe(process.stdout);
await finished(report);

const plural = (n, one, few, many) => {
  const tens = n % 100;
  const ones = n % 10;
  if (ones === 1 && tens !== 11) return `${n} ${one}`;
  if (ones >= 2 && ones <= 4 && (tens < 12 || tens > 14)) return `${n} ${few}`;
  return `${n} ${many}`;
};
const types = typeErrors ? plural(typeErrors, 'помилка', 'помилки', 'помилок') : 'без помилок';
console.log(`\nТипи: ${types} · Тести: пройдено ${passed} з ${passed + failed}`);
process.exitCode = typeErrors || failed ? 1 : 0;
