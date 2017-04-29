"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PuzzleDebug = function () {
	function PuzzleDebug(PuzzleTower) {
		_classCallCheck(this, PuzzleDebug);

		this.PuzzleTower = PuzzleTower;
		this.debugSelection = true;
	}

	/*
  debugLoadMap(){
  this.PuzzleTower.loadMap('map'+this.PuzzleTower.debugMapNumber);
  };
 
  debugDelete10(){
  for(let i=0;i<10;i++){
  let x = Math.floor(Math.random()*this.PuzzleTower.boardWidth);
  let y = Math.floor(Math.random()*this.PuzzleTower.boardHeight);
  this.PuzzleTower.destroyBlock(x,y);
  }
  };
  */
	/*
  debugSelectionUpdate(){
  if(this.debugSelection) {
  for(let x=0;x<this.PuzzleTower.boardWidth;x++) {
  for(let y=0;y<this.PuzzleTower.boardHeight;y++) {
  if (this.PuzzleTower.gameGrid[x][y] !== null){
  this.PuzzleTower.gameGrid[x][y].material.color.setHex(this.PuzzleTower.gameGrid[x][y].userData.color);
  }
  }
  }
 
 
  if (this.PuzzleTower.gameGrid[this.PuzzleTower.selectorX][this.PuzzleTower.selectorY] !== null) {
  this.PuzzleTower.gameGrid[this.PuzzleTower.selectorX][this.PuzzleTower.selectorY].material.color.setHex(0x00ff00);
  }
 
  let otherX = this.PuzzleTower.selectorX-1;
  if(otherX<0){
  otherX = this.PuzzleTower.boardWidth-1;
  }
 
  if (this.PuzzleTower.gameGrid[otherX][this.PuzzleTower.selectorY] !== null) {
  this.PuzzleTower.gameGrid[otherX][this.PuzzleTower.selectorY].material.color.setHex(0x00ff00);
  }
  }
  };
  */

	_createClass(PuzzleDebug, [{
		key: "initDatGui",
		value: function initDatGui() {

			//let gui = new dat.GUI();

			//let f1 = gui.addFolder('SELECTION');
			//f1.add(this.PuzzleTower, "selectorX", 0, this.PuzzleTower.boardWidth - 1).step(1).onChange(this.PuzzleTower.focusCameraOnSelection.bind(this.PuzzleTower)).listen();
			//f1.add(this.PuzzleTower, "selectorY", 0, this.PuzzleTower.boardHeight - 1).step(1).onChange(this.PuzzleTower.focusCameraOnSelection.bind(this.PuzzleTower)).listen();
			//f1.open();

			/*
   		 let f2 = gui.addFolder('BLOCKS');
    f2.add(this.PuzzleTower,"dropDelay",100,1000).step(10).listen();
    f2.add(this.PuzzleTower,"debugDelete10");
    f2.add(this.PuzzleTower,"checkForMatches");
    f2.add(this.PuzzleTower,"stopQueue").listen();
    f2.add(this.PuzzleTower,'pushTowerUp');
    //f2.open();
   		 let f3 = gui.addFolder('CUSTOM MAPS');
    f3.add(this.PuzzleTower,"debugMapNumber",1,2).step(1);
    f3.add(this.PuzzleTower,"debugLoadMap");
    //f3.open();
    */

			/*
    let f4 = gui.addFolder('GAMEPLAY');
    f4.add(this.PuzzleTower,"handicap",0,4).step(1).listen();
    f4.add(this.PuzzleTower,"pushDelay",0,200).step(1).listen();
    f4.add(this.PuzzleTower,"matches").listen();
    f4.add(this.PuzzleTower,"score").listen();
    f4.add(this.PuzzleTower,"chainCount").listen();
    f4.add(this.PuzzleTower,"rowsCreated").listen();
    //f4.add(this.PuzzleTower,"startGame");
    f4.open();
   */

			//let versionDate = new Date(lastUpdateTime*1000);
			//let f5 = gui.addFolder("Build Date: "+versionDate.toLocaleString());

			//gui.close();
		}
	}]);

	return PuzzleDebug;
}();