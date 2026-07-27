export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Edit-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const DB_URL_RAW = 'https://jsonhosting.com/api/json/8457769f/raw';
  const DB_URL_PATCH = 'https://jsonhosting.com/api/json/8457769f';
  const DB_EDIT_KEY = '0ba0d838a40c2389f1d6748e083680c40d2bb0d908741671e5466897e5188807';

  try {
    if (req.method === 'GET') {
      const response = await fetch(DB_URL_RAW);
      if (!response.ok) {
        throw new Error(`Failed to fetch from DB: ${response.status}`);
      }
      const data = await response.json();
      return res.status(200).json(data);
    } else if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const response = await fetch(DB_URL_PATCH, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Edit-Key': DB_EDIT_KEY
        },
        body: JSON.stringify(bodyData)
      });
      if (!response.ok) {
        throw new Error(`Failed to save to DB: ${response.status}`);
      }
      const data = await response.json();
      return res.status(200).json(data);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
