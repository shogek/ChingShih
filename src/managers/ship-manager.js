document.ChingShih.managers.ShipManager = (() => {

   const {
      Ship,
      ShipDirections,
      config: {
         shipConfigurations,
      },
      helpers: {
         takeFirst,
      },
   } = document.ChingShih;


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

      /** Represents the ship that is currently being placed by the user. */
      _placeholder = {
         exists: false,
         ship: null,
         /** The ship's starting location */
         cellId: '',
      }

      /** Stores all the playing side's ships.
       * @type {Ship[]} */
      _ships = [];

      /** Indicates which side of the game board the 'ShipManager' will manipulate (left vs right). */
      _isEnemySide = false;

      /** Indicates which direction the current ship is being placed by the user. */
      _placementDirection = ShipDirections.HORIZONTAL;

      constructor() {
         this._onToggleShipPlacementDirection = this._onToggleShipPlacementDirection.bind(this);
      }

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
         const key = this._getFormattedCellId(row, col);
         return this._grid.get(key);
      }
   
      /** Save the ship's coordinates to avoid placing other ships on top. */
      _saveShipLocation(ship) {
         const cells$ = [...ship.cells$, ...ship.paddingCells$];
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
         const cellId = this._getFormattedCellId(row, col);
         return this._shipMap.get(cellId);
      }

      /**
       * Checks the surrounding cells for...
       * 1) any other ships already placed there
       * 2) if there are ships - if the current one can fit between it and the wall
       * ... and if true, returns the available cells$.
       * @param {number} row Row from which to start the search
       * @param {number} column Column from which to start the search
       * @param {Ship} ship Length of the ship
       * @returns {Array.<HTMLDivElement>} cells$ if success, else - empty array.
       */
      _tryCreateShipPlacementCells$(row, column, ship) {
         if (ship.direction === ShipDirections.HORIZONTAL) {
            const cols = new Array(ship.size)
               .fill(0)
               .map((_, i) => column + i)
               .filter(col => col < 11);

            return cols.length !== ship.size || cols.some(col => this._isCellUsed(row, col))
               ? []
               : cols.map(col => this._getCell(row, col));
         }

         if (ship.direction === ShipDirections.VERTICAL) {
            const rows = new Array(ship.size)
               .fill(0)
               .map((_, i) => row + i)
               .filter(row => row < 11);

            return rows.length !== ship.size || rows.some(row => this._isCellUsed(row, column))
               ? []
               : rows.map(row => this._getCell(row, column));
         }

         throw new Error(`Function's parameter (ship.direction) contains an unknown value of (${ship.direction})!`);
      }

      /**
       * Pad around the given ship for "breathing room".
       * @param {Ship} ship Ship to pad around
       * @returns {Array.<HTMLDivElement>}
       */
      _getShipPaddingCells$(ship) {
         if (ship.direction === ShipDirections.HORIZONTAL) {
            const cells$ = ship.cells$
               .sort((cellA$, cellB$) => { // Sort cells from left to right
                  const [, colA] = this._getCellCoordinates(cellA$);
                  const [, colB] = this._getCellCoordinates(cellB$);
                  return colA - colB;
            });

            const [row, col] = this._getCellCoordinates(cells$[0]);

            const cols = new Array(ship.size).fill(0).map((_, i) => col + i).filter(col => col > 0 && col < 11);
            let fromTop$ = row - 1 < 1 ? [] : cols.map(col => this._getCell(row - 1, col));
            let fromBottom$ = row + 1 > 10 ? [] : cols.map(col => this._getCell(row + 1, col));

            const rows = new Array(3).fill(0).map((_, i) => row - 1 + i).filter(row => row > 0 && row < 11);
            let fromLeft$ = col - 1 < 1 ? [] : rows.map(row => this._getCell(row, col - 1));
            let fromRight$ = col + ship.size > 10 ? [] : rows.map(row => this._getCell(row, col + ship.size));
            return [...fromTop$, ...fromBottom$, ...fromLeft$, ...fromRight$];
         }

         if (ship.direction === ShipDirections.VERTICAL) {
            const cells$ = ship.cells$
               .sort((cellA$, cellB$) => { // Sort cells from top to bottom
                  const [rowA, ] = this._getCellCoordinates(cellA$);
                  const [rowB, ] = this._getCellCoordinates(cellB$);
                  return rowA - rowB;
            });

            const [row, col] = this._getCellCoordinates(cells$[0]);

            const rows = new Array(ship.size).fill(0).map((_, i) => row + i).filter(row => row > 0 && row < 11);
            let fromLeft$ = col - 1 < 1 ? [] : rows.map(row => this._getCell(row, col - 1));
            let fromRight$ = col + 1 > 10 ? [] : rows.map(row => this._getCell(row, col + 1));

            const cols = new Array(3).fill(0).map((_, i) => col - 1 + i).filter(row => row > 0 && row < 11);
            let fromTop$ = row - 1 < 1 ? [] : cols.map(col => this._getCell(row - 1, col));
            let fromBottom$ = row + ship.size > 10 ? [] : cols.map(col => this._getCell(row + ship.size, col));
            return [...fromTop$, ...fromBottom$, ...fromLeft$, ...fromRight$];
         }

         throw new Error(`Field (ship.direction) contains an unknown value of (${ship.direction})!`);
      }

      _onToggleShipPlacementDirection(e) {
         e.preventDefault();
         e.stopPropagation();
         
         if (!this._placeholder.exists) {
            return;
         }
         
         const { ship, cellId } = this._placeholder;
         this._placementDirection = this._placementDirection === ShipDirections.HORIZONTAL
            ? ShipDirections.VERTICAL
            : ShipDirections.HORIZONTAL;

         ship.setDirection(this._placementDirection);
         // Recreate the ship to face the new direction
         this._clearPlaceholderShip();
         this._savePlaceholderShip(ship, cellId);
         this._showPlaceholderShip(ship, cellId);
      }

      _getFormattedCellId(row, col) {
         return this._isEnemySide
            ? `enemy-${row}-${col}`
            : `player-${row}-${col}`;
      }

      _savePlaceholderShip(ship, cellId) {
         if (!ship) { throw new Error("Parameter 'ship' is null!"); }
         if (!cellId) { throw new Error("Parameter 'cellId' is null!"); }

         this._placeholder.ship = ship;
         this._placeholder.cellId = cellId;
         this._placeholder.exists = true;
      }

      _confirmPlaceholderShip(ship) {
         const paddingCells$ = this._getShipPaddingCells$(ship);
         ship.setPaddingCells$(paddingCells$);
         ship.markAsPlaced();
         this._saveShipLocation(ship);
         this._clearPlaceholderShip();
      }

      _clearPlaceholderShip() {
         this._placeholder.ship?.unmarkAsPlaceholder();
         this._placeholder.ship = undefined;
         this._placeholder.cellId = '';
         this._placeholder.exists = false;
      }

      _showPlaceholderShip(ship, cellId) {
         const cell$ = this._grid.get(cellId);
         const [row, col] = this._getCellCoordinates(cell$);

         // Use the user's preferred direction
         ship.setDirection(this._placementDirection);

         const cells$ = this._tryCreateShipPlacementCells$(row, col, ship);
         if (!cells$.length) {
            this._clearPlaceholderShip();
            return;
         }

         ship.setCells$(cells$);
         ship.markAsPlaceholder();
         this._savePlaceholderShip(ship, cellId);
      }

      /** Updates the DOM to display the current ship's outline as a set and saved ship. */
      confirmPlaceholderShip() {
         if (this._placeholder.exists) {
            this._confirmPlaceholderShip(this._placeholder.ship);
         }
      }

      areAllShipsPlaced() {
         return this._ships.filter(s => !s.isPlaced).length < 1;
      }

      placeEnemyShips() {
         for (const ship of this._ships) {
            let shipNotPlaced = true;
            
            while (shipNotPlaced) {
               const row = Math.floor(Math.random() * 10) + 1;
               const col = Math.floor(Math.random() * 10) + 1;
               const direction = Math.floor(Math.random() * 10) + 1 >= 5 ? ShipDirections.VERTICAL : ShipDirections.HORIZONTAL;
               ship.setDirection(direction);

               const cells$ = this._tryCreateShipPlacementCells$(row, col, ship);
               if (cells$.length > 0) {
                  ship.setCells$(cells$);
                  this._confirmPlaceholderShip(ship);
                  ship.hidePadding();
                  shipNotPlaced = false;
               }
            }
         }
      }

      /**
       * Updates the DOM to display a ship's outline for placement.
       * @param {string} cellId The reference point (ex.: cell, which was hovered over).
       */
      showShipPlaceholder(cellId) {
         const unplacedShip = takeFirst(this._ships, s => !s.isPlaced);
         this._showPlaceholderShip(unplacedShip, cellId);
      }
   
      /** Updates the DOM to remove the currently shown ship's outline for placement. */
      removeShipPlaceholder() {
         this._clearPlaceholderShip();
      }
   
      cleanUp() {
         // TODO: Remove event listener for RMB
         // TODO: Remove padding cells
      }
      
      /**
       * Initialize the class.
       * @param {boolean} isEnemySide Indicates if the class represents the right (enemy's) board  
       */
      init({ isEnemySide }) {
         this._isEnemySide = isEnemySide;

         // Create a Map for each cell$
         for (let row = 1; row <= 10; row++) {
            for (let col = 1; col <= 10; col++) {
               const cellId = this._getFormattedCellId(row, col);
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

         document.body.addEventListener('contextmenu', this._onToggleShipPlacementDirection);
      }
   }

})();