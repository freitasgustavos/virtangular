'use strict';

angular.module('newApp')

    .controller('CobrancaCtrl', [

        '$scope', '$rootScope', '$routeParams', '$location', '$timeout', 'GeralFactory', 'FinanceiroService',

        function ($scope, $rootScope, $routeParams, $location, $timeout, GeralFactory, FinanceiroService) {
            
            $rootScope.hasAutorizacao();

            $scope.forms   = {};
            $scope.objTela = {
                tipo : '',
                code : ''
            };

            $scope.$on('$viewContentLoaded', function() {

                console.log('Params: ', $routeParams);
                if ($routeParams.tipo && $routeParams.sequencial) {

                    $scope.objTela = {
                        tipo : $routeParams.tipo.toLowerCase().trim(),
                        code : $routeParams.sequencial.trim()
                    };

                    $timeout(function() {

                        $scope.objTransacao = {};
                        $scope.initCobranca();

                    }, 800);

                } else {

                    $location.path('/');
                }
            });


            /**
             * Metodo responsavel em inicializar a tela contendo um informativo relativo a uma
             * determinada cobrança para o usuario final da aplicaçao.
             */
            $scope.initCobranca = function() {

                var arrTipos = ['expirou', 'retorno'];
                if (GeralFactory.inArray($scope.objTela.tipo, arrTipos)) {

                    var objeto = {sequencial : $scope.objTela.code};
                    FinanceiroService.cobranca.getTransacao(objeto, function(retorno) {
                        if (! retorno.records.error) {

                            var objTransacao = retorno.records.data;
                            $scope.objTransacao = objTransacao;
                            $scope.objTransacao['tra_dat_expiracao_format'] = GeralFactory.formatarDataBr(objTransacao['tra_dat_expiracao']);

                        } else {

                            GeralFactory.notify('danger', 'Atenção!', retorno.records.msg);
                            $timeout(function() {
                                $location.path('/');
                            }, 10000);
                        }
                    });

                } else {

                    $location.path('/');
                }
            };


            /**
             * Efetua o redirecionamento para uma determinada URL.
             */
            $scope.goTo = function(url) {

                $location.path(url);
            }
        }
    ]);