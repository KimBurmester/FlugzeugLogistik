/* ==========================================================================
   Theme toggle (Light / Dark)
   - Speichert Auswahl in localStorage
   - Folgt initial der OS-Präferenz, wenn nichts gespeichert ist
   ========================================================================== */

(function initTheme() {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initial);
})();

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

/* ==========================================================================
   Switches (Toggle)
   ========================================================================== */

document.querySelectorAll('.switch-row:not(.disabled)').forEach(row => {
  row.addEventListener('click', e => {
    e.preventDefault();
    const sw = row.querySelector('.switch:not(.disabled)');
    if (sw) sw.classList.toggle('on');
  });
});

/* ==========================================================================
   Sliders mit Live-Wert-Anzeige
   ========================================================================== */

document.querySelectorAll('input[type="range"]').forEach(slider => {
  const out = document.getElementById(slider.id + '-out');
  if (!out) return;
  slider.addEventListener('input', () => {
    out.textContent = slider.value;
  });
});

/* ==========================================================================
   Segmented control
   ========================================================================== */

document.querySelectorAll('.segmented').forEach(group => {
  const buttons = group.querySelectorAll('[data-seg]');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

/* ==========================================================================
   Tabs
   ========================================================================== */

document.querySelectorAll('.tabs').forEach(group => {
  const tabs = group.querySelectorAll('[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
});

/* ==========================================================================
   Sidebar mobile toggle
   ========================================================================== */

(function initSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!toggle || !sidebar || !overlay) return;

  function open() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
  }
  function close() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  }

  toggle.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
  overlay.addEventListener('click', close);

  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => { if (window.innerWidth <= 768) close(); });
  });
})();

/* ==========================================================================
   Chip remove
   ========================================================================== */

document.querySelectorAll('.chip-x').forEach(x => {
  x.addEventListener('click', e => {
    e.stopPropagation();
    const chip = x.closest('.chip');
    if (chip) chip.remove();
  });
});