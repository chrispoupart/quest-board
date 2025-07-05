import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuestManagement from '../admin/QuestManagement';
import * as questServiceModule from '../../services/questService';
import * as skillServiceModule from '../../services/skillService';
import * as userServiceModule from '../../services/userService';
import { vi } from 'vitest';
import { AuthProvider } from '../../contexts/AuthContext';
import * as AuthContextModule from '../../contexts/AuthContext';

vi.mock('../../services/questService');
vi.mock('../../services/skillService');
vi.mock('../../services/userService');

const mockUser = { id: 1, name: 'Admin', email: 'admin@test.com', role: 'ADMIN' as 'ADMIN', googleId: 'admin-google', createdAt: '', updatedAt: '' };
const mockUsers = [
  { id: 2, name: 'Alice', email: 'alice@test.com', role: 'PLAYER' as 'PLAYER', googleId: 'alice-google', createdAt: '', updatedAt: '' },
  { id: 3, name: 'Bob', email: 'bob@test.com', role: 'PLAYER' as 'PLAYER', googleId: 'bob-google', createdAt: '', updatedAt: '' }
];
const mockSkills = [
  { id: 1, name: 'Swordsmanship', description: '', isActive: true, createdBy: 1, createdAt: '', updatedAt: '' }
];
const mockQuests: any[] = [
  {
    id: 1,
    title: 'Test Quest',
    bounty: 100,
    status: 'AVAILABLE',
    createdBy: 1,
    createdAt: '',
    updatedAt: '',
    isRepeatable: false,
    skillRequirements: [],
  } as any
];

describe('QuestManagement (Personalized Quests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.mocked(questServiceModule.questService.getQuests).mockResolvedValue({
      quests: mockQuests,
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
    });
    vi.mocked(skillServiceModule.skillService.getAllSkills).mockResolvedValue(mockSkills);
    vi.mocked(userServiceModule.userService.getAllUsers).mockResolvedValue(mockUsers);
    vi.mocked(questServiceModule.questService.createQuestWithSkills).mockResolvedValue({
      id: 1,
      title: 'Test Quest',
      bounty: 100,
      status: 'AVAILABLE',
      createdBy: 1,
      createdAt: '',
      updatedAt: '',
      isRepeatable: false,
      skillRequirements: [],
    } as any);
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      updateUser: vi.fn(),
      isAuthenticated: true,
      isAdmin: true,
      isEditorOrAdmin: true
    });
  });

  function renderWithAuth() {
    return render(
      <AuthProvider>
        <QuestManagement />
      </AuthProvider>
    );
  }

  it('shows the Assign to User dropdown in the create quest form', async () => {
    renderWithAuth();
    fireEvent.click(screen.getByText(/create new quest/i));
    await waitFor(() => expect(screen.getByLabelText(/assign to user/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/assign to user/i)).toBeInTheDocument();
    expect(screen.getByText(/none \(global quest\)/i)).toBeInTheDocument();
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByText(/bob/i)).toBeInTheDocument();
  });

  it('sends userId when a user is selected and quest is created', async () => {
    renderWithAuth();
    fireEvent.click(screen.getByText(/create new quest/i));
    await waitFor(() => expect(screen.getByLabelText(/assign to user/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Quest' } });
    fireEvent.change(screen.getByLabelText(/bounty/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/assign to user/i), { target: { value: '2' } });
    fireEvent.click(screen.getByText(/create quest/i));
    await waitFor(() => {
      expect(questServiceModule.questService.createQuestWithSkills).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Quest',
          bounty: 100,
          userId: 2
        })
      );
    });
  });

  it('sends no userId when global quest is created', async () => {
    renderWithAuth();
    fireEvent.click(screen.getByText(/create new quest/i));
    await waitFor(() => expect(screen.getByLabelText(/assign to user/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Global Quest' } });
    fireEvent.change(screen.getByLabelText(/bounty/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/assign to user/i), { target: { value: '' } });
    fireEvent.click(screen.getByText(/create quest/i));
    await waitFor(() => {
      expect(questServiceModule.questService.createQuestWithSkills).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Global Quest',
          bounty: 200,
          userId: undefined
        })
      );
    });
  });

  it('shows Delete button in edit form and calls deleteQuest when clicked', async () => {
    // Add a quest to edit
    const quest = {
      id: 42,
      title: 'Quest to Delete',
      bounty: 100,
      status: 'AVAILABLE' as const,
      createdBy: 1,
      createdAt: '',
      updatedAt: '',
      isRepeatable: false,
      skillRequirements: [],
    } as any;
    vi.mocked(questServiceModule.questService.getQuests).mockResolvedValueOnce({
      quests: [quest],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
    });
    vi.mocked(questServiceModule.questService.deleteQuest).mockResolvedValue();
    // Mock window.confirm BEFORE rendering
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderWithAuth();
    // Click edit button for the quest
    const editButtons = await screen.findAllByTitle(/edit/i);
    fireEvent.click(editButtons[0]);
    // Wait for the edit form to be fully rendered
    await screen.findByText('Edit Quest');
    // Now click the Delete button
    const deleteButton = await screen.findByText(/delete/i);
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(questServiceModule.questService.deleteQuest).toHaveBeenCalledWith(42);
    });
  });
});
