/** @typedef {import('./state.js').Show} Show */
import { notes, shows, watchlist } from './state.js';

/**
 * C1. Показує серіали в списку #results — по картці з шаблону #show-card на кожен, у тому
 * самому порядку, — і оновлює рядок статусу #status. Специфікація — ТЗ, C1.
 *
 * @param {readonly Show[]} list серіали, які треба показати
 */
export function renderShows(list) {
  const results = document.querySelector('#results');
  const status = document.querySelector('#status');
  const template = document.querySelector('#show-card');
  if (!(results instanceof HTMLUListElement)) throw new Error('Не знайдено список #results');
  if (!(status instanceof HTMLElement)) throw new Error('Не знайдено рядок статусу #status');
  if (!(template instanceof HTMLTemplateElement) || !template.content.firstElementChild) {
    throw new Error('Не знайдено шаблон картки #show-card');
  }

  const cards = document.createDocumentFragment();
  for (const show of list) {
    const card = /** @type {HTMLLIElement} */ (template.content.firstElementChild.cloneNode(true));
    card.dataset.id = String(show.id);

    const setField = (field, value) => {
      const elements = card.querySelectorAll(`[data-field="${field}"]`);
      if (elements.length === 0) throw new Error(`У шаблоні картки немає поля "${field}"`);
      elements.forEach((element) => {
        element.textContent = value;
      });
    };

    setField('name', show.name);
    setField('year', show.year === null ? '—' : String(show.year));
    setField('genres', show.genres.length ? show.genres.join(', ') : '—');
    setField('rating', show.rating === null ? '—' : String(show.rating));
    const savedNote = notes.get(show.id);
    const myRating = card.querySelector('.card__mine');
    const note = card.querySelector('.card__note');
    if (!(myRating instanceof HTMLElement) || !(note instanceof HTMLElement)) {
      throw new Error('У шаблоні картки немає місця для оцінки й нотатки');
    }
    if (savedNote) {
      setField('my-rating', String(savedNote.rating));
      myRating.hidden = false;
      setField('note', savedNote.text);
      note.hidden = savedNote.text.length === 0;
    }
    const toggleButton = card.querySelector('button[data-action="toggle"]');
    if (!(toggleButton instanceof HTMLButtonElement)) {
      throw new Error('У шаблоні картки немає кнопки [data-action="toggle"]');
    }
    toggleButton.setAttribute('aria-pressed', String(watchlist.has(show.id)));
    cards.append(card);
  }

  results.replaceChildren(cards);
  status.textContent = list.length
    ? `Знайдено: ${list.length} з ${shows.length}`
    : 'Нічого не знайдено';
}
