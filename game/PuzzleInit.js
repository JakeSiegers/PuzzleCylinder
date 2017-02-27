//This code checks for a date file in your browsers local storage.
//That file is always cache-bursted, so it's always up to date.
//If the date in the file is newer than in your browsers local storage, I know to cache-burst the entire page
//This makes sure you're running the latest version of the game.

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
		if (typeof(Storage) !== "undefined") {
			console.log("Your Version: "+localStorage.getItem("version"));
			console.log("Server Version: "+http.responseText);
			if(http.responseText !== localStorage.getItem("version")){
				localStorage.setItem("version", http.responseText);
				location.reload(true);
			}else{
				PG = new PuzzleGame();
			}
		}else{
			PG = new PuzzleGame();
		}
	}
};

http.send(null);