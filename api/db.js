export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Edit-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  // If Vercel KV is not connected yet, fall back to a public mock/in-memory warning
  if (!KV_URL || !KV_TOKEN) {
    return res.status(500).json({ 
      error: 'Vercel KV is not connected. Please go to Vercel dashboard -> Storage tab, create a KV database, and connect it to this project.' 
    });
  }

  const filterOldChats = (chats) => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    return (chats || []).filter(c => c.lastActivity > threeDaysAgo);
  };

  try {
    if (req.method === 'GET') {
      const [prodRes, chatRes] = await Promise.all([
        fetch(`${KV_URL}/get/products`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } }),
        fetch(`${KV_URL}/get/chats`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } })
      ]);

      const prodData = prodRes.ok ? await prodRes.json() : { result: null };
      const chatData = chatRes.ok ? await chatRes.json() : { result: null };

      let products = [];
      let chats = [];

      try {
        if (prodData.result) {
          products = JSON.parse(prodData.result);
        }
      } catch (e) {
        console.error("Error parsing products:", e);
      }

      try {
        if (chatData.result) {
          chats = JSON.parse(chatData.result);
        }
      } catch (e) {
        console.error("Error parsing chats:", e);
      }

      // Filter out chats older than 3 days
      const cleanedChats = filterOldChats(chats);
      if (cleanedChats.length !== chats.length) {
        await fetch(`${KV_URL}/set/chats`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${KV_TOKEN}` },
          body: JSON.stringify(JSON.stringify(cleanedChats))
        });
        chats = cleanedChats;
      }

      return res.status(200).json({ products, chats });

    } else if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const promises = [];

      if (bodyData && bodyData.products !== undefined) {
        promises.push(
          fetch(`${KV_URL}/set/products`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${KV_TOKEN}` },
            body: JSON.stringify(JSON.stringify(bodyData.products))
          })
        );
      }

      if (bodyData && bodyData.chats !== undefined) {
        const cleanedChats = filterOldChats(bodyData.chats);
        promises.push(
          fetch(`${KV_URL}/set/chats`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${KV_TOKEN}` },
            body: JSON.stringify(JSON.stringify(cleanedChats))
          })
        );
      }

      await Promise.all(promises);
      return res.status(200).json({ status: 'success' });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
