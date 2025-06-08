/**
 * Configuration for backend routing and model endpoints
 * Used in /api/generate.ts and other backend integrations
 */

export const USE_HUGGINGFACE: boolean =
  process.env.NEXT_PUBLIC_USE_HUGGINGFACE === 'true'; // Set in .env.local

// Hugging Face Inference API endpoint
export const HUGGINGFACE_MODEL_URL: string =
  'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1';

// Stable Diffusion WebUI local endpoint
export const STABLE_DIFFUSION_URL: string =
  'http://127.0.0.1:7860/sdapi/v1/txt2img';
