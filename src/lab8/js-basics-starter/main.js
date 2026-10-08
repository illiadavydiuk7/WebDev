// Звіт для index.html: застосовує функції з src/ до data/shows.json. Змінювати цей файл не
// потрібно. Розділ, функцію якого ще не реалізовано, показує її помилку замість результату.
import data from './data/shows.json' with { type: 'json' };
import { createCounter, memoize, once } from './src/closures.js';
import { filterShows } from './src/filter.js';
import { normalizeShow } from './src/normalize.js';
import { sortShows } from './src/sort.js';
import { genreStats } from './src/stats.js';

/** @typedef {import('./src/normalize.js').Show} Show */

const lines = [`Дані: ${data.shows.length} серіалів із TVmaze`];
let ready = 0;
/** @type {Show[] | null} */
let shows = null;

/**
 * Додає розділ звіту. Якщо `build` кидає помилку, розділ показує її.
 * @param {string} title
 * @param {() => string[]} build
 */
function section(title, build) {
  lines.push('', title);
  try {
    for (const line of build()) lines.push(`  ${line}`);
    ready += 1;
  } catch (error) {
    lines.push(`  ✗ ${error instanceof Error ? error.message : String(error)}`);
  }
}

/** Розділи C2–C4 працюють з результатом C1. */
function normalized() {
  if (shows === null) throw new Error('спершу потрібен C1 (normalizeShow)');
  return shows;
}

/** @param {Show[]} list */
const titles = (list) => list.map((show) => `${show.name} (${show.rating ?? '—'})`).join(', ');

section('C1 · normalizeShow', () => {
  const result = data.shows.map(normalizeShow);
  shows = result;
  /** @param {(show: Show) => boolean} test */
  const count = (test) => result.filter(test).length;
  return [
    `Без оцінки: ${count((show) => show.rating === null)}` +
      ` · без тривалості: ${count((show) => show.runtime === null)}` +
      ` · без телемережі: ${count((show) => show.network === null)}` +
      ` · без жанрів: ${count((show) => show.genres.length === 0)}`,
    `Приклад: ${JSON.stringify(result.find((show) => show.name === 'House of Cards'))}`,
  ];
});

section('C2 · filterShows', () => {
  const drama = filterShows(normalized(), { genre: 'Drama', minRating: 8.7 });
  const the = filterShows(normalized(), { query: ' THE ' });
  return [
    `{ genre: 'Drama', minRating: 8.7 } → ${drama.length}: ${titles(drama)}`,
    `{ query: ' THE ' } → ${the.length}: ${titles(the)}`,
  ];
});

section('C3 · sortShows', () => {
  const best = sortShows(normalized(), 'rating', 'desc').slice(0, 5);
  const oldest = sortShows(normalized(), 'year').slice(0, 3);
  return [
    `За оцінкою, desc, перші п'ять: ${titles(best)}`,
    `За роком, asc, перші три: ${oldest.map((show) => `${show.name} (${show.year})`).join(', ')}`,
  ];
});

section('C4 · genreStats — жанр, серіалів, середня оцінка', () =>
  Object.entries(genreStats(normalized()))
    .toSorted(([a, x], [b, y]) => y.count - x.count || a.localeCompare(b))
    .map(
      ([genre, { count, averageRating }]) =>
        `${genre.padEnd(16)} ${String(count).padStart(2)}   ${averageRating ?? '—'}`,
    ),
);

section('C5 · createCounter, once, memoize', () => {
  const computed = createCounter();
  const countGenre = memoize((/** @type {string} */ genre) => {
    computed.increment();
    return data.shows.filter((show) => show.genres.includes(genre)).length;
  });
  const asked = ['Drama', 'Comedy', 'Drama', 'Crime', 'Comedy', 'Drama'];
  const answers = asked.map((genre) => `${genre} ${countGenre(genre)}`);
  const greet = once((/** @type {string} */ name) => `Привіт, ${name}!`);
  return [
    `memoize: ${asked.length} запитів (${answers.join(', ')}) → обчислень: ${computed.value()}`,
    `once: «${greet('C5')}», потім «${greet('ще раз')}» — fn викликано лише раз`,
  ];
});

lines.push('', `Готово розділів: ${ready} з 5`);
const report = document.querySelector('#report');
if (report) report.textContent = lines.join('\n');
