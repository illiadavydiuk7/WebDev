/**
 * Перевірки типів для `npm run typecheck`. Не змінюйте цей файл.
 *
 * Цей код ніколи не виконується: його лише читає компілятор. Кожен блок позначено правилом
 * ТЗ. Помилка в рядку блоку означає, що ваш тип чи сигнатура функції порушують це правило.
 *
 * Рядок під `// @ts-expect-error` навпаки мусить давати помилку: так перевірено, що тип не
 * пропускає зайвого. Якщо ваш тип надто широкий (наприклад, `string | number` замість `number`)
 * і помилки немає, компілятор пише «Unused '@ts-expect-error' directive».
 */
import type { SearchResult, Show } from '../src/types.ts';
import type { ViewState } from '../src/state.ts';
import { HttpError, getJson, getShow, isSearchResult, isShow, searchShows } from '../src/api.ts';
import { errorMessage, messageFor } from '../src/state.ts';
// app і view імпортовано з розширенням .js: до міграції (T4) це файли JavaScript, а після неї —
// TypeScript, і компілятор знаходить обидва. Типи JavaScript-файлів він виводить сам (any).
import { loadSearch, loadShow, start } from '../src/app.js';
import { showMeta } from '../src/view.js';
import search from './fixtures/search.json' with { type: 'json' };
import shows from './fixtures/shows.json' with { type: 'json' };

declare const show: Show;
declare const result: SearchResult;

/* ---------------- T1 · Типи відповідей API ---------------- */

// T1.1 · id — число; name і url — рядки; genres — масив рядків
const id: number = show.id;
const name: string = show.name;
const url: string = show.url;
const genres: readonly string[] = show.genres;
// @ts-expect-error T1.1 · id — не рядок
const idAsString: Show['id'] = '139';
// @ts-expect-error T1.1 · genres — масив, а не рядок
const genresAsString: Show['genres'] = 'Drama';

// T1.2 · image, summary, premiered і rating.average можуть бути null
const noImage: Show['image'] = null;
const noSummary: Show['summary'] = null;
const noPremiered: Show['premiered'] = null;
const noRating: Show['rating']['average'] = null;
// T1.2 · а коли не null, то image — об'єкт з medium, summary і premiered — рядки, average — число
const poster: string | undefined = show.image?.medium;
const summary: string | null = show.summary;
const premiered: string | null = show.premiered;
const rating: number | null = show.rating.average;
// @ts-expect-error T1.2 · name не може бути null
const noName: Show['name'] = null;

// T1.3 · SearchResult — { score: number; show: Show }
const score: number = result.score;
const found: Show = result.show;

// T1.4 · записані відповіді TVmaze (check/fixtures/) відповідають вашим типам
const girls: readonly SearchResult[] = search.queries.girls;
const lawAndOrder: readonly SearchResult[] = search.queries['law & order'];
const kitchen: readonly SearchResult[] = search.queries.kitchen;
const pilot: readonly SearchResult[] = search.queries.pilot;
const show139: Show = shows.shows['139'];
const show41734: Show = shows.shows['41734'];
const show45962: Show = shows.shows['45962'];

/* ---------------- T2 · Запити ---------------- */

// T2.1 · HttpError — Error з полем status: number лише для читання
const httpError: Error = new HttpError(404);
const status: number = new HttpError(404).status;
// @ts-expect-error T2.1 · status лише для читання (readonly)
new HttpError(404).status = 500;

// T2.2–T2.5 · сигнатури функцій (номер правила — у кінці рядка)
const getJsonType: (url: string) => Promise<unknown> = getJson; // T2.2
const isShowType: (value: unknown) => value is Show = isShow; // T2.3
const isSearchResultType: (value: unknown) => value is SearchResult = isSearchResult; // T2.3
const searchShowsType: (query: string) => Promise<Show[]> = searchShows; // T2.4
const getShowType: (id: number) => Promise<Show> = getShow; // T2.5

async function honestResults(): Promise<void> {
  // @ts-expect-error T2.2 · getJson повертає unknown, а не any: поле без перевірки не прочитати
  (await getJson('https://api.tvmaze.com/shows/139')).name;
  // @ts-expect-error T2.4 · searchShows повертає Show[], а не any[]: у серіалу немає score
  (await searchShows('girls'))[0]?.score;
  // @ts-expect-error T2.5 · getShow повертає Show, а не any: у серіалу немає score
  (await getShow(139)).score;
}

/* ---------------- T3 · Стани й тексти ---------------- */

// T3.1 · ViewState — шість станів, кожен зі своїми полями
const states: ViewState[] = [
  { status: 'idle' },
  { status: 'loading' },
  { status: 'results', query: 'girls', shows: [show] },
  { status: 'empty', query: 'qqqzzz' },
  { status: 'show', show },
  { status: 'error', message: 'Мережа недоступна. Перевірте підключення.' },
];
// @ts-expect-error T3.1 · у стані results є shows
const resultsWithoutShows: ViewState = { status: 'results', query: 'girls' };
// @ts-expect-error T3.1 · у стані loading немає shows
const loadingWithShows: ViewState = { status: 'loading', shows: [] };
// @ts-expect-error T3.1 · message у стані error — рядок
const errorWithNumber: ViewState = { status: 'error', message: 404 };
// @ts-expect-error T3.1 · стану done немає
const unknownStatus: ViewState = { status: 'done' };

// T3.1 · перевірка поля status звужує стан до одного з шести
function narrow(state: ViewState): void {
  if (state.status === 'results') {
    const list: readonly Show[] = state.shows;
  }
  if (state.status === 'show') {
    const opened: Show = state.show;
  }
  if (state.status === 'error') {
    const text: string = state.message;
  }
}

// T3.2–T3.3 · сигнатури функцій (номер правила — у кінці рядка)
const errorMessageType: (err: unknown) => string = errorMessage; // T3.2
const messageForType: (state: ViewState) => string = messageFor; // T3.3

/* ---------------- T4 · Міграція ---------------- */

// T4.3–T4.7 · сигнатури функцій (номер правила — у кінці рядка)
const loadSearchType: (query: string, setState: (state: ViewState) => void) => Promise<void> = loadSearch; // T4.3
const loadShowType: (id: number, setState: (state: ViewState) => void) => Promise<void> = loadShow; // T4.5
const showMetaType: (show: Show) => string = showMeta; // T4.6
const startType: () => void = start; // T4.7
