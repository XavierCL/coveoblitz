'use strict';

const {
    isBurger,
    isCustomer,
    isFrenchFries,
    isSoftDrink,
} = require('./tile');

/**
 * @typedef {Object} Board
 * @property {number} size   The size of the board (it’s a square don’t worry)
 * @property {string} tiles  The map encoded in a string
 */

/**
 * Parse the game board
 *
 * @param {Board} board
 * @returns {{
 *   map: Array<Array<Tiles>>,
 *   burgers: Array<Pos>,
 *   frenchFries: Array<Pos>,
 *   taverns: Array<Pos>,
 *   customers: Array<CustomerPos>
 * }}
 */
const parseBoard = (board, heroId) => {
    let map = [];
    let burgers = [];
    let frenchFries = [];
    let softDrinks = [];
    let customers = [];

    let size = board.size;
    let tiles = board.tiles;

    let x = 0;
    let y = 0;

    map[0] = [];
    for (let idx = 0; idx < size * size; idx++) {
        let strIdx = idx * 2;
        let tile = tiles.slice(strIdx, strIdx + 2);

        map[x][y] = tile;

        if (isBurger(tile, heroId)) {
            burgers.push({y: y, x: x});
        } else if (isFrenchFries(tile, heroId)) {
            frenchFries.push({y: y, x: x});
        } else if (isSoftDrink(tile)) {
            softDrinks.push({y: y, x: x});
        } else if (isCustomer(tile)) {
            customers.push({y: y, x: x, id: tile[1]});
        }

        y++;
        if (y >= size) {
            y = 0;
            x++;
            map[x] = [];
        }
    }

    return {
        map,
        burgers,
        frenchFries,
        softDrinks,
        customers
    };
};

module.exports = {
    parseBoard
};
