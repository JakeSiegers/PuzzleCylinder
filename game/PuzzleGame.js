
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

const PI = Math.PI;
const TWO_PI = PI*2;
const HALF_PI = PI/2;

function PuzzleGame(){

    this.selectorX = 0;
    this.selectorY = 0;

    var container = document.createElement( 'div' );
    document.body.appendChild( container );

    this.renderer = new THREE.WebGLRenderer( { antialias: false } );
    this.renderer.setClearColor( 0x222222 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 100, 850);
    this.camera.position.z = 500;

    this.scene = new THREE.Scene();

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

    var f2 = gui.addFolder('DEBUG');
    f2.add(this,"selectorX",0,this.boardWidth-1).step(1).onChange(this.focusCameraOnSelection.bind(this)).listen();
    f2.add(this,"selectorY",0,this.boardHeight-1).step(1).onChange(this.focusCameraOnSelection.bind(this)).listen();
    //f2.add(this,"blockComboActive").listen();
    f2.add(this,"debugSelection").listen();
    f2.add(this,"dropDelay",100,1000).step(10).listen();
    f2.add(this,"debugDelete10");
	f2.add(this,"checkForMatches");
    f2.add(this,"debugMapNumber",1,2).step(1);
	f2.add(this,"debugLoadMap");
    f2.add(this,"resetGame");
    f2.open();

    window.addEventListener('resize', this.onWindowResize.bind(this), false );
    document.addEventListener('keydown', this.keypress.bind(this));

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
    this.gameGrid = [];
    this.boardHeight = 13;
    this.boardWidth = 30;
    this.circlePieceSize = (TWO_PI/this.boardWidth);
    this.stackHeights = [];
    this.blockWidth = 35;
    this.blockHeight = 35;
    this.blockDepth = 10;
    this.boardRadius = ((this.blockWidth-1)*this.boardWidth)/(2*PI);
    this.blockComboActive = false;
    this.dropDelay = 300;
    this.canMoveCursor = false;

    this.piTimer = 0;

    this.debugSelection = false;

    if(this.hasOwnProperty('gameBoard')){
        this.scene.remove(this.gameBoard);
    }
    this.gameBoard = this.cylinder(map);
    this.gameBoard.rotation.y = TWO_PI;
    this.scene.add(this.gameBoard);

    if(this.hasOwnProperty('cursorObj')){
        this.scene.remove(this.cursorObj);
    }
    this.cursorObj = this.generateCursor();
    this.scene.add(this.cursorObj);

    this.selectorY = Math.floor(this.boardHeight/2);
    this.selectorX = 0;//Math.floor(this.boardWidth/2);

    var startingBoardAngle = this.circlePieceSize * this.selectorX-HALF_PI-(this.circlePieceSize/2);
    this.gameBoard.rotation.y = startingBoardAngle-TWO_PI;


    setTimeout(this.moveBlocksToCylinder.bind(this),400);

    var sThis = this;
    new TWEEN.Tween(this.gameBoard.rotation).to({
        y:startingBoardAngle
    },1200).easing(TWEEN.Easing.Exponential.Out).delay(400).start().onComplete(function(){
        sThis.canMoveCursor = true;
    });

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

PuzzleGame.prototype.keypress = function(event){

    if(!this.canMoveCursor){
        return;
    }

    //console.log(event.keyCode);
    switch(event.keyCode){
        case 88: //X
            this.destroyBlock(this.selectorX,this.selectorY);
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
			    yToTest = 0;
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
				    yToTest = 0;
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

    if(block1 !== null){
        new TWEEN.Tween(block1.position).to({
            x:this.calcXBlockPos(x2),
            z:this.calcZBlockPos(x2)
        },100).easing( TWEEN.Easing.Bounce.Out).start();
        block1.rotation.y = this.calcRBlockPos(x2);
    }

    if(block2 !== null) {
        new TWEEN.Tween(block2.position).to({
            x:this.calcXBlockPos(x),
            z:this.calcZBlockPos(x)
        },100).easing( TWEEN.Easing.Bounce.Out).start();
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

    this.gameGrid[x][y].userData.locked = true;
    this.gameGrid[x][y].userData.exploding = true;
    this.gameGrid[x][y].material.map = this.explodeTexture;

	new TWEEN.Tween(this.gameGrid[x][y].scale).to({
		x:0.7,
		y:0.7
	},800).easing( TWEEN.Easing.Elastic.Out).start();

    setTimeout(this.deleteBlock.bind(this,x,y),1000);
};

PuzzleGame.prototype.lockBlocksStartingAtPoint = function(x,y){
    for(var i = y;i<this.boardHeight;i++){
        if(this.gameGrid[x][i] !== null && !this.gameGrid[x][i].userData.exploding){
            this.gameGrid[x][i].userData.locked = true;
            //this.gameGrid[x][i].material.map = this.lockTexture;
        }else{
            return;
        }
    }
};

PuzzleGame.prototype.deleteBlock = function(x,y){
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
                //this.gameGrid[x][i].material.map = this.blockTextures[this.gameGrid[x][i].userData.blockType];
                stillGottaFall = false;
                continue;
            }
            new TWEEN.Tween(this.gameGrid[x][i].position).to({y:this.calcYBlockPos(i-1)},200).easing( TWEEN.Easing.Bounce.Out).start();
            this.gameGrid[x][i-1] = this.gameGrid[x][i];
            //this.gameGrid[x][i-1].userData.locked = false;
            //this.gameGrid[x][i-1].material.map = this.blockTextures[this.gameGrid[x][i-1].userData.blockType];
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
                this.gameBoard.rotation.y = this.circlePieceSize*-1-HALF_PI-(this.circlePieceSize/2)
            }
            break;
        case 'right':
            this.selectorX--;
            if(this.selectorX < 0){
                this.gameBoard.rotation.y = this.circlePieceSize*this.boardWidth-HALF_PI-(this.circlePieceSize/2);
            }
            break;
    }
    if(this.selectorY>=this.boardHeight){
        this.selectorY = 0;
    }
    if(this.selectorY<0){
        this.selectorY = this.boardHeight-1;
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
    new TWEEN.Tween( this.gameBoard.rotation ).to({
        //x: this.circlePieceSize * this.selectorY,
        y: this.circlePieceSize * this.selectorX-HALF_PI-(this.circlePieceSize/2)
        //z: 0
    },200).easing( TWEEN.Easing.Exponential.Out).start();

    this.updateCursorPos();
};

PuzzleGame.prototype.calcYBlockPos = function(y){
    return (y*this.blockHeight)-((this.boardHeight-1)*this.blockHeight)/2
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
		var rows = map.split("\r\n");
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

PuzzleGame.prototype.cylinder = function(mapArray){
    var blocks = new THREE.Object3D();

    var geometry = new THREE.BoxGeometry(this.blockWidth,this.blockHeight,this.blockDepth );

    var keys = Object.keys(this.blockTextures);

    for(var x = 0; x < this.boardWidth; x++) {
        var column = [];
        this.stackHeights[x] = this.boardHeight;
        for (var y = 0; y < this.boardHeight; y++) {

            var blockType = keys[ keys.length * Math.random() << 0];

            if(mapArray){
                if(!mapArray[y] || !mapArray[y][x] || mapArray[y][x] == '-'){
                    column.push(null);
                    continue;
                }
                if(mapArray[y][x] != '?') {
                    blockType = keys[mapArray[y][x]];
                }
            }

            /*
            var safeType = false;
            do{
                //console.log(x+','+y);
                //if(x>0) {
                    //console.log(this.gameGrid[x - 1][y]);
                //    if(y>0){
                        //console.log(this.gameGrid[x][y-1]);
                //    }
                //}
                safeType = true;
            }while(!safeType);
            */

            var mesh = null;
            var material = new THREE.MeshLambertMaterial( { color: this.blockColors[blockType],map:this.blockTextures[blockType]});
            //material.color.setRGB((1/this.boardHeight)*y,0,1-(1/this.boardHeight)*y);

            mesh = new THREE.Mesh(geometry,material);
            mesh.userData.color = mesh.material.color.getHex();

            mesh.userData.blockType = blockType;
            //mesh.userData.dropTimer = null;
            mesh.userData.locked = false;
            mesh.userData.exploding = false;

            mesh.userData.x = this.calcXBlockPos(x);
            mesh.userData.y = this.calcYBlockPos(y);
            mesh.userData.z = this.calcZBlockPos(x);

            mesh.position.x = mesh.userData.x;
            mesh.position.y = mesh.userData.y - 500;
            mesh.position.z = mesh.userData.z;

            mesh.rotation.y = this.calcRBlockPos(x);
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

PuzzleGame.prototype.updateCursorPos = function(){
    this.cursorObj.position.y = this.calcYBlockPos(this.selectorY);

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



PuzzleGame.prototype.moveBlocksToCylinder = function(){
    var count = 0;

    for(var x=0;x<this.boardWidth;x++) {
        for(var y=this.boardHeight-1;y>=0;y--){
            if(this.gameGrid[x][y] == null){
                continue;
            }
            new TWEEN.Tween(this.gameGrid[x][y].position).to({
                x: this.gameGrid[x][y].userData.x,
                y: this.gameGrid[x][y].userData.y,
                z: this.gameGrid[x][y].userData.z
            }, 1000
            ).easing(TWEEN.Easing.Exponential.Out).delay(10*count).start();
        }
        count++;
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