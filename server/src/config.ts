import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL!,
  geminiApiKey: process.env.GEMINI_API_KEY!,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-004',
} as const;
