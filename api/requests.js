const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

async function redis(command, ...args) {
  const res = await fetch(`${KV_REST_API_URL}/${command}/${args.map(a => encodeURIComponent(JSON.stringify(a))).join('/')}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
  });
  const data = await res.json();
  return data.result;
}

async function loadRequests() {
  const raw = await redis('get', 'requests');
  if (!raw) return [];
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function saveRequests(reqs) {
  await fetch(`${KV_REST_API_URL}/set/requests`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value: JSON.stringify(reqs) }),
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const requests = await loadRequests();
    return res.status(200).json(requests);
  }

  if (req.method === 'POST') {
    const requests = await loadRequests();
    const newReq = {
      ...req.body,
      id: Date.now(),
      played: false,
      time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    };
    requests.push(newReq);
    await saveRequests(requests);
    return res.status(201).json(newReq);
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    const requests = (await loadRequests()).map(r => r.id == id ? { ...r, ...req.body } : r);
    await saveRequests(requests);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (id === 'all') {
      await saveRequests([]);
      return res.status(200).json({ ok: true });
    }
    const requests = (await loadRequests()).filter(r => r.id != id);
    await saveRequests(requests);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
