/**
 * T2 · Запити до TVmaze API (src/api.ts). Назва кожного тесту починається з номера правила ТЗ.
 * Не змінюйте цей файл.
 */
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpError, getJson, getShow, isSearchResult, isShow, searchShows } from '../src/api.ts';
import { SEARCH, SHOWS, describe, httpError, json, rejection, restoreFetch, stubFetch } from './support.js';

afterEach(restoreFetch);

const searchResults = Object.values(SEARCH).flat();
const shows = [...searchResults.map((result) => result.show), ...Object.values(SHOWS)];

test('T2.1 HttpError — це Error з полем status і статусом у повідомленні', () => {
  const error = new HttpError(503);
  assert.ok(error instanceof Error, 'new HttpError(503) instanceof Error');
  assert.equal(error.status, 503, 'new HttpError(503).status');
  assert.match(error.message, /503/, 'new HttpError(503).message містить 503');
});

test('T2.2 getJson надсилає один запит на задану адресу й повертає розібране тіло', async () => {
  const requests = stubFetch(() => json({ id: 1, name: 'Test' }));
  assert.deepEqual(await getJson('https://api.tvmaze.com/shows/1'), { id: 1, name: 'Test' });
  assert.equal(requests.length, 1, 'кількість запитів');
  assert.equal(String(requests[0]), 'https://api.tvmaze.com/shows/1');
});

test('T2.2 getJson відхиляє проміс з HttpError, якщо статус поза 200–299', async () => {
  for (const status of [404, 500]) {
    stubFetch(() => httpError(status));
    const error = await rejection(getJson('https://api.tvmaze.com/shows/1'));
    assert.ok(error instanceof HttpError, `статус ${status}: очікувався HttpError, отримано ${describe(error)}`);
    assert.equal(error.status, status);
  }
});

test('T2.2 getJson не змінює помилку мережі: та сама помилка, що від fetch', async () => {
  const failure = new TypeError('fetch failed');
  stubFetch(() => {
    throw failure;
  });
  const error = await rejection(getJson('https://api.tvmaze.com/shows/1'));
  assert.equal(error, failure, `очікувалась помилка fetch без змін, отримано ${describe(error)}`);
});

test('T2.3 isShow: true для кожного записаного серіалу, false для інших значень', () => {
  for (const show of shows) assert.equal(isShow(show), true, `isShow(${show.name})`);
  const notShows = [
    null,
    undefined,
    'Girls',
    139,
    [],
    {},
    searchResults[0],
    { id: '139', name: 'Girls', genres: [] },
    { id: 139, genres: [] },
    { id: 139, name: 'Girls' },
    { id: 139, name: 'Girls', genres: 'Drama' },
  ];
  for (const value of notShows) assert.equal(isShow(value), false, `isShow(${describe(value)})`);
});

test('T2.3 isSearchResult: true для кожного записаного елемента пошуку, false для інших значень', () => {
  for (const result of searchResults) assert.equal(isSearchResult(result), true, `isSearchResult(${result.show.name})`);
  const notResults = [null, 'girls', SHOWS[139], { score: 1 }, { score: '1', show: SHOWS[139] }, { score: 1, show: {} }, [searchResults[0]]];
  for (const value of notResults) assert.equal(isSearchResult(value), false, `isSearchResult(${describe(value)})`);
});

test('T2.4 searchShows надсилає GET https://api.tvmaze.com/search/shows з параметром q', async () => {
  const requests = stubFetch();
  await searchShows('girls');
  assert.equal(requests.length, 1, 'кількість запитів');
  assert.equal(requests[0].origin + requests[0].pathname, 'https://api.tvmaze.com/search/shows');
  assert.equal(requests[0].searchParams.get('q'), 'girls');
});

test('T2.4 searchShows кодує запит: «law & order» доходить до API повністю', async () => {
  const requests = stubFetch();
  await searchShows('law & order');
  assert.equal(requests[0]?.searchParams.get('q'), 'law & order', `адреса запиту: ${requests[0]}`);
  assert.deepEqual([...requests[0].searchParams.keys()], ['q'], `адреса запиту: ${requests[0]}`);
});

test('T2.4 searchShows повертає серіали (а не елементи { score, show }) у порядку відповіді', async () => {
  stubFetch();
  assert.deepEqual(await searchShows('girls'), SEARCH.girls.map((result) => result.show));
});

test('T2.4 searchShows повертає [], якщо нічого не знайдено', async () => {
  stubFetch();
  assert.deepEqual(await searchShows('qqqzzz'), []);
});

test('T2.5 getShow надсилає GET https://api.tvmaze.com/shows/:id і повертає серіал', async () => {
  const requests = stubFetch();
  assert.deepEqual(await getShow(139), SHOWS[139]);
  assert.equal(requests.length, 1, 'кількість запитів');
  assert.equal(requests[0].origin + requests[0].pathname, 'https://api.tvmaze.com/shows/139');
});

for (const status of [404, 429, 500, 503]) {
  test(`T2.6 searchShows і getShow на статус ${status} відхиляють проміс з HttpError ${status}`, async () => {
    stubFetch(() => httpError(status));
    for (const [call, run] of [
      ['searchShows("girls")', () => searchShows('girls')],
      ['getShow(139)', () => getShow(139)],
    ]) {
      const error = await rejection(run());
      assert.ok(error instanceof HttpError, `${call}: очікувався HttpError, отримано ${describe(error)}`);
      assert.equal(error.status, status, `${call}: status`);
    }
  });
}

const UNEXPECTED = 'Неочікувана відповідь API';

test('T2.7 searchShows: тіло не тієї форми — Error «Неочікувана відповідь API»', async () => {
  for (const body of [{}, null, [{ foo: 1 }], [{ score: 1, show: { id: '139', name: 'Girls', genres: [] } }]]) {
    stubFetch(() => json(body));
    const error = await rejection(searchShows('girls'));
    assert.ok(error instanceof Error && !(error instanceof HttpError), `тіло ${describe(body)}: отримано ${describe(error)}`);
    assert.equal(error.message, UNEXPECTED, `тіло ${describe(body)}`);
  }
});

test('T2.7 getShow: тіло не тієї форми — Error «Неочікувана відповідь API»', async () => {
  for (const body of [{}, null, [SHOWS[139]], { id: 139 }]) {
    stubFetch(() => json(body));
    const error = await rejection(getShow(139));
    assert.ok(error instanceof Error && !(error instanceof HttpError), `тіло ${describe(body)}: отримано ${describe(error)}`);
    assert.equal(error.message, UNEXPECTED, `тіло ${describe(body)}`);
  }
});
