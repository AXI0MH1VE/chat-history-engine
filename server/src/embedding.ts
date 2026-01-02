import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: config.embeddingModel });
  const result = await model.embedContent(text);
  return result.embedding.values;
}
