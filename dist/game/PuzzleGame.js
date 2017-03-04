'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FOCUS_MENU = 1000;
var FOCUS_TOWER = 1001;

var MODE_LOADING = 2000;
var MODE_NONE = 2001;
var MODE_CLOSED = 2002;
var MODE_ENDLESS = 2003;
var MODE_LINECLEAR = 2004;

var MAP_2D = 3000;
var MAP_3D = 3001;

var PI = Math.PI;
var TWO_PI = PI * 2;
var HALF_PI = PI / 2;

var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_SPACE = 32;
var KEY_ESCAPE = 27;

var PuzzleGame = function () {
	function PuzzleGame() {
		_classCallCheck(this, PuzzleGame);

		this.settings = {
			antiAlias: true,
			textureFiltering: true
		};

		this.tower = new PuzzleTower(this);
		this.menu = new PuzzleMenu(this);
		this.tower.initLoaders(function () {
			this.menu.showMenu();
			this.setFocus(FOCUS_MENU);
			document.addEventListener('keydown', this.keyPress.bind(this));
			document.addEventListener('keyup', this.keyUp.bind(this));
		}, this);
	}

	_createClass(PuzzleGame, [{
		key: 'startGame',
		value: function startGame(options) {

			console.log(this);
			this.menu.hideMenu();
			this.setFocus(FOCUS_TOWER);
			this.tower.setGameMode(MODE_ENDLESS);
		}
	}, {
		key: 'setFocus',
		value: function setFocus(newFocus) {
			this.currentFocus = newFocus;
		}
	}, {
		key: 'keyPress',
		value: function keyPress(event) {
			event.preventDefault();
			switch (this.currentFocus) {
				case FOCUS_MENU:
					this.menu.keyPress(event);
					break;
				case FOCUS_TOWER:
					this.tower.keyPress(event);
					break;
			}
		}
	}, {
		key: 'keyUp',
		value: function keyUp(event) {
			event.preventDefault();
			switch (this.currentFocus) {
				case FOCUS_MENU:
					this.menu.keyUp(event);
					break;
				case FOCUS_TOWER:
					this.tower.keyUp(event);
					break;
			}
		}
	}]);

	return PuzzleGame;
}();