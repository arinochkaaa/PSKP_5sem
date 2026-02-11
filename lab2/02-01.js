const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

http.createServer((req, res) => {
    if (req.url === '/html') {
        const filePath = path.join(__dirname, 'index.html');

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Ошибка сервера при чтении файла');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(data);
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Страница не найдена');
    }
}).listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}/html`);
});
