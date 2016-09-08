var orientationBufferTime = 1000 / 5;

define([
	'common/netutils',
	'common/inputState'
],function (NetUtils, InputState) {
	return function (gameSocket, onMouseMoveCallback) { // TODO event instead of callback
		this.inputState = new InputState();

		this.lastOrientationEventTime = 0;

		// TODO attach and detatch
		window.addEventListener("mousedown", onMouseDown.bind(this), false);
		window.addEventListener("mouseup", onMouseUp.bind(this), false);
		window.addEventListener("mousemove", onMouseMove.bind(this), false);
		window.addEventListener("keydown", onKeyDown.bind(this), false);
		window.addEventListener("keyup", onKeyUp.bind(this), false);

		function onMouseDown (e) {
			NetUtils.send(gameSocket, NetUtils.events.C_FIRE_WEAPON, [true, e.pageX, e.pageY]);
		}

		function onMouseUp (e) {
			NetUtils.send(gameSocket, NetUtils.events.C_FIRE_WEAPON, [false, e.pageX, e.pageY]);
		}

		// TODO fire off every couple of frames
		function onMouseMove (e) {
			var now = Date.now();
			if (now - this.lastOrientationEventTime > orientationBufferTime) {
				NetUtils.send(gameSocket, NetUtils.events.C_PLAYER_ORIENTATION, [e.pageX, e.pageY]);
				this.lastOrientationEventTime = now;
			}
			onMouseMoveCallback(e.pageX, e.pageY);
		}

		function onKeyDown(event) {
		  var keyCode = event.keyCode;
		  switch (keyCode) {
		    case 68: //d
		      old = this.inputState.KEY_RIGHT;
		      this.inputState.KEY_RIGHT = true;
		      if (old !== this.inputState.KEY_RIGHT) {
		      	NetUtils.send(gameSocket, NetUtils.events.C_RIGHT, [this.inputState.KEY_RIGHT]);
		      }
		      break;
		    case 83: //s
		      old = this.inputState.KEY_DOWN;
		      this.inputState.KEY_DOWN = true;
		      if (old !== this.inputState.KEY_DOWN) {
		      	NetUtils.send(gameSocket, NetUtils.events.C_DOWN, [this.inputState.KEY_DOWN]);
		      }
		      break;
		    case 65: //a
		      old = this.inputState.KEY_LEFT;
		      this.inputState.KEY_LEFT = true;
		      if (old !== this.inputState.KEY_LEFT) {
		      	NetUtils.send(gameSocket, NetUtils.events.C_LEFT, [this.inputState.KEY_LEFT]);
		      }
		      break;
		    case 87: //w
		      old = this.inputState.KEY_UP;
		      this.inputState.KEY_UP = true;
		      if (old !== this.inputState.KEY_UP) {
		      	NetUtils.send(gameSocket, NetUtils.events.C_UP, [this.inputState.KEY_UP]);
		      }
		      break;
		  }
		};

		function onKeyUp(event) {
		  var keyCode = event.keyCode;

		  switch (keyCode) {
		    case 68: //d
		      old = this.inputState.KEY_RIGHT;
		      this.inputState.KEY_RIGHT = false;
		      if (old !== this.inputState.KEY_RIGHT) {
		      	NetUtils.send(gameSocket, NetUtils.events.C_RIGHT, [this.inputState.KEY_RIGHT]);
		      }
		      break;
		    case 83: //s
		      old = this.inputState.KEY_DOWN;
		      this.inputState.KEY_DOWN = false;
		      if (old !== this.inputState.KEY_DOWN) {
		      	NetUtils.send(gameSocket, NetUtils.events.C_DOWN, [this.inputState.KEY_DOWN]);
		      }
		      break;
		    case 65: //a
		      old = this.inputState.KEY_LEFT;
		      this.inputState.KEY_LEFT = false;
		      if (old !== this.inputState.KEY_LEFT) {
		      	NetUtils.send(gameSocket, NetUtils.events.C_LEFT, [this.inputState.KEY_LEFT]);
		      }
		      break;
		    case 87: //w
		      old = this.inputState.KEY_UP;
		      this.inputState.KEY_UP = false;
		      if (old !== this.inputState.KEY_UP) {
		      	NetUtils.send(gameSocket, NetUtils.events.C_UP, [this.inputState.KEY_UP]);
		      }
		      break;
		  }
		};
	};
});