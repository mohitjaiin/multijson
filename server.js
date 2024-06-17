"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var express = require("express");
var WebSocket = require("ws");
var path = require("path");
var app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.setHeader('Content-Security-Policy', "font-src 'self' data:; default-src 'self'");
    next();
});
app.use(express.static('public'));
var port = 3000;
var server = app.listen(port, function () {
    console.log("Server is listening on port ".concat(port));
});
var wss = new WebSocket.Server({ server: server });
function readJsonFromFile(clientId) {
    var filePath = path.join(__dirname, "data_".concat(clientId, ".json"));
    if (fs.existsSync(filePath)) {
        var data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    }
    else {
        return { name: "", age: 0 };
    }
}
function writeJsonToFile(clientId, data) {
    var filePath = path.join(__dirname, "data_".concat(clientId, ".json"));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
wss.on('connection', function (ws, req) {
    var params = new URLSearchParams(req.url.split('?')[1]);
    var clientId = params.get('clientId');
    if (!clientId) {
        ws.close(1008, 'Client ID required');
        return;
    }
    console.log("Client ".concat(clientId, " connected"));
    ws.send(JSON.stringify(readJsonFromFile(clientId)));
    ws.on('message', function (message) {
        console.log("Received from ".concat(clientId, ": ").concat(message));
        var data = JSON.parse(message.toString());
        writeJsonToFile(clientId, data);
    });
    ws.on('close', function () {
        console.log("Client ".concat(clientId, " disconnected"));
    });
});
app.get('/data/:clientId', function (req, res) {
    var clientId = req.params.clientId;
    try {
        var data = readJsonFromFile(clientId);
        res.json(data);
    }
    catch (err) {
        console.error("Error reading data for client ".concat(clientId, ":"), err);
        res.status(500).json({ error: 'Error reading file' });
    }
});
app.post('/data/:clientId', function (req, res) {
    var clientId = req.params.clientId;
    var data = req.body;
    if (typeof data.name !== 'string' || typeof data.age !== 'number') {
        return res.status(400).json({ error: 'Invalid data format' });
    }
    try {
        writeJsonToFile(clientId, data);
        res.status(200).json({ message: 'Data saved successfully' });
    }
    catch (err) {
        console.error("Error writing data for client ".concat(clientId, ":"), err);
        res.status(500).json({ error: 'Error writing file' });
    }
});
