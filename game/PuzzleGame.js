
//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

const PI = Math.PI;
const TWO_PI = PI*2;
const HALF_PI = PI/2;

function PuzzleGame(){

	this.renderer = new THREE.WebGLRenderer( { antialias: false ,alpha: true} );
	this.renderer.setClearColor(0x000000,0.5);
	this.windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	this.windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	this.renderer.setPixelRatio(window.devicePixelRatio);
	this.renderer.setSize(this.windowWidth,this.windowHeight);
	document.body.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();

	this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 100, 850);
	this.camera.position.z = 500;

	this.resetGameVariables();


	//Timer Objects
	this.pushTimeoutObj = null;
	this.difficultyTimeoutObj = null;

	this.initLoaders();

	this.tube = this.generateTube();
	this.scene.add(this.tube);
	this.scene.add(this.generateCylinderDepthFilter());
}

PuzzleGame.prototype.preloadComplete = function(){

	setTimeout(this.closeTube.bind(this),100);
	setTimeout(this.resetGame.bind(this),2000);

	/*

	var textGeometry = new THREE.TextGeometry( "Puzzle Cylinder",
		{

			font: this.font

		});


	var textMaterial = new THREE.MeshBasicMaterial( { color: 0x62254a } );
	var text3D = new THREE.Mesh( textGeometry, textMaterial );
	this.scene.add(text3D);
	*/




	this.makeText();




	this.stats = new Stats();
	document.body.appendChild( this.stats.dom );

	this.debugMapNumber = 1;

	window.addEventListener('resize', this.onWindowResize.bind(this),false);
	document.addEventListener('keydown', this.keyPress.bind(this));

	this.initTouch();
	this.initDatGui();

	this.animate();
};

PuzzleGame.prototype.makeText = function(){

	console.log(this.font);

	var textGeometry1 = new THREE.TextGeometry("Puzzle",{
		font: this.font,
		size:50,
		height :5
	});
	var textGeometry2 = new THREE.TextGeometry("Cylinder",{
		font: this.font,
		size:50,
		height :5
	});

	var material = new THREE.MeshBasicMaterial({color: this.blockColors.diamond});

	this.title1 = new THREE.Mesh(textGeometry1, material);
	this.title2 = new THREE.Mesh(textGeometry2, material);

	textGeometry1.computeBoundingBox();
	var textWidth1 = textGeometry1.boundingBox.max.x - textGeometry1.boundingBox.min.x;
	this.title1.position.x =  -textWidth1/2;

	textGeometry2.computeBoundingBox();
	var textWidth2 = textGeometry2.boundingBox.max.x - textGeometry2.boundingBox.min.x;
	this.title2.position.x =  -textWidth2/2;

	this.title1.position.y = this.boardPixelHeight;
	this.title2.position.y = -this.boardPixelHeight;

	this.title1.position.z = this.title2.position.z = this.boardRadius+5;
	this.scene.add(this.title1);
	this.scene.add(this.title2);
};


PuzzleGame.prototype.makeHarder = function(){
	if(this.pushDelay > 0){
		this.pushDelay = 100 - this.matches/5;
		if(this.pushDelay < 0){
			this.pushDelay = 0;
		}
		if(this.pushDelay <= 90){
			this.handicap = 3;
		}
		if(this.pushDelay <= 70){
			this.handicap = 2;
		}
		if(this.pushDelay <= 50){
			this.handicap = 1;
		}
		if(this.pushDelay <= 30){
			this.handicap = 0;
		}
	}
};

PuzzleGame.prototype.initLoaders = function(){

	var loaderDom = document.getElementById("loader");
	var loaderTextDom = document.getElementById("loaderText");

	var manager = new THREE.LoadingManager();
	console.log('New LoadingManager');
	var sThis = this;
	manager.onLoad = function ( ) {
		console.log( 'Loading complete!');
		sThis.preloadComplete();
		loaderDom.className += " hideLoader";
	};
	manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
		console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
		loaderTextDom.innerHTML = Math.floor((itemsLoaded/itemsTotal)*100);
	};
	manager.onError = function ( url ) {
		console.log( 'There was an error loading ' + url );
	};

    this.fileLoader = new THREE.FileLoader(manager);
	var textureLoader =  new THREE.TextureLoader(manager);
	var fontLoader = new THREE.FontLoader(manager);

	this.blankTexture = textureLoader.load('img/block.png');
	this.explodeTexture = textureLoader.load('img/block_explode.png');
	this.lockTexture = textureLoader.load('img/block_locked.png');
	this.tubeTexture = textureLoader.load('img/block.png');
	this.tubeTexture.wrapS = THREE.RepeatWrapping;
	this.tubeTexture.wrapT = THREE.RepeatWrapping;
	this.tubeTexture.repeat.set( this.boardWidth, this.boardHeight );

	//Font loader is weird.... It doesn't return the loaded value.
	fontLoader.load('fonts/Righteous_Regular.json',function(response){
		sThis.font = response;
	});

	this.cursorTexture = textureLoader.load('img/cursor.png');
	this.cursorTexture.magFilter = THREE.NearestFilter;
	this.cursorTexture.minFilter = THREE.NearestFilter;

	this.blockTextures = {
		circle:textureLoader.load('img/block_circle.png'),
		diamond:textureLoader.load('img/block_diamond.png'),
		heart:textureLoader.load('img/block_heart.png'),
        star:textureLoader.load('img/block_star.png'),
		triangle:textureLoader.load('img/block_triangle.png'),
		triangle2:textureLoader.load('img/block_triangle2.png'),
		penta:textureLoader.load('img/block_penta.png')
	};

	//Sharpen out textures - prevent scale blurring
	//var maxAnisotropy = this.renderer.getMaxAnisotropy();
	//for(var i in this.blockTextures){
		//this.blockTextures[i].magFilter = THREE.NearestFilter;
		//this.blockTextures[i].minFilter = THREE.NearestFilter;
		//this.blockTextures[i].anisotropy = maxAnisotropy;
	//}

	this.blockColors = {
		circle:0x4CAF50,
		diamond:0x9C27B0,
		heart:0xF44336,
		star:0xFFEB3B,
		triangle:0x00BCD4,
		triangle2:0x3F51B5,
		penta:0x607D8B
	};

};

PuzzleGame.prototype.resetGameVariables = function(){
	//TODO:Sort these!
	this.stopQueue = 0;
	this.score = 0;
	this.gameGrid = [];
	this.boardHeight = 13;
	this.boardWidth = 30;
	this.circlePieceSize = (TWO_PI/this.boardWidth);
	this.stackHeights = [];
	this.blockWidth = 35;
	this.blockHeight = 35;
	this.blockDepth = 10;
	this.boardPixelHeight = (this.boardHeight)*this.blockHeight;
	this.halfBoardPixelHeight = this.boardPixelHeight/2;
	this.boardRadius = ((this.blockWidth-1)*this.boardWidth)/(2*PI);
	this.hasControl = false;
	this.gameActive = false;
	this.upOffset = 0;
	this.pushDelay = 100;
	this.dropDelay = 150;
	this.handicap = 4;
	this.matches = 0;
	this.rowsCreated = 0;
	this.piTimer = 0;
	this.debugSelection = false;
};

PuzzleGame.prototype.resetGame = function(map){
    if(this.stopQueue != 0){
        console.warn('Cannot reset while things are happening! (stopQueue is not 0!)');
        return;
    }

    this.resetGameVariables();

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

	if(this.difficultyTimeoutObj !== null){
		clearInterval(this.difficultyTimeoutObj);
	}
	this.difficultyTimeoutObj = setInterval(this.makeHarder.bind(this),1000);

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

	this.openTube();

    new TWEEN.Tween(this.gameBoard.position).to({
        y:startingTowerPosition
    },1200).easing(TWEEN.Easing.Quintic.Out).delay(400).start();

    var sThis = this;
    new TWEEN.Tween(this.gameBoard.rotation).to({
        y:startingTowerAngle
    },1200).easing(TWEEN.Easing.Quintic.Out).delay(400).start().onComplete(function(){
        sThis.hasControl = true;
        sThis.gameActive = true;
        sThis.checkForMatches();
        //sThis.stopQueue = 1;
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
	setTimeout(this.closeTube.bind(this),2500);
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
            this.hasControl = false;
	        this.gameActive = false;
            this.loseAnimation();
            return;
        }
    }

    this.pushTowerUp();
    this.pushTimeoutObj = setTimeout(this.checkToPushBlocks.bind(this),this.pushDelay);
};

PuzzleGame.prototype.pushTowerUp = function(){
    this.upOffset += this.blockHeight/100;
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


	    //this.upOffset = 0;
    }
    this.updateTowerPos();
    this.updateCursorPos();
    this.updateNextRowPos();
};

PuzzleGame.prototype.generateCursor = function(){
    var obj = new THREE.Object3D();
    var geometry = new THREE.PlaneGeometry(this.blockWidth,this.blockHeight);

    var material = new THREE.MeshBasicMaterial({color:0xffffff,side: THREE.DoubleSide,map:this.cursorTexture,transparent: true});
    var mesh = new THREE.Mesh(geometry,material);
    mesh.position.x = -this.blockWidth/2;
    obj.add(mesh);
    var mesh2 = new THREE.Mesh(geometry,material);
    mesh2.position.x = this.blockWidth/2;
    obj.add(mesh2);

    obj.position.z = this.boardRadius+this.blockDepth;
    return obj;
};

PuzzleGame.prototype.closeTube = function(){
	var closeDelay = 1000;
	var closeEase = TWEEN.Easing.Cubic.Out;

	new TWEEN.Tween(this.title1.position).to({y:30},closeDelay).easing(closeEase).start();
	new TWEEN.Tween(this.title2.position).to({y:-30},closeDelay).easing(closeEase).start();

	new TWEEN.Tween(this.tube.children[0].position).to({y:-this.boardPixelHeight/2},closeDelay).easing(closeEase).start();
	new TWEEN.Tween(this.tube.children[0].rotation).to({y:-HALF_PI},closeDelay).easing(closeEase).start();

	new TWEEN.Tween(this.tube.children[1].position).to({y:this.boardPixelHeight/2},closeDelay).easing(closeEase).start();
	new TWEEN.Tween(this.tube.children[1].rotation).to({y:HALF_PI},closeDelay).easing(closeEase).start();
};

PuzzleGame.prototype.openTube = function(){
	var openDelay = 1000;
	var openEase = TWEEN.Easing.Cubic.Out;

	new TWEEN.Tween(this.title1.position).to({y:this.boardPixelHeight},openDelay).easing(openEase).start();
	new TWEEN.Tween(this.title2.position).to({y:-this.boardPixelHeight},openDelay).easing(openEase).start();

	new TWEEN.Tween(this.tube.children[0].position).to({y:-this.boardPixelHeight+1},openDelay).easing(openEase).start();
	new TWEEN.Tween(this.tube.children[0].rotation).to({y:0},openDelay).easing(openEase).start();

	new TWEEN.Tween(this.tube.children[1].position).to({y:this.boardPixelHeight-1},openDelay).easing(openEase).start();
	new TWEEN.Tween(this.tube.children[1].rotation).to({y:0},openDelay).easing(openEase).start();
};

PuzzleGame.prototype.generateTube = function(){
    var obj = new THREE.Object3D();
    var r = this.boardRadius+this.blockDepth/2+5;
    var material = new THREE.MeshBasicMaterial({color:0x222222,side:THREE.DoubleSide,map:this.tubeTexture});
    var geometry = new THREE.CylinderGeometry(r,r,this.boardPixelHeight,this.boardWidth,1,false);
    var tube = new THREE.Mesh( geometry, material );
    tube.position.y = -(this.boardPixelHeight)

    var tube2 = new THREE.Mesh( geometry, material );
    tube2.position.y = (this.boardPixelHeight)

    obj.add(tube);
    obj.add(tube2);
    return obj;
};

PuzzleGame.prototype.generateCylinderDepthFilter = function(){
	var obj = new THREE.Object3D();
	var material =  new THREE.MeshBasicMaterial({color:0x000000,side:THREE.DoubleSide,transparent:true,opacity:0.6});
	var geometry = new THREE.PlaneGeometry((this.boardRadius+this.blockDepth)*2, this.boardPixelHeight );
	var plane = new THREE.Mesh(geometry,material);

	var r = this.boardRadius+this.blockDepth;
	material = new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,transparent:true,opacity:0.1,depthWrite: false, depthTest: false});
	geometry = new THREE.CylinderGeometry(r,r,this.boardPixelHeight,this.boardWidth,1,true,-HALF_PI,PI);
	var tube = new THREE.Mesh( geometry, material );

	obj.add(plane);
	//obj.add(tube);
	return obj;
};

PuzzleGame.prototype.keyPress = function(event){
    event.preventDefault();

    if(!this.hasControl){
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
            this.swapSelectedBlocks();
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

PuzzleGame.prototype.swapSelectedBlocks = function(){
	this.swapBlocks(this.selectorX,this.selectorY,this.selectorX-1);
};

PuzzleGame.prototype.checkForMatches = function(){

    if(!this.hasControl){
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
	            this.matches++
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
			    this.matches++
			    for(var i=0;i<matchChainY.length;i++){
                    blocksToBeDestroyed.push({x:x,y:matchChainY[i]});
			    }
		    }
		    matchChainY = [];
	    }
    }

    for(var d = 0;d<blocksToBeDestroyed.length;d++){
    	this.score++;
        this.destroyBlock(blocksToBeDestroyed[d].x,blocksToBeDestroyed[d].y);
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
	        this.stopQueue++;
            setTimeout(this.dropBlocksStartingAtPoint.bind(this,x2,y),this.dropDelay);
        }
        this.lockBlocksStartingAtPoint(x,y+1);
	    this.stopQueue++;
        setTimeout(this.dropBlocksStartingAtPoint.bind(this,x,y+1),this.dropDelay);
    }

    else if(block2 !=  null && block1 == null){
        if(y-1>=0 && this.gameGrid[x][y-1] == null){
            this.lockBlocksStartingAtPoint(x,y);
	        this.stopQueue++;
            setTimeout(this.dropBlocksStartingAtPoint.bind(this,x,y),this.dropDelay);
        }
        this.lockBlocksStartingAtPoint(x2,y+1);
	    this.stopQueue++;
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
    //this.gameGrid[x][y].material.map = this.explodeTexture;

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
	        //Set texture to a debug "lock/dropping" texture.
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
	this.stopQueue--;

    this.lockBlocksStartingAtPoint(x,y+1);
	this.stopQueue++;
    setTimeout(this.dropBlocksStartingAtPoint.bind(this,x,y+1),this.dropDelay);
};

PuzzleGame.prototype.dropBlocksStartingAtPoint = function(x,y){
	this.stopQueue--;
    var stillGottaFall = true;
    for(var i = y;i<this.boardHeight;i++) {
        if (this.gameGrid[x][i] !== null && !this.gameGrid[x][i].userData.exploding){
            //You moved a block under this block about to fall.
            if(this.gameGrid[x][i-1] !== null){
                this.gameGrid[x][i].userData.locked = false;
                //Set texture back to normal, non debug texture.
                //this.gameGrid[x][i].material.map = this.blockTextures[this.gameGrid[x][i].userData.blockType];
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
	        this.stopQueue++;
            this.dropBlocksStartingAtPoint(x,y-1);
        }
    }else{
	    this.checkForMatches();
    }
};

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
	return (y*this.blockHeight)+(this.blockHeight/2)
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
	this.rowsCreated++;
};

PuzzleGame.prototype.generateNextRowMeshArray = function(){
    var meshes = [];
    var geometry = new THREE.BoxGeometry(this.blockWidth,this.blockHeight,this.blockDepth );
    var keys = Object.keys(this.blockTextures);
    for(var x = 0; x < this.boardWidth; x++) {
        var blockType = keys[ (keys.length-this.handicap) * Math.random() << 0];
        var adjustedColor = new THREE.Color(this.blockColors[blockType]);
        adjustedColor.add( new THREE.Color(0x505050));
        var material = new THREE.MeshBasicMaterial( { color: adjustedColor,map:this.blockTextures[blockType],transparent:true,opacity:1});
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
    var material = new THREE.MeshBasicMaterial({color: this.blockColors[blockType],map:this.blockTextures[blockType]});
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

PuzzleGame.prototype.getBlockAt = function(x,y){
	x = (x+this.boardWidth)%this.boardWidth;
	y = (y+this.boardHeight)%this.boardHeight;
	if(x in this.gameGrid === false  || y in this.gameGrid[x] === false || this.gameGrid[x][y] === null){
		return false;
	}
	return this.gameGrid[x][y];
};

PuzzleGame.prototype.generateMap = function(colorPoolIn,heightPercent){
	var grid = [];
	for(var gx =0;gx<this.boardWidth;gx++){
		var column = [];
		for(var gy =0;gy<this.boardHeight;gy++) {
			column.push(null);
		}
		grid.push(column);
	}

	for(var x =0;x<this.boardWidth;x++){
		for(var y =0;y<this.boardHeight;y++) {

			if(y > this.boardHeight*heightPercent){
				grid[x][y] = null;
				continue;
			}

			var colorPool = colorPoolIn.slice(0);
			var lastXType = '';
			var lastYType = '';

			for(var i=-2;i<=2;i++){
				if(i == 0){
					continue;
				}

				var nextXBlock = grid[(x-i+this.boardWidth)%this.boardWidth][y];

				if(nextXBlock !== null){
					var xType = nextXBlock;
					var xPos = colorPool.indexOf(xType);
					if(xType == lastXType && xPos !== -1 && colorPool.length > 1){
						colorPool.splice(xPos, 1);
					}
					lastXType = xType;
				}
				var nextYBlock = grid[x][(y-i+this.boardHeight)%this.boardHeight];

				if(nextYBlock !== null){
					var yType = nextYBlock;
					var yPos = colorPool.indexOf(yType);
					if(yType == lastYType && yPos !== -1 && colorPool.length > 1){
						colorPool.splice(yPos,1);
					}
					lastYType = yType;
				}
			}
			grid[x][y] = colorPool[Math.floor(Math.random()*colorPool.length)];
		}
	}
	return grid;
};

PuzzleGame.prototype.cylinder = function(mapArray){
    var blocks = new THREE.Object3D();
	var colorPool = [];
    var allColors = Object.keys(this.blockColors);
    for(var i=0;i<allColors.length - this.handicap;i++){
    	colorPool.push(allColors[i]);
    }

	var goodMap = this.generateMap(colorPool,0.3);

    for(var x = 0; x < this.boardWidth; x++) {
        var column = [];
        this.stackHeights[x] = this.boardHeight;
        for (var y = 0; y < this.boardHeight; y++) {

        	//var invalidBlockTypes = array();

            var blockType = goodMap[x][y];//colorPool[Math.floor(Math.random()*colorPool.length)];
			//console.log('chose '+blockType);
	        //console.log('==========================');

	        /*
            if(mapArray){
                if(!mapArray[y] || !mapArray[y][x] || mapArray[y][x] == '-'){
                    column.push(null);
                    continue;
                }
                if(mapArray[y][x] != '?') {
                    blockType = allColors[mapArray[y][x]];
                }
            }else if(y>Math.floor(this.boardHeight*0.40)){
                column.push(null);
                continue;
            }
            */
	        if(blockType == null){
	        	column.push(null);
	        }else{
		        var mesh = this.generateBlockMesh(blockType,x,y);
		        column.push(mesh);
		        blocks.add(mesh);
	        }
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
    this.nextRow.position.y = this.calcYBlockPos(-1)-this.halfBoardPixelHeight-(this.blockHeight/2)+this.upOffset;
};

PuzzleGame.prototype.animate = function(){
    requestAnimationFrame(this.animate.bind(this));
    this.stats.begin();
    this.render();
    this.stats.end();
};

PuzzleGame.prototype.gameAnimations = function(){

	if(!this.gameActive){
		return;
	}

	var almostDead = false;
	for(var tx = 0;tx<this.boardWidth;tx++){
		if(this.gameGrid[tx][this.boardHeight-10] !== null){
			almostDead = true;
			break;
		}
	}

	var sThis = this;

	this.gameBoard.traverse(function(block){
		if(almostDead){
			//console.log(block);
			//block.quaternion.x = block.position.x;
			//block.quaternion.y = block.position.y;
			//block.quaternion.z = block.position.z;
			//console.log(block.quaternion.y);
			//block.quaternion.z.setFromAxisAngle(block.position,0.0001*Math.sin(sThis.piTimer));
		}
		if(block.userData.exploding){
			//block.rotation.y = timer * 0.01;
			block.scale.x = block.scale.y =  (0.1*Math.sin(sThis.piTimer*16)+0.8);
			//block.rotation.x = timer * 0.01;
		}
	});

	this.cursorObj.traverse(function(cursor){
		cursor.scale.x = cursor.scale.y = (0.05*Math.sin(sThis.piTimer)+1);
	});
};

PuzzleGame.prototype.render = function() {
    TWEEN.update();
	var timer = performance.now();
	this.gameAnimations();
	this.renderer.render(this.scene,this.camera);
    this.piTimer+=0.05;
    if(this.piTimer > TWO_PI){
        this.piTimer = 0;
    }
};