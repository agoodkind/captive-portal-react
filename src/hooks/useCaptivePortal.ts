import {
  ClientState,
  Errors,
  type AuthCredentials,
  type AuthResponse,
  type AuthStatus,
  type AuthType,
  type ErrorMessage,
} from '@app-types/auth';
import { useCallback, useState } from 'react';

interface UseCaptivePortalReturn {
  // State
  clientState?: ClientState;
  authType?: AuthType;
  isLoading: boolean;
  isSubmitting: boolean;
  error?: ErrorMessage;

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
  const [clientState, setClientState] = useState<ClientState>();
  const [authType, setAuthType] = useState<AuthType>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ErrorMessage>();

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  const clearClientState = useCallback(() => {
    setClientState('');
  }, []);

  const handleRedirect = useCallback(
    (redirUrl: string | null) => {
      if (onAuthSuccess) {
        onAuthSuccess(redirUrl);
      } else if (redirUrl) {
        window.location.href = `http://${redirUrl}`;
      } else {
        return;
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

      if (!response.ok) {
        throw new Error('Network error');
      }

      const data: AuthStatus = await response.json();
      setClientState(data.clientState || '');
      setAuthType(data.authType || '');
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError(Errors.NETWORK);
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      clearError();
      setIsSubmitting(true);

      try {
        const response = await fetch(`${API_BASE}/logon/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          body: new URLSearchParams({
            user: credentials.user,
            password: credentials.password,
          }),
        });

        if (!response.ok) {
          throw new Error('Response not ok');
        }

        const data: AuthResponse = await response.json();

        if (data.clientState === ClientState.AUTHORIZED) {
          setClientState(ClientState.AUTHORIZED);
          const params = new URLSearchParams(window.location.search);
          const redirUrl = params.get('redirurl');
          handleRedirect(redirUrl);
        } else {
          const errorMsg = credentials.user ? Errors.AUTH_FAILED : Errors.LOGIN_FAILED;
          setError(errorMsg);
        }
      } catch (err) {
        console.error(err);
        setError(Errors.NETWORK);
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearError, handleRedirect],
  );

  const logout = useCallback(async () => {
    clearError();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/logoff/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: '', password: '' }),
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      await response.json();
    } catch (err) {
      console.error(err);
      setError(Errors.NETWORK);
    } finally {
      setIsSubmitting(false);
      clearClientState();
    }
  }, [clearClientState, clearError]);

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
