var http = require('http'),
	mongo = require('mongodb'),
	io = require('socket.io'),
	url = require('url'),
	querystring = require('querystring'),
	node_static = require('node-static');
// 
// var mongo_host = 'localhost',
//  mongo_port = mongo.Connection.DEFAULT_PORT;

// var db = new mongo.Db('error', new mongo.Server('localhost', mongo.Connection.DEFAULT_PORT, {}), {});
var clients = {};
var static_files = new node_static.Server('../public');

var server = http.createServer(function(req, res) {
    var parsed = url.parse(req.url);
    console.log('HTTP request: ' + req.url);
    switch(parsed.pathname) {
        case '/track': 
            save_vars(querystring.parse(parsed.query));
        	res.writeHead(200, {'Content-Type': 'text/plain'});
        	res.end('saved\n');
            break;
        default:
            static_files.serve(req, res);
            break;
    }
});

server.listen(8080, "0.0.0.0");

function save_vars(vars) {
    var json = JSON.stringify(vars);
	for (var id in clients) {
	    clients[id].send(json);
	}
}

var socket = io.listen(server);
socket.on('connection', function(client) {
    console.log('New connection: ' + client.sessionId);
    client.on('disconnect', function() {
        console.log('Lost connection: ' + client.sessionId);
        delete clients[client.sessionId];
    });
    clients[client.sessionId] = client;
});
/* m - message
 * l - line
 * f - file
 * s - stacktrace 
 */
