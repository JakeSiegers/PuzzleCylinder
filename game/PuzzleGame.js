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

const CAT_GAME = 'game';

class PuzzleGame{

	static get DIFFICULTIES(){
		return {
			1: 'Easy',
			2: 'Normal',
			3: 'Hard',
			4: 'Very Hard',
			5: 'Super Hard'
		}
	};

	static get KEY(){
		return {
			UP:38,
			DOWN:40,
			LEFT:37,
			RIGHT:39,
			SPACE:32,
			ESCAPE:27,
		}
	}

	constructor(){
		this.loaded = false;
		this.paused = false;
		this.piTimer = 0;

		//The last known position of the mouse.
		this.mouseX = null;
		this.mouseY = null;

		//Lock less important animations at 30
		this.ThirtyFPSInterval = 1000 / 30;
		this.ThirtyFPSThen = Date.now();

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

		window.addEventListener('resize', this.onWindowResize.bind(this), false);
		window.addEventListener( 'mousemove', this.mouseMove.bind(this), false );
		window.addEventListener( 'mouseup', this.mouseUp.bind(this), false );

		this.initLoaders(this.loadComplete,this);
	}

	loadComplete(){
		this.generateBackground();

		this.tower = new PuzzleTower(this);
		this.menu = new PuzzleMenu(this);
		this.scoreBoard = new PuzzleScore(this);



		this.menu.showMenu();


		this.setFocus(FOCUS_MENU);
		document.addEventListener('keydown', this.keyPress.bind(this));
		document.addEventListener('keyup', this.keyUp.bind(this));


		this.animate();
		setInterval(function(){
			this.scoreBoard.animate();
		}.bind(this),500);
	}

	generateBackground(){
		let bgTexture = this.blankTexture.clone();
		bgTexture.wrapS = THREE.RepeatWrapping;
		bgTexture.wrapT = THREE.RepeatWrapping;

		let size = 0;
		if(this.windowWidth>this.windowHeight){
			size = Math.ceil(this.windowWidth/128)*3;
		}else{
			size = Math.ceil(this.windowHeight/128)*3;
		}

		bgTexture.repeat.set(size,size);
		bgTexture.needsUpdate = true;

		let material = new THREE.MeshBasicMaterial({
			color: 0x9C27B0,
			//side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.5,
			map:bgTexture
		});

		let geometry = new THREE.PlaneGeometry(128*size,128*size);
		this.background = new THREE.Mesh(geometry, material);
		this.background.position.z = -300;
		this.scene.add(this.background);
	}

	initLoaders(completeFn,completeScope){
		PuzzleCSSLoader.showLoader();
		let manager = new THREE.LoadingManager();
		manager.onLoad = function () {
			PuzzleCSSLoader.hideLoader();
			//this.preloadComplete(completeFn,completeScope);
			completeFn.call(completeScope);
			this.loaded = true;
		}.bind(this);

		manager.onProgress = function (url, itemsLoaded, itemsTotal) {
			PuzzleCSSLoader.setLoadPercent(Math.floor((itemsLoaded / itemsTotal) * 100))
		};

		manager.onError = function (url) {
			console.error('There was an error loading ' + url);
		};

		this.fileLoader = new THREE.FileLoader(manager);
		let textureLoader = new THREE.TextureLoader(manager);
		let fontLoader = new THREE.FontLoader(manager);

		this.blankTexture = textureLoader.load('img/block.png');
		this.blockSideTexture = textureLoader.load('img/blockSide.png');
		this.blockTopTexture = textureLoader.load('img/blockTop.png');

		//this.explodeTexture = textureLoader.load('img/block_explode.png');
		//this.lockTexture = textureLoader.load('img/block_locked.png');
		this.tubeTexture = textureLoader.load('img/block.png');
		this.tubeTexture.wrapS = THREE.RepeatWrapping;
		this.tubeTexture.wrapT = THREE.RepeatWrapping;
		//this.tubeTexture.this.tubeTexture.repeat.set(this.boardWidth, this.boardHeight);.set(this.boardWidth, this.boardHeight);

		//Font loader is weird.... It doesn't return the loaded value.
		fontLoader.load('fonts/Righteous_Regular.json', function (response) {
			this.font = response;
		}.bind(this));

		this.cursorTexture = textureLoader.load('img/cursor.png');
		PuzzleUtils.sharpenTexture(this.renderer,this.cursorTexture);

		this.blockTextures = {
			circle: textureLoader.load('img/block_circle.png'),
			diamond: textureLoader.load('img/block_diamond.png'),
			heart: textureLoader.load('img/block_heart.png'),
			star: textureLoader.load('img/block_star.png'),
			triangle: textureLoader.load('img/block_triangle.png'),
			triangle2: textureLoader.load('img/block_triangle2.png'),
			penta: textureLoader.load('img/block_penta.png')
		};

		this.blockColors = {
			circle: 0x4CAF50,
			diamond: 0x9C27B0,
			heart: 0xF44336,
			star: 0xFFEB3B,
			triangle: 0x00BCD4,
			triangle2: 0x3F51B5,
			penta: 0x607D8B
		};

		this.blockMaterials = {};
		this.nextRowBlockMaterials = {};
		for (let i in this.blockTextures) {
			if(this.settings.textureFiltering) {
				PuzzleUtils.sharpenTexture(this.renderer,this.blockTextures[i], true);
			}

			let faceMaterial = new THREE.MeshBasicMaterial({color: this.blockColors[i], map: this.blockTextures[i]});
			let sideMaterial = new THREE.MeshBasicMaterial({color: this.blockColors[i], map: this.blockSideTexture});
			let topMaterial = new THREE.MeshBasicMaterial({color: this.blockColors[i], map: this.blockTopTexture});
			this.blockMaterials[i] = faceMaterial;
			/*new THREE.MultiMaterial([
			 sideMaterial,   //right
			 sideMaterial,   //left
			 topMaterial,   //top
			 topMaterial,   //bottom
			 faceMaterial,   //back
			 faceMaterial    //front
			 ]);*/

			let adjustedColor = new THREE.Color(this.blockColors[i]);
			adjustedColor.add(new THREE.Color(0x505050));
			this.nextRowBlockMaterials[i] = new THREE.MeshBasicMaterial({
				color: adjustedColor,
				map: this.blockTextures[i]
			});
		}

		if(this.settings.textureFiltering) {
			PuzzleUtils.sharpenTexture(this.renderer,this.blockSideTexture, true);
			PuzzleUtils.sharpenTexture(this.renderer,this.blockTopTexture, true);
			PuzzleUtils.sharpenTexture(this.renderer,this.blankTexture, true);
			PuzzleUtils.sharpenTexture(this.renderer,this.tubeTexture, true);
		}
	}

	animate(){
		this.stats.begin();
		let now = Date.now();

		//console.log(this.menu.menuShimmyTimer);

		TWEEN.update();
		this.renderer.render(this.scene, this.camera);

		let elapsed = now - this.ThirtyFPSThen;
		if(elapsed > this.ThirtyFPSInterval) {

			this.piTimer += 0.1;

			if (this.piTimer > TWO_PI) {
				this.piTimer = 0;
			}

			this.ThirtyFPSThen = now - (elapsed % this.ThirtyFPSInterval);


			this.background.material.map.offset.x += 0.01;
			if (this.background.material.map.offset.x > 1) {
				this.background.material.map.offset.x = 0;
			}
			this.background.rotation.z += 0.0001;
			if(this.background.rotation.z > TWO_PI){
				this.background.rotation.z = 0;
			}


			this.tower.gameAnimations();
		}
		requestAnimationFrame(this.animate.bind(this));
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
		this.menu.hideMenu();

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

	mouseMove(event){
		event.preventDefault();
		[this.mouseX,this.mouseY] = [event.clientX, event.clientY];
		switch(this.currentFocus){
			case FOCUS_MENU:
				this.menu.mouseMove(event);
				break;
		}
	};


	mouseUp(event){
		event.preventDefault();
		switch(this.currentFocus){
			case FOCUS_MENU:
				this.menu.mouseUp(event);
				break;
		}
	}

}