"use strict";

console.log("hello!");

$.getJSON( "map1/units", function( data ) {
	  console.log(data);
});

$.getJSON( "map1/terrain", function( data ) {
	console.log(data);

	var r = 0;
	data.forEach(function(row) {
  		console.log(row);
  		
  		var c = 0;
  		row.forEach(function(el)
  		{
  			console.log(r,c,el);
  			
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



