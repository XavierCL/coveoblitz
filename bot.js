'use strict';

const argv = require('minimist')(process.argv.slice(2));
const openBrowser = require('open');
const parseBoard = require('./src/board/board').parseBoard;
const request = require('request')

var getDirection = function(start, target, rawMap, size, map, callback) {
    var throughUstensilDirection = undefined;
    var avoidUstenilsDirection = undefined;
    var wasCalled = false;

    function decideDirection () {
        if (!wasCalled) {
            var canAvoidUstensils = avoidUstenilsDirection !== undefined && avoidUstenilsDirection !== null;

            if (canAvoidUstensils) {
                console.log('avoiding ustensils');
                wasCalled = true;
                callback(avoidUstenilsDirection);
            } else if (throughUstensilDirection === undefined || avoidUstenilsDirection === undefined) {
                console.log('waiting request');
            } else if (throughUstensilDirection !== null){
                console.log('going through ustensils');
                wasCalled = true;
                callback(throughUstensilDirection);
            } else {
                console.log('staying');
                wasCalled = true;
                callback(greedyPathFinding(start, target, map));
            }
        }
    }

    var DEFAULT_TIMEOUT = 500;
    var transformedMap = rawMap.replace('^^', '##');

    var transformedUrl = 'http://game.blitz.codes:8081/pathfinding/direction?size='+size+'&start=('+start.x+','+start.y+')&target=('+target.x+','+target.y+')&map='+encodeURIComponent(transformedMap);
    var rawUrl = 'http://game.blitz.codes:8081/pathfinding/direction?size='+size+'&start=('+start.x+','+start.y+')&target=('+target.x+','+target.y+')&map='+encodeURIComponent(rawMap);

    request.get(transformedUrl, { timeout: DEFAULT_TIMEOUT }, function (error, response, body) {
        if (error) {
            avoidUstenilsDirection = null;
            decideDirection();
        } else {
            var bodyContent = JSON.parse(body);

            if (bodyContent['type']) {
                avoidUstenilsDirection = null;
                decideDirection();
            } else {
                var nextDirection = bodyContent['direction'];
                avoidUstenilsDirection = nextDirection;
                decideDirection();
            }
        }
    });

    request.get(rawUrl, { timeout: DEFAULT_TIMEOUT }, function (error, response, body) {
        if (error) {
            throughUstensilDirection = null;
            decideDirection();
        } else {
            var bodyContent = JSON.parse(body);

            if (bodyContent['type']) {
                throughUstensilDirection = null;
                decideDirection();
            } else {
                var nextDirection = bodyContent['direction'];
                throughUstensilDirection = nextDirection;
                decideDirection();
            }
        }
    });
}

function greedyPathFinding(start, target, map) {
    var direction = 'STAY';
    var minDistance = 999;

    if (start.x + 1 < map.length && map[start.x + 1][start.y]) {
        if (getEucDistance({ x: start.x + 1, y: start.y }, target) < minDistance) {
            direction = 'EAST';
        }
    }

    if (start.x - 1 >= 0 && map[start.x - 1][start.y]) {
        if (getEucDistance({ x: start.x - 1, y: start.y }, target) < minDistance) {
            direction = 'WEST';
        }
    }

    if (start.y + 1 < map.length && map[start.x][start.y + 1]) {
        if (getEucDistance({ x: start.x, y: start.y + 1 }, target) < minDistance) {
            direction = 'SOUTH';
        }
    }

    if (start.y - 1 >= 0 && map[start.x][start.y - 1]) {
        if (getEucDistance({ x: start.x, y: start.y - 1}, target) < minDistance) {
            direction = 'NORTH';
        }
    }

    console.log("Greedy: " + direction);

    return direction;
}

console.dir(argv);

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
    let board = parseBoard(play.game.board, myHero.id);

    let map = board.map;
    let burgers = board.burgers;
    let frenchFries = board.frenchFries;
    let taverns = board.taverns;

    let customersPositions = board.customers;

    let nextCustomer = findClosestCustomer(customers, customersPositions, myHero.pos);
    let remaining = getRemainingFood(myHero, nextCustomer);

    let neededPotentialItems = [];
    if (remaining.burgers > 0) {
        neededPotentialItems = neededPotentialItems.concat(burgers);
    }
    if (remaining.frenchFries > 0) {
        neededPotentialItems = neededPotentialItems.concat(frenchFries);
    }

    console.log(myHero.pos);

    if(neededPotentialItems.length === 0){
        let nextCustomerPosition = findCustomerById(customersPositions, nextCustomer.id);

        getDirection(myHero.pos, nextCustomerPosition, play.game.board.tiles, play.game.board.size, map, function(direction) {
            console.log(direction);
            callback(null, dirs[direction])
        });
    } else {
        var nextItem = findClosestItem(myHero.pos, neededPotentialItems);

        getDirection(myHero.pos, nextItem, play.game.board.tiles, play.game.board.size, map, function(direction) {
            console.log(direction);
            callback(null, dirs[direction])
        });
    }
}

function getMyHero(heroes) {
    for (var i=0; i<heroes.length; ++i){
        if (heroes[i].name == 'Keep the beat'){
            return heroes[i]
        }
    }
}

function findClosestCustomer(customers, customerPositions, myHeroPos) {
    var selectedCustomer = customers[0];
    var selectedDistance = getEucDistance(findCustomerById(customerPositions, selectedCustomer.id), myHeroPos);

    for (var i=1; i<customers.length; i++) {
        var currentCustomer = customers[i];

        var currentDistance = getEucDistance(findCustomerById(customerPositions, currentCustomer.id), myHeroPos);
        if (currentCustomer < selectedDistance) {
            selectedCustomer = currentCustomer;
            selectedDistance = currentDistance;
        }
    }

    return selectedCustomer;
}

function selectRandomDirection(dirs) {
    let i = Math.floor(Math.random() * 5);
    let nextDirection = dirs[i];

    return nextDirection;
}

function findClosestItem(heroPosition, items) {
    var firstItem = items[0];
    var currentMin = getEucDistance(heroPosition, firstItem)
    var currentIndex = 0;

    for (var i=1; i<items.length; i++) {
        var currentItem = items[i];
        var currentDistance = getEucDistance(heroPosition, currentItem);

        if (currentDistance < currentMin) {
            currentMin = currentDistance;
            currentIndex = i;
        }
    }

    return items[currentIndex];
}

function getRemainingFood(hero, customer) {
    let remainingItemsCount =  {
        "burgers": customer.burger - hero.burgerCount,
        "frenchFries": customer.frenchFries - hero.frenchFriesCount
    };
    return remainingItemsCount;
}

function findCustomerById(customers, id) {
    for(var i=0; i<customers.length; ++i){
        if (customers[i].id == id) {
            return customers[i];
        }
    }
}

function getManDistance(tile1, tile2){
    return Math.abs(tile1.x-tile2.x) + Math.abs(tile1.y-tile2.y)
}

function getEucDistance(tile1, tile2){
    return Math.sqrt(Math.pow(tile1.x - tile2.x, 2) + Math.pow(tile1.y - tile2.y, 2));
}

function isCloseToHealing(map, pos){
    if(pos.x+1 < map.length && map[pos.x+1][pos.y] === "[]"){
        return true;
    } else if(pos.x-1 >= 0 && map[pos.x-1][pos.y] === "[]"){
        return true;
    } else if(pos.y+1 < map.length && map[pos.x][pos.y+1] === "[]"){
        return true;
    }else if(pos.y-1 >= 0 && map[pos.x][pos.y-1] === "[]"){
        return true;
    }
    return false
}

function getCloseHealDirection(map, pos){
    if(pos.x+1 < map.length && map[pos.x+1][pos.y] === "[]"){
        return 'n';
    } else if(pos.x-1 >= 0 && map[pos.x-1][pos.y] === "[]"){
        return 's';
    } else if(pos.y+1 < map.length && map[pos.x][pos.y+1] === "[]"){
        return 'e';
    }else if(pos.y-1 >= 0 && map[pos.x][pos.y-1] === "[]"){
        return 'w';
    }
    return 'stay'
}

module.exports = bot;

if (require.main === module) {
    require('./src/client/index').cli(bot);
}
