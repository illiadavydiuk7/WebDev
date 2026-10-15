/* Courtly Booking — entry point */

import { fetchVenues } from './api.js';
import { renderResults } from './render.js';
import { openBooking } from './booking.js';
import { toISODate } from './format.js';

const form = document.getElementById('search-form');
const results = document.getElementById('results');
const status = document.getElementById('status');

// Venues currently on screen
let venues = [];

/* Mobile menu */

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.getElementById('site-nav');

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  siteNav.classList.toggle('is-open', !isOpen);
});

/* Search */

form.date.value = toISODate(new Date());

function readFilters() {
  return { city: form.city.value, sport: form.sport.value };
}

let searchId = 0;

async function handleSearch(event) {
  event.preventDefault();

  const currentSearchId = ++searchId;
  const filters = readFilters();

  status.textContent = 'Шукаємо…';
  results.setAttribute('aria-busy', 'true');

  const found = await fetchVenues(filters);

  if (currentSearchId !== searchId) return;

  renderResults(results, found);
  venues = found;
  bindBookButtons();

  results.setAttribute('aria-busy', 'false');
  status.textContent = found.length
    ? `Знайдено: ${found.length}`
    : 'Нічого не знайдено';
}

form.addEventListener('submit', handleSearch);

// Status line, announced by screen readers (role="status")
// form.addEventListener('submit', () => {
//   const count = results.children.length;
//   status.textContent = count ? `Знайдено: ${count}` : 'Нічого не знайдено';
// });

/* Booking */

function bindBookButtons() {
  document.querySelectorAll('.venue-card__book').forEach((button) => {
    button.addEventListener('click', () => {
      const venue = venues.find((item) => item.id === button.dataset.id);
      openBooking(venue, form.date.value || toISODate(new Date()));
    });
  });
}

/* Initial state: popular venues */

venues = await fetchVenues({ popular: true });
renderResults(results, venues);
results.setAttribute('aria-busy', 'false');
status.textContent = `Популярні майданчики: ${venues.length}`;
bindBookButtons();
