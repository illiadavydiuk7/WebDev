/**
 * Елементи сторінки ShowFinder (index.html).
 * JavaScript-модуль: у T4 його переводить на TypeScript AI-агент. До T4 не змінюйте його.
 *
 * Викликайте pageElements() всередині start(): тести виконуються в Node, де сторінки (document)
 * немає, тому на верхньому рівні модуля до неї звертатися не можна.
 */
export function pageElements() {
  return {
    /** Форма пошуку form#search. */
    form: document.querySelector('#search'),
    /** Поле назви серіалу #search-query. */
    input: document.querySelector('#search-query'),
    /** Рядок статусу #status з role="status". */
    status: document.querySelector('#status'),
    /** Область #content: картки результатів або сторінка серіалу. */
    content: document.querySelector('#content'),
  };
}
