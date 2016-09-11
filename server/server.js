var tickLengthInMS = 1000 / 60;
var playerUpdateFrequency = 1000 / 5;

var ws = require("nodejs-websocket");
var SocketInputSystem = require("../server/socketInputSystem");

var Game = requirejs('./common/game');
var Player = requirejs('./common/player');
var NetUtils = requirejs('./common/netutils');

function PlayerSession(conn, playerId) {
    var session = {};

    session[NetUtils.events.C_GAME_JOIN_REQUEST] = function (name, color) {
        NetUtils.broadcast(this.connections, NetUtils.events.S_PLAYER_JOIN, [playerId, name, color]);
        this.connections[playerId] = conn;
        var inputSystem = new SocketInputSystem(conn);
        inputSystem.onFireWeaponKeyChange = function (x, y) {
            if (!inputSystem.inputState.KEY_FIRE_WEAPON) { return; }
            // TODO replace with events
            this.game.playerFireWeapon(playerId, x, y);
            NetUtils.broadcast(this.connections, NetUtils.events.S_PLAYER_FIRE_WEAPON, [playerId, x, y]);
        }.bind(this);
        var player = new Player(inputSystem, name, color);
        player.setPos(Math.random()*this.game.width, Math.random()*this.game.height);
        this.game.addPlayer(playerId, player);
        NetUtils.send(conn, NetUtils.events.S_GAME_STATE_SNAPSHOT, [this.game.getSnapshot(), playerId]);
    }

    session[NetUtils.events.C_PLAYER_ORIENTATION] = function (x, y) {
        var player = this.game.players[playerId];
        var pos = player.getPos();
        player.rotation = Math.atan2(y - pos.y, x - pos.x);
    }

    return session;
}

module.exports = function () {
    this.game = new Game(800, 600);
    this.connections = {};

    this.server = ws.createServer(function (conn) {
        console.log("New connection", conn.headers.origin)

        var playerId = Math.random() + ":" + Date.now();

        var session = PlayerSession(conn, playerId);
        conn.on("text", function (message) {
            var parsedMessage = JSON.parse(message);
            console.log("recieved " + parsedMessage.type);
            for (eventName in session) {
                if (eventName === parsedMessage.type) {
                    session[eventName].apply(this, parsedMessage.args);
                }
            }
        }.bind(this));

        // TODO close game on all players leave
        conn.on("close", function (code, reason) {
            console.log(conn.headers.origin);
            delete this.connections[playerId];
            this.game.removePlayer(playerId);
            NetUtils.broadcast(this.connections, NetUtils.events.S_PLAYER_LEAVE, [playerId]);
            console.log("Connection closed " + conn.headers.origin);
        }.bind(this));

        conn.on("error", function (){});

        // send first ping
        NetUtils.send(conn, NetUtils.events.S_CONNECTION_ACCEPTED);
    }.bind(this));

    this.start = function () {
        console.log("listening on 8001");
        return this.server.listen(8001);
    }

    this.stop = function () {
        // TODO
    }

    this._lastUpdate = Date.now();
    this._nextUpdateTime = this._lastUpdate + tickLengthInMS;
    this._firstUpdateTime = this._lastUpdate;
    this._updateNum = 0;
    this.gameLoop = function () {
        var delta = Date.now() - this._lastUpdate;
        this._lastUpdate = Date.now();
        //this._nextUpdateTime = this._lastUpdate + tickLengthInMS;

        this.game.update(delta);
        this.game.updateServerOnly(delta, this.connections);

        var now = Date.now();
        for (var playerId in this.game.players) {
            var player = this.game.players[playerId];
            if (now - player.lastUpdateTime > playerUpdateFrequency) {
                // TODO if this becomes a problem, pack all players into one broadcast
                NetUtils.broadcast(this.connections, NetUtils.events.S_OBJECT_POSITION_UPDATE,
                    [playerId, player.getPos(), player.getVel(), player.rotation]);
                player.lastUpdateTime = now;
            }
        }
        
        this._updateNum += 1;
        var nextUpdateTime = this._firstUpdateTime + tickLengthInMS * this._updateNum;
        
        setTimeout(this.gameLoop.bind(this), nextUpdateTime - Date.now());
    }

    this.gameLoop();
};