const STATE_MENU = 0;
const STATE_ENDLESS = 1;
const STATE_SCORECARD = 2;

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 38;
const KEY_SPACE = 32;

class PuzzleGame{

	constructor(){
		PuzzleCSSLoader.hideLoader();

		document.addEventListener('keydown', this.keyPress.bind(this));
		document.addEventListener('keyup', this.keyUp.bind(this));

		this.settings = {
			antiAlias:true,
			textureFiltering:true
		};

		this.menu = new PuzzleMenu(this);
		this.tower = new PuzzleTower(this);
		this.menu.showMenu();
		this.currentState = STATE_MENU;
	}

	startGame(options){

		console.log(this);

		this.tower.initLoaders();
		this.menu.hideMenu();
		this.setState(STATE_ENDLESS);
		//PuzzleCSSLoader.showLoader();
	}

	updateScore(newScore){
		this.menu
	}

	setState(newState){
		this.currentState = newState;
	}

	keyPress(event) {
		event.preventDefault();
		switch(this.currentState){
			case STATE_MENU:
				this.menu.keyPress(event);
				break;
			case STATE_ENDLESS:
				this.tower.keyPress(event);
				break;
		}
	}

	keyUp(event) {
		event.preventDefault();
		switch(this.currentState){
			case STATE_MENU:
				this.menu.keyUp(event);
				break;
			case STATE_ENDLESS:
				this.tower.keyUp(event);
				break;
		}
	}

}