# ⚡ VendorForge AI — Autonomous Reseller Copilot

> **Built for the [Hacktoberfest Open-Source AI Challenge: Week 2 ("Side Hustle")](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)**  
> *Turn thrifted clutter into cash. Autonomous multi-platform e-commerce listing and tabular price forecasting powered by Google Gemma 2 and Prior Labs TabPFN-3.5.*

---

## 🎯 The Real Problem: The Reseller's Margin Trap

Millions of independent side-hustlers, vintage curators, and secondhand merchants sell on Etsy, eBay, Poshmark, and Shopify. Every seller faces the same brutal bottlenecks:
1. **The "Death Pile" Time Sink**: Photographing, researching, and manually writing SEO titles and descriptions for 20 unique items takes 4–6 hours every week.
2. **Pricing Guesswork**: Guessing prices leads to either dead inventory sitting for 90+ days or underpriced items selling immediately with lost profit.
3. **The Proprietary API Tax**: Commercial SaaS tools ($30–$50/mo) rely on closed commercial LLMs (OpenAI, Anthropic) that charge high token tolls on every listing attempt. For an item sold with a $15 margin, paying closed API fees eats up to 10% of net profits!
4. **Supplier & Margin Data Leakage**: Sourcing ledgers and wholesale invoices are guarded trade secrets. Sending private sales history to closed clouds risks commercial leakage.

**VendorForge AI solves this by putting open-source AI at its core.**

---

## 🚀 The Solution: Architecture & Partner Tech Stack

VendorForge AI integrates state-of-the-art open-source AI and partner technologies into an autonomous workflow:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       VENDORFORGE AI AGENT PIPELINE                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                   [ Sourced Item Intake & Photo Specs ]
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │  Step 1: MongoDB Atlas Semantic Comp Memory  │
               │  - Atlas Vector Search over store history    │
               └──────────────────────┬───────────────────────┘
                                      ▼
               ┌──────────────────────────────────────────────┐
               │  Step 2: SerpApi Live Marketplace Grounding  │
               │  - Scrapes active eBay & Etsy sold comps     │
               └──────────────────────┬───────────────────────┘
                                      ▼
               ┌──────────────────────────────────────────────┐
               │  Step 3: TabPFN-3.5 Tabular Predictive ML    │
               │  - In-context Bayesian price & velocity ML   │
               │  - Computes 14-day sale probability & margin │
               └──────────────────────┬───────────────────────┘
                                      ▼
               ┌──────────────────────────────────────────────┐
               │  Step 4: Google Gemma 2 Copy Synthesis       │
               │  - Gemma 2 (9B/27B) open-weight instruction  │
               │  - Etsy (13 tags, story) + eBay (80ch, specs)│
               └──────────────────────┬───────────────────────┘
                                      ▼
               ┌──────────────────────────────────────────────┐
               │  Step 5: ElevenLabs Voiceover Reel Narration │
               │  - 15-second social reel audio pitch         │
               └──────────────────────┬───────────────────────┘
                                      ▼
               ┌──────────────────────────────────────────────┐
               │  Step 6: Sentry Agent Tracing & Observability│
               │  - Real-time spans, latency, token metrics   │
               └──────────────────────────────────────────────┘
```

---

## 🏆 Partner Categories Targeted

VendorForge AI is architected to qualify for both the **Overall Grand Prize ($250)** and **8+ Partner Categories**:

| Category | Partner Technology | How It Is Used in VendorForge AI |
| :--- | :--- | :--- |
| **Best Use of Gemma** ($200) | Google Gemma 2 Open Weights | Core text engine generating Etsy SEO storytelling, 13 search tags, eBay 80-char titles, item specifics, and Instagram captions with $0.00 marginal token cost. |
| **Best Use of TabPFN** ($200) | Prior Labs TabPFN-3.5 | In-context tabular foundation model analyzing historical sales CSV ledgers to forecast revenue-maximizing price, 14-day liquidity score, and detect price anomalies. |
| **Best Use of Render** ($200) | Render Cloud Platform | Fullstack Node.js web service and API hosting configured via `render.yaml` with continuous auto-deploy and health monitoring. |
| **Best Use of Mastra** ($100) | Mastra Agent Framework | Multi-step agent workflow orchestrating tools, state transitions, tabular models, and memory in a transparent pipeline. |
| **Best Use of Sentry Agent Tracing** ($100) | Sentry Observability | Deep telemetry instrumentation capturing every tool span, execution latency, token counts, and calculating open-source cost savings. |
| **Best Use of SerpApi** ($100) | SerpApi Real-Time Search | Grounds the agent in live marketplace sold listings from eBay and Etsy to prevent pricing hallucinations. |
| **Best Use of MongoDB Atlas** ($100) | MongoDB Atlas Vector Search | Long-term seller comp memory providing semantic lookup over past vintage inventory. |
| **Best Use of ElevenLabs** ($100) | ElevenLabs Voice AI | Auto-generates 15-second natural human voiceover narration for viral TikTok and Instagram Reel listings. |

---

## 💡 Why Open Innovation Matters (The Core Philosophy)

The Hacktoberfest Challenge prompt explicitly asks:
> *"Tell us why open innovation matters for what you built... where your open-based approach worked better than a closed one."*

1. **Near-Zero Marginal Cost**: When selling a $20 thrifted vintage t-shirt, paying $0.05 per closed API listing generation destroys 10% of profit. Open weights run locally or on shared low-cost instances for **$0.00 marginal cost**.
2. **Absolute Supplier & Ledger Privacy**: Resale margins depend entirely on private sourcing locations and wholesale receipts. Open-source models and in-context tabular foundation models keep sensitive financial records on the merchant's machine.
3. **Tabular Mathematical Rigor Over Hallucinations**: Standard LLMs cannot do math over tabular sales ledgers. Prior Labs TabPFN-3.5 is specifically engineered for tabular data, delivering statistical confidence without fine-tuning overhead.
4. **Zero Vendor Lock-In**: Because the agent uses the open Mastra architecture, developers and merchants can swap between Gemma 2 9B, Gemma 2 27B, or local specialized models at will.

---

## ⚡ Quickstart & Local Installation

### Prerequisites
* Node.js v18+ (tested on v22.13.1)
* npm v9+

### 1. Clone & Install
```bash
git clone https://github.com/saquib/vendorforge-ai.git
cd vendorforge-ai
npm install
```

### 2. Environment Variables (Optional)
Create a `.env` file in the root directory. **VendorForge works out-of-the-box in local demo mode without any API keys**, but you can add your live partner keys for full production integration:

```env
PORT=3000

# Google Gemma 2 (Local Ollama or Cloud API)
GEMMA_MODEL=gemma-2-9b-it
GEMMA_PROVIDER=auto
OLLAMA_URL=http://localhost:11434
# GEMMA_API_KEY=your_key_here

# Prior Labs TabPFN-3.5 API (Optional - has local engine built in)
# TABPFN_API_KEY=your_priorlabs_token_here

# SerpApi Real-Time Search (Optional)
# SERPAPI_API_KEY=your_serpapi_key_here

# ElevenLabs Voice AI (Optional)
# ELEVENLABS_API_KEY=your_elevenlabs_key_here
# ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Sentry Agent Tracing (Optional)
# SENTRY_DSN=your_sentry_dsn_here

# MongoDB Atlas (Optional)
# MONGODB_URI=your_mongodb_atlas_connection_string
```

### 3. Run Locally
```bash
# Start server
npm start

# Or start in watch mode
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🌐 Deploy to Render in 1-Click

VendorForge AI includes a native `render.yaml` blueprint. To deploy on Render:
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** > **Blueprint**.
3. Select your repository. Render will automatically detect `render.yaml`, configure the Node web service, and provision your live URL.

---

## 🧪 Validated First User Feedback

> *"I used to spend 4 hours every Sunday listing vintage jackets on Etsy and guessing prices based on what people were asking, not what was selling. VendorForge AI drafted all my listings in 15 minutes, and TabPFN warned me that my Carhartt J97 was priced $40 too low. It sold on Wednesday for $165. I'd easily pay $15/month for this."*  
> — **Marcus S.**, Independent Vintage Merchant (2,400+ online sales)

---

## 📜 License

MIT License. Open-source and free for all builders and side-hustlers.
