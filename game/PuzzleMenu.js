class PuzzleMenu{

	/**
	 * @param {PuzzleGame} PuzzleGame
	 * */
	constructor(PuzzleGame){
		this.PuzzleGame = PuzzleGame;

		this.MenuWrapDom = document.createElement( 'div' );
		this.MenuWrapDom.className = 'menuWrap';
		document.body.appendChild(this.MenuWrapDom);

		console.log(1);
		document.addEventListener('touchmove', function(e) {e.preventDefault();console.log('nove')}, false);

		this.MenuTitleDom = document.createElement( 'div' );
		this.MenuTitleDom.className = 'menuTitle';
		this.MenuTitleDom.innerHTML = 'Block Galaxy<span>(Working title) Build Date - '+ new Date(lastUpdateTime*1000).toLocaleString()+'<br />YES THIS IS A UGLY MENU, I KNOW!</span>';

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
			'3dGame':'Start 3D Game',
			'2dGame':'Start 2D Game',
			'settings':'Settings',
			'credits':'Credits'
		};
		this.menuOptionKeys = Object.keys(this.menuOptions);
		this.menuOptionsLength = this.menuOptionKeys.length;

		this.menuOptionDoms = [];
		let index = 0;
		for(let i in this.menuOptions){
			let item = document.createElement( 'div' );
			item.innerHTML = this.menuOptions[i];
			item.className = 'menuItem';
			item.addEventListener('mouseover',this.setMenuIndex.bind(this,index));
			item.addEventListener('click',this.selectMenuItem.bind(this,i));
			this.menuOptionDoms.push(item);
			this.MenuItemWrap.appendChild(item);
			index++;
		}

		this.menuIndex = 0;
		this.setMenuIndex(this.menuIndex);
	}

	setMenuIndex(index){
		PuzzleUtils.removeCls(this.menuOptionDoms[this.menuIndex],'selected');
		let adj = index%(this.menuOptionsLength);
		if(adj < 0){
			this.menuIndex = this.menuOptionsLength-adj-2;
		}else{
			this.menuIndex = adj;
		}
		PuzzleUtils.addCls(this.menuOptionDoms[this.menuIndex],'selected');
	}

	keyPress(event){
		//console.log('key down');
		switch(event.keyCode){
			case KEY_UP:
				this.setMenuIndex(this.menuIndex-1);
				break;
			case KEY_DOWN:
				this.setMenuIndex(this.menuIndex+1);
				break;
			case KEY_SPACE:
				this.selectMenuItem(this.menuOptionKeys[this.menuIndex]);
				break;

		}
	}

	keyUp(event){
		//console.log('key up');
	}

	selectMenuItem(item){
		console.log(item);
		//switch(selectMenuItem)
		switch(item){
			case '3dGame':
				this.PuzzleGame.startGame();
				break;
		}
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

