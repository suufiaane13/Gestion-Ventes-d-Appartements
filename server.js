#!/usr/bin/env node
/**
 * Serveur HTTP simple avec Node.js
 * Pour lancer: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = 8000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.csv': 'text/csv',
    '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    let filePath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
    
    // Sécurité: empêcher l'accès aux fichiers en dehors du répertoire
    if (filePath.includes('..')) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Accès interdit');
        return;
    }
    
    filePath = path.join(__dirname, filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Fichier non trouvé');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Erreur serveur');
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}/index.html`;
    console.log('='.repeat(60));
    console.log('🚀 Serveur démarré avec succès!');
    console.log('='.repeat(60));
    console.log(`📍 URL: ${url}`);
    console.log(`📂 Port: ${PORT}`);
    console.log('='.repeat(60));
    console.log('\n💡 Ouvrez cette URL dans votre navigateur');
    console.log('   Appuyez sur Ctrl+C pour arrêter le serveur\n');
    
    // Ouvrir automatiquement dans le navigateur (Windows)
    const { exec } = require('child_process');
    exec(`start ${url}`, (error) => {
        if (error) {
            console.log(`⚠️  Impossible d'ouvrir automatiquement. Ouvrez manuellement: ${url}`);
        }
    });
});

