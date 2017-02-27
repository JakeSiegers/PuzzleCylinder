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

		this.MenuWrapDom = document.createElement('div');
		this.MenuWrapDom.className = 'menuWrap';
		document.body.appendChild(this.MenuWrapDom);

		this.MenuTitleDom = document.createElement('div');
		this.MenuTitleDom.className = 'menuTitle';
		this.MenuTitleDom.innerHTML = 'Block Galaxy<span>(Working title) Build Date - ' + new Date(lastUpdateTime * 1000).toLocaleString() + '<br />YES THIS IS A UGLY MENU, I KNOW!</span>';

		this.MenuItemWrap = document.createElement('div');
		this.MenuItemWrap.className = 'menuItemWrap';

		this.MenuWrapDom.appendChild(this.MenuTitleDom);
		this.MenuWrapDom.appendChild(this.MenuItemWrap);

		this.ScoreDom = document.createElement('div');
		this.ScoreDom.className = 'score';
		document.body.appendChild(this.ScoreDom);

		//document.onkeyup = PuzzleMenu.keypressed;
		//this.MenuWrapDom.addEventListener( 'touchstart', PuzzleMenu.keypressed, false );

		//this.firstTap = false;
		//console.log('init menu');

		this.menuOptions = {
			'3dGame': 'Start 3D Game',
			'2dGame': 'Start 2D Game',
			'settings': 'Settings',
			'credits': 'Credits'
		};
		this.menuOptionKeys = Object.keys(this.menuOptions);
		this.menuOptionsLength = this.menuOptionKeys.length;

		this.menuOptionDoms = [];
		var index = 0;
		for (var i in this.menuOptions) {
			var item = document.createElement('div');
			item.innerHTML = this.menuOptions[i];
			item.className = 'menuItem';
			item.addEventListener('mouseover', this.setMenuIndex.bind(this, index));
			item.addEventListener('click', this.selectMenuItem.bind(this, i));
			this.menuOptionDoms.push(item);
			this.MenuItemWrap.appendChild(item);
			index++;
		}

		this.menuIndex = 0;
		this.setMenuIndex(this.menuIndex);
	}

	_createClass(PuzzleMenu, [{
		key: 'setMenuIndex',
		value: function setMenuIndex(index) {
			PuzzleUtils.removeCls(this.menuOptionDoms[this.menuIndex], 'selected');
			var adj = index % this.menuOptionsLength;
			if (adj < 0) {
				this.menuIndex = this.menuOptionsLength - adj - 2;
			} else {
				this.menuIndex = adj;
			}
			PuzzleUtils.addCls(this.menuOptionDoms[this.menuIndex], 'selected');
		}
	}, {
		key: 'keyPress',
		value: function keyPress(event) {
			//console.log('key down');
			switch (event.keyCode) {
				case KEY_UP:
					this.setMenuIndex(this.menuIndex - 1);
					break;
				case KEY_DOWN:
					this.setMenuIndex(this.menuIndex + 1);
					break;
				case KEY_SPACE:
					this.selectMenuItem(this.menuOptionKeys[this.menuIndex]);
					break;

			}
		}
	}, {
		key: 'keyUp',
		value: function keyUp(event) {
			//console.log('key up');
		}
	}, {
		key: 'selectMenuItem',
		value: function selectMenuItem(item) {
			console.log(item);
			//switch(selectMenuItem)
			switch (item) {
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

	}, {
		key: 'showMenu',
		value: function showMenu() {
			this.MenuWrapDom.style.display = "inherit";
			var sThis = this;
			setTimeout(function () {
				sThis.MenuWrapDom.style.opacity = "1";
			}, 10);
		}
	}, {
		key: 'hideMenu',
		value: function hideMenu() {
			this.MenuWrapDom.style.opacity = "0";
			var sThis = this;
			setTimeout(function () {
				sThis.MenuWrapDom.style.display = "none";
			}, 200);
		}
	}, {
		key: 'showScore',
		value: function showScore() {
			this.ScoreDom.style.display = "inherit";
			var sThis = this;
			setTimeout(function () {
				sThis.ScoreDom.style.opacity = "1";
			}, 10);
		}
	}, {
		key: 'hideScore',
		value: function hideScore() {
			this.ScoreDom.style.opacity = "0";
			var sThis = this;
			setTimeout(function () {
				sThis.ScoreDom.style.display = "none";
			}, 200);
		}
	}]);

	return PuzzleMenu;
}();