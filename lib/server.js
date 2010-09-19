var http = require('http'),
	io = require('socket.io'),
	url = require('url'),
	querystring = require('querystring'),
	node_static = require('node-static');

var Client = require('mysql').Client,
    mysql = new Client();

mysql.user = 'root';
mysql.password = '';
mysql.database = 'error';
mysql.connect();

var clients = {};
var static_files = new node_static.Server('../public');

var server = http.createServer(function(req, res) {
    console.log('HTTP request: ' + req.url);
    console.log(req);
    switch(url.parse(req.url).pathname) {
        case '/track': 
            save(req);
        	res.writeHead(200, {'Content-Type': 'text/plain'});
        	res.end('saved\n');
            break;
        default:
            console.log("Serving static files..")
            static_files.serve(req, res);
			console.log('wtf');
            break;
    }
});

server.listen(8080, "0.0.0.0");

function save(req) {
    var params = querystring.parse(url.parse(req.url).query),
        json = JSON.stringify(params),
        now = new Date(),
        agent = req.headers['user-agent'];
        
    console.log('params!')
    console.log(params);
    
	for (var id in clients) {
	    clients[id].send(json);
	}
	mysql.query('INSERT INTO record (token, message, url, file, line, trace, agent, created) VALUE (?, ?, ?, ?, ?, ?, ?, ?)',
                ['1', params.m, params.u, params.f, params.l, params.s, agent, formatDate(now)]);
}

var socket = io.listen(server);
socket.on('connection', function(client) {
    console.log('New connection: ' + client.sessionId);
    client.on('disconnect', function() {
        console.log('Lost connection: ' + client.sessionId);
        delete clients[client.sessionId];
    });
    clients[client.sessionId] = client;
    var data = mysql.query('SELECT * FROM record LIMIT 30', function(err, result) {
        console.log("insdie callback");
        console.log('error' + err);
        console.log('result')
        console.log(result)
        client.send(JSON.stringify(result));
    });
    // client.send()
});


function formatDate(date1) {
    return date1.getFullYear() + '-' +
        (date1.getMonth() < 9 ? '0' : '') + (date1.getMonth()+1) + '-' +
        (date1.getDate() < 10 ? '0' : '') + date1.getDate();
}
/* m - message
 * l - line
 * f - file
 * s - stacktrace 
 */

/*
CREATE TABLE `record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `url` text DEFAULT NULL,
  `file` text DEFAULT NULL,
  `line` int(11) DEFAULT NULL,
  `trace` text DEFAULT NULL,
  `agent` text DEFAULT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8
*/