define([
    'common/physics/physicsObject'
], function (PhysicsObject) {
    return function (player) {
        this.owner = player;
        this.physics = new PhysicsObject();
        this.destroyed = false;
        this.radius = 3;

        this.update = function (delta, game) {
            if (this.destroyed) { return; }
            this.physics.update(delta);
            var pos = this.physics.position;
            if (pos.x < 0 || pos.x > game.width || pos.y < 0 || pos.y > game.height) {
                this.destroyed = true;
            }
            // TODO hit detection
        }

        // client only
        this.render = function (context) {
            var centerX = this.physics.position.x;
            var centerY = this.physics.position.y;
            context.beginPath();
            context.arc(centerX, centerY, this.radius, 0, 2 * Math.PI, false);
            context.fillStyle = '#' + (this.owner.color&0xffffff).toString(16);
            context.fill();
        }
    };
});
