# Smart Search

**Semantic product search for e-commerce, powered by AI.**

Smart Search indexes your product catalog — from any web source — and exposes a semantic search engine that understands what shoppers are actually looking for, not just the words they type.

A shopper searching _"something warm for a rainy hike under $100"_ gets relevant waterproof jackets and trail boots. A classic keyword search returns nothing.

Built as a full-stack platform: an end-to-end content processing pipeline (crawl → parse → summarize → index) and a React admin dashboard — all backed by a REST API.

---

## How it works

Content flows through two parallel pipelines:

**Pipeline A — Pages** (main search pipeline)

```
Finder        →  Parser         →  Summarizer      →  Indexer         →  Searcher
URL discovery    HTML → JSON       LLM summary         Pinecone             Vector
                 extraction        + parameters         vector store         search
     ↓               ↓                  ↓                   ↓                  ↓
  [pages]    [structured_pages]    [documents]          [vectors P*]       [results]
```

**Pipeline B — Taxonomies** (semantic classification)

```
Taxonomy Value  →  Human Approval  →  LLM Document  →  Taxonomy Indexer
                                                              ↓
                                                        [vectors T*]
```

Each pipeline stage is independently operable via the REST API or the admin dashboard.

---

## Why semantic search beats keyword search

| Scenario | Keyword search | Smart Search |
|----------|---------------|-------------|
| _"running shoes for a rainy day"_ | No results (no exact match) | Returns waterproof and trail running shoes |
| _"something to gift a photographer"_ | No results | Camera bags, tripods, memory cards |
| _"lightweight laptop to take to work"_ | Matches "laptop" + "work" literally | Ultrabooks with good weight and battery life |
| _"office chair for tall people"_ | Only if the product page says "tall" | Chairs with adjustable height and lumbar support |

Classic search engines compare words. Smart Search compares **meanings** — it understands synonyms, context, implicit attributes, and the intent behind the query.

---

## Features

- **Semantic Search** — Vector similarity search (Pinecone + OpenAI embeddings) with automatic LLM-based query enhancement before searching.
- **Structured Content Extraction** — Configurable HTML parser with blueprints that extracts typed fields (text, price, date, image, etc.) from any page structure.
- **LLM Summarization** — Per-account configurable prompts that generate rich documents and filterable parameters from each product.
- **Taxonomy Classification** — Hierarchical product classification with a human approval workflow and a dedicated vector namespace.
- **Multi-Account / Multi-Source** — Each account has its own Pinecone namespace; categories and prompts are configured independently.
- **React Admin Dashboard** — Full administration UI: URL ingestion, pipeline control, live search, taxonomy approval, and prompt management.
- **REST API** — FastAPI with 18 endpoint families, interactive Swagger/ReDoc docs, RFC 7807 error responses, and CORS support.
- **Multi-Model LLM** — OpenRouter allows switching LLM providers without code changes; LangChain handles orchestration.
- **Error Monitoring** — Sentry integration for error tracking and production alerts.

---

## Tech Stack

### Backend

| Technology | Role |
|------------|------|
| Python 3.12 | Language |
| FastAPI + Uvicorn | REST API framework & ASGI server |
| MySQL 8.4 | Relational database |
| Pinecone | Vector store for semantic search |
| OpenAI | Embeddings (`text-embedding-3-small/large`) |
| OpenRouter | Multi-model LLM gateway |
| LangChain | LLM orchestration & prompt management |
| Pydantic v2 | Data validation & settings |
| BeautifulSoup | HTML parsing |
| Sentry SDK | Error tracking |

### Frontend

| Technology | Role |
|------------|------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| shadcn/ui + Radix UI | Component library |
| Tailwind CSS | Utility-first styling |
| TanStack Query | Server state management |
| React Router v6 | Client-side routing |
| React Hook Form + Zod | Forms & validation |
| Recharts | Data visualization |
| Axios | HTTP client |

---

## Admin Dashboard

The React dashboard provides full control over the platform without touching the API directly.

| Page | Purpose |
|------|---------|
| **Dashboard** | Account overview, pipeline metrics, and recent activity |
| **Accounts** | Create and manage content sources |
| **Pipeline** | Trigger and monitor processing stages (finder → indexer) |
| **Search** | Interactive semantic search with filters and similarity controls |
| **Taxonomies** | Manage taxonomy values and approve/reject LLM classifications |
| **Pages** | Browse scraped pages and inspect their processing state |
| **Documents** | View and manage LLM-generated summaries |
| **Prompts** | Configure page and taxonomy prompts with fallback/override logic |

---

## API

The REST API exposes 18 endpoint families with full OpenAPI documentation:

- `GET /health` — System health and dependency status
- `POST /search` — Semantic search with query enhancement and metadata filtering
- `POST /finder` — Insert URLs into the processing queue
- `POST /parser` — Parse pending pages into structured data
- `POST /summarizer` — Generate LLM documents from structured pages
- `POST /indexer` — Index documents as vectors in Pinecone
- `/accounts`, `/categories`, `/taxonomies`, `/documents`, `/pages`, `/stats`, and more

Interactive docs available at `/docs` (Swagger UI) and `/redoc` (ReDoc) when the server is running.

---

## Use Cases

- **Your own e-commerce** — Index your product catalog and replace the native search with semantic search: customers find what they're looking for even if they don't use the exact words.
- **Comparison sites and marketplaces** — Index products from multiple stores (one account per source) with their own parsing rules and unified taxonomies.
- **Niche search engines** — Travel, real estate, food: any catalog with complex attributes benefits from meaning-based search over keyword matching.
- **Content portals** — Automatically classify and summarize editorial content for contextual search and recommendations.

---

## Project Status

Active development. The core pipeline (finder → parser → summarizer → indexer → searcher) and the admin dashboard are fully operational.

---

## License

Private — all rights reserved.

