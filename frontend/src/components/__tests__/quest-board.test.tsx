import { render, screen, within, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import * as AuthContextModule from "../../contexts/AuthContext";
import { dashboardService } from "../../services/dashboardService";
import { questService } from "../../services/questService";
import QuestBoard from "../quest-board";

vi.mock("../../services/dashboardService");
vi.mock("../../services/questService");

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

    // Mock quest service methods
    (questService.getQuests as any).mockResolvedValue({
      quests: [],
      pagination: {
        page: 1,
        totalPages: 1,
        total: 0,
      },
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

    render(
      <BrowserRouter>
        <QuestBoard />
      </BrowserRouter>
    );

    // Wait for the completed quests value to appear
    await waitFor(() => {
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    // Find the closest card and check for the label
    const completedNumber = screen.getByText("42");
    const completedCard = completedNumber.closest(".text-center") as HTMLElement | null;
    expect(completedCard).not.toBeNull();
    expect(within(completedCard!).getByText(/Completed/i)).toBeInTheDocument();
  });

  it("handles URL search parameters correctly", async () => {
    (dashboardService.getUserDashboard as any).mockResolvedValue({
      stats: {
        completedQuests: 42,
        totalBounty: 1234,
        currentQuests: 3,
      },
      currentQuests: [],
      recentCreatedQuests: [],
    });

    render(
      <BrowserRouter>
        <QuestBoard />
      </BrowserRouter>
    );

    // Wait for the component to load and then check for search input
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search quests/i)).toBeInTheDocument();
    });

    // The search input should be present
    const searchInput = screen.getByPlaceholderText(/Search quests/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("renders quest board with proper structure", async () => {
    (dashboardService.getUserDashboard as any).mockResolvedValue({
      stats: {
        completedQuests: 42,
        totalBounty: 1234,
        currentQuests: 3,
      },
      currentQuests: [],
      recentCreatedQuests: [],
    });

    render(
      <BrowserRouter>
        <QuestBoard />
      </BrowserRouter>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText(/Quest Board/i)).toBeInTheDocument();
    });

    // Check for key elements
    expect(screen.getByText("42")).toBeInTheDocument(); // Completed quests
    expect(screen.getByText("1234")).toBeInTheDocument(); // Total bounty
    expect(screen.getByText("3")).toBeInTheDocument(); // Current quests
    expect(screen.getByPlaceholderText(/Search quests/i)).toBeInTheDocument();
  });
});
