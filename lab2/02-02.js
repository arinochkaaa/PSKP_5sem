const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/png') {
    const filePath = path.join(__dirname, 'pic.png');

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain, charset=utf-8' });
        res.end('Ошибка при чтении файла');
      } else {
        res.writeHead(200, { 'Content-Type': 'image/png, charset=utf-8' });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain, charset=utf-8' });
    res.end('Страница не найдена');
  }
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
