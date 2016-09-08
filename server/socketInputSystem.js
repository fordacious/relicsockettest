var NetUtils = requirejs('common/netutils');
var InputState = requirejs('common/inputState');

function InputSession(conn) {
    var session = {};

    // TODO broadcast these to other players somehow
    session[NetUtils.events.C_FIRE_WEAPON] = function (isDown, x, y) {
        old = this.inputState.KEY_FIRE_WEAPON;
        this.inputState.KEY_FIRE_WEAPON = isDown;
        if (old !== isDown) {
            this.onFireWeaponKeyChange(x, y);
        }
    };
    session[NetUtils.events.C_BOOST] = function (isDown) {
        old = this.inputState.KEY_BOOST;
        this.inputState.KEY_BOOST = isDown;
        if (old !== isDown) {
            this.onBoostKeyChange();
        }
    };
    session[NetUtils.events.C_LEFT] = function (isDown) {
        old = this.inputState.KEY_LEFT;
        this.inputState.KEY_LEFT = isDown;
        if (old !== isDown) {
            this.onLeftKeyChange();
        }
    };
    session[NetUtils.events.C_RIGHT] = function (isDown) {
        console.log("right " + isDown);
        old = this.inputState.KEY_RIGHT;
        this.inputState.KEY_RIGHT = isDown;
        if (old !== isDown) {
            this.onRightKeyChange();
        }
    };
    session[NetUtils.events.C_UP] = function (isDown) {
        old = this.inputState.KEY_UP;
        this.inputState.KEY_UP = isDown;
        if (old !== isDown) {
            this.onUpKeyChange();
        }
    };
    session[NetUtils.events.C_DOWN] = function (isDown) {
        old = this.inputState.KEY_DOWN;
        this.inputState.KEY_DOWN = isDown;
        if (old !== isDown) {
            this.onDownKeyChange();
        }
    };
    session[NetUtils.events.C_BRAKE] = function (isDown) {
        old = this.inputState.KEY_BRAKE;
        this.inputState.KEY_BRAKE = isDown;
        if (old !== isDown) {
            this.onBrakeKeyChange();
        }
    };

    return session;
}

module.exports = function (connection) {
    this.connection = connection;
    this.onFireWeaponKeyChange = function () {};
    this.onBoostKeyChange = function () {};
    this.onLeftKeyChange = function () {};
    this.onRightKeyChange = function () {};
    this.onUpKeyChange = function () {};
    this.onDownKeyChange = function () {};
    this.onBrakeKeyChange = function () {};

    this.inputState = new InputState();

    var session = InputSession();

    connection.on("text", function (message) {
        var parsedMessage = JSON.parse(message);
        console.log(parsedMessage);
        for (eventName in session) {
            if (eventName === parsedMessage.type) {
                session[eventName].apply(this, parsedMessage.args);
            }
        }
    }.bind(this));
}