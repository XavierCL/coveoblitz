'use strict';

const argv = require('minimist')(process.argv.slice(2));
const openBrowser = require('open');
const parseBoard = require('./src/board/board').parseBoard;
const request = require('request')

var getDirection = function(start, target, rawMap, size, callback) {
    var url = 'http://game.blitz.codes:8081/pathfinding/direction?size='+size+'&start=('+start.x+','+start.y+')&target=('+target.x+','+target.y+')&map='+encodeURIComponent(rawMap)
    console.log(url)
    request(url, function (error, response, body) {
        callback(body.split("\"")[3])
    })
}

console.dir(argv);

//const dirs = ['stay', 'n', 's', 'e', 'w'];
const dirs = {'STAY': 'stay', 'NORTH':'n', 'SOUTH':'s', 'EAST':'e', 'WEST':'w'}

let isFirstRound = true;

/**
 * Your bot code here!
 *
 * @param {Play} play
 * @param {Function} callback
 */
function bot(play, callback) {
    if (isFirstRound) {
        console.log(`Opening Browser at ${play.viewUrl}`);
        openBrowser(play.viewUrl);
        isFirstRound = false;
    }

    // The board is an object containing the full map in a 2d array and the positions of the burgers, french fries, taverns and customers
    // feel free to edit tile.js and board.js to make them meet your needs.
    let board = parseBoard(play.game.board);

    let map = board.map;
    let burgers = board.burgers;
    let frenchFries = board.frenchFries;
    let taverns = board.taverns;
    let customers = board.customers;

    console.log(play.game)

    var nextDirection = getDirection(getMyHero(play.game.heroes).pos, burgers[0], play.game.board.tiles, play.game.board.size, function(direction) {
        console.log(direction);
        callback(null, dirs[direction])
    })
}

function getMyHero(heroes) {
    for(var i=0; i<heroes.length; ++i){
        if(heroes[i].name == 'Keep the beat'){
            return heroes[i]
        }
    }
}

function selectRandomDirection(dirs) {
    let i = Math.floor(Math.random() * 5);
    let nextDirection = dirs[i];

    return nextDirection;
}

module.exports = bot;

if (require.main === module) {
    require('./src/client/index').cli(bot);
}
