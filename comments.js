// Create web server
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {}; // Cache file content

// Send 404 error
function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

// Send file content
function sendFile(response, filePath, fileContent) {
    response.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
    response.end(fileContent);
}

// Check cache
function serveStatic(response, cache, absPath) {
    // Check cache
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]); // From memory
    } else {
        fs.exists(absPath, function(exists) { // Check file existence
            if (exists) {
                fs.readFile(absPath, function(err, data) { // Read file
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data); // From disk
                    }
                });
            } else {
                send404(response); // Send 404
            }
        });
    }
}

// Create server
var server = http.createServer(function(request, response) {
    var filePath = false;
    // Determine default HTML file
    if (request.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath); // Return static file
});

// Start server
server.listen(3000, function() {
    console.log("Server listening on port 3000.");
});

// Set up Socket.IO server
var chatServer = require('./lib/chat_server');
chatServer.listen(server);