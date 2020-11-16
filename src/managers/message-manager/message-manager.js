document.ChingShih.managers.MessageManager = (() => {

   return class MessageManager {
      /** The element which acts a wrapper for the whole functionality
       * @type {HTMLDivElement} */
      _screenWrapper$ = null;
      
      /** The element which displays the message
       * @type {HTMLParagraphElement} */
      _screen$ = null;


      /**
       * Initialize the class.
       * @param {string} containerElementId ID of the element which will be covered and used to display messages on.
       */
      init({ containerElementId }) {
         const wrapper$ = document.createElement('div');
         wrapper$.classList.add('message-manager-container');
         wrapper$.setAttribute('hidden', '');
         this._screenWrapper$ = wrapper$;

         const screen$ = document.createElement('p');
         screen$.classList.add('message-screen');
         this._screen$ = screen$;

         wrapper$.append(screen$);
         document.getElementById(containerElementId).append(wrapper$);
      }

      /** Display the passed in text on top of the previously given container element.
       * @param {string} text */
      show({ text }) {
         this._screen$.innerHTML = text;
         this._screenWrapper$.removeAttribute('hidden');
      }
   }

})();