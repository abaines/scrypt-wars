"use strict";

console.log("hello!");

const tileSize = 64;

$.getJSON( "map1/units", function( data ) {
	console.log(data);

	const xoffset = 8;
	const yoffset = 164;

	var unitId = 0;
	data.forEach(function(unit) {
		var x = xoffset + tileSize*unit.location[0];
		var y = yoffset + tileSize*unit.location[1];
		
		console.log(unit.img, x, y, unit.location);

		$( "#map" ).append( '<img id="unit'+unitId+'" src="'+unit.img+'" style="position:absolute;width:64px;height:64px;"/>' );
		$( "#unit"+unitId ).css("left",x).css("top",y);
		
		unitId++;
	});
});

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
  		r++;
	});
});

function moveUnit(unitId,x,y)
{
	
}





