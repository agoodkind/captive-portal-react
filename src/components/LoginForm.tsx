import { Card } from '@components/Card';
import { Button, Input } from '@components/FormElements';
import React, { useState } from 'react';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => Promise<void>;
  isSubmitting: boolean;
}

export function LoginForm({ onSubmit, isSubmitting }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(username, password);
    if (!isSubmitting) {
      // Clear form if not successful
      setUsername('');
      setPassword('');
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Portal Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          disabled={isSubmitting}
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          disabled={isSubmitting}
        />
        <Button type="submit" variant="blue" loading={isSubmitting} loadingText="Signing in...">
          Sign In
        </Button>
      </form>
    </Card>
  );
}
