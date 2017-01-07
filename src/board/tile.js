'use strict';

/**
 * Map tiles enum
 *
 * @readonly
 * @enum {string}
 */
const Tiles = {
    Empty: '  ',
    Wall: '##',
    Spikes: '^^',
    SoftDrink: '[]',
    Hero1: '@1',
    Hero2: '@2',
    Hero3: '@3',
    Hero4: '@4',
    BurgerNeutral: 'B-',
    BurgerPlayer1: 'B1',
    BurgerPlayer2: 'B2',
    BurgerPlayer3: 'B3',
    BurgerPlayer4: 'B4',
    FrenchFriesNeutral: 'F-',
    FrenchFriesPlayer1: 'F1',
    FrenchFriesPlayer2: 'F2',
    FrenchFriesPlayer3: 'F3',
    FrenchFriesPlayer4: 'F4',
    Customer1: 'C1',
    Customer2: 'C2',
    Customer3: 'C3',
    Customer4: 'C4',
    Unknown: '??'
};

/**
 * @param {string} tile
 */
const isEmpty = (tile) => tile == Tiles.Empty;

/**
 * @param {string} tile
 */
const isWall = (tile) => tile == Tiles.Wall || tile[0]=='B' || tile[0]=='F';

/**
 * @param {string} tile
 */
const isHero = (tile) => tile[0] == '@';

/**
 * @param {string} tile
 */
const isBurger = (tile, id) => tile[0] == 'B' && tile[1]!=id.toString();

/**
 * @param {string} tile
 */
const isFrenchFries = (tile, id) => tile[0] == 'F' && tile[1]!=id.toString();

/**
 * @param {string} tile
 */
const isSoftDrink = (tile) => tile == Tiles.SoftDrink;

/**
 * @param {string} tile
 */
const isCustomer = (tile) => tile[0] == 'C';

module.exports = {
    Tiles,
    isEmpty,
    isWall,
    isHero,
    isBurger,
    isFrenchFries,
    isSoftDrink,
    isCustomer
};
