import { list, put } from '@vercel/blob';

const BLOB_PATH = 'content/data.json';

export default async function handler(req, res) {
  // Never cache content responses — edits must be visible immediately in every browser
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
      if (blobs.length === 0) {
        return res.status(200).json({});
      }
      // Cache-bust the blob URL so we always get the latest version after an overwrite
      const bustUrl = `${blobs[0].url}?t=${Date.now()}`;
      const response = await fetch(bustUrl, { cache: 'no-store' });
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      console.error('Failed to read content blob:', err);
      return res.status(200).json({});
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      // Defensive: refuse to overwrite with empty payloads
      let parsed;
      try { parsed = JSON.parse(body); } catch { parsed = null; }
      if (!parsed || typeof parsed !== 'object' || Object.keys(parsed).length === 0) {
        return res.status(400).json({ error: 'Refusing to save empty content' });
      }
      await put(BLOB_PATH, body, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 0,
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Failed to write content blob:', err);
      return res.status(500).json({ error: 'Failed to save content' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
