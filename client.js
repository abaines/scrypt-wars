"use strict";

console.log("hello!");

const pingRate = 1000/20;

var tileScale = 24;

var tileSize = 2**(tileScale*.25);

var lastHash = -1;

var unitData = null;

var selectedUnitId = null;

var terrainData = null;

const xoffset = 8;
const yoffset = 28;


function unitClick(event) {
	var id = $(event.target).attr('id');
	selectedUnitId = parseInt( id.slice(4) );
	
	var selectedUnit = unitData[selectedUnitId];
	
	console.log(id,selectedUnitId,selectedUnit);
	$("#selectedUnitId").text("selected unit: " + selectedUnitId);
	//$("#selectedUnitActionPoints").text("Action Points: " + selectedUnit.actionPoints);
	
	updateUnitTooltip();
}

function updateTileSize(tileSize) {
	//$( ".tile" ).css("width",tileSize).css("height",tileSize);
	$( ".tile" ).animate({width:tileSize+"px",height:tileSize+"px"});
}

function mapStart() {

	var defer = $.Deferred();

	// TODO: move inside getJSON to reduce flicker
	$( ".unit" ).remove();

	$.getJSON( "map1/units", function( data ) {
	
		unitData = data;
		console.log(unitData);

		var unitId = 0;
		data.forEach(function(unit) {
			var x = xoffset + tileSize*unit.location[0];
			var y = yoffset + tileSize*unit.location[1];
			
			console.log(unit.img, x, y, unit.location);

			$( "#map" ).append( '<img class="unit" id="unit'+unitId+'" src="'+unit.img+'" style="position:absolute;width:'+tileSize+'px;height:'+tileSize+'px;"/>' );
			$( "#unit"+unitId ).css("left",x).css("top",y);
			
			unitId++;
		});
		
		$( ".unit" ).click(unitClick);
		
		updateUnitTooltip();
		
		defer.resolve();
	});
	
	return defer.promise();
}

function mapUpdate() {
	var defer = $.Deferred();

	$.getJSON( "map1/units", function( data ) {
	
		unitData = data;
		console.log(unitData);

		var unitId = 0;
		data.forEach(function(unit) {
			var x = xoffset + tileSize*unit.location[0];
			var y = yoffset + tileSize*unit.location[1];
			
			console.log(unit.img, x, y, unit.location);

			/*if (!noAnimate) {
				$( "#unit"+unitId ).css("left",x).css("top",y);
			} else {
				$( "#unit"+unitId ).animate({left:x+"px",top:y+"px"});
			}*/
			//$( "#unit"+unitId ).css("height",tileSize).css("width",tileSize);
			//$( "#unit"+unitId ).animate({left:x+"px",top:y+"px"});
			$( "#unit"+unitId ).animate({width:tileSize+"px",height:tileSize+"px",left:x+"px",top:y+"px"});
			
			unitId++;
		});
		
		updateUnitTooltip();
		
		defer.resolve();
	});
	
	return defer.promise();
}

function updateUnitTooltip() {
	// update action points GUI
	if (selectedUnitId!=null)
	{
		var selectedUnit = unitData[selectedUnitId];
		$("#selectedUnitActionPoints").text("Action Points: " + Math.round(selectedUnit.actionPoints));
	}
}


mapStart();

function makeTile(src, row, col) {
	return '<img src="'+src+'" style="width:'+tileSize+'px;height:'+tileSize+'px;" class="tile" row='+row+' col='+col+' />';
}

function tileClick(event) {
	var row = $(event.target).attr('row');
	var col = $(event.target).attr('col');
	console.log('tile',row,col);
	
	if (selectedUnitId !== null)
	{
		console.log(selectedUnitId,col,row);
		
		moveUnit(selectedUnitId,col,row);
	}
}
	
$.getJSON( "map1/terrain", function( data ) {
	terrainData = data;
	console.log(terrainData);

	var r = 0;
	data.Map.forEach(function(row) {

  		var c = 0;
  		row.forEach(function(el)
  		{
  		
  			switch( el.toLowerCase() ) {
				case "p":
					$( "#map" ).append( makeTile("img/plains.png",r,c) );
					break;
				case "w":
					$( "#map" ).append( makeTile("img/water.png",r,c) );
					break;
				case "r":
					$( "#map" ).append( makeTile("img/road.png",r,c) );
					break;
				case "m":
					$( "#map" ).append( makeTile("img/mountain.png",r,c) );
					break;
				case "s":
					$( "#map" ).append( makeTile("img/swamp.png",r,c) );
					break;
				case "f":
					$( "#map" ).append( makeTile("img/forest.png",r,c) );
					break;
				default:
					$( "#map" ).append( makeTile("img/error.png",r,c) );
			}
  		
  			c++;
  		});
		$( "#map" ).append( '<br>' );
  		r++;
	});
	

	
	$( ".tile" ).click(tileClick);
});

function endTurn() {
	$.ajax("map1/endturn?team=0");
}

$( "#endTurn" ).click(endTurn);

//code to shrink and grow map
function resetMap() {
	tileScale = 24;
	tileSize = Math.round(2**(tileScale*.25));
	mapUpdate();
	updateTileSize(tileSize);
	$("#mapSize").text("Map tile size: " + tileScale + "("+tileSize+")");
}
$( "#resetMap" ).click(resetMap);

function shrinkMap() {
	tileScale--;
	tileSize = Math.round(2**(tileScale*.25));
	mapUpdate();
	updateTileSize(tileSize);
	$("#mapSize").text("Map tile size: " + tileScale + "("+tileSize+")");
}
$( "#shrinkMap" ).click(shrinkMap);


function growMap() {
	tileScale++;
	tileSize = Math.round(2**(tileScale*.25));
	mapUpdate();
	updateTileSize(tileSize);
	$("#mapSize").text("Map tile size: " + tileScale + "("+tileSize+")");
}
$( "#growMap" ).click(growMap);

function moveUnit(unitId,x,y) {
	$.ajax("map1/moveunit?id="+unitId+"&x="+x+"&y="+y+"");
}


function checkHash() {
	$.getJSON( "map1/hash", function( data ) {
	
		$("#lastHash").text("hash: " + data);
			
		if (data == lastHash)
		{
			setTimeout(checkHash, pingRate);
			//console.log('checkHash',data);
		}
		else
		{
			mapUpdate(true).then(function()
			{
				console.log('checkHash',data,lastHash,'update complete');
				lastHash = data;
				setTimeout(checkHash, pingRate);
			});
			console.log('checkHash',data,lastHash,'starting update');
		}
		
	});
}

checkHash();




