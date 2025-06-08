import type { NextApiRequest, NextApiResponse } from 'next';
import { USE_HUGGINGFACE, HUGGINGFACE_MODEL_URL, STABLE_DIFFUSION_URL } from '../../lib/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  res.setHeader('Content-Type', 'application/json');

  try {
    if (USE_HUGGINGFACE) {
      if (!process.env.HUGGINGFACE_API_KEY) {
        return res.status(500).json({ error: 'Missing Hugging Face API key in environment' });
      }

      let hfRes: Response;
      let retries = 2;

      while (retries--) {
        hfRes = await fetch(HUGGINGFACE_MODEL_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: prompt }),
        });

        if (hfRes.ok) break;
        await new Promise((r) => setTimeout(r, 1000)); // 1s delay before retry
      }

      if (!hfRes!.ok) {
        const errText = await hfRes!.text();
        throw new Error(`Hugging Face error: ${errText}`);
      }

      const blob = await hfRes!.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      res.setHeader('X-Backend-Used', 'huggingface');
      return res.status(200).json({
        success: true,
        backend: 'huggingface',
        image: `data:image/png;base64,${base64}`,
      });

    } else {
      const sdRes = await fetch(STABLE_DIFFUSION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          steps: 20,
          width: 512,
          height: 512,
        }),
      });

      if (!sdRes.ok) {
        const errText = await sdRes.text();
        throw new Error(`Stable Diffusion WebUI error: ${errText}`);
      }

      const data = await sdRes.json();
      const base64 = data.images[0];

      res.setHeader('X-Backend-Used', 'webui');
      return res.status(200).json({
        success: true,
        backend: 'webui',
        image: `data:image/png;base64,${base64}`,
      });
    }
  } catch (err: any) {
    console.error('Image generation failed:', err);
    return res.status(500).json({ error: err.message || 'Image generation failed' });
  }
}
