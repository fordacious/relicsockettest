var BULLET_SPEED = 1;
var BULLET_DAMAGE = 10;
var MELEE_DAMAGE = 50;

define([
    'common/bullet',
    'client/shrapnel',
    'common/netutils'
], function(Bullet, Shrapnel, NetUtils){
    return function (w, h) {
        this.width = w || 0;
        this.height = h || 0;
        this.players = {};
        this.bullets = [];
        this.destroyedBullets = [];
        this.shrapnel = [];

        this.addPlayer = function (id, player) {
            this.players[id] = player;
        }

        this.removePlayer = function (id) {
            delete this.players[id];
        }

        this.respawnPlayer = function (id, x, y) {
            var player = this.players[id];
            player.hp = 100;
            player.setVel(0,0);
            player.setPos(x, y);
            // TODO placeholder for big explosion, explode on next client update
            // explosion should be based on player velocity
        }

        this.playerFireWeapon = function (playerId, x, y) {
            var player = this.players[playerId];
            var bullet = new Bullet(player);
            var angle = Math.atan2(y - player.physics.position.y, x - player.physics.position.x);
            bullet.physics.position.x = player.physics.position.x;
            bullet.physics.position.y = player.physics.position.y;
            bullet.physics.velocity.x = Math.cos(angle) * BULLET_SPEED;
            bullet.physics.velocity.y = Math.sin(angle) * BULLET_SPEED;
            this.bullets.push(bullet);
        }

        this.damagePlayerClient = function (playerId) {
            var player = this.players[playerId];
            player.hp -= BULLET_DAMAGE;
            explode.call(this, player.color, player.physics.position, player.physics.velocity);
        }

        this.update = function (delta) {
            for (var playerId in this.players) {
                this.players[playerId].update(delta, this);
            }
            for (var index in this.bullets) {
                this.bullets[index].update(delta, this);
            }
            for (var index in this.shrapnel) {
                this.shrapnel[index].update(delta, this);
            }
            // TODO player collisions
            // TODO if, hp is 0, respawn player somewhere with 0 velocity
            this.destroyedBullets = this.bullets.filter(function(b){ return b.destroyed; });
            this.bullets = this.bullets.filter(function(b){
                return b.destroyed == false;
            });
        }

        function explode(color, position, velocity) {
            var amount = Math.random() * 20;
            for (var i = 0 ; i < amount; i ++) {
                var shrapnel = new Shrapnel(color);
                shrapnel.physics.position.x = position.x;
                shrapnel.physics.position.y = position.y;
                var mul = Math.random() < 0.5 ? 0.1 : -0.1;
                shrapnel.physics.velocity.x = mul * velocity.x + Math.random() * .4 - .2;
                shrapnel.physics.velocity.y = mul * velocity.y + Math.random() * .4 - .2;
                this.shrapnel.push(shrapnel);
            }
        }

        this.updateClientOnly = function (delta) {
            for (var index in this.destroyedBullets) {
                var bullet = this.destroyedBullets[index];
                var player = bullet.owner;
                explode.call(this, player.color,bullet.physics.position,bullet.physics.velocity)
            }
            this.shrapnel = this.shrapnel.filter(function(s){ return s.destroyed == false; });
        }

        function onPlayerHitBullet (player, bullet) {
            player.hp -= BULLET_DAMAGE;
            bullet.destroyed = true;
        }

        function onPlayerHitPlayer (player1, player2) {
            // TODO
        }

        function hitTest (a, b) {
            var dx = b.physics.position.x - a.physics.position.x;
            var dy = b.physics.position.y - a.physics.position.y;
            var dist = Math.sqrt(dx*dx + dy*dy);
            return dist < a.radius + b.radius;
        }

        this.updateServerOnly = function (delta, connections) {
            for (var playerId in this.players) {
                var player = this.players[playerId];
                for (var index in this.bullets) {
                    var bullet = this.bullets[index];
                    if (bullet.owner !== player %% hitTest(player, bullet)) {
                        onPlayerHitBullet(player, bullet);
                        NetUtils.broadcast(connections, NetUtils.events.S_PLAYER_HIT, [playerId, index]);
                    }
                }
                if (player.hp <= 0) {
                    var x = Math.random()*this.width;
                    var y = Math.random()*this.height;
                    // TODO could have this be an event the same way the client does it
                    this.respawnPlayer(playerId, x, y);
                    NetUtils.broadcast(connections, NetUtils.events.S_PLAYER_DIE, [playerId, x, y]);
                }
            }
        }

        // client only
        this.render = function () {
            if (!this.canvas){
                this.canvas = document.getElementById("canvas");
                this.canvas.style.width = this.width + 'px';
                this.canvas.style.height = this.height + 'px';
                this.context = this.canvas.getContext('2d');

                this.canvas.width = this.width;
                this.canvas.height = this.height;
            }

            this.context.clearRect(0, 0, this.width, this.height);
            var renderables = this.bullets.concat(this.shrapnel);
            for (var playerId in this.players) {
                renderables.push(this.players[playerId]);
            }
            for (var index in renderables) {
                renderables[index].render(this.context);
            }
        }

        // TODO better way
        // TODO use the properties
        this.getSnapshot = function () {
            var players = [];
            for (var playerId in this.players) {
                players.push({
                    playerId: playerId,
                    name: this.players[playerId].name,
                    physics: this.players[playerId].physics,
                    inputState: this.players[playerId].inputSystem.inputState,
                    color: this.players[playerId].color,
                    hp: this.players[playerId].hp
                });
            }
            return {
                width: this.width,
                height: this.height,
                players: players
            };
        }
    };
});
