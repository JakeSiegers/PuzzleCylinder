class PuzzleMenu{

	/**
	 * @param {PuzzleGame} PuzzleGame
	 * */
	constructor(PuzzleGame){
		this.PuzzleGame = PuzzleGame;

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

		this.menuOptions = {
			'3D Mode': {
				'Start 3D':this.PuzzleGame.startGame.bind(this.PuzzleGame,MAP_3D),
				'Start Height': ['numeric', 'startingHeight', this.PuzzleGame.tower,1,1,12],
				'Difficulty': ['numeric', 'difficulty', this.PuzzleGame.tower,1,1,5]
			},
			'2D Mode':{
				'Start 2D 1P':this.PuzzleGame.startGame.bind(this.PuzzleGame,MAP_2D),
				'Start 2D VS AI':this.PuzzleGame.startGame.bind(this.PuzzleGame,MAP_2D),
				'Start Height': ['numeric', 'startingHeight', this.PuzzleGame.tower,1,1,12],
				'Difficulty': ['numeric', 'difficulty', this.PuzzleGame.tower,1,1,5]
			},
			'How to Play':{
				'Arrow Keys - Move': [],
				'Space Bar - Swap': [],
				'X - Speed Up': []
			},
			'Settings':{
				'Anti Aliasing': ['bool','antiAlias',this.PuzzleGame.settings],
				'Texture Filtering': ['bool','textureFiltering',this.PuzzleGame.settings]
			},
			'Credits':{
				'Temporary Credits':[],
				'Designed And Programmed By:':[],
				' --> Jake Siegers <-- ':PuzzleUtils.openLink.bind(this,'http://jakesiegers.com/'),
				'Open Source Libraries Used':[],
				'three.js':PuzzleUtils.openLink.bind(this,'https://threejs.org/'),
				'tween.js':PuzzleUtils.openLink.bind(this,'https://github.com/tweenjs/tween.js/'),
				'Babel':PuzzleUtils.openLink.bind(this,'https://babeljs.io/'),
				'html2canvas':PuzzleUtils.openLink.bind(this,'http://html2canvas.hertzen.com/'),
			}
		};

		//Colors - 900,500,200
		this.menuColors = {
			'':['#1A237E','#3F51B5','#9FA8DA'],
			'3D Mode':['#B71C1C','#F44336','#EF9A9A'],
			'2D Mode':['#BF360C','#FF5722','#FFAB91'],
			'How to Play':['#311B92','#673AB7','#D1C4E9'],
			'Settings':['#004D40','#009688','#80CBC4'],
			'Credits':['#3E2723','#795548','#BCAAA4']
		};

		this.menuIndex = 0;
		this.setMenu(this.menuOptions,"");
	}

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

	keyPress(event){

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
	}

	keyUp(event){
		//console.log('key up');
	}

	showMenu(){
		this.MenuWrapDom.style.display = "inherit";
		this.MenuWrapDom.style.opacity = "1";
	}

	hideMenu(){
		this.MenuWrapDom.style.opacity = "0";
		this.MenuWrapDom.style.display = "none";
	}
}

