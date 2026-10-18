/**
 * Спільне для тестів: записані відповіді TVmaze, підміна fetch, читання src/ і дрібні помічники.
 * Не змінюйте цей файл.
 *
 * Тести не ходять у мережу: fetch на час кожного тесту підміняє stubFetch, і відповідь дає
 * або записаний файл з check/fixtures/ (як справжній TVmaze), або сам тест — статус 404, 429,
 * 500, 503, тіло не тієї форми чи збій мережі.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const read = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));

/** Записані відповіді пошуку за запитом: SEARCH.girls, SEARCH['law & order'], … */
export const SEARCH = read('search.json').queries;
/** Записані відповіді GET /shows/:id за id: SHOWS[139], … */
export const SHOWS = read('shows.json').shows;

/** Відповідь з тілом JSON. */
export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=UTF-8' },
  });
}

/** Відповідь з помилкою HTTP і тілом, як у TVmaze. */
export function httpError(status) {
  return json({ name: `HTTP ${status}`, message: '', code: 0, status }, status);
}

/** Збій мережі: так fetch відхиляє проміс, коли відповіді немає зовсім. */
export function networkError() {
  throw new TypeError('fetch failed');
}

/** Відповідає як TVmaze за записаними файлами: незаписаний пошук — [], невідомий серіал — 404. */
export function tvmaze(url) {
  if (url.origin !== 'https://api.tvmaze.com') return networkError();
  if (url.pathname === '/search/shows') return json(SEARCH[url.searchParams.get('q') ?? ''] ?? []);
  const match = /^\/shows\/(\d+)$/.exec(url.pathname);
  if (match && SHOWS[match[1]]) return json(SHOWS[match[1]]);
  return httpError(404);
}

const realFetch = globalThis.fetch;

/**
 * Підміняє fetch: `answer(url)` повертає Response або кидає помилку. Кожен запит (URL) дописує
 * в масив `log`, який і повертає. restoreFetch() повертає справжній fetch.
 */
export function stubFetch(answer = tvmaze, log = []) {
  globalThis.fetch = async (input) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    log.push(url);
    return answer(url);
  };
  return log;
}

export function restoreFetch() {
  globalThis.fetch = realFetch;
}

/** Помилка, з якою відхилився проміс. Якщо проміс виконався — тест не пройдено. */
export async function rejection(promise) {
  let value;
  try {
    value = await promise;
  } catch (error) {
    return error;
  }
  assert.fail(`проміс виконався зі значенням ${describe(value)}, а мав відхилитися`);
}

const SRC = new URL('../src/', import.meta.url);
const SRC_DIR = fileURLToPath(SRC);

/**
 * Модуль src/<name>: файл .ts, а якщо його ще немає — .js. До міграції (T4) тести виконують
 * JavaScript-версії app і view, після неї — TypeScript.
 */
export function importSrc(name) {
  const ts = new URL(`${name}.ts`, SRC);
  return import(existsSync(ts) ? ts : new URL(`${name}.js`, SRC));
}

/** Файли src/ разом із підтеками: шляхи відносно src/ через «/», наприклад `app.ts` чи `lib/util.ts`. */
export function srcFiles() {
  return readdirSync(SRC_DIR, { recursive: true })
    .map((name) => name.replaceAll('\\', '/'))
    .filter((name) => statSync(path.join(SRC_DIR, name)).isFile())
    .sort();
}

/**
 * Рядки коду файлів src/: `{ where: 'src/app.ts:12', code, text }`. У `code` коментарі й вміст
 * рядкових літералів замінено пробілами, тож слова в коментарях і текстах не рахуються, а вирази
 * всередині `${…}` шаблонних рядків лишаються кодом. `text` — рядок як є.
 */
export function srcLines(names = srcFiles().filter((name) => /\.[cm]?[jt]s$/.test(name))) {
  return names.flatMap((name) => {
    const text = readFileSync(path.join(SRC_DIR, name), 'utf8');
    const code = stripCode(text).split('\n');
    return text.split('\n').map((line, index) => ({
      where: `src/${name}:${index + 1}`,
      code: code[index] ?? '',
      text: line.replace(/\r$/, ''),
    }));
  });
}

/** Код без коментарів і вмісту рядкових літералів; переноси рядків лишаються на місці. */
function stripCode(text) {
  let out = '';
  let i = 0;
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  const stack = []; // відкриті `${`: скільки фігурних дужок відкрито всередині кожного
  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '/' && next === '/') {
      const end = text.indexOf('\n', i);
      const stop = end < 0 ? text.length : end;
      out += blank(text.slice(i, stop));
      i = stop;
    } else if (c === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end < 0 ? text.length : end + 2;
      out += blank(text.slice(i, stop));
      i = stop;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== c && text[j] !== '\n') j += text[j] === '\\' ? 2 : 1;
      out += c + blank(text.slice(i + 1, j)) + (text[j] === c ? c : '');
      i = text[j] === c ? j + 1 : j;
    } else if (c === '`' || (c === '}' && stack.at(-1) === 0)) {
      // Текст шаблонного рядка — до наступного ` або ${.
      if (c === '}') stack.pop();
      let j = i + 1;
      while (j < text.length && text[j] !== '`' && !(text[j] === '$' && text[j + 1] === '{')) j += text[j] === '\\' ? 2 : 1;
      out += c + blank(text.slice(i + 1, j));
      if (text[j] === '`') {
        out += '`';
        i = j + 1;
      } else {
        out += '${';
        stack.push(0);
        i = j + 2;
      }
    } else {
      if (stack.length && c === '{') stack[stack.length - 1] += 1;
      if (stack.length && c === '}') stack[stack.length - 1] -= 1;
      out += c;
      i += 1;
    }
  }
  return out;
}

/** Коротко про значення для повідомлень тестів. */
export function describe(value) {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === 'string') return JSON.stringify(value);
  const text = JSON.stringify(value) ?? String(value);
  return text.length > 100 ? `${text.slice(0, 100)}…` : text;
}
