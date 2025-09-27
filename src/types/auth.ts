// Authentication related types
export type AuthType = 'password' | 'none' | '';
export type ClientState = 'AUTHORIZED' | 'UNAUTHORIZED' | '';

export interface AuthStatus {
  clientState: ClientState;
  authType: AuthType;
  sessionInfo?: {
    user: string;
    authorized: boolean;
    timestamp: number;
  } | null;
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
