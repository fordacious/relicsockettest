define(function () {
	return function Vector2 (x, y) {
		this.x = x | 0;
		this.y = y | 0;
		this.magnitude = function () {
			return Math.sqrt(this.x*this.x+this.y*this.y);
		}
		this.rotate = function (amount) {
			var cos = Math.cos(amount);
			var sin = Math.sin(amount);
			var x = this.x;
			var y = this.y;
			return new Vector2(cos*x - sin*y, sin*x + cos*y);
		}
		this.add = function (p2){
			return new Vector2(this.x + p2.x, this.y + p2.y);
		}
		// TODO functions
	}
});