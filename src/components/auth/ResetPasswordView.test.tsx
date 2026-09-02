import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResetPasswordView } from './ResetPasswordView';

const mockReset = vi.fn();
const storeState: { authStatus: string; authError: string | null } = { authStatus: 'idle', authError: null };

vi.mock('../../state/sigilStore', () => ({
  useSigilStore: (selector: (s: unknown) => unknown) =>
    selector({ resetPassword: mockReset, ...storeState }),
}));

const TOKEN = 'a'.repeat(64);

function fill(password: string, confirm: string) {
  fireEvent.change(screen.getByLabelText(/^new password/i), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: confirm } });
  fireEvent.click(screen.getByRole('button', { name: /update password/i }));
}

beforeEach(() => {
  mockReset.mockReset();
  storeState.authStatus = 'idle';
  storeState.authError = null;
});

describe('ResetPasswordView', () => {
  it('validates mismatched and short passwords locally', () => {
    render(<ResetPasswordView token={TOKEN} onDone={() => {}} onRequestNew={() => {}} />);
    fill('secret1', 'secret2');
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    fill('abc', 'abc');
    expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('calls resetPassword with the token and shows the success state', async () => {
    mockReset.mockResolvedValue(true);
    const onDone = vi.fn();
    render(<ResetPasswordView token={TOKEN} onDone={onDone} onRequestNew={() => {}} />);
    fill('new-secret', 'new-secret');
    expect(mockReset).toHaveBeenCalledWith(TOKEN, 'new-secret');
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(onDone).toHaveBeenCalled();
  });

  it('offers a new link when the server says the link is invalid or expired', async () => {
    mockReset.mockResolvedValue(false);
    storeState.authError = 'This reset link is invalid or has expired';
    const onRequestNew = vi.fn();
    render(<ResetPasswordView token={TOKEN} onDone={() => {}} onRequestNew={onRequestNew} />);
    expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /request a new link/i }));
    expect(onRequestNew).toHaveBeenCalled();
    expect(screen.queryByLabelText(/^new password/i)).toBeNull();
  });
});
