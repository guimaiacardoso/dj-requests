const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

async function redisGet(key) {
  const res = await fetch(`${KV_REST_API_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
  });
  const data = await res.json();
  if (!data.result) return [];
  // Pode estar como string ou já como array — normalizar
  let result = data.result;
  if (typeof result === 'string') result = JSON.parse(result);
  if (typeof result === 'string') result = JSON.parse(result); // double-encoded
  if (!Array.isArray(result)) return [];
  return result;
}

async function redisSet(key, value) {
  await fetch(`${KV_REST_API_URL}/set/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([JSON.stringify(value)]),
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const requests = await redisGet('dj_requests');
      return res.status(200).json(requests);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const requests = await redisGet('dj_requests');
      const newReq = {
        ...req.body,
        id: Date.now(),
        played: false,
        time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      };
      requests.push(newReq);
      await redisSet('dj_requests', requests);
      return res.status(201).json(newReq);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id } = req.query;
      const requests = (await redisGet('dj_requests')).map(r =>
        r.id == id ? { ...r, ...req.body } : r
      );
      await redisSet('dj_requests', requests);
      return res.status(200).json({ ok: true });
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (id === 'all') {
        await redisSet('dj_requests', []);
        return res.status(200).json({ ok: true });
      }
      const requests = (await redisGet('dj_requests')).filter(r => r.id != id);
      await redisSet('dj_requests', requests);
      return res.status(200).json({ ok: true });
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).end();
}
