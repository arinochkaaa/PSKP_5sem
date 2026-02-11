const http = require('http');
const url = require('url');

let server = http.createServer((req, res) => {

    let pathname = url.parse(req.url).pathname;

    if(req.method == 'POST' && pathname == '/upload'){
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            console.log(`Сервер получил: ${body}`);
            res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end(`Сервер получил файл`);
        });
    }
    else{
        res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Страница не найдена');
    }
}).listen(5000);

console.log('Сервер запущен на http://localhost:5000');