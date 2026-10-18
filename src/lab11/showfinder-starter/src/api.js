/**
 * Запити до TVmaze API: https://www.tvmaze.com/api. Які ендпоїнти, які відповіді й помилки —
 * ТЗ, §3.2 і §4.
 */

/** Адреса API. */
export const API = 'https://api.tvmaze.com';

/**
 * C1. Шукає серіали за назвою. Повертає масив серіалів (об'єктів show) у порядку відповіді
 * API — те, що приймає renderResults з view.js.
 *
 * @param {string} query
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<object[]>}
 */
export async function searchShows(query, { signal } = {}) {
  const url = `${API}/search/shows?q=${encodeURIComponent(query.trim())}`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`TVmaze search failed with HTTP ${response.status}`);
  }

  const results = await response.json();
  if (!Array.isArray(results)) {
    throw new TypeError('TVmaze search response must be an array');
  }
  return results.map((result) => result.show);
}

/**
 * C2. Завантажує серіал з епізодами й акторами. Повертає { show, episodes, cast } — те, що
 * приймає renderShow з view.js.
 *
 * @param {number} id
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ show: object, episodes: object[], cast: object[] }>}
 */
export async function getShow(id, { signal } = {}) {
  // TODO C2
}
