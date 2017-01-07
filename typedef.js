/* Usefull types definition! Autocompletion works nicely in WebStorm! */

/**
 * @typedef {Object} Play
 * @property {Game} game       The current game state
 * @property {Hero} hero       Your hero status
 * @property {string} token    The magic token
 * @property {string} viewUrl  An URL that you can open in your browser to view a replay of the game
 * @property {string} playUrl  he url to do your next move
 */

/**
 * @typedef {Object} Game
 * @property {string} id                  The game id
 * @property {number} turn                The current turn
 * @property {number} maxTurns            The maximum number of turns in this game
 * @property {Array<Customer>} customers  The current customers’ state
 * @property {Array<Hero>} heros          The current heroes’ state (including yours)
 * @property {Board} board                The current board state
 * @property {Boolean} finished           Is the game finished ?
 */

/**
 * @typedef {Object} Customer
 * @property {number} id               Customer id
 * @property {number} burger           Burgers required to fulfill the order
 * @property {number} frenchFries      French fries required to fulfill the order
 * @property {number} fulfilledOrders  Number of orders that were fulfilled for this customer
 */

/**
 * @typedef {Object} Hero
 * @property {number} id                Hero id
 * @property {string} name              Hero name
 * @property {string} userId            User id
 * @property {Pos} pos                  Current position
 * @property {string} lastDir           Last direction sent
 * @property {number} life              Current life (max is 100)
 * @property {number} calories          Calories (this is your point count)
 * @property {number} burgerCount       Current burger count
 * @property {number} frenchFriesCount  Current french fries count
 * @property {Pos} spawnPos             Spawn point position when you die and respawn
 * @property {boolean} crashed          Has this player crashed
 */

/**
 * @typedef {Object} Pos
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} CustomerPos
 * @property {number} x
 * @property {number} y
 * @property {string} id
 */
