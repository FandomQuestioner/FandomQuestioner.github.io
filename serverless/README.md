# FandomQuestioner Serverless Edge API

A lightweight, zero-maintenance Cloudflare Worker proxy that connects FandomQuestioner to Google's Gemini API with 100,000 free requests per day.

## How to Deploy (3 Steps, ~3 Minutes)

### 1. Get a Free Gemini API Key
* Go to [Google AI Studio](https://aistudio.google.com/) and click **Get API key** (permanent free tier).

### 2. Install Wrangler and Login to Cloudflare
From your terminal, run:
```bash
cd serverless
npx wrangler login
```

### 3. Add your Secret & Deploy
```bash
# Set your Gemini API key in Cloudflare (encrypted)
npx wrangler secret put GEMINI_API_KEY

# Deploy to Cloudflare's global edge network
npx wrangler deploy
```

Once deployed, Wrangler will give you a public URL (e.g. `https://fandom-questioner-api.<your-subdomain>.workers.dev`).

### 4. Connect to Frontend
Set your worker URL in the frontend repository:
* Locally: Create a `.env.local` file in the root directory:
  ```env
  VITE_BACKEND_URL=https://fandom-questioner-api.<your-subdomain>.workers.dev
  ```
* Or in GitHub Actions / Pages secrets as `VITE_BACKEND_URL`.
* Or click the ⚙️ icon on the website and paste it into the **Backend API Endpoint** field.
