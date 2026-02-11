const http = require('http');
const url = require('url');
const xml2js = require('xml2js');
const builder = require('xmlbuilder');

let server = http.createServer((req, res) => {
    let parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    if(req.method == 'POST' && pathname == '/xml'){

        let body = '';
        
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            xml2js.parseString(body, {explicitArray: false}, (err, result) => {
                if(err || !result?.request){
                    res.writeHead(400, {'Content-Type': 'text/plain; charset=utf-8'});
                    return res.end('Ошибка: некорректный XML');
                }
            
                let request = result.request;
                let requestId = request.$?.id || 'unknown';
            
                let xElements = Array.isArray(request.x) ? request.x : [request.x];
                let xValues = xElements.map(el => el.$?.value).filter(v => v !== undefined);
            
                let mElements = Array.isArray(request.m) ? request.m : [request.m];
                let mValues = mElements.map(el => el.$?.value).filter(v => v !== undefined);
            
                let numericSum = xValues.map(v => parseFloat(v))
                    .filter(v => !isNaN(v)).reduce((acc, val) => acc + val, 0);
            
                let concat = mValues.join('');
            
                let xmlResponse = builder.create('response')
                                    .att('id', requestId)
                                    .ele('sum')
                                    .att('element', 'x')
                                    .att('result', numericSum.toString()).up()
                                    .ele('concat')
                                    .att('element', 'm')
                                    .att('result', concat).end({pretty: true});
            
                res.writeHead(200, {'Content-Type': 'application/xml'});
                res.end(xmlResponse);
            });
        });
    }
    else{
        res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Страница не найдена');
    }
}).listen(5000);

console.log('Сервер запущен на http://localhost:5000');