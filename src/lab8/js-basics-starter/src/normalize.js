/**
 * @typedef {object} RawShow Запис із `data/shows.json` у форматі TVmaze.
 * @property {number} id
 * @property {string} name
 * @property {string[]} [genres]
 * @property {number | null} [runtime] тривалість серії, хв
 * @property {string | null} [premiered] дата прем'єри, "YYYY-MM-DD"
 * @property {{ average: number | null } | null} [rating]
 * @property {{ id: number, name: string } | null} [network]
 */

/**
 * @typedef {object} Show Серіал після normalizeShow() — з таким форматом працюють C2–C4.
 * @property {number} id
 * @property {string} name
 * @property {number | null} year рік прем'єри
 * @property {number | null} rating середня оцінка глядачів
 * @property {number | null} runtime тривалість серії, хв
 * @property {string | null} network назва телемережі
 * @property {string[]} genres
 */

/**
 * C1. Перетворює запис TVmaze на {@link Show}.
 * Специфікація — ТЗ, C1.
 *
 * @param {RawShow} raw
 * @returns {Show}
 */
export function normalizeShow(raw) {
  throw new Error('Not implemented');
}
