import { getShow } from './state.js';

const safeSummaryTags = new Set(['P', 'B', 'I']);

/**
 * Copies TVmaze's formatted summary while excluding attributes and unsupported elements.
 * @param {Node} source
 * @param {DocumentFragment | Element} target
 */
function copySummary(source, target) {
  for (const node of source.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      target.append(document.createTextNode(node.textContent ?? ''));
    } else if (node instanceof Element) {
      const children = safeSummaryTags.has(node.tagName)
        ? document.createElement(node.tagName.toLowerCase())
        : document.createDocumentFragment();
      copySummary(node, children);
      target.append(children);
    }
  }
}

/**
 * C4. Відкриває діалог #details для серіалу: назва, опис, посилання на сторінку TVmaze і форма
 * з моєю оцінкою й нотаткою. Специфікація — ТЗ, C4.
 *
 * @param {number} id
 */
export function openDetails(id) {
  const show = getShow(id);
  const dialog = document.querySelector('#details');
  const title = document.querySelector('#details-title');
  const summary = document.querySelector('#details-summary');
  const link = document.querySelector('#details-link');
  if (!(dialog instanceof HTMLDialogElement)) throw new Error('Не знайдено діалог #details');
  if (!(title instanceof HTMLElement)) throw new Error('Не знайдено заголовок #details-title');
  if (!(summary instanceof HTMLElement)) throw new Error('Не знайдено опис #details-summary');
  if (!(link instanceof HTMLAnchorElement)) throw new Error('Не знайдено посилання #details-link');

  title.textContent = show.name;
  const parsedSummary = new DOMParser().parseFromString(show.summary, 'text/html');
  const content = document.createDocumentFragment();
  copySummary(parsedSummary.body, content);
  summary.replaceChildren(content);
  link.href = show.url;

  if (!dialog.open) dialog.showModal();
}

/**
 * C4. Підключає діалог #details: закриття й форму «Моя оцінка й нотатка». main.js викликає цю
 * функцію один раз. Специфікація — ТЗ, C4.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initDetails(refresh) {
  const dialog = document.querySelector('#details');
  if (!(dialog instanceof HTMLDialogElement)) throw new Error('Не знайдено діалог #details');

  const cancel = dialog.querySelector('.note-form__actions button[type="button"]');
  if (!(cancel instanceof HTMLButtonElement)) {
    throw new Error('Не знайдено кнопку скасування в діалозі #details');
  }

  cancel.addEventListener('click', () => {
    dialog.close();
  });
}
