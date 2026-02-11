const fs = require('fs').promises;
const path = require('path');

const MIME_TYPES = {
    'html': 'text/html; charset=utf-8',
    'css': 'text/css; charset=utf-8',
    'js': 'text/javascript; charset=utf-8',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'docx': 'application/msword',
    'json': 'application/json; charset=utf-8',
    'xml': 'application/xml; charset=utf-8',
    'mp4': 'video/mp4',
    'txt': 'text/plain; charset=utf-8'
};

class StaticFileHandler {
    constructor() {
        this.fileCache = new Map();
    }

    async handleStaticRequest(request, response, staticDir) {
        try {
            let requestPath = request.url;

            if (requestPath === '/' || requestPath === '') {
                requestPath = '/index.html';
            }

            try {
                requestPath = decodeURIComponent(requestPath);
            } catch (e) {
                return false;
            }

            if (requestPath.includes('../') || requestPath.includes('..\\')) {
                response.writeHead(400, {
                    'Content-Type': 'text/plain; charset=utf-8'
                });
                response.end('Invalid path');
                return true;
            }

            const filePath = path.join(staticDir, ...requestPath.split('/').filter(Boolean));
            
            const resolvedPath = path.resolve(filePath);
            const resolvedStaticDir = path.resolve(staticDir);
            
            if (!resolvedPath.startsWith(resolvedStaticDir)) {
                response.writeHead(403, {
                    'Content-Type': 'text/plain; charset=utf-8'
                });
                response.end('Access denied');
                return true;
            }

            return await this.serveFile(response, filePath);
        } catch (error) {
            console.error('Error handling static request:', error);
            return false;
        }
    }

    async serveFile(response, filePath) {
        try {
            const stats = await fs.stat(filePath);
            
            if (stats.isDirectory()) {
                const indexPath = path.join(filePath, 'index.html');
                return await this.serveFile(response, indexPath);
            }

            const fileExt = this.getFileExtension(filePath);
            const mimeType = MIME_TYPES[fileExt] || 'application/octet-stream';

            const fileContent = await fs.readFile(filePath);
            
            response.writeHead(200, {
                'Content-Type': mimeType,
                'Content-Length': fileContent.length
            });
            
            response.end(fileContent);
            return true;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return false;
            } else if (error.code === 'EISDIR') {
                const indexPath = path.join(filePath, 'index.html');
                return await this.serveFile(response, indexPath);
            }
            console.error('Error serving file:', error);
            return false;
        }
    }

    getFileExtension(fileName) {
        return path.extname(fileName).toLowerCase().slice(1);
    }

    destroy() {
        this.fileCache.clear();
    }
}

module.exports = StaticFileHandler;