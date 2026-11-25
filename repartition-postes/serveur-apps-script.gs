// Serveur de données de « Répartition des postes » (So Caval)
// Déployer : Déployer > Nouveau déploiement > Application Web, Exécuter en tant que : Moi, Accès : Tout le monde.
const ANCIEN = 'https://planning-benevoles-tbho.netlify.app/api/state';
const P = PropertiesService.getScriptProperties();
const TAILLE = 8000;

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
  P.setProperties(parts, true);
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

function doGet() { return sortie_(etat_()); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents);
    if (!b || !b.state || !Array.isArray(b.state.tasks)) return sortie_({ error: 'État invalide', code: 400 });
    const cur = etat_();
    if (b.etag && b.etag !== cur.etag) return sortie_(Object.assign({ code: 409 }, cur));
    const etag = Utilities.getUuid().replace(/-/g, '');
    ecrire_({ state: b.state, etag });
    return sortie_({ etag });
  } finally { lock.releaseLock(); }
}

// À lancer une fois depuis l'éditeur (▶ Exécuter) pour autoriser l'accès et importer les données.
function initialiser() { P.deleteAllProperties(); Logger.log(JSON.stringify(etat_()).length + ' caractères importés'); }
