import { getShow, notes, saveNote } from './state.js';

const safeSummaryTags = new Set(['P', 'B', 'I']);
let activeShowId = null;
let returnFocusTarget = null;

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
  const rating = document.querySelector('#note-rating');
  const noteText = document.querySelector('#note-text');
  if (!(dialog instanceof HTMLDialogElement)) throw new Error('Не знайдено діалог #details');
  if (!(title instanceof HTMLElement)) throw new Error('Не знайдено заголовок #details-title');
  if (!(summary instanceof HTMLElement)) throw new Error('Не знайдено опис #details-summary');
  if (!(link instanceof HTMLAnchorElement)) throw new Error('Не знайдено посилання #details-link');
  if (!(rating instanceof HTMLInputElement)) throw new Error('Не знайдено поле #note-rating');
  if (!(noteText instanceof HTMLTextAreaElement)) throw new Error('Не знайдено поле #note-text');

  activeShowId = id;
  const trigger = document.querySelector(
    `#results li[data-id="${id}"] button[data-action="details"]`,
  );
  returnFocusTarget = trigger instanceof HTMLElement ? trigger : null;
  title.textContent = show.name;
  const parsedSummary = new DOMParser().parseFromString(show.summary, 'text/html');
  const content = document.createDocumentFragment();
  copySummary(parsedSummary.body, content);
  summary.replaceChildren(content);
  link.href = show.url;

  const savedNote = notes.get(id);
  rating.value = savedNote ? String(savedNote.rating) : '';
  noteText.value = savedNote?.text ?? '';
  rating.setCustomValidity('');
  rating.removeAttribute('aria-invalid');
  noteText.setCustomValidity('');
  noteText.removeAttribute('aria-invalid');
  const ratingError = document.querySelector('#note-rating-error');
  const noteError = document.querySelector('#note-text-error');
  if (ratingError instanceof HTMLElement) ratingError.textContent = '';
  if (noteError instanceof HTMLElement) noteError.textContent = '';

  if (!dialog.open) dialog.showModal();
  rating.focus();
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

  const form = dialog.querySelector('#note-form');
  const rating = dialog.querySelector('#note-rating');
  const noteText = dialog.querySelector('#note-text');
  const ratingError = dialog.querySelector('#note-rating-error');
  const noteError = dialog.querySelector('#note-text-error');
  const cancel = dialog.querySelector('.note-form__actions button[type="button"]');
  if (!(form instanceof HTMLFormElement)) throw new Error('Не знайдено форму #note-form');
  if (!(rating instanceof HTMLInputElement)) throw new Error('Не знайдено поле #note-rating');
  if (!(noteText instanceof HTMLTextAreaElement)) throw new Error('Не знайдено поле #note-text');
  if (!(ratingError instanceof HTMLElement)) throw new Error('Не знайдено повідомлення #note-rating-error');
  if (!(noteError instanceof HTMLElement)) throw new Error('Не знайдено повідомлення #note-text-error');
  if (!(cancel instanceof HTMLButtonElement)) {
    throw new Error('Не знайдено кнопку скасування в діалозі #details');
  }

  form.noValidate = true;
  let skipCloseRestore = false;

  const clearRatingError = () => {
    rating.setCustomValidity('');
    ratingError.textContent = '';
    rating.removeAttribute('aria-invalid');
  };
  const clearNoteError = () => {
    noteText.setCustomValidity('');
    noteError.textContent = '';
    noteText.removeAttribute('aria-invalid');
  };
  const restoreFocus = () => {
    const target =
      returnFocusTarget?.isConnected
        ? returnFocusTarget
        : activeShowId === null
          ? null
          : document.querySelector(
              `#results li[data-id="${activeShowId}"] button[data-action="details"]`,
            );
    if (target instanceof HTMLElement) {
      target.focus();
    } else {
      const heading = document.querySelector('#results-heading');
      if (!(heading instanceof HTMLElement)) throw new Error('Не знайдено заголовок #results-heading');
      heading.tabIndex = -1;
      heading.focus();
    }
  };
  const closeAndRestore = (refreshAfterClose = false) => {
    skipCloseRestore = true;
    dialog.close();
    if (refreshAfterClose) refresh();
    restoreFocus();
  };

  rating.addEventListener('input', clearRatingError);
  noteText.addEventListener('input', clearNoteError);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearRatingError();
    clearNoteError();

    const value = rating.valueAsNumber;
    let firstInvalid = null;
    if (rating.value === '') {
      rating.setCustomValidity('Введіть оцінку від 1 до 10.');
    } else if (!Number.isInteger(value) || value < 1 || value > 10) {
      rating.setCustomValidity('Введіть ціле число від 1 до 10.');
    }
    if (rating.validationMessage) {
      ratingError.textContent = rating.validationMessage;
      rating.setAttribute('aria-invalid', 'true');
      firstInvalid = rating;
    }

    if (noteText.value.length > 140) {
      noteText.setCustomValidity('Нотатка має містити не більше 140 символів.');
      noteError.textContent = noteText.validationMessage;
      noteText.setAttribute('aria-invalid', 'true');
      firstInvalid ??= noteText;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    if (activeShowId === null) throw new Error('Не вибрано серіал для збереження нотатки');

    saveNote(activeShowId, { rating: value, text: noteText.value });
    closeAndRestore(true);
  });

  cancel.addEventListener('click', () => {
    closeAndRestore();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeAndRestore();
  });
  dialog.addEventListener('close', () => {
    if (skipCloseRestore) {
      skipCloseRestore = false;
      return;
    }
    restoreFocus();
  });
}
