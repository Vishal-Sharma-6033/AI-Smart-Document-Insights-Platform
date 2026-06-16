# 🧠 Smart Document Insights

A production-style, full-stack **RAG (Retrieval-Augmented Generation)** platform. Upload PDFs,
process them asynchronously into vector embeddings, then ask context-aware questions and generate
structured AI summaries.

> Built with the MERN stack + a background processing pipeline + a vector database.

---

## ✨ Features

- 🔐 JWT auth with access + refresh token rotation (httpOnly cookie), role-ready for admin
- 📤 PDF upload with validation, stored on Cloudinary (or local disk fallback)
- ⚙️ Async processing via **BullMQ + Redis**: extract → chunk → embed → store vectors
- 🧩 Chunking with LangChain (`RecursiveCharacterTextSplitter`, 1000/200)
- 🧠 Embeddings via HuggingFace, vectors in **Pinecone** (user-namespaced)
- 💬 RAG question answering with an **OpenAI-compatible LLM** (OpenAI, Groq, Together…), returning `{ answer, sources }`
- 🧾 Structured summaries (executive summary, insights, findings, action items)
- ⚡ Redis caching for chat answers, summaries and document lists, with invalidation
- 🖥️ Modern React SaaS UI (Vite + Tailwind + TanStack Query) with skeletons, toasts, error states
- 🐳 Docker Compose stack + GitHub Actions CI

### Runs without paid keys
Every external service has a **dev fallback** — deterministic pseudo-embeddings, an in-memory
vector store, local-disk file storage, and a placeholder LLM — so you can run the entire flow
locally without an LLM / Pinecone / HuggingFace / Cloudinary account. Add real keys to unlock
real AI quality.

---

## 🏗️ Architecture

```
                 ┌───────────┐      ┌──────────────┐
   Browser ────▶ │  Frontend │ ───▶ │   Backend     │ ──▶ MongoDB (metadata, chats, users)
   (React)       │  (nginx)  │      │  (Express)    │ ──▶ Redis (cache + queue)
                 └───────────┘      └──────┬────────┘
                                           │ enqueue job
                                           ▼
                                    ┌──────────────┐
                                    │ BullMQ Worker│ ──▶ pdf-parse ▶ LangChain chunk
                                    └──────┬───────┘ ──▶ HF embeddings ▶ Pinecone upsert
                                           ▼
                                    status: ready
```

**Backend (clean architecture):** `routes → controllers → services → repositories → models`,
with `config`, `middlewares`, `queues`, `jobs`, and `utils` as cross-cutting layers.

```
backend/src/
  config/        env, db, redis, pinecone, cloudinary, openai, logger
  models/        User, Document, Chat
  repositories/  data-access wrappers
  services/      auth, document, storage, pdf, chunk, embedding, rag, summary, llm, cache
  controllers/   thin HTTP handlers
  routes/        auth, documents, ai, chat, health
  middlewares/   auth, validate, upload, error
  queues/        BullMQ queue + connection
  jobs/          document processor
  utils/         ApiError, asyncHandler, ApiResponse, jwt
  app.js / server.js / worker.js
```

---

## 🚀 Quick start (Docker — recommended)

```bash
cp .env.example .env
# Generate JWT secrets:
#   openssl rand -hex 32   (run twice, paste into JWT_ACCESS_SECRET / JWT_REFRESH_SECRET)
# Optionally add OPENAI_API_KEY (+ OPENAI_BASE_URL / OPENAI_MODEL), PINECONE_API_KEY,
#   HUGGINGFACE_API_KEY, CLOUDINARY_* keys.

docker compose up --build
```

- Frontend → http://localhost:8080
- Backend API → http://localhost:5000/api/health

## 🛠️ Local development (without Docker)

Prereqs: Node 20+, a running MongoDB and Redis (or use `docker compose up mongodb redis`).

```bash
# Backend
cd backend
cp .env.example .env        # fill JWT secrets (+ optional API keys)
npm install
npm run dev                 # API on :5000
npm run worker:dev          # in a second terminal — background processor

# Frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev                 # app on :5173 (proxies /api to :5000)
```

---

## 🔌 API Endpoints

All responses use the envelope `{ success, message, data }`. Protected routes require
`Authorization: Bearer <accessToken>`.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account, returns `{ user, accessToken }` (+ refresh cookie) |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Rotate refresh token → new access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET  | `/api/auth/me` | Current user |

### Documents
| Method | Path | Description |
|---|---|---|
| POST | `/api/documents/upload` | Multipart `file` (PDF). Queues processing |
| GET | `/api/documents` | List user documents (`?page&limit`) |
| GET | `/api/documents/:id` | Get one (includes status) |
| DELETE | `/api/documents/:id` | Delete document + vectors + chats |

### AI
| Method | Path | Description |
|---|---|---|
| POST | `/api/chat` | `{ documentId, question }` → `{ answer, sources }` (OpenAI-compatible LLM) |
| POST | `/api/summary` | `{ documentId }` → structured summary |

### Chats
| Method | Path | Description |
|---|---|---|
| GET | `/api/chats` | List chat history (`?documentId&page&limit`) |
| DELETE | `/api/chats/:id` | Delete a chat |

---

## 🔑 Environment Variables

See [`backend/.env.example`](backend/.env.example) for the full list. Highlights:

| Variable | Required | Notes |
|---|---|---|
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | ✅ | Generate with `openssl rand -hex 32` |
| `MONGODB_URI` | ✅ | MongoDB Atlas or local |
| `REDIS_URL` | ✅ | Cache + BullMQ |
| `OPENAI_API_KEY` | optional | OpenAI-compatible key; falls back to placeholder answers |
| `OPENAI_BASE_URL` | optional | e.g. `https://api.groq.com/openai/v1` for Groq; empty = OpenAI |
| `OPENAI_MODEL` | optional | e.g. `llama-3.3-70b-versatile` (Groq) or `gpt-4o-mini` |
| `HUGGINGFACE_API_KEY` | optional | Falls back to dev pseudo-embeddings |
| `PINECONE_API_KEY`, `PINECONE_INDEX` | optional | Falls back to in-memory vectors |
| `CLOUDINARY_*` | optional | Falls back to local-disk storage |

> **Pinecone setup:** create an index with **dimension `384`** (matches
> `all-MiniLM-L6-v2`) and **metric `cosine`**. Set `EMBEDDING_DIMENSION` if you change models.

---

## 🧪 Testing & CI

```bash
cd backend && npm test       # vitest: jwt, chunking, health/API
cd frontend && npm run build # type-free build check
```

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR: backend lint + tests,
frontend lint + build, and verifies both Docker images build.

---

## 🌐 Deployment

- **Backend + worker:** deploy the `backend` image (same image, override the command to
  `node src/worker.js` for the worker). Set all env vars; point `MONGODB_URI` at Atlas and
  `REDIS_URL` at a managed Redis.
- **Frontend:** build the `frontend` image (static files served by nginx) and set
  `VITE_API_URL`/proxy to your backend.
- Put both behind HTTPS; in production refresh cookies are `Secure` + `SameSite=strict`.

---

## 📄 License

MIT
