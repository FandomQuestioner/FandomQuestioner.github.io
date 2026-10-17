# Fandom Questioner

An AI-powered web app that answers lore, story, and trivia questions for any fictional universe using Fandom wikis, backed by Google's Gemini models with source citations.

## Features

- **Canon Lore Answers**: Provides direct answers without AI conversational fluff or preamble.
- **Wiki Citations**: Includes links back to relevant Fandom wiki articles for further reading.
- **Quick Fandom Select**: Presets for popular fandoms (Star Wars, Harry Potter, Marvel, Pokémon, Lord of the Rings) or input any custom Fandom wiki URL.
- **Mobile Responsive**: Built with Mantine UI with fluid layouts for mobile and desktop screens.
- **Serverless Edge API**: Proxies requests securely through a Cloudflare Worker so API keys are never exposed on the client.

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm

### Installation & Development

```bash
# Install dependencies
npm install

# Start local frontend dev server (Vite)
npm run dev
```

The frontend will run at `http://localhost:5173`. By default, it connects to the deployed Cloudflare Worker API.

### Local Backend (Optional)

If you prefer to run the proxy server locally:

1. Create a `backend/.env` file:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Add your Google Gemini API key to `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Start the backend:
   ```bash
   npm run server
   ```

To point the frontend to your local backend, create a `.env` in the root with:
```env
VITE_BACKEND_URL=http://localhost:3001
```

## Scripts

- `npm run dev` – Start the Vite dev server
- `npm run build` – Typecheck and build production bundle into `dist/`
- `npm run test` – Run typecheck, Prettier, ESLint, Vitest, and Vite build
- `npm run vitest` – Run unit tests
- `npm run server` – Run the local Express backend proxy
