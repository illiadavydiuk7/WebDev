// C3 · sortShows. Тести не змінюйте: це специфікація з ТЗ у вигляді коду.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { sortShows } from '../src/sort.js';

/**
 * Заморожує значення разом з усіма вкладеними об'єктами й масивами. Модулі виконуються в
 * strict mode, тож функція, яка спробує змінити вхідні дані, кине TypeError.
 */
function deepFreeze(value) {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

/** Лише поля, за якими сортують. Perfect Ten вигаданий: оцінка 10 рідкісна, але можлива. */
const shows = deepFreeze([
  { name: 'Under the Dome', year: 2013, rating: 6.6 },
  { name: 'Utopia', year: 2014, rating: null },
  { name: 'Perfect Ten', year: 2020, rating: 10 },
  { name: 'black-ish', year: 2014, rating: 6.2 },
  { name: 'Lost', year: 2004, rating: 8.2 },
]);

const names = (list) => list.map((show) => show.name);

describe('sortShows', () => {
  test('повертає новий масив і не змінює вхідного', () => {
    const result = sortShows(shows, 'year');
    assert.notEqual(result, shows, 'повернуто той самий масив, а не новий');
    assert.equal(result.length, shows.length);
  });

  test('rating, asc: порівнює числа, а не рядки; null — у кінці', () => {
    assert.deepEqual(names(sortShows(shows, 'rating', 'asc')), [
      'black-ish',
      'Under the Dome',
      'Lost',
      'Perfect Ten',
      'Utopia',
    ]);
  });

  test('rating, desc: null теж у кінці', () => {
    assert.deepEqual(names(sortShows(shows, 'rating', 'desc')), [
      'Perfect Ten',
      'Lost',
      'Under the Dome',
      'black-ish',
      'Utopia',
    ]);
  });

  test('year, asc: однакові значення зберігають вихідний порядок', () => {
    assert.deepEqual(names(sortShows(shows, 'year', 'asc')), [
      'Lost',
      'Under the Dome',
      'Utopia',
      'black-ish',
      'Perfect Ten',
    ]);
  });

  test('year, desc: однакові значення теж зберігають вихідний порядок', () => {
    assert.deepEqual(names(sortShows(shows, 'year', 'desc')), [
      'Perfect Ten',
      'Utopia',
      'black-ish',
      'Under the Dome',
      'Lost',
    ]);
  });

  test('name: localeCompare — регістр не вирішує порядку', () => {
    assert.deepEqual(names(sortShows(shows, 'name', 'asc')), [
      'black-ish',
      'Lost',
      'Perfect Ten',
      'Under the Dome',
      'Utopia',
    ]);
  });

  test('без direction → asc', () => {
    assert.deepEqual(sortShows(shows, 'name'), sortShows(shows, 'name', 'asc'));
  });
});
