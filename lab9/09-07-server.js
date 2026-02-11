const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

let server = http.createServer((req, res) => {
    let pathname = url.parse(req.url).pathname;

    // GET-запрос для отображения формы в браузере
    if(req.method == 'GET' && pathname == '/') {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Загрузка файла</title>
            </head>
            <body>
                <h1>Загрузка файла на сервер</h1>
                <p>Используйте форму ниже для загрузки PNG-файла</p>
                
                <form action="/upload" method="POST" enctype="multipart/form-data">
                    <input type="file" name="file" accept=".png" required><br><br>
                    <button type="submit">Загрузить файл</button>
                </form>
                
                <hr>
                <h3>Или используйте существующий клиент:</h3>
                <p>Запустите: <code>node client.js</code></p>
            </body>
            </html>
        `);
    }
    else if(req.method == 'POST' && pathname == '/upload'){
      
        if(req.headers['content-type']?.startsWith('multipart/form-data')) {
          
            let body = [];
            req.on('data', chunk => body.push(chunk));
            req.on('end', () => {
        
                const data = Buffer.concat(body);
       
                const marker = Buffer.from('\r\n\r\n');
                const start = data.indexOf(marker) + marker.length;
                const end = data.lastIndexOf(Buffer.from('\r\n--'));
                
                if(start < end) {
                    const fileData = data.slice(start, end);
                    const filePath = path.join(__dirname, 'NewImageFromBrowser.png');
                    fs.writeFileSync(filePath, fileData);
                    
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                    res.end(`<h1>Файл успешно загружен!</h1><p>Сохранён как NewImageFromBrowser.png</p><a href="/">Назад</a>`);
                } else {
                    res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
                    res.end(`<h1>Ошибка:</h1><p>Не удалось извлечь файл из формы</p><a href="/">Назад</a>`);
                }
            });
        }

        else if(req.headers['content-type'] === 'image/png') {
            let filePath = path.join(__dirname, 'NewImage.png');
            let fileStream = fs.createWriteStream(filePath);

            req.pipe(fileStream);

            fileStream.on('finish', () => {
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end(`Файл MyFile.png успешно получен и сохранён как NewImage.png`);
            });

            req.on('error', err => {
                res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end(`Ошибка при получении файла: ${err.message}`);
            });
        }
        else {
            res.writeHead(400, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end('Неподдерживаемый Content-Type. Используйте image/png или multipart/form-data');
        }
    }
    else{
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        res.end('<h1>Страница не найдена</h1><p>Используйте <a href="/">главную страницу</a></p>');
    }
}).listen(5000);

console.log('Сервер запущен на http://localhost:5000');
console.log('1. Перейдите в браузере: http://localhost:5000');
console.log('2. Или запустите клиент: node client.js');