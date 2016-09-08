define([
	'common/physics/physicsObject',
	'common/physics/vector2'
], function (PhysicsObject, Vector) {
	return function (inputSystem, name, color, isLocal) {
		this.name = name;
		this.color = color;
		this.hp = 100;
		this.radius = 8;
		this.physics = new PhysicsObject();
		this.inputSystem = inputSystem;
		this.rotation = 0;
		this.localPlayer = isLocal | false;

		this.lastUpdateTime = 0; // server only

		this.update = function (delta, game) {
			if (this.inputSystem.inputState.KEY_RIGHT) {
				this.physics.velocity.x += 0.005;
			}
			if (this.inputSystem.inputState.KEY_LEFT) {
				this.physics.velocity.x -= 0.005;
			}
			if (this.inputSystem.inputState.KEY_UP) {
				this.physics.velocity.y -= 0.005;
			}
			if (this.inputSystem.inputState.KEY_DOWN) {
				this.physics.velocity.y += 0.005;
			}

			if (this.physics.position.x < 0) {
				this.physics.position.x = 0;
				this.physics.velocity.x *= -0.5;
			}
			if (this.physics.position.x > game.width) {
				this.physics.position.x = game.width;
				this.physics.velocity.x *= -0.5;
			}
			if (this.physics.position.y < 0) {
				this.physics.position.y = 0;
				this.physics.velocity.y *= -0.5;
			}
			if (this.physics.position.y > game.height) {
				this.physics.position.y = game.height;
				this.physics.velocity.y *= -0.5;
			}

			this.physics.update(delta);
		}

		// client only
		this.render = function (context) {
			var r = this.radius;
			context.beginPath();
			var p1 = new Vector(r, -r).rotate(this.rotation - Math.PI / 2).add(this.physics.position);
			var p2 = new Vector(0, r * 2).rotate(this.rotation - Math.PI / 2).add(this.physics.position);
			var p3 = new Vector(-r, -r).rotate(this.rotation - Math.PI / 2).add(this.physics.position);
			context.moveTo(p1.x, p1.y);
			context.lineTo(p2.x, p2.y);
			context.lineTo(p3.x, p3.y);
			context.fillStyle = '#' + (this.color&0xffffff).toString(16);
			context.fill();
			context.closePath();

			context.font="12px Georgia";
			context.fillText(this.name, this.physics.position.x - 30, this.physics.position.y - 20);
		}

		this.getPos = function () {
			return this.physics.position;
		}

		this.getVel = function () {
			return this.physics.velocity;
		}

		this.setPos = function (x, y) {
			this.physics.position.x = x;
			this.physics.position.y = y;
		}

		this.setVel = function (x, y) {
			this.physics.velocity.x = x;
			this.physics.velocity.y = y;
		}
	};
});
