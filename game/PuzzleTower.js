const PI = Math.PI;
const TWO_PI = PI*2;
const HALF_PI = PI/2;

const STATE_MENU = 0;
const STATE_ENDLESS = 1;
const STATE_SCORECARD = 2;

class PuzzleTower {

	constructor() {
		this.debug = new PuzzleDebug(this);

		this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		this.renderer.setClearColor(0x000000, 0);
		this.windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		this.windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.windowWidth, this.windowHeight);
		document.body.appendChild(this.renderer.domElement);

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 100, 850);
		this.camera.position.z = 500;

		this.resetGameVariables();

		//Timer Objects
		this.pushTimeoutObj = null;

		this.initLoaders();
	}


	preloadComplete(){

		this.tube = this.generateTube();
		this.scene.add(this.tube);
		this.scene.add(this.generateCylinderDepthFilter());

		this.gameBoard = new THREE.Object3D();
		this.nextRow = new THREE.Object3D();
		this.cursorObj = new THREE.Object3D();
		this.makeMenuText();

		this.closeAndSetGameState(STATE_MENU);

		//setTimeout(this.resetGame.bind(this),2000);

		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);

		this.debugMapNumber = 1;

		window.addEventListener('resize', this.onWindowResize.bind(this), false);
		document.addEventListener('keydown', this.keyPress.bind(this));
		document.addEventListener('keyup', this.keyUp.bind(this));

		this.initTouch();
		this.debug.initDatGui();

		this.animate();
	}

	initTouch(){
		this.touchTimer = null;
		this.xTouchChain = 0;
		this.yTouchChain = 0;
		this.renderer.domElement.addEventListener( 'touchstart', this.onDocumentTouchStart.bind(this), false );
		this.renderer.domElement.addEventListener( 'touchmove', this.onDocumentTouchMove.bind(this), false );
	}

	onDocumentTouchStart( event ){
		let sThis = this;
		if ( event.touches.length === 1 ) {
			if (this.touchTimer == null) {
				this.touchTimer = setTimeout(function () {
					sThis.touchTimer = null;
				}, 200)
			} else {
				clearTimeout(this.touchTimer);
				this.touchTimer = null;
				if(Math.abs(this.xTouchChain) < 10 &&  Math.abs(this.yTouchChain) < 10) {
					this.swapSelectedBlocks();
				}
			}
			event.preventDefault();
			this.lastXTouch = event.touches[ 0 ].pageX;
			this.lastYTouch = event.touches[ 0 ].pageY;
			this.xTouchChain = 0;
			this.yTouchChain = 0;
		}
	}

	onDocumentTouchMove(event){
		if ( event.touches.length === 1 ) {
			event.preventDefault();
			let mouseX = event.touches[ 0 ].pageX;
			let mouseY = event.touches[ 0 ].pageY;
			let xDelta = ( mouseX - this.lastXTouch );
			let yDelta = ( mouseY - this.lastYTouch );
			this.lastXTouch = mouseX;
			this.lastYTouch = mouseY;
			this.xTouchChain += xDelta;
			this.yTouchChain += yDelta;
			if(this.xTouchChain < -30){
				this.adjustSelector('left');
				this.xTouchChain = 0;
			}else if(this.xTouchChain > 30){
				this.adjustSelector('right');
				this.xTouchChain = 0;
			}
			if(this.yTouchChain < -30){
				this.adjustSelector('up');
				this.yTouchChain = 0;
			}else if(this.yTouchChain > 30){
				this.adjustSelector('down');
				this.yTouchChain = 0;
			}
		}
	}

	closeAndSetGameState(newMode) {
		this.closeTube(this.setGameState.bind(this, newMode));
	}

	setGameState(newMode) {
		this.menuObj.visible = false;
		this.menuLogo.visible = false;
		this.menuScore.visible = false;
		this.gameBoard.visible = false;
		this.cursorObj.visible = false;
		this.nextRow.visible = false;

		if (newMode === STATE_MENU) {
			PuzzleMenu.showMenu();
		} else {
			PuzzleMenu.hideMenu();
		}

		this.gameState = newMode;
		switch (newMode) {
			case STATE_MENU:
				this.menuObj.visible = true;
				this.menuLogo.visible = true;
				this.openTube();

				PuzzleMenu.hideScore();

				//TEMP BEFORE MENU IS FINISHED
				//setTimeout(this.closeAndSetGameState.bind(this,STATE_ENDLESS),2000);

				break;
			case STATE_ENDLESS:
				this.gameBoard.visible = true;
				this.cursorObj.visible = true;
				this.nextRow.visible = true;
				this.resetGame();
				this.openTube();

				PuzzleMenu.showScore();
				break;
			case STATE_SCORECARD:
				this.menuObj.visible = true;
				this.menuLogo.visible = true;
				this.menuScore.visible = true;
				this.setScoreCardText();
				this.openTube();
				PuzzleMenu.hideScore();
				break;
		}
	}

	setScoreCardText() {
		let textGeometry1 = new THREE.TextGeometry("Score: " + this.score, {
			font: this.font,
			size: 20,
			height: 2
		});

		let material = new THREE.MeshBasicMaterial({color: this.blockColors.heart});
		let score = new THREE.Mesh(textGeometry1, material);
		textGeometry1.computeBoundingBox();
		score.position.x = -(textGeometry1.boundingBox.max.x - textGeometry1.boundingBox.min.x) / 2;

		let sThis = this;
		this.menuScore.traverseVisible(function (obj) {
			sThis.menuScore.remove(obj);
		});

		this.menuScore.add(score);
	}

	makeMenuText(){
		this.menuObj = new THREE.Group();
		this.menuOptionsObj = new THREE.Group();
		this.menuLogo = new THREE.Group();
		this.menuScore = new THREE.Group();

		let textGeometry1 = new THREE.TextGeometry("Puzzle", {
			font: this.font,
			size: 40,
			height: 2
		});

		let textGeometry2 = new THREE.TextGeometry("Cylinder", {
			font: this.font,
			size: 40,
			height: 2
		});

		let material = new THREE.MeshBasicMaterial({color: this.blockColors.diamond});

		this.title1 = new THREE.Mesh(textGeometry1, material);
		this.title2 = new THREE.Mesh(textGeometry2, material);

		textGeometry1.computeBoundingBox();
		let textWidth1 = textGeometry1.boundingBox.max.x - textGeometry1.boundingBox.min.x;
		this.title1.position.x = -textWidth1 / 2;

		textGeometry2.computeBoundingBox();
		let textWidth2 = textGeometry2.boundingBox.max.x - textGeometry2.boundingBox.min.x;
		this.title2.position.x = -textWidth2 / 2;

		this.title1.position.y = 30;
		this.title2.position.y = -30;

		this.menuLogo.add(this.title1);
		this.menuLogo.add(this.title2);

		this.menuLogo.position.y = 100;

		this.menuObj.add(this.menuLogo);
		this.menuObj.add(this.menuScore);

		//Playing around with floating canvas... Making a menu won't be easy, sadly....
		//It will probably have to be just regular dom elements.... which kinda blows.
		//let number = document.createElement( 'div' );
		//number.className = 'menuText';
		//number.textContent = "THREE.JS";
		//this.menuTexture = new CanvasTexture(number);
		//let plane = new THREE.PlaneGeometry(100,100);
		//let numberObj = new THREE.Mesh(plane,material);
		//this.menuObj.add(numberObj);

		this.menuObj.position.z = 15;
		this.scene.add(this.menuObj);
	}

	makeHarder(){
		if (this.pushDelay > 0) {
			this.pushDelay = 100 - this.matches / 5;

			if (this.pushDelay < 0) {
				this.pushDelay = 0;
			}
			if (this.pushDelay <= 80) {
				this.handicap = 3;
			}
			if (this.pushDelay <= 70) {
				this.handicap = 2;
			}
			if (this.pushDelay <= 60) {
				this.handicap = 1;
			}
			if (this.pushDelay <= 50) {
				this.handicap = 0;
			}
		}
	}

	initLoaders(){

		let manager = new THREE.LoadingManager();
		console.log('New LoadingManager');
		let sThis = this;
		manager.onLoad = function () {
			console.log('Loading complete!');
			sThis.preloadComplete();
			PuzzleCSSLoader.hideLoader();
		};
		manager.onProgress = function (url, itemsLoaded, itemsTotal) {
			console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
			PuzzleCSSLoader.setLoadPercent(Math.floor((itemsLoaded / itemsTotal) * 100))
		};
		manager.onError = function (url) {
			console.log('There was an error loading ' + url);
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
		this.tubeTexture.repeat.set(this.boardWidth, this.boardHeight);

		//Font loader is weird.... It doesn't return the loaded value.
		fontLoader.load('fonts/Righteous_Regular.json', function (response) {
			sThis.font = response;
		});

		this.cursorTexture = textureLoader.load('img/cursor.png');
		this.sharpenTexture(this.cursorTexture);

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
			this.sharpenTexture(this.blockTextures[i], true);

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

		this.sharpenTexture(this.blockSideTexture, true);
		this.sharpenTexture(this.blockTopTexture, true);
		this.sharpenTexture(this.blankTexture, true);
		this.sharpenTexture(this.tubeTexture, true);

	}

	//Sharpen out textures - prevent scale blurring
	sharpenTexture(texture, maxAnisotropy){
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		if (maxAnisotropy) {
			texture.anisotropy = this.renderer.getMaxAnisotropy();
		}
	}

	resetGameVariables(){
		//TODO:Sort these!
		this.animationQueue = 0;
		this.score = 0;
		this.gameGrid = [];
		this.boardHeight = 13;
		this.boardWidth = 30;
		this.circlePieceSize = (TWO_PI / this.boardWidth);
		this.stackHeights = [];
		this.blockWidth = 35;
		this.blockHeight = 35;
		this.blockDepth = 10;
		this.boardPixelHeight = (this.boardHeight) * this.blockHeight;
		this.halfBoardPixelHeight = this.boardPixelHeight / 2;
		this.boardRadius = ((this.blockWidth - 1) * this.boardWidth) / (2 * PI);
		this.hasControl = false;
		this.gameActive = false;
		this.upOffset = 0;
		this.pushDelay = 100;
		this.dropDelay = 150;
		this.handicap = 4;
		this.matches = 0;
		this.rowsCreated = 0;
		this.piTimer = 0;
		this.debugSelection = false;
		this.chainCount = 0;
		this.chainTimer = null;
		this.quickPush = false;

		PuzzleMenu.ScoreDom.innerHTML = "0";
	}

	startGame(){
		this.closeAndSetGameState(STATE_ENDLESS);
	}

	resetGame(){

		TWEEN.removeAll();

		this.resetGameVariables();

		if (this.hasOwnProperty('gameBoard')) {
			this.scene.remove(this.gameBoard);
		}
		this.gameBoard = this.cylinder();
		this.scene.add(this.gameBoard);

		this.generateNextRow();

		if (this.pushTimeoutObj !== null) {
			clearTimeout(this.pushTimeoutObj);
		}
		this.pushTimeoutObj = setTimeout(this.checkToPushBlocks.bind(this), 2000);

		if (this.hasOwnProperty('cursorObj')) {
			this.scene.remove(this.cursorObj);
		}
		this.cursorObj = this.generateCursor();
		this.scene.add(this.cursorObj);

		this.selectorY = Math.floor(this.boardHeight / 2);
		this.selectorX = 0;//Math.floor(this.boardWidth/2);

		let startingTowerAngle = this.circlePieceSize * this.selectorX - HALF_PI - (this.circlePieceSize / 2);
		this.gameBoard.rotation.y = startingTowerAngle - PI;
		this.nextRow.rotation.y = startingTowerAngle;

		let startingTowerPosition = this.updateTowerPos();
		this.gameBoard.position.y = startingTowerPosition - this.boardPixelHeight;

		this.openTube();

		new TWEEN.Tween(this.gameBoard.position).to({
			y: startingTowerPosition
		}, 1200).easing(TWEEN.Easing.Quintic.Out).delay(400).start();

		let sThis = this;
		new TWEEN.Tween(this.gameBoard.rotation).to({
			y: startingTowerAngle
		}, 1200).easing(TWEEN.Easing.Quintic.Out).delay(400).start().onComplete(function () {
			sThis.hasControl = true;
			sThis.gameActive = true;
			sThis.checkForMatches();
			//sThis.animationQueue = 1;
		});
	}

	loseAnimation(){
		for (let x = 0; x < this.boardWidth; x++) {
			for (let y = 0; y < this.boardHeight; y++) {
				if (this.gameGrid[x][y] != null) {
					this.gameGrid[x][y].material.map = this.blankTexture;
					let delay = 500;
					if (this.gameGrid[x][this.boardHeight - 1] != null) {
						//delay = 2000;
						continue;
					}
					new TWEEN.Tween(this.gameGrid[x][y].position).to({
						y: -this.boardPixelHeight * 2.1
					}, 4000).easing(TWEEN.Easing.Exponential.Out).delay(delay).start();
				}
			}
		}
		setTimeout(this.closeAndSetGameState.bind(this, STATE_SCORECARD), 2500);
	}

	checkToPushBlocks(){
		if (!this.gameActive) {
			return;
		}

		let pushDelay = this.pushDelay;
		if (this.quickPush === true) {
			pushDelay = 0;
		}

		if (this.animationQueue !== 0) {
			this.pushTimeoutObj = setTimeout(this.checkToPushBlocks.bind(this), pushDelay);
			return;
		}

		if (this.pushTowerUp()) {
			this.pushTimeoutObj = setTimeout(this.checkToPushBlocks.bind(this), pushDelay);
		}
	}

	pushTowerUp(){

		for (let tx = 0; tx < this.boardWidth; tx++) {
			if (this.gameGrid[tx][this.boardHeight - 1] !== null) {
				//YOU LOSE
				this.hasControl = false;
				this.gameActive = false;
				this.loseAnimation();
				return false;
			}
		}

		this.upOffset += (this.blockHeight / 100);
		if (this.upOffset > this.blockHeight) {

			for (let x = 0; x < this.boardWidth; x++) {
				for (let y = this.boardHeight - 1; y >= 0; y--) {
					if (this.gameGrid[x][y] != null) {
						this.gameGrid[x][y].position.y = this.calcYBlockPos(y + 1);
						this.gameGrid[x][y + 1] = this.gameGrid[x][y];
						//this.gameGrid[x][y] = null;
					}
				}
			}
			for (let nx = 0; nx < this.boardWidth; nx++) {
				let block = this.generateBlockMesh(this.nextRow.children[nx].userData.blockType, nx, 0);
				this.gameBoard.add(block);
				this.gameGrid[nx][0] = block;
			}
			this.checkForMatches();
			this.generateNextRow();
			this.upOffset = 0;
			this.selectorY++;


			//this.upOffset = 0;
		}
		this.updateTowerPos();
		this.updateCursorPos();
		this.updateNextRowPos();

		return true;
	}

	generateCursor(){
		let obj = new THREE.Object3D();
		let geometry = new THREE.PlaneGeometry(this.blockWidth, this.blockHeight);

		let material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			side: THREE.DoubleSide,
			map: this.cursorTexture,
			transparent: true
		});
		let mesh = new THREE.Mesh(geometry, material);
		mesh.position.x = -this.blockWidth / 2;
		obj.add(mesh);
		let mesh2 = new THREE.Mesh(geometry, material);
		mesh2.position.x = this.blockWidth / 2;
		obj.add(mesh2);

		obj.position.z = this.boardRadius + this.blockDepth;
		return obj;
	}

	closeTube(completeFn){
		let closeDelay = 1000;
		let closeEase = TWEEN.Easing.Cubic.Out;

		//new TWEEN.Tween(this.title1.position).to({y:30},closeDelay).easing(closeEase).start();
		//new TWEEN.Tween(this.title2.position).to({y:-30},closeDelay).easing(closeEase).start();

		new TWEEN.Tween(this.tube.children[0].position).to({y: -this.boardPixelHeight / 2}, closeDelay).easing(closeEase).start();
		new TWEEN.Tween(this.tube.children[0].rotation).to({y: -HALF_PI}, closeDelay).easing(closeEase).start();

		new TWEEN.Tween(this.tube.children[1].position).to({y: this.boardPixelHeight / 2}, closeDelay).easing(closeEase).start();
		new TWEEN.Tween(this.tube.children[1].rotation).to({y: HALF_PI}, closeDelay).easing(closeEase).start();

		setTimeout(completeFn, closeDelay);
	}

	openTube(completeFn){
		let openDelay = 1000;
		let openEase = TWEEN.Easing.Cubic.Out;

		//new TWEEN.Tween(this.title1.position).to({y:this.boardPixelHeight},openDelay).easing(openEase).start();
		//new TWEEN.Tween(this.title2.position).to({y:-this.boardPixelHeight},openDelay).easing(openEase).start();

		new TWEEN.Tween(this.tube.children[0].position).to({y: -this.boardPixelHeight + 1}, openDelay).easing(openEase).start();
		new TWEEN.Tween(this.tube.children[0].rotation).to({y: 0}, openDelay).easing(openEase).start();

		new TWEEN.Tween(this.tube.children[1].position).to({y: this.boardPixelHeight - 1}, openDelay).easing(openEase).start();
		new TWEEN.Tween(this.tube.children[1].rotation).to({y: 0}, openDelay).easing(openEase).start();

		setTimeout(completeFn, openDelay);
	}

	generateTube(){
		let obj = new THREE.Object3D();
		let r = this.boardRadius + this.blockDepth / 2 + 5;
		let material = new THREE.MeshBasicMaterial({color: 0x222222, side: THREE.DoubleSide, map: this.tubeTexture});
		let geometry = new THREE.CylinderGeometry(r, r, this.boardPixelHeight, this.boardWidth, 1, false);
		let tube = new THREE.Mesh(geometry, material);
		tube.position.y = -(this.boardPixelHeight / 2);
		tube.rotation.y = -HALF_PI;

		let tube2 = new THREE.Mesh(geometry, material);
		tube2.position.y = (this.boardPixelHeight / 2);
		tube2.rotation.y = HALF_PI;

		obj.add(tube);
		obj.add(tube2);
		return obj;
	}

	generateCylinderDepthFilter(){
		let obj = new THREE.Object3D();
		let material = new THREE.MeshBasicMaterial({
			color: 0x000000,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.6
		});
		let geometry = new THREE.PlaneGeometry((this.boardRadius + this.blockDepth) * 2, this.boardPixelHeight);
		let plane = new THREE.Mesh(geometry, material);

		/*
		//Not Using the glass anymore

		let r = this.boardRadius + this.blockDepth;
		material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.1,
			depthWrite: false,
			depthTest: false
		});
		geometry = new THREE.CylinderGeometry(r, r, this.boardPixelHeight, this.boardWidth, 1, true, -HALF_PI, PI);
		let tube = new THREE.Mesh(geometry, material);
		 */

		obj.add(plane);
		//obj.add(tube);

		return obj;
	}

	keyPress(event){
		event.preventDefault();

		if (!this.hasControl) {
			return;
		}

		//console.log(event.keyCode);
		switch (event.keyCode) {
			case 88: //X
				//this.destroyBlock(this.selectorX,this.selectorY);
				this.quickPush = true;
				break;
			case 90: //Z

				break;
			case 32: //Space
				this.swapSelectedBlocks();
				break;
			case 38: //up
				this.adjustSelector('up');
				break;
			case 40: //down
				this.adjustSelector('down');
				break;
			case 37: //left
				this.adjustSelector('left');
				break;
			case 39: //right
				this.adjustSelector('right');
				break;
		}
	}

	keyUp(){
		this.quickPush = false;
	}

	swapSelectedBlocks(){
		this.swapBlocks(this.selectorX, this.selectorY, this.selectorX - 1);
	}

	checkForMatches(){

		if (!this.hasControl) {
			return;
		}

		//combo being number of matches that happened in the same check
		let comboCount = 0;

		let blocksToBeDestroyed = [];
		for (let y = 0; y < this.boardHeight; y++) {
			for (let x = 0; x < this.boardWidth; x++) {
				if (this.gameGrid[x][y] == null || this.gameGrid[x][y].userData.locked) {
					continue;
				}

				let typeToMatch = this.gameGrid[x][y].userData.blockType;
				let matchChainX = [x];
				let xToTest = x + 1;
				if (xToTest == this.boardWidth) {
					xToTest = 0;
				}

				while (xToTest != x && this.gameGrid[xToTest][y] != null && !this.gameGrid[xToTest][y].userData.locked && !this.gameGrid[xToTest][y].userData.alreadyMatchedX) {
					let nextType = this.gameGrid[xToTest][y].userData.blockType;
					if (nextType != typeToMatch) {
						//no more matches!
						break;
					}
					matchChainX.push(xToTest);
					xToTest++;
					if (xToTest == this.boardWidth) {
						xToTest = 0;
					}
				}

				if (matchChainX.length >= 3) {
					this.matches++;
					comboCount++;
					for (let i = 0; i < matchChainX.length; i++) {
						this.gameGrid[matchChainX[i]][y].userData.alreadyMatchedX = true;
						blocksToBeDestroyed.push({x: matchChainX[i], y: y});
					}
				}
				matchChainX = [];

				let matchChainY = [y];
				let yToTest = y + 1;
				if (yToTest == this.boardHeight) {
					continue; // No Y rollover!
				}

				while (yToTest != y && this.gameGrid[x][yToTest] != null && !this.gameGrid[x][yToTest].userData.locked && !this.gameGrid[x][yToTest].userData.alreadyMatchedY) {
					let nextType = this.gameGrid[x][yToTest].userData.blockType;
					if (nextType != typeToMatch) {
						//no more matches!
						break;
					}
					matchChainY.push(yToTest);
					yToTest++;
					if (yToTest == this.boardHeight) {
						break; // No Y rollover!
					}
				}

				if (matchChainY.length >= 3) {
					this.matches++;
					comboCount++;
					for (let i = 0; i < matchChainY.length; i++) {
						this.gameGrid[x][matchChainY[i]].userData.alreadyMatchedY = true;
						blocksToBeDestroyed.push({x: x, y: matchChainY[i]});
					}
				}
				matchChainY = [];
			}
		}

		if (comboCount > 1) {
			//console.log("x"+comboCount+"!");
		}


		if (blocksToBeDestroyed.length > 0) {
			this.chainCount++;

			if (this.chainTimer !== null) {
				clearTimeout(this.chainTimer);
			}
			this.chainTimer = setTimeout(this.resetChain.bind(this), this.dropDelay + 600);

			if (this.chainCount > 1) {
				console.log('CHAIN ' + this.chainCount);
			}
		}

		for (let d = 0; d < blocksToBeDestroyed.length; d++) {
			this.score += comboCount * this.chainCount;
			PuzzleMenu.ScoreDom.innerHTML = "" + this.score;
			this.makeHarder();
			this.destroyBlock(blocksToBeDestroyed[d].x, blocksToBeDestroyed[d].y);
		}
	}

	resetChain(){
		this.chainCount = 0;
		this.chainTimer = null;
	}

	swapBlocks(x, y, x2){

		if (x2 == -1) {
			x2 = this.boardWidth - 1;
		}

		let block1 = this.gameGrid[x][y];
		let block2 = this.gameGrid[x2][y];

		if ((block1 != null && block1.userData.locked ) || (block2 != null && block2.userData.locked)) {
			return;
		}

		let sThis = this;
		if (block1 !== null) {
			this.animationQueue++;
			new TWEEN.Tween(block1.position).to({
				x: this.calcXBlockPos(x2),
				z: this.calcZBlockPos(x2)
			}, 50).easing(TWEEN.Easing.Bounce.Out).start().onComplete(function () {
				sThis.animationQueue--;
			});
			block1.rotation.y = this.calcRBlockPos(x2);
		}

		if (block2 !== null) {
			this.animationQueue++;
			new TWEEN.Tween(block2.position).to({
				x: this.calcXBlockPos(x),
				z: this.calcZBlockPos(x)
			}, 50).easing(TWEEN.Easing.Bounce.Out).start().onComplete(function () {
				sThis.animationQueue--;
			});
			block2.rotation.y = this.calcRBlockPos(x);
		}

		this.gameGrid[x][y] = block2;
		this.gameGrid[x2][y] = block1;

		if (block1 != null && block2 == null) {
			if (y - 1 >= 0 && this.gameGrid[x2][y - 1] == null) {
				this.lockBlocksStartingAtPoint(x2, y);
				this.animationQueue++;
				setTimeout(this.dropBlocksStartingAtPoint.bind(this, x2, y), this.dropDelay);
			}
			this.lockBlocksStartingAtPoint(x, y + 1);
			this.animationQueue++;
			setTimeout(this.dropBlocksStartingAtPoint.bind(this, x, y + 1), this.dropDelay);
		}

		else if (block2 != null && block1 == null) {
			if (y - 1 >= 0 && this.gameGrid[x][y - 1] == null) {
				this.lockBlocksStartingAtPoint(x, y);
				this.animationQueue++;
				setTimeout(this.dropBlocksStartingAtPoint.bind(this, x, y), this.dropDelay);
			}
			this.lockBlocksStartingAtPoint(x2, y + 1);
			this.animationQueue++;
			setTimeout(this.dropBlocksStartingAtPoint.bind(this, x2, y + 1), this.dropDelay);
		}

		this.checkForMatches();

		//this.checkDropBlocks();
	}

	destroyBlock(x, y){
		if (this.gameGrid[x][y] == null || this.gameGrid[x][y].userData.locked) {
			return;
		}
		this.animationQueue++;

		this.gameGrid[x][y].userData.locked = true;
		this.gameGrid[x][y].userData.exploding = true;
		//this.gameGrid[x][y].material.map = this.explodeTexture;

		/*
		 new TWEEN.Tween(this.gameGrid[x][y].scale).to({
		 x:0.7,
		 y:0.7
		 },800).easing( TWEEN.Easing.Elastic.Out).start();
		 */

		setTimeout(this.deleteBlock.bind(this, x, y), 500);
	}

	lockBlocksStartingAtPoint(x, y){
		for (let i = y; i < this.boardHeight; i++) {
			if (this.gameGrid[x][i] !== null && !this.gameGrid[x][i].userData.exploding) {
				this.gameGrid[x][i].userData.locked = true;
				//Set texture to a debug "lock/dropping" texture.
				//this.gameGrid[x][i].material.map = this.lockTexture;
			} else {
				return;
			}
		}
	}

	deleteBlock(x, y){
		this.gameGrid[x][y].userData.exploding = false;
		this.gameBoard.remove(this.gameGrid[x][y]);
		this.gameGrid[x][y] = null;
		this.animationQueue--;

		this.lockBlocksStartingAtPoint(x, y + 1);
		this.animationQueue++;
		setTimeout(this.dropBlocksStartingAtPoint.bind(this, x, y + 1), this.dropDelay);
	}

	dropBlocksStartingAtPoint(x, y){
		this.animationQueue--;
		let stillGottaFall = true;
		for (let i = y; i < this.boardHeight; i++) {
			if (this.gameGrid[x][i] !== null && !this.gameGrid[x][i].userData.exploding) {
				//You moved a block under this block about to fall.
				if (this.gameGrid[x][i - 1] !== null) {
					this.gameGrid[x][i].userData.locked = false;
					//Set texture back to normal, non debug texture.
					//this.gameGrid[x][i].material.map = this.blockTextures[this.gameGrid[x][i].userData.blockType];
					stillGottaFall = false;
					continue;
				}
				let sThis = this;
				this.animationQueue++;
				new TWEEN.Tween(this.gameGrid[x][i].position).to({y: this.calcYBlockPos(i - 1)}, 200).easing(TWEEN.Easing.Bounce.Out).start().onComplete(function () {
					sThis.animationQueue--;
				});
				this.gameGrid[x][i - 1] = this.gameGrid[x][i];
				this.gameGrid[x][i] = null;
			} else {
				///stoooop!
				break;
			}
		}
		if (stillGottaFall) {
			if (y - 1 >= 0) {
				this.animationQueue++;
				this.dropBlocksStartingAtPoint(x, y - 1);
			}
		} else {
			this.checkForMatches();
		}
	}

	adjustSelector(direction){
		switch (direction) {
			case 'up':
				this.selectorY++;
				break;
			case 'down':
				this.selectorY--;
				break;
			case 'left':
				this.selectorX++;
				if (this.selectorX >= this.boardWidth) {
					this.gameBoard.rotation.y = this.nextRow.rotation.y = this.circlePieceSize * -1 - HALF_PI - (this.circlePieceSize / 2)
				}
				break;
			case 'right':
				this.selectorX--;
				if (this.selectorX < 0) {
					this.gameBoard.rotation.y = this.nextRow.rotation.y = this.circlePieceSize * this.boardWidth - HALF_PI - (this.circlePieceSize / 2);
				}
				break;
		}
		if (this.selectorY >= this.boardHeight) {
			this.selectorY = this.boardHeight - 1;
		}
		if (this.selectorY < 0) {
			this.selectorY = 0
		}
		if (this.selectorX >= this.boardWidth) {
			this.selectorX = 0;
		}
		if (this.selectorX < 0) {
			this.selectorX = this.boardWidth - 1;
		}
		this.focusCameraOnSelection();
	}

	focusCameraOnSelection(){
		let newAngle = this.circlePieceSize * this.selectorX - HALF_PI - (this.circlePieceSize / 2);

		new TWEEN.Tween(this.gameBoard.rotation).to({
			//x: this.circlePieceSize * this.selectorY,
			y: newAngle
			//z: 0
		}, 200).easing(TWEEN.Easing.Exponential.Out).start();

		new TWEEN.Tween(this.nextRow.rotation).to({
			//x: this.circlePieceSize * this.selectorY,
			y: newAngle
			//z: 0
		}, 200).easing(TWEEN.Easing.Exponential.Out).start();

		this.updateCursorPos();
	}

	calcYBlockPos(y){
		return (y * this.blockHeight) + (this.blockHeight / 2)
	}

	calcXBlockPos(x){
		return Math.cos(this.circlePieceSize * x) * this.boardRadius;
	}

	calcZBlockPos(x) {
		return Math.sin(this.circlePieceSize * x) * this.boardRadius;
	}

	calcRBlockPos(x){
		return -this.circlePieceSize * x + HALF_PI;
	}

	loadMap(mapFile){
		let sThis = this;
		this.fileLoader.load('maps/' + mapFile + '.txt', function (map) {
			map = map.replace(/\r\n/g, "\r");
			let rows = map.split("\r");
			let botRow = rows.length - 1;
			let mapArray = [];
			for (let y = botRow; y >= 0; y--) {
				let row = [];
				let items = rows[y].split("");
				for (let x = items.length - 1; x >= 0; x--) {
					row.push(items[x]);
				}
				mapArray.push(row);
			}
			sThis.resetGame(mapArray);
		});
	}

	generateNextRow(){
		if (this.hasOwnProperty('nextRow')) {
			this.scene.remove(this.nextRow);
		}

		let colorPool = [];
		let allColors = Object.keys(this.blockColors);
		for (let c = 0; c < allColors.length - this.handicap; c++) {
			colorPool.push(allColors[c]);
		}

		this.nextRow = new THREE.Object3D();
		let meshes = this.generateNextRowMeshArray(colorPool);
		for (let i in meshes) {
			this.nextRow.add(meshes[i]);
		}
		this.scene.add(this.nextRow);
		this.updateNextRowPos();
		this.nextRow.rotation.y = this.circlePieceSize * this.selectorX - HALF_PI - (this.circlePieceSize / 2);
		this.rowsCreated++;
	}

	generateNextRowMeshArray(colorPoolIn){
		let meshes = [];
		let geometry = new THREE.BoxGeometry(this.blockWidth, this.blockHeight, this.blockDepth);
		//let keys = Object.keys(this.blockTextures);

		//Preload the array with nulls
		for (let x1 = 0; x1 < this.boardWidth; x1++) {
			meshes[x1] = null;
		}

		for (let x = 0; x < this.boardWidth; x++) {

			let colorPool = colorPoolIn.slice(0);
			let lastXType = '';
			let lastYType = '';

			for (let i = -2; i <= 2; i++) {

				if (i == 0) {
					continue;
				}

				let nextXBlock = meshes[(x - i + this.boardWidth) % this.boardWidth];

				if (nextXBlock !== null) {
					let xType = nextXBlock.userData.blockType;
					let xPos = colorPool.indexOf(xType);
					if (xType == lastXType && xPos !== -1 && colorPool.length > 1) {
						colorPool.splice(xPos, 1);
					}
					lastXType = xType;
				}

				if (i < 0) {
					continue;
				}

				let nextYBlock = this.gameGrid[x][i - 1];
				if (nextYBlock !== null) {
					let yType = nextYBlock.userData.blockType;
					let yPos = colorPool.indexOf(yType);
					if (yType == lastYType && yPos !== -1 && colorPool.length > 1) {
						colorPool.splice(yPos, 1);
					}
					lastYType = yType;
				}

			}

			let blockType = colorPool[Math.floor(Math.random() * colorPool.length)];

			//let adjustedColor = new THREE.Color(this.blockColors[blockType]);
			//adjustedColor.add( new THREE.Color(0x505050));
			//let faceMaterial = new THREE.MeshBasicMaterial({color: adjustedColor,map:this.blockTextures[blockType]});
			//let sideMaterial = new THREE.MeshBasicMaterial({color: adjustedColor,map:this.blockSideTexture});
			//let topMaterial = new THREE.MeshBasicMaterial({color: adjustedColor,map:this.blockTopTexture});
			let material = this.nextRowBlockMaterials[blockType];
			/*new THREE.MultiMaterial([
			 sideMaterial,   //right
			 sideMaterial,   //left
			 topMaterial,   //top
			 topMaterial,   //bottom
			 faceMaterial,   //back
			 faceMaterial    //front
			 ]);*/

			let mesh = new THREE.Mesh(geometry, material);
			//mesh.userData.color = mesh.material.color.getHex();
			mesh.userData.blockType = blockType;
			mesh.position.x = this.calcXBlockPos(x);
			mesh.position.y = this.calcYBlockPos(0);
			mesh.position.z = this.calcZBlockPos(x);
			mesh.rotation.y = this.calcRBlockPos(x);
			meshes[x] = mesh;
		}
		return meshes;
	}

	generateBlockMesh(blockType, x, y){
		let geometry = new THREE.BoxGeometry(this.blockWidth, this.blockHeight, this.blockDepth);

		/*
		 let faceMaterial = new THREE.MeshBasicMaterial({color: this.blockColors[blockType],map:this.blockTextures[blockType]});
		 let sideMaterial = new THREE.MeshBasicMaterial({color: this.blockColors[blockType],map:this.blockSideTexture});
		 let topMaterial = new THREE.MeshBasicMaterial({color: this.blockColors[blockType],map:this.blockTopTexture});
		 let material = new THREE.MultiMaterial([
		 sideMaterial,   //right
		 sideMaterial,   //left
		 topMaterial,   //top
		 topMaterial,   //bottom
		 faceMaterial,   //back
		 faceMaterial    //front
		 ]);
		 */

		let mesh = new THREE.Mesh(geometry, this.blockMaterials[blockType]);
		//mesh.userData.color = mesh.material.color.getHex();

		mesh.userData.blockType = blockType;
		mesh.userData.locked = false;
		mesh.userData.exploding = false;
		//Used to prevent double counting when finding matches.
		mesh.userData.alreadyMatchedX = false;
		mesh.userData.alreadyMatchedY = false;

		mesh.position.x = this.calcXBlockPos(x);
		mesh.position.y = this.calcYBlockPos(y);
		mesh.position.z = this.calcZBlockPos(x);

		mesh.rotation.y = this.calcRBlockPos(x);

		return mesh;
	}

	getBlockAt(x, y){
		x = (x + this.boardWidth) % this.boardWidth;
		y = (y + this.boardHeight) % this.boardHeight;
		if (x in this.gameGrid === false || y in this.gameGrid[x] === false || this.gameGrid[x][y] === null) {
			return false;
		}
		return this.gameGrid[x][y];
	}

	generateMap(colorPoolIn, heightPercent){
		let grid = [];
		for (let gx = 0; gx < this.boardWidth; gx++) {
			let column = [];
			for (let gy = 0; gy < this.boardHeight; gy++) {
				column.push(null);
			}
			grid.push(column);
		}

		for (let x = 0; x < this.boardWidth; x++) {
			for (let y = 0; y < this.boardHeight; y++) {

				if (y > this.boardHeight * heightPercent) {
					grid[x][y] = null;
					continue;
				}

				let colorPool = colorPoolIn.slice(0);
				let lastXType = '';
				let lastYType = '';

				for (let i = -2; i <= 2; i++) {
					if (i == 0) {
						continue;
					}

					let nextXBlock = grid[(x - i + this.boardWidth) % this.boardWidth][y];

					if (nextXBlock !== null) {
						let xType = nextXBlock;
						let xPos = colorPool.indexOf(xType);
						if (xType == lastXType && xPos !== -1 && colorPool.length > 1) {
							colorPool.splice(xPos, 1);
						}
						lastXType = xType;
					}
					let nextYBlock = grid[x][(y - i + this.boardHeight) % this.boardHeight];

					if (nextYBlock !== null) {
						let yType = nextYBlock;
						let yPos = colorPool.indexOf(yType);
						if (yType == lastYType && yPos !== -1 && colorPool.length > 1) {
							colorPool.splice(yPos, 1);
						}
						lastYType = yType;
					}
				}
				grid[x][y] = colorPool[Math.floor(Math.random() * colorPool.length)];
			}
		}
		return grid;
	}

	cylinder(mapArray){
		let blocks = new THREE.Object3D();
		let colorPool = [];
		let allColors = Object.keys(this.blockColors);
		for (let i = 0; i < allColors.length - this.handicap; i++) {
			colorPool.push(allColors[i]);
		}

		let goodMap = this.generateMap(colorPool, 0.3);

		for (let x = 0; x < this.boardWidth; x++) {
			let column = [];
			this.stackHeights[x] = this.boardHeight;
			for (let y = 0; y < this.boardHeight; y++) {

				//let invalidBlockTypes = array();

				let blockType = goodMap[x][y];//colorPool[Math.floor(Math.random()*colorPool.length)];
				//console.log('chose '+blockType);
				//console.log('==========================');

				/*
				 if(mapArray){
				 if(!mapArray[y] || !mapArray[y][x] || mapArray[y][x] == '-'){
				 column.push(null);
				 continue;
				 }
				 if(mapArray[y][x] != '?') {
				 blockType = allColors[mapArray[y][x]];
				 }
				 }else if(y>Math.floor(this.boardHeight*0.40)){
				 column.push(null);
				 continue;
				 }
				 */
				if (blockType == null) {
					column.push(null);
				} else {
					let mesh = this.generateBlockMesh(blockType, x, y);
					column.push(mesh);
					blocks.add(mesh);
				}
			}
			this.gameGrid.push(column);
		}
		return blocks;
	}

	onWindowResize() {
		let width = window.innerWidth;
		let height = window.innerHeight;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}

	updateTowerPos(){
		this.gameBoard.position.y = -this.halfBoardPixelHeight + this.upOffset;
		return this.gameBoard.position.y;
	}

	updateCursorPos(){
		this.cursorObj.position.y = this.calcYBlockPos(this.selectorY) - this.halfBoardPixelHeight + this.upOffset;
		this.debug.debugSelectionUpdate();
	}

	updateNextRowPos(){
		this.nextRow.position.y = this.calcYBlockPos(-1) - this.halfBoardPixelHeight - (this.blockHeight / 2) + this.upOffset;
	}

	animate(){
		requestAnimationFrame(this.animate.bind(this));
		this.stats.begin();
		this.render();
		this.stats.end();
	}

	gameAnimations(){
		//TODO: People on higher hz monitors will see different animation speeds because of how things are coded here.
		//TODO: The following animations should be using the TWEEN library on a loop, with events to stop and start the animations
		//TODO: It would also be a performance improvement to remove these for loops from the animation loop.

		//let timer = performance.now();

		this.menuObj.rotation.y = Math.sin(this.piTimer) * (HALF_PI / 10);

		if (!this.gameActive) {
			return;
		}

		let almostDead = {};
		for (let tx = 0; tx < this.boardWidth; tx++) {
			almostDead[tx] = this.gameGrid[tx][this.boardHeight - 3] !== null;
		}

		for (let x = 0; x < this.boardWidth; x++) {
			for (let y = 0; y < this.boardHeight; y++) {
				let block = this.gameGrid[x][y];
				if (block !== null && block.userData.exploding) {
					block.scale.x = block.scale.y = (0.1 * Math.sin(this.piTimer * 16) + 0.8);
				}

				if (block !== null) {
					if (almostDead[x]) {
						block.rotation.z = Math.cos(this.piTimer * 3) * PI / 32
					} else {
						block.rotation.z = 0;
					}
				}
			}
		}

		for (let i = 0; i < this.nextRow.children.length; i++) {
			if (almostDead[i]) {
				this.nextRow.children[i].rotation.z = Math.cos(this.piTimer * 3) * PI / 32
			} else {
				this.nextRow.children[i].rotation.z = 0;
			}
		}

		for (let c = 0; c < this.cursorObj.children.length; c++) {
			this.cursorObj.children[c].scale.x = this.cursorObj.children[c].scale.y = (0.05 * Math.sin(this.piTimer) + 1);
		}
	}

	render(){
		TWEEN.update();
		this.gameAnimations();
		this.renderer.render(this.scene, this.camera);
		this.piTimer += 0.05;
		if (this.piTimer > TWO_PI) {
			this.piTimer = 0;
		}
	}
}