const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>Hello World</h1>');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>Что-то не так</h1>');
    }
  });

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
