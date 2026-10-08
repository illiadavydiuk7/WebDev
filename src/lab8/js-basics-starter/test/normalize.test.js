// C1 · normalizeShow. Тести не змінюйте: це специфікація з ТЗ у вигляді коду.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { normalizeShow } from '../src/normalize.js';

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

/** Запис із data/shows.json без змін. */
const complete = deepFreeze({
  id: 169,
  url: 'https://www.tvmaze.com/shows/169/breaking-bad',
  name: 'Breaking Bad',
  language: 'English',
  genres: ['Drama', 'Crime', 'Thriller'],
  status: 'Ended',
  runtime: 60,
  premiered: '2008-01-20',
  rating: { average: 9.2 },
  network: { id: 20, name: 'AMC' },
});

/** Той самий запис зі зміненими полями. */
const variant = (changes) => deepFreeze({ ...complete, ...changes });

/** Той самий запис без поля `key`. */
function without(key) {
  const copy = { ...complete };
  delete copy[key];
  return deepFreeze(copy);
}

describe('normalizeShow', () => {
  test('повертає рівно сім полів: id, name, year, rating, runtime, network, genres', () => {
    assert.deepEqual(normalizeShow(complete), {
      id: 169,
      name: 'Breaking Bad',
      year: 2008,
      rating: 9.2,
      runtime: 60,
      network: 'AMC',
      genres: ['Drama', 'Crime', 'Thriller'],
    });
  });

  test('rating.average: 0 — це оцінка 0, а не її відсутність', () => {
    assert.equal(normalizeShow(variant({ rating: { average: 0 } })).rating, 0);
  });

  test('rating.average: null, rating: null або немає поля rating → rating: null', () => {
    assert.equal(normalizeShow(variant({ rating: { average: null } })).rating, null);
    assert.equal(normalizeShow(variant({ rating: null })).rating, null);
    assert.equal(normalizeShow(without('rating')).rating, null);
  });

  test('premiered: null або немає поля → year: null (не NaN і не 1970)', () => {
    assert.equal(normalizeShow(variant({ premiered: null })).year, null);
    assert.equal(normalizeShow(without('premiered')).year, null);
  });

  test('network: null або немає поля → network: null', () => {
    assert.equal(normalizeShow(variant({ network: null })).network, null);
    assert.equal(normalizeShow(without('network')).network, null);
  });

  test('runtime: null або немає поля → runtime: null', () => {
    assert.equal(normalizeShow(variant({ runtime: null })).runtime, null);
    assert.equal(normalizeShow(without('runtime')).runtime, null);
  });

  test('немає поля genres → genres: []', () => {
    assert.deepEqual(normalizeShow(without('genres')).genres, []);
  });

  test('genres — новий масив, а не посилання на вхідний', () => {
    const result = normalizeShow(complete);
    assert.notEqual(
      result.genres,
      complete.genres,
      'result.genres — той самий масив, що й raw.genres',
    );
    assert.deepEqual(result.genres, complete.genres);
  });
});
