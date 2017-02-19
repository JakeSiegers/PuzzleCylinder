class PuzzleMenu{
	static init(){
		self.MainMenuDom = document.createElement( 'div' );
		self.MainMenuDom.className = 'menu';

		self.MainMenuTitleDom = document.createElement( 'div' );
		self.MainMenuTitleDom.className = 'menuTitle';
		self.MainMenuTitleDom.innerHTML = '[PLACEHOLDER MENU]<br />(Tap / Press Any Key To Begin)';

		self.MainMenuDom.appendChild(self.MainMenuTitleDom);

		document.onkeyup = PuzzleMenu.keypressed;
		self.MainMenuDom.addEventListener( 'touchstart', PuzzleMenu.keypressed, false );

		document.body.appendChild(self.MainMenuDom)


		self.ScoreDom = document.createElement( 'div' );
		self.ScoreDom.className = 'score';

		document.body.appendChild(self.ScoreDom);

		self.firstTap = false;
	}

	static get ScoreDom(){
		return self.ScoreDom;
	}

	static keypressed(){
		if(!self.firstTap && PG.gameState == STATE_MENU){
			self.firstTap = true;
			console.log(arguments);
			PG.closeAndSetGameState(STATE_ENDLESS);
		}
	}

	static showMenu(){
		self.MainMenuDom.style.display = "inherit";
		setTimeout(function(){
			self.MainMenuDom.style.opacity = "1";
		},10);
	}

	static hideMenu(){
		self.MainMenuDom.style.opacity = "0";
		setTimeout(function(){
			self.MainMenuDom.style.display = "none";
		},1000);
	}

	static showScore(){
		self.ScoreDom.style.display = "inherit";
		setTimeout(function(){
			self.ScoreDom.style.opacity = "1";
		},10);
	}

	static hideScore(){
		self.ScoreDom.style.opacity = "0";
		setTimeout(function(){
			self.ScoreDom.style.display = "none";
		},1000);
	}
}

