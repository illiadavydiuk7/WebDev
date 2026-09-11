const themeToggle = document.querySelector('#theme-toggle');
const ideaButton = document.querySelector('#idea-button');
const ideaBox = document.querySelector('#idea-box');
const savedTheme = localStorage.getItem('theme');
const ideas = [
  'Спробуй сьогодні подивитися на звичну річ по-новому.',
  'Запиши одну думку, яка прийшла тобі зовсім випадково.',
  'Зроби маленьку справу, яку давно відкладав.',
];
let ideaIndex = 0;

if (savedTheme === 'dark') {
  document.documentElement.dataset.theme = 'dark';
  themeToggle.textContent = 'Світла тема';
  themeToggle.setAttribute('aria-pressed', 'true');
}

themeToggle.addEventListener('click', () => {
  const isDarkTheme = document.documentElement.dataset.theme === 'dark';

  if (isDarkTheme) {
    document.documentElement.removeAttribute('data-theme');
    themeToggle.textContent = 'Темна тема';
    themeToggle.setAttribute('aria-pressed', 'false');
    localStorage.setItem('theme', 'light');
    return;
  }

  document.documentElement.dataset.theme = 'dark';
  themeToggle.textContent = 'Світла тема';
  themeToggle.setAttribute('aria-pressed', 'true');
  localStorage.setItem('theme', 'dark');
});

ideaButton.addEventListener('click', () => {
  ideaIndex = (ideaIndex + 1) % ideas.length;
  ideaBox.textContent = ideas[ideaIndex];
});
