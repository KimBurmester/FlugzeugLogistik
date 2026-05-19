/* ==========================================================================
   ADL – Form Bindings & Table Renderers
   Verknüpft alle Modal- und Seitenformulare mit ADLStore.
   Befüllt Listentabellen dynamisch aus dem Store.
   ========================================================================== */

(function () {
  'use strict';

  /* ================================================================
     Hilfsfunktionen
     ================================================================ */

  const val  = id => (document.getElementById(id)?.value ?? '').trim();
  const sval = id => {
    const el = document.getElementById(id);
    return el ? el.options[el.selectedIndex]?.value ?? el.value ?? '' : '';
  };

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function formatDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  function formatEuro(n) {
    if (n == null || n === '') return '—';
    return Number(n).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function badge(status) {
    const map = {
      'Aktiv':'success','Abgeschlossen':'success','Abgeschlossen (i.O.)':'success','Erfolgreich':'success','Sehr gut':'success','Neuanlage':'success','Wareneingang':'success',
      'In Lieferung':'warning','In Arbeit':'warning','In Prüfung':'warning','In Wartung':'warning','Nacharbeit':'warning','Befriedigend':'warning','Hoch':'warning','Auslagerung':'warning',
      'Offen':'info','Geplant':'info','Erwartet':'info','Gut':'info','Normal':'info','Einlagerung':'info',
      'Abgelehnt (n.i.O.)':'danger','Defekt':'danger','Gesperrt':'danger','Dringend':'danger','Notfall':'danger','Nicht abgeschlossen':'danger','Versand':'danger','Gelöscht':'danger','Löschung':'danger',
      'Umlagerung':'purple',
      'Niedrig':'secondary',
      'Frei':'success','Belegt':'warning','In Planung':'info','Inaktiv':'secondary',
      'Neu':'info','In Bearbeitung':'warning','Storniert':'danger','Kritisch':'danger',
      'Laufend':'info','Verzögert':'danger','Planung':'purple','Pausiert':'secondary',
    };
    const cls = map[status] || 'info';
    return `<span class="badge badge-${cls}"><span class="dot"></span>${escHtml(status)}</span>`;
  }

  function escHtml(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  const EDIT_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;

  function editBtn(page) {
    return `<button class="btn btn-sm btn-ghost" data-navigate="${page}">${EDIT_SVG}</button>`;
  }

  const DELETE_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;

  function deleteBtn(store, id, label) {
    return `<button class="btn btn-sm btn-ghost" style="color:var(--danger-text)" data-delete-id="${escHtml(String(id))}" data-delete-store="${escHtml(store)}" data-delete-label="${escHtml(String(label))}">${DELETE_SVG}</button>`;
  }

  function fillArtikelForm(mc, a) {
    const set = (id, v) => { const el = mc.querySelector('#' + id); if (el) el.value = v ?? ''; };
    const sel = (id, v) => {
      const el = mc.querySelector('#' + id);
      if (!el || v == null) return;
      const opt = [...el.options].find(o => o.text === v || o.value === v);
      if (opt) el.value = opt.value;
    };
    set('artikelbezeichnung',  a.bezeichnung);
    set('artikelnummer',       a.artikelnummer);
    sel('warengruppe',         a.warengruppe);
    sel('artikelstatus',       a.status);
    sel('einheit',             a.einheit);
    set('charge',              a.charge);
    set('seriennummer',        a.seriennr);
    set('maschinennummer',     a.maschinennr);
    set('bestand',             a.bestand);
    set('mindestbestand',      a.mindestbestand);
    set('meldebestand',        a.meldebestand);
    sel('lagerort',            a.lagerort);
    set('laenge',              a.laenge);
    set('breite',              a.breite);
    set('hoehe',               a.hoehe);
    set('gewicht',             a.gewicht);
    sel('verpackungseinheit',  a.verpackungseinheit);
    set('mengeProEinheit',     a.mengeProEinheit);
    sel('lieferant',           a.lieferant);
    set('einkaufspreis',       a.einkaufspreis);
    set('mindestbestellmenge', a.mindestbestellmenge);
    set('verkaufspreis',       a.verkaufspreis);
    sel('steuersatz',          a.steuersatz);
    set('zolltarifnummer',     a.zolltarifnummer);
    sel('gefahrgut',           a.gefahrgut);
    sel('herkunftsland',       a.herkunftsland);
    set('barcode',             a.barcode);
    set('beschreibung',        a.beschreibung);
  }

  /* ---- Toast-Benachrichtigung --------------------------------------- */

  function toast(msg, type = 'success') {
    let container = document.getElementById('adl-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'adl-toast-container';
      container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
      document.body.appendChild(container);
    }
    const colors = { success:'var(--success-text)', danger:'var(--danger-text)', info:'var(--info-text)' };
    const t = document.createElement('div');
    t.style.cssText = `
      background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;
      padding:10px 16px;font-size:13px;color:${colors[type] || colors.success};
      box-shadow:0 4px 16px rgba(0,0,0,.15);min-width:220px;max-width:340px;
      animation:adl-slide-in .2s ease;
    `;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3000);
  }

  /* ---- CSS für Toast-Animation -------------------------------------- */
  const style = document.createElement('style');
  style.textContent = `@keyframes adl-slide-in{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}`;
  document.head.appendChild(style);

  /* ---- CSS für Dashboard-Widgets ------------------------------------ */
  const dbStyle = document.createElement('style');
  dbStyle.textContent = `
    .db-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px}
    .db-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:16px}
    @container (max-width:1499px){.db-grid-3{grid-template-columns:repeat(2,1fr)}}
    @container (max-width:1139px){.db-grid-3,.db-grid-2{grid-template-columns:1fr}}
    .db-card{background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;padding:16px 18px}
    .db-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
    .db-card-head>span{font-size:12px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.5px}
    .db-kpi-row{display:flex;gap:8px;margin-bottom:12px}
    .db-kpi{flex:1;background:var(--bg-primary);border:1px solid var(--border);border-radius:7px;padding:8px 10px}
    .db-kpi-label{font-size:10px;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.3px;margin-bottom:2px}
    .db-kpi-value{font-size:22px;font-weight:700;color:var(--text-primary)}
    .db-kpi.db-kpi-success .db-kpi-value{color:var(--success-text)}
    .db-kpi.db-kpi-info    .db-kpi-value{color:var(--info-text)}
    .db-kpi.db-kpi-warn    .db-kpi-value{color:var(--warning-text)}
    .db-kpi.db-kpi-danger  .db-kpi-value{color:var(--danger-text)}
    .db-divider{border:none;border-top:1px solid var(--border);margin:0 0 10px}
    .db-list{display:flex;flex-direction:column}
    .db-list-item{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:12.5px}
    .db-list-item:last-child{border-bottom:none;padding-bottom:0}
    .db-list-nr{font-size:11px;color:var(--text-tertiary);min-width:110px;flex-shrink:0;font-family:var(--font-mono,monospace)}
    .db-list-label{flex:1;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
    .db-empty{font-size:12px;color:var(--text-tertiary);text-align:center;padding:14px 0}
  `;
  document.head.appendChild(dbStyle);

  /* ---- Temp-Puffer für Positionen ----------------------------------- */
  const tempPositionen = { bestellung: [], wartung: [], stueckliste: [] };

  /* ================================================================
     Modal-Formular-Bindungen
     ================================================================ */

  document.addEventListener('DOMContentLoaded', () => {
    refreshLagerortSelects();

    /* -- Neuer Artikel -------------------------------------------- */
    document.getElementById('modalNeuerArtikelSave')?.addEventListener('click', () => {
      const bezeichnung = val('m-artikelbezeichnung');
      if (!bezeichnung) { toast('Bitte Artikelbezeichnung angeben.', 'danger'); return; }
      const artikelnummer = val('m-artikelnummer');
      const lagerort      = val('m-lagerort');
      ADLStore.artikel.add({
        nr:             ADLStore.artikel.nextNr('ART'),
        bezeichnung,
        artikelnummer,
        warengruppe:    val('m-warengruppe'),
        status:         val('m-artikelstatus'),
        einheit:        val('m-einheit'),
        charge:         val('m-charge'),
        seriennr:       val('m-seriennummer'),
        maschinennr:    val('m-maschinennummer'),
        bestand:        val('m-bestand'),
        mindestbestand: val('m-mindestbestand'),
        meldebestand:   val('m-meldebestand'),
        lagerort,
        einkaufspreis:  val('m-einkaufspreis'),
        verkaufspreis:  val('m-verkaufspreis'),
        beschreibung:   val('m-beschreibung'),
      });
      ADLStore.bewegungen.add({
        nr:          ADLStore.bewegungen.nextNr('BWG'),
        artikelnummer,
        bezeichnung,
        seriennr:    val('m-seriennummer'),
        typ:         'Neuanlage',
        von:         '—',
        nach:        lagerort || 'Lager',
        benutzer:    'System',
        status:      'Abgeschlossen',
      });
      toast(`Artikel „${bezeichnung}" gespeichert.`);
    });

    /* -- Neue Stückliste ------------------------------------------ */
    document.getElementById('modalNeueStuecklisteSave')?.addEventListener('click', () => {
      const bezeichnung = val('ms-produktname') || val('ms-bomNummer');
      if (!bezeichnung) { toast('Bitte Produktname angeben.', 'danger'); return; }
      ADLStore.stuecklisten.add({
        nr:          ADLStore.stuecklisten.nextNr('STL'),
        bomNummer:   val('ms-bomNummer'),
        produktname: val('ms-produktname'),
        artikelnummer:val('ms-artikelnummer'),
        version:     val('ms-version'),
        status:      val('ms-status'),
        gueltigAb:   val('ms-gueltigAb'),
        gueltigBis:  val('ms-gueltigBis'),
        ersteller:   val('ms-ersteller'),
        positionen:  [...tempPositionen.stueckliste],
      });
      tempPositionen.stueckliste = [];
      toast(`Stückliste „${bezeichnung}" gespeichert.`);
    });

    /* -- Stückliste: Position hinzufügen -------------------------- */
    document.getElementById('modalPositionSave')?.addEventListener('click', () => {
      const artikelnummer = val('mp-artikelnummer');
      const bezeichnung   = val('mp-bezeichnung');
      if (!bezeichnung) { toast('Bitte Bezeichnung angeben.', 'danger'); return; }
      tempPositionen.stueckliste.push({
        pos:          tempPositionen.stueckliste.length + 1,
        artikelnummer, bezeichnung,
        menge:        val('mp-menge'),
        einheit:      val('mp-einheit'),
        ebene:        val('mp-ebene'),
        lagerort:     val('mp-lagerort'),
        kommentar:    val('mp-kommentar'),
      });
      toast(`Position „${bezeichnung}" hinzugefügt.`);
    });

    /* -- Neue Zuweisung (Produktionsplan) ------------------------- */
    document.getElementById('modalNeueZuweisungSave')?.addEventListener('click', () => {
      const produkt = val('mz-produkt') || val('mz-auftrag');
      if (!produkt) { toast('Bitte Auftrag / Produkt angeben.', 'danger'); return; }
      ADLStore.zuweisungen.add({
        nr:          ADLStore.zuweisungen.nextNr('ZUW'),
        auftrag:     val('mz-auftrag'),
        produkt:     val('mz-produkt'),
        halle:       val('mz-halle'),
        linie:       val('mz-linie'),
        takt:        val('mz-takt'),
        mitarbeiter: val('mz-mitarbeiter'),
        schritt:     val('mz-schritt'),
        maschine:    val('mz-maschine'),
        start:       val('mz-start'),
        ende:        val('mz-ende'),
        status:      'Geplant',
      });
      toast(`Zuweisung für „${produkt}" gespeichert.`);
    });

    /* -- Neuer Prüfbericht (QS) ----------------------------------- */
    document.getElementById('modalNeuerPruefberichtSave')?.addEventListener('click', () => {
      const artikel = val('qm-artikel');
      if (!artikel) { toast('Bitte Artikel angeben.', 'danger'); return; }
      ADLStore.qualitaetspruefungen.add({
        nr:               ADLStore.qualitaetspruefungen.nextNr('QS'),
        artikel,
        artikelnr:        val('qm-artikelnr'),
        seriennr:         val('qm-seriennr'),
        auftrag:          val('qm-auftrag'),
        datum:            val('qm-datum'),
        pruefer:          val('qm-pruefer'),
        pruefart:         val('qm-pruefart'),
        pruefmittel:      val('qm-pruefmittel'),
        pruefmittelnr:    val('qm-pruefmittelnr'),
        kalibrierung:     val('qm-kalibrierung'),
        ergebnis:         val('qm-ergebnis'),
        fehlerklasse:     val('qm-fehlerklasse'),
        abweichung:       val('qm-abweichung'),
        fehlerbeschreibung:val('qm-fehlerbeschreibung'),
        massnahme:        val('qm-massnahme'),
        verantwortlicher: val('qm-verantwortlicher'),
        faelligkeit:      val('qm-faelligkeit'),
        referenz:         val('qm-referenz'),
        bemerkungen:      val('qm-bemerkungen'),
      });
      toast(`Prüfbericht für „${artikel}" gespeichert.`);
    });

    /* -- Bestellung: Position hinzufügen -------------------------- */
    document.getElementById('modalBestellungPositionSave')?.addEventListener('click', () => {
      const bezeichnung = val('bp-bezeichnung');
      if (!bezeichnung) { toast('Bitte Bezeichnung angeben.', 'danger'); return; }
      const menge       = parseFloat(val('bp-menge')) || 0;
      const einzelpreis = parseFloat(val('bp-einzelpreis')) || 0;
      tempPositionen.bestellung.push({
        pos:          tempPositionen.bestellung.length + 1,
        artikelnummer:val('bp-artikelnummer'),
        bezeichnung,  menge,
        einheit:      val('bp-einheit'),
        einzelpreis,
        gesamtpreis:  menge * einzelpreis,
        lagerort:     val('bp-lagerort'),
        lieferdatum:  val('bp-lieferdatum'),
        bemerkung:    val('bp-bemerkung'),
      });
      toast(`Position „${bezeichnung}" hinzugefügt.`);
    });

    /* -- Neuer Lieferant ------------------------------------------ */
    document.getElementById('modalNeuerLieferantSave')?.addEventListener('click', () => {
      const name = val('lf-firmenname');
      if (!name) { toast('Bitte Firmennamen angeben.', 'danger'); return; }
      ADLStore.lieferanten.add({
        nr:          val('lf-lieferantennr') || ADLStore.lieferanten.nextNr('LFR'),
        name,
        warengruppe: val('lf-warengruppe'),
        status:      val('lf-status'),
        kontaktperson:val('lf-kontaktperson'),
        email:       val('lf-email'),
        telefon:     val('lf-telefon'),
        website:     val('lf-website'),
        strasse:     val('lf-strasse'),
        plz:         val('lf-plz'),
        ort:         val('lf-ort'),
        land:        val('lf-land'),
        zahlungsziel:val('lf-zahlungsziel'),
        skonto:      val('lf-skonto'),
        waehrung:    val('lf-waehrung'),
        mindestbestellwert:val('lf-mindestbestellwert'),
      });
      toast(`Lieferant „${name}" gespeichert.`);
    });

    /* -- Wareneingang erfassen ------------------------------------ */
    document.getElementById('modalWareneingangSave')?.addEventListener('click', () => {
      const artikel = val('we-artikel');
      if (!artikel) { toast('Bitte Artikel angeben.', 'danger'); return; }
      ADLStore.wareneingaenge.add({
        nr:             ADLStore.wareneingaenge.nextNr('WE'),
        bestellnr:      val('we-bestellnr'),
        lieferant:      val('we-lieferant'),
        lieferschein:   val('we-lieferschein'),
        datum:          val('we-datum'),
        artikel,
        mengeBestellt:  val('we-menge-bestellt'),
        mengeGeliefert: val('we-menge-geliefert'),
        einheit:        val('we-einheit'),
        lagerort:       val('we-lagerort'),
        charge:         val('we-charge'),
        status:         val('we-pruefstatus') || 'In Prüfung',
        bemerkung:      val('we-bemerkung'),
      });
      toast(`Wareneingang für „${artikel}" erfasst.`);
    });

    /* -- Neues Gerät ---------------------------------------------- */
    document.getElementById('modalNeuesGeraetSave')?.addEventListener('click', () => {
      const bezeichnung = val('ng-bezeichnung');
      if (!bezeichnung) { toast('Bitte Bezeichnung angeben.', 'danger'); return; }
      ADLStore.geraete.add({
        nr:                   val('ng-geraetennr') || ADLStore.geraete.nextNr('GRT'),
        bezeichnung,
        kategorie:            val('ng-kategorie'),
        status:               val('ng-status'),
        halle:                val('ng-halle'),
        standort:             val('ng-standort'),
        kostenstelle:         val('ng-kostenstelle'),
        verantwortlicher:     val('ng-verantwortlicher'),
        hersteller:           val('ng-hersteller'),
        modell:               val('ng-modell'),
        seriennr:             val('ng-seriennr'),
        baujahr:              val('ng-baujahr'),
        tragfaehigkeit:       val('ng-tragfaehigkeit'),
        tragfaehigkeitEinheit:val('ng-tragfaehigkeit-einheit'),
        hubhoehe:             val('ng-hubhoehe'),
        antrieb:              val('ng-antrieb'),
        bemerkung:            val('ng-bemerkung'),
        wartungsintervall:    val('ng-intervall'),
        naechsterService:     val('ng-naechster-service'),
        pruefpflicht:         val('ng-pruefpflicht'),
        betriebsstunden:      val('ng-betriebsstunden'),
      });
      toast(`Gerät „${bezeichnung}" gespeichert.`);
    });

    /* -- Wartung: Material hinzufügen ----------------------------- */
    document.getElementById('modalWartungMaterialSave')?.addEventListener('click', () => {
      const bezeichnung = val('wm-bezeichnung');
      if (!bezeichnung) { toast('Bitte Bezeichnung angeben.', 'danger'); return; }
      tempPositionen.wartung.push({
        pos:          tempPositionen.wartung.length + 1,
        artikelnummer:val('wm-artikelnummer'),
        bezeichnung,
        menge:        val('wm-menge'),
        einheit:      val('wm-einheit'),
        lagerort:     val('wm-lagerort'),
        lieferant:    val('wm-lieferant'),
        ersatzteilnr: val('wm-ersatzteilnr'),
        bemerkung:    val('wm-bemerkung'),
      });
      toast(`Material „${bezeichnung}" hinzugefügt.`);
    });

  }); // DOMContentLoaded

  /* ================================================================
     Edit-Navigation: Artikel in Formular laden
     ================================================================ */

  document.addEventListener('adl:edit-navigate', ({ detail: { editId } }) => {
    const mc = document.querySelector('.main-content');
    if (!mc || !mc.querySelector('#artikelbezeichnung')) return;
    const artikel = ADLStore.artikel.getById(editId);
    if (!artikel) return;
    mc.dataset.artikelEditId = editId;
    fillArtikelForm(mc, artikel);
  });

  /* ================================================================
     Seitenformulare (dynamisch geladen in .main-content)
     ================================================================ */

  document.addEventListener('click', e => {
    const btn = e.target.closest('.form-actions .btn-primary');
    if (!btn) return;
    const mc = document.querySelector('.main-content');
    if (!mc) return;

    /* Wartungsauftrag (Instandhaltung.html) */
    if (mc.querySelector('#ih-auftragsnr') !== null) {
      const geraet = val('ih-geraet') || val('ih-geraetennr');
      if (!geraet) { toast('Bitte Gerät auswählen.', 'danger'); return; }
      ADLStore.wartungsauftraege.add({
        nr:           val('ih-auftragsnr') || ADLStore.wartungsauftraege.nextNr('IH'),
        wartungsart:  val('ih-wartungsart'),
        prioritaet:   val('ih-prioritaet'),
        status:       val('ih-status'),
        datum:        val('ih-datum'),
        dauer:        val('ih-dauer'),
        techniker:    val('ih-techniker'),
        kostenstelle: val('ih-kostenstelle'),
        geraet,
        geraetekategorie: val('ih-geraetekategorie'),
        halle:        val('ih-halle'),
        standort:     val('ih-standort'),
        geraetennr:   val('ih-geraetennr'),
        seriennr:     val('ih-seriennr'),
        hersteller:   val('ih-hersteller'),
        letzterService:val('ih-letzter-service'),
        beschreibung: val('ih-beschreibung'),
        materialien:  [...tempPositionen.wartung],
      });
      tempPositionen.wartung = [];
      toast('Wartungsauftrag gespeichert.');
      return;
    }

    /* Artikel (Artikel.html) */
    if (mc.querySelector('#artikelbezeichnung') !== null) {
      const bezeichnung   = val('artikelbezeichnung');
      if (!bezeichnung) { toast('Bitte Artikelbezeichnung angeben.', 'danger'); return; }
      const artikelnummer = val('artikelnummer');
      const lagerort      = val('lagerort');
      const artikelData = {
        bezeichnung,
        artikelnummer,
        warengruppe:        sval('warengruppe'),
        status:             sval('artikelstatus'),
        einheit:            sval('einheit'),
        charge:             val('charge'),
        seriennr:           val('seriennummer'),
        maschinennr:        val('maschinennummer'),
        bestand:            val('bestand'),
        mindestbestand:     val('mindestbestand'),
        meldebestand:       val('meldebestand'),
        lagerort,
        laenge:             val('laenge'),
        breite:             val('breite'),
        hoehe:              val('hoehe'),
        gewicht:            val('gewicht'),
        verpackungseinheit: sval('verpackungseinheit'),
        mengeProEinheit:    val('mengeProEinheit'),
        lieferant:          sval('lieferant'),
        einkaufspreis:      val('einkaufspreis'),
        mindestbestellmenge:val('mindestbestellmenge'),
        verkaufspreis:      val('verkaufspreis'),
        steuersatz:         sval('steuersatz'),
        zolltarifnummer:    val('zolltarifnummer'),
        gefahrgut:          sval('gefahrgut'),
        herkunftsland:      sval('herkunftsland'),
        barcode:            val('barcode'),
        beschreibung:       val('beschreibung'),
      };
      const editId = mc.dataset.artikelEditId;
      if (editId) {
        ADLStore.artikel.update(editId, artikelData);
        delete mc.dataset.artikelEditId;
        toast(`Artikel „${bezeichnung}" aktualisiert.`);
      } else {
        ADLStore.artikel.add({ nr: ADLStore.artikel.nextNr('ART'), ...artikelData });
        ADLStore.bewegungen.add({
          nr:          ADLStore.bewegungen.nextNr('BWG'),
          artikelnummer,
          bezeichnung,
          seriennr:    val('seriennummer'),
          typ:         'Neuanlage',
          von:         '—',
          nach:        lagerort || 'Lager',
          benutzer:    'System',
          status:      'Abgeschlossen',
        });
        toast(`Artikel „${bezeichnung}" gespeichert.`);
      }
      mc.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
      mc.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
      return;
    }

    /* Auftrag (Auftrag.html) */
    if (mc.querySelector('#auftrag-projektnr') !== null) {
      const nr = (mc.querySelector('#auftrag-nr')?.value ?? '').trim()
              || ADLStore.auftraege.nextNr('AUF', 'nr');
      ADLStore.auftraege.add({
        nr,
        projektnr:        val('auftrag-projektnr'),
        kunde:            val('auftrag-kunde'),
        typ:              val('auftrag-typ'),
        prioritaet:       val('auftrag-prio'),
        status:           val('auftrag-status') || 'Offen',
        datum:            val('auftrag-datum'),
        faellig:          val('auftrag-faellig'),
        verantwortlicher: val('auftrag-verantwortlich'),
        kostenstelle:     val('auftrag-kostenstelle'),
        werk:             val('auftrag-werk'),
        halle:            val('auftrag-halle'),
        bemerkung:        val('auftrag-bemerkung'),
      });
      toast(`Auftrag „${nr}" wurde gespeichert.`);
      mc.querySelectorAll('input[type="text"], input[type="date"], textarea').forEach(el => {
        if (el.id !== 'auftrag-nr') el.value = '';
      });
      mc.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
      const statusEl = mc.querySelector('#auftrag-status');
      if (statusEl) statusEl.value = 'Offen';
      const nrEl = mc.querySelector('#auftrag-nr');
      if (nrEl) nrEl.value = ADLStore.auftraege.nextNr('AUF', 'nr');
      const datumEl = mc.querySelector('#auftrag-datum');
      if (datumEl) datumEl.value = new Date().toISOString().slice(0, 10);
      return;
    }

    /* Bestellung (Bestellung.html) */
    if (mc.querySelector('#bestellnummer') !== null) {
      const nr = val('bestellnummer');
      const lieferant = document.querySelector('#lieferant')?.value;
      if (!lieferant) { toast('Bitte Lieferant auswählen.', 'danger'); return; }
      const pos   = [...tempPositionen.bestellung];
      const total = pos.reduce((s, p) => s + (p.gesamtpreis || 0), 0);
      ADLStore.bestellungen.add({
        nr:               nr || ADLStore.bestellungen.nextNr('BST'),
        lieferant,
        bestelldatum:     document.getElementById('bestelldatum')?.value ?? '',
        lieferdatum:      document.getElementById('lieferdatum')?.value ?? '',
        prioritaet:       document.getElementById('prioritaet')?.value ?? '',
        status:           document.getElementById('status')?.value ?? '',
        kostenstelle:     document.getElementById('kostenstelle')?.value ?? '',
        ansprechpartner:  document.getElementById('ansprechpartner')?.value ?? '',
        lieferart:        document.getElementById('lieferart')?.value ?? '',
        versandart:       document.getElementById('versandart')?.value ?? '',
        zahlungsbedingung:document.getElementById('zahlungsbedingung')?.value ?? '',
        lieferadresse:    document.getElementById('lieferadresse')?.value ?? '',
        positionen:       pos,
        gesamtwert:       total,
      });
      tempPositionen.bestellung = [];
      toast('Bestellung gespeichert.');
    }
  });

  /* ================================================================
     Tabellen-Renderer (befüllt .data-table tbody aus dem Store)
     ================================================================ */

  function renderBestelldatenbank(tbody) {
    const rows = ADLStore.bestellungen.getAll();
    if (!rows.length) return;
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td class="td-mono">${escHtml(r.nr)}</td>
        <td>${escHtml(r.lieferant)}</td>
        <td class="td-mono">${formatDate(r.bestelldatum)}</td>
        <td class="td-mono">${formatDate(r.lieferdatum)}</td>
        <td class="td-mono">${formatEuro(r.gesamtwert)}</td>
        <td>${r.positionen?.length || 0} Pos.</td>
        <td>${badge(r.status)}</td>
        <td style="white-space:nowrap">${editBtn('sites/Bestellung.html')} ${deleteBtn('bestellungen', r.id, r.nr)}</td>
      </tr>`).join('');
  }

  function renderLieferanten(tbody) {
    const rows = ADLStore.lieferanten.getAll();
    if (!rows.length) return;
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td class="td-mono">${escHtml(r.nr)}</td>
        <td>${escHtml(r.name)}</td>
        <td>${escHtml(r.warengruppe)}</td>
        <td>${escHtml(r.kontaktperson || '—')}</td>
        <td class="td-mono">${escHtml(r.telefon || '—')}</td>
        <td>${badge(r.bewertung || 'Gut')}</td>
        <td>${badge(r.status || 'Aktiv')}</td>
        <td style="white-space:nowrap"><button class="btn btn-sm btn-ghost" data-action="neuer-lieferant">${EDIT_SVG}</button> ${deleteBtn('lieferanten', r.id, r.name)}</td>
      </tr>`).join('');
  }

  function renderWareneingaenge(tbody) {
    const rows = ADLStore.wareneingaenge.getAll();
    if (!rows.length) return;
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td class="td-mono">${escHtml(r.nr)}</td>
        <td class="td-mono">${escHtml(r.bestellnr || '—')}</td>
        <td>${escHtml(r.lieferant || '—')}</td>
        <td>${escHtml(r.artikel || '—')}</td>
        <td>${escHtml(String(r.mengeGeliefert || '—'))} ${escHtml(r.einheit || '')}</td>
        <td class="td-mono">${escHtml(r.lieferschein || '—')}</td>
        <td class="td-mono">${formatDate(r.datum)}</td>
        <td>${badge(r.status)}</td>
        <td style="white-space:nowrap"><button class="btn btn-sm btn-ghost" data-action="wareneingang-erfassen">${EDIT_SVG}</button> ${deleteBtn('wareneingaenge', r.id, r.nr)}</td>
      </tr>`).join('');
  }

  function renderWartungsdatenbank(tbody) {
    const rows = ADLStore.wartungsauftraege.getAll();
    if (!rows.length) return;
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td class="td-mono">${escHtml(r.nr)}</td>
        <td>${escHtml(r.geraet || '—')}</td>
        <td>${escHtml(r.kategorie || '—')}</td>
        <td>${escHtml(r.halle || '—')}</td>
        <td>${escHtml(r.wartungsart || '—')}</td>
        <td>${badge(r.prioritaet || 'Normal')}</td>
        <td class="td-mono">${formatDate(r.datum)}</td>
        <td>${escHtml(r.techniker || '—')}</td>
        <td>${badge(r.status)}</td>
        <td style="white-space:nowrap">${editBtn('sites/Instandhaltung.html')} ${deleteBtn('wartungsauftraege', r.id, r.nr)}</td>
      </tr>`).join('');
  }

  function renderGeraeteuebersicht(tbody) {
    const rows = ADLStore.geraete.getAll();
    if (!rows.length) return;
    tbody.innerHTML = rows.map(r => {
      const trLast = r.tragfaehigkeit ? `${Number(r.tragfaehigkeit).toLocaleString('de-DE')} ${r.tragfaehigkeitEinheit || 'kg'}` : '—';
      return `
      <tr>
        <td class="td-mono">${escHtml(r.nr)}</td>
        <td>${escHtml(r.bezeichnung)}</td>
        <td>${escHtml(r.kategorie || '—')}</td>
        <td class="td-mono">${escHtml(trLast)}</td>
        <td>${escHtml(r.halle || '—')}</td>
        <td>${escHtml(r.hersteller || '—')}</td>
        <td class="td-mono">${escHtml(r.seriennr || '—')}</td>
        <td class="td-mono">${formatDate(r.letzterService)}</td>
        <td class="td-mono">${formatDate(r.naechsterService)}</td>
        <td>${badge(r.status || 'Aktiv')}</td>
        <td style="white-space:nowrap"><button class="btn btn-sm btn-ghost" data-action="neues-geraet">${EDIT_SVG}</button> ${deleteBtn('geraete', r.id, r.bezeichnung)}</td>
      </tr>`;
    }).join('');
  }

  function renderWartungshistorie(tbody) {
    const rows = ADLStore.wartungsauftraege.getAll().filter(r => r.status === 'Abgeschlossen');
    if (!rows.length) return;
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td class="td-mono">${escHtml(r.nr)}</td>
        <td>${escHtml(r.geraet || '—')}</td>
        <td>${escHtml(r.kategorie || '—')}</td>
        <td>${escHtml(r.halle || '—')}</td>
        <td>${escHtml(r.wartungsart || '—')}</td>
        <td>${escHtml(r.techniker || '—')}</td>
        <td class="td-mono">${formatDate(r.datum)}</td>
        <td class="td-mono">${formatDate(r.datumEnde || r.datum)}</td>
        <td class="td-mono">${escHtml(String(r.dauer || '—'))}</td>
        <td>${badge('Erfolgreich')}</td>
        <td style="white-space:nowrap">${editBtn('sites/Instandhaltung.html')} ${deleteBtn('wartungsauftraege', r.id, r.nr)}</td>
      </tr>`).join('');
  }

  const ARTIKEL_PER_PAGE = 8;
  const PREV_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
  const NEXT_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

  function updateArtikelKpis(all, root) {
    const gesamt      = all.length;
    const aktiv       = all.filter(r => (r.status || 'Aktiv') === 'Aktiv').length;
    const gesperrt    = all.filter(r => r.status === 'Gesperrt').length;
    const unterbestand= all.filter(r => {
      const b = parseFloat(r.bestand);
      const m = parseFloat(r.mindestbestand);
      return !isNaN(b) && !isNaN(m) && m > 0 && b < m;
    }).length;
    const set = (id, val) => { const el = root?.querySelector('#' + id); if (el) el.textContent = val; };
    set('kpi-gesamt',      gesamt.toLocaleString('de-DE'));
    set('kpi-aktiv',       aktiv.toLocaleString('de-DE'));
    set('kpi-gesperrt',    gesperrt.toLocaleString('de-DE'));
    set('kpi-unterbestand',unterbestand.toLocaleString('de-DE'));
  }

  function renderArtikeldatenbank(tbody, page) {
    page = page || 1;
    const all        = ADLStore.artikel.getAll();
    const total      = all.length;
    const totalPages = Math.max(1, Math.ceil(total / ARTIKEL_PER_PAGE));
    page             = Math.min(Math.max(1, page), totalPages);
    const slice      = all.slice((page - 1) * ARTIKEL_PER_PAGE, page * ARTIKEL_PER_PAGE);

    tbody.innerHTML = slice.length
      ? slice.map(r => `
          <tr data-artikel-id="${escHtml(r.id)}" style="cursor:pointer">
            <td class="td-mono">${escHtml(r.artikelnummer || r.nr || '—')}</td>
            <td>${escHtml(r.bezeichnung || '—')}</td>
            <td>${escHtml(r.warengruppe || '—')}</td>
            <td>${escHtml(r.einheit || '—')}</td>
            <td>${escHtml(String(r.bestand !== '' ? r.bestand : '—'))}</td>
            <td>${escHtml(String(r.mindestbestand !== '' ? r.mindestbestand : '—'))}</td>
            <td>${escHtml(r.lagerort || '—')}</td>
            <td>${badge(r.status || 'Aktiv')}</td>
            <td style="white-space:nowrap"><button class="btn btn-sm btn-ghost" data-navigate="sites/Artikel.html" data-edit-id="${escHtml(r.id)}">${EDIT_SVG}</button> ${deleteBtn('artikel', r.id, r.bezeichnung || r.nr)}</td>
          </tr>`).join('')
      : `<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-tertiary)">Keine Artikel gespeichert</td></tr>`;

    const root   = tbody.closest('.container') || tbody.closest('section');
    updateArtikelKpis(all, root);
    const infoEl = root?.querySelector('.pagination-info');
    const btnsEl = root?.querySelector('.pagination-buttons');

    if (infoEl) {
      if (total === 0) {
        infoEl.textContent = 'Keine Artikel';
      } else {
        const from = (page - 1) * ARTIKEL_PER_PAGE + 1;
        const to   = Math.min(page * ARTIKEL_PER_PAGE, total);
        infoEl.textContent = `Zeigt ${from}–${to} von ${total} ${total === 1 ? 'Artikel' : 'Artikeln'}`;
      }
    }

    if (btnsEl) {
      // Seitenbuttons berechnen: immer erste + letzte, aktuelle ±1, Rest mit Ellipsis
      let pageNums;
      if (totalPages <= 7) {
        pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        const set = new Set(
          [1, 2, page - 1, page, page + 1, totalPages - 1, totalPages]
            .filter(p => p >= 1 && p <= totalPages)
        );
        pageNums = [...set].sort((a, b) => a - b);
      }

      let html = `<button class="btn btn-sm" data-pg-prev ${page === 1 ? 'disabled' : ''}>${PREV_SVG}</button>`;
      let prev = null;
      for (const p of pageNums) {
        if (prev !== null && p - prev > 1) html += `<span class="pagination-ellipsis">…</span>`;
        html += `<button class="btn btn-sm${p === page ? ' btn-primary' : ''}" data-pg="${p}">${p}</button>`;
        prev = p;
      }
      html += `<button class="btn btn-sm" data-pg-next ${page === totalPages ? 'disabled' : ''}>${NEXT_SVG}</button>`;

      btnsEl.innerHTML = html;
      btnsEl.querySelectorAll('[data-pg]').forEach(btn =>
        btn.addEventListener('click', () => renderArtikeldatenbank(tbody, +btn.dataset.pg))
      );
      btnsEl.querySelector('[data-pg-prev]')?.addEventListener('click', () =>
        renderArtikeldatenbank(tbody, page - 1)
      );
      btnsEl.querySelector('[data-pg-next]')?.addEventListener('click', () =>
        renderArtikeldatenbank(tbody, page + 1)
      );
    }
  }

  const BEWEGUNG_PER_PAGE = 12;

  function updateBewegungKpis(all, root) {
    const todayStr = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const heute   = all.filter(r => { const d = new Date(r.erstelltAm); return !isNaN(d) && d.toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' }) === todayStr; }).length;
    const gestern = all.filter(r => { const d = new Date(r.erstelltAm); return !isNaN(d) && d.toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' }) === yesterdayStr; }).length;
    const wareneingaenge = all.filter(r => r.typ === 'Wareneingang').length;
    const auslagerungen  = all.filter(r => r.typ === 'Auslagerung').length;
    const versand        = all.filter(r => r.typ === 'Versand').length;

    const set = (id, v) => { const el = root?.querySelector('#' + id); if (el) el.textContent = v; };
    set('kpi-bwg-heute',        heute.toLocaleString('de-DE'));
    set('kpi-bwg-wareneingang', wareneingaenge.toLocaleString('de-DE'));
    set('kpi-bwg-auslagerung',  auslagerungen.toLocaleString('de-DE'));
    set('kpi-bwg-versand',      versand.toLocaleString('de-DE'));

    const trendEl = root?.querySelector('#kpi-bwg-trend');
    if (trendEl) {
      const diff = heute - gestern;
      if (diff > 0)      { trendEl.textContent = `+${diff} vs. gestern`; trendEl.className = 'metric-trend up'; }
      else if (diff < 0) { trendEl.textContent = `${diff} vs. gestern`;  trendEl.className = 'metric-trend down'; }
      else               { trendEl.textContent = 'Wie gestern';           trendEl.className = 'metric-trend'; }
    }
  }

  function renderArtikelbewegung(tbody, page) {
    page = page || 1;
    const all        = ADLStore.bewegungen.getAll();
    const total      = all.length;
    const totalPages = Math.max(1, Math.ceil(total / BEWEGUNG_PER_PAGE));
    page             = Math.min(Math.max(1, page), totalPages);
    const slice      = all.slice((page - 1) * BEWEGUNG_PER_PAGE, page * BEWEGUNG_PER_PAGE);

    const root = tbody.closest('.container') || tbody.closest('section');
    updateBewegungKpis(all, root);

    tbody.innerHTML = slice.length
      ? slice.map(r => `
          <tr>
            <td class="td-mono">${escHtml(r.nr)}</td>
            <td class="td-mono">${formatDateTime(r.erstelltAm)}</td>
            <td class="td-mono">${escHtml(r.artikelnummer || '—')}</td>
            <td>${escHtml(r.bezeichnung || '—')}</td>
            <td class="td-mono">${escHtml(r.seriennr || '—')}</td>
            <td>${badge(r.typ || 'Neuanlage')}</td>
            <td>${escHtml(r.von || '—')}</td>
            <td>${escHtml(r.nach || '—')}</td>
            <td class="td-mono">${escHtml(r.transporteinheit || '—')}</td>
            <td>${escHtml(r.benutzer || '—')}</td>
            <td>${badge(r.status || 'Abgeschlossen')}</td>
          </tr>`).join('')
      : `<tr><td colspan="11" style="text-align:center;padding:24px;color:var(--text-tertiary)">Keine Bewegungen gespeichert</td></tr>`;

    const infoEl = root?.querySelector('.pagination-info');
    const btnsEl = root?.querySelector('.pagination-buttons');

    if (infoEl) {
      if (total === 0) {
        infoEl.textContent = 'Keine Bewegungen';
      } else {
        const from = (page - 1) * BEWEGUNG_PER_PAGE + 1;
        const to   = Math.min(page * BEWEGUNG_PER_PAGE, total);
        infoEl.textContent = `Zeigt ${from}–${to} von ${total} ${total === 1 ? 'Bewegung' : 'Bewegungen'}`;
      }
    }

    if (btnsEl) {
      let pageNums;
      if (totalPages <= 7) {
        pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        const s = new Set(
          [1, 2, page - 1, page, page + 1, totalPages - 1, totalPages]
            .filter(p => p >= 1 && p <= totalPages)
        );
        pageNums = [...s].sort((a, b) => a - b);
      }

      let html = `<button class="btn btn-sm" data-bwg-prev ${page === 1 ? 'disabled' : ''}>${PREV_SVG}</button>`;
      let prev = null;
      for (const p of pageNums) {
        if (prev !== null && p - prev > 1) html += `<span class="pagination-ellipsis">…</span>`;
        html += `<button class="btn btn-sm${p === page ? ' btn-primary' : ''}" data-bwg="${p}">${p}</button>`;
        prev = p;
      }
      html += `<button class="btn btn-sm" data-bwg-next ${page === totalPages ? 'disabled' : ''}>${NEXT_SVG}</button>`;

      btnsEl.innerHTML = html;
      btnsEl.querySelectorAll('[data-bwg]').forEach(btn =>
        btn.addEventListener('click', () => renderArtikelbewegung(tbody, +btn.dataset.bwg))
      );
      btnsEl.querySelector('[data-bwg-prev]')?.addEventListener('click', () =>
        renderArtikelbewegung(tbody, page - 1)
      );
      btnsEl.querySelector('[data-bwg-next]')?.addEventListener('click', () =>
        renderArtikelbewegung(tbody, page + 1)
      );
    }
  }

  /* ================================================================
     Seitenerkennung & automatisches Tabellen-Rendering
     ================================================================ */

  /* ---- Lagerort-Selects befüllen ---------------------------------- */

  function refreshLagerortSelects() {
    const plaetze = ADLStore.lagerplaetze.getAll();
    const opts = '<option value="">— bitte wählen —</option>' +
      plaetze.map(p => `<option value="${escHtml(p.platzId)}">${escHtml(p.platzId)}</option>`).join('');
    document.querySelectorAll('select#lagerort, select#m-lagerort').forEach(el => {
      const cur = el.value;
      el.innerHTML = opts;
      if (cur) el.value = cur;
    });
  }

  /* ---- Artikelverwaltung: nur Lagerort-Select befüllen ----------- */

  function renderArtikelVerwaltung(root) {
    const plaetze = ADLStore.lagerplaetze.getAll();
    const opts = '<option value="">— bitte wählen —</option>' +
      plaetze.map(p => `<option value="${escHtml(p.platzId)}">${escHtml(p.platzId)}</option>`).join('');
    const el = root.querySelector('select#lagerort');
    if (el) { const cur = el.value; el.innerHTML = opts; if (cur) el.value = cur; }
  }

  /* ---- Lager & Standorte ----------------------------------------- */

  function renderLagerStandorte(root) {
    const lager   = ADLStore.lager.getAll();
    const hallen  = ADLStore.hallen.getAll();
    const plaetze = ADLStore.lagerplaetze.getAll();

    /* KPIs */
    const frei = plaetze.filter(p => p.status === 'Frei').length;
    const set  = (id, v) => { const el = root.querySelector('#' + id); if (el) el.textContent = v; };
    set('kpi-lager',       lager.length.toLocaleString('de-DE'));
    set('kpi-hallen',      hallen.length.toLocaleString('de-DE'));
    set('kpi-lagerplaetze',plaetze.length.toLocaleString('de-DE'));
    set('kpi-frei',        frei.toLocaleString('de-DE'));

    /* Lager-Tabelle */
    const lagerTbody = root.querySelector('#tbl-lager tbody');
    if (lagerTbody) {
      lagerTbody.innerHTML = lager.length
        ? lager.map(r => `
            <tr>
              <td class="td-mono">${escHtml(r.nr || '—')}</td>
              <td>${escHtml(r.bezeichnung || '—')}</td>
              <td>${escHtml(r.typ || '—')}</td>
              <td>${escHtml(r.adresse || '—')}</td>
              <td>${escHtml(r.flaeche ? r.flaeche + ' m²' : '—')}</td>
              <td>${badge(r.status || 'Aktiv')}</td>
              <td>${deleteBtn('lager', r.id, r.bezeichnung || r.nr)}</td>
            </tr>`).join('')
        : `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-tertiary)">Keine Lager gespeichert</td></tr>`;
    }

    /* Hallen-Tabelle */
    const hallenTbody = root.querySelector('#tbl-hallen tbody');
    if (hallenTbody) {
      hallenTbody.innerHTML = hallen.length
        ? hallen.map(r => `
            <tr>
              <td class="td-mono">${escHtml(r.nr || '—')}</td>
              <td>${escHtml(r.bezeichnung || '—')}</td>
              <td>${escHtml(r.lagerBezeichnung || r.lagerNr || '—')}</td>
              <td>${escHtml(r.flaeche ? r.flaeche + ' m²' : '—')}</td>
              <td>${escHtml([r.laenge, r.breite, r.hoehe].map(v => v || '—').join(' × '))}</td>
              <td>${deleteBtn('hallen', r.id, r.bezeichnung || r.nr)}</td>
            </tr>`).join('')
        : `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-tertiary)">Keine Hallen gespeichert</td></tr>`;
    }

    /* Lagerplätze-Tabelle */
    const plaetzeTbody = root.querySelector('#tbl-lagerplaetze tbody');
    if (plaetzeTbody) {
      plaetzeTbody.innerHTML = plaetze.length
        ? plaetze.map(r => `
            <tr>
              <td class="td-mono">${escHtml(r.platzId || '—')}</td>
              <td>${escHtml(r.lagerBezeichnung || r.lagerNr || '—')}</td>
              <td>${escHtml(r.halleNr ? r.halleNr + (r.halleBezeichnung ? ' – ' + r.halleBezeichnung : '') : '—')}</td>
              <td>${escHtml(r.regal || '—')}</td>
              <td>${escHtml(r.fach || '—')}</td>
              <td>${escHtml(r.ebene || '—')}</td>
              <td>${escHtml(r.typ || '—')}</td>
              <td>${escHtml(r.tragfaehigkeit ? r.tragfaehigkeit + ' kg' : '—')}</td>
              <td>${badge(r.status || 'Frei')}</td>
              <td>${deleteBtn('lagerplaetze', r.id, r.platzId)}</td>
            </tr>`).join('')
        : `<tr><td colspan="10" style="text-align:center;padding:24px;color:var(--text-tertiary)">Keine Lagerplätze gespeichert</td></tr>`;
    }

    /* Lager-Selects in Formularen befüllen */
    const lagerOpts = '<option value="">— bitte wählen —</option>' +
      lager.map(l => `<option value="${escHtml(l.nr)}">${escHtml(l.nr)} – ${escHtml(l.bezeichnung)}</option>`).join('');
    ['halleZuLager', 'platzLager', 'genLager'].forEach(id => {
      const el = root.querySelector('#' + id);
      if (el) { const cur = el.value; el.innerHTML = lagerOpts; if (cur) el.value = cur; }
    });

    /* Hallen-Selects befüllen (ungefiltert) */
    const hallenOpts = '<option value="">— bitte wählen —</option>' +
      hallen.map(h => `<option value="${escHtml(h.nr)}">${escHtml(h.nr)} – ${escHtml(h.bezeichnung)}</option>`).join('');
    ['platzHalle', 'genHalle'].forEach(id => {
      const el = root.querySelector('#' + id);
      if (el) { const cur = el.value; el.innerHTML = hallenOpts; if (cur) el.value = cur; }
    });
  }

  /* ---- Dashboard-Übersicht --------------------------------------- */

  function renderDashboard(root) {
    const set  = (id, v) => { const el = root.querySelector('#' + id); if (el) el.textContent = v; };
    const html = (id, h) => { const el = root.querySelector('#' + id); if (el) el.innerHTML = h; };

    /* Artikel */
    const artikel = ADLStore.artikel.getAll();
    const artAktiv = artikel.filter(r => (r.status || 'Aktiv') === 'Aktiv').length;
    const artUnter = artikel.filter(r => {
      const b = parseFloat(r.bestand), m = parseFloat(r.mindestbestand);
      return !isNaN(b) && !isNaN(m) && m > 0 && b < m;
    }).length;
    set('db-art-gesamt',      artikel.length);
    set('db-art-aktiv',       artAktiv);
    set('db-art-unterbestand', artUnter);
    const artLst = artikel.slice(-4).reverse();
    html('db-art-list', artLst.length
      ? artLst.map(r => `<div class="db-list-item"><span class="db-list-nr">${escHtml(r.artikelnummer||r.nr||'—')}</span><span class="db-list-label">${escHtml(r.bezeichnung||'—')}</span>${badge(r.status||'Aktiv')}</div>`).join('')
      : '<div class="db-empty">Keine Artikel vorhanden</div>');

    /* Aufträge */
    const auftraege = ADLStore.auftraege.getAll();
    const aufOffen = auftraege.filter(r => r.status==='Offen'||r.status==='In Bearbeitung').length;
    const aufKrit  = auftraege.filter(r => r.prioritaet==='Kritisch').length;
    set('db-auf-gesamt',   auftraege.length);
    set('db-auf-offen',    aufOffen);
    set('db-auf-kritisch', aufKrit);
    const aufLst = auftraege.slice(-4).reverse();
    html('db-auf-list', aufLst.length
      ? aufLst.map(r => `<div class="db-list-item"><span class="db-list-nr">${escHtml(r.nr||'—')}</span><span class="db-list-label">${escHtml(r.kunde||'—')}</span>${badge(r.status)}</div>`).join('')
      : '<div class="db-empty">Keine Aufträge vorhanden</div>');

    /* Bestellungen */
    const bestellungen = ADLStore.bestellungen.getAll();
    const bstOffen   = bestellungen.filter(r => r.status==='Offen'||r.status==='Neu').length;
    const bstLieferg = bestellungen.filter(r => r.status==='In Lieferung').length;
    set('db-bst-gesamt',    bestellungen.length);
    set('db-bst-offen',     bstOffen);
    set('db-bst-lieferung', bstLieferg);
    const bstLst = bestellungen.slice(-4).reverse();
    html('db-bst-list', bstLst.length
      ? bstLst.map(r => `<div class="db-list-item"><span class="db-list-nr">${escHtml(r.nr||'—')}</span><span class="db-list-label">${escHtml(r.lieferant||'—')}</span>${badge(r.status)}</div>`).join('')
      : '<div class="db-empty">Keine Bestellungen vorhanden</div>');

    /* Produktionen */
    const prod = ADLStore.produktionsauftraege.getAll();
    const prdLaufend  = prod.filter(r => r.status==='Laufend').length;
    const prdAbgeschl = prod.filter(r => r.status==='Abgeschlossen').length;
    set('db-prd-gesamt',        prod.length);
    set('db-prd-laufend',       prdLaufend);
    set('db-prd-abgeschlossen', prdAbgeschl);
    const prdLst = prod.slice(-4).reverse();
    html('db-prd-list', prdLst.length
      ? prdLst.map(r => `<div class="db-list-item"><span class="db-list-nr">${escHtml(r.nr||'—')}</span><span class="db-list-label">${escHtml(r.bezeichnung||'—')}</span>${badge(r.status)}</div>`).join('')
      : '<div class="db-empty">Keine Produktionen vorhanden</div>');

    /* Instandhaltung */
    const geraete  = ADLStore.geraete.getAll();
    const wartungen = ADLStore.wartungsauftraege.getAll();
    const ihOffen = wartungen.filter(r => r.status !== 'Abgeschlossen').length;
    const ihKrit  = geraete.filter(r => r.status==='Defekt'||r.status==='In Wartung').length;
    set('db-ih-geraete',   geraete.length);
    set('db-ih-wartungen', ihOffen);
    set('db-ih-kritisch',  ihKrit);
    const priMap = { 'Notfall':0,'Dringend':1,'Hoch':2,'Normal':3,'Niedrig':4 };
    const ihLst = wartungen.filter(r => r.status!=='Abgeschlossen')
      .sort((a,b) => (priMap[a.prioritaet]??5)-(priMap[b.prioritaet]??5))
      .slice(0,4);
    html('db-ih-list', ihLst.length
      ? ihLst.map(r => `<div class="db-list-item"><span class="db-list-nr">${escHtml(r.nr||'—')}</span><span class="db-list-label">${escHtml(r.geraet||'—')}</span>${badge(r.prioritaet||'Normal')}</div>`).join('')
      : '<div class="db-empty">Keine offenen Wartungen</div>');
  }

  const TITLE_MAP = {
    'Artikeldatenbank':     renderArtikeldatenbank,
    'Artikelbewegung':      renderArtikelbewegung,
    'Bestelldatenbank':     renderBestelldatenbank,
    'Lieferantenübersicht': renderLieferanten,
    'Wareneingänge':        renderWareneingaenge,
    'Wartungsdatenbank':    renderWartungsdatenbank,
    'Geräteübersicht':      renderGeraeteuebersicht,
    'Wartungshistorie':     renderWartungshistorie,
    'Lager & Standorte':    renderLagerStandorte,
    'Artikelverwaltung':    renderArtikelVerwaltung,
  };

  const ROOT_RENDERER_TITLES = new Set(['Lager & Standorte', 'Artikelverwaltung']);

  function tryRender(root) {
    if (root.querySelector('#adl-dashboard')) { renderDashboard(root); return; }
    const title    = root.querySelector('.section-title')?.textContent?.trim();
    const renderer = title ? TITLE_MAP[title] : null;
    if (!renderer) return;
    if (ROOT_RENDERER_TITLES.has(title)) { renderer(root); return; }
    const tbody = root.querySelector('.data-table tbody');
    if (tbody) renderer(tbody);
  }

  /* MutationObserver auf .main-content – wird bei jedem Seitenwechsel aktiv */
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    new MutationObserver(() => tryRender(mainContent))
      .observe(mainContent, { childList: true });
  }

  /* Initiales Rendering falls beim Laden bereits Inhalt vorhanden ist */
  if (mainContent) tryRender(mainContent);

  /* ================================================================
     Artikeldetail-Modal
     ================================================================ */

  (function () {
    const overlay  = document.getElementById('modalArtikelDetail');
    if (!overlay) return;
    const bodyEl   = document.getElementById('modalArtikelDetailBody');
    const titleEl  = document.getElementById('modalArtikelDetailTitle');
    const editBtnEl= document.getElementById('modalArtikelDetailEdit');
    let currentId  = null;

    function fmtDate(iso) {
      if (!iso) return null;
      const d = new Date(iso);
      return isNaN(d) ? null : d.toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' });
    }

    function buildDetailHtml(a) {
      const LBL = 'width:22%;padding:6px 14px 6px 0;font-size:11.5px;font-weight:600;color:var(--text-secondary);vertical-align:top;white-space:nowrap';
      const VAL = 'width:28%;padding:6px 20px 6px 0;font-size:13px;color:var(--text-primary);vertical-align:top';
      const v   = x => (x != null && x !== '') ? escHtml(String(x)) : `<span style="color:var(--text-tertiary)">—</span>`;

      function tbl(pairs) {
        let rows = '';
        for (let i = 0; i < pairs.length; i += 2) {
          const [l1, v1] = pairs[i];
          const [l2, v2] = pairs[i + 1] || [null, null];
          rows += `<tr>
            <td style="${LBL}">${escHtml(l1)}</td><td style="${VAL}">${v(v1)}</td>
            ${l2 != null ? `<td style="${LBL}">${escHtml(l2)}</td><td style="${VAL}">${v(v2)}</td>` : '<td colspan="2"></td>'}
          </tr>`;
        }
        return `<table style="width:100%;border-collapse:collapse;margin-bottom:6px"><tbody>${rows}</tbody></table>`;
      }

      const sec = (title, pairs) => `<p class="form-group-label">${title}</p>${tbl(pairs)}`;

      return (
        sec('Stammdaten', [
          ['Artikelbezeichnung', a.bezeichnung], ['Artikelnummer',       a.artikelnummer],
          ['Warengruppe',        a.warengruppe],  ['Artikelstatus',       a.status],
          ['Einheit',            a.einheit],       ['Chargennummer',       a.charge],
          ['Seriennummer (SN)',  a.seriennr],      ['Maschinennummer (MSN)', a.maschinennr],
        ]) +
        sec('Lagerbestand', [
          ['Aktueller Bestand', a.bestand],       ['Mindestbestand', a.mindestbestand],
          ['Meldebestand',      a.meldebestand],  ['Lagerort',       a.lagerort],
        ]) +
        sec('Abmessungen &amp; Verpackung', [
          ['Länge (cm)',         a.laenge],        ['Breite (cm)',         a.breite],
          ['Höhe (cm)',          a.hoehe],         ['Gewicht (kg)',        a.gewicht],
          ['Verpackungseinheit', a.verpackungseinheit], ['Menge pro Einheit', a.mengeProEinheit],
        ]) +
        sec('Einkauf', [
          ['Lieferant',          a.lieferant],     ['Einkaufspreis (€)',   a.einkaufspreis],
          ['Mindestbestellmenge',a.mindestbestellmenge],
        ]) +
        sec('Verkauf', [
          ['Verkaufspreis (€)',  a.verkaufspreis], ['Steuersatz',          a.steuersatz],
          ['Zolltarifnummer',   a.zolltarifnummer],
        ]) +
        sec('Versand &amp; Klassifikation', [
          ['Gefahrgut',         a.gefahrgut],     ['Herkunftsland',       a.herkunftsland],
          ['Barcode (EAN)',     a.barcode],
        ]) +
        (a.beschreibung
          ? `<p class="form-group-label">Beschreibung</p><p style="font-size:13px;color:var(--text-primary);margin:0 0 16px;white-space:pre-wrap">${escHtml(a.beschreibung)}</p>`
          : '') +
        sec('Metadaten', [
          ['Interne Nr.', a.nr], ['Erstellt am', fmtDate(a.erstelltAm)],
          ['Geändert am', fmtDate(a.geaendertAm)],
        ])
      );
    }

    function openDetail(id) {
      const a = ADLStore.artikel.getById(id);
      if (!a) return;
      currentId = id;
      if (titleEl) titleEl.textContent = a.bezeichnung || 'Artikeldetails';
      if (bodyEl) bodyEl.innerHTML = buildDetailHtml(a);
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeDetail() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      currentId = null;
    }

    document.getElementById('modalArtikelDetailClose')?.addEventListener('click', closeDetail);
    document.getElementById('modalArtikelDetailSchliessen')?.addEventListener('click', closeDetail);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeDetail(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeDetail();
    });

    editBtnEl?.addEventListener('click', () => {
      if (!currentId) return;
      const id = currentId;
      closeDetail();
      const mc = document.querySelector('.main-content');
      if (!mc) return;
      fetch('sites/Artikel.html')
        .then(r => r.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const main = doc.querySelector('main');
          mc.innerHTML = main ? main.innerHTML : '';
          document.dispatchEvent(new CustomEvent('adl:edit-navigate', { detail: { editId: id } }));
        });
      document.querySelectorAll('.sidebar-item').forEach(i => {
        i.classList.toggle('active', i.getAttribute('data-page') === 'sites/Artikel.html');
      });
    });

    /* Zeilenklick in der Artikeldatenbank-Tabelle */
    document.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      const tr = e.target.closest('tr[data-artikel-id]');
      if (!tr) return;
      openDetail(tr.dataset.artikelId);
    });
  })();

  /* ================================================================
     Löschen-Handler – zweistufige Bestätigung ohne Browser-Dialog
     Erster Klick:  Button wechselt 3 s lang zu „SICHER?"-Stil
     Zweiter Klick: Datensatz wird entfernt; bei Artikeln zusätzlich
                    eine Bewegung mit Status „Gelöscht" angelegt
     Artikelbewegung: kein deleteBtn → kein Löschen möglich
     ================================================================ */

  /* ================================================================
     Lager / Halle / Lagerplatz speichern
     ================================================================ */

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-lager-save]');
    if (!btn) return;
    const mc = document.querySelector('.main-content');
    if (!mc) return;
    const g    = id => (mc.querySelector('#' + id)?.value ?? '').trim();
    const gsel = id => mc.querySelector('#' + id)?.value ?? '';
    const clr  = ids => ids.forEach(id => { const el = mc.querySelector('#' + id); if (el) el.value = ''; });
    const type = btn.dataset.lagerSave;

    if (type === 'lager') {
      const bezeichnung = g('lagerBezeichnung');
      if (!bezeichnung) { toast('Bitte Lagerbezeichnung angeben.', 'danger'); return; }
      const nr = g('lagerId') || ('LGR-' + String(ADLStore.lager.count() + 1).padStart(3, '0'));
      ADLStore.lager.add({ nr, bezeichnung, typ: gsel('lagerTyp') || 'Hauptlager', adresse: g('lagerAdresse'), flaeche: g('lagerFlaeche'), status: gsel('lagerStatus') || 'Aktiv' });
      toast(`Lager „${bezeichnung}" gespeichert.`);
      clr(['lagerBezeichnung', 'lagerId', 'lagerAdresse', 'lagerFlaeche']);

    } else if (type === 'halle') {
      const nr          = g('hallenNummer');
      const bezeichnung = g('hallenBezeichnung');
      if (!nr || !bezeichnung) { toast('Bitte Hallennummer und Bezeichnung angeben.', 'danger'); return; }
      const lagerNr = gsel('halleZuLager');
      const lager   = ADLStore.lager.getAll().find(l => l.nr === lagerNr);
      ADLStore.hallen.add({ nr, bezeichnung, lagerNr, lagerBezeichnung: lager?.bezeichnung || lagerNr, flaeche: g('hallenFlaeche'), laenge: g('hallenLaenge'), breite: g('hallenBreite'), hoehe: g('hallenHoehe') });
      toast(`Halle „${nr} – ${bezeichnung}" gespeichert.`);
      clr(['hallenNummer', 'hallenBezeichnung', 'hallenFlaeche', 'hallenLaenge', 'hallenBreite', 'hallenHoehe']);

    } else if (type === 'lagerplatz') {
      const lagerNr = gsel('platzLager');
      const regal   = g('platzRegal');
      const fach    = g('platzFach');
      if (!lagerNr || !regal || !fach) { toast('Bitte Lager, Regal und Fach angeben.', 'danger'); return; }
      const halleNr = gsel('platzHalle');
      const ebene   = g('platzEbene');
      const lager   = ADLStore.lager.getAll().find(l => l.nr === lagerNr);
      const halle   = ADLStore.hallen.getAll().find(h => h.nr === halleNr);
      const platzId = [lagerNr, halleNr, regal, fach, ebene].filter(Boolean).join('-');
      ADLStore.lagerplaetze.add({ platzId, lagerNr, lagerBezeichnung: lager?.bezeichnung || lagerNr, halleNr, halleBezeichnung: halle?.bezeichnung || halleNr, regal, fach, ebene, typ: gsel('platzTyp') || 'Standard', tragfaehigkeit: g('platzTragfaehigkeit'), status: 'Frei' });
      toast(`Lagerplatz „${platzId}" gespeichert.`);
      clr(['platzRegal', 'platzFach', 'platzEbene', 'platzTragfaehigkeit', 'platzId']);
      refreshLagerortSelects();
    }

    tryRender(mc);
  });

  /* ================================================================
     Lagerplatz-ID Vorschau (Auto-Berechnung)
     ================================================================ */

  document.addEventListener('input', e => {
    if (!['platzRegal', 'platzFach', 'platzEbene'].includes(e.target.id)) return;
    const mc = document.querySelector('.main-content');
    if (!mc) return;
    const g  = id => (mc.querySelector('#' + id)?.value ?? '').trim();
    const platzId = [g('platzLager'), g('platzHalle'), g('platzRegal'), g('platzFach'), g('platzEbene')].filter(Boolean).join('-');
    const el = mc.querySelector('#platzId');
    if (el) el.value = platzId;
  });

  document.addEventListener('change', e => {
    const mc = document.querySelector('.main-content');
    if (!mc) return;

    if (['platzLager', 'platzHalle'].includes(e.target.id)) {
      const g = id => (mc.querySelector('#' + id)?.value ?? '').trim();
      const platzId = [g('platzLager'), g('platzHalle'), g('platzRegal'), g('platzFach'), g('platzEbene')].filter(Boolean).join('-');
      const el = mc.querySelector('#platzId');
      if (el) el.value = platzId;
    }

    if (e.target.id === 'platzLager' || e.target.id === 'genLager') {
      const lagerNr  = e.target.value;
      const filtered = ADLStore.hallen.getAll().filter(h => !lagerNr || h.lagerNr === lagerNr);
      const halleId  = e.target.id === 'platzLager' ? 'platzHalle' : 'genHalle';
      const halleEl  = mc.querySelector('#' + halleId);
      if (halleEl) {
        halleEl.innerHTML = '<option value="">— bitte wählen —</option>' +
          filtered.map(h => `<option value="${escHtml(h.nr)}">${escHtml(h.nr)} – ${escHtml(h.bezeichnung)}</option>`).join('');
      }
    }
  });

  /* ================================================================
     Lagerplatz Generator
     ================================================================ */

  let _generatorData = [];

  document.addEventListener('click', e => {
    if (e.target.id === 'btnGenerieren' || e.target.closest('#btnGenerieren')) {
      const mc = document.querySelector('.main-content');
      if (!mc) return;
      const g      = id => (mc.querySelector('#' + id)?.value ?? '').trim();
      const gsel   = id => mc.querySelector('#' + id)?.value ?? '';
      const lagerNr = gsel('genLager');
      const halleNr = gsel('genHalle');
      const typ     = gsel('genTyp') || 'Standard';
      const tf      = g('genTragfaehigkeit');
      const regale  = parseInt(g('genRegale'))  || 0;
      const faecher = parseInt(g('genFaecher')) || 0;
      const ebenen  = parseInt(g('genEbenen'))  || 0;

      if (!lagerNr || regale <= 0 || faecher <= 0 || ebenen <= 0) {
        toast('Bitte Lager und Regal-, Fach- sowie Ebenenanzahl angeben.', 'danger'); return;
      }

      const lager = ADLStore.lager.getAll().find(l => l.nr === lagerNr);
      const halle = ADLStore.hallen.getAll().find(h => h.nr === halleNr);
      _generatorData = [];
      for (let r = 1; r <= regale; r++) {
        for (let f = 1; f <= faecher; f++) {
          for (let eb = 1; eb <= ebenen; eb++) {
            const rStr = 'R' + String(r).padStart(2, '0');
            const fStr = 'F' + String(f).padStart(2, '0');
            const eStr = 'E' + String(eb).padStart(2, '0');
            _generatorData.push({ platzId: [lagerNr, halleNr, rStr, fStr, eStr].filter(Boolean).join('-'), lagerNr, lagerBezeichnung: lager?.bezeichnung || lagerNr, halleNr, halleBezeichnung: halle?.bezeichnung || halleNr, regal: rStr, fach: fStr, ebene: eStr, typ, tragfaehigkeit: tf, status: 'Frei' });
          }
        }
      }

      const vorschau = mc.querySelector('#generatorVorschau');
      if (vorschau) vorschau.textContent = _generatorData.map(p => p.platzId).join('\n');
      const uBtn = mc.querySelector('#btnUebernehmen');
      if (uBtn) uBtn.disabled = false;
    }

    if (e.target.id === 'btnUebernehmen' || e.target.closest('#btnUebernehmen')) {
      if (!_generatorData.length) return;
      _generatorData.forEach(p => ADLStore.lagerplaetze.add(p));
      toast(`${_generatorData.length} Lagerplätze gespeichert.`);
      _generatorData = [];
      const mc = document.querySelector('.main-content');
      if (mc) {
        const uBtn = mc.querySelector('#btnUebernehmen');
        if (uBtn) uBtn.disabled = true;
        const vorschau = mc.querySelector('#generatorVorschau');
        if (vorschau) vorschau.textContent = 'Einstellungen wählen und auf „Generieren" klicken…';
        tryRender(mc);
      }
      refreshLagerortSelects();
    }

    if (e.target.id === 'btnGeneratorReset' || e.target.closest('#btnGeneratorReset')) {
      _generatorData = [];
      const mc = document.querySelector('.main-content');
      if (!mc) return;
      const vorschau = mc.querySelector('#generatorVorschau');
      if (vorschau) vorschau.textContent = 'Einstellungen wählen und auf „Generieren" klicken…';
      const uBtn = mc.querySelector('#btnUebernehmen');
      if (uBtn) uBtn.disabled = true;
    }
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-delete-id]');
    if (!btn) return;
    e.stopPropagation();

    if (!btn.dataset.confirmed) {
      btn.dataset.confirmed = '1';
      const saved = { html: btn.innerHTML, color: btn.style.color, bg: btn.style.background, border: btn.style.borderColor };
      btn.innerHTML        = '<span style="font-size:10px;font-weight:700;letter-spacing:.3px">SICHER?</span>';
      btn.style.color      = 'var(--danger-text)';
      btn.style.background = 'var(--danger-bg)';
      btn.style.borderColor= 'transparent';
      btn._deleteTimer = setTimeout(() => {
        delete btn.dataset.confirmed;
        btn.innerHTML        = saved.html;
        btn.style.color      = saved.color;
        btn.style.background = saved.bg;
        btn.style.borderColor= saved.border;
      }, 3000);
      return;
    }

    clearTimeout(btn._deleteTimer);
    const id    = btn.dataset.deleteId;
    const store = btn.dataset.deleteStore;
    const label = btn.dataset.deleteLabel || 'Eintrag';

    if (store === 'artikel') {
      const a = ADLStore.artikel.getById(id);
      if (a) {
        ADLStore.bewegungen.add({
          nr:            ADLStore.bewegungen.nextNr('BWG'),
          artikelnummer: a.artikelnummer || a.nr,
          bezeichnung:   a.bezeichnung,
          seriennr:      a.seriennr || '',
          typ:           'Löschung',
          von:           a.lagerort || 'Lager',
          nach:          '—',
          benutzer:      'System',
          status:        'Gelöscht',
        });
      }
    }

    ADLStore[store]?.remove(id);
    toast(`„${label}" wurde gelöscht.`, 'danger');
    if (store === 'lagerplaetze') refreshLagerortSelects();
    const mc = document.querySelector('.main-content');
    if (mc) tryRender(mc);
  });

})();
