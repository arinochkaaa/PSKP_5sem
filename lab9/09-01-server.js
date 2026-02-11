const http = require('http');

let server = http.createServer((req, res) => {
    if(req.method == 'GET' && req.url == '/info'){
        let response = 'Сервер получил GET-запрос от клиента';
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end(response);
    }
    else{
        res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Страница не найдена');
    }
}).listen(5000);

console.log('Сервер запущен на http://localhost:5000');