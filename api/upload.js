import { put } from '@vercel/blob';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data } = req.body;
    if (!data || !data.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    // Extract mime type and base64 content
    const matches = data.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid base64 format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > MAX_SIZE) {
      return res.status(413).json({ error: 'Image exceeds 5MB limit' });
    }

    const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
    const filename = `images/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const blob = await put(filename, buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: mimeType,
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Failed to upload image:', err);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
}
