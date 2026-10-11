import { toggle, watchlist } from './state.js';
import { openDetails } from './details.js';

/**
 * C2. Підключає кнопки карток у списку #results: «До списку» додає серіал до мого списку або
 * прибирає з нього, «Детальніше» відкриває діалог (openDetails з details.js). main.js викликає
 * цю функцію один раз, після першого показу списку. Специфікація — ТЗ, C2.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initList(refresh) {
  const results = document.querySelector('#results');
  if (!(results instanceof HTMLUListElement)) throw new Error('Не знайдено список #results');

  results.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button[data-action]');
    const card = button?.closest('li[data-id]');
    if (!(button instanceof HTMLButtonElement) || !card || !results.contains(button)) return;

    const id = Number(card.dataset.id);
    if (button.dataset.action === 'toggle') {
      toggle(id);
      const count = document.querySelector('#watchlist-count');
      if (!(count instanceof HTMLElement)) throw new Error('Не знайдено лічильник #watchlist-count');
      count.textContent = String(watchlist.size);
      refresh();
      const refreshedButton = results.querySelector(
        `li[data-id="${id}"] button[data-action="toggle"]`,
      );
      if (refreshedButton instanceof HTMLButtonElement) refreshedButton.focus();
    } else if (button.dataset.action === 'details') {
      openDetails(id);
    }
  });
}
