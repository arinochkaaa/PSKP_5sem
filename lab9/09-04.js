const http = require('http');

let postData = JSON.stringify({
    "__comment": "Запрос. Лабораторная работа 9/4",
    "x": 1,
    "y": 2,
    "s": "Сообщение",
    "m": [1, 2, 3, 4],
    "o": { "surname": "Иванов", "name": "Иван" }
});

let options = {
    hostname: 'localhost',
    port: 5000,
    path: `/json`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

let req = http.request(options, res => {
    console.log(`Статус ответа: ${res.statusCode}`);

    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        try{
            let response = JSON.parse(body);
            console.log('Ответ от сервера:');
            console.log(JSON.stringify(response, null, 2));
        }
        catch(err){
            console.error(`Ошибка при разборе JSON-ответа: ${err.message}`);
        }
    });
});

req.on('error', error => {
    console.error(`Ошибка запроса: ${error.message}`);
});

req.write(postData);
req.end();