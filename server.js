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
*/


// files to make available to clients
// key is url
// path is relative path to file on disk
// contentType is type of file to tell the client
// cached into memory at server startup
var clientFileData = new Map();

clientFileData.set('/',{
	"path": "index.html",
	"contentType": 'text/html'
});

clientFileData.set('/client.js',{
	"path": "client.js",
	"contentType": 'text/html'
});

clientFileData.set('/jquery.js',{
	"path": "jquery.js",
	"contentType": 'text/html'
});

clientFileData.set('/favicon.ico',{
	"path": "favicon.ico",
	"contentType": 'image/x-icon'
});

// list of promises for each of the files we need to read from disk
var clientFilePromises = [];


clientFileData.forEach(function(value, key, map)
{
	var p = new Promise(function(resolve, reject)
	{
		var url = key;
		var filePath = value.path;
	
		fs.readFile(filePath, function(err, data) {
		
				value.data = data;
				resolve();
		});
	});
	
	clientFilePromises.push(p);
});


// collect all of the .png files from the `img` folder and make them available to clients
new Promise(function(resolve, reject) {

	fs.readdir("img", (err, files) => {
		files.forEach(file => {
			if (file.endsWith(".png"))
			{
				var p = new Promise(function(resolve, reject)
				{
					var filePath = 'img/'+file;
					fs.readFile(filePath, function(err, data) {

						var url = '/' + filePath;
						clientFileData.set(url,{
							"data": data,
							"contentType": 'image',
							"path": filePath
						});

						resolve();
					});   
				});
				
				clientFilePromises.push(p);
			}
			else
			{
				console.log("img!",file);
			}
		});
		resolve(files.length);
	});

}).then(function(value) {
	console.log('readdir complete',value);
	
	Promise.all(clientFilePromises).then(function(values) {
		// all of the client files have been read into cache
		console.log("client files cached");
		clientFileData.forEach(function(value, key, map)
		{
			console.log('\t',value.path,key,value.contentType,value.data.length);
		});
	});
});







var map1hash = 1;

var map1units;

fs.readFile('map1/units.json', function(err, data) {
	console.log('map1/units.json');
	var obj = JSON.parse(data);
	console.log(obj);
	map1units = obj;
	
	setTimeout(function()
	{
		endTurn();
	}, 1000);
});

// Map legend:
// P Plains
// W Water
// M Mountains
// F Forest
// R Roads
// S Swamp

var map1terrain;

fs.readFile('map1/terrain.json', function(err, data) {
	console.log('map1/terrain.json');
	map1terrain = JSON.parse(data);
	
	// display map 1
	var r = 0;
	map1terrain.Map.forEach(function(row)
	{
		var c = 0;
		var sb = "";
		row.forEach(function(el)
		{
			sb += el;
		});
		console.log(sb);
	});
	
});


function moveunit(query)
{
	console.log(query);
	console.log(map1units);
	
	try
	{
		var id = parseInt(query.id);
		
		var x = parseInt(query.x);
		var y = parseInt(query.y);
		
		
		if (Math.abs(map1units.Units[id].location[0] - x)>1 || Math.abs(map1units.Units[id].location[1] - y)>1)
		{
			throw "Invalid movement";
		}
		
		var moveTile = map1terrain.Map[y][x];
		console.log('moveTile',moveTile);
		
		var mmm = map1units.Units[id].moveMatrix[moveTile] || Infinity;
		console.log('mmm',mmm);
		
		var cost = Math.hypot(map1units.Units[id].location[0] - x,map1units.Units[id].location[1] - y)*mmm;
		
		if ((map1units.Units[id].actionPoints||0) < cost)
		{
			throw "not enough action points";
		}
		

		var location = [x,y];

		map1units.Units[id].location = location;
		map1units.Units[id].actionPoints -= cost;
	}
	catch(err)
	{
		console.trace(err);
	}
	
	map1hash++;
	console.log('map1hash',map1hash);
}

function endTurn(query)
{
	console.log('endTurn',query);
	
	map1units.Units.forEach(function(unit)
	{
		unit.actionPoints = (unit.actionPoints||0) + unit.baseActionPoints;
		
		if (unit.actionPoints>unit.baseActionPoints*2)
		{
			unit.actionPoints=unit.baseActionPoints*2;
		}
		
	});
	
	map1hash++;
	console.log('map1hash',map1hash);
}


function attack(query)
{
	console.log(query);
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// handle server requests
///////////////////////////////////////////////////////////////////////////////////////////////////
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
	
	if (clientFileData.has(qpn))
	{
		var fileData = clientFileData.get(qpn);
		//console.log('magic!',fileData.path);
		response.writeHead(200, {'Content-Type': fileData.contentType});
		response.write(fileData.data);
		response.endLog();
		return;
	}

	switch(qpn) {
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
			
		case "/map1/endturn":
			endTurn(q.query);
			response.endLog();
			break;
			
		case "/map1/attack":
			attack(q.query);
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

