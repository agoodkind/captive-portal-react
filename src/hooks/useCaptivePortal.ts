import { useState, useCallback } from 'react';
import type {
  AuthStatus,
  AuthResponse,
  AuthCredentials,
  ClientState,
  AuthType,
} from '@app-types/auth';

interface UseCaptivePortalReturn {
  // State
  clientState: ClientState;
  authType: AuthType;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  checkStatus: () => Promise<void>;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const API_BASE = '/api/captiveportal/access';

export function useCaptivePortal(
  onAuthSuccess?: (redirUrl: string | null) => void,
): UseCaptivePortalReturn {
  const [clientState, setClientState] = useState<ClientState>('');
  const [authType, setAuthType] = useState<AuthType>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRedirect = useCallback(
    (redirUrl: string | null) => {
      if (onAuthSuccess) {
        onAuthSuccess(redirUrl);
      } else if (redirUrl) {
        window.location.href = `http://${redirUrl}?refresh`;
      } else {
        window.location.reload();
      }
    },
    [onAuthSuccess],
  );

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: '', password: '' }),
      });

      if (!response.ok) throw new Error('Network error');

      const data: AuthStatus = await response.json();
      setClientState(data.clientState || '');
      setAuthType(data.authType || '');
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError('Unable to connect to authentication server');
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      setError(null);
      setIsSubmitting(true);

      try {
        const response = await fetch(`${API_BASE}/logon/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) throw new Error('Network error');

        const data: AuthResponse = await response.json();

        if (data.clientState === 'AUTHORIZED') {
          setClientState('AUTHORIZED');
          const params = new URLSearchParams(window.location.search);
          const redirUrl = params.get('redirurl');
          handleRedirect(redirUrl);
        } else {
          const errorMsg = credentials.user ? 'Authentication failed' : 'Login failed';
          setError(errorMsg);
        }
      } catch (err) {
        console.error(err);
        setError('Unable to connect to authentication server');
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleRedirect],
  );

  const logout = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/logoff/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: '', password: '' }),
      });

      if (!response.ok) throw new Error('Network error');

      await response.json();
      setClientState('');
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError('Unable to connect to authentication server');
      setIsSubmitting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    clientState,
    authType,
    isLoading,
    isSubmitting,
    error,

    // Actions
    checkStatus,
    login,
    logout,
    clearError,
  };
}
