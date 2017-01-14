function PuzzleGameDebug(game){
	var gui = new dat.GUI();

	/*
	var f1 = gui.addFolder('SELECTION');
	f1.add(game,"selectorX",0,game.boardWidth-1).step(1).onChange(game.focusCameraOnSelection.bind(game)).listen();
	f1.add(game,"selectorY",0,game.boardHeight-1).step(1).onChange(game.focusCameraOnSelection.bind(game)).listen();
	f1.add(game,"debugSelection").listen();
	f1.open();

	var f2 = gui.addFolder('BLOCKS');
	f2.add(game,"dropDelay",100,1000).step(10).listen();
	f2.add(game,"debugDelete10");
	f2.add(game,"checkForMatches");
	f2.add(game,"stopQueue").listen();
	f2.add(game,'pushTowerUp');
	//f2.open();

	var f3 = gui.addFolder('CUSTOM MAPS');
	f3.add(game,"debugMapNumber",1,2).step(1);
	f3.add(game,"debugLoadMap");
	//f3.open();
	*/

	var f4 = gui.addFolder('GAMEPLAY');
	f4.add(game,"handicap",0,4).step(1).listen();
	f4.add(game,"pushDelay",0,200).step(1).listen();
	f4.add(game,"matches").listen();
	f4.add(game,"score").listen();
	f4.add(game,"rowsCreated").listen();
	f4.add(game,"resetGame");
	f4.open();

	var f5 = gui.addFolder('VB9');

	//gui.close();
}

new PuzzleGameDebug(game);