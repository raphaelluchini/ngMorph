(function (angular){
  "use strict";

  angular.module('morph.directives')
  .directive('ngMorph', ['TemplateHandler', '$compile', 'Morph', '$rootScope', function (TemplateHandler, $compile, Morph, $rootScope) {
    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attrs) {
        var wrapper = angular.element('<div></div>').css('visibility', 'hidden');
        var _settings = {};
        var componentSettings = scope[attrs.ngMorph];
        var isMorphed = false;
        var currentScope = scope;

        _settings.callback = componentSettings.callback;
        var compile = function (results) {
          var morphTemplate = results.data ? results.data : results;
          currentScope = $rootScope.$new();
          currentScope.data = componentSettings.data;
          currentScope.actions = componentSettings.actions;
          return $compile(morphTemplate)(currentScope);
        };

        var initMorphable = function (content) {
          var closeEl  = angular.element(content[0].querySelector(componentSettings.closeEl));
          var elements = {
            morphable: element,
            wrapper: wrapper,
            content: content
          };
          var fade = null;
          // create element for modal fade
          if (componentSettings.fade !== false) {
            fade = angular.element('<div></div>');
            elements.fade = fade;
          }

          // add to dom
          wrapper.append(content);
          element.after(wrapper);
          if (fade) wrapper.after(fade);
          
          // // set the wrapper bg color
          wrapper.css('background', getComputedStyle(content[0]).backgroundColor);

          // // get bounding rectangles
          _settings.MorphableBoundingRect = element[0].getBoundingClientRect();
          _settings.ContentBoundingRect = content[0].getBoundingClientRect();
          // // bootstrap the modal
          var modal = new Morph(componentSettings.transition, elements, _settings);

          // attach event listeners
          element.bind('click', function () {
            _settings.MorphableBoundingRect = element[0].getBoundingClientRect();
            isMorphed = modal.toggle(isMorphed);
          });

          if (closeEl) {
            closeEl.bind('click', function (event) {
              _settings.MorphableBoundingRect = element[0].getBoundingClientRect();
              isMorphed = modal.toggle(isMorphed);
            });
          }

          // remove event handlers when scope is destroyed
          scope.$on('$destroy', function () {
            element.unbind('click');
            closeEl.unbind('click');
          });
        };

        if (componentSettings.template) {
          initMorphable(compile(componentSettings.template));
        } else if (componentSettings.templateUrl) {
          TemplateHandler
            .get(componentSettings.templateUrl)
            .then(compile)
            .then(initMorphable);
        } else {
          throw new Error('No template found.');
        }

      }
    };
  }]);
})(angular);