'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var STATE_MENU = 0;
var STATE_ENDLESS = 1;
var STATE_SCORECARD = 2;

var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_LEFT = 37;
var KEY_RIGHT = 38;
var KEY_SPACE = 32;

var PuzzleGame = function () {
	function PuzzleGame() {
		_classCallCheck(this, PuzzleGame);

		PuzzleCSSLoader.hideLoader();

		document.addEventListener('keydown', this.keyPress.bind(this));
		document.addEventListener('keyup', this.keyUp.bind(this));

		this.settings = {
			antiAlias: true,
			textureFiltering: true
		};

		this.menu = new PuzzleMenu(this);
		this.tower = new PuzzleTower(this);
		this.menu.showMenu();
		this.currentState = STATE_MENU;
	}

	_createClass(PuzzleGame, [{
		key: 'startGame',
		value: function startGame(options) {

			console.log(this);

			this.tower.initLoaders();
			this.menu.hideMenu();
			this.setState(STATE_ENDLESS);
			//PuzzleCSSLoader.showLoader();
		}
	}, {
		key: 'updateScore',
		value: function updateScore(newScore) {
			this.menu;
		}
	}, {
		key: 'setState',
		value: function setState(newState) {
			this.currentState = newState;
		}
	}, {
		key: 'keyPress',
		value: function keyPress(event) {
			event.preventDefault();
			switch (this.currentState) {
				case STATE_MENU:
					this.menu.keyPress(event);
					break;
				case STATE_ENDLESS:
					this.tower.keyPress(event);
					break;
			}
		}
	}, {
		key: 'keyUp',
		value: function keyUp(event) {
			event.preventDefault();
			switch (this.currentState) {
				case STATE_MENU:
					this.menu.keyUp(event);
					break;
				case STATE_ENDLESS:
					this.tower.keyUp(event);
					break;
			}
		}
	}]);

	return PuzzleGame;
}();