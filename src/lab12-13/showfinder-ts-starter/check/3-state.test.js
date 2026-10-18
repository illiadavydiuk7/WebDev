/**
 * T3 · Стани й тексти (src/state.ts). Назва кожного тесту починається з номера правила ТЗ.
 * Не змінюйте цей файл.
 *
 * Тексти порівнюються точно, лише три крапки «...» зараховуються як «…».
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpError } from '../src/api.ts';
import { errorMessage, messageFor } from '../src/state.ts';
import { SEARCH, SHOWS, describe } from './support.js';

const text = (value) => (typeof value === 'string' ? value.replace('...', '…') : value);

test('T3.2 errorMessage: HttpError 404', () => {
  assert.equal(text(errorMessage(new HttpError(404))), 'Не знайдено (HTTP 404).');
});

test('T3.2 errorMessage: HttpError 429', () => {
  assert.equal(text(errorMessage(new HttpError(429))), 'Забагато запитів (HTTP 429). Спробуйте за кілька секунд.');
});

test('T3.2 errorMessage: HttpError 500–599 — зі статусом', () => {
  for (const status of [500, 502, 503]) {
    assert.equal(
      text(errorMessage(new HttpError(status))),
      `Сервер TVmaze недоступний (HTTP ${status}). Спробуйте пізніше.`,
      `HttpError ${status}`,
    );
  }
});

test('T3.2 errorMessage: інший HttpError — зі статусом', () => {
  for (const status of [400, 403, 410]) {
    assert.equal(text(errorMessage(new HttpError(status))), `Помилка запиту (HTTP ${status}).`, `HttpError ${status}`);
  }
});

test('T3.2 errorMessage: TypeError — збій мережі', () => {
  assert.equal(text(errorMessage(new TypeError('fetch failed'))), 'Мережа недоступна. Перевірте підключення.');
});

test('T3.2 errorMessage: будь-яке інше значення', () => {
  const others = [new Error('Неочікувана відповідь API'), new SyntaxError('Unexpected token <'), 'boom', null, undefined, 404, { status: 404 }];
  for (const value of others) {
    assert.equal(text(errorMessage(value)), 'Щось пішло не так. Спробуйте ще раз.', `errorMessage(${describe(value)})`);
  }
});

const girls = SEARCH.girls.map((result) => result.show);

test('T3.3 messageFor: idle', () => {
  assert.equal(text(messageFor({ status: 'idle' })), 'Введіть назву серіалу.');
});

test('T3.3 messageFor: loading', () => {
  assert.equal(text(messageFor({ status: 'loading' })), 'Завантаження…');
});

test('T3.3 messageFor: results — кількість серіалів', () => {
  assert.equal(text(messageFor({ status: 'results', query: 'girls', shows: girls })), `Знайдено серіалів: ${girls.length}`);
  assert.equal(text(messageFor({ status: 'results', query: 'girls', shows: girls.slice(0, 1) })), 'Знайдено серіалів: 1');
});

test('T3.3 messageFor: empty — із запитом', () => {
  assert.equal(text(messageFor({ status: 'empty', query: 'qqqzzz' })), 'Нічого не знайдено за запитом «qqqzzz»');
});

test('T3.3 messageFor: show — назва серіалу', () => {
  assert.equal(text(messageFor({ status: 'show', show: SHOWS[139] })), 'Серіал: Girls');
});

test('T3.3 messageFor: error — текст помилки без змін', () => {
  for (const message of ['Мережа недоступна. Перевірте підключення.', 'Будь-який текст']) {
    assert.equal(text(messageFor({ status: 'error', message })), message);
  }
});
