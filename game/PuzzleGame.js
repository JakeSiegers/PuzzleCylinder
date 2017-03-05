const FOCUS_MENU = 1000;
const FOCUS_TOWER = 1001;

const MODE_LOADING = 2000;
const MODE_NONE = 2001;
const MODE_CLOSED = 2002;
const MODE_ENDLESS = 2003;
const MODE_LINECLEAR = 2004;

const MAP_2D = 3000;
const MAP_3D = 3001;

const PI = Math.PI;
const TWO_PI = PI*2;
const HALF_PI = PI/2;

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_SPACE = 32;
const KEY_ESCAPE = 27;

class PuzzleGame{

	constructor(){
		this.settings = {
			antiAlias:true,
			textureFiltering:true
		};
		
		this.tower = new PuzzleTower(this);
		this.menu = new PuzzleMenu(this);
		this.tower.initLoaders(function(){
			this.menu.showMenuWithTransition();
			this.setFocus(FOCUS_MENU);
			document.addEventListener('keydown', this.keyPress.bind(this));
			document.addEventListener('keyup', this.keyUp.bind(this));
		},this);
	}

	startGame(options){
		this.menu.hideMenuWithTransition();
		this.setFocus(FOCUS_TOWER);
		this.tower.setGameMode(MODE_ENDLESS);
	}

	setFocus(newFocus){
		this.currentFocus = newFocus;
	}

	keyPress(event) {
		event.preventDefault();
		switch(this.currentFocus){
			case FOCUS_MENU:
				this.menu.keyPress(event);
				break;
			case FOCUS_TOWER:
				this.tower.keyPress(event);
				break;
		}
	}

	keyUp(event) {
		event.preventDefault();
		switch(this.currentFocus){
			case FOCUS_MENU:
				this.menu.keyUp(event);
				break;
			case FOCUS_TOWER:
				this.tower.keyUp(event);
				break;
		}
	}

}