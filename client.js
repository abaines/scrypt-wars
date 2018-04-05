"use strict";

console.log("hello!");

const tileSize = 64;

var lastHash = -1;

function unitClick(event)
{
	var id = $(event.target).attr('id');
	console.log(id);
}

var unitData = null;

function mapUpdate() {

	var defer = $.Deferred();

	// TODO: move inside getJSON to reduce flicker
	$( ".unit" ).remove();

	$.getJSON( "map1/units", function( data ) {
	
		unitData = data;
		console.log(unitData);

		const xoffset = 8;
		const yoffset = 164;

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

var terrainData = null;

$.getJSON( "map1/terrain", function( data ) {
	terrainData = data;
	console.log(terrainData);

	var r = 0;
	data.forEach(function(row) {

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
	
	function tileClick(event)
	{
		var row = $(event.target).attr('row');
		var col = $(event.target).attr('col');
		console.log('tile',row,col);
	}
	
	$( ".tile" ).click(tileClick);
});



function moveUnit(unitId,x,y)
{
	$.ajax("map1/moveunit?id="+unitId+"&x="+x+"&y="+y+"");
}

const pingRate = 1000/10;

function checkHash()
{
	$.getJSON( "map1/hash", function( data ) {
			
		if (data == lastHash)
		{
			setTimeout(checkHash, pingRate);
			console.log('checkHash',data);
		}
		else
		{
			mapUpdate().then(function()
			{
				lastHash = data;
				console.log('checkHash',data,lastHash,'update complete');
				setTimeout(checkHash, pingRate);
			});
			console.log('checkHash',data,lastHash,'starting update');
		}
		
	});
}

checkHash();




