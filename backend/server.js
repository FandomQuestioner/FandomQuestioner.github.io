import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load .env without third-party dependencies
function loadEnv() {
	const candidates = [
		path.join(__dirname, '.env'),
		path.join(__dirname, '..', '.env'),
	];
	for (const envPath of candidates) {
		if (fs.existsSync(envPath)) {
			const content = fs.readFileSync(envPath, 'utf8');
			for (const line of content.split('\n')) {
				const trimmed = line.trim();
				if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
					const idx = trimmed.indexOf('=');
					const key = trimmed.substring(0, idx).trim();
					const val = trimmed.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
					if (!process.env[key]) {
						process.env[key] = val;
					}
				}
			}
		}
	}
}

loadEnv();

const PORT = process.env.PORT || 3001;
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
};

async function handleAsk(req, res, payload) {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
		res.end(
			JSON.stringify({
				error: 'GEMINI_API_KEY environment variable is not set on the backend server.',
			})
		);
		return;
	}

	const { question, fandom = 'General', temperature = 0.3 } = payload;

	if (!question || !question.trim()) {
		res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: 'Missing required field: question' }));
		return;
	}

	let universe = fandom;
	try {
		if (fandom.startsWith('http://') || fandom.startsWith('https://')) {
			const parsed = new URL(fandom);
			const sub = parsed.hostname.replace('.fandom.com', '').replace('www.', '');
			universe = `${sub} (source: ${fandom})`;
		}
	} catch {
		// keep raw string
	}

	const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

	try {
		const geminiRes = await fetch(geminiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				systemInstruction: {
					parts: [
						{
							text: `You are an authoritative encyclopedia on the fictional universe of ${universe} documented at ${fandom}.

STRICT INSTRUCTIONS:
- Do NOT include any conversational filler, meta-announcements, or self-referential introductions (never say "As a lore master...", "As an expert...", "According to canon...", or "Sure!").
- Begin your response IMMEDIATELY with the direct factual answer.
- At the end of your response, always cite the relevant source wiki articles or URLs from ${fandom} under a "Sources / Citations:" heading.`,
						},
					],
				},
				contents: [
					{
						parts: [
							{
								text: question,
							},
						],
					},
				],
				generationConfig: {
					temperature: Math.max(0, Math.min(1, Number(temperature) || 0.3)),
				},
			}),
		});

		if (!geminiRes.ok) {
			const errBody = await geminiRes.text();
			res.writeHead(geminiRes.status, { ...corsHeaders, 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ error: `Gemini API error: ${errBody}` }));
			return;
		}

		const data = await geminiRes.json();
		const answer =
			data.candidates?.[0]?.content?.parts?.[0]?.text ||
			'No answer generated for this question.';

		res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ answer }));
	} catch (error) {
		res.writeHead(502, { ...corsHeaders, 'Content-Type': 'application/json' });
		res.end(
			JSON.stringify({
				error: `Backend failed to contact Gemini API: ${error instanceof Error ? error.message : String(error)}`,
			})
		);
	}
}

const server = http.createServer(async (req, res) => {
	// CORS Preflight
	if (req.method === 'OPTIONS') {
		res.writeHead(204, corsHeaders);
		res.end();
		return;
	}

	const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

	// Health check
	if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/health') {
		res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ status: 'ok', service: 'fandom-questioner-backend' }));
		return;
	}

	if (parsedUrl.pathname === '/ask') {
		if (req.method === 'POST') {
			let body = '';
			req.on('data', (chunk) => {
				body += chunk;
			});
			req.on('end', async () => {
				try {
					const json = body ? JSON.parse(body) : {};
					await handleAsk(req, res, json);
				} catch (err) {
					res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
					res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
				}
			});
			return;
		}

		// Backward compatibility with GET /ask?question=...&fandom=...&temperature=...
		if (req.method === 'GET') {
			const question = parsedUrl.searchParams.get('question');
			const fandom = parsedUrl.searchParams.get('fandom') || 'General';
			const temperature = parsedUrl.searchParams.get('temperature') || '0.3';
			await handleAsk(req, res, { question, fandom, temperature });
			return;
		}
	}

	res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
	res.end(JSON.stringify({ error: 'Endpoint not found. Use POST /ask' }));
});

server.listen(PORT, () => {
	console.log(`Backend server running on http://localhost:${PORT}`);
	console.log(`POST /ask endpoint ready. Model: ${MODEL}`);
});
