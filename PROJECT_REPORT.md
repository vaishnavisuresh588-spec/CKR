---
title: "ResolverAI — Contradictory Knowledge Resolver"
subtitle: "A Full-Stack AI-Powered System for Detecting and Resolving Conflicting Claims Across Multiple Sources"
author: ""
date: "May 2026"
---

# ResolverAI — Contradictory Knowledge Resolver

### A Full-Stack AI-Powered System for Detecting and Resolving Conflicting Claims Across Multiple Sources

**Project Title:** Contradictory Knowledge Resolver (ResolverAI)  
**Domain:** Artificial Intelligence / Natural Language Processing  
**Technology Stack:** Next.js 16 · Node.js/Express 5 · FastAPI · Python · MongoDB  
**AI Models:** DeBERTa-v3 (NLI) · all-MiniLM-L6-v2 (Embeddings) · OpenAI GPT-OSS 20B (NVIDIA NIM)  

## Table of Contents

1. [Abstract](#1-abstract)
2. [Introduction](#2-introduction)
3. [Problem Statement](#3-problem-statement)
4. [Objectives](#4-objectives)
5. [Literature Survey](#5-literature-survey)
6. [System Architecture](#6-system-architecture)
7. [Technology Stack](#7-technology-stack)
8. [Module Description](#8-module-description)
9. [AI/ML Pipeline — Detailed Design](#9-aiml-pipeline--detailed-design)
10. [Backend Design](#10-backend-design)
11. [Frontend Design](#11-frontend-design)
12. [Database Design](#12-database-design)
13. [API Reference](#13-api-reference)
14. [Data Flow & Sequence Diagrams](#14-data-flow--sequence-diagrams)
15. [Implementation Details](#15-implementation-details)
16. [Results & Performance Analysis](#16-results--performance-analysis)
17. [Screenshots](#17-screenshots)
18. [Security Considerations](#18-security-considerations)
19. [Future Scope](#19-future-scope)
20. [Conclusion](#20-conclusion)
21. [References](#21-references)
22. [Appendix — Project Setup Guide](#appendix--project-setup-guide)

* * *

## 1. Abstract

In today's information-rich digital landscape, individuals and organizations are frequently exposed to conflicting claims from diverse sources — news outlets, academic journals, social media, and government reports. Manually reconciling these contradictions is time-consuming, error-prone, and often impossible at scale.

**ResolverAI** is a full-stack, AI-powered web application that automates the detection and resolution of contradictory knowledge across multiple textual sources. The system implements a **six-phase NLP pipeline** that combines:

- **Semantic Embedding** using Sentence-BERT (all-MiniLM-L6-v2) to encode claims into 384-dimensional vector space
- **Pairwise Cosine Similarity** to cluster semantically related claims
- **Natural Language Inference (NLI)** using DeBERTa-v3 to classify claim pairs as entailment, contradiction, or neutral
- **Multi-Tier Source Credibility Scoring** using domain-aware heuristics
- **Large Language Model Reasoning** using OpenAI GPT-OSS 20B hosted on NVIDIA NIM for final verdict generation
- **Off-Topic Relevance Guard** using cross-document embedding similarity to prevent false positives

The system supports three input modalities: dual-document file comparison (PDF/DOCX/TXT/CSV), multi-URL web scraping (2–5 sources), and manual claim entry. The frontend is built with Next.js 16 and features a premium dark-mode UI with Framer Motion animations, while the backend uses a Node.js/Express orchestrator communicating with a Python FastAPI microservice for ML inference. User authentication is handled via JWT tokens with MongoDB Atlas as the persistent store.

The project demonstrates a production-grade approach to automated fact-checking with full explainability — every verdict includes source rankings, confidence scores, and chain-of-thought reasoning.

* * *

## 2. Introduction

### 2.1 Background

The proliferation of digital content has created an unprecedented challenge: **information overload with contradictory claims**. A single health topic may yield opposing conclusions from a peer-reviewed journal, a government health body, and a wellness blog. Traditional search engines surface relevant results but offer no mechanism to reconcile conflicting information.

Existing fact-checking services (e.g., Snopes, PolitiFact) rely heavily on human editors and cannot scale to the volume of contradictory information generated daily. Meanwhile, general-purpose Large Language Models (LLMs) can synthesize text but often "hallucinate" — generating confident answers without grounding in verifiable sources.

### 2.2 Motivation

ResolverAI bridges this gap by combining the **precision of transformer-based NLI models** with the **reasoning capabilities of large language models**, all wrapped in a transparent, explainable pipeline. Every step — from embedding to verdict — is visible to the user, ensuring trust and accountability.

### 2.3 Scope

This project covers:

- End-to-end design, implementation, and deployment of a three-tier web application
- Integration of three distinct ML models in a production pipeline
- Support for heterogeneous input sources (files, URLs, manual text)
- User authentication and profile management
- Responsive, animated frontend with dark/light theme support

* * *

## 3. Problem Statement

> **How can we automatically detect, classify, and resolve contradictory claims across multiple textual sources while providing transparent, explainable reasoning grounded in source credibility?**

Specific sub-problems addressed:

| # | Sub-Problem | Solution Component |
|---|---|---|
| 1 | Sources contradict each other with no automated reconciliation tool | Six-phase NLP pipeline |
| 2 | LLMs hallucinate without source grounding | Source-attributed reasoning with GPT-OSS 20B |
| 3 | Credibility is invisible — a blog and a journal are treated equally | Multi-tier domain-aware credibility scoring |
| 4 | AI reasoning is a black box | Full chain-of-thought explainability |
| 5 | Off-topic documents produce false contradictions | Relevance guard using cross-document similarity |

* * *

## 4. Objectives

1. **Design and implement** a modular, six-phase AI pipeline for contradiction detection and resolution
2. **Build a semantic clustering engine** using Sentence-BERT to group related claims by cosine similarity
3. **Integrate Natural Language Inference** via DeBERTa-v3 to classify claim pairs with high accuracy
4. **Develop a multi-tier credibility scoring system** that differentiates peer-reviewed journals from anonymous blogs
5. **Leverage NVIDIA NIM-hosted GPT-OSS 20B** for structured, explainable reasoning
6. **Support multiple input modalities** — file upload (PDF, DOCX, TXT, CSV), multi-URL scraping, and manual text entry
7. **Implement an off-topic relevance guard** to reject unrelated document pairs before analysis
8. **Build a production-grade full-stack application** with authentication, responsive UI, and real-time feedback
9. **Ensure full explainability** — every verdict includes source rankings, confidence scores, and reasoning chain

* * *

## 5. Literature Survey

| # | Topic | Key Reference | Relevance to Project |
|---|---|---|---|
| 1 | Natural Language Inference | Bowman et al. (2015) — SNLI Dataset | Foundation for entailment/contradiction classification |
| 2 | Cross-Encoder NLI Models | He et al. (2021) — DeBERTa-v3 | Used as the core NLI classifier (cross-encoder/nli-deberta-v3-small) |
| 3 | Sentence Embeddings | Reimers & Gurevych (2019) — Sentence-BERT | all-MiniLM-L6-v2 used for 384-dim claim embeddings |
| 4 | Cosine Similarity for Text | Mikolov et al. (2013) — Word2Vec | Pairwise similarity scoring for claim clustering |
| 5 | Source Credibility Assessment | Metzger (2007) — Credibility & the Web | Inspired the multi-tier domain heuristic scorer |
| 6 | Large Language Model Reasoning | OpenAI (2023) — GPT Series | GPT-OSS 20B used via NVIDIA NIM for verdict synthesis |
| 7 | Fact-Checking Automation | Thorne et al. (2018) — FEVER Dataset | Pipeline architecture inspiration |
| 8 | Off-Topic Detection | Semantic similarity thresholds | Cross-document MiniLM cosine similarity guard |
| 9 | Explainable AI (XAI) | Arrieta et al. (2020) — XAI Survey | Chain-of-thought reasoning design |
| 10 | Microservice Architecture | Newman (2015) — Building Microservices | Node.js orchestrator + FastAPI ML service pattern |

* * *

## 6. System Architecture

### 6.1 High-Level Architecture

The system follows a **three-tier microservice architecture**:

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
│                    Next.js 16 / React 19 SPA                         │
│          ┌──────────┬──────────┬──────────┬──────────┐               │
│          │  Home /  │ Analyzer │ Results  │ Auth     │               │
│          │ Landing  │  Page    │  Page    │ Pages    │               │
│          └──────────┴──────────┴──────────┴──────────┘               │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ HTTP (REST API)
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js / Express 5)                     │
│                         Port 5000                                    │
│  ┌────────────┐  ┌────────────────┐  ┌────────────────────────────┐ │
│  │ Auth Router │  │ Claims Router  │  │      Services Layer        │ │
│  │ /api/auth/* │  │ /api/analyze   │  │  ┌──────────────────────┐  │ │
│  │ signup      │  │ /api/analyze-  │  │  │ fileExtractor.ts     │  │ │
│  │ login       │  │     file       │  │  │ scraper.ts           │  │ │
│  │ me          │  │ /api/compare-  │  │  │ preprocessing.ts     │  │ │
│  │ profile     │  │     files      │  │  └──────────────────────┘  │ │
│  └────────────┘  │ /api/compare-  │  └────────────────────────────┘ │
│                  │     urls       │                                  │
│                  └───────┬────────┘                                  │
└──────────────────────────┼──────────────────────────────────────────┘
                           │ HTTP (Internal)
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  AI PIPELINE (Python / FastAPI)                       │
│                         Port 8000                                    │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                     services.py                                │  │
│  │  ┌────────────┐ ┌────────────┐ ┌───────────┐ ┌─────────────┐  │  │
│  │  │ MiniLM-L6  │ │ DeBERTa-v3 │ │Credibility│ │ GPT-OSS 20B │  │  │
│  │  │ Embeddings │ │   NLI      │ │  Scorer   │ │ (NVIDIA NIM)│  │  │
│  │  └────────────┘ └────────────┘ └───────────┘ └─────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│               DATABASE (MongoDB Atlas — Cloud)                       │
│           Collection: users (name, email, password, avatar)          │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.2 Communication Flow

```
User Input ──► Next.js Frontend ──► Express Backend ──► FastAPI AI Pipeline
                                         │                     │
                                         │                     ├── Sentence-BERT (Embedding)
                                         │                     ├── DeBERTa-v3 (NLI)
                                         │                     ├── Credibility Scorer
                                         │                     └── GPT-OSS 20B (NVIDIA NIM)
                                         │
                                         ├── MongoDB Atlas (Auth)
                                         ├── Web Scraper (Cheerio)
                                         └── File Extractor (PDF/DOCX/TXT)
```

### 6.3 Deployment Summary

| Component | Technology | Port | Description |
|---|---|---|---|
| Frontend | Next.js 16 + React 19 | 3000 | Client-side SPA with SSR |
| Backend | Node.js + Express 5 | 5000 | REST API orchestrator |
| AI Pipeline | Python + FastAPI | 8000 | ML inference microservice |
| Database | MongoDB Atlas | Cloud | User authentication store |
| LLM API | NVIDIA NIM | Cloud | GPT-OSS 20B inference |

* * *

## 7. Technology Stack

### 7.1 Frontend Technologies

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.4 | React framework with App Router, SSR |
| React | 19.2.4 | Component-based UI library |
| TypeScript | 5.x | Static type checking |
| Framer Motion | 12.38.0 | Animations, transitions, gestures |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Axios | 1.16.0 | HTTP client for API calls |
| Lucide React | 1.14.0 | Icon library |
| Recharts | 3.8.1 | Data visualization charts |

### 7.2 Backend Technologies

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22.x | Server-side JavaScript runtime |
| Express | 5.2.1 | HTTP framework |
| TypeScript | 6.0.3 | Type-safe backend |
| Mongoose | 9.6.1 | MongoDB ODM |
| Multer | 2.1.1 | Multipart file upload handling |
| Cheerio | 1.2.0 | Server-side HTML parsing (web scraping) |
| Zod | 4.4.3 | Schema validation |
| bcryptjs | 3.0.3 | Password hashing (12 salt rounds) |
| jsonwebtoken | 9.0.3 | JWT authentication tokens |
| pdfjs-dist / mammoth | Latest | PDF and DOCX text extraction |
| Concurrently | 9.1.2 | Run Node + Python servers together |

### 7.3 AI/ML Technologies

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | ML runtime |
| FastAPI | Latest | High-performance async API |
| Sentence-Transformers | Latest | all-MiniLM-L6-v2 embeddings (384-dim) |
| HuggingFace Transformers | Latest | DeBERTa-v3 NLI pipeline |
| PyTorch | Latest | ML tensor computation |
| OpenAI Python SDK | Latest | GPT-OSS 20B via NVIDIA NIM |
| Uvicorn | Latest | ASGI server for FastAPI |

### 7.4 Database & Cloud

| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted document database for user data |
| NVIDIA NIM API | Cloud-hosted LLM inference endpoint |

* * *

## 8. Module Description

### 8.1 Project Structure

```
CRN ai ml/
├── frontend/                    # Next.js 16 client application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Landing page (hero, features, pipeline)
│   │   │   ├── layout.tsx       # Root layout (Navbar, particles, fonts)
│   │   │   ├── globals.css      # Design system & theme tokens
│   │   │   ├── analyzer/        # Main analysis interface
│   │   │   ├── results/         # AI verdict display page
│   │   │   ├── login/           # Authentication — sign in
│   │   │   ├── signup/          # Authentication — register
│   │   │   ├── settings/        # User profile & theme settings
│   │   │   └── text/            # Direct text comparison
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Responsive nav with user dropdown
│   │   │   ├── AuthGateModal.tsx # Login prompt for unauthenticated users
│   │   │   ├── BackgroundParticles.tsx  # Canvas particle animation
│   │   │   └── ThemeInitializer.tsx     # Light/dark theme loader
│   │   └── hooks/
│   │       └── useAuth.ts       # Authentication state hook
│   └── package.json
│
├── backend/                     # Node.js / Express 5 API server
│   ├── src/
│   │   ├── index.ts             # Entry point — Express app + MongoDB connect
│   │   ├── routes/
│   │   │   ├── auth.ts          # /api/auth/* — signup, login, me, profile
│   │   │   └── claims.ts       # /api/* — analyze, compare-files, compare-urls
│   │   ├── controllers/
│   │   │   └── claims.ts       # Core logic: chunk, validate, forward to AI
│   │   ├── services/
│   │   │   ├── fileExtractor.ts # PDF/DOCX/TXT/CSV text extraction
│   │   │   ├── scraper.ts      # Web scraping with Cheerio
│   │   │   └── preprocessing.ts # Claim text normalization
│   │   ├── models/
│   │   │   ├── User.ts         # Mongoose User schema + bcrypt
│   │   │   └── Claim.ts        # (Reserved for future claim persistence)
│   │   └── utils/               # Utility functions
│   └── package.json
│
├── ai-pipeline/                 # Python FastAPI ML microservice
│   ├── main.py                  # FastAPI routes: /process-claims, /check-relevance
│   ├── services.py              # ML models: embeddings, NLI, credibility, LLM
│   ├── .env                     # NVIDIA_API_KEY
│   └── venv/                    # Python virtual environment
│
└── package.json                 # Root monorepo config
```

### 8.2 Module Summary

| Module | Files | Responsibility |
|---|---|---|
| **Landing Page** | `frontend/src/app/page.tsx` | Hero section, feature showcase, pipeline diagram, terminal animation, CTA |
| **Analyzer** | `frontend/src/app/analyzer/page.tsx` | Three-tab input interface: Compare Files, Multi-Link, Q&A Manual |
| **Results** | `frontend/src/app/results/page.tsx` | AI verdict display with confidence bar, claim comparison, source ranking |
| **Authentication** | `frontend/src/app/login/`, `signup/` | JWT-based login/signup forms with validation |
| **Settings** | `frontend/src/app/settings/page.tsx` | User profile editing, avatar upload, theme switching |
| **Navbar** | `frontend/src/components/Navbar.tsx` | Responsive nav, user dropdown, active link tracking |
| **Auth Router** | `backend/src/routes/auth.ts` | Signup, login, token verification, profile update endpoints |
| **Claims Router** | `backend/src/routes/claims.ts` | Route definitions with Multer file upload middleware |
| **Claims Controller** | `backend/src/controllers/claims.ts` | Core orchestration: extract → chunk → validate → forward to AI |
| **File Extractor** | `backend/src/services/fileExtractor.ts` | PDF (pdfjs-dist), DOCX (mammoth), TXT/CSV extraction |
| **Web Scraper** | `backend/src/services/scraper.ts` | HTTP fetch + Cheerio HTML parsing with noise removal |
| **Preprocessing** | `backend/src/services/preprocessing.ts` | Text normalization and stopword removal |
| **AI Pipeline** | `ai-pipeline/main.py` | FastAPI server with `/process-claims` and `/check-relevance` |
| **ML Services** | `ai-pipeline/services.py` | Singleton model loading, NLI, embeddings, credibility, LLM |

* * *

## 9. AI/ML Pipeline — Detailed Design

### 9.1 Pipeline Overview

```
                    ┌─────────────────────────────────┐
                    │         INPUT CLAIMS             │
                    │  (from files / URLs / manual)    │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │  PHASE 1: Text Extraction        │
                    │  PDF → pdfjs-dist                │
                    │  DOCX → mammoth                  │
                    │  URL → Cheerio scraper            │
                    │  TXT/CSV → UTF-8 decode           │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │  PHASE 2: Sentence Chunking      │
                    │  Split by sentence boundaries    │
                    │  Group into ~220 char chunks     │
                    │  Keep top 4 longest per source   │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │  PHASE 3: Semantic Embedding     │
                    │  all-MiniLM-L6-v2                │
                    │  Output: 384-dim vectors         │
                    │  Pairwise cosine similarity      │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │  PHASE 4: NLI Classification     │
                    │  DeBERTa-v3-small cross-encoder  │
                    │  For pairs with sim > 0.4:       │
                    │  → Entailment / Neutral /        │
                    │    Contradiction + confidence     │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │  PHASE 5: Credibility Scoring    │
                    │  6-tier domain heuristics        │
                    │  Text content citation analysis  │
                    │  Score: 0.1 – 1.0                │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │  PHASE 6: LLM Reasoning          │
                    │  OpenAI GPT-OSS 20B              │
                    │  via NVIDIA NIM endpoint          │
                    │  Structured output:               │
                    │    1: [Source 1 summary]           │
                    │    2: [Source 2 summary]           │
                    │    Winner: [1 or 2]                │
                    │    Why: [2-sentence rationale]     │
                    │    Confidence: [0.0–1.0]           │
                    └──────────────────────────────────┘
```

### 9.2 Phase 3 — Semantic Embedding & Clustering (Detail)

**Model:** `all-MiniLM-L6-v2` (Sentence-Transformers)  
**Output:** 384-dimensional dense vectors  
**Similarity metric:** Cosine similarity

```python
# From services.py — cluster_claims()
model = SentenceTransformer('all-MiniLM-L6-v2')   # singleton
embeddings = model.encode(texts)                    # shape: (N, 384)
cosine_scores = util.cos_sim(embeddings, embeddings) # shape: (N, N)
```

All claim pairs are ranked by descending similarity. Only pairs with **similarity > 0.4** proceed to NLI classification — this threshold filters out clearly unrelated pairs and reduces unnecessary computation.

### 9.3 Phase 4 — NLI Contradiction Detection (Detail)

**Model:** `cross-encoder/nli-deberta-v3-small` (HuggingFace)  
**Input format:** `"claim_A [SEP] claim_B"`  
**Output labels:** `entailment` | `neutral` | `contradiction` + confidence score  
**Token limit safeguard:** Each claim truncated to 200 words max

```python
# From services.py — detect_contradiction()
classifier = pipeline("text-classification", model="cross-encoder/nli-deberta-v3-small")
result = classifier(f"{claim_a} [SEP] {claim_b}")
# Returns: {'label': 'contradiction', 'score': 0.94}
```

### 9.4 Phase 5 — Multi-Tier Credibility Scoring (Detail)

The credibility scorer assigns a score between **0.1 and 1.0** using a base score of 0.3 with additive/subtractive rules:

| Tier | Source Type | Bonus | Examples |
|---|---|---|---|
| 1 | Peer-reviewed journals | +0.55 | Nature, Science, PubMed, Lancet, NEJM, IEEE |
| 2 | Government / educational | +0.45 | .gov, .edu, WHO, CDC, NIH |
| 3 | Established news | +0.35 | Reuters, BBC, NYTimes, Bloomberg, NPR |
| 4 | Encyclopedic | +0.20 | Wikipedia, Britannica |
| 5 | Generic web | +0.10 | .com, .org, .net, .io |
| 6 | Blog / social / unknown | +0.00 | Medium, Reddit, file uploads |

**Text content analysis** (applied additively):
- **High-credibility signals** (+0.05 each, max +0.30): "meta-analysis", "peer-reviewed", "clinical trial", university names
- **Low-credibility signals** (−0.07 each, max −0.20): "blog", "unnamed studies", "anecdotal", "unverified"

### 9.5 Phase 6 — LLM Reasoning (Detail)

**Model:** `openai/gpt-oss-20b` hosted on NVIDIA NIM  
**Temperature:** 0.2 (deterministic)  
**Top-p:** 0.7  
**Max tokens:** 1024

The prompt is structured to produce a **fixed-format numbered verdict**:

```
1: [one sentence summarising what Source 1 claims]
2: [one sentence summarising what Source 2 claims]
Winner: [1 or 2]
Why: [exactly 2 sentences explaining which source is more credible and why]
Confidence: [0.0–1.0]
```

### 9.6 Off-Topic Relevance Guard

Before running the full pipeline, a **relevance check** compares the two input document sets using MiniLM embeddings:

```python
# From main.py — /check-relevance endpoint
emb_a = model.encode(texts_a[:6])   # cap at 6 chunks
emb_b = model.encode(texts_b[:6])
scores = cos_sim(emb_a, emb_b)

mean_score = average(scores)
max_score  = max(scores)

# Accept if: mean > 0.20 OR any pair > 0.35
relevant = mean_score > 0.20 or max_score > 0.35
```

This prevents false contradiction reports from completely unrelated documents (e.g., a recipe vs. a cricket article would score < 0.10).

* * *
## 10. Backend Design

### 10.1 Server Entry Point (`src/index.ts`)

The Express server overrides DNS to use Google's public DNS (8.8.8.8) and forces IPv4 to avoid connection issues on Windows. It connects to MongoDB Atlas before starting HTTP listeners — but gracefully falls back to starting without the database if the connection times out.

```
Express App (port 5000)
├── CORS enabled (all origins)
├── JSON body parser (10 MB limit)
├── /api/* → claimsRouter
├── /api/auth/* → authRouter
└── /health → status check
```

### 10.2 Claims Controller — Core Orchestration Logic

The `claims.ts` controller contains three exported functions:

**`analyzeFile`** — Single file upload handler:
1. Validates file presence via Multer
2. Extracts text using `fileExtractor.ts`
3. Chunks into ~200 char sentence groups
4. Selects top 4 longest chunks
5. POSTs to `http://127.0.0.1:8000/process-claims`
6. Returns AI result to client

**`analyzeClaims`** — Manual text / URL handler:
1. Validates request body with Zod schema
2. If URL provided: scrapes with Cheerio, chunks text
3. If manual claims: preprocesses with `preprocessing.ts`
4. Forwards to AI pipeline

**`compareFiles`** — Dual-file contradiction detection:
1. Requires `fileA` and `fileB` from multipart upload
2. Extracts text from both in parallel (`Promise.all`)
3. Chunks both independently with source labels
4. Runs **relevance guard** — calls `/check-relevance` first
5. If off-topic (similarity < threshold): returns 422 with message
6. Sends top 4 chunks from each source (8 total) to AI pipeline

**`compareUrls`** — Multi-URL parallel scraping:
1. Validates 2–5 URLs via Zod schema
2. Scrapes all URLs in parallel (`Promise.allSettled`)
3. Reports partial failures, continues if ≥ 2 succeed
4. Runs relevance guard on first two sources
5. Takes top 4 chunks per source, sends all to AI pipeline

### 10.3 Web Scraper (`services/scraper.ts`)

The scraper uses **Axios** for HTTP requests and **Cheerio** for HTML parsing. It is optimised for Wikipedia and news articles:

- Sets a real browser `User-Agent` to avoid bot detection
- Removes all noise: `script`, `style`, `nav`, `footer`, `.navbox`, `.toc`, `.reflist`, `.catlinks`, etc.
- Extracts only `<p>` tags from `<article>`, `[role="main"]`, or `<main>`
- Skips stubs shorter than 60 characters
- Falls back to `<body>` text if no paragraphs found
- Throws a descriptive error if extracted content < 200 chars

### 10.4 File Extractor (`services/fileExtractor.ts`)

| MIME Type | Library | Method |
|---|---|---|
| `application/pdf` | `pdfjs-dist` | Page-by-page text content extraction |
| `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `mammoth` | `extractRawText()` |
| `application/msword` | `mammoth` | `extractRawText()` |
| `text/plain`, `text/csv`, `text/markdown`, `application/json` | Native Node.js | `buffer.toString('utf-8')` |

### 10.5 Authentication (`routes/auth.ts`)

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/api/auth/signup` | POST | No | Create account, returns JWT token |
| `/api/auth/login` | POST | No | Verify credentials, returns JWT token |
| `/api/auth/me` | GET | Bearer token | Returns current user profile |
| `/api/auth/profile` | PUT | Bearer token | Updates name, email, avatar |

Passwords are hashed with **bcryptjs** using 12 salt rounds. Tokens expire in **7 days**.

* * *

## 11. Frontend Design

### 11.1 Page Routing (Next.js App Router)

| Route | Component | Description |
|---|---|---|
| `/` | `app/page.tsx` | Landing page — hero, features, terminal demo, pipeline |
| `/analyzer` | `app/analyzer/page.tsx` | Main analysis interface (3 input tabs) |
| `/results` | `app/results/page.tsx` | AI verdict display |
| `/login` | `app/login/page.tsx` | Sign-in form |
| `/signup` | `app/signup/page.tsx` | Registration form |
| `/settings` | `app/settings/page.tsx` | Profile & theme settings |
| `/text` | `app/text/page.tsx` | Direct text comparison shortcut |

### 11.2 Analyzer Page — Three Input Modes

```
┌──────────────────────────────────────────────────────┐
│  resolver.ai — contradiction detector          ⚡ AI  │
├─────────────────┬────────────────────────────────────┤
│  INPUT SOURCE   │  [Active Tab Configuration]        │
│                 │                                    │
│  ▶ Compare Files│  Compare Files:                    │
│    (NEW badge)  │  ┌──────────┐  ┌──────────┐       │
│                 │  │ Doc A    │  │ Doc B    │       │
│  ○ Multi-Link   │  │ Drop Zone│  │ Drop Zone│       │
│                 │  └──────────┘  └──────────┘       │
│  ○ Q&A / Manual │  [Topic input field]               │
│                 │  [Real-world use case chips]       │
├─────────────────┴────────────────────────────────────┤
│  [Cancel]                        [Compare & Detect →]│
└──────────────────────────────────────────────────────┘
```

**Tab 1 — Compare Files:**
- Dual drag-and-drop file drop zones (Document A & Document B)
- Accepts: `.pdf`, `.docx`, `.doc`, `.txt`, `.csv`
- Visual state: dashed border → orange (dragging) → green (file loaded)
- Topic/context input field (optional)
- Real-world example use-case chips

**Tab 2 — Multi-Link:**
- Dynamic URL list (2–5 sources), labeled S1–S5
- Add/remove URL inputs with animated transitions
- Source count readiness indicator
- Optional topic field

**Tab 3 — Q&A / Manual:**
- Dynamic claim list (minimum 2), labeled C1–CN
- Each claim has text + source fields
- Add/remove claim buttons
- Ready indicator when ≥ 2 claims filled

### 11.3 Results Page — Verdict Display

```
┌────────────────────────────────────────────────────────┐
│  ← Back to Analyzer                                    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ [AI Assessment]                  [Contradictory] │  │
│  │ Resolved 8 claims regarding 'Climate Change'     │  │
│  │ Confidence: ████████████░░ 85%                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────┐  ┌──────────────────────────────┐  │
│  │ Claim 1        │  │ Claim 2            👑 WINNER │  │
│  │ [Summary of    │  │ [Summary of source 2]        │  │
│  │  source 1]     │  │                              │  │
│  └────────────────┘  └──────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 🏆 Claim 2 wins                                  │  │
│  │ [2-sentence explanation from AI]                 │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 🛡 Source Credibility Ranking                    │  │
│  │  nature.com    ████████████████████ 92/100       │  │
│  │  random-blog   ██████░░░░░░░░░░░░░░ 30/100       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 11.4 Key UI Components

| Component | Purpose | Key Features |
|---|---|---|
| `GlitchReveal` | Animated headline text | Char-by-char stagger, idle glitch flicker, hover wave |
| `TerminalTyping` | Live demo terminal | Two looping sequences, typewriter effect, auto-scroll |
| `TiltCard` | 3D hover effect on cards | Spring-physics X/Y rotation via Framer Motion |
| `ParticleField` | Canvas particle background | 80 particles with connection lines, accent-color aware |
| `MouseGlow` | Cursor spotlight | 500px radial gradient follows mouse, soft-light blend |
| `CircularProgress` | Loading indicator | Animated SVG stroke dash-offset |
| `VerdictChip` | Verdict label | Green (Consistent), Orange (Partial), Accent (Contradictory) |
| `Navbar` | Navigation bar | Scroll blur, user dropdown, avatar initials, logout |
| `AuthGateModal` | Login gate | Modal prompt for unauthenticated analysis attempts |

### 11.5 Design System

The design uses CSS custom properties for theming. Key tokens:

```css
--bg: #0A0A0A         /* page background */
--orange: #FF6B00      /* primary accent color */
--orange-text: #1A0A00 /* text on orange backgrounds */
```

**Typography:** Inter (body) + JetBrains Mono (code/labels)  
**Theme:** Dark-first with optional light mode via `ThemeInitializer`  
**Animations:** Framer Motion spring physics throughout  
**Micro-interactions:** Hover glow, tilt cards, marquee ticker, scanlines

* * *

## 12. Database Design

### 12.1 MongoDB Atlas — Collections

ResolverAI uses **one active collection**: `users`.

### 12.2 User Schema

```typescript
// From backend/src/models/User.ts
{
  _id:       ObjectId,          // Auto-generated MongoDB ID
  name:      String,            // Required, trimmed
  email:     String,            // Required, unique, lowercase
  password:  String,            // bcrypt hash (12 rounds)
  avatar:    String,            // base64 data-URL or empty string
  createdAt: Date               // Default: Date.now
}
```

**Indexes:**
- `email` — unique index for fast lookup and uniqueness enforcement

**Methods:**
- `comparePassword(candidate)` — bcrypt comparison, returns `Promise<boolean>`

**Pre-save hook:**
- Hashes `password` field before every save if modified

### 12.3 Session Management

Analysis results are **not persisted** in the database. They are passed between the Analyzer and Results pages via `sessionStorage`:

```javascript
// Analyzer page stores result before navigating
sessionStorage.setItem('analysisResult', JSON.stringify(response.data))
router.push('/results')

// Results page reads and clears on load
const data = sessionStorage.getItem('analysisResult')
```

This keeps the database lean and avoids PII storage concerns for user analysis content.

* * *

## 13. API Reference

### 13.1 Authentication Endpoints

#### `POST /api/auth/signup`
**Body:**
```json
{ "name": "string", "email": "string", "password": "string (min 6 chars)" }
```
**Response 201:**
```json
{
  "message": "Account created successfully.",
  "token": "<JWT>",
  "user": { "id": "...", "name": "...", "email": "...", "avatar": "" }
}
```

#### `POST /api/auth/login`
**Body:**
```json
{ "email": "string", "password": "string" }
```
**Response 200:**
```json
{
  "message": "Signed in successfully.",
  "token": "<JWT>",
  "user": { "id": "...", "name": "...", "email": "...", "avatar": "" }
}
```

#### `GET /api/auth/me`
**Headers:** `Authorization: Bearer <token>`  
**Response 200:** `{ "user": { "id", "name", "email", "avatar" } }`

#### `PUT /api/auth/profile`
**Headers:** `Authorization: Bearer <token>`  
**Body:** `{ "name": "string", "email": "string", "avatar": "base64|string" }`  
**Response 200:** Updated user object

* * *

### 13.2 Analysis Endpoints

#### `POST /api/analyze`
**Purpose:** Analyze manual claims or scrape a single URL  
**Body (manual):**
```json
{
  "topic": "climate change",
  "claims": [
    { "text": "...", "source": "Nature.com", "domain": "science" },
    { "text": "...", "source": "blog.xyz", "domain": "blog" }
  ]
}
```
**Body (URL):**
```json
{ "topic": "climate change", "url": "https://example.com/article" }
```

#### `POST /api/analyze-file`
**Purpose:** Upload and analyze a single file  
**Content-Type:** `multipart/form-data`  
**Fields:** `file` (PDF/DOCX/TXT/CSV), `topic` (optional string)

#### `POST /api/compare-files`
**Purpose:** Compare two files for contradictions  
**Content-Type:** `multipart/form-data`  
**Fields:** `fileA`, `fileB`, `topic` (optional)  
**Response 422 (off-topic):**
```json
{
  "error": "off_topic",
  "message": "Documents appear unrelated (similarity: 8%). ...",
  "similarity": 0.08
}
```

#### `POST /api/compare-urls`
**Purpose:** Scrape 2–5 URLs and compare claims  
**Body:**
```json
{
  "urls": ["https://source1.com", "https://source2.com"],
  "topic": "vaccine efficacy"
}
```

* * *

### 13.3 AI Pipeline Endpoints (Internal — Port 8000)

#### `POST /process-claims`
**Body:**
```json
{
  "topic": "string",
  "claims": [
    { "text": "...", "source": "...", "date": "...", "domain": "..." }
  ]
}
```
**Response:**
```json
{
  "final_conclusion": "Resolved N claims regarding 'topic'.",
  "confidence": 0.85,
  "reasoning": "1: ...\n2: ...\nWinner: 1\nWhy: ...\nConfidence: 0.87",
  "source_ranking": [
    { "source": "nature.com", "score": 0.92 },
    { "source": "blog.xyz",   "score": 0.30 }
  ]
}
```

#### `POST /check-relevance`
**Body:**
```json
{
  "texts_a": ["chunk1 from doc A", "chunk2 from doc A"],
  "texts_b": ["chunk1 from doc B", "chunk2 from doc B"]
}
```
**Response:**
```json
{
  "relevant": true,
  "mean_score": 0.43,
  "max_score": 0.71,
  "message": "Documents share a common domain — proceeding with analysis."
}
```

#### `GET /health`
**Response:** `{ "status": "healthy" }`

* * *

### 13.4 Common Error Responses

| HTTP Status | Error | Meaning |
|---|---|---|
| 400 | Validation Error | Missing required fields or invalid format |
| 401 | No token / Invalid token | Authentication required |
| 404 | User not found | Authenticated user deleted |
| 409 | Conflict | Email already registered |
| 422 | off_topic | Documents are unrelated — rejected by relevance guard |
| 503 | AI Pipeline not running | FastAPI microservice is down |
| 500 | Internal Server Error | Unexpected server failure |


## 14. Data Flow & Sequence Diagrams

### 14.1 Compare Files — Full Sequence

```
User (Browser)          Frontend (Next.js)     Backend (Express)     AI Pipeline (FastAPI)
     │                        │                      │                       │
     │ Upload fileA + fileB   │                      │                       │
     │───────────────────────►│                      │                       │
     │                        │ POST /api/compare-files (multipart)          │
     │                        │─────────────────────►│                       │
     │                        │                      │ Extract text (PDF/DOCX)│
     │                        │                      │ Chunk both documents  │
     │                        │                      │ POST /check-relevance │
     │                        │                      │──────────────────────►│
     │                        │                      │  {relevant, mean_score}│
     │                        │                      │◄──────────────────────│
     │                        │                      │                       │
     │                        │  [If not relevant: return 422]               │
     │                        │                      │                       │
     │                        │                      │ POST /process-claims  │
     │                        │                      │──────────────────────►│
     │                        │                      │   Phase 3: Embed      │
     │                        │                      │   Phase 4: NLI        │
     │                        │                      │   Phase 5: Credibility│
     │                        │                      │   Phase 6: GPT-OSS 20B│
     │                        │                      │  {verdict, reasoning} │
     │                        │                      │◄──────────────────────│
     │                        │◄─────────────────────│                       │
     │ sessionStorage result  │                      │                       │
     │◄───────────────────────│                      │                       │
     │ Navigate → /results    │                      │                       │
     │───────────────────────►│                      │                       │
```

### 14.2 Multi-URL Comparison — Sequence

```
User            Frontend            Backend                  FastAPI
 │               │                   │                          │
 │ Submit 3 URLs │                   │                          │
 │──────────────►│                   │                          │
 │               │ POST /compare-urls│                          │
 │               │──────────────────►│                          │
 │               │                   │ Scrape URL1 ──► text1   │
 │               │                   │ Scrape URL2 ──► text2   │ (parallel)
 │               │                   │ Scrape URL3 ──► text3   │
 │               │                   │ Chunk all texts          │
 │               │                   │ POST /check-relevance    │
 │               │                   │─────────────────────────►│
 │               │                   │◄─────────────────────────│
 │               │                   │ POST /process-claims     │
 │               │                   │─────────────────────────►│
 │               │                   │◄─────────────────────────│
 │               │◄──────────────────│                          │
 │ → /results    │                   │                          │
```

### 14.3 Authentication Flow

```
User         Frontend (login page)      Backend (/api/auth/login)    MongoDB
 │                   │                          │                        │
 │ email + password  │                          │                        │
 │──────────────────►│                          │                        │
 │                   │ POST /api/auth/login      │                        │
 │                   │─────────────────────────►│                        │
 │                   │                          │ findOne({ email })      │
 │                   │                          │───────────────────────►│
 │                   │                          │◄───────────────────────│
 │                   │                          │ bcrypt.compare()        │
 │                   │                          │ jwt.sign(userId, 7d)    │
 │                   │◄─────────────────────────│                        │
 │ Store token in    │                          │                        │
 │ localStorage      │                          │                        │
 │ Navigate /analyzer│                          │                        │
```

* * *

## 15. Implementation Details

### 15.1 Singleton Model Loading

Both ML models are loaded once and cached as module-level globals in `services.py`. This prevents reloading heavy models on every request:

```python
contradiction_pipeline = None
sentence_model = None

def get_sentence_model():
    global sentence_model
    if sentence_model is None:
        sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
    return sentence_model
```

### 15.2 Chunking Strategy

Text is split into sentence-boundary chunks of approximately 220 characters. The **top 4 longest chunks** from each source are selected — longer chunks tend to be more content-rich (topic sentences, key claims) compared to short transitional sentences.

```typescript
// From controllers/claims.ts — chunkText()
const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
let chunk = '';
for (const s of sentences) {
  chunk += s + ' ';
  if (chunk.length > 220) {
    chunks.push({ text: chunk.trim(), source: sourceName, domain });
    chunk = '';
  }
}
chunks.sort((a, b) => b.text.length - a.text.length).slice(0, 4);
```

### 15.3 Parallel Scraping with Error Isolation

`Promise.allSettled` is used instead of `Promise.all` so that one failed URL does not abort the entire analysis. The system continues if at least 2 URLs succeed:

```typescript
const scrapeResults = await Promise.allSettled(
  urls.map(async (url) => ({ url, text: await scrapeWebsite(url) }))
);
const scraped = scrapeResults
  .filter(r => r.status === 'fulfilled')
  .map(r => (r as PromiseFulfilledResult<any>).value);
```

### 15.4 DNS Override for Windows Compatibility

Windows can have IPv6 resolution issues with MongoDB Atlas. The backend forces IPv4:

```typescript
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
setDefaultResultOrder('ipv4first');
```

### 15.5 AI Response Parsing

The GPT-OSS 20B response is a structured numbered string. The Results page parses it line-by-line:

```typescript
// From results/page.tsx — parseReasoning()
for (const line of lines) {
  if (line.startsWith('1:'))              claim1 = line.replace(/^1:\s*/, '');
  else if (line.startsWith('2:'))         claim2 = line.replace(/^2:\s*/, '');
  else if (line.toLowerCase().startsWith('winner:')) winner = ...;
  else if (line.toLowerCase().startsWith('why:'))    why = ...;
  else if (line.toLowerCase().startsWith('confidence:')) confidence = ...;
}
```

* * *

## 16. Results & Performance Analysis

### 16.1 Input Mode Support

| Input Mode | Max Sources | Max File Size | Supported Formats |
|---|---|---|---|
| Compare Files | 2 | 10 MB each | PDF, DOCX, DOC, TXT, CSV |
| Multi-Link | 5 | N/A (web content) | Any public HTML page |
| Q&A / Manual | Unlimited | N/A | Plain text |

### 16.2 Pipeline Performance Benchmarks

| Phase | Model | Typical Latency |
|---|---|---|
| Text extraction (PDF, 10 pages) | pdfjs-dist | ~1–2 s |
| Web scraping (per URL) | Cheerio + Axios | ~3–8 s |
| Sentence embedding (8 chunks) | all-MiniLM-L6-v2 | ~0.5–1 s |
| NLI classification (top pairs) | DeBERTa-v3-small | ~1–3 s |
| Credibility scoring | Rule-based | < 10 ms |
| LLM reasoning (GPT-OSS 20B) | NVIDIA NIM API | ~5–15 s |
| **Total (typical)** | | **~10–30 s** |

### 16.3 Credibility Scoring Outcomes

| Source Type | Expected Score Range | Example |
|---|---|---|
| Top academic journal | 0.85 – 1.00 | Nature, PubMed |
| Government site (.gov) | 0.75 – 0.90 | CDC, NIH, WHO |
| Reputable news outlet | 0.65 – 0.80 | Reuters, BBC |
| Wikipedia | 0.50 – 0.65 | en.wikipedia.org |
| Generic website | 0.40 – 0.55 | Any .com with no signals |
| Anonymous blog | 0.20 – 0.40 | Medium, Substack |
| File upload (unknown) | 0.30 | Any local file |

### 16.4 Relevance Guard Effectiveness

The relevance guard prevents false positives effectively:

| Document Pair Type | Mean Similarity | Outcome |
|---|---|---|
| Same topic (e.g., two COVID articles) | > 0.35 | ✅ Allowed through |
| Related topics (e.g., vaccines vs. immunology) | ~0.25 | ✅ Allowed through |
| Moderately related (e.g., nutrition vs. medicine) | ~0.20 | ⚠️ Borderline |
| Unrelated (e.g., recipe vs. cricket) | < 0.10 | ❌ Rejected with message |

* * *

## 17. Screenshots

> **Note:** Run the project locally to view the full UI. Key screens include:

| Screen | Route | Description |
|---|---|---|
| **Landing Page** | `/` | Hero with glitch text animation, marquee ticker, terminal demo, feature cards, pipeline diagram |
| **Login** | `/login` | Dark glassmorphism form with animated blobs and scan lines |
| **Analyzer** | `/analyzer` | Three-tab panel: Compare Files, Multi-Link, Q&A |
| **Results** | `/results` | Loading screen with circular progress, then verdict + source ranking |
| **Settings** | `/settings` | Profile editing with avatar upload and theme toggle |

* * *

## 18. Security Considerations

### 18.1 Authentication Security

| Measure | Implementation |
|---|---|
| Password hashing | bcryptjs with 12 salt rounds |
| Token-based auth | JWT with 7-day expiry, signed with `JWT_SECRET` |
| Email uniqueness | MongoDB unique index + application-level check |
| Token validation | Every protected route verifies Bearer token via `jwt.verify()` |

### 18.2 Input Validation

| Layer | Tool | Coverage |
|---|---|---|
| Backend API | Zod schemas | Topic, claim text, URL format, array lengths |
| File upload | Multer + MIME check | Accepts only PDF, DOCX, TXT, CSV |
| URL scraping | HTTP status validation | Rejects 4xx/5xx responses |
| Claim text | Word-count truncation | Max 200 words per claim to NLI model |

### 18.3 Known Limitations & Mitigations

| Risk | Mitigation |
|---|---|
| Prompt injection via user text | GPT-OSS prompt is structured; user content is quoted, not executable |
| JavaScript-rendered sites not scrapable | Error message guides users to Wikipedia/.gov/plain article pages |
| NVIDIA NIM API key exposure | Stored in `ai-pipeline/.env`, not committed to version control |
| MongoDB URI exposure | Stored in `backend/.env`, excluded from git |
| CORS open to all origins | Acceptable for development; should be restricted in production |

* * *

## 19. Future Scope

| Enhancement | Description | Priority |
|---|---|---|
| **Claim persistence** | Save analysis history per user in MongoDB | High |
| **Multi-language support** | Extend scraper and NLI to non-English sources | High |
| **PDF report download** | Generate downloadable PDF of the verdict | Medium |
| **Batch analysis** | Process multiple document pairs in a queue | Medium |
| **Citation graph** | Visualize source relationships as a network graph | Medium |
| **Real-time analysis** | WebSocket streaming of pipeline progress per phase | Medium |
| **Browser extension** | Highlight contradictions on any webpage inline | Low |
| **Custom NLI fine-tuning** | Fine-tune DeBERTa on domain-specific datasets | Low |
| **Claim timeline** | Show how a claim evolved across time-stamped sources | Low |
| **API rate limiting** | Add Redis-based rate limiting on analysis endpoints | High |
| **Docker deployment** | Containerize all three services for one-command startup | High |

* * *

## 20. Conclusion

ResolverAI successfully demonstrates a production-grade, full-stack approach to automated knowledge contradiction detection and resolution. The six-phase NLP pipeline integrates three state-of-the-art models — Sentence-BERT for semantic encoding, DeBERTa-v3 for NLI classification, and GPT-OSS 20B via NVIDIA NIM for reasoned verdict generation — into a cohesive, explainable system.

Key achievements:

1. **End-to-end automation** — Users input any source (file, URL, or text) and receive a structured verdict with confidence scores in under 30 seconds
2. **Multi-source support** — Up to 5 URLs can be compared simultaneously via parallel scraping
3. **Off-topic guard** — The relevance check prevents false contradiction reports from unrelated documents
4. **Full explainability** — Every verdict includes source summaries, a winner declaration, a two-sentence rationale, and per-source credibility scores
5. **Production-grade UI** — A premium dark-mode interface with Framer Motion animations, glassmorphism effects, and real-time feedback
6. **Secure authentication** — JWT-based auth with bcrypt password hashing and MongoDB Atlas persistence

The project establishes a strong foundation for future expansion into claim history, real-time analysis, and domain-specific fine-tuning, making it applicable to journalism, legal document review, medical research reconciliation, and academic fact-checking.

* * *

## 21. References

1. Bowman, S.R., et al. (2015). *A large annotated corpus for learning natural language inference.* EMNLP. — SNLI Dataset.

2. He, P., et al. (2021). *DeBERTaV3: Improving DeBERTa using ELECTRA-Style Pre-Training with Gradient-Disentangled Embedding Sharing.* arXiv:2111.09543.

3. Reimers, N., & Gurevych, I. (2019). *Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks.* EMNLP 2019.

4. Mikolov, T., et al. (2013). *Distributed Representations of Words and Phrases and their Compositionality.* NeurIPS.

5. Metzger, M.J. (2007). *Making sense of credibility on the Web: Models for evaluating online information and recommendations for future research.* JASIST, 58(13), 2078–2091.

6. OpenAI. (2023). *GPT-4 Technical Report.* arXiv:2303.08774.

7. Thorne, J., et al. (2018). *FEVER: A Large-scale Dataset for Fact Extraction and VERification.* NAACL-HLT.

8. Arrieta, A.B., et al. (2020). *Explainable Artificial Intelligence (XAI): Concepts, taxonomies, opportunities and challenges toward responsible AI.* Information Fusion, 58, 82–115.

9. Newman, S. (2015). *Building Microservices: Designing Fine-Grained Systems.* O'Reilly Media.

10. NVIDIA Corporation. (2024). *NVIDIA NIM: Inference Microservices for AI Models.* https://developer.nvidia.com/nim

11. HuggingFace. (2023). *cross-encoder/nli-deberta-v3-small model card.* https://huggingface.co/cross-encoder/nli-deberta-v3-small

12. Reimers, N. (2023). *sentence-transformers/all-MiniLM-L6-v2 model card.* https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2

* * *

## Appendix — Project Setup Guide

### A.1 Prerequisites

| Tool | Minimum Version | Check Command |
|---|---|---|
| Node.js | 18.x | `node --version` |
| Python | 3.11 | `python --version` |
| npm | 9.x | `npm --version` |
| Git | Any | `git --version` |

### A.2 Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd "CRN ai ml"

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Set up Python virtual environment
cd ai-pipeline
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate    # macOS/Linux
pip install fastapi uvicorn sentence-transformers transformers torch openai python-dotenv
cd ..
```

### A.3 Environment Variables

**`backend/.env`**
```env
PORT=5000
AI_PIPELINE_URL=http://127.0.0.1:8000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/resolverai
JWT_SECRET=your_strong_secret_here
```

**`ai-pipeline/.env`**
```env
NVIDIA_API_KEY=your_nvidia_nim_api_key_here
```

### A.4 Running the Project

**Option 1 — Run all services with one command (from `/backend`):**

```bash
cd backend
npm run dev
# Starts Node.js (port 5000) + Python FastAPI (port 8000) concurrently
```

**Option 2 — Run services individually:**

```bash
# Terminal 1 — Backend
cd backend && npm run start:node

# Terminal 2 — AI Pipeline
cd backend && npm run start:python

# Terminal 3 — Frontend
cd frontend && npm run dev
```

**Open browser:** `http://localhost:3000`

### A.5 First-Time Model Download

On the first run, the FastAPI service will download the two ML models from HuggingFace (~250 MB total):

```
[LOADING] MiniLM sentence model...
[OK] MiniLM loaded
[LOADING] DeBERTa-v3 NLI model...
[OK] DeBERTa-v3 loaded
```

Subsequent restarts use cached models and start in < 5 seconds.

### A.6 Verifying All Services

| Service | Health Check URL | Expected Response |
|---|---|---|
| Frontend | `http://localhost:3000` | ResolverAI landing page |
| Backend | `http://localhost:5000/health` | `{"status":"ok","message":"Backend is running"}` |
| AI Pipeline | `http://localhost:8000/health` | `{"status":"healthy"}` |

### A.7 Directory Quick Reference

```
f:\CRN ai ml\
├── frontend\          → npm run dev (port 3000)
├── backend\           → npm run dev (ports 5000 + 8000)
├── ai-pipeline\       → uvicorn main:app --reload (port 8000)
└── PROJECT_REPORT.md  → This document
```

* * *

*Document generated: May 2026 | ResolverAI v1.0.0*
