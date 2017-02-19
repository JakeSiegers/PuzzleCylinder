"use strict";

PuzzleMenu.init();
var PG = null;

// Auto refresh on new version
var http = new XMLHttpRequest();
var url = "/PuzzleCylinder/version.html";
var params = "date=" + Math.floor(Date.now() / 1000);
http.open("POST", url, true);

//Send the proper header information along with the request
http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

http.onreadystatechange = function () {
	//Call a function when the state changes.
	if (http.readyState == 4 && http.status == 200) {
		if (typeof Storage !== "undefined") {
			console.log("Your Version: " + localStorage.getItem("version"));
			console.log("Server Version: " + http.responseText);
			if (http.responseText !== localStorage.getItem("version")) {
				localStorage.setItem("version", http.responseText);
				location.reload(true);
			} else {
				PG = new PuzzleGame();
			}
		} else {
			PG = new PuzzleGame();
		}
		PG.lastUpdateTime = http.responseText;
	}
};
http.send(params);