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