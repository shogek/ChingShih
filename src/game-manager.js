document.ChingShih.GameManager = (() => {

   const {
      GameStates,
      PlayerStates,
      ShipManager,
   } = document.ChingShih;

   
   return class GameManager {
      /**
       * Represents the player's playing grid.
       * [KEY] = cellID, [VAL] = cell$
       * @type {Map.<string, HTMLDivElement>}
       */
      _playerGrid = new Map();
   
      /** @type {ShipManager} */
      _shipManager = new ShipManager();
   
      /** @type {GameStates} */
      _gameState = GameStates.NOT_INITIALISED;
   
      /** @type {PlayerStates} */
      _playerState = PlayerStates.READY;
   
      constructor() {
         this._onMouseEnterCell = this._onMouseEnterCell.bind(this);
         this._onMouseLeaveCell = this._onMouseLeaveCell.bind(this);
         this._onMouseClickCell = this._onMouseClickCell.bind(this);
      }

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
         if (this._shipManager.areAllShipsPlaced()) {
            this._removeMouseEventListeners();
            this._enableFight();
         }
         this._gameState = GameStates.READY;
      }
   
      _removeMouseEventListeners() {
         this._playerGrid.forEach(cell$ => {
            cell$.removeEventListener('mouseenter', this._onMouseEnterCell);
            cell$.removeEventListener('mouseleave', this._onMouseLeaveCell);
            cell$.removeEventListener('click', this._onMouseClickCell);
         });
      }

      _enableFight() {
         this._playerState = PlayerStates.FIGHTING;
         alert('All ships placed and ready for war!');
      }

      /** Store player's DOM cells and attach event listeners */
      init() {
         this._gameState = GameStates.INITIALISING;
         
         for (let row = 1; row <= 10; row++) {
            for (let col = 1; col <= 10; col++) {
               const cellId = `player-${row}-${col}`;
               const cell$ = document.getElementById(cellId);
               cell$.addEventListener('mouseenter', this._onMouseEnterCell);
               cell$.addEventListener('mouseleave', this._onMouseLeaveCell);
               cell$.addEventListener('click', this._onMouseClickCell);
               this._playerGrid.set(cellId, cell$);
            }
         }
   
         this._shipManager.init();
   
         this._gameState = GameStates.READY;
         this._playerState = PlayerStates.PLACING_SHIPS;
      }
   }

})();