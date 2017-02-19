"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var STATE_MENU = 0;
var STATE_ENDLESS = 1;
var STATE_SCORECARD = 2;

var PuzzleStateManager = function () {
	function PuzzleStateManager() {
		_classCallCheck(this, PuzzleStateManager);
	}

	_createClass(PuzzleStateManager, null, [{
		key: "setState",
		value: function setState(newState) {
			self.currentState = newState;
		}
	}]);

	return PuzzleStateManager;
}();