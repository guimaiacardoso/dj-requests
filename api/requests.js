const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

const headers = {
  Authorization: `Bearer ${KV_REST_API_TOKEN}`,
  'Content-Type': 'application/json',
};

async function redisGet(key) {
  const res = await fetch(`${KV_REST_API_URL}/get/${key}`, { headers });
  const data = await res.json();
  if (!data.result) return [];
  try { return JSON.parse(data.result); } catch { return []; }
}

async function redisSet(key, value) {
  const encoded = encodeURIComponent(JSON.stringify(value));
  await fetch(`${KV_REST_API_URL}/set/${key}/${encoded}`, {
    method: 'GET',
    headers,
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      return res.status(200).json(await redisGet('dj_requests'));
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'POST') {
    try {
      const requests = await redisGet('dj_requests');
      const newReq = {
        ...req.body, id: Date.now(), played: false,
        time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      };
      requests.push(newReq);
      await redisSet('dj_requests', requests);
      return res.status(201).json(newReq);
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'PATCH') {
    try {
      const { id } = req.query;
      const requests = (await redisGet('dj_requests')).map(r =>
        r.id == id ? { ...r, ...req.body } : r
      );
      await redisSet('dj_requests', requests);
      return res.status(200).json({ ok: true });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      const all = await redisGet('dj_requests');
      const requests = id === 'all' ? [] : all.filter(r => r.id != id);
      await redisSet('dj_requests', requests);
      return res.status(200).json({ ok: true });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  res.status(405).end();
}
