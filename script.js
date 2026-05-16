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

const _ihSidebar = active => [
  { label: 'Neue Wartung',      icon: _i('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),                                                                                                                           ...(active === 'wartung'   ? { active: true } : { page: 'sites/Instandhaltung.html' }) },
  { label: 'Wartungsdatenbank', icon: _i('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'),                                                        ...(active === 'datenbank' ? { active: true } : { page: 'sites/Wartungsdatenbank.html' }) },
  { label: 'Geräteübersicht',   icon: _i('<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>'), ...(active === 'geraete'   ? { active: true } : { page: 'sites/Geraeteuebersicht.html' }) },
  { label: 'Wartungshistorie',  icon: _i('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),                                                                                                                                                                                                                                   ...(active === 'historie'  ? { active: true } : { page: 'sites/Wartungshistorie.html' }) },
];

const _bvSidebar = active => [
  { label: 'Neue Bestellung',      icon: _i('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),                                                                                                         ...(active === 'bestellung'     ? { active: true } : { page: 'sites/Bestellung.html' }) },
  { label: 'Bestelldatenbank',     icon: _i('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'), ...(active === 'datenbank'      ? { active: true } : { page: 'sites/Bestelldatenbank.html' }) },
  { label: 'Lieferantenübersicht', icon: _i('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),                     ...(active === 'lieferanten'    ? { active: true } : { page: 'sites/Lieferanten.html' }) },
  { label: 'Wareneingänge',        icon: _i('<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>'),              ...(active === 'wareneingaenge' ? { active: true } : { page: 'sites/Wareneingaenge.html' }) },
];

const _pvSidebar = active => [
  { label: 'Neuer Produktionsauftrag', icon: _i('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),                                                                                                         ...(active === 'produktion'  ? { active: true } : { page: 'sites/Produktion.html' }) },
  { label: 'Produktionsdatenbank',     icon: _i('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'), ...(active === 'datenbank'   ? { active: true } : { page: 'sites/Produktionsdatenbank.html' }) },
  { label: 'Produktionsplan',          icon: _i('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),              ...(active === 'plan'        ? { active: true } : { page: 'sites/Produktionsplan.html' }) },
  { label: 'Qualitätssicherung',       icon: _i('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'),                                                                                               ...(active === 'qs'          ? { active: true } : { page: 'sites/Qualitaetssicherung.html' }) },
  { label: 'Stückliste',               icon: _i('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'),                                                                  ...(active === 'stueckliste' ? { active: true } : { page: 'sites/Stueckliste.html' }) },
];

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
        { label: 'Neuen Artikel anlegen', icon: _i('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'), active: true, page: 'sites/Artikel.html' },
        { label: 'Artikeldatenbank',      icon: _i('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'), page: 'sites/Artikeldatenbank.html' },
        { label: 'Lager & Standorte',     icon: _i('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'), page: 'sites/LagerStandorte.html' },
        { label: 'Artikelbewegung',       icon: _i('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'), page: 'sites/Artikelbewegung.html' },
      ]
    }]
  },
  'sites/Auftrag.html': {
    sections: [{
      label: 'Auftragsverwaltung',
      items: [
        { label: 'Neuen Auftrag erstellen', icon: _i('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>'), active: true, page: 'sites/Auftrag.html' },
        { label: 'Auftragsdatenbank',       icon: _i('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>'), page: 'sites/Auftragsdatenbank.html' },
      ]
    }]
  },
  'sites/Auftragsdatenbank.html': {
    sections: [{
      label: 'Auftragsverwaltung',
      items: [
        { label: 'Neuen Auftrag erstellen', icon: _i('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>'), page: 'sites/Auftrag.html' },
        { label: 'Auftragsdatenbank',       icon: _i('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>'), active: true },
      ]
    }]
  },
  'sites/Produktion.html':          { sections: [{ label: 'Produktionsverwaltung', items: _pvSidebar('produktion')  }] },
  'sites/Produktionsdatenbank.html':{ sections: [{ label: 'Produktionsverwaltung', items: _pvSidebar('datenbank')   }] },
  'sites/Produktionsplan.html':     { sections: [{ label: 'Produktionsverwaltung', items: _pvSidebar('plan')        }] },
  'sites/Qualitaetssicherung.html': { sections: [{ label: 'Produktionsverwaltung', items: _pvSidebar('qs')          }] },
  'sites/Stueckliste.html':         { sections: [{ label: 'Produktionsverwaltung', items: _pvSidebar('stueckliste') }] },
  'sites/Bestellung.html':        { sections: [{ label: 'Bestellverwaltung', items: _bvSidebar('bestellung')     }] },
  'sites/Bestelldatenbank.html':  { sections: [{ label: 'Bestellverwaltung', items: _bvSidebar('datenbank')      }] },
  'sites/Lieferanten.html':       { sections: [{ label: 'Bestellverwaltung', items: _bvSidebar('lieferanten')    }] },
  'sites/Wareneingaenge.html':    { sections: [{ label: 'Bestellverwaltung', items: _bvSidebar('wareneingaenge') }] },
  'sites/Instandhaltung.html':    { sections: [{ label: 'Instandhaltung', items: _ihSidebar('wartung')   }] },
  'sites/Wartungsdatenbank.html': { sections: [{ label: 'Instandhaltung', items: _ihSidebar('datenbank') }] },
  'sites/Geraeteuebersicht.html': { sections: [{ label: 'Instandhaltung', items: _ihSidebar('geraete')   }] },
  'sites/Wartungshistorie.html':  { sections: [{ label: 'Instandhaltung', items: _ihSidebar('historie')  }] }
};

function renderSidebar(src) {
  const nav = document.querySelector('.sidebar-nav');
  if (!nav) return;

  const config = sidebarConfig[src] || sidebarConfig[''];

  nav.innerHTML = config.sections.map((section) => `
    <span class="sidebar-section-label">${section.label}</span>
    ${section.items.map(item => `
      <a href="#" class="sidebar-item${item.active ? ' active' : ''}"${item.page ? ` data-page="${item.page}"` : ''}>
        ${item.icon} ${item.label}
      </a>
    `).join('')}
  `).join('');

  nav.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.innerWidth <= 768) {
        document.querySelector('.sidebar')?.classList.remove('open');
        document.getElementById('sidebarOverlay')?.classList.remove('active');
      }
      const page = item.getAttribute('data-page');
      if (!page) return;
      const mainContent = document.querySelector('.main-content');
      if (!mainContent) return;
      fetch(page)
        .then(r => r.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const main = doc.querySelector('main');
          mainContent.innerHTML = main ? main.innerHTML : '';
        });
      nav.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

renderSidebar('');

/* ==========================================================================
   data-navigate: Seitennavigation per Button (z. B. in Datenbankseiten)
   ========================================================================== */

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-navigate]');
  if (!btn) return;
  const page   = btn.getAttribute('data-navigate');
  const editId = btn.getAttribute('data-edit-id') || null;
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;
  fetch(page)
    .then(r => r.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const main = doc.querySelector('main');
      mainContent.innerHTML = main ? main.innerHTML : '';
      if (editId) {
        document.dispatchEvent(new CustomEvent('adl:edit-navigate', { detail: { editId } }));
      }
    });
  document.querySelectorAll('.sidebar-item').forEach(i => {
    i.classList.toggle('active', i.getAttribute('data-page') === page);
  });
});

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
   Modal: Neuer Artikel
   ========================================================================== */

(function initModalNeuerArtikel() {
  const overlay = document.getElementById('modalNeuerArtikel');
  if (!overlay) return;

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('input, select, textarea')?.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function resetModal() {
    overlay.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
    overlay.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
  }

  // Event delegation: works even after .main-content is replaced by tab navigation
  document.addEventListener('click', e => {
    if (e.target.closest('[data-action="neuer-artikel"]')) openModal();
  });

  document.getElementById('modalNeuerArtikelClose')?.addEventListener('click', closeModal);

  document.getElementById('modalNeuerArtikelCancel')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  // forms.js liest die Felder synchron – close/reset erst danach als Microtask
  document.getElementById('modalNeuerArtikelSave')?.addEventListener('click', () => {
    queueMicrotask(() => { closeModal(); resetModal(); });
  });

  // Close on backdrop click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) { closeModal(); resetModal(); }
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeModal(); resetModal(); }
  });
})();

/* ==========================================================================
   Modal: Neue Stückliste
   ========================================================================== */

(function initModalNeueStueckliste() {
  const overlay = document.getElementById('modalNeueStueckliste');
  if (!overlay) return;

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('input, select, textarea')?.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function resetModal() {
    overlay.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
    overlay.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-action="neue-stueckliste"]')) openModal();
  });

  document.getElementById('modalNeueStuecklisteClose')?.addEventListener('click', closeModal);

  document.getElementById('modalNeueStuecklisteCancel')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  document.getElementById('modalNeueStuecklisteSave')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { closeModal(); resetModal(); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeModal(); resetModal(); }
  });
})();

/* ==========================================================================
   Modal: Position hinzufügen
   ========================================================================== */

(function initModalPositionHinzufuegen() {
  const overlay = document.getElementById('modalPositionHinzufuegen');
  if (!overlay) return;

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('input, select, textarea')?.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function resetModal() {
    overlay.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
    overlay.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-action="position-hinzufuegen"]')) openModal();
  });

  document.getElementById('modalPositionClose')?.addEventListener('click', closeModal);

  document.getElementById('modalPositionCancel')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  document.getElementById('modalPositionSave')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { closeModal(); resetModal(); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeModal(); resetModal(); }
  });
})();

/* ==========================================================================
   Modal: Neue Zuweisung (Produktionsplan)
   ========================================================================== */

(function initModalNeueZuweisung() {
  const overlay = document.getElementById('modalNeueZuweisung');
  if (!overlay) return;

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('input, select, textarea')?.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function resetModal() {
    overlay.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
    overlay.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-action="neue-zuweisung"]')) openModal();
  });

  document.getElementById('modalNeueZuweisungClose')?.addEventListener('click', closeModal);

  document.getElementById('modalNeueZuweisungCancel')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  document.getElementById('modalNeueZuweisungSave')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { closeModal(); resetModal(); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeModal(); resetModal(); }
  });
})();

/* ==========================================================================
   Modal: Neuer Prüfbericht (Qualitätssicherung)
   ========================================================================== */

(function initModalNeuerPruefbericht() {
  const overlay = document.getElementById('modalNeuerPruefbericht');
  if (!overlay) return;

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('input, select, textarea')?.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function resetModal() {
    overlay.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
    overlay.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-action="neuer-pruefbericht"]')) openModal();
  });

  document.getElementById('modalNeuerPruefberichtClose')?.addEventListener('click', closeModal);

  document.getElementById('modalNeuerPruefberichtCancel')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  document.getElementById('modalNeuerPruefberichtSave')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { closeModal(); resetModal(); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeModal(); resetModal(); }
  });
})();

/* ==========================================================================
   Modal: Neues Gerät (Instandhaltung – Geräteübersicht)
   ========================================================================== */

(function initModalNeuesGeraet() {
  const overlay = document.getElementById('modalNeuesGeraet');
  if (!overlay) return;

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('input, select, textarea')?.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function resetModal() {
    overlay.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
    overlay.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-action="neues-geraet"]')) openModal();
  });

  document.getElementById('modalNeuesGeraetClose')?.addEventListener('click', closeModal);

  document.getElementById('modalNeuesGeraetCancel')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  document.getElementById('modalNeuesGeraetSave')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { closeModal(); resetModal(); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeModal(); resetModal(); }
  });
})();

/* ==========================================================================
   Modal: Wartung – Material / Ersatzteil hinzufügen
   ========================================================================== */

(function initModalWartungMaterial() {
  const overlay = document.getElementById('modalWartungMaterial');
  if (!overlay) return;

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('input, select, textarea')?.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function resetModal() {
    overlay.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
    overlay.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-action="wartung-material"]')) openModal();
  });

  document.getElementById('modalWartungMaterialClose')?.addEventListener('click', closeModal);

  document.getElementById('modalWartungMaterialCancel')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  document.getElementById('modalWartungMaterialSave')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { closeModal(); resetModal(); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeModal(); resetModal(); }
  });
})();

/* ==========================================================================
   Modal: Bestellung – Position hinzufügen
   ========================================================================== */

(function initModalBestellungPosition() {
  const overlay = document.getElementById('modalBestellungPosition');
  if (!overlay) return;

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('input, select, textarea')?.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function resetModal() {
    overlay.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
    overlay.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-action="bestellung-position"]')) openModal();
  });

  document.getElementById('modalBestellungPositionClose')?.addEventListener('click', closeModal);

  document.getElementById('modalBestellungPositionCancel')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  document.getElementById('modalBestellungPositionSave')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { closeModal(); resetModal(); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeModal(); resetModal(); }
  });
})();

/* ==========================================================================
   Modal: Neuer Lieferant
   ========================================================================== */

(function initModalNeuerLieferant() {
  const overlay = document.getElementById('modalNeuerLieferant');
  if (!overlay) return;

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('input, select, textarea')?.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function resetModal() {
    overlay.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
    overlay.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-action="neuer-lieferant"]')) openModal();
  });

  document.getElementById('modalNeuerLieferantClose')?.addEventListener('click', closeModal);

  document.getElementById('modalNeuerLieferantCancel')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  document.getElementById('modalNeuerLieferantSave')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { closeModal(); resetModal(); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeModal(); resetModal(); }
  });
})();

/* ==========================================================================
   Modal: Wareneingang erfassen
   ========================================================================== */

(function initModalWareneingang() {
  const overlay = document.getElementById('modalWareneingang');
  if (!overlay) return;

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('input, select, textarea')?.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function resetModal() {
    overlay.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
    overlay.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-action="wareneingang-erfassen"]')) openModal();
  });

  document.getElementById('modalWareneingangClose')?.addEventListener('click', closeModal);

  document.getElementById('modalWareneingangCancel')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  document.getElementById('modalWareneingangSave')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { closeModal(); resetModal(); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeModal(); resetModal(); }
  });
})();

/* ==========================================================================
   LagerStandorte: Lagerplatz Generator (Event-Delegation für SPA)
   ========================================================================== */

document.addEventListener('click', e => {
  if (e.target.closest('#btnGenerieren')) {
    const pad = (n, len) => String(n).padStart(len, '0');
    const praefix = document.getElementById('genPraefix')?.value.trim() || 'LGR';
    const regale  = parseInt(document.getElementById('genRegale')?.value)  || 0;
    const faecher = parseInt(document.getElementById('genFaecher')?.value) || 0;
    const ebenen  = parseInt(document.getElementById('genEbenen')?.value)  || 0;
    const vorschau = document.getElementById('generatorVorschau');
    if (!vorschau) return;

    if (!regale || !faecher || !ebenen) {
      vorschau.textContent = 'Bitte Regalanzahl, Fächer und Ebenen angeben.';
      return;
    }

    const ids = [];
    for (let r = 1; r <= regale; r++)
      for (let f = 1; f <= faecher; f++)
        for (let ev = 1; ev <= ebenen; ev++)
          ids.push(`${praefix}-R${pad(r,2)}-F${pad(f,2)}-E${pad(ev,2)}`);

    vorschau.textContent = `${ids.length} Lagerplätze generiert:\n\n` + ids.join('\n');
    const btnU = document.getElementById('btnUebernehmen');
    if (btnU) btnU.disabled = false;
  }

  if (e.target.closest('#btnGeneratorReset')) {
    ['genLager','genHalle','genPraefix','genRegale','genFaecher','genEbenen'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else el.value = '';
    });
    const vorschau = document.getElementById('generatorVorschau');
    if (vorschau) vorschau.textContent = 'Einstellungen wählen und auf „Generieren" klicken…';
    const btnU = document.getElementById('btnUebernehmen');
    if (btnU) btnU.disabled = true;
  }
});









