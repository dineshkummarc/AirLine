var Animation = (function() {
	function draw(animation, image, p0, p1, p2, p3) {
		return function() {
			var context = animation.context,
				canvas = animation.canvas,
				movement = animation.movement;

			context.clearRect(0, 0, canvas.width, canvas.height);

			context.lineWidth = 3;
			context.strokeStyle = '#000';
			context.beginPath();
			context.moveTo(p0.x, p0.y);
			context.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
			context.stroke();

			var t = movement.t;
			var cx = 3 * (p1.x - p0.x);
			var bx = 3 * (p2.x - p1.x) - cx;
			var ax = p3.x - p0.x - cx - bx;

			var cy = 3 * (p1.y - p0.y);
			var by = 3 * (p2.y - p1.y) - cy;
			var ay = p3.y - p0.y - cy - by;

			var xt = ax * (t * t * t) + bx * (t * t) + cx * t + p0.x;
			var yt = ay * (t * t * t) + by * (t * t) + cy * t + p0.y;

			movement.t += movement.speed;

			if (animation.movement.t > 1) animation.stop();

			context.drawImage(image, xt - image.width / 2, yt - image.height / 2);
		};
	}

	function Animation(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.movement = {
			speed: 0.01,
			t: 0
		};
	}

	Animation.prototype.stop = function() {
		if (this.draw_timer) {
			clearInterval(this.draw_timer);
		}
	};

	function calculateCenterPoint(startPosition, endPosition) {
		var distance = Math.sqrt(
		(startPosition.x - endPosition.x) * (startPosition.x - endPosition.x) + (startPosition.y - endPosition.y) * (startPosition.y - endPosition.y));

		return startPosition.x < endPosition.x ? {
			x: distance / 4 + startPosition.x,
			y: startPosition.y - distance / 2
		} : {
			x: distance / 4 + endPosition.x,
			y: endPosition.y - distance / 2
		};
	}

	Animation.prototype.action = function(startPosition, endPosition, image) {
		this.stop();
		this.movement.t = 0;

		var p0 = {
			x: startPosition.x,
			y: startPosition.y
		};

		var p1, p2;
		p1 = p2 = calculateCenterPoint(startPosition, endPosition);

		var p3 = {
			x: endPosition.x,
			y: endPosition.y
		};
		this.draw_timer = setInterval(draw(this, image, p0, p1, p2, p3), 33);
	};

	return Animation;
})();
