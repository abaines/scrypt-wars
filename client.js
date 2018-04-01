"use strict";

console.log("hello!");

const tileSize = 64;

var lastHash = -1;

function mapUpdate() {

	var defer = $.Deferred();

	// TODO: move inside getJSON to reduce flicker
	$( ".unit" ).remove();

	$.getJSON( "map1/units", function( data ) {
	
		console.log(data);

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
		
		defer.resolve();
	});
	
	return defer.promise();
}

mapUpdate();

$.getJSON( "map1/terrain", function( data ) {
	console.log(data);

	var r = 0;
	data.forEach(function(row) {

  		var c = 0;
  		row.forEach(function(el)
  		{
  			if (el=="P")
  			{
  				$( "#map" ).append( '<img src="img/plains.png" style="width:64px;height:64px;"/>' );
  			}
  			else
  			{
  				$( "#map" ).append( '<img src="img/water.png" style="width:64px;height:64px;"/>' );
  			}
  			c++;
  		});
		$( "#map" ).append( '<br>' );
  		r++;
	});
});

function moveUnit(unitId,x,y)
{
	$.ajax("map1/moveunit?id="+unitId+"&x="+x+"&y="+y+"");
}

function checkHash()
{
	$.getJSON( "map1/hash", function( data ) {
			
		if (data == lastHash)
		{
			setTimeout(checkHash, 1000);
			console.log('checkHash',data);
		}
		else
		{
			mapUpdate().then(function()
			{
				lastHash = data;
				console.log('checkHash',data,lastHash,'update complete');
				setTimeout(checkHash, 1000);
			});
			console.log('checkHash',data,lastHash,'starting update');
		}
		
	});
}

checkHash();




