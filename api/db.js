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

const SEED_PRODUCTS = [
  {
    id: '1',
    name: 'Sweater Rajut Pink Oversize',
    price: 85000,
    originalPrice: 320000,
    description: 'Sweater rajut premium warna pink. Bahan lembut dan nyaman dipakai. Kondisi sangat terawat.',
    condition: 'Sangat Baik',
    brand: 'Unbranded',
    category: 'Fashion Wanita',
    stock: 1,
    weight: '300g',
    material: 'Rajut Akrilik',
    tags: ['sweater', 'rajut', 'pink'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-2-D1V8gELu.png'],
    variants: [{ name: 'Ukuran', options: ['M', 'L'] }],
    createdAt: '2026-07-20'
  },
  {
    id: '2',
    name: 'Crop Top Stripe Monochrome',
    price: 65000,
    originalPrice: 220000,
    description: 'Crop top motif stripe hitam-putih trendi. Bahan stretch nyaman.',
    condition: 'Baik',
    brand: 'H&M',
    category: 'Fashion Wanita',
    stock: 1,
    weight: '200g',
    material: 'Cotton Stretch',
    tags: ['crop top', 'stripe'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-3-C2haDO2D.png'],
    variants: [{ name: 'Ukuran', options: ['S', 'M'] }],
    createdAt: '2026-07-21'
  },
  {
    id: '3',
    name: 'Polo Crop Navy Premium',
    price: 75000,
    originalPrice: 280000,
    description: 'Polo shirt crop warna navy elegan. Bahan berkualitas, terasa adem.',
    condition: 'Sangat Baik',
    brand: 'Uniqlo',
    category: 'Fashion Wanita',
    stock: 1,
    weight: '250g',
    material: 'Pique Cotton',
    tags: ['polo', 'crop', 'navy'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-4-C6tSW0GE.png'],
    variants: [{ name: 'Ukuran', options: ['M'] }],
    createdAt: '2026-07-22'
  },
  {
    id: '4',
    name: 'Blouse Ruffle Putih Elegan',
    price: 110000,
    originalPrice: 430000,
    description: 'Blouse detail ruffle feminin dan elegan. Warna putih bersih, bahan ringan.',
    condition: 'Sangat Baik',
    brand: 'Zara',
    category: 'Fashion Wanita',
    stock: 1,
    weight: '220g',
    material: 'Chiffon',
    tags: ['blouse', 'ruffle', 'elegan'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-5-QEo8_1xu.png'],
    variants: [{ name: 'Ukuran', options: ['S', 'M'] }],
    createdAt: '2026-07-23'
  },
  {
    id: '5',
    name: 'Casual Blazer Cream',
    price: 145000,
    originalPrice: 580000,
    description: 'Blazer kasual warna cream netral. Sangat cocok untuk acara semi-formal maupun formal.',
    condition: 'Sangat Baik',
    brand: 'Mango',
    category: 'Fashion Wanita',
    stock: 1,
    weight: '450g',
    material: 'Polyester Blend',
    tags: ['blazer', 'cream', 'casual'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-2-D1V8gELu.png'],
    variants: [{ name: 'Ukuran', options: ['M', 'L'] }],
    createdAt: '2026-07-24'
  },
  {
    id: '6',
    name: 'Denim Jacket Vintage Blue',
    price: 175000,
    originalPrice: 690000,
    description: 'Jaket denim tebal gaya vintage. Warna biru pudar alami, stylish untuk layering.',
    condition: 'Baik',
    brand: 'Levi\'s',
    category: 'Fashion Pria',
    stock: 1,
    weight: '600g',
    material: '100% Cotton Denim',
    tags: ['jacket', 'denim', 'vintage'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-3-C2haDO2D.png'],
    variants: [{ name: 'Ukuran', options: ['L', 'XL'] }],
    createdAt: '2026-07-25'
  },
  {
    id: '7',
    name: 'Pleated Skirt Olive Green',
    price: 90000,
    originalPrice: 350000,
    description: 'Rok plisket warna hijau olive yang estetik. Karet pinggang nyaman stretch.',
    condition: 'Sangat Baik',
    brand: 'Unbranded',
    category: 'Fashion Wanita',
    stock: 1,
    weight: '280g',
    material: 'Premium Pleated Crepe',
    tags: ['skirt', 'pleated', 'olive'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-4-C6tSW0GE.png'],
    variants: [{ name: 'Ukuran', options: ['All Size'] }],
    createdAt: '2026-07-26'
  },
  {
    id: '8',
    name: 'Floral Summer Dress',
    price: 125000,
    originalPrice: 450000,
    description: 'Dress motif bunga-bunga cantik untuk musim panas. Bahan adem dan jatuh di badan.',
    condition: 'Sangat Baik',
    brand: 'Pull & Bear',
    category: 'Fashion Wanita',
    stock: 1,
    weight: '240g',
    material: 'Rayon Viscose',
    tags: ['dress', 'floral', 'summer'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-5-QEo8_1xu.png'],
    variants: [{ name: 'Ukuran', options: ['S', 'M'] }],
    createdAt: '2026-07-27'
  },
  {
    id: '9',
    name: 'Black Linen Trousers',
    price: 105000,
    originalPrice: 399000,
    description: 'Celana panjang bahan linen warna hitam. Sejuk dipakai seharian, gaya kasual santai.',
    condition: 'Baik',
    brand: 'Uniqlo',
    category: 'Fashion Wanita',
    stock: 1,
    weight: '320g',
    material: 'Linen Blend',
    tags: ['trousers', 'linen', 'black'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-2-D1V8gELu.png'],
    variants: [{ name: 'Ukuran', options: ['M', 'L'] }],
    createdAt: '2026-07-28'
  },
  {
    id: '10',
    name: 'Knit Cardigan Soft Yellow',
    price: 95000,
    originalPrice: 380000,
    description: 'Cardigan rajut warna kuning pastel lembut. Lucu untuk outfit OOTD harian.',
    condition: 'Sangat Baik',
    brand: 'Cotton On',
    category: 'Fashion Wanita',
    stock: 1,
    weight: '290g',
    material: 'Acrylic Knit',
    tags: ['cardigan', 'knit', 'yellow'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-3-C2haDO2D.png'],
    variants: [{ name: 'Ukuran', options: ['M'] }],
    createdAt: '2026-07-28'
  },
  {
    id: '11',
    name: 'Handbag Leather Coffee',
    price: 220000,
    originalPrice: 890000,
    description: 'Tas tangan bahan kulit imitasi warna cokelat kopi. Muat banyak barang dan terlihat vintage.',
    condition: 'Sangat Baik',
    brand: 'Charles & Keith',
    category: 'Tas',
    stock: 1,
    weight: '500g',
    material: 'PU Leather',
    tags: ['handbag', 'leather', 'brown'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-4-C6tSW0GE.png'],
    variants: [{ name: 'Warna', options: ['Coffee Brown'] }],
    createdAt: '2026-07-28'
  },
  {
    id: '12',
    name: 'Canvas Sneaker White',
    price: 180000,
    originalPrice: 750000,
    description: 'Sepatu sneakers kanvas warna putih bersih. Klasik dan selalu cocok dengan segala gaya.',
    condition: 'Baik',
    brand: 'Converse',
    category: 'Sepatu',
    stock: 1,
    weight: '700g',
    material: 'Canvas & Rubber',
    tags: ['sneaker', 'canvas', 'white'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-5-QEo8_1xu.png'],
    variants: [{ name: 'Ukuran', options: ['38', '39', '40'] }],
    createdAt: '2026-07-28'
  },
  {
    id: '13',
    name: 'Sunglasses Retro Brown',
    price: 45000,
    originalPrice: 180000,
    description: 'Kacamata hitam frame cokelat retro bergaya klasik tahun 90-an.',
    condition: 'Sangat Baik',
    brand: 'Unbranded',
    category: 'Aksesoris',
    stock: 1,
    weight: '50g',
    material: 'Polycarbonate',
    tags: ['sunglasses', 'retro', 'brown'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-2-D1V8gELu.png'],
    variants: [{ name: 'Warna', options: ['Brown Tint'] }],
    createdAt: '2026-07-28'
  },
  {
    id: '14',
    name: 'Wool Beret Hat Mustard',
    price: 50000,
    originalPrice: 195000,
    description: 'Topi baret bahan wool warna kuning mustard hangat dan fashionable.',
    condition: 'Sangat Baik',
    brand: 'Unbranded',
    category: 'Aksesoris',
    stock: 1,
    weight: '100g',
    material: '100% Wool',
    tags: ['hat', 'beret', 'wool'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-3-C2haDO2D.png'],
    variants: [{ name: 'Ukuran', options: ['All Size'] }],
    createdAt: '2026-07-28'
  },
  {
    id: '15',
    name: 'Silk Scarf Floral Pattern',
    price: 60000,
    originalPrice: 240000,
    description: 'Syal sutra lembut dengan corak bunga-bunga pastel yang mewah.',
    condition: 'Sangat Baik',
    brand: 'Zara',
    category: 'Aksesoris',
    stock: 1,
    weight: '80g',
    material: 'Silk Silk',
    tags: ['scarf', 'silk', 'floral'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-4-C6tSW0GE.png'],
    variants: [{ name: 'Ukuran', options: ['Standard'] }],
    createdAt: '2026-07-28'
  },
  {
    id: '16',
    name: 'Gold Chain Necklace',
    price: 70000,
    originalPrice: 290000,
    description: 'Kalung rantai warna emas minimalis. Tahan karat dan cocok untuk daily wear.',
    condition: 'Sangat Baik',
    brand: 'H&M',
    category: 'Aksesoris',
    stock: 1,
    weight: '30g',
    material: 'Stainless Steel Gold Plated',
    tags: ['necklace', 'gold', 'minimalist'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-5-QEo8_1xu.png'],
    variants: [{ name: 'Panjang', options: ['45cm'] }],
    createdAt: '2026-07-28'
  },
  {
    id: '17',
    name: 'Oversized Flannel Red-Navy',
    price: 95000,
    originalPrice: 380000,
    description: 'Kemeja flanel kotak-kotak merah navy oversize. Bahan tebal hangat.',
    condition: 'Baik',
    brand: 'Uniqlo',
    category: 'Fashion Pria',
    stock: 1,
    weight: '350g',
    material: 'Flannel Cotton',
    tags: ['flannel', 'shirt', 'red'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-2-D1V8gELu.png'],
    variants: [{ name: 'Ukuran', options: ['L', 'XL'] }],
    createdAt: '2026-07-28'
  },
  {
    id: '18',
    name: 'Leather Loafers Classic',
    price: 250000,
    originalPrice: 1100000,
    description: 'Sepatu loafers kulit warna hitam. Cocok untuk ngantor atau hangout formal.',
    condition: 'Sangat Baik',
    brand: 'Pedro',
    category: 'Sepatu',
    stock: 1,
    weight: '800g',
    material: 'Genuine Leather',
    tags: ['loafers', 'leather', 'black'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-3-C2haDO2D.png'],
    variants: [{ name: 'Ukuran', options: ['41', '42'] }],
    createdAt: '2026-07-28'
  },
  {
    id: '19',
    name: 'Tote Bag Canvas Aesthetic',
    price: 35000,
    originalPrice: 120000,
    description: 'Tote bag kanvas tebal dengan sablon estetik minimalis. Cocok untuk kuliah.',
    condition: 'Sangat Baik',
    brand: 'Unbranded',
    category: 'Tas',
    stock: 1,
    weight: '150g',
    material: 'Canvas Premium',
    tags: ['totebag', 'canvas', 'aesthetic'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-4-C6tSW0GE.png'],
    variants: [{ name: 'Ukuran', options: ['35x40cm'] }],
    createdAt: '2026-07-28'
  },
  {
    id: '20',
    name: 'Vintage Watch Gold Strap',
    price: 350000,
    originalPrice: 1500000,
    description: 'Jam tangan vintage dengan strap rantai lapis emas. Mewah dan berfungsi normal.',
    condition: 'Sangat Baik',
    brand: 'Casio',
    category: 'Aksesoris',
    stock: 1,
    weight: '120g',
    material: 'Stainless Steel',
    tags: ['watch', 'vintage', 'gold'],
    status: 'published',
    shopeeLink: 'https://shopee.co.id/',
    photos: ['./assets/image-5-QEo8_1xu.png'],
    variants: [{ name: 'Warna', options: ['Gold'] }],
    createdAt: '2026-07-28'
  }
];

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
    const url = req.url || '';
    const parsedUrl = new URL(url, 'http://localhost');
    const path = parsedUrl.pathname;

    // ─── 1. PRODUCTS ENDPOINTS ───────────────────────────────────────────────
    if (path === '/api/products') {
      if (req.method === 'GET') {
        const prodRaw = await redisClient.get('products');
        let products = [];
        if (prodRaw) {
          try {
            products = JSON.parse(prodRaw);
          } catch (e) {
            console.error("Error parsing products from Redis:", e);
          }
        }
        // If empty or null, seed with the 20 default products
        if (!products || products.length === 0) {
          await redisClient.set('products', JSON.stringify(SEED_PRODUCTS));
          products = SEED_PRODUCTS;
        }
        return res.status(200).json(products);

      } else if (req.method === 'POST') {
        const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const prodRaw = await redisClient.get('products');
        let products = [];
        if (prodRaw) {
          try {
            products = JSON.parse(prodRaw);
          } catch (e) {}
        }
        // Map originalPrice to camelCase if necessary (matching model expectations)
        const newProduct = {
          id: bodyData.id,
          name: bodyData.name,
          price: bodyData.price,
          originalPrice: bodyData.originalPrice !== undefined ? bodyData.originalPrice : bodyData.original_price,
          description: bodyData.description,
          condition: bodyData.condition,
          brand: bodyData.brand,
          category: bodyData.category,
          stock: bodyData.stock,
          weight: bodyData.weight,
          material: bodyData.material,
          tags: bodyData.tags || [],
          status: bodyData.status || 'published',
          shopeeLink: bodyData.shopeeLink !== undefined ? bodyData.shopeeLink : bodyData.shopee_link,
          photos: bodyData.photos || [],
          variants: bodyData.variants || [],
          createdAt: bodyData.createdAt || new Date().toISOString()
        };

        const idx = products.findIndex(p => p.id === newProduct.id);
        if (idx >= 0) {
          products[idx] = newProduct;
        } else {
          products.push(newProduct);
        }

        await redisClient.set('products', JSON.stringify(products));
        return res.status(200).json({ status: 'success', product: newProduct });
      }
    }

    if (path.startsWith('/api/products/')) {
      if (req.method === 'DELETE') {
        const id = path.split('/').pop();
        const prodRaw = await redisClient.get('products');
        let products = [];
        if (prodRaw) {
          try {
            products = JSON.parse(prodRaw);
          } catch (e) {}
        }
        const filtered = products.filter(p => p.id !== id);
        await redisClient.set('products', JSON.stringify(filtered));
        return res.status(200).json({ status: 'success' });
      }
    }

    // ─── 2. CHATS ENDPOINTS ──────────────────────────────────────────────────
    if (path === '/api/chats') {
      if (req.method === 'GET') {
        const chatRaw = await redisClient.get('chats');
        let chats = [];
        if (chatRaw) {
          try {
            chats = JSON.parse(chatRaw);
          } catch (e) {}
        }
        const cleanedChats = filterOldChats(chats);
        if (cleanedChats.length !== chats.length) {
          await redisClient.set('chats', JSON.stringify(cleanedChats));
          chats = cleanedChats;
        }
        return res.status(200).json(chats);

      } else if (req.method === 'POST') {
        const sess = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const chatRaw = await redisClient.get('chats');
        let chats = [];
        if (chatRaw) {
          try {
            chats = JSON.parse(chatRaw);
          } catch (e) {}
        }
        const idx = chats.findIndex(c => c.sessionId === sess.sessionId);
        if (idx >= 0) {
          chats[idx] = {
            ...chats[idx],
            guestLabel: sess.guestLabel,
            lastActivity: sess.lastActivity || Date.now(),
            unreadByAdmin: sess.unreadByAdmin
          };
        } else {
          chats.push(sess);
        }
        const cleanedChats = filterOldChats(chats);
        await redisClient.set('chats', JSON.stringify(cleanedChats));
        return res.status(200).json({ status: 'success' });
      }
    }

    if (path.startsWith('/api/chats/') && path.endsWith('/message')) {
      if (req.method === 'POST') {
        const parts = path.split('/');
        const sessionId = parts[parts.length - 2];
        const msg = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        const chatRaw = await redisClient.get('chats');
        let chats = [];
        if (chatRaw) {
          try {
            chats = JSON.parse(chatRaw);
          } catch (e) {}
        }

        const idx = chats.findIndex(c => c.sessionId === sessionId);
        if (idx >= 0) {
          const messages = chats[idx].messages || [];
          if (!messages.find(m => m.id === msg.id)) {
            messages.push(msg);
          }
          chats[idx].messages = messages;
          chats[idx].lastActivity = Date.now();
          if (msg.from === 'guest') {
            chats[idx].unreadByAdmin = (chats[idx].unreadByAdmin || 0) + 1;
          }
        }
        await redisClient.set('chats', JSON.stringify(chats));
        return res.status(200).json({ status: 'success' });
      }
    }

    if (path.startsWith('/api/chats/')) {
      if (req.method === 'DELETE') {
        const sessionId = path.split('/').pop();
        const chatRaw = await redisClient.get('chats');
        let chats = [];
        if (chatRaw) {
          try {
            chats = JSON.parse(chatRaw);
          } catch (e) {}
        }
        const filtered = chats.filter(c => c.sessionId !== sessionId);
        await redisClient.set('chats', JSON.stringify(filtered));
        return res.status(200).json({ status: 'success' });
      }
    }

    // ─── 3. VISITORS ENDPOINTS ───────────────────────────────────────────────
    if (path === '/api/visitors') {
      if (req.method === 'GET') {
        const visitorRaw = await redisClient.get('visitors');
        let visitors = null;
        if (visitorRaw) {
          try {
            visitors = JSON.parse(visitorRaw);
          } catch (e) {}
        }
        return res.status(200).json(visitors);

      } else if (req.method === 'POST') {
        const visitors = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        await redisClient.set('visitors', JSON.stringify(visitors));
        return res.status(200).json({ status: 'success' });
      }
    }

    return res.status(404).json({ error: 'Endpoint not found' });
  } catch (err) {
    console.error("Redis Handler Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
