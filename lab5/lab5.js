const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const readline = require('readline');
const { EventEmitter } = require('events');

class DB extends EventEmitter {
    constructor() {
        super();
        this._rows = [
            { id: 1, name: 'Иван Иванов', bday: '1990-01-15' },
            { id: 2, name: 'Мария Петрова', bday: '1988-06-30' }
        ];
        this._nextId = 3;
        this.commitCount = 0;

        this.on('GET', async (payload) => {
            payload.cb(null, this.select());
        });

        this.on('POST', async (payload) => {
            try {
                const inserted = this.insert(payload.row);
                payload.cb(null, inserted);
            } catch (err) {
                payload.cb(err);
            }
        });

        this.on('PUT', async (payload) => {
            try {
                const updated = this.update(payload.row);
                payload.cb(null, updated);
            } catch (err) {
                payload.cb(err);
            }
        });

        this.on('DELETE', async (payload) => {
            try {
                const deleted = this.delete(payload.id);
                payload.cb(null, deleted);
            } catch (err) {
                payload.cb(err);
            }
        });
    }

    _asyncEmit(eventName, payload) {
        return new Promise((resolve, reject) => {
            const wrapper = Object.assign({}, payload);
            wrapper.cb = (err, result) => {
                if (err) reject(err);
                else resolve(result);
            };
            this.emit(eventName, wrapper);
        });
    }

    async selectAsync() {
        return this._asyncEmit('GET', {});
    }
    async insertAsync(row) {
        return this._asyncEmit('POST', { row });
    }
    async updateAsync(row) {
        return this._asyncEmit('PUT', { row });
    }
    async deleteAsync(id) {
        return this._asyncEmit('DELETE', { id });
    }

    select() {
        return this._rows.map(r => Object.assign({}, r));
    }

    insert(row) {
        if (!row || typeof row !== 'object') throw new Error('Invalid row');
        
        // Валидация даты
        if (row.bday) {
            const dateValidation = this._validateDate(row.bday);
            if (!dateValidation.isValid) {
                throw new Error(dateValidation.error);
            }
        }
        
        const newRow = {
            id: this._nextId++,
            name: String(row.name || ''),
            bday: String(row.bday || '')
        };
        this._rows.push(newRow);
        return Object.assign({}, newRow);
    }

    update(row) {
        if (!row || typeof row !== 'object' || typeof row.id !== 'number') {
            throw new Error('Invalid row or missing id');
        }
        
        const idx = this._rows.findIndex(r => r.id === row.id);
        if (idx === -1) throw new Error('Row not found');
        
        // Валидация даты при обновлении
        if ('bday' in row && row.bday) {
            const dateValidation = this._validateDate(row.bday);
            if (!dateValidation.isValid) {
                throw new Error(dateValidation.error);
            }
            this._rows[idx].bday = String(row.bday);
        }
        
        if ('name' in row) this._rows[idx].name = String(row.name);
        return Object.assign({}, this._rows[idx]);
    }

    delete(id) {
        if (typeof id === 'string') id = Number(id);
        if (!Number.isFinite(id)) throw new Error('Invalid id');
        const idx = this._rows.findIndex(r => r.id === id);
        if (idx === -1) throw new Error('Row not found');
        const removed = this._rows.splice(idx, 1)[0];
        return Object.assign({}, removed);
    }
    
    // Функция валидации даты
    _validateDate(dateString) {
        // Проверка формата YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return { isValid: false, error: 'Invalid date format. Use YYYY-MM-DD' };
        }
        
        const parts = dateString.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        
        // Проверка диапазонов
        if (year < 1900 || year > 2100) {
            return { isValid: false, error: 'Year must be between 1900 and 2100' };
        }
        
        if (month < 1 || month > 12) {
            return { isValid: false, error: 'Month must be between 01 and 12' };
        }
        
        // Проверка количества дней в месяце
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day < 1 || day > daysInMonth) {
            return { isValid: false, error: `Day must be between 1 and ${daysInMonth} for month ${month}` };
        }
        
        // Проверка, что это реальная дата
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || 
            date.getMonth() !== month - 1 || 
            date.getDate() !== day) {
            return { isValid: false, error: 'Invalid date' };
        }
        
        // Проверка, что дата не в будущем
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date > today) {
            return { isValid: false, error: 'Date cannot be in the future' };
        }
        
        // Проверка возраста (не старше 120 лет)
        const maxAgeDate = new Date();
        maxAgeDate.setFullYear(maxAgeDate.getFullYear() - 120);
        if (date < maxAgeDate) {
            return { isValid: false, error: 'Date cannot be more than 120 years ago' };
        }
        
        return { isValid: true, date };
    }
    
    commit() {
        this.commitCount++;
        console.log(`[DB] COMMIT #${this.commitCount}`);
        this.emit('COMMIT');
    }
}

const db = new DB();
let requestCount = 0;
let serverStopTimer = null;
let commitInterval = null;
let statsTimer = null;
let statsActive = false;

let stats = {
    start: null,
    finish: null,
    request: 0,
    commit: 0
};

function sendJSON(res, status, data) {
    const body = JSON.stringify(data, null, 2);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body, 'utf8')
    });
    res.end(body);
}

function sendText(res, status, text) {
    res.writeHead(status, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Length': Buffer.byteLength(text, 'utf8')
    });
    res.end(text);
}

function sendHTML(res, status, html) {
    res.writeHead(status, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': Buffer.byteLength(html, 'utf8')
    });
    res.end(html);
}

function serveIndex(res) {
    const html = `<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8" />
    <title>DB demo + Статистика</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 20px auto; line-height: 1.5; }
        fieldset { margin-bottom: 15px; padding: 12px; border-radius: 8px; }
        legend { font-weight: bold; }
        label { display: block; margin-top: 6px; }
        input[type=text], input[type=number] {
            width: 300px; padding: 6px; margin-top: 3px;
            border: 1px solid #ccc; border-radius: 4px;
        }
        button {
            margin-top: 10px; padding: 6px 12px;
            border: none; border-radius: 4px; background: #007bff;
            color: white; cursor: pointer;
        }
        button:hover { background: #0056b3; }
        pre {
            background: #f8f8f8; padding: 12px;
            border-radius: 6px; border: 1px solid #ddd;
            white-space: pre-wrap;
        }
        .stats-section { 
            background: #e8f4fd; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
        }
        .error { color: #dc3545; }
    </style>
</head>
<body>
<h1>Демонстрация работы DB API + Статистика</h1>

<div class="stats-section">
    <h2> Статистика</h2>
    <pre id="stats-result">—</pre>
</div>

<fieldset>
    <legend>GET — получить все строки</legend>
    <button id="btn-get">GET /api/db</button>
</fieldset>

<fieldset>
    <legend>POST — добавить строку</legend>
    <label>Имя:
        <input id="post-name" type="text" placeholder="Иван Иванов">
    </label>
    <label>Дата рождения:
        <input id="post-bday" type="text" placeholder="YYYY-MM-DD">
        <small class="error">Формат: YYYY-MM-DD. Не может быть будущей датой. Не старше 120 лет.</small>
    </label>
    <button id="btn-post">POST /api/db</button>
</fieldset>

<fieldset>
    <legend>PUT — изменить строку</legend>
    <label>ID:
        <input id="put-id" type="number" placeholder="1">
    </label>
    <label>Имя:
        <input id="put-name" type="text" placeholder="Новое имя">
    </label>
    <label>Дата рождения:
        <input id="put-bday" type="text" placeholder="YYYY-MM-DD">
        <small class="error">Формат: YYYY-MM-DD. Не может быть будущей датой. Не старше 120 лет.</small>
    </label>
    <button id="btn-put">PUT /api/db</button>
</fieldset>

<fieldset>
    <legend>DELETE — удалить строку</legend>
    <label>ID:
        <input id="del-id" type="number" placeholder="1">
    </label>
    <button id="btn-del">DELETE /api/db?id=...</button>
</fieldset>

<h2>Результат</h2>
<pre id="result">—</pre>

<script>
    const resultEl = document.getElementById('result');
    const statsResultEl = document.getElementById('stats-result');

    function show(obj) {
        resultEl.textContent = typeof obj === 'string'
            ? obj
            : JSON.stringify(obj, null, 2);
    }

    function showStats(obj) {
        statsResultEl.textContent = typeof obj === 'string'
            ? obj
            : JSON.stringify(obj, null, 2);
    }

    // Функция валидации даты на клиенте
    function validateDateClient(dateString) {
        if (!dateString) return { isValid: true };
        
        if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(dateString)) {
            return { isValid: false, error: 'Неверный формат даты. Используйте YYYY-MM-DD' };
        }
        
        const parts = dateString.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        
        if (year < 1900 || year > 2100) {
            return { isValid: false, error: 'Год должен быть в диапазоне 1900-2100' };
        }
        
        if (month < 1 || month > 12) {
            return { isValid: false, error: 'Месяц должен быть от 01 до 12' };
        }
        
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day < 1 || day > daysInMonth) {
            return { isValid: false, error: \`В \${month} месяце может быть только от 1 до \${daysInMonth} дней\` };
        }
        
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || 
            date.getMonth() !== month - 1 || 
            date.getDate() !== day) {
            return { isValid: false, error: 'Некорректная дата' };
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date > today) {
            return { isValid: false, error: 'Дата не может быть в будущем' };
        }
        
        const maxAgeDate = new Date();
        maxAgeDate.setFullYear(maxAgeDate.getFullYear() - 120);
        if (date < maxAgeDate) {
            return { isValid: false, error: 'Дата не может быть более 120 лет назад' };
        }
        
        return { isValid: true };
    }

    async function getStats() {
        try {
            const res = await fetch('/api/ss');
            const json = await res.json();
            showStats(json);
        } catch (e) {
            showStats({ error: e.message });
        }
    }

    async function doGet() {
        try {
            const res = await fetch('/api/db');
            const json = await res.json();
            show(json);
        } catch (e) {
            show({ error: e.message });
        }
    }

    async function doPost() {
        const name = document.getElementById('post-name').value.trim();
        const bday = document.getElementById('post-bday').value.trim();

        if (!name) return show({ error: 'Имя не может быть пустым' });
        
        // Валидация даты на клиенте
        if (bday) {
            const validation = validateDateClient(bday);
            if (!validation.isValid) {
                return show({ error: validation.error });
            }
        }

        try {
            const res = await fetch('/api/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, bday })
            });
            const json = await res.json();
            show(json);
            doGet();
        } catch (e) {
            show({ error: e.message });
        }
    }

    async function doPut() {
        const id = Number(document.getElementById('put-id').value);
        const name = document.getElementById('put-name').value.trim();
        const bday = document.getElementById('put-bday').value.trim();

        if (!Number.isFinite(id) || id <= 0)
            return show({ error: 'ID должен быть положительным числом' });
        if (!name && !bday)
            return show({ error: 'Введите хотя бы одно поле для обновления' });

        // Валидация даты на клиенте
        if (bday) {
            const validation = validateDateClient(bday);
            if (!validation.isValid) {
                return show({ error: validation.error });
            }
        }

        try {
            const res = await fetch('/api/db', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, bday })
            });
            const json = await res.json();
            show(json);
            doGet();
        } catch (e) {
            show({ error: e.message });
        }
    }

    async function doDelete() {
        const id = Number(document.getElementById('del-id').value);
        if (!Number.isFinite(id) || id <= 0)
            return show({ error: 'Введите корректный ID для удаления' });

        try {
            const res = await fetch('/api/db?id=' + encodeURIComponent(id), { method: 'DELETE' });
            const json = await res.json();
            show(json);
            doGet();
        } catch (e) {
            show({ error: e.message });
        }
    }

    document.getElementById('btn-get').addEventListener('click', doGet);
    document.getElementById('btn-post').addEventListener('click', doPost);
    document.getElementById('btn-put').addEventListener('click', doPut);
    document.getElementById('btn-del').addEventListener('click', doDelete);

    doGet();
    getStats();
</script>

</body>
</html>`;

    sendHTML(res, 200, html);
}

function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            if (!body) return resolve(null);
            try {
                const json = JSON.parse(body);
                resolve(json);
            } catch (err) {
                reject(new Error('Invalid JSON body'));
            }
        });
        req.on('error', (err) => reject(err));
    });
}

const server = http.createServer(async (req, res) => {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;

    if (pathname !== '/api/ss') {
        requestCount++;
        if (statsActive) stats.request++;
    }

    console.log(`[HTTP] ${req.method} ${req.url} (Всего запросов: ${requestCount})`);

    if (req.method === 'GET' && pathname === '/api/ss') {
        return sendJSON(res, 200, {
            start: stats.start,
            finish: stats.finish,
            request: stats.request,
            commit: stats.commit
        });
    }

    if (pathname === '/api/db') {
        try {
            if (req.method === 'GET') {
                const rows = await db.selectAsync();
                return sendJSON(res, 200, rows);
            }

            if (req.method === 'POST') {
                const body = await parseRequestBody(req).catch(err => { throw err; });
                if (!body) throw new Error('Missing JSON body');
                const inserted = await db.insertAsync(body);
                return sendJSON(res, 201, inserted);
            }

            if (req.method === 'PUT') {
                const body = await parseRequestBody(req).catch(err => { throw err; });
                if (!body) throw new Error('Missing JSON body');
                if (typeof body.id === 'string') body.id = Number(body.id);
                const updated = await db.updateAsync(body);
                return sendJSON(res, 200, updated);
            }

            if (req.method === 'DELETE') {
                const id = parsed.query.id;
                if (!id) throw new Error('Missing id in query string');
                const deleted = await db.deleteAsync(Number(id));
                return sendJSON(res, 200, deleted);
            }

            res.writeHead(405, { 'Allow': 'GET, POST, PUT, DELETE' });
            return res.end();
        } catch (err) {
            const msg = err && err.message ? err.message : String(err);
            return sendJSON(res, 400, { error: msg });
        }
    }
    
    if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
        return serveIndex(res);
    }
    sendText(res, 404, 'Not Found');
});

server.listen(5000, () => console.log('Сервер запущен на http://localhost:5000'));

db.on('COMMIT', () => {
    if (statsActive) stats.commit++;
    console.log(`[DB] COMMIT #${db.commitCount} (Активных коммитов в статистике: ${stats.commit})`);
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Введите команду: sd x | sc x | ss x');

function handleSd(args) {
    if (serverStopTimer) {
        clearTimeout(serverStopTimer);
        serverStopTimer = null;
    }

    if (args.length === 0) {
        console.log('[CMD] Остановка отменена');
        return;
    }

    const seconds = parseInt(args[0]);
    if (isNaN(seconds)) return console.log('[CMD] Некорректное значение');

    serverStopTimer = setTimeout(() => {
        console.log('[SERVER] Сервер остановлен');
        server.close(() => process.exit(0));
    }, seconds * 1000);

    serverStopTimer.unref();
    console.log(`[CMD] Сервер остановится через ${seconds} секунд`);
}

function handleSc(args) {
    if (commitInterval) {
        clearInterval(commitInterval);
        commitInterval = null;
        console.log('[CMD] Периодический commit остановлен');
    }

    if (args.length === 0) return;

    const seconds = parseInt(args[0]);
    if (isNaN(seconds)) return console.log('[CMD] Некорректное значение');

    commitInterval = setInterval(() => db.commit(), seconds * 1000);

    commitInterval.unref();
    console.log(`[CMD] Периодический commit каждые ${seconds} секунд`);
}

function handleSs(args) {
    if (statsTimer) {
        clearTimeout(statsTimer);
        statsTimer = null;
    }

    if (args.length === 0) {
        if (statsActive) {
            stats.finish = new Date().toISOString();
            statsActive = false;
            console.log('[CMD] Сбор статистики остановлен');
        }
        return;
    }

    const seconds = parseInt(args[0]);
    if (isNaN(seconds)) return console.log('[CMD] Некорректное значение');

    statsActive = true;
    stats = {
        start: new Date().toISOString(),
        finish: null,
        request: 0,
        commit: 0
    };

    statsTimer = setTimeout(() => {
        stats.finish = new Date().toISOString();
        statsActive = false;
        console.log('[CMD] Сбор статистики завершён');
    }, seconds * 1000);

    statsTimer.unref();
    console.log(`[CMD] Сбор статистики запущен на ${seconds} секунд`);
}

rl.on('line', (input) => {
    const [cmd, ...args] = input.trim().split(/\s+/);
    switch (cmd) {
        case 'sd': handleSd(args); break;
        case 'sc': handleSc(args); break;
        case 'ss': handleSs(args); break;
        default: console.log('[CMD] Неизвестная команда');
    }
});