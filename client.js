"use strict";

console.log("client.js loaded.");

const pingRate = 1000/20;

var tileScale = 23;

var tileSize = 2**(tileScale*.25);

var lastHash = -1;

var unitData = null;

var selectedUnitId = null;

var terrainData = null;

const xoffset = 8;
const yoffset = 31;

var teams = new Set();

var selectedTeam = null;


function unitClick(event) {
	var idAttr = $(event.target).attr('id');
	
	var id = parseInt( idAttr.slice(4) );
	
	var clickedUnit = unitData.Units[id];
	
	console.log('clickedUnit (ID '+id+'):',clickedUnit);
	
	if (clickedUnit.team != selectedTeam)
	{
		if (selectedUnitId != null)
		{
			var attackerId = selectedUnitId;
			var defenderId = id;
			var attacker = unitData.Units[attackerId];
			var defender = unitData.Units[defenderId];
			console.log("attacker:",attacker);
			console.log("defender:",defender);
			console.log("id:",id,"defenderId",defenderId,"unitData.Units[defenderId]",unitData.Units[defenderId]);
			var attackResponse = shared.checkValidAttack(attacker,defender);
			if (attackResponse === true)
			{
				console.log("Valid attack.");
				attack(attackerId,defenderId);
			} else
			{
				console.log("Invalid attack:",attackResponse);
			}
		}
		return;
	}
	
	selectedUnitId = id;
	
	var selectedUnit = unitData.Units[selectedUnitId];
	
	selectorUpdate(selectedUnit.location[0],selectedUnit.location[1]);
	
	//console.log(id,selectedUnitId,selectedUnit);
	console.log("Unit selected, selector updated",selectedUnit.location[0],selectedUnit.location[1]);
	$("#selectedUnitId").text("*Selected unit ID: " + selectedUnitId);
	//$("#selectedUnitActionPoints").text("Action Points: " + selectedUnit.actionPoints);
	
	updateUnitTooltip();
}

function updateTileSize(tileSize) {
	//$( ".tile" ).css("width",tileSize).css("height",tileSize);
	$( ".tile" ).animate({width:tileSize+"px",height:tileSize+"px"});
}

function pickTeam(event)
{
	$( "#pickTeamModal" ).remove();
	var team = $(event.target).attr('team');
	console.log('Selected team:',team);
	selectedTeam = team;
	
}

function mapStart() {

	var defer = $.Deferred();

	// TODO: move inside getJSON to reduce flicker
	$( ".unit" ).remove();

	$.getJSON( "map1/units", function( data ) {
	
		unitData = data;
		console.log(unitData);

		var unitId = 0;
		data.Units.forEach(function(unit) {
			var x = xoffset + tileSize*unit.location[0];
			var y = yoffset + tileSize*unit.location[1];
			
			console.log(unit.img, x, y, unit.location);

			$( "#map" ).append( '<img class="unit" id="unit'+unitId+'" src="'+unit.img+'" style="position:absolute;width:'+tileSize+'px;height:'+tileSize+'px;"/>' );
			$( "#unit"+unitId ).css("left",x).css("top",y);
			
			unitId++;
			
			var t = unit.team;
			teams.add(t);
		});
		
		$( ".unit" ).click(unitClick);
		
		updateUnitTooltip();
		
		console.log('teams',teams);
		
		for (var t of teams.keys())
		{
		//background-color: #e7e7e7; color: black;
			$( "#pickTeam" ).append( '<button type="button" class="pickTeam" team="'+t+'" style="background-color: '+t+'; color:gray" >'+t+'</button>' );
		};
		
		$( ".pickTeam" ).click(pickTeam);
		
		defer.resolve();
	});
	
	return defer.promise();
}

function selectorUpdate(x,y,animate) {
	var selX = xoffset+x*tileSize;
	var selY = yoffset+y*tileSize;
	if ($( "#selector" ).length == 0) {
		$( "#map" ).append( '<img id="selector" src="img/selector.png" style="position:absolute;width:'+tileSize+'px;height:'+tileSize+'px;"/>' );
		$( "#selector" ).css("left",selX).css("top",selY);
	}
	if (animate) {
		$( "#selector" ).animate({width:tileSize+"px",height:tileSize+"px",left:selX+"px",top:selY+"px"});
	} else {
		$( "#selector" ).css("left",selX).css("top",selY);
	}
}

function mapUpdate() {
	var defer = $.Deferred();

	$.getJSON( "map1/units", function( data ) {
	
		unitData = data;
		console.log("Flag:",unitData);

		var unitId = 0;
		data.Units.forEach(function(unit) {
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
		if (selectedUnitId != null) {
			var selectedUnit = unitData.Units[selectedUnitId];
	
			selectorUpdate(selectedUnit.location[0],selectedUnit.location[1],true);
		}
		updateUnitTooltip();
		
		defer.resolve();
	});
	
	return defer.promise();
}

function updateUnitTooltip() {
	// update action points GUI
	if (selectedUnitId!=null)
	{
		var selectedUnit = unitData.Units[selectedUnitId];
		$("#selectedUnitActionPoints").text("*Action Points: " + Math.round(selectedUnit.actionPoints));
	}
}


mapStart();

function makeTile(src, y, x) {
	return '<img src="'+src+'" style="width:'+tileSize+'px;height:'+tileSize+'px;" class="tile" y='+y+' x='+x+' />';
}

function tileClick(event) {
	var y = $(event.target).attr('y');
	var x = $(event.target).attr('x');
	console.log('Clicked tile:',x,y);
	
	if (selectedUnitId !== null)
	{
		console.log(selectedUnitId,x,y);
		
		moveUnit(selectedUnitId,x,y);
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


function displayAjaxReponse(result)
{
	if (result.responseText)
	{
		console.error(result.responseText);
	}
}


function endTurn()
{
	$.ajax({url:"map1/endturn?team=0",complete:displayAjaxReponse});
}

function attack(attackerId,defenderId)
{
	$.ajax({url:"map1/attack?attacker="+attackerId+"&defender="+defenderId,complete:displayAjaxReponse});
}

function moveUnit(unitId,x,y)
{
	$.ajax({url:"map1/moveunit?id="+unitId+"&x="+x+"&y="+y+"",complete:displayAjaxReponse});
}


function checkHash() {
	$.getJSON( "map1/hash", function( data ) {
	
		$("#lastHash").text("*Hash: " + data);
			
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




