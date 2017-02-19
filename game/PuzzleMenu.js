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
	}

	static keypressed(){
		if(PG.gameState === STATE_MENU){
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
		self.MainMenuDom.style.display = "none";
	}
}

