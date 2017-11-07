// Baron0.js - AMD/2016
// You are not allowed to change ths file.

// JAVA EMULATION

var JSRoot = {
	SUPER: function(method) {
		return method.apply(this,
			Array.prototype.slice.apply(arguments).slice(1));
	},
	INIT: function() {
		throw "*** MISSING INITIALIZER ***";
	}
};

function NEW(clazz) { // Create an object and applies INIT(...) to it
	function F() {}
	F.prototype = clazz;
	var obj = new F();
	obj.INIT.apply(obj, Array.prototype.slice.apply(arguments).slice(1));
	return obj;
};

function EXTENDS(clazz, added) { // Creates a subclass of a given class
	function F() {}
	F.prototype = clazz;
	var subclazz = new F();
	for(prop in added)
		subclazz[prop] = added[prop];
	return subclazz;
};

// "print" � opcional, mas introduz compatibilidade com o Node.js
var print = typeof(console) !== 'undefined' ? console.log : print;


// MISCELLANEOUS FUNCTIONS

function rand(n) {		// random number generator
	return Math.floor(Math.random() * n);
}

function distance(x1, y1, x2, y2) {
	var distx = Math.abs(x1 - x2);
	var disty = Math.abs(y1 - y2);
	return Math.ceil(Math.sqrt(distx*distx + disty*disty));
}

function mesg(m) {
	return alert(m);
}

function fatalError(m) {
	mesg("Fatal Error: " + m + "!");
	throw "Fatal Error!";
}

function objectLength(obj) {	// number of fields of an object
	return Object.keys(obj).length;
}

function globalByName(name) { // access global space entity by name (string)
	return this[name];
}

function div(a, b) {		// integer division
	return Math.floor(a/b);
}


// GAME CONSTANTS

const ANIMATION_EVENTS_PER_SECOND = 10;
const MAX_SPEED = ANIMATION_EVENTS_PER_SECOND;
const BLINKING_TIME = 1;

const BARON_LIVES = 3;
const BARON_MAX_BALLS = 10;
const BARON_SPEED = MAX_SPEED;

const MAMMOTH_FREEZING_TIME = 5;
const MAMMOTH_SPEED = 5;

const JERRICAN_SPEED = 2;
const WEIGHT_SPEED = 2;
const BALOON_SPEED = 1;
const BALL_SPEED = MAX_SPEED;


// GAME IMAGES

const ACTOR_PIXELS_X = 16;
const ACTOR_PIXELS_Y = 16;

var GameImage = EXTENDS(JSRoot, {
	kind: "",
	color: "",
	code: '',
	image: null,
	prefix: "http://ctp.di.fct.unl.pt/miei/lap/projs/proj2016-3/resources/",
	//prefix: "../resources/",
	next: function() { mesg("GameImage.next default"); },
	loading: 0,      // static, controls async loadng
	byCode: {},      // static, dictionary
	byKindColor: {}, // static, dictionary
	INIT: function(kind, color, url, code) {
		GameImage.loading++;
		this.kind = kind;
		this.color = color;
		this.code = code;
		this.image = new Image();
		if( url[0] == '@' )
			url = this.prefix + url.slice(1);
		this.image.src = url;
		this.image.onload =
			function() { if( --GameImage.loading == 0 ) GameImage.next(); }
		GameImage.byCode[code] = this;
		GameImage.byKindColor[kind+color] = this;
	},
	loadImages: function(next) {  // load is asynchronous
		GameImage.next = next;     // next is the action to start after loading
		NEW(GameImage, "Empty", "", "@empty.png", '');
 		NEW(GameImage, "Block", "", "@block.png", '#');
		NEW(GameImage, "Sun", "", "@sun.png", 'S');
		NEW(GameImage, "Jerrycan", "", "@jerrycan.png", 'B');
		NEW(GameImage, "Weight", "", "@weight.png", 'P');
		NEW(GameImage, "Ballon", "", "@ballon.png", 'L');
		NEW(GameImage, "Ball", "", "@ball.png", 'O');
		NEW(GameImage, "Mammoth", "", "@mammoth.png", 'M');
		NEW(GameImage, "Baron", "", "@baron.png", 'H');
	},
	get: function(kind, color) {
		return GameImage.byKindColor[kind+color];
	},
	getByCode: function(code) {
		return GameImage.byCode[code];
	}
});


// GAME MAPS

const WORLD_WIDTH = 44;
const WORLD_HEIGHT = 30;

const MAPS = Object.freeze([
[
	"############################################",
	"#.............................#............#",
	"#..........H..................#............#",
	"#.............................#............#",
	"#.............................#............#",
	"#.............................#............#",
	"#....B.OOOOO..................#............#",
	"############################S..............#",
	"#......P.P.................................#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#.................................#........#",
	"#.................................#........#",
	"#...............................#####......#",
	"#...............................#####......#",
	"#..............M................#####......#",
	"#...............................#####......#",
	"#...............................#####......#",
	"#................................###.......#",
	"###...............................#......###",
	"##................................#.......##",
	"##................................#.......##",
	"##M..............................###......##",
	"##........................................##",
	"##...................M............M.......##",
	"##........................................##",
	"###.........P...........L................###",
	"############################################"
], [
	"############################################",
	"#.....................P...#................#",
	"#.....B...............P...#...P#...........#",
	"#H..####..............#...#...P#...........#",
	"#...........P.................P............#",
	"#......#.############.########P............#",
	"#......###.........#M..#......P............#",
	"##############################PP...........#",
	"#......P.P..................######.#########",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#.................................S........#",
	"#.................................#........#",
	"#.................................#........#",
	"#...............................#####......#",
	"#...............................#####......#",
	"#..............M................#####......#",
	"#...............................#####......#",
	"#...............................#####......#",
	"#................................###.......#",
	"#.................................#........#",
	"#.................................#........#",
	"#.................................#........#",
	"#.M..............................###.......#",
	"#..........................................#",
	"#....................M............M........#",
	"#..........................................#",
	"#...........P...........L..................#",
	"############################################"
], [
	"############################################",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#................#############.............#",
	"#................#...........#.............#",
	"#............................B.............#",
	"#................######.#.####.............#",
	"#.....................#####..#.............#",
	"#.################.........................#",
	"#.############################.............#",
	"#.#....................O....M#.............#",
	"#.#....................#######.............#",
	"#.#........................................#",
	"#.#........................................#",
	"#.#........................................#",
	"#.#........................................#",
	"#.#........................................#",
	"#.#........................................#",
	"#.#........................................#",
	"#.#........................................#",
	"#.#........................................#",
	"#.#.....#####..............................#",
	"#S#######...#..............................#",
	"#####......................................#",
	"#H.....O#.M.#..............................#",
	"############################################"
], [
	"############################################",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#.......................###................#",
	"#......................#.H.#...............#",
	"#.....................#.....#..............#",
	"#....................#.......#.............#",
	"#...................#.........#............#",
	"#..................#...........#...........#",
	"#.................#.............#..........#",
	"#...B............#...............#.........#",
	"#...P...........#.................#........#",
	"#..............#...................#.......#",
	"####.##########.....................#......#",
	"#..................................O#......#",
	"#...S##########.....................#......#",
	"#..............#...................#.......#",
	"#...............#.................#........#",
	"#................#...............#.........#",
	"#.................#.............#..........#",
	"#..................#...........#...........#",
	"#...................#.........#............#",
	"#....................#.......#.............#",
	"#.....................#.....#..............#",
	"#......................#.M.#...............#",
	"#.......................###................#",
	"#..........................................#",
	"#..........................................#",
	"############################################"
], [
	"############################################",
	"#...M......................................#",
	"#...M......................................#",
	"#...M......................................#",
	"#...M......................................#",
	"#...M......................................#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#......................PPPB................#",
	"#..................S#########..............#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#..........................................#",
	"#.......................................MMM#",
	"#....................................#######",
	"#...................##################.....#",
	"#...................#..............M....M..#",
	"#.P.................#....M.......M.........#",
	"#.###################......................#",
	"#.........................H..........M.....#",
	"#P........................................M#",
	"############################################"
], [
	"############################################",
	"#H.B...................................P..M#",
	"#########..............................###.#",
	"#......................................#...#",
	"#........###########################...#...#",
	"#...M..................................#...#",
	"#......................................#...#",
	"#......................................#...#",
	"#......................................#...#",
	"#......................................#...#",
	"#......................................#...#",
	"#......................................#...#",
	"#......................................#...#",
	"#......................................#...#",
	"#......................................#...#",
	"#......................................#...#",
	"#......................................#...#",
	"#......................................#...#",
	"#......................................#...#",
	"#...........P..........................#...#",
	"#....################################..#...#",
	"#......................................#...#",
	"#..........M...........................#...#",
	"#......................................#...#",
	"#...................................P..#...#",
	"#.........P.........................#####..#",
	"#....#########.........................#...#",
	"#...................................#..P...#",
	"#...................................#.P#S..#",
	"############################################"
], [
	"############################################",
	"#OOOOO#.............#..M..#................#",
	"#OOOOO#.............#.....#................#",
	"#OOOOO###############.....#######..........#",
	"#H..OOOOOOOOOOOOOOOOOOOOOOOOOOOO#..........#",
	"###############################O#..........#",
	"#.............................#O#..........#",
	"#.............................#O###........#",
	"#.............................#OOO#........#",
	"#.............................#OBO#........#",
	"#.............................###O#........#",
	"#................................O.........#",
	"#................................O.........#",
	"#................................OOO.......#",
	"#...................................O......#",
	"#....................................O.....#",
	"#..........................................#",
	"#.....................................O....#",
	"#..........................................#",
	"#..........................................#",
	"#......................................O...#",
	"#..........................................#",
	"#..........................................#",
	"#.......................................O..#",
	"#..........................................#",
	"#........................................O.#",
	"#..........................................#",
	"#.........................................S#",
	"#..........................................#",
	"############################################"
] ]);

