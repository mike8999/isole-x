// Serveur de données de « Répartition des postes » (So Caval) — version 2 : verrou contrôlé par le serveur
// Mise à jour : coller ce fichier dans l'éditeur Apps Script, Enregistrer, puis
// Déployer > Gérer les déploiements > ✎ Modifier > Version : Nouvelle version > Déployer (l'adresse reste la même).
const ANCIEN = 'https://planning-benevoles-tbho.netlify.app/api/state';
const P = PropertiesService.getScriptProperties();
const TAILLE = 8000;
const VERSION = 2;
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
  parts.n = String(n);
  const garder = {};
  ['codeHash', 'sel'].forEach(k => { const v = P.getProperty(k); if (v) garder[k] = v; });
  P.setProperties(Object.assign(parts, garder), true);
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

function doGet() { return sortie_(Object.assign({ v: VERSION }, etat_())); }

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

    if (!b || !b.state || !Array.isArray(b.state.tasks)) return sortie_({ error: 'État invalide', code: 400 });
    if (locked) return sortie_(Object.assign({ code: 423 }, cur)); // verrouillée : aucune modification acceptée
    if (b.etag && b.etag !== cur.etag) return sortie_(Object.assign({ code: 409 }, cur));
    b.state.locked = false; // seul le cadenas (avec le code) peut verrouiller
    const etag = nouvelEtag_();
    ecrire_({ state: b.state, etag });
    return sortie_({ etag });
  } finally { lock.releaseLock(); }
}

// Pour changer le code : remplacer 'NOUVEAU' ci-dessous, ▶ Exécuter changerCode, puis remettre 'NOUVEAU'.
function changerCode() { P.setProperty('codeHash', hash_('NOUVEAU')); Logger.log('Code changé.'); }

// À lancer une fois depuis l'éditeur (▶ Exécuter) pour autoriser l'accès et importer les données.
function initialiser() { P.deleteAllProperties(); Logger.log(JSON.stringify(etat_()).length + ' caractères importés'); }
