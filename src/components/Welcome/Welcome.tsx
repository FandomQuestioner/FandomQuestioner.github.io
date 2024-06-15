import { useState } from 'react';
import {
	Title,
	Text,
	Anchor,
	Textarea,
	Image,
	TextInput,
	Slider,
	Button,
	Center,
} from '@mantine/core';
import classes from './Welcome.module.css';
import gif from '../../assets/robot-typing.gif';
import sendIcon from '../../assets/sendIcon.gif';

export function Welcome() {
	const [backendURL, setBackendURL] = useState('');
	const [fandom, setFandom] = useState('');
	const [prompt, setPrompt] = useState('');
	const [temperature, setTemperature] = useState(0.3);

	const askQuestion = () => {
		const myHeaders = new Headers();
		myHeaders.append('ngrok-skip-browser-warning', 'any');
		myHeaders.append('Content-Type', 'application/json');

		const root_url = backendURL;

		console.log(`Calling ${root_url}`);

		fetch(
			`${root_url}/ask?question=${prompt}&fandom=${fandom}&temperature=${temperature}`,
			{
				method: 'GET',
				headers: myHeaders,
				redirect: 'follow',
			}
		)
			.then((response) => response.text())
			.then((result) => console.log(result))
			.catch((error) => console.error(error));
	};

	return (
		<>
			<Title className={classes.title} ta="center" mt={100}>
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
			<TextInput
				maw={580}
				mx="auto"
				variant="filled"
				label="Input backend"
				description="Input backend."
				placeholder="Input backend url..."
				value={backendURL}
				onChange={(event) => setBackendURL(event.currentTarget.value)}
			/>
			<TextInput
				maw={580}
				mx="auto"
				variant="filled"
				label="Input fandom"
				description="Input desired fandom below."
				placeholder="Input fandom name..."
				value={fandom}
				onChange={(event) => setFandom(event.currentTarget.value)}
			/>
			<Image mx="auto" radius="md" h={200} w="auto" src={gif} />
			<Text size="sm" mx="auto" ta="center">
				Temperature (How creative the answer is from 0 - 1)
			</Text>
			<Slider
				mx="auto"
				mt={10}
				color="blue"
				w="80%"
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
			/>
			<Textarea
				maw={580}
				mx="auto"
				mt={50}
				variant="filled"
				label="Your Question"
				description="Some description of what your prompt can be."
				placeholder="Type your question here..."
				value={prompt}
				onChange={(event) => setPrompt(event.currentTarget.value)}
			/>
			<Center>
				<Button
					justify="center"
					mx="auto"
					mt="xl"
					mb="xl"
					onClick={(event) => askQuestion()}
					rightSection={
						<Image width={30} height={30} src={sendIcon} />
					}
					variant="gradient"
					gradient={{ from: 'violet', to: 'cyan', deg: 233 }}
				>
					Send!
				</Button>
			</Center>
			<Textarea
				maw={580}
				mx="auto"
				mt={50}
				variant="filled"
				label="Model Answer"
				description=""
				placeholder="Answer..."
			/>
		</>
	);
}
