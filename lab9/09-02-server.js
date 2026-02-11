const http = require('http');
const url = require('url');

let server = http.createServer((req, res) => {
    let parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    let query = parsedUrl.query;

    if(req.method == 'GET' && pathname == '/calc'){
        let x = parseFloat(query.x);
        let y = parseFloat(query.y);

        if(isNaN(x) || isNaN(y)){
            res.writeHead(400, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end('Ошибка: параметры x и y должны быть числами');
            return;
        }

        let response = `Сервер получил x = ${x}, y = ${y}`;
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end(response);
    }
    else{
        res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Страница не найдена');
    }
}).listen(5000);

console.log('Сервер запущен на http://localhost:5000');