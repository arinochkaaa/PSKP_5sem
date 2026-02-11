const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

let server = http.createServer((req, res) => {

    let pathname = url.parse(req.url).pathname;

    if(req.method == 'GET' && pathname == '/download'){
        let filePath = path.join(__dirname, 'MyFile.txt');

        fs.stat(filePath, (err, stats) => {
            if(err || !stats.isFile()){
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                return res.end('Файл не найден');
            }
        
            
            res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8',
                                'Content-Disposition': 'attachment; filename="MyFile.txt"',
                                'Content-Length': stats.size
            });

            let readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
        });
    }
    else{
        res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Страница не найдена');
    }
}).listen(5000);

console.log('Сервер запущен на http://localhost:5000');