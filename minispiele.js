// ---- gemeinsame Spielregeln (identisch in minispiele.js und Code.gs, Änderungen immer in beiden Dateien!) ----
function mrng(seed) {
  let a = seed >>> 0;
  return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const BOGEN = {   // Feinabstimmung der Fadenkreuz-Bahn (identisch in minispiele.js und Code.gs, Änderungen immer in beiden Dateien!)
  tempo: 0.92,   // Grundtempo der Bahn (1 = schneller, kleiner = langsamer)
  zielRand: 1.3,   // Bahnweite beim Zielschießen (1 = wie Punkteschießen; größer = die Bahn reicht öfter bis in die Randringe 1 und 2: bei 1,3 etwa 6 % der Zeit, bei 1,4 etwa 9 %, dann verlässt das Fadenkreuz die Scheibe aber auch gelegentlich ganz = 0 Punkte)
  vmax: 3        // Höchstgeschwindigkeit in Scheibenradien pro Sekunde (1 Radius = halbe Scheibenbreite); 0 = keine Begrenzung. Typisch sind etwa 1,3 (Median); ohne Begrenzung gibt es kurze Spitzen bis etwa 15 beim Durchgang durch die Mitte. Kleiner = ruhiger (z. B. 2), größer = lebhafter (z. B. 4)
};
function bogenPfad(seed, v) {   // v = Variante: beim Zielschießen ('ziel') reicht die Bahn weiter nach außen (BOGEN.zielRand)   // Bahn des Fadenkreuzes in Millisekunden, Scheibenradius = 1: Rosenkurve, der Abstand zur Mitte schwingt durch null (regelmäßige Durchgänge durch den 10er-Bereich), zwei Frequenzen, wechselnde Drehrichtung und Zittern machen sie unruhig; Radius unter 1. Die Höchstgeschwindigkeit wird über eine Zeitverzerrung begrenzt (BOGEN.vmax): schnelle Stellen laufen langsamer ab, der Rest bleibt unverändert
  const r = mrng(seed), u = (a, b) => a + r() * (b - a);
  const wr = u(3, 3.9), pr = u(0, 6.28), wr2 = u(3.8, 5.4), pr2 = u(0, 6.28), wt = u(0.45, 0.9), pt = u(0, 6.28), ww = u(0.8, 1.4), pw = u(0, 6.28), ww2 = u(2.4, 3.8), pw2 = u(0, 6.28), wm = u(0.5, 0.9), pm = u(0, 6.28), wa = u(0.35, 0.7), pa = u(0, 6.28);
  const jx = [u(4.5, 7), u(0, 6.28)], jy = [u(5, 7.5), u(0, 6.28)];
  const P = s => {   // Bahn in Bahnzeit s (Sekunden bei Tempo 1)
    const tau = s + 0.25 * Math.sin(wm * s + pm);
    const A = (0.72 + 0.17 * Math.sin(wa * s + pa)) * (v === 'ziel' ? BOGEN.zielRand : 1);
    // Durchgang durch die Mitte weich gerundet (0,04) statt mit unendlich steiler Spitze
    const xx = (0.7 * Math.sin(wr * tau + pr) + 0.3 * Math.sin(wr2 * tau + pr2)), rad = A * Math.sign(xx) * (Math.pow(xx * xx + 0.0016, 0.325) - Math.pow(0.0016, 0.325)), th = pt + wt * tau + 0.6 * Math.sin(ww * s + pw) + 0.65 * Math.sin(ww2 * s + pw2);
    return [rad * Math.cos(th) + 0.06 * Math.sin(jx[0] * s + jx[1]), rad * Math.sin(th) + 0.06 * Math.sin(jy[0] * s + jy[1])];
  };
  const tempo = BOGEN.tempo, vmax = BOGEN.vmax;
  if (!(vmax > 0)) return t => P(t / 1000 * tempo);
  const DT = 5, H = 0.001, tab = [0];   // Tabelle der Bahnzeit je 10 ms, wird bei Bedarf fortgesetzt (immer gleich berechnet, egal in welcher Reihenfolge abgefragt wird)
  const speed = s => { const a = P(s - H), b = P(s + H); return Math.hypot(b[0] - a[0], b[1] - a[1]) / (2 * H); };   // Geschwindigkeit je Bahnzeit
  const sAt = t => {
    const k = Math.min(1.2e6, Math.max(0, t)) / DT;   // nach 20 Minuten bleibt die Bahn stehen (Schutz vor extremen Werten)
    const fk = s => 1 / Math.pow(1 + Math.pow(speed(s) * tempo / vmax, 6), 1 / 6);   // weiche Begrenzung: die Geschwindigkeit bleibt immer unter vmax
    while (tab.length <= k + 1) { const s = tab[tab.length - 1], d = DT / 1000 * tempo; tab.push(s + d * fk(s + 0.5 * d * fk(s))); }   // Mittelpunktverfahren (genauer als ein einfacher Schritt)
    const i = Math.floor(k); return tab[i] + (tab[i + 1] - tab[i]) * (k - i);
  };
  return t => P(sAt(t));
}
function ring(x, y) { const d = Math.sqrt(x * x + y * y); return d >= 1 ? 0 : 10 - Math.floor(d * 10); }
function huhnPlan(seed, sek) {   // Ziele der Zielscheiben-Jagd: wechselnde Abstände, Sichtdauer und Größe, k = 1 ist eine Falle
  const r = mrng(seed + 7), z = []; let t = 800;
  while (t < sek * 1000 - 1200) {
    const k = r() < 0.22 ? 1 : 0, s = Math.round((0.7 + r() * 0.7) * 100) / 100, m = 1 - 0.18 * s;   // Größe 0,7 bis 1,4
    z.push({t: t, x: (r() * 2 - 1) * m, y: (r() * 2 - 1) * m, d: Math.round(600 + r() * 900), k: k, s: s});   // sichtbar 0,6 bis 1,5 s
    t += Math.round(300 + Math.pow(r(), 1.6) * 1500);                                                         // Abstand 0,3 bis 1,8 s, oft kurz
  }
  return z;
}
function skal(roh, P) { const m = P.min || 0; return Math.max(0, Math.min(1, (roh - m) / (P.ref - m))); }   // Rohwert -> Anteil 0 bis 1
function hindernisse(seed) {   // Hindernislauf: Lage der Hürden (Meter, Querposition -1 bis 1, halbe Breite). Die Querpositionen laufen in gleichmäßiger Folge über die ganze Bahnbreite (Goldener Schnitt, Mitte etwas bevorzugt): jede Spur, auch die Mitte und der Rand, ist mehrfach blockiert, der Läufer muss mehrmals ausweichen
  const r = mrng(seed + 13), h = []; let d = 14 + r() * 4, i = 0; const ph = r();
  while (d < 88) {
    const s = ((ph + i * 0.618034) % 1) * 2 - 1, x = Math.sign(s) * Math.pow(Math.abs(s), 1.25) * 0.85;
    h.push({d: Math.round(d * 10) / 10, x: Math.round(x * 100) / 100, w: Math.round((0.18 + r() * 0.2) * 100) / 100});   // halbe Breite 0,18 bis 0,38
    d += 8.5 + r() * 4.5; i++;
  }
  return h;
}
function laufSim(v, seed, P, ev, bis) {   // 100m-Lauf als Zeitsimulation in 10-ms-Schritten: Der Tipp-Rhythmus ergibt ein Zieltempo (weiche Glockenkurve um den Idealabstand), dem der Läufer mit Trägheit folgt. Nach dem ersten Tipp bleibt er nie stehen (Schleichtempo vMin). Hürden bremsen (auch Streifer). bis = nur bis zu diesem Zeitpunkt (ms) rechnen
  const g0 = P.optGap || 255, minInt = P.minInt || 80, limit = (P.limit || 30) * 1000, vSteer = P.vmax || 2.4, stolper = P.stolper || 1500, quer = P.quer === undefined ? 1.5 : P.quer, rw = 0.11;   // quer = Meter je Querposition-Einheit: Ausweichen verlängert den Weg
  const vTop = P.vTop || 10.6, vMin = P.vMin || 1.6, tau = P.tau || 420, sLang = P.sigLang || 0.65, sSchnell = P.sigSchnell || 0.45, hit = P.hit || 0.6, startGap = P.startGap || 400, DT = 10;   // vTop = Tempo im Optimum (m/s), tau = Trägheit (ms), sig* = Breite der Glockenkurve zu langsam / zu schnell, hit = Tempoverlust je Hürdentreffer
  const ende = Math.min(limit, bis === undefined ? limit : bis);
  const hind = v === 'huerden' ? hindernisse(seed) : [], lt = [0], lx = [0], taps = []; let pt = 0, px = 0;
  for (const e of ev) {   // Zahlen = Lauftipps, Dreiergruppen [Zeit, Querposition, 0] = Lenkung (Ausweichgeschwindigkeit begrenzt)
    if (Array.isArray(e)) {
      if (e.length !== 3 || !(e[0] >= pt) || !Number.isFinite(e[1])) continue;
      const dx = vSteer * (e[0] - pt) / 1000, x = Math.max(px - dx, Math.min(px + dx, Math.max(-1, Math.min(1, e[1]))));
      lt.push(e[0]); lx.push(x); pt = e[0]; px = x;
    } else if (typeof e === 'number') taps.push(e);
  }
  taps.sort((a, b) => a - b);
  let j = 0;
  const xAt = t => { while (j + 1 < lt.length && lt[j + 1] <= t) j++; return j + 1 >= lt.length || lt[j + 1] === lt[j] ? lx[j] : lx[j] + (lx[j + 1] - lx[j]) * (t - lt[j]) / (lt[j + 1] - lt[j]); };
  let dist = 0, vel = 0, xl = 0, last = -1e9, n = 0, rhy = 1, ti = 0, hi = 0, zeit = null, sEnd = 0; const gaps = [], hits = [], fa = 1 - Math.exp(-DT / tau), mean = () => gaps.reduce((a, b) => a + b, 0) / gaps.length;
  for (let t = 0; t <= ende && zeit === null; t += DT) {
    while (ti < taps.length && taps[ti] <= t) {   // Tipps bis zu diesem Zeitpunkt einarbeiten
      const tp = taps[ti++];
      if (!(tp >= 0) || tp - last < minInt) continue;
      if (n > 0) {   // Rhythmus: Abweichung vom Mittel der letzten Abstände, weich bewertet (12 % frei, darüber sanft wachsend, höchstens 40 % Abzug), als gleitender Mittelwert
        const gap = tp - last, m = gaps.length ? mean() : gap, x = Math.max(0, Math.min(1, (Math.abs(gap - m) / m - 0.12) / 0.5));
        rhy = rhy * 0.7 + (1 - 0.4 * x * x * (3 - 2 * x)) * 0.3;
        gaps.push(gap); if (gaps.length > 3) gaps.shift();
      }
      last = tp; n++;
    }
    if (n > 0) {
      const ge = Math.max(gaps.length ? mean() : startGap, t - last), z = Math.log(ge / g0) / (ge < g0 ? sSchnell : sLang);   // wirksamer Abstand: ein überfälliger Tipp zählt wie ein langsamerer Rhythmus
      vel += (vMin + (vTop - vMin) * Math.exp(-0.5 * z * z) * rhy - vel) * fa;
      let ds = vel * DT / 1000;
      if (hind.length) { const xn = xAt(t), dq = Math.min(Math.abs(xn - xl) * quer, 0.95 * ds); xl = xn; ds = Math.sqrt(ds * ds - dq * dq); }   // seitlich gelaufener Weg geht von der Vorwärtsstrecke ab
      const alt = dist; dist += ds;
      while (hi < hind.length && dist >= hind[hi].d) {
        const h = hind[hi++], x = xAt(t), f = Math.max(0, Math.min(x + rw, h.x + h.w) - Math.max(x - rw, h.x - h.w)) / (2 * rw);
        if (f > 0) { hits.push({t: t, d: h.d, f: f}); sEnd = Math.max(sEnd, t + stolper * f); vel *= 1 - hit * f; }
      }
      if (dist >= 100) zeit = Math.round(t - DT + DT * (100 - alt) / (dist - alt));
    }
  }
  return {dist: dist, zeit: zeit, hits: hits, rhy: rhy, n: n, sEnd: sEnd, last: last, g0: g0, gap: gaps.length ? mean() : 0, vel: vel};
}
const WEIT_CP = [7, 12, 17, 22, 27, 32, 37, 42];   // Kontrollpunkte im Anlauf in Metern (Abstand 5 m, der Rhythmus passt zum Tempo)
const WEIT_STEH = 2000;   // Millisekunden, nach denen der Athlet nach der Landung wieder aufrecht steht; bestimmt auch die Pause bis zum nächsten Sprung
function weitSim(v, P, ev, bis) {   // Weitsprung, 3 Sprünge: Tippen an den Kontrollpunkten gibt Tempo, langes Drücken kurz vor dem Balken startet den Absprung, der Winkel wächst bis zum Loslassen, Übertritt ist ungültig
  const CP = WEIT_CP, BA = 50, AUTO = 51, TOL = 1.8, DT = 10, HOLD = 1600, AUTOREL = 2000, PAUSE = 2100 + WEIT_STEH;   // Meter und Millisekunden
  const vt0 = P.vt0 || 6, boost = P.boost || 0.6, wmax = P.wmax || 9, vref = P.vref || 10.5, topt = P.optWinkel || 22, tbr = P.winkelBreite || 28, bisT = bis === undefined ? 1e12 : bis;
  const D = [], U = [];
  for (const e of ev) if (Array.isArray(e) && e.length === 3 && Number.isFinite(e[0])) { if (e[1] === 1) D.push(e[0]); else if (e[1] === 2) U.push(e[0]); }   // [Zeit, 1, 0] = Finger runter, [Zeit, 2, 0] = Finger hoch
  D.sort((a, b) => a - b); U.sort((a, b) => a - b);
  const out = []; let t0 = 3000, di = 0, ui = 0, last = -1e9;
  for (let k = 0; k < 3; k++) {
    const J = {t0: t0, q: CP.map(() => -1), x: 0, v: 0, ph: 0, tp: 0, rt: 0, xp: 0, theta: 0, foul: false, auto: false, weite: 0, land: 0, end: null};   // ph: 0 Anlauf, 1 Absprung gedrückt, 2 Flug; foul = Übertritt (Sprung wird ausgeführt, zählt aber nicht), land = Landepunkt in m
    out.push(J);
    let vt = vt0, t = t0;
    for (let n = 0; n < 4000 && J.end === null; n++) {
      t += DT;
      if (t > bisT) break;
      if (J.ph === 0) { J.v += (vt - J.v) * Math.min(1, 1.3 * DT / 1000); J.x += J.v * DT / 1000; }
      while (di < D.length && D[di] <= t) {
        const tt = D[di++];
        if (tt < t0 || tt - last < 100) continue;
        last = tt;
        if (J.ph !== 0) continue;
        if (J.x < CP[CP.length - 1] + TOL) {   // vor dem letzten Kontrollpunkt zählt jedes Drücken als Tipp
          let bi = -1, bd = TOL;
          for (let i = 0; i < CP.length; i++) { const d = Math.abs(CP[i] - J.x); if (J.q[i] < 0 && d <= bd) { bd = d; bi = i; } }
          if (bi >= 0) { const qq = Math.max(0, Math.min(1, (TOL - bd) / 1.5)); J.q[bi] = qq; vt += boost * qq; }
          else vt = Math.max(vt0 * 0.8, vt - 0.25);   // Tipp ohne Kontrollpunkt bremst leicht
        } else if (J.x <= BA) { J.ph = 1; J.tp = tt; J.xp = J.x; }
        else { J.ph = 1; J.tp = tt; J.xp = J.x; J.foul = true; }   // zu spät gedrückt: Übertritt, der Athlet springt trotzdem
      }
      if (J.ph === 0) {
        for (let i = 0; i < CP.length; i++) if (J.q[i] < 0 && J.x > CP[i] + TOL) { J.q[i] = 0; vt = Math.max(vt0 * 0.8, vt - 0.2); }   // verpasster Kontrollpunkt
        if (J.x >= AUTO) { J.ph = 1; J.tp = t; J.xp = J.x; J.foul = true; J.auto = true; }   // nicht gedrückt: Übertritt, der Athlet springt von selbst mit Idealwinkel ab
      }
      if (J.ph === 1) {
        while (ui < U.length && U[ui] < J.tp) ui++;
        const rel = J.auto ? J.tp + Math.round(HOLD * topt / 60) : ui < U.length && U[ui] <= J.tp + AUTOREL ? U[ui] : J.tp + AUTOREL;
        if (t >= rel) {
          const th = Math.min(60, 60 * (rel - J.tp) / HOLD), f = Math.max(0.3, 1 - Math.pow((th - topt) / tbr, 2));
          J.rt = rel; J.theta = th; J.ph = 2; J.end = rel + PAUSE;
          const raw = wmax * Math.pow(J.v / vref, 2) * f;
          if (J.foul) { J.weite = 0; J.land = Math.round((J.xp + raw) * 100) / 100; }
          else { J.weite = Math.max(0, Math.round((raw - (BA - J.xp)) * 100) / 100); J.land = BA + J.weite; }
          if (!J.auto && ui < U.length && U[ui] === rel) ui++;
        }
      }
    }
    if (J.end === null) break;
    t0 = J.end;
  }
  return {sp: out, done: out.length === 3 && out[2].end !== null};
}
function miniErgebnis(v, seed, P, taps, fertig) {   // liefert {roh, anteil}; ungültige Eingaben werden übersprungen. fertig = das Spiel ist zu Ende (Zielschießen: nicht geschossene Pfeile gelten dann als verfallen)
  let roh = 0, lt = -1e9;
  if (v === 'sprint' || v === 'zielzeit' || v === 'huerden') {
    const e = laufSim(v, seed, P, taps);
    if (e.zeit === null) return {roh: '-', anteil: 0};   // Ziel nicht erreicht
    const z = e.zeit / 1000;
    return {roh: Math.round(z * 100) / 100, anteil: v === 'zielzeit' ? Math.max(0, 1 - Math.abs(z - P.ziel) / P.tol) : Math.max(0, Math.min(1, (P.max - z) / (P.max - P.best)))};
  }
  if (v === 'weit' || v === 'zielweit') {   // Weitsprung: nur gültige Sprünge zählen, Bestweite bzw. der Sprung nächst der Zielweite
    const sp = weitSim(v, P, taps).sp, ok = sp.filter(j => !j.foul && j.end !== null).map(j => j.weite);
    if (!ok.length) return {roh: '-', anteil: 0};
    if (v === 'zielweit') {   // Wertung nach P.wertung: 'best' = der Sprung nächst der Zielweite zählt (bisher); 'schnitt' = mittlere Abweichung aller 3 Sprünge (Fehlversuche und nicht gesprungene zählen als größte Abweichung); 'bonus' = wie 'best' plus Zusatz (P.bonus, Standard 0,25, höchstens also volle Punkte x (1 + bonus); der Zusatz wächst quadratisch, belohnt also vor allem sehr enge Gruppen), je enger alle Sprünge an der Zielweite liegen
      let b = ok[0]; ok.forEach(w => { if (Math.abs(w - P.ziel) < Math.abs(b - P.ziel)) b = w; });
      const bestA = Math.max(0, 1 - Math.abs(b - P.ziel) / P.tol), dev = [];
      for (let i = 0; i < 3; i++) dev.push(sp[i] && !sp[i].foul && sp[i].end !== null ? Math.min(P.tol, Math.abs(sp[i].weite - P.ziel)) : P.tol);
      const avgA = Math.max(0, 1 - dev.reduce((x, y) => x + y, 0) / 3 / P.tol), m = P.wertung;
      return {roh: b, anteil: m === 'schnitt' ? avgA : m === 'bonus' ? bestA + (P.bonus === undefined ? 0.25 : P.bonus) * avgA * avgA : bestA};
    }
    const b = Math.max.apply(null, ok); return {roh: b, anteil: skal(b, P)};
  }
  if (v === 'huhn') {
    const plan = huhnPlan(seed, P.sek); let falle = 0;
    for (const tp of taps) {
      if (!Array.isArray(tp)) continue;
      const t = tp[0], x = tp[1], y = tp[2];
      if (t < 0 || t > P.sek * 1000 || t - lt < 100) continue;
      lt = t;
      const z = plan.find(q => !q.weg && t >= q.t && t < q.t + q.d && Math.hypot(x - q.x, y - q.y) < 0.22 * q.s);
      if (z) { z.weg = 1; if (z.k) falle++; else roh++; }
    }
    roh = Math.max(0, roh - falle * (P.strafe || 0));   // Fallen ziehen Punkte ab
    return {roh: roh, anteil: skal(roh, P)};
  }
  const pf = bogenPfad(seed, v), minInt = P.minInt || 300, lim = (P.pfeilSek || 0) * 1000, vp = v === 'ziel' ? (P.verfallPunkte === undefined ? 10 : P.verfallPunkte) : 0; let n = 0, start = 0, schuss = 0;   // vp = Punkte für einen verfallenen Pfeil: nur beim Zielschießen (sonst würde man das Limit bewusst überschreiten), beim Punkteschießen 0   // lim = Zeitlimit je Pfeil (nur Punkte- und Zielschießen), start = Beginn des Countdowns des aktuellen Pfeils
  for (const t of taps) {
    if (typeof t !== 'number' || t < 500 || t - lt < minInt) continue;
    if (v === 'speed' && t > P.sek * 1000) continue;
    if (lim > 0) while (n < P.pfeile && t >= start + lim) { n++; start += lim; roh += vp; }   // nicht rechtzeitig geschossene Pfeile verfallen (0 Punkte), der Countdown beginnt für den nächsten Pfeil neu
    if (n >= P.pfeile) continue;
    lt = t; n++; schuss++; start = t; const p = pf(t); roh += ring(p[0], p[1]);
  }
  if (fertig && lim > 0 && vp > 0) { if (!schuss) return {roh: 0, anteil: 0}; roh += (P.pfeile - n) * vp; }   // ganz ohne Schuss (Aufgeben) gibt es nichts; sonst gelten nicht geschossene Pfeile als verfallen
  return {roh: roh, anteil: v === 'ziel' ? Math.max(0, 1 - Math.abs(roh - P.ziel) / P.tol) : skal(roh, P)};
}

const BOGEN_ICH = true;   // true = Bogenschießen aus Sicht des Athleten (Bogen und Pfeil im Vordergrund, Pfeilflug); false = alte Ansicht ohne Bogen und Flug
const STECK_NEIGUNG = 5;   // Grad: Neigung der in der Scheibe steckenden Pfeile gegen die Senkrechte zur Scheibe nach oben (0 = genau auf den Spieler gerichtet, nur Federn sichtbar; größer = deutlicher nach oben geneigt, der Pfeil fällt ja von oben)
const STECK_LAENGE = 100;    // Länge der steckenden Pfeile in px (davon sieht man den Anteil sin(Neigung))
const ICH_VAR = ['punkte', 'ziel', 'speed', 'huhn'];   // Varianten mit dieser Ansicht (Zielscheiben-Jagd: Bogen in der Mitte, schwenkt zum Schuss und kehrt zurück)
const MINIP = {punkte: {pfeile: 5, min: 15, ref: 48, pfeilSek: 15}, ziel: {pfeile: 5, tol: 22, ziel: 30, pfeilSek: 15, verfallPunkte: 10}, speed: {pfeile: 8, sek: 15, min: 25, ref: 62, minInt: 600}, huhn: {sek: 30, strafe: 2, min: 4, ref: 22},
  sprint: {best: 9.8, max: 20}, zielzeit: {ziel: 13, tol: 4}, huerden: {best: 10.5, max: 22, quer: 1.5},
  weit: {min: 3, ref: 8}, zielweit: {ziel: 6.2, tol: 1.5}};   // nur fürs Üben, 100m-Werte wie MINI.lauf in Code.gs

// ---- Tastatursteuerung der Minispiele (PC und iPad mit Tastatur, zusätzlich zu Maus und Touch) ----
// Tippen, Laufen, Schießen, Absprung: Leertaste, Enter, Ziffernblock-Enter oder Pfeil hoch. Ausweichen beim Hindernislauf: Pfeil links/rechts, linke/rechte Umschalttaste oder H/K.
const KEY_LENK = 2;   // Hindernislauf: so schnell (Querposition-Einheiten pro Sekunde) wandert der Regler, solange eine Lenktaste gehalten wird
const TASTEN_VAR = ['punkte', 'ziel', 'speed', 'sprint', 'zielzeit', 'huerden', 'weit', 'zielweit'];   // Varianten mit Tastatursteuerung (die Zielscheiben-Jagd braucht eine Zielposition und bleibt bei Maus/Touch)
function tasteArt(e) {   // 'tipp', 'li', 're' oder '' (e.code bevorzugt, e.key als Rückfall für Tastaturen ohne code)
  const c = e.code || '', k = e.key || '';
  if (c === 'Space' || c === 'Enter' || c === 'NumpadEnter' || c === 'ArrowUp' || k === ' ' || k === 'Enter' || k === 'ArrowUp') return 'tipp';
  if (c === 'ArrowLeft' || c === 'KeyH' || c === 'ShiftLeft' || k === 'ArrowLeft' || k === 'h' || k === 'H' || (k === 'Shift' && e.location === 1)) return 'li';
  if (c === 'ArrowRight' || c === 'KeyK' || c === 'ShiftRight' || k === 'ArrowRight' || k === 'k' || k === 'K' || (k === 'Shift' && e.location === 2)) return 're';
  return '';
}
function tastenBindung(aktiv, tipp, los, lenk) {   // aktiv() = Spiel läuft noch; tipp() = Taste gedrückt (ohne Wiederholung); los() = losgelassen (nur Weitsprung, sonst null); lenk(-1|0|1) = Lenkrichtung (nur Hindernislauf, sonst null)
  const ge = {li: new Set(), re: new Set()}, idv = e => e.code || String(e.key).toLowerCase();
  let tippt = false;
  const dir = () => (ge.re.size ? 1 : 0) - (ge.li.size ? 1 : 0);
  const ab = () => { document.removeEventListener('keydown', kd, true); document.removeEventListener('keyup', ku, true); window.removeEventListener('blur', zu); };
  const zu = () => { ge.li.clear(); ge.re.clear(); if (tippt) { tippt = false; if (los) los(); } if (lenk) lenk(0); };   // Fenster verliert den Fokus: alles loslassen
  function kd(e) {
    if (!aktiv()) return ab();
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const a = tasteArt(e);
    if (!a || (a !== 'tipp' && !lenk)) return;
    e.preventDefault();
    if (a === 'tipp') { if (!e.repeat && !(los && tippt)) { tippt = true; tipp(); } }
    else { ge[a].add(idv(e)); lenk(dir()); }
  }
  function ku(e) {
    if (!aktiv()) return ab();
    const a = tasteArt(e);
    if (!a) return;
    if (a === 'tipp') { if (los && tippt) { tippt = false; los(); } }
    else if (lenk) { ge[a].delete(idv(e)); lenk(dir()); }
  }
  document.addEventListener('keydown', kd, true); document.addEventListener('keyup', ku, true); window.addEventListener('blur', zu);
  return ab;
}

function miniSpiel(box, v, seed, P, onEnde) {   // zeichnet und spielt eine Bogenschieß-Variante, Punkte und Zeit stehen auf der Fläche
  const kt = box.closest('.karte'); if (kt) kt.classList.toggle('breit', LAUF.includes(v) || WEIT.includes(v));
  if (LAUF.includes(v)) return laufSpiel(box, v, seed, P, onEnde);
  if (WEIT.includes(v)) return weitSpiel(box, v, seed, P, onEnde);
  if (box._stop) box._stop();
  const W = 360, HUDH = 38, H = W + HUDH, dpr = Math.min(3, window.devicePixelRatio || 1), cv = document.createElement('canvas');
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.className = 'mcv'; cv.style.aspectRatio = W + ' / ' + H;
  box.replaceChildren(cv); zoomSperre(cv);
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const huhn = v === 'huhn', pfad = bogenPfad(seed, v), plan = huhn ? huhnPlan(seed, P.sek) : [];
  const dauer = (huhn || v === 'speed') ? P.sek * 1000 : 0, taps = [], treffer = [], effekte = [], minInt = huhn ? 100 : (P.minInt || 300);
  const lim = (P.pfeilSek > 0 && (v === 'punkte' || v === 'ziel')) ? P.pfeilSek * 1000 : 0; let pfStart = 0, verfall = 0; const vp = v === 'ziel' ? (P.verfallPunkte === undefined ? 10 : P.verfallPunkte) : 0;   // vp = Punkte für einen verfallenen Pfeil (nur Zielschießen)   // lim = Zeitlimit je Pfeil (Punkte- und Zielschießen), pfStart = Beginn des Countdowns für den aktuellen Pfeil, verfall = nicht rechtzeitig geschossene Pfeile
  const ich = BOGEN_ICH && ICH_VAR.includes(v), schuesse = [], FLUG = 320, SW = huhn ? 60 : 0; let schluss = null, letzter = -1e9;   // ich: Sicht des Athleten; schuesse: Pfeile im Flug bzw. im Ziel, schluss: Zeitpunkt des letzten Schusses
  const t0 = performance.now(); let ende = false, roh = 0;
  box._stop = () => { ende = true; };
  const px = x => (Math.max(-1, Math.min(1, x)) + 1) / 2 * W;   // normalisiert -> Spielfläche, am Rand begrenzt
  const kreis = (x, y, r, fill, line) => {
    g.beginPath(); g.arc(x, y, Math.max(0, r), 0, 6.2832);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (line) { g.strokeStyle = line; g.lineWidth = 1.5; g.stroke(); }
  };
  function hudZeichnen(ms) {   // Kopfleiste: Punkte links, Zeit/Pfeile rechts, Ziel in der Mitte
    g.fillStyle = '#17202a'; g.fillRect(0, 0, W, HUDH);
    g.font = 'bold 17px system-ui, sans-serif'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
    g.textAlign = 'left'; g.fillText(t(huhn ? 'mTreffer' : 'mPunkte') + ': ' + roh, 10, HUDH / 2 - 2);
    const sek = Math.max(0, Math.ceil((dauer - ms) / 1000)) + ' s', pf = (taps.length + verfall) + '/' + P.pfeile + ' ' + t('mPfeile');
    if (lim) {   // Zeitlimit je Pfeil: ganz rechts der Countdown (gelb, orange, rot), links davon die Pfeile, beim Zielschießen dazwischen das Ziel
      const aktiv = taps.length + verfall < P.pfeile, rest = Math.max(0, pfStart + lim - ms), w = rest <= 3000 ? 2 : rest <= 5000 ? 1 : 0;
      const lw = g.measureText(t(huhn ? 'mTreffer' : 'mPunkte') + ': ' + roh).width, cw = g.measureText('88 s').width;
      let rx = W - 10; g.textAlign = 'right';
      if (aktiv) { g.fillStyle = w ? WARN_FARBE[w] : '#fff'; g.globalAlpha = w === 2 ? 0.65 + 0.35 * Math.abs(Math.sin(ms / 110)) : 1; g.fillText(Math.ceil(rest / 1000) + ' s', rx, HUDH / 2 - 2); g.globalAlpha = 1; }
      rx -= cw + 14; g.fillStyle = '#fff'; g.fillText(pf, rx, HUDH / 2 - 2);
      if (v === 'ziel') { const x0 = 10 + lw, x1 = rx - g.measureText(pf).width; g.textAlign = 'center'; g.fillStyle = '#ffd23f'; g.fillText(t('mZiel', P.ziel), (x0 + x1) / 2, HUDH / 2 - 2); }
    } else {
      g.textAlign = 'right'; g.fillText(v === 'speed' ? pf + '  ' + sek : dauer ? sek : pf, W - 10, HUDH / 2 - 2);
      if (v === 'ziel') { g.textAlign = 'center'; g.fillStyle = '#ffd23f'; g.fillText(t('mZiel', P.ziel), W / 2, HUDH / 2 - 2); }
    }
    if (dauer) { g.fillStyle = '#ffd23f'; g.fillRect(0, HUDH - 5, W * Math.max(0, 1 - ms / dauer), 5); }
    else if (lim && taps.length + verfall < P.pfeile) { const rest = Math.max(0, pfStart + lim - ms); g.fillStyle = WARN_FARBE[rest <= 3000 ? 2 : rest <= 5000 ? 1 : 0]; g.fillRect(0, HUDH - 5, W * rest / lim, 5); }   // Zeit für den aktuellen Pfeil, wird gelb, orange, rot
  }
  const WARN_FARBE = ['#ffd23f', '#ff9f43', '#ff4d5e'];   // Countdown: normal, letzte 5 s, letzte 3 s
  function zeitPruefen(ms) {   // nicht rechtzeitig geschossene Pfeile verfallen (0 Punkte), der Countdown beginnt für den nächsten Pfeil neu
    if (!lim) return;
    while (taps.length + verfall < P.pfeile && ms >= pfStart + lim) {
      pfStart += lim; verfall++; roh += vp;
      const q = pfad(pfStart); effekte.push({t: pfStart, x: q[0], y: q[1], s: vp ? '+' + vp : '0', c: '#ff6b7a'});
      if (taps.length + verfall >= P.pfeile) { if (ich) schluss = pfStart; else { beenden(); return; } }
    }
  }
  function szene(ms) {   // Hintergrund: Himmel, Sonne, ziehende Wolken, Hügel, Bäume, Wiese
    const himmel = g.createLinearGradient(0, 0, 0, W); himmel.addColorStop(0, '#bfe0fa'); himmel.addColorStop(1, '#eef7ff');
    g.fillStyle = himmel; g.fillRect(0, 0, W, W);
    kreis(W - 62, 62, 44, 'rgba(255,233,160,.45)'); kreis(W - 62, 62, 26, '#ffe08a');
    [[0.012, 40, 70, 1], [0.008, 150, 150, 0.8], [0.017, 260, 105, 0.6]].forEach(c => {
      const x = ((ms * c[0] + c[1]) % (W + 160)) - 80, y = c[2], s = c[3];
      g.globalAlpha = 0.92; kreis(x, y, 16 * s, '#fff'); kreis(x + 18 * s, y + 4 * s, 13 * s, '#fff'); kreis(x - 18 * s, y + 5 * s, 12 * s, '#fff'); g.globalAlpha = 1;
    });
    g.fillStyle = '#9fd3a8'; g.beginPath(); g.moveTo(0, W - 50); g.quadraticCurveTo(90, W - 110, 190, W - 62); g.quadraticCurveTo(270, W - 30, W, W - 72); g.lineTo(W, W); g.lineTo(0, W); g.fill();
    g.fillStyle = '#7fbf8e'; g.beginPath(); g.moveTo(0, W - 28); g.quadraticCurveTo(110, W - 80, 230, W - 36); g.quadraticCurveTo(310, W - 12, W, W - 44); g.lineTo(W, W); g.lineTo(0, W); g.fill();
    [[48, W - 54], [300, W - 56], [330, W - 50]].forEach(b => { g.fillStyle = '#7b5a3a'; g.fillRect(b[0] - 3, b[1], 6, 18); kreis(b[0], b[1] - 4, 15, '#4f9b5f'); });
    g.fillStyle = '#5fa56b'; g.fillRect(0, W - 22, W, 22);
  }
  const OX = W * 0.56, OY = W - 6;   // Pfeilende (Nock) liegt fest unten im Bild, alles läuft perspektivisch auf den Zielpunkt zu
  const FOK = 260, ZN = 30, ZT = 98, ZG = 78;   // Brennweite und Tiefen (Pfeilende, Spitze, Griff) in beliebigen Einheiten
  const proj = (a, b, z, vx, vy) => [vx + (OX - vx) * ZN / z + a * FOK / z, vy + (OY - vy) * ZN / z + b * FOK / z];   // a/b = seitlicher Versatz zum Pfeil, z = Tiefe
  const wpx = (w, z) => Math.max(1, w * FOK / z);
  const vieleck = (pts, fill, line) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.strokeStyle = line; g.lineWidth = 1; g.stroke(); } };
  function pfeilZeichnen(x0, y0, dx, dy, len, sc, ohneSpitze) {   // Pfeil im Flug von hinten: Federn am hinteren Ende (breit), nach vorn schmaler, vorn die Spitze
    const x1 = x0 + dx * len, y1 = y0 + dy * len, nx = -dy, ny = dx;
    g.lineCap = 'round';
    g.strokeStyle = '#17202a'; g.lineWidth = 5.5 * sc; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = '#e3c27d'; g.lineWidth = 3.2 * sc; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    const fl = 0.14 * len;
    vieleck([[x0 + nx * 7 * sc, y0 + ny * 7 * sc], [x0 + dx * fl + nx * 1.3 * sc, y0 + dy * fl + ny * 1.3 * sc], [x0 + dx * fl - nx * 1.3 * sc, y0 + dy * fl - ny * 1.3 * sc], [x0 - nx * 7 * sc, y0 - ny * 7 * sc]], '#d62839', '#7a1320');
    if (!ohneSpitze) { g.fillStyle = '#e6edf3'; g.beginPath(); g.moveTo(x1 + dx * 20 * sc, y1 + dy * 20 * sc); g.lineTo(x1 + nx * 6.5 * sc, y1 + ny * 6.5 * sc); g.lineTo(x1 - nx * 6.5 * sc, y1 - ny * 6.5 * sc); g.closePath(); g.fill(); g.strokeStyle = '#17202a'; g.lineWidth = 1; g.stroke(); }
    g.lineCap = 'butt';
  }
  function vordergrund(ms, vx, vy) {   // Bogen und Pfeil aus Sicht des Athleten, perspektivisch auf den Zielpunkt (vx, vy) ausgerichtet; Sehne vor dem Bogen
    const P = (a, b, z) => proj(a, b, z, vx, vy), N = 20, ZS = 20;   // ZS = wie viel näher am Auge die Bogenspitzen sind
    g.lineCap = 'round'; g.lineJoin = 'round';
    [['#4a2c14', 2.6], ['#a86a34', 0]].forEach(([col, extra]) => {   // Bogen: Wurfarme, die Spitzen kommen dem Auge entgegen, zum Ende hin schlanker
      g.strokeStyle = col;
      for (let i = -N; i < N; i++) {
        const s1 = i / N, s2 = (i + 1) / N, z1 = ZG - ZS * s1 * s1, z2 = ZG - ZS * s2 * s2, a = P(3, 18 * s1, z1), b = P(3, 18 * s2, z2);
        g.lineWidth = wpx((2.6 - 1.1 * Math.abs((s1 + s2) / 2)) * (extra ? 0.55 : 1), (z1 + z2) / 2) + extra; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      }
    });
    const g1 = P(3, -6, ZG), g2 = P(3, 6, ZG); g.strokeStyle = '#2b2f3a'; g.lineWidth = wpx(2.4, ZG); g.beginPath(); g.moveTo(g1[0], g1[1]); g.lineTo(g2[0], g2[1]); g.stroke();   // Griff
    const t1 = P(3, -18, ZG - ZS), nk = P(0, 0, ZN), t2 = P(3, 18, ZG - ZS);
    const sehne = (a, b) => { g.strokeStyle = 'rgba(244,241,232,.95)'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };   // Sehne: von den Spitzen zum Pfeilende; der untere Teil liegt hinter dem Pfeil, der obere davor
    sehne(nk, t2);
    if (ms - letzter > 380) {   // nach dem Schuss kurz kein Pfeil auf der Sehne
      const W2 = 0.45, L = z => P(-W2, 0, z), R = z => P(W2, 0, z), Fz = 3.6, H = 1.8;   // Federn nur am hinteren Ende
      const vane = (sa, sb) => vieleck([P(sa * W2, sb * W2, ZN), P(sa * (W2 + H), sb * (W2 + H), ZN + 1), P(sa * (W2 + 0.5), sb * (W2 + 0.5), ZN + Fz), P(sa * W2, sb * W2, ZN + Fz)], '#d62839', '#7a1320');   // Feder: hinten hoch, nach vorn flach
      vane(0, -1);   // obere Feder zuerst, dann die seitlichen
      vieleck([L(ZN), L(ZT), R(ZT), R(ZN)], '#e3c27d', '#17202a');   // Schaft: vorn schmaler (weiter weg)
      vane(-1, 0); vane(1, 0);
      const sb = P(0, 0, ZT), sn = P(0, 0, ZN), dx = sb[0] - sn[0], dy = sb[1] - sn[1], dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl, nx = -uy, ny = ux, hw = 2.8 * FOK / ZT * 0.9, hl = 20;   // Spitze in Bildrichtung des Schafts: von hinten gesehen ergäbe ein Kegel nur ein flaches Viereck
      const ap = [sb[0] + ux * hl, sb[1] + uy * hl], pl = [sb[0] + nx * hw, sb[1] + ny * hw], pr = [sb[0] - nx * hw, sb[1] - ny * hw];
      vieleck([ap, pl, sb], '#f4f8fb', '#17202a'); vieleck([ap, sb, pr], '#aab6c2', '#17202a');   // linke Hälfte hell, rechte dunkel: wirkt wie ein Kegel
    }
    sehne(t1, nk);   // oberer Teil der Sehne über dem Pfeil und den Federn
    g.lineCap = 'butt';
  }
  function zielPunkt(ms) {   // Jagd: Bogen steht in der Mitte, schwenkt beim Schuss zum Ziel und kehrt dann zurück
    const b = [W / 2, W * 0.48];
    if (!schuesse.length) return b;
    const s = schuesse[schuesse.length - 1], e = ms - s.t, E = [px(s.p[0]), px(s.p[1])];
    const k = e < SW ? e / SW : e < SW + 120 ? 1 : Math.max(0, 1 - (e - SW - 120) / 380), q = k * k * (3 - 2 * k);
    return [b[0] + (E[0] - b[0]) * q, b[1] + (E[1] - b[1]) * q];
  }
  function festPfeil(p) {   // Pfeil steckt in der Scheibe: alle einheitlich fast senkrecht zur Scheibe, das Ende mit den Federn leicht nach oben geneigt
    const ex = px(p[0]), ey = px(p[1]), vis = Math.max(10, STECK_LAENGE * Math.sin(STECK_NEIGUNG * Math.PI / 180));
    kreis(ex, ey, 3, '#17202a');
    pfeilZeichnen(ex, ey - vis, 0, 1, vis, 0.7, true);
  }
  function fluege(ms) {   // Pfeile im Parabelflug vom Bogen zum Treffpunkt
    schuesse.forEach(s => {
      const u = (ms - s.f) / FLUG; if (u < 0 || u >= 1) return;
      const ex = px(s.p[0]), ey = px(s.p[1]), st = proj(0, 0, ZT, ex, ey), sx = st[0], sy = st[1];
      const bog = Math.max(18, 0.14 * Math.hypot(ex - sx, ey - sy)), X = sx + (ex - sx) * u, Y = sy + (ey - sy) * u - bog * 4 * u * (1 - u);
      let vx = ex - sx, vy = ey - sy - bog * 4 * (1 - 2 * u); const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
      const sc = 1 - 0.5 * u, len = 56 * sc;
      pfeilZeichnen(X - vx * len, Y - vy * len, vx, vy, len, sc);
    });
  }
  function zeichne(ms) {
    hudZeichnen(ms);
    g.save(); g.translate(0, HUDH);
    szene(ms);
    if (!huhn) {
      [['#f4f1e8', 1], ['#222', .8], ['#1d4ed8', .6], ['#d62839', .4], ['#ffd23f', .2]].forEach(a => kreis(W / 2, W / 2, a[1] * W / 2, a[0], 'rgba(23,32,42,.35)'));
      g.font = 'bold 13px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';   // Wertigkeit der Ringe
      for (let s = 1; s <= 10; s++) {
        const rr = (10 - s + 0.5) / 10 * W / 2;
        g.fillStyle = (s <= 2 || s >= 9) ? '#17202a' : '#fff';
        if (s === 10) g.fillText('10', W / 2, W / 2 + 1);
        else { g.fillText(String(s), W / 2 + rr, W / 2 + 1); g.fillText(String(s), W / 2 - rr, W / 2 + 1); }
      }
      if (ich) schuesse.filter(s => ms >= s.f + FLUG).forEach(s => festPfeil(s.p)); else treffer.forEach(h => kreis(px(h[0]), px(h[1]), 5, '#17202a', '#fff'));   // ich: Pfeile bleiben stecken
      const p = pfad(ms), cx = px(p[0]), cy = px(p[1]);
      [['#fff', 4.5], ['#17202a', 2]].forEach(a => {
        g.strokeStyle = a[0]; g.lineWidth = a[1]; g.beginPath(); g.arc(cx, cy, 9, 0, 6.2832);
        g.moveTo(cx - 17, cy); g.lineTo(cx + 17, cy); g.moveTo(cx, cy - 17); g.lineTo(cx, cy + 17); g.stroke();
      });
      if (ich) { fluege(ms); vordergrund(ms, cx, cy); }   // Zielpunkt = Fadenkreuz
    } else {
      plan.forEach(z => {
        if (ms < z.t || (z.weg ? ms >= z.weg - 1 + SW + FLUG : ms >= z.t + z.d)) return;   // getroffene Ziele bleiben, bis der Pfeil ankommt
        const x = px(z.x), y = px(z.y), k = Math.max(0.05, Math.min(1, (ms - z.t) / 150, z.weg ? 1 : (z.t + z.d - ms) / 150));   // sanftes Ein- und Ausblenden
        const R = 30 * z.s * k;   // Größe wechselt von Ziel zu Ziel
        if (z.k) {   // Falle: dunkel mit gelbem Rand und weißem Kreuz
          kreis(x, y, R, '#2b2f3a', '#ffd23f'); g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath();
          g.moveTo(x - R * 0.4, y - R * 0.4); g.lineTo(x + R * 0.4, y + R * 0.4); g.moveTo(x + R * 0.4, y - R * 0.4); g.lineTo(x - R * 0.4, y + R * 0.4); g.stroke();
        } else { kreis(x, y, R, '#d62839', '#17202a'); kreis(x, y, R * 0.63, '#f4f1e8'); kreis(x, y, R * 0.27, '#d62839'); }
        g.strokeStyle = z.k ? '#ffd23f' : '#fff'; g.lineWidth = 3; g.beginPath();   // Ring zeigt die Restzeit des Ziels
        g.arc(x, y, 30 * z.s + 7, -1.5708, -1.5708 + 6.2832 * (1 - Math.min(1, (ms - z.t) / z.d))); g.stroke();
      });
      if (ich) { fluege(ms); const zp = zielPunkt(ms); vordergrund(ms, zp[0], zp[1]); }
    }
    g.font = 'bold 22px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    effekte.forEach(e => { const a = (ms - e.t) / 700; if (a >= 0 && a < 1) { g.globalAlpha = 1 - a; g.fillStyle = e.c; g.fillText(e.s, px(e.x), px(e.y) - 14 - a * 40); } });
    g.globalAlpha = 1;
    g.restore();
  }
  function beenden() { if (ende) return; ende = true; zeichne(performance.now() - t0); onEnde(taps); }   // letztes Bild mit aktuellem Stand
  function frame() {
    if (ende) return;
    const ms = performance.now() - t0;
    zeitPruefen(ms); if (ende) return;
    zeichne(ms);
    if (dauer && ms >= dauer + (ich ? FLUG + SW + 150 : 0)) return beenden();   // letzter Pfeil darf noch ankommen
    if (schluss !== null && ms >= schluss + FLUG + 450) return beenden();   // letzter Pfeil darf noch ankommen
    requestAnimationFrame(frame);
  }
  cv.onpointerdown = e => {
    if (ende || schluss !== null) return;
    e.preventDefault();
    const t = Math.round(performance.now() - t0), r = cv.getBoundingClientRect();
    zeitPruefen(t); if (ende || schluss !== null) return;
    const x = +(((e.clientX - r.left - cv.clientLeft) / cv.clientWidth) * 2 - 1).toFixed(3);
    const y = +((((e.clientY - r.top - cv.clientTop) / cv.clientHeight * H - HUDH) / W) * 2 - 1).toFixed(3);
    if (y < -1) return;   // Tipp auf die Kopfleiste zählt nicht
    if (dauer && t > dauer) return;   // nach Ablauf der Zeit zählt nichts mehr
    const l = taps.length ? taps[taps.length - 1] : null, lt = l === null ? -1e9 : (huhn ? l[0] : l);
    if (t - lt < minInt || (!huhn && t < 500)) return;
    taps.push(huhn ? [t, x, y] : t); if (lim) pfStart = t;   // Countdown für den nächsten Pfeil beginnt
    roh = miniErgebnis(v, seed, P, taps).roh;
    if (huhn) {
      const z = plan.find(q => !q.weg && t >= q.t && t < q.t + q.d && Math.hypot(x - q.x, y - q.y) < 0.22 * q.s);
      const ft = ich ? SW + FLUG : 0;   // Effekt erst bei Ankunft des Pfeils
      if (z) { z.weg = t + 1; effekte.push(z.k ? {t: t + ft, x: z.x, y: z.y, s: '-' + (P.strafe || 0), c: '#d62839'} : {t: t + ft, x: z.x, y: z.y, s: '+1', c: '#1e7a3c'}); }
      if (ich) { schuesse.push({t: t, f: t + SW, p: [x, y]}); letzter = t; }
    } else if (ich) { schuesse.push({t: t, f: t, p: pfad(t)}); letzter = t; if (taps.length + verfall >= P.pfeile) schluss = t; }
    else { treffer.push(pfad(t)); if (taps.length + verfall >= P.pfeile) beenden(); }
  };
  if (!huhn) tastenBindung(() => !ende, () => { const r = cv.getBoundingClientRect(); cv.onpointerdown({preventDefault() {}, clientX: r.left + cv.clientLeft + cv.clientWidth / 2, clientY: r.top + cv.clientTop + cv.clientHeight * (HUDH + W / 2) / H}); }, null, null);   // Taste = Schuss (nur der Zeitpunkt zählt, die Position ist egal)
  frame();
}

// ---- 100m-Lauf (nur Browser): Schrägansicht von hinten, Tipps = Schritte, Bedienfelder links und rechts neben dem Canvas ----
const LAUF = ['sprint', 'zielzeit', 'huerden'];
function zoomSperre(e) {   // Spielflächen: kein Doppeltipp-Zoom, kein Pinch-Zoom, kein Scrollen beim Wischen (auch iOS Safari)
  ['touchstart', 'touchmove'].forEach(n => e.addEventListener(n, x => { if (x.cancelable) x.preventDefault(); }, {passive: false}));
  ['gesturestart', 'gesturechange', 'dblclick', 'contextmenu'].forEach(n => e.addEventListener(n, x => x.preventDefault()));
}
function fz(x) { return String(x).replace('.', typeof L !== 'undefined' && (L === 'de' || L === 'fr') ? ',' : '.'); }
function rohText(v, roh) { return fz(roh) + (typeof roh === 'number' ? (LAUF.includes(v) ? ' s' : WEIT.includes(v) ? ' m' : '') : ''); }
function miniBeschr(v, P) { return miniBeschrRoh(v, P) + (TASTEN_VAR.includes(v) ? ' ' + t('mTaste') + (v === 'huerden' ? ' ' + t('mTasteH') : '') : ''); }
function miniBeschrRoh(v, P) { return t('mDesc_' + v + (v === 'zielweit' && (P.wertung === 'schnitt' || P.wertung === 'bonus') ? '_' + P.wertung : ''), v === 'zielweit' ? fz(P.ziel.toFixed(2)) : fz(P.ziel || P.sek || ''), P.pfeile, P.pfeilSek, P.verfallPunkte === undefined ? 10 : P.verfallPunkte); }
function laufSpiel(box, v, seed, P, onEnde) {
  if (box._stop) box._stop();
  const W = 360, HUDH = 38, SH = 262, H = HUDH + SH, dpr = Math.min(3, window.devicePixelRatio || 1), cv = document.createElement('canvas');
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.className = 'mcv'; cv.style.aspectRatio = W + ' / ' + H;
  const mk = (cls, txt) => { const d = document.createElement('div'); d.className = cls; if (txt) d.textContent = txt; return d; };
  const hu = v === 'huerden', wrap = mk('lauf'), pl = mk('lseite lk'), pr = mk('lseite rk tipp');   // pl = links, pr = rechts
  let reg = null, knob = null;
  if (hu) { reg = mk('reg'); knob = document.createElement('i'); reg.append(knob); }   // Regler zum Ausweichen
  wrap.append(pl, cv, pr); [pl, cv, pr].forEach(zoomSperre);
  box.replaceChildren(wrap);
  const kt = box.closest('.karte'); if (kt) kt.classList.add('breit');
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const hind = hu ? hindernisse(seed) : [], vmax = P.vmax || 2.4, limit = (P.limit || 30) * 1000, minInt = P.minInt || 80;
  const F = 11, KE = 0.18, ZM = F * (1 / KE - 1), YH = 76, YR = SH - 34, KX = W * 0.4, START = 3000, tS = performance.now(), ev = [];   // F = Kameraabstand in m, YH = Horizont, YR = Fußlinie des Läufers
  const bg = document.createElement('canvas'); bg.width = cv.width; bg.height = Math.round(SH * dpr);   // statischer Hintergrund, einmal gezeichnet
  { const b = bg.getContext('2d'); b.setTransform(dpr, 0, 0, dpr, 0, 0);
    const himmel = b.createLinearGradient(0, 0, 0, YH); himmel.addColorStop(0, '#8ec9f5'); himmel.addColorStop(1, '#e3f2ff'); b.fillStyle = himmel; b.fillRect(0, 0, W, YH + 1);
    b.fillStyle = '#4a5568'; b.fillRect(0, YH - 30, W, 30);   // Tribüne mit Publikum
    const pal = ['#d62839', '#1d4ed8', '#ffd23f', '#fff', '#2f6f3e', '#f2c9a0'];
    for (let i = 0; i < 72; i++) for (let j = 0; j < 4; j++) { b.fillStyle = pal[(i * 7 + j * 3) % 6]; b.fillRect(i * 5 + (j % 2) * 2.5, YH - 28 + j * 7, 3, 3); }
    const gras = b.createLinearGradient(0, YH, 0, SH); gras.addColorStop(0, '#6fb77c'); gras.addColorStop(1, '#3f8a50'); b.fillStyle = gras; b.fillRect(0, YH, W, SH - YH); }
  let ende = false, fin = 0, shown = 0, rx = 0, tx = 0, tz = 0, rt = 0, lastS = -1e9, lastX = 0, lastTap = -1e9, prev = tS, lenkId = -1, rs = 0, rot = false, gelb = false, sim = laufSim(v, seed, P, ev, 0);
  let links = false, gesperrt = false, swapBtn = null; try { links = localStorage.getItem('lt') === '1'; } catch (x) {}
  const belegen = () => {   // Standard: Lauftaste rechts. Sprint/Zielzeit: die andere Seite ist leer bis auf den Seitenwechsel, Hindernislauf: dort sitzt der Regler. Wechsel für Linkshänder.
    const an = links ? pl : pr, aus = links ? pr : pl, b = mk('wechsel', '⇄ ' + t('mSeite'));
    swapBtn = b;
    an.className = 'lseite ' + (links ? 'lk' : 'rk') + ' tipp'; aus.className = 'lseite ' + (links ? 'rk' : 'lk') + (hu ? '' : ' aus');
    an.replaceChildren(t(hu ? 'mLaufen' : 'mTippen'));
    b.onpointerdown = e => {
      e.preventDefault(); e.stopPropagation();
      if (gesperrt) return;   // ab "Los!" nicht mehr wechseln
      links = !links; try { localStorage.setItem('lt', links ? '1' : '0'); } catch (y) {}
      belegen();
    };
    if (hu) aus.replaceChildren(mk('', t('mAusweichen')), reg, b); else aus.replaceChildren(b);
  };
  belegen();
  box._stop = () => { ende = true; };
  const kz = z => F / (F + Math.max(z, -4)), Y = k => YH + (YR - YH) * k, X = (wx, k) => W / 2 + wx * KX * k;   // Perspektive: Tiefe -> Maßstab, Zeile, Spalte
  const kreis = (x, y, r, fill, line, lw) => {
    g.beginPath(); g.arc(x, y, Math.max(0, r), 0, 6.2832);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (line) { g.strokeStyle = line; g.lineWidth = lw || 1.5; g.stroke(); }
  };
  const rr = (x, y, w, h, r, fill) => { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fillStyle = fill; g.fill(); };
  const band = (k1, k2, a, b) => { g.beginPath(); g.moveTo(X(a, k1), Y(k1)); g.lineTo(X(b, k1), Y(k1)); g.lineTo(X(b, k2), Y(k2)); g.lineTo(X(a, k2), Y(k2)); g.closePath(); };
  const LENK_TOT = 0.06, LENK_TAU = 0.2;   // Hysterese: Reglerbewegungen unter LENK_TOT (Anteil der Bahnbreite) werden ignoriert, der Läufer folgt dem Ziel weich (Zeitkonstante LENK_TAU in s; größer = träger)
  const lenk = ms => { const dt = Math.max(0, ms - rt) / 1000, dx = vmax * dt; rt = ms; if (Math.abs(tx - tz) > LENK_TOT) tz = tx; rx += Math.max(-dx, Math.min(dx, (tz - rx) * (1 - Math.exp(-dt / LENK_TAU)))); };   // Läufer folgt dem Regler weich und mit begrenztem Tempo
  const probe = (ms, force) => {   // Querposition aufzeichnen (alle 50 ms bei Bewegung, bei jedem Tipp)
    lenk(ms);
    if (hu && (force || (ms - lastS >= 50 && rx !== lastX))) { ev.push([Math.round(ms), +rx.toFixed(3), 0]); lastS = ms; lastX = rx; }
  };
  function laeufer(px, y, ph, farbe, stolpert) {   // Rückansicht mit schwingenden Armen und Beinen
    const s = Math.sin(ph);
    g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(px, y + 2, 17, 6, 0, 0, 6.2832); g.fill();
    g.lineCap = 'round'; g.strokeStyle = '#2b2f3a'; g.lineWidth = 7;
    [[-6, s], [6, -s]].forEach(l => { g.beginPath(); g.moveTo(px + l[0], y - 26); g.lineTo(px + l[0] * 1.2, y - Math.max(0, l[1]) * 10); g.stroke(); });
    rr(px - 12, y - 35, 24, 12, 5, '#2b2f3a');
    rr(px - 12, y - 58, 24, 26, 8, stolpert ? '#ffd23f' : farbe);
    g.strokeStyle = '#f2c9a0'; g.lineWidth = 5;
    [[-1, s], [1, -s]].forEach(a => { g.beginPath(); g.moveTo(px + a[0] * 12, y - 53); g.lineTo(px + a[0] * 17, y - 40 + a[1] * 8); g.stroke(); });
    kreis(px, y - 66, 8, '#f2c9a0', '#17202a', 1.5);
    g.fillStyle = '#3b2a1e'; g.beginPath(); g.arc(px, y - 67, 8.4, 3.14159, 6.2832); g.fill();
    g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(px - 5, y - 52, 10, 7);   // Startnummer
    g.lineCap = 'butt';
  }
  function huerde(z, h, getroffen) {
    g.globalAlpha = Math.max(0, Math.min(1, (ZM - z) / 6));   // am fernen Bahnende weich einblenden
    const k = kz(z), y = Y(k), hx = X(h.x, k), hw = h.w * KX * k, ht = 26 * k, bh = 9 * k + 1;
    g.strokeStyle = '#17202a'; g.lineWidth = 4 * k + 1;
    g.beginPath(); g.moveTo(hx - hw, y); g.lineTo(hx - hw, y - ht); g.moveTo(hx + hw, y); g.lineTo(hx + hw, y - ht); g.stroke();
    const st = Math.max(6, 14 * k);
    for (let s = 0, i = 0; s < 2 * hw; s += st, i++) { g.fillStyle = getroffen ? '#9aa0a8' : (i % 2 ? '#d62839' : '#fff'); g.fillRect(hx - hw + s, y - ht, Math.min(st, 2 * hw - s), bh); }
    g.strokeStyle = '#17202a'; g.lineWidth = 1.5; g.strokeRect(hx - hw, y - ht, 2 * hw, bh);
    g.globalAlpha = 1;
  }
  function ziel(z) {   // Ziellinie als Zielstreifen (kein Banner, kein Torbogen)
    g.globalAlpha = Math.max(0, Math.min(1, (ZM - z) / 6));
    const k = kz(z), ks = [k, kz(z + 0.75), kz(z + 1.5)];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 16; c++) { g.fillStyle = (c + r) % 2 ? '#17202a' : '#fff'; band(ks[r], ks[r + 1], -1.1 + c * 2.2 / 16, -1.1 + (c + 1) * 2.2 / 16); g.fill(); }
    g.globalAlpha = 1;
  }
  const zeichne = (ms, now) => {
    const el = fin ? sim.zeit : Math.max(0, ms), team = document.body.classList.contains('blau') ? '#1d4ed8' : '#d62839';
    g.fillStyle = '#17202a'; g.fillRect(0, 0, W, HUDH);   // Kopfleiste: Zeit links, Strecke rechts, Zielzeit in der Mitte
    g.font = 'bold 17px system-ui, sans-serif'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
    g.textAlign = 'left'; g.fillText(t('mZeit') + ': ' + fz((el / 1000).toFixed(2)) + ' s', 10, HUDH / 2 - 2);
    g.textAlign = 'right'; g.fillText((fin ? 100 : Math.min(99, Math.floor(shown))) + ' m', W - 10, HUDH / 2 - 2);
    if (v === 'zielzeit') { g.textAlign = 'center'; g.fillStyle = '#ffd23f'; g.fillText(t('mZiel', fz(P.ziel) + ' s'), W / 2 + 20, HUDH / 2 - 2); }
    g.fillStyle = '#ffd23f'; g.fillRect(0, HUDH - 5, W * Math.min(1, shown / 100), 5);
    g.save(); g.translate(0, HUDH); g.beginPath(); g.rect(0, 0, W, SH); g.clip();
    g.drawImage(bg, 0, 0, W, SH);   // Himmel, Tribüne und Wiese (einmal vorgerendert)
    const kb = (SH - YH) / (YR - YH);   // Bahn als Trapez bis zum unteren Rand
    g.fillStyle = '#b8472c'; g.beginPath(); g.moveTo(X(-1.1, KE), Y(KE)); g.lineTo(X(1.1, KE), Y(KE)); g.lineTo(X(1.1, kb), SH); g.lineTo(X(-1.1, kb), SH); g.closePath(); g.fill();   // Bahn endet vorn am fernen Rand als Trapez
    for (let m = Math.max(-10, Math.floor((shown - 4) / 5) * 5); m < Math.min(110, shown + ZM); m += 5) {   // Streifen alle 5 m geben das Tempogefühl
      if (Math.abs((m / 5) % 2) !== 1 || m + 5 - shown < -4) continue;
      band(kz(m - shown), kz(Math.min(m + 5 - shown, ZM)), -1.1, 1.1); g.fillStyle = 'rgba(0,0,0,.1)'; g.fill();
    }
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(-1.1, KE), Y(KE)); g.lineTo(X(-1.1, kb), SH); g.moveTo(X(1.1, KE), Y(KE)); g.lineTo(X(1.1, kb), SH); g.stroke();
    for (let m = 0; m < 100; m += 10) {   // Streckenmarken alle 10 m
      const z = m - shown;
      const la = Math.max(0, Math.min(1, (ZM - z) / 30));   // Linien in der Ferne ausblenden: bis 20 m voll, am Bahnende weg
      if (z < -3 || la <= 0) continue;
      const k = kz(z), y = Y(k);
      g.globalAlpha = la; g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = Math.max(1, 2 * k); g.beginPath(); g.moveTo(X(-1.1, k), y); g.lineTo(X(1.1, k), y); g.stroke(); g.globalAlpha = 1;
      const al = Math.max(0, Math.min(1, (18 - z) / 8, (z + 3) / 2));   // Meterzahlen nur in der Nähe des Läufers: ab 18 m Abstand einblenden, ab 10 m voll sichtbar
      if (al <= 0) continue;
      g.globalAlpha = al; g.fillStyle = '#fff'; g.font = 'bold ' + Math.max(11, Math.round(15 * k)) + 'px system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      g.fillText(m === 0 ? 'START' : m + ' m', X(-1.1, k) + 6, y - 4); g.globalAlpha = 1;
    }
    const zz = 100 - shown;
    if (zz >= 0 && zz < ZM) ziel(zz);
    const sicht = hind.map(h => ({h: h, z: h.d - shown})).filter(o => o.z > -1.5 && o.z < ZM).sort((a, b) => b.z - a.z);
    sicht.filter(o => o.z >= 0).forEach(o => huerde(o.z, o.h, sim.hits.some(k => k.d === o.h.d)));
    for (let i = 0; i < 4; i++) { const sy = Math.round(Y(KE)) + i * 3; g.globalAlpha = 0.9 - i * 0.22; g.drawImage(bg, 0, sy * dpr, bg.width, 3 * dpr, 0, sy, W, 3); }   // Bahn läuft am fernen Ende weich in die Wiese aus
    g.globalAlpha = 1;
    const stolpert = ms >= 0 && ms < sim.sEnd, px = X(rx, 1) + (stolpert ? Math.sin(ms * 0.05) * 2 : 0);
    if (zz < 0) ziel(zz);
    laeufer(px, YR, ms > 0 ? shown * 2.5 : 0, team, stolpert);
    sicht.filter(o => o.z < 0).forEach(o => huerde(o.z, o.h, sim.hits.some(k => k.d === o.h.d)));
    g.font = 'bold 22px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    sim.hits.forEach(h => { const a = (ms - h.t) / 800; if (a >= 0 && a < 1) { g.globalAlpha = 1 - a; g.fillStyle = '#d62839'; g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeText(t('mAua'), px, YR - 84 - a * 40); g.fillText(t('mAua'), px, YR - 84 - a * 40); } });
    g.globalAlpha = 1;
    const bx = Math.max(4, Math.min(W - 18, links ? px - 56 : px + 44)), ty = YR - 92, th = 64, farbe = rot ? '#d62839' : gelb ? '#ffd23f' : '#2fbf5f';   // Tempoleiste transparent neben dem Läufer (wie beim Weitsprung), auf der Seite der Lauftaste; rot = über dem Optimum, gelb = unregelmäßig, sonst grün
    g.globalAlpha = 0.5;
    rr(bx - 2, ty - 2, 16, th + 4, 8, 'rgba(23,32,42,.6)'); rr(bx, ty, 12, th, 6, '#556270');
    const BM = 1.4, yv = x => ty + th * (1 - Math.min(1, x / BM));   // Skala: 0 bis 140 % des Optimums
    g.fillStyle = 'rgba(214,40,57,.6)'; g.fillRect(bx, ty + 3, 12, yv(1.2) - ty - 3);   // roter Bereich: deutlich über dem Optimum (ab 120 %)
    const bh = Math.max(6, th * Math.min(1, rs / BM)); rr(bx, ty + th - bh, 12, bh, 6, farbe);
    g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(bx - 3, yv(1.12), 18, yv(0.9) - yv(1.12));   // Idealbereich (90 bis 112 %): hier lässt sich stabil im Rhythmus "tanzen"
    g.globalAlpha = 1;
    const gross = ms < 0 ? String(Math.ceil(-ms / 1000)) : fin ? t('mZielDa') : ms < 700 ? t('mLos') : '';
    if (gross) {
      g.font = 'bold ' + (gross.length > 2 ? 30 : 52) + 'px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = '#17202a'; g.fillStyle = '#ffd23f';   // Countdown, "Los!" und "Ziel!": klein, im oberen Teil der Szene
      g.strokeText(gross, W / 2, 96); g.fillText(gross, W / 2, 96);
    }
    g.restore();
  };
  const beenden = () => { if (ende) return; ende = true; zeichne(Math.min(limit, performance.now() - tS - START), performance.now()); onEnde(ev); };
  function frame() {
    if (ende) return;
    const now = performance.now(), ms = now - tS - START, dt = Math.min(0.1, (now - prev) / 1000); prev = now;
    if (kdir && !fin) tx = Math.max(-1, Math.min(1, tx + kdir * KEY_LENK * dt));   // Lenktasten bewegen den Regler
    if (ms >= 0 && !gesperrt) {   // ab "Los!": Seitenwechsel sperren und Knopf unsichtbar und berührungslos machen, damit er keine Touch-Eingaben des Reglers schluckt
      gesperrt = true;
      if (swapBtn) { swapBtn.style.visibility = 'hidden'; swapBtn.style.pointerEvents = 'none'; }
    }
    if (ms >= 0 && !fin) {
      probe(ms); sim = laufSim(v, seed, P, ev, ms);
      if (sim.zeit !== null) fin = now; else if (ms >= limit) return beenden();
      const gp = sim.gap ? Math.max(sim.gap, ms - sim.last) : 0, ziel = (gp > 0 ? sim.g0 / gp : 0) * Math.min(1, sim.n / 5);   // Tipptempo, wächst mit den ersten Schritten (Start aus dem Stand)
      rs += (ziel - rs) * Math.min(1, dt * (ziel > rs ? 2.5 : 5));   // träge nachführen: steigt langsam, fällt etwas schneller
      if (!rot && rs > 1.2) rot = true; else if (rot && rs < 1.12) rot = false;   // rot erst deutlich über dem Idealbereich; Hysterese gegen Flackern
      if (!gelb && sim.rhy < 0.86) gelb = true; else if (gelb && sim.rhy > 0.92) gelb = false;
    }
    if (ms >= 0) shown = Math.max(shown, Math.min(100, sim.dist));   // die Simulation läuft zeitkontinuierlich, die Strecke kann direkt angezeigt werden
    if (knob) knob.style.left = (50 + tx * 50) + '%';
    zeichne(ms, now);
    if (fin && now - fin > 1100) return beenden();
    requestAnimationFrame(frame);
  }
  const tipp = (zone, e) => {
    if (ende || fin) return;
    e.preventDefault();
    const ms = performance.now() - tS - START;
    if (ms < 0) return;
    const t0 = Math.round(ms);
    if (t0 - lastTap < minInt) return;
    lastTap = t0; probe(ms, true); ev.push(t0);
    zone.classList.add('druck'); setTimeout(() => zone.classList.remove('druck'), 90);
  };
  const lauftaste = () => links ? pl : pr;   // diese Seite ist die Lauftaste, bei der anderen liegt (Hindernislauf) der Regler
  const rg = e => { const r = reg.getBoundingClientRect(); return Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)); };
  [pl, pr].forEach(p => {
    p.onpointerdown = e => {
      if (p === lauftaste()) return tipp(p, e);
      if (!hu || ende || fin) return;   // Regler: Ein-Finger-Schieben, die ganze Fläche reagiert
      e.preventDefault(); lenkId = e.pointerId; try { p.setPointerCapture(e.pointerId); } catch (x) {}
      tx = rg(e); const ms = performance.now() - tS - START; if (ms >= 0) probe(ms, true);
    };
    p.onpointermove = e => { if (hu && e.pointerId === lenkId) tx = rg(e); };
    p.onpointerup = p.onpointercancel = e => { if (e.pointerId === lenkId) lenkId = -1; };
  });
  let kdir = 0;   // Lenkrichtung per Tastatur (Hindernislauf)
  tastenBindung(() => !ende, () => tipp(lauftaste(), {preventDefault() {}}), null, hu ? d => { kdir = d; } : null);
  frame();
}

// ---- Weitsprung (nur Browser): echte 3D-Kamera schräg hinter dem Läufer, Anlauf mit Kontrollpunkten, langes Drücken am Balken startet den Absprung und lässt den Winkel von 0 bis 60 Grad wachsen ----
const WEIT = ['weit', 'zielweit'];
function weitSpiel(box, v, seed, P, onEnde) {
  if (box._stop) box._stop();
  const W = 360, HUDH = 38, SH = 262, H = HUDH + SH, dpr = Math.min(3, window.devicePixelRatio || 1), cv = document.createElement('canvas');
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.className = 'mcv'; cv.style.aspectRatio = W + ' / ' + H;
  const mk = (cls, txt) => { const d = document.createElement('div'); d.className = cls; if (txt) d.textContent = txt; return d; };
  const wrap = mk('lauf'), pl = mk('lseite lk'), pr = mk('lseite rk tipp'), lab = mk('', t('mTippen'));
  wrap.append(pl, cv, pr); [pl, cv, pr].forEach(zoomSperre);
  box.replaceChildren(wrap);
  const kt = box.closest('.karte'); if (kt) kt.classList.add('breit');
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const CP = WEIT_CP, BA = 50, HOLD = 1600, FLUG = 1100, TOPT = P.optWinkel || 22, VREF = P.vref || 10.5, ZONE = CP[CP.length - 1] + 1.8, START = 3000, RW = 0.9, PL = 20, PB = 1.85;   // Meter und Millisekunden, wie in weitSim; RW = halbe Anlaufbreite, PL = Länge der Grube, PB = halbe Breite der Grube (Sand)
  const CM = {DB: 6.5, DL: 3.4, DH: 3.6, AX: 6, AL: 0.4, AH: 0.3, FOC: 350, CX0: 205.4, CY0: 134.8}, FOC = CM.FOC, NEAR = 0.5, tS = performance.now(), ev = [];   // Kamera: 6,5 m hinter und 3,4 m rechts vom Läufer, 3,6 m hoch, blickt leicht nach vorn links
  let Cp = [0, 0, 0], Fv = [1, 0, 0], Rv = [0, -1, 0], Uv = [0, 0, 1];
  const setCam = cx => {   // Blickrichtung f, rechts r, oben u (x = Laufrichtung, y = nach links, z = oben)
    Cp = [cx - CM.DB, -CM.DL, CM.DH]; const T = [cx + CM.AX, -CM.AL, CM.AH];
    let f = [T[0] - Cp[0], T[1] - Cp[1], T[2] - Cp[2]]; const n = Math.hypot(f[0], f[1], f[2]); f = [f[0] / n, f[1] / n, f[2] / n];
    const m = Math.hypot(f[1], f[0]), r = [f[1] / m, -f[0] / m, 0];
    Fv = f; Rv = r; Uv = [r[1] * f[2], -r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  };
  const cs = (x, y, z) => { const a = x - Cp[0], b = y - Cp[1], c = z - Cp[2]; return [a * Rv[0] + b * Rv[1] + c * Rv[2], a * Uv[0] + b * Uv[1] + c * Uv[2], a * Fv[0] + b * Fv[1] + c * Fv[2]]; };   // Kameraraum: rechts, oben, Tiefe
  const sc = c => [CM.CX0 + FOC * c[0] / c[2], CM.CY0 - FOC * c[1] / c[2]];
  setCam(0);
  const fh = Math.hypot(Fv[0], Fv[1]), HZ = sc(cs(Cp[0] + Fv[0] / fh * 1e5, Cp[1] + Fv[1] / fh * 1e5, 0))[1];   // Horizont: Bildzeile ganz ferner Bodenpunkte
  const bg = document.createElement('canvas'); bg.width = cv.width; bg.height = Math.round(SH * dpr);   // statischer Hintergrund: Himmel, Stadionrang, Boden
  { const b = bg.getContext('2d'); b.setTransform(dpr, 0, 0, dpr, 0, 0);
    const himmel = b.createLinearGradient(0, 0, 0, HZ); himmel.addColorStop(0, '#8ec9f5'); himmel.addColorStop(1, '#e3f2ff'); b.fillStyle = himmel; b.fillRect(0, 0, W, HZ + 1);
    b.fillStyle = '#4a5568'; b.fillRect(0, HZ - 30, W, 30);
    const pal = ['#d62839', '#1d4ed8', '#ffd23f', '#fff', '#2f6f3e', '#f2c9a0'];
    for (let i = 0; i < 90; i++) for (let j = 0; j < 4; j++) { b.fillStyle = pal[(i * 7 + j * 3) % 6]; b.fillRect(i * 4 + (j % 2) * 2, HZ - 28 + j * 6, 2.5, 2.5); }
    const boden = b.createLinearGradient(0, HZ, 0, SH); boden.addColorStop(0, '#b9654f'); boden.addColorStop(1, '#9a4130'); b.fillStyle = boden; b.fillRect(0, HZ, W, SH - HZ);
    b.fillStyle = '#eceff1'; b.fillRect(0, HZ - 3, W, 3); b.fillStyle = '#d62839'; for (let i = 0; i < W; i += 24) b.fillRect(i, HZ - 3, 10, 3); }   // Bande am Rand des Stadions
  let ende = false, links = false, gesperrt = false, swapBtn = null, CUR = null, downId = -1, lastD = -1e9, labT = '';
  const effekte = [], gez = {};
  try { links = localStorage.getItem('lt') === '1'; } catch (x) {}
  const belegen = () => {   // Standard: eine große Taste rechts, Seitenwechsel für Linkshänder
    const an = links ? pl : pr, aus = links ? pr : pl, b = mk('wechsel', '⇄ ' + t('mSeite'));
    swapBtn = b; labT = '';
    an.className = 'lseite ' + (links ? 'lk' : 'rk') + ' tipp'; aus.className = 'lseite ' + (links ? 'rk' : 'lk') + ' aus';
    an.replaceChildren(lab);
    b.onpointerdown = e => {
      e.preventDefault(); e.stopPropagation();
      if (gesperrt) return;
      links = !links; try { localStorage.setItem('lt', links ? '1' : '0'); } catch (y) {}
      belegen();
    };
    aus.replaceChildren(b);
  };
  belegen();
  box._stop = () => { ende = true; };
  const fz2 = x => fz(x.toFixed(2));
  const kreis = (x, y, r, fill, line, lw) => {
    g.beginPath(); g.arc(x, y, Math.max(0, r), 0, 6.2832);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (line) { g.strokeStyle = line; g.lineWidth = lw || 1.5; g.stroke(); }
  };
  const rr = (x, y, w, h, r, fill) => { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fillStyle = fill; g.fill(); };
  const poly = (pts, fill, line, lw) => {   // Vieleck im Raum zeichnen, an der Nahebene der Kamera zugeschnitten
    const c = pts.map(p => cs(p[0], p[1], p[2])), o = [];
    for (let i = 0; i < c.length; i++) {
      const a = c[i], b = c[(i + 1) % c.length], ia = a[2] >= NEAR, ib = b[2] >= NEAR;
      if (ia) o.push(a);
      if (ia !== ib) { const q = (NEAR - a[2]) / (b[2] - a[2]); o.push([a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q, NEAR]); }
    }
    if (o.length < 3) return;
    g.beginPath(); o.forEach((p, i) => { const s = sc(p); if (i) g.lineTo(s[0], s[1]); else g.moveTo(s[0], s[1]); }); g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (line) { g.strokeStyle = line; g.lineWidth = lw || 1; g.stroke(); }
  };
  const flach = (x0, x1, y0, y1, fill, line, lw) => poly([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], fill, line, lw);
  const quader = (x0, x1, y0, y1, h, top, rueck, seite) => {   // sichtbar sind Oberseite, Rückseite und die Seite zur Kamera
    poly([[x0, y0, h], [x1, y0, h], [x1, y1, h], [x0, y1, h]], top);
    poly([[x0, y0, 0], [x0, y1, 0], [x0, y1, h], [x0, y0, h]], rueck);
    poly([[x0, y0, 0], [x1, y0, 0], [x1, y0, h], [x0, y0, h]], seite);
  };
  const FARBE = ['#2fbf5f', '#9fd23f', '#f59f00', '#d62839'];
  function kegel(x, y) {
    const c = cs(x, y, 0); if (c[2] < NEAR) return;
    const s = FOC / c[2], p = sc(c), h = 0.5 * s, w = 0.17 * s, hw = q => w + (w * 0.25 - w) * q;
    g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(p[0], p[1], w * 1.4, w * 0.5, 0, 0, 6.2832); g.fill();
    g.fillStyle = '#ff8a1f'; g.beginPath(); g.moveTo(p[0] - w, p[1]); g.lineTo(p[0] + w, p[1]); g.lineTo(p[0] + hw(1), p[1] - h); g.lineTo(p[0] - hw(1), p[1] - h); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(p[0] - hw(0.35), p[1] - h * 0.35); g.lineTo(p[0] + hw(0.35), p[1] - h * 0.35); g.lineTo(p[0] + hw(0.6), p[1] - h * 0.6); g.lineTo(p[0] - hw(0.6), p[1] - h * 0.6); g.closePath(); g.fill();
  }
  function sportler(px, y, ph, farbe, pose, rot, SC) {   // Rückansicht; pose 0 laufen, 1 Absprunghocke, 2 Flug, 3 Landung
    const s = Math.sin(ph), hk = pose === 1 || pose === 3, fl = pose === 2, oy = hk ? 10 : 0;
    g.save(); g.translate(px, y); g.scale(SC, SC); if (rot) g.rotate(rot);
    g.lineCap = 'round'; g.strokeStyle = '#2b2f3a'; g.lineWidth = 7;
    [[-6, s], [6, -s]].forEach(l => {
      g.beginPath(); g.moveTo(l[0], -26 + oy);
      if (fl) g.lineTo(l[0] * 1.3, -14); else if (hk) { g.lineTo(l[0] * 2, -12); g.lineTo(l[0] * 1.3, 0); } else g.lineTo(l[0] * 1.2, -Math.max(0, l[1]) * 10);
      g.stroke();
    });
    rr(-12, -35 + oy, 24, 12, 5, '#2b2f3a');
    rr(-12, -58 + oy, 24, 26, 8, farbe);
    g.strokeStyle = '#f2c9a0'; g.lineWidth = 5;
    [-1, 1].forEach(a => { g.beginPath(); g.moveTo(a * 12, -53 + oy); g.lineTo(a * 17, fl ? -72 + oy : hk ? -34 + oy : -40 + (a < 0 ? s : -s) * 8 + oy); g.stroke(); });
    kreis(0, -66 + oy, 8, '#f2c9a0', '#17202a', 1.5);
    g.fillStyle = '#3b2a1e'; g.beginPath(); g.arc(0, -67 + oy, 8.4, 3.14159, 6.2832); g.fill();
    g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(-5, -52 + oy, 10, 7);
    g.lineCap = 'butt'; g.restore();
  }
  function faecher(x0, y0, th) {   // Winkelanzeige als Fächer: Farbverlauf von Rot über Grün nach Rot, Grün = idealer Winkel, der Zeiger wächst mit dem Drücken
    const R = 50, a = d => -d * Math.PI / 180, ok = Math.abs(th - TOPT) <= 4;
    g.fillStyle = 'rgba(23,32,42,.45)'; g.beginPath(); g.moveTo(x0, y0); g.arc(x0, y0, R + 5, a(64), a(-4)); g.closePath(); g.fill();
    for (let d = 0; d < 60; d++) {
      const dv = Math.abs(d + 0.5 - TOPT);
      g.fillStyle = 'hsl(' + Math.round(Math.max(0, Math.min(120, 120 - Math.max(0, dv - 3) * 7))) + ',80%,46%)';
      g.beginPath(); g.moveTo(x0, y0); g.arc(x0, y0, R, a(d + 1.05), a(d)); g.closePath(); g.fill();
    }
    g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + R, y0); g.lineTo(x0, y0); g.lineTo(x0 + Math.cos(a(60)) * R, y0 + Math.sin(a(60)) * R); g.arc(x0, y0, R, a(60), a(0)); g.stroke();
    g.lineCap = 'round'; g.strokeStyle = '#17202a'; g.lineWidth = 7; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + Math.cos(a(th)) * (R + 6), y0 + Math.sin(a(th)) * (R + 6)); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 3.5; g.stroke(); g.lineCap = 'butt';
    kreis(x0, y0, 5, '#17202a'); g.font = 'bold 18px system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = '#17202a';
    g.strokeText(Math.round(th) + '°', x0 - 22, y0 + 18); g.fillStyle = ok ? '#7dffa0' : '#fff'; g.fillText(Math.round(th) + '°', x0 - 22, y0 + 18);
  }
  function zeichne(ms, J, sp) {
    const dx = J.land - J.xp, thr = J.theta * Math.PI / 180, apex = Math.min(2.2, dx * Math.tan(thr) / 4);
    let ax = J.x, lift = 0, pose = 0, u = 0, th = 0;
    if (J.ph === 1) { ax = J.xp; pose = 1; th = Math.min(60, 60 * (ms - J.tp) / HOLD); }
    else if (J.ph === 2) { u = Math.max(0, Math.min(1, (ms - J.rt) / FLUG)); ax = J.xp + dx * u; lift = 4 * apex * u * (1 - u) * 1.3; pose = u < 1 ? 2 : ms - J.rt - FLUG < WEIT_STEH ? 3 : 0; }   // nach der Landung erst Hocke, nach WEIT_STEH wieder aufrecht
    setCam(ax);
    const team = document.body.classList.contains('blau') ? '#1d4ed8' : '#d62839';
    g.fillStyle = '#17202a'; g.fillRect(0, 0, W, HUDH);   // Kopfleiste: die drei Sprünge links (aktuell beste Weite gelb und fett), rechts Sprungzähler bzw. Zielweite
    const fertig = j => j.ph === 2 && ms >= j.rt + FLUG;
    let best = -1;
    sp.forEach((j, i) => { if (fertig(j) && !j.foul && (best < 0 || (v === 'zielweit' ? Math.abs(j.weite - P.ziel) < Math.abs(sp[best].weite - P.ziel) : j.weite > sp[best].weite))) best = i; });
    g.textBaseline = 'middle'; g.textAlign = 'left';
    let hx = 8;
    [0, 1, 2].forEach(i => {
      const j = sp[i], txt = (i + 1) + ': ' + (j && fertig(j) ? (j.foul ? '✗' : fz2(j.weite)) : '–');
      g.font = (i === best ? 'bold ' : '') + '15px system-ui, sans-serif';
      const tw = g.measureText(txt).width;
      if (i === best) { rr(hx - 4, 6, tw + 8, 22, 6, '#ffd23f'); g.fillStyle = '#17202a'; } else g.fillStyle = '#fff';
      g.fillText(txt, hx, HUDH / 2 - 3); hx += tw + 14;
    });
    g.font = 'bold 15px system-ui, sans-serif'; g.textAlign = 'right'; g.fillStyle = v === 'zielweit' ? '#ffd23f' : '#fff';
    g.fillText(v === 'zielweit' ? t('mZiel', fz2(P.ziel)) : t('mSprung') + ' ' + (sp.indexOf(J) + 1) + '/3', W - 10, HUDH / 2 - 3);
    g.fillStyle = '#ffd23f'; g.fillRect(0, HUDH - 5, W * Math.max(0, Math.min(1, ax / BA)), 5);
    g.save(); g.translate(0, HUDH); g.beginPath(); g.rect(0, 0, W, SH); g.clip();
    g.drawImage(bg, 0, 0, W, SH);
    // Anlaufbahn: nur weiße Linien auf dem durchgehenden Tartanboden
    for (let m = Math.max(-12, Math.floor((ax - 10) / 2) * 2); m < Math.min(BA, ax + 60); m += 2) if (((m / 2) % 2 + 2) % 2 === 1) flach(m, Math.min(m + 2, BA), -RW, RW, 'rgba(0,0,0,.07)');
    flach(-12, BA, -RW - 0.05, -RW + 0.05, '#fff'); flach(-12, BA, RW - 0.05, RW + 0.05, '#fff'); flach(0, 0.12, -RW, RW, 'rgba(255,255,255,.85)');
    flach(ZONE, BA, -RW, RW, 'rgba(47,191,95,' + (0.2 + 0.07 * Math.sin(ms / 150)) + ')');   // Absprungzone vor dem Balken
    CP.forEach((c, i) => {   // Kontrollpunkte: schmale, helle Markierung, nach dem Tipp farbig nach Güte
      const q = J.q[i]; if (c + 0.5 < ax - 5) return;
      if (q < 0) flach(c, c + 0.5, -RW, RW, 'rgba(255,233,160,' + (0.45 + (Math.abs(c - ax) < 3 ? 0.25 + 0.2 * Math.sin(ms / 70) : 0)) + ')');
      else { g.globalAlpha = 0.7; flach(c, c + 0.5, -RW, RW, FARBE[q > 0.66 ? 0 : q > 0.25 ? 1 : q > 0 ? 2 : 3]); g.globalAlpha = 1; }
    });
    flach(BA - 0.7, BA, -RW, RW, '#f4f4f4', '#17202a', 1.5); flach(BA - 0.12, BA, -RW, RW, '#2f6fe0');   // Absprungbalken, vorn der blaue Streifen als Übertrittskante
    [[RW + 0.12, RW + 0.5], [-RW - 0.5, -RW - 0.12]].forEach(s => quader(BA - 0.05, BA + 0.3, s[0], s[1], 0.4, '#fff', '#2f5fc4', '#3d70dd'));
    flach(BA, BA + PL + 0.4, -PB - 0.3, PB + 0.3, '#6b4a3a'); flach(BA + 0.1, BA + PL, -PB, PB, '#e8d39b');   // Sandgrube mit Rand
    poly([[BA, PB + 0.33, 0], [BA + PL, PB + 0.33, 0], [BA + PL, PB + 0.33, 0.42], [BA, PB + 0.33, 0.42]], '#2a62c9', '#fff', 1);   // Maßband am linken Grubenrand mit großen Zahlen
    for (let m = 1; m <= PL - 1; m++) {
      const c = cs(BA + m, PB + 0.33, 0.21); if (c[2] < NEAR) continue;
      const s = FOC / c[2], px2 = Math.round(0.3 * s); if (px2 < 6 || (px2 < 9 && m % 2)) continue;
      const p = sc(c); g.font = 'bold ' + px2 + 'px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(m, p[0], p[1]);
    }
    if (v === 'zielweit') {   // Zielweite im Sand leicht markiert und am Maßband mit einem gelben Dreieck
      const z0 = BA + P.ziel; flach(z0 - 0.14, z0 + 0.14, -PB, PB, 'rgba(255,196,0,.5)');
      poly([[z0 - 0.2, PB + 0.33, 0.5], [z0 + 0.2, PB + 0.33, 0.5], [z0, PB + 0.33, 0.43]], '#ffd23f', '#17202a', 1);
    }
    sp.forEach(j => {   // Fähnchen an den Landepunkten bisheriger Sprünge, am linken Rand der Grube
      if (j.ph !== 2 || j.foul || ms < j.rt + FLUG) return;
      const x = j.land, a = cs(x, PB, 0), b = cs(x, PB, 1.0); if (a[2] < NEAR || b[2] < NEAR) return;
      const pa = sc(a), pb = sc(b); g.strokeStyle = '#17202a'; g.lineWidth = 2; g.beginPath(); g.moveTo(pa[0], pa[1]); g.lineTo(pb[0], pb[1]); g.stroke();
      poly([[x, PB, 1.0], [x, PB, 0.72], [x, PB - 0.55, 0.86]], '#ffd23f', '#17202a', 1);
    });
    const ca = cs(ax, 0, lift), cg = cs(ax, 0, 0);
    if (cg[2] >= NEAR) for (let i = 0; i < CP.length; i++) { if (CP[i] < ax - 8 || CP[i] > ax + 32) continue; [-RW - 0.5, RW + 0.5].forEach(y => { const c = cs(CP[i], y, 0); if (c[2] >= ca[2]) kegel(CP[i], y); }); }   // Kegel an den Kontrollpunkten, die weiter hinten als der Läufer stehen
    const s = FOC / ca[2], pa = sc(ca), pg = sc(cg), px = pa[0], fy = pa[1];
    g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(pg[0], pg[1], 0.5 * s, 0.17 * s, 0, 0, 6.2832); g.fill();
    sportler(px, fy, J.ph === 0 && ms >= J.t0 ? ax * 2.5 : 0, team, pose, u > 0 && u < 1 ? -0.5 * Math.atan(Math.tan(thr) * (1 - 2 * u)) : 0, 1.8 * s / 76);
    for (let i = 0; i < CP.length; i++) { if (CP[i] < ax - 8 || CP[i] > ax + 32) continue; [-RW - 0.5, RW + 0.5].forEach(y => { const c = cs(CP[i], y, 0); if (c[2] < ca[2]) kegel(CP[i], y); }); }
    if (J.ph === 1) faecher(px + 42, fy - 24, th);
    g.font = 'bold 22px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    effekte.forEach(e => { const a = (ms - e.t) / 800; if (a >= 0 && a < 1) { g.globalAlpha = 1 - a; g.fillStyle = e.c; g.strokeStyle = '#17202a'; g.lineWidth = 4; g.strokeText(e.s, px, fy - 1.8 * s - 12 - a * 36); g.fillText(e.s, px, fy - 1.8 * s - 12 - a * 36); } });
    g.globalAlpha = 1;
    if (J.ph === 0 && ms >= J.t0) {   // Tempoleiste senkrecht neben dem Läufer, die weiße Marke zeigt das Maximum
      const bx = px + 100, bt = fy - 96, bh0 = 64, bh = Math.max(4, bh0 * Math.min(1, J.v / VREF));
      g.globalAlpha = 0.5; rr(bx - 2, bt - 2, 12, bh0 + 4, 6, 'rgba(23,32,42,.6)'); rr(bx, bt, 8, bh0, 4, '#556270'); rr(bx, bt + bh0 - bh, 8, bh, 4, '#2fbf5f'); g.globalAlpha = 1;
    }
    const gross = ms < J.t0 && sp.length === 1 ? String(Math.ceil((J.t0 - ms) / 1000)) : J.ph === 0 && ms >= J.t0 && ms - J.t0 < 700 ? t('mLos') : '';
    if (gross) {   // Countdown und "Los!"
      g.font = 'bold ' + (gross.length > 2 ? 30 : 52) + 'px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 5; g.strokeStyle = '#17202a'; g.fillStyle = '#ffd23f';
      g.strokeText(gross, 125, 92); g.fillText(gross, 125, 92);
    }
    const info = J.foul && J.ph >= 1 && ms >= J.tp ? t('mUebertritt') : J.ph === 2 && ms >= J.rt + FLUG ? fz2(J.weite) : '';   // Ergebnis nach dem Sprung bewusst klein, Übertritt sofort beim Absprung
    if (info) {
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = '#17202a'; g.fillStyle = J.foul ? '#ff6b7a' : '#ffd23f';
      g.font = 'bold 24px system-ui, sans-serif'; g.strokeText(info, 125, 76); g.fillText(info, 125, 76);
      if (J.ph === 2 && !J.foul) { const wt = t('mWinkel') + ' ' + Math.round(J.theta) + '°'; g.font = 'bold 12px system-ui, sans-serif'; g.lineWidth = 3; g.fillStyle = '#fff'; g.strokeText(wt, 125, 98); g.fillText(wt, 125, 98); }
    }
    g.restore();
  }
  function frame() {
    if (ende) return;
    const ms = performance.now() - tS;
    if (ms >= START && !gesperrt) { gesperrt = true; if (swapBtn) { swapBtn.style.visibility = 'hidden'; swapBtn.style.pointerEvents = 'none'; } }
    const sim = weitSim(v, P, ev, ms), sp = sim.sp, cur = sp[sp.length - 1]; CUR = cur;
    sp.forEach((j, k) => j.q.forEach((q, i) => {   // Rückmeldung zu jedem Kontrollpunkt einmal einblenden
      if (q >= 0 && !gez[k + ':' + i]) { gez[k + ':' + i] = 1; effekte.push({t: ms, s: t(q > 0.66 ? 'mPerfekt' : q > 0.25 ? 'mGut' : q > 0 ? 'mKnapp' : 'mVerpasst'), c: FARBE[q > 0.66 ? 0 : q > 0.25 ? 1 : q > 0 ? 2 : 3]}); }
    }));
    const J = ms < cur.t0 && sp.length > 1 ? sp[sp.length - 2] : cur;   // in der Pause zwischen den Sprüngen bleibt das Ergebnis stehen
    const txt = J.ph === 1 || (J.ph === 0 && J.x >= ZONE) ? t('mHalten') : t('mTippen');
    if (txt !== labT) { labT = txt; lab.textContent = txt; }
    zeichne(ms, J, sp);
    if (sim.done && ms >= sp[2].end - 500) { ende = true; return onEnde(ev); }
    requestAnimationFrame(frame);
  }
  const lauftaste = () => links ? pl : pr;
  [pl, pr].forEach(p => {
    p.onpointerdown = e => {
      if (p !== lauftaste() || ende) return;
      e.preventDefault(); try { p.setPointerCapture(e.pointerId); } catch (x) {}
      const ms = performance.now() - tS, tm = Math.round(ms);
      if (!CUR || ms < CUR.t0 || CUR.ph > 1 || tm - lastD < 100) return;
      lastD = tm; downId = e.pointerId; ev.push([tm, 1, 0]); p.classList.add('druck');
    };
    p.onpointerup = p.onpointercancel = e => {
      p.classList.remove('druck');
      if (e.pointerId !== downId) return;
      downId = -1; ev.push([Math.round(performance.now() - tS), 2, 0]);   // Loslassen legt den Winkel fest
    };
  });
  let kTaste = false;   // Taste gedrückt (wie Finger runter)
  const kDown = () => {
    if (ende || downId !== -1 || kTaste) return;
    const ms = performance.now() - tS, tm = Math.round(ms);
    if (!CUR || ms < CUR.t0 || CUR.ph > 1 || tm - lastD < 100) return;
    lastD = tm; kTaste = true; ev.push([tm, 1, 0]); lauftaste().classList.add('druck');
  };
  const kUp = () => { if (!kTaste) return; kTaste = false; lauftaste().classList.remove('druck'); ev.push([Math.round(performance.now() - tS), 2, 0]); };   // Loslassen legt den Winkel fest
  tastenBindung(() => !ende, kDown, kUp, null);
  frame();
}
