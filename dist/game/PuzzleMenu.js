'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PuzzleMenu = function () {
	function PuzzleMenu() {
		_classCallCheck(this, PuzzleMenu);
	}

	_createClass(PuzzleMenu, null, [{
		key: 'init',
		value: function init() {
			self.MainMenuDom = document.createElement('div');
			self.MainMenuDom.className = 'menu';

			self.MainMenuTitleDom = document.createElement('div');
			self.MainMenuTitleDom.className = 'menuTitle';
			self.MainMenuTitleDom.innerHTML = '[PLACEHOLDER MENU]<br />(Tap / Press Any Key To Begin)';

			self.MainMenuDom.appendChild(self.MainMenuTitleDom);

			document.onkeyup = PuzzleMenu.keypressed;
			self.MainMenuDom.addEventListener('touchstart', PuzzleMenu.keypressed, false);

			document.body.appendChild(self.MainMenuDom);

			self.ScoreDom = document.createElement('div');
			self.ScoreDom.className = 'score';

			document.body.appendChild(self.ScoreDom);

			self.firstTap = false;
		}
	}, {
		key: 'keypressed',
		value: function keypressed() {
			if (!self.firstTap && PG.gameState == STATE_MENU) {
				self.firstTap = true;
				console.log(arguments);
				PG.closeAndSetGameState(STATE_ENDLESS);
			}
		}
	}, {
		key: 'showMenu',
		value: function showMenu() {
			self.MainMenuDom.style.display = "inherit";
			setTimeout(function () {
				self.MainMenuDom.style.opacity = "1";
			}, 10);
		}
	}, {
		key: 'hideMenu',
		value: function hideMenu() {
			self.MainMenuDom.style.opacity = "0";
			setTimeout(function () {
				self.MainMenuDom.style.display = "none";
			}, 1000);
		}
	}, {
		key: 'showScore',
		value: function showScore() {
			self.ScoreDom.style.display = "inherit";
			setTimeout(function () {
				self.ScoreDom.style.opacity = "1";
			}, 10);
		}
	}, {
		key: 'hideScore',
		value: function hideScore() {
			self.ScoreDom.style.opacity = "0";
			setTimeout(function () {
				self.ScoreDom.style.display = "none";
			}, 1000);
		}
	}, {
		key: 'ScoreDom',
		get: function get() {
			return self.ScoreDom;
		}
	}]);

	return PuzzleMenu;
}();