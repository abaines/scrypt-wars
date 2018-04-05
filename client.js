"use strict";

console.log("hello!");

const pingRate = 1000/20;

const tileSize = 64;

var lastHash = -1;

var unitData = null;

var selectedUnitId = null;

var terrainData = null;


function unitClick(event)
{
	var id = $(event.target).attr('id');
	selectedUnitId = parseInt( id.slice(4) );
	console.log(id,selectedUnitId,unitData[selectedUnitId]);
	$("#selectedUnitId").text("selected unit: " + selectedUnitId);
}

function mapUpdate() {

	var defer = $.Deferred();

	// TODO: move inside getJSON to reduce flicker
	$( ".unit" ).remove();

	$.getJSON( "map1/units", function( data ) {
	
		unitData = data;
		console.log(unitData);

		const xoffset = 8;
		const yoffset = 8;

		var unitId = 0;
		data.forEach(function(unit) {
			var x = xoffset + tileSize*unit.location[0];
			var y = yoffset + tileSize*unit.location[1];
			
			console.log(unit.img, x, y, unit.location);

			$( "#map" ).append( '<img class="unit" id="unit'+unitId+'" src="'+unit.img+'" style="position:absolute;width:64px;height:64px;"/>' );
			$( "#unit"+unitId ).css("left",x).css("top",y);
			
			unitId++;
		});
		
		$( ".unit" ).click(unitClick);
		
		defer.resolve();
	});
	
	return defer.promise();
}

mapUpdate();

function makeTile(src, row, col)
{
	return '<img src="'+src+'" style="width:64px;height:64px;" class="tile" row='+row+' col='+col+' />';
}

function tileClick(event)
{
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
  			if (el=="P")
  			{
  				$( "#map" ).append( makeTile("img/plains.png",r,c) );
  			}
  			else
  			{
  				$( "#map" ).append( makeTile("img/water.png",r,c) );
  			}
  			c++;
  		});
		$( "#map" ).append( '<br>' );
  		r++;
	});
	

	
	$( ".tile" ).click(tileClick);
});



function moveUnit(unitId,x,y)
{
	$.ajax("map1/moveunit?id="+unitId+"&x="+x+"&y="+y+"");
}


function checkHash()
{
	$.getJSON( "map1/hash", function( data ) {
	
		$("#lastHash").text("hash: " + data);
			
		if (data == lastHash)
		{
			setTimeout(checkHash, pingRate);
			//console.log('checkHash',data);
		}
		else
		{
			mapUpdate().then(function()
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




