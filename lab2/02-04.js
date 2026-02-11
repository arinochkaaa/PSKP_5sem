const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

const server = http.createServer((req, res) => {
    if (req.url === '/xmlhttprequest' && req.method === 'GET') {
        const filePath = path.join(__dirname, 'xmlhttprequest.html');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Ошибка чтения файла');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(data);
            }
        });
    }
    else if (req.url === '/api/name' && req.method === 'GET') {
        const fullName = 'Волосюк Арина Вадимовна';
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(fullName);
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Страница не найдена');
    }
});

server.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
