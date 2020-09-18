'use strict';

angular.module('newApp')

    .controller('ParametroCtrl', [

        '$scope', '$rootScope', '$uibModal', '$timeout', '$location', 'ParamsService', 'GeralFactory', 'Wizard',

        function ($scope, $rootScope, $uibModal, $timeout, $location, ParamsService, GeralFactory, Wizard) {

            $rootScope.hasAutorizacao();

            if (! $rootScope.getPermissao('18')) {
                $location.path('/');
            }

            $scope.$on('$viewContentLoaded', function () {

                $scope.parametro  = {};
                $scope.param      = {};
                $scope.valorParam = {};
                $scope.parametros = [];
                $scope.arrAssunto = ParamsService.getArrAssunto();

                $timeout(function () {
                    Wizard.loadWizards.initialize(18);
                }, 2000);
            });


            /**
             * Lista os parâmetros.
             */
            $scope.listarParametros = function() {

                if ($scope.parametro.assunto_pesquisar == undefined) {
                    $scope.parametros = [];
                }

                ParamsService.getParametros($scope.parametro.assunto_pesquisar, function(data) {
                    if (data) {

                        $scope.param = {};
                        $scope.parametros = [];
                        if (! _.isEmpty(data)) {

                            angular.forEach(data, function(i, j) {

                                $scope.parametros = data[j];
                                angular.forEach($scope.parametros, function(m, l) {

                                    $scope.parametros[l]['codigoComb']        = m.par_pai + '.' + m.par_filho + '.' + m.par_neto;
                                    $scope.parametros[l]['codCombinadoParam'] = m.par_cod_emp + '|' + m.par_assunto + '|' + m.par_pai + '|' + m.par_filho + '|' + m.par_neto;
                                });

                                $scope.param.par_pgm = i.par_pgm;
                            });

                            angular.element('#par_pai').attr('disabled', true);
                        }
                    }
                });
            };


            /**
             * Limpa o formulário de parâmetro e prepara para cadastrar um novo registro.
             */
            $scope.novoParametro = function() {

                $scope.param = {};
            };


            /**
             * Retorna os dados de um determinado parâmetro.
             */
            $scope.getParametro = function(combinadoPar) {

                $scope.combinadoParSelected = combinadoPar;
                ParamsService.getParametro(combinadoPar, function(data) {

                    $scope.param = data;
                    $scope.param.combinadoPar = combinadoPar;
                });
            };


            /**
             * Busca os parâmetros e campos de determinado assunto
             **/
            $scope.getBuscarAssunto = function() {

                $scope.listarParametros();
                $scope.buscarCampos();
            };


            /**
             * Retorna as perguntas de determinado assunto em vix-par-rot.
             */
            $scope.buscarCampos = function() {

                var strFiltro = 'q=(rot_par_assunto:' + $scope.parametro.assunto_pesquisar + ')';
                ParamsService.paramsRot.get({u : strFiltro}, function(data) {
                    $scope.campos = [];
                    if (! _.isEmpty(data.records)) {

                        $scope.campos = data.records;
                    }
                });
            };


            /**
             * Retorna o valor de um índice do vetor mo objeto $scope.param
             * @param campo
             */
            $scope.getValorParam = function(campo) {

                return $scope.param[campo];
            };


            /**
             * Remove um determinado parâmetro.
             */
            $scope.cancelarParametro = function() {

                GeralFactory.confirmar('Deseja remover o parâmetro escolhido?', function() {

                    var assunto = ParamsService.getDescAssunto($scope.parametro.assunto_pesquisar, $scope.param.combinadoPar);
                    var objeto  = {
                        combinadoPar : $scope.param.combinadoPar
                    };

                    ParamsService[assunto].cancelar(objeto, function(retorno) {

                        $scope.listarParametros();
                        $scope.novoParametro();
                    });
                });
            };


            /**
             * Método responsável em limpar o campo de pesquisa dos assuntos (ui-select) contido
             * no formulário de pesquisa dos parâmetros.
             */
            $scope.limparAssunto = function($event) {

                $event.stopPropagation();
                $scope.campos = [];
                $scope.parametros = [];
                $scope.param.combinadoPar = null;
                $scope.combinadoParSelected = null;
                $scope.parametro.assunto_pesquisar = undefined;
            };


            /**
             * Atualiza ou insere os dados do parâmetro
             */
            $scope.salvarParametro = function () {

                if ($scope.param.par_lock) {

                    GeralFactory.notify('warning', 'Atenção!', 'Não é possível atualizar ou inserir registros desse parâmetro!');
                    return false;
                }

                $scope.salvarParametroLoading = true;

                $scope.param.par_pgm     = $scope.campos[0].rot_par_pgm;
                $scope.param.par_assunto = $scope.parametro.assunto_pesquisar;

                var assunto = ParamsService.getDescAssunto($scope.parametro.assunto_pesquisar, $scope.param.combinadoPar);
                if ($scope.param.combinadoPar) {

                    ParamsService[assunto].update($scope.param, function(resposta) {
                        if (! resposta.records.error) {

                            $scope.getParametro($scope.param.combinadoPar);
                            $scope.salvarParametroLoading = false;

                            angular.forEach($scope.parametros, function(item, chave) {

                                if (item['codCombinadoParam'] === $scope.param['combinadoPar']) {

                                    $scope.parametros[chave]['par_c01'] = $scope.param['par_c01'];
                                }
                            });
                        }
                    });

                } else {

                    ParamsService[assunto].create($scope.param, function(resposta) {

                        var m = resposta.records;
                        var strCod = m.par_cod_emp + '|' + m.par_assunto + '|' + m.par_pai + '|' + m.par_filho + '|' + m.par_neto;

                        $scope.getParametro(strCod);
                        $scope.salvarParametroLoading = false;

                        $timeout(function() {

                            var param = resposta.records.params;

                            param['codigoComb']        = param.par_pai + '.' + param.par_filho + '.' + param.par_neto;
                            param['codCombinadoParam'] = param.par_cod_emp + '|' + param.par_assunto + '|' + param.par_pai + '|' + param.par_filho + '|' + param.par_neto;

                            $scope.parametros.push(param);

                        });
                    });
                }
            };
        }
    ]);