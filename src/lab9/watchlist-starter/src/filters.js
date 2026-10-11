/** @typedef {import('./state.js').Filters} Filters */

/**
 * C3. Повертає поточні значення форми фільтрів #filters. Поки C3 не виконано, фільтрів немає,
 * і список показує всі серіали. Специфікація — ТЗ, C3.
 *
 * @returns {Filters}
 */
export function readFilters() {
  const form = document.querySelector('#filters');
  if (!(form instanceof HTMLFormElement)) throw new Error('Не знайдено форму #filters');

  const query = form.elements.namedItem('query');
  const genre = form.elements.namedItem('genre');
  const mine = form.elements.namedItem('mine');
  if (!(query instanceof HTMLInputElement) || query.type !== 'search') {
    throw new Error('Не знайдено поле пошуку name="query"');
  }
  if (!(genre instanceof HTMLSelectElement)) throw new Error('Не знайдено список жанрів name="genre"');
  if (!(mine instanceof HTMLInputElement) || mine.type !== 'checkbox') {
    throw new Error('Не знайдено перемикач name="mine"');
  }

  return { query: query.value, genre: genre.value, mine: mine.checked };
}

/**
 * C3. Підключає форму фільтрів: після кожної зміни — refresh(). main.js викликає цю функцію
 * один раз. Специфікація — ТЗ, C3.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initFilters(refresh) {
  const form = document.querySelector('#filters');
  if (!(form instanceof HTMLFormElement)) throw new Error('Не знайдено форму #filters');

  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    refresh();
  });
  form.addEventListener('reset', (event) => {
    event.preventDefault();

    const query = form.elements.namedItem('query');
    const genre = form.elements.namedItem('genre');
    const mine = form.elements.namedItem('mine');
    if (!(query instanceof HTMLInputElement) || !(genre instanceof HTMLSelectElement) ||
        !(mine instanceof HTMLInputElement)) {
      throw new Error('Не вдалося скинути поля форми фільтрів');
    }

    query.value = query.defaultValue;
    for (const option of genre.options) option.selected = option.defaultSelected;
    mine.checked = mine.defaultChecked;
    refresh();
  });
}
