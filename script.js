const target = new Date('2026-09-18T15:30:00+02:00');
const el = document.getElementById('countdown');

function updateCountdown() {
  const difference = target.getTime() - Date.now();
  if (difference <= 0) {
    el.textContent = 'C’est aujourd’hui !';
    return;
  }
  const days = Math.ceil(difference / 86400000);
  el.textContent = `J-${days} avant le mariage`;
}

updateCountdown();
setInterval(updateCountdown, 3600000);

// --- Jeu des rencontres ---
(() => {
  const form = document.getElementById('match-form');
  if (!form) return;

  const input = document.getElementById('guest-search');
  const suggestions = document.getElementById('guest-suggestions');
  const error = document.getElementById('match-error');
  const stage = document.getElementById('match-stage');
  const pair = document.getElementById('match-pair');
  const mysteryCard = document.getElementById('mystery-card');
  const mysteryName = document.getElementById('mystery-name');
  const reset = document.getElementById('match-reset');
  const submitButton = form.querySelector('button[type="submit"]');
  const matches = Array.isArray(window.WEDDING_MATCHES) ? window.WEDDING_MATCHES : [];

  let activeIndex = -1;
  let visibleGuests = [];
  let chosenGuest = '';

  const normalize = (value) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const lookup = new Map(matches.map(({ guest, match }) => [normalize(guest), { guest, match }]));

  function closeSuggestions() {
    suggestions.hidden = true;
    suggestions.replaceChildren();
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-activedescendant', '');
    activeIndex = -1;
  }

  function choose(name) {
    input.value = name;
    chosenGuest = name;
    error.textContent = '';
    closeSuggestions();
  }

  function renderSuggestions() {
    const query = normalize(input.value);
    chosenGuest = '';
    visibleGuests = matches
      .map(({ guest }) => guest)
      .filter((guest) => !query || normalize(guest).includes(query))
      .slice(0, 8);

    suggestions.replaceChildren();
    activeIndex = -1;

    if (!visibleGuests.length) {
      closeSuggestions();
      return;
    }

    visibleGuests.forEach((guest, index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'guest-suggestion';
      option.id = `guest-option-${index}`;
      option.setAttribute('role', 'option');
      option.textContent = guest;
      option.addEventListener('mousedown', (event) => event.preventDefault());
      option.addEventListener('click', () => choose(guest));
      suggestions.append(option);
    });

    suggestions.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function setActive(index) {
    const options = [...suggestions.querySelectorAll('.guest-suggestion')];
    if (!options.length) return;
    activeIndex = (index + options.length) % options.length;
    options.forEach((option, i) => option.classList.toggle('is-active', i === activeIndex));
    input.setAttribute('aria-activedescendant', options[activeIndex].id);
    options[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  input.addEventListener('input', renderSuggestions);
  input.addEventListener('focus', renderSuggestions);
  input.addEventListener('keydown', (event) => {
    if (suggestions.hidden) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive(activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(activeIndex - 1);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      choose(visibleGuests[activeIndex]);
    } else if (event.key === 'Escape') {
      closeSuggestions();
    }
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.guest-combobox')) closeSuggestions();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const record = lookup.get(normalize(chosenGuest || input.value));

    if (!record) {
      error.textContent = 'Choisis ton nom dans la liste proposée.';
      input.focus();
      renderSuggestions();
      return;
    }

    error.textContent = '';
    closeSuggestions();
    input.disabled = true;
    submitButton.disabled = true;
    stage.classList.add('is-searching');
    pair.hidden = false;
    mysteryCard.hidden = true;
    mysteryCard.classList.remove('is-revealed');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => {
      pair.hidden = true;
      mysteryName.textContent = record.match;
      mysteryCard.hidden = false;
      requestAnimationFrame(() => mysteryCard.classList.add('is-revealed'));
      input.disabled = false;
      submitButton.disabled = false;
    }, reduceMotion ? 20 : 1550);
  });

  reset.addEventListener('click', () => {
    stage.classList.remove('is-searching');
    mysteryCard.classList.remove('is-revealed');
    mysteryCard.hidden = true;
    pair.hidden = false;
    input.value = '';
    chosenGuest = '';
    error.textContent = '';
    input.focus();
  });
})();
