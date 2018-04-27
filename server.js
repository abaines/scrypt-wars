"use strict";

var http = require('http');
var url = require('url');
var fs = require('fs');
var shared = require('./shared.js');

/*
var net = require('net');

var server = net.createServer(function(socket) {
	socket.write('Echo server\r\n');
	socket.pipe(socket);
});

server.listen(1337, '127.0.0.1');
*/


var useCache = true;


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
	"contentType": 'text/javascript'
});

clientFileData.set('/jquery.js',{
	"path": "jquery.js",
	"contentType": 'text/javascript'
});

clientFileData.set('/shared.js',{
	"path": "shared.js",
	"contentType": 'text/javascript'
});

clientFileData.set('/client.css',{
	"path": "client.css",
	"contentType": 'text/css'
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


// example directory: "img"
// example extensions: ".png"
// example contentType: "image"
function LoadFolder(directory, extension, contentType)
{
	var folderPromises = [];
	return new Promise(function(resolve, reject) {
	
		fs.readdir(directory, (err, files) => {
			files.forEach(file => {
				if (file.endsWith(extension))
				{
					var p = new Promise(function(resolve, reject)
					{
						var filePath = directory+'/'+file;
						fs.readFile(filePath, function(err, data) {

							var url = '/' + filePath;
							clientFileData.set(url,{
								"data": data,
								"contentType": contentType,
								"path": filePath
							});

							resolve();
						});   
					});
				
					folderPromises.push(p);
				}
				else
				{
					console.error(extension,file);
					reject();
				}
			});
			
			
			Promise.all(folderPromises).then(function(values) {
				resolve(files.length);
			});
		});
	});
}


clientFilePromises.push(LoadFolder("img", ".png", "image"));
clientFilePromises.push(LoadFolder("audio", ".mp3", "audio"));



Promise.all(clientFilePromises).then(function(values) {
	// all of the client files have been read into cache
	console.log("client files cached");
	clientFileData.forEach(function(value, key, map)
	{
		console.log('\t',value.path,key,value.contentType,value.data.length);
	});
});




var mapSet = new Set();

var loadMapListPromise = new Promise(function(resolve,reject)
{
	
	
	
	fs.readdir("maps", (err, files) => 
	{
		files.forEach(file => 
		{
			if (file.endsWith(".json"))
			{
				console.log("mapname",file);
				mapSet.add(file);
			}
		});
		
		console.log(mapSet);
		
		resolve(mapSet.length);
	});
	
	
	
});







var maphash = 1;

var mapunits;

var mapterrain;


function clientLoadMap(query)
{
	var name = query.name;
	
	var isValidMapName = shared.isAlphaNumeric(name);
	
	console.log(name,isValidMapName);
	
	if (!isValidMapName)
	{
		console.log("invalid load map request",name);
	}
	else if (mapSet.has(name+".json"))
	{
		var mappath = "maps/"+name+".json";
		console.log("we have it!",mappath);
		
		loadMapData(mappath);
		
	}
	else
	{
		console.log("Can't find map to load",name);
	}
}


function loadMapData(path)
{
	return new Promise(function(resolve, reject) {
		fs.readFile(path, function(err, data)
		{
			console.log(path);
			var obj = JSON.parse(data);

			mapunits = obj.Dynamic;
	
			mapterrain = obj.Static;

			// display map
			mapterrain.Map.forEach(function(row)
			{
				var c = 0;
				var sb = "";
				row.forEach(function(el)
				{
					sb += el;
				});
				console.log(sb);
			});
			
			endTurn();
			
			resolve();

		});
	});
}


loadMapData("maps/map1.json");



// Map legend:
// P Plains
// W Water
// M Mountains
// F Forest
// R Roads
// S Swamp





function moveunit(query,response)
{
	console.log(query);
	console.log(mapunits);
	
	try
	{
		var id = parseInt(query.id);
		
		var x = parseInt(query.x);
		var y = parseInt(query.y);
		
		
		if (Math.abs(mapunits.Units[id].location[0] - x)>1 || Math.abs(mapunits.Units[id].location[1] - y)>1)
		{
			var err = "Invalid Movement";
			response.write(err);
			throw err;
		}
		
		var moveTile = mapterrain.Map[y][x];
		console.log('moveTile',moveTile);
		
		var mmm = mapunits.Units[id].moveMatrix[moveTile] || Infinity;
		console.log('mmm',mmm);
		
		var cost = Math.hypot(mapunits.Units[id].location[0] - x,mapunits.Units[id].location[1] - y)*mmm;
		
		if ((mapunits.Units[id].actionPoints||0) < cost)
		{
			var err = "Not Enough Action Points";
			response.write(err);
			throw err;
		}
		

		var location = [x,y];

		mapunits.Units[id].location = location;
		mapunits.Units[id].actionPoints -= cost;
	}
	catch(err)
	{
		console.trace(err);
	}
	
	maphash++;
	console.log('map1hash',maphash);
}

function endTurn(query)
{
	console.log('endTurn',query);
	
	mapunits.Units.forEach(function(unit)
	{
		unit.actionPoints = (unit.actionPoints||0) + unit.baseActionPoints;
		
		if (unit.actionPoints>unit.baseActionPoints*2)
		{
			unit.actionPoints=unit.baseActionPoints*2;
		}
		
	});
	
	maphash++;
	console.log('maphash',maphash);
}


function attack(query)
{
	try
	{
		var attackerId = parseInt(query.attacker);
		var defenderId = parseInt(query.defender);
		console.log(query,attackerId, defenderId);
		
		var attacker = mapunits.Units[attackerId];
		var defender = mapunits.Units[defenderId];
		
		var validResponse = shared.checkValidAttack(attacker,defender);
		
		if (validResponse !== true)
		{
			throw validResponse;
		}
		
		microAttacks(attacker,defender);
		
		//attacker.health -= defender.damage._base;
		//defender.health -=attacker.damage._base;
		
		//attacker.health -= attacker.attackCost;
		
		console.log(attacker,attacker.damage._base,attacker.health);
		console.log(defender,defender.damage._base,defender.health);
	}
	catch(err)
	{
		console.trace(err);
	}
	
	checkForWin();
	
	maphash++;
	console.log('maphash',maphash);
}

function microAttacks(attacker,defender)
{
	var attackerMicros = 0;
	var defenderMicros = 0;
	
	var history = "";
	
	while (true)
	{
		var attackerExpected = expectedMicroAttacks(attacker) - attackerMicros;
		var defenderExpected = expectedMicroAttacks(defender) - defenderMicros;
		
		if ( attackerExpected <= 0 && defenderExpected<=0 )
		{
			console.log("final micros",attackerExpected,defenderExpected);
			console.log("total micros",attackerMicros,defenderMicros);
			break;
		}
		
		if (attacker.health<=0 || defender.health<=0)
		{
			console.log("deadunit",attacker.health,defender.health);
			break;
		}
		
		if ( selectMicro(attackerExpected,defenderExpected) )
		{
			var hit = randomInt(1);
			defender.health -= hit;
			if (hit==0)
			{
				history += "a";
			}
			else
			{
				history += "A";
			}
			attackerMicros++;
		}
		else
		{
			var hit = randomInt(1);
			attacker.health -= hit;
			if (hit==0)
			{
				history += "d";
			}
			else
			{
				history += "D";
			}
			defenderMicros++;
		}
		
		if ((attackerMicros+defenderMicros)%50==0)
		{
			if (false)
			{
				console.log(history, attackerMicros,defenderMicros,attacker.health,defender.health,Math.round(attackerExpected), Math.round(defenderExpected),
				charCount(history,'A'), charCount(history,'a'), charCount(history,'D'), charCount(history,'d'),  charCount(history.toLowerCase(),'a'), charCount(history.toLowerCase(),'d'));
			}
			history = "";
		}
	}
	//console.log(history);
}

function charCount(str,char)
{
	var stringsearch = char;
	var count;
	for(var i=count=0; i<str.length; count+=+(stringsearch===str[i++]));
	return count;
}

function selectMicro(atk,def)
{
	var sum = atk*10 + def;
	var r = randomInt(sum);
	return r > def;
}

function expectedMicroAttacks(unit)
{
	var perc = Math.min(unit.health / unit.baseHealth,1.0);
	
	
	return unit.damage._base *( perc/2 + 0.5);
}

function checkForWin()
{
	const teamsAlive = new Set();

	mapunits.Units.forEach(function(unit) {
		
		console.log(unit.team,unit.health);
		if (unit.health>0)
		{
			teamsAlive.add(unit.team);
		}
		
	});
	
	console.log(teamsAlive.size,teamsAlive);
	
	// last team standing wins
	if (teamsAlive.size==1)
	{
		mapunits.winner = teamsAlive.values().next().value;
		console.log(mapunits.winner);
	}
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
	
	if (qpn!="/hash")
	{
		console.log(q.pathname,request.connection.remoteAddress);
	}
	
	if (clientFileData.has(qpn))
	{
		var fileData = clientFileData.get(qpn);
		
		if (useCache)
		{
			response.writeHead(200, {'Content-Type': fileData.contentType});
			response.write(fileData.data);
			response.endLog();
		}
		else
		{
			fs.readFile(fileData.path, function(err, data) {
				response.writeHead(200, {'Content-Type': fileData.contentType});
				response.write(data);
				response.endLog();
			});
		}
		return;
	}

	switch(qpn) {
		case "/terrain":
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.write(JSON.stringify(mapterrain));
			response.endLog();
			break;

		case "/units":
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.write(JSON.stringify(mapunits));
			response.endLog();
			break;
			
		case "/moveunit":
			moveunit(q.query,response);
			response.endLog();
			break;
			
		case "/endturn":
			endTurn(q.query);
			response.endLog();
			break;
			
		case "/attack":
			attack(q.query);
			response.endLog();
			break;
			
		case "/hash":
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.write(JSON.stringify(maphash));
			response.endLog();
			break;
			
		case "/loadmap":
			clientLoadMap(q.query);
			response.endLog();
			break;

		default:
			console.log("UNKNOWN QUERY PATHNAME");
			console.log(q.pathname);
			response.endLog();
	}	
}


http.createServer(dothething).listen(8080);

console.log(shared.xkcdRandom());


// 0 to i inclusive
function randomInt(i)
{
	return Math.floor(Math.random() * (i + 1));
}

function pennyRandom(count)
{
	var d = new Map();
	d.set(0,0);
	d.set(1,0);
	
	for (var i = 0; i < count; i++)
	{ 
		//var n = Math.floor(Math.random() * 2);
		var n = randomInt(1);
	
		d.set(n,d.get(n)+1);
	}
	
	var zero = d.get(0);
	var one = d.get(1);	
	
	return d;
}

function randomPlayground(pennies,times)
{
	var d = new Map();

	for (var i = 0; i < times; i++)
	{ 
		var p = pennyRandom(pennies).get(0);
		
		if (!d.has(p))
		{
			d.set(p,0);
		}
		
		d.set(p,d.get(p)+1);
	}
	
	var a = Array.from(d.keys());
	a.sort();
	//console.log(a);
	
	a.forEach(function(value)
	{
		console.log(value,d.get(value));
	});
}

/*
var ma = 0;

for (var i = 0; i < 100000; i++)
{ 
	var m = randomPlayground();
	ma = Math.max(m,ma);


console.log(ma);
*/

/*
randomPlayground(10,   10000);
randomPlayground(100,  10000);
randomPlayground(1000, 10000);
randomPlayground(10000,10000);
//*/

	setTimeout(function()
	{
		microAttacks(mapunits.Units[0],mapunits.Units[1]);
		console.log("micro test", mapunits.Units[0].health,mapunits.Units[1].health, mapunits.Units[0].health-mapunits.Units[1].health);
		
		microAttacks(mapunits.Units[1],mapunits.Units[0]);
		console.log("micro test", mapunits.Units[0].health,mapunits.Units[1].health, mapunits.Units[0].health-mapunits.Units[1].health);
		
		var ts = 0;
		var fs = 0;
		for (var i = 0; i < 1100; i++)
		{
			if (selectMicro(15000,15000))
			{
			ts++;
			}
			else
			{
			fs++;
			}
		}
		console.log(ts,fs);
		
	}, 2000);

console.log("end of hello.js");



