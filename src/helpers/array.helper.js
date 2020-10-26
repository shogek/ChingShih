document.ChingShih.helpers.takeFirst = (() => {

   /**
    * Returns the first element in the array which satisfies the filter function.
    * @param {Array<T>} array An iteratable list of elements
    * @param {function} filterFn A filter function
    */
   return function(array, filterFn) {
      if (!array) { throw new Error("takeFirst parameter 'array' is null!"); }
      if (!filterFn) { throw new Error("takeFirst parameter 'filterFn' is null!"); }
      if (array.length < 1) { throw new Error("takeFirst parameter 'array' is empty!");}

      let result;
      for (const item of array) {
         if (filterFn(item)) {
            result = item;
            break;
         }
      }
      return result;
   }

})();