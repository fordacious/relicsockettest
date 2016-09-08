var boundsBuffer = 20;
define(['common/physics/physicsObject'], function (PhysicsObject) {
	function rotatePoint (x, y, amount) {
		var cos = Math.cos(amount);
		var sin = Math.sin(amount);
		return {x: cos * x - sin * y, y: sin * y + cos * y};
	}

	function addPoint(p1, p2){
		return {x: p1.x + p2.x, y: p1.y + p2.y}
	}

	return function (color) {
		this.color = color;
		this.physics = new PhysicsObject();
		this.destroyed = false;
		this.radius = Math.random()*2 + 1;
		this.rotation = Math.random()*2*Math.PI;
		this.dir = Math.random() < 0.5 ? 1 : -1;
		this.alpha = Math.random();

		this.update = function (delta, game) {
			this.physics.update(delta);
			this.rotation += this.physics.velocity.magnitude() * this.dir;
			var pos = this.physics.position;
			if (pos.x < -boundsBuffer || pos.x > game.width + boundsBuffer ||
				pos.y < -boundsBuffer || pos.y > game.height + boundsBuffer) {
				this.destroyed = true;
			}
			// TODO hit detection
		}

		// client only
		this.render = function (context) {
			var r = this.radius;
			context.save();
			context.globalAlpha = this.alpha;
			context.beginPath();
			context.moveTo(-r + this.physics.position.x, -r + this.physics.position.y);
			context.lineTo(-r + this.physics.position.x, r + this.physics.position.y);
			context.lineTo(r + this.physics.position.x, r + this.physics.position.y);
			context.lineTo(r + this.physics.position.x, -r + this.physics.position.y);
			context.fillStyle = '#' + (this.color&0xffffff).toString(16);
			context.fill();
			context.closePath();
			context.restore();
		}
	};
});
