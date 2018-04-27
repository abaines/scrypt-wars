"use strict";

(function(exports){

    // your code goes here
    
	exports.xkcdRandom = function()
	{
		console.log("gold standard");
		return 4;
	};

	exports.calculateDistance = function(locationAlpha,locationBravo)
	{
		var distance = Math.hypot(locationAlpha[0] - locationBravo[0],locationAlpha[1] - locationBravo[1]);
		return distance;
	};
	
	exports.checkValidAttack = function(attacker,defender)
	{
		if (exports.calculateDistance(attacker.location,defender.location) > attacker.range)
		{
			return "Too far.";
		}
		if (attacker.actionPoints < attacker.attackCost)
		{
			return "Not enough Action points.";
		}
		
		if (attacker.health<=0)
		{
			return "Attacker is dead.";
		}
		
		if (defender.health<=0)
		{
			return "Defender is dead.";
		}
		
		return true;
	};
	
	exports.isAlphaNumeric = function(str)
	{
		var code, i, len;

		for (i = 0, len = str.length; i < len; i++)
		{
			code = str.charCodeAt(i);
			if (!(code > 47 && code < 58) && // numeric (0-9)
			!(code > 64 && code < 91) && // upper alpha (A-Z)
			!(code > 96 && code < 123)) { // lower alpha (a-z)
				return false;
			}
		}
		return true;
	};
	
	

	console.log("shared.js loaded inside.");

})(typeof exports === 'undefined'? this['shared']={}: exports);

console.log("shared.js loaded outside.");
