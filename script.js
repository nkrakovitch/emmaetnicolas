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
