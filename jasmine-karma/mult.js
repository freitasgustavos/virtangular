
var app = angular.module('myApp.controllers', []);

app.constant('RESTURL', 'http://'+ location.hostname);

app.controller('MainCtrl', ['$scope','RESTURL',  function($scope,RESTURL) {
    $scope.RESTURL = RESTURL;
    $scope.loading = true;
    $scope.data = null;
    $scope.resultCount = 0;
    $scope.currentPage = 0;
    $scope.pageSize = 10;

}]);