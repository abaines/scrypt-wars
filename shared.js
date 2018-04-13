"use strict";

console.log("shared.js loaded.");

function checkValidAttack()
{
	console.log("derp?");
	return false;
}

module.exports.checkValidAttack = checkValidAttack;

