'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MENU_TITLE = 4000;

var PuzzleMenu = function () {

	/**
  * @param {PuzzleGame} PuzzleGame
  * */
	function PuzzleMenu(PuzzleGame) {
		var _this = this;

		_classCallCheck(this, PuzzleMenu);

		this.PuzzleGame = PuzzleGame;

		this.backgroundTween = null;

		this.MenuWrapDom = document.createElement('div');
		this.MenuWrapDom.className = 'menuWrap';
		document.body.appendChild(this.MenuWrapDom);

		this.MenuWrapScreenshotDom = document.createElement('div');
		this.MenuWrapScreenshotDom.className = 'menuWrapScreenshot';
		this.MenuWrapDom.appendChild(this.MenuWrapScreenshotDom);

		document.addEventListener('touchmove', function (e) {
			e.preventDefault();
		}, { passive: false });

		this.MenuTitleDom = document.createElement('div');
		this.MenuTitleDom.className = 'menuTitle';
		this.MenuTitleDom.innerHTML = 'Block Galaxy<span>(Working title) Build Date - ' + new Date(lastUpdateTime * 1000).toLocaleString() + '</span>';

		this.MenuItemWrap = document.createElement('div');
		this.MenuItemWrap.className = 'menuItemWrap';

		this.MenuWrapScreenshotDom.appendChild(this.MenuTitleDom);
		this.MenuWrapScreenshotDom.appendChild(this.MenuItemWrap);

		this.ScoreDom = document.createElement('div');
		this.ScoreDom.className = 'score';
		document.body.appendChild(this.ScoreDom);

		//TODO: Perhaps allow for a dom object in the menu? Pass an ID or something?
		//TODO: Change number change events to a function call, so I can control the number changing... This menu is doing a bit too much.
		//TODO: Or perhaps do that for the "Custom" Selection?... Yeah. That outta work. (For words to ints, like easy, medium, hard)

		var p = null;

		this.backFn = function () {
			this.changeMenuAnimation(this.menuOptions, true);
		}.bind(this);

		this.menuOptions = {
			label: '"Not Your Average Puzzle Game"',
			color: { r: 156, g: 39, b: 176 }, //['#1A237E','#3F51B5','#9FA8DA'],
			items: {
				twod: {
					label: '2D Mode',
					color: { r: 183, g: 28, b: 28 }, //['#B71C1C','#F44336','#EF9A9A'],
					items: {
						start2d: { label: 'Start 2D', action: this.PuzzleGame.startGame.bind(this.PuzzleGame, MAP_2D) },
						startHeight: { label: function () {
								return 'Start Height ' + this.PuzzleGame.gameSettings.startingHeight;
							}.bind(this), type: 'number', valueScope: this.PuzzleGame.gameSettings, valueKey: 'startingHeight', min: 0, max: 12, step: 1 },
						difficulty: { label: function () {
								return 'Difficulty ' + this.PuzzleGame.gameSettings.difficulty;
							}.bind(this), type: 'number', valueScope: this.PuzzleGame.gameSettings, valueKey: 'difficulty', min: 1, max: 5, step: 1 },
						back: { label: 'Back', action: this.backFn }
					}
				},
				threed: {
					label: '3D Mode',
					color: { r: 26, g: 5, b: 126 }, //['#311B92','#673AB7','#D1C4E9'],
					items: {
						start3d: { label: 'Start 3D', action: this.PuzzleGame.startGame.bind(this.PuzzleGame, MAP_3D) },
						startHeight: { label: function () {
								return 'Start Height ' + this.PuzzleGame.gameSettings.startingHeight;
							}.bind(this), type: 'number', valueScope: this.PuzzleGame.gameSettings, valueKey: 'startingHeight', min: 0, max: 12, step: 1 },
						difficulty: { label: function () {
								return 'Difficulty ' + this.PuzzleGame.gameSettings.difficulty;
							}.bind(this), type: 'number', valueScope: this.PuzzleGame.gameSettings, valueKey: 'difficulty', min: 1, max: 5, step: 1 },
						back: { label: 'Back', action: this.backFn }
					}
				},
				howToPlay: {
					label: 'How To Play',
					color: { r: 191, g: 54, b: 12 }, //['#BF360C','#FF5722','#FFAB91'],
					items: {
						1: { label: 'Arrow Keys - Move' },
						2: { label: 'Space Bar - Swap' },
						3: { label: 'X - Speed Up' },
						back: { label: 'Back', action: this.backFn }
					}
				},
				settings: {
					label: 'Settings',
					color: { r: 0, g: 150, b: 136 }, //['#004D40','#009688','#80CBC4'],
					items: {
						lol: { label: '(These have no effect yet)' },
						aa: { label: 'Anti Aliasing', type: 'toggle', value: this.PuzzleGame.settings.antiAlias }, // ['bool', 'antiAlias', this.PuzzleGame.settings],
						tf: { label: 'Texture Filtering', type: 'toggle', value: this.PuzzleGame.settings.textureFiltering }, //['bool', 'textureFiltering', this.PuzzleGame.settings],
						back: { label: 'Back', action: this.backFn }
					}
				},
				credits: {
					label: 'Credits',
					color: { r: 62, g: 39, b: 35 }, //['#3E2723','#795548','#BCAAA4']
					items: {
						//'Temporary Credits': [],
						1: { label: 'Programmed By:' },
						2: { label: 'Jake Siegers', action: PuzzleUtils.openLink.bind(this, 'http://jakesiegers.com/') },
						3: { label: 'Open Source Libraries' },
						4: { label: 'three.js', action: PuzzleUtils.openLink.bind(this, 'https://threejs.org/') },
						5: { label: 'tween.js', action: PuzzleUtils.openLink.bind(this, 'https://github.com/tweenjs/tween.js/') },
						6: { label: 'Babel', action: PuzzleUtils.openLink.bind(this, 'https://babeljs.io/') },
						back: { label: 'Back', action: this.backFn }
					}
				},
				build: {
					label: 'Build: ' + new Date(lastUpdateTime * 1000).toLocaleString()
				}
			}
		};

		this.pauseMenuOptions = {
			label: 'Pause',
			items: {
				resume: { label: 'Resume', action: this.PuzzleGame.tower.pauseGame.bind(this.PuzzleGame.tower) },
				restart: { label: 'Restart', action: function action() {
						if (_this.PuzzleGame.tower.mapType === MAP_3D) {
							_this.PuzzleGame.startGame(MAP_3D);
						} else {
							_this.PuzzleGame.startGame(MAP_2D);
						}
					} }
			}
		};

		this.endingScreen = {
			label: 'Game Over',
			render: function render(ctx) {
				_this.ctx.fillStyle = 'rgb(' + _this.currentColor.r + ',' + _this.currentColor.g + ',' + _this.currentColor.b + ')';
				ctx.textAlign = "right";
				ctx.textBaseline = "middle";
				ctx.fillText('Score: ', _this.canvas.width / 2, 120);
				ctx.fillText('Matches: ', _this.canvas.width / 2, 150);
				ctx.fillText('Rows Created: ', _this.canvas.width / 2, 180);
				ctx.fillText('Longest Chain: ', _this.canvas.width / 2, 210);
				ctx.fillText('Difficulty: ', _this.canvas.width / 2, 240);

				_this.ctx.fillStyle = 'white';
				ctx.textAlign = "left";
				ctx.fillText(_this.PuzzleGame.tower.stats.score, _this.canvas.width / 2, 120);
				ctx.fillText(_this.PuzzleGame.tower.stats.matches, _this.canvas.width / 2, 150);
				ctx.fillText(_this.PuzzleGame.tower.stats.rowsCreated, _this.canvas.width / 2, 180);
				ctx.fillText(_this.PuzzleGame.tower.stats.highestChain, _this.canvas.width / 2, 210);
				ctx.fillText(_this.PuzzleGame.DIFFICULTIES()[_this.PuzzleGame.tower.difficulty], _this.canvas.width / 2, 240);
			},
			itemSpacingTop: 300,
			items: {
				restart: { label: 'Restart', action: function action() {
						if (_this.PuzzleGame.tower.mapType === MAP_3D) {
							_this.PuzzleGame.startGame(MAP_3D);
						} else {
							_this.PuzzleGame.startGame(MAP_2D);
						}
					} },
				quit: { label: 'Quit', action: this.backFn }
			}
		};

		//this.menuIndex = 0;
		//this.setMenu(this.menuOptions,"");


		//this.PuzzleGame.renderer.domElement.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
		//this.PuzzleGame.renderer.domElement.addEventListener( 'mouseup', this.clickedMenu.bind(this), false );
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		this.onClickPosition = new THREE.Vector2();
		this.menuX = 0;
		this.menuY = 0;

		this.renderCube();
		this.changeMenu(this.menuOptions);
		this.renderMenuText();

		this.menuSpinGroup.rotation.z = -PI;

		/*
  this.menuGroup.rotation.x = -PI/16;
  this.menuShimmyTweenX = new TWEEN.Tween(this.menuGroup.rotation)
  	.to({x:PI/16},5000)
  	.easing(TWEEN.Easing.Quadratic.InOut)
  	.repeat(Infinity)
  	.yoyo(true)
  	.start();
  this.menuGroup.rotation.y = -PI/16;
  this.menuShimmyTweenY = new TWEEN.Tween(this.menuGroup.rotation)
  	.to({y:PI/16},4000)
  	.easing(TWEEN.Easing.Quadratic.InOut)
  	.repeat(Infinity)
  	.yoyo(true)
  	.start();
  */
	}

	_createClass(PuzzleMenu, [{
		key: 'renderCube',
		value: function renderCube() {
			this.menuGroup = new THREE.Group();
			this.menuSpinGroup = new THREE.Group();
			this.PuzzleGame.scene.add(this.menuGroup);
			this.canvas = document.createElement('canvas'); //document.getElementById('canvas');
			this.ctx = this.canvas.getContext('2d');
			this.ctx.imageSmoothingEnabled = true;
			//this.ctx.imageSmoothingQuality = 'high';

			//console.log(this.ctx.imageSmoothingEnabled);
			//console.log(this.ctx.imageSmoothingQuality);

			this.texture = new THREE.Texture(this.canvas);
			PuzzleUtils.sharpenTexture(this.PuzzleGame.renderer, this.texture, true);
			var mainSide = new THREE.MeshBasicMaterial({ map: this.texture });
			this.otherSides = new THREE.MeshBasicMaterial({ color: 0x9C27B0, map: this.PuzzleGame.blankTexture });

			var material = [this.otherSides, //right
			this.otherSides, //left
			this.otherSides, //top
			this.otherSides, //bottom
			mainSide, //front
			this.otherSides //back

			];

			var geometry = new THREE.BoxGeometry(200, 200, 66);
			var mesh = new THREE.Mesh(geometry, material);
			this.canvas.width = 512;
			this.canvas.height = 512;
			this.menuSpinGroup.add(mesh);
			this.menuSpinGroup.scale.x = this.menuSpinGroup.scale.y = this.menuSpinGroup.scale.z = 0;
			this.menuGroup.add(this.menuSpinGroup);
			this.menuGroup.position.z = 200;
		}
	}, {
		key: 'renderMenuText',
		value: function renderMenuText(debug) {

			//Box Background
			this.ctx.fillStyle = 'black'; //'#9C27B0';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.fillStyle = 'rgba(' + this.currentColor.r + ',' + this.currentColor.g + ',' + this.currentColor.b + ',0.25)';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

			//When using stroke on the canvas textures, the game will slowly lag over time.
			//Perhaps a bug with three js?
			//this.ctx.strokeStyle= 'rgba(156,39,176,0.5)';
			//this.ctx.lineWidth="26";
			//this.ctx.rect(13,13,this.canvas.width-26,this.canvas.height-26);
			//this.ctx.stroke();

			//this.ctx.fillStyle = 'rgba(255,255,255,0.2)';//'rgba('+this.currentColor.r+','+this.currentColor.g+','+this.currentColor.b+',0.8)';
			//this.ctx.fillRect(52, 52, this.canvas.width-104, 26);

			//Box Sides
			this.ctx.fillStyle = 'rgba(' + this.currentColor.r + ',' + this.currentColor.g + ',' + this.currentColor.b + ',0.5)';
			this.ctx.fillRect(0, 0, this.canvas.width, 26);
			this.ctx.fillRect(0, this.canvas.height - 26, this.canvas.width, 26);
			this.ctx.fillRect(0, 0, 26, this.canvas.height);
			this.ctx.fillRect(this.canvas.width - 26, 0, 26, this.canvas.height);

			//Box Corners
			this.ctx.fillStyle = 'rgb(' + this.currentColor.r + ',' + this.currentColor.g + ',' + this.currentColor.b + ')';
			this.ctx.fillRect(0, 0, 52, 26);
			this.ctx.fillRect(0, 26, 26, 26);
			this.ctx.fillRect(this.canvas.width - 52, 0, 52, 26);
			this.ctx.fillRect(this.canvas.width - 26, 26, 26, 26);
			this.ctx.fillRect(0, this.canvas.height - 26, 52, 26);
			this.ctx.fillRect(0, this.canvas.height - 52, 26, 26);
			this.ctx.fillRect(this.canvas.width - 52, this.canvas.height - 26, 52, 26);
			this.ctx.fillRect(this.canvas.width - 26, this.canvas.height - 52, 26, 26);

			//Debug Cursor
			//this.ctx.fillStyle = 'white';
			//this.ctx.fillRect(this.menuX-5,this.menuY-5,10,10);


			this.itemSpacingTop = 156;
			if (this.currentMenuOptions.hasOwnProperty('itemSpacingTop')) {
				this.itemSpacingTop = this.currentMenuOptions.itemSpacingTop;
			}
			this.itemTextHeight = 40;

			if (this.currentMenuOptions.hasOwnProperty('render')) {
				this.currentMenuOptions.render.call(this, this.ctx);
			}

			this.ctx.textAlign = "center";
			this.ctx.textBaseline = "middle";

			if (this.currentMenuOptions.hasOwnProperty('label')) {
				this.ctx.fillStyle = 'white';
				this.ctx.font = '20pt Arial';
				this.ctx.fillText(this.currentMenuOptions.label, this.canvas.width / 2, 80);
			}

			var i = 0;

			for (var key in this.currentMenuOptions.items) {
				var item = this.currentMenuOptions.items[key];
				var color = 'white';

				if (this.currentSelection === key) {
					this.ctx.fillStyle = 'rgba(255,255,255,1)'; //'rgba('+this.currentColor.r+','+this.currentColor.g+','+this.currentColor.b+',0.8)';
					this.ctx.fillRect(26, this.itemSpacingTop + this.itemTextHeight * i - this.itemTextHeight / 2, this.canvas.width - 52, this.itemTextHeight);
					color = 'rgb(' + this.currentColor.r + ',' + this.currentColor.g + ',' + this.currentColor.b + ')';
				}
				this.ctx.fillStyle = color;
				this.ctx.strokeStyle = color;
				var label = '';
				if (PuzzleUtils.isFunction(item.label)) {
					label = item.label.call(this);
				} else {
					label = item.label;
				}
				if (item.hasOwnProperty('action') || item.hasOwnProperty('items')) {
					label = '[ ' + label + ' ]';
				} else if (item.hasOwnProperty('type')) {
					switch (item.type) {
						case 'toggle':
							this.drawTick(412, this.itemSpacingTop + this.itemTextHeight * i, item.value);
							break;
						case 'number':
							this.drawTriangle(100, this.itemSpacingTop + this.itemTextHeight * i, false);
							this.drawTriangle(412, this.itemSpacingTop + this.itemTextHeight * i, true);
							break;
					}
				}
				this.ctx.font = '24pt Arial';
				this.ctx.fillText(label, this.canvas.width / 2, this.itemSpacingTop + this.itemTextHeight * i);
				i++;
			}
			this.texture.needsUpdate = true;
		}
	}, {
		key: 'drawTriangle',
		value: function drawTriangle(x, y, right) {
			//let previousFillStyle = this.ctx.fillStyle;
			//this.ctx.fillStyle = 'white';
			this.ctx.beginPath();
			this.ctx.moveTo(x, y - 10);
			this.ctx.lineTo(x, y + 10);
			if (right) {
				this.ctx.lineTo(x + 20, y);
			} else {
				this.ctx.lineTo(x - 20, y);
			}
			this.ctx.fill();
			//this.ctx.fillStyle = previousFillStyle;
		}
	}, {
		key: 'drawTick',
		value: function drawTick(x, y, active) {
			if (active) {
				this.ctx.beginPath();
				this.ctx.moveTo(x - 10, y - 5);
				this.ctx.lineTo(x, y + 5);
				this.ctx.lineTo(x + 20, y - 15);
				this.ctx.lineWidth = 5;
				this.ctx.stroke();
			}

			this.ctx.beginPath();
			this.ctx.moveTo(x - 10, y - 10);
			this.ctx.lineTo(x + 10, y - 10);
			this.ctx.lineTo(x + 10, y + 10);
			this.ctx.lineTo(x - 10, y + 10);
			this.ctx.lineTo(x - 10, y - 10);
			this.ctx.lineWidth = 3;
			this.ctx.stroke();
		}
	}, {
		key: 'mouseUp',
		value: function mouseUp() {
			this.clickCurrentSelection();
		}
	}, {
		key: 'clickCurrentSelection',
		value: function clickCurrentSelection() {
			if (this.currentSelection !== null && !this.inAnimation) {
				var item = this.currentMenuOptions.items[this.currentSelection];
				this.currentMenuOptions.lastSelected = this.currentSelection;
				//console.log(this.currentSelection,this.menuOptions.lastSelected);
				if (item.hasOwnProperty('items')) {
					this.changeMenuAnimation(item);
				} else if (item.hasOwnProperty('action')) {
					item.action();
				} else if (item.hasOwnProperty('type')) {
					switch (item.type) {
						case 'toggle':
							item.value = !item.value;
							break;
						case 'number':
							if (!this.PuzzleGame.usingKeyboard) {
								if (this.menuX < this.canvas.width / 2) {
									this.decrementNumberValue(item);
								} else {
									this.incrementNumberValue(item);
								}
							}
							break;
					}
					this.renderMenuText();
				}
			}
		}
	}, {
		key: 'incrementNumberValue',
		value: function incrementNumberValue(item) {
			item.valueScope[item.valueKey] += item.step;
			if (item.valueScope[item.valueKey] > item.max) {
				item.valueScope[item.valueKey] = item.max;
			}
			this.renderMenuText();
		}
	}, {
		key: 'decrementNumberValue',
		value: function decrementNumberValue(item) {
			item.valueScope[item.valueKey] -= item.step;
			if (item.valueScope[item.valueKey] < item.min) {
				item.valueScope[item.valueKey] = item.min;
			}
			this.renderMenuText();
		}
	}, {
		key: 'changeMenuAnimation',
		value: function changeMenuAnimation(newMenu, reverse) {
			this.inAnimation = true;
			var direction = reverse ? "+" + TWO_PI : "-" + TWO_PI;
			new TWEEN.Tween(this.menuSpinGroup.rotation).to({ y: direction, x: 0, z: 0 }, 500).easing(TWEEN.Easing.Exponential.InOut).start().onComplete(function () {
				this.inAnimation = false;
				this.updateMouseMenuPosition(this.PuzzleGame.mouseX, this.PuzzleGame.mouseY);
			}.bind(this));
			setTimeout(function () {
				this.changeMenu(newMenu);
			}.bind(this), 200);
			new TWEEN.Tween(this.menuGroup.scale).to({ x: 0.8, y: 0.8, z: 0.8 }, 250).easing(TWEEN.Easing.Back.Out).yoyo(true).repeat(1).start();

			new TWEEN.Tween(this.PuzzleGame.background.material.color).to({
				r: newMenu.color.r / 255,
				g: newMenu.color.g / 255,
				b: newMenu.color.b / 255
			}, 500).easing(TWEEN.Easing.Exponential.InOut).start();
		}
	}, {
		key: 'changeMenu',
		value: function changeMenu(newMenu) {
			if (newMenu.hasOwnProperty('color')) {
				this.currentColor = newMenu.color;
			}
			this.otherSides.color = new THREE.Color(this.currentColor.r / 255, this.currentColor.g / 255, this.currentColor.b / 255);
			this.currentMenuOptions = newMenu;
			if (newMenu.hasOwnProperty('lastSelected')) {
				this.currentSelection = newMenu.lastSelected;
			} else if (newMenu.hasOwnProperty('items')) {
				this.selectFirstTop();
			}
			this.renderMenuText();
		}
	}, {
		key: 'detectIfSelectionNeedsToChange',
		value: function detectIfSelectionNeedsToChange() {
			var i = 0;
			var somethingSelected = false;
			for (var label in this.currentMenuOptions.items) {

				var currentItem = this.currentMenuOptions.items[label];

				if (this.menuY > this.itemSpacingTop + this.itemTextHeight * i - this.itemTextHeight / 2 && this.menuY < this.itemSpacingTop + this.itemTextHeight * (i + 1) - this.itemTextHeight / 2 && this.isSelectable(currentItem)) {
					this.currentSelection = label;
					this.renderMenuText();
					somethingSelected = true;
				}
				i++;
			}
			if (!somethingSelected) {
				if (this.currentSelection !== null) {
					this.currentSelection = null;
					this.renderMenuText();
				} else {
					this.currentSelection = null;
				}
			}
		}
	}, {
		key: 'isSelectable',
		value: function isSelectable(item) {
			return item.hasOwnProperty('action') || item.hasOwnProperty('items') || item.hasOwnProperty('type');
		}
	}, {
		key: 'selectFirstTop',
		value: function selectFirstTop() {
			for (var selection in this.currentMenuOptions.items) {
				if (this.isSelectable(this.currentMenuOptions.items[selection])) {
					this.currentSelection = selection;
					this.renderMenuText(true);
					break;
				}
			}
		}
	}, {
		key: 'selectFirstBot',
		value: function selectFirstBot() {
			for (var selection in this.currentMenuOptions.items) {
				if (this.isSelectable(this.currentMenuOptions.items[selection])) {
					this.currentSelection = selection;
				}
			}
			this.renderMenuText();
		}
	}, {
		key: 'selectNext',
		value: function selectNext() {
			if (this.currentSelection === null) {
				this.selectFirstTop();
				return;
			}

			var next = false;
			var nextSelection = null;
			for (var selection in this.currentMenuOptions.items) {
				if (!this.isSelectable(this.currentMenuOptions.items[selection])) {
					continue;
				}
				if (next) {
					nextSelection = selection;
					break;
				}
				if (this.currentSelection === selection) {
					next = true;
				}
			}
			if (nextSelection === null) {
				this.selectFirstTop();
				return;
			}
			this.currentSelection = nextSelection;
			this.renderMenuText();
		}
	}, {
		key: 'selectPrevious',
		value: function selectPrevious() {
			if (this.currentSelection === null) {
				this.selectFirstBot();
				return;
			}

			var previousSelection = null;
			for (var selection in this.currentMenuOptions.items) {
				if (!this.isSelectable(this.currentMenuOptions.items[selection])) {
					continue;
				}
				if (this.currentSelection === selection) {
					break;
				}
				previousSelection = selection;
			}
			if (previousSelection === null) {
				this.selectFirstBot();
				return;
			}
			this.currentSelection = previousSelection;
			this.renderMenuText();
		}
	}, {
		key: 'mouseMove',
		value: function mouseMove(evt) {
			evt.preventDefault();
			var rect = this.PuzzleGame.renderer.domElement.getBoundingClientRect();
			var xScale = (evt.clientX - rect.left) / rect.width;
			var yScale = (evt.clientY - rect.top) / rect.height;
			this.menuGroup.rotation.x = PI / 8 * yScale - PI / 16;
			this.menuGroup.rotation.y = PI / 8 * xScale - PI / 16;
			if (this.inAnimation) {
				return;
			}
			this.updateMouseMenuPosition(evt.clientX, evt.clientY);
		}
	}, {
		key: 'updateMouseMenuPosition',
		value: function updateMouseMenuPosition(x, y) {
			var rect = this.PuzzleGame.renderer.domElement.getBoundingClientRect();
			var xScale = (x - rect.left) / rect.width;
			var yScale = (y - rect.top) / rect.height;
			this.onClickPosition.fromArray([xScale, yScale]);
			var intersects = this.getIntersects(this.onClickPosition, this.menuSpinGroup.children);
			//Make sure you're pointing at the 4th face, or the canvas side.
			if (intersects.length > 0 && intersects[0].uv && intersects[0].face.materialIndex === 4) {
				var uv = intersects[0].uv;
				intersects[0].object.material[4].map.transformUv(uv);
				this.menuX = uv.x * this.canvas.width;
				this.menuY = uv.y * this.canvas.height;
				this.detectIfSelectionNeedsToChange();
			}
		}
	}, {
		key: 'getIntersects',
		value: function getIntersects(point, objects) {
			this.mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
			this.raycaster.setFromCamera(this.mouse, this.PuzzleGame.camera);
			return this.raycaster.intersectObjects(objects);
		}
	}, {
		key: 'keyPress',
		value: function keyPress(event) {
			if (this.inAnimation === true) {
				return;
			}

			var item = {};
			if (this.currentSelection !== null) {
				item = this.currentMenuOptions.items[this.currentSelection];
			}

			this.menuGroup.rotation.x = this.menuGroup.rotation.y = 0;

			switch (event.keyCode) {
				case PuzzleGame.KEY.ESCAPE:
					if (this.PuzzleGame.paused) {
						this.PuzzleGame.tower.pauseGame();
					}
					break;
				case PuzzleGame.KEY.SPACE:
				case PuzzleGame.KEY.ENTER:
					this.clickCurrentSelection();
					break;
				case PuzzleGame.KEY.UP:
					this.selectPrevious();
					break;
				case PuzzleGame.KEY.DOWN:
					this.selectNext();
					break;
				case PuzzleGame.KEY.LEFT:
					if (item.hasOwnProperty('type') && item.type === 'number') {
						this.decrementNumberValue(item);
					}
					break;
				case PuzzleGame.KEY.RIGHT:
					if (item.hasOwnProperty('type') && item.type === 'number') {
						this.incrementNumberValue(item);
					}
					break;
			}
		}
	}, {
		key: 'keyUp',
		value: function keyUp(event) {
			//console.log('key up');
		}
	}, {
		key: 'touchStart',
		value: function touchStart(event) {
			this.updateMouseMenuPosition(event.touches[0].clientX, event.touches[0].clientY);
		}
	}, {
		key: 'touchMove',
		value: function touchMove(event) {
			this.updateMouseMenuPosition(event.touches[0].clientX, event.touches[0].clientY);
		}
	}, {
		key: 'touchEnd',
		value: function touchEnd(event) {
			this.clickCurrentSelection();
		}
	}, {
		key: 'showMenu',
		value: function showMenu() {
			if (this.inAnimation) {
				return;
			}

			this.inAnimation = true;
			this.menuGroup.visible = true;
			new TWEEN.Tween(this.menuSpinGroup.rotation).to({ z: 0 }, 1000).easing(TWEEN.Easing.Exponential.InOut).start();
			new TWEEN.Tween(this.menuSpinGroup.scale).to({ x: 1, y: 1, z: 1 }, 1000).easing(TWEEN.Easing.Exponential.InOut).start().onComplete(function () {
				this.inAnimation = false;
			}.bind(this));
		}
	}, {
		key: 'hideMenu',
		value: function hideMenu() {
			if (this.inAnimation) {
				return;
			}

			this.inAnimation = true;
			new TWEEN.Tween(this.menuSpinGroup.rotation).to({ z: -PI }, 500).easing(TWEEN.Easing.Back.In).start();

			new TWEEN.Tween(this.menuSpinGroup.scale).to({ x: 0, y: 0, z: 0 }, 500).easing(TWEEN.Easing.Back.In).start().onComplete(function () {
				this.inAnimation = false;
				this.menuGroup.visible = false;
			}.bind(this));
		}
	}]);

	return PuzzleMenu;
}();