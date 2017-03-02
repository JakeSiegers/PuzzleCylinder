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

		document.addEventListener('touchmove', function (e) {
			e.preventDefault();console.log('nove');
		}, { passive: false });

		this.MenuTitleDom = document.createElement('div');
		this.MenuTitleDom.className = 'menuTitle';
		this.MenuTitleDom.innerHTML = 'Block Galaxy<span>(Working title) Build Date - ' + new Date(lastUpdateTime * 1000).toLocaleString() + '</span>';

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
			'3D Mode': {
				'Start 3D': this.PuzzleGame.startGame.bind(this.PuzzleGame),
				'Start Height': ['int', 'startingHeight', this.PuzzleGame.tower, 1, 12]
			},
			'2D Mode': {
				'Coming Soon...': []
			},
			'Settings': {
				'Anti Aliasing': ['bool', 'antiAlias', this.PuzzleGame.settings],
				'Texture Filtering': ['bool', 'textureFiltering', this.PuzzleGame.settings]
			},
			'Credits': {
				'Temporary Credits': [],
				'Designed And Programmed By:': [],
				' --> Jake Siegers <-- ': PuzzleUtils.openLink.bind(this, 'http://jakesiegers.com/'),
				'Open Source Libraries Used': [],
				'https://github.com/mrdoob/three.js/': PuzzleUtils.openLink.bind(this, 'https://github.com/mrdoob/three.js/'),
				'https://github.com/tweenjs/tween.js/': PuzzleUtils.openLink.bind(this, 'https://github.com/tweenjs/tween.js/')
			}
		};

		this.setMenu(this.menuOptions, "");
	}

	_createClass(PuzzleMenu, [{
		key: 'setMenu',
		value: function setMenu(parentObject, labelClicked) {
			var _this = this;

			//Maybe add a sweet animation????

			while (this.MenuItemWrap.hasChildNodes()) {
				this.MenuItemWrap.removeChild(this.MenuItemWrap.lastChild);
			}

			this.currentMenu = parentObject;

			if (labelClicked !== "") {
				this.currentMenu = this.currentMenu[labelClicked];
				this.currentMenu['< Back'] = this.setMenu.bind(this, parentObject, "");
			}

			this.currentMenuKeys = Object.keys(this.currentMenu);
			this.currentMenuLength = this.currentMenuKeys.length;

			this.menuOptionDoms = [];
			var index = 0;

			var _loop = function _loop(label) {
				var item = document.createElement('div');
				item.label = label;
				item.innerHTML = label;
				item.className = 'menuItem';

				item.addEventListener('mouseover', _this.setMenuIndex.bind(_this, index));

				var menuAction = _this.currentMenu[label];
				if (typeof menuAction === "function") {
					item.addEventListener('click', menuAction);
				} else if (Array.isArray(menuAction)) {
					switch (menuAction[0]) {
						case 'bool':
							var boolName = menuAction[1];
							var boolScope = menuAction[2];
							item.innerHTML += ': ' + (boolScope[boolName] ? 'ON' : 'OFF');
							item.addEventListener('click', function () {
								boolScope[boolName] = !boolScope[boolName];
								item.innerHTML = item.label + ': ' + (boolScope[boolName] ? 'ON' : 'OFF');
							});
							break;
						case 'int':
							var intName = menuAction[1];
							var intScope = menuAction[2];
							var intMin = menuAction[3];
							var intMax = menuAction[4];
							item.intValue = document.createElement('span');
							item.intValue.innerHTML = intScope[intName];
							item.intValue.style.display = 'inline-block';
							item.intValue.style.minWidth = '30px';
							item.upBtn = document.createElement('span');
							item.upBtn.innerHTML = ' -> ';
							item.upBtn.addEventListener('click', function () {
								if (intScope[intName] < intMax) {
									intScope[intName]++;
									item.intValue.innerHTML = intScope[intName];
								}
							});
							item.downBtn = document.createElement('span');
							item.downBtn.innerHTML = ' <- ';
							item.downBtn.addEventListener('click', function () {
								if (intScope[intName] > intMin) {
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
				} else {
					item.addEventListener('click', _this.setMenu.bind(_this, _this.currentMenu, label));
				}
				_this.menuOptionDoms.push(item);
				_this.MenuItemWrap.appendChild(item);
				index++;
			};

			for (var label in this.currentMenu) {
				_loop(label);
			}

			this.menuIndex = 0;
			this.setMenuIndex(this.menuIndex);
		}
	}, {
		key: 'setMenuIndex',
		value: function setMenuIndex(index) {
			PuzzleUtils.removeCls(this.menuOptionDoms[this.menuIndex], 'selected');
			var adj = index % this.currentMenuLength;
			if (adj < 0) {
				this.menuIndex = this.currentMenuLength - adj - 2;
			} else {
				this.menuIndex = adj;
			}
			PuzzleUtils.addCls(this.menuOptionDoms[this.menuIndex], 'selected');
		}
	}, {
		key: 'keyPress',
		value: function keyPress(event) {
			switch (event.keyCode) {
				case KEY_UP:
					this.setMenuIndex(this.menuIndex - 1);
					break;
				case KEY_DOWN:
					this.setMenuIndex(this.menuIndex + 1);
					break;
				case KEY_RIGHT:
					if (this.menuOptionDoms[this.menuIndex].hasOwnProperty('upBtn')) {
						this.menuOptionDoms[this.menuIndex].upBtn.click();
					}
					break;
				case KEY_LEFT:
					if (this.menuOptionDoms[this.menuIndex].hasOwnProperty('downBtn')) {
						this.menuOptionDoms[this.menuIndex].downBtn.click();
					}
					break;
				case KEY_SPACE:
					this.MenuItemWrap.getElementsByClassName("selected")[0].click();
					break;

			}
		}
	}, {
		key: 'keyUp',
		value: function keyUp(event) {
			//console.log('key up');
		}
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