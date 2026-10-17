import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect } from 'vitest';
import App from '../../App';
import { Welcome } from './Welcome';

function renderWithMantine(ui: React.ReactNode) {
	return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('Welcome component', () => {
	it('renders title and main input elements', () => {
		renderWithMantine(<Welcome />);

		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
			/Fandom\s+Questioner/i
		);
		expect(screen.getByLabelText(/Fandom Wiki URL/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Your Question/i)).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /Send Question!/i })
		).toBeInTheDocument();
	});

	it('renders popular fandom badges', () => {
		renderWithMantine(<Welcome />);

		expect(screen.getByText('Star Wars')).toBeInTheDocument();
		expect(screen.getByText('Harry Potter')).toBeInTheDocument();
		expect(screen.getByText('Marvel')).toBeInTheDocument();
		expect(screen.getByText('Pokémon')).toBeInTheDocument();
		expect(screen.getByText('Lord of the Rings')).toBeInTheDocument();
	});

	it('renders App without crashing', () => {
		render(<App />);
		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});
});
