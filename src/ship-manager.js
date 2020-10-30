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
   
      /**
       * Tracks which cells are used by ships.
       * [KEY] = cellID, [VAL] = 'true' - if a ship is there, else - 'false
       * @type {Map.<string, boolean>}
       */
      _shipMap = new Map();

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
   
      /** Save the ship's coordinates to avoid placing other ships on top. */
      _saveShipLocation(ship) {
         const cells$ = [...ship.getCells$(), ...ship.getPaddingCells$()];
         for (const cell$ of cells$) {
            const { id } = cell$;
            this._shipMap.set(id, true);
         }
      }

      /**
       * 'true' if a ship already exists at the given coordinates, else - 'false'
       * @param {number} row 
       * @param {number} col 
       */
      _isCellUsed(row, col) {
         const cellId = `player-${row}-${col}`;
         return this._shipMap.get(cellId);
      }

      /**
       * Checks the surrounding cells for...
       * 1) any other ships already placed there
       * 2) if there are ships - if the current one can fit between it and the wall
       * ... and if true, returns the available cells$.
       * @param {number} row Row to check on
       * @param {number} startingColumn The column from which the search will start
       * @param {number} shipSize
       * @returns {Array.<HTMLDivElement>} cells$ if success, else - empty array.
       */
      _tryGetShipPlaceholderCells$(row, startingColumn, shipSize) {
         const columns = [];
         if (this._isCellUsed(row, startingColumn)) {
            return columns;
         }

         columns.push(startingColumn);
         let cellsToFill = shipSize - 1; // 1 for the starting cell
         
         const CANT_EXPAND = -420;
         let toLeft = 1;
         let toRight = 1;
         while (cellsToFill > 0) {
            let currentCol = -1;

            if (toLeft !== CANT_EXPAND) {
               currentCol = startingColumn - toLeft;
               // Check if reached (the wall/another ship)
               if (currentCol < 1 || this._isCellUsed(row, currentCol)) {
                  toLeft = CANT_EXPAND;
                  continue;
               }
               columns.push(currentCol)
               cellsToFill--;
               toLeft++;
               continue;
            }

            if (toRight !== CANT_EXPAND) {
               currentCol = startingColumn + toRight;
               // Check if reached (the wall/another ship)
               if (currentCol > 10 || this._isCellUsed(row, currentCol)) {
                  toRight = CANT_EXPAND;
                  continue;
               }
               columns.push(currentCol)
               cellsToFill--;
               toRight++;
               continue;
            } 

            // If we reached here, it means we can't expand both to the left and right.
            break;
         }

         return columns.length !== shipSize ? [] : columns.map(column => this._getCell(row, column));
      }

      /**
       * Pad around the given ship for "breathing room".
       * @param {Ship} ship Ship to pad around
       * @returns {Array.<HTMLDivElement>}
       */
      _getShipPaddingCells$(ship) {
         const padding$ = [];
         const cells$ = ship.getCells$()
            .sort((cellA$, cellB$) => { // Sort cells from left to right
               const [, colA] = this._getCellCoordinates(cellA$);
               const [, colB] = this._getCellCoordinates(cellB$);
               return colA - colB;
         });
         // Add padding above and below throughout the ship's length
         for (const cell$ of cells$) {
            const [row, col] = this._getCellCoordinates(cell$);
            if (row - 1 > 0) { // Ship is not against the top wall
               padding$.push(this._getCell(row - 1, col));
            }
            if (row + 1 < 11) { // Ship is not against the bottom wall
               padding$.push(this._getCell(row + 1, col));
            }
         }

         // Add padding before ship
         const startCell$ = cells$.slice(0, 1)[0];
         const [startRow, startCol] = this._getCellCoordinates(startCell$);
         if (startCol - 1 > 0) { // Ship is not against the left wall
            padding$.push(this._getCell(startRow, startCol - 1));
            if (startRow - 1 > 0) { // Ship is not in the top left corner
               padding$.push(this._getCell(startRow - 1, startCol - 1));
            }
            if (startRow + 1 < 11) { // Ship is not in the bottom left corner
               padding$.push(this._getCell(startRow + 1, startCol - 1));
            }
         }
         
         // Add padding after ship
         const endCell$ = cells$.slice(cells$.length - 1, cells$.length)[0];
         const [endRow, endCol] = this._getCellCoordinates(endCell$);
         if (endCol + 1 < 11) { // Ship is not against the right wall
            padding$.push(this._getCell(endRow, endCol + 1));
            if (endRow - 1 > 0) { // Ship is not in the top right corner
               padding$.push(this._getCell(endRow - 1, endCol + 1));
            }
            if (endRow + 1 < 11) { // Ship is not in the bottom right corner
               padding$.push(this._getCell(endRow + 1, endCol + 1));
            }
         }

         return padding$;
      }

      /** Updates the DOM to display the current ship's outline as a set and saved ship. */
      placeShip() {
         const ship = takeFirst(this._ships, s => s.isPlaceholder);
         if (!ship) {
            return;
         }
         
         const paddingCells$ = this._getShipPaddingCells$(ship);
         ship.setPaddingCells$(paddingCells$);
         ship.markAsPlaced();
         this._saveShipLocation(ship);
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

         const cell$ = this._grid.get(cellId);
         const [row, col] = this._getCellCoordinates(cell$);

         const cells$ = this._tryGetShipPlaceholderCells$(row, col, ship.size);
         if (!cells$.length) {
            return;
         }

         ship.setCells$(cells$);
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
               this._shipMap.set(cellId, false);
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