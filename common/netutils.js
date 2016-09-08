define(function(){
	var serverEvents = [
		"S_CONNECTION_ACCEPTED",
		"S_PLAYER_JOIN",
		"S_PLAYER_LEAVE",
		"S_PLAYER_DIE",
		"S_PLAYER_HIT",
		"S_PLAYER_FIRE_WEAPON",
		"S_PLAYER_BOOST",
		"S_GAME_STATE_SNAPSHOT",
		"S_OBJECT_POSITION_UPDATE",
	];

	var clientEvents = [
		"C_GAME_JOIN_REQUEST",
		"C_PLAYER_INFO",
		"C_FIRE_WEAPON",
		"C_PLAYER_ORIENTATION",
		"C_BOOST",
		"C_LEFT",
		"C_RIGHT",
		"C_UP",
		"C_DOWN",
		"C_BRAKE"
	];

	function preparenames (obj) {
		res = {};
		for (i in obj) {
			res[obj[i]] = obj[i];
		}
		return res;
	}

	return {
		send: function(conn, type, args) {
			console.log("sending " + type);
			conn.send(JSON.stringify({
				type: type,
				args: args
			}));
		},
		broadcast: function (connections, type, args) {
			for (var playerId in connections) {
				this.send(connections[playerId], type, args || []);
			}
		},
		events: preparenames(serverEvents.concat(clientEvents)),
	};
});