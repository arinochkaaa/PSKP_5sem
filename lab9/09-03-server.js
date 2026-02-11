const http = require('http');

let server = http.createServer((req, res) => {

    if(req.method == 'GET' && req.url == '/') {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Тестовый сервер</title>
            </head>
            <body>
                <h1>Сервер работает!</h1>
                <p>Отправьте POST-запрос на /process с JSON данными</p>
                <form id="testForm">
                    <input type="number" name="x" placeholder="x" value="5"><br>
                    <input type="number" name="y" placeholder="y" value="2"><br>
                    <input type="text" name="s" placeholder="s" value="example string"><br>
                    <button type="button" onclick="sendRequest()">Отправить</button>
                </form>
                <div id="result"></div>
                
                <script>
                function sendRequest() {
                    const x = document.querySelector('[name="x"]').value;
                    const y = document.querySelector('[name="y"]').value;
                    const s = document.querySelector('[name="s"]').value;
                    
                    fetch('/process', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ x: parseFloat(x), y: parseFloat(y), s: s })
                    })
                    .then(response => response.text())
                    .then(data => {
                        document.getElementById('result').innerHTML = '<h3>Ответ сервера:</h3>' + data;
                    })
                    .catch(error => {
                        document.getElementById('result').innerHTML = '<h3>Ошибка:</h3>' + error;
                    });
                }
                </script>
            </body>
            </html>
        `);
    }
    else if(req.method == 'POST' && req.url == '/process'){
       
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try{
                let data = JSON.parse(body);
                let x = parseFloat(data.x);
                let y = parseFloat(data.y);
                let s = data.s;

                if(isNaN(x) || isNaN(y) || typeof(s) != 'string'){
                    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
                    return res.end('Ошибка: x и y должны быть числами, s — строкой');
                }

                let response = `Сервер получил x = ${x}, y = ${y}, s = ${s}`;
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end(response);
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