// Simple in-memory store (resets on cold start — para produção usar Vercel KV ou similar)
// Usamos um ficheiro JSON em /tmp para persistir entre chamadas quentes
import fs from 'fs';

const FILE = '/tmp/requests.json';

function load() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return []; }
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json(load());
  }

  if (req.method === 'POST') {
    const requests = load();
    const newReq = { ...req.body, id: Date.now(), played: false,
      time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) };
    requests.push(newReq);
    save(requests);
    return res.status(201).json(newReq);
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    const requests = load().map(r => r.id == id ? { ...r, ...req.body } : r);
    save(requests);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (id === 'all') { save([]); return res.status(200).json({ ok: true }); }
    const requests = load().filter(r => r.id != id);
    save(requests);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
