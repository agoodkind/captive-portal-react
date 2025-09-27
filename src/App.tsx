import { useEffect } from 'react';
import { useCaptivePortal } from './hooks/useCaptivePortal';
import { ErrorAlert } from './components/ErrorAlert';
import { LoginForm } from './components/LoginForm';
import { AnonymousLogin, LoggedInCard } from './components/AuthCards';

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
  const isAuthorized = clientState === 'AUTHORIZED';
  const isAnonymousAuth = authType === 'none' && !isAuthorized;
  const isPasswordAuth = authType !== 'none' && !isAuthorized && authType !== '';

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Error message */}
        {error ? <ErrorAlert message={error} onClose={clearError} /> : null}

        {/* Password authentication */}
        {isPasswordAuth ? (
          <LoginForm onSubmit={handlePasswordLogin} isSubmitting={isSubmitting} />
        ) : null}

        {/* Anonymous authentication */}
        {isAnonymousAuth ? (
          <AnonymousLogin onContinue={handleAnonymousLogin} isSubmitting={isSubmitting} />
        ) : null}

        {/* Logged in state */}
        {isAuthorized ? <LoggedInCard onLogout={logout} isSubmitting={isSubmitting} /> : null}
      </div>
    </div>
  );
}
