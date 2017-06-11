'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PuzzleTimer = function () {
	function PuzzleTimer(callback, delay, category, scope) {
		_classCallCheck(this, PuzzleTimer);

		if (!PuzzleTimer.timers) {
			PuzzleTimer.timers = {};
		}
		this.callback = callback;
		this.delay = delay;
		this.scope = scope;
		this.category = category;
		this.remainingTime = this.delay;
		this.paused = true;
		this.completed = false;
		this.timerId = null;
		//console.trace();
		this.resume();
	}

	_createClass(PuzzleTimer, [{
		key: 'resume',
		value: function resume() {
			if (this.completed) {
				console.error('Timer (' + this.timerId + ') already ended!');
				return;
			}
			if (!this.paused) {
				console.error('Timer (' + this.timerId + ') is already running!');
				return;
			}
			this.paused = false;
			if (this.timerId !== null) {
				delete PuzzleTimer.timers[this.category][this.timerId];
			}
			this.startTime = new Date();
			this.timerId = setTimeout(this.end.bind(this), this.remainingTime);
			if (!PuzzleTimer.timers.hasOwnProperty(this.category)) {
				PuzzleTimer.timers[this.category] = {};
			}
			PuzzleTimer.timers[this.category][this.timerId] = this;
		}
	}, {
		key: 'pause',
		value: function pause() {
			if (this.completed) {
				console.error('Timer (' + this.timerId + ') already ended!');
				return;
			}
			if (this.paused) {
				console.error('Timer (' + this.timerId + ') is already paused!');
				return;
			}
			this.paused = true;
			clearTimeout(this.timerId);
			this.remainingTime = this.delay - (new Date() - this.startTime);
		}
	}, {
		key: 'end',
		value: function end() {
			if (this.completed) {
				console.error('Timer (' + this.timerId + ') already ended!');
				return;
			}
			this.completed = true;
			clearTimeout(this.timerId);
			if (this.callback) {
				this.callback.call(this.scope);
			}
			delete PuzzleTimer.timers[this.category][this.timerId];
		}
	}, {
		key: 'clear',
		value: function clear() {
			if (this.completed) {
				console.error('Timer (' + this.timerId + ') already ended!');
				return;
			}
			this.completed = true;
			clearTimeout(this.timerId);
			delete PuzzleTimer.timers[this.category][this.timerId];
		}
	}], [{
		key: 'pauseAllInCategory',
		value: function pauseAllInCategory(category) {
			for (var i in PuzzleTimer.timers[category]) {
				PuzzleTimer.timers[category][i].pause();
			}
		}
	}, {
		key: 'resumeAllInCategory',
		value: function resumeAllInCategory(category) {
			for (var i in PuzzleTimer.timers[category]) {
				PuzzleTimer.timers[category][i].resume();
			}
		}
	}]);

	return PuzzleTimer;
}();