// C4 · genreStats. Тести не змінюйте: це специфікація з ТЗ у вигляді коду.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { genreStats } from '../src/stats.js';

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

/**
 * Лише поля, з якими працює статистика. Zero Pilot і Fresh Pilot вигадані: оцінка 0 рідкісна,
 * але можлива, а в нового серіалу оцінки ще немає.
 */
const shows = deepFreeze([
  { name: 'Breaking Bad', rating: 9.2, genres: ['Drama', 'Crime'] },
  { name: 'The Wire', rating: 8.9, genres: ['Drama'] },
  { name: 'Fargo', rating: 8.6, genres: ['Crime', 'Comedy'] },
  { name: 'Girls', rating: 6.5, genres: ['Drama', 'Comedy'] },
  { name: 'The Big Bang Theory', rating: 8, genres: ['Comedy'] },
  { name: 'Zero Pilot', rating: 0, genres: ['Comedy'] },
  { name: 'Fresh Pilot', rating: null, genres: ['Comedy'] },
  { name: 'Long Shadow', rating: null, genres: ['War', 'History'] },
  { name: 'The Chair', rating: null, genres: [] },
]);

describe('genreStats', () => {
  test('кожен жанр → { count, averageRating }; серіали без жанрів не враховано', () => {
    assert.deepEqual(genreStats(shows), {
      Drama: { count: 3, averageRating: 8.2 },
      Crime: { count: 2, averageRating: 8.9 },
      Comedy: { count: 5, averageRating: 5.8 },
      War: { count: 1, averageRating: null },
      History: { count: 1, averageRating: null },
    });
  });

  test('averageRating — число, округлене до одного знака після коми', () => {
    const { averageRating } = genreStats(shows).Drama;
    assert.equal(typeof averageRating, 'number');
    assert.equal(averageRating, 8.2);
  });

  test('у середнє не входить null, але входить 0', () => {
    assert.equal(genreStats(shows).Comedy.averageRating, 5.8);
  });

  test('жанр без жодної оцінки → averageRating: null (не NaN і не 0)', () => {
    assert.equal(genreStats(shows).War.averageRating, null);
  });

  test('порожній масив → порожній об’єкт', () => {
    assert.deepEqual(genreStats([]), {});
  });
});
