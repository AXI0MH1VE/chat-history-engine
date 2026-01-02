import express from 'express';
import { config } from './config';
import { db } from './db';
import { processQuery } from './chatEngine';
import { QueryRequestSchema, QueryResponseSchema } from './types';

const app = express();
app.use(express.json());

app.post('/api/query', async (req, res) => {
  try {
    const parsed = QueryRequestSchema.parse(req.body);
    const result = await processQuery(parsed);
    res.json(QueryResponseSchema.parse(result));
  } catch (error) {
    console.error('Query error:', error);
    res.status(400).json({ error: 'Invalid request or processing failed' });
  }
});

app.get('/api/context', async (req, res) => {
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId required' });
  }
  res.json({ message: 'Context inspection endpoint. Use /api/query for full context.' });
});

app.get('/api/conversations', async (req, res) => {
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId required' });
  }
  res.json({ message: 'Conversation list endpoint. Implement DB query as needed.' });
});

app.listen(config.port, async () => {
  await db.init();
  console.log(`Chat History Engine running on port ${config.port}`);
});
