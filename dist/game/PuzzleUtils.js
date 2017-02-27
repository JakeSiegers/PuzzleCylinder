"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PuzzleUtils = function () {
	function PuzzleUtils() {
		_classCallCheck(this, PuzzleUtils);
	}

	_createClass(PuzzleUtils, null, [{
		key: "addCls",
		value: function addCls(el, clsToAdd) {
			if (el.className.trim() == '') {
				el.className += clsToAdd;
			} else {
				el.className += " " + clsToAdd;
			}
		}
	}, {
		key: "removeCls",
		value: function removeCls(el, clsToRemove) {
			var classes = el.className.split(" ");
			var newClasses = [];
			classes.forEach(function (cls) {
				if (cls !== clsToRemove) {
					newClasses.push(cls);
				}
			});
			el.className = newClasses.join(" ");
		}
	}, {
		key: "windowHeight",
		get: function get() {
			return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		}
	}, {
		key: "windowWidth",
		get: function get() {
			return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		}
	}]);

	return PuzzleUtils;
}();