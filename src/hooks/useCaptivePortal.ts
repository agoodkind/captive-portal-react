import {
  AuthType,
  ClientState,
  Errors,
  type AuthCredentials,
  type ErrorMessage,
  type LoginResponse,
  type StatusResponse,
} from '@app-types/auth';
import { deepCamelCaseKeys } from 'deeply-convert-keys';
import { useCallback, useEffect, useState } from 'react';

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

const COMMON_HTTP_PARAMS = {
  headers: {
    'Content-Type': 'www-form-urlencoded; charset=UTF-8',
  },
  method: 'POST',
};

const API_BASE = '/api/captiveportal/access';

const doFetch = async <T>(endpoint: 'status' | 'logon' | 'logoff', data?: unknown) => {
  const response = await fetch(`${API_BASE}/${endpoint}/`, {
    ...COMMON_HTTP_PARAMS,
    body: JSON.stringify(data),
  });

  console.debug(`Fetch ${endpoint} response:`, response);

  if (!response.ok) {
    throw new Error(Errors.NETWORK);
  }

  const responseJson = await response.json();

  console.debug(`Fetch ${endpoint} response json:`, responseJson);

  return deepCamelCaseKeys(responseJson) as T;
};

const handleRedirect = (redirUrl: string) => {
  window.location.href = `http://${redirUrl}`;
};

export function useCaptivePortal(): UseCaptivePortalReturn {
  const [clientState, setClientState] = useState<ClientState>();
  const [authType, setAuthType] = useState<AuthType>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ErrorMessage>();
  const [redirUrl, setRedirUrl] = useState<string>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redir = params.get('redir');
    if (redir) {
      setRedirUrl(redir);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  const clearClientState = useCallback(() => {
    setClientState(ClientState.EMPTY);
  }, []);

  const performHookSideEffects = useCallback(
    async (fn: () => Promise<void>) => {
      try {
        clearError();
        setIsLoading(true);
        await fn();
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === Errors.NETWORK) {
            setError(Errors.NETWORK);
          } else if (err.message === Errors.AUTH_FAILED) {
            setError(Errors.AUTH_FAILED);
          } else {
            setError(Errors.LOGIN_FAILED);
          }
        } else {
          setError(Errors.UNKNOWN);
        }
        console.error(err);
      } finally {
        setIsLoading(false);
        setIsSubmitting(false);
      }
    },
    [clearError],
  );

  const checkStatus = useCallback(async () => {
    performHookSideEffects(async () => {
      const data: StatusResponse = await doFetch('status');
      setClientState(data.clientState);
      if ('authType' in data) {
        setAuthType(data.authType);
      }
    });
  }, [performHookSideEffects]);

  const login = useCallback(
    async (credentials: AuthCredentials) =>
      await performHookSideEffects(async () => {
        setIsSubmitting(true);
        const response: LoginResponse = await doFetch('logon', credentials);

        console.debug('Login response:', response);
        if (redirUrl) {
          handleRedirect(redirUrl);
        }
        checkStatus();
      }),
    [performHookSideEffects],
  );

  const logout = useCallback(
    async () =>
      await performHookSideEffects(async () => {
        setIsSubmitting(true);
        await doFetch('logoff');
        clearClientState();
      }),
    [clearClientState, performHookSideEffects],
  );

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
