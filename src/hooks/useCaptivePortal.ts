import {
  AuthType,
  ClientState,
  Errors,
  type AuthCredentials,
  type ErrorMessage,
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

const API_BASE = '/api/captiveportal/access';

/**
 *
 * @param endpoint 'status' | 'logon' | 'logoff'
 * @param data data to be converted into www-form-urlencoded format
 * @returns
 */
const doFetch = async <T>(
  endpoint: 'status' | 'logon' | 'logoff',
  data: {
    user?: string;
    password?: string;
  } = {},
) => {
  const response = await fetch(`${API_BASE}/${endpoint}/`, {
    method: 'POST',
    body: new URLSearchParams(data),
  });

  if (!response.ok) {
    console.debug(`FAILED: Fetch ${endpoint} response:`, response);
    throw new Error(Errors.NETWORK);
  }

  const responseJson = await response.json();

  console.debug(`Fetch ${endpoint}`, {
    ok: response.ok,
    response,
    responseJson,
  });

  return deepCamelCaseKeys(responseJson) as T;
};

const handleRedirect = (redirUrl: string) => {
  window.location.assign(redirUrl);
};

export function useCaptivePortal(): UseCaptivePortalReturn {
  const [clientState, setClientState] = useState<ClientState>(ClientState.EMPTY);
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

      if ('authType' in data) {
        setAuthType(data.authType);
      }
      setClientState(data.clientState);
    });
  }, [performHookSideEffects]);

  const login = useCallback(
    async (credentials: AuthCredentials) =>
      await performHookSideEffects(async () => {
        setIsSubmitting(true);
        await doFetch('logon', credentials);

        if (redirUrl) {
          handleRedirect(redirUrl);
        }

        checkStatus();
      }),
    [checkStatus, performHookSideEffects, redirUrl],
  );

  const logout = useCallback(
    async () =>
      await performHookSideEffects(async () => {
        setIsSubmitting(true);
        await doFetch('logoff');
        checkStatus();
      }),
    [checkStatus, performHookSideEffects],
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
