/**
 * Поведінка ShowFinder: пошук (C1), сторінка серіалу (C2), помилки й повторні спроби (C3).
 * Тут — обробники подій, життєвий цикл кожного запиту й стани областей #results і #details:
 * завантаження, результат, порожній результат, помилка. Специфікація — ТЗ, §3–4.
 */
import { getShow, searchShows } from './api.js';
import { renderResults, renderShow } from './view.js';

/** Підключає форму пошуку #search і області #results та #details. main.js викликає її один раз. */
export function initApp() {
  const form = document.querySelector('#search');
  const input = form?.querySelector('[name="query"]');
  const results = document.querySelector('#results');
  const status = document.querySelector('#status');
  const loadingTemplate = document.querySelector('#state-loading');
  const messageTemplate = document.querySelector('#state-message');
  const errorTemplate = document.querySelector('#state-error');

  if (
    !(form instanceof HTMLFormElement) ||
    !(input instanceof HTMLInputElement) ||
    !results ||
    !status ||
    !(loadingTemplate instanceof HTMLTemplateElement) ||
    !(messageTemplate instanceof HTMLTemplateElement) ||
    !(errorTemplate instanceof HTMLTemplateElement)
  ) {
    throw new Error('ShowFinder search elements are missing from the page');
  }

  let debounceTimer;
  let requestId = 0;
  let activeController;
  let activeQuery;

  function clearBusy() {
    results.removeAttribute('aria-busy');
  }

  function showLoading() {
    results.setAttribute('aria-busy', 'true');
    results.replaceChildren(loadingTemplate.content.cloneNode(true));
    status.textContent = 'Завантаження…';
  }

  function showMessage(text) {
    const fragment = messageTemplate.content.cloneNode(true);
    const message = fragment.querySelector('.state--message');
    if (!message) {
      throw new Error('Search message template is missing .state--message');
    }
    message.textContent = text;
    results.replaceChildren(fragment);
    status.textContent = text;
  }

  function cancelActiveRequest() {
    activeController?.abort();
    activeController = undefined;
    activeQuery = undefined;
  }

  function clearSearch() {
    window.clearTimeout(debounceTimer);
    debounceTimer = undefined;
    requestId += 1;
    cancelActiveRequest();
    clearBusy();
    results.replaceChildren();
    status.textContent = '';
  }

  async function runSearch(query, id = ++requestId) {
    const controller = new AbortController();
    cancelActiveRequest();
    activeController = controller;
    activeQuery = query;
    showLoading();

    try {
      const shows = await searchShows(query, { signal: controller.signal });
      if (id !== requestId) return;

      clearBusy();
      if (shows.length === 0) {
        showMessage(`Нічого не знайдено за запитом «${query}»`);
      } else {
        renderResults(results, shows);
        status.textContent = `Знайдено: ${shows.length}`;
      }
    } catch (error) {
      if (id !== requestId || error?.name === 'AbortError') return;

      console.error('TVmaze search failed:', error);
      clearBusy();
      const fragment = errorTemplate.content.cloneNode(true);
      const errorText = fragment.querySelector('.state__text');
      if (!errorText) {
        throw new Error('Search error template is missing .state__text');
      }
      errorText.textContent = 'Не вдалося отримати дані від TVmaze.';
      results.replaceChildren(fragment);
      status.textContent = 'Не вдалося отримати дані від TVmaze.';
    } finally {
      if (activeController === controller) {
        activeController = undefined;
        activeQuery = undefined;
      }
    }
  }

  function searchImmediately() {
    window.clearTimeout(debounceTimer);
    debounceTimer = undefined;
    const query = input.value.trim();
    if (query.length < 2) {
      clearSearch();
      return;
    }
    if (activeQuery === query && activeController) return;
    void runSearch(query);
  }

  form.addEventListener('input', (event) => {
    if (event.target !== input) return;

    const query = input.value.trim();
    window.clearTimeout(debounceTimer);
    debounceTimer = undefined;
    requestId += 1;
    cancelActiveRequest();

    if (query.length < 2) {
      clearBusy();
      results.replaceChildren();
      status.textContent = '';
      return;
    }

    const id = requestId;
    debounceTimer = window.setTimeout(() => {
      debounceTimer = undefined;
      void runSearch(query, id);
    }, 300);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    searchImmediately();
  });

  results.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('[data-action="retry"]')) return;
    searchImmediately();
  });
}
