import { generateEmbedding } from './embedding';
import { callGemini } from './gemini';
import { db } from './db';
import { ContextFrame, Message, QueryRequest, QueryResponse } from './types';

function normalizeQuery(message: string): { text: string; intent: string; tags: string[] } {
  const lower = message.toLowerCase();
  let intent = 'general';
  const tags: string[] = [];
  
  if (lower.includes('axiom') || lower.includes('hive') || lower.includes('deterministic')) {
    intent = 'axiom_hive';
    tags.push('axiom', 'deterministic', 'architecture');
  } else if (lower.includes('pocket') || lower.includes('auditor') || lower.includes('hash')) {
    intent = 'pocket_auditor';
    tags.push('auditor', 'verification', 'crypto');
  } else if (lower.includes('gem') || lower.includes('gemini') || lower.includes('prompt')) {
    intent = 'gemini_design';
    tags.push('gemini', 'prompt', 'agent');
  } else if (lower.includes('code') || lower.includes('implement') || lower.includes('build')) {
    intent = 'coding';
    tags.push('code', 'implementation');
  }
  
  return { text: message.trim(), intent, tags };
}

function scoreCandidate(candidate: Message, query: { text: string; intent: string; tags: string[] }): number {
  let score = 0;
  const candidateLower = candidate.content.toLowerCase();
  
  if (query.intent === 'axiom_hive' && candidateLower.includes('axiom')) score += 10;
  if (query.intent === 'pocket_auditor' && candidateLower.includes('auditor')) score += 10;
  if (query.intent === 'gemini_design' && candidateLower.includes('gem')) score += 10;
  
  query.tags.forEach(tag => {
    if (candidateLower.includes(tag)) score += 2;
  });
  
  if (candidateLower.includes('spec') || candidateLower.includes('schema') || candidateLower.includes('contract')) {
    score += 5;
  }
  
  return score;
}

function synthesizeContextFrame(candidates: Message[], query: { text: string; intent: string }): string {
  const specs = candidates
    .filter(m => m.content.includes('spec') || m.content.includes('schema') || m.content.includes('contract'))
    .slice(0, 3)
    .map(m => `- ${m.content.substring(0, 100)}...`);
  
  const decisions = candidates
    .filter(m => m.content.includes('must') || m.content.includes('never') || m.content.includes('always'))
    .slice(0, 3)
    .map(m => `- ${m.content.substring(0, 100)}...`);
  
  return `USER CONTEXT:
Intent: ${query.intent}
Relevant Specifications:
${specs.join('\n') || 'None found'}

Recent Decisions/Constraints:
${decisions.join('\n') || 'None found'}

Current Query: ${query.text}

INSTRUCTIONS:
- Answer strictly based on the above context and specifications.
- If context is insufficient, ask clarifying questions.
- Never contradict recorded decisions or specifications.
- Explicitly state when using prior context.`;
}

export async function processQuery(req: QueryRequest): Promise<QueryResponse> {
  const { userId, message, conversationId } = req;
  
  const normalized = normalizeQuery(message);
  const embedding = await generateEmbedding(normalized.text);
  
  const candidates = await db.getSimilarMessages(userId, embedding, 20);
  const scored = candidates.map(c => ({ ...c, score: scoreCandidate(c, normalized) }));
  const topCandidates = scored
    .sort((a, b) => b.score - a.score)
    .filter(c => c.score > 5)
    .slice(0, 5);
  
  const contextFrame = synthesizeContextFrame(topCandidates, normalized);
  
  const convId = conversationId || `conv_${Date.now()}`;
  if (!conversationId) {
    await db.createConversation(userId, convId, message.substring(0, 50));
  }
  
  const recentHistory = await db.getRecentMessages(convId, 5);
  
  const userMessage: Message = {
    id: `msg_${Date.now()}_user`,
    conversationId: convId,
    role: 'user',
    content: message,
    createdAt: new Date(),
    embedding,
  };
  await db.insertMessage(userMessage);
  
  const answer = await callGemini(
    'You are a deterministic engine. Always respect the provided context frame and never contradict prior constraints.',
    recentHistory,
    contextFrame,
    message
  );
  
  const assistantMessage: Message = {
    id: `msg_${Date.now()}_assistant`,
    conversationId: convId,
    role: 'assistant',
    content: answer,
    createdAt: new Date(),
  };
  await db.insertMessage(assistantMessage);
  
  return {
    answer,
    conversationId: convId,
    contextSummary: `Used ${topCandidates.length} prior messages. Intent: ${normalized.intent}.`,
  };
}
