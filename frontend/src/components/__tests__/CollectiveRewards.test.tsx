import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CollectiveRewards from '../CollectiveRewards';
import { rewardsService } from '../../services/rewardsService';
import type { CollectiveProgress } from '../../services/rewardsService';

// Mock the rewards service
vi.mock('../../services/rewardsService', () => ({
  rewardsService: {
    getCollectiveProgress: vi.fn(),
    getCurrentQuarter: vi.fn(),
  },
}));

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', role: 'PLAYER' },
  }),
}));

// Mock the Progress component
vi.mock('../ui/progress', () => ({
  Progress: ({ value, className }: { value: number; className?: string }) => (
    <div data-testid="progress-bar" className={className} style={{ width: `${value}%` }}>
      Progress: {value}%
    </div>
  ),
}));

const mockRewardsService = vi.mocked(rewardsService);

describe('CollectiveRewards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRewardsService.getCurrentQuarter.mockReturnValue('2024-Q1');
  });

  it('should render loading state initially', () => {
    mockRewardsService.getCollectiveProgress.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <CollectiveRewards />
      </BrowserRouter>
    );

    expect(screen.getByText('Collective Rewards')).toBeInTheDocument();
  });

  it('should render progress when data is loaded', async () => {
    const mockProgress: CollectiveProgress = {
      goal: 1000,
      reward: 'Team Pizza Party',
      progress: 750,
      percent: 75,
    };

    mockRewardsService.getCollectiveProgress.mockResolvedValue(mockProgress);

    render(
      <BrowserRouter>
        <CollectiveRewards />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Team Pizza Party')).toBeInTheDocument();
      expect(screen.getByText('Quarterly Goal')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('$750.00 / $1000.00')).toBeInTheDocument();
      expect(screen.getByText('75.0% complete')).toBeInTheDocument();
    });
  });

  it('should render error state when API call fails', async () => {
    mockRewardsService.getCollectiveProgress.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <CollectiveRewards />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading collective rewards: API Error')).toBeInTheDocument();
    });
  });

  it('should render no goal message when goal is 0', async () => {
    const mockProgress: CollectiveProgress = {
      goal: 0,
      reward: '',
      progress: 0,
      percent: 0,
    };

    mockRewardsService.getCollectiveProgress.mockResolvedValue(mockProgress);

    render(
      <BrowserRouter>
        <CollectiveRewards />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No collective goal set for this quarter.')).toBeInTheDocument();
    });
  });

  it('should show achievement message when goal is reached', async () => {
    const mockProgress: CollectiveProgress = {
      goal: 1000,
      reward: 'Team Pizza Party',
      progress: 1000,
      percent: 100,
    };

    mockRewardsService.getCollectiveProgress.mockResolvedValue(mockProgress);

    render(
      <BrowserRouter>
        <CollectiveRewards />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('🎉 Goal achieved! The reward will be distributed soon.')).toBeInTheDocument();
    });
  });

  it('should show achievement message when goal is exceeded', async () => {
    const mockProgress: CollectiveProgress = {
      goal: 1000,
      reward: 'Team Pizza Party',
      progress: 1200,
      percent: 120,
    };

    mockRewardsService.getCollectiveProgress.mockResolvedValue(mockProgress);

    render(
      <BrowserRouter>
        <CollectiveRewards />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('🎉 Goal achieved! The reward will be distributed soon.')).toBeInTheDocument();
    });
  });

  it('should call getCurrentQuarter and getCollectiveProgress with correct parameters', async () => {
    const mockProgress: CollectiveProgress = {
      goal: 1000,
      reward: 'Team Pizza Party',
      progress: 750,
      percent: 75,
    };

    mockRewardsService.getCollectiveProgress.mockResolvedValue(mockProgress);

    render(
      <BrowserRouter>
        <CollectiveRewards />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockRewardsService.getCurrentQuarter).toHaveBeenCalled();
      expect(mockRewardsService.getCollectiveProgress).toHaveBeenCalledWith('2024-Q1');
    });
  });
});
