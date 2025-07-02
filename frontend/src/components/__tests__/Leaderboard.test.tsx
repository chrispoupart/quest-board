/// <reference types="vitest" />
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Leaderboard from '../Leaderboard';

// Mock fetch
global.fetch = vi.fn();

const bountyData = [
  { name: 'Alice', bounty: 100 },
  { name: 'Bob', bounty: 80 },
  { name: 'Carol', bounty: 60 },
  { name: 'Dave', bounty: 40 },
  { name: 'Eve', bounty: 20 },
];
const questsData = [
  { name: 'Alice', questsCompleted: 5 },
  { name: 'Bob', questsCompleted: 4 },
  { name: 'Carol', questsCompleted: 3 },
  { name: 'Dave', questsCompleted: 2 },
  { name: 'Eve', questsCompleted: 1 },
];

afterEach(() => {
  vi.clearAllMocks();
});

test('renders both leaderboards with correct data', async () => {
  (fetch as any).mockImplementation((url: string) => {
    if (url.includes('/leaderboard/bounty')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(bountyData) });
    }
    if (url.includes('/leaderboard/quests')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(questsData) });
    }
    return Promise.reject('Unknown endpoint');
  });

  render(<Leaderboard />);

  // Loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for data
  await waitFor(() => {
    expect(screen.getByText('Top 5 by Bounty')).toBeInTheDocument();
    expect(screen.getByText('Top 5 by Quests Completed')).toBeInTheDocument();
  });

  // Get the bounty leaderboard section by region
  const bountySection = screen.getByRole("region", { name: /top 5 by bounty/i });
  bountyData.forEach((user) => {
    expect(within(bountySection).getByText((content) => content.includes(user.name))).toBeInTheDocument();
    expect(within(bountySection).getByText(user.bounty.toString())).toBeInTheDocument();
  });

  // Get the quests leaderboard section by region
  const questsSection = screen.getByRole("region", { name: /top 5 by quests completed/i });
  questsData.forEach((user) => {
    expect(within(questsSection).getByText((content) => content.includes(user.name))).toBeInTheDocument();
    expect(within(questsSection).getByText(user.questsCompleted.toString())).toBeInTheDocument();
  });
});

test('shows error state if API fails', async () => {
  (fetch as any).mockRejectedValue(new Error('API error'));
  render(<Leaderboard />);
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});

test('shows empty state if no data', async () => {
  (fetch as any).mockImplementation(() => {
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  });
  render(<Leaderboard />);
  await waitFor(() => {
    expect(screen.getAllByText(/no data/i).length).toBeGreaterThanOrEqual(2);
  });
});
