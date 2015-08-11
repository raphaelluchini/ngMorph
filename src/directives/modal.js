(function (angular){
  "use strict";

  angular.module('morph.directives')
  .directive('ngMorph', ['TemplateHandler', '$compile', 'Morph', '$rootScope', '$controller', function (TemplateHandler, $compile, Morph, $rootScope, $controller) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var _settings = {};
        var componentSettings = scope[attrs.ngMorph];
        var isMorphed = false;
        var currentScope = scope;
        var morphableObject = null;

        _settings.callback = function(){
          if(componentSettings.callback){
            componentSettings.callback();
          }
          morphableObject.closeEl.unbind('click');
          morphableObject = null;
        };

        var compile = function (results) {
          var morphTemplate = results.data ? results.data : results;
          currentScope = $rootScope.$new();
          currentScope.data = componentSettings.data;
          currentScope.actions = componentSettings.actions;

          var ctrlInstance, ctrlLocals = {};

          if (componentSettings.controller) {
            ctrlLocals = currentScope;

            ctrlInstance = $controller(componentSettings.controller, ctrlLocals);
            if (componentSettings.controllerAs) {
              if (componentSettings.bindToController) {
                angular.extend(ctrlInstance, currentScope);
              }

              currentScope[componentSettings.controllerAs] = ctrlInstance;
            }
          }
          return $compile(morphTemplate)(currentScope);
        };

        var initMorphable = function (content) {
          var wrapper = angular.element('<div></div>').css('visibility', 'hidden');
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

          // set the wrapper bg color
          wrapper.css('background', getComputedStyle(content[0]).backgroundColor);

          // get bounding rectangles
          _settings.MorphableBoundingRect = element[0].getBoundingClientRect();
          _settings.ContentBoundingRect = content[0].getBoundingClientRect();
          
          return {morph: new Morph(componentSettings.transition, elements, _settings), closeEl:closeEl};
        };

        element.bind('click', function () {
          if (componentSettings.template) {
            start(compile(componentSettings.template));
          } else if (componentSettings.templateUrl) {
            TemplateHandler
              .get(componentSettings.templateUrl)
              .then(compile)
              .then(start);
          } else {
            throw new Error('No template found.');
          }
        });

        function start(scopeCompiled){
          morphableObject = initMorphable(scopeCompiled);
          _settings.MorphableBoundingRect = element[0].getBoundingClientRect();
          isMorphed = morphableObject.morph.toggle(isMorphed);

          if (morphableObject.closeEl) {
            morphableObject.closeEl.bind('click', function () {
              _settings.MorphableBoundingRect = element[0].getBoundingClientRect();
              isMorphed = morphableObject.morph.toggle(isMorphed);
            });
          }
        }

        // remove event handlers when scope is destroyed
        scope.$on('$destroy', function () {
          morphableObject.closeEl.unbind('click');
        });

      }
    };
  }]);
})(angular);