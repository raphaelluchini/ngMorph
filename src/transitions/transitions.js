(function (angular){
  "use strict";
  
  angular.module('morph.transitions', ['morph.assist'])
  .factory('Transitions', ['Modal', 'Overlay', function (Modal, Overlay) {
    return {
      modal: Modal,
      overlay: Overlay
    };
  }]);
})(angular);