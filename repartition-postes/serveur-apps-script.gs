// Serveur de données de « Répartition des postes » (So Caval) — version 3 : verrou contrôlé par le serveur + sauvegardes automatiques
// Mise à jour : coller ce fichier dans l'éditeur Apps Script, Enregistrer, puis
// Déployer > Gérer les déploiements > ✎ Modifier > Version : Nouvelle version > Déployer (l'adresse reste la même).
const ANCIEN = 'https://planning-benevoles-tbho.netlify.app/api/state';
const P = PropertiesService.getScriptProperties();
const TAILLE = 8000;
const VERSION = 3;
const SAUV_MAX = 40, SAUV_MIN = 15; // 40 sauvegardes gardées ; au plus une toutes les 15 min, sauf suppression
const CODE_DEFAUT = '8579';        // code utilisé tant que changerCode() n'a pas été lancé
const ESSAIS_MAX = 5, BLOCAGE_S = 600; // 5 codes faux → verrou du cadenas pendant 10 min

function lire_() {
  const n = +(P.getProperty('n') || 0);
  if (!n) return null;
  let txt = '';
  for (let i = 0; i < n; i++) txt += P.getProperty('p' + i) || '';
  return JSON.parse(txt);
}
function ecrire_(obj) {
  const txt = JSON.stringify(obj), parts = {};
  let n = 0;
  for (let i = 0; i < txt.length; i += TAILLE) parts['p' + n++] = txt.slice(i, i + TAILLE);
  const ancien = +(P.getProperty('n') || 0);
  parts.n = String(n);
  P.setProperties(parts);
  for (let i = n; i < ancien; i++) P.deleteProperty('p' + i);
}

// ---- Sauvegardes : chaque version est compressée et rangée dans les propriétés du script ----
const liste_ = () => JSON.parse(P.getProperty('sauv') || '[]');
const resume_ = s => {
  const aff = (s.tasks || []).reduce((a, t) => a + ((t.who || []).length), 0);
  return { c: (s.cats || []).length, t: (s.tasks || []).length, m: (s.members || []).length, a: aff };
};
function sauver_(state, pourquoi) {
  const L = liste_(), k = 's' + Date.now().toString(36);
  const z = Utilities.base64Encode(Utilities.gzip(Utilities.newBlob(JSON.stringify(state), 'application/json')).getBytes());
  const parts = {}; let n = 0;
  for (let i = 0; i < z.length; i += TAILLE) parts[k + '_' + n++] = z.slice(i, i + TAILLE);
  L.unshift(Object.assign({ k, d: Date.now(), n, w: pourquoi }, resume_(state)));
  while (L.length > SAUV_MAX) { const o = L.pop(); for (let i = 0; i < o.n; i++) P.deleteProperty(o.k + '_' + i); }
  parts.sauv = JSON.stringify(L);
  P.setProperties(parts);
}
function relire_(k) {
  const o = liste_().find(x => x.k === k); if (!o) return null;
  let z = ''; for (let i = 0; i < o.n; i++) z += P.getProperty(k + '_' + i) || '';
  return JSON.parse(Utilities.ungzip(Utilities.newBlob(Utilities.base64Decode(z), 'application/x-gzip')).getDataAsString());
}
function avantEcriture_(ancien, nouveau) { // garde l'état précédent si c'est utile
  const L = liste_(), a = resume_(ancien), b = resume_(nouveau);
  const perte = b.c < a.c || b.t < a.t || b.m < a.m || b.a <= a.a - 3;
  const vieux = !L.length || Date.now() - L[0].d > SAUV_MIN * 60000;
  if (perte) sauver_(ancien, 'avant suppression');
  else if (vieux) sauver_(ancien, 'automatique');
}
function etat_() {
  let d = lire_();
  if (!d) { // première utilisation : on reprend les données de l'ancien site
    const r = UrlFetchApp.fetch(ANCIEN, { muteHttpExceptions: true });
    d = JSON.parse(r.getContentText());
    ecrire_(d);
  }
  return d;
}
const sortie_ = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
const nouvelEtag_ = () => Utilities.getUuid().replace(/-/g, '');

function hash_(code) {
  let sel = P.getProperty('sel');
  if (!sel) { sel = nouvelEtag_(); P.setProperty('sel', sel); }
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, sel + String(code).trim())
    .map(b => ('0' + (b & 255).toString(16)).slice(-2)).join('');
}
function codeOk_(code) {
  if (!P.getProperty('codeHash')) P.setProperty('codeHash', hash_(CODE_DEFAUT));
  return hash_(code) === P.getProperty('codeHash');
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'sauvegardes') return sortie_({ v: VERSION, sauvegardes: liste_().map(o => ({ k: o.k, d: o.d, w: o.w, c: o.c, t: o.t, m: o.m, a: o.a })) });
  return sortie_(Object.assign({ v: VERSION }, etat_()));
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents);
    const cur = etat_(), locked = !!(cur.state && cur.state.locked);

    // Verrouiller / déverrouiller : le code est vérifié ici, jamais dans la page
    if (b && b.action === 'lock') {
      const C = CacheService.getScriptCache(), essais = +(C.get('essais') || 0);
      if (essais >= ESSAIS_MAX) return sortie_({ code: 429, error: 'Trop de codes faux : réessaie dans 10 minutes.' });
      if (!codeOk_(b.code)) { C.put('essais', String(essais + 1), BLOCAGE_S); return sortie_({ code: 403, error: 'Code incorrect.' }); }
      C.remove('essais');
      cur.state.locked = !!b.locked;
      cur.etag = nouvelEtag_();
      ecrire_(cur);
      return sortie_(cur);
    }

    if (b && b.action === 'restaurer') {
      if (locked) return sortie_(Object.assign({ code: 423 }, cur));
      const old = relire_(b.k);
      if (!old) return sortie_({ code: 404, error: 'Sauvegarde introuvable.' });
      sauver_(cur.state, 'avant restauration');
      old.locked = false;
      const r = { state: old, etag: nouvelEtag_() };
      ecrire_(r);
      return sortie_(r);
    }

    if (!b || !b.state || !Array.isArray(b.state.tasks)) return sortie_({ error: 'État invalide', code: 400 });
    if (locked) return sortie_(Object.assign({ code: 423 }, cur)); // verrouillée : aucune modification acceptée
    if (b.etag && b.etag !== cur.etag) return sortie_(Object.assign({ code: 409 }, cur));
    b.state.locked = false; // seul le cadenas (avec le code) peut verrouiller
    avantEcriture_(cur.state, b.state);
    const etag = nouvelEtag_();
    ecrire_({ state: b.state, etag });
    return sortie_({ etag });
  } finally { lock.releaseLock(); }
}

// Pour changer le code : remplacer 'NOUVEAU' ci-dessous, ▶ Exécuter changerCode, puis remettre 'NOUVEAU'.
function changerCode() { P.setProperty('codeHash', hash_('NOUVEAU')); Logger.log('Code changé.'); }

// À lancer une fois depuis l'éditeur (▶ Exécuter) pour autoriser l'accès et importer les données.
function initialiser() { P.deleteAllProperties(); Logger.log(JSON.stringify(etat_()).length + ' caractères importés'); }

// Pour tester les sauvegardes depuis l'éditeur : ▶ Exécuter sauvegarderMaintenant
function sauvegarderMaintenant() { sauver_(etat_().state, 'manuelle'); Logger.log(liste_().length + ' sauvegarde(s)'); }
