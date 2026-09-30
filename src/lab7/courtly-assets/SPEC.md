# Courtly — специфікація

Копія розділів 2–5 сторінки «Courtly — макет і дизайн-система»:
<https://denysmatsevych.github.io/web-development-2026/labs/lab-7/task/>

Знімки макета — у теці `mockup/`, масштаб 1 : 1 (1 px зображення = 1 CSS px).

## 2. Design tokens

Скопіюйте `tokens.css` на початок власного CSS. Назви змінних можна
перейменувати, **значення — ні**. Власні токени (наприклад, для hover-стану
або додаткового відступу) додавати можна.

### Кольори

| Токен | Значення | Роль | Контраст |
| --- | --- | --- | --- |
| `--color-primary` | `#0b6e4f` | кнопки, посилання, фокус | 6.25 : 1 з білим текстом |
| `--color-primary-hover` | `#085a40` | hover основної кнопки | 8.25 : 1 |
| `--color-primary-soft` | `#e3f1ea` | фон чипа «вид спорту» | 5.37 : 1 з `--color-primary` |
| `--color-accent` | `#c6f432` | кнопка CTA, номери кроків, badge | 11.95 : 1 з `--color-dark` |
| `--color-background` | `#f6f8f5` | фон сторінки | — |
| `--color-surface` | `#ffffff` | header, картки, форма | — |
| `--color-surface-alt` | `#eaf1ec` | фон секції «Як це працює» | — |
| `--color-border` | `#d5dfd8` | рамки, роздільники | декоративні |
| `--color-text` | `#13201a` | основний текст | 15.74 : 1 на фоні |
| `--color-text-muted` | `#4a5a52` | описи, підписи | 6.36 : 1 на `--color-surface-alt` |
| `--color-dark` | `#0f2a1f` | фон CTA та footer | — |
| `--color-on-dark` | `#f1f7f3` | заголовки на темному | 14.10 : 1 |
| `--color-on-dark-muted` | `#b4c7bb` | текст і посилання на темному | 8.63 : 1 |
| `--color-rating` | `#a15c00` | зірка рейтингу | 5.19 : 1 на білому |

Усі пари «текст / фон» у макеті проходять WCAG AA (4.5 : 1 для тексту,
3 : 1 для фокус-обвідки та графіки). Колір — не єдиний носій інформації:
рейтинг поруч із зіркою завжди записаний числом.

### Типографіка

Шрифт — **Montserrat** (variable, 400–800) з підмножиною **cyrillic**; без неї
браузер підставить системний шрифт для кожної української літери.

| Токен | Mobile 375 px | Desktop 1440 px | Де |
| --- | ---: | ---: | --- |
| `--font-size-h1` | 32 px | 56 px | заголовок hero |
| `--font-size-h2` | 26 px | 40 px | заголовки секцій, назва featured card |
| `--font-size-h3` | 19 px | 22 px | назви карток, кроки |
| `--font-size-lead` | 17 px | 20 px | опис hero, підзаголовки секцій |
| `--font-size-base` | 16 px | 16 px | текст |
| `--font-size-small` | 14 px | 14 px | ціна «/год», підписи полів, footer |
| `--font-size-xs` | 13 px | 13 px | чипи, badge |

Між 375 і 1440 px розмір змінюється лінійно — це і є `clamp()` у токенах.
Заголовки — `800`, кнопки й підписи полів — `600`, текст — `400`;
міжрядковий інтервал заголовків `1.15`, тексту `1.6`.

### Відступи, форма, тіні

- **Spacing** — крок 4 px: `--space-2xs` 4 px … `--space-3xl` 64 px;
  вертикальний відступ секцій `--space-section` — fluid, 56 → 96 px.
- **Контейнер** — `--container-max` 1200 px, бічний відступ
  `--container-gutter` 16 → 32 px.
- **Висота контролів** — `--control-height` 48 px для кнопок і полів; велика
  кнопка hero / CTA — 56 px.
- **Радіуси** — 8 px поля й чипи, 12 px кнопки, 20 px картки, зображення, форма
  та CTA; `--radius-pill` — чипи й badge.
- **Тіні** — `--shadow-sm` для карток, `--shadow-md` для форми пошуку, hero-зображення
  та панелі mobile menu.

## 3. Сітка та breakpoints

Mobile-first, два breakpoints: **640 px** (`40rem`) і **1024 px** (`64rem`).

| | < 640 px | 640–1023 px | ≥ 1024 px |
| --- | --- | --- | --- |
| Header | кнопка «Меню» | кнопка «Меню» | навігація в рядок |
| Hero | вертикально, зображення 16 : 9 | вертикально, зображення 16 : 9 | 2 колонки, зображення 4 : 3 |
| Форма пошуку | 1 колонка | 2 × 2 | 4 в рядок |
| Картки | 1 колонка | 2 колонки | 3 колонки, featured 2 × 2 |
| Як це працює | вертикально | вертикально | 3 в ряд |
| Інформаційний блок | вертикально | 2 колонки (з 768 px) | 2 колонки |
| Footer | 1 колонка | 2 колонки | 4 колонки |

Відстань між картками — `--space-lg` (24 px).

## 4. Специфікація компонентів

Що саме з токенів застосовано до кожного елемента макета. Значення в дужках —
у пікселях, щоб їх можна було звірити зі знімком. Розміри без токена
записані числом.

Контейнер — `max-width` `--container-max` (1200) плюс бічні відступи
`--container-gutter` з кожного боку.

### Загальне

| Елемент | Значення |
| --- | --- |
| `body` | фон `--color-background`, текст `--color-text`, `--font-size-base`, `--line-height-base` |
| `h1`–`h3` | `--font-weight-bold`, `--line-height-tight`, letter-spacing −0.02em (у `h3` −0.01em) |
| Секція | padding зверху й знизу `--space-section`; фон «Як це працює» — `--color-surface-alt` |
| Заголовок секції | до опису `--space-sm` (12), від опису до вмісту `--space-2xl` (48); опис `--font-size-lead`, `--color-text-muted` |
| Фокус | outline 3 px `--color-focus`, offset 3 px, радіус 4 px |

### Header

| Елемент | Значення |
| --- | --- |
| Header | висота `--header-height` (72), фон `--color-surface`, знизу рамка 1 px `--color-border` |
| Логотип | знак 40 × 40, поруч текст «Courtly» 22 px (1.375rem) `--font-weight-bold`; між ними `--space-xs` (8) |
| Навігація, ≥ 1024 px | посилання `--font-size-base`, `--font-weight-semibold`, `--color-text`, hover `--color-primary`; між посиланнями `--space-xl` (32), від навігації до кнопки `--space-2xl` (48) |
| Кнопка «Меню», < 1024 px | висота 44 px, padding 0 `--space-md` (16), рамка 1 px `--color-border`, `--radius-md`; іконка — три лінії 18 × 2 px з кроком 6 px, у відкритому стані хрестик |
| Панель меню | під header на всю ширину: фон `--color-surface`, `--shadow-md`, padding `--space-lg` (24) зверху й `--space-xl` (32) знизу |
| Пункт меню | 17 px (1.0625rem) `--font-weight-semibold`, padding `--space-sm` (12) по вертикалі, знизу роздільник 1 px `--color-border`; «Забронювати» — на всю ширину, `--space-lg` (24) від списку |

### Hero

| Елемент | Значення |
| --- | --- |
| Секція | фон `--color-background` з легким лаймовим світінням праворуч угорі (`--color-accent`, 18 % непрозорості); padding-top `--space-2xl` (48), з 1024 px `--space-3xl` (64) |
| Сітка | з 1024 px дві рівні колонки з проміжком `--space-3xl` (64); нижче — одна колонка, проміжок `--space-2xl` (48) |
| Текстовий блок | елементи з інтервалом `--space-lg` (24); опис `--font-size-lead`, `--color-text-muted`, max-width 34rem |
| Кнопка | primary, велика |
| Зображення | `--radius-lg`, `--shadow-md`; 4 : 3 з 1024 px, 16 : 9 нижче |

### Форма пошуку

| Елемент | Значення |
| --- | --- |
| Форма | `--space-2xl` (48) під hero; фон `--color-surface`, рамка 1 px `--color-border`, `--radius-lg`, `--shadow-md`; padding `--space-lg` (24), з 1024 px `--space-lg` / `--space-xl` (24 / 32); проміжок між полями `--space-md` (16) |
| Підпис поля | `--font-size-small`, `--font-weight-semibold`; до поля `--space-2xs` (4) |
| Поле | висота `--control-height` (48), padding 0 `--space-sm` (12), фон `--color-background`, рамка 1 px `--color-border` (hover `--color-text-muted`), `--radius-sm` |
| Кнопка «Знайти» | primary; до 1024 px на всю ширину колонки, з 1024 px — мінімум 160 px |

### Кнопки

Усі кнопки: висота `--control-height` (48), padding 0 `--space-lg` (24),
рамка 2 px, `--radius-md`, `--font-size-base`, `--font-weight-semibold`.
Велика (hero, CTA): висота 56 px, padding 0 `--space-xl` (32), 17 px
(1.0625rem).

| Варіант | Фон / рамка | Текст | Hover | Де |
| --- | --- | --- | --- | --- |
| Primary | `--color-primary` | `--color-surface` | фон `--color-primary-hover` | header, hero, форма, featured card |
| Outline | прозорий, рамка `--color-primary` | `--color-primary` | заливка `--color-primary`, текст `--color-surface` | звичайні картки |
| Accent | `--color-accent` | `--color-dark` | фон `--color-accent-hover` | Final CTA |

### Картка майданчика

```text
Звичайна картка                Featured card на desktop
┌──────────────────────┐       ┌────────────┬──────────────────┐
│ зображення 4 : 3     │       │            │ чип   ★ рейтинг  │
├──────────────────────┤       │ зображення │ назва (h2-розмір)│
│ чип         ★ 4.7    │       │ на всю     │ опис (lead)      │
│ Назва (h3)           │       │ висоту     │ ✓ переваги       │
│ Опис                 │       │            │ вільні слоти     │
│ ──────────────────── │       │            │ ──────────────── │
│ 350 грн/год  [Кнопка]│       │            │ ціна    [Кнопка] │
└──────────────────────┘       └────────────┴──────────────────┘
```

| Елемент | Значення |
| --- | --- |
| Сітка карток | проміжок `--space-lg` (24); картки в рядку однакової висоти |
| Картка | фон `--color-surface`, рамка 1 px `--color-border`, `--radius-lg`, `--shadow-sm`; зображення обрізане по радіусу |
| Зображення | 4 : 3, `object-fit: cover` |
| Текстова частина | padding `--space-lg` (24), елементи з інтервалом `--space-sm` (12) |
| Чип «вид спорту» | padding `--space-2xs` / `--space-sm` (4 / 12), `--radius-pill`, фон `--color-primary-soft`, текст `--color-primary`, `--font-size-xs`, `--font-weight-semibold`; стоїть ліворуч, рейтинг — праворуч |
| Рейтинг | `--font-size-small`, `--font-weight-semibold`; зірка `--color-rating`; «(98 відгуків)» — regular, `--color-text-muted` |
| Опис | `--color-text-muted` |
| Рядок «ціна + кнопка» | притиснутий до низу картки; зверху рамка 1 px `--color-border` і padding-top `--space-md` (16); між ціною й кнопкою `--space-md`, якщо не вміщуються — кнопка переноситься |
| Ціна | сума 20 px (1.25rem) `--font-weight-bold` `--color-text`; «/год» — `--font-size-small`, `--color-text-muted` |
| Кнопка | outline; у featured card — primary |
| Badge «Вибір тижня» | лише featured card, на всіх ширинах: лівий верхній кут зображення з відступом `--space-md` (16); padding 4 / 12, `--radius-pill`, фон `--color-accent`, текст `--color-dark`, `--font-size-xs`, `--font-weight-bold`, великі літери, letter-spacing 0.06em |

**Featured card на desktop** (≥ 1024 px):

| Елемент | Значення |
| --- | --- |
| Компонування | дві колонки 1.15fr / 1fr: зображення на всю висоту картки, текст праворуч |
| Текстова частина | padding `--space-2xl` / `--space-xl` (48 / 32), інтервал `--space-lg` (24), вміст вертикально по центру |
| Назва й опис | назва `--font-size-h2`, опис `--font-size-lead` |
| Переваги | `--font-size-small`, інтервал `--space-2xs` (4); перед кожною ✓ `--color-primary` bold, відступ `--space-xs` (8) |
| Вільні слоти | підпис `--font-size-small` semibold, до списку `--space-xs` (8); слот — padding 4 / 12, рамка 1 px `--color-border`, `--radius-sm`, `--font-size-small` semibold; між слотами `--space-xs` |

На tablet і mobile featured card виглядає як звичайна картка: переваг і слотів
немає, badge залишається.

### Як це працює

| Елемент | Значення |
| --- | --- |
| Сітка | з 1024 px — 3 колонки, нижче — одна; проміжок `--space-lg` (24) |
| Крок | фон `--color-surface`, рамка 1 px `--color-border`, `--radius-lg`, padding `--space-xl` (32), інтервал `--space-sm` (12) |
| Номер | квадрат 56 × 56, `--radius-md`, фон `--color-dark`, цифри `--color-accent` 20 px (1.25rem) bold; до заголовка ще `--space-xs` (8) |
| Текст | `--color-text-muted` |

### Інформаційний блок

| Елемент | Значення |
| --- | --- |
| Сітка | з 768 px дві колонки 1.1fr / 1fr, проміжок `--space-3xl` (64), вертикально по центру; нижче — одна колонка, проміжок `--space-2xl` (48) |
| Текстовий блок | інтервал `--space-lg` (24); текст `--font-size-lead`, `--color-text-muted` |
| Переваги | між перевагами `--space-md` (16); іконка ліворуч, заголовок і текст праворуч з відступом `--space-md`, між заголовком і текстом `--space-2xs` (4) |
| Іконка | коло 40 px, фон `--color-primary-soft`, ✓ `--color-primary` bold |
| Заголовок і текст переваги | заголовок 17 px (1.0625rem); текст `--font-size-small`, `--color-text-muted` |
| Зображення | 4 : 5, `object-fit: cover`, `--radius-lg` |

### Final CTA

| Елемент | Значення |
| --- | --- |
| Блок | усередині контейнера; фон `--color-dark` з лаймовим світінням праворуч угорі (`--color-accent`, 16 %); `--radius-lg`; padding `--space-3xl` / `--space-lg` (64 / 24); усе по центру з інтервалом `--space-lg` (24); під блоком `--space-section` до footer |
| Заголовок | `h2`, `--color-on-dark` |
| Текст | `--font-size-lead`, `--color-on-dark-muted`, max-width 32rem |
| Кнопка | accent, велика; `--color-focus` перевизначено на `--color-accent` |

### Footer

| Елемент | Значення |
| --- | --- |
| Footer | фон `--color-dark`, текст `--color-on-dark-muted`, `--font-size-small`; padding-top `--space-3xl` (64); `--color-focus` перевизначено на `--color-accent` |
| Сітка | 1 колонка → 2 з 640 px → 4 з 1024 px (2fr 1fr 1fr 1fr); проміжок `--space-xl` (32); padding-bottom `--space-2xl` (48) |
| Бренд | логотип як у header, текст `--color-on-dark`; опис max-width 22rem, `--space-md` (16) від логотипа |
| Заголовок колонки | `--font-size-base`, `--font-weight-bold`, `--color-on-dark`; до списку `--space-sm` (12) |
| Посилання | `--color-on-dark-muted`, без підкреслення; hover — `--color-accent` з підкресленням; між пунктами `--space-xs` (8) |
| Соцмережі | в рядок, з переносом: padding 4 / 12, рамка 1 px `--color-on-dark-muted` з 35 % непрозорості, `--radius-pill`; між ними `--space-xs` |
| Copyright | окремий рядок: зверху рамка 1 px (`--color-on-dark-muted`, 20 %), padding `--space-lg` (24) по вертикалі |

## 5. Зображення

| Файл | Розмір | Де | Завантаження |
| --- | --- | --- | --- |
| `hero-1200.webp`, `hero-800.webp` | 1200 × 900, 800 × 600 | hero | `srcset`, `fetchpriority="high"`, без lazy |
| `arena-sport.webp` | 900 × 1200 | featured card | `lazy` |
| `tennis-point.webp`, `riverside-court.webp`, `smash-club.webp`, `city-football.webp`, `active-hall.webp` | 800 × 600 | картки | `lazy` |
| `about.webp` | 960 × 1200 | інформаційний блок | `lazy` |
| `logo-mark.svg` | 40 × 40 | header, footer | `alt=""` — поруч текст «Courtly» |
| `favicon.svg` | — | `<link rel="icon">` | — |
| `og-image.jpg` | 1200 × 630 | `og:image` | абсолютний URL |

Featured card отримала портретне зображення, бо на desktop її зображення
вище, ніж ширше. На tablet і mobile той самий файл обрізається до 4 : 3 через
`object-fit: cover`.

Кожному `<img>` задайте `width` і `height` — браузер зарезервує місце до
завантаження, і сторінка не «стрибне» (CLS). Текст `alt` напишіть самостійно.
