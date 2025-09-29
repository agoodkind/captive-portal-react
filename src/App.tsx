import { AuthType, ClientState } from '@app-types/auth';
import { AnonymousLogin, LoadingLoginState, LoggedInCard } from '@components/AuthCards';
import { ErrorAlert } from '@components/ErrorAlert';
import { LoginForm } from '@components/LoginForm';
import { useCaptivePortal } from '@hooks/useCaptivePortal';
import { useEffect } from 'react';

export const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
    <div className="w-full max-w-md">{children}</div>
  </div>
);

export function App() {
  const {
    clientState,
    authType,
    isLoading,
    isSubmitting,
    error,
    checkStatus,
    login,
    logout,
    clearError,
  } = useCaptivePortal();

  // Derived state for UI decisions
  const isAuthorized = clientState === ClientState.AUTHORIZED;
  const isAnonymousAuth = authType === AuthType.NONE;
  const isPasswordAuth = authType === AuthType.NORMAL;

  // Check authentication status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Handle login with credentials
  const handlePasswordLogin = async (username: string, password: string) => {
    await login({ user: username, password });
  };

  // Handle anonymous login
  const handleAnonymousLogin = async () => {
    await login({ user: '', password: '' });
  };

  const content = isLoading ? (
    <LoadingLoginState />
  ) : error ? (
    <ErrorAlert message={error} onClose={clearError} />
  ) : isAuthorized ? (
    <LoggedInCard onLogout={logout} isSubmitting={isSubmitting} />
  ) : isPasswordAuth ? (
    <LoginForm onSubmit={handlePasswordLogin} isSubmitting={isSubmitting} />
  ) : isAnonymousAuth ? (
    <AnonymousLogin onContinue={handleAnonymousLogin} isSubmitting={isSubmitting} />
  ) : null;

  // Render the appropriate UI based on state
  return <Wrapper>{content}</Wrapper>;
}
