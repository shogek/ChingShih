globalThis.ChingShih.ShipManager = (() => {

   class ShipManager {
      /**
       * Represents a playing side's grid.
       * [KEY] = cellID, [VAL] = cell$
       * @type {Map.<string, HTMLDivElement>}
       */
      _grid = new Map();
   
      /**
       * Stores ship's placeholder cells when the player is choosing a location for his ship. 
       * @type {HTMLDivElement[]}
       */
      _placeholderShip = [];
   
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
   
      /**
       * Get cell$ by row and column numbers
       * @param {number} row 
       * @param {number} col
       * @returns {HTMLDivElement} 
       */
      _getCell(row, col) {
         const key = `player-${row}-${col}`;
         return this._grid.get(key);
      }
   
      /** Updates the DOM to display the current ship's outline as a set and saved ship. */
      placeShip() {
         while (this._placeholder.length > 0) {
            const placeholderCell$ = this._placeholder.pop();
            placeholderCell$.classList.remove('placeholder');
            placeholderCell$.classList.add('ship');
            setTimeout(null, 0);
         }
      }
   
      /**
       * Updates the DOM to display a ship's outline for placement.
       * @param {string} cellId The reference point (ex.: cell, which was hovered over).
       */
      addShipPlaceholder(cellId) {
         const cell$ = this._grid.get(cellId);
         const [row, col] = this._getCellCoordinates(cell$);
   
         let cellsToPlace = 5;
         
         let placeholderCell$ = null;
         placeholderCell$ = this._getCell(row, col);
         placeholderCell$.classList.add('placeholder');
         this._placeholderShip.push(placeholderCell$);
         cellsToPlace--;
         
         let fromRight = 1;
         let fromLeft = 1;
         while (cellsToPlace > 0) {
            let placeholderCell$ = null;
            
            if (col - fromLeft > 0) {
               placeholderCell$ = this._getCell(row, col - fromLeft);
               fromLeft++;
            } else {
               placeholderCell$ = this._getCell(row, col + fromRight);
               fromRight++;
            }
   
            placeholderCell$.classList.add('placeholder');
            setTimeout(() => {}, 0);
            this._placeholderShip.push(placeholderCell$);
   
            cellsToPlace--;
         }
      }
   
      /** Updates the DOM to remove the currently shown ship's outline for placement. */
      removeShipPlaceholder() {
         while (this._placeholderShip.length) {
            const cell$ = this._placeholderShip.pop();
            cell$.classList.remove('placeholder');
            setTimeout(() => {}, 0);
         }
      }
   
      init() {
         for (let row = 1; row <= 10; row++) {
            for (let col = 1; col <= 10; col++) {
               const cellId = `player-${row}-${col}`;
               const cell$ = document.getElementById(cellId);
               this._grid.set(cellId, cell$);
            }
         }
      }
   }

   return ShipManager;

})();