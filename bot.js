'use strict';

const argv = require('minimist')(process.argv.slice(2));
const openBrowser = require('open');
const parseBoard = require('./src/board/board').parseBoard;
const request = require('request')

var getDirection = function(start, target, rawMap, size, callback) {
    var url = 'http://game.blitz.codes:8081/pathfinding/direction?size='+size+'&start=('+start.x+','+start.y+')&target=('+target.x+','+target.y+')&map='+encodeURIComponent(rawMap)
    // console.log(url)
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

    let board = parseBoard(play.game.board);

    let map = board.map;
    let burgers = board.burgers;
    let frenchFries = board.frenchFries;
    let taverns = board.taverns;

    let customers = play.game.customers;
    let customersPositions = board.customers;
    let heros = play.game.heroes;
    let myHero = getMyHero(heros);

    var nextDirection = getDirection(getMyHero(play.game.heroes).pos, burgers[0], play.game.board.tiles, play.game.board.size, function(direction) {
        console.log(direction);
        callback(null, dirs[direction])
    })
    let nextCustomer = selectNextCustomer(customers);

    // fullfillOrder(nextCustomer, burgers, frenchFries);

    // console.log(getMyHero(heros));

    console.log(myHero.pos);

    if (nextDirection === 'n') {
        var currentPosition = myHero.pos;
        console.log(nextDirection);
        console.log(map);
    }

    console.log(nextDirection);
}

function getMyHero(heroes) {
    for(var i=0; i<heroes.length; ++i){
        if(heroes[i].name == 'Keep the beat'){
            return heroes[i]
        }
    }
}

function selectNextCustomer(customers) {
    var burgerToFrenchFriesRatio = 0;
    var nextCustomerIndex = 0;

    for (var i=0; i<customers.length; i++) {
        var currentCustomer = customers[i];
        var projectedRatio = (currentCustomer.burger) / (currentCustomer.frenchFries + 1);

        if (projectedRatio > burgerToFrenchFriesRatio) {
            nextCustomerIndex = i;
        }
    }

    return customers[nextCustomerIndex];
}

function selectRandomDirection(dirs) {
    let i = Math.floor(Math.random() * 5);
    let nextDirection = dirs[i];

    return nextDirection;
}

function fullfillOrder(customer, burger, frenchFries) {
    console.log(customer);
    console.log(burger);
    console.log(frenchFries);
}

module.exports = bot;

if (require.main === module) {
    require('./src/client/index').cli(bot);
}
