/**
 * Поведінка ShowFinder: пошук, сторінка серіалу, стани сторінки (ТЗ, §3.4).
 * JavaScript-модуль: у T4 його переводить на TypeScript AI-агент. До T4 не змінюйте його.
 */
import { API, searchShows } from './api.ts';
import { pageElements } from './dom.js';
import { errorMessage, messageFor } from './state.ts';
import { renderResults, renderShow, renderStatus } from './view.js';

/** Пошук: стан loading, потім results, empty або error. Кожен стан передає в setState. */
export async function loadSearch(query, setState) {
  const trimmed = query.trim();
  if (!trimmed) {
    setState({ status: 'idle' });
    return;
  }
  setState({ status: 'loading' });
  try {
    const shows = await searchShows(trimmed);
    if (shows.length) setState({ status: 'results', query: trimmed, shows });
    else setState({ status: 'empty', q: trimmed });
  } catch (err) {
    setState({ status: 'error', message: err.message });
  }
}

/** Сторінка серіалу: стан loading, потім show або error. */
export async function loadShow(id, setState) {
  setState({ status: 'loading' });
  try {
    const show = await fetch(`${API}/shows/${id}`).then((response) => response.json());
    setState({ status: 'show', show });
  } catch (err) {
    setState({ status: 'error', message: errorMessage(err) });
  }
}

/** Підключає форму й картки до сторінки. Її викликає main.js. */
export function start() {
  const page = pageElements();

  function render(state) {
    renderStatus(page.status, messageFor(state), state.status);
    if (state.status === 'results') renderResults(page.content, state.shows);
    else if (state.status === 'show') renderShow(page.content, state.show);
    else page.content.replaceChildren();
  }

  page.form.addEventListener('submit', (event) => {
    event.preventDefault();
    loadSearch(page.input.value, render);
  });

  page.content.addEventListener('click', (event) => {
    const card = event.target.closest('button[data-id]');
    if (card) loadShow(card.dataset.id, render);
  });

  render({ status: 'idle' });
}
