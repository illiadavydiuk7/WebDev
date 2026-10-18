/**
 * Показ даних TVmaze: картки результатів, сторінка серіалу, рядок статусу.
 * JavaScript-модуль: у T4 його переводить на TypeScript AI-агент. До T4 не змінюйте його.
 *
 * Модуль не робить запитів і нічого не знає про стани застосунку: він лише показує те, що йому
 * передали. Поля серіалу описано в ТЗ, §3.2.
 */

/**
 * Показує серіали картками в тому самому порядку й замінює вміст `container`. Кожна картка —
 * кнопка `button[data-id="<id серіалу>"]`; що відбувається після натискання, вирішує app.js.
 * Порожній масив дає порожній список.
 */
export function renderResults(container, shows) {
  const list = el('ul', { class: 'cards' });
  for (const show of shows) {
    const card = el('button', { type: 'button', class: 'card', 'data-id': String(show.id) }, [
      poster(show, 'card__image'),
      el('span', { class: 'card__body' }, [
        el('span', { class: 'card__title', lang: 'en' }, [show.name]),
        el('span', { class: 'card__meta' }, [showMeta(show)]),
        el('span', { class: 'card__genres', lang: 'en' }, [genres(show)]),
      ]),
    ]);
    list.append(el('li', {}, [card]));
  }
  container.replaceChildren(list);
}

/**
 * Показує сторінку серіалу — постер, назву, рік, оцінку, жанри, опис і посилання на TVmaze — і
 * замінює вміст `container`. Заголовок `h2#show-title` отримує фокус: картка, яку натиснули,
 * зникла, і клавіатура не має загубитися.
 */
export function renderShow(container, show) {
  const title = el('h2', { id: 'show-title', class: 'show__title', lang: 'en', tabindex: '-1' }, [show.name]);
  const article = el('article', { class: 'show', 'aria-labelledby': 'show-title' }, [
    el('div', { class: 'show__head' }, [
      poster(show, 'show__image'),
      el('div', { class: 'show__intro' }, [
        title,
        el('p', { class: 'show__meta' }, [showMeta(show)]),
        el('p', { class: 'show__genres', lang: 'en' }, [genres(show)]),
        el('p', {}, [el('a', { href: show.url }, ['Сторінка серіалу на TVmaze'])]),
      ]),
    ]),
    summary(show.summary),
  ]);
  container.replaceChildren(article);
  title.focus();
}

/**
 * Пише текст у рядок статусу й позначає стан атрибутом `data-state` для стилів: `loading`
 * показує спінер, `error` — червону рамку. Третій аргумент — поле `status` стану.
 */
export function renderStatus(status, text, state) {
  status.textContent = text;
  status.dataset.state = state;
}

/**
 * Рік прем'єри й оцінка під назвою серіалу: «2012 · оцінка 6.4». Без дати прем'єри замість року —
 * «рік невідомий», без оцінки замість числа — «—».
 */
export function showMeta(show) {
  return `${show.premiered.slice(0, 4)} · оцінка ${show.rating.average}`;
}

/* ---------------- Частини сторінки ---------------- */

function poster(show, className) {
  if (!show.image) return el('span', { class: `${className} poster--none`, 'aria-hidden': 'true' });
  return el('img', { class: className, src: show.image.medium, alt: '', width: '210', height: '295', loading: 'lazy' });
}

function genres(show) {
  return show.genres.length ? show.genres.join(', ') : '—';
}

/** Опис TVmaze — HTML. Його розбирає інертний документ, а на сторінку потрапляє лише текст. */
function summary(html) {
  const box = el('div', { class: 'show__summary', lang: 'en' });
  const doc = new DOMParser().parseFromString(html ?? '', 'text/html');
  const paragraphs = [...doc.body.querySelectorAll('p')];
  const blocks = paragraphs.length ? paragraphs : [doc.body];
  const texts = blocks.map((block) => block.textContent.trim()).filter(Boolean);
  if (!texts.length) box.append(el('p', { lang: 'uk' }, ['Опису немає.']));
  for (const text of texts) box.append(el('p', {}, [text]));
  return box;
}

/** Елемент з атрибутами й дітьми; рядки стають текстовими вузлами. */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  node.append(...children);
  return node;
}
