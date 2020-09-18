/**
 * angular-spinkit module
 * SpinKit (https://github.com/tobiasahlin/SpinKit) spinners for AngularJS
 *
 * Author: Urigo - https://github.com/Urigo
 */
'use strict';

angular.module('angular-spinkit',
  [
    'ngRotatingPlaneSpinner',
    'ngDoubleBounceSpinner',
    'ngWaveSpinner',
    'ngWanderingCubesSpinner',
    'ngPulseSpinner',
    'ngChasingDotsSpinner',
    'ngCircleSpinner',
    'ngThreeBounceSpinner',
    'ngCubeGridSpinner',
    'ngWordPressSpinner',
    'ngFadingCircleSpinner',
    'ngSpinkitImagePreloader'
  ]);

angular.module('ngRotatingPlaneSpinner', []).directive('rotatingPlaneSpinner', function () {
  return {
    restrict: 'E',
    template: '<div class="three-dots-row-spinner"></div>'
  };
});

angular.module('ngDoubleBounceSpinner', []).directive('doubleBounceSpinner', function () {
  return {
    restrict: 'E',
    template: '<div class="double-bounce-spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>'
  };
});

angular.module('ngWaveSpinner', []).directive('waveSpinner', function () {
  return {
    restrict: 'E',
    template: '<div class="wave-spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>'
  };
});

angular.module('ngWanderingCubesSpinner', []).directive('wanderingCubesSpinner', function () {
  return {
    restrict: 'E',
    template: '<div class="wandering-cubes-spinner"></div>'
  };
});

angular.module('ngPulseSpinner', []).directive('pulseSpinner', function () {
  return {
    restrict: 'E',
    template: '<div class="pulse-spinner"></div>'
  };
});

angular.module('ngChasingDotsSpinner', []).directive('chasingDotsSpinner', function () {
  return {
    restrict: 'E',
    template: '<div class="chasing-dots-spinner"><div class="dot1"></div><div class="dot2"></div></div>'
    //template: 'src/templates/chasingDotsSpinner.html'
  };
});

angular.module('ngCircleSpinner', []).directive('circleSpinner', function () {
  return {
    restrict: 'E',
    template: '<div class="spinning-dots-spinner"><div class="spinner-container container1"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="spinner-container container2"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="spinner-container container3"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div></div>'
  };
});

angular.module('ngThreeBounceSpinner', []).directive('threeBounceSpinner', function () {
  return {
    restrict: 'E',
    template: '<div class="three-bounce-spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>'
  };
});

angular.module('ngCubeGridSpinner', []).directive('cubeGridSpinner', function () {
  return {
    restrict: 'E',
    template: '<div class="cube-grid-spinner"><div class="cube"></div><div class="cube"></div><div class="cube"></div><div class="cube"></div><div class="cube"></div><div class="cube"></div><div class="cube"></div><div class="cube"></div><div class="cube"></div></div>'
  };
});

angular.module('ngWordPressSpinner', []).directive('wordPressSpinner', function () {
  return {
    restrict: 'E',
    template: '<div class="word-press-spinner"><span class="inner-circle"></span></div>'
  };
});

angular.module('ngFadingCircleSpinner', []).directive('fadingCircleSpinner', function () {
  return {
    restrict: 'E',
    template: '<div class="fading-circle-spinner"><div class="fading-circle1 fading-circle"></div><div class="fading-circle2 fading-circle"></div><div class="fading-circle3 fading-circle"></div><div class="fading-circle4 fading-circle"></div><div class="fading-circle5 fading-circle"></div><div class="fading-circle6 fading-circle"></div><div class="fading-circle7 fading-circle"></div><div class="fading-circle8 fading-circle"></div><div class="fading-circle9 fading-circle"></div><div class="fading-circle10 fading-circle"></div><div class="fading-circle11 fading-circle"></div><div class="fading-circle12 fading-circle"></div></div>'
  };
});

angular.module('ngSpinkitImagePreloader', []).directive('spinkitImagePreloader', ['$compile', '$injector', '$rootScope', function ($compile, $injector, $rootScope) {
  return {
    restrict: 'A',
    scope: {
      ngSrc: '@',
      spinkitImagePreloader: '@',
      spinkitImagePreloaderClass: '@'
    },
    link: function(scope, element, attrs) {
      var spinnerWrapper,
          spinnerWrapperClass = scope.spinkitImagePreloaderClass || 'spinner-wrapper',
          spinner;

      // Check for the existence of the spinkit-directive
      if(!$injector.has(attrs.$normalize(scope.spinkitImagePreloader) + 'Directive'))
        return;

      // Create and configure DOM-spinner-elements
      spinnerWrapper = angular.element('<div/>').addClass(spinnerWrapperClass),
      spinner = $compile('<' + scope.spinkitImagePreloader + '/>')(scope);
      spinnerWrapper.append(spinner);
      spinnerWrapper.css('overflow', 'hidden');

      element.after(spinnerWrapper);

      // Copy dimensions (inline and attributes) from the image to the spinner wrapper
      if(element.css('width'))
        spinnerWrapper.css('width', element.css('width'));

      if(attrs.width)
        spinnerWrapper.css('width', attrs.width + 'px');

      if(element.css('height'))
        spinnerWrapper.css('height', element.css('height'));

      if(attrs.height)
        spinnerWrapper.css('height', attrs.height + 'px');

      element.on('load', function () {
        spinnerWrapper.css('display', 'none');
        element.css('display', 'block');
        $rootScope.$broadcast('angular-spinkit:imageLoaded');
      });

      scope.$watch('ngSrc', function () {
        spinnerWrapper.css('display', 'block');
        element.css('display', 'none');
      });
    }
  };
}]);