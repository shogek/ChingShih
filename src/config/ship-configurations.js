document.ChingShih.config.shipConfigurations = (() => {

   const battleship = Object.freeze({
      name: 'battleship',
      size: 4,
      count: 1
   });

   const destroyer = Object.freeze({
      name: 'destroyer',
      size: 3,
      count: 2
   });

   const submarine = Object.freeze({
      name: 'submarine',
      size: 2,
      count: 3
   });

   const patrol = Object.freeze({
      name: 'patrol',
      size: 1,
      count: 4
   });

   return [battleship, destroyer, submarine, patrol];

})();