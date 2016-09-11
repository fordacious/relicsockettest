/*
http://localhost:8080/client/index.html?ip=127.0.0.1:8001&name=test&color=0xFF0000
*/
var URL = 'ws:' + QueryString().ip;
var COLOR = QueryString().color;
if (!parseInt(COLOR) || parseInt(COLOR) === 0)
{
    COLOR = Math.random()*0xFFFFFF;
}
var NAME = QueryString().name;

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

function QueryString () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
};

require([
    'client/webInputSystem',
    'client/stubInputSystem',
    'common/game',
    'common/player',
    'common/netutils'
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
                // TODO could have the input system recieve from server
                inputSystem = new StubInputSystem();
            }
            var player = new Player(inputSystem, playerInfo.name, playerInfo.color, isLocal);
            player.hp = playerInfo.hp;
            this.game.addPlayer(playerInfo.playerId, player);
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
    session[NetUtils.events.S_PLAYER_DIE] = function (playerId, x, y) {
        this.game.respawnPlayer(playerId, x, y);
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
        // TODO may not be able to use bulletIndex
        this.game.bullets[bulletIndex].destroyed = true;
        this.game.damagePlayerClient(playerId);
    }

    var connected = false;
    gameSocket.addEventListener("message", function (message) {
        var parsedMessage = JSON.parse(message.data);
        console.log("recieved ", parsedMessage);
        if (!connected && parsedMessage.type === NetUtils.events.S_CONNECTION_ACCEPTED) {
            NetUtils.send(gameSocket, NetUtils.events.C_GAME_JOIN_REQUEST, [NAME, parseInt(COLOR)]);
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