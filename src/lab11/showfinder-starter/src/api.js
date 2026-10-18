/**
 * Запити до TVmaze API: https://www.tvmaze.com/api. Які ендпоїнти, які відповіді й помилки —
 * ТЗ, §3.2 і §4.
 */

/** Адреса API. */
export const API = 'https://api.tvmaze.com';

class ApiError extends Error {
  /**
   * @param {'network' | 'http' | 'invalid-json' | 'invalid-response'} kind
   * @param {string} message
   * @param {{ status?: number, cause?: unknown }} [options]
   */
  constructor(kind, message, options = {}) {
    super(message, options);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options.status;
  }
}

async function requestJson(url, signal) {
  let response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (signal?.aborted) throw new DOMException('The request was aborted', 'AbortError');
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('network', 'TVmaze request failed because of a network error', { cause: error });
  }

  if (!response.ok) {
    throw new ApiError('http', `TVmaze request failed with HTTP ${response.status}`, {
      status: response.status,
    });
  }

  try {
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw new DOMException('The request was aborted', 'AbortError');
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('invalid-json', 'TVmaze returned a non-JSON response', { cause: error });
  }
}

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
  const results = await requestJson(url, signal);
  if (!Array.isArray(results)) {
    throw new ApiError('invalid-response', 'TVmaze search response must be an array');
  }
  return results.map((result) => {
    if (!result || typeof result !== 'object' || !result.show || typeof result.show !== 'object') {
      throw new ApiError('invalid-response', 'TVmaze search response contains an invalid show');
    }
    return result.show;
  });
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
  const url = new URL(`${API}/shows/${encodeURIComponent(id)}`);
  url.searchParams.append('embed[]', 'episodes');
  url.searchParams.append('embed[]', 'cast');
  const data = await requestJson(url, signal);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ApiError('invalid-response', 'TVmaze show response must be an object');
  }
  const { _embedded: embedded, ...show } = data;
  if (!embedded || !Array.isArray(embedded.episodes) || !Array.isArray(embedded.cast)) {
    throw new ApiError('invalid-response', 'TVmaze show response must include embedded episodes and cast arrays');
  }

  return { show, episodes: embedded.episodes, cast: embedded.cast };
}
