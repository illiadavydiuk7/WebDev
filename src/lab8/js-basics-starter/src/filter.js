/** @typedef {import('./normalize.js').Show} Show */

/**
 * @typedef {object} FilterOptions
 * @property {string | null} [query] частина назви
 * @property {string | null} [genre] жанр
 * @property {number | null} [minRating] мінімальна оцінка
 */

/**
 * C2. Повертає серіали, які відповідають усім заданим фільтрам.
 * Специфікація — ТЗ, C2.
 *
 * @param {Show[]} shows
 * @param {FilterOptions} [options]
 * @returns {Show[]}
 */
export function filterShows(shows, options = {}) {
  const query = options.query?.trim().toLowerCase();
  const genre = options.genre;
  const minRating = options.minRating;

  return shows.filter((show) => {
    if (query && !show.name.toLowerCase().includes(query)) {
      return false;
    }

    if (genre && !show.genres.includes(genre)) {
      return false;
    }

    if (minRating > 0 && (show.rating == null || show.rating < minRating)) {
      return false;
    }

    return true;
  });
}