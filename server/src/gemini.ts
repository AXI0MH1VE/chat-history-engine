import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';
import { Message } from './types';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export async function callGemini(
  systemPrompt: string,
  history: Message[],
  contextFrame: string,
  newMessage: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: config.geminiModel });
  
  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: `SYSTEM CONTEXT:\n${contextFrame}` }] },
      { role: 'model', parts: [{ text: 'Context acknowledged. Ready to process user queries under constraints.' }] },
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    ],
  });

  const result = await chat.sendMessage(newMessage);
  return result.response.text();
}
