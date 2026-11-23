// Boîte à idées Isole x ! : reçoit une suggestion anonyme et la range dans la base Notion
// « Boîte à idées – Isole x ! ». La clé de l'intégration est dans la variable NOTION_TOKEN (Netlify).
const DB = process.env.NOTION_DB_ID || '421325f758c0811191e0fe2fe26c38a9';
const TYPES = ['Ergonomie', 'Fonctionnalité', 'Bug', 'Autre'];
const JEUX = ['Atelier STI2D', 'Jungle collège'];
const ORIGINS = ['https://mike8999.github.io', 'https://isole-x.netlify.app'];

const cors = (origin) => ({
  'Access-Control-Allow-Origin': ORIGINS.includes(origin) || /^https:\/\/[a-z0-9-]+--isole-x\.netlify\.app$/.test(origin || '') ? origin : ORIGINS[0],
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
});

export default async (req) => {
  const h = cors(req.headers.get('origin'));
  const out = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...h, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
  if (req.method !== 'POST') return out(405, { ok: false, error: 'Méthode non autorisée' });
  if (!process.env.NOTION_TOKEN) return out(500, { ok: false, error: 'Boîte à idées pas encore configurée' });

  let d;
  try { d = await req.json(); } catch { return out(400, { ok: false, error: 'Message illisible' }); }
  if (d.site) return out(200, { ok: true }); // piège à robots : champ caché rempli
  const texte = String(d.texte || '').replace(/\s+/g, ' ').trim().slice(0, 600);
  if (texte.length < 5) return out(400, { ok: false, error: 'Écris au moins quelques mots' });
  const type = TYPES.includes(d.type) ? d.type : 'Autre';
  const jeu = JEUX.includes(d.jeu) ? d.jeu : null;
  const ecran = String(d.ecran || '').slice(0, 60);

  const props = {
    Suggestion: { title: [{ text: { content: texte.slice(0, 200) } }] },
    Type: { select: { name: type } },
    Statut: { status: { name: 'Nouveau' } },
  };
  if (jeu) props.Jeu = { select: { name: jeu } };
  const children = [{ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: texte } }] } }];
  if (ecran) children.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: 'Écran : ' + ecran }, annotations: { italic: true, color: 'gray' } }] } });

  const r = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.NOTION_TOKEN, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({ parent: { database_id: DB }, properties: props, children }),
  });
  if (!r.ok) { console.error('Notion', r.status, await r.text()); return out(502, { ok: false, error: 'Envoi impossible pour le moment' }); }
  return out(200, { ok: true });
};
