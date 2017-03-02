class PuzzleMenu{

	/**
	 * @param {PuzzleGame} PuzzleGame
	 * */
	constructor(PuzzleGame){
		this.PuzzleGame = PuzzleGame;

		this.MenuWrapDom = document.createElement( 'div' );
		this.MenuWrapDom.className = 'menuWrap';
		document.body.appendChild(this.MenuWrapDom);

		document.addEventListener('touchmove', function(e) {e.preventDefault();console.log('nove')},{passive:false});

		this.MenuTitleDom = document.createElement( 'div' );
		this.MenuTitleDom.className = 'menuTitle';
		this.MenuTitleDom.innerHTML = 'Block Galaxy<span>(Working title) Build Date - '+ new Date(lastUpdateTime*1000).toLocaleString()+'</span>';

		this.MenuItemWrap = document.createElement( 'div' );
		this.MenuItemWrap.className = 'menuItemWrap';


		this.MenuWrapDom.appendChild(this.MenuTitleDom);
		this.MenuWrapDom.appendChild(this.MenuItemWrap);

		this.ScoreDom = document.createElement( 'div' );
		this.ScoreDom.className = 'score';
		document.body.appendChild(this.ScoreDom);


		//document.onkeyup = PuzzleMenu.keypressed;
		//this.MenuWrapDom.addEventListener( 'touchstart', PuzzleMenu.keypressed, false );

		//this.firstTap = false;
		//console.log('init menu');

		this.menuOptions = {
			'3D Mode': {
				'Start 3D':this.PuzzleGame.startGame.bind(this.PuzzleGame),
				'Start Height': ['int', 'startingHeight', this.PuzzleGame.tower,1,12]
			},
			'2D Mode':{
				'Coming Soon...':[],
			},
			'Settings':{
				'Anti Aliasing': ['bool','antiAlias',this.PuzzleGame.settings],
				'Texture Filtering': ['bool','textureFiltering',this.PuzzleGame.settings],
			},
			'Credits':{
				'Temporary Credits':[],
				'Designed And Programmed By:':[],
				' --> Jake Siegers <-- ':PuzzleUtils.openLink.bind(this,'http://jakesiegers.com/'),
				'Open Source Libraries Used':[],
				'https://github.com/mrdoob/three.js/':PuzzleUtils.openLink.bind(this,'https://github.com/mrdoob/three.js/'),
				'https://github.com/tweenjs/tween.js/':PuzzleUtils.openLink.bind(this,'https://github.com/tweenjs/tween.js/'),
			}
		};

		this.setMenu(this.menuOptions,"");

	}

	setMenu(parentObject,labelClicked){

		//Maybe add a sweet animation????

		while (this.MenuItemWrap.hasChildNodes()) {
			this.MenuItemWrap.removeChild(this.MenuItemWrap.lastChild);
		}

		this.currentMenu = parentObject;

		if(labelClicked !== ""){
			this.currentMenu = this.currentMenu[labelClicked];
			this.currentMenu['< Back'] = this.setMenu.bind(this,parentObject,"");
		}

		this.currentMenuKeys = Object.keys(this.currentMenu);
		this.currentMenuLength = this.currentMenuKeys.length;

		this.menuOptionDoms = [];
		let index = 0;
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
					case 'int':
						let intName = menuAction[1];
						let intScope = menuAction[2];
						let intMin = menuAction[3];
						let intMax = menuAction[4];
						item.intValue = document.createElement( 'span' );
						item.intValue.innerHTML = intScope[intName];
						item.intValue.style.display = 'inline-block';
						item.intValue.style.minWidth = '30px';
						item.upBtn = document.createElement( 'span' );
						item.upBtn.innerHTML = ' -> ';
						item.upBtn.addEventListener('click',function() {
							if(intScope[intName] < intMax) {
								intScope[intName]++;
								item.intValue.innerHTML = intScope[intName];
							}
						});
						item.downBtn = document.createElement( 'span' );
						item.downBtn.innerHTML = ' <- ';
						item.downBtn.addEventListener('click',function() {
							if(intScope[intName] > intMin) {
								intScope[intName]--;
								item.intValue.innerHTML = intScope[intName];
							}
						});
						item.innerHTML = item.label;
						item.appendChild(item.downBtn);
						item.appendChild(item.intValue);
						item.appendChild(item.upBtn);
						break;
				}
			}else{
				item.addEventListener('click',this.setMenu.bind(this,this.currentMenu,label));
			}
			this.menuOptionDoms.push(item);
			this.MenuItemWrap.appendChild(item);
			index++;
		}

		this.menuIndex = 0;
		this.setMenuIndex(this.menuIndex);
	}


	setMenuIndex(index){
		PuzzleUtils.removeCls(this.menuOptionDoms[this.menuIndex],'selected');
		let adj = index%(this.currentMenuLength);
		if(adj < 0){
			this.menuIndex = this.currentMenuLength-adj-2;
		}else{
			this.menuIndex = adj;
		}
		PuzzleUtils.addCls(this.menuOptionDoms[this.menuIndex],'selected');
	}

	keyPress(event){
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

	selectMenuItem(item){
		console.log(item);
	}
/*
	keypressed(){
		if(!this.firstTap && PG.gameState == STATE_MENU){
			this.firstTap = true;
			console.log(arguments);
			PG.closeAndSetGameState(STATE_ENDLESS);
		}
	}
*/

	showMenu(){
		this.MenuWrapDom.style.display = "inherit";
		let sThis = this;
		setTimeout(function(){
			sThis.MenuWrapDom.style.opacity = "1";
		},10);
	}

	hideMenu(){
		this.MenuWrapDom.style.opacity = "0";
		let sThis = this;
		setTimeout(function(){
			sThis.MenuWrapDom.style.display = "none";
		},200);
	}

	showScore(){
		this.ScoreDom.style.display = "inherit";
		let sThis = this;
		setTimeout(function(){
			sThis.ScoreDom.style.opacity = "1";
		},10);
	}

	hideScore(){
		this.ScoreDom.style.opacity = "0";
		let sThis = this;
		setTimeout(function(){
			sThis.ScoreDom.style.display = "none";
		},200);
	}
}

