const MENU_TITLE = 4000;

class PuzzleMenu{

	/**
	 * @param {PuzzleGame} PuzzleGame
	 * */
	constructor(PuzzleGame){
		this.PuzzleGame = PuzzleGame;

		this.backgroundTween = null;

		this.MenuWrapDom = document.createElement( 'div' );
		this.MenuWrapDom.className = 'menuWrap';
		document.body.appendChild(this.MenuWrapDom);

		this.MenuWrapScreenshotDom = document.createElement( 'div' );
		this.MenuWrapScreenshotDom.className = 'menuWrapScreenshot';
		this.MenuWrapDom.appendChild(this.MenuWrapScreenshotDom);

		document.addEventListener('touchmove', function(e) {e.preventDefault();},{passive:false});

		this.MenuTitleDom = document.createElement( 'div' );
		this.MenuTitleDom.className = 'menuTitle';
		this.MenuTitleDom.innerHTML = 'Block Galaxy<span>(Working title) Build Date - '+ new Date(lastUpdateTime*1000).toLocaleString()+'</span>';

		this.MenuItemWrap = document.createElement( 'div' );
		this.MenuItemWrap.className = 'menuItemWrap';

		this.MenuWrapScreenshotDom.appendChild(this.MenuTitleDom);
		this.MenuWrapScreenshotDom.appendChild(this.MenuItemWrap);

		this.ScoreDom = document.createElement( 'div' );
		this.ScoreDom.className = 'score';
		document.body.appendChild(this.ScoreDom);

		//TODO: Perhaps allow for a dom object in the menu? Pass an ID or something?
		//TODO: Change number change events to a function call, so I can control the number changing... This menu is doing a bit too much.
		//TODO: Or perhaps do that for the "Custom" Selection?... Yeah. That outta work. (For words to ints, like easy, medium, hard)

		let p = null;

		this.backFn = function(){
			this.changeMenuAnimation(this.menuOptions,true);
		}.bind(this);

		this.menuOptions = {
			label:'"Not Your Average Puzzle Game"',
			color:{r:156,g:39,b:176},//['#1A237E','#3F51B5','#9FA8DA'],
			items: {
				twod: {
					label: '2D Mode',
					color:{r:183,g:28,b:28},//['#B71C1C','#F44336','#EF9A9A'],
					items:{
						start2d:{label:'Start 2D',action:this.PuzzleGame.startGame.bind(this.PuzzleGame, MAP_2D)},
						startHeight:{label:'Start Height '+this.PuzzleGame.gameSettings.startingHeight,type:'toggle',min:0,max:11,step:1},//,['numeric', 'startingHeight', this.PuzzleGame.tower, 1, 1, 12],
						difficulty:{label:'Difficulty'},// ['numeric', 'difficulty', this.PuzzleGame.tower, 1, 1, 5],
						back:{label:'Back',action:this.backFn}
					}
				},
				threed: {
					label: '3D Mode',
					color:{r:26,g:5,b:126},//['#311B92','#673AB7','#D1C4E9'],
					items:{
						start3d:{label:'Start 3D', action:this.PuzzleGame.startGame.bind(this.PuzzleGame, MAP_3D)},
						startHeight:{label:'Start Height'},//,['numeric', 'startingHeight', this.PuzzleGame.tower, 1, 1, 12],
						difficulty:{label:'Difficulty'},// ['numeric', 'difficulty', this.PuzzleGame.tower, 1, 1, 5],
						back:{label:'Back',action:this.backFn}
					}
				},
				howToPlay: {
					label:'How To Play',
					color:{r:191,g:54,b:12},//['#BF360C','#FF5722','#FFAB91'],
					items: {
						1:{label:'Arrow Keys - Move'},
						2:{label:'Space Bar - Swap'},
						3:{label:'X - Speed Up'},
						back:{label:'Back',action:this.backFn}
					}
				},
				settings: {
					label:'Settings',
					color:{r:0,g:150,b:136},//['#004D40','#009688','#80CBC4'],
					items: {
						aa:{label:'Anti Aliasing'},// ['bool', 'antiAlias', this.PuzzleGame.settings],
						tf:{label:'Texture Filtering'},//['bool', 'textureFiltering', this.PuzzleGame.settings],
						back:{label:'Back',action:this.backFn}
					}
				},
				credits:{
					label:'Credits',
					color:{r:62,g:39,b:35},//['#3E2723','#795548','#BCAAA4']
					items: {
						//'Temporary Credits': [],
						1:{label:'Programmed By:'},
						2:{label:'Jake Siegers',action:PuzzleUtils.openLink.bind(this, 'http://jakesiegers.com/')},
						3:{label:'Open Source Libraries'},
						4:{label:'three.js',action:PuzzleUtils.openLink.bind(this, 'https://threejs.org/')},
						5:{label:'tween.js', action:PuzzleUtils.openLink.bind(this, 'https://github.com/tweenjs/tween.js/')},
						6:{label:'Babel', action:PuzzleUtils.openLink.bind(this, 'https://babeljs.io/')},
						back:{label:'Back',action:this.backFn}
					}
				},
				build:{
					label:'Build: '+new Date(lastUpdateTime*1000).toLocaleString()
				}
			}
		};

		this.pauseMenuOptions = {
			label:'Pause',
			color:{r:62,g:39,b:35},
			items: {
				start2d: {label: 'Resume', action:this.PuzzleGame.tower.pauseGame.bind(this.PuzzleGame.tower)},
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
		this.currentSelection = -1;


		this.currentMenuOptions = this.menuOptions;
		this.currentColor = this.currentMenuOptions.color;

		this.renderCube();
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

	renderCube(){
		this.menuGroup = new THREE.Group();
		this.menuSpinGroup = new THREE.Group();
		this.PuzzleGame.scene.add(this.menuGroup);
		this.canvas = document.createElement('canvas');//document.getElementById('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.texture = new THREE.Texture(this.canvas);
		PuzzleUtils.sharpenTexture(this.PuzzleGame.renderer,this.texture, true);
		let mainSide = new THREE.MeshBasicMaterial({ map: this.texture });
		this.otherSides = new THREE.MeshBasicMaterial({color: 0x9C27B0, map: this.PuzzleGame.blankTexture});

		let material = [
			this.otherSides,   //right
			this.otherSides,   //left
			this.otherSides,   //top
			this.otherSides,   //bottom
			mainSide,		//front
			this.otherSides   	//back

		];

		let geometry = new THREE.BoxGeometry(300, 300, 100);
		let mesh = new THREE.Mesh( geometry, material );
		this.canvas.width = 256;
		this.canvas.height = 256;
		this.menuSpinGroup.add(mesh);
		this.menuSpinGroup.scale.x = this.menuSpinGroup.scale.y = this.menuSpinGroup.scale.z = 0;
		this.menuGroup.add(this.menuSpinGroup);
	}

	renderMenuText(){


		//Box Background
		this.ctx.fillStyle = 'black';//'#9C27B0';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = 'rgba('+this.currentColor.r+','+this.currentColor.g+','+this.currentColor.b+',0.25)';
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
		this.ctx.fillStyle = 'rgba('+this.currentColor.r+','+this.currentColor.g+','+this.currentColor.b+',0.5)';
		this.ctx.fillRect(0, 0, this.canvas.width, 26);
		this.ctx.fillRect(0, this.canvas.height-26, this.canvas.width, 26);
		this.ctx.fillRect(0, 0, 26,this.canvas.height);
		this.ctx.fillRect(this.canvas.width-26, 0, 26,this.canvas.height);


		//Box Corners
		this.ctx.fillStyle = 'rgb('+this.currentColor.r+','+this.currentColor.g+','+this.currentColor.b+')';
		this.ctx.fillRect(0, 0, 52, 26);
		this.ctx.fillRect(0, 26, 26, 26);
		this.ctx.fillRect(this.canvas.width-52, 0, 52, 26);
		this.ctx.fillRect(this.canvas.width-26, 26, 26, 26);
		this.ctx.fillRect(0, this.canvas.height-26, 52, 26);
		this.ctx.fillRect(0, this.canvas.height-52, 26, 26);
		this.ctx.fillRect(this.canvas.width-52, this.canvas.height-26, 52, 26);
		this.ctx.fillRect(this.canvas.width-26, this.canvas.height-52, 26, 26);

		//Debug Cursor
		//this.ctx.fillStyle = 'white';
		//this.ctx.fillRect(this.menuX-5,this.menuY-5,10,10);

		this.ctx.textAlign = "center";
		this.ctx.textBaseline="middle";

		if(this.currentMenuOptions.hasOwnProperty('label')){
			this.ctx.fillStyle = 'white';
			this.ctx.font = '10pt Arial';
			this.ctx.fillText(this.currentMenuOptions.label, this.canvas.width/2,40);
		}
		this.itemSpacingTop = 78;
		this.itemTextHeight = 20;
		let i = 0;
		for(let label in this.currentMenuOptions.items){
			let item = this.currentMenuOptions.items[label];
			if(this.currentSelection === label){
				this.ctx.fillStyle = 'rgba(255,255,255,1)';//'rgba('+this.currentColor.r+','+this.currentColor.g+','+this.currentColor.b+',0.8)';
				this.ctx.fillRect(26, (this.itemSpacingTop+(this.itemTextHeight*i))-this.itemTextHeight/2, this.canvas.width-52, this.itemTextHeight);
				this.ctx.fillStyle = 'rgb('+this.currentColor.r+','+this.currentColor.g+','+this.currentColor.b+')';
			}else{
				this.ctx.fillStyle = 'white';
			}
			let label = item.label;
			if(item.hasOwnProperty('action') || item.hasOwnProperty('items')){
				label = '[ '+label+' ]';
			}
			this.ctx.font = '12pt Arial';
			this.ctx.fillText(label, this.canvas.width/2,this.itemSpacingTop+(this.itemTextHeight*i));
			i++;
		}
		this.texture.needsUpdate = true;
	}

	mouseUp(){
		this.clickCurrentSelection();
	}

	clickCurrentSelection(){
		if(this.currentSelection !== -1 && !this.inAnimation){
			let item = this.currentMenuOptions.items[this.currentSelection];
			if(item.hasOwnProperty('items')){
				this.changeMenuAnimation(item);
			}else if(item.hasOwnProperty('action')){
				item.action();
			}
		}
	}

	changeMenuAnimation(newMenu,reverse){
		this.inAnimation = true;
		let direction = (reverse?"+"+TWO_PI:"-"+TWO_PI);
		new TWEEN.Tween(this.menuSpinGroup.rotation)
			.to({y:direction,x:0,z:0},500)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start()
			.onComplete(function(){
				this.inAnimation = false;
				this.updateMouseMenuPosition(this.PuzzleGame.mouseX,this.PuzzleGame.mouseY);
			}.bind(this));
		setTimeout(function(){
			this.changeMenu(newMenu);
		}.bind(this),200);
		new TWEEN.Tween(this.menuGroup.scale)
			.to({x:0.8,y:0.8,z:0.8},250)
			.easing(TWEEN.Easing.Back.Out)
			.yoyo(true)
			.repeat( 1 )
			.start();
	}

	changeMenu(newMenu){
		this.currentColor =newMenu.color;
		this.otherSides.color = new THREE.Color(this.currentColor.r/255,this.currentColor.g/255,this.currentColor.b/255);
		this.currentMenuOptions = newMenu;
		this.renderMenuText();
	}

	detectIfSelectionNeedsToChange(){
		let i = 0;
		let somethingSelected = false;
		for(let label in this.currentMenuOptions.items){
			if(this.menuY > this.itemSpacingTop+(this.itemTextHeight*(i))-this.itemTextHeight/2
				&& this.menuY < this.itemSpacingTop+(this.itemTextHeight*(i+1))-this.itemTextHeight/2
				&& (this.currentMenuOptions.items[label].hasOwnProperty('action') || this.currentMenuOptions.items[label].hasOwnProperty('items'))){
				this.currentSelection = label;
				this.renderMenuText();
				somethingSelected = true;
			}
			i++;
		}
		if(!somethingSelected){
			if(this.currentSelection !== -1) {
				this.currentSelection = -1;
				this.renderMenuText();
			}else{
				this.currentSelection = -1;
			}

		}
	}

	mouseMove( evt ) {
		evt.preventDefault();
		let rect = this.PuzzleGame.renderer.domElement.getBoundingClientRect();
		let xScale = ( evt.clientX- rect.left ) / rect.width;
		let yScale = ( evt.clientY - rect.top ) / rect.height;
		this.menuGroup.rotation.x = (PI/8)*yScale-(PI/16);
		this.menuGroup.rotation.y = (PI/8)*xScale-(PI/16);
		if(this.inAnimation){
			return;
		}
		this.updateMouseMenuPosition(evt.clientX, evt.clientY);
	}

	updateMouseMenuPosition(x,y){
		let rect = this.PuzzleGame.renderer.domElement.getBoundingClientRect();
		let xScale = ( x - rect.left ) / rect.width;
		let yScale = ( y - rect.top ) / rect.height;
		this.onClickPosition.fromArray([xScale,yScale]);
		let intersects = this.getIntersects( this.onClickPosition, this.menuSpinGroup.children );
		//Make sure you're pointing at the 4th face, or the canvas side.
		if ( intersects.length > 0 && intersects[ 0 ].uv && intersects[0].face.materialIndex === 4) {
			let uv = intersects[ 0 ].uv;
			intersects[ 0 ].object.material[4].map.transformUv( uv );
			this.menuX = uv.x*this.canvas.width;
			this.menuY = uv.y*this.canvas.height;
			this.detectIfSelectionNeedsToChange();
		}
	}

	getIntersects(point, objects ) {
		this.mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );
		this.raycaster.setFromCamera( this.mouse, this.PuzzleGame.camera );
		return this.raycaster.intersectObjects( objects );
	};

	keyPress(event){
		if(this.inAnimation === true){
			return;
		}

		switch (event.keyCode) {
			case PuzzleGame.KEY.ESCAPE:
				if(this.PuzzleGame.paused) {
					this.PuzzleGame.tower.pauseGame();
				}
				break;
			case PuzzleGame.KEY.SPACE:
				this.clickCurrentSelection();
				break;
			case PuzzleGame.KEY.UP:
				let previousSelection = null;
				for(let selection in this.currentMenuOptions.items){
					if(selection === this.currentSelection){
						break;
					}
					previousSelection = selection;
				}
				if(previousSelection === null){
					let selections = Object.keys(this.currentMenuOptions.items);
					previousSelection = selections[selections.length-1];
				}
				this.currentSelection = previousSelection;
				this.renderMenuText();
				break;
			case PuzzleGame.KEY.DOWN:
				let next = null;
				let nextIsNext = false;
				for(let selection in this.currentMenuOptions.items){
					if(nextIsNext){
						next = selection;
						break;
					}
					if(selection === this.currentSelection){
						nextIsNext = true;
					}
				}
				if(next === null){
					let selections = Object.keys(this.currentMenuOptions.items);
					next = selections[0];
				}
				this.currentSelection = next;
				this.renderMenuText();
				break;
			case PuzzleGame.KEY.LEFT:

				break;
			case PuzzleGame.KEY.RIGHT:

				break;
		}

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

	keyUp(event){
		//console.log('key up');
	}

	touchStart(event){
		this.updateMouseMenuPosition(event.touches[0].clientX, event.touches[0].clientY);
	}

	touchMove(event){
		this.updateMouseMenuPosition(event.touches[0].clientX, event.touches[0].clientY);
	}

	touchEnd(event){
		this.clickCurrentSelection();
	}

	showMenu(){
		if(this.inAnimation){
			return;
		}

		this.inAnimation = true;
		this.menuGroup.visible = true;
		new TWEEN.Tween(this.menuSpinGroup.rotation)
			.to({z:0},1000)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start();
		new TWEEN.Tween(this.menuSpinGroup.scale)
			.to({x:1,y:1,z:1},1000)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start()
			.onComplete(function(){
				this.inAnimation = false;
			}.bind(this));

	}

	hideMenu(){
		if(this.inAnimation){
			return;
		}

		this.inAnimation = true;
		new TWEEN.Tween(this.menuSpinGroup.rotation)
			.to({z:-PI},1000)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start();

		new TWEEN.Tween(this.menuSpinGroup.scale)
			.to({x:0,y:0,z:0},1000)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start()
			.onComplete(function(){
				this.inAnimation = false;
				this.menuGroup.visible = false;
			}.bind(this));

	}
}

