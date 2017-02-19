class PuzzleCSSLoader{
	static init() {
		self.cssLoader = document.createElement( 'div' );
		self.cssLoader.className = 'cssLoader';

		self.cssLoaderWrap = document.createElement( 'div' );
		self.cssLoaderWrap.className = 'cssLoaderWrap';

		self.cssLoaderBox = document.createElement( 'div' );
		self.cssLoaderBox.className = 'cssLoaderBox';

		self.cssLoaderText = document.createElement( 'div' );
		self.cssLoaderText.className = 'cssLoaderText';
		self.cssLoaderText.innerHTML = "";

		self.cssLoader.appendChild(self.cssLoaderWrap);
		self.cssLoaderWrap.appendChild(self.cssLoaderBox);
		self.cssLoaderWrap.appendChild(self.cssLoaderText);
		document.body.appendChild(self.cssLoader);
	}

	static setLoadPercent(newPercent){
		self.cssLoaderText.innerHTML = newPercent;
	}

	static showLoader(){
		self.cssLoader.className = "cssLoader";
	}

	static hideLoader(){
		self.cssLoader.className += " hideLoader";
		setTimeout(function(){
			self.cssLoader.className += " hideLoaderDisplayNone";
		},1000);
	}
}

//this needs to be here so the spinner shows up first
PuzzleCSSLoader.init();

// Check if a new cache is available on page load.
window.addEventListener('load', function(e) {
	console.log('loaded');
	window.applicationCache.addEventListener('updateready', function(e) {
		if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
			// Browser downloaded a new app cache.
			// Swap it in and reload the page to get the new hotness.
			window.applicationCache.swapCache();

			console.log('UPDATE READY');

			if (confirm('A new version of this site is available. Load it?')) {
				window.location.reload();
			}
		} else {
			// Manifest didn't changed. Nothing new to server.
		}
	}, false);

}, false);