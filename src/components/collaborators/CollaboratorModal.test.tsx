import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CollaboratorModal } from './CollaboratorModal';

const mockFetchCollaborators = vi.fn();
const mockInviteCollaborator = vi.fn();
const mockRemoveCollaborator = vi.fn();

vi.mock('../../state/sigilStore', () => ({
  useSigilStore: (selector: (s: any) => any) =>
    selector({
      fetchCollaborators: mockFetchCollaborators,
      inviteCollaborator: mockInviteCollaborator,
      removeCollaborator: mockRemoveCollaborator,
    }),
}));

describe('CollaboratorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders collaborators list and handles new collaborator invite', async () => {
    mockFetchCollaborators.mockResolvedValue([
      {
        id: 'collab-1',
        canvasId: 'canvas-1',
        email: 'partner@example.com',
        role: 'CO_HOST',
        status: 'ACCEPTED',
        userName: 'Partner User',
        createdAt: new Date().toISOString(),
      },
    ]);
    mockInviteCollaborator.mockResolvedValue({
      success: true,
      inviteLink: 'http://localhost:5173/?collab=mocktoken123',
    });

    render(<CollaboratorModal canvasId="canvas-1" onClose={() => {}} />);

    // Wait for list to load
    expect(await screen.findByText('Partner User')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Invite new co-host
    fireEvent.change(screen.getByPlaceholderText(/cohost@example.com/i), {
      target: { value: 'newplanner@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send invite/i }));

    await waitFor(() => {
      expect(mockInviteCollaborator).toHaveBeenCalledWith('canvas-1', 'newplanner@example.com', 'CO_HOST');
      expect(screen.getByText(/invitation sent to newplanner@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/mocktoken123/i)).toBeInTheDocument();
    });
  });
});
