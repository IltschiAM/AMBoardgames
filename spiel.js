// Hier die Adresse deiner Apps-Script-Web-App eintragen (endet auf /exec)
const API = 'https://script.google.com/macros/s/AKfycbyI7rij4IFxR2gXUgIUXUUK5A02vtnq0AVyWF043x9W_VTuXCqbsPUZDmSuuWPqc4gN/exec';

// Texte der Oberfläche, Hilfe und Einleitung stehen in den Sprachdateien sprachen/de.js, en.js, fr.js (globale Objekte TX, HILFE, INTRO je Sprache); Fallback: Englisch, dann Deutsch


// Animationstempo in Millisekunden, hier zentral änderbar
const T_WURF = 600;     // Mindestdauer der Würfelanimation (Drehphase)
const T_AUSLAUF = 550;  // so lange rollt der Würfel nach dem Stopp aus (wie die CSS-Transition von #cube in style.css): die Figur startet erst danach
const T_WURF_NACH = 250; // kurze Pause, in der die gewürfelte Zahl zu sehen ist, bevor die Figur losläuft
const T_SCHRITT = 350;  // Dauer pro Feld beim Ziehen
const T_SPRUNG = 600;   // Pause vor einem Sprung (Glücks-/Pechfeld)
const PUNKTE_SCHRITT = 5;   // Punkte pro gezogenem Feld, nur Fallback: der Server meldet den gültigen Wert (S.zug, Eigenschaft ZUG)
const zugWert = () => S && S.zug !== undefined ? S.zug : PUNKTE_SCHRITT;
const FX_FLUG = 60;        // Flugweite der +x-Punkte pro Feld in px (Richtung Statuszeile)
const FX_GROESSE = 1.4;    // Schriftgröße der +x-Punkte pro Feld in rem
const FX_MS = 1000;        // Dauer dieser Animation in ms
const BEL_GROESSE = 2.6;   // Schriftgröße der Punkte/Würfel-Anzeige nach Quiz und Minispiel in rem (Icons wachsen mit)
const BEL_MS = 3600;       // Dauer dieser Anzeige in ms
const ZAHL_MS = 1200;       // Dauer des Hoch-/Herunterzählens der Zahlen in der Statuszeile in ms
const TOAST_MS = 3500;     // Anzeigedauer der Meldungen (Glücksfeld, Fehler usw.) in ms
const TOAST_QUIZ_MS = 1500;  // Anzeigedauer der Meldung, solange eine Quiz-/Minispielkarte offen ist (Meldung sitzt dann ganz oben)
const CHAT_INTERVALL_MS = 60000;        // Chat: Abfrage im Hintergrund, ob es neue Nachrichten gibt (nur für den Marker am Menüpunkt)
const CHAT_INTERVALL_OFFEN_MS = 30000;  // Chat: Abfrage, solange der Chat-Reiter offen ist
const CHAT_LANG_MS = 550;                // Chat: so lange (ms) auf eine Nachricht drücken, bis das Menü erscheint
const CHAT_MAX = 1024;                  // Zeichen je Nachricht (wie CHAT.maxZeichen in Code.gs)
const MARKER_ABSTAND = 5;   // Pixel: so weit stehen Würfelzahl und Doppel-Chance-Marker weiter außen am Würfelbutton (bei 100 % Würfelgröße, wächst mit der Größe); 0 = bisherige Position, größer = weiter außen
const API_RETRIES = 3;       // Wiederholungen einer Serveranfrage nach einem Verbindungsfehler (0 = aus); der Server erkennt wiederholte Anfragen und führt sie nicht doppelt aus
const API_RETRY_MS = 1500;   // Wartezeit vor der 1. Wiederholung, danach jeweils verdoppelt
const API_TIMEOUT_MS = 40000;   // so lange wartet eine einzelne Anfrage auf den Server, dann gilt sie als Verbindungsfehler
const DIAG_MAX = 20;         // so viele Verbindungsfehler merkt sich das Gerät, bis sie ins Blatt Protokoll gemeldet werden
const STAT_WUERFEL = false;  // true = Würfelzahl auch in der Spielerinfo oben anzeigen, false = nur am Würfel-Button
const TOAST_GROESSE = 1.7; // Schriftgröße der Meldungen in rem
const LEGENDE_MS = 6000;  // Anzeigedauer der Legende in ms (Fade-in, dann automatisch Fade-out)
const HIST_MAX = 60;       // Anzahl der Meldungen im Verlauf dieser Sitzung
const KAM_Y3D = 0.48;   // Höhe der Spielfigur im Brettfenster in der 3D-Ansicht als Anteil der Fensterhöhe (0 = ganz oben, 1 = ganz unten; kleiner = Figur höher, weniger Raum über dem Brett)
const KAM_Y2D = 0.48;   // dasselbe für die 2D-Ansicht
const TILT = 30;        // Voreinstellung Kippwinkel der 3D-Ansicht in Grad (0 = flach); jeder Spieler kann es im ⚙-Menü am Brett ändern
const PERSP = 520;      // Voreinstellung Perspektive in px (kleiner = stärkerer Trapez-Effekt)
const SCHNEE_TIEFE = 1.4;   // Weihnachts-Schnee auf den Feldern: wie weit die Schneekappen ins Feld hineinwachsen (Multiplikator der Schneehöhe: 1 = flach, 1.4 = deutlich, 2 = sehr tief)
const SCHNEE_VORN = true;   // true = der Schnee liegt vor den Zahlen und Symbolen und überdeckt deren Oberkante leicht, false = dahinter
const SCHNEE_PUFF = 1;   // Schnee-Puff beim Landen der Spielfigur: Größenfaktor (1 = normal, 0.6 = klein, 1.6 = groß); die Größe wächst zusätzlich mit der Schneehöhe
const DEKO_ALPHA = 0.6;   // Dekoration auf freien Feldern: Deckkraft (1 = voll, 0.6 = dezent transparent, 0.4 = sehr zart)
const DEKO_SAET = 0.7;    // Dekoration auf freien Feldern: Farbsättigung (1 = volle Farben, 0.7 = gedämpft, 0 = grau)
const PERSP_SICHER = 0.6;   // 3D-Ansicht: Anteil der Perspektive-Entfernung, den die nächste Brettkante höchstens erreichen darf (0.6 = sicher; näher an 1 kommt das Brett der Kamera zu nahe und verschwindet). Wird er überschritten, schwächt kamera() die Perspektive automatisch ab.
const SCHNEE_DECKUNG = 0.6;   // Weihnachts-Schnee: Transparenzfaktor (1 = wie eingestellt, 0.6 = deutlich durchsichtiger, 0.3 = nur ein zarter Hauch); wirkt zusätzlich zur Transparenz, die mit den Spieltagen abnimmt
const SCHNEE_ANTEIL = 45;   // Weihnachts-Schnee: Prozent der Felder, die Schnee bekommen (100 = alle); die Auswahl ist zufällig verteilt, aber für jedes Feld fest (bei jedem Laden und für alle Spieler gleich)
const schneeFeld = n => SCHNEE_ANTEIL >= 100 || ((n * 2654435761) >>> 0) / 4294967296 * 100 < SCHNEE_ANTEIL;
const ZOOM = 100;       // Voreinstellung Brettgröße in % (100 = die 10 Spalten füllen genau die Breite)

// Feldplan: Feldnummern je Feldtyp
const PLAN = {
  Q: [4,17,30,44,56,65,76,82,92,97],
  L: [6,41,69], B: [12,34,61], W: [22,50,80],
  G: [9,27,48,72,90], P: [19,39,58,78,86], S: [37,52,67],
  ZW: [15,46,74,88,95], ZP: [25,63,71,84,99],
  R: [20,55,85],   // Glücksradfelder (wie GLUECK.felder in Code.gs)
  D: [60]   // Doppel-Chance-Feld (wie DOPPEL_FELDER in Code.gs)
};
const ic = d => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
const icv = (vb, d) => '<svg viewBox="' + vb + '" aria-hidden="true">' + d + '</svg>';   // Icon mit eigenem Ausschnitt
const LN = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const SYM = {Q:'?',
  L: icv('4 6 84 84', '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="7"><circle cx="58" cy="24" r="6.5" fill="currentColor" stroke="none"/><path d="M54 30L46 50"/><path d="M46 50L32 60L22 65"/><path d="M46 50L60 56L66 74"/><path stroke-width="6" d="M52 34L38 42L30 38"/><path stroke-width="6" d="M52 34L66 38L74 30"/><path stroke-width="5" opacity=".6" d="M8 40H18M12 49H22"/></g>'),
  B: icv('9 16 84 62', '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="7"><circle cx="75" cy="45" r="14" stroke-width="5"/><circle cx="75" cy="45" r="7" stroke-width="4"/><circle cx="75" cy="45" r="3" fill="currentColor" stroke="none"/><path d="M26 20Q42 45 26 70"/><path stroke-width="3" d="M26 20V70"/><path stroke-width="6" d="M14 45H60"/><path stroke-width="5" d="M53 38L61 45L53 52"/></g>'),
  W: icv('24 20 70 56', '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"><circle cx="58" cy="30" r="6.5" fill="currentColor" stroke="none"/><path d="M36 50L55 34"/><path d="M36 50L62 56L82 54"/><path stroke-width="5" opacity=".7" d="M36 50L60 62L78 60"/><path stroke-width="6" d="M52 36L70 38L84 34"/><path stroke-width="5" opacity=".8" d="M52 36L66 44L78 40"/><path stroke-width="5" opacity=".6" d="M26 76H90"/></g>'),
  G: ic('<path d="M12 5l8 14H4z" fill="currentColor"/>'),
  P: ic('<path d="M12 19L4 5h16z" fill="currentColor"/>'),
  S: icv('17 12 66 76', '<path d="M50 18L75 28C75 58 50 78 50 82C50 78 25 58 25 28Z" fill="currentColor" fill-opacity=".25" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/><path d="M50 28L65 34C65 54 50 67 50 70L50 28Z" fill="#fff" fill-opacity=".35"/>'),
  ZW: ic('<rect x="4" y="4" width="16" height="16" rx="3.5" ' + LN + '/><circle cx="9" cy="9" r="1.6" fill="currentColor"/><circle cx="15" cy="15" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>'),
  ZP: ic('<path d="M12 3l2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.2l-5.6 3.1 1.2-6.3L3 9.6l6.3-.8z" fill="currentColor"/>'),
  D: icv('4 4 56 56', '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="5"><rect x="8" y="8" width="30" height="30" rx="7"/><rect x="26" y="26" width="30" height="30" rx="7" style="fill:var(--dfill,#0c1420)"/></g><g fill="currentColor"><circle cx="16" cy="16" r="3.2"/><circle cx="29" cy="16" r="3.2"/><circle cx="16" cy="29" r="3.2"/><circle cx="33" cy="33" r="3.2"/><circle cx="49" cy="33" r="3.2"/><circle cx="41" cy="41" r="3.2"/><circle cx="33" cy="49" r="3.2"/><circle cx="49" cy="49" r="3.2"/></g>'),
  TROPHY: ic('<path ' + LN + ' d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 20h8"/>'),
  R: ic('<circle cx="12" cy="12" r="9" ' + LN + '/><path ' + LN + ' d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/>'),
  FIN: ic('<path ' + LN + ' d="M6 21V4M6 5h12l-3 4 3 4H6"/>')};


const SPR = {9:4, 19:-3, 27:5, 39:-4, 48:6, 58:-5, 72:3, 78:-5, 86:-4, 90:4};  // Sprungweiten, wie in Code.gs
let FELDDREHS = 1;   // Freidrehs je Glücksradfeld (der Server meldet den gültigen Wert)
const marke = (n, ty) => SPR[n] ? SYM[ty] + '<u>' + (SPR[n] > 0 ? '+' : '−') + Math.abs(SPR[n]) + '</u>'
  : ty === 'ZW' ? SYM.ZW + '<u>+2</u>' : ty === 'ZP' ? SYM.ZP + '<u>+25</u>' : ty === 'R' ? SYM.R + '<u>+' + FELDDREHS + '</u>' : n === 100 ? SYM.FIN : n === 1 ? 'START' : (SYM[ty] || '');
const $ = s => document.querySelector(s);
const typ = {};
for (const t in PLAN) PLAN[t].forEach(n => typ[n] = t);
let EV = null, FINALE_GEZEIGT = false;   // EV = Event-Status vom Server (vorbei, gesperrt, ende, bis); FINALE_GEZEIGT: Finale-Fenster pro Anmeldung nur einmal automatisch
let S = null, R = null, LOG = [], L = 'de', F = '', TAB = 'spiel', APW = '', AL = [], ASELS = new Set();
const SPRACHEN = ['de', 'en', 'fr'];   // verfügbare Sprachen (Sprachdateien in sprachen/); neue Sprache: Datei ergänzen, hier eintragen und eine Option im Sprachwähler (index.html) hinzufügen
try { const gesp = localStorage.getItem('sl'), nl = String(navigator.language || '').slice(0, 2).toLowerCase(); L = SPRACHEN.includes(gesp) ? gesp : SPRACHEN.includes(nl) ? nl : 'en'; } catch (e) {}
const tx = k => (TX[L] && TX[L][k]) || TX.en[k] || TX.de[k] || k;   // Text in der gewählten Sprache; fehlt er, gilt Englisch, danach Deutsch
const t = (k, ...a) => tx(k).replace(/\{(\d)\}/g, (m, i) => a[i]);
const hilfeL = () => HILFE[L] || HILFE.en, introL = () => INTRO[L] || INTRO.en;   // Hilfe und Einleitung der Sprache, sonst Englisch
const lv = x => x && typeof x === 'object' && !Array.isArray(x) ? (x[L] || x.en || x.de) : x;   // mehrsprachige Felder {de, en, fr} in der gewählten Sprache (Fallback Englisch, dann Deutsch); alte einsprachige Werte bleiben gültig

function sprache() {
  document.documentElement.lang = L;
  document.title = t('title');
  $('#h1').textContent = t('title');
  $('#lang').value = L;
  document.querySelectorAll('[data-i]').forEach(e => e.textContent = t(e.dataset.i));
  document.querySelectorAll('[data-p]').forEach(e => e.placeholder = t(e.dataset.p));
  document.querySelectorAll('[data-al]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.al)); e.title = t(e.dataset.al); });
  legende();
  rangOptionen();
  hilfeZeige();
  eventInfo(); teamInfo(); panelSync();
  if (S) zeige();
  STILL = true; showLog(); setTimeout(() => { STILL = false; }, 0);   // beim Sprachwechsel keine Meldung neu einblenden
}
function showLog() {
  $('#log').classList.remove('err');
  $('#log').textContent = LOG.map(c => {
    const [k, ...a] = c.split(':');
    return k === 'ST' ? t('station', t(a[0])) : t(k, ...a);
  }).join(' ');
}

const MARKER = '<div class="gs"></div><div class="mi"><svg viewBox="0 -12 40 58" aria-hidden="true"><defs>' +
  '<radialGradient id="mkh" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".22" stop-color="#fff" stop-opacity=".3"/><stop offset=".65" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>' +
  '<linearGradient id="mkc" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset=".32" stop-color="#fff" stop-opacity=".3"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>' +
  '<linearGradient id="mkb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3a4a60"/><stop offset=".5" stop-color="#121a26"/><stop offset="1" stop-color="#05080d"/></linearGradient></defs>' +
  '<ellipse cx="20" cy="39.5" rx="18" ry="5.5" fill="#05080d"/><path d="M2 36.5v3c0 3 8 5.5 18 5.5s18-2.5 18-5.5v-3z" fill="url(#mkb)"/><ellipse cx="20" cy="36.5" rx="18" ry="5.5" fill="#2a3a4f"/>' +
  '<ellipse cx="20" cy="36.3" rx="14" ry="4.3" fill="#05080d"/><ellipse cx="20" cy="36.3" rx="14" ry="4.3" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<path d="M20 14L31 34.5Q20 39 9 34.5Z" fill="currentColor"/><path d="M20 14L31 34.5Q20 39 9 34.5Z" fill="url(#mkc)"/>' +
  '<circle cx="20" cy="10" r="7.8" fill="currentColor"/><circle cx="20" cy="10" r="7.8" fill="url(#mkh)"/><g id="mkacc"></g></svg></div>';
// Saison-Zubehör der Spielfigur auf dem Brett: der Server meldet die aktive Saison (Skripteigenschaft SAISON), jeder Spieler kann es in den Brett-Einstellungen abschalten.
// Koordinaten wie in MARKER (viewBox 0 0 40 46, Kopf: Mitte 20/10, Radius 7.8). Weitere Saisons (ostern, sommer, halloween): hier einen Eintrag ergänzen.
const SAISON_ACC = {
  weihnachten: `<path d="M12 5.8C12.4-1 15.5-6.5 21-7C26-7.4 29-3.5 30-.5L28.4 5.8Z" fill="#d9253c" stroke="#6e0f1c" stroke-width=".7" stroke-linejoin="round"/><path d="M12 5.8C12.4-1 15.5-6.5 21-7C26-7.4 29-3.5 30-.5L28.4 5.8Z" fill="url(#mkc)"/><rect x="10.8" y="3.2" width="18.4" height="4.6" rx="2.3" fill="#fff" stroke="#b9c3cc" stroke-width=".6"/><rect x="10.8" y="3.2" width="18.4" height="4.6" rx="2.3" fill="url(#mkc)" opacity=".6"/><circle cx="30.2" cy="-.8" r="2.7" fill="#fff" stroke="#b9c3cc" stroke-width=".6"/><circle cx="30.2" cy="-.8" r="2.7" fill="url(#mkh)"/>`   // Weihnachtsmann-Mütze: rote Kappe, weißer Rand, Bommel
};
const saisonAktiv = () => !!(S && SAISON_ACC[S.saison]);
const FX_STD = {muetze: true, schnee: true, lichter: true, puff: true, deko: true};
function accZeichnen() {   // Saison-Deko: Mütze der Figur, Schnee, Lichterkette, Puff und Dekoration auf dem Brett; jeder Effekt einzeln über die Skripteigenschaften SAISON_<EFFEKT> schaltbar (S.saisonFx), alles zusammen im Spieler-Schalter (AP.saison)
  const fx = Object.assign({}, FX_STD, S && S.saisonFx), an = saisonAktiv() && AP.saison, key = an ? S.saison : '', g = $('#mkacc'), b = $('#brett');
  const figKey = an && fx.muetze ? S.saison : '';
  if (g && g.dataset.k !== figKey) { g.innerHTML = figKey ? SAISON_ACC[figKey] : ''; g.dataset.k = figKey; }
  if (b) {   // CSS in style.css reagiert auf data-saison und data-fx; --sn = Spielfortschritt 0 bis 1 (Schnee wird mit den Spieltagen dicker)
    if (b.dataset.saison !== key) b.dataset.saison = key;
    const liste = an ? ['schnee', 'lichter', 'puff', 'deko'].filter(k => fx[k]).join(' ') : '';
    if (b.dataset.fx !== liste) b.dataset.fx = liste;
    b.style.setProperty('--sn', String(Math.max(0, Math.min(1, S && Number(S.schnee) >= 0 ? Number(S.schnee) : 0))));
  }
  panelSync();
}
function schneePuff(n, gross) {   // Schnee-Puff, wenn die Figur auf Feld n landet: Wolke und Flocken, je dicker der Schnee auf den Feldern, desto größer (gross = Endfeld, sonst kleiner)
  const b = $('#brett'), f = $('#f' + n);
  if (!b || !f || b.dataset.saison !== 'weihnachten' || !(b.dataset.fx || '').split(' ').includes('puff')) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sn = Math.max(0, Math.min(1, parseFloat(b.style.getPropertyValue('--sn')) || 0)), h = (0.06 + 0.17 * sn) * SCHNEE_TIEFE;   // Schneehöhe als Anteil der Feldgröße
  const sc = SCHNEE_PUFF * (0.6 + 1.4 * Math.min(1, h / 0.32)) * (gross ? 1 : 0.55), w = f.offsetWidth, p = el('div', '', 'puff');
  p.style.left = (f.offsetLeft + w / 2) + 'px'; p.style.top = (f.offsetTop + f.offsetHeight * 0.58) + 'px'; p.style.setProperty('--pms', Math.round(650 + 250 * sc) + 'ms');
  const mk = (sz, dx, dy, cls) => { const i = el('i', '', cls || ''); i.style.setProperty('--sz', Math.round(sz) + 'px'); i.style.setProperty('--dx', Math.round(dx) + 'px'); i.style.setProperty('--dy', Math.round(dy) + 'px'); p.append(i); };
  mk(w * (0.8 + 0.55 * sc), 0, -w * 0.1, 'w');   // weiche Wolke
  const anz = Math.round((5 + 7 * sn) * Math.max(0.6, sc * 0.8));
  for (let k = 0; k < anz; k++) { const wi = Math.random() * 6.2832, d = w * (0.3 + 0.32 * sc) * (0.55 + 0.45 * Math.random()); mk((4 + 6 * Math.random()) * Math.min(1.6, 0.7 + 0.5 * sc), Math.cos(wi) * d, Math.sin(wi) * d * 0.75 - w * 0.18); }
  b.append(p); setTimeout(() => p.remove(), 1000 + 250 * sc);
}
function deko(n, ty) {   // Weihnachts-Dekoration auf freien Feldern (ohne Sonderfunktion, nicht Start/Ziel): etwa 60 % der Felder bekommen eines von 5 Motiven (Tanne, 2 Kerzen, Schneemann, Kugel; bewusst keine Geschenke, die wie ein Bonusfeld wirken würden), Seite wechselt; sichtbar nur bei aktiver Saison (CSS)
  if (ty || n === 1 || n === 100) return '';
  const r = (n * 37 + 11) % 10;
  return r > 5 ? '' : '<i class="dk d' + (r % 5 + 1) + ((n * 13) % 2 ? ' l' : '') + '"></i>';
}
function brett() {
  let h = '';
  for (let r = 9; r >= 0; r--) {
    const z = [];
    for (let k = 1; k <= 10; k++) z.push(r * 10 + k);
    if (r % 2) z.reverse();
    z.forEach(n => {
      const ty = typ[n] || '';
      h += `<div class="f ${ty}${ty ? ' sp' : n === 1 ? ' st' : n === 100 ? ' fin' : ''}${schneeFeld(n) ? '' : ' ns'}" id="f${n}"><b>${marke(n, ty)}</b>${n}${deko(n, ty)}</div>`;
    });
  }
  $('#brett').innerHTML = h + '<div id="lichter"><i class="a"></i><i class="b"></i></div><div id="marker">' + MARKER + '</div>';
  $('#fb').innerHTML = '<div id="fbf"></div>' + ['Q', 'L', 'B', 'W'].map(ty => PLAN[ty].map(n => `<i class="${ty}" style="left:${(n - 1) / 99 * 100}%"></i>`).join('')).join('') + '<b id="fbich"></b>';
}
const LEG = [['Q', 'Q'], ['L', 'L'], ['B', 'B'], ['W', 'W'], ['G', 'lG'], ['P', 'lP'], ['S', 'S'], ['ZW', 'lZW'], ['ZP', 'lZP'], ['R', 'lR'], ['D', 'lD']];
function legende() {
  $('#legende').replaceChildren(...LEG.map(([ty, k]) => { const e = document.createElement('span'); e.className = ty; e.innerHTML = '<b>' + SYM[ty] + '</b>'; e.append(t(k)); return e; }));
}
function fbSet(n) {
  const p = (n - 1) / 99 * 100 + '%';
  $('#fbf').style.width = p; $('#fbich').style.left = p;
}

// ---- Kamera: das Brett ist größer als der Sichtbereich und folgt der Spielfigur ----
let ANS = '3d';   // Ansicht: '3d' = gekippt, '2d' = flach
try {
  ANS = localStorage.getItem('av') || ((window.innerWidth >= 720 && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) ? '3d' : '2d');
} catch (e) {}
const AP = {tilt: TILT, persp: PERSP, zoom: ZOOM, wgr: 100, seite: 'r', saison: true};   // persönliche Ansichtseinstellungen, pro Gerät gespeichert
try { const a = JSON.parse(localStorage.getItem('ap')); if (a) { ['tilt', 'persp', 'zoom', 'wgr'].forEach(x => { if (Number.isFinite(a[x])) AP[x] = a[x]; }); if (a.seite === 'l' || a.seite === 'r') AP.seite = a.seite; } } catch (e) {}
const CAM = {n: 1, px: 0, py: 0, ox: null, ueb: false};   // ox = Brettstelle (px) in der Bildmitte, wird nur bei Bedarf verschoben   // n = Feld im Fokus, px/py = Verschiebung per Finger, ueb = Gesamtansicht
function kamera(n, ms, sofort) {
  const k = $('#kamera'), w = $('#welt'), b = $('#brett');
  if (n) CAM.n = n;
  const f = $('#f' + CAM.n), W = k.clientWidth, H = k.clientHeight;
  if (!f || !W) return;   // Reiter nicht sichtbar
  const d3 = ANS === '3d' && !CAM.ueb;
  const zNah = d3 ? Math.max(0, b.offsetHeight - (f.offsetTop + f.offsetHeight / 2)) * Math.sin(AP.tilt * Math.PI / 180) : 0;   // so weit kommt die untere Brettkante bei der Kippung zum Betrachter; erreicht sie die Kamera (Perspektive-Entfernung), wird die Projektion ungültig und das Brett verschwindet
  const P = d3 ? Math.max(AP.persp, zNah / PERSP_SICHER) : 99999, vx = W / 2, vy = H * 0.3;   // Perspektive als Teil der Transformation (funktioniert auch dort, wo die CSS-Eigenschaft perspective ignoriert wird)
  const pre = `translate(${vx}px,${vy}px) perspective(${P}px) translate(${-vx}px,${-vy}px) `;
  let tf;
  if (CAM.ueb) {
    const sc = Math.min(W / b.offsetWidth, H / b.offsetHeight) * 0.97;
    tf = pre + `translate(${W / 2}px,${H / 2}px) rotateX(0deg) scale(${sc}) translate(${-b.offsetWidth / 2}px,${-b.offsetHeight / 2}px)`;
  } else {
    const cx = f.offsetLeft + f.offsetWidth / 2, cy = f.offsetTop + f.offsetHeight / 2, bw = b.offsetWidth;
    let ox = bw / 2;   // passt das Brett in die Breite, bleibt es mittig: es wird nur senkrecht geschoben
    if (bw <= W) CAM.ox = null;
    else {   // zu breit: seitlich erst nachführen, wenn die Figur die Totzone in der Mitte verlässt
      const dz = W * 0.2, half = W / 2; let o = CAM.ox === null ? cx : CAM.ox;
      if (cx < o - dz) o = cx + dz; else if (cx > o + dz) o = cx - dz;
      ox = CAM.ox = Math.max(half, Math.min(bw - half, o));
    }
    const mkTf = ty => pre + `translate(${W / 2 + CAM.px}px,${ty}px) rotateX(${d3 ? AP.tilt : 0}deg) scale(1) translate(${-ox}px,${-cy}px)`;
    let ty = H * (d3 ? KAM_Y3D : KAM_Y2D) + CAM.py;
    tf = mkTf(ty);
    if (!CAM.py) try {   // unten kein freier Raum: die Brettunterkante steht nie über der Unterkante des Fensters, die Figur in den ersten Reihen steht dann tiefer
      const p = new DOMMatrix(tf).transformPoint(new DOMPoint(ox, b.offsetHeight, 0, 1)), yb = p.y / p.w;
      if (p.w > 0.25 && Number.isFinite(yb) && yb < H) tf = mkTf(ty + Math.min(H - yb, H));   // nur bei gültiger Projektion (w > 0) und mit begrenzter Verschiebung: ein Punkt hinter der Kamera lieferte sonst unsinnige Werte und schob das Brett aus dem Bild
    } catch (e) {}
  }
  const sy = d3 ? 1 / Math.cos(AP.tilt * Math.PI / 180) : 1;
  k.style.setProperty('--sy', sy);   // Figur steht aufrecht: hebt die Stauchung durch die Kippung auf
  let sk = 0;   // die Perspektive neigt senkrechte Linien am Rand zur Mitte: die Figur wird gegengeneigt (skewX), sodass sie auf dem Bildschirm senkrecht steht
  try {
    const f2 = $('#f' + CAM.n), M = new DOMMatrix(tf), cx2 = f2.offsetLeft + f2.offsetWidth / 2, cy2 = f2.offsetTop + f2.offsetHeight / 2;
    const pr = (x, y) => { const p = M.transformPoint(new DOMPoint(x, y, 0, 1)); return p.x / p.w; };
    const x0 = pr(cx2, cy2), a = (pr(cx2 + 20, cy2) - x0) / 20, b = (pr(cx2, cy2 + 20) - x0) / 20;
    if (a > 0.05) sk = Math.atan(-b * sy / a);
  } catch (e) {}
  const mk2 = $('#marker'); if (mk2) mk2.style.setProperty('--sk', sk + 'rad');
  k.classList.toggle('sofort', !!sofort);
  w.style.transitionDuration = (sofort ? 0 : ms === undefined ? 450 : ms) + 'ms';
  w.style.transform = tf;
}
function marker(n, anim) {   // Spielfigur auf ein Feld setzen, mit oder ohne Gleiten
  const m = $('#marker'), f = $('#f' + n);
  if (!m || !f || !f.offsetWidth) return;
  m.classList.toggle('ohne', !anim);
  m.style.setProperty('--ms', T_SCHRITT + 'ms');
  m.style.left = (f.offsetLeft + f.offsetWidth / 2) + 'px'; m.style.top = (f.offsetTop + f.offsetHeight / 2) + 'px';
  if (!anim) void m.offsetWidth;
  if (anim) { const mi = m.querySelector('.mi'), gs = m.querySelector('.gs'); [mi, gs].forEach(e => { e.classList.remove('hop'); void e.offsetWidth; e.classList.add('hop'); }); }   // Hüpfer von Feld zu Feld
}
function groesse() {   // Feldgröße so wählen, dass die 10 Spalten in die Breite passen (Rand 8, Lücke 4, Rahmen 2 wie in style.css)
  const k = $('#kamera'), W = k.clientWidth;
  if (!W) return;
  k.style.setProperty('--k', Math.max(24, Math.floor((W - 58) / 10 * AP.zoom / 100)) + 'px');
}
function layoutSpiel() {   // nach Anmelden, Reiterwechsel, Drehen: Figur und Kamera ohne Animation auf den Stand setzen
  if (S && $('#kamera').clientWidth) { groesse(); marker(S.pos, false); fbSet(S.pos); kamera(S.pos, 0, true); }
}
function panelSync() {   // Regler und Werte im ⚙-Menü nachführen; Kippung/Perspektive wirken nur in 3D
  [['Tilt', 'tilt', '°'], ['Persp', 'persp', ''], ['Zoom', 'zoom', ' %'], ['Wgr', 'wgr', ' %']].forEach(([n, k, u]) => {
    $('#s' + n).value = AP[k]; $('#v' + n).textContent = AP[k] + u; $('#s' + n).disabled = ANS !== '3d' && (k === 'tilt' || k === 'persp');
  });
  const sb = $('#aSaison');   // Saison-Zubehör: der Schalter erscheint nur, solange eine Saison aktiv ist
  if (sb) { sb.classList.toggle('hide', !saisonAktiv()); sb.textContent = t('aSaisonT') + ': ' + t(AP.saison ? 'evAn' : 'evAus'); }
}
let APN = null;   // Spieler (Anmeldename klein), dessen Einstellungen gerade gelten
function leisteSeite() { const l = $('#leiste'); l.classList.toggle('li', AP.seite === 'l'); l.style.setProperty('--wgr', AP.wgr / 100); }   // Würfel-Leiste: Seite und Größe
function apSpeichern() {
  try { localStorage.setItem(APN ? 'ap:' + APN : 'ap', JSON.stringify({tilt: AP.tilt, persp: AP.persp, zoom: AP.zoom, wgr: AP.wgr, seite: AP.seite, saison: AP.saison, ans: ANS})); } catch (e) {}
}
function apLaden(name) {   // gespeicherte Ansicht dieses Spielers übernehmen; ohne Eintrag bleiben die Werte des Geräts
  APN = name.toLowerCase();
  try {
    const a = JSON.parse(localStorage.getItem('ap:' + APN));
    if (a) { ['tilt', 'persp', 'zoom', 'wgr'].forEach(x => { if (Number.isFinite(a[x])) AP[x] = a[x]; }); if (a.seite === 'l' || a.seite === 'r') AP.seite = a.seite; if (a.ans === '2d' || a.ans === '3d') ANS = a.ans; if (typeof a.saison === 'boolean') AP.saison = a.saison; }
  } catch (e) {}
  leisteSeite();
  ansichtSetzen();
}
function apSetzen() {
  apSpeichern();
  panelSync(); accZeichnen(); CAM.ox = null; leisteSeite(); layoutSpiel();
}
function ansichtSetzen() {
  $('#kamera').dataset.a = ANS;
  $('#ansicht').textContent = ANS === '3d' ? '3D' : '2D';
  panelSync();
  kamera(CAM.n, 0, true);
}

const ZA = {};   // aktuell angezeigte Zahlen der Statuszeile
let PEND = 0, PENDD = 0;    // tägliches Geschenk (Würfel), das der Server zuletzt gemeldet hat und das noch angezeigt werden muss
function zahl(k, v, b) {   // Zahl in der Statuszeile: kurzes Hervorheben, vom alten zum neuen Wert hoch- bzw. herunterzählen
  const z = ZA[k] || (ZA[k] = {anz: v});
  cancelAnimationFrame(z.raf);
  if (z.anz === v) { b.textContent = v; return; }
  const von = z.anz, t0 = performance.now();
  b.classList.add(v > von ? 'up' : 'dn'); b.textContent = von;
  const schritt = now => {
    const p = Math.min(1, (now - t0) / ZAHL_MS);
    z.anz = Math.round(von + (v - von) * (1 - Math.pow(1 - p, 3)));
    b.textContent = z.anz;
    if (p < 1) z.raf = requestAnimationFrame(schritt); else { z.anz = v; b.classList.remove('up', 'dn'); }
  };
  z.raf = requestAnimationFrame(schritt);
}
function geschenkZeigen(n, d) {   // Popup nach dem Login: tägliches Geschenk; danach zählt die Würfelzahl hoch
  const alt = $('#gov'); if (alt) alt.remove();
  const o = el('div', '', 'overlay'), k = el('div', '', 'karte'), ic = el('div', '', 'gicon'), b = el('button', t('verstanden'));
  o.id = 'gov'; ic.innerHTML = SYM.ZW;
  b.onclick = () => { o.remove(); zeige(); };
  k.append(ic, el('p', d > 0 ? t('giftD', n, d) : t('gift', n), 'gtext'), b); o.append(k); document.body.append(o);
}
function zeige() {
  if (HILFE_ADMIN !== !!S.admin || HILFE_ZUG !== zugWert()) { HILFE_ADMIN = !!S.admin; HILFE_ZUG = zugWert(); hilfeZeige(); }   // Admin-Button in der Hilfe nach dem Anmelden ein- bzw. ausblenden
  if (S.chatMax !== undefined) { CH.max = S.chatMax; CH.gel = S.chatGel; }   // Stand für den Chat-Marker kommt mit jeder Antwort des Servers
  chatMarker(); if (!CHAT_T) chatPlan();
  if (!$('#tpanel').classList.contains('hide')) tpanelZeichnen();
  const g = PEND, d = PENDD, echt = S.wuerfel, echtD = S.drehs || 0; PEND = 0; PENDD = 0;
  if (g > 0) S.wuerfel = echt - g;   // zunächst den Stand vor dem Geschenk anzeigen
  if (d > 0) S.drehs = echtD - d;
  document.body.className = S.team;
  $('#login').classList.add('hide');
  $('#eventende').classList.toggle('hide', !S.eventVorbei);   // Event beendet: Hinweis statt Spiel
  NOCH_ALT = nochNicht(); $('#eventnoch').classList.toggle('hide', !NOCH_ALT || !!S.eventVorbei); if (NOCH_ALT) $('#evnochtxt').textContent = t('evNoch', EV && EV.start ? datumVoll(EV.start) : '…', (EV && EV.startZeit) || '');   // vor dem Startdatum: Hinweis, Würfel, Rad und Übungen gesperrt
  $('#nav').classList.remove('hide'); $('#anav').classList.toggle('hide', !S.admin); tab(TAB);
  $('#aus').classList.remove('hide'); $('#kto').classList.remove('hide');
  $('#elogin').textContent = t('loginName', S.name); $('#erhint').textContent = t(S.rc ? 'rcHatJa' : 'rcHatNein');
  if (document.activeElement !== $('#ean')) $('#ean').value = S.anzeige || S.name;
  if (document.activeElement !== $('#espiele')) $('#espiele').value = String(S.spiele || 0);
  const txt = x => el('span', x);
  const num = (k, v, pre, suf) => { const e = el('span', ''), b = el('b', '', 'zn'); if (pre) e.append(pre); e.append(b); if (suf) e.append(suf); zahl(k, v, b); return e; };
  const sl = el('div', '', 'sl'), sr = el('div', '', 'sr hide'); sr.innerHTML = ic('<circle cx="12" cy="12" r="9" ' + LN + '/><path ' + LN + ' d="M12 7v5l3 2"/>') + '<span class="rest"></span>';   // links Spielerinfo, rechts die verbleibende Spielzeit
  sl.append(txt(S.anzeige || S.name), ...(STAT_WUERFEL ? [num('wuerfel', S.wuerfel, '', ' ' + t('dice'))] : []), txt(t('round') + ' ' + (S.runden + 1)), num('punkte', S.punkte, '', ' ' + t('pts')), num('schutz', S.schutz || 0, Object.assign(el('span', '', 'ico S'), {innerHTML: SYM.S}), ''));
  $('#stat').replaceChildren(sl, sr); restZeichnen();
  document.querySelectorAll('.f.ich').forEach(e => e.classList.remove('ich'));
  $('#f' + S.pos).classList.add('ich');
  if (R) rangZeige();
  if (APN !== S.name.toLowerCase()) apLaden(S.name);
  zahl('dzahl', S.doppel || 0, $('#dzahl')); if (!(S.doppel > 0)) DC_AN = false;   // Doppel-Chance-Schalter am Würfel
  $('#dtog').classList.toggle('leer', !(S.doppel > 0) || !!S.eventVorbei || NOCH_ALT); $('#dtog').classList.toggle('an', DC_AN);
  if (S.doppelwahl) setTimeout(doppelResume, 0);   // offene Auswahl (z. B. nach Neuladen) abschließen
  zahl('wzahl', S.wuerfel, $('#wzahl'));   // zählt hoch/herunter und pulsiert, wenn sich die Würfelzahl ändert
   $('#bw').classList.toggle('leer', S.wuerfel < 1 || !!S.eventVorbei || NOCH_ALT); $('#leiste').classList.toggle('leer', S.wuerfel < 1 || !!S.eventVorbei || NOCH_ALT);
  radZeichnen();
  if (!RAD_BUSY) { zahl('rzahl', S.drehs || 0, $('#rzahl')); $('#rbtn').classList.toggle('leer', !(S.drehs > 0) || !!S.eventVorbei || NOCH_ALT); }
  if (S.felddrehs && S.felddrehs !== FELDDREHS) { FELDDREHS = S.felddrehs; document.querySelectorAll('.f.R u').forEach(u => u.textContent = '+' + FELDDREHS); }
  uebInfo();
  layoutSpiel(); accZeichnen();
  quizZeige();
  try { localStorage.setItem('sw', JSON.stringify({n: S.name, t: S.token})); } catch (e) {}
  if (S.eventVorbei && !FINALE_GEZEIGT && R) { FINALE_GEZEIGT = true; finaleZeigen(); }
  if (S.willkommen && !S.eventVorbei && !$('#wov')) willkommenZeigen();   // neu registriert: Willkommensmeldung mit Schnelleinführung (liegt über dem Geschenk-Popup)
  if (g > 0 || d > 0) { S.wuerfel = echt; S.drehs = echtD; geschenkZeigen(g, d); }
  else if ((S.tagessieg || []).length && !$('#gov') && !S.eventVorbei) tsZeigen(S.tagessieg);   // Tagessieg: erst nach dem Geschenk-Popup
}

function tab(n) {
  const vorher = TAB; TAB = n; document.body.dataset.tab = n; rovZu();
  ['spiel', 'radseite', 'rangseite', 'chat', 'hilfe', 'einst', 'admin'].forEach(id => $('#' + id).classList.toggle('hide', id !== n));
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('an', b.dataset.tab === n));
  $('#kto').classList.toggle('an', n === 'einst');
  if (n === 'spiel') layoutSpiel();
  { const dp = $('#dwov'); if (dp) { dp.classList.toggle('hide', n !== 'spiel'); if (n === 'spiel' && dp._platz) dp._platz(); } }   // Doppel-Chance-Auswahl nur am Spielbrett zeigen; Position erst nach dem Einblenden des Spielbretts berechnen
  if (n !== vorher) { $('main').scrollTop = 0; window.scrollTo(0, 0); if (n === 'chat') chatOeffnen(); if (n === 'hilfe') eiMelden('ent_hilfe'); chatMarker(); chatPlan(); }
}
const HICON = {   // Symbole der Brett-Schaltflächen für die Hilfe (als SVG)
  INFO: ic('<circle cx="12" cy="12" r="9" ' + LN + '/><path ' + LN + ' d="M12 11v6M12 7.5v.5"/>'),
  LIST: ic('<path ' + LN + ' d="M5 7h14M5 12h14M5 17h9"/>'),
  UEB: ic('<path ' + LN + ' d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>'),
  FOK: ic('<circle cx="12" cy="12" r="8" ' + LN + '/><circle cx="12" cy="12" r="3.5" ' + LN + '/>'),
  SET: ic('<circle cx="12" cy="12" r="3" ' + LN + '/><path ' + LN + ' d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>'),
  TASK: ic('<path ' + LN + ' d="M4 7l2 2 3-3M4 17l2 2 3-3M12 8h8M12 18h8"/>'),
  SW: ic('<path ' + LN + ' d="M7 8h13M17 4l4 4-4 4M17 16H4M7 12l-4 4 4 4"/>')
};
const hico = (k, egg) => '<b class="hi ' + k + '"' + (egg ? ' data-egg="' + egg + '" data-ea="klick"' : '') + '>' + (k === '3D' ? '3D' : HICON[k] || SYM[k] || '') + '</b>';   // [[X]] im Hilfetext wird durch das Symbol ersetzt (Feldsymbole aus SYM, Schaltflächen aus HICON)

function trainOeffnen(v) {   // Übung als Overlay: Beschreibung, Start, Ergebnis, nochmal
  const box = $('#tbox'), P = Object.assign({}, MINIP[v]), beschr = $('#tbeschr'), start = el('button', t('mStart'));
  $('#train').classList.remove('hide'); document.body.classList.add('ovl'); $('#train .karte').classList.remove('breit'); $('#tmeld').textContent = '';
  if (v === 'zielweit') { P.ziel = Math.round((5 + Math.random() * 2.5) * 100) / 100; if (S && S.zw) { P.wertung = S.zw.wertung; P.bonus = S.zw.bonus; } }   // Übung bewertet wie das echte Spiel (Einstellung vom Server)   // Zielweite variiert bei jedem Neustart, bleibt innerhalb der 3 Sprünge fix
  $('#tkopf b').textContent = t('vn_' + v);
  beschr.textContent = miniBeschr(v, P); beschr.classList.remove('hide');
  start.onclick = () => {
    start.disabled = true; start.classList.add('laden');
    los(async () => {
      const j = await api({aktion: 'uebstart', name: S.name, token: S.token, v: v});   // der Server zählt das Tageslimit (Admins ohne Limit)
      S = j.spieler; R = j.rang; zeige(); document.body.classList.add('ovl'); uebInfo();
      const seed = Math.floor(Math.random() * 1e9);
      beschr.classList.add('hide');
      miniSpiel(box, v, seed, P, taps => {
        const e = miniErgebnis(v, seed, P, taps, true), nochmal = el('button', t('mNochmal'));
        beschr.textContent = t('trainErg', rohText(v, e.roh), Math.round(60 * e.anteil)); beschr.classList.remove('hide');
        nochmal.onclick = () => trainOeffnen(v);
        box.append(nochmal);
      });
    }, '#tmeld').finally(() => { if (start.isConnected) { start.disabled = false; start.classList.remove('laden'); } });
  };
  if (box._stop) box._stop();
  box.replaceChildren(start);
}
function laufText() { const z = EV || {}, d = x => x ? datumVoll(x) : '…'; return t(z.vorbei ? 'laufV' : 'laufX', d(z.start), d(z.ende), z.tage || '…', d(z.bis), z.startZeit || '…', z.endeZeit || '…'); }

const hzeilen = x => x.split('\n').map(z => '<span class="hl' + (z.startsWith('[[') ? ' sy' : z.startsWith('• ') ? ' li' : '') + '">' + z.replace(/\[\[(\w+)(?:@(\w+))?\]\]/g, (m, c, g) => hico(c, g)) + '</span>').join('');   // jede Zeile (\n im Text) ein eigener Block
const hblock = ([k, x]) => { const p = el('p', ''); p.innerHTML = hzeilen(x); return [el('h3', k), p]; };
function hilfeTab(n) {   // Reiter der Hilfe: spiel = Spielhilfe, intro = Einleitung, fb = Feedback & Support
  document.querySelectorAll('#htabs button').forEach(b => b.classList.toggle('an', b.dataset.ht === n));
  ['spiel', 'intro', 'fb'].forEach(k => $('#h' + k).classList.toggle('hide', k !== n));
}
$('#htabs').onclick = e => { const b = e.target.closest('button'); if (b) hilfeTab(b.dataset.ht); };
function introZeige() {   // Reiter Einleitung: alle Schritte untereinander und ein Knopf für die Schnelleinführung
  const b = el('button', t('wkNochmal'), 'zweit'); b.type = 'button'; b.onclick = () => willkommenZeigen(true);
  $('#hintro').replaceChildren(...introL().flatMap(x => hblock([x.t, x.x])), b);
}
function willkommenZeigen(wdh) {   // Schnelleinführung als Popup in Schritten. Ohne wdh: Willkommensmeldung für neu registrierte Spieler (beim Schließen meldet der Client dem Server "gesehen"); wdh = true: aus der Hilfe aufgerufen
  const alt = $('#wov'); if (alt) alt.remove();
  const o = el('div', '', 'overlay'), k = el('div', '', 'karte wk'), ico = el('div', '', 'gicon'), h = el('h3', ''), p = el('div', '', 'wktext'), dots = el('div', '', 'wkdots'), z = el('div', '', 'bzeile');
  const zur = el('button', t('wkZurueck'), 'zweit'), weiter = el('button', ''), hb = el('button', t('wkHilfe'), 'zweit'), skip = el('button', t('wkSkip'), 'link');
  [zur, weiter, hb, skip].forEach(x => { x.type = 'button'; });
  const n = introL().length; let i = 0;
  o.id = 'wov'; ico.innerHTML = SYM.ZW;
  const zu = () => {
    o.remove();
    if (!wdh && S && S.willkommen) { S.willkommen = false; api({aktion: 'wkok', name: S.name, token: S.token}).then(r => { S = r.spieler; R = r.rang; zeige(); }).catch(() => {}); }   // Server merkt sich: nicht noch einmal zeigen
  };
  const zeichnen = () => {
    h.textContent = introL()[i].t; p.innerHTML = hzeilen(introL()[i].x);
    dots.replaceChildren(...introL().map((x, q) => el('i', '', q === i ? 'an' : '')));
    zur.disabled = i === 0; zur.style.visibility = i === 0 ? 'hidden' : '';
    weiter.textContent = t(i < n - 1 ? 'wkWeiter' : 'wkLos');
    hb.style.display = i === n - 1 && !wdh ? '' : 'none'; skip.style.display = i === n - 1 ? 'none' : '';
  };
  zur.onclick = () => { if (i > 0) { i--; zeichnen(); } };
  weiter.onclick = () => { if (i < n - 1) { i++; zeichnen(); } else zu(); };
  hb.onclick = () => { zu(); tab('hilfe'); hilfeTab('spiel'); };
  skip.onclick = zu;
  z.append(zur, weiter);
  k.append(ico, el('h2', wdh || !S ? t('wkWdh') : t('wkT', S.anzeige || S.name)));
  if (!wdh && S) k.append(el('p', t('wkTeam', t(S.team)), 'klein'));
  k.append(h, p, dots, z, hb, skip); o.append(k); document.body.append(o); zeichnen(); weiter.focus();
}
function uebInfo() {   // Restanzeige der Übungsspiele: Text in den Knöpfen, z. B. "Punkteschießen (2/3)" (nur für Spieler mit Limit; Admins ohne Zahl)
  const lim = !!(S && S.uebMax > 0 && S.ueb && Object.values(S.ueb).some(x => x >= 0)), e = $('#uebinfo');
  if (e) e.textContent = nochNicht() ? t('uebNoch') : lim ? t('uebInfo', S.uebMax) : '';
  document.querySelectorAll('#hspiel button[data-uv]').forEach(b => {
    const v = b.dataset.uv, r = S && S.ueb && S.ueb[v] !== undefined ? S.ueb[v] : -1;
    b.textContent = t('vn_' + v) + (r >= 0 ? ' (' + r + '/' + S.uebMax + ')' : ''); b.disabled = r === 0 || nochNicht();
  });
}
function hilfeZeige() {
  const eintraege = hilfeL().map(([k, x]) => [k, x.replace(/\{ZUG\}/g, String(zugWert()))]); eintraege.splice(1, 0, [t('laufT'), laufText()]);   // Spiel-Laufzeit direkt nach Ziel, Daten vom Server
  const hs = $('#hspiel');
  hs.replaceChildren(...eintraege.flatMap(hblock));
  const h1 = $('#hspiel h3'); if (h1) { h1.dataset.egg = 'e05'; h1.dataset.ea = 'lang'; }
  const grp = (titel, vs) => { const g = el('div', '', 'mgr'), w = el('div', '', 'mgb'); g.append(el('h4', titel)); w.append(...vs.map(v => { const x = el('button', t('vn_' + v), 'mbtn'); x.type = 'button'; x.dataset.uv = v; x.onclick = () => trainOeffnen(v); return x; })); g.append(w); return g; };   // Übungsmodus: nach Disziplin gruppiert, öffnet das Minispiel als Overlay
  const ui = el('p', '', 'klein'); ui.id = 'uebinfo';
  hs.append(el('h3', t('trainT')), ui, grp(t('rGrpB'), ['punkte', 'ziel', 'speed', 'huhn']), grp(t('rGrpL'), ['sprint', 'zielzeit', 'huerden']), grp(t('rGrpW'), ['weit', 'zielweit'])); uebInfo();
  if (S && S.admin) { const g = el('div', '', 'mgr'), w = el('div', '', 'mgb'), ab = el('button', t('hanoiTestBtn'), 'mbtn'); ab.type = 'button'; ab.onclick = () => hanoiTest(3); w.append(ab); g.append(el('h4', t('hSonst')), w); hs.append(g); }   // Sonstige: nur für Admins (Hanoi-Test)
  introZeige();
}
let HILFE_ADMIN = false, HILFE_ZUG = null;   // Stand der Hilfe: Admin-Button vorhanden?
const el = (tag, txt, cls) => { const e = document.createElement(tag); e.textContent = txt; if (cls) e.className = cls; return e; };
let TWA = null, AECODE = null, EVA = null, BNA = null, AKA = null;   // Zustand der Tageswertung und aktueller Einladungscode für die Admin-Oberfläche
function adminTab(n) { ['sp', 'tw', 'ev', 'bn'].forEach(k => $('#at' + k).classList.toggle('hide', k !== n)); document.querySelectorAll('#atabs button').forEach(b => b.classList.toggle('an', b.dataset.at === n)); }
function twAdminZeige() {
  if (!TWA) return;
  const c = TWA.conf, f = $('#twform');
  if (!f.contains(document.activeElement)) {   // Eingaben nicht überschreiben, während getippt wird
    $('#twakt').checked = c.aktiv !== false; $('#twende').value = c.ende; $('#twpl').value = c.plaetze; $('#twpu').value = c.punkte; $('#twwu').value = c.wuerfel; $('#twmp').value = c.minPunkte; $('#twtr').value = c.trigger;
  }
  const tr = TWA.trigger < 0 ? t('twTrN') : TWA.trigger === 0 ? t('twTr0') : t('twTrJa', TWA.gesetzt ? TWA.gesetzt.min : '?') + (TWA.gesetzt && TWA.gesetzt.min !== c.trigger ? t('twTrNeu') : '');
  $('#twst').textContent = t('twSt', TWA.cur, TWA.phase ? t('twPhaseU') : '-', tr, TWA.lauf ? t('twVor', Math.max(0, Math.round((TWA.jetzt - TWA.lauf) / 60000))) : '-');
}
async function adminCall(extra) {
  const j = await api({aktion: 'admin', name: S.name, token: S.token, apw: APW, ...extra});
  S = j.spieler; R = j.rang; AL = j.liste; TWA = j.twadmin || null; EVA = j.evadmin || null; BNA = j.bnadmin || null; AKA = j.aktivadmin || null; if (j.einladung !== undefined) AECODE = j.einladung; zeige(); adminZeige(); twAdminZeige(); evAdminZeige(); bnAdminZeige(); aktivAdminZeige();
  return j;
}
function aktivAdminZeige() {   // Admin: Aktivität der Spieler (Hilfe zur Wahl des Aktiv-Limits)
  const a = AKA, e = $('#aakt'); if (!a) { e.textContent = ''; return; }
  e.textContent = t('aAkt', t('aMod_' + a.modus), a.limit, a.aktiv, a.gesamt, a.schwach, a.ohne, a.gesamt ? Math.round(100 * (a.schwach + a.ohne) / a.gesamt) : 0);
}
function selGruppe(w) { return AL.filter(x => !x.gesperrt && (w === 'alle' || x.team === w)); }   // Spieler einer Schnellauswahl (ohne gesperrte)
function afmZeigen(p) { return p.then(() => { const e = $('#afm'); if (e.textContent) e.scrollIntoView({block: 'nearest', behavior: 'smooth'}); }); }   // Meldung im Aktionsbereich sichtbar machen
const SPIEL_KURZ = ['–', 'AM', 'SSM', 'AM+SSM'];   // Spielzugehörigkeit: Athletics Mania, Summer Sports Mania
function adminZeige() {
  if (AECODE !== null && document.activeElement !== $('#aecode')) $('#aecode').value = AECODE;
  ASELS = new Set([...ASELS].filter(n => AL.some(x => x.name === n)));   // Gelöschtes aus der Auswahl entfernen
  $('#atb').replaceChildren(...AL.map(x => {
    const tr = el('tr', '', x.team + (ASELS.has(x.name) ? ' sel' : '') + (x.gesperrt ? ' gesp' : '')), c0 = el('td', ''), cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = ASELS.has(x.name); cb.tabIndex = -1; c0.append(cb);
    c0.onclick = e => { e.stopPropagation(); $('#afm').textContent = ''; if (ASELS.has(x.name)) ASELS.delete(x.name); else ASELS.add(x.name); adminZeige(); };   // Checkbox-Spalte: Spieler zur Auswahl hinzufügen oder entfernen
    tr.append(c0, el('td', x.anzeige && x.anzeige !== x.name ? x.anzeige + ' (' + x.name + ')' : x.name), el('td', x.wuerfel), el('td', x.schutz), el('td', x.doppel || 0), el('td', x.drehs || 0), el('td', SPIEL_KURZ[x.spiele || 0] || '–'), el('td', x.punkte), el('td', x.gesperrt ? '⛔' : ''));
    tr.onclick = () => { $('#afm').textContent = ''; ASELS = new Set([x.name]); adminZeige(); };   // Antippen der Zeile: nur diesen Spieler auswählen
    return tr;
  }));
  const n = ASELS.size, x1 = n === 1 ? AL.find(y => y.name === [...ASELS][0]) : null;
  $('#aform').classList.toggle('hide', n === 0); $('#aform').classList.toggle('multi', n > 1);
  $('#asel').textContent = n > 1 ? t('aMehr', n) : x1 ? x1.name : '';
  const w = $('#awarn'); w.classList.toggle('hide', n < 2);   // Warnhinweis: die Buchung gilt für mehrere Spieler
  if (n > 1) { w.innerHTML = ic('<path ' + LN + ' d="M12 3l10 18H2zM12 10v5M12 18v.5"/>'); w.append(t('aWarn', n)); }
  $('#ag').textContent = t('aGib') + (n > 1 ? ' (' + n + ')' : '');
  $('#as').textContent = t(x1 && x1.gesperrt ? 'aEntsp' : 'aSperr'); $('#as').disabled = n !== 1; $('#arc').disabled = n !== 1;   // Sperren und Wiederherstellungscode nur für einen Spieler
  document.querySelectorAll('#aselbar button[data-sel]').forEach(b => {   // Schnellauswahl leuchtet, solange alle Spieler dieser Gruppe ausgewählt sind
    if (b.dataset.sel === 'keine') return;
    const g = selGruppe(b.dataset.sel), an = g.length > 0 && g.every(y => ASELS.has(y.name));
    b.classList.toggle('an', an); b.setAttribute('aria-pressed', String(an));
  });
}
let QT0 = 0, QI = null, RESP = 0, QW = {typ: '', d: []};   // QW: zuletzt eingestellte Zahlenräder, bleiben nach falscher Antwort stehen
const qFaktor = (c, s) => s <= c.voll ? 1 : s >= c.min ? c.minFaktor : 1 - (1 - c.minFaktor) * (s - c.voll) / (c.min - c.voll);
function qTick() {
  const A = S && S.aufgabe;
  if (!A) return;
  const s = Math.max(0, (Date.now() - QT0) / 1000), f = qFaktor(A.zeit, s);
  $('#qbalken i').style.width = Math.round(f * 100) + '%';
  $('#qinfo').textContent = t('qInfo', A.versuche + 1, A.max, Math.round(A.basis[A.versuche] * f), Math.floor(s));
}
function ordnenUI(A) {
  let wahl = [];
  const anz = el('p', '', 'qauswahl'), items = el('div'), send = el('button', t('qSend')), rst = el('button', t('qReset'), 'zweit');
  const zeichnen = () => {
    anz.textContent = wahl.join(' > ') || '...';
    items.replaceChildren(...lv(A.optionen).filter(o => !wahl.includes(o)).map(o => {
      const b = el('button', o, 'zweit'); b.onclick = () => { wahl.push(o); zeichnen(); }; return b;
    }));
    send.disabled = wahl.length !== lv(A.optionen).length;
  };
  send.onclick = () => { send.classList.add('laden'); antworten(wahl.join('|')); };
  rst.onclick = () => { wahl = []; zeichnen(); };
  $('#qeingabe').replaceChildren(anz, items, rst, send); zeichnen();
}
function paareUI(A) {
  let paare = [], sel = null;
  const anz = el('p', '', 'qauswahl'), box = el('div', '', 'spalten'), send = el('button', t('qSend')), rst = el('button', t('qReset'), 'zweit');
  const zeichnen = () => {
    const ls = lv(A.links).filter(l => !paare.some(p => p[0] === l)), rs = lv(A.rechts).filter(x => !paare.some(p => p[1] === x));
    const sp1 = el('div'), sp2 = el('div');
    sp1.append(...ls.map(l => { const b = el('button', l, 'zweit' + (sel === l ? ' sel' : '')); b.onclick = () => { sel = l; zeichnen(); }; return b; }));
    sp2.append(...rs.map(x => { const b = el('button', x, 'zweit'); b.onclick = () => { if (sel !== null) { paare.push([sel, x]); sel = null; zeichnen(); } }; return b; }));
    box.replaceChildren(sp1, sp2);
    anz.textContent = paare.map(p => p.join(' = ')).join(', ') || '...';
    send.disabled = paare.length !== lv(A.links).length;
  };
  send.onclick = () => { send.classList.add('laden'); antworten(paare.map(p => p.join('=')).join('|')); };
  rst.onclick = () => { paare = []; sel = null; zeichnen(); };
  $('#qeingabe').replaceChildren(anz, box, rst, send); zeichnen();
}
const HD_FARBEN = [['fde68a', 'f59e0b', 'd97706', '78350f', 'fef3c7'], ['fca5a5', 'ef4444', 'dc2626', '7f1d1d', 'fecaca'], ['86efac', '22c55e', '16a34a', '14532d', 'bbf7d0'], ['60a5fa', '2563eb', '1d4ed8', '1e3a8a', '93c5fd'], ['d8b4fe', 'a855f7', '7e22ce', '3b0764', 'e9d5ff']];   // Farben der Diskusscheiben nach Größe (1 = kleinste): Gold, Rubin, Smaragd, Saphir, Amethyst; je Verlauf hell bis dunkel und Randlinie
function diskusDefs() {   // Farbverläufe der Diskusscheiben, einmal im Dokument (die Scheiben verweisen darauf)
  if (document.getElementById('hdefs')) return;
  const d = document.createElement('div'); d.id = 'hdefs'; d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML = '<svg width="0" height="0" aria-hidden="true"><defs><linearGradient id="hd-rim" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0" stop-color="#cbd5e1"/><stop offset=".35" stop-color="#94a3b8"/><stop offset=".7" stop-color="#475569"/><stop offset="1" stop-color="#1e293b"/></linearGradient><linearGradient id="hd-belly" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2e8f0"/><stop offset=".3" stop-color="#94a3b8"/><stop offset=".7" stop-color="#475569"/><stop offset="1" stop-color="#1e293b"/></linearGradient>' +
    HD_FARBEN.map((c, i) => '<radialGradient id="hd-' + (i + 1) + '" cx="50%" cy="30%" r="75%"><stop offset="0" stop-color="#' + c[0] + '"/><stop offset=".25" stop-color="#' + c[1] + '"/><stop offset=".65" stop-color="#' + c[2] + '"/><stop offset="1" stop-color="#' + c[3] + '"/></radialGradient>').join('') + '</defs></svg>';
  document.body.append(d);
}
const HD = {RY: 80, B: 18, DICKE: 14};   // Form der Diskusscheibe in Einheiten der 300 breiten Zeichnung: RY = halbe Höhe der Oberseite (größer = mehr Blick von oben), B = Wölbung des Bauchs nach unten (größer = bauchiger), DICKE = Höhe des höchsten Punkts über der Mittelebene (Abstand der gestapelten Scheiben)
HD.CY = HD.RY + 6; HD.VH = HD.CY + HD.RY + HD.B + 4; HD.LOCH = HD.CY - Math.round(HD.RY * 0.07);   // abgeleitet: Mittelpunkt der Oberseite, Höhe der Zeichnung, Mitte des Lochs (passen sich RY und B automatisch an)
function diskusSvg(g) {   // gewölbte Diskusscheibe (Linsenform) in Schrägansicht von oben: Metallrand mit Bauch, farbige Kuppel, Ringe, Lichtreflex, Loch für den Stab
  const c = HD_FARBEN[(g - 1) % HD_FARBEN.length], nr = ((g - 1) % HD_FARBEN.length) + 1, Y = HD.CY, K = HD.LOCH, R = HD.RY, ry = f => (R * f).toFixed(1), hs = R / 58, hr = (20 * R / 145).toFixed(1), q = v => (K - v * hs).toFixed(1);
  return '<svg viewBox="0 0 300 ' + HD.VH + '" aria-hidden="true">' +
    '<path d="M 5 ' + Y + ' A 145 ' + (R + HD.B) + ' 0 0 0 295 ' + Y + ' A 145 ' + R + ' 0 0 1 5 ' + Y + ' Z" fill="url(#hd-belly)" stroke="#1e293b" stroke-width="1"/>' +
    '<ellipse cx="150" cy="' + Y + '" rx="145" ry="' + R + '" fill="url(#hd-rim)" stroke="#e2e8f0" stroke-width="1.5"/>' +
    '<ellipse cx="150" cy="' + K + '" rx="124" ry="' + ry(0.86) + '" fill="url(#hd-' + nr + ')" stroke="#' + c[4] + '" stroke-width="1.2"/>' +
    '<ellipse cx="150" cy="' + K + '" rx="100" ry="' + ry(0.7) + '" fill="none" stroke="#fff" stroke-width="1" opacity=".25"/>' +
    '<ellipse cx="150" cy="' + K + '" rx="78" ry="' + ry(0.54) + '" fill="none" stroke="#fff" stroke-width=".8" opacity=".2"/>' +
    '<ellipse cx="150" cy="' + K + '" rx="56" ry="' + ry(0.38) + '" fill="none" stroke="#fff" stroke-width=".7" opacity=".15"/>' +
    '<path d="M 46 ' + q(12) + ' C 90 ' + q(40) + ', 210 ' + q(40) + ', 254 ' + q(12) + ' C 210 ' + q(26) + ', 90 ' + q(26) + ', 46 ' + q(12) + ' Z" fill="#fff" opacity=".32"/>' +
    '<ellipse cx="150" cy="' + K + '" rx="20" ry="' + hr + '" fill="#020617"/>' +
    '<path d="M 130 ' + K + ' A 20 ' + hr + ' 0 0 0 170 ' + K + ' L 170 ' + (K + 4 * hs).toFixed(1) + ' A 20 ' + hr + ' 0 0 1 130 ' + (K + 4 * hs).toFixed(1) + ' Z" fill="#334155"/>' +
    '<ellipse cx="150" cy="' + K + '" rx="20" ry="' + hr + '" fill="none" stroke="#475569" stroke-width="1"/></svg>';
}
function hanoiUI(A, ziel, fertig) {   // Diskus-Türme von Hanoi: bunte Diskusscheiben in Schrägansicht auf drei Stäben; ziel = Container (Standard: Quizkarte), fertig = Funktion bei gelöstem Rätsel (Standard: Antwort an den Server)
  diskusDefs(); ziel = ziel || $('#qeingabe'); fertig = fertig || (z => antworten(z));
  const st = [[], [], []], zuege = []; let von = -1;
  for (let i = A.n; i >= 1; i--) st[0].push(i);
  const anz = el('p', '', 'qauswahl'), tuerme = el('div', '', 'hanoi'), rst = el('button', t('qReset'), 'zweit');
  const zeichnen = () => {
    const tb = (tuerme.clientWidth || 300) / 3 - 8, HEB = 25, scMax = tb * 0.96 / 300;   // tb = Turmbreite in px, HEB = Anheben der gewählten Scheibe, scMax = Maßstab der größten Scheibe
    const fh = Math.max(40, Math.round(2 * (HD.RY + HD.B * 0.6) * scMax * 1.04)), G0 = 2 + fh / 2;   // Fußplatte: Ellipse im Seitenverhältnis der größten Scheibe (aus HD berechnet, mit etwas Rand), fh = Höhe der Platte, G0 = Höhe der Mitte der Auflagefläche
    let sy = G0, sk = 0; for (let g = A.n; g >= 1; g--) { const sc = tb * (0.34 + g * 0.62 / A.n) / 300; sy += HD.DICKE * (sk + sc); sk = sc; }   // Höhe des Mittelpunkts der obersten Scheibe bei vollem Stapel
    const STAB_PLUS = 30, STAB = Math.ceil(sy + HD.RY * sk + HEB + 20 - G0) + STAB_PLUS;   // Stablänge über der Auflagefläche: ragt über den vollen, angehobenen Stapel hinaus; STAB_PLUS = zusätzliche Länge, damit der Stab nicht gedrungen wirkt
    tuerme.replaceChildren(...st.map((s, k) => {
      const tw = el('div', '', 'turm' + (von === k ? ' sel' : '')), fuss = el('div', '', 'fuss'), stab = el('div', '', 'stab');
      tw.style.height = Math.round(G0 + STAB + 8) + 'px'; fuss.style.height = fh + 'px';
      stab.style.bottom = Math.round(G0) + 'px'; stab.style.height = STAB + 'px';
      tw.append(fuss, stab);
      let yc = G0, sl = 0, yh = G0;   // yc = Höhe des Mittelpunkts der nächsten Scheibe, sl = Maßstab der letzten Scheibe, yh = Höhe des Lochs der obersten Scheibe
      s.forEach((g, idx) => {   // s[0] liegt unten
        const w = tb * (0.34 + g * 0.62 / A.n), sc = w / 300, oben = idx === s.length - 1, hoch = oben && von === k, d = el('div', '', 'hdw' + (hoch ? ' hoch' : ''));
        yc += HD.DICKE * (sl + sc); sl = sc;   // die untere Wölbung der Scheibe liegt auf der Wölbung der darunter
        const lift = hoch ? HEB : 0;
        d.innerHTML = diskusSvg(g); d.style.width = w + 'px'; d.style.bottom = (yc + lift - (HD.VH - HD.CY) * sc) + 'px'; d.style.zIndex = idx + 2;
        tw.append(d); if (oben) yh = yc + lift + (HD.CY - HD.LOCH) * sc;
      });
      if (s.length) { const st2 = el('div', '', 'stab2'); st2.style.bottom = Math.round(yh) + 'px'; st2.style.height = Math.max(0, Math.round(G0 + STAB - yh)) + 'px'; tw.append(st2); }   // Stab vor der Scheibe: ragt aus dem Loch der obersten Scheibe
      tw.onclick = () => tippe(k);
      return tw;
    }));
    anz.textContent = t('hanoiInfo', zuege.length);
  };
  const tippe = k => {
    if (von < 0) { if (st[k].length) von = k; }
    else {
      if (k !== von) {
        const x = st[von][st[von].length - 1];
        if (!st[k].length || st[k][st[k].length - 1] > x) { st[von].pop(); st[k].push(x); zuege.push('ABC'[von] + 'ABC'[k]); }
      }
      von = -1;
    }
    zeichnen();
    if (st[2].length === A.n) { tuerme.replaceChildren(); fertig(zuege.join(','), zuege.length); }
  };
  rst.onclick = () => { st[0] = []; st[1] = []; st[2] = []; for (let i = A.n; i >= 1; i--) st[0].push(i); zuege.length = 0; von = -1; zeichnen(); };
  ziel.replaceChildren(tuerme, anz, rst); zeichnen();
}
function hanoiTest(n) {   // Admin-Test in der Hilfe: Diskus-Türme von Hanoi ohne Wertung, mit wählbarer Scheibenzahl
  const box = $('#tbox'), beschr = $('#tbeschr'), wahl = el('div', '', 'qaus'), spiel = el('div');
  $('#train').classList.remove('hide'); document.body.classList.add('ovl'); $('#train .karte').classList.remove('breit');
  if (box._stop) box._stop();
  $('#tkopf b').textContent = t('hanoiTestT'); beschr.textContent = t('hanoiFrage'); beschr.classList.remove('hide');
  [3, 4, 5].forEach(k => { const b = el('button', t('hanoiTestN', k), k === n ? '' : 'zweit'); b.onclick = () => hanoiTest(k); wahl.append(b); });
  box.replaceChildren(wahl, spiel);
  hanoiUI({n: n}, spiel, (z, m) => { const nochmal = el('button', t('mNochmal')); nochmal.onclick = () => hanoiTest(n); spiel.replaceChildren(el('p', t('hanoiTestOk', m, Math.pow(2, n) - 1), 'gtext'), nochmal); });
}
function radUI(A, n) {   // Zahlenschloss: n Zahlenräder (0-9), per Wischen oder mit den Pfeilen drehbar
  const H = 44, rad = [], box = el('div', '', 'schloss'), send = el('button', t('qSend')), alt = QW.typ === A.typ && A.versuche > 0 ? QW.d : [];
  const wertR = r => (Math.round(r.scrollTop / H) + 1) % 10;   // 50 Felder (5 x 0-9), das mittlere sichtbare ist Feld Index + 1
  const dreh = (r, d) => r.scrollTo({top: Math.max(0, Math.min(47 * H, (Math.round(r.scrollTop / H) + d) * H)), behavior: 'smooth'});
  for (let k = 0; k < n; k++) {
    const sp = el('div', '', 'rspalte'), fenster = el('div', '', 'rwrap'), r = el('div', '', 'rad'), auf = el('button', '▲', 'zweit'), ab = el('button', '▼', 'zweit');
    for (let i = 0; i < 50; i++) r.append(el('div', String(i % 10)));
    let tm = 0;
    r.onscroll = () => { clearTimeout(tm); tm = setTimeout(() => { const i = Math.round(r.scrollTop / H) + 1; if (i < 10 || i > 39) r.scrollTop += (i < 10 ? 20 : -20) * H; }, 150); };   // unbemerkt in die Mitte zurückspringen: das Rad wirkt endlos
    auf.setAttribute('aria-label', '+'); ab.setAttribute('aria-label', '-');
    auf.onclick = () => dreh(r, 1); ab.onclick = () => dreh(r, -1);
    fenster.append(r); sp.append(auf, fenster, ab); box.append(sp); rad.push(r);
  }
  send.onclick = () => { const d = rad.map(wertR); QW = {typ: A.typ, d: d}; send.classList.add('laden'); antworten(d.join('')); };
  $('#qeingabe').replaceChildren(box, send);
  rad.forEach((r, k) => { r.scrollTop = (19 + (alt[k] || 0)) * H; });   // Startstellung 0 (oder letzte Eingabe), erst nach dem Einfügen möglich
}
function ausstiegZeigen(erneut) {   // nach endgültigem Verbindungsfehler: Aufgabe notfalls beenden können (Trostpreis laut Server); erneut = Funktion zum nochmaligen Senden
  if ($('#qaus')) return;
  const row = el('div', '', 'qaus'), b = el('button', t(S.trost > 0 ? 'aBeenden' : 'aBeenden0', S.trost), 'gefahr');
  row.id = 'qaus';
  if (erneut) { const w = el('button', t('aErneut'), 'zweit'); w.onclick = () => { row.remove(); erneut(); }; row.append(w); }
  b.onclick = () => bestaetigen(t('aFrage'), t('aBeendenKurz'), true).then(ja => {
    if (!ja) return;
    b.disabled = true; b.classList.add('laden');
    los(async () => {
      const j = await api({aktion: 'notausstieg', name: S.name, token: S.token});
      S = j.spieler; R = j.rang; zeige();
      const p = j.ev.punkte; belohnung(p, 0);   // Trostpreis wird groß eingeblendet und als Meldung gezeigt
      LOG = []; showLog(); $('#log').textContent = t(p > 0 ? 'aTrost' : 'aOhne', p);
    }, '#qmeld').finally(() => { if (b.isConnected) { b.disabled = false; b.classList.remove('laden'); } });
  });
  row.append(b); $('#qeingabe').append(row);
}
function miniUI(A) {   // echtes Minispiel auf der Quizkarte
  $('#qfrage').textContent = miniBeschr(A.variante, A.P);
  const senden = taps => { const ov = el('div', '', 'auswert'); ov.append(el('i'), el('span', t('mAuswert'))); document.body.append(ov);   // sichtbarer Hinweis, solange der Server das Ergebnis auswertet
    return los(async () => {
    let j; try { j = await api({aktion: 'miniende', name: S.name, token: S.token, taps: JSON.stringify(taps)}); } catch (e) { if (istNetz(e)) ausstiegZeigen(() => senden(taps)); throw e; }   // Ergebnis bleibt im Speicher: erneut senden oder beenden
    S = j.spieler; R = j.rang; zeige();
    const e = j.ev;
    belohnung(e.punkte, e.wuerfel);
    LOG = []; showLog();
    $('#log').textContent = t('miniFertig', varName(A.variante), rohText(A.variante, e.roh), e.punkte) + (e.wuerfel ? ' ' + t('qBonus', e.wuerfel) : '');
  }, '#qmeld').finally(() => ov.remove()); };
  const b = el('button', t(A.gestartet ? 'mAufgeben' : 'mStart'));
  if (A.gestartet) { $('#qfrage').textContent = t('mGestartet'); b.className = 'zweit'; b.onclick = () => { b.disabled = true; b.classList.add('laden'); senden([]).then(() => { if (b.isConnected) { b.disabled = false; b.classList.remove('laden'); } }); }; }
  else b.onclick = async () => {
    b.disabled = true; b.classList.add('laden'); b.textContent = t('mStartet');   // sofortiges Feedback, der Server braucht einen Moment
    await los(async () => {
    const j = await api({aktion: 'ministart', name: S.name, token: S.token});
    $('#qfrage').classList.add('hide');
    miniSpiel($('#qeingabe'), A.variante, j.ev.seed, A.P, senden);
  }, '#qmeld');
    if (b.isConnected) { b.disabled = false; b.classList.remove('laden'); b.textContent = t('mStart'); }   // bei einem Fehler wieder bedienbar
  };
  $('#qeingabe').replaceChildren(b);
}
function quizZeige() {
  const A = S && !S.eventVorbei && S.aufgabe;   // nach dem Event keine Aufgaben mehr
  clearInterval(QI);
  $('#quiz').classList.toggle('hide', !A);
  document.body.classList.toggle('ovl', !!A);
  $('#qfrage').classList.remove('hide');
  $('#quiz .karte').classList.remove('breit');
  $('#qmeld').textContent = '';   // alte Meldungen (Fehler, falsche Antwort) nicht in die nächste Aufgabe mitnehmen
  if (!A) return;
  QT0 = RESP - A.vergangen * 1000;
  $('#qkopf b').textContent = A.art === 'mini' ? (A.typ === 'bogen' ? t('B') + ': ' : '') + t('vn_' + A.variante) : t('quizT');   // Titel zeigt die gespielte Variante, wie unter Hilfe (Bogenschießen mit Stationsname davor)
  $('#qbalken').classList.toggle('hide', A.art === 'mini');
  if (A.art === 'mini') { $('#qinfo').textContent = ''; return miniUI(A); }
  const hinweis = A.frage ? lv(A.frage) : '';
  const hint = h => h.k === 'sum' ? t('hSum', h.v) : h.k === 'par' ? t('hPar', t('ord' + h.i), t(h.v)) : h.k === 'cmp' ? t('hCmp', t('ord' + h.i), t('ord' + h.j))
    : h.k === 'has' ? t('hHas', h.v) : h.k === 'not' ? t('hNot', h.v) : t('hPar', t('ord' + h.i), h.v);
  $('#qfrage').textContent = A.typ === 'reihe' ? t('reiheFrage') + ' ' + A.reihe
    : A.typ === 'salat' ? hinweis + ' - ' + t('salatFrage') + ' ' + lv(A.buchstaben)
    : A.typ === 'schloss' ? t('schlossFrage') + '\n' + A.hinweise.map(hint).join('\n')
    : A.typ === 'hanoi' ? t('hanoiFrage') : hinweis;
  if (A.typ === 'mc') {
    $('#qeingabe').replaceChildren(...lv(A.optionen).map(o => { const b = el('button', o, 'zweit'); b.onclick = () => { if (QB) return; b.classList.add('sel', 'laden'); antworten(o); }; return b; }));
  } else if (A.typ === 'ordnen') ordnenUI(A);
  else if (A.typ === 'paare') paareUI(A);
  else if (A.typ === 'hanoi') hanoiUI(A);
  else if (A.typ === 'schloss') radUI(A, 3);
  else if (A.typ === 'reihe') radUI(A, A.raeder || 3);   // Zahlenfolge: 3 Zahlenräder (Server begrenzt die gesuchte Zahl auf 3 Stellen); ältere Aufgaben mit 4 Stellen bekommen 4
  else {
    const i = el('input'), b = el('button', t('qSend'));
    i.placeholder = A.typ === 'schloss' ? '000' : t('qAntwort'); i.autocomplete = 'off';
    if (A.typ === 'schloss') { i.inputMode = 'numeric'; i.maxLength = 3; }
    b.onclick = () => { b.classList.add('laden'); antworten(i.value); };
    i.onkeydown = e => { if (e.key === 'Enter') b.click(); };
    $('#qeingabe').replaceChildren(i, b);
  }
  qTick(); QI = setInterval(qTick, 500);
}
let QB = false;
async function sync() {   // Stand vom Script neu laden (z. B. wenn die Anzeige veraltet ist)
  const j = await api({aktion: 'me', name: S.name, token: S.token});
  S = j.spieler; R = j.rang; zeige();
}
function antworten(x) {
  if (QB) return;   // Doppeltippen ignorieren
  QB = true;
  const sperre = v => document.querySelectorAll('#qeingabe button, #qeingabe input').forEach(e => e.disabled = v);
  sperre(true);
  los(async () => {
    try {
      const j = await api({aktion: 'antwort', name: S.name, token: S.token, antwort: x});
      S = j.spieler; R = j.rang; zeige();
      const e = j.ev;
      if (e.quiz === 'falsch') { $('#qmeld').textContent = t('qFalsch'); return; }
      if (e.quiz === 'richtig') belohnung(e.punkte, e.wuerfel);
      LOG = []; showLog();
      $('#log').textContent = e.quiz === 'richtig' ? t('qRichtig', e.punkte) + (e.wuerfel ? ' ' + t('qBonus', e.wuerfel) : '') : (e.loesung ? t('qAus', lv(e.loesung)) : t('qEnde'));
    } catch (e) {
      if (istNetz(e)) ausstiegZeigen();
      if (e.message !== 'E_KEINEAUFGABE') throw e;
      await sync();
      $('#log').textContent = t('qSync');
    }
  }, '#qmeld').finally(() => { QB = false; sperre(false); document.querySelectorAll('#qeingabe .laden').forEach(e => e.classList.remove('laden', 'sel')); });
}
const VARS = ['punkte', 'ziel', 'speed', 'huhn', 'sprint', 'zielzeit', 'huerden', 'weit', 'zielweit'];
const REKORD = {punkte: 1, speed: 1, huhn: 1, sprint: -1, huerden: -1, weit: 1};   // Bestleistungs-Ranglisten (wie REKORD in Code.gs): 1 = höher ist besser, -1 = niedriger ist besser
const rekV = () => ART.startsWith('pr_') ? ART.slice(3) : '';
const rekName = v => varName(v) + ' (' + t(REKORD[v] < 0 ? 'rkZ' : v === 'weit' ? 'rkW' : 'rkP') + ')';
const METR = ['quiz', 'mini'].concat(VARS);   // Reihenfolge wie METR in Code.gs
const varName = v => (['punkte', 'ziel', 'speed', 'huhn'].includes(v) ? t('B') + ': ' : '') + t('vn_' + v);
let Z = 'g', ART = 'alle';   // Rangliste: Zeitraum (g = gesamt, t = heute) und Wertung (alle, quiz, mini oder eine Minispiel-Variante)
const artName = a => a.startsWith('pr_') ? rekName(a.slice(3)) : ({alle: 'rAlle', quiz: 'rQuiz', mini: 'rMini', tw: 'rTw'}[a] ? t({alle: 'rAlle', quiz: 'rQuiz', mini: 'rMini', tw: 'rTw'}[a]) : varName(a));
function rangTitel() { $('#rwahlt').textContent = artName(ART); }
function rovZu() { $('#rov').classList.add('hide'); document.body.classList.remove('ovl'); }
function rovAuf() { rangOptionen(); $('#rov').classList.remove('hide'); document.body.classList.add('ovl'); }
function rangOptionen() {   // Ranglisten-Menü als Raster: Gruppen und Wertungen (Texte: TX rGrp*, rAlle, rQuiz, rMini, rTw, vn_*, rk*)
  const btn = (val, txt) => { const b = el('button', txt, 'rit zweit' + (ART === val ? ' an' : '')); b.type = 'button'; b.onclick = () => { ART = val; rovZu(); rangTitel(); if (R) rangZeige(); }; return b; };
  const grp = (ico, titel, items, cls) => { const g = el('section', '', 'rgr' + (cls ? ' ' + cls : '')), h = el('h4', ''), w = el('div', '', 'rwb'); h.innerHTML = '<span class="rgi">' + (SYM[ico] || '') + '</span>'; h.append(titel); w.append(...items); g.append(h, w); return g; };
  const vb = v => btn(v, t('vn_' + v));
  $('#rgrid').replaceChildren(
    grp('TROPHY', t('rGrpA'), [btn('alle', t('rAlle')), btn('quiz', t('rQuiz')), btn('mini', t('rMini')), btn('tw', t('rTw'))]),
    grp('B', t('rGrpB'), ['punkte', 'ziel', 'speed', 'huhn'].map(vb)),
    (() => { const c = el('div', '', 'rsp'); c.append(grp('L', t('rGrpL'), ['sprint', 'zielzeit', 'huerden'].map(vb)), grp('W', t('rGrpW'), ['weit', 'zielweit'].map(vb))); return c; })(),   // Leichtathletik: zwei Zellen übereinander in einer Spalte
    grp('ZP', t('rGrpR'), [['punkte', 'speed', 'huhn'], ['sprint', 'huerden', 'weit']].map(zeile => { const d = el('div', '', 'rrow'); d.append(...zeile.map(v => btn('pr_' + v, rekName(v)))); return d; }), 'rrek'));   // zwei Zeilen: Bogen / Lauf und Weitsprung
  rangTitel();
}
function wert(x) {   // Wert eines Spielers in der gewählten Rangliste
  if (ART === 'tw') return x.wt || 0;   // laufende Tageswertung
  if (ART === 'alle') return Z === 't' ? x.tag : x.punkte;
  return ((Z === 't' ? x.d : x.s) || [])[METR.indexOf(ART)] || 0;
}
const datum = id => { const [y, m, d] = String(id).split('-'); return L === 'de' ? d + '.' + m + '.' : L === 'fr' ? d + '/' + m : m + '/' + d; };
function twZeigen() {   // Hinweis zur Tageswertung und die Sieger der letzten Auswertung
  const e = $('#twinfo'); e.replaceChildren();
  if (ART !== 'tw' || !R || !R.tw) return;
  const T = R.tw, l = T.letzte;
  e.append(el('p', t('twHinweis', T.ende, T.plaetze, T.punkte, T.wuerfel), 'klein'), el('h3', t('twLetzte', l ? datum(l.tag) : '-')));
  if (!l || !l.sieger.length) { e.append(el('p', t('twKeine'), 'klein')); return; }
  const ich = S ? (S.anzeige || S.name) : '';
  l.sieger.forEach(x => { const d = el('div', '', 'hz'); d.append(el('time', x.pl + '.'), el('span', x.n + ' (' + x.tp + ')')); if (x.n === ich) d.style.fontWeight = '800'; e.append(d); });
  e.append(el('p', t('twBel', l.p, l.w), 'klein'));
}
function tsZeigen(liste) {   // Popup nach dem Anmelden: Tagessieg mit Belohnung
  const alt = $('#gov'); if (alt) alt.remove();
  const o = el('div', '', 'overlay'), k = el('div', '', 'karte'), ico = el('div', '', 'gicon'), b = el('button', t('verstanden'));
  let p = 0, w = 0; liste.forEach(x => { p += x.bp; w += x.bw; });
  o.id = 'gov'; ico.innerHTML = SYM.TROPHY; ico.querySelector('svg').style.color = 'var(--gold)';
  k.append(ico, el('p', t('twSieg'), 'gtext'));
  liste.forEach(x => k.append(el('p', t('twPlatz', x.pl, datum(x.t), x.tp), 'klein')));
  const m = el('p', '', 'meld'); m.id = 'tsm'; m.setAttribute('role', 'alert');   // Fehlermeldung direkt im Popup (die Zeile hinter dem Popup ist verdeckt)
  k.append(el('p', t('twBel', p, w), 'gtext'), m, b); o.append(k); document.body.append(o);
  b.onclick = () => {
    if (b.disabled) return;
    b.disabled = true; b.classList.add('laden');   // sichtbar: Anfrage läuft (Kreisel, pulsierend, gesperrt)
    return los(async () => {
      const j = await api({aktion: 'tsok', name: S.name, token: S.token});
      o.remove(); S = j.spieler; R = j.rang; zeige(); belohnung(p, w);
    }, '#tsm').finally(() => { if (b.isConnected) { b.disabled = false; b.classList.remove('laden'); } });
  };
}
function rangZeige() {
  const mk = (tag, txt, cls) => { const e = document.createElement(tag); e.textContent = txt; if (cls) e.className = cls; return e; };
  const voll = ART === 'alle' && Z === 'g', ich2 = x => !!x.ich, rv = rekV(), rkw = x => (x.rk && x.rk[rv]) || 0, bessere = (a, b) => REKORD[rv] < 0 ? a < b : a > b;
  $('#rsch').textContent = t(rv ? 'schnittB' : 'schnitt') + (voll && !rv && R.akt !== undefined ? ' ' + t('aktivAb', R.akt) : '');   // in der Gesamtwertung zeigt der Server das aktuelle Aktiv-Limit
  const tx = {}, tv = {};   // Teamwerte zum Anzeigen (tx) und numerisch zum Vergleichen (tv)
  ['rot', 'blau'].forEach(k => {
    let x = R.teams[k];
    if (rv) {   // Bestleistung: bester Wert des Teams
      const alle = R.top.filter(y => y.team === k), akt = alle.filter(y => rkw(y) > 0), best = akt.length ? akt.map(rkw).reduce((a, b) => bessere(a, b) ? a : b) : null;
      x = {gesamt: alle.length, aktiv: akt.length, schnitt: best === null ? '-' : rohText(rv, best)}; tv[k] = best;
    } else {
      if (!voll) {   // Teamwertung der gewählten Rangliste: Durchschnitt über Spieler mit Punkten in dieser Wertung
        const alle = R.top.filter(y => y.team === k), akt = alle.filter(y => wert(y) > 0);
        x = {gesamt: alle.length, aktiv: akt.length, schnitt: akt.length ? Math.round(akt.reduce((s, y) => s + wert(y), 0) / akt.length) : 0};
      }
      tv[k] = x.schnitt;
    }
    tx[k] = x;
  });
  const fuehrt = k => { const a = tv[k], b = tv[k === 'rot' ? 'blau' : 'rot']; if (a === null || a === undefined) return false; if (b === null || b === undefined) return true; return rv ? bessere(a, b) : a > b; };   // das bessere Team (je nach Wertung) bekommt einen stärkeren Glow; bei Gleichstand keines
  $('#teams').replaceChildren(...['rot', 'blau'].map(k => {
    const x = tx[k], d = mk('div', '', k + (fuehrt(k) ? ' fuehrt' : '')), l = mk('span', '', 'tl'), sv = mk('strong', '');
    if (!rv) sv.append(mk('span', 'Ø', 'oe'));   // Durchschnittszeichen: gezeigt wird der Durchschnitt je aktivem Spieler
    sv.append(String(x.schnitt));
    l.append(mk('b', t(k)), mk('small', t('aktiv', x.aktiv, x.gesamt)));
    d.append(l, sv);
    return d;
  }));
  document.querySelectorAll('#rtabs button').forEach(b => b.classList.toggle('an', b.dataset.f === F));
  $('#rl').classList.toggle('ohnerunden', !voll); $('#rl').classList.toggle('rek', !!rv); $('#rl thead th:nth-child(4)').textContent = t(rv ? 'cBest' : 'cPunkte');   // Runden gibt es nur in der Gesamtwertung aller Punkte
  const liste = R.top.filter(x => (!F || x.team === F) && (rv ? rkw(x) > 0 : (voll || wert(x) > 0))).sort(rv ? (x, y) => (bessere(rkw(x), rkw(y)) ? -1 : bessere(rkw(y), rkw(x)) ? 1 : 0) || y.punkte - x.punkte : (x, y) => wert(y) - wert(x) || y.punkte - x.punkte);
  const zeilen = liste.map((x, i) => {
    const tr = mk('tr', '', x.team + (ich2(x) ? ' ich2' : ''));
    tr.append(mk('td', i + 1), mk('td', x.name), mk('td', x.runden), mk('td', rv ? rohText(rv, rkw(x)) : wert(x)));
    return tr;
  });
  if (!zeilen.length) { const tr = mk('tr', ''), td = mk('td', t('rLeer')); td.colSpan = 4; tr.append(td); zeilen.push(tr); }
  $('#rlb').replaceChildren(...zeilen);
  $('#rlwrap').classList.toggle('scroll', liste.length > 15);   // ab 16 Einträgen scrollt die Tabelle
  const ich = liste.findIndex(ich2);  // Platz im gewählten Filter
  const zfest = ART === 'tw' || !!rv; $('#rzseg').classList.toggle('aus', zfest); document.querySelectorAll('#rzseg button').forEach(b => b.classList.toggle('an', b.dataset.z === (rv ? 'g' : Z))); rangTitel(); twZeigen();
  if (TAB === 'rangseite') { if (ART === 'tw') eiMelden('ent_tw'); else if (rv) eiMelden('ent_best'); }
  $('#platz').textContent = ich < 0 ? '' : F ? t('platzTeam', t(F), ich + 1, liste.length) : t(voll ? 'platz' : 'platzSel', ich + 1, liste.length);
}
let API_N = 0;   // laufende Spiel-Anfragen: der Chat fragt nur, wenn gerade keine läuft
async function api(a) { API_N++; try { const j = await apiRoh(a); if (j.bel && j.bel.length) belZeigen(j.bel); if (j.event) evSetzen(j.event); return j; } finally { API_N--; } }   // bel = Belohnungen aus Ereignissen
const istNetz = e => !!e && (e.name === 'AbortError' || e instanceof SyntaxError || /Failed to fetch|Load failed|NetworkError|network connection|Internet connection|offline|timed out/i.test(String(e.message)));   // Verbindungsfehler (Safari meldet "Load failed")
const DIAG = (() => { try { return JSON.parse(localStorage.getItem('dg')) || []; } catch (e) { return []; } })();
function diagMerken(a, v, e, ms) {   // Verbindungsfehler für das Fehlerprotokoll merken
  DIAG.push({t: new Date().toISOString(), a: a.aktion, v: v, f: String(e.name) + ': ' + String(e.message).slice(0, 80), on: navigator.onLine, ms: ms, ua: navigator.userAgent.slice(-50)});
  while (DIAG.length > DIAG_MAX) DIAG.shift();
  try { localStorage.setItem('dg', JSON.stringify(DIAG)); } catch (x) {}
}
let DIAG_SENDET = false;
function diagSenden() {   // nach einer erfolgreichen Antwort: gemerkte Fehler ins Blatt "Protokoll" melden
  if (DIAG_SENDET || !DIAG.length || !S) return;
  DIAG_SENDET = true;
  const n = DIAG.length, liste = DIAG.slice();
  fetch(API, {method: 'POST', body: JSON.stringify({aktion: 'klog', name: S.name, token: S.token, log: liste})}).then(r => r.json()).then(j => { if (!j.fehler) { DIAG.splice(0, n); try { localStorage.setItem('dg', JSON.stringify(DIAG)); } catch (x) {} } }).catch(() => {}).finally(() => { DIAG_SENDET = false; });
}
async function apiRoh(a) {   // mit Wiederholungen: jede Anfrage trägt eine rid, der Server liefert bei einer Wiederholung die erste Antwort erneut
  const rid = Date.now().toString(36) + Math.random().toString(36).slice(2, 10), body = JSON.stringify(Object.assign({rid: rid}, a));
  let letzter = null;
  for (let v = 0; v <= API_RETRIES; v++) {
    if (v > 0) {
      const sp = document.querySelector('.auswert span'); if (sp) sp.textContent = t('mWieder', v, API_RETRIES);
      await sleep(API_RETRY_MS * Math.pow(2, v - 1));
    }
    const ac = new AbortController(), tm = setTimeout(() => ac.abort(), API_TIMEOUT_MS), t0 = Date.now();
    try {
      const r = await fetch(API, {method: 'POST', body: body, signal: ac.signal});
      const j = await r.json();
      RESP = Date.now();  // Zeitpunkt der Serverantwort, Bezug für die Quiz-Uhr
      if (j.fehler) throw new Error(j.fehler);
      if (j.geschenk > 0) PEND = j.geschenk;
      if (j.geschenkRad > 0) PENDD = j.geschenkRad;
      setTimeout(diagSenden, 0);
      return j;
    } catch (e) {
      if (!istNetz(e)) throw e;
      letzter = e; diagMerken(a, v, e, Date.now() - t0);
    } finally { clearTimeout(tm); }
  }
  throw letzter;
}
async function sha(x) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(x));
  return 'h' + [...new Uint8Array(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}
async function los(f, ziel = '#fehler') {
  const z = $(ziel);
  z.textContent = ''; z.classList.remove('err');
  try { await f(); }
  catch (e) {
    z.textContent = istNetz(e) ? t('E_NET') : t(e.message);
    z.classList.add('err');
  }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const PIPS = {1:[4], 2:[2,6], 3:[2,4,6], 4:[0,2,6,8], 5:[0,2,4,6,8], 6:[0,2,3,5,6,8]};
const WUERFEL_OBEN = true;   // true = die gewürfelte Augenzahl liegt wie in echt OBEN und der Würfel wird stärker von schräg oben gezeigt (CSS: #bw.oben); false = die Zahl zeigt nach vorn zum Betrachter (bisherige Variante)
const ORI = {1:[0,0], 2:[0,-90], 3:[-90,0], 4:[90,0], 5:[0,90], 6:[0,180]};   // Drehung des Würfels, damit Seite n vorn liegt
function wuerfelBauen() {
  $('#cube').innerHTML = [1, 2, 3, 4, 5, 6].map(n => `<div class="fl fl${n}">` + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => `<i${PIPS[n].includes(k) ? ' class="on"' : ''}></i>`).join('') + '</div>').join('');
}
function face(n, z, ex) {   // Seite n zeigt nach vorn (oder, bei WUERFEL_OBEN, nach oben); z dreht den Würfel in der Bildebene bzw. um die senkrechte Achse, ex = zusätzliche Umdrehungen für den Auslauf
  const o = ORI[n], e = ex || [0, 0, 0];
  $('#cube').style.transform = WUERFEL_OBEN
    ? `rotateY(${(z || 0) + e[2]}deg) rotateX(${o[0] + 90 + e[0]}deg) rotateY(${o[1] + e[1]}deg)`
    : `rotateZ(${(z || 0) + e[2]}deg) rotateX(${o[0] + e[0]}deg) rotateY(${o[1] + e[1]}deg)`;
}
let rollT0 = 0;
function rolleStart() {
  document.querySelectorAll('#cube .fl').forEach(e => e.classList.remove('win'));
  $('#cube').classList.add('roll'); rollT0 = Date.now();
}
function rolleAus() { $('#cube').classList.remove('roll'); }
async function rolleStopp(w, kurz) {   // kurz: ohne Mindestdauer der Würfelanimation (z. B. wenn der Hauptwürfel nur die gewählte Zahl übernimmt)
  if (!kurz) await sleep(Math.max(0, T_WURF - (Date.now() - rollT0)));
  const c = $('#cube'), z = WUERFEL_OBEN ? Math.floor(Math.random() * 360) : 90 * Math.floor(Math.random() * 4), rz = () => 360 * (1 + Math.floor(Math.random() * 2)) * (Math.random() < 0.5 ? -1 : 1);
  const ex = [rz(), rz(), rz()];   // zufällige Auslaufdrehung und zufällige Lage in der Bildebene: oben liegt nicht immer dieselbe Seite
  c.classList.remove('roll'); c.classList.add('sofort'); face(w, z, ex); void c.offsetWidth;
  c.classList.remove('sofort'); face(w, z);
  c.querySelector('.fl' + w).classList.add('win');   // gewürfelte Seite farbig hervorheben
  if (!kurz) await sleep(T_AUSLAUF + T_WURF_NACH);   // erst wenn der Würfel ausgerollt ist, geht es weiter (Figur bzw. Auswahl bei der Doppel-Chance)
}
function lichtAn(n) {   // Feld erst aufleuchten lassen, wenn die Spielfigur dort ankommt
  document.querySelectorAll('.f.ich').forEach(e => e.classList.remove('ich'));
  const f = $('#f' + n);
  f.style.animationDuration = Math.round(T_SCHRITT * 1.5) + 'ms';
  f.classList.add('ich'); f.classList.remove('spur'); void f.offsetWidth; f.classList.add('spur');
}
function markiere(n, pt, fin) {   // fin = letzte Landung des Zugs (größerer Schnee-Puff)
  marker(n, true); fbSet(n);
  if (!CAM.ueb) { CAM.px = CAM.py = 0; }
  kamera(n, T_SCHRITT);
  setTimeout(() => { lichtAn(n); if (pt) fxPop('+' + pt, n); schneePuff(n, fin); }, T_SCHRITT);   // Figur und Kamera brauchen genau T_SCHRITT bis zum Ziel
}
function fxPop(txt, n) {   // +x steigt ein Stück (FX_FLUG) vom Feld Richtung Statuszeile auf
  const k = $('#kamera'), f = $('#f' + n);
  if (!k.clientWidth || !f) return;
  const kr = k.getBoundingClientRect(), fr = f.getBoundingClientRect(), e = el('span', txt, 'pop');
  e.style.left = (fr.left + fr.width / 2 - kr.left) + 'px'; e.style.top = (fr.top + fr.height * 0.35 - kr.top) + 'px';
  $('#kfx').append(e); e.onanimationend = () => e.remove();
}
function belohnung(p, w, s, d, k) {   // nach Quiz/Minispiel: gewonnene Punkte und Würfel groß einblenden und wieder ausblenden
  if (!(p > 0) && !(w > 0) && !(s > 0) && !(d > 0) && !(k > 0)) return;
  const b = el('div', '', 'bel'), mk = (cls, html) => { const x = el('span', '', cls); x.innerHTML = html; b.append(x); };
  if (p > 0) mk('bp', '<b>+' + p + '</b><small>' + t('pts') + '</small>');
  if (w > 0) mk('bw', '<b>+' + w + '</b>' + SYM.ZW);
  if (s > 0) mk('bs', '<b>+' + s + '</b>' + SYM.S);
  if (d > 0) mk('bd', '<b>+' + d + '</b>' + SYM.R);
  if (k > 0) mk('bk', '<b>+' + k + '</b>' + SYM.D);
  document.body.append(b); b.onanimationend = () => b.remove();
}
// ---- Glücksrad ----
const RAD_MS = 6000;               // Dauer der Drehung in ms
const RAD_RUNDEN = [3, 5];         // volle Umdrehungen (min, max) vor dem Stopp
const RAD_EASE = 'cubic-bezier(0.45, 0.05, 0.15, 1)';   // langsamer Anlauf, langes sanftes Abbremsen
const RAD_STD = [{t: 'w', n: 1}, {t: 'p', n: 10}, {t: 'w', n: 3}, {t: 'nix', n: 0}, {t: 'w', n: 1}, {t: 'p', n: 50}, {t: 'w', n: 2}, {t: 's', n: 1}, {t: 'p', n: 10}, {t: 'nix', n: 0}, {t: 's', n: 2}, {t: 'k', n: 1}];   // Anordnung wie GLUECK.segmente in Code.gs; der Server schickt die gültige Anordnung mit
const RAD_FARBE = {w: '#ff4fd8', p: '#ffd23f', s: '#3b95d6', k: '#00e5ff', nix: '#7d8da0'}, RAD_ICON = {w: 'ZW', p: 'ZP', s: 'S', k: 'D'};
let RAD_ROT = 0, RAD_BUSY = false, RAD_KEY = '';
function radZeichnen() {   // Rad als SVG aus den Segmenten aufbauen (nur wenn sich die Anordnung ändert)
  const seg = (S && S.radseg) || RAD_STD, key = JSON.stringify(seg);
  if (key === RAD_KEY) return; RAD_KEY = key;
  const n = seg.length, a = 360 / n, cx = 200, cy = 200, r = 186, pt = (deg, rad) => [cx + rad * Math.sin(deg * Math.PI / 180), cy - rad * Math.cos(deg * Math.PI / 180)];
  let h = '<defs><radialGradient id="radglow" cx="50%" cy="50%" r="50%"><stop offset="62%" stop-color="#0b1320" stop-opacity="0"/><stop offset="100%" stop-color="#2fd4b8" stop-opacity=".22"/></radialGradient></defs><circle cx="200" cy="200" r="194" fill="#0b1320" stroke="#2fd4b8" stroke-opacity=".55" stroke-width="3"/>';
  seg.forEach((sg, i) => {
    const c = RAD_FARBE[sg.t] || RAD_FARBE.nix, p0 = pt(i * a, r), p1 = pt((i + 1) * a, r), mid = i * a + a / 2, ti = pt(mid, r * 0.76), tt = pt(mid, r * 0.60);
    h += `<path d="M${cx} ${cy}L${p0[0]} ${p0[1]}A${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}Z" fill="${c}" fill-opacity="${sg.t === 'nix' ? .07 : .17}" stroke="${c}" stroke-opacity=".5" stroke-width="1.5"/>`;
    h += `<g transform="rotate(${mid} ${ti[0]} ${ti[1]})">` + (RAD_ICON[sg.t] ? SYM[RAD_ICON[sg.t]].replace('<svg ', `<svg x="${ti[0] - 16}" y="${ti[1] - 16}" width="32" height="32" style="color:${c}" `)
      : `<path d="M${ti[0] - 10} ${ti[1] - 10}L${ti[0] + 10} ${ti[1] + 10}M${ti[0] + 10} ${ti[1] - 10}L${ti[0] - 10} ${ti[1] + 10}" stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none"/>`) + '</g>';
    if (sg.t !== 'nix') h += `<text x="${tt[0]}" y="${tt[1]}" transform="rotate(${mid} ${tt[0]} ${tt[1]})" fill="${c}" fill-opacity=".82" font-size="22" font-weight="800" text-anchor="middle" dominant-baseline="central" font-family="Barlow Condensed, Rajdhani, sans-serif">+${sg.n}</text>`;
  });
  $('#radsvg').innerHTML = h + '<circle cx="200" cy="200" r="186" fill="url(#radglow)" pointer-events="none"/>';
}
const RAD_VMAX = 600;        // Drehgeschwindigkeit in Grad pro Sekunde, solange auf die Antwort des Servers gewartet wird
const RAD_ANLAUF_MS = 500;   // so lange dauert das Anlaufen bis zur vollen Drehgeschwindigkeit
const RAD_BREMS_MS = 4200;   // so lange dauert das sanfte Abbremsen, nachdem die Antwort da ist
function radLauf(anfrage) {   // Rad dreht sofort los, bremst nach Eintreffen der Antwort auf das Zielsegment ab und liefert die Antwort (oder wirft den Fehler nach dem Stopp)
  return new Promise((ok, fehl) => {
    const e = $('#radsvg'), a = 360 / ((S && S.radseg) || RAD_STD).length;
    let ang = RAD_ROT, vel = 0, last = performance.now(), brems = null, antwort = null, fehler = null;
    e.style.transition = 'none';
    anfrage.then(x => { antwort = x; }, x => { fehler = x; });
    const frame = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!brems) {
        vel = Math.min(RAD_VMAX, vel + RAD_VMAX / (RAD_ANLAUF_MS / 1000) * dt); ang += vel * dt;
        if ((antwort || fehler) && vel >= RAD_VMAX) {   // Bremsweg so wählen, dass das Zielsegment unter dem Zeiger (oben) stehen bleibt und die Geschwindigkeit ohne Sprung in das Abbremsen übergeht
          const D = RAD_BREMS_MS / 1000; let L = RAD_VMAX * D / 3;
          if (antwort) { const ziel = -((antwort.ev.rad * a + a / 2) + (Math.random() - 0.5) * a * 0.6); L += (((ziel - (ang + L)) % 360) + 360) % 360; }
          brems = {t0: now, a0: ang, L: L, k: RAD_VMAX * D / L};
        }
      } else {
        const u = Math.min(1, (now - brems.t0) / RAD_BREMS_MS);
        ang = brems.a0 + brems.L * (1 - Math.pow(1 - u, brems.k));
        if (u >= 1) { RAD_ROT = ang; e.style.transform = 'rotate(' + ang + 'deg)'; return fehler ? fehl(fehler) : ok(antwort); }
      }
      RAD_ROT = ang; e.style.transform = 'rotate(' + ang + 'deg)';
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}
$('#rbtn').onclick = () => los(async () => {
  if (RAD_BUSY) return;
  if (S.eventVorbei) { wackeln($('#rbtn')); throw new Error('E_EVENTENDE'); }
  if (nochNicht()) { wackeln($('#rbtn')); throw new Error('E_EVENTNOCH'); }
  if (!(S.drehs > 0)) { wackeln($('#rbtn')); throw new Error('E_NODREH'); }
  RAD_BUSY = true; $('#rbtn').disabled = true; $('#radtext').textContent = '';
  const von = S.drehs;
  zahl('rzahl', von - 1, $('#rzahl')); $('#rbtn').classList.toggle('leer', von - 1 < 1);   // Anzahl sofort verringern, das Ergebnis erst nach dem Stopp zeigen
  try {
    const j = await radLauf(api({aktion: 'drehen', name: S.name, token: S.token}));   // das Rad dreht schon, während der Server noch antwortet
    S = j.spieler; R = j.rang; RAD_BUSY = false; zeige();
    const e = j.ev;
    $('#radtext').textContent = e.t === 'nix' ? t('radNiete') : t('radErg', t(e.t === 'w' ? 'radW' : e.t === 'p' ? 'radP' : e.t === 'k' ? 'radK' : 'radS', e.n));
    belohnung(e.t === 'p' ? e.n : 0, e.t === 'w' ? e.n : 0, e.t === 's' ? e.n : 0, 0, e.t === 'k' ? e.n : 0);
  } catch (x) {
    zahl('rzahl', S.drehs || 0, $('#rzahl')); $('#rbtn').classList.toggle('leer', !(S.drehs > 0));   // Fehler: Anzeige zurücksetzen
    throw x;
  } finally { RAD_BUSY = false; $('#rbtn').disabled = false; }
}, '#log');
const jetztMs = () => Date.now() + ((EV && EV.versatz) || 0);   // Serverzeit (versatz gleicht Abweichungen der Geräteuhr aus)
function nochNicht() { if (S && S.admin) return false; return EV && EV.startMs ? jetztMs() < EV.startMs : !!(S && S.eventNoch); }   // true: das Startdatum ist noch nicht erreicht, es kann noch nicht gespielt werden
function dauerText(ms) {
  const m = Math.floor(Math.max(0, ms) / 60000), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mi = m % 60;
  return d > 0 ? d + ' ' + t('zT') + ' ' + h + ' ' + t('zStd') : h > 0 ? h + ' ' + t('zStd') + ' ' + mi + ' ' + t('zMin') : mi + ' ' + t('zMin');
}
function restText() {   // vor dem Start: Zeit bis zum Start; danach verbleibende Spielzeit bis Mitternacht nach dem letzten Spieltag
  if (!EV || !EV.endeMs) return '';
  if (nochNicht()) return t('restStart', dauerText(EV.startMs - jetztMs()));
  const ms = EV.endeMs - jetztMs();
  if (ms <= 0) return t('restEnde');
  return t('restNoch', dauerText(ms));
}
function restZeichnen() { const x = restText(); document.querySelectorAll('#stat .rest').forEach(e => { e.textContent = x; e.parentNode.classList.toggle('hide', !x); }); }
function evSetzen(e) {   // Event-Status vom Server übernehmen (beim Laden, mit jeder Spielantwort, wenn die Seite wieder sichtbar wird); liefert true, wenn sich etwas geändert hat
  const k = x => x ? [x.start, x.ende, x.bis, x.tage, x.vorbei, x.gesperrt, x.startMs, x.endeMs].join('|') : '', alt = k(EV);
  EV = e; EV.versatz = e.jetzt - Date.now();
  const neu = k(EV) !== alt;
  if (neu) { eventInfo(); hilfeZeige(); }
  restZeichnen();
  return neu;
}
function statusLaden() { chatCall({aktion: 'status'}).then(e => { if (evSetzen(e) && S && !API_N) zeige(); }).catch(() => {}); }
let NOCH_ALT = false;   // Stand von nochNicht() bei der letzten Anzeige: ändert er sich (Startzeitpunkt erreicht), wird die Anzeige neu aufgebaut
setInterval(() => { restZeichnen(); if (S && nochNicht() !== NOCH_ALT) zeige(); }, 30000);
function bestaetigen(text, ok, gefahr) {   // eigener Bestätigungsdialog statt confirm(); liefert true (bestätigt) oder false (abgebrochen)
  return new Promise(res => {
    const o = el('div', '', 'overlay'), k = el('div', '', 'karte bdlg'), z = el('div', '', 'bzeile'), a = el('button', t('abbrechen'), 'zweit'), b = el('button', ok, gefahr ? 'gefahr' : '');
    o.id = 'bdlg';
    const kd = e => { if (e.key === 'Escape') zu(false); }, zu = v => { document.removeEventListener('keydown', kd); o.remove(); res(v); };
    a.onclick = () => zu(false); b.onclick = () => zu(true); o.onclick = e => { if (e.target === o) zu(false); };
    z.append(a, b); k.append(el('p', text, 'btext'), z); o.append(k); document.body.append(o);
    document.addEventListener('keydown', kd); a.focus();
  });
}
// ---- Eventende: Hinweis auf der Anmeldeseite und Finale ----
const datumVoll = id => { const [y, m, d] = String(id).split('-'); return L === 'de' ? d + '.' + m + '.' + y : L === 'fr' ? d + '/' + m + '/' + y : m + '/' + d + '/' + y; };
function eventInfo() {   // Anmeldeseite: Hinweis, wenn das Event beendet ist oder noch nicht begonnen hat
  const e = $('#eventinfo'), vorbei = !!(EV && EV.vorbei), noch = !vorbei && !!(EV && EV.startMs && nochNicht());
  e.classList.toggle('hide', !vorbei && !noch);
  e.textContent = vorbei ? (EV.gesperrt ? t('evInfoZu') : t('evInfo', datumVoll(EV.bis))) : noch ? t('evInfoNoch', datumVoll(EV.start), EV.startZeit || '') : '';
}
function finaleZeigen() {   // Finale: Siegerteam, Top 3 und eigenes Ergebnis
  if (!R || !S) return;
  const alt = $('#fin'); if (alt) alt.remove();
  const o = el('div', '', 'overlay'), k = el('div', '', 'karte fin'), ico = el('div', '', 'gicon'), tm = R.teams, row = el('div', '', 'fteams');
  o.id = 'fin'; ico.innerHTML = SYM.TROPHY; ico.querySelector('svg').style.color = 'var(--gold)';
  k.append(ico, el('h2', t('finT')), el('p', tm.rot.schnitt === tm.blau.schnitt ? t('finGleich') : t('finSieger', t(tm.rot.schnitt > tm.blau.schnitt ? 'rot' : 'blau')), 'gtext'));
  ['rot', 'blau'].forEach(x => { const d = el('div', '', 'fteam ' + x); d.append(el('b', t(x)), el('strong', tm[x].schnitt), el('small', t('aktiv', tm[x].aktiv, tm[x].gesamt))); row.append(d); });
  k.append(row, el('h3', t('finTop')));
  R.top.slice(0, 3).forEach((x, i) => { const d = el('div', '', 'frow ' + x.team + (x.ich ? ' ich2' : '')); d.append(el('span', (i + 1) + '.'), el('span', x.name), el('b', x.punkte)); k.append(d); });
  if (R.platz) k.append(el('p', t('finDu', R.platz, R.gesamt, S.punkte, S.runden), 'gtext'));
  const b1 = el('button', t('finRang')), b2 = el('button', t('verstanden'), 'zweit');
  b1.onclick = () => { o.remove(); tab('rangseite'); }; b2.onclick = () => o.remove();
  k.append(b1, b2); o.append(k); document.body.append(o);
}
// ---- Ereignisse: Easter Eggs, Tagesaufgaben ----
const EI_LANG_MS = 900;   // so lange (ms) auf eine Beschriftung drücken, damit ein Easter Egg gemeldet wird (data-ea="lang"); Symbole mit data-ea="klick" reagieren auf Antippen
const EI_GEFRAGT = new Set(); let EI_TAG = '';   // pro Tag und Sitzung wird jede ID nur einmal gemeldet
function eiMelden(id, egg) {   // egg = true: Easter-Egg-Versteck (immer melden), sonst Entdecken-Aufgabe   // dem Server melden; er entscheidet, ob es ein Treffer ist (keine Rückmeldung bei Fehlversuchen)
  if (!S || S.eventVorbei || !S.ev || nochNicht()) return;
  const heute = new Date().toDateString(); if (EI_TAG !== heute) { EI_GEFRAGT.clear(); EI_TAG = heute; }
  if (EI_GEFRAGT.has(id)) return;
  if (!egg && !S.ev.aufgaben.some(a => a.id === id && !a.ok) && !(S.ev.melden || []).includes(id)) return;   // Entdecken-Aufgaben nur melden, wenn sie heute offen sind (sichtbar) oder der Server versteckte meldet (S.ev.melden, Konfiguration)
  EI_GEFRAGT.add(id);
  api({aktion: 'ereignis', name: S.name, token: S.token, id: id}).then(j => { S = j.spieler; R = j.rang; zeige(); }).catch(() => {});
}
function belZeigen(l) {   // Belohnung aus Ereignissen einblenden
  const sum = {p: 0, w: 0, d: 0, s: 0}; l.forEach(x => { sum.p += x.p || 0; sum.w += x.w || 0; sum.d += x.d || 0; sum.s += x.s || 0; });
  belohnung(sum.p, sum.w, sum.s, sum.d);
  LOG = []; showLog(); $('#log').textContent = l.map(x => lv(x.titel)).join(' · ');
}
let eiT = 0, eiX = 0, eiY = 0;
document.addEventListener('click', e => { const x = e.target.closest('[data-egg][data-ea="klick"]'); if (x) eiMelden(x.dataset.egg, true); });
document.addEventListener('pointerdown', e => { clearTimeout(eiT); const x = e.target.closest('[data-egg][data-ea="lang"]'); if (x) { eiX = e.clientX; eiY = e.clientY; eiT = setTimeout(() => eiMelden(x.dataset.egg, true), EI_LANG_MS); } });
document.addEventListener('pointermove', e => { if (eiT && Math.hypot(e.clientX - eiX, e.clientY - eiY) > 12) { clearTimeout(eiT); eiT = 0; } });
['pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, () => { clearTimeout(eiT); eiT = 0; }));
function tpanelZeichnen() {   // Liste der Tagesaufgaben
  const e = S && S.ev, l = $('#tliste'), ico = ok => ic(ok ? '<path ' + LN + ' d="M5 12l5 5 9-10"/>' : '<circle cx="12" cy="12" r="8" ' + LN + '/>');
  if (!e || !e.aufgaben.length) { l.replaceChildren(el('p', t('tKeine'), 'klein')); return; }
  l.replaceChildren(...e.aufgaben.map(a => { const d = el('div', '', 'hz' + (a.ok ? ' ok' : '')), tm = el('time', ''), tx = el('span', ''); tm.innerHTML = ico(a.ok); tx.append(el('b', lv(a.t)), el('br'), el('small', lv(a.x))); d.append(tm, tx); return d; }),
    el('p', t('tHeute', e.heute, e.deckel), 'klein'), el('p', t('tSerie', e.serie), 'klein'));
}
function evAdminZeige() {   // Admin: heutige Easter Eggs und Tagesaufgaben
  const e = EVA, b = $('#evinfo'); if (!e) { b.replaceChildren(); return; }
  const liste = arr => arr.length ? arr.map(x => { const d = el('div', '', 'hz'); d.append(el('time', x.id), el('span', lv(x.t) + (x.n ? ' – ' + x.n : ''))); return d; }) : [el('p', t('evKeine'), 'klein')];
  b.replaceChildren(el('h3', t('evAdminTag', e.tag)), el('p', t('evKonf', e.deckel, e.fehl, t(e.tw ? 'evAn' : 'evAus'), t(e.an ? 'evAn' : 'evAus'), t(e.meldeV ? 'evAn' : 'evAus')), 'klein'),
    el('h3', t('evEier', e.eier.length, e.eierGesamt)), ...liste(e.eier), el('h3', t('evAufg', e.aufgaben.length)), ...liste(e.aufgaben));
}
$('#evneu').onclick = () => bestaetigen(t('evNeuFrage'), t('evNeu')).then(ja => { if (ja) los(async () => { await adminCall({aktion: 'evneu'}); $('#evm').textContent = t('evNeuOk'); }, '#evm'); });
// ---- Chat ----
let CH = {msgs: [], max: 0, gel: 0, last: 0, ver: 0, busy: false, geladen: false, edit: 0, reply: null}, CHAT_T = 0;   // msgs = geladene Nachrichten, max/gel = höchste Nachrichten-ID bzw. zuletzt gelesene ID laut Server, last = höchste geladene ID
async function chatCall(a) {   // eigener Aufruf: setzt weder die Quiz-Uhr (RESP) noch Geschenke und zählt nicht als Spiel-Anfrage
  const r = await fetch(API, {method: 'POST', body: JSON.stringify(a)}), j = await r.json();
  if (j.fehler) throw new Error(j.fehler);
  return j;
}
function chatMarker() { $('#cmark').classList.toggle('hide', !(S && CH.max > CH.gel) || TAB === 'chat'); }
function chatPlan() {   // nächste Abfrage einplanen
  clearTimeout(CHAT_T); CHAT_T = 0;
  if (!S) return;
  CHAT_T = setTimeout(chatTick, TAB === 'chat' ? CHAT_INTERVALL_OFFEN_MS : CHAT_INTERVALL_MS);
}
async function chatTick() {
  if (!S) return;
  if (document.hidden || API_N > 0 || CH.busy) return chatPlan();   // Spiel hat Vorrang: später erneut versuchen
  try {
    if (TAB === 'chat') await chatLaden();
    else { const j = await chatCall({aktion: 'chatpoll', name: S.name, token: S.token}); if (j.chat && !j.chat.busy) { CH.max = j.chat.max; CH.gel = j.chat.gelesen; chatMarker(); } }
  } catch (e) {}
  chatPlan();
}
const chatZeit = ms => { const d = new Date(ms), z = d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}); return d.toDateString() === new Date().toDateString() ? z : d.toLocaleDateString([], {day: '2-digit', month: '2-digit'}) + ' ' + z; };
function chatZeichnen(runter) {
  const v = $('#cverlauf'), unten = v.scrollHeight - v.scrollTop - v.clientHeight < 80;
  const nf = CH.trenn >= 0 ? CH.msgs.findIndex(x => x.id > CH.trenn && !x.ich) : -1;   // erste ungelesene Nachricht eines anderen Spielers: davor kommt die Trennlinie (nicht ganz oben)
  v.replaceChildren(...(CH.msgs.length ? CH.msgs.flatMap((m, i) => {
    const b = el('div', '', 'cm ' + (m.ich ? 'ich' : 'andere')), k = el('small', '');
    k.append(el('b', m.n), ' · ' + chatZeit(m.t) + (m.e ? ' · ' + t('chatBearbeitet') : '')); b.append(k); if (m.r) { const q = el('div', '', 'cq'); q.append(el('b', m.rn || t('chatGeloescht')), m.rn ? el('span', m.rx) : ''); b.append(q); } b.append(el('span', m.x, 'ct'));
    let tm = 0, x0 = 0, y0 = 0;   // Langes Drücken (oder Rechtsklick) öffnet das Menü zur Nachricht
    b.onpointerdown = e => { x0 = e.clientX; y0 = e.clientY; clearTimeout(tm); tm = setTimeout(() => chatMenue(m, b), CHAT_LANG_MS); };
    b.onpointermove = e => { if (Math.hypot(e.clientX - x0, e.clientY - y0) > 10) clearTimeout(tm); };
    b.onpointerup = b.onpointercancel = b.onpointerleave = () => clearTimeout(tm);
    b.oncontextmenu = e => { e.preventDefault(); clearTimeout(tm); chatMenue(m, b); };
    if (i === nf && i > 0) { const tr = el('div', '', 'cneu'); tr.append(el('span', t('chatNeu'))); return [tr, b]; }
    return [b];
  }) : [el('p', t(CH.geladen ? 'chatLeer' : 'chatLaedt'), 'klein')]));
  if (runter || unten) v.scrollTop = v.scrollHeight;
}
function chatMenueZu() { const m = $('#cmenu'); if (m) m.remove(); }
function chatMenue(m, b) {   // kleines Menü: Kopieren für alle, Bearbeiten nur eigene, Löschen eigene bzw. alle für Admins
  chatMenueZu();
  const menu = el('div', '', 'cmenu'), eintrag = (txt, f) => { const x = el('button', txt, 'zweit'); x.type = 'button'; x.onclick = () => { chatMenueZu(); f(); }; menu.append(x); };
  menu.id = 'cmenu';
  eintrag(t('chatAntwort'), () => { CH.edit = 0; CH.reply = {id: m.id}; $('#csend').textContent = t('chatSenden'); $('#ceditt').textContent = t('chatAntwortAn', m.n) + ': ' + Array.from(m.x).slice(0, 50).join(''); $('#cedit').classList.remove('hide'); $('#ctext').focus(); });
  eintrag(t('chatKopieren'), () => { try { navigator.clipboard.writeText(m.x); } catch (e) {} });
  if (m.ich) eintrag(t('chatBearbeiten'), () => { CH.edit = m.id; CH.reply = null; $('#ctext').value = m.x; $('#ceditt').textContent = t('chatBearb'); $('#cedit').classList.remove('hide'); $('#csend').textContent = t('chatSpeichern'); chatZaehler(); $('#ctext').focus(); });
  if (m.ich || (S && S.admin)) eintrag(t('chatLoeschen'), () => { bestaetigen(t('chatLoeschFrage'), t('chatLoeschen'), true).then(ja => { if (ja) los(() => chatLaden({aktion: 'chatloeschen', id: m.id}), '#cfehler'); }); });
  document.body.append(menu);
  const r = b.getBoundingClientRect(), w = menu.offsetWidth, h = menu.offsetHeight;
  menu.style.left = Math.max(8, Math.min(innerWidth - w - 8, m.ich ? r.right - w : r.left)) + 'px';
  menu.style.top = Math.max(8, r.bottom + 6 + h > innerHeight - 8 ? r.top - h - 6 : r.bottom + 6) + 'px';
  setTimeout(() => document.addEventListener('pointerdown', function zu(e) { if (!menu.contains(e.target)) { chatMenueZu(); document.removeEventListener('pointerdown', zu); } }), 0);
}
function chatEditEnde(behalten) { CH.edit = 0; CH.reply = null; $('#cedit').classList.add('hide'); $('#csend').textContent = t('chatSenden'); if (!behalten) $('#ctext').value = ''; chatZaehler(); }   // behalten: Text im Eingabefeld lassen (Antwort abbrechen)
async function chatLaden(extra) {   // Nachrichten holen (und als gelesen markieren) oder eine Aktion ausführen: chatsenden, chatbearbeiten, chatloeschen; die Antwort enthält immer die komplette Liste
  while (CH.busy) await sleep(200);
  CH.busy = true;
  try {
    const j = await chatCall(Object.assign({aktion: 'chatlesen', name: S.name, token: S.token, seit: CH.last, ver: CH.ver}, extra || {})), c = j.chat, alt = CH.last;
    if (j.bel && j.bel.length) { belZeigen(j.bel); sync().catch(() => {}); }   // Belohnung aus einem Ereignis (z. B. Chat-Antwort): Stand aktualisieren
    if (c.voll) CH.msgs = c.msgs;   // komplette Liste (erster Abruf oder es gab Änderungen/Löschungen)
    else CH.msgs = CH.msgs.concat(c.msgs.filter(m => !CH.msgs.some(x => x.id === m.id))).slice(-200);   // sonst nur die neuen
    CH.ver = c.ver; CH.geladen = true; CH.last = CH.msgs.length ? CH.msgs[CH.msgs.length - 1].id : 0;
    CH.max = c.max; CH.gel = c.gelesen; chatMarker();
    if (TAB === 'chat') chatZeichnen(!!(extra && extra.aktion === 'chatsenden') || CH.msgs.some(m => m.id > alt && m.ich));
  } finally { CH.busy = false; }
}
function chatOeffnen() {   // CH.trenn = bis hierhin war alles gelesen; ab der nächsten Nachricht kommt die Trennlinie, und beim Öffnen springt die Ansicht dorthin
  CH.trenn = CH.gel; chatZeichnen(true); chatZaehler();
  los(() => chatLaden().then(() => { const v = $('#cverlauf'), d = v.querySelector('.cneu'); if (d) v.scrollTop += d.getBoundingClientRect().top - v.getBoundingClientRect().top - 8; else v.scrollTop = v.scrollHeight; }), '#cfehler');
}
function chatZaehler() { const n = Array.from($('#ctext').value).length, z = $('#czaehl'); z.textContent = n + ' / ' + CHAT_MAX; z.classList.toggle('err', n > CHAT_MAX); }
$('#ctext').oninput = chatZaehler;
$('#ctext').onkeydown = e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('#csend').click(); } };
$('#csend').onclick = () => {
  const b = $('#csend'), x = $('#ctext').value.trim();
  if (b.disabled || !x) return;
  b.disabled = true; b.classList.add('laden');
  los(async () => {
    if (Array.from(x).length > CHAT_MAX) throw new Error('E_CHATLANG');
    if (CH.edit) { await chatLaden({aktion: 'chatbearbeiten', id: CH.edit, text: x}); chatEditEnde(); }
    else { await chatLaden({aktion: 'chatsenden', text: x, antwort: CH.reply ? CH.reply.id : 0}); chatEditEnde(); }
  }, '#cfehler').finally(() => { b.disabled = false; b.classList.remove('laden'); });
};
document.addEventListener('visibilitychange', () => { if (!document.hidden) { statusLaden(); if (S) { clearTimeout(CHAT_T); CHAT_T = setTimeout(chatTick, 1500); } } });   // Tab wieder sichtbar: Event-Status neu laden und bald im Chat nachsehen   // Tab wieder sichtbar: bald nachsehen
async function ziehe(von, w, land, ende, txt) {
  let p = von; const weg = [], pk = [], zs = zugWert();   // pk: Punkte, die beim Betreten des jeweiligen Wegfelds angezeigt werden
  for (let i = 0; i < w; i++) { p++; weg.push(p); pk.push(zs); if (p >= 100) break; }
  const rest = w - weg.length;   // Schritte über das Ziel hinaus zählen auch
  if (weg[weg.length - 1] === 100) { weg.push(1); pk.push(50 + rest * zs); }  // Ziel erreicht: automatisch zurück zum Start (+50 für die Runde)
  if (weg[weg.length - 1] !== land) { weg.push(land); pk.push(0); }
  const zp = (txt || []).includes('ZP') ? 25 : 0;
  if (ende === land) pk[pk.length - 1] += zp;
  for (let i = 0; i < weg.length; i++) { markiere(weg[i], pk[i], i === weg.length - 1 && ende === land); await sleep(T_SCHRITT); }
  if (ende !== land) { await sleep(T_SPRUNG); markiere(ende, zp, true); await sleep(T_SCHRITT); }
}
function abmelden() {
  delete document.body.dataset.tab; einstTab('profil');
  HILFE_ADMIN = false; HILFE_ZUG = null; setTimeout(hilfeZeige, 0);   // Admin-Button der Hilfe entfernen
  loginAnsicht('login'); hilfeTab('spiel'); FB_STERN = 0; fbSterneZeichnen(); $('#fbtext').value = ''; $('#fbbetreff').value = ''; $('#fbm').textContent = ''; fbZaehler();   // Feedback-Formular leeren
  adminTab('sp'); AECODE = null; TWA = null; setTimeout(() => $('#n').focus(), 0);   // nach dem Abmelden wieder in den Spielernamen
  HIST.length = 0; legendeAus(); ['kpanel', 'hpanel', 'tpanel'].forEach(p => $('#' + p).classList.add('hide'));
  APN = null; PEND = 0; PENDD = 0; Object.keys(ZA).forEach(k => { cancelAnimationFrame(ZA[k].raf); delete ZA[k]; });
  const gv = $('#gov'); if (gv) gv.remove();
  try { localStorage.removeItem('sw'); } catch (e) {}
  S = null; LOG = []; showLog(); FINALE_GEZEIGT = false; ['#fin', '#bdlg', '#wov', '#swov'].forEach(x => { const e = $(x); if (e) e.remove(); }); $('#eventende').classList.add('hide'); clearTimeout(CHAT_T); CHAT_T = 0; CH = {msgs: [], max: 0, gel: 0, last: 0, ver: 0, busy: false, geladen: false, edit: 0, reply: null}; $('#cedit').classList.add('hide'); chatMenueZu(); $('#cverlauf').replaceChildren(); $('#ctext').value = ''; $('#cfehler').textContent = '';
  document.body.className = '';
  $('#spiel').classList.add('hide'); $('#radseite').classList.add('hide'); $('#chat').classList.add('hide'); $('#rangseite').classList.add('hide'); $('#hilfe').classList.add('hide'); $('#nav').classList.add('hide'); TAB = 'spiel'; APW = ''; ASELS = new Set(); $('#admin').classList.add('hide'); $('#alock').classList.remove('hide'); $('#apanel').classList.add('hide'); $('#apw').value = ''; $('#quiz').classList.add('hide'); document.body.classList.remove('ovl'); $('#aus').classList.add('hide'); $('#login').classList.remove('hide'); $('#einst').classList.add('hide'); $('#kto').classList.add('hide'); $('#kto').classList.remove('an'); $('#rcov').classList.add('hide'); $('#reset').classList.add('hide'); document.querySelectorAll('#einst input, #reset input, #regform input').forEach(e => e.value = ''); ['#eanm', '#epm', '#erm', '#lfehler', '#rfehler', '#xfehler', '#fehler'].forEach(x => $(x).textContent = '');
  $('#stat').replaceChildren(); $('#p').value = '';
}
async function anmelden() {
  const n = $('#n').value.trim();
  const j = await api({aktion: 'login', name: n, hash: await sha(n.toLowerCase() + ':' + $('#p').value)});
  S = j.spieler; R = j.rang; zeige(); window.scrollTo(0, 0); $('main').scrollTop = 0;
}

$('#lang').onchange = e => { L = e.target.value; try { localStorage.setItem('sl', L); } catch (x) {} sprache(); };
$('#aus').onclick = abmelden;
const fehlt = (felder, fehler) => { const leer = felder.find(f => !$(f).value.trim()); if (leer) { $(leer).focus(); throw new Error(fehler); } };   // erstes leeres Feld fokussieren und abbrechen, bevor etwas an den Server geht
$('#bin').onclick = () => los(async () => { fehlt(['#n', '#p'], 'E_LOGINLEER'); await anmelden(); }, '#lfehler');
function loginAnsicht(w) {   // Standard: nur die Anmeldung; die Registrierung ist ein eigenes Formular
  $('#loginform').classList.toggle('hide', w !== 'login'); $('#regform').classList.toggle('hide', w !== 'reg');
  setTimeout(() => $(w === 'reg' ? '#rn' : '#n').focus(), 0);
}
function teamInfo() { const v = $('#t').value, e = $('#teaminfo'); e.className = 'klein teaminfo ' + v; e.textContent = t(v === 'rot' ? 'teamInfoRot' : 'teamInfoBlau'); }
$('#t').onchange = teamInfo;
$('#bzureg').onclick = () => loginAnsicht('reg');
$('#bzulogin').onclick = () => loginAnsicht('login');
$('#breg').onclick = () => los(async () => {
  fehlt(['#rn', '#rp', '#c'], 'E_REGLEER');
  if ($('#rp').value !== $('#rp2').value) { $('#rp2').focus(); throw new Error('E_PWGLEICH'); }
  const n = $('#rn').value.trim(), pw = $('#rp').value;
  const rj = await api({aktion: 'reg', name: n, hash: await sha(n.toLowerCase() + ':' + pw),
    team: $('#t').value, code: $('#c').value.trim()});
  $('#n').value = n; $('#p').value = pw;
  await anmelden();
  ['#rn', '#rp', '#rp2', '#c'].forEach(x => { $(x).value = ''; });
  SPIELWAHL = true;   // nach dem Schließen des Wiederherstellungscodes folgt die Auswahl der Spielzugehörigkeit
  codeZeigen(t('rcT'), t('rcTextNeu'), rj.code);
}, '#rfehler');
function wackeln(b) { b = b || $('#bw'); b.classList.remove('wack'); void b.offsetWidth; b.classList.add('wack'); }
let DC_AN = false, DW_BUSY = false;   // DC_AN: Doppel-Chance für den nächsten Wurf aktiviert; DW_BUSY: Wurf bzw. Auswahl läuft gerade
$('#dtog').onclick = () => los(async () => {
  if (S.eventVorbei) { wackeln($('#dtog')); throw new Error('E_EVENTENDE'); }
  if (nochNicht()) { wackeln($('#dtog')); throw new Error('E_EVENTNOCH'); }
  if (!(S.doppel > 0)) { wackeln($('#dtog')); throw new Error('E_NODOPPEL'); }
  DC_AN = !DC_AN; $('#dtog').classList.toggle('an', DC_AN);
  if (DC_AN) $('#log').textContent = t('dcAn');
}, '#log');
function miniWuerfel(w) {   // kleiner 3D-Würfel wie der Hauptwürfel (gleiche Flächen), rollt kurz aus und bleibt mit Augenzahl w oben liegen
  const wu = el('span', '', 'mwurf'), wr = el('span', '', 'mwrap'), cu = el('span', '', 'mcube');
  cu.innerHTML = [1, 2, 3, 4, 5, 6].map(n => '<div class="fl fl' + n + '">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => '<i' + (PIPS[n].includes(k) ? ' class="on"' : '') + '></i>').join('') + '</div>').join('');
  cu.querySelector('.fl' + w).classList.add('win');
  const o = ORI[w], z = WUERFEL_OBEN ? Math.floor(Math.random() * 360) : 90 * Math.floor(Math.random() * 4);
  const lage = e => WUERFEL_OBEN ? 'rotateY(' + (z + e[2]) + 'deg) rotateX(' + (o[0] + 90 + e[0]) + 'deg) rotateY(' + (o[1] + e[1]) + 'deg)' : 'rotateZ(' + (z + e[2]) + 'deg) rotateX(' + (o[0] + e[0]) + 'deg) rotateY(' + (o[1] + e[1]) + 'deg)';
  cu.style.transform = lage([720, 540, 360]);
  wr.append(cu); wu.append(wr);
  requestAnimationFrame(() => requestAnimationFrame(() => { cu.style.transition = 'transform .8s cubic-bezier(.2,.8,.3,1)'; cu.style.transform = lage([0, 0, 0]); }));
  return wu;
}
function doppelWahl(dw) {   // Auswahl liegt direkt auf dem Würfelbutton (die beiden Würfel ersetzen ihn kurz); liefert den Index des gewählten Würfels
  return new Promise(ok => {
    const alt = $('#dwov'); if (alt) { removeEventListener('resize', alt._platz); alt.remove(); }
    const o = el('div', '', 'dwpop'), row = el('div', '', 'dwrow');
    o.id = 'dwov'; o.setAttribute('role', 'group'); o.setAttribute('aria-label', t('dcWahl'));
    const platz = () => {   // mittig auf Würfelbutton und Beschriftung "Würfeln" (beides wird überdeckt), am Rand des Fensters gehalten
      const rb = $('#bw').getBoundingClientRect(), rl = $('#blabel').getBoundingClientRect();
      if (!rb.width) return;   // Spielbrett gerade nicht sichtbar
      const pad = 10, L = Math.min(rb.left, rl.left), T = Math.min(rb.top, rl.top), R = Math.max(rb.right, rl.right), B = Math.max(rb.bottom, rl.bottom);
      o.style.minWidth = (R - L + 2 * pad) + 'px'; o.style.minHeight = (B - T + 2 * pad) + 'px';
      const w = o.offsetWidth, h = o.offsetHeight;
      o.style.left = Math.max(8, Math.min(innerWidth - w - 8, (L + R) / 2 - w / 2)) + 'px';
      o.style.top = Math.max(8, Math.min(innerHeight - h - 8, (T + B) / 2 - h / 2)) + 'px';
      o.style.transformOrigin = (rb.left + rb.width / 2 - parseFloat(o.style.left)) + 'px ' + (rb.top + rb.height / 2 - parseFloat(o.style.top)) + 'px';   // Einblenden wächst aus der Mitte des Hauptwürfels
    };
    o._platz = platz;
    dw.forEach((w, i) => {
      let p = S.pos + w; if (p >= 100) p = 1;
      const ty = typ[p] || '', b = el('button', '', 'dwb'); b.type = 'button'; b.setAttribute('aria-label', String(w));
      b.innerHTML = '<span class="dwz ' + ty + '"><b>' + marke(p, ty) + '</b>' + p + '</span>';
      b.prepend(miniWuerfel(w));
      b.onclick = () => { removeEventListener('resize', platz); o.classList.add('zu'); setTimeout(() => o.remove(), 200); ok(i); };   // schrumpft in den Hauptwürfel zurück
      row.append(b);
    });
    o.append(el('p', t('dcWahl'), 'dwt'), row);
    o.classList.toggle('hide', TAB !== 'spiel');
    document.body.append(o); platz(); addEventListener('resize', platz);
  });
}
async function doppelAbschluss(dw, gezeigt) {   // Wahl senden; der Hauptwürfel übernimmt die gewählte Zahl sofort (parallel zur Serveranfrage); bei Netzfehler die Auswahl erneut anbieten. gezeigt = Zahl, die der Hauptwürfel gerade zeigt
  for (;;) {
    const k = await doppelWahl(dw);
    const anim = dw[k] !== gezeigt ? (async () => { rolleStart(); await rolleStopp(dw[k], true); await sleep(T_AUSLAUF + T_WURF_NACH); })() : Promise.resolve();
    gezeigt = dw[k];
    try { const j = await api({aktion: 'doppelwahl', name: S.name, token: S.token, wahl: k}); await anim; return j; }
    catch (e) { await anim; if (!istNetz(e)) throw e; $('#log').textContent = t('E_NET'); }
  }
}
function zugFertig(j) {   // nach dem Ziehen: Stand übernehmen, Belohnungen und Meldungen zeigen
  S = j.spieler; R = j.rang; zeige();
  const tx = j.ev.txt;   // Zusatzfelder: dieselbe große Belohnungsanzeige wie nach Quiz und Minispiel
  const rd = tx.find(c => c.startsWith('RAD:'));   // Glücksradfeld: Freidrehs
  belohnung(tx.includes('ZP') ? 25 : 0, tx.includes('ZW') ? 2 : 0, tx.includes('CARD') ? 1 : 0, rd ? +rd.split(':')[1] : 0, tx.includes('DCARD') ? 1 : 0);
  LOG = tx.slice();
  showLog();
}
function doppelResume() {   // offene Doppel-Chance-Auswahl (z. B. nach Neuladen) abschließen und ziehen
  if (DW_BUSY || !S || !S.doppelwahl || S.eventVorbei) return;
  DW_BUSY = true;
  return los(async () => {
    const von = S.pos, j = await doppelAbschluss(S.doppelwahl, 0);
    await ziehe(von, j.ev.w, j.ev.land, j.spieler.pos, j.ev.txt);
    zugFertig(j);
  }, '#log').finally(() => { DW_BUSY = false; });
}
$('#bw').onclick = () => los(async () => {
  if (S.eventVorbei) { wackeln(); throw new Error('E_EVENTENDE'); }
  if (nochNicht()) { wackeln(); throw new Error('E_EVENTNOCH'); }
  if (S.doppelwahl) { doppelResume(); return; }
  if (S.aufgabe) { wackeln(); throw new Error('E_AUFGABE'); }
  if (S.wuerfel < 1) { wackeln(); throw new Error('E_NODICE'); }  // ohne Würfel: sofort Hinweis, keine Animation, kein Request
  const dop = DC_AN && S.doppel > 0;
  DW_BUSY = true; $('#bw').disabled = true;
  rolleStart();
  try {
    const von = S.pos;
    let j = await api({aktion: 'wuerfeln', name: S.name, token: S.token, doppel: dop ? 1 : 0});
    if (j.ev.doppel) {   // Doppel-Chance: erst wählen, dann ziehen
      await rolleStopp(j.ev.doppel[0]);
      S = j.spieler; R = j.rang; DC_AN = false; zeige();
      j = await doppelAbschluss(j.ev.doppel, j.ev.doppel[0]);
    } else await rolleStopp(j.ev.w);
    await ziehe(von, j.ev.w, j.ev.land, j.spieler.pos, j.ev.txt);
    zugFertig(j);
  } catch (e) {
    if (e.message === 'E_AUFGABE' || e.message === 'E_DOPPELWAHL') await sync();  // Anzeige war veraltet, z. B. zweites Gerät
    throw e;
  } finally { rolleAus(); $('#bw').disabled = false; DW_BUSY = false; if (S && S.doppelwahl) setTimeout(doppelResume, 0); }
}, '#log');

$('#nav').onclick = e => {
  const b = e.target.closest('button');
  if (!b) return;
  tab(b.dataset.tab);
  if (b.dataset.tab === 'admin' && APW) los(() => adminCall({}), '#afehler');   // beim Öffnen des Admin-Bereichs automatisch aktualisieren
  if (b.dataset.tab === 'rangseite' && S)  // Rangliste beim Öffnen frisch laden
    api({aktion: 'me', name: S.name, token: S.token}).then(j => { R = j.rang; rangZeige(); }).catch(() => {});
};
$('#aok').onclick = () => los(async () => {
  APW = $('#apw').value;
  try { await adminCall({}); } catch (e) { APW = ''; throw e; }
  $('#alock').classList.add('hide'); $('#apanel').classList.remove('hide');
}, '#afehler');
let AART = 'w';
$('#aart').onclick = e => { const b = e.target.closest('button'); if (!b) return; AART = b.dataset.v; document.querySelectorAll('#aart button').forEach(x => x.classList.toggle('an', x === b)); };
$('#ag').onclick = async () => {   // Buchung für den einen oder alle ausgewählten Spieler (bei mehreren mit Rückfrage)
  const z = [...ASELS], art = {w: 'aKartW', s: 'aKartS', x: 'aKartX', d: 'aKartD'}[AART];
  if (!z.length) return;
  if (z.length > 1 && !(await bestaetigen(t('aMultiFrage', z.length, $('#an').value, t(art)), t('aGib')))) return;
  return afmZeigen(los(async () => {
    const j = await adminCall(z.length > 1 ? {aktion: 'schenken', ziele: z, anzahl: $('#an').value, art: AART} : {aktion: 'schenken', ziel: z[0], anzahl: $('#an').value, art: AART});
    if (j.ev && j.ev.gebucht) $('#afm').textContent = t('aGebucht', j.ev.gebucht);
  }, '#afm'));
};
$('#aselbar').onclick = e => {   // Schnellauswahl: Team Rot, Team Blau, Alle schalten additiv ein bzw. aus (erneutes Drücken nimmt die Gruppe wieder heraus), Keine leert alles
  const b = e.target.closest('button'); if (!b) return;
  const w = b.dataset.sel; $('#afm').textContent = '';
  if (w === 'keine') ASELS = new Set();
  else {
    const g = selGruppe(w), an = g.length > 0 && g.every(x => ASELS.has(x.name));
    if (an) { if (w === 'alle') ASELS = new Set(); else AL.filter(x => x.team === w).forEach(x => ASELS.delete(x.name)); }
    else g.forEach(x => ASELS.add(x.name));
  }
  adminZeige();
};
$('#atabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.id === 'aref') los(() => adminCall({}), '#afehler'); else adminTab(b.dataset.at); };   // ⟳ lädt Spielerliste, Tageswertung und Einladungscode neu
$('#aecs').onclick = () => los(async () => { await adminCall({aktion: 'codeset', ecode: $('#aecode').value}); $('#aecm').textContent = t('aeGespeichert'); }, '#aecm');
const twAktion = (extra, ok) => los(async () => { await adminCall(extra); $('#twm').textContent = t(ok); }, '#twm');
$('#twsave').onclick = () => twAktion({aktion: 'twconf', conf: {aktiv: $('#twakt').checked, ende: $('#twende').value, plaetze: $('#twpl').value, punkte: $('#twpu').value, wuerfel: $('#twwu').value, minPunkte: $('#twmp').value, trigger: $('#twtr').value}}, 'twGespeichert');
$('#twtrig').onclick = () => twAktion({aktion: 'twtrigger'}, 'twTrigOk');
$('#twrun').onclick = () => twAktion({aktion: 'twlauf'}, 'twLaufOk');
$('#as').onclick = () => {
  const nm = ASELS.size === 1 ? [...ASELS][0] : '', x = AL.find(y => y.name === nm);
  if (!nm) return;
  return afmZeigen(los(() => adminCall({aktion: 'sperre', ziel: nm, wert: x && x.gesperrt ? 'nein' : 'ja'}), '#afm'));
};
$('#tzu').onclick = () => { const b = $('#tbox'); if (b._stop) b._stop(); $('#train').classList.add('hide'); document.body.classList.remove('ovl'); };
$('#rwahl').onclick = rovAuf; $('#rzu').onclick = rovZu; $('#rov').onclick = e => { if (e.target === $('#rov')) rovZu(); };
$('#rzseg').onclick = e => { const b = e.target.closest('button'); if (b) { Z = b.dataset.z; if (R) rangZeige(); } };
$('#rtabs').onclick = e => { const b = e.target.closest('button'); if (b) { F = b.dataset.f; if (R) rangZeige(); } };
// ---- Konto: Anzeigename, Passwort, Wiederherstellungscode ----
let RC = '';
function codeZeigen(titel, text, code) {   // Code im Klartext anzeigen (nur jetzt), zum Kopieren
  RC = code; $('#rctitel').textContent = titel; $('#rctext').textContent = text; $('#rccode').textContent = code;
  $('#rckop').textContent = t('kopieren'); $('#rcov').classList.remove('hide');
}
$('#rczu').onclick = () => { $('#rcov').classList.add('hide'); RC = ''; $('#rccode').textContent = ''; if (SPIELWAHL) { SPIELWAHL = false; spielwahlZeigen(); } };
$('#rckop').onclick = async () => {
  try { await navigator.clipboard.writeText(RC); $('#rckop').textContent = t('kopiert'); }
  catch (e) { const r = document.createRange(); r.selectNodeContents($('#rccode')); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
};
$('#kto').onclick = () => tab('einst');
$('#bvergessen').onclick = () => { const r = $('#reset'); r.classList.toggle('hide'); if (!r.classList.contains('hide') && !$('#xn').value) $('#xn').value = $('#n').value; };
$('#bxok').onclick = () => los(async () => {
  fehlt(['#xn', '#xc', '#xp'], 'E_RESETLEER');
  const n = $('#xn').value.trim(), p1 = $('#xp').value;
  if (!p1) throw new Error('E_PWLEER');
  if (p1 !== $('#xp2').value) throw new Error('E_PWGLEICH');
  const j = await api({aktion: 'reset', name: n, code: $('#xc').value.trim(), neu: await sha(n.toLowerCase() + ':' + p1)});
  $('#n').value = n; $('#p').value = p1;
  await anmelden();
  document.querySelectorAll('#reset input').forEach(e => e.value = ''); $('#reset').classList.add('hide');
  codeZeigen(t('rcT'), t('rcTextReset'), j.code);
}, '#xfehler');
// Anmelden, Registrieren, Passwort zurücksetzen: während der Anfrage sind alle drei Knöpfe gesperrt, der gedrückte zeigt einen Ladekreisel und pulsiert (Klasse laden in style.css)
{ const ids = ['#bin', '#breg', '#bxok'];
  ids.forEach(id => { const h = $(id).onclick; $(id).onclick = () => {
    const b = $(id); if (b.disabled) return;
    const alle = ids.map(x => $(x)); alle.forEach(x => x.disabled = true); b.classList.add('laden');
    return Promise.resolve(h()).finally(() => { alle.forEach(x => x.disabled = false); b.classList.remove('laden'); });
  }; }); }
$('#eanb').onclick = () => los(async () => {
  const j = await api({aktion: 'anzeige', name: S.name, token: S.token, anzeige: $('#ean').value});
  S = j.spieler; R = j.rang; zeige(); $('#eanm').textContent = t('anGespeichert');
}, '#eanm');
$('#epb').onclick = () => los(async () => {
  const n1 = $('#epn').value, ln = S.name.toLowerCase();
  if (!n1) throw new Error('E_PWLEER');
  if (n1 !== $('#epn2').value) throw new Error('E_PWGLEICH');
  const j = await api({aktion: 'pwaendern', name: S.name, token: S.token, hash: await sha(ln + ':' + $('#epa').value), neu: await sha(ln + ':' + n1)});
  S = j.spieler; R = j.rang; zeige();
  ['#epa', '#epn', '#epn2'].forEach(x => $(x).value = ''); $('#epm').textContent = t('pwGeaendert');
}, '#epm');
$('#erb').onclick = () => los(async () => {
  const j = await api({aktion: 'rcneu', name: S.name, token: S.token, hash: await sha(S.name.toLowerCase() + ':' + $('#erp').value)});
  S = j.spieler; R = j.rang; zeige(); $('#erp').value = '';
  codeZeigen(t('rcT'), t('rcTextErsatz'), j.ev.rc);
}, '#erm');
$('#arc').onclick = async () => {
  const nm = ASELS.size === 1 ? [...ASELS][0] : '';
  if (!nm || !(await bestaetigen(t('aRcFrage', nm), t('aRc')))) return;
  afmZeigen(los(async () => { const j = await adminCall({aktion: 'rcadmin', ziel: nm}); if (j.rc) codeZeigen(t('rcTAdmin', j.rc.fuer), t('rcTextAdmin'), j.rc.code); }, '#afm'));
};
// Tab / Umschalt+Tab im Anmeldebereich selbst steuern: Name, Passwort, Anmelden, Passwort vergessen, (Reset-Felder), Einladungscode, Team, Registrieren
const loginFokus = () => $('#login').classList.contains('hide') ? [] : [...$('#login').querySelectorAll('input,select,button')].filter(x => x.offsetParent !== null && !x.disabled);
let LOGIN_LETZTES = null;
const istTab = e => e.key === 'Tab' || e.code === 'Tab' || e.keyCode === 9;
$('#login').addEventListener('focusin', e => { LOGIN_LETZTES = e.target; });
$('#login').addEventListener('focusout', e => { if (e.relatedTarget && !$('#login').contains(e.relatedTarget)) LOGIN_LETZTES = null; });
document.addEventListener('pointerdown', e => { if (!$('#login').contains(e.target)) LOGIN_LETZTES = null; });
document.addEventListener('keydown', e => {
  if (!istTab(e)) return;
  const f = loginFokus(), i = f.indexOf(document.activeElement), k = i + (e.shiftKey ? -1 : 1);
  if (i < 0 || k < 0 || k >= f.length) return;   // am Anfang/Ende des Bereichs und außerhalb: normales Verhalten des Browsers
  e.preventDefault(); e.stopPropagation(); f[k].focus();
}, true);
document.addEventListener('keyup', e => {   // Auffangnetz für Bluetooth-Tastaturen (iPad): geht der Fokus beim Tab verloren, wird er hier zum nächsten bzw. vorigen Feld gesetzt
  if (!istTab(e) || !LOGIN_LETZTES) return;
  const f = loginFokus();
  if (!f.length || f.includes(document.activeElement)) return;
  const i = f.indexOf(LOGIN_LETZTES), k = i + (e.shiftKey ? -1 : 1);
  if (i >= 0 && k >= 0 && k < f.length) f[k].focus();
});
[['#n,#p', '#bin'], ['#rn,#rp,#rp2,#c,#t', '#breg'], ['#xn,#xc,#xp,#xp2', '#bxok'], ['#apw', '#aok']].forEach(([ids, btn]) => document.querySelectorAll(ids).forEach(e => e.addEventListener('keydown', ev => {   // Eingabetaste löst je nach Formular Anmelden, Registrieren, Zurücksetzen oder Freischalten aus
  if (ev.key === 'Enter' && !ev.isComposing) { ev.preventDefault(); const nx = ev.target.id === 'n' ? ['#n', '#p'] : ev.target.id === 'rn' ? ['#rn', '#rp'] : null; if (nx && $(nx[0]).value.trim() && !$(nx[1]).value) $(nx[1]).focus(); else $(btn).click(); }   // im Namensfeld: erst zum Passwort, wenn es noch leer ist
})));
$('#n').focus();   // Startfokus: Spielername
document.addEventListener('gesturestart', e => e.preventDefault());   // iOS: Pinch-Zoom auf der ganzen Seite sperren
document.addEventListener('dblclick', e => e.preventDefault());       // kein Doppelklick-/Doppeltipp-Zoom
{ const st = document.documentElement.style; st.setProperty('--znms', ZAHL_MS + 'ms'); st.setProperty('--schnee-tiefe', SCHNEE_TIEFE); st.setProperty('--schnee-alpha', SCHNEE_DECKUNG); st.setProperty('--schnee-z', SCHNEE_VORN ? 1 : -1); st.setProperty('--dk-alpha', DEKO_ALPHA); st.setProperty('--dk-sat', DEKO_SAET); st.setProperty('--mraus', MARKER_ABSTAND + 'px'); st.setProperty('--tfs', TOAST_GROESSE + 'rem'); st.setProperty('--flug', FX_FLUG + 'px'); st.setProperty('--fxfs', FX_GROESSE + 'rem'); st.setProperty('--fxms', FX_MS + 'ms'); st.setProperty('--belfs', BEL_GROESSE + 'rem'); st.setProperty('--belms', BEL_MS + 'ms'); }
let TOAST_T = 0, STILL = false;
const aufgabeOffen = () => !$('#quiz').classList.contains('hide');
function logPos() {   // Meldung direkt unter der Statuszeile (bzw. unter der Kopfzeile, wenn diese nicht sichtbar ist)
  const s = $('#stat'), r = s.getBoundingClientRect(), h = document.querySelector('header').getBoundingClientRect();
  const y = TAB === 'spiel' && S && r.height ? r.bottom : h.bottom;
  $('#log').style.top = aufgabeOffen() ? '6px' : Math.round(Math.max(0, y) + 8) + 'px';   // bei offener Aufgabe ganz nach oben, darf die Spielerinfo überdecken
}
const HIST = [];   // Meldungen dieser Sitzung, neueste zuerst (nicht gespeichert)
{ const l = $('#log'); new MutationObserver(() => {   // Meldungen erscheinen kurz als Einblendung und verschwinden wieder
    if (STILL) return;
    if (!l.textContent) { l.classList.remove('zeigen'); return; }
    HIST.unshift({t: new Date(), txt: l.textContent, err: l.classList.contains('err')}); if (HIST.length > HIST_MAX) HIST.pop();
    if (!$('#hpanel').classList.contains('hide')) histZeichnen();
    logPos(); l.classList.add('zeigen'); clearTimeout(TOAST_T); TOAST_T = setTimeout(() => l.classList.remove('zeigen'), aufgabeOffen() ? TOAST_QUIZ_MS : TOAST_MS);
  }).observe(l, {childList: true, characterData: true, subtree: true}); }
document.querySelectorAll('[data-sym]').forEach(e => e.innerHTML = SYM[e.dataset.sym]);   // SVG-Symbole statt Unicode (Admin-Tabelle und Buchungsart)
wuerfelBauen();
$('#bw').classList.toggle('oben', WUERFEL_OBEN);
$('#cube').classList.add('sofort'); face(1); void $('#cube').offsetWidth; $('#cube').classList.remove('sofort');
brett();
radZeichnen();
leisteSeite();
$('#dsym').innerHTML = SYM.D;
ansichtSetzen();
sprache();
statusLaden();   // Anmeldeseite: ist das Event beendet?
$('#evfinale').onclick = finaleZeigen;
$('#ansicht').onclick = () => { ANS = ANS === '3d' ? '2d' : '3d'; try { localStorage.setItem('av', ANS); } catch (e) {} apSpeichern(); ansichtSetzen(); eiMelden('ent_ansicht'); };
$('#kueb').onclick = () => { CAM.ueb = !CAM.ueb; CAM.px = CAM.py = 0; CAM.ox = null; $('#kueb').classList.toggle('an', CAM.ueb); kamera(CAM.n, 450); };
$('#kfokus').onclick = () => { CAM.ueb = false; CAM.px = CAM.py = 0; CAM.ox = null; $('#kueb').classList.remove('an'); kamera(S ? S.pos : CAM.n, 450); };
{
  let drag = null; const k = $('#kamera');
  k.addEventListener('pointerdown', e => {
    if (e.target.closest('#kbtn') || CAM.ueb) return;
    drag = {x: e.clientX, y: e.clientY, px: CAM.px, py: CAM.py}; k.classList.add('drag');
    try { k.setPointerCapture(e.pointerId); } catch (x) {}
  });
  k.addEventListener('pointermove', e => { if (drag) { CAM.px = drag.px + e.clientX - drag.x; CAM.py = drag.py + e.clientY - drag.y; kamera(CAM.n, 0, true); } });
  ['pointerup', 'pointercancel'].forEach(n => k.addEventListener(n, () => { drag = null; k.classList.remove('drag'); }));
  window.addEventListener('resize', () => { CAM.ox = null; layoutSpiel(); });
  if (window.ResizeObserver) { let raf = 0; new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { CAM.ox = null; layoutSpiel(); }); }).observe(k); }   // das Brettfenster füllt den freien Platz: Größe ändert sich z. B. durch Hinweisbanner oder Tastatur
}
function panelAuf(id) {   // ein Fensterchen am Brett zur Zeit: Einstellungen, Meldungsverlauf, Legende
  const an = $('#' + id).classList.contains('hide');
  ['kpanel', 'hpanel', 'tpanel'].forEach(p => $('#' + p).classList.add('hide')); legendeAus();
  if (an) { $('#' + id).classList.remove('hide'); if (id === 'hpanel') histZeichnen(); if (id === 'tpanel') tpanelZeichnen(); }
}
let LEG_T = 0;
function legendeAus() { clearTimeout(LEG_T); $('#legende').classList.remove('zeigen'); }
function legendeAn() { legende(); $('#legende').classList.add('zeigen'); clearTimeout(LEG_T); LEG_T = setTimeout(legendeAus, LEGENDE_MS); }
function histZeichnen() {
  const f = HIST.map(m => { const d = el('div', '', 'hz' + (m.err ? ' err' : '')); d.append(el('time', m.t.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'})), el('span', m.txt)); return d; });
  $('#hliste').replaceChildren(...(f.length ? f : [el('div', t('hLeer'), 'hz')]));
}
$('#kset').onclick = () => { panelAuf('kpanel'); if (!$('#kpanel').classList.contains('hide')) eiMelden('ent_einst'); };
$('#ktask').onclick = () => panelAuf('tpanel');
$('#khist').onclick = () => panelAuf('hpanel');
$('#klegende').onclick = () => { if ($('#legende').classList.contains('zeigen')) legendeAus(); else { ['kpanel', 'hpanel', 'tpanel'].forEach(p => $('#' + p).classList.add('hide')); legendeAn(); } };
$('#legende').onclick = legendeAus;
[['Tilt', 'tilt'], ['Persp', 'persp'], ['Zoom', 'zoom'], ['Wgr', 'wgr']].forEach(([n, k]) => { $('#s' + n).oninput = e => { AP[k] = +e.target.value; apSetzen(); }; });
$('#aSeite').onclick = () => { AP.seite = AP.seite === 'l' ? 'r' : 'l'; apSetzen(); };
$('#aSaison').onclick = () => { AP.saison = !AP.saison; apSetzen(); };
$('#aReset').onclick = () => { AP.tilt = TILT; AP.persp = PERSP; AP.zoom = ZOOM; AP.wgr = 100; AP.saison = true; apSetzen(); };
panelSync();
try {
  const g = JSON.parse(localStorage.getItem('sw'));
  if (g) api({aktion: 'me', name: g.n, token: g.t}).then(j => { S = j.spieler; R = j.rang; zeige(); }).catch(() => {});
} catch (e) {}
$('#cabbr').onclick = () => chatEditEnde(!CH.edit);

// ---- Anmeldeseite: Hinweis zu Passwörtern ----
const pwovZu = () => { $('#pwov').classList.add('hide'); document.body.classList.remove('ovl'); };
const pwovAuf = () => { $('#pwov').classList.remove('hide'); document.body.classList.add('ovl'); };
$('#bpwinfo').onclick = pwovAuf; $('#bpwinfo2').onclick = pwovAuf;   // Registrierung und Konto (Passwort ändern)
$('#pwzu').onclick = pwovZu; $('#pwov').onclick = e => { if (e.target === $('#pwov')) pwovZu(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#pwov').classList.contains('hide')) pwovZu(); });
// ---- Feedback: Rückmeldung an die Admins (Blatt "Feedback"), erreichbar in der Hilfe ----
const FB_MAX = 2000;   // Zeichen je Rückmeldung (wie FEEDBACK.maxZeichen in Code.gs)
let FB_STERN = 0;
function fbSterneZeichnen() {   // Sterne für die Kategorie Bewertung (nochmal auf denselben Stern tippen = zurücknehmen)
  $('#fbstern').replaceChildren(...[1, 2, 3, 4, 5].map(n => {
    const b = el('button', ''); b.type = 'button'; b.innerHTML = SYM.ZP; b.setAttribute('aria-label', n + ' / 5'); b.className = n <= FB_STERN ? 'an' : '';
    b.onclick = () => { FB_STERN = FB_STERN === n ? 0 : n; fbSterneZeichnen(); };
    return b;
  }));
}
function fbZaehler() { const n = Array.from($('#fbtext').value).length, z = $('#fbzaehl'); z.textContent = n + ' / ' + FB_MAX; z.classList.toggle('err', n > FB_MAX); }
$('#fbkat').onchange = () => $('#fbstern').classList.toggle('hide', $('#fbkat').value !== 'bewertung');
$('#fbtext').oninput = fbZaehler;
$('#fbsend').onclick = () => los(async () => {
  const kat = $('#fbkat').value, x = $('#fbtext').value.trim();
  if (kat === 'bewertung' && !FB_STERN) throw new Error('E_FBSTERN');
  if (kat !== 'bewertung' && !x) { $('#fbtext').focus(); throw new Error('E_FBLEER'); }
  if (Array.from(x).length > FB_MAX) throw new Error('E_FBLANG');
  const j = await api({aktion: 'feedback', name: S.name, token: S.token, kat: kat, stern: kat === 'bewertung' ? FB_STERN : 0, betreff: $('#fbbetreff').value.trim(), text: x, sprache: L});
  S = j.spieler; R = j.rang; zeige();
  $('#fbtext').value = ''; $('#fbbetreff').value = ''; FB_STERN = 0; fbSterneZeichnen(); fbZaehler();
  $('#fbm').textContent = t('fbDanke');
}, '#fbm');
fbSterneZeichnen(); fbZaehler();
// ---- Spielzugehörigkeit: Athletics Mania (1), Summer Sports Mania (2), beides (3); 0 = nicht festgelegt. Steuert, welche Quizfragen mit Spielzuordnung ein Spieler bekommt ----
let SPIELWAHL = false;   // true: direkt nach der Registrierung, löst nach dem Wiederherstellungscode das Auswahl-Popup aus
function spielwahlZeigen() {
  if (!S) return;
  const alt = $('#swov'); if (alt) alt.remove();
  const o = el('div', '', 'overlay'), k = el('div', '', 'karte'), sel = el('select'), z = el('div', '', 'bzeile'), ok = el('button', t('speichern')), sp = el('button', t('spaeter'), 'zweit'), m = el('p', '', 'meld');
  o.id = 'swov'; m.id = 'swm'; [ok, sp].forEach(x => { x.type = 'button'; });
  [['0', 'spNix'], ['1', 'spA'], ['2', 'spS'], ['3', 'spAS']].forEach(([v, key]) => { const op = el('option', t(key)); op.value = v; sel.append(op); });
  sel.value = String(S.spiele || 0);
  ok.onclick = () => { ok.disabled = true; ok.classList.add('laden'); los(async () => {
    const j = await api({aktion: 'spiel', name: S.name, token: S.token, wert: +sel.value});
    S = j.spieler; R = j.rang; o.remove(); zeige();
  }, '#swm').finally(() => { if (ok.isConnected) { ok.disabled = false; ok.classList.remove('laden'); } }); };
  sp.onclick = () => o.remove();
  z.append(sp, ok);
  k.append(el('h3', t('swT')), el('p', t('swText')), sel, z, m); o.append(k); document.body.append(o);
}
$('#espb').onclick = () => los(async () => {
  const j = await api({aktion: 'spiel', name: S.name, token: S.token, wert: +$('#espiele').value});
  S = j.spieler; R = j.rang; zeige(); $('#espm').textContent = t('spGespeichert');
}, '#espm');
// ---- Admin: Benachrichtigungen (E-Mail und Discord getrennt, je Kategorie bzw. Ereignis) ----
function bnAdminZeige() {
  if (!BNA) return;
  if (!$('#bnform').contains(document.activeElement)) document.querySelectorAll('#bnform [data-bn]').forEach(c => { const [k, a] = c.dataset.bn.split('.'); c.checked = !!(BNA.conf[k] && BNA.conf[k][a]); });
  $('#bnst').textContent = t('bnSt', BNA.mail || '-', t(BNA.webhook ? 'bnJa' : 'bnNein'));
}
$('#bnsave').onclick = () => los(async () => {
  const conf = {mail: {}, discord: {}};
  document.querySelectorAll('#bnform [data-bn]').forEach(c => { const [k, a] = c.dataset.bn.split('.'); conf[k][a] = c.checked; });
  await adminCall({aktion: 'bnconf', conf: conf}); $('#bnm').textContent = t('twGespeichert');
}, '#bnm');
$('#bntest').onclick = () => los(async () => { await adminCall({aktion: 'bntest'}); $('#bnm').textContent = t('bnTestOk'); }, '#bnm');
// ---- Admin: Spieler auf Null zurücksetzen, Ergebnis der letzten Tageswertung löschen (Buttons werden hier angelegt) ----
{ const b = el('button', t('aSpReset'), 'gefahr'); b.id = 'arst'; b.type = 'button'; b.dataset.i = 'aSpReset'; $('#arc').after(b);
  const c = el('button', t('twErgBtn'), 'zweit'); c.id = 'twerg'; c.type = 'button'; c.dataset.i = 'twErgBtn'; $('#twrun').after(c); }
$('#arst').onclick = async () => {
  const z = [...ASELS];
  if (!z.length || !(await bestaetigen(t('aSpResetFrage', z.length), t('aSpReset'), true))) return;
  return afmZeigen(los(async () => {
    const j = await adminCall({aktion: 'spielerreset', ziele: z});
    if (j.ev && j.ev.zurueck !== undefined) $('#afm').textContent = t('aSpResetOk', j.ev.zurueck);
  }, '#afm'));
};
{ const d = el('div'), b = el('button', t('aChatReset'), 'zweit'), m = el('p', '', 'meld'); d.id = 'achat'; d.style.marginTop = '16px'; b.id = 'achatb'; b.type = 'button'; b.dataset.i = 'aChatReset'; m.id = 'acm'; m.setAttribute('role', 'alert'); d.append(b, m); $('#aecform').after(d); }
$('#achatb').onclick = async () => { if (await bestaetigen(t('aChatFrage'), t('aChatReset'), true)) return los(async () => { await adminCall({aktion: 'chatreset'}); $('#acm').textContent = t('aChatOk'); }, '#acm'); };
$('#twerg').onclick = async () => { if (await bestaetigen(t('twErgFrage'), t('twErgBtn'), true)) return twAktion({aktion: 'twerg'}, 'twErgOk'); };
// ---- Admin: Ladezustand der Buttons (wie bei Anmelden): gesperrt, Kreisel, pulsierend, bis die Anfrage fertig ist ----
['#aok', '#ag', '#as', '#arst', '#twerg', '#achatb', '#aecs', '#twsave', '#twtrig', '#twrun', '#fbsend', '#espb', '#bnsave', '#bntest'].forEach(id => { const h = $(id).onclick; $(id).onclick = () => {
  const b = $(id); if (b.disabled) return;
  b.disabled = true; b.classList.add('laden');
  return Promise.resolve(h()).finally(() => { b.disabled = false; b.classList.remove('laden'); });
}; });

// ---- Seite fest halten: nach dem Schließen der Tastatur (iOS verschiebt dabei die Ansicht) wieder nach oben ----
document.addEventListener('focusout', () => setTimeout(() => window.scrollTo(0, 0), 80));
// ---- Vollbild (wo der Browser es erlaubt, z. B. iPad und Desktop; auf dem iPhone über "Zum Home-Bildschirm" als App starten) ----
{
  const de = document.documentElement, b = $('#vollb'), req = de.requestFullscreen || de.webkitRequestFullscreen, aus = document.exitFullscreen || document.webkitExitFullscreen;
  const an = () => !!(document.fullscreenElement || document.webkitFullscreenElement), app = !!(navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches));
  if (b && req && !app) {
    const sym = () => { b.innerHTML = ic('<path ' + LN + ' d="' + (an() ? 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5' : 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5') + '"/>'); };
    b.classList.remove('hide'); sym();
    b.onclick = () => { try { const p = an() ? aus.call(document) : req.call(de); if (p && p.catch) p.catch(() => {}); } catch (e) {} };
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(n => document.addEventListener(n, () => { sym(); setTimeout(() => { CAM.ox = null; layoutSpiel(); }, 300); }));
  }
}

// ---- Seite exakt an den sichtbaren Bereich binden (iOS verschiebt bei Tastatur, Zoom und Safari-Leisten den sichtbaren Ausschnitt, dann rutschte die Seite unter die Leisten) ----
if (window.visualViewport) {
  const vv = window.visualViewport, st = document.body.style; let raf = 0;
  const pass = () => { raf = 0; st.top = vv.offsetTop + 'px'; st.left = vv.offsetLeft + 'px'; st.right = 'auto'; st.bottom = 'auto'; st.width = vv.width + 'px'; st.height = vv.height + 'px'; };
  const plan = () => { if (!raf) raf = requestAnimationFrame(pass); };
  vv.addEventListener('resize', plan); vv.addEventListener('scroll', plan); window.addEventListener('orientationchange', () => setTimeout(plan, 300)); plan();
}
window.addEventListener('scroll', () => { if (window.scrollX || window.scrollY) window.scrollTo(0, 0); });   // das Dokument selbst bleibt immer oben

// ---- Konto: zwei Reiter (Profil = Anzeigename und Spielzugehörigkeit, Sicherheit = Passwort und Wiederherstellungscode) ----
function einstTab(n) { document.querySelectorAll('#etabs button').forEach(b => b.classList.toggle('an', b.dataset.et === n)); ['profil', 'sicher'].forEach(k => $('#e' + k).classList.toggle('hide', k !== n)); }
$('#etabs').onclick = e => { const b = e.target.closest('button'); if (b) einstTab(b.dataset.et); };
