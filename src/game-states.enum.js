document.ChingShih.GameStates = (() => {

   return class GameStates {
      static NOT_INITIALISED = 'The game has not been initialised';
      static INITIALISING = 'The game is being initialised';
      static PROCESSING = 'The game is currently busy';
      static READY = 'The game is ready for user input';
   }

})();