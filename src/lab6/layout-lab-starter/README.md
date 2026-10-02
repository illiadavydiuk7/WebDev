# Layout Lab — starter-проєкт для ЛР №6

Розмітка для code challenges лабораторної роботи №6 «Responsive Layout,
Container Queries, Fluid Typography та debugging CSS Layout».

Опис завдання: `/labs/lab-6/` на сайті курсу.

## Склад

```text
index.html          список challenges
base.css            спільні стилі: шрифт, кольори, вигляд карток і кнопок — без layout
img/product.svg     зображення для product card
challenge-01/       Flexbox: responsive header
challenge-02/       Grid: adaptive card layout
challenge-03/       Responsive page layout: Grid + Flexbox
challenge-04/       Subgrid: aligned cards
challenge-05/       Container Query: reusable Card (і Challenge 6 — container query units)
challenge-07/       Fluid Typography — стартовий CSS із breakpoint-based typography
challenge-08/       Debug the Layout — сторінка з навмисно закладеними помилками
challenge-09/       AI-generated Layout Review — лише умова; код дає AI-агент
challenge-10/       Final Responsive Component
```

У кожній теці `index.html` — розмітка, `style.css` — ваш CSS. `base.css`
змінювати не потрібно: layout у ньому навмисно відсутній.

Умова кожного challenge — у блоці «Завдання» вгорі його сторінки (блок можна
згорнути, клікнувши заголовок). Повний текст — у лабораторній роботі.

У Challenge 9 розмітки немає: покладіть відповідь AI-агента без змін у
`challenge-09/original/`, а виправлену версію — у `challenge-09/final/`, щоб
можна було порівняти початковий і фінальний CSS.

## Як запустити локально

Збірки немає: це статичні файли. Сторінки можна відкрити напряму, але зручніше
підняти локальний сервер у корені проєкту:

```bash
# Node
npx serve .

# або Python
python -m http.server 8000
```

Далі — `http://localhost:8000/`.

## Як перевіряти

- **Device Toolbar** (Ctrl+Shift+M) — змінюйте ширину viewport і дивіться, як
  поводиться layout.
- **Elements → Layout** — Grid- та Flexbox-overlay.
- **Elements → Computed** — фактичні `width`, `font-size` тощо.
- Для Challenge 5–6 змінюйте ширину **контейнера**, а не viewport: у DevTools
  відредагуйте `width` у `.sidebar`, `main` або `.modal`.

## Як задеплоїти

Покладіть проєкт у власний GitHub repository та опублікуйте на GitHub Pages і
Vercel — посилання на обидва деплої потрібні в листі (§8 лабораторної роботи).
