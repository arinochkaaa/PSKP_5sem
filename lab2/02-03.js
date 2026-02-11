const http = require('http');

const hostname = 'localhost';
const port = 5000;

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/api/name') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Волосюк Арина Вадимовна'); 
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Not Found');
    }
});

server.listen(port, hostname, () => {
    console.log(`Сервер запущен: http://${hostname}:${port}/`);
});
