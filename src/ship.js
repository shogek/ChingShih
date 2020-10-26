document.ChingShih.Ship = (() => {

   return class Ship {
      /** Ship's class (ex.: 'Submarine'). */
      name = '';
      /** How many times this ship can be placed. */
      count = -1;
      /** Number of squares the ship takes. */
      size = -1;
      /** Has the ship been placed in the DOM? */
      _isPlaced = false;
      /** Is the ship being displayed as a placeholder for the user to choose a location? */
      _isPlaceholder = false;
      /** List of cells$ which the ship occupies in the grid. */
      _cells$ = [];

      get isPlaceholder() { return this._isPlaceholder; }
      get isPlaced() { return this._isPlaced; }

      /**
       * @param {string} name Ship's class (ex.: 'Submarine')
       * @param {number} size Number of squares the ship takes
       * @param {number} count How many times this ship can be placed
       */
      constructor(name, size, count) {
         this.name = name;
         this.size = size;
         this.count = count;
      }

      setCells(cells$) {
         this._cells$ = cells$;
      }

      /** Updates the DOM to display a ship's outline for placement. */
      markAsPlaceholder() {
         this._isPlaceholder = true;
         for (const cell$ of this._cells$) {
            cell$.classList.add('placeholder');
         }
      }

      /** Updates the DOM to remove the currently shown ship's outline for placement. */
      unmarkAsPlaceholder() {
         this._isPlaceholder = false;
         for (const cell$ of this._cells$) {
            cell$.classList.remove('placeholder');
         }
      }

      /** Updates the DOM to remove the currently shown ship's outline for placement. */
      markAsPlaced() {
         this._isPlaceholder = false;
         this._isPlaced = true;
         for (const cell$ of this._cells$) {
            cell$.classList.remove('placeholder');
            cell$.classList.add('ship');
         }
      }
   }

})();