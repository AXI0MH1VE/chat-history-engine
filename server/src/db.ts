import { Pool } from 'pg';
import pgvector from 'pgvector/pg';
import { config } from './config';
import { Message } from './types';

const pool = new Pool({ connectionString: config.databaseUrl });

pgvector.registerType();

export const db = {
  async init() {
    const client = await pool.connect();
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');
      await client.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL REFERENCES conversations(id),
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          embedding vector(768)
        )
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_messages_user_role ON messages(conversation_id, role)
      `);
    } finally {
      client.release();
    }
  },

  async createConversation(userId: string, conversationId: string, title?: string) {
    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO conversations (id, user_id, title) VALUES ($1, $2, $3)',
        [conversationId, userId, title || 'New Chat']
      );
    } finally {
      client.release();
    }
  },

  async insertMessage(msg: Message) {
    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO messages (id, conversation_id, role, content, embedding) VALUES ($1, $2, $3, $4, $5)',
        [msg.id, msg.conversationId, msg.role, msg.content, msg.embedding ? pgvector.toSql(msg.embedding) : null]
      );
    } finally {
      client.release();
    }
  },

  async getSimilarMessages(userId: string, embedding: number[], limit: number = 10): Promise<Message[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT m.id, m.conversation_id, m.role, m.content, m.created_at
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE c.user_id = $1 AND m.role = 'user'
         ORDER BY m.embedding <=> $2
         LIMIT $3`,
        [userId, pgvector.toSql(embedding), limit]
      );
      return result.rows.map(row => ({
        id: row.id,
        conversationId: row.conversation_id,
        role: row.role,
        content: row.content,
        createdAt: row.created_at,
      }));
    } finally {
      client.release();
    }
  },

  async getRecentMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, conversation_id, role, content, created_at
         FROM messages
         WHERE conversation_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [conversationId, limit]
      );
      return result.rows.map(row => ({
        id: row.id,
        conversationId: row.conversation_id,
        role: row.role,
        content: row.content,
        createdAt: row.created_at,
      })).reverse();
    } finally {
      client.release();
    }
  },
};
