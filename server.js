var http = require('http')
http.createServer(function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hi\n');
}).listen(8124, "0.0.0.0");
console.log('Server running');
