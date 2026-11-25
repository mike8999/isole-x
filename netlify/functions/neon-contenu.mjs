// Neon Rush STI2D : contenu partagé (questions, cartes, fiches, schémas).
// GET  → contenu enregistré par le professeur (ou null : l'appli garde son contenu d'origine)
// POST → { action: 'check' | 'save' | 'reset', code, contenu }
// Le code professeur est dans la variable NEON_PROF_CODE (Netlify). Verrou après trop d'essais ratés.
import { getStore } from '@netlify/blobs';

const ORIGINS = ['https://mike8999.github.io', 'https://isole-x.netlify.app'];
const MAX = 900000;           // taille maximale du contenu (octets)
const ESSAIS = 15;            // essais ratés autorisés…
const FENETRE = 15 * 60000;   // …par quart d'heure

const cors = (origin) => ({
  'Access-Control-Allow-Origin': ORIGINS.includes(origin) || /^https:\/\/[a-z0-9-]+--isole-x\.netlify\.app$/.test(origin || '') ? origin : ORIGINS[0],
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
});

const valide = (c) => c && typeof c === 'object' && ['questions', 'cartes', 'fiches', 'schemas'].every((k) => Array.isArray(c[k]));

export default async (req) => {
  const h = cors(req.headers.get('origin'));
  const out = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...h, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
  const store = getStore('neon-rush');

  if (req.method === 'GET') {
    const c = await store.get('contenu', { type: 'json' });
    return out(200, { ok: true, contenu: c ? c.data : null, maj: c ? c.maj : null });
  }
  if (req.method !== 'POST') return out(405, { ok: false, error: 'Méthode non autorisée' });

  const ref = process.env.NEON_PROF_CODE;
  if (!ref) return out(500, { ok: false, error: 'Mode professeur pas encore configuré' });
  const brut = await req.text();
  if (brut.length > MAX + 2000) return out(413, { ok: false, error: 'Contenu trop volumineux' });
  let d;
  try { d = JSON.parse(brut); } catch { return out(400, { ok: false, error: 'Message illisible' }); }

  const now = Date.now();
  const v = (await store.get('verrou', { type: 'json' })) || { n: 0, t: now };
  if (now - v.t > FENETRE) { v.n = 0; v.t = now; }
  if (v.n >= ESSAIS) return out(429, { ok: false, error: 'Trop d\'essais : réessaie dans un quart d\'heure' });
  if (String(d.code || '') !== ref) {
    v.n++; await store.setJSON('verrou', v);
    await new Promise((r) => setTimeout(r, 700));
    return out(403, { ok: false, error: 'Code incorrect' });
  }

  if (d.action === 'check') return out(200, { ok: true });
  if (d.action === 'reset') { await store.delete('contenu'); return out(200, { ok: true, maj: null }); }
  if (d.action === 'save') {
    if (!valide(d.contenu)) return out(400, { ok: false, error: 'Contenu incomplet' });
    const data = { questions: d.contenu.questions, cartes: d.contenu.cartes, fiches: d.contenu.fiches, schemas: d.contenu.schemas };
    if (JSON.stringify(data).length > MAX) return out(413, { ok: false, error: 'Contenu trop volumineux' });
    const maj = new Date().toISOString();
    await store.setJSON('contenu', { maj, data });
    return out(200, { ok: true, maj });
  }
  return out(400, { ok: false, error: 'Action inconnue' });
};
