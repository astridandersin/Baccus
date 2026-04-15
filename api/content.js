import { list, put } from '@vercel/blob';

const BLOB_PATH = 'content/data.json';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
      if (blobs.length === 0) {
        return res.status(200).json({});
      }
      const response = await fetch(blobs[0].url);
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
      await put(BLOB_PATH, body, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Failed to write content blob:', err);
      return res.status(500).json({ error: 'Failed to save content' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
