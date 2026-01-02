# Chat History Engine

A deterministic AI chat engine with semantic search, context-aware responses, and conversation history using PostgreSQL pgvector and Google Gemini API.

## Architecture

### Backend (Node.js + TypeScript + Express)
- **PostgreSQL with pgvector**: Vector similarity search for semantic message retrieval
- **Google Gemini 2.0 Flash**: LLM for generating responses
- **Text Embedding 004**: Google's embedding model for vector generation
- **Zod**: Runtime type validation and schema enforcement
- **Express**: REST API server

### Frontend (React Native + Expo)
- **Expo**: Cross-platform mobile framework
- **Axios**: HTTP client for API communication
- **TypeScript**: Type-safe React Native components

## Features

### Intelligent Context Retrieval
- **Intent Classification**: Automatically detects query intent (axiom_hive, pocket_auditor, gemini_design, coding, general)
- **Semantic Search**: Uses vector embeddings to find relevant historical messages
- **Scoring Algorithm**: Combines semantic similarity with keyword-based relevance scoring
- **Context Synthesis**: Extracts specifications, decisions, and constraints from conversation history

### Deterministic Constraints
- Context frames enforce consistency across conversations
- Never contradicts prior decisions or specifications
- Explicitly references historical context when making decisions
- Asks clarifying questions when context is insufficient

### Multi-User Support
- User-scoped conversation history
- Conversation threading and isolation
- Persistent message storage with timestamps

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ with pgvector extension
- Google Gemini API key
- Expo CLI (for mobile)

### Backend Setup

1. **Install PostgreSQL with pgvector**:
```bash
# macOS with Homebrew
brew install postgresql@15
brew install pgvector

# Start PostgreSQL
brew services start postgresql@15

# Create database
psql postgres -c "CREATE DATABASE chatdb;"
psql chatdb -c "CREATE EXTENSION vector;"
```

2. **Configure environment**:
```bash
cd server
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL: postgresql://user:pass@localhost:5432/chatdb
# - GEMINI_API_KEY: your_gemini_api_key
```

3. **Install dependencies and run**:
```bash
npm install
npm run dev
```

Server will start on http://localhost:3000

### Mobile Setup

1. **Install dependencies**:
```bash
cd mobile
npm install
```

2. **Update API endpoint** (if not running locally):
Edit `mobile/api.ts` and change `API_BASE` to your server URL.

3. **Start Expo**:
```bash
npm start
# Then scan QR code with Expo Go app (iOS/Android)
# Or press 'i' for iOS simulator, 'a' for Android emulator
```

## API Reference

### POST /api/query
Send a user message and get AI response with context.

**Request**:
```json
{
  "userId": "user_001",
  "message": "Explain Axiom Hive deterministic architecture",
  "conversationId": "conv_1234567890" // optional
}
```

**Response**:
```json
{
  "answer": "Axiom Hive is a deterministic AI framework...",
  "conversationId": "conv_1234567890",
  "contextSummary": "Used 5 prior messages. Intent: axiom_hive."
}
```

### GET /api/context?userId=user_001
Inspect user context (placeholder endpoint).

### GET /api/conversations?userId=user_001
List user conversations (placeholder endpoint).

## Database Schema

### conversations
```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### messages
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  role TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  embedding vector(768) -- Gemini text-embedding-004 dimension
);
```

## Deployment

### Backend (Railway/Render/Fly.io)
1. Set environment variables:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `PORT`
2. Deploy with:
```bash
npm run build
npm start
```

### Mobile (EAS Build)
```bash
cd mobile
npm install -g eas-cli
eas login
eas build --platform all
```

## Development Commands

### Backend
```bash
npm run dev      # Development with hot reload (tsx)
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled JavaScript
```

### Mobile
```bash
npm start        # Start Expo dev server
npm run android  # Start Android
npm run ios      # Start iOS
```

## Intent Classification

The engine automatically classifies queries into intents:
- **axiom_hive**: Queries about Axiom Hive framework, deterministic architecture
- **pocket_auditor**: Queries about auditing, verification, hash validation
- **gemini_design**: Queries about Gemini prompts, agent design
- **coding**: Queries about implementation, building, coding
- **general**: All other queries

## License

MIT License - See LICENSE file for details.

## Contributing

Contributions welcome! Please submit pull requests with:
- Clear commit messages
- Type-safe code (TypeScript strict mode)
- Zero-stub implementations (no placeholders)
- Tests for new features
