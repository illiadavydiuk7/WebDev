/**
 * T2 · Запити до TVmaze API. Пишете власноруч: ТЗ, §4, T2.
 *
 * Імена функцій і параметрів уже є. Типи параметрів і результатів, клас HttpError і тіла
 * функцій — ваша частина. Поки параметр без типу, компілятор пише «implicitly has an 'any' type».
 * Дані з мережі звужуйте перевірками (typeof, in, Array.isArray), а не твердженням `as` (ТЗ, §5).
 */

/** Адреса API. */
export const API = 'https://api.tvmaze.com';

/** T2.1 · Помилка HTTP: сервер відповів, але зі статусом поза 200–299. */
export class HttpError extends Error {
  // TODO T2.1: поле status і конструктор
}

/** T2.2 · GET-запит; повертає розібране тіло відповіді JSON. */
export async function getJson(url) {
  throw new Error('Not implemented');
}

/** T2.3 · Чи є значення серіалом (type guard). */
export function isShow(value) {
  throw new Error('Not implemented');
}

/** T2.3 · Чи є значення елементом відповіді пошуку (type guard). */
export function isSearchResult(value) {
  throw new Error('Not implemented');
}

/** T2.4 · Пошук серіалів за назвою. */
export async function searchShows(query) {
  throw new Error('Not implemented');
}

/** T2.5 · Серіал за id. */
export async function getShow(id) {
  throw new Error('Not implemented');
}
