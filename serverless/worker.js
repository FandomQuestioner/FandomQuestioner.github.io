/**
 * FandomQuestioner Cloudflare Worker
 * Proxies requests to Google Gemini 3.5 Flash Lite with zero backend hosting costs.
 */
export default {
	async fetch(request, env) {
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers':
				'Content-Type, Authorization, ngrok-skip-browser-warning',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const url = new URL(request.url);

		if (url.pathname !== '/ask') {
			if (url.pathname === '/' || url.pathname === '/health') {
				return new Response(
					JSON.stringify({
						status: 'ok',
						service: 'fandom-questioner-edge-api',
					}),
					{
						status: 200,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json',
						},
					}
				);
			}
			return new Response('Endpoint not found. Use POST /ask', {
				status: 404,
				headers: corsHeaders,
			});
		}

		let question = '';
		let fandom = 'General';
		let temperature = 0.3;

		if (request.method === 'POST') {
			try {
				const body = await request.json();
				question = body.question;
				fandom = body.fandom || 'General';
				temperature = parseFloat(body.temperature ?? 0.3);
			} catch {
				return new Response(
					JSON.stringify({ error: 'Malformed JSON payload' }),
					{ status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
				);
			}
		} else if (request.method === 'GET') {
			question = url.searchParams.get('question') || '';
			fandom = url.searchParams.get('fandom') || 'General';
			temperature = parseFloat(url.searchParams.get('temperature') || '0.3');
		} else {
			return new Response('Method not allowed. Use POST /ask', {
				status: 405,
				headers: corsHeaders,
			});
		}

		if (!question || !question.trim()) {
			return new Response(
				JSON.stringify({ error: 'Missing required field: question' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		if (!env.GEMINI_API_KEY) {
			return new Response(
				JSON.stringify({
					error: 'Worker configuration error: GEMINI_API_KEY secret is not set in Cloudflare.',
				}),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		let universeDescription = fandom;
		try {
			if (fandom.startsWith('http://') || fandom.startsWith('https://')) {
				const parsed = new URL(fandom);
				const sub = parsed.hostname
					.replace('.fandom.com', '')
					.replace('www.', '');
				universeDescription = `${sub} (documented at ${fandom})`;
			}
		} catch {
			// fallback to raw fandom string
		}

		const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${env.GEMINI_API_KEY}`;

		try {
			const geminiResponse = await fetch(geminiApiUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					systemInstruction: {
						parts: [
							{
								text: `You are an authoritative encyclopedia on the fictional universe of ${universeDescription} documented at ${fandom}.

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
						temperature: Math.max(0, Math.min(1, temperature)),
					},
				}),
			});

			if (!geminiResponse.ok) {
				const errorText = await geminiResponse.text();
				return new Response(
					JSON.stringify({ error: `Gemini API error: ${errorText}` }),
					{
						status: geminiResponse.status,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				);
			}

			const data = await geminiResponse.json();
			const answer =
				data.candidates?.[0]?.content?.parts?.[0]?.text ||
				'No answer could be generated for this question.';

			return new Response(JSON.stringify({ answer }), {
				status: 200,
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json',
				},
			});
		} catch (err) {
			return new Response(
				JSON.stringify({
					error: `Failed to contact LLM backend: ${err instanceof Error ? err.message : String(err)}`,
				}),
				{
					status: 502,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}
	},
};
