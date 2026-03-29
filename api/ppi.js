// Vercel Serverless Function — proxy para PPI API
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const PPI_BASE = 'https://clientapi.portfoliopersonal.com';
  const { path, ...queryParams } = req.query;
  
  // Construir URL destino
  const apiPath = path || '';
  const qString = new URLSearchParams(queryParams).toString();
  const targetUrl = `${PPI_BASE}${apiPath}${qString ? '?' + qString : ''}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'AuthorizedClient': process.env.PPI_AUTHORIZED_CLIENT,
        'ClientKey': process.env.PPI_CLIENT_KEY,
      }
    };

    // Para POST (login/refresh), pasar el body
    if (req.method === 'POST' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    // Si viene Authorization token, pasarlo
    if (req.headers.authorization) {
      fetchOptions.headers['Authorization'] = req.headers.authorization;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
