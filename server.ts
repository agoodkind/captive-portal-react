import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

// Simple in-memory session storage for testing
interface Session {
  user: string;
  authorized: boolean;
  timestamp: number;
}

const sessions: Map<string, Session> = new Map();
let currentSessionId: string | null = null;

// Configuration for authentication type
// Change this to test different auth modes:
// - 'password' for username/password auth
// - 'none' for anonymous auth
const AUTH_TYPE = process.env.AUTH_TYPE || 'password';

// Test credentials (only used when AUTH_TYPE is 'password')
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'password123',
};

// Middleware
app.use(cors());
app.use(express.json());

// Captive Portal Routes
app.post('/api/captiveportal/access/status/', async (req, res) => {
  console.log('Status check:', { body: req.body, currentSessionId, authType: AUTH_TYPE });

  // Check if user is already authenticated
  const isAuthorized = currentSessionId && sessions.has(currentSessionId);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  res.json({
    clientState: isAuthorized ? 'AUTHORIZED' : 'UNAUTHORIZED',
    authType: AUTH_TYPE,
    sessionInfo: isAuthorized ? sessions.get(currentSessionId!) : null,
  });
});

app.post('/api/captiveportal/access/logon/', async (req, res) => {
  const { user, password } = req.body;
  console.log('Login attempt:', {
    user,
    password: password ? '***' : '(empty)',
    authType: AUTH_TYPE,
  });

  let authorized = false;

  if (AUTH_TYPE === 'none') {
    // Anonymous auth - always allow
    authorized = true;
  } else if (AUTH_TYPE === 'password') {
    // Check credentials
    authorized = user === TEST_CREDENTIALS.username && password === TEST_CREDENTIALS.password;
  }

  await new Promise((resolve) => setTimeout(resolve, 3000));

  if (authorized) {
    // Create session
    const sessionId = Math.random().toString(36).substring(7);
    sessions.set(sessionId, {
      user: user || 'anonymous',
      authorized: true,
      timestamp: Date.now(),
    });
    currentSessionId = sessionId;

    console.log('Login successful:', { sessionId, user: user || 'anonymous' });
    res.json({
      clientState: 'AUTHORIZED',
      sessionId,
      message: 'Login successful',
    });
  } else {
    console.log('Login failed');
    res.json({
      clientState: 'UNAUTHORIZED',
      message: 'Invalid credentials',
    });
  }
});

app.post('/api/captiveportal/access/logoff/', async (req, res) => {
  console.log('Logout request:', { currentSessionId });

  if (currentSessionId && sessions.has(currentSessionId)) {
    sessions.delete(currentSessionId);
    console.log('Session deleted:', currentSessionId);
  }
  currentSessionId = null;

  await new Promise((resolve) => setTimeout(resolve, 3000));

  res.json({
    clientState: 'UNAUTHORIZED',
    message: 'Logged out successfully',
  });
});

// Original test routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the API server!' });
});

app.post('/api/echo', (req, res) => {
  res.json({
    message: 'Echo response',
    received: req.body,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Captive Portal auth type: ${AUTH_TYPE}`);
  if (AUTH_TYPE === 'password') {
    console.log(
      `Test credentials: username="${TEST_CREDENTIALS.username}", password="${TEST_CREDENTIALS.password}"`,
    );
  }
});
