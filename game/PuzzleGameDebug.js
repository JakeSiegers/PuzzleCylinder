PuzzleGame.prototype.debugLoadMap = function(){
	this.loadMap('map'+this.debugMapNumber);
};

PuzzleGame.prototype.debugDelete10 = function(){
	for(var i=0;i<10;i++){
		var x = Math.floor(Math.random()*this.boardWidth);
		var y = Math.floor(Math.random()*this.boardHeight);
		this.destroyBlock(x,y);
	}
};

PuzzleGame.prototype.debugSelectionUpdate = function(){
	if(this.debugSelection) {
		for(var x=0;x<this.boardWidth;x++) {
			for(var y=0;y<this.boardHeight;y++) {
				if (this.gameGrid[x][y] !== null){
					this.gameGrid[x][y].material.color.setHex(this.gameGrid[x][y].userData.color);
				}
			}
		}


		if (this.gameGrid[this.selectorX][this.selectorY] !== null) {
			this.gameGrid[this.selectorX][this.selectorY].material.color.setHex(0x00ff00);
		}

		var otherX = this.selectorX-1;
		if(otherX<0){
			otherX = this.boardWidth-1;
		}

		if (this.gameGrid[otherX][this.selectorY] !== null) {
			this.gameGrid[otherX][this.selectorY].material.color.setHex(0x00ff00);
		}
	}
};

PuzzleGame.prototype.initDatGui = function(){
	let gui = new dat.GUI();

	/*
	var f1 = gui.addFolder('SELECTION');
	f1.add(this,"selectorX",0,this.boardWidth-1).step(1).onChange(this.focusCameraOnSelection.bind(this)).listen();
	f1.add(this,"selectorY",0,this.boardHeight-1).step(1).onChange(this.focusCameraOnSelection.bind(this)).listen();
	f1.add(this,"debugSelection").listen();
	f1.open();

	var f2 = gui.addFolder('BLOCKS');
	f2.add(this,"dropDelay",100,1000).step(10).listen();
	f2.add(this,"debugDelete10");
	f2.add(this,"checkForMatches");
	f2.add(this,"stopQueue").listen();
	f2.add(this,'pushTowerUp');
	//f2.open();

	var f3 = gui.addFolder('CUSTOM MAPS');
	f3.add(this,"debugMapNumber",1,2).step(1);
	f3.add(this,"debugLoadMap");
	//f3.open();
	*/

	let f4 = gui.addFolder('GAMEPLAY');
	f4.add(this,"handicap",0,4).step(1).listen();
	f4.add(this,"pushDelay",0,200).step(1).listen();
	f4.add(this,"matches").listen();
	f4.add(this,"score").listen();
	f4.add(this,"chainCount").listen();
	f4.add(this,"rowsCreated").listen();
	f4.add(this,"startGame");
	//f4.open();

	let versionDate = new Date(PG.lastUpdateTime);
	let f5 = gui.addFolder("Built: "+versionDate.toLocaleString());

	//gui.close();
};