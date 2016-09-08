var URL = 'ws:127.0.0.1:8001'

requirejs.config({
    baseUrl: '../',
});

function runGame (timestamp) {
    var delta = timestamp - lastTimestamp;
    this.lastTimestamp = timestamp;
    if (delta > 0){
        this.game.update(delta);
        this.game.updateClientOnly(delta);
        this.game.render();
    }
    window.requestAnimationFrame(runGame.bind(this));
}

require([
    '../client/webInputSystem',
    '../client/stubInputSystem',
    '../common/game',
    '../common/player',
    '../common/netutils'
],
function (WebInputSystem, StubInputSystem, Game, Player, NetUtils) {
    this.lastTimestamp = Date.now();
    this.game = null;

    // TODO move to module
    var gameSocket = new WebSocket(URL);

    var session = {};
    session[NetUtils.events.S_GAME_STATE_SNAPSHOT] = function (gameSnapshot, playerId) {
        this.game = new Game(gameSnapshot.width, gameSnapshot.height);
        // TODO add the other players
        for (var index in gameSnapshot.players) {
            var playerInfo = gameSnapshot.players[index];
            var inputSystem;
            var isLocal = false;
            if (playerId == playerInfo.playerId) {
                inputSystem = new WebInputSystem(gameSocket, function (x, y){
                    var player = this.game.players[playerId];
                    var pos = player.getPos();
                    player.rotation = Math.atan2(y - pos.y, x - pos.x);
                }.bind(this));
                isLocal = true;
            } else {
                inputSystem = new StubInputSystem();
            }
            this.game.addPlayer(playerInfo.playerId, new Player(inputSystem, playerInfo.name, playerInfo.color, isLocal));
        }
        // TODO apply player properties
        this.lastTimestamp = Date.now();
        runGame.call(this);
    }
    session[NetUtils.events.S_PLAYER_JOIN] = function (playerId, name, color) {
        // TODO interp input system?
        this.game.addPlayer(playerId, new Player(new StubInputSystem(), name, color));
    }
    session[NetUtils.events.S_PLAYER_LEAVE] = function (playerId) {
        this.game.removePlayer(playerId);
    }
    session[NetUtils.events.S_PLAYER_DIE] = function () {
        // TODO
    }
    session[NetUtils.events.S_OBJECT_POSITION_UPDATE] = function (playerId, position, velocity, rotation) {
        var player = this.game.players[playerId];
        player.setPos(position.x, position.y);
        player.setVel(velocity.x, velocity.y);
        if (player.localPlayer == false) {
            player.rotation = rotation;
        }
    }
    session[NetUtils.events.S_PLAYER_FIRE_WEAPON] = function (playerId, x, y) {
        this.game.playerFireWeapon(playerId, x, y);
    }
    // TODO move to game
    session[NetUtils.events.S_PLAYER_HIT] = function (playerId, bulletIndex) {
        this.game.bullets[bulletIndex].destroyed = true;
        this.game.damagePlayerClient(playerId);
    }

    var connected = false;
    gameSocket.addEventListener("message", function (message) {
        var parsedMessage = JSON.parse(message.data);
        console.log("recieved ", parsedMessage);
        if (!connected && parsedMessage.type === NetUtils.events.S_CONNECTION_ACCEPTED) {
            NetUtils.send(gameSocket, NetUtils.events.C_GAME_JOIN_REQUEST, ["test " + Math.round(Math.random() * 1000), Math.random()*0xFFFFFF]);
            connected = true;
        } else {
            for (eventName in session) {
                if (parsedMessage.type === eventName) {
                    return session[eventName].apply(this, parsedMessage.args);
                }
            }
        }
    }.bind(this));
});