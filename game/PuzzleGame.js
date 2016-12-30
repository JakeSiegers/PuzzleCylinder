
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

const PI = Math.PI;
const TWO_PI = PI*2;
const HALF_PI = PI/2;

function PuzzleGame(){
    var container = document.createElement( 'div' );
    document.body.appendChild( container );

    this.renderer = new THREE.WebGLRenderer( { antialias: false } );
    this.renderer.setClearColor( 0x222222 );
    this.windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    this.windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.windowWidth,this.windowHeight);
    document.body.appendChild( this.renderer.domElement );

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 100, 850);
    this.camera.position.z = 500;

    this.scene = new THREE.Scene();

    this.stopQueue = 0;
    this.pushTimeoutObj = null;
    this.pushDelay = 500;
    this.dropDelay = 150;
    this.handicap = 1;
	this.initLoaders();
    this.resetGame();

    this.scene.add(this.generateTube());

    this.light = new THREE.PointLight(0xffffff,1,600);
    this.light.position.z = (this.boardRadius+this.blockDepth+100);
    this.scene.add(this.light);

    this.light = new THREE.PointLight(0xffffff,1,600);
    this.light.position.z = (this.boardRadius+this.blockDepth+100);
    this.light.position.x = 300;
    this.scene.add(this.light);

    this.light = new THREE.PointLight(0xffffff,1,600);
    this.light.position.z = (this.boardRadius+this.blockDepth+100);
    this.light.position.x = -300;
    this.scene.add(this.light);

    //this.debugLight = new THREE.Mesh(new THREE.SphereGeometry(10),new THREE.MeshBasicMaterial({color:0xff0000}));
    //this.debugLight.position.z = this.light.position.z;
    //this.scene.add(this.debugLight);

    this.stats = new Stats();
    container.appendChild( this.stats.dom );

    this.debugMapNumber = 1;

    // Init gui
    var gui = new dat.GUI();

    var f1 = gui.addFolder('SELECTION');
    f1.add(this,"selectorX",0,this.boardWidth-1).step(1).onChange(this.focusCameraOnSelection.bind(this)).listen();
    f1.add(this,"selectorY",0,this.boardHeight-1).step(1).onChange(this.focusCameraOnSelection.bind(this)).listen();
    f1.add(this,"debugSelection").listen();
    //f1.open();

    var f2 = gui.addFolder('BLOCKS');
    f2.add(this,"dropDelay",100,1000).step(10).listen();
    f2.add(this,"debugDelete10");
    f2.add(this,"checkForMatches");
    f2.add(this,"stopQueue").listen();
    f2.add(this,'pushTowerUp');
    f2.open();

    var f3 = gui.addFolder('CUSTOM MAPS');
    f3.add(this,"debugMapNumber",1,2).step(1);
    f3.add(this,"debugLoadMap");
    //f3.open();

    var f4 = gui.addFolder('GAMEPLAY');
    f4.add(this,"handicap",0,3).step(1).listen();
    f4.add(this,"pushDelay",100,1000).step(1).listen();
    f4.add(this,"resetGame");
    f4.open();

	var f5 = gui.addFolder('VB1');

    //gui.close();

    window.addEventListener('resize', this.onWindowResize.bind(this),false);
    document.addEventListener('keydown', this.keyPress.bind(this));

    this.animate();
}

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

PuzzleGame.prototype.initLoaders = function(){
    this.fileLoader = new THREE.FileLoader();

	this.blankTexture = new THREE.TextureLoader().load('game/block.png');
	this.explodeTexture = new THREE.TextureLoader().load('game/block_explode.png');
	this.lockTexture = new THREE.TextureLoader().load('game/block_locked.png');

	this.blockTextures = {
		circle:new THREE.TextureLoader().load('game/block_circle.png'),
		diamond:new THREE.TextureLoader().load('game/block_diamond.png'),
		heart:new THREE.TextureLoader().load('game/block_heart.png'),
        star:new THREE.TextureLoader().load('game/block_star.png'),
		triangle:new THREE.TextureLoader().load('game/block_triangle.png'),
		triangle2:new THREE.TextureLoader().load('game/block_triangle2.png')
	};

	for(var i in this.blockTextures){
		this.blockTextures[i].magFilter = THREE.NearestFilter;
		this.blockTextures[i].minFilter = THREE.NearestFilter;
	}

	this.blockColors = {
		circle:0x4CAF50,
		diamond:0x9C27B0,
		heart:0xF44336,
		star:0xFFEB3B,
		triangle:0x00BCD4,
		triangle2:0x3F51B5
	};
};

PuzzleGame.prototype.resetGame = function(map){
    if(this.stopQueue != 0){
        console.warn('Cannot reset while things are happening! (stopQueue is not 0!)');
        return;
    }
    this.gameGrid = [];
    this.boardHeight = 13;
    this.boardWidth = 30;
    this.circlePieceSize = (TWO_PI/this.boardWidth);
    this.stackHeights = [];
    this.blockWidth = 35;
    this.blockHeight = 35;
    this.blockDepth = 10;
    this.boardPixelHeight = (this.boardHeight-1)*this.blockHeight;
    this.halfBoardPixelHeight = this.boardPixelHeight/2;
    this.boardRadius = ((this.blockWidth-1)*this.boardWidth)/(2*PI);
    this.gameActive = false;
    this.upOffset = 0;

    this.piTimer = 0;

    this.debugSelection = false;

    if(this.hasOwnProperty('gameBoard')){
        this.scene.remove(this.gameBoard);
    }
    this.gameBoard = this.cylinder(map);
    this.scene.add(this.gameBoard);


    this.generateNextRow();

    if(this.pushTimeoutObj !== null){
        clearTimeout(this.pushTimeoutObj);
    }
    this.pushTimeoutObj = setTimeout(this.checkToPushBlocks.bind(this),2000);


    if(this.hasOwnProperty('cursorObj')){
        this.scene.remove(this.cursorObj);
    }
    this.cursorObj = this.generateCursor();
    this.scene.add(this.cursorObj);

    this.selectorY = Math.floor(this.boardHeight/2);
    this.selectorX = 0;//Math.floor(this.boardWidth/2);

    var startingTowerAngle = this.circlePieceSize * this.selectorX-HALF_PI-(this.circlePieceSize/2);
    this.gameBoard.rotation.y = startingTowerAngle-PI;
    this.nextRow.rotation.y = startingTowerAngle;

    var startingTowerPosition = this.updateTowerPos();
    this.gameBoard.position.y = startingTowerPosition - this.boardPixelHeight;

    new TWEEN.Tween(this.gameBoard.position).to({
        y:startingTowerPosition
    },1200).easing(TWEEN.Easing.Quintic.Out).delay(400).start();

    var sThis = this;
    new TWEEN.Tween(this.gameBoard.rotation).to({
        y:startingTowerAngle
    },1200).easing(TWEEN.Easing.Quintic.Out).delay(400).start().onComplete(function(){
        sThis.gameActive = true;
        sThis.checkForMatches();
    });


};

PuzzleGame.prototype.loseAnimation = function(){
    for(var x = 0;x<this.boardWidth;x++){
        for(var y=0;y<this.boardHeight;y++){
            if(this.gameGrid[x][y] != null){
                this.gameGrid[x][y].material.map = this.blankTexture;
                var delay = 500;
                if(this.gameGrid[x][this.boardHeight-1] != null){
                    delay = 2000;
                }
                new TWEEN.Tween(this.gameGrid[x][y].position).to({
                    y:-this.boardPixelHeight*2
                },4000).easing(TWEEN.Easing.Exponential.Out).delay(delay).start();
            }
        }
    }
};

PuzzleGame.prototype.checkToPushBlocks = function(){
    if(this.stopQueue !== 0){
    //if(TWEEN.getAll().length != 0){
        this.pushTimeoutObj = setTimeout(this.checkToPushBlocks.bind(this),this.pushDelay);
        return;
    }
    for(var tx = 0;tx<this.boardWidth;tx++){
        if(this.gameGrid[tx][this.boardHeight-1] !== null){
            //YOU LOSE
            this.gameActive = false;
            this.loseAnimation();
            return;
        }
    }

    this.pushTowerUp();
    this.pushTimeoutObj = setTimeout(this.checkToPushBlocks.bind(this),this.pushDelay);
};

PuzzleGame.prototype.pushTowerUp = function(){
    this.upOffset += this.blockHeight/20;
    if(this.upOffset>this.blockHeight){
        for(var x=0;x<this.boardWidth;x++){
            for(var y=this.boardHeight-1;y>=0;y--){
                if(this.gameGrid[x][y] != null) {
                    this.gameGrid[x][y].position.y = this.calcYBlockPos(y + 1);
                    this.gameGrid[x][y + 1] = this.gameGrid[x][y];
                    //this.gameGrid[x][y] = null;
                }
            }
        }
        for(var nx = 0;nx<this.boardWidth;nx++){
            var block = this.generateBlockMesh(this.nextRow.children[nx].userData.blockType,nx,0);
            this.gameBoard.add(block);
            this.gameGrid[nx][0] = block;
        }
        this.checkForMatches();
        this.generateNextRow();
        this.upOffset = 0;
        this.selectorY++;
    }
    this.updateTowerPos();
    this.updateCursorPos();
    this.updateNextRowPos();
};

PuzzleGame.prototype.generateCursor = function(){
    var obj = new THREE.Object3D();
    var geometry = new THREE.PlaneGeometry(this.blockWidth,this.blockHeight);
    var texture = new THREE.TextureLoader().load('game/cursor.png');
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    var material = new THREE.MeshBasicMaterial({color:0xffffff,side: THREE.DoubleSide,map:texture,transparent: true});
    var mesh = new THREE.Mesh(geometry,material);
    mesh.position.x = -this.blockWidth/2;
    obj.add(mesh);
    var mesh2 = new THREE.Mesh(geometry,material);
    mesh2.position.x = this.blockWidth/2;
    obj.add(mesh2);

    obj.position.z = this.boardRadius+this.blockDepth;
    return obj;
};

PuzzleGame.prototype.generateTube = function(){
    var obj = new THREE.Object3D();
    var r = this.boardRadius+this.blockDepth/2+3;
    var material = new THREE.MeshLambertMaterial({color:0x333333,side:THREE.DoubleSide});
    var geometry = new THREE.CylinderGeometry(r,r,400,this.boardWidth,1,false);
    var tube = new THREE.Mesh( geometry, material );
    tube.position.y = -(this.blockHeight*this.boardHeight)/2-198;

    var tube2 = new THREE.Mesh( geometry, material );
    tube2.position.y = (this.blockHeight*this.boardHeight)/2+198;

    obj.add(tube);
    obj.add(tube2);
    return obj;
};

PuzzleGame.prototype.keyPress = function(event){
    event.preventDefault();

    if(!this.gameActive){
        return;
    }

    //console.log(event.keyCode);
    switch(event.keyCode){
        case 88: //X
            //this.destroyBlock(this.selectorX,this.selectorY);
            break;
        case 90: //Z

            break;
        case 32: //Space
            this.swapBlocks(this.selectorX,this.selectorY,this.selectorX-1);
            break;
        case 38: //up
            this.adjustSelector('up');
            break;
        case 40: //down
            this.adjustSelector('down');
            break;
        case 37: //left
            this.adjustSelector('left');
            break;
        case 39: //right
            this.adjustSelector('right');
            break;
    }
};

PuzzleGame.prototype.checkForMatches = function(){

    if(!this.gameActive){
        return;
    }

    var blocksToBeDestroyed = [];
    for(var y = 0; y < this.boardHeight;y++){
	    for(var x = 0; x < this.boardWidth;x++){
			if(this.gameGrid[x][y] == null || this.gameGrid[x][y].userData.locked){
				continue;
			}

		    var typeToMatch = this.gameGrid[x][y].userData.blockType;
		    var matchChainX = [x];
			var xToTest = x+1;
		    if(xToTest == this.boardWidth){
			    xToTest = 0;
		    }

		    while(xToTest != x && this.gameGrid[xToTest][y] != null && !this.gameGrid[xToTest][y].userData.locked){
				var nextType = this.gameGrid[xToTest][y].userData.blockType;
				if (nextType != typeToMatch) {
					//no more matches!
					break;
				}
				matchChainX.push(xToTest);
				xToTest++;
			    if(xToTest == this.boardWidth){
				    xToTest = 0;
			    }
			}

            if(matchChainX.length>=3){
                for(var i=0;i<matchChainX.length;i++){
                    blocksToBeDestroyed.push({x:matchChainX[i],y:y});
                }
            }
            matchChainX = [];

		    var matchChainY = [y];
		    var yToTest = y+1;
		    if(yToTest == this.boardHeight){
                continue; // No Y rollover!
		    }

		    while(yToTest != y && this.gameGrid[x][yToTest] != null && !this.gameGrid[x][yToTest].userData.locked){
			    var nextType = this.gameGrid[x][yToTest].userData.blockType;
			    if (nextType != typeToMatch) {
				    //no more matches!
				    break;
			    }
			    matchChainY.push(yToTest);
			    yToTest++;
			    if(yToTest == this.boardHeight){
                    break; // No Y rollover!
			    }
		    }

		    if(matchChainY.length>=3){
			    for(var i=0;i<matchChainY.length;i++){
                    blocksToBeDestroyed.push({x:x,y:matchChainY[i]});
			    }
		    }
		    matchChainY = [];
	    }
    }

    //console.log(blocksToBeDestroyed);

    for(var i = 0;i<blocksToBeDestroyed.length;i++){
        //this.gameGrid[blocksToBeDestroyed[i].x][blocksToBeDestroyed[i].y].material.map = this.explodeTexture;
        this.destroyBlock(blocksToBeDestroyed[i].x,blocksToBeDestroyed[i].y);
    }
};

PuzzleGame.prototype.swapBlocks = function(x,y,x2){

    if(x2==-1){
        x2=this.boardWidth-1;
    }

    var block1 = this.gameGrid[x][y];
    var block2 = this.gameGrid[x2][y];

    if((block1 != null && block1.userData.locked )|| (block2 != null && block2.userData.locked)){
        return;
    }

	var sThis = this;
    if(block1 !== null){
	    this.stopQueue++;
        new TWEEN.Tween(block1.position).to({
            x:this.calcXBlockPos(x2),
            z:this.calcZBlockPos(x2)
        },50).easing( TWEEN.Easing.Bounce.Out).start().onComplete(function(){
            sThis.stopQueue--;
        });
        block1.rotation.y = this.calcRBlockPos(x2);
    }

    if(block2 !== null) {
	    this.stopQueue++;
        new TWEEN.Tween(block2.position).to({
            x:this.calcXBlockPos(x),
            z:this.calcZBlockPos(x)
        },50).easing( TWEEN.Easing.Bounce.Out).start().onComplete(function(){
	        sThis.stopQueue--;
        });
        block2.rotation.y = this.calcRBlockPos(x);
    }

    this.gameGrid[x][y] = block2;
    this.gameGrid[x2][y] = block1;

    if(block1 !=  null && block2 == null){
        if(y-1>=0 && this.gameGrid[x2][y-1] == null){
            this.lockBlocksStartingAtPoint(x2,y);
            setTimeout(this.dropBlocksStartingAtPoint.bind(this,x2,y),this.dropDelay);
        }
        this.lockBlocksStartingAtPoint(x,y+1);
        setTimeout(this.dropBlocksStartingAtPoint.bind(this,x,y+1),this.dropDelay);
    }

    else if(block2 !=  null && block1 == null){
        if(y-1>=0 && this.gameGrid[x][y-1] == null){
            this.lockBlocksStartingAtPoint(x,y);
            setTimeout(this.dropBlocksStartingAtPoint.bind(this,x,y),this.dropDelay);
        }
        this.lockBlocksStartingAtPoint(x2,y+1);
        setTimeout(this.dropBlocksStartingAtPoint.bind(this,x2,y+1),this.dropDelay);
    }

	this.checkForMatches();

    //this.checkDropBlocks();
};

PuzzleGame.prototype.destroyBlock = function(x,y){
    if(this.gameGrid[x][y] == null || this.gameGrid[x][y].userData.locked){
        return;
    }
    this.stopQueue++;

    this.gameGrid[x][y].userData.locked = true;
    this.gameGrid[x][y].userData.exploding = true;
    this.gameGrid[x][y].material.map = this.explodeTexture;

	new TWEEN.Tween(this.gameGrid[x][y].scale).to({
		x:0.7,
		y:0.7
	},800).easing( TWEEN.Easing.Elastic.Out).start();

    setTimeout(this.deleteBlock.bind(this,x,y),500);
};

PuzzleGame.prototype.lockBlocksStartingAtPoint = function(x,y){
    for(var i = y;i<this.boardHeight;i++){
        if(this.gameGrid[x][i] !== null && !this.gameGrid[x][i].userData.exploding){
            this.gameGrid[x][i].userData.locked = true;
            this.gameGrid[x][i].material.map = this.lockTexture;
        }else{
            return;
        }
    }
};

PuzzleGame.prototype.deleteBlock = function(x,y){
    this.stopQueue--;
    this.gameGrid[x][y].userData.exploding = false;
    this.gameBoard.remove(this.gameGrid[x][y]);
    this.gameGrid[x][y] = null;

    this.lockBlocksStartingAtPoint(x,y+1);
    setTimeout(this.dropBlocksStartingAtPoint.bind(this,x,y+1),this.dropDelay);
};

PuzzleGame.prototype.dropBlocksStartingAtPoint = function(x,y){
    var stillGottaFall = true;
    for(var i = y;i<this.boardHeight;i++) {
        if (this.gameGrid[x][i] !== null && !this.gameGrid[x][i].userData.exploding){
            //You moved a block under this block about to fall.
            if(this.gameGrid[x][i-1] !== null){
                this.gameGrid[x][i].userData.locked = false;
                this.gameGrid[x][i].material.map = this.blockTextures[this.gameGrid[x][i].userData.blockType];
                stillGottaFall = false;
                continue;
            }
            sThis = this;
            this.stopQueue++;
            new TWEEN.Tween(this.gameGrid[x][i].position).to({y:this.calcYBlockPos(i-1)},200).easing( TWEEN.Easing.Bounce.Out).start().onComplete(function(){
                sThis.stopQueue--;
            });
            this.gameGrid[x][i-1] = this.gameGrid[x][i];
            this.gameGrid[x][i] = null;
        }else{
            ///stoooop!
            break;
        }
    }
    if(stillGottaFall){
        if(y-1>=0){
            this.dropBlocksStartingAtPoint(x,y-1);
        }
    }else{
	    this.checkForMatches();
    }
};
/*
PuzzleGame.prototype.checkDropBlocks = function(){
    this.blockComboActive = false;
    for(var x=0;x<this.boardWidth;x++){
        var emptyQueue = [];
        for(var y=0;y<this.boardHeight;y++){
            if(this.gameGrid[x][y] == null) {
                emptyQueue.push(y);
                continue;
            }
            if(emptyQueue.length > 0){
                var nextEmpty = emptyQueue.shift();
                this.gameGrid[x][nextEmpty] = this.gameGrid[x][y];
                new TWEEN.Tween(this.gameGrid[x][nextEmpty].position).to({y:this.calcYBlockPos(nextEmpty)},200).easing( TWEEN.Easing.Bounce.Out).start();
                this.gameGrid[x][y] = null;
                emptyQueue.push(y);
            }
        }
    }
};
*/

PuzzleGame.prototype.adjustSelector = function(direction){
    switch(direction){
        case 'up':
            this.selectorY++;
            break;
        case 'down':
            this.selectorY--;
            break;
        case 'left':
            this.selectorX++;
            if(this.selectorX >= this.boardWidth){
                this.gameBoard.rotation.y = this.nextRow.rotation.y = this.circlePieceSize*-1-HALF_PI-(this.circlePieceSize/2)
            }
            break;
        case 'right':
            this.selectorX--;
            if(this.selectorX < 0){
                this.gameBoard.rotation.y = this.nextRow.rotation.y =  this.circlePieceSize*this.boardWidth-HALF_PI-(this.circlePieceSize/2);
            }
            break;
    }
    if(this.selectorY>=this.boardHeight){
        this.selectorY = this.boardHeight-1;
    }
    if(this.selectorY<0){
        this.selectorY = 0
    }
    if(this.selectorX>=this.boardWidth){
        this.selectorX = 0;
    }
    if(this.selectorX<0){
        this.selectorX = this.boardWidth-1;
    }
    this.focusCameraOnSelection();
};

PuzzleGame.prototype.focusCameraOnSelection = function(){
    var newAngle = this.circlePieceSize * this.selectorX-HALF_PI-(this.circlePieceSize/2);

    new TWEEN.Tween( this.gameBoard.rotation ).to({
        //x: this.circlePieceSize * this.selectorY,
        y: newAngle
        //z: 0
    },200).easing( TWEEN.Easing.Exponential.Out).start();

    new TWEEN.Tween( this.nextRow.rotation ).to({
        //x: this.circlePieceSize * this.selectorY,
        y: newAngle
        //z: 0
    },200).easing( TWEEN.Easing.Exponential.Out).start();

    this.updateCursorPos();
};

PuzzleGame.prototype.calcYBlockPos = function(y){
    return (y*this.blockHeight);
};

PuzzleGame.prototype.calcXBlockPos = function(x){
    return Math.cos(this.circlePieceSize*x)*this.boardRadius;
};

PuzzleGame.prototype.calcZBlockPos = function(x){
    return Math.sin(this.circlePieceSize*x)*this.boardRadius;
};

PuzzleGame.prototype.calcRBlockPos = function(x){
    return -this.circlePieceSize*x+HALF_PI;
};

PuzzleGame.prototype.loadMap = function(mapFile){
	var sThis = this;
	this.fileLoader.load('maps/'+mapFile+'.txt',function(map){
        map = map.replace(/\r\n/g, "\r");
		var rows = map.split("\r");
		var botRow = rows.length-1;
        var mapArray = [];
		for(var y = botRow;y>=0;y--){
            var row = [];
            var items = rows[y].split("");
            for(var x = items.length-1;x>=0;x--){
                row.push(items[x]);
            }
            mapArray.push(row);
		}
		sThis.resetGame(mapArray);
	});
};

PuzzleGame.prototype.generateNextRow = function(){
    if(this.hasOwnProperty('nextRow')){
        this.scene.remove(this.nextRow);
    }
    this.nextRow = new THREE.Object3D();
    var meshes = this.generateNextRowMeshArray();
    for(var i in meshes){
        this.nextRow.add(meshes[i]);
    }
    this.scene.add(this.nextRow);
    this.updateNextRowPos();
    this.nextRow.rotation.y = this.circlePieceSize * this.selectorX-HALF_PI-(this.circlePieceSize/2);
};

PuzzleGame.prototype.generateNextRowMeshArray = function(){
    var meshes = [];
    var geometry = new THREE.BoxGeometry(this.blockWidth,this.blockHeight,this.blockDepth );
    var keys = Object.keys(this.blockTextures);
    for(var x = 0; x < this.boardWidth; x++) {
        var blockType = keys[ (keys.length-this.handicap) * Math.random() << 0];
        var material = new THREE.MeshLambertMaterial( { color: this.blockColors[blockType],map:this.blockTextures[blockType],transparent:true,opacity:0.5});
        var mesh = new THREE.Mesh(geometry,material);
        mesh.userData.color = mesh.material.color.getHex();
        mesh.userData.blockType = blockType;
        mesh.position.x = this.calcXBlockPos(x);
        mesh.position.y = this.calcYBlockPos(0);
        mesh.position.z = this.calcZBlockPos(x);
        mesh.rotation.y = this.calcRBlockPos(x);
        meshes.push(mesh);
    }
    return meshes;
};

PuzzleGame.prototype.generateBlockMesh = function(blockType,x,y){
    var geometry = new THREE.BoxGeometry(this.blockWidth,this.blockHeight,this.blockDepth);
    var material = new THREE.MeshLambertMaterial({color: this.blockColors[blockType],map:this.blockTextures[blockType]});
    var mesh = new THREE.Mesh(geometry,material);
    mesh.userData.color = mesh.material.color.getHex();

    mesh.userData.blockType = blockType;
    mesh.userData.locked = false;
    mesh.userData.exploding = false;

    mesh.position.x = this.calcXBlockPos(x);
    mesh.position.y = this.calcYBlockPos(y);
    mesh.position.z = this.calcZBlockPos(x);

    mesh.rotation.y = this.calcRBlockPos(x);

    return mesh;
};

PuzzleGame.prototype.cylinder = function(mapArray){
    var blocks = new THREE.Object3D();

    var keys = Object.keys(this.blockTextures);
    for(var x = 0; x < this.boardWidth; x++) {
        var column = [];
        this.stackHeights[x] = this.boardHeight;
        for (var y = 0; y < this.boardHeight; y++) {

            var blockType = keys[ (keys.length-this.handicap) * Math.random() << 0];


            if(mapArray){
                if(!mapArray[y] || !mapArray[y][x] || mapArray[y][x] == '-'){
                    column.push(null);
                    continue;
                }
                if(mapArray[y][x] != '?') {
                    blockType = keys[mapArray[y][x]];
                }
            }else if(y>Math.floor(this.boardHeight*0.70)){
                column.push(null);
                continue;
            }
            var mesh = this.generateBlockMesh(blockType,x,y);
            column.push(mesh);
            blocks.add(mesh);
        }
        this.gameGrid.push(column);
    }
    return blocks;
};

PuzzleGame.prototype.onWindowResize = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( width, height );
};

PuzzleGame.prototype.updateTowerPos = function(){
    this.gameBoard.position.y = -this.halfBoardPixelHeight+this.upOffset;
    return this.gameBoard.position.y;
};
PuzzleGame.prototype.updateCursorPos = function(){
    this.cursorObj.position.y = this.calcYBlockPos(this.selectorY)-this.halfBoardPixelHeight+this.upOffset;
    this.debugSelectionUpdate();
};
PuzzleGame.prototype.updateNextRowPos = function(){
    this.nextRow.position.y = this.calcYBlockPos(-1)-this.halfBoardPixelHeight+this.upOffset;
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

PuzzleGame.prototype.animate = function(){
    requestAnimationFrame(this.animate.bind(this));
    this.stats.begin();
    this.render();
    this.stats.end();
};

PuzzleGame.prototype.render = function() {
    TWEEN.update();

    var timer = performance.now();

    //this.light.position.x = Math.sin(this.piTimer)*(this.boardRadius+this.blockDepth+100);
    //this.light.position.z = Math.cos(this.piTimer)*(this.boardRadius+this.blockDepth+100);
    //this.debugLight.position.x = this.light.position.x;
    //this.debugLight.position.z = this.light.position.z;

	var sThis = this;

	this.gameBoard.traverse(function(block){
		if(block.userData.exploding){
			block.rotation.y = timer * 0.01;
			block.rotation.x = timer * 0.01;
		}
	});

    this.cursorObj.traverse(function(cursor){
        cursor.scale.x = sThis.cursorObj.scale.y = (0.05*Math.sin(sThis.piTimer)+1);
    });

	this.renderer.render(this.scene,this.camera);

    this.piTimer+=0.05;
    if(this.piTimer > TWO_PI){
        this.piTimer = 0;
    }
};

var game = new PuzzleGame();