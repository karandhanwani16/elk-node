const express = require('express');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// --- Log format 1: JSON (structured for Elasticsearch) ---
const jsonLogStream = fs.createWriteStream(path.join(logsDir, 'app.json.log'), { flags: 'a' });

// --- Log format 2: Plain text (human readable) ---
const textLogStream = fs.createWriteStream(path.join(logsDir, 'app.log'), { flags: 'a' });

// --- Log format 3: Key=value (Apache-style, easy to parse) ---
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });

function logJson(level, message, meta = {}) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  }) + '\n';
  jsonLogStream.write(entry);
}

function logText(level, message, meta = {}) {
  const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
  textLogStream.write(line);
}

function logKeyValue(level, message, meta = {}) {
  const parts = [
    `timestamp=${new Date().toISOString()}`,
    `level=${level}`,
    `message=${message.replace(/ /g, '_')}`,
    ...Object.entries(meta).map(([k, v]) => `${k}=${v}`),
  ];
  accessLogStream.write(parts.join(' ') + '\n');
}

function log(level, message, meta = {}) {
  logJson(level, message, meta);
  logText(level, message, meta);
  logKeyValue(level, message, meta);
}

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- Endpoint 1: Health check ---
app.get('/health', (req, res) => {
  log('info', 'Health check requested', { endpoint: '/health', method: 'GET', status: 200 });
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Endpoint 2: Get users (simulated) ---
app.get('/users', (req, res) => {
  const count = parseInt(req.query.limit, 10) || 10;
  log('info', 'Users list requested', { endpoint: '/users', limit: count, method: 'GET' });
  res.json({
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ].slice(0, Math.min(count, 3)),
  });
});

// --- Endpoint 3: Create event (logs as warning for demo variety) ---
app.post('/events', (req, res) => {
  const body = req.body || {};
  log('warn', 'Event received', {
    endpoint: '/events',
    method: 'POST',
    eventType: body.type || 'unknown',
    payload: body,
  });
  res.status(201).json({ id: Date.now(), created: true });
});

// 404 and error handler for error-level logs
app.use((req, res) => {
  log('error', 'Not found', { path: req.path, method: req.method, status: 404 });
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  log('info', `Server started`, { port: PORT, pid: process.pid });
  console.log(`ELK demo server running at http://localhost:${PORT}`);
  console.log('Endpoints: GET /health, GET /users, POST /events');
  console.log('Logs written to ./logs/ (app.json.log, app.log, access.log)');
});
