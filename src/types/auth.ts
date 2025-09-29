export const Errors = {
  NETWORK: 'Unable to connect to authentication server',
  AUTH_FAILED: 'Authentication failed',
  LOGIN_FAILED: 'Login failed',
  UNKNOWN: 'An unknown error occurred',
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
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
  EMPTY: '',
} as const;

export type ClientState = (typeof ClientState)[keyof typeof ClientState];

// Common fields shared by auth responses
export interface AuthCommon {
  zoneId?: number | string;
  sessionId?: string;
  authenticatedVia?: string;
  userName?: string;
  ipAddress?: string;
  macAddress?: string;
  startTime?: number;
  clientState?: ClientState;
}

/**
 * Logged in state example:
 * {
 *   "zoneid": 0,
 *   "sessionId": "xJdLu7KJPh9m33A4FT8yqQ==",
 *   "authenticated_via": "",
 *   "userName": "anonymous@192.168.1.118",
 *   "startTime": 1759117131.738643,
 *   "ipAddress": "192.168.1.118",
 *   "macAddress": "16:80:a2:fa:15:d9",
 *   "packets_in": 328,
 *   "packets_out": 466,
 *   "bytes_in": 92362,
 *   "bytes_out": 340929,
 *   "last_accessed": 1759117271,
 *   "acc_session_timeout": null,
 *   "clientState": "AUTHORIZED"
 * }
 *
 * Logged out state example:
 * {
 *   "clientState": "NOT_AUTHORIZED",
 *   "ipAddress": "192.168.1.118",
 *   "authType": "none"
 * }
 */
export type StatusResponse =
  | (AuthCommon & {
      clientState: typeof ClientState.AUTHORIZED;
      packetsIn: number;
      packetsOut: number;
      bytesIn: number;
      bytesOut: number;
      lastAccessed: number;
      accSessionTimeout: number | null;
    })
  | {
      clientState: typeof ClientState.NOT_AUTHORIZED;
      ipAddress: string;
      authType: AuthType;
    };

/**
 * Log in success response example:
 * {
 *   "zoneid": "0",
 *   "authenticated_via": "",
 *   "userName": "anonymous@192.168.1.118",
 *   "ipAddress": "192.168.1.118",
 *   "macAddress": "16:80:a2:fa:15:d9",
 *   "startTime": 1759117131.738643,
 *   "sessionId": "xJdLu7KJPh9m33A4FT8yqQ==",
 *   "clientState": "AUTHORIZED"
 * }
 *
 * Logged in failure response example:
 * {
 *   "clientState": "NOT_AUTHORIZED",
 *   "ipAddress": "192.168.1.118"
 * }
 */
export type LoginResponse =
  | AuthCommon
  | {
      clientState: typeof ClientState.NOT_AUTHORIZED;
      ipAddress: string;
    };

/**
 * Log out response example:
 * {
 *   "zoneid": 0,
 *   "sessionid": "xJdLu7KJPh9m33A4FT8yqQ==",
 *   "authenticated_via": "",
 *   "username": "anonymous@192.168.1.118",
 *   "ip_address": "192.168.1.118",
 *   "mac_address": "16:80:a2:fa:15:d9",
 *   "created": 1759117131.738643,
 *   "deleted": 0,
 *   "delete_reason": null,
 *   "terminateCause": "User-Request"
 * }
 */
export type LogoutResponse = AuthCommon & {
  created: number;
  deleted: number;
  deleteReason: string | null;
  terminateCause: string;
};

export interface AuthCredentials {
  user: string;
  password: string;
}
