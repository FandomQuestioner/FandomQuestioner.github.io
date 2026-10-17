import { useState } from 'react';
import {
	Title,
	Text,
	Textarea,
	Image,
	TextInput,
	Slider,
	Button,
	Center,
	Group,
	Badge,
	Container,
	Stack,
} from '@mantine/core';
import classes from './Welcome.module.css';
import gif from '../../assets/robot-typing.gif';
import sendIcon from '../../assets/sendIcon.gif';

interface FandomWiki {
	name: string;
	url: string;
}

const POPULAR_FANDOMS: FandomWiki[] = [
	{ name: 'Star Wars', url: 'https://starwars.fandom.com' },
	{ name: 'Harry Potter', url: 'https://harrypotter.fandom.com' },
	{ name: 'Marvel', url: 'https://marvel.fandom.com' },
	{ name: 'Pokémon', url: 'https://pokemon.fandom.com' },
	{ name: 'Lord of the Rings', url: 'https://lotr.fandom.com' },
];

const BACKEND_URL =
	import.meta.env.VITE_BACKEND_URL ||
	'https://fandom-questioner-api.kingjonathanluo.workers.dev';

export function Welcome() {
	const [fandom, setFandom] = useState('');
	const [prompt, setPrompt] = useState('');
	const [temperature, setTemperature] = useState(0.3);
	const [answer, setAnswer] = useState('');
	const [loading, setLoading] = useState(false);

	const askQuestion = async () => {
		if (!prompt.trim()) {
			return;
		}

		setLoading(true);
		setAnswer('');

		try {
			const response = await fetch(
				`${BACKEND_URL.replace(/\/+$/, '')}/ask`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'ngrok-skip-browser-warning': 'any',
					},
					body: JSON.stringify({
						question: prompt,
						fandom,
						temperature,
					}),
				}
			);

			const contentType = response.headers.get('content-type') || '';

			if (!response.ok) {
				let errorMessage = `Server returned status ${response.status}`;
				try {
					if (contentType.includes('application/json')) {
						const errJson = await response.json();
						errorMessage = errJson.error || errorMessage;
					} else {
						const errText = await response.text();
						if (errText) {
							errorMessage = errText;
						}
					}
				} catch {
					// keep default errorMessage
				}
				setAnswer(`Error: ${errorMessage}`);
				setLoading(false);
				return;
			}

			if (contentType.includes('application/json')) {
				const data = await response.json();
				setAnswer(data.answer || JSON.stringify(data));
			} else {
				const text = await response.text();
				setAnswer(text);
			}
		} catch (error) {
			console.error('Failed to connect to backend service:', error);
			setAnswer(
				`Error: Could not connect to the backend service. Please check your network connection and try again.`
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container size="sm" px={{ base: 'md', sm: 'lg' }} pb="xl">
			<Title
				className={classes.title}
				ta="center"
				mt={{ base: 24, sm: 48 }}
				mb={{ base: 'md', sm: 'xl' }}
			>
				Fandom{' '}
				<Text
					inherit
					variant="gradient"
					component="span"
					gradient={{ from: 'pink', to: 'yellow' }}
				>
					Questioner
				</Text>
			</Title>

			<Stack gap="md">
				<div>
					<Text
						size="sm"
						c="dimmed"
						mb="xs"
						ta={{ base: 'center', sm: 'left' }}
					>
						Select a Fandom Wiki or enter a custom URL:
					</Text>
					<Group gap="xs" mb="sm" justify="center">
						{POPULAR_FANDOMS.map((item) => (
							<Badge
								key={item.url}
								variant={
									fandom === item.url ? 'filled' : 'light'
								}
								color="blue"
								size="md"
								style={{ cursor: 'pointer' }}
								onClick={() => setFandom(item.url)}
							>
								{item.name}
							</Badge>
						))}
					</Group>
					<TextInput
						variant="filled"
						label="Fandom Wiki URL"
						description="Target Fandom Wiki to query canon lore from."
						placeholder="https://hibike-euphonium.fandom.com"
						value={fandom}
						onChange={(event) =>
							setFandom(event.currentTarget.value)
						}
						size="sm"
					/>
				</div>

				<Center my="xs">
					<Image
						radius="md"
						h={{ base: 130, sm: 170 }}
						w="auto"
						fit="contain"
						src={gif}
						alt="Robot typing"
					/>
				</Center>

				<div>
					<Text size="sm" ta="center" mb={6}>
						Temperature (Creativity: 0 = factual, 1 = creative)
					</Text>
					<Slider
						color="blue"
						min={0}
						max={1}
						step={0.1}
						marks={[
							{ value: 0, label: '0' },
							{ value: 0.3, label: '0.3' },
							{ value: 0.5, label: '0.5' },
							{ value: 0.7, label: '0.7' },
							{ value: 1, label: '1' },
						]}
						value={temperature}
						onChange={setTemperature}
						mb="md"
					/>
				</div>

				<Textarea
					variant="filled"
					label="Your Question"
					description="Ask any character, plot, or worldbuilding question."
					placeholder="e.g. Who is Kumiko Oumae from Hibike Euphonium?"
					value={prompt}
					onChange={(event) => setPrompt(event.currentTarget.value)}
					minRows={3}
					autosize
				/>

				<Center mt="sm" mb="sm">
					<Button
						justify="center"
						loading={loading}
						disabled={!prompt.trim()}
						onClick={() => askQuestion()}
						rightSection={
							<Image
								width={22}
								height={22}
								src={sendIcon}
								alt="Send icon"
							/>
						}
						variant="gradient"
						gradient={{ from: 'violet', to: 'cyan', deg: 233 }}
						size="md"
						w={{ base: '100%', sm: 220 }}
					>
						Send Question!
					</Button>
				</Center>

				<Textarea
					variant="filled"
					label="Model Answer"
					description="Generated response and citations from the AI model."
					placeholder="Answers and source citations will appear here once returned..."
					value={answer}
					readOnly
					minRows={6}
					autosize
				/>
			</Stack>
		</Container>
	);
}
