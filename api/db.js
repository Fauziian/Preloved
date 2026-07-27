import { createClient } from 'redis';

let client;

async function getRedisClient() {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL
    });
    client.on('error', (err) => console.error('Redis Client Error', err));
    await client.connect();
  }
  return client;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Edit-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const REDIS_URL = process.env.REDIS_URL;

  if (!REDIS_URL) {
    return res.status(500).json({ 
      error: 'Redis database is not connected. Please make sure REDIS_URL environment variable is present.' 
    });
  }

  const filterOldChats = (chats) => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    return (chats || []).filter(c => c.lastActivity > threeDaysAgo);
  };

  try {
    const redisClient = await getRedisClient();

    if (req.method === 'GET') {
      const [prodRaw, chatRaw] = await Promise.all([
        redisClient.get('products'),
        redisClient.get('chats')
      ]);

      let products = [];
      let chats = [];

      try {
        if (prodRaw) {
          products = JSON.parse(prodRaw);
        }
      } catch (e) {
        console.error("Error parsing products:", e);
      }

      try {
        if (chatRaw) {
          chats = JSON.parse(chatRaw);
        }
      } catch (e) {
        console.error("Error parsing chats:", e);
      }

      // Filter out chats older than 3 days
      const cleanedChats = filterOldChats(chats);
      if (cleanedChats.length !== chats.length) {
        await redisClient.set('chats', JSON.stringify(cleanedChats));
        chats = cleanedChats;
      }

      return res.status(200).json({ products, chats });

    } else if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      if (bodyData && bodyData.products !== undefined) {
        await redisClient.set('products', JSON.stringify(bodyData.products));
      }

      if (bodyData && bodyData.chats !== undefined) {
        const cleanedChats = filterOldChats(bodyData.chats);
        await redisClient.set('chats', JSON.stringify(cleanedChats));
      }

      return res.status(200).json({ status: 'success' });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error("Redis Handler Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
