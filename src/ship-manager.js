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

   directions = {
      VERTICAL: 'Vertical',
      HORIZONTAL: 'Horizontal',
   };

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

      _placementDirection = directions.HORIZONTAL;

      constructor() {
         this._onRightMouseButtonClick = this._onRightMouseButtonClick.bind(this);
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
       * @param {number} row Row from which to start the search
       * @param {number} col Column from which to start the search
       * @param {number} shipSize
       * @returns {Array.<HTMLDivElement>} cells$ if success, else - empty array.
       */
      _tryGetShipPlaceholderCells$(row, column, shipSize) {
         if (this._placementDirection === directions.HORIZONTAL) {
            const cols = new Array(shipSize)
               .fill(0)
               .map((_, i) => column + i)
               .filter(col => col < 11);

            return cols.length !== shipSize || cols.some(col => this._isCellUsed(row, col))
               ? []
               : cols.map(col => this._getCell(row, col));
         }

         if (this._placementDirection === directions.VERTICAL) {
            const rows = new Array(shipSize)
               .fill(0)
               .map((_, i) => row + i)
               .filter(row => row < 11);

            return rows.length !== shipSize || rows.some(row => this._isCellUsed(row, column))
               ? []
               : rows.map(row => this._getCell(row, column));
         }

         throw new Error(`Field (_placementDirection) contains an unknown value of (${this._placementDirection})!`);
      }

      /**
       * Pad around the given ship for "breathing room".
       * @param {Ship} ship Ship to pad around
       * @returns {Array.<HTMLDivElement>}
       */
      _getShipPaddingCells$(ship) {
         if (this._placementDirection === directions.HORIZONTAL) {
            const cells$ = ship.getCells$()
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

         if (this._placementDirection === directions.VERTICAL) {
            const cells$ = ship.getCells$()
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

         throw new Error(`Field (_placementDirection) contains an unknown value of (${this._placementDirection})!`);
      }

      _onRightMouseButtonClick(e) {
         e.preventDefault();

         this._placementDirection = this._placementDirection === directions.HORIZONTAL
            ? directions.VERTICAL
            : directions.HORIZONTAL;
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

         document.body.addEventListener('contextmenu', this._onRightMouseButtonClick);
      }
   }

})();