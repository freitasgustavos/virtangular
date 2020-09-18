'use strict';

angular.module('newApp')

    .controller('TesteCtrl', [

        '$scope', '$rootScope', 'ClienteService', 'ProdutoService', function($scope, $rootScope, ClienteService, ProdutoService) {
            $rootScope.hasAutorizacao();

            $scope.selectedDataCliente = null;
            $scope.selectedDataProduto = null;

            $scope.$on('$viewContentLoaded', function() {

                /**
                 * $scope.objCliente = 'Erik Urbanski Santos';
                 * $scope.objProduto = '';
                 */

                $scope.objFiltroCliente = {
                    cad_tip_cli_for : 1
                };
            });

            /**
             * Selecionando um cliente.
             * @param Object objSelecionado
             */
            $scope.onSelectCliente = function(objCliente) {
                console.log(objCliente.cad_nome_razao);
                $scope.selectedDataCliente = objCliente;
            };

            /**
             * Adicionando um novo cliente.
             * @param String termo
             */
            $scope.addCliente = function(termo) {
                var objCliente = {
                    cad_nome_razao  : termo,
                    cad_tip_cli_for : 1,
                    cad_eh_inativo  : 0
                };

                ClienteService.clientes.create(objCliente, function(retorno) {
                    if (! retorno.records.error) {

                        objCliente.cad_cod_cad = parseInt(retorno.records.cad_cod_cad);
                        $scope.selectedDataCliente = objCliente;
                        console.log($scope.selectedDataCliente.cad_nome_razao);
                    }
                });
            };

            /**
             *
             */
            $scope.teste = function() {
                alert('Oi!');
            };

            /**
             * Limpando o componente.
             */
            $scope.clearInput = function() {
                $scope.$broadcast('lv-autocomplete:clearInput');
            };

            /**
             * Selecionando um produto.
             * @param objProduto
             */
            $scope.onSelectProduto = function(objProduto) {
                console.log(objProduto);
                $scope.selectedDataProduto = objProduto;
            };

            /**
             * Adicionando um novo produto.
             * @param String termo
             */
            $scope.addProduto = function(termo) {
                var objProduto = {
                    pro_eh_visivel_web  : 1,
                    pro_eh_inativo      : 0,
                    pro_eh_visivel      : 1,
                    pro_gru_cod_gru     : 65,
                    pro_descricao_longa : termo
                };

                ProdutoService.produtos.create(objProduto, function(retorno) {
                    if (! retorno.records.error) {

                        objProduto.pro_cod_pro = parseInt(retorno.records.pro_cod_pro);
                        $scope.selectedDataProduto = objProduto;
                        console.log($scope.selectedDataProduto);
                    }
                });
            };






            $scope.CompletedEvent = function (scope) {
                console.log("Completed Event called");
            };

            $scope.ExitEvent = function (scope) {
                console.log("Exit Event called");
            };

            $scope.ChangeEvent = function (targetElement, scope) {
                console.log("Change Event called");
                console.log(targetElement);  //The target element
                console.log(this);  //The IntroJS object
            };

            $scope.BeforeChangeEvent = function (targetElement, scope) {
                console.log("Before Change Event called");
                console.log(targetElement);
            };

            $scope.AfterChangeEvent = function (targetElement, scope) {
                console.log("After Change Event called");
                console.log(targetElement);
            };

            $scope.IntroOptions = {
                steps:[
                    {
                        element : document.querySelector('#step1'),
                        intro: "This is the first tooltip."
                    },
                    {
                        element: document.querySelectorAll('#step2')[0],
                        intro: "<strong>You</strong> can also <em>include</em> HTML",
                        position: 'right'
                    },
                    {
                        element: '#step3',
                        intro: 'More features, more fun.',
                        position: 'left'
                    },
                    {
                        element: '#step4',
                        intro: "Another step.",
                        position: 'bottom'
                    },
                    {
                        element: '#step5',
                        intro: 'Get it, use it.'
                    }
                ],
                showStepNumbers: false,
                exitOnOverlayClick: false,
                exitOnEsc: true,
                nextLabel: '<strong>NEXT!</strong>',
                prevLabel: '<span style="color:green">Previous</span>',
                skipLabel: 'Exit',
                doneLabel: 'Thanks'
            };

            $scope.ShouldAutoStart = false;
        }
    ]);