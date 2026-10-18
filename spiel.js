// Hier die Adresse deiner Apps-Script-Web-App eintragen (endet auf /exec)
const API = 'https://script.google.com/macros/s/AKfycbxHOyVQayOm7fhB0D8CZKpotBCtYR5GgxTP-4zWgEvguFnzQZl3KAgitvK_3gwbuHNz/exec';

const TX = {
  de: {title:'Athletic Maniacs’ Board Games', name:'Spielername', pw:'Passwort', login:'Anmelden',
    neu:'Neu hier? Registriere dich mit dem Einladungscode.', code:'Einladungscode', rot:'Team Rot', blau:'Team Blau',
    reg:'Registrieren', roll:'Würfeln', dice:'Würfel', round:'Runde', pts:'Punkte',
    station:'Hier wartet: {0} (folgt in der nächsten Etappe).',
    LAP:'Runde geschafft: +50 Punkte, +3 Würfel.', LUCK:'Glücksfeld: {0} Felder vor.', BAD:'Pechfeld: {0} Felder zurück.',
    ZW:'Zusatzwürfel-Karte: +2 Würfel.', ZP:'Zusatzpunkte-Karte: +25 Punkte.',
    E_CODE:'Einladungscode falsch', E_NAME:'Dieser Name ist schon vergeben', E_DATA:'Angaben unvollständig',
    E_UNKNOWN:'Spieler unbekannt', E_BLOCKED:'Dein Zugang ist gesperrt', E_PW:'Passwort falsch',
    E_RELOGIN:'Bitte neu anmelden', E_NODICE:'Keine Würfel mehr, morgen gibt es neue', E_NET:'Keine Verbindung zum Spielserver.',
    Q:'Quizstation', L:'100m-Lauf', B:'Bogenschießen', W:'Weitsprung', S:'Schutzkarte'},
  en: {title:'Athletic Maniacs’ Board Games', name:'Player name', pw:'Password', login:'Log in',
    neu:'New here? Register with the invitation code.', code:'Invitation code', rot:'Team Red', blau:'Team Blue',
    reg:'Register', roll:'Roll the dice', dice:'dice', round:'Round', pts:'points',
    station:'Waiting here: {0} (coming in the next stage).',
    LAP:'Lap complete: +50 points, +3 dice.', LUCK:'Lucky field: {0} steps forward.', BAD:'Unlucky field: {0} steps back.',
    ZW:'Bonus dice card: +2 dice.', ZP:'Bonus points card: +25 points.',
    E_CODE:'Wrong invitation code', E_NAME:'This name is already taken', E_DATA:'Incomplete details',
    E_UNKNOWN:'Unknown player', E_BLOCKED:'Your access has been blocked', E_PW:'Wrong password',
    E_RELOGIN:'Please log in again', E_NODICE:'No dice left, new ones arrive tomorrow', E_NET:'No connection to the game server.',
    Q:'Quiz station', L:'100m sprint', B:'Archery', W:'Long jump', S:'Protection card'}
};

// Feldplan: Feldnummern je Feldtyp
const PLAN = {
  Q: [4,17,30,44,56,65,76,82,92,97],
  L: [6,41,69], B: [12,34,61], W: [22,50,80],
  G: [9,27,48,72,90], P: [19,39,58,78,86], S: [37,52,67],
  ZW: [15,46,74,88,95], ZP: [25,63,71,84,99]
};
const SYM = {Q:'?', L:'🏃', B:'🏹', W:'🦘', G:'▲', P:'▼', S:'🛡', ZW:'🎲', ZP:'★'};

const $ = s => document.querySelector(s);
const typ = {};
for (const t in PLAN) PLAN[t].forEach(n => typ[n] = t);
let S = null, LOG = [], L = 'de';
try { L = localStorage.getItem('sl') || (navigator.language.startsWith('de') ? 'de' : 'en'); } catch (e) {}
const t = (k, ...a) => (TX[L][k] || k).replace(/\{(\d)\}/g, (m, i) => a[i]);

function sprache() {
  document.documentElement.lang = L;
  document.title = t('title');
  $('#h1').textContent = t('title');
  $('#lang').value = L;
  document.querySelectorAll('[data-i]').forEach(e => e.textContent = t(e.dataset.i));
  document.querySelectorAll('[data-p]').forEach(e => e.placeholder = t(e.dataset.p));
  if (S) zeige();
  showLog();
}
function showLog() {
  $('#log').textContent = LOG.map(c => {
    const [k, ...a] = c.split(':');
    return k === 'ST' ? t('station', t(a[0])) : t(k, ...a);
  }).join(' ');
}

function brett() {
  let h = '';
  for (let r = 9; r >= 0; r--) {
    const z = [];
    for (let k = 1; k <= 10; k++) z.push(r * 10 + k);
    if (r % 2) z.reverse();
    z.forEach(n => {
      const ty = typ[n] || '';
      h += `<div class="f ${ty}" id="f${n}"><b>${n === 100 ? '🏁' : (SYM[ty] || '')}</b>${n}</div>`;
    });
  }
  $('#brett').innerHTML = h;
}

function zeige() {
  document.body.className = S.team;
  $('#login').classList.add('hide');
  $('#spiel').classList.remove('hide');
  $('#stat').replaceChildren(...[S.name, t(S.team), S.wuerfel + ' ' + t('dice'),
    t('round') + ' ' + (S.runden + 1), S.punkte + ' ' + t('pts')].map(x => {
    const e = document.createElement('span'); e.textContent = x; return e;
  }));
  document.querySelectorAll('.ich').forEach(e => e.classList.remove('ich'));
  $('#f' + S.pos).classList.add('ich');
  try { localStorage.setItem('sw', JSON.stringify({n: S.name, t: S.token})); } catch (e) {}
}

async function api(a) {
  const r = await fetch(API, {method: 'POST', body: JSON.stringify(a)});
  const j = await r.json();
  if (j.fehler) throw new Error(j.fehler);
  return j;
}
async function sha(x) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(x));
  return 'h' + [...new Uint8Array(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}
async function los(f) {
  $('#fehler').textContent = '';
  try { await f(); }
  catch (e) { $('#fehler').textContent = e.message === 'Failed to fetch' ? t('E_NET') : t(e.message); }
}
function rolle(w) {
  return new Promise(ok => {
    let i = 0;
    const iv = setInterval(() => {
      $('#wurf').textContent = 1 + Math.floor(Math.random() * 6);
      if (++i > 7) { clearInterval(iv); $('#wurf').textContent = w; ok(); }
    }, 70);
  });
}
async function anmelden() {
  const n = $('#n').value.trim();
  const j = await api({aktion: 'login', name: n, hash: await sha(n.toLowerCase() + ':' + $('#p').value)});
  S = j.spieler; zeige();
}

$('#lang').onchange = e => { L = e.target.value; try { localStorage.setItem('sl', L); } catch (x) {} sprache(); };
$('#bin').onclick = () => los(anmelden);
$('#breg').onclick = () => los(async () => {
  const n = $('#n').value.trim();
  await api({aktion: 'reg', name: n, hash: await sha(n.toLowerCase() + ':' + $('#p').value),
    team: $('#t').value, code: $('#c').value.trim()});
  await anmelden();
});
$('#bw').onclick = () => los(async () => {
  $('#bw').disabled = true;
  try {
    const j = await api({aktion: 'wuerfeln', name: S.name, token: S.token});
    await rolle(j.ev.w);
    S = j.spieler; zeige();
    LOG = j.ev.txt.slice();
    if (typ[S.pos] && 'QLBWS'.includes(typ[S.pos])) LOG.push('ST:' + typ[S.pos]);
    showLog();
  } finally { $('#bw').disabled = false; }
});

brett();
sprache();
try {
  const g = JSON.parse(localStorage.getItem('sw'));
  if (g) api({aktion: 'me', name: g.n, token: g.t}).then(j => { S = j.spieler; zeige(); }).catch(() => {});
} catch (e) {}
