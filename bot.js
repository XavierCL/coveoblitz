'use strict';

const argv = require('minimist')(process.argv.slice(2));
const openBrowser = require('open');
const parseBoard = require('./src/board/board').parseBoard;

console.dir(argv);

const dirs = ['stay', 'n', 's', 'e', 'w'];

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

    // Choosing a random direction
    let i = Math.floor(Math.random() * 5);
    let dir = dirs[i];

    console.log(dir);

    // Call the callback with the direction you choosed
    callback(null, dir);
}

module.exports = bot;

if (require.main === module) {
    require('./src/client/index').cli(bot);
}
