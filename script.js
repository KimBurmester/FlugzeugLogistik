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

/* ==========================================================================
   Topbar-Höhe als CSS-Variable setzen (behebt Sticky-Gap der Sidebar)
   ========================================================================== */

(function syncTopbarHeight() {
  function update() {
    const topbar = document.querySelector('.topbar');
    if (topbar) {
      document.documentElement.style.setProperty('--topbar-h', topbar.getBoundingClientRect().height + 'px');
    }
  }
  update();
  window.addEventListener('resize', update);
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
   Sidebar-Konfiguration je Tab
   ========================================================================== */

const _i = p => `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

const sidebarConfig = {
  '': {
    sections: [
      {
        label: 'Menü',
        items: [
          { label: 'Dashboard',    icon: _i('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'), active: true },
          { label: 'Sendungen',    icon: _i('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>') },
          { label: 'Aufträge',     icon: _i('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') },
          { label: 'Flotte',       icon: _i('<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>') },
        ]
      },
      {
        label: 'Verwaltung',
        items: [
          { label: 'Kunden',        icon: _i('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>') },
          { label: 'Einstellungen', icon: _i('<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a1 1 0 0 0-1.41 0l-.5.5A7.95 7.95 0 0 0 12 4a8 8 0 1 0 8 8 7.95 7.95 0 0 0-1.43-4.57l.5-.5a1 1 0 0 0 0-1.41z"/>') },
        ]
      }
    ]
  },
  'sites/Artikel.html': {
    sections: [{
      label: 'Artikelverwaltung',
      items: [
        { label: 'Neuen Artikel anlegen', icon: _i('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'), active: true },
        { label: 'Artikeldatenbank',      icon: _i('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>') },
        { label: 'Lager & Standorte',     icon: _i('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') },
        { label: 'Artikelbewegung',       icon: _i('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>') },
      ]
    }]
  },
  'sites/Auftrag.html': {
    sections: [{
      label: 'Auftragsverwaltung',
      items: [
        { label: 'Neuen Auftrag erstellen', icon: _i('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>'), active: true },
        { label: 'Auftragsdatenbank',       icon: _i('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>') },
        { label: 'Bestellung anlegen',      icon: _i('<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>') },
        { label: 'Auftragsübersicht',       icon: _i('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>') },
      ]
    }]
  },
  'sites/Produktion.html': {
    sections: [{
      label: 'Produktionsverwaltung',
      items: [
        { label: 'Neuer Produktionsauftrag', icon: _i('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'), active: true },
        { label: 'Produktionsdatenbank',     icon: _i('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>') },
        { label: 'Produktionsplan',          icon: _i('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>') },
        { label: 'Qualitätssicherung',       icon: _i('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>') },
      ]
    }]
  },
  'sites/Bestellung.html': {
    sections: [{
      label: 'Bestellverwaltung',
      items: [
        { label: 'Neue Bestellung',      icon: _i('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'), active: true },
        { label: 'Bestelldatenbank',     icon: _i('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>') },
        { label: 'Lieferantenübersicht', icon: _i('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>') },
        { label: 'Wareneingänge',        icon: _i('<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>') },
      ]
    }]
  },
  'sites/Instandhaltung.html': {
    sections: [{
      label: 'Instandhaltung',
      items: [
        { label: 'Neue Wartung',       icon: _i('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'), active: true },
        { label: 'Wartungsdatenbank',  icon: _i('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>') },
        { label: 'Geräteübersicht',    icon: _i('<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>') },
        { label: 'Wartungshistorie',   icon: _i('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>') },
      ]
    }]
  }
};

function renderSidebar(src) {
  const nav = document.querySelector('.sidebar-nav');
  if (!nav) return;

  const config = sidebarConfig[src] || sidebarConfig[''];

  nav.innerHTML = config.sections.map((section, i) => `
    <span class="sidebar-section-label"${i > 0 ? ' style="margin-top:16px"' : ''}>${section.label}</span>
    ${section.items.map(item => `
      <a href="#" class="sidebar-item${item.active ? ' active' : ''}">
        ${item.icon} ${item.label}
      </a>
    `).join('')}
  `).join('');

  nav.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        document.querySelector('.sidebar')?.classList.remove('open');
        document.getElementById('sidebarOverlay')?.classList.remove('active');
      }
    });
  });
}

renderSidebar('');

/* ==========================================================================
   Tabs
   ========================================================================== */

document.querySelectorAll('.tabs').forEach(group => {
  const tabs = group.querySelectorAll('[data-tab]');
  const mainContent = document.querySelector('.main-content');
  const dashboardHTML = mainContent ? mainContent.innerHTML : '';

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (!mainContent) return;
      const src = tab.getAttribute('data-tab');

      renderSidebar(src || '');

      if (src) {
        fetch(src)
          .then(r => r.text())
          .then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const main = doc.querySelector('main');
            mainContent.innerHTML = main ? main.innerHTML : '';
          });
      } else {
        mainContent.innerHTML = dashboardHTML;
      }
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


/* ==========================================================================
    Artikel Manager
   ========================================================================== */

const speichernBtn = document.querySelector('.btn.btn-primary');
if (speichernBtn) {
  speichernBtn.addEventListener('click', () => {
    const wert = document.querySelector('#artikelbezeichnung').value;
    console.log(wert);
  });
}








