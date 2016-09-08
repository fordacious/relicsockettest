global.requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname + '/../',
	nodeRequire: require
});

var Server = require('../server/server');

function main () {
	console.log("starting test server");

	var server = new Server();
	server.start();
}

main();