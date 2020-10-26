document.ChingShih.ShipManager = (() => {

   const {
      Ship,
      config: {
         shipConfigurations,
      },
      helpers: {
         takeFirst,
      },
   } = document.ChingShih

   return class ShipManager {
      /**
       * Represents a playing side's grid.
       * [KEY] = cellID, [VAL] = cell$
       * @type {Map.<string, HTMLDivElement>}
       */
      _grid = new Map();
   
      /** Stores ship's placeholder cells when the player is choosing a location for his ship. 
       * @type {HTMLDivElement[]} */
      _placeholderShip = [];
   
      /** Stores all the playing side's ships.
       * @type {Ship[]} */
      _ships = [];


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
         const ship = takeFirst(this._ships, s => s.isPlaceholder);
         ship?.markAsPlaced();
      }

      areAllShipsPlaced() {
         return this._ships.filter(s => !s.isPlaced).length < 1;
      }

      /**
       * Updates the DOM to display a ship's outline for placement.
       * @param {string} cellId The reference point (ex.: cell, which was hovered over).
       */
      addShipPlaceholder(cellId) {
         const ship = takeFirst(this._ships, s => !s.isPlaced);
         let cellsToPlace = ship.size;

         const cell$ = this._grid.get(cellId);
         const [row, col] = this._getCellCoordinates(cell$);
         
         const placeholderCells$ = [];
         placeholderCells$.push(this._getCell(row, col));
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
   
            placeholderCells$.push(placeholderCell$);
            cellsToPlace--;
         }

         ship.setCells(placeholderCells$);
         ship.markAsPlaceholder();
      }
   
      /** Updates the DOM to remove the currently shown ship's outline for placement. */
      removeShipPlaceholder() {
         const ship = takeFirst(this._ships, s => s.isPlaceholder);
         ship?.unmarkAsPlaceholder();
      }
   
      init() {
         // Create a Map for each cell$
         for (let row = 1; row <= 10; row++) {
            for (let col = 1; col <= 10; col++) {
               const cellId = `player-${row}-${col}`;
               const cell$ = document.getElementById(cellId);
               this._grid.set(cellId, cell$);
            }
         }

         // Load the ships
         for (const shipConfiguration of shipConfigurations) {
            const { name, size, count } = shipConfiguration;
            [...new Array(count)].forEach(() => {
               const ship = new Ship(name, size);
               this._ships.push(ship);
            });
         }
      }
   }

})();