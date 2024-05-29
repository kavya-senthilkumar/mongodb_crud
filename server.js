const http = require('http');
const url = require('url');
const mongoose = require('mongoose');
const { parse } = require('querystring');
const cors = require('cors');


// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/teacher', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));


// Schema and Model
const infoSchema = new mongoose.Schema({
    name: String,
    department: String
});
const Info = mongoose.model('Info', infoSchema);


const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const path = parsedUrl.pathname;


    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');


    // Handle preflight request for CORS
    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }


    if (path === '/api/information' && method === 'GET') {
        try {
            const info = await Info.find();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(info));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(err));
        }
    } else if (path === '/api/information' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const { name , department } = JSON.parse(body);
            const info = new Info({ name, department });
            try {
                await info.save();
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(info));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(err));
            }
        });
    } else if (path.startsWith('/api/information/') && method === 'PUT') {
        const id = path.split('/')[3];
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const { name, department } = JSON.parse(body);
            try {
                const info = await Info.findByIdAndUpdate(id, { name, department }, { new: true });
                if (!info) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end('Information not found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(info));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(err));
            }
        });
    } else if (path.startsWith('/api/information/') && method === 'DELETE') {
        const id = path.split('/')[3];
        try {
            const info = await Info.findByIdAndDelete(id);
            if (!info) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end('Information not found');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(info));
            }
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(err));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});


// Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running....'));