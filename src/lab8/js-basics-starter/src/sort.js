/** @typedef {import('./normalize.js').Show} Show */

/**
 * C3. Повертає новий масив серіалів, відсортований за полем `key`.
 * Специфікація — ТЗ, C3.
 *
 * @param {Show[]} shows
 * @param {'name' | 'year' | 'rating'} key
 * @param {'asc' | 'desc'} [direction]
 * @returns {Show[]}
 */
export function sortShows(shows, key, direction = 'asc') {
  return [...shows].sort((a, b) => {
    if (a[key] === null) return 1;
    if (b[key] === null) return -1;

    if (key === 'name') {
      const result = a.name.localeCompare(b.name);
      return direction === 'desc' ? -result : result;
    }

    const result = a[key] - b[key];
    return direction === 'desc' ? -result : result;
  });
}