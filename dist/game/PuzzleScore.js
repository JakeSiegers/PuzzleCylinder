'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PuzzleScore = function () {
		/**
   * @param {PuzzleGame} PuzzleGame
   * */
		function PuzzleScore(PuzzleGame) {
				_classCallCheck(this, PuzzleScore);

				this.PuzzleGame = PuzzleGame;

				this.scoreGroup = new THREE.Group();
				this.PuzzleGame.scene.add(this.scoreGroup);

				this.canvas = document.createElement('canvas'); //document.getElementById('canvas');
				this.ctx = this.canvas.getContext('2d');

				this.texture = new THREE.Texture(this.canvas);
				var material = new THREE.MeshBasicMaterial({ map: this.texture });
				var geometry = new THREE.PlaneGeometry(128, 256);
				var mesh = new THREE.Mesh(geometry, material);
				this.scoreGroup.add(mesh);

				this.canvas.width = 128;
				this.canvas.height = 256;

				this.scoreGroup.visibile = false;
				this.scoreGroup.rotation.y = -HALF_PI;
		}

		_createClass(PuzzleScore, [{
				key: 'animate',
				value: function animate() {
						this.ctx.font = '12pt Roboto';
						this.ctx.fillStyle = '#607D8B';
						this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
						this.ctx.fillStyle = 'white';
						this.ctx.textAlign = "Left";

						this.ctx.fillText("Score", 5, 20);
						this.ctx.fillText(this.PuzzleGame.tower.score + "", 5, 40);
						this.ctx.fillText("Matches", 5, 60);
						this.ctx.fillText(this.PuzzleGame.tower.matches + "", 5, 80);
						this.ctx.fillText("Rows", 5, 100);
						this.ctx.fillText(this.PuzzleGame.tower.rowsCreated + "", 5, 120);
						this.ctx.fillText("Chain / Max", 5, 140);
						this.ctx.fillText(this.PuzzleGame.tower.chainCount + " / " + this.PuzzleGame.tower.highestChain, 5, 160);
						this.ctx.fillText("Difficulty", 5, 180);
						this.ctx.fillText(DIFFICULTIES[this.PuzzleGame.tower.difficulty], 5, 200);
						this.ctx.fillText("Speed Level", 5, 220);
						this.ctx.fillText(Math.floor(100 - this.PuzzleGame.tower.pushDelay) + "", 5, 240);

						//this.texture.needsUpdate = true;
				}
		}, {
				key: 'showScoreBoard',
				value: function showScoreBoard() {
						this.scoreGroup.visibile = true;

						this.scoreGroup.rotation.x = 0;

						new TWEEN.Tween(this.scoreGroup.rotation).to({
								y: 0
						}, 1000).easing(TWEEN.Easing.Quintic.Out).start();
				}
		}]);

		return PuzzleScore;
}();