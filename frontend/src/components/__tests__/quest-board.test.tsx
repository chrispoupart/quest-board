import { render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import * as AuthContextModule from "../../contexts/AuthContext";
import { dashboardService } from "../../services/dashboardService";
import QuestBoard from "../quest-board";

vi.mock("../../services/dashboardService");

const mockUser = {
  id: 1,
  name: "Test User",
  characterName: "Hero",
  role: 'PLAYER' as const,
  avatarUrl: "",
  bountyBalance: 1234,
  experience: 1000,
  googleId: "mock-google-id",
  email: "testuser@example.com",
};

describe("QuestBoard User Info Box", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      updateUser: vi.fn(),
      isAuthenticated: true,
      isAdmin: false,
      isEditorOrAdmin: false,
    });
  });

  it("displays the correct completed quests count from dashboardService", async () => {
    (dashboardService.getUserDashboard as any).mockResolvedValue({
      stats: {
        completedQuests: 42,
        totalBounty: 1234,
        currentQuests: 3,
      },
      currentQuests: [],
      recentCreatedQuests: [],
    });

    render(<QuestBoard />);

    // Wait for the completed quests value to appear
    const completedNumber = await screen.findByText("42");
    // Find the closest card and check for the label
    const completedCard = completedNumber.closest(".text-center") as HTMLElement | null;
    expect(completedCard).not.toBeNull();
    expect(within(completedCard!).getByText(/Completed/i)).toBeInTheDocument();
  });
});
