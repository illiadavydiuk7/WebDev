// C2 · filterShows. Тести не змінюйте: це специфікація з ТЗ у вигляді коду.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { filterShows } from '../src/filter.js';

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

/** Лише поля, з якими працюють фільтри. Bad Pilot вигаданий: оцінка 0 рідкісна, але можлива. */
const shows = deepFreeze([
  { name: 'Breaking Bad', rating: 9.2, genres: ['Drama', 'Crime', 'Thriller'] },
  { name: 'The Big Bang Theory', rating: 8, genres: ['Comedy'] },
  { name: 'Utopia', rating: null, genres: [] },
  { name: 'Bad Pilot', rating: 0, genres: ['Drama', 'Comedy'] },
  { name: 'The Wire', rating: 8.9, genres: ['Drama', 'Crime'] },
]);

const names = (list) => list.map((show) => show.name);

describe('filterShows', () => {
  test('без options → усі серіали в новому масиві', () => {
    const result = filterShows(shows);
    assert.deepEqual(result, shows);
    assert.notEqual(result, shows, 'повернуто той самий масив, а не новий');
  });

  test('query: частина назви без урахування регістру й пробілів на краях', () => {
    assert.deepEqual(names(filterShows(shows, { query: '  BAD ' })), ['Breaking Bad', 'Bad Pilot']);
  });

  test('genre: точний збіг з одним із жанрів', () => {
    assert.deepEqual(names(filterShows(shows, { genre: 'Comedy' })), [
      'The Big Bang Theory',
      'Bad Pilot',
    ]);
  });

  test('minRating: 8.9 → оцінка ≥ 8.9; серіали без оцінки не проходять', () => {
    assert.deepEqual(names(filterShows(shows, { minRating: 8.9 })), ['Breaking Bad', 'The Wire']);
  });

  test('minRating: 0 — без фільтра: оцінки 0 і null залишаються', () => {
    assert.deepEqual(filterShows(shows, { minRating: 0 }), shows);
  });

  test('null у будь-якому полі означає «не задано»', () => {
    assert.deepEqual(filterShows(shows, { query: null, genre: null, minRating: null }), shows);
  });

  test('порожній рядок і рядок із пробілів теж означають «не задано»', () => {
    assert.deepEqual(filterShows(shows, { query: '   ', genre: '' }), shows);
  });

  test('кілька фільтрів поєднуються через «і»', () => {
    const result = filterShows(shows, { query: 'the', genre: 'Drama', minRating: 8 });
    assert.deepEqual(names(result), ['The Wire']);
  });
});
