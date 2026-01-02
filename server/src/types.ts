import { z } from 'zod';

export const MessageRole = z.enum(['user', 'assistant', 'system']);
export type MessageRole = z.infer<typeof MessageRole>;

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: MessageRole,
  content: z.string(),
  createdAt: z.date(),
  embedding: z.array(z.number()).optional(),
});
export type Message = z.infer<typeof MessageSchema>;

export const QueryRequestSchema = z.object({
  userId: z.string(),
  message: z.string(),
  conversationId: z.string().optional(),
});
export type QueryRequest = z.infer<typeof QueryRequestSchema>;

export const ContextFrameSchema = z.object({
  userLongTermGoals: z.string(),
  currentProject: z.string().optional(),
  relevantSpecs: z.array(z.string()),
  recentDecisions: z.array(z.string()),
  openThreads: z.array(z.string()),
});
export type ContextFrame = z.infer<typeof ContextFrameSchema>;

export const QueryResponseSchema = z.object({
  answer: z.string(),
  conversationId: z.string(),
  contextSummary: z.string(),
});
export type QueryResponse = z.infer<typeof QueryResponseSchema>;
