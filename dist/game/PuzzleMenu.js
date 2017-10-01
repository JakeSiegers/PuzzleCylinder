'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PuzzleMenu = function () {

	/**
  * @param {PuzzleGame} PuzzleGame
  * */
	function PuzzleMenu(PuzzleGame) {
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
			this.changeMenu('', true);
		}.bind(this);

		this.menuOptions = {
			'2D Mode': {
				'Start 2D': this.PuzzleGame.startGame.bind(this.PuzzleGame, MAP_2D),
				//'Start 2D VS AI':this.PuzzleGame.startGame.bind(this.PuzzleGame,MAP_2D),
				'Start Height': ['numeric', 'startingHeight', this.PuzzleGame.tower, 1, 1, 12],
				'Difficulty': ['numeric', 'difficulty', this.PuzzleGame.tower, 1, 1, 5],
				'< - Back': this.backFn
			},
			'3D Mode': {
				'Start 3D': this.PuzzleGame.startGame.bind(this.PuzzleGame, MAP_3D),
				'Start Height': ['numeric', 'startingHeight', this.PuzzleGame.tower, 1, 1, 12],
				'Difficulty': ['numeric', 'difficulty', this.PuzzleGame.tower, 1, 1, 5],
				'< - Back': this.backFn
			},
			'How to Play': {
				'Arrow Keys - Move': [],
				'Space Bar - Swap': [],
				'X - Speed Up': [],
				'< - Back': this.backFn
			},
			'Settings': {
				'Anti Aliasing': ['bool', 'antiAlias', this.PuzzleGame.settings],
				'Texture Filtering': ['bool', 'textureFiltering', this.PuzzleGame.settings],
				'< - Back': this.backFn
			},
			'Credits': {
				//'Temporary Credits': [],
				'Programmed By:': [],
				' --> Jake Siegers <-- ': PuzzleUtils.openLink.bind(this, 'http://jakesiegers.com/'),
				'Open Source Libraries': [],
				'three.js': PuzzleUtils.openLink.bind(this, 'https://threejs.org/'),
				'tween.js': PuzzleUtils.openLink.bind(this, 'https://github.com/tweenjs/tween.js/'),
				'Babel': PuzzleUtils.openLink.bind(this, 'https://babeljs.io/'),
				'html2canvas': PuzzleUtils.openLink.bind(this, 'http://html2canvas.hertzen.com/'),
				'< - Back': this.backFn
			} /*,
     'TIMER DEBUG': {
     'Timer Test Init': function () {
     	p = new PuzzleTimer(function () {
     		console.log('done!');
     	}, 1000, 'game', this);
     },
     'Timer Test Pause': function () {
     	p.pause();
     },
     'Timer Test Resume': function () {
     	p.resume();
     },
     'Timer Pause All Game': function () {
     	PuzzleTimer.pauseAllInCategory('game');
     },
     'Timer Resume All Game': function () {
     	PuzzleTimer.resumeAllInCategory('game');
     }
     }*/

		};

		//Colors - 900,500,200
		this.menuColors = {
			'': { r: 156, g: 39, b: 176 }, //['#1A237E','#3F51B5','#9FA8DA'],
			'2D Mode': { r: 183, g: 28, b: 28 }, //['#B71C1C','#F44336','#EF9A9A'],
			'3D Mode': { r: 26, g: 5, b: 126 }, //['#311B92','#673AB7','#D1C4E9'],
			'How to Play': { r: 191, g: 54, b: 12 }, //['#BF360C','#FF5722','#FFAB91'],
			'Settings': { r: 0, g: 150, b: 136 }, //['#004D40','#009688','#80CBC4'],
			'Credits': { r: 62, g: 39, b: 35 } //['#3E2723','#795548','#BCAAA4']
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
		this.currentSelection = -1;

		this.currentMenuOptions = this.menuOptions;
		this.currentColor = this.menuColors[''];

		this.renderCube();
		this.setMenuOptions();

		this.menuSpinGroup.rotation.y = PI;
		this.menuSpinGroup.rotation.z = -TWO_PI;

		this.menuGroup.rotation.x = -PI / 16;
		this.menuShimmyTweenX = new TWEEN.Tween(this.menuGroup.rotation).to({ x: PI / 16 }, 5000).easing(TWEEN.Easing.Quadratic.InOut).repeat(Infinity).yoyo(true).start();
		this.menuGroup.rotation.y = -PI / 16;
		this.menuShimmyTweenY = new TWEEN.Tween(this.menuGroup.rotation).to({ y: PI / 16 }, 4000).easing(TWEEN.Easing.Quadratic.InOut).repeat(Infinity).yoyo(true).start();
	}

	_createClass(PuzzleMenu, [{
		key: 'renderCube',
		value: function renderCube() {
			this.menuGroup = new THREE.Group();
			this.menuSpinGroup = new THREE.Group();
			this.PuzzleGame.scene.add(this.menuGroup);
			this.canvas = document.createElement('canvas'); //document.getElementById('canvas');
			this.ctx = this.canvas.getContext('2d');
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

			var geometry = new THREE.BoxGeometry(300, 300, 100);
			var mesh = new THREE.Mesh(geometry, material);
			this.canvas.width = 256;
			this.canvas.height = 256;
			this.menuSpinGroup.add(mesh);
			this.menuSpinGroup.scale.x = this.menuSpinGroup.scale.y = this.menuSpinGroup.scale.z = 0;
			this.menuGroup.add(this.menuSpinGroup);
		}
	}, {
		key: 'setMenuOptions',
		value: function setMenuOptions() {

			//this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.font = '12pt Roboto';
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

			this.ctx.fillStyle = 'rgba(' + this.currentColor.r + ',' + this.currentColor.g + ',' + this.currentColor.b + ',0.5)';
			this.ctx.fillRect(0, 0, this.canvas.width, 26);
			this.ctx.fillRect(0, this.canvas.height - 26, this.canvas.width, 26);
			this.ctx.fillRect(0, 0, 26, this.canvas.height);
			this.ctx.fillRect(this.canvas.width - 26, 0, 26, this.canvas.height);

			this.ctx.fillStyle = 'rgb(' + this.currentColor.r + ',' + this.currentColor.g + ',' + this.currentColor.b + ')';
			this.ctx.fillRect(0, 0, 52, 26);
			this.ctx.fillRect(0, 26, 26, 26);
			this.ctx.fillRect(this.canvas.width - 52, 0, 52, 26);
			this.ctx.fillRect(this.canvas.width - 26, 26, 26, 26);
			this.ctx.fillRect(0, this.canvas.height - 26, 52, 26);
			this.ctx.fillRect(0, this.canvas.height - 52, 26, 26);
			this.ctx.fillRect(this.canvas.width - 52, this.canvas.height - 26, 52, 26);
			this.ctx.fillRect(this.canvas.width - 26, this.canvas.height - 52, 26, 26);

			//this.ctx.fillStyle = 'white';
			//this.ctx.fillRect(this.menuX-5,this.menuY-5,10,10);


			this.ctx.textAlign = "center";

			var i = 0;
			for (var label in this.currentMenuOptions) {
				if (this.currentSelection === i) {
					this.ctx.fillStyle = 'rgb(' + this.currentColor.r + ',' + this.currentColor.g + ',' + this.currentColor.b + ')';
				} else {
					this.ctx.fillStyle = 'white';
				}
				this.ctx.fillText(label, this.canvas.width / 2, 50 + 20 * i);
				i++;
			}
			this.texture.needsUpdate = true;
		}
	}, {
		key: 'mouseUp',
		value: function mouseUp() {
			if (this.currentSelection !== -1 && !this.inAnimation) {

				var label = Object.keys(this.currentMenuOptions)[this.currentSelection];
				console.log(label);
				var menuAction = this.currentMenuOptions[label];
				if (typeof menuAction === "function") {
					//item.addEventListener('click',menuAction);
					menuAction.call();
				} else if (Array.isArray(menuAction)) {} else {
					this.changeMenu(label);
				}
			}
		}
	}, {
		key: 'changeMenu',
		value: function changeMenu(newMenu, reverse) {
			this.inAnimation = true;

			var direction = reverse ? "+" + TWO_PI : "-" + TWO_PI;

			new TWEEN.Tween(this.menuSpinGroup.rotation).to({ y: direction, x: 0, z: 0 }, 1000).easing(TWEEN.Easing.Back.Out).start().onComplete(function () {
				this.inAnimation = false;
			}.bind(this));
			setTimeout(function () {
				this.currentColor = this.menuColors[newMenu];
				this.otherSides.color = new THREE.Color(this.currentColor.r / 255, this.currentColor.g / 255, this.currentColor.b / 255);
				if (newMenu === '') {
					this.currentMenuOptions = this.menuOptions;
				} else {
					this.currentMenuOptions = this.menuOptions[newMenu];
				}
				this.setMenuOptions();
			}.bind(this), 200);
			new TWEEN.Tween(this.menuGroup.scale).to({ x: 0.8, y: 0.8, z: 0.8 }, 500).easing(TWEEN.Easing.Back.Out).yoyo(true).repeat(1).start();
		}
	}, {
		key: 'detectIfSelectionNeedsToChange',
		value: function detectIfSelectionNeedsToChange() {
			var i = 0;
			var somethingSelected = false;
			for (var label in this.currentMenuOptions) {
				if (this.menuY > 50 + 20 * (i - 1) && this.menuY < 50 + 20 * i) {
					this.currentSelection = i;
					this.setMenuOptions();
					somethingSelected = true;
				}
				i++;
			}
			if (!somethingSelected) {
				if (this.currentSelection !== -1) {
					this.currentSelection = -1;
					this.setMenuOptions();
				} else {
					this.currentSelection = -1;
				}
			}
		}
	}, {
		key: 'mouseMove',
		value: function mouseMove(evt) {
			evt.preventDefault();
			if (this.inAnimation) {
				return;
			}
			var array = this.getMousePosition(this.PuzzleGame.renderer.domElement, evt.clientX, evt.clientY);
			this.onClickPosition.fromArray(array);
			var intersects = this.getIntersects(this.onClickPosition, this.menuSpinGroup.children);
			//Make sure you're pointing at the 4th face, or the canvas side.
			if (intersects.length > 0 && intersects[0].uv && intersects[0].face.materialIndex === 4) {
				var uv = intersects[0].uv;
				intersects[0].object.material[4].map.transformUv(uv);
				this.menuX = uv.x * this.canvas.width;
				this.menuY = uv.y * this.canvas.height;
				this.detectIfSelectionNeedsToChange();
				//this.setMenuOptions();

			}
		}
	}, {
		key: 'getMousePosition',
		value: function getMousePosition(dom, x, y) {
			var rect = dom.getBoundingClientRect();
			//console.log(rect);
			return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
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


		/*
  showMenuWithTransition(){
  	this.transitionActive = true;
  	this.showMenu();
  	html2canvas(this.MenuWrapScreenshotDom, {
  		onrendered: function (canvas) {
  			let height = this.MenuWrapScreenshotDom.scrollHeight;
  			let width = this.MenuWrapScreenshotDom.scrollWidth;
  			this.animateToNewMenu(canvas,'imageCell','forward2',width,height,function(){
  				this.showMenu();
  				this.transitionActive = false;
  				this.setMenuIndex(0);
  			});
  		}.bind(this)
  	});
  	this.MenuWrapDom.style.opacity = "0";
  }
  
  hideMenuWithTransition(){
  	this.transitionActive = true;
  	html2canvas(this.MenuWrapScreenshotDom, {
  		onrendered: function (canvas) {
  			this.MenuWrapDom.style.opacity = "0";
  			let height = this.MenuWrapScreenshotDom.scrollHeight;
  			let width = this.MenuWrapScreenshotDom.scrollWidth;
  			this.animateToNewMenu(canvas,'imageCell','forward',width,height,function(){
  				this.hideMenu();
  				this.transitionActive = false;
  			});
  		}.bind(this)
  	});
  }
  
  setMenuWithTransition(parentObject,labelClicked,direction){
  	this.transitionActive = true;
  	html2canvas(this.MenuWrapScreenshotDom, {
  		onrendered: function(canvas) {
  			//document.body.appendChild(canvas);
  
  			let height = this.MenuWrapScreenshotDom.scrollHeight;
  			let width = this.MenuWrapScreenshotDom.scrollWidth;
  			this.animateToNewMenu(canvas,'imageCell',direction,width,height,function(){});
  
  			this.setMenu(parentObject,labelClicked);
  
  			let height2 = this.MenuWrapScreenshotDom.scrollHeight;
  			let width2 = this.MenuWrapScreenshotDom.scrollWidth;
  			html2canvas(this.MenuWrapScreenshotDom, {
  				onrendered: function (canvas) {
  					this.animateToNewMenu(canvas,'imageCell2',direction+'2',width2,height2,function(){
  						this.showMenu();
  						this.transitionActive = false;
  						this.setMenuIndex(0);
  					});
  				}.bind(this)
  			});
  
  			this.hideMenu();
  
  		}.bind(this)
  	});
  }
  */

		/*
  animateToNewMenu(canvas, cellCls, direction, width, height, endFn){
  
  	let dataUrl = canvas.toDataURL("image/png");
  	let tileWrap = document.createElement('div');
  	tileWrap.className = 'menuScreenshot';
  	tileWrap.style.width=width+'px';
  	tileWrap.style.height=height+'px';
  	let blockWidth = 80;
  	let blockHeight = 80;
  	let cellXNum = Math.ceil(width/blockWidth);
  	let cellYNum = Math.ceil(height/blockHeight);
  
  	let style = document.createElement('div');
  	style.innerHTML="<style>."+cellCls+"{background:url("+dataUrl+");perspective:150px;transition: all 0.3s;}</style>";
  	document.body.appendChild(style);
  
  	let flipDelay = 30;
  
  	for(let y=0;y<cellYNum;y++) {
  		for(let x=0;x<cellXNum;x++){
  			let cell = document.createElement('div');
  			cell.style.width = (width / cellXNum) + 'px';
  			cell.style.height = (height / cellYNum) + 'px';
  			cell.style.position = 'absolute';
  			cell.style.top = (height / cellYNum) * y+'px';
  			cell.style.left = (width / cellXNum) * x+'px';
  			cell.className = cellCls;
  			cell.style.backgroundPosition = '-' + (width / cellXNum) * x + 'px -' + (height / cellYNum) * y + 'px';
  			tileWrap.appendChild(cell);
  			switch(direction){
  				case 'forward':
  					setTimeout(function () {
  						//cell.style.transform = 'rotateY(90deg)';
  						cell.style.opacity = '0';
  					}, flipDelay * x + flipDelay * y);
  					break;
  				case 'forward2':
  					//cell.style.transform = 'rotateY(90deg)';
  					cell.style.opacity = '0';
  					setTimeout(function () {
  						//cell.style.transform = 'rotateY(0deg)';
  						cell.style.opacity = '1';
  					}, flipDelay * x + flipDelay * y);
  					break;
  				case 'back':
  					setTimeout(function () {
  						//cell.style.transform = 'rotateY(-90deg)';
  						cell.style.opacity = '0';
  					}, flipDelay * (cellXNum-x) + flipDelay * (cellYNum-y));
  					break;
  				case 'back2':
  					//cell.style.transform = 'rotateY(-90deg)';
  					cell.style.opacity = '0';
  					setTimeout(function () {
  						//cell.style.transform = 'rotateY(0deg)';
  						cell.style.opacity = '1';
  					}, flipDelay * (cellXNum-x) + flipDelay * (cellYNum-y));
  					break;
  			}
  		}
  	}
  
  	setTimeout(function(){
  		document.body.removeChild(tileWrap);
  		document.body.removeChild(style);
  		endFn.call(this)
  	}.bind(this),flipDelay*(cellXNum-1)+flipDelay*(cellYNum-1)+300);
  	document.body.appendChild(tileWrap);
  }
  */
		/*
  setMenu(parentObject,labelClicked){
  
  	while (this.MenuItemWrap.hasChildNodes()) {
  		this.MenuItemWrap.removeChild(this.MenuItemWrap.lastChild);
  	}
  
  	this.currentMenu = parentObject;
  
  	if(labelClicked !== ""){
  		this.currentMenu = this.currentMenu[labelClicked];
  		this.currentMenu['< Back'] = this.setMenuWithTransition.bind(this,parentObject,"","back");
  	}
  
  	this.currentMenuKeys = Object.keys(this.currentMenu);
  	this.currentMenuLength = this.currentMenuKeys.length;
  
  	this.menuOptionDoms = [];
  	let index = 0;
  
  	if(this.menuColors.hasOwnProperty(labelClicked)){
  		let colorCss = document.createElement('style');
  		let colors = this.menuColors[labelClicked];
  		colorCss.innerHTML = ".menuTitle{background:"+colors[0]+";} .menuItemWrap{background:"+colors[1]+";} .menuItem.selected{background:"+colors[2]+";color:"+colors[0]+";}";
  		this.MenuItemWrap.appendChild(colorCss);
  
  		let lastX = 0;
  		if(this.backgroundTween !== null){
  			this.backgroundTween.stop();
  		}
  		this.backgroundTween = new TWEEN.Tween(1).to(1,1000).onUpdate(function(x){
  			x*=10;
  			if(Math.floor(x)>lastX){
  				lastX = Math.floor(x);
  			}
  			this.PuzzleGame.background.material.color.lerp(new THREE.Color(colors[0]),0.1);
  		}.bind(this)).start();
  
  	}
  
  	for(let label in this.currentMenu){
  		let item = document.createElement( 'div' );
  		item.label = label;
  		item.innerHTML = label;
  		item.className = 'menuItem';
  
  		item.addEventListener('mouseover',this.setMenuIndex.bind(this,index));
  
  		let menuAction = this.currentMenu[label];
  		if (typeof menuAction === "function") {
  			item.addEventListener('click',menuAction);
  		}else if(Array.isArray(menuAction)){
  			switch(menuAction[0]){
  				case 'bool':
  					let boolName = menuAction[1];
  					let boolScope = menuAction[2];
  					item.innerHTML += ': '+(boolScope[boolName]?'ON':'OFF');
  					item.addEventListener('click',function(){
  						boolScope[boolName] = !boolScope[boolName];
  						item.innerHTML = item.label+': '+(boolScope[boolName]?'ON':'OFF');
  					});
  					break;
  				case 'numeric':
  					let numName = menuAction[1];
  					let numScope = menuAction[2];
  					let numStep = menuAction[3];
  					let numMin = menuAction[4];
  					let numMax = menuAction[5];
  					item.numValue = document.createElement( 'span' );
  					item.numValue.innerHTML = numScope[numName];
  					item.numValue.style.display = 'inline-block';
  					item.numValue.style.minWidth = '30px';
  					item.upBtn = document.createElement( 'span' );
  					item.upBtn.innerHTML = ' -> ';
  					item.upBtn.addEventListener('click',function() {
  						if(numScope[numName] < numMax) {
  							numScope[numName]+=numStep;
  							item.numValue.innerHTML = numScope[numName];
  						}
  					});
  					item.downBtn = document.createElement( 'span' );
  					item.downBtn.innerHTML = ' <- ';
  					item.downBtn.addEventListener('click',function() {
  						if(numScope[numName] > numMin) {
  							numScope[numName]-=numStep;
  							item.numValue.innerHTML = numScope[numName];
  						}
  					});
  					item.innerHTML = item.label;
  					item.appendChild(item.downBtn);
  					item.appendChild(item.numValue);
  					item.appendChild(item.upBtn);
  					break;
  			}
  		}else{
  			item.addEventListener('click',this.setMenuWithTransition.bind(this,this.currentMenu,label,'forward'));
  		}
  		this.menuOptionDoms.push(item);
  		this.MenuItemWrap.appendChild(item);
  		index++;
  	}
  }
  
  setMenuIndex(index){
  	if(this.transitionActive === true){
  		return;
  	}
  	if(this.menuIndex < this.currentMenuLength) {
  		PuzzleUtils.removeCls(this.menuOptionDoms[this.menuIndex], 'selected');
  	}
  	let adj = index%(this.currentMenuLength);
  	if(adj < 0){
  		this.menuIndex = this.currentMenuLength-adj-2;
  	}else{
  		this.menuIndex = adj;
  	}
  	PuzzleUtils.addCls(this.menuOptionDoms[this.menuIndex],'selected');
  }
  */

		value: function keyPress(event) {
			/*
   if(this.transitionActive === true){
   	return;
   }
   		switch(event.keyCode){
   	case KEY_UP:
   		this.setMenuIndex(this.menuIndex-1);
   		break;
   	case KEY_DOWN:
   		this.setMenuIndex(this.menuIndex+1);
   		break;
   	case KEY_RIGHT:
   		if(this.menuOptionDoms[this.menuIndex].hasOwnProperty('upBtn')){
   			this.menuOptionDoms[this.menuIndex].upBtn.click();
   		}
   		break;
   	case KEY_LEFT:
   		if(this.menuOptionDoms[this.menuIndex].hasOwnProperty('downBtn')){
   			this.menuOptionDoms[this.menuIndex].downBtn.click();
   		}
   		break;
   	case KEY_SPACE:
   		this.MenuItemWrap.getElementsByClassName("selected")[0].click();
   		break;
   		}
   */
		}
	}, {
		key: 'keyUp',
		value: function keyUp(event) {
			//console.log('key up');
		}
	}, {
		key: 'showMenu',
		value: function showMenu() {
			//this.MenuWrapDom.style.display = "inherit";
			//this.MenuWrapDom.style.opacity = "1";
			this.inAnimation = true;
			new TWEEN.Tween(this.menuSpinGroup.rotation).to({ y: 0, x: 0, z: 0 }, 2000).easing(TWEEN.Easing.Quadratic.Out).start();
			new TWEEN.Tween(this.menuSpinGroup.scale).to({ x: 1, y: 1, z: 1 }, 2000).easing(TWEEN.Easing.Quadratic.Out).start().onComplete(function () {
				this.inAnimation = false;
			}.bind(this));
		}
	}, {
		key: 'hideMenu',
		value: function hideMenu() {
			//this.MenuWrapDom.style.opacity = "0";
			//this.MenuWrapDom.style.display = "none";

			this.inAnimation = true;
			new TWEEN.Tween(this.menuSpinGroup.rotation).to({ y: PI, x: 0, z: -TWO_PI }, 2000).easing(TWEEN.Easing.Quadratic.Out).start();
			new TWEEN.Tween(this.menuGroup.position).to({ x: 0, y: 0, z: 1000 }, 2000).easing(TWEEN.Easing.Quadratic.Out).start().onComplete(function () {
				this.inAnimation = false;
			}.bind(this));
		}
	}]);

	return PuzzleMenu;
}();