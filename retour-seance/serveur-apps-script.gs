// Serveur de « Retour de séance » : reçoit un avis anonyme et le range dans la base Notion « Retours de séance ».
// Rien d'identifiant n'est reçu ni enregistré : pas de nom, pas de compte, pas d'adresse IP (Apps Script ne la transmet pas).
//
// Installation (une seule fois) :
// 1. script.google.com > Nouveau projet > coller ce fichier > Enregistrer.
// 2. ⚙ Paramètres du projet > Propriétés du script > Ajouter : NOTION_TOKEN = la clé de ton intégration Notion
//    (la même que pour la boîte à idées). Dans Notion, ouvrir la base « Retours de séance » > ••• > Connexions > ajouter cette intégration.
// 3. Déployer > Nouveau déploiement > Application Web : Exécuter en tant que « Moi », Accès « Tout le monde » > Déployer.
// 4. Copier l'adresse /exec et la coller dans index.html (constante API).

const DB = '424325f758c081608295c8acf66b7bf0';
const CRITERES = ['Utile', 'Inutile', 'Intéressant', 'Ennuyeux', 'Clair', 'Confus', 'Trop rapide', 'Trop lent',
  'Agréable', 'Enrichissant', 'Trop difficile'];
// Paires qui ne peuvent pas être cochées ensemble (contrôle aussi fait ici, au cas où)
const OPPOSES = [['Utile', 'Inutile'], ['Intéressant', 'Ennuyeux'], ['Clair', 'Confus'], ['Trop rapide', 'Trop lent'],
  ['Inutile', 'Enrichissant'], ['Ennuyeux', 'Agréable']];
const MAX_PAR_MINUTE = 60;

const sortie_ = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
const nettoie_ = (s, n) => String(s || '').replace(/[,\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

function doGet() { return sortie_({ ok: true, service: 'retour-seance' }); }

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

  const jour = Utilities.formatDate(new Date(), 'Europe/Paris', 'yyyy-MM-dd');
  const jourFr = Utilities.formatDate(new Date(), 'Europe/Paris', 'dd/MM/yyyy');
  const props = {
    Retour: { title: [{ text: { content: [cours, classe, jourFr].filter(Boolean).join(' · ') } }] },
    Date: { date: { start: jour } },
    Cours: { select: { name: cours } },
  };
  if (classe) props.Classe = { select: { name: classe } };
  CRITERES.forEach(c => props[c] = { checkbox: choix.includes(c) });

  const token = PropertiesService.getScriptProperties().getProperty('NOTION_TOKEN');
  if (!token) return sortie_({ ok: false, error: 'Service pas encore configuré' });
  const r = UrlFetchApp.fetch('https://api.notion.com/v1/pages', {
    method: 'post', muteHttpExceptions: true, contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token, 'Notion-Version': '2022-06-28' },
    payload: JSON.stringify({ parent: { database_id: DB }, properties: props }),
  });
  if (r.getResponseCode() !== 200) { console.error(r.getContentText()); return sortie_({ ok: false, error: 'Envoi impossible pour le moment' }); }
  return sortie_({ ok: true });
}

// ▶ Exécuter une fois depuis l'éditeur pour autoriser l'accès à Notion et créer une ligne de test.
function tester() {
  const e = { postData: { contents: JSON.stringify({ cours: 'Test', classe: 'TSIN', choix: ['Utile', 'Clair'] }) } };
  Logger.log(doPost(e).getContent());
}
