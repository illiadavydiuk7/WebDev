/** @typedef {import('./normalize.js').Show} Show */

/**
 * @typedef {object} GenreStats
 * @property {number} count скільки серіалів мають цей жанр
 * @property {number | null} averageRating середня оцінка цих серіалів
 */

/**
 * C4. Рахує статистику для кожного жанру.
 * Специфікація — ТЗ, C4.
 *
 * @param {Show[]} shows
 * @returns {Record<string, GenreStats>} ключ — назва жанру
 */
export function genreStats(shows) {
  const stats = {};

  for (const show of shows) {
    for (const genre of show.genres) {
      if (!stats[genre]) {
        stats[genre] = {
          count: 0,
          ratings: [],
        };
      }

      stats[genre].count++;

      if (show.rating != null) {
        stats[genre].ratings.push(show.rating);
      }
    }
  }

  for (const genre in stats) {
    const ratings = stats[genre].ratings;

    stats[genre].averageRating =
      ratings.length === 0
        ? null
        : Math.round(
            (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10
          ) / 10;

    delete stats[genre].ratings;
  }

  return stats;
}