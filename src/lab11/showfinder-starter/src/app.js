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
  const details = document.querySelector('#details');
  const status = document.querySelector('#status');
  const loadingTemplate = document.querySelector('#state-loading');
  const messageTemplate = document.querySelector('#state-message');
  const errorTemplate = document.querySelector('#state-error');

  if (
    !(form instanceof HTMLFormElement) ||
    !(input instanceof HTMLInputElement) ||
    !results ||
    !details ||
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
  let detailsRequestId = 0;
  let detailsController;
  let selectedShowId;
  const showCache = new Map();

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
    if (!(target instanceof Element)) return;
    if (target.closest('[data-action="retry"]')) {
      searchImmediately();
      return;
    }

    const openButton = target.closest('[data-action="open"]');
    const card = openButton?.closest('li[data-id]');
    if (card) {
      const id = Number(card.dataset.id);
      if (Number.isInteger(id)) {
        void openShow(id);
      }
    }
  });

  async function openShow(id) {
    selectedShowId = id;
    detailsRequestId += 1;
    const requestId = detailsRequestId;
    detailsController?.abort();
    detailsController = undefined;

    if (showCache.has(id)) {
      details.removeAttribute('aria-busy');
      renderShow(details, showCache.get(id));
      return;
    }

    const controller = new AbortController();
    detailsController = controller;
    details.setAttribute('aria-busy', 'true');
    details.replaceChildren(loadingTemplate.content.cloneNode(true));

    try {
      const showData = await getShow(id, { signal: controller.signal });
      if (requestId !== detailsRequestId) return;

      showCache.set(id, showData);
      details.removeAttribute('aria-busy');
      renderShow(details, showData);
    } catch (error) {
      if (requestId !== detailsRequestId || error?.name === 'AbortError') return;

      console.error('TVmaze show request failed:', error);
      details.removeAttribute('aria-busy');
      const message = error?.status === 404
        ? 'Серіал не знайдено'
        : 'Не вдалося отримати дані від TVmaze.';
      const fragment = error?.status === 404
        ? messageTemplate.content.cloneNode(true)
        : errorTemplate.content.cloneNode(true);
      const text = fragment.querySelector(error?.status === 404 ? '.state--message' : '.state__text');
      if (!text) {
        throw new Error('Show state template is missing its message element');
      }
      text.textContent = message;
      details.replaceChildren(fragment);
    } finally {
      if (detailsController === controller) {
        detailsController = undefined;
      }
    }
  }

  details.addEventListener('click', (event) => {
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest('[data-action="retry"]') &&
      selectedShowId !== undefined
    ) {
      void openShow(selectedShowId);
    }
  });
}
