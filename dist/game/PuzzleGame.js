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

var CAT_GAME = 'game';

var DIFFICULTIES = {
	1: 'Easy',
	2: 'Normal',
	3: 'Hard',
	4: 'Very Hard',
	5: 'Super Hard'
};

var PuzzleGame = function () {
	function PuzzleGame() {
		_classCallCheck(this, PuzzleGame);

		this.settings = {
			antiAlias: true,
			textureFiltering: true
		};

		this.renderer = new THREE.WebGLRenderer({ antialias: this.settings.antiAlias, alpha: true });
		this.renderer.setClearColor(0x000000, 0);
		this.windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		this.windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.windowWidth, this.windowHeight);
		document.body.appendChild(this.renderer.domElement);

		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 100, 850);
		this.camera.position.z = 500;

		this.tower = new PuzzleTower(this);
		this.menu = new PuzzleMenu(this);
		this.scoreBoard = new PuzzleScore(this);
		this.tower.initLoaders(function () {
			this.menu.showMenuWithTransition();
			this.setFocus(FOCUS_MENU);
			document.addEventListener('keydown', this.keyPress.bind(this));
			document.addEventListener('keyup', this.keyUp.bind(this));
		}, this);

		this.paused = false;

		this.piTimer = 0;
		this.animate();
		setInterval(function () {
			this.scoreBoard.animate();
		}.bind(this), 500);
		window.addEventListener('resize', this.onWindowResize.bind(this), false);
	}

	_createClass(PuzzleGame, [{
		key: 'animate',
		value: function animate() {
			this.stats.begin();

			TWEEN.update();
			this.tower.gameAnimations();

			this.renderer.render(this.scene, this.camera);

			this.piTimer += 0.05;

			if (this.piTimer > TWO_PI) {
				this.piTimer = 0;
			}

			this.stats.end();
			requestAnimationFrame(this.animate.bind(this));
		}
	}, {
		key: 'onWindowResize',
		value: function onWindowResize() {
			var width = window.innerWidth;
			var height = window.innerHeight;
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(width, height);
		}
	}, {
		key: 'startGame',
		value: function startGame(mapType) {
			this.tower.changeMapType(mapType);
			this.menu.hideMenuWithTransition();
			this.setFocus(FOCUS_TOWER);
			this.tower.setGameMode(MODE_ENDLESS);

			if (mapType === MAP_3D) {
				this.tower.towerGroup.position.x = -50;
				this.tower.towerGroup.rotation.y = Math.PI / 30;
				this.scoreBoard.scoreGroup.position.x = this.tower.boardPixelWidth / 2 + this.scoreBoard.canvas.width / 2 - 50;
				this.scoreBoard.scoreGroup.position.y = this.tower.boardPixelHeight / 2 - this.scoreBoard.canvas.height / 2;
			} else {
				this.tower.towerGroup.position.x = -50;
				this.scoreBoard.scoreGroup.position.x = this.tower.boardPixelWidth / 2 + this.scoreBoard.canvas.width / 2 - 50;
				this.scoreBoard.scoreGroup.position.y = this.tower.boardPixelHeight / 2 - this.scoreBoard.canvas.height / 2;
			}

			this.scoreBoard.showScoreBoard();
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