export default async function handler(req, res) {
  // CORS headers so web clients can call it from anywhere
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 1. If user configured Metered credentials in Vercel environment variables
  const meteredApp = process.env.METERED_APP || process.env.VITE_METERED_APP;
  const meteredKey = process.env.METERED_KEY || process.env.VITE_METERED_KEY;

  if (meteredApp && meteredKey) {
    try {
      const response = await fetch(
        `https://${meteredApp}.metered.live/api/v1/turn/credentials?apiKey=${meteredKey}`
      );
      if (response.ok) {
        const iceServers = await response.json();
        return res.status(200).json(iceServers);
      }
    } catch (err) {
      console.warn('Metered dynamic fetch error:', err);
    }
  }

  // 2. Reliable STUN + TURNS fallback (Google STUN + Metered OpenRelay TCP/TLS on port 443)
  return res.status(200).json([
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: [
        'turn:openrelay.metered.ca:443?transport=tcp',
        'turns:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ]);
}

