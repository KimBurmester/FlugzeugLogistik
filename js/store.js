/* ==========================================================================
   ADL – Client-Side Data Store
   Persistenz: localStorage   Namespace: adl_*
   Zugriff: window.ADLStore
   ========================================================================== */

(function (global) {
  'use strict';

  /* ---- Generic Collection ------------------------------------------- */

  class Collection {
    constructor(name) {
      this._key = 'adl_' + name;
    }

    _read() {
      try { return JSON.parse(localStorage.getItem(this._key)) || []; }
      catch { return []; }
    }

    _write(data) {
      try { localStorage.setItem(this._key, JSON.stringify(data)); }
      catch (e) { console.warn('[ADLStore] localStorage write failed:', e); }
    }

    getAll()              { return this._read(); }
    getById(id)           { return this._read().find(r => r.id === id) ?? null; }
    findBy(field, value)  { return this._read().filter(r => r[field] === value); }
    count()               { return this._read().length; }
    clear()               { this._write([]); }

    add(record) {
      const data = this._read();
      record = {
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        erstelltAm: new Date().toISOString(),
        ...record,
      };
      data.push(record);
      this._write(data);
      return record;
    }

    update(id, changes) {
      const data = this._read();
      const idx  = data.findIndex(r => r.id === id);
      if (idx === -1) return null;
      data[idx]  = { ...data[idx], ...changes, geaendertAm: new Date().toISOString() };
      this._write(data);
      return data[idx];
    }

    remove(id) {
      this._write(this._read().filter(r => r.id !== id));
    }

    /* Nächste laufende Nummer: PREFIX-YYYY-NNNN */
    nextNr(prefix, field = 'nr') {
      const year  = new Date().getFullYear();
      const nums  = this._read()
        .map(i => parseInt((i[field] || '').split('-').pop()))
        .filter(n => !isNaN(n));
      const next  = nums.length ? Math.max(...nums) + 1 : 1;
      return `${prefix}-${year}-${String(next).padStart(4, '0')}`;
    }
  }

  /* ---- Entity-Stores ------------------------------------------------ */

  const ADLStore = {
    artikel:              new Collection('artikel'),
    stuecklisten:         new Collection('stuecklisten'),
    auftraege:            new Collection('auftraege'),
    produktionsauftraege: new Collection('produktionsauftraege'),
    zuweisungen:          new Collection('zuweisungen'),
    qualitaetspruefungen: new Collection('qualitaetspruefungen'),
    bestellungen:         new Collection('bestellungen'),
    lieferanten:          new Collection('lieferanten'),
    wareneingaenge:       new Collection('wareneingaenge'),
    geraete:              new Collection('geraete'),
    wartungsauftraege:    new Collection('wartungsauftraege'),
  };

  /* ---- Seed-Daten (nur beim ersten Aufruf) -------------------------- */

  function seed() {

    /* Lieferanten */
    if (!ADLStore.lieferanten.count()) {
      [
        { nr:'LFR-0001', name:'Bosch Rexroth AG',                    warengruppe:'Hydraulik',          kontaktperson:'H. Meier',    telefon:'+49 9352 18-0',   bewertung:'Sehr gut',    status:'Aktiv' },
        { nr:'LFR-0002', name:'Parker Hannifin GmbH',                warengruppe:'Hydraulik',          kontaktperson:'S. Braun',    telefon:'+49 2131 401-0',  bewertung:'Gut',         status:'Aktiv' },
        { nr:'LFR-0003', name:'Hydac International GmbH',            warengruppe:'Hydraulik',          kontaktperson:'P. Müller',   telefon:'+49 6897 509-0',  bewertung:'Sehr gut',    status:'Aktiv' },
        { nr:'LFR-0004', name:'Festo SE & Co. KG',                   warengruppe:'Pneumatik',          kontaktperson:'A. Fischer',  telefon:'+49 711 347-0',   bewertung:'Gut',         status:'Aktiv' },
        { nr:'LFR-0005', name:'Siemens AG',                          warengruppe:'Elektronik',         kontaktperson:'T. Wagner',   telefon:'+49 89 636-00',   bewertung:'Befriedigend',status:'Aktiv' },
        { nr:'LFR-0006', name:'WAGO Kontakttechnik GmbH & Co. KG',   warengruppe:'Elektronik',         kontaktperson:'C. Schneider',telefon:'+49 571 887-0',   bewertung:'Gut',         status:'Aktiv' },
        { nr:'LFR-0007', name:'Würth Industrie Service GmbH & Co. KG',warengruppe:'Verbrauchsmaterial', kontaktperson:'R. Hoffmann', telefon:'+49 7940 15-0',   bewertung:'Befriedigend',status:'Aktiv' },
        { nr:'LFR-0008', name:'ifm electronic gmbh',                 warengruppe:'Elektronik',         kontaktperson:'M. Keller',   telefon:'+49 201 2422-0',  bewertung:'Sehr gut',    status:'Aktiv' },
      ].forEach(r => ADLStore.lieferanten.add(r));
    }

    /* Geräte */
    if (!ADLStore.geraete.count()) {
      [
        { nr:'GRT-0001', bezeichnung:'Hallenkran HK-500',       kategorie:'Fördertechnik',          halle:'Halle 1',      hersteller:'Demag Cranes',         seriennr:'DCR-500-2018-041',   letzterService:'2026-01-10', naechsterService:'2026-07-10', status:'Aktiv',      tragfaehigkeit:5000, tragfaehigkeitEinheit:'kg' },
        { nr:'GRT-0002', bezeichnung:'Elektrostapler ES-30',    kategorie:'Flurförderfahrzeuge',    halle:'Halle 2',      hersteller:'Linde Material Handling',seriennr:'LMH-E30-2020-117',   letzterService:'2025-12-05', naechsterService:'2026-06-05', status:'Aktiv',      tragfaehigkeit:3000, tragfaehigkeitEinheit:'kg' },
        { nr:'GRT-0003', bezeichnung:'CNC-Fräsmaschine VF-4',  kategorie:'Produktionsmaschinen',   halle:'Halle 3',      hersteller:'Haas Automation',        seriennr:'SN-VF4-2019-0042',   letzterService:'2025-11-18', naechsterService:'2026-01-20', status:'Aktiv' },
        { nr:'GRT-0004', bezeichnung:'Rolltor Nord',            kategorie:'Halleninfrastruktur',    halle:'Halle 1',      hersteller:'Hörmann KG',             seriennr:'HRM-RT-2017-0019',   letzterService:'2026-01-12', naechsterService:'2026-07-12', status:'Aktiv' },
        { nr:'GRT-0005', bezeichnung:'Stromverteiler HV-1A',   kategorie:'Elektrotechnik',         halle:'Halle 1',      hersteller:'Siemens AG',             seriennr:'SIE-SV-2016-1A07',                                naechsterService:'2026-01-15', status:'In Wartung' },
        { nr:'GRT-0006', bezeichnung:'Kompressor KA-45',        kategorie:'Druckluft & Hydraulik',  halle:'Halle 2',      hersteller:'Atlas Copco',            seriennr:'AC-GA45-2021-0803',  letzterService:'2025-09-03', naechsterService:'2026-01-22', status:'Aktiv' },
        { nr:'GRT-0007', bezeichnung:'Gabelstapler GS-25',      kategorie:'Flurförderfahrzeuge',    halle:'Außengelände', hersteller:'Toyota Industries',      seriennr:'TYT-8FBE25-2018-552',                             naechsterService:'2026-01-18', status:'Defekt',     tragfaehigkeit:2500, tragfaehigkeitEinheit:'kg' },
        { nr:'GRT-0008', bezeichnung:'Brückenkran BK-800',      kategorie:'Fördertechnik',          halle:'Halle 3',      hersteller:'Konecranes',             seriennr:'KCR-CXT800-2015-030',letzterService:'2025-10-07', naechsterService:'2026-02-02', status:'In Wartung', tragfaehigkeit:8000, tragfaehigkeitEinheit:'kg' },
        { nr:'GRT-0009', bezeichnung:'Schweißroboter SR-6',     kategorie:'Produktionsmaschinen',   halle:'Halle 2',      hersteller:'KUKA Robotics',          seriennr:'KUK-KR6-2022-1140',  letzterService:'2025-10-14', naechsterService:'2026-04-14', status:'Aktiv' },
        { nr:'GRT-0010', bezeichnung:'Schiebetor Ost',          kategorie:'Halleninfrastruktur',    halle:'Halle 2',      hersteller:'Novoferm',               seriennr:'NVF-ST-2019-0062',   letzterService:'2025-08-20', naechsterService:'2026-02-20', status:'Aktiv' },
      ].forEach(r => ADLStore.geraete.add(r));
    }

    /* Bestellungen */
    if (!ADLStore.bestellungen.count()) {
      [
        { nr:'BST-2026-0001', lieferant:'Bosch Rexroth AG',                   bestelldatum:'2026-01-02', lieferdatum:'2026-01-15', gesamtwert:4850,  positionen:[], status:'Abgeschlossen' },
        { nr:'BST-2026-0002', lieferant:'Parker Hannifin GmbH',               bestelldatum:'2026-01-05', lieferdatum:'2026-01-20', gesamtwert:1240,  positionen:[], status:'In Lieferung'  },
        { nr:'BST-2026-0003', lieferant:'Hydac International GmbH',           bestelldatum:'2026-01-07', lieferdatum:'2026-01-18', gesamtwert:7320,  positionen:[], status:'Abgeschlossen' },
        { nr:'BST-2026-0004', lieferant:'Festo SE & Co. KG',                  bestelldatum:'2026-01-10', lieferdatum:'2026-01-25', gesamtwert:2180,  positionen:[], status:'Offen'         },
        { nr:'BST-2026-0005', lieferant:'Siemens AG',                         bestelldatum:'2026-01-12', lieferdatum:'2026-01-28', gesamtwert:9640,  positionen:[], status:'In Lieferung'  },
        { nr:'BST-2026-0006', lieferant:'WAGO Kontakttechnik GmbH',           bestelldatum:'2026-01-15', lieferdatum:'2026-01-30', gesamtwert:3450,  positionen:[], status:'Offen'         },
        { nr:'BST-2026-0007', lieferant:'Würth Industrie Service GmbH',       bestelldatum:'2026-01-18', lieferdatum:'2026-02-02', gesamtwert:870,   positionen:[], status:'Offen'         },
        { nr:'BST-2026-0008', lieferant:'ifm electronic gmbh',                bestelldatum:'2026-01-20', lieferdatum:'2026-02-05', gesamtwert:5120,  positionen:[], status:'Offen'         },
      ].forEach(r => ADLStore.bestellungen.add(r));
    }

    /* Wareneingänge */
    if (!ADLStore.wareneingaenge.count()) {
      [
        { nr:'WE-2026-0001', bestellnr:'BST-2026-0001', lieferant:'Bosch Rexroth AG',       artikel:'Hydraulikschlauch DN16',       mengeGeliefert:10,  einheit:'Stück',  lieferschein:'LS-BR-240041', datum:'2026-01-15', status:'Abgeschlossen (i.O.)' },
        { nr:'WE-2026-0002', bestellnr:'BST-2026-0001', lieferant:'Bosch Rexroth AG',       artikel:'O-Ring 50×3 NBR',              mengeGeliefert:200, einheit:'Stück',  lieferschein:'LS-BR-240041', datum:'2026-01-15', status:'Abgeschlossen (i.O.)' },
        { nr:'WE-2026-0003', bestellnr:'BST-2026-0001', lieferant:'Bosch Rexroth AG',       artikel:'Kugelventil ½"',               mengeGeliefert:5,   einheit:'Stück',  lieferschein:'LS-BR-240041', datum:'2026-01-15', status:'In Prüfung'            },
        { nr:'WE-2026-0004', bestellnr:'BST-2026-0003', lieferant:'Hydac International GmbH',artikel:'Drucksensor 0–400 bar',       mengeGeliefert:12,  einheit:'Stück',  lieferschein:'LS-HY-260018', datum:'2026-01-18', status:'Abgeschlossen (i.O.)' },
        { nr:'WE-2026-0005', bestellnr:'BST-2026-0003', lieferant:'Hydac International GmbH',artikel:'Steuerventil SV-300',         mengeGeliefert:4,   einheit:'Stück',  lieferschein:'LS-HY-260018', datum:'2026-01-18', status:'Abgelehnt (n.i.O.)'   },
        { nr:'WE-2026-0006', bestellnr:'BST-2026-0002', lieferant:'Parker Hannifin GmbH',   artikel:'Pneumatikzylinder Ø50 Hub 200',mengeGeliefert:8,   einheit:'Stück',  lieferschein:'LS-PK-260005', datum:'2026-01-20', status:'Abgeschlossen (i.O.)' },
        { nr:'WE-2026-0007', bestellnr:'BST-2026-0002', lieferant:'Parker Hannifin GmbH',   artikel:'Hydrauliköl HLP 46',           mengeGeliefert:200, einheit:'Liter',  lieferschein:'LS-PK-260005', datum:'2026-01-20', status:'In Prüfung'            },
        { nr:'WE-2026-0008', bestellnr:'BST-2026-0004', lieferant:'Festo SE & Co. KG',      artikel:'Kabelkanal 40×60 mm',          mengeGeliefert:50,  einheit:'Meter',  lieferschein:'LS-FE-260009', datum:'2026-01-22', status:'Abgeschlossen (i.O.)' },
      ].forEach(r => ADLStore.wareneingaenge.add(r));
    }

    /* Wartungsaufträge */
    if (!ADLStore.wartungsauftraege.count()) {
      [
        { nr:'IH-2026-0001', geraet:'Hallenkran HK-500',       kategorie:'Fördertechnik',         halle:'Halle 1',      wartungsart:'Wartung (präventiv)',  prioritaet:'Normal',   datum:'2026-01-10', techniker:'T. Weber',  status:'Abgeschlossen', materialien:[] },
        { nr:'IH-2026-0002', geraet:'Rolltor Nord',             kategorie:'Halleninfrastruktur',   halle:'Halle 1',      wartungsart:'Reparatur (korrektiv)',prioritaet:'Hoch',     datum:'2026-01-12', techniker:'M. Koch',   status:'Abgeschlossen', materialien:[] },
        { nr:'IH-2026-0003', geraet:'Stromverteiler HV-1A',    kategorie:'Elektrotechnik',        halle:'Halle 1',      wartungsart:'Prüfung (gesetzlich)', prioritaet:'Hoch',     datum:'2026-01-15', techniker:'R. Schulz', status:'In Arbeit',     materialien:[] },
        { nr:'IH-2026-0004', geraet:'Gabelstapler GS-25',       kategorie:'Flurförderfahrzeuge',   halle:'Außengelände', wartungsart:'Reparatur (korrektiv)',prioritaet:'Dringend', datum:'2026-01-18', techniker:'T. Weber',  status:'Offen',         materialien:[] },
        { nr:'IH-2026-0005', geraet:'CNC-Fräsmaschine VF-4',   kategorie:'Produktionsmaschinen',  halle:'Halle 3',      wartungsart:'Wartung (präventiv)',  prioritaet:'Normal',   datum:'2026-01-20', techniker:'K. Braun',  status:'Geplant',       materialien:[] },
        { nr:'IH-2026-0006', geraet:'Kompressor KA-45',         kategorie:'Druckluft & Hydraulik', halle:'Halle 2',      wartungsart:'Inspektion',          prioritaet:'Normal',   datum:'2026-01-22', techniker:'M. Koch',   status:'Geplant',       materialien:[] },
        { nr:'IH-2026-0007', geraet:'Elektrostapler ES-30',     kategorie:'Flurförderfahrzeuge',   halle:'Halle 2',      wartungsart:'Wartung (präventiv)',  prioritaet:'Niedrig',  datum:'2026-01-25', techniker:'R. Schulz', status:'Offen',         materialien:[] },
        { nr:'IH-2026-0008', geraet:'Brückenkran BK-800',       kategorie:'Fördertechnik',         halle:'Halle 3',      wartungsart:'Inspektion',          prioritaet:'Hoch',     datum:'2026-02-02', techniker:'T. Weber',  status:'In Arbeit',     materialien:[] },
      ].forEach(r => ADLStore.wartungsauftraege.add(r));
    }
  }

  /* ---- Exportieren -------------------------------------------------- */

  global.ADLStore = ADLStore;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', seed);
  } else {
    seed();
  }

})(window);
