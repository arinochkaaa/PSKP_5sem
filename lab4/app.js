const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const DB = require('./db');

const PORT = 5000;
const db = new DB();

function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body, 'utf8')
  });
  res.end(body);
}

function sendText(res, status, text) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text, 'utf8')
  });
  res.end(text);
}

function serveIndex(res) {
  const indexPath = path.join(__dirname, 'index.html');
  fs.readFile(indexPath, (err, data) => {
    if (err) {
      sendText(res, 500, 'index.html not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve(null);
      try {
        const json = JSON.parse(body);
        resolve(json);
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    return serveIndex(res);
  }

  if (pathname === '/api/db') {
    try {
      if (req.method === 'GET') {
        const rows = await db.selectAsync();
        return sendJSON(res, 200, rows);
      }

      if (req.method === 'POST') {
        const body = await parseRequestBody(req).catch(err => { throw err; });
        if (!body) throw new Error('Missing JSON body');
        const inserted = await db.insertAsync(body);
        return sendJSON(res, 201, inserted);
      }

      if (req.method === 'PUT') {
        const body = await parseRequestBody(req).catch(err => { throw err; });
        if (!body) throw new Error('Missing JSON body');
        if (typeof body.id === 'string') body.id = Number(body.id);
        const updated = await db.updateAsync(body);
        return sendJSON(res, 200, updated);
      }

      if (req.method === 'DELETE') {
        const id = parsed.query.id;
        if (!id) throw new Error('Missing id in query string');
        const deleted = await db.deleteAsync(Number(id));
        return sendJSON(res, 200, deleted);
      }

      res.writeHead(405, { 'Allow': 'GET, POST, PUT, DELETE' });
      return res.end();
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      if (/not found|Missing|Invalid|Row not found|Invalid JSON/i.test(msg)) {
        return sendJSON(res, 400, { error: msg });
      } else {
        console.error('Server error:', err);
        return sendJSON(res, 500, { error: msg });
      }
    }
  }

  // Not found
  sendText(res, 404, 'Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
