define(['common/physics/vector2'], function(Vector){
    var PHYS_TIME_SCALE = 1;
    return function () {
        this.position = new Vector();
        this.velocity = new Vector();
        this.acceleration = new Vector();
        this.update = function (delta) {
            this.velocity.x += this.acceleration.x * delta * PHYS_TIME_SCALE;
            this.velocity.y += this.acceleration.y * delta * PHYS_TIME_SCALE;
            this.position.x += this.velocity.x * delta * PHYS_TIME_SCALE;
            this.position.y += this.velocity.y * delta * PHYS_TIME_SCALE;
        }
    };
});
