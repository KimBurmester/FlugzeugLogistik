/* ==========================================================================
   ADL – localStorage CRUD-Controller
   Steuert sämtliche Lese- und Schreibzugriffe auf den localStorage.
   Namespace: adl_*   |   Zugriff: window.ADLStorage

   Operatoren spiegeln server.js (Express/SQLite):
     GET    /store        → ADLStorage.getAll(store)
     GET    /store/:id    → ADLStorage.getById(store, id)
     POST   /store        → ADLStorage.create(store, data)
     PUT    /store/:id    → ADLStorage.update(store, id, changes)
     DELETE /store/:id    → ADLStorage.delete(store, id)
   ========================================================================== */

(function (global) {
  'use strict';

  const PREFIX = 'adl_';

  /* ---- Interne I/O-Hilfsfunktionen ------------------------------------ */

  function read(name) {
    try { return JSON.parse(localStorage.getItem(PREFIX + name)) || []; }
    catch { return []; }
  }

  function write(name, data) {
    try {
      localStorage.setItem(PREFIX + name, JSON.stringify(data));
    } catch (e) {
      console.warn('[ADLStorage] Schreibfehler (localStorage voll?):', e);
    }
  }

  function newId() {
    return Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }

  /* Feuert ein CustomEvent, damit andere Module auf Änderungen reagieren können.
     Beispiel: document.addEventListener('adl:change', e => console.log(e.detail)) */
  function emit(store, action, record) {
    document.dispatchEvent(
      new CustomEvent('adl:change', { detail: { store, action, record } })
    );
  }

  /* ---- CRUD-Operatoren ------------------------------------------------- */

  const ADLStorage = {

    /* GET /store ---------------------------------------------------------- */
    getAll(store) {
      return read(store);
    },

    /* GET /store/:id ------------------------------------------------------ */
    getById(store, id) {
      return read(store).find(r => r.id === id) ?? null;
    },

    /* GET /store?field=value (serverseitig: WHERE field = value) ---------- */
    findBy(store, field, value) {
      return read(store).filter(r => r[field] === value);
    },

    /* POST /store --------------------------------------------------------- */
    create(store, data) {
      const rows   = read(store);
      const record = { id: newId(), erstelltAm: new Date().toISOString(), ...data };
      rows.push(record);
      write(store, rows);
      emit(store, 'create', record);
      return record;
    },

    /* PUT /store/:id ------------------------------------------------------ */
    update(store, id, changes) {
      const rows = read(store);
      const idx  = rows.findIndex(r => r.id === id);
      if (idx === -1) return null;
      rows[idx] = { ...rows[idx], ...changes, geaendertAm: new Date().toISOString() };
      write(store, rows);
      emit(store, 'update', rows[idx]);
      return rows[idx];
    },

    /* DELETE /store/:id --------------------------------------------------- */
    delete(store, id) {
      const rows   = read(store);
      const record = rows.find(r => r.id === id);
      if (!record) return false;
      write(store, rows.filter(r => r.id !== id));
      emit(store, 'delete', record);
      return true;
    },

    /* Alle Einträge eines Stores löschen (analog: DELETE /store) ---------- */
    clear(store) {
      write(store, []);
      emit(store, 'clear', null);
    },

    /* ---- Hilfsfunktionen ------------------------------------------------ */

    /* Laufende Nummer generieren: PREFIX-YYYY-NNNN
       field: das Feld, in dem die Nummer gespeichert ist (Standard: 'nr') */
    nextNr(store, prefix, field = 'nr') {
      const year = new Date().getFullYear();
      const nums = read(store)
        .map(r => parseInt((r[field] || '').split('-').pop()))
        .filter(n => !isNaN(n));
      const next = nums.length ? Math.max(...nums) + 1 : 1;
      return `${prefix}-${year}-${String(next).padStart(4, '0')}`;
    },

    /* Alle aktiven Store-Namen unter dem Namespace auflisten */
    listStores() {
      return Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .map(k => k.slice(PREFIX.length));
    },

    /* Anzahl der Einträge in einem Store */
    count(store) {
      return read(store).length;
    },

    /* Einen Store als JSON-Objekt exportieren (z.B. für Debug oder Download) */
    exportStore(store) {
      return { store, exportedAt: new Date().toISOString(), data: read(store) };
    },

    /* Einen Store vollständig überschreiben (z.B. beim Import) */
    importStore(store, data) {
      if (!Array.isArray(data)) throw new TypeError('[ADLStorage] importStore: data muss ein Array sein.');
      write(store, data);
      emit(store, 'import', null);
    },
  };

  global.ADLStorage = ADLStorage;

})(window);
