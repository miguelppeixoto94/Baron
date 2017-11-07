/*	 O Regresso do Barao!!!

Miguel Peixoto (41988), Sebastião Rangel Pamplona (42735)
01234567890123456789012345678901234567890123456789012345678901234567890123456789
*/

// GLOBAL VARIABLES

// tente na£o definir mais nenhuma variavel global

var ctx, empty, baron, world, control;


// ACTORS

var Actor = EXTENDS(JSRoot, {
	x: 0, y: 0,
	image: null,
	time: 0,
	speed: 0,
	count: 0,
	dieCount: 10,
	neigbourN: null,
	neigbourS: null,
	neigbourE: null,
	neigbourW: null,
	state: "alive",
	INIT: function(x, y, kind) {
		this.x = x;
		this.y = y;
		this.image = GameImage.get(kind, "").image;
		this.time = 0;
		this.show();
	},
	show: function() {
		world[this.x][this.y] = this;
		ctx.drawImage(this.image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
	},
	hide: function() {
		world[this.x][this.y] = empty;
		ctx.drawImage(empty.image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
	},
	move: function(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
	},
	animation: function() {
	},
	die: function() {
		this.state="dying";
	},
	updateNeigbours: function(){
		this.neigbourN = world[this.x][this.y - 1];
		this.neigbourS = world[this.x][this.y + 1];
		this.neigbourE = world[this.x + 1][this.y];
		this.neigbourW = world[this.x - 1][this.y];
	},
});

var Empty = EXTENDS(Actor, {
	INIT: function() {
		this.SUPER(Actor.INIT, -1, -1, "Empty", "");
	},
	show: function() {},
	hide: function() {}
});

var Block = EXTENDS(Actor, {
	INIT: function(x, y) {
		this.SUPER(Actor.INIT, x, y, "Block");
	},
})

var Sun = EXTENDS(Actor, {
	INIT: function(x, y) {
		this.SUPER(Actor.INIT, x, y, "Sun");
	},
})

var Jerrycan = EXTENDS(Actor, {
	INIT: function(x, y) {
		this.SUPER(Actor.INIT, x, y, "Jerrycan");
		this.speed = JERRICAN_SPEED;
	},
	animation: function() {
		if (this.count == 10/this.speed){
			this.updateNeigbours();
			switch(this.neigbourS.__proto__){
				case Empty:
					this.move(0, 1);
					break;
				case Sun:
					control.level++;
					control.loadLevel(control.level);
					control.updatePoints();
					control.time = 0;
					break;
				case Baron:
					world[this.x][this.y + 1].die();
					control.lives--;
					control.time = 0;
					if (control.lives == 0)
						control.gameOver();
					control.loadLevel(control.level);
					break;
				case Block:
					this.move(0, 0);
					break;
				default:
					break;
				}
			this.count = 0;
		}
		this.count++;
	},
})

var Weight = EXTENDS(Actor, {
	INIT: function(x, y) {
		this.SUPER(Actor.INIT, x, y, "Weight");
		this.speed = WEIGHT_SPEED;
		//this.dieCount = 10;
		this.state = "alive";
	},

	animation: function() {
		switch(this.state){
			case "alive":
				if (this.count == 10/this.speed){
				this.updateNeigbours();
				//tenho de obter o tipo do neigbour, e depois fazer switch no tipo
				switch(this.neigbourS.__proto__){
					case Empty:
						this.move(0, 1);
						break;
					case Baron:
						world[this.x][this.y + 1].die();
						control.lives--;
						control.time = 0;
						if (control.lives == 0)
							control.gameOver();
						control.loadLevel(control.level);
						break;
					case Mammoth:
						world[this.x][this.y + 1].die();
						break;
					default:
						break;
				}
				
				this.count = 0;
			}
			this.count++;
			break;

			case "dying":
				switch(this.dieCount%2){
					case 0:
						//console.log(this.dieCount);
						ctx.drawImage(this.image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
					break;
					case 1:
						//console.log(this.dieCount);
						ctx.drawImage(empty.image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
					break;
					default:
						break;
				}
				this.dieCount--;
				if(this.dieCount == 0){
					this.hide()
				}
			break;
			
		}
	},
})

var Ballon = EXTENDS(Actor, {
	INIT: function(x, y) {
		this.SUPER(Actor.INIT, x, y, "Ballon");
		this.speed = BALOON_SPEED;
		//this.dieCount = 10;
	},
	animation: function() {
		switch(this.state){
			case "alive":
				if (this.count == 10/this.speed){
				this.updateNeigbours();
				switch(this.neigbourN.__proto__){
					case Empty:
						this.move(0, -1);
					break;

					case Mammoth:
						world[this.x][this.y - 1].die();
					break;

					case Baron:
					break;

					default:
					break;
				}
				this.count = 0;
			}
			this.count++;
			break;

			case "dying":
				switch(this.dieCount%2){
					case 0:
						//console.log(this.dieCount);
						ctx.drawImage(this.image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
					break;
					case 1:
						//console.log(this.dieCount);
						ctx.drawImage(empty.image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
					break;
					default:
						break;
				}
				this.dieCount--;
				if(this.dieCount == 0){
					this.hide()
				}
			break;
		}
	},
})

var Ball = EXTENDS(Actor, {
	dx: 0,
	dy: 0,
	readyToShoot: false,
	fired: false,
	INIT: function(x, y) {
		this.SUPER(Actor.INIT, x, y, "Ball");
		this.speed = BALL_SPEED;
	},
	animation: function() {
		if (this.count == 10/this.speed){
			if(this.readyToShoot == true){
				if(!(this.fired))
					this.setOrientation();
				var neigbour = world[this.x + this.dx][this.y + this.dy];
				switch(neigbour.__proto__){
					case Empty:
						this.fire();
						this.move(this.dx, this.dy);
						break;
					case Ball:
					case Block:
					case Sun:
					case Jerrycan:
					case Weight:
					case Ballon:
						this.readyToShoot = false;
						this.stop();
						this.move(0,0);
						break;
					case Mammoth:
						neigbour.die();
						//this.move(this.dx, this.dy);
						break;
					default:
						break;
				}
			}
			else
				this.move(0,0);
			this.count = 0
		}
		this.count++;
	},
	setOrientation: function(){
		switch( baron.curWay ) {
			case 'l': //LEFT
				this.dx=-1;
				this.dy=0; 
				break; 
			case 'u': //UP
				this.dx=0;
				this.dy=-1; 
				break;
			case 'r': //RIGHT
				this.dx=1;
				this.dy=0; 
				break;
			case 'd': //DOWN
				this.dx=0;
				this.dy=1; 
				break;
			default: 
				this.dx=0;
				this.dy=0;
				break;
		};
	},
	setReadyToShot: function(b){
		if(b)
			this.readyToShoot = true;
		else
			this.readyToShoot = false;
	},
	fire: function(){
		this.fired = true;
	},
	stop: function(){
		this.fired = false;
	}
})

var Mammoth = EXTENDS(Actor, {
	INIT: function(x, y) {
		this.SUPER(Actor.INIT, x, y, "Mammoth");
		this.speed = MAMMOTH_SPEED;
		wherex = 0;
		wherey = 0;
		//this.dieCount = 10;
	},
	animation: function(){
		switch(this.state){
			case "alive":
				if (this.count == 10/this.speed){
					if(baron.x != this.x || baron.y != this.y){
						
						if(baron.x < this.x && baron.y < this.y){
							wherex = -1;
							wherey = 0;
							if (world[this.x + wherex][this.y + wherey] != empty){
								wherex = 0;
								wherey = -1;
							}
							else if (world[this.x + wherex][this.y + wherey] != empty){
								wherex = 0;
								wherey = 0; 
							}
						}
						
						else if(baron.x < this.x && baron.y > this.y){ 
							wherex = -1;
							wherey = 0;
							if (world[this.x + wherex][this.y + wherey] != empty){
								wherex = 0;
								wherey = 1;
							}
							else if (world[this.x + wherex][this.y + wherey] != empty){
								wherex = 0;
								wherey = 0; 
							}
						}
						
						else if(baron.x > this.x && baron.y < this.y){ 
							wherex = 1;
							wherey = 0;
							if (world[this.x + wherex][this.y + wherey] != empty){
								wherex = 0;
								wherey = -1;
							}
							else if (world[this.x + wherex][this.y + wherey] != empty){
								wherex = 0;
								wherey = 0; 
							}
						}
						
						else if(baron.x > this.x && baron.y > this.y){ 
							wherex = 1;
							wherey = 0;
							if (world[this.x + wherex][this.y + wherey] != empty){
								wherex = 0;
								wherey = 1;
							}
							else if (world[this.x + wherex][this.y + wherey] != empty){
								wherex = 0;
								wherey = 0; 
							}
						}
					}

					//se barao e mamute estiverem na mesma coluna
					if(baron.x == this.x){
						//S
						if(baron.y > this.y){ wherex = 0; wherey = 1; }
						//N
						else{ wherex = 0; wherey = -1; }
					}

					//se barao e mamute estiverem na mesma linha
					if(baron.y == this.y){
						//E
						if(baron.x > this.x){ wherex = 1; wherey = 0; }
						//W
						else{ wherex = -1; wherey = 0; }
					}

					var neigbour = world[this.x + wherex][this.y + wherey];
					switch(neigbour.__proto__){
						case Empty:
							this.move(wherex, wherey);
							break;
						case Baron:
							control.lives--;
							control.time = 0;
							if (control.lives == 0)
								control.gameOver();
							control.loadLevel(control.level);
							break;
						default:
							break;
					}
					
					this.count = 0;
				}
				this.count++;
			break;

			case "dying":
				switch(this.dieCount%2){
					case 0:
						//console.log(this.dieCount);
						ctx.drawImage(this.image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
					break;
					case 1:
						//console.log(this.dieCount);
						ctx.drawImage(empty.image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
					break;
					default:
						break;
				}
				this.dieCount--;
				if(this.dieCount == 0){
					this.hide()
				}
			break;
		}
	},
})

var Baron = EXTENDS(Actor, {
	balls: [],
	prev: null,
	curr: null,
	curWay: 'd', //orientacao do barao, valores possiveis: d, u, r, l
	dx: 0, dy: 0, prevdx: 0, prevdy: 0, currdx: 0, currdy: 0,
	INIT: function(x, y) {
		this.SUPER(Actor.INIT, x, y, "Baron");
		this.balls = [];
		this.dx = 0;
		this.dy = 0;
		this.speed = BARON_SPEED;
		this.curWay = 'd';
		this.prevdx = 0;
		this.prevdy = 0;
		this.currdx = 0;
		this.currdy = 0;
	},
	animation: function() {
		var magic_balls_input = document.getElementById('magic_balls');
        magic_balls_input.value = this.balls.length;
		/**
			PARA POR NO DYING
			control.lives--;
			control.loadLevel(control.level)
		*/
		switch(this.state){
			case "alive":
				this.updateNeigbours();
				var d = control.getKey();
				if( d == null ) 
					return;

				this.dx = d[0]; 
				this.dy = d[1];

				switch(this.currdx + "|" + this.currdy){
					case "0|0":
						this.currdx = this.dx;
						this.currdy = this.dy;
						break;
					default:
						this.prevdx = this.currdx;
						this.prevdy = this.currdy;
						this.currdx = this.dx;
						this.currdy = this.dy;
						break;
				}
				
				switch(this.dx + "|" + this.dy){
					case "-1|0":
						this.curWay = 'l';
						break;
					case "1|0":
						this.curWay = 'r';
						break;
					case "0|1":
						this.curWay = 'd';
						break;
					case "0|-1":
						this.curWay = 'u';
						break;
					default:
						break;
				}

				//this.updateNeigbours();

				if(this.currdx == 1 && this.currdy == 1){
					var neigbour = world[this.x + this.prevdx][this.y + this.prevdy];
					var neigbour2 = world[this.x + 2*this.prevdx][this.y + 2*this.prevdy];
				}
				else{
					var neigbour = world[this.x + this.dx][this.y + this.dy];
					var neigbour2 = world[this.x + 2*this.dx][this.y + 2*this.dy];
				}

				

				if(this.dx == 1 && this.dy == 1){
					if(this.balls.length > 0){
						switch(neigbour.__proto__){
							case Empty:
							case Mammoth:
								var b = this.balls.pop();
								b.setOrientation();
								var a = NEW(globalByName("Ball"), this.x + b.dx, this.y + b.dy);
								a.setReadyToShot(true);
								break;
							case Jerrycan:
							case Sun:
							case Block:
							case Ballon:
							case Weight:
							case Ball:

								break;
						}
						/*console.log(this.balls.length);
						var b = this.balls.pop();
						b.setOrientation();
						var a = NEW(globalByName("Ball"), this.x + b.dx, this.y + b.dy);
						a.readyToShoot = true;*/
					}
					else
						console.log("you have no balls");
				}
				else{
					switch(neigbour.__proto__){
					case Empty:
						this.move(this.dx, this.dy);
						break;
					case Ball:
						if(this.balls.length < BARON_MAX_BALLS){
							neigbour.readyToShoot = true;
							this.balls.push(neigbour);
							neigbour.hide();
							this.move(this.dx, this.dy);
						}
						break;
					case Jerrycan:
						//2 casas a seguir ao baron, 1 casa a seguir a jerrycan
						if (neigbour2 == empty){
							neigbour.move(this.dx, this.dy);
							this.move(this.dx, this.dy);
						}
						break;
					case Weight:
					case Ballon:
						switch(neigbour2.__proto__){
							case Empty:
								neigbour.move(this.dx, this.dy);
								this.move(this.dx, this.dy);
								break;
							case Ball:
							case Sun:
							case Jerrycan:
							case Mammoth:
							case Weight:
							case Ballon:
								neigbour.die();
								break;
							default:
								break;

						}
						break;
					default:
						break;
				}
				}
			break;

			case "dying":
				switch(this.dieCount%2){
					case 0:
						//console.log(this.dieCount);
						ctx.drawImage(this.image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
					break;
					case 1:
						//console.log(this.dieCount);
						ctx.drawImage(empty.image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
					break;
					default:
						break;
				}
				this.dieCount--;
				if(this.dieCount == 0){
					control.lives--;
					control.loadLevel(control.level);
				}
			break;
		}
	},
})


// GAME CONTROL

var GameControl = EXTENDS(JSRoot, {
	key: 0,
	time: 0,
	level: 0,
	points: 0,
	lives: BARON_LIVES,
	INIT: function() {
		ctx = document.getElementById("canvas1").getContext("2d");
		empty = NEW(Empty);	// only one empty actor needed
		world = this.createWorld();
		this.loadLevel(1);
		this.setupEvents();
		control = this;
		this.level = 1;
		this.points = 0;
		this.lives = BARON_LIVES;
	},
	createWorld: function () { // stored by columns
		var matrix = new Array(WORLD_WIDTH);
		for( var x = 0 ; x < WORLD_WIDTH ; x++ ) {
			var a = new Array(WORLD_HEIGHT);
			for( var y = 0 ; y < WORLD_HEIGHT ; y++ )
				a[y] = empty;
			matrix[x] = a;
		}
		return matrix;
	},
	loadLevel: function(level) {
		var baron_lives_input = document.getElementById('baron_lives');
		baron_lives_input.value = this.lives;
		if( level < 1 || level > MAPS.length )
			fatalError("Invalid level " + level)
		var map = MAPS[level-1];  // -1 because levels start at 1
		for(var x=0 ; x < WORLD_WIDTH ; x++)
			for(var y=0 ; y < WORLD_HEIGHT ; y++) {
				world[x][y].hide();
				var code = map[y][x];  // x/y reversed because map stored by lines
				var gi = GameImage.getByCode(code);
				if( gi ) {
					var a = NEW(globalByName(gi.kind), x, y);
					if( gi.kind == "Baron" )
						baron = a;
				}
			}
	},
	getKey() {
		var k = this.key;
		this.key = 0;
		switch( k ) {
			case 37: case 79: case 74: return [-1, 0]; //  LEFT, O, J
			case 38: case 81: case 73: return [0, -1]; //    UP, Q, I
			case 39: case 80: case 76: return [1, 0];  // RIGHT, P, L
			case 40: case 65: case 75: return [0, 1];  //  DOWN, A, K
			case 90: return [1, 1]; // SHOOT, Z
			case 0: return null;
			default: return String.fromCharCode(k);
		// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
		};	
	},
	setupEvents: function() {
		addEventListener("keydown", this.keyDownEvent, false);
		addEventListener("keyup", this.keyUpEvent, false);
		setInterval(this.animationEvent, 1000 / ANIMATION_EVENTS_PER_SECOND);
	},
	animationEvent: function() {
		var time_left_input = document.getElementById('time_left');
		control.time++;
		for(var x=0 ; x < WORLD_WIDTH ; x++)
			for(var y=0 ; y < WORLD_HEIGHT ; y++) {
				var a = world[x][y];
				if( a.time < control.time ) {
					a.time = control.time;
					a.animation();
					time_left_input.value = (120 - (Math.round(control.time/10)));
				}
			}
		if (control.time/ANIMATION_EVENTS_PER_SECOND == 120){			
            control.time = 0;			
            control.lives--;	
            if (control.lives == 0)			
	      	  control.gameOver();			
            control.loadLevel(control.level);			
        }
	},
	keyDownEvent: function(k) { control.key = k.keyCode; },
	keyUpEvent: function(k) { },
	updatePoints: function() { 
		if (this.time > 0){
			this.points += (120 - Math.round(this.time/ANIMATION_EVENTS_PER_SECOND));
			if (this.level == 7)
				this.points += 200*baron.lives;
			var points_input = document.getElementById('points');
			points_input.value = this.points;
		}
		else if (this.time == 0){
			this.points = 0;
			var points_input = document.getElementById('points');
			points_input.value = this.points;
		}
	},
	gameOver: function(){
		control.loadLevel(1);
		control.level = 1;
		control.time = 0;
		control.lives = BARON_LIVES;
		mesg("GAME OVER! Acabou com " + control.points + " pontos.");
		control.points = 0;
		control.updatePoints();	
	},
});


// HTML FORM

function onLoad() {
  // load images an then run the game
	GameImage.loadImages(function() {NEW(GameControl);});
	mesg("Bem-vindo!!!");
	console.log("Bem-vindo!!!");
}

function b0() { mesg("Passou de nivel!!!") }
function b1() { 
	mesg("O jogo vai recomecar!")
	control.level = 1;
	control.points = 0;
	control.lives = BARON_LIVES;
	control.time = 0;
	control.loadLevel(control.level);
	control.updatePoints();
}
function b2() { mesg(Math.round(control.time/10)) }
function b3() { console.log("Baron has " + control.lives + " lives.") }
function b4() { console.log("Baron has " + control.points + " points.") }
function b5() { console.log("Baron is in level " + control.level + ".") }
function b6() { console.log("Baron has " + baron.balls.length + " balls.") }function testShow() { baron.show() }
function testHide() { baron.hide() }
function testBtn() { alert("num of balls: " + baron.balls.length) }


