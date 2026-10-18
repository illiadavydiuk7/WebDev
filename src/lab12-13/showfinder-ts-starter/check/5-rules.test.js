/**
 * §5 · Обмеження ТЗ для всіх файлів src/, разом із підтеками: без any, без тверджень типу, без
 * declare і без коментарів, що вимикають перевірку типів. Не змінюйте цей файл.
 *
 * Тести читають код як текст: коментарі й вміст рядків (лапки, шаблонні рядки) не рахуються.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { srcFiles, srcLines } from './support.js';

const lines = srcLines();

/** Рядки, де `pattern` трапляється в коді (або, з `inComments`, будь-де в рядку). */
function find(pattern, { inComments = false, skip = () => false } = {}) {
  return lines
    .filter((line) => !skip(line) && pattern.test(inComments ? line.text : line.code))
    .map(({ where, text }) => `${where}  ${text.trim()}`);
}

/** Рядки імпорту й реекспорту: `as` у `import { a as b }` — не твердження типу. */
const importLines = new Set();
let inImport = false;
for (const line of lines) {
  const code = line.code.trim();
  if (/^(?:import\b|export\s*(?:type\s*)?[*{])/.test(code)) inImport = true;
  if (inImport) importLines.add(line);
  if (inImport && (/\bfrom\s*['"]/.test(code) || /^import\s*['"]/.test(code) || /;\s*$/.test(code))) inImport = false;
}

test('§5 у src/ немає типу any', () => {
  const found = find(/(?:[:<>,|&=(?[]|\b(?:as|extends|keyof))\s*any\b|\bany\s*\[\s*\]/);
  assert.deepEqual(found, [], `any знайдено:\n${found.join('\n')}`);
});

test('§5 у src/ немає тверджень типу: as (крім as const), ! після виразу, <Тип>значення, querySelector<…>', () => {
  const found = [
    ...find(/\bas\s+(?!const\b)[\w$({[<'"`]/, { skip: (line) => importLines.has(line) }),
    ...find(/[\w$)\]]!(?!=)/),
    ...find(/(?:^|[=(,:?&|]|\breturn)\s*<\s*[A-Z][\w.]*(?:\[\])?\s*>\s*[\w$]/),
    ...find(/\.(?:querySelector|querySelectorAll|closest)\s*</),
  ];
  assert.deepEqual([...new Set(found)], [], `твердження типу знайдено:\n${[...new Set(found)].join('\n')}`);
});

test('§5 у src/ немає declare і файлів .d.ts', () => {
  const found = [
    ...find(/(?<![.$\w])declare\s+[\w$]/),
    ...srcFiles()
      .filter((name) => /\.d\.[cm]?ts$/.test(name))
      .map((name) => `src/${name}`),
  ];
  assert.deepEqual(found, [], `знайдено:\n${found.join('\n')}`);
});

test('§5 у src/ немає @ts-ignore, @ts-nocheck і @ts-expect-error', () => {
  const found = find(/@ts-(?:ignore|nocheck|expect-error)/, { inComments: true });
  assert.deepEqual(found, [], `знайдено:\n${found.join('\n')}`);
});
