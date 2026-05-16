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
      'Aktiv':'success','Abgeschlossen':'success','Abgeschlossen (i.O.)':'success','Erfolgreich':'success','Sehr gut':'success','Neuanlage':'success',
      'In Lieferung':'warning','In Arbeit':'warning','In Prüfung':'warning','In Wartung':'warning','Nacharbeit':'warning','Befriedigend':'warning','Hoch':'warning',
      'Offen':'info','Geplant':'info','Erwartet':'info','Gut':'info','Normal':'info',
      'Abgelehnt (n.i.O.)':'danger','Defekt':'danger','Gesperrt':'danger','Dringend':'danger','Notfall':'danger','Nicht abgeschlossen':'danger',
      'Niedrig':'secondary',
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
    set('lagerort',            a.lagerort);
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

  /* ---- Temp-Puffer für Positionen ----------------------------------- */
  const tempPositionen = { bestellung: [], wartung: [], stueckliste: [] };

  /* ================================================================
     Modal-Formular-Bindungen
     ================================================================ */

  document.addEventListener('DOMContentLoaded', () => {

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
        <td>${editBtn('sites/Bestellung.html')}</td>
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
        <td><button class="btn btn-sm btn-ghost" data-action="neuer-lieferant">${EDIT_SVG}</button></td>
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
        <td><button class="btn btn-sm btn-ghost" data-action="wareneingang-erfassen">${EDIT_SVG}</button></td>
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
        <td>${editBtn('sites/Instandhaltung.html')}</td>
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
        <td><button class="btn btn-sm btn-ghost" data-action="neues-geraet">${EDIT_SVG}</button></td>
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
        <td>${editBtn('sites/Instandhaltung.html')}</td>
      </tr>`).join('');
  }

  function renderArtikeldatenbank(tbody) {
    const rows = ADLStore.artikel.getAll();
    if (!rows.length) return;
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td class="td-mono">${escHtml(r.artikelnummer || r.nr || '—')}</td>
        <td>${escHtml(r.bezeichnung || '—')}</td>
        <td>${escHtml(r.warengruppe || '—')}</td>
        <td>${escHtml(r.einheit || '—')}</td>
        <td>${escHtml(String(r.bestand !== '' ? r.bestand : '—'))}</td>
        <td>${escHtml(String(r.mindestbestand !== '' ? r.mindestbestand : '—'))}</td>
        <td>${escHtml(r.lagerort || '—')}</td>
        <td>${badge(r.status || 'Aktiv')}</td>
        <td><button class="btn btn-sm btn-ghost" data-navigate="sites/Artikel.html" data-edit-id="${escHtml(r.id)}">${EDIT_SVG}</button></td>
      </tr>`).join('');
  }

  function renderArtikelbewegung(tbody) {
    const rows = ADLStore.bewegungen.getAll();
    if (!rows.length) return;
    tbody.innerHTML = rows.map(r => `
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
      </tr>`).join('');
  }

  /* ================================================================
     Seitenerkennung & automatisches Tabellen-Rendering
     ================================================================ */

  const TITLE_MAP = {
    'Artikeldatenbank':     renderArtikeldatenbank,
    'Artikelbewegung':      renderArtikelbewegung,
    'Bestelldatenbank':     renderBestelldatenbank,
    'Lieferantenübersicht': renderLieferanten,
    'Wareneingänge':        renderWareneingaenge,
    'Wartungsdatenbank':    renderWartungsdatenbank,
    'Geräteübersicht':      renderGeraeteuebersicht,
    'Wartungshistorie':     renderWartungshistorie,
  };

  function tryRender(root) {
    const title   = root.querySelector('.section-title')?.textContent?.trim();
    const renderer = title ? TITLE_MAP[title] : null;
    if (!renderer) return;
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

})();
