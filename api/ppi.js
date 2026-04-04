export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AuthorizedClient, ClientKey');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const PPI_BASE = 'https://clientapi.portfoliopersonal.com';
  const { path, ...queryParams } = req.query;
  const qString = new URLSearchParams(queryParams).toString();
  const targetUrl = `${PPI_BASE}${path || ''}${qString ? '?' + qString : ''}`;

  const AC = process.env.PPI_AUTHORIZED_CLIENT || 'API_CLI_REST';
  const CK = process.env.PPI_CLIENT_KEY || 'pp19CliApp12';

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'AuthorizedClient': AC,
        'ClientKey': CK,
      }
    };

    if (req.method === 'POST' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    if (req.headers.authorization) {
      fetchOptions.headers['Authorization'] = req.headers.authorization;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();
    
    // Log para debug
    console.log('URL:', targetUrl);
    console.log('Status:', response.status);
    console.log('Response:', text.slice(0, 200));

    try {
      res.status(response.status).json(JSON.parse(text));
    } catch(e) {
      res.status(response.status).json({ raw: text, status: response.status });
    }
  } catch (error) {
    res.status(500).json({ error: error.message, url: targetUrl });
  }
}
