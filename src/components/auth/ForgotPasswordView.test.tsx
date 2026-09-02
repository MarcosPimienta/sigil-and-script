import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordView } from './ForgotPasswordView';

const mockRequest = vi.fn();
const storeState: { authStatus: string; authError: string | null } = { authStatus: 'idle', authError: null };

vi.mock('../../state/sigilStore', () => ({
  useSigilStore: (selector: (s: unknown) => unknown) =>
    selector({ requestPasswordReset: mockRequest, ...storeState }),
}));

beforeEach(() => {
  mockRequest.mockReset();
  storeState.authStatus = 'idle';
  storeState.authError = null;
});

describe('ForgotPasswordView', () => {
  it('submits the trimmed email and shows the confirmation state', async () => {
    mockRequest.mockResolvedValue(true);
    render(<ForgotPasswordView onBackToLogin={() => {}} />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: '  host@example.com ' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    expect(mockRequest).toHaveBeenCalledWith('host@example.com');
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
    expect(screen.getByRole('status').textContent).toMatch(/if an account exists/i);
    expect(screen.queryByLabelText(/email address/i)).toBeNull();
  });

  it('shows the store error and stays on the form when the request fails', async () => {
    mockRequest.mockResolvedValue(false);
    storeState.authError = 'Too many reset requests. Please wait 15 minutes and try again.';
    render(<ForgotPasswordView onBackToLogin={() => {}} />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'host@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => expect(mockRequest).toHaveBeenCalled());
    expect(screen.getByText(/too many reset requests/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('navigates back to sign in', () => {
    const onBack = vi.fn();
    render(<ForgotPasswordView onBackToLogin={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: /back to sign in/i }));
    expect(onBack).toHaveBeenCalled();
  });
});
