class PuzzleScore{
	/**
	 * @param {PuzzleGame} PuzzleGame
	 * */
	constructor(PuzzleGame){
		this.PuzzleGame = PuzzleGame;

		this.scoreGroup = new THREE.Group();
		this.PuzzleGame.scene.add(this.scoreGroup);

		this.canvas = document.createElement('canvas');//document.getElementById('canvas');
		this.ctx = this.canvas.getContext('2d');


		this.texture = new THREE.Texture(this.canvas);

		PuzzleUtils.sharpenTexture(this.PuzzleGame.renderer,this.texture, true);

		let material = new THREE.MeshBasicMaterial({ map: this.texture });
		let geometry = new THREE.PlaneGeometry(128, 256);
		let mesh = new THREE.Mesh( geometry, material );
		this.scoreGroup.add( mesh );

		this.canvas.width = 128;
		this.canvas.height = 256;

		this.scoreGroup.visibile = false;
		this.scoreGroup.rotation.y = -HALF_PI;
	}

	animate(){
		this.ctx.font = '12pt Roboto';
		this.ctx.fillStyle = '#607D8B';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = 'white';
		this.ctx.textAlign = "Left";

		this.ctx.fillText("Score", 5,20);
		this.ctx.fillText(this.PuzzleGame.tower.stats.score+"", 5,40);
		this.ctx.fillText("Matches", 5,60);
		this.ctx.fillText(this.PuzzleGame.tower.stats.matches+"", 5,80);
		this.ctx.fillText("Rows", 5,100);
		this.ctx.fillText(this.PuzzleGame.tower.stats.rowsCreated+"", 5,120);
		this.ctx.fillText("Chain / Max", 5,140);
		this.ctx.fillText(this.PuzzleGame.tower.stats.chainCount + " / " + this.PuzzleGame.tower.stats.highestChain, 5,160);
		this.ctx.fillText("Difficulty", 5,180);
		this.ctx.fillText(this.PuzzleGame.DIFFICULTIES()[this.PuzzleGame.tower.difficulty], 5,200);
		this.ctx.fillText("Speed Level", 5,220);
		this.ctx.fillText(Math.floor(100-this.PuzzleGame.tower.pushDelay)+"", 5,240);
		this.texture.needsUpdate = true;
	}

	showScoreBoard(){
		this.scoreGroup.visible = true;
		new TWEEN.Tween(this.scoreGroup.rotation).to({
			y:0
		},1000).easing(TWEEN.Easing.Quintic.Out).start();
	}

	hideScoreBoard(){
		new TWEEN.Tween(this.scoreGroup.rotation).to({
			y: -HALF_PI
		},1000)
		.easing(TWEEN.Easing.Quintic.In)
		.start()
		.onComplete(() => {
			this.scoreGroup.visible = false;
		});
	}
}