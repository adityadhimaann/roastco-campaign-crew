# 🚀 AI-Native Mini CRM (Xeno Take-Home Assignment)

An intelligent, decoupled Mini CRM built to help brands orchestrate, personalize, and track marketing campaigns. Instead of building segments manually, this CRM features an **AI Campaign Agent** that understands natural language goals, automatically segments audiences, and drafts highly personalized messaging.

This repository serves as the core CRM server. It operates in tandem with an isolated **[Channel Service](../channel-service)** which acts as a mock delivery network (similar to Twilio or SendGrid).

---

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **AI/LLM**: Google Gemini API (`gemini-2.5-flash`) via AI SDK
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Analytics**: Recharts (Dynamic Funnel & Timeline visualization)
- **Language**: TypeScript

---

## 🏗 Architecture & System Flow

This application is built with a **decoupled microservices architecture** to handle high-volume message processing reliably. The CRM acts as the "source of truth", while the Channel Service acts as an asynchronous delivery worker.

### 1. Data Ingestion (Customers)
Brands can import their customer lists (via CSV) containing names, emails, phone numbers, and total orders. This data is securely stored in Supabase and forms the foundation of the CRM's audience.

### 2. The AI Campaign Agent (Campaign Creation)
Instead of a complex rule-builder, users type their goal in plain English (e.g., *"Send a 20% off discount to VIP customers who have ordered more than 3 times"*).
1. The **Gemini LLM** interprets the request.
2. It generates a SQL-like filter to segment the Supabase `customers` table.
3. It drafts a personalized message tailored to the chosen channel (SMS, WhatsApp, or Email).
4. A drafted `Campaign` and its associated `Messages` are saved to the database in a `pending` state.

### 3. Asynchronous Dispatch & Webhooks (The Loop)
When the user clicks **Send** on a draft:
1. The CRM fires the messages to the external **Channel Service** via HTTP POST.
2. The Channel Service receives the payload, places it in an in-memory array, and returns a `202 Accepted`.
3. The CRM updates the database status to `sent`.
4. Over the next 5-30 seconds, the Channel Service simulates network latency and delivery outcomes (Delivered, Opened, Clicked, Failed).
5. The Channel Service fires a **Webhook** back to the CRM (`/api/receipt`).
6. The CRM securely updates the timestamp of the exact message in the database.

### 4. Live Analytics
The CRM constantly polls the database to provide a real-time dashboard. The analytics engine processes timestamps to calculate exact funnel conversion rates across a 7-day timeline and a mutually-exclusive donut chart.

---

## 🚦 System Design: Scale, Retries, & Failures

While this is a lightweight implementation for the assignment, it is architected with enterprise-scale principles in mind:

- **Decoupled Delivery**: The CRM does not wait for messages to be delivered. It fires them and trusts the webhook to return the outcome. This prevents the CRM server from locking up during a 100,000-message campaign.
- **Handling High Volume (Theoretical)**: In a production environment with millions of messages, the initial dispatch would be queued into **AWS SQS** or processed via background workers (like **Inngest** or **BullMQ**) to chunk messages into batches of 500, respecting API rate limits of downstream providers.
- **Webhook Reliability**: The webhook endpoint (`/api/receipt`) is designed to be idempotent. If the channel service fails to reach the CRM, a production queue would automatically retry the webhook with exponential backoff.

---

## 💻 Setup & Installation

### Prerequisites
- Node.js 18+
- A Supabase Project
- A Google Gemini API Key

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd roastco-campaign-crew
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# The URL of your running Channel Service (e.g., localhost:4000 or Render URL)
CHANNEL_SERVICE_URL=http://localhost:4000

# The URL of this CRM (for webhooks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Schema
Ensure your Supabase contains two primary tables:
- `customers` (id, name, email, phone, total_orders)
- `campaigns` (id, name, goal, segment_filters, status)
- `messages` (id, campaign_id, customer_id, content, channel, status, sent_at, delivered_at, opened_at, clicked_at)

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

*Built for the Xeno Engineering Take-Home Assignment.*
