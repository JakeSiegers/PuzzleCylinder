//Get the build date!
let PG = null;
let lastUpdateTime = 0;

// Auto refresh on new version
let http = new XMLHttpRequest();
let url = "/PuzzleCylinder/version.html?date="+Math.floor(Date.now()/1000);
http.open("GET", url, true);

//Send the proper header information along with the request
http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

http.onreadystatechange = function() {//Call a function when the state changes.
	if(http.readyState == 4 && http.status == 200) {
		lastUpdateTime = http.responseText;
		PG = new PuzzleGame();
	}
};
http.send(null);