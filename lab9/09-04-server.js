const http = require('http');
const url = require('url');

let server = http.createServer((req, res) => {
    let parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    if(req.method == 'POST' && pathname == '/json'){

        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try{
                let data = JSON.parse(body);
                let x = parseFloat(data.x);
                let y = parseFloat(data.y);
                let s = data.s;
                let m = Array.isArray(data.m) ? data.m : [];
                let o = data.o;

                let response = {
                    '_comment': 'Ответ. Лабораторная работа 9/4',
                    'x_plus_y': x + y,
                    'Concatenation_s_o': s + ': ' + Object.values(o).join(', '),
                    'Length_m': m.length,
                };

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(response, null, 2));
            } catch(err){
                res.writeHead(400, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end('Ошибка: некорректный JSON');
            }
        });
    }
    else{
        res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Страница не найдена');
    }
}).listen(5000);

console.log('Сервер запущен на http://localhost:5000');