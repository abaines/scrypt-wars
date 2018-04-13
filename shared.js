"use strict";

(function(exports){

    // your code goes here
    
	exports.xkcdRandom = function()
	{
		console.log("gold standard");
		return 4;
	};

	exports.checkValidAttack = function()
	{
		return false;
	};
	
	console.log("shared.js loaded inside.");

})(typeof exports === 'undefined'? this['shared']={}: exports);

console.log("shared.js loaded outside.");

