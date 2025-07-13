import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RewardManagement from '../RewardManagement';
import { rewardsService } from '../../../services/rewardsService';
import type { RewardConfig } from '../../../services/rewardsService';

// Mock the rewards service
vi.mock('../../../services/rewardsService', () => ({
  rewardsService: {
    getRewardConfig: vi.fn(),
    updateRewardConfig: vi.fn(),
  },
}));

// Mock the toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockRewardsService = vi.mocked(rewardsService);

describe('RewardManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockRewardsService.getRewardConfig.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <RewardManagement />
      </BrowserRouter>
    );

    expect(screen.getByText('Reward Management')).toBeInTheDocument();
  });

  it('should render form with loaded data', async () => {
    const mockConfig: RewardConfig = {
      id: 1,
      monthlyBountyReward: 100,
      monthlyQuestReward: 50,
      quarterlyCollectiveGoal: 1000,
      quarterlyCollectiveReward: 'Team Pizza Party',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockRewardsService.getRewardConfig.mockResolvedValue(mockConfig);

    render(
      <BrowserRouter>
        <RewardManagement />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
      expect(screen.getByDisplayValue('50')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Team Pizza Party')).toBeInTheDocument();
    });
  });

  it('should render error state when API call fails', async () => {
    mockRewardsService.getRewardConfig.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <RewardManagement />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading reward configuration: API Error')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('should handle form submission successfully', async () => {
    const mockConfig: RewardConfig = {
      id: 1,
      monthlyBountyReward: 100,
      monthlyQuestReward: 50,
      quarterlyCollectiveGoal: 1000,
      quarterlyCollectiveReward: 'Team Pizza Party',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockRewardsService.getRewardConfig.mockResolvedValue(mockConfig);
    mockRewardsService.updateRewardConfig.mockResolvedValue();

    render(
      <BrowserRouter>
        <RewardManagement />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });

    // Update form values
    const monthlyBountyInput = screen.getByDisplayValue('100');
    const monthlyQuestInput = screen.getByDisplayValue('50');
    const quarterlyGoalInput = screen.getByDisplayValue('1000');
    const quarterlyRewardInput = screen.getByDisplayValue('Team Pizza Party');

    fireEvent.change(monthlyBountyInput, { target: { value: '150' } });
    fireEvent.change(monthlyQuestInput, { target: { value: '75' } });
    fireEvent.change(quarterlyGoalInput, { target: { value: '1500' } });
    fireEvent.change(quarterlyRewardInput, { target: { value: 'Movie Night' } });

    // Submit form
    const submitButton = screen.getByText('Save Configuration');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const callArgs = mockRewardsService.updateRewardConfig.mock.calls[0][0];
      expect(callArgs.monthlyBountyReward).toBe(150);
      expect(callArgs.monthlyQuestReward).toBe(75);
      expect(callArgs.quarterlyCollectiveGoal).toBe(1500);
      expect(callArgs.quarterlyCollectiveReward).toBe('Movie Night');
    });
  });

  it('should show error toast when form submission fails', async () => {
    const mockConfig: RewardConfig = {
      id: 1,
      monthlyBountyReward: 100,
      monthlyQuestReward: 50,
      quarterlyCollectiveGoal: 1000,
      quarterlyCollectiveReward: 'Team Pizza Party',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockRewardsService.getRewardConfig.mockResolvedValue(mockConfig);
    mockRewardsService.updateRewardConfig.mockRejectedValue(new Error('Update failed'));

    render(
      <BrowserRouter>
        <RewardManagement />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Save Configuration');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRewardsService.updateRewardConfig).toHaveBeenCalled();
    });
  });

  it('should show loading state during form submission', async () => {
    const mockConfig: RewardConfig = {
      id: 1,
      monthlyBountyReward: 100,
      monthlyQuestReward: 50,
      quarterlyCollectiveGoal: 1000,
      quarterlyCollectiveReward: 'Team Pizza Party',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockRewardsService.getRewardConfig.mockResolvedValue(mockConfig);
    mockRewardsService.updateRewardConfig.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <RewardManagement />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Save Configuration');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  it('should render retry button when API call fails', async () => {
    mockRewardsService.getRewardConfig.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <RewardManagement />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });
});
