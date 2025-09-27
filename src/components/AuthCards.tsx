import { Card } from './Card';
import { Button } from './FormElements';

interface AnonymousLoginProps {
  onContinue: () => Promise<void>;
  isSubmitting: boolean;
}

export function AnonymousLogin({ onContinue, isSubmitting }: AnonymousLoginProps) {
  return (
    <Card className="text-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Welcome</h2>
      <p className="text-gray-600 mb-6">Click continue to access the network</p>
      <Button
        type="button"
        variant="green"
        onClick={onContinue}
        loading={isSubmitting}
        loadingText="Connecting..."
      >
        Continue
      </Button>
    </Card>
  );
}

interface LoggedInCardProps {
  onLogout: () => Promise<void>;
  isSubmitting: boolean;
}

export function LoggedInCard({ onLogout, isSubmitting }: LoggedInCardProps) {
  return (
    <Card className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xl font-medium text-gray-800">You are logged in</p>
      </div>
      <Button
        type="button"
        variant="gray"
        onClick={onLogout}
        loading={isSubmitting}
        loadingText="Logging out..."
      >
        Logout
      </Button>
    </Card>
  );
}
