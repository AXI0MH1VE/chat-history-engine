import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export interface QueryRequest {
  userId: string;
  message: string;
  conversationId?: string;
}

export interface QueryResponse {
  answer: string;
  conversationId: string;
  contextSummary: string;
}

export async function sendQuery(req: QueryRequest): Promise<QueryResponse> {
  const response = await axios.post(`${API_BASE}/query`, req);
  return response.data;
}
