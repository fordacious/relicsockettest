var orientationBufferTime = 1000 / 5;

define([
    'common/netutils',
    'common/inputState'
],function (NetUtils, InputState) {
    return function (gameSocket, onMouseMoveCallback) { // TODO event instead of callback
        this.inputState = new InputState();

        this.lastOrientationEventTime = 0;

        // TODO attach and detatch
        // TOOD AI player
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

        function keyControl(is, key, down, event) {
              old = is[key];
              is[key] = down;
              if (old !== is.key) {
                  NetUtils.send(gameSocket, event, [is[key]]);
              }
        }

        // TODO proper key binding
        function onKeyDown(event) {
          var keyCode = event.keyCode;
          console.log (keyCode);
          switch (keyCode) {
            case 68: //d
              keyControl(this.inputState, 'KEY_RIGHT', true, NetUtils.events.C_RIGHT);
              break;
            case 83: //s
              keyControl(this.inputState, 'KEY_DOWN', true, NetUtils.events.C_DOWN);
              break;
            case 65: //a
              keyControl(this.inputState, 'KEY_LEFT', true, NetUtils.events.C_LEFT);
              break;
            case 87: //w
              keyControl(this.inputState, 'KEY_UP', true, NetUtils.events.C_UP);
              break;
            case 32: //space
              keyControl(this.inputState, 'KEY_BOOST', true, NetUtils.events.C_BOOST);
              break;
            case 16: //shift
              keyControl(this.inputState, 'KEY_BRAKE', true, NetUtils.events.C_BRAKE);
              break;
          }
        };

        function onKeyUp(event) {
          var keyCode = event.keyCode;

          switch (keyCode) {
            case 68: //d
              keyControl(this.inputState, 'KEY_RIGHT', false, NetUtils.events.C_RIGHT);
              break;
            case 83: //s
              keyControl(this.inputState, 'KEY_DOWN', false, NetUtils.events.C_DOWN);
              break;
            case 65: //a
              keyControl(this.inputState, 'KEY_LEFT', false, NetUtils.events.C_LEFT);
              break;
            case 87: //w
              keyControl(this.inputState, 'KEY_UP', false, NetUtils.events.C_UP);
              break;
            case 32: //space
              keyControl(this.inputState, 'KEY_BOOST', false, NetUtils.events.C_BOOST);
              break;
            case 16: //shift
              keyControl(this.inputState, 'KEY_BRAKE', false, NetUtils.events.C_BRAKE);
              break;
          }
        };
    };
});