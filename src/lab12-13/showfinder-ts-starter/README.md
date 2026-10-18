# ShowFinder: з JavaScript на TypeScript — starter-проєкт для ЛР №12-13

Пошук серіалів у [TVmaze](https://www.tvmaze.com) через його публічний
[API](https://www.tvmaze.com/api): користувач вводить назву, бачить список
знайдених серіалів і відкриває сторінку одного з них. Застосунок написано на
JavaScript, і його переводять на TypeScript: типи, запити й стани ви пишете
власноруч, а решту модулів переводить AI-агент, і ви перевіряєте й виправляєте
його роботу. Перевірки типів і тести вже є.

Опис завдання та специфікація:
<https://denysmatsevych.github.io/web-development-2026/web-development/labs/lab-12/> і
<https://denysmatsevych.github.io/web-development-2026/web-development/labs/lab-12/task/>.

## Склад

```text
package.json         скрипти; залежність одна — typescript
tsconfig.json        налаштування компілятора (strict)
index.html           сторінка; завантажує скомпільований dist/main.js
styles.css           стилі
src/types.ts         T1 · типи відповідей API — ваші
src/api.ts           T2 · запити — ваші
src/state.ts         T3 · стани й тексти — ваші
src/app.js           T4 · поведінка: пошук, сторінка серіалу ┐
src/view.js          T4 · показ даних                         │ JavaScript: на TypeScript
src/dom.js           T4 · елементи сторінки                   │ їх переводить AI-агент
src/main.js          T4 · точка входу                         ┘
check/               самоперевірка: перевірки типів, тести й записані відповіді TVmaze
```

Файли `.js` до T4 не змінюйте. `check/`, `index.html`, `styles.css` і
`tsconfig.json` не змінюються зовсім: `check/` — це специфікація з ТЗ у вигляді
коду.

## Запуск

Потрібен Node.js **22.18** або новіший (`node -v`): тести виконують файли
`.ts` без компіляції, а Node уміє стирати типи сам лише з цієї версії. Старіший
Node пише `Unknown file extension ".ts"`.

```bash
npm install          # один раз: встановлює TypeScript у node_modules/
npm run watch        # компілює src/ у dist/ і стежить за змінами
```

Поки `npm run watch` працює, відкрийте `index.html` через **Live Preview** у
VS Code (або `npx serve .`) у Chrome чи Edge. Браузер виконує JavaScript із
`dist/`, а не файли з `src/`. Компілятор кладе код у `dist/`, навіть коли в
ньому є помилки типів, тож сторінка працює й посеред роботи. Через `file://`
модулі не завантажаться.

Поки в `src/` є файли `.js`, `tsc` теж компілює їх у `dist/`, але типів у них
не перевіряє (`allowJs` у `tsconfig.json`). Так проєкт працює посеред міграції:
модулі `.ts` і `.js` імпортують один одного.

## Самоперевірка

```bash
npm run check        # перевірка типів і тести, наприкінці — підсумок одним рядком
npm run typecheck    # лише типи: tsc -p check
npm test             # лише тести: node --test
node --test check/2-api.test.js   # тести одного завдання
```

На початку майже все падає: це нормально. Назва кожного тесту й коментар у
`check/types.check.ts` біля кожної перевірки типів починаються з номера правила
ТЗ (T2.4 — четверте правило завдання T2). Робота готова, коли `npm run check`
закінчується рядком «Типи: без помилок» і всі тести пройдено.

Поки модулі T4 лишаються на JavaScript, тести виконують саме їх. Тому частина
тестів T4 падає ще до міграції: у старому JavaScript-коді є дефекти, які
міграція має виявити.

Тести не ходять у мережу: `fetch` на час тесту підмінено, а відповіді TVmaze
записано в `check/fixtures/`.

## Редактор

VS Code і WebStorm підсвічують помилки типів власною версією TypeScript, а
`npm run typecheck` використовує TypeScript 7 з `node_modules/`. Для цього
проєкту вони показують ті самі помилки. Якщо щось розходиться, зараховується
`npm run check`.

## Публікація

Публікувати застосунок не потрібно: викладач запускає `npm run check` у вашому
репозиторії. Теки `node_modules/` і `dist/` не комітяться (`.gitignore`).

## Дані

Дані серіалів — [TVmaze](https://www.tvmaze.com), ліцензія
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Записані
відповіді в `check/fixtures/` скорочено до полів, які використовує застосунок;
кожен файл указує джерело, ліцензію, дату й зміни.
