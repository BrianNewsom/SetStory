var underscore = angular.module('underscore', []);
underscore.factory('_', ['$window', function() {
  return $window._; // assumes underscore has already been loaded on the page
}]);