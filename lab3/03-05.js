const http = require("http");
const url = require("url");


function factorialAsync(n, callback) {
  if (n < 0) {
    callback(new Error("Факториал отрицательных чисел не определён"), null);
    return;
  }

  function helper(i, acc) {
    if (i <= 1) {
      callback(null, acc);
    } else {
      setImmediate(() => helper(i - 1, acc * i));
    }
  }

  helper(n, 1);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);


  if (parsedUrl.pathname === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <title>Факториалы async (setImmediate)</title>
      </head>
      <body style="font-family: monospace; white-space: pre;">
        <h2>Вычисление факториалов (1..20)</h2>
        <div id="output"></div>
        <script>
          async function run() {
            const output = document.getElementById("output");
            const start = performance.now();
            for (let k = 1; k <= 20; k++) {
              const t = Math.round(performance.now() - start);
              try {
                const resp = await fetch('/fact?k=' + k);
                const data = await resp.json();
                output.innerText += t + '-' + data.k + '/' + data.fact + "\\n";
              } catch (e) {
                output.innerText += t + '-' + k + '/ERROR\\n';
              }
            }
            const total = Math.round(performance.now() - start);
            output.innerText += "\\nОбщее время: " + total + " мс";
          }
          run();
        </script>
      </body>
      </html>
    `);
  }


  else if (parsedUrl.pathname === "/fact" && req.method === "GET") {
    const k = parseInt(parsedUrl.query.k);

    if (isNaN(k)) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Некорректное значение параметра k" }));
      return;
    }

    factorialAsync(k, (err, fact) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: err.message }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ k: k, fact: fact }));
      }
    });
  }


  else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Страница не найдена");
  }
});

server.listen(5000, () => {
  console.log("Сервер запущен: http://localhost:5000");
});
