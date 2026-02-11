const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const rpcWSS = require('rpc-websockets').Server;

let dataPath = path.join(__dirname, 'Files', 'StudentList.json');
let backupDir = path.join(__dirname, 'Files', 'backup');

let WSServer = new rpcWSS({port: 4000, hostname: 'localhost'});

WSServer.event('FileChanged');

if(!fs.existsSync(dataPath)){
    fs.open(dataPath, 'w', (e, file) => {
        if(e) throw e;
    })
    fs.writeFileSync(dataPath, '[]');
    console.log('Файл StudentList.json создан');
}


let server = http.createServer(function(req, res) {
    let parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    let query = parsedUrl.query;

    res.setHeader('Content-Type', 'application/json');

    let readData = () => JSON.parse(fs.readFileSync(dataPath));

    let writeData = (data) => {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        WSServer.emit('FileChanged', {timastamp: new Date().toISOString()});
    };

    if(req.method == 'GET'){
        if(pathname == '/'){
            try{
                let data = readData();
                res.end(JSON.stringify(data));
            }
            catch(e){
                res.end(JSON.stringify({error: 1, message: 'ошибка чтения файла ' + dataPath}));
            }
        }
        else if(!isNaN(pathname.slice(1))){
            let id = parseInt(pathname.slice(1));
            let data = readData();
            let student = data.find(s => s.id == id);
            if(student) res.end(JSON.stringify(student));
            else res.end(JSON.stringify({error: 2, message: `студент с id = ${id} не найден`}));
        }
        else if (pathname == '/backup'){
            let files = fs.existsSync(backupDir) ? fs.readdirSync(backupDir) : [];
            res.end(JSON.stringify(files));
        }
    }
    else if(req.method == 'POST'){
        if(pathname == '/'){
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                let newStudent = JSON.parse(body);
                let data = readData();
                if(data.find(s => s.id == newStudent.id)){
                    res.end(JSON.stringify({error: 3, message: `студент с id = ${newStudent.id} уже есть`}));
                }
                else{
                    data.push(newStudent);
                    writeData(data);
                    res.end(JSON.stringify(newStudent));
                }
            });
        }
        else if(pathname == '/backup'){
            setTimeout(() => {
                if(!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
                let timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 10);
                let timestamp2 = new Date().toISOString().replace(/[-:T]/g, '').slice(12, 14);
                timestamp += timestamp2;
                let backupName = `${timestamp}_StudentList.json`;
                fs.copyFileSync(dataPath, path.join(backupDir, backupName));
                WSServer.emit('FileChanged', {timestamp: new Date().toISOString(), backup: backupName});
                res.end(JSON.stringify({backup: backupName}));
            }, 2000);
        }
    }
    else if(req.method == 'PUT'){
        if(pathname == '/'){
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                let updatedStudent = JSON.parse(body);
                let data = readData();
                let index = data.findIndex(s => s.id == updatedStudent.id);
                if(index == -1){
                    res.end(JSON.stringify({error: 2, message: `студент с id = ${updatedStudent.id} не найден`}));
                }
                else{
                    data[index] = updatedStudent;
                    writeData(data);
                    res.end(JSON.stringify(updatedStudent));
                }
            });
        }
    }
    else if(req.method == 'DELETE'){
        if(!isNaN(pathname.slice(1))){
            let id = parseInt(pathname.slice(1));
            let data = readData();
            let index = data.findIndex(s => s.id == id);
            if(index == -1){
                res.end(JSON.stringify({error: 2, message: `студент с id = ${id} не найден`}));
            }
            else{
                let deletedStudent = data.splice(index, 1)[0];
                writeData(data);
                res.end(JSON.stringify(deletedStudent));
            }
        }
        else if(pathname.startsWith('/backup/')){
            let ParmDate = pathname.split('/')[2];
            let files = fs.readdirSync(backupDir);
            let deleted = [];
            let date = ParmDate.slice(0, 4);
            date += ParmDate.slice(6, 8);
            date += ParmDate.slice(4, 6);

            files.forEach(file => {
                let datePart = file.split('_')[0];
                if(datePart < date){
                    fs.unlinkSync(path.join(backupDir, file));
                    deleted.push(file);
                }
            });

            res.end(JSON.stringify({deleted}));
        }
    }
    else{
        res.statusCode = 404;
        res.end(JSON.stringify({error: 404, message: 'Маршрут не найден'}));
    }
}).listen(3000);

console.log('Server running at http://localhost:3000/');