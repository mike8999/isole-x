// Serveur de « Retour de séance » : reçoit un avis anonyme et le range dans la base Notion « Retours de séance ».
// Rien d'identifiant n'est reçu ni enregistré : pas de nom, pas de compte, pas d'adresse IP (Apps Script ne la transmet pas).
//
// Installation (une seule fois) :
// 1. script.google.com > Nouveau projet > coller ce fichier > Enregistrer.
// 2. ⚙ Paramètres du projet > Propriétés du script > Ajouter : NOTION_TOKEN = la clé de ton intégration Notion
//    (la même que pour la boîte à idées). Dans Notion, ouvrir la base « Retours de séance » > ••• > Connexions > ajouter cette intégration.
// 3. Déployer > Nouveau déploiement > Application Web : Exécuter en tant que « Moi », Accès « Tout le monde » > Déployer.
// 4. Copier l'adresse /exec et la coller dans index.html (constante API).
// 5. Page Résultats : ajouter aussi la propriété PROF_CODE = un code de ton choix (demandé pour lire les résultats).
// Mise à jour : coller ce fichier, Enregistrer, puis Déployer > Gérer les déploiements > ✎ > Version : Nouvelle version > Déployer.

const DB = '424325f758c081608295c8acf66b7bf0';
const CRITERES = ['Utile', 'Inutile', 'Intéressant', 'Ennuyeux', 'Clair', 'Confus', 'Trop rapide', 'Rythme adapté', 'Trop lent',
  'Agréable', 'Enrichissant', 'Trop difficile'];
const TYPES = ['Cours', 'TP', 'TD', 'Projet', 'Évaluation'];
// Paires qui ne peuvent pas être cochées ensemble (contrôle aussi fait ici, au cas où)
const OPPOSES = [['Utile', 'Inutile'], ['Intéressant', 'Ennuyeux'], ['Clair', 'Confus'], ['Trop rapide', 'Trop lent'],
  ['Trop rapide', 'Rythme adapté'], ['Rythme adapté', 'Trop lent'], ['Inutile', 'Enrichissant'], ['Ennuyeux', 'Agréable']];
const MAX_PAR_MINUTE = 60;

const sortie_ = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
const nettoie_ = (s, n) => String(s || '').replace(/[,\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

const P_ = () => PropertiesService.getScriptProperties();
const notion_ = (chemin, corps) => UrlFetchApp.fetch('https://api.notion.com/v1/' + chemin, {
  method: 'post', muteHttpExceptions: true, contentType: 'application/json',
  headers: { Authorization: 'Bearer ' + P_().getProperty('NOTION_TOKEN'), 'Notion-Version': '2022-06-28' },
  payload: JSON.stringify(corps),
});
const jour_ = decalage => Utilities.formatDate(new Date(Date.now() + (decalage || 0) * 864e5), 'Europe/Paris', 'yyyy-MM-dd');

// GET ?action=resultats&code=… : toutes les réponses, sous forme compacte, pour la page Résultats
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action !== 'resultats') return sortie_({ ok: true, service: 'retour-seance' });
  const code = P_().getProperty('PROF_CODE');
  if (!code) return sortie_({ ok: false, error: 'Ajoute la propriété PROF_CODE dans Apps Script' });
  const C = CacheService.getScriptCache(), essais = +(C.get('essais') || 0);
  if (essais >= 5) return sortie_({ ok: false, error: 'Trop de codes faux : réessaie dans 10 minutes' });
  if (String(p.code || '') !== code) { C.put('essais', String(essais + 1), 600); return sortie_({ ok: false, error: 'Code incorrect' }); }
  C.remove('essais');
  const lignes = [];
  let curseur;
  do {
    const r = notion_('databases/' + DB + '/query', Object.assign({ page_size: 100 }, curseur ? { start_cursor: curseur } : {}));
    if (r.getResponseCode() !== 200) return sortie_({ ok: false, error: 'Lecture Notion impossible' });
    const j = JSON.parse(r.getContentText());
    j.results.forEach(pg => {
      const pr = pg.properties, sel = k => pr[k] && pr[k].select ? pr[k].select.name : '';
      lignes.push({ d: pr.Date && pr.Date.date ? pr.Date.date.start : '', c: sel('Cours'), k: sel('Classe'), t: sel('Type'),
        n: pr.Effectif ? pr.Effectif.number : null, x: CRITERES.filter(c => pr[c] && pr[c].checkbox) });
    });
    curseur = j.has_more ? j.next_cursor : null;
  } while (curseur);
  return sortie_({ ok: true, lignes });
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (_) { return sortie_({ ok: false, error: 'Message illisible' }); }
  if (d.site) return sortie_({ ok: true }); // piège à robots

  const C = CacheService.getScriptCache(), n = +(C.get('n') || 0);
  if (n >= MAX_PAR_MINUTE) return sortie_({ ok: false, error: 'Trop d\'envois, réessaie dans une minute' });
  C.put('n', String(n + 1), 60);

  const cours = nettoie_(d.cours, 80), classe = nettoie_(d.classe, 30);
  if (!cours) return sortie_({ ok: false, error: 'Cours manquant' });
  const choix = (Array.isArray(d.choix) ? d.choix : []).filter(c => CRITERES.includes(c));
  if (!choix.length) return sortie_({ ok: false, error: 'Coche au moins une réponse' });
  if (OPPOSES.some(([a, b]) => choix.includes(a) && choix.includes(b))) return sortie_({ ok: false, error: 'Réponses contradictoires' });

  // Le QR code porte la date de la séance : accepté le jour même (ou le lendemain pour un envoi différé faute de réseau)
  let jour = jour_();
  if (d.date) {
    if (d.date !== jour && d.date !== jour_(-1)) return sortie_({ ok: false, error: 'Ce QR code n\'est plus valable (séance d\'un autre jour)', perime: true });
    jour = d.date;
  }
  const jourFr = jour.split('-').reverse().join('/');
  const type = TYPES.includes(d.type) ? d.type : '';
  const effectif = Math.round(+d.effectif);
  const props = {
    Retour: { title: [{ text: { content: [cours, classe, jourFr].filter(Boolean).join(' · ') } }] },
    Date: { date: { start: jour } },
    Cours: { select: { name: cours } },
  };
  if (classe) props.Classe = { select: { name: classe } };
  if (type) props.Type = { select: { name: type } };
  if (effectif > 0 && effectif <= 60) props.Effectif = { number: effectif };
  CRITERES.forEach(c => props[c] = { checkbox: choix.includes(c) });

  if (!P_().getProperty('NOTION_TOKEN')) return sortie_({ ok: false, error: 'Service pas encore configuré' });
  const r = notion_('pages', { parent: { database_id: DB }, properties: props });
  if (r.getResponseCode() !== 200) { console.error(r.getContentText()); return sortie_({ ok: false, error: 'Envoi impossible pour le moment' }); }
  return sortie_({ ok: true });
}

// ▶ Exécuter une fois depuis l'éditeur pour autoriser l'accès à Notion et créer une ligne de test.
function tester() {
  const e = { postData: { contents: JSON.stringify({ cours: 'Test', classe: 'TSIN', type: 'TP', effectif: 24, choix: ['Utile', 'Rythme adapté'] }) } };
  Logger.log(doPost(e).getContent());
}
