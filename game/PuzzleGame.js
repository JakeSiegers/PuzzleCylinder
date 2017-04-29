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

const DIFFICULTIES = {
	1:'Easy',
	2:'Normal',
	3:'Hard',
	4:'Very Hard',
	5:'Super Hard'
};

class PuzzleGame{

	constructor(){
		this.settings = {
			antiAlias:true,
			textureFiltering:true
		};

		this.renderer = new THREE.WebGLRenderer({antialias: this.settings.antiAlias, alpha: true});
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
		this.tower.initLoaders(function(){
			this.menu.showMenuWithTransition();
			this.setFocus(FOCUS_MENU);
			document.addEventListener('keydown', this.keyPress.bind(this));
			document.addEventListener('keyup', this.keyUp.bind(this));
		},this);

		this.piTimer = 0;
		this.animate();
		window.addEventListener('resize', this.onWindowResize.bind(this), false);
	}

	animate(){
		requestAnimationFrame(this.animate.bind(this));
		this.stats.begin();

		TWEEN.update();
		this.tower.gameAnimations();
		this.scoreBoard.animate();
		
		this.renderer.render(this.scene, this.camera);

		this.piTimer += 0.05;

		if (this.piTimer > TWO_PI) {
			this.piTimer = 0;
		}

		this.stats.end();
	}

	onWindowResize() {
		let width = window.innerWidth;
		let height = window.innerHeight;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}

	startGame(mapType){
		this.tower.changeMapType(mapType);
		this.menu.hideMenuWithTransition();
		this.setFocus(FOCUS_TOWER);
		this.tower.setGameMode(MODE_ENDLESS);

		if(mapType === MAP_3D) {
			this.tower.towerGroup.position.x = -50;
			this.tower.towerGroup.rotation.y = Math.PI/30;
			this.scoreBoard.scoreGroup.position.x = (this.tower.boardPixelWidth/2) + (this.scoreBoard.canvas.width/2) -50;
			this.scoreBoard.scoreGroup.position.y = (this.tower.boardPixelHeight/2) - (this.scoreBoard.canvas.height/2);
		}else{
			this.tower.towerGroup.position.x = -50;
			this.scoreBoard.scoreGroup.position.x = (this.tower.boardPixelWidth/2) + (this.scoreBoard.canvas.width/2) -50;
			this.scoreBoard.scoreGroup.position.y = (this.tower.boardPixelHeight/2) - (this.scoreBoard.canvas.height/2);
		}

		this.scoreBoard.showScoreBoard();

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