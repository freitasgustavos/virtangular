'use strict';

angular.module('newApp')

    .controller('CmsModalCtrl', [

        '$scope', '$rootScope', '$uibModal', '$location', 'CmsService',

        function($scope, $rootScope, $uibModal, $location, CmsService) {
            //$rootScope.hasAutorizacao();

            /**
             * Será executada quando a página ser carregada
             */
            $scope.$on('$viewContentLoaded', function () {


            });


        }]);