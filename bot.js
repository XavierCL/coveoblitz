'use strict';

const argv = require('minimist')(process.argv.slice(2));
const openBrowser = require('open');
const parseBoard = require('./src/board/board').parseBoard;
const request = require('request')

var getDirection = function(start, target, rawMap, size, callback) {
    var DEFAULT_TIMEOUT = 500;
    var transformedMap = rawMap.replace('^^', '##');
    var url = 'http://game.blitz.codes:8081/pathfinding/direction?size='+size+'&start=('+start.x+','+start.y+')&target=('+target.x+','+target.y+')&map='+encodeURIComponent(transformedMap);

    request.get(url, { timeout: 300 }, function (error, response, body) {
        if (error) {
            console.log(error);
            var url = 'http://game.blitz.codes:8081/pathfinding/direction?size='+size+'&start=('+start.x+','+start.y+')&target=('+target.x+','+target.y+')&map='+encodeURIComponent(rawMap);

            request.get(url, { timeout: DEFAULT_TIMEOUT }, function (error, response, body) {
                if (error) {
                    console.log("pathfinding error, falling back to random");

                    callback(selectRandomDirection(['STAY', 'NORTH', 'SOUTH', 'EAST', 'WEST']));
                } else {
                    var bodyContent = JSON.parse(body);
                    var nextDirection = bodyContent['direction'];

                    console.log('getting throught utensils');
                    callback(nextDirection);
                }
            });
        } else {
            var bodyContent = JSON.parse(body);

            if (bodyContent['type']) {
                var url = 'http://game.blitz.codes:8081/pathfinding/direction?size='+size+'&start=('+start.x+','+start.y+')&target=('+target.x+','+target.y+')&map='+encodeURIComponent(rawMap);

                request.get(url, { timeout: DEFAULT_TIMEOUT }, function (error, response, body) {
                    if (error) {
                        console.log("pathfinding error, falling back to random");

                        callback(selectRandomDirection(['STAY', 'NORTH', 'SOUTH', 'EAST', 'WEST']));
                    } else {
                        var bodyContent = JSON.parse(body);
                        var nextDirection = bodyContent['direction'];

                        console.log("getting throught utensils");
                        callback(nextDirection);
                    }
                });
            } else {
                var nextDirection = bodyContent['direction'];

                console.log('avoiding utensils');

                callback(nextDirection);
            }
        }
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
    let board = parseBoard(play.game.board, myHero.id);

    let map = board.map;
    let burgers = board.burgers;
    let frenchFries = board.frenchFries;
    let taverns = board.taverns;

    let customersPositions = board.customers;

    let nextCustomer = selectNextCustomer(customers, customersPositions, myHero);
    let remaining = getRemainingFood(myHero, nextCustomer);

    let neededPotentialItems = [];
    if (remaining.burgers > 0) {
        neededPotentialItems = neededPotentialItems.concat(burgers);
    }
    if (remaining.frenchFries > 0) {
        neededPotentialItems = neededPotentialItems.concat(frenchFries);
    }
    if(neededPotentialItems.length === 0){
        let nextCustomerPosition = findCustomerById(customersPositions, nextCustomer.id);

        getDirection(myHero.pos, nextCustomerPosition, play.game.board.tiles, play.game.board.size, function(direction) {
            console.log(direction);
            callback(null, dirs[direction])
        });
    } else {
        var nextItem = findClosestItem(myHero.pos, neededPotentialItems);

        getDirection(myHero.pos, nextItem, play.game.board.tiles, play.game.board.size, function(direction) {
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

function selectNextCustomer(customers, customerPositions, myHeroPos) {
    var burgerToFrenchFriesRatio = 0;
    var nextCustomerIndex = 0;
    var currentDistance = 999;

    for (var i=0; i<customers.length; i++) {
        var currentCustomer = customers[i];

        if (getEucDistance(findCustomerById(customerPositions, currentCustomer.id), myHeroPos) < currentDistance) {
            nextCustomerIndex = i;
            burgerToFrenchFriesRatio = projectedRatio
            currentDistance = getEucDistance(findCustomerById(customerPositions, currentCustomer.id), myHeroPos)
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
    return Math.pow(tile1.x-tile2.x, 2) + Math.pow(tile1.y-tile2.y, 2)
}

module.exports = bot;

if (require.main === module) {
    require('./src/client/index').cli(bot);
}
