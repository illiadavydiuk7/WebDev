/**
 * T4 · Міграція src/app, src/view, src/dom і src/main на TypeScript. Назва кожного тесту
 * починається з номера правила ТЗ. Не змінюйте цей файл.
 *
 * Поки міграції немає, тести поведінки виконують JavaScript-версії src/app.js і src/view.js: так
 * видно дефекти, які є в цьому коді ще до міграції. Тести виконуються в Node, де немає сторінки:
 * якщо всі тести поведінки падають з «ReferenceError: document is not defined», app чи view
 * звертаються до сторінки поза функціями. Тексти помилок тести беруть з вашої errorMessage (T3.2).
 */
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HttpError } from '../src/api.ts';
import { errorMessage } from '../src/state.ts';
import { SEARCH, SHOWS, describe, httpError, importSrc, json, networkError, restoreFetch, srcFiles, srcLines, stubFetch, tvmaze } from './support.js';

afterEach(restoreFetch);

const LOADING = { status: 'loading' };
const girls = SEARCH.girls.map((result) => result.show);
const MIGRATED = ['app', 'view', 'dom', 'main'];

/** Стани, які функція передала в setState, по черзі. Відхилений проміс — тест не пройдено. */
async function statesOf(load) {
  const states = [];
  try {
    await load((state) => states.push(state));
  } catch (error) {
    assert.fail(`проміс відхилено (${describe(error)}), а мав виконатися; стани до того: ${describe(states)}`);
  }
  return states;
}

/** tsconfig.json як об'єкт: без коментарів і ком перед закривною дужкою. */
function readConfig(path) {
  const text = readFileSync(new URL(path, import.meta.url), 'utf8');
  return JSON.parse(text.replace(/^\s*\/\/.*$/gm, '').replace(/,(\s*[}\]])/g, '$1'));
}

/** Відносні шляхи з розширенням .js в імпортах рядка: `from './view.js'`, `import('./view.js')`. */
function jsImports({ code, text }) {
  return [...code.matchAll(/(?:\bfrom|\bimport)\s*\(?\s*(['"])/g)]
    .map((match) => {
      const start = match.index + match[0].length;
      return text.slice(start, text.indexOf(match[1], start));
    })
    .filter((specifier) => /^\.\.?\/.*\.[cm]?js$/.test(specifier));
}

/* ---------------- T4.1–T4.2 · Файли й налаштування ---------------- */

test('T4.1 у src/ лише файли .ts: app, view, dom і main переведено на TypeScript й імпортують модулі з .ts', () => {
  const files = srcFiles();
  const left = files.filter((name) => /\.[cm]?js$/.test(name));
  const migrated = MIGRATED.map((name) => `${name}.ts`);
  const missing = migrated.filter((name) => !files.includes(name));
  assert.deepEqual(left, [], 'у src/ лишилися файли JavaScript');
  assert.deepEqual(missing, [], 'немає файлів TypeScript');
  const found = srcLines(migrated)
    .filter((line) => jsImports(line).length)
    .map(({ where, text }) => `${where}  ${text.trim()}`);
  assert.deepEqual(found, [], `імпорт з розширенням .js, а не .ts:\n${found.join('\n')}`);
});

test('T4.2 tsconfig.json і check/tsconfig.json не змінено', () => {
  assert.deepEqual(readConfig('../tsconfig.json'), {
    compilerOptions: {
      strict: true,
      allowJs: true,
      target: 'es2023',
      lib: ['es2023', 'dom', 'dom.iterable'],
      module: 'nodenext',
      rootDir: 'src',
      outDir: 'dist',
      sourceMap: true,
      rewriteRelativeImportExtensions: true,
      verbatimModuleSyntax: true,
      erasableSyntaxOnly: true,
      types: [],
    },
    include: ['src'],
  });
  assert.deepEqual(readConfig('./tsconfig.json'), {
    extends: '../tsconfig.json',
    compilerOptions: { noEmit: true, rootDir: '..', resolveJsonModule: true },
    include: ['../src', './*.ts'],
  });
});

/* ---------------- T4.3–T4.4 · Пошук ---------------- */

test('T4.3 loadSearch: порожній запит — лише стан idle, без запиту', async () => {
  const { loadSearch } = await importSrc('app');
  const requests = stubFetch();
  for (const query of ['', '   ']) {
    assert.deepEqual(await statesOf((setState) => loadSearch(query, setState)), [{ status: 'idle' }], `loadSearch(${JSON.stringify(query)})`);
  }
  assert.equal(requests.length, 0, 'кількість запитів');
});

test('T4.3 loadSearch: запит без пробілів на краях', async () => {
  const { loadSearch } = await importSrc('app');
  const requests = stubFetch();
  const states = await statesOf((setState) => loadSearch('  girls  ', setState));
  assert.equal(requests[0]?.searchParams.get('q'), 'girls', `адреса запиту: ${requests[0]}`);
  assert.deepEqual(states.at(-1), { status: 'results', query: 'girls', shows: girls });
});

test('T4.3 loadSearch: стан loading ще до запиту, потім results', async () => {
  const { loadSearch } = await importSrc('app');
  const log = [];
  stubFetch(tvmaze, log);
  await loadSearch('girls', (state) => log.push(state));
  assert.deepEqual(log[0], LOADING, 'перше, що сталося, — setState({ status: "loading" })');
  assert.ok(log[1] instanceof URL, 'потім — запит');
  assert.deepEqual(log.slice(2), [{ status: 'results', query: 'girls', shows: girls }], 'після відповіді — один стан results');
});

test('T4.3 loadSearch: нічого не знайдено — стан empty з query', async () => {
  const { loadSearch } = await importSrc('app');
  stubFetch();
  assert.deepEqual(await statesOf((setState) => loadSearch('qqqzzz', setState)), [LOADING, { status: 'empty', query: 'qqqzzz' }]);
});

test('T4.4 loadSearch: помилка HTTP — стан error з текстом errorMessage', async () => {
  const { loadSearch } = await importSrc('app');
  for (const status of [429, 503]) {
    stubFetch(() => httpError(status));
    assert.deepEqual(
      await statesOf((setState) => loadSearch('girls', setState)),
      [LOADING, { status: 'error', message: errorMessage(new HttpError(status)) }],
      `статус ${status}`,
    );
  }
});

test('T4.4 loadSearch: збій мережі — стан error, а проміс не відхиляється', async () => {
  const { loadSearch } = await importSrc('app');
  stubFetch(networkError);
  assert.deepEqual(
    await statesOf((setState) => loadSearch('girls', setState)),
    [LOADING, { status: 'error', message: errorMessage(new TypeError('fetch failed')) }],
  );
});

test('T4.4 loadSearch: тіло не тієї форми — стан error', async () => {
  const { loadSearch } = await importSrc('app');
  stubFetch(() => json({}));
  assert.deepEqual(
    await statesOf((setState) => loadSearch('girls', setState)),
    [LOADING, { status: 'error', message: errorMessage(new Error('Неочікувана відповідь API')) }],
  );
});

/* ---------------- T4.5 · Сторінка серіалу ---------------- */

test('T4.5 loadShow: стан loading, потім show', async () => {
  const { loadShow } = await importSrc('app');
  const requests = stubFetch();
  assert.deepEqual(await statesOf((setState) => loadShow(139, setState)), [LOADING, { status: 'show', show: SHOWS[139] }]);
  assert.equal(requests[0]?.pathname, '/shows/139');
});

test('T4.5 loadShow: 404 чи збій мережі — стан error, а проміс не відхиляється', async () => {
  const { loadShow } = await importSrc('app');
  stubFetch(() => httpError(404));
  assert.deepEqual(
    await statesOf((setState) => loadShow(139, setState)),
    [LOADING, { status: 'error', message: errorMessage(new HttpError(404)) }],
    '404',
  );
  stubFetch(networkError);
  assert.deepEqual(
    await statesOf((setState) => loadShow(139, setState)),
    [LOADING, { status: 'error', message: errorMessage(new TypeError('fetch failed')) }],
    'збій мережі',
  );
});

test('T4.5 loadShow: тіло не тієї форми — стан error', async () => {
  const { loadShow } = await importSrc('app');
  stubFetch(() => json({ name: 'Not Found', status: 404 }));
  assert.deepEqual(
    await statesOf((setState) => loadShow(139, setState)),
    [LOADING, { status: 'error', message: errorMessage(new Error('Неочікувана відповідь API')) }],
  );
});

test('T4.5 у app, view, dom і main немає fetch і .json(): дані з мережі — лише через src/api.ts', () => {
  const names = srcFiles().filter((name) => MIGRATED.some((module) => name.startsWith(`${module}.`)));
  const found = srcLines(names)
    .filter(({ code }) => /\bfetch\s*\(|\.json\s*\(|\bXMLHttpRequest\b/.test(code))
    .map(({ where, text }) => `${where}  ${text.trim()}`);
  assert.deepEqual(found, [], `запити до мережі поза src/api.ts:\n${found.join('\n')}`);
});

/* ---------------- T4.6 · Рік і оцінка ---------------- */

test('T4.6 showMeta: рік прем\'єри й оцінка', async () => {
  const { showMeta } = await importSrc('view');
  assert.equal(showMeta(SHOWS[139]), '2012 · оцінка 6.4', 'Girls (139)');
});

test('T4.6 showMeta: без оцінки — «—», без дати прем\'єри — «рік невідомий»', async () => {
  const { showMeta } = await importSrc('view');
  assert.equal(showMeta(SHOWS[41734]), '2018 · оцінка —', 'GIRLS (41734): оцінки немає');
  let text;
  try {
    text = showMeta(SHOWS[45962]);
  } catch (error) {
    assert.fail(`showMeta кинула помилку (${describe(error)}) для серіалу без дати прем'єри й оцінки`);
  }
  assert.equal(text, 'рік невідомий · оцінка —', "Harlem's Kitchen (45962): немає ні дати, ні оцінки");
});
