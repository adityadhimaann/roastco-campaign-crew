# ☕ Roast & Co. Campaign Crew (AI-Native CRM) - https://roastco-campaign-crew.vercel.app

Welcome to the **Roast & Co. Campaign Crew**, an AI-native Mini CRM designed to help marketers reach their customers intelligently. This project was built for the Xeno Engineering Take-Home Assignment.

## 🌟 Overview
Unlike traditional CRMs where you manually click through filters and form fields to build a campaign, this CRM is **AI-Native**. The chat *is* the interface. 

You simply tell the AI Agent what you want to achieve (e.g., *"Send a 10% discount to people in Delhi who haven't ordered in 30 days"*), and the AI autonomously:
1. Queries the database to find the exact audience.
2. Drafts personalized messages for each customer.
3. Prepares the campaign for your preview and approval.

## 🏗 Architecture
This system follows a decoupled microservice architecture:
1. **Frontend & API (This Repo)**: Built with Next.js (App Router), React, and TailwindCSS. Handles the AI orchestration, user interface, and database interactions.
2. **Database (Supabase)**: A robust PostgreSQL database storing `customers`, `orders`, `campaigns`, and `messages`.
3. **Channel Service**: A completely separate Node.js service that simulates the real-world delivery of messages (like Twilio/SendGrid) - https://channel-service-cxvh.onrender.com

## 🔄 The "Life of a Campaign" (Data Flow)
1. **Intent & AI Orchestration**: The marketer types a prompt. The OpenAI model uses "Function Calling" to execute internal tools (`query_customers` and `create_campaign`), automatically filtering the audience and saving draft messages to Supabase.
2. **Dispatch**: The marketer clicks "Send". The Next.js backend fires an asynchronous payload to the external **Channel Service**.
3. **Simulation**: The Channel Service holds the messages, simulates network latency, and calculates probabilities for Opens and Clicks. 
4. **Telemetry (Webhooks)**: The Channel Service fires webhooks back to the CRM (`/api/webhooks/delivery`). The CRM updates Supabase, and the live Analytics Dashboard instantly reflects the new data.

## 🚀 How to Run Locally
1. Clone this repository.
2. Install dependencies: `npm install`
3. Add your environment variables in `.env.local` (Supabase keys, OpenAI key, Channel Service URL).
4. Run the development server: `npm run dev`
5. Open `http://localhost:3000`

## 🧠 Engineering Trade-offs & Decisions
- **Two-Service Webhook Loop**: Vercel Serverless functions timeout quickly, making them bad for long-running simulated delays. Moving the simulation to a separate Express server perfectly mirrors real-world delivery architectures.
- **Analytics Polling**: The dashboard uses HTTP short-polling every 3 seconds to stay updated. At a massive scale (millions of users), this would overload the database. In production, I would use WebSockets or Server-Sent Events (SSE) with a Redis pub/sub layer.
- **Asynchronous Dispatch**: The system currently uses `Promise.all` to dispatch messages to the Channel Service. At enterprise scale, this would be swapped for a message queue (like AWS SQS) or a background worker (like Inngest) to chunk payloads and prevent API rate limits.
