"use strict";

var PG = null;
var lastUpdateTime = 0;

PuzzleMenu.init();

// Auto refresh on new version
var http = new XMLHttpRequest();
var url = "/PuzzleCylinder/version.html?date=" + Math.floor(Date.now() / 1000);
http.open("GET", url, true);

//Send the proper header information along with the request
http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

http.onreadystatechange = function () {
	//Call a function when the state changes.
	if (http.readyState == 4 && http.status == 200) {
		lastUpdateTime = http.responseText;
		if (typeof Storage !== "undefined") {
			console.log("Your Version: " + localStorage.getItem("version"));
			console.log("Server Version: " + http.responseText);
			if (http.responseText !== localStorage.getItem("version")) {
				localStorage.setItem("version", http.responseText);
				location.reload(true);
			} else {
				PG = new PuzzleTower();
			}
		} else {
			PG = new PuzzleTower();
		}
	}
};

http.send(null);