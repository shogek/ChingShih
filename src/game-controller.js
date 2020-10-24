const GAME_STATES = globalThis.ChingShih.GameStates;
const PLAYER_STATES = globalThis.ChingShih.PlayerStates;

class GameController {
   /**
    * Represents the player's playing grid.
    * [KEY] = cellID, [VAL] = cell$
    * @type {Map.<string, HTMLDivElement>}
    */
   _playerGrid = new Map();

   /** @type {GAME_STATES} */
   _gameState = GAME_STATES.NOT_INITIALISED;

   /** @type {PLAYER_STATES} */
   _playerState = PLAYER_STATES.READY;

   _ships = {
      /**
       * Used when the player is choosing a location for his ship. 
       * @type {HTMLDivElement[]}
       */
      placeholder: [],
      /** @type {HTMLDivElement[]} */
      carrier: [],
   };

   /**
    * Parse a cell's ID to extract row and col.
    * @param {HTMLDivElement} cell$
    * @returns {[number, number]} row, col
    */
   _getCellCoordinates(cell$) {
      const [_, y, x] = cell$.id.split('-');
      const row = parseInt(y);
      const col = parseInt(x);
      return [row, col];
   }

   //#region Mouse events
   _placeShip() {
      if (this._gameState === GAME_STATES.PROCESSING
         || this._playerState !== PLAYER_STATES.PLACING_SHIPS) {
         return;
      }

      const { placeholder, carrier } = this._ships;
      while (placeholder.length > 0) {
         const placeholderCell$ = placeholder.pop();
         placeholderCell$.classList.remove('placeholder');
         placeholderCell$.classList.add('ship');
         carrier.push(placeholderCell$);
         setTimeout(null, 0);
      }

      this._playerState = PLAYER_STATES.READY;
   }

   _showShipPlaceholder(e) {
      if (this._gameState === GAME_STATES.PROCESSING
         || this._playerState !== PLAYER_STATES.PLACING_SHIPS) {
         return;
      } else {
         this._gameState = GAME_STATES.PROCESSING;
      }

      const cell$ = this._playerGrid.get(e.target.id);
      const [row, col] = this._getCellCoordinates(cell$);

      let cellsToPlace = 5;
      
      let placeholderCell$ = null;
      placeholderCell$ = this._getPlayerCell(row, col);
      placeholderCell$.classList.add('placeholder');
      this._ships.placeholder.push(placeholderCell$);
      cellsToPlace--;
      
      let fromRight = 1;
      let fromLeft = 1;
      while (cellsToPlace > 0) {
         let placeholderCell$ = null;
         
         if (col - fromLeft > 0) {
            placeholderCell$ = this._getPlayerCell(row, col - fromLeft);
            fromLeft++;
         } else {
            placeholderCell$ = this._getPlayerCell(row, col + fromRight);
            fromRight++;
         }

         placeholderCell$.classList.add('placeholder');
         setTimeout(() => {}, 0);
         this._ships.placeholder.push(placeholderCell$);

         cellsToPlace--;
      }

      this._gameState = GAME_STATES.READY
   }

   _hideShipPlaceholder() {
      const { placeholder } = this._ships;
      while (placeholder.length) {
         const cell$ = placeholder.pop();
         cell$.classList.remove('placeholder');
         setTimeout(() => {}, 0);
      }
   }
   //#endregion

   /**
    * Get cell$ by row and column numbers
    * @param {number} row 
    * @param {number} col
    * @returns {HTMLDivElement} 
    */
   _getPlayerCell(row, col) {
      const key = `player-${row}-${col}`;
      return this._playerGrid.get(key);
   }

   /** Store player's DOM cells and attach event listeners */
   init() {
      this._gameState = GAME_STATES.INITIALISING;
      
      for (let row = 1; row <= 10; row++) {
         for (let col = 1; col <= 10; col++) {
            const cellId = `player-${row}-${col}`;
            const cell$ = document.getElementById(cellId);
            cell$.addEventListener('mouseenter', (e) => this._showShipPlaceholder(e));
            cell$.addEventListener('mouseleave', (e) => this._hideShipPlaceholder(e));
            cell$.addEventListener('click', (e) => this._placeShip(e));
            this._playerGrid.set(cellId, cell$);
         }
      }

      this._gameState = GAME_STATES.READY;
      this._playerState = PLAYER_STATES.PLACING_SHIPS;
   }
}

globalThis.ChingShih.GameController = GameController;