'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PuzzleCSSLoader = function () {
	function PuzzleCSSLoader() {
		_classCallCheck(this, PuzzleCSSLoader);
	}

	_createClass(PuzzleCSSLoader, null, [{
		key: 'init',
		value: function init() {
			self.cssLoader = document.createElement('div');
			self.cssLoader.className = 'cssLoader';

			self.cssLoaderWrap = document.createElement('div');
			self.cssLoaderWrap.className = 'cssLoaderWrap';

			self.cssLoaderBox = document.createElement('div');
			self.cssLoaderBox.className = 'cssLoaderBox';

			self.cssLoaderText = document.createElement('div');
			self.cssLoaderText.className = 'cssLoaderText';
			self.cssLoaderText.innerHTML = "0";

			self.cssLoader.appendChild(self.cssLoaderWrap);
			self.cssLoaderWrap.appendChild(self.cssLoaderBox);
			self.cssLoaderWrap.appendChild(self.cssLoaderText);
			document.body.appendChild(self.cssLoader);
		}
	}, {
		key: 'setLoadPercent',
		value: function setLoadPercent(newPercent) {
			self.cssLoaderText.innerHTML = newPercent;
		}
	}, {
		key: 'showLoader',
		value: function showLoader() {
			PuzzleUtils.removeCls(self.cssLoader, 'hideLoaderDisplayNone');
			PuzzleUtils.removeCls(self.cssLoader, 'hideLoader');
		}
	}, {
		key: 'hideLoader',
		value: function hideLoader() {
			self.cssLoader.className += " hideLoader";
			setTimeout(function () {
				self.cssLoader.className += " hideLoaderDisplayNone";
			}, 200);
		}
	}]);

	return PuzzleCSSLoader;
}();

//this needs to be here so the spinner shows up first


PuzzleCSSLoader.init();