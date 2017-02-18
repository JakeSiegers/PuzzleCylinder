'use strict';

PuzzleGame.prototype.initTouch = function () {
	this.touchTimer = null;
	this.xTouchChain = 0;
	this.yTouchChain = 0;
	this.renderer.domElement.addEventListener('touchstart', this.onDocumentTouchStart.bind(this), false);
	this.renderer.domElement.addEventListener('touchmove', this.onDocumentTouchMove.bind(this), false);
};

PuzzleGame.prototype.onDocumentTouchStart = function (event) {
	var sThis = this;
	if (event.touches.length === 1) {
		if (this.touchTimer == null) {
			this.touchTimer = setTimeout(function () {
				sThis.touchTimer = null;
			}, 200);
		} else {
			clearTimeout(this.touchTimer);
			this.touchTimer = null;
			if (Math.abs(this.xTouchChain) < 10 && Math.abs(this.yTouchChain) < 10) {
				this.swapSelectedBlocks();
			}
		}
		event.preventDefault();
		this.lastXTouch = event.touches[0].pageX;
		this.lastYTouch = event.touches[0].pageY;
		this.xTouchChain = 0;
		this.yTouchChain = 0;
	}
};

PuzzleGame.prototype.onDocumentTouchMove = function (event) {
	if (event.touches.length === 1) {
		event.preventDefault();
		var mouseX = event.touches[0].pageX;
		var mouseY = event.touches[0].pageY;
		var xDelta = mouseX - this.lastXTouch;
		var yDelta = mouseY - this.lastYTouch;
		this.lastXTouch = mouseX;
		this.lastYTouch = mouseY;
		this.xTouchChain += xDelta;
		this.yTouchChain += yDelta;
		if (this.xTouchChain < -30) {
			this.adjustSelector('left');
			this.xTouchChain = 0;
		} else if (this.xTouchChain > 30) {
			this.adjustSelector('right');
			this.xTouchChain = 0;
		}
		if (this.yTouchChain < -30) {
			this.adjustSelector('up');
			this.yTouchChain = 0;
		} else if (this.yTouchChain > 30) {
			this.adjustSelector('down');
			this.yTouchChain = 0;
		}
	}
};