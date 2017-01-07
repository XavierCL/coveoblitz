'use strict';

const argv = require('minimist')(process.argv.slice(2));
const openBrowser = require('open');
const parseBoard = require('./src/board/board').parseBoard;
const request = require('request')

var getDirection = function(start, target, rawMap, size, callback) {
    var url = 'http://game.blitz.codes:8081/pathfinding/direction?size='+size+'&start=('+start.x+','+start.y+')&target=('+target.x+','+target.y+')&map='+encodeURIComponent(rawMap)

    request(url, function (error, response, body) {
        callback(body.split("\"")[3])
    });
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

    let customers = play.game.customers;
    let heros = play.game.heroes;

    let myHero = getMyHero(heros);

    console.log(myHero)

    let board = parseBoard(play.game.board, myHero.id);

    let map = board.map;
    let burgers = board.burgers;
    let frenchFries = board.frenchFries;
    let taverns = board.taverns;
    let customersPositions = board.customers;

    let allItems = burgers.concat(frenchFries);

    let nextCustomer = selectNextCustomer(customers);

    var nextItem = findClosestItem(myHero.pos, allItems);

    getDirection(myHero.pos, nextItem, play.game.board.tiles, play.game.board.size, function(direction) {
        console.log(direction);
        callback(null, dirs[direction])
    });
}

function getMyHero(heroes) {
    for (var i=0; i<heroes.length; ++i){
        if (heroes[i].name == 'Keep the beat'){
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

function findClosestItem(heroPosition, items) {
    var firstItem = items[0];
    var currentMin = (firstItem.x - heroPosition.x) * (firstItem.x - heroPosition.x) + (firstItem.y - heroPosition.y) * (firstItem.y - heroPosition.y);
    var currentIndex = 0;

    for (var i=1; i<items.length; i++) {
        var currentItem = items[i];
        var currentDistance = (currentItem.x - heroPosition.x) * (currentItem.x - heroPosition.x) + (currentItem.y - heroPosition.y) * (currentItem.y - heroPosition.y);

        if (currentDistance < currentMin) {
            currentMin = currentDistance;
            currentIndex = i;
        }
    }

    return items[currentIndex];
}

module.exports = bot;

if (require.main === module) {
    require('./src/client/index').cli(bot);
}
