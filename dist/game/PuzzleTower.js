'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PuzzleTower = function () {

	/**
  * @param {PuzzleGame} PuzzleGame
  * */
	function PuzzleTower(PuzzleGame) {
		_classCallCheck(this, PuzzleTower);

		this.PuzzleGame = PuzzleGame;

		this.towerGroup = new THREE.Group();
		this.PuzzleGame.scene.add(this.towerGroup);

		this.currentMode = MODE_LOADING;

		this.resettedStats = {
			score: 0,
			matches: 0,
			rowsCreated: 0,
			chainCount: 0,
			highestChain: 0
		};
		this.stats = Object.assign({}, this.resettedStats);

		//Timer Objects
		this.pushTimeoutObj = null;

		window.onblur = function () {
			if (this.hasControl && !this.PuzzleGame.paused) {
				this.pauseGame();
			}
		}.bind(this);

		this.clearLineHeight = -5;
		this.tube = this.generateTube();
		this.towerGroup.add(this.tube);
		this.depthFilter = this.generateCylinderDepthFilter();
		this.towerGroup.add(this.depthFilter);

		this.gameBoard = new THREE.Object3D();
		this.nextRow = new THREE.Object3D();
		this.cursorObj = new THREE.Object3D();

		this.setGameMode(MODE_NONE);

		this.debugMapNumber = 1;

		this.initTouch();
	}

	//checkTimerQueue(){
	//	console.log(PuzzleTimer.timers[CAT_GAME]);
	//}

	_createClass(PuzzleTower, [{
		key: 'changeMapType',
		value: function changeMapType(mapType) {
			this.mapType = mapType;
			this.resetGameVariables();

			this.towerGroup.remove(this.tube);
			this.tube = this.generateTube();
			this.towerGroup.add(this.tube);

			if (this.PuzzleGame.loaded) {
				this.PuzzleGame.tubeTexture.repeat.set(this.boardWidth, this.boardHeight);
			}

			this.towerGroup.remove(this.depthFilter);
			this.depthFilter = this.generateCylinderDepthFilter();
			this.towerGroup.add(this.depthFilter);
		}
	}, {
		key: 'initTouch',
		value: function initTouch() {
			this.touchTimer = null;
			this.xTouchChain = 0;
			this.yTouchChain = 0;
		}
	}, {
		key: 'touchStart',
		value: function touchStart(event) {
			var sThis = this;
			event.preventDefault();

			if (this.PuzzleGame.paused) {
				this.pauseGame();
				return;
			}

			if (event.touches.length === 1) {
				if (this.touchTimer === null) {
					this.touchTimer = setTimeout(function () {
						sThis.touchTimer = null;
					}, 200);
				} else {
					clearTimeout(this.touchTimer);
					this.touchTimer = null;
					if (Math.abs(this.xTouchChain) < 10 && Math.abs(this.yTouchChain) < 10) {
						this.swapSelectedBlocks();
					}
				}

				this.lastXTouch = event.touches[0].pageX;
				this.lastYTouch = event.touches[0].pageY;
				this.xTouchChain = 0;
				this.yTouchChain = 0;
			}
		}

		/**
   * @param event
   */

	}, {
		key: 'touchMove',
		value: function touchMove(event) {
			event.preventDefault();

			if (event.touches.length === 1) {
				var mouseX = event.touches[0].pageX;
				var mouseY = event.touches[0].pageY;
				var xDelta = mouseX - this.lastXTouch;
				var yDelta = mouseY - this.lastYTouch;
				this.lastXTouch = mouseX;
				this.lastYTouch = mouseY;
				this.xTouchChain += xDelta;
				this.yTouchChain += yDelta;
				if (this.xTouchChain < -30) {
					this.adjustSelector('left');
					this.xTouchChain = 0;
				} else if (this.xTouchChain > 30) {
					this.adjustSelector('right');
					this.xTouchChain = 0;
				}
				if (this.yTouchChain < -30) {
					this.adjustSelector('up');
					this.yTouchChain = 0;
				} else if (this.yTouchChain > 30) {
					this.adjustSelector('down');
					this.yTouchChain = 0;
				}
			}
		}
	}, {
		key: 'closeAndSetGameMode',
		value: function closeAndSetGameMode(newMode) {
			this.currentMode = MODE_CLOSED;
			this.closeTube(this.setGameMode.bind(this, newMode));
		}
	}, {
		key: 'setGameMode',
		value: function setGameMode(newMode) {
			this.gameBoard.visible = false;
			this.cursorObj.visible = false;
			this.nextRow.visible = false;
			this.depthFilter.visible = false;

			this.currentMode = newMode;
			switch (newMode) {
				case MODE_NONE:
					this.openTubeFull();
					break;
				case MODE_ENDLESS:

					this.openTube();
					//let sThis = this;

					/*setTimeout(function(){
     	sThis.gameBoard.visible = true;
     	sThis.cursorObj.visible = true;
     	sThis.nextRow.visible = true;
     	sThis.depthFilter.visible = true;
     	sThis.resetGame();
     	new TWEEN.Tween(sThis.depthFilter.material).to({
     		opacity:0.5
     	},2000).easing(TWEEN.Easing.Exponential.Out).start();
     },1000);
     */

					new PuzzleTimer(function () {
						this.gameBoard.visible = true;
						this.cursorObj.visible = true;
						this.nextRow.visible = true;
						this.depthFilter.visible = true;
						this.resetGame();
						new TWEEN.Tween(this.depthFilter.material).to({
							opacity: 0.5
						}, 2000).easing(TWEEN.Easing.Exponential.Out).start();
					}, 1000, CAT_GAME, this);

					break;
			}
		}
	}, {
		key: 'makeHarder',
		value: function makeHarder() {
			if (this.pushDelay > 0) {
				if (this.mapType === MAP_3D) {
					this.pushDelay = 100 - this.stats.matches / (6 - this.difficulty);
				} else {
					this.pushDelay = 50 - this.stats.matches / (6 - this.difficulty);
				}

				if (this.pushDelay < 0) {
					this.pushDelay = 0;
				}
			}
		}
	}, {
		key: 'resetGameVariables',
		value: function resetGameVariables() {

			switch (this.mapType) {
				case MAP_2D:
					this.boardHeight = 13;
					this.boardWidth = 6;
					this.pushDelay = 50;
					this.blockWidth = 45;
					this.blockHeight = 45;
					this.blockDepth = 1;
					this.boardRadius = null;
					this.boardPixelWidth = this.boardWidth * this.blockWidth; //Also known as circumference in 3d mode!
					break;
				case MAP_3D:
					this.boardHeight = 13;
					this.boardWidth = 30;
					this.pushDelay = 100;
					this.blockWidth = 30;
					this.blockHeight = 30;
					this.blockDepth = 10;
					this.boardRadius = (this.blockWidth - 1) * this.boardWidth / (2 * PI);
					this.boardPixelWidth = (this.boardRadius + this.blockDepth) * 2;
					break;
			}

			//TODO:Sort these!

			this.difficulty = this.PuzzleGame.gameSettings.difficulty;
			this.startingHeight = this.PuzzleGame.gameSettings.startingHeight;

			this.animationQueue = 0;
			this.stats = Object.assign({}, this.resettedStats);
			this.gameGrid = [];

			this.circlePieceSize = TWO_PI / this.boardWidth;
			this.stackHeights = [];

			this.boardPixelHeight = this.boardHeight * this.blockHeight;

			this.halfBoardPixelHeight = this.boardPixelHeight / 2;

			this.hasControl = false;
			this.gameActive = false;
			this.upOffset = 0;
			this.dropDelay = 150;

			this.handicap = 5 - this.difficulty;

			this.chainTimer = null;
			this.quickPush = false;
		}
	}, {
		key: 'resetGame',
		value: function resetGame() {

			//TWEEN.removeAll();

			this.PuzzleGame.resetBlockTextures();

			this.resetGameVariables();

			if (this.hasOwnProperty('gameBoard')) {
				this.towerGroup.remove(this.gameBoard);
			}
			this.gameBoard = this.cylinder();
			this.towerGroup.add(this.gameBoard);

			this.generateNextRow();

			if (this.pushTimeoutObj !== null) {
				this.pushTimeoutObj.clear();
			}
			this.pushTimeoutObj = new PuzzleTimer(this.checkToPushBlocks, 2000, CAT_GAME, this); //setTimeout(this.checkToPushBlocks.bind(this), 2000);

			if (this.hasOwnProperty('cursorObj')) {
				this.towerGroup.remove(this.cursorObj);
			}
			this.cursorObj = this.generateCursor();
			this.towerGroup.add(this.cursorObj);

			this.selectorY = Math.floor(this.boardHeight / 2);
			this.selectorX = Math.floor(this.boardWidth / 2);

			this.updateCursorPos();

			var startingTowerAngle = this.circlePieceSize * this.selectorX - HALF_PI - this.circlePieceSize / 2;
			if (this.mapType === MAP_2D) {
				startingTowerAngle = 0;
				this.gameBoard.rotation.y = startingTowerAngle;
			} else {
				this.gameBoard.rotation.y = startingTowerAngle - PI;
			}
			this.nextRow.rotation.y = startingTowerAngle;

			var startingTowerPosition = this.updateTowerPos();
			this.gameBoard.position.y = startingTowerPosition - this.boardPixelHeight;

			this.openTube();

			new TWEEN.Tween(this.gameBoard.position).to({
				y: startingTowerPosition
			}, 1200).easing(TWEEN.Easing.Quintic.Out).delay(400).start();

			var sThis = this;
			new TWEEN.Tween(this.gameBoard.rotation).to({
				y: startingTowerAngle
			}, 1200).easing(TWEEN.Easing.Quintic.Out).delay(400).start().onComplete(function () {
				sThis.hasControl = true;
				sThis.gameActive = true;
				sThis.checkForMatches();
			});

			this.debug = new PuzzleDebug(this);
			this.debug.initDatGui();
		}
	}, {
		key: 'loseAnimation',
		value: function loseAnimation() {
			this.PuzzleGame.blankOutBlockTextures();
			for (var x = 0; x < this.boardWidth; x++) {
				for (var y = 0; y < this.boardHeight; y++) {
					if (this.gameGrid[x][y] !== null) {
						//this.gameGrid[x][y].material.map = this.PuzzleGame.blankTexture;
						var delay = 500;
						if (this.gameGrid[x][this.boardHeight - 1] !== null) {
							delay = 2000;
							continue;
						}
						new TWEEN.Tween(this.gameGrid[x][y].position).to({
							y: -this.boardPixelHeight * 2.1
						}, 4000).easing(TWEEN.Easing.Exponential.Out).delay(delay).start();
					}
				}
			}
			//setTimeout(this.closeAndSetGameMode.bind(this, MODE_NONE), 2500);
			new PuzzleTimer(this.closeAndSetGameMode.bind(this, MODE_NONE), 2500, CAT_GAME, this);
		}
	}, {
		key: 'checkToPushBlocks',
		value: function checkToPushBlocks() {
			if (!this.gameActive) {
				return;
			}

			var pushDelay = this.pushDelay;
			if (this.quickPush === true) {
				pushDelay = 0;
			}

			if (this.animationQueue !== 0) {
				this.pushTimeoutObj = new PuzzleTimer(this.checkToPushBlocks, pushDelay, CAT_GAME, this); //setTimeout(this.checkToPushBlocks.bind(this), pushDelay);
				return;
			}

			if (this.pushTowerUp()) {
				this.pushTimeoutObj = new PuzzleTimer(this.checkToPushBlocks, pushDelay, CAT_GAME, this); //setTimeout(this.checkToPushBlocks.bind(this), pushDelay);
			}
		}
	}, {
		key: 'pushTowerUp',
		value: function pushTowerUp() {
			var _this = this;

			for (var tx = 0; tx < this.boardWidth; tx++) {
				if (this.gameGrid[tx][this.boardHeight - 1] !== null) {
					//YOU LOSE
					this.hasControl = false;
					this.gameActive = false;
					this.loseAnimation();
					new PuzzleTimer(function () {
						_this.PuzzleGame.menu.showMenu();
						_this.PuzzleGame.menu.changeMenu(_this.PuzzleGame.menu.endingScreen);
						_this.PuzzleGame.scoreBoard.hideScoreBoard();
						_this.PuzzleGame.setFocus(FOCUS_MENU);
					}, 3000, CAT_GAME, this);
					return false;
				}
			}

			this.upOffset += this.blockHeight / 100;
			if (this.upOffset > this.blockHeight) {

				for (var x = 0; x < this.boardWidth; x++) {
					for (var y = this.boardHeight - 1; y >= 0; y--) {
						if (this.gameGrid[x][y] !== null) {
							this.gameGrid[x][y].position.y = this.calcYBlockPos(y + 1);
							this.gameGrid[x][y + 1] = this.gameGrid[x][y];
							//this.gameGrid[x][y] = null;
						}
					}
				}
				for (var nx = 0; nx < this.boardWidth; nx++) {
					var block = this.generateBlockMesh(this.nextRow.children[nx].userData.blockType, nx, 0);
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
	}, {
		key: 'generateCursor',
		value: function generateCursor() {
			var obj = new THREE.Object3D();
			var geometry = new THREE.PlaneGeometry(this.blockWidth, this.blockHeight);

			var material = new THREE.MeshBasicMaterial({
				color: 0xffffff,
				side: THREE.DoubleSide,
				map: this.PuzzleGame.cursorTexture,
				transparent: true
			});
			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.x = -this.blockWidth / 2;
			obj.add(mesh);
			var mesh2 = new THREE.Mesh(geometry, material);
			mesh2.position.x = this.blockWidth / 2;
			obj.add(mesh2);

			if (this.mapType === MAP_3D) {
				obj.position.z = this.boardRadius + this.blockDepth;
			} else {
				obj.position.z = this.blockDepth;
			}
			return obj;
		}
	}, {
		key: 'closeTube',
		value: function closeTube(completeFn) {
			var closeDelay = 1000;
			var closeEase = TWEEN.Easing.Cubic.Out;

			new TWEEN.Tween(this.tube.children[0].position).to({ y: -this.boardPixelHeight / 2 }, closeDelay).easing(closeEase).start();
			if (this.mapType === MAP_3D) {
				new TWEEN.Tween(this.tube.children[0].rotation).to({ y: -HALF_PI }, closeDelay).easing(closeEase).start();
			}

			new TWEEN.Tween(this.tube.children[1].position).to({ y: this.boardPixelHeight / 2 }, closeDelay).easing(closeEase).start();
			if (this.mapType === MAP_3D) {
				new TWEEN.Tween(this.tube.children[1].rotation).to({ y: HALF_PI }, closeDelay).easing(closeEase).start();
			}

			//setTimeout(completeFn, closeDelay);
			new PuzzleTimer(completeFn, closeDelay, CAT_GAME, this);
		}
	}, {
		key: 'openTube',
		value: function openTube(completeFn) {
			var openDelay = 1000;
			var openEase = TWEEN.Easing.Cubic.Out;

			new TWEEN.Tween(this.tube.children[0].position).to({ y: -this.boardPixelHeight + 1 }, openDelay).easing(openEase).start();
			if (this.mapType === MAP_3D) {
				new TWEEN.Tween(this.tube.children[0].rotation).to({ y: 0 }, openDelay).easing(openEase).start();
			}

			new TWEEN.Tween(this.tube.children[1].position).to({ y: this.boardPixelHeight - 1 }, openDelay).easing(openEase).start();
			if (this.mapType === MAP_3D) {
				new TWEEN.Tween(this.tube.children[1].rotation).to({ y: 0 }, openDelay).easing(openEase).start();
			}

			//setTimeout(completeFn, openDelay);
			new PuzzleTimer(completeFn, openDelay, CAT_GAME, this);
		}
	}, {
		key: 'openTubeFull',
		value: function openTubeFull(completeFn) {
			var openDelay = 1000;
			var openEase = TWEEN.Easing.Cubic.Out;

			new TWEEN.Tween(this.tube.children[0].position).to({ y: -this.boardPixelHeight * 2 }, openDelay).easing(openEase).start();
			if (this.mapType === MAP_3D) {
				new TWEEN.Tween(this.tube.children[0].rotation).to({ y: HALF_PI }, openDelay).easing(openEase).start();
			}

			new TWEEN.Tween(this.tube.children[1].position).to({ y: this.boardPixelHeight * 2 }, openDelay).easing(openEase).start();
			if (this.mapType === MAP_3D) {
				new TWEEN.Tween(this.tube.children[1].rotation).to({ y: -HALF_PI }, openDelay).easing(openEase).start();
			}

			//setTimeout(completeFn, openDelay);
			new PuzzleTimer(completeFn, openDelay, CAT_GAME, this);
		}
	}, {
		key: 'generateTube',
		value: function generateTube() {
			var obj = new THREE.Object3D();
			var material = null;
			var tube = null;
			var tube2 = null;

			if (this.mapType === MAP_3D) {
				material = new THREE.MeshBasicMaterial({ color: 0x311B92, side: THREE.DoubleSide, map: this.PuzzleGame.tubeTexture });
				var r = this.boardRadius + this.blockDepth / 2 + 5;
				var geometry = new THREE.CylinderGeometry(r, r, this.boardPixelHeight, this.boardWidth, 1, false);
				tube = new THREE.Mesh(geometry, material);
				tube.position.y = -(this.boardPixelHeight * 2);
				tube.rotation.y = -HALF_PI;

				tube2 = new THREE.Mesh(geometry, material);
				tube2.position.y = this.boardPixelHeight * 2;
				tube2.rotation.y = HALF_PI;
			} else {
				material = new THREE.MeshBasicMaterial({ color: 0xB71C1C, side: THREE.DoubleSide, map: this.PuzzleGame.tubeTexture });
				var _geometry = new THREE.BoxGeometry(this.boardPixelWidth, this.boardPixelHeight, this.blockDepth + 10);
				tube = new THREE.Mesh(_geometry, material);
				tube.position.y = -(this.boardPixelHeight * 2);

				tube2 = new THREE.Mesh(_geometry, material);
				tube2.position.y = this.boardPixelHeight * 2;
			}

			obj.add(tube);
			obj.add(tube2);

			return obj;
		}
	}, {
		key: 'generateCylinderDepthFilter',
		value: function generateCylinderDepthFilter() {
			var material = new THREE.MeshBasicMaterial({
				color: 0x000000,
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 0
			});

			var width = this.boardPixelWidth;
			var geometry = new THREE.PlaneGeometry(width, this.boardPixelHeight);
			return new THREE.Mesh(geometry, material);
		}
	}, {
		key: 'pauseGame',
		value: function pauseGame() {
			if (this.PuzzleGame.menu.inAnimation) {
				return;
			}
			if (this.PuzzleGame.paused) {
				this.hidePause();
				this.PuzzleGame.setFocus(FOCUS_TOWER);
				//new TWEEN.Tween(this.towerGroup.position).to({
				//	z: 0
				//}, 500).easing(TWEEN.Easing.Quadratic.Out).start();
				PuzzleTimer.resumeAllInCategory(CAT_GAME);
				this.openTube();
			} else {
				this.showPause();
				this.PuzzleGame.setFocus(FOCUS_MENU);
				PuzzleTimer.pauseAllInCategory(CAT_GAME);
				//new TWEEN.Tween(this.towerGroup.position).to({
				//	z: -200
				//}, 500).easing(TWEEN.Easing.Quadratic.Out).start();
				this.closeTube();
			}
			this.PuzzleGame.paused = !this.PuzzleGame.paused;
		}
	}, {
		key: 'showPause',
		value: function showPause() {
			this.PuzzleGame.menu.changeMenu(this.PuzzleGame.menu.pauseMenuOptions);
			this.PuzzleGame.menu.showMenu();
		}
	}, {
		key: 'hidePause',
		value: function hidePause() {
			this.PuzzleGame.menu.hideMenu();
		}
	}, {
		key: 'keyPress',
		value: function keyPress(event) {
			if (!this.hasControl || this.PuzzleGame.paused && event.keyCode !== PuzzleGame.KEY.ESCAPE) {
				return;
			}

			//console.log(event.keyCode);
			switch (event.keyCode) {
				case 88:
					//X
					//this.destroyBlock(this.selectorX,this.selectorY);
					this.quickPush = true;
					break;
				case PuzzleGame.KEY.ESCAPE:
					this.pauseGame();
					break;
				case PuzzleGame.KEY.SPACE:
					this.swapSelectedBlocks();
					break;
				case PuzzleGame.KEY.UP:
					this.adjustSelector('up');
					break;
				case PuzzleGame.KEY.DOWN:
					this.adjustSelector('down');
					break;
				case PuzzleGame.KEY.LEFT:
					this.adjustSelector('left');
					break;
				case PuzzleGame.KEY.RIGHT:
					this.adjustSelector('right');
					break;
			}
		}
	}, {
		key: 'keyUp',
		value: function keyUp() {
			this.quickPush = false;
		}
	}, {
		key: 'swapSelectedBlocks',
		value: function swapSelectedBlocks() {
			this.swapBlocks(this.selectorX, this.selectorY, this.selectorX - 1);
		}
	}, {
		key: 'checkForMatches',
		value: function checkForMatches() {

			if (!this.hasControl) {
				return;
			}

			//combo being number of matches that happened in the same check
			var comboCount = 0;

			var blocksToBeDestroyed = [];
			for (var y = 0; y < this.boardHeight; y++) {
				for (var x = 0; x < this.boardWidth; x++) {
					if (this.gameGrid[x][y] === null || this.gameGrid[x][y].userData.locked) {
						continue;
					}

					var typeToMatch = this.gameGrid[x][y].userData.blockType;
					var matchChainX = [x];
					var xToTest = x + 1;
					if (xToTest === this.boardWidth) {
						if (this.mapType === MAP_3D) {
							xToTest = 0;
						} else {
							xToTest = x;
						}
					}

					while (xToTest !== x && this.gameGrid[xToTest][y] !== null && !this.gameGrid[xToTest][y].userData.locked && !this.gameGrid[xToTest][y].userData.alreadyMatchedX) {
						var nextType = this.gameGrid[xToTest][y].userData.blockType;
						if (nextType !== typeToMatch) {
							//no more matches!
							break;
						}
						matchChainX.push(xToTest);
						xToTest++;
						if (xToTest === this.boardWidth) {
							if (this.mapType === MAP_3D) {
								xToTest = 0;
							} else {
								break; //Only X rollover on 3D
							}
						}
					}

					if (matchChainX.length >= 3) {
						this.stats.matches++;
						comboCount++;
						for (var i = 0; i < matchChainX.length; i++) {
							this.gameGrid[matchChainX[i]][y].userData.alreadyMatchedX = true;
							blocksToBeDestroyed.push({ x: matchChainX[i], y: y });
						}
					}
					matchChainX = [];

					var matchChainY = [y];
					var yToTest = y + 1;
					if (yToTest === this.boardHeight) {
						continue; // No Y rollover!
					}

					while (yToTest !== y && this.gameGrid[x][yToTest] !== null && !this.gameGrid[x][yToTest].userData.locked && !this.gameGrid[x][yToTest].userData.alreadyMatchedY) {
						var _nextType = this.gameGrid[x][yToTest].userData.blockType;
						if (_nextType !== typeToMatch) {
							//no more matches!
							break;
						}
						matchChainY.push(yToTest);
						yToTest++;
						if (yToTest === this.boardHeight) {
							break; // No Y rollover!
						}
					}

					if (matchChainY.length >= 3) {
						this.stats.matches++;
						comboCount++;
						for (var _i = 0; _i < matchChainY.length; _i++) {
							this.gameGrid[x][matchChainY[_i]].userData.alreadyMatchedY = true;
							blocksToBeDestroyed.push({ x: x, y: matchChainY[_i] });
						}
					}
					matchChainY = [];
				}
			}

			if (comboCount > 1) {
				//console.log("x"+comboCount+"!");
			}

			if (blocksToBeDestroyed.length > 0) {
				this.stats.chainCount++;
				if (this.stats.chainCount > this.stats.highestChain) {
					this.stats.highestChain = this.stats.chainCount;
				}

				if (this.chainTimer !== null) {
					this.chainTimer.clear();
				}
				this.chainTimer = new PuzzleTimer(this.resetChain, this.dropDelay + 600, CAT_GAME, this); //setTimeout(this.resetChain.bind(this), this.dropDelay + 600);

				if (this.stats.chainCount > 1) {
					console.log('CHAIN ' + this.stats.chainCount);
				}
			}

			for (var d = 0; d < blocksToBeDestroyed.length; d++) {
				this.stats.score += comboCount * this.stats.chainCount;
				this.makeHarder();
				this.destroyBlock(blocksToBeDestroyed[d].x, blocksToBeDestroyed[d].y);
			}
		}
	}, {
		key: 'resetChain',
		value: function resetChain() {
			this.stats.chainCount = 0;
			this.chainTimer = null;
		}
	}, {
		key: 'swapBlocks',
		value: function swapBlocks(x, y, x2) {

			if (x2 === -1) {
				x2 = this.boardWidth - 1;
			}

			var block1 = this.gameGrid[x][y];
			var block2 = this.gameGrid[x2][y];

			if (block1 !== null && block1.userData.locked || block2 !== null && block2.userData.locked) {
				return;
			}

			var sThis = this;
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

			if (block1 !== null && block2 === null) {
				if (y - 1 >= 0 && this.gameGrid[x2][y - 1] === null) {
					this.lockBlocksStartingAtPoint(x2, y);
					this.animationQueue++;
					//setTimeout(this.dropBlocksStartingAtPoint.bind(this, x2, y), this.dropDelay);
					new PuzzleTimer(this.dropBlocksStartingAtPoint.bind(this, x2, y), this.dropDelay, CAT_GAME, this);
				}
				this.lockBlocksStartingAtPoint(x, y + 1);
				this.animationQueue++;
				//setTimeout(this.dropBlocksStartingAtPoint.bind(this, x, y + 1), this.dropDelay);
				new PuzzleTimer(this.dropBlocksStartingAtPoint.bind(this, x, y + 1), this.dropDelay, CAT_GAME, this);
			} else if (block2 !== null && block1 === null) {
				if (y - 1 >= 0 && this.gameGrid[x][y - 1] === null) {
					this.lockBlocksStartingAtPoint(x, y);
					this.animationQueue++;
					//setTimeout(this.dropBlocksStartingAtPoint.bind(this, x, y), this.dropDelay);
					new PuzzleTimer(this.dropBlocksStartingAtPoint.bind(this, x, y), this.dropDelay, CAT_GAME, this);
				}
				this.lockBlocksStartingAtPoint(x2, y + 1);
				this.animationQueue++;
				//setTimeout(this.dropBlocksStartingAtPoint.bind(this, x2, y + 1), this.dropDelay);
				new PuzzleTimer(this.dropBlocksStartingAtPoint.bind(this, x2, y + 1), this.dropDelay, CAT_GAME, this);
			}

			this.checkForMatches();

			//this.checkDropBlocks();
		}
	}, {
		key: 'destroyBlock',
		value: function destroyBlock(x, y) {
			if (this.gameGrid[x][y] === null || this.gameGrid[x][y].userData.locked) {
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

			//setTimeout(this.deleteBlock.bind(this, x, y), 750);
			new PuzzleTimer(this.deleteBlock.bind(this, x, y), 750, CAT_GAME, this);
		}
	}, {
		key: 'lockBlocksStartingAtPoint',
		value: function lockBlocksStartingAtPoint(x, y) {
			for (var i = y; i < this.boardHeight; i++) {
				if (this.gameGrid[x][i] !== null && !this.gameGrid[x][i].userData.exploding) {
					this.gameGrid[x][i].userData.locked = true;
					//Set texture to a debug "lock/dropping" texture.
					//this.gameGrid[x][i].material.map = this.lockTexture;
				} else {
					return;
				}
			}
		}
	}, {
		key: 'deleteBlock',
		value: function deleteBlock(x, y) {
			this.gameGrid[x][y].userData.exploding = false;
			this.gameBoard.remove(this.gameGrid[x][y]);
			this.gameGrid[x][y] = null;
			this.animationQueue--;

			this.lockBlocksStartingAtPoint(x, y + 1);
			this.animationQueue++;
			//setTimeout(this.dropBlocksStartingAtPoint.bind(this, x, y + 1), this.dropDelay);
			new PuzzleTimer(this.dropBlocksStartingAtPoint.bind(this, x, y + 1), this.dropDelay, CAT_GAME, this);
		}
	}, {
		key: 'dropBlocksStartingAtPoint',
		value: function dropBlocksStartingAtPoint(x, y) {
			var _this2 = this;

			this.animationQueue--;
			var stillGottaFall = true;
			for (var i = y; i < this.boardHeight; i++) {
				if (this.gameGrid[x][i] !== null && !this.gameGrid[x][i].userData.exploding) {
					var _ret = function () {
						//You moved a block under this block about to fall.
						if (_this2.gameGrid[x][i - 1] !== null) {
							_this2.gameGrid[x][i].userData.locked = false;
							//Set texture back to normal, non debug texture.
							//this.gameGrid[x][i].material.map = this.blockTextures[this.gameGrid[x][i].userData.blockType];
							stillGottaFall = false;
							return 'continue';
						}
						var sThis = _this2;
						_this2.animationQueue++;
						new TWEEN.Tween(_this2.gameGrid[x][i].position).to({ y: _this2.calcYBlockPos(i - 1) }, 200).easing(TWEEN.Easing.Bounce.Out).start().onComplete(function () {
							sThis.animationQueue--;
						});
						_this2.gameGrid[x][i - 1] = _this2.gameGrid[x][i];
						_this2.gameGrid[x][i] = null;
					}();

					if (_ret === 'continue') continue;
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
	}, {
		key: 'adjustSelector',
		value: function adjustSelector(direction) {
			switch (direction) {
				case 'up':
					this.selectorY++;
					break;
				case 'down':
					this.selectorY--;
					break;
				case 'left':
					if (this.mapType === MAP_3D) {
						this.selectorX++;
						if (this.selectorX >= this.boardWidth) {
							this.gameBoard.rotation.y = this.nextRow.rotation.y = this.circlePieceSize * -1 - HALF_PI - this.circlePieceSize / 2;
						}
					} else {
						this.selectorX--;
					}
					break;
				case 'right':
					if (this.mapType === MAP_3D) {
						this.selectorX--;
						if (this.selectorX < 0) {
							this.gameBoard.rotation.y = this.nextRow.rotation.y = this.circlePieceSize * this.boardWidth - HALF_PI - this.circlePieceSize / 2;
						}
					} else {
						this.selectorX++;
					}
					break;
			}
			if (this.selectorY >= this.boardHeight) {
				this.selectorY = this.boardHeight - 1;
			}
			if (this.selectorY < 0) {
				this.selectorY = 0;
			}

			if (this.mapType === MAP_3D) {
				if (this.selectorX >= this.boardWidth) {
					this.selectorX = 0;
				}

				if (this.selectorX < 0) {
					this.selectorX = this.boardWidth - 1;
				}

				this.focusCameraOnSelection();
			} else {
				if (this.selectorX >= this.boardWidth) {
					this.selectorX = this.boardWidth - 1;
				}

				if (this.selectorX < 1) {
					this.selectorX = 1;
				}

				this.updateCursorPos();
				this.gameBoard.rotation.y = 0;
				this.nextRow.rotation.y = 0;
			}
		}
	}, {
		key: 'focusCameraOnSelection',
		value: function focusCameraOnSelection() {
			var newAngle = this.circlePieceSize * this.selectorX - HALF_PI - this.circlePieceSize / 2;

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
	}, {
		key: 'calcYBlockPos',
		value: function calcYBlockPos(y) {
			return y * this.blockHeight + this.blockHeight / 2;
		}
	}, {
		key: 'calcXBlockPos',
		value: function calcXBlockPos(x) {
			if (this.mapType === MAP_2D) {
				return (x - this.boardWidth / 2) * this.blockWidth + this.blockWidth / 2;
			}
			return Math.cos(this.circlePieceSize * x) * this.boardRadius;
		}
	}, {
		key: 'calcZBlockPos',
		value: function calcZBlockPos(x) {
			if (this.mapType === MAP_2D) {
				return 0;
			}
			return Math.sin(this.circlePieceSize * x) * this.boardRadius;
		}
	}, {
		key: 'calcRBlockPos',
		value: function calcRBlockPos(x) {
			if (this.mapType === MAP_2D) {
				return 0;
			}
			return -this.circlePieceSize * x + HALF_PI;
		}

		/*
  loadMap(mapFile){
  	let sThis = this;
  	this.PuzzleGame.fileLoader.load('maps/' + mapFile + '.txt', function (map) {
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
  */

	}, {
		key: 'generateNextRow',
		value: function generateNextRow() {
			if (this.hasOwnProperty('nextRow')) {
				this.towerGroup.remove(this.nextRow);
			}

			var colorPool = [];
			var allColors = Object.keys(this.PuzzleGame.blockColors);
			for (var c = 0; c < allColors.length - this.handicap; c++) {
				colorPool.push(allColors[c]);
			}

			this.nextRow = new THREE.Object3D();
			var meshes = this.generateNextRowMeshArray(colorPool);
			for (var i in meshes) {
				this.nextRow.add(meshes[i]);
			}
			this.towerGroup.add(this.nextRow);
			this.updateNextRowPos();
			if (this.mapType === MAP_3D) {
				this.nextRow.rotation.y = this.circlePieceSize * this.selectorX - HALF_PI - this.circlePieceSize / 2;
			} else {
				this.nextRow.rotation.y = 0;
			}
			this.stats.rowsCreated++;
		}
	}, {
		key: 'generateNextRowMeshArray',
		value: function generateNextRowMeshArray(colorPoolIn) {
			var meshes = [];
			var geometry = new THREE.BoxGeometry(this.blockWidth, this.blockHeight, this.blockDepth);
			//let keys = Object.keys(this.blockTextures);

			//Preload the array with nulls
			for (var x1 = 0; x1 < this.boardWidth; x1++) {
				meshes[x1] = null;
			}

			for (var x = 0; x < this.boardWidth; x++) {

				var colorPool = colorPoolIn.slice(0);
				var lastXType = '';
				var lastYType = '';

				for (var i = -2; i <= 2; i++) {

					if (i === 0) {
						continue;
					}

					var nextXBlock = meshes[(x - i + this.boardWidth) % this.boardWidth];

					if (nextXBlock !== null) {
						var xType = nextXBlock.userData.blockType;
						var xPos = colorPool.indexOf(xType);
						if (xType === lastXType && xPos !== -1 && colorPool.length > 1) {
							colorPool.splice(xPos, 1);
						}
						lastXType = xType;
					}

					if (i < 0) {
						continue;
					}

					var nextYBlock = this.gameGrid[x][i - 1];
					if (nextYBlock !== null) {
						var yType = nextYBlock.userData.blockType;
						var yPos = colorPool.indexOf(yType);
						if (yType === lastYType && yPos !== -1 && colorPool.length > 1) {
							colorPool.splice(yPos, 1);
						}
						lastYType = yType;
					}
				}

				var blockType = colorPool[Math.floor(Math.random() * colorPool.length)];

				//let adjustedColor = new THREE.Color(this.blockColors[blockType]);
				//adjustedColor.add( new THREE.Color(0x505050));
				//let faceMaterial = new THREE.MeshBasicMaterial({color: adjustedColor,map:this.blockTextures[blockType]});
				//let sideMaterial = new THREE.MeshBasicMaterial({color: adjustedColor,map:this.blockSideTexture});
				//let topMaterial = new THREE.MeshBasicMaterial({color: adjustedColor,map:this.blockTopTexture});
				var material = this.PuzzleGame.nextRowBlockMaterials[blockType];
				/*new THREE.MultiMaterial([
     sideMaterial,   //right
     sideMaterial,   //left
     topMaterial,   //top
     topMaterial,   //bottom
     faceMaterial,   //back
     faceMaterial    //front
     ]);*/

				var mesh = new THREE.Mesh(geometry, material);
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
	}, {
		key: 'generateBlockMesh',
		value: function generateBlockMesh(blockType, x, y) {
			var geometry = new THREE.BoxGeometry(this.blockWidth, this.blockHeight, this.blockDepth);

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

			var mesh = new THREE.Mesh(geometry, this.PuzzleGame.blockMaterials[blockType]);
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
	}, {
		key: 'generateMap',
		value: function generateMap(colorPoolIn) {
			var grid = [];
			for (var gx = 0; gx < this.boardWidth; gx++) {
				var column = [];
				for (var gy = 0; gy < this.boardHeight; gy++) {
					column.push(null);
				}
				grid.push(column);
			}

			for (var x = 0; x < this.boardWidth; x++) {
				for (var y = 0; y < this.boardHeight; y++) {

					if (y >= this.startingHeight) {
						grid[x][y] = null;
						continue;
					}

					var colorPool = colorPoolIn.slice(0);
					var lastXType = '';
					var lastYType = '';

					for (var i = -2; i <= 2; i++) {
						if (i === 0) {
							continue;
						}

						var nextXBlock = grid[(x - i + this.boardWidth) % this.boardWidth][y];

						if (nextXBlock !== null) {
							var xType = nextXBlock;
							var xPos = colorPool.indexOf(xType);
							if (xType === lastXType && xPos !== -1 && colorPool.length > 1) {
								colorPool.splice(xPos, 1);
							}
							lastXType = xType;
						}
						var nextYBlock = grid[x][(y - i + this.boardHeight) % this.boardHeight];

						if (nextYBlock !== null) {
							var yType = nextYBlock;
							var yPos = colorPool.indexOf(yType);
							if (yType === lastYType && yPos !== -1 && colorPool.length > 1) {
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
	}, {
		key: 'cylinder',
		value: function cylinder() /*mapArray*/{
			var blocks = new THREE.Object3D();
			var colorPool = [];
			var allColors = Object.keys(this.PuzzleGame.blockColors);
			for (var i = 0; i < allColors.length - this.handicap; i++) {
				colorPool.push(allColors[i]);
			}

			var goodMap = this.generateMap(colorPool);

			for (var x = 0; x < this.boardWidth; x++) {
				var column = [];
				this.stackHeights[x] = this.boardHeight;
				for (var y = 0; y < this.boardHeight; y++) {

					//let invalidBlockTypes = array();

					var blockType = goodMap[x][y]; //colorPool[Math.floor(Math.random()*colorPool.length)];
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
					if (blockType === null) {
						column.push(null);
					} else {
						var mesh = this.generateBlockMesh(blockType, x, y);
						column.push(mesh);
						blocks.add(mesh);
					}
				}
				this.gameGrid.push(column);
			}
			return blocks;
		}
	}, {
		key: 'updateTowerPos',
		value: function updateTowerPos() {
			this.gameBoard.position.y = -this.halfBoardPixelHeight + this.upOffset;
			return this.gameBoard.position.y;
		}
	}, {
		key: 'updateCursorPos',
		value: function updateCursorPos() {
			this.cursorObj.position.y = this.calcYBlockPos(this.selectorY) - this.halfBoardPixelHeight + this.upOffset;

			if (this.cursorObj.position.y > this.halfBoardPixelHeight - this.blockHeight / 2) {
				this.cursorObj.position.y = this.halfBoardPixelHeight - this.blockHeight / 2;
			}

			if (this.mapType === MAP_2D) {
				this.cursorObj.position.x = this.calcXBlockPos(this.selectorX) - this.blockWidth / 2;
			} else {
				this.cursorObj.position.x = 0;
			}
		}
	}, {
		key: 'updateNextRowPos',
		value: function updateNextRowPos() {
			this.nextRow.position.y = this.calcYBlockPos(-1) - this.halfBoardPixelHeight - this.blockHeight / 2 + this.upOffset;
		}
	}, {
		key: 'gameAnimations',
		value: function gameAnimations() {
			//====================================================
			//====These animations are now LOCKED at 30 FPS!!!====
			//====================================================
			//TODO = CHANGE THESE TO USE THE TWEEN LIBRARY /W LOOPING ANIMATIONS - this would allow the client to choose the fps, while keeping the same visual timing, instead of just locking it at 30.

			//let timer = performance.now();

			//this.menuObj.rotation.y = Math.sin(this.PuzzleGame.piTimer) * (HALF_PI / 10);

			if (!this.gameActive || this.PuzzleGame.paused) {
				return;
			}

			var almostDead = {};
			for (var tx = 0; tx < this.boardWidth; tx++) {
				almostDead[tx] = this.gameGrid[tx][this.boardHeight - 3] !== null;
			}

			for (var x = 0; x < this.boardWidth; x++) {
				for (var y = 0; y < this.boardHeight; y++) {
					var block = this.gameGrid[x][y];
					if (block !== null && block.userData.exploding) {
						block.scale.x = block.scale.y = 0.1 * Math.sin(this.PuzzleGame.piTimer * 16) + 0.8;
					}

					if (block !== null) {
						if (almostDead[x]) {
							block.rotation.z = Math.cos(this.PuzzleGame.piTimer * 3) * PI / 32;
						} else {
							block.rotation.z = 0;
						}
					}
				}
			}

			for (var i = 0; i < this.nextRow.children.length; i++) {
				if (almostDead[i]) {
					this.nextRow.children[i].rotation.z = Math.cos(this.PuzzleGame.piTimer * 3) * PI / 32;
				} else {
					this.nextRow.children[i].rotation.z = 0;
				}
			}

			for (var c = 0; c < this.cursorObj.children.length; c++) {
				this.cursorObj.children[c].scale.x = this.cursorObj.children[c].scale.y = 0.05 * Math.sin(this.PuzzleGame.piTimer * 4) + 1;
			}
		}
	}]);

	return PuzzleTower;
}();