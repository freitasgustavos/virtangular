'use strict';

angular.module('newApp')

    .controller('CmsCtrl', [

        '$scope', '$rootScope', '$uibModal', '$location', 'CmsService',

        function($scope, $rootScope, $uibModal, $location, CmsService) {
            $rootScope.hasAutorizacao();

            /**
             * Será executada quando a página ser carregada
             */
            $scope.$on('$viewContentLoaded', function () {


                //$window.parent.angular.element($window.frameElement).scope();
                //document.getElementById("tt").contentWindow.angular;
                //
                //$scope.$apply(function () { console.log('jjj');});

            });

            $scope.clique = function() {

                var scope = $rootScope.$new();

                scope.params = {};
                //scope.params.venda = $scope.venda.selected;

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'cms/views/janela-cms.html',
                    controller: 'CmsModalCtrl',
                    size: 'lg',
                    windowClass: 'center-modal no-top-modal',
                    scope: scope,
                    resolve: {}
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {

                    if (msg === 'reload') {

                    }
                });

            };

        }]);