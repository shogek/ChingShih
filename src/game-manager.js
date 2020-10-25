globalThis.ChingShih.GameManager = (() => {

   const {
      GameStates,
      PlayerStates,
      ShipManager,
   } = globalThis.ChingShih;

   
   return class GameManager {
      /**
       * Represents the player's playing grid.
       * [KEY] = cellID, [VAL] = cell$
       * @type {Map.<string, HTMLDivElement>}
       */
      _playerGrid = new Map();
   
      /** @type {ShipManager} */
      _shipManager = null;
   
      /** @type {GameStates} */
      _gameState = GameStates.NOT_INITIALISED;
   
      /** @type {PlayerStates} */
      _playerState = PlayerStates.READY;
   
   
      _onMouseEnterCell(e) {
         if (this._gameState === GameStates.PROCESSING) {
            return;
         }
   
         this._gameState = GameStates.PROCESSING;
         this._shipManager.addShipPlaceholder(e.target.id);
         this._gameState = GameStates.READY;
      }
   
      _onMouseLeaveCell() {
         if (this._gameState === GameStates.PROCESSING) {
            return;
         }
   
         this._gameState = GameStates.PROCESSING;
         this._shipManager.removeShipPlaceholder();
         this._gameState = GameStates.READY;
      }
   
      _onMouseClickCell() {
         if (this._gameState === GameStates.PROCESSING) {
            return;
         }
   
         this._gameState = GameStates.PROCESSING;
         this._shipManager.placeShip();
         this._gameState = GameStates.READY;
      }
   
      /** Store player's DOM cells and attach event listeners */
      init() {
         this._gameState = GameStates.INITIALISING;
         
         for (let row = 1; row <= 10; row++) {
            for (let col = 1; col <= 10; col++) {
               const cellId = `player-${row}-${col}`;
               const cell$ = document.getElementById(cellId);
               cell$.addEventListener('mouseenter', (e) => this._onMouseEnterCell(e));
               cell$.addEventListener('mouseleave', (e) => this._onMouseLeaveCell(e));
               cell$.addEventListener('click', (e) => this._onMouseClickCell(e));
               this._playerGrid.set(cellId, cell$);
            }
         }
   
         this._shipManager = new ShipManager();
         this._shipManager.init();
   
         this._gameState = GameStates.READY;
         this._playerState = PlayerStates.PLACING_SHIPS;
      }
   }

})();