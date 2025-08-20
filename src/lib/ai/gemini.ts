import { GoogleGenerativeAI } from '@google/generative-ai';

export function getGemini(
  model: 'gemini-2.0-flash' | 'gemini-1.5-pro' = 'gemini-2.0-flash'
) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY!;
  if (!apiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY environment variable is not set');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model });
}
