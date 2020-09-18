'use strict';

angular.module('newApp')

    .controller('ListaVendaCtrl', [

        '$scope', '$rootScope', 'VendaService',

        function ($scope, $rootScope, VendaService) {
            $rootScope.hasAutorizacao();

            $scope.$on('$viewContentLoaded', function() {
                $scope.listarVenda();

            });

            $scope.listarVenda = function() {
                var strFiltro = '';
                VendaService.vendas.get({u : strFiltro}, function(resposta) {
                    $scope.arrVenda = resposta.records;
                });
            };
        }
    ]);

