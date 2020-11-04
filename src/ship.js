document.ChingShih.Ship = (() => {

   const {
      ShipDirections,
   } = document.ChingShih;


   return class Ship {
      /** Ship's class (ex.: 'Submarine'). */
      _name = '';
      /** Number of squares the ship takes. */
      _size = -1;
      /** Has the ship been placed in the DOM? */
      _isPlaced = false;
      /** Is the ship being displayed as a placeholder for the user to choose a location? */
      _isPlaceholder = false;
      /** List of cells$ which the ship occupies in the grid. */
      _cells$ = [];
      /** List of cells$ which are padded around the ship to prevent other ships from being placed there. */
      _paddingCells$ = [];
      /** Indicates which direction the ship is facing. */
      _direction = ShipDirections.HORIZONTAL;

      get isPlaceholder() { return this._isPlaceholder; }
      get isPlaced() { return this._isPlaced; }
      get direction() { return this._direction; }
      get size() { return this._size; }
      get cells$() { return [...this._cells$]; }
      get paddingCells$() { return [...this._paddingCells$]; }

      /**
       * @param {string} name Ship's class (ex.: 'Submarine')
       * @param {number} size Number of squares the ship takes
       */
      constructor(name, size) {
         this._name = name;
         this._size = size;
      }

      setCells$(cells$) { this._cells$ = [...cells$]; }
      setPaddingCells$(cells$) { this._paddingCells$ = [...cells$]; }
      setDirection(direction) { this._direction = direction; }

      /** Updates the DOM to display a ship's outline for placement. */
      markAsPlaceholder() {
         this._isPlaceholder = true;
         for (const cell$ of this._cells$) {
            cell$.classList.add('placeholder');
            cell$.classList.add(this._name);
         }
      }

      /** Updates the DOM to remove the currently shown ship's outline for placement. */
      unmarkAsPlaceholder() {
         this._isPlaceholder = false;
         for (const cell$ of this._cells$) {
            cell$.classList.remove('placeholder');
            cell$.classList.remove(this._name);
         }
      }

      /** Updates the DOM to remove the currently shown ship's outline for placement. */
      markAsPlaced() {
         this._isPlaceholder = false;
         this._isPlaced = true;
         for (const cell$ of this._cells$) {
            cell$.classList.remove('placeholder');
            cell$.classList.add('ship');
            cell$.classList.add(this._name);
         }
         for (const cell$ of this._paddingCells$) {
            cell$.classList.add('ship-padding');
            cell$.classList.add(this._name);
         }
      }

      /** Updates the DOM to hide the currently shown ship's padding. */
      hidePadding() {
         for (const cell$ of this._paddingCells$) {
            cell$.classList.remove('ship-padding');
         }
      }
   }

})();