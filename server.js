"use strict";

var http = require('http');
var url = require('url');
var fs = require('fs');

/*
var net = require('net');

var server = net.createServer(function(socket) {
	socket.write('Echo server\r\n');
	socket.pipe(socket);
});

server.listen(1337, '127.0.0.1');



http.createServer(function (req, res) {
	var millis = Date.now();
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('Hello World after reboot two! ' + millis);
}).listen(8080);
*/
/*
http.createServer(function (req, res) {
	var millis = Date.now();
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('Hello World after reboot two! ' + millis);
}).listen(80);


http.createServer(function (req, res) {
  fs.readFile('index.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
}).listen(8080);
*/

var map1hash = 1;

var map1units;

fs.readFile('map1/units.js', function(err, data) {
	console.log("units.js");
	var obj = JSON.parse(data);
	console.log(obj);
	map1units = obj;
});

var map1terrain;

fs.readFile('map1/terrain.js', function(err, data) {
	console.log("terrain.js");
	var obj = JSON.parse(data);
	console.log(obj);
	map1terrain = obj;
});


function moveunit(query)
{
	console.log(query);
	console.log(map1units);
	
	try
	{
		var id = parseInt(query.id);

		var location = [parseInt(query.x),parseInt(query.y)];

		map1units[id].location = location;
	}
	catch(err)
	{
		console.trace(err);
	}
	
	map1hash++;
	console.log('map1hash',map1hash);
}

function dothething(request, response) {

	var milliseconds = (new Date).getTime();

	var q = url.parse(request.url, true);
	var qpn = q.pathname;
	
	
	response.requestTime = milliseconds;
	response.endLog = function()
	{
		var milliseconds = (new Date).getTime();
		this.end();
		
		var delta = milliseconds-this.requestTime;
		if (delta > 30)
		{
			console.log(milliseconds-this.requestTime+'ms', qpn, request.connection.remoteAddress);
		}
	};
	

	if (qpn!="/map1/hash")
	{
		console.log(q.pathname,request.connection.remoteAddress);
	}

	var makeSimpleFS = function(path,contentType)
	{
		fs.readFile(path, function(err, data) {
			response.writeHead(200, {'Content-Type': contentType});
			response.write(data);
			response.endLog();
		});
	}

	switch(qpn) {
		case "/":
			makeSimpleFS('index.html','text/html');
			break;
			
		case "/client.js":
		case "/jquery.js":
			makeSimpleFS(qpn.substr(1),'text/html');
			break;
			
		case "/img/blueTank.png":
		case "/img/blueSoldier.png":
		case "/img/water.png":
		case "/img/plains.png":
			makeSimpleFS(qpn.substr(1),'image');
			break;

		case "/favicon.ico":
			// icons are stupid
			makeSimpleFS(qpn.substr(1),'image/x-icon');
			break;

		case "/map1/terrain":
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.write(JSON.stringify(map1terrain));
			response.endLog();
			break;

		case "/map1/units":
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.write(JSON.stringify(map1units));
			response.endLog();
			break;
			
		case "/map1/moveunit":
			moveunit(q.query);
			response.endLog();
			break;
			
		case "/map1/hash":
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.write(JSON.stringify(map1hash));
			response.endLog();
			break;

		default:
			console.log("UNKNOWN QUERY PATHNAME");
			console.log(q.pathname);
			response.endLog();
	}	
}

http.createServer(dothething).listen(8080);

console.log("end of hello.js");

