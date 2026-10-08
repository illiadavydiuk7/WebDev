# JS Basics — starter-проєкт для ЛР №8

П'ять чистих функцій обробки даних про серіали — без DOM, без залежностей, з
готовими тестами. Функції поки що лише кидають `Error('Not implemented')`:
реалізувати їх так, щоб пройшли всі тести, і є практичною частиною
лабораторної роботи.

Опис завдання та специфікація функцій:
<https://denysmatsevych.github.io/web-development-2026/labs/lab-8/> і
<https://denysmatsevych.github.io/web-development-2026/labs/lab-8/task/>.

## Склад

```text
package.json        "type": "module" і скрипт test; залежностей немає
src/normalize.js    C1 · normalizeShow
src/filter.js       C2 · filterShows
src/sort.js         C3 · sortShows
src/stats.js        C4 · genreStats
src/closures.js     C5 · createCounter, once, memoize
test/*.test.js      тести до кожного challenge (node:test, node:assert/strict)
data/shows.json     30 серіалів із TVmaze — для звіту в index.html
index.html          сторінка звіту
main.js             застосовує функції з src/ до data/shows.json і виводить звіт
```

Змінюйте лише файли в `src/`. Тести — це специфікація з ТЗ у вигляді коду:
файли в `test/` не змінюються в жодному коміті.

## Тести

Потрібен Node.js 22 або новіший (встановлений у ЛР-1). `npm install` не
потрібен.

```bash
node --test                          # усі тести (або npm test)
node --test test/normalize.test.js   # тести одного challenge
```

На початку всі тести падають з `Error: Not implemented`. Назва кожного тесту —
правило з ТЗ, яке він перевіряє.

Тести не читають `data/shows.json`: у кожному файлі — невеликий набір даних,
побудований навколо пасток. Вхідні дані **заморожені** (`deepFreeze` на початку
файлу). Повідомлення `TypeError: Cannot assign to read only property …` або
`Cannot add property …, object is not extensible` означає, що ваша функція
змінює свої аргументи.

## Звіт у браузері

`index.html` імпортує функції з `src/` і показує, що вони роблять із даними
TVmaze. Розділ, функцію якого ще не реалізовано, показує її помилку.

Відкрийте сторінку через **Live Preview** у VS Code (або `npx serve .`). Через
`file://` звіт не з'явиться: чому — одне з питань лабораторної роботи.

## Як задеплоїти

Вміст цієї теки можна покласти або в **окремий репозиторій**, або в теку
`lab-8/` спільного репозиторію з лабораторними. Усі шляхи в проєкті відносні.

1. Завантажте файли в репозиторій.
2. Settings → Pages → Source: _Deploy from a branch_, гілка `main`, тека `/`.
3. Сторінка з'явиться за адресою `https://<username>.github.io/<repository>/`
   (або `…/<repository>/lab-8/`, якщо проєкт у вкладеній теці).

## Дані

`data/shows.json` — адаптація даних [TVmaze](https://www.tvmaze.com)
([TVmaze API](https://www.tvmaze.com/api)), отриманих 04.10.2026: 30 із 240
серіалів першої сторінки `https://api.tvmaze.com/shows?page=0`, лише частина
полів. Дані TVmaze поширюються за ліцензією
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); ця адаптація —
за тією самою ліцензією. Якщо використовуєте дані деінде, зазначайте TVmaze як
джерело і зберігайте ліцензію.
