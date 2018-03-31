"use strict";

console.log("hello!");

$.getJSON( "map1/units", function( data ) {
	  console.log(data);
});

$.getJSON( "map1/terrain", function( data ) {
	  console.log(data);
});
