export const Errors = {
  NETWORK: 'Unable to connect to authentication server',
  AUTH_FAILED: 'Authentication failed',
  LOGIN_FAILED: 'Login failed',
} as const;

export type ErrorMessage = (typeof Errors)[keyof typeof Errors];

// Authentication related types

export const AuthType = {
  NORMAL: 'normal',
  NONE: 'none',
} as const;

export type AuthType = (typeof AuthType)[keyof typeof AuthType];

// Using const assertion to create an enum-like structure
export const ClientState = {
  AUTHORIZED: 'AUTHORIZED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  EMPTY: '',
} as const;

export type ClientState = (typeof ClientState)[keyof typeof ClientState];

export interface AuthStatus {
  clientState: ClientState;
  authType: AuthType;
  sessionInfo?: {
    user: string;
    authorized: boolean;
    timestamp: number;
  };
}

export interface AuthResponse {
  clientState: ClientState;
  sessionId?: string;
  message: string;
}

export interface AuthCredentials {
  user: string;
  password: string;
}
