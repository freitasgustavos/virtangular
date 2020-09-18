'use strict';

angular.module('newApp').controller('RelatorioCtrl', [

    '$scope', '$rootScope', '$controller', '$timeout', '$routeParams', 'GeralFactory', 'RelatorioService', 'ParamsService', 'Wizard',

    function($scope, $rootScope, $controller, $timeout, $routeParams, GeralFactory, RelatorioService, ParamsService, Wizard) {

        $scope.arrTotais     = [];
        $scope.arrRegistros  = [];
        $scope.arrRelatorios = [];
        $scope.arrOrdenacao  = [];
        $scope.objRelatorio  = {};

        $scope.objFiltro = {
            tipo : 'json'
        };

        $scope.objComponentes = {
            search : true
        };

        $rootScope.hasAutorizacao();
        $scope.$on('$viewContentLoaded', function() {

            // Variável que controla as abas para tela:
            $scope.pai = $routeParams.pai ? parseInt($routeParams.pai) : 1;

            $scope.forms = {};
            $scope.initialize();

            $timeout(function () {
                Wizard.loadWizards.initialize(24);
            }, 2000);
        });

        /**
         * Método responsável em iniciar os componentes da tela e carregar os
         * módulos existentes para um determinado tipo de relatório.
         */
        $scope.initialize = function() {

            var parAssunto = 7050, parOrder = 'par_filho';
            var strParams  = GeralFactory.formatarPesquisar({
                'par_pai'     : $scope.pai,
                'par_order'   : parOrder,
                'par_assunto' : parAssunto
            });

            ParamsService.params.get({u : strParams}, function(retorno) {
                if (retorno.records) {
                    $timeout(function() {

                        var arrRelatorios = retorno.records.arr_7050;
                        if ($scope.pai === 2) {

                            arrRelatorios = [];
                            angular.forEach(retorno.records.arr_7050, function(item) {
                                if (item.par_c05 != 'INV') {

                                    arrRelatorios.push(item);
                                    console.log('Empilhar relatório: ', item);
                                }
                            });
                        }

                        $scope.arrRelatorios = arrRelatorios;
                        $scope.setRelatorio($scope.arrRelatorios[1]);
                    });
                }
            });

            /**
             * console.log('Atual: ', $rootScope.objCurrentWizard);
             * $rootScope.objCurrentWizard.steps.splice(0, 1);
             */

            /**
             * $rootScope.indexWizard
             * $rootScope.setWizard($rootScope.objCurrentWizard);
             */
        };

        /**
         * Método responsável em abrir a aba contendo os dados para geração
         * do formulário escolhido pelo usuário na tela.
         */
        $scope.setRelatorio = function(objeto) {

            if (! GeralFactory.isObjEmpty(objeto)) {
                $timeout(function() {

                    $scope.objRelatorio = objeto;
                    $scope.objRelatorio['template'] = 'relatorio/views/' + objeto['par_c03'];
                    $scope.getComponentes();

                    /**
                     * Não efetuar mais a pesquisa ao abrir a tela de relatórios.
                     * $scope.pesquisar();
                     */
                }, 1000);
            }
        };

        /**
         * Método responsável em efetuar a pesquisa para gerar a prévia de um
         * determinado relatório escolhido pelo usuário da aplicação.
         */
        $scope.pesquisar = function() {

            $rootScope.spinnerList.on();
            $scope.$watch('forms.formRelatorio', function(formulario) {
                if (formulario.$invalid) {

                    $scope.submitted = true;
                    $rootScope.spinnerList.off();

                } else {

                    var arrService = $scope.objRelatorio['par_c04'].split('.');
                    var objService = {
                        'name'     : arrService[0].trim(),
                        'resource' : arrService[1].trim()
                    };

                    $scope.objFiltro.tipo = 'json';
                    RelatorioService[objService.name][objService.resource]({u : $scope.getFiltro()}, function(retorno) {
                        if (retorno.records) {

                            var arrRecords = retorno.records;
                            $timeout(function() {

                                $scope.arrTotais    = _.isEmpty(arrRecords.arr_total) ? null : arrRecords.arr_total;
                                $scope.arrRegistros = _.isEmpty(arrRecords.arr_data)  ? null : arrRecords.arr_data;

                                $rootScope.spinnerList.off();
                                GeralFactory.scrollToElement('#box-grid-relatorio', 360);

                            }, 2000);
                        }
                    });
                }
            });
        };

        /**
         * Método responsável em retornar um objeto completo contendo as opções
         * de filtro utilizadas pelo usuário para geração do relatório.
         */
        $scope.getFiltro = function() {

            $scope.objFiltro.par_pai   = $scope.pai;
            $scope.objFiltro.par_filho = $scope.objRelatorio['par_filho'];

            var strFiltro = GeralFactory.formatarPesquisar($scope.objFiltro);

            return strFiltro;
        };

        /**
         *
         */
        $scope.limparPesquisa = function() {

            delete $scope.objFiltro;
            $scope.objFiltro = {
                tipo : 'json'
            };
        };

        /**
         * Método responsável em gerar o relatório de um determinado módulo de
         * acordo com o tipo escolhido pelo usuário: Excel ou PDF.
         */
        $scope.gerarRelatorio = function(tipo) {

            if (! _.isEmpty($scope.arrRegistros)) {

                if (tipo !== '') {

                    $scope.objFiltro.tipo = tipo;
                    RelatorioService.relatorio($scope.objFiltro, $scope.objRelatorio);
                }
            } else {

                var mensagem = 'Caro usuário, efetue alguma pesquisa para gerar o relatório em questão!';
                GeralFactory.notify('warning', 'Atenção:', mensagem);
            }
        };

        /**
         * Método responsável em aplicar regras ao formulário de pesquisa de acordo com o
         * tipo de relatório escolhido pelo usuário da aplicação:
         */
        $scope.getComponentes = function() {

            $scope.limparPesquisa();
            $scope.arrRegistros = null;

            if ($scope.objRelatorio) {

                // Verificando qual o relatório pai para chamar a controller com as funções dos relatórios filhos:
                var tipo = $scope.arrRelatorios[0].par_c05;
                switch (tipo) {

                    case 'ADM':
                        $controller('RelatorioAdministrativoCtrl', {$scope : $scope});
                        break;

                    case 'CAD':
                        $controller('RelatorioCadastrosCtrl', {$scope : $scope});
                        break;

                    case 'INV':
                    case 'PRO':
                    case 'RPR':
                        $controller('RelatorioProdutosCtrl', {$scope : $scope});
                        break;
                }
            }
        };
    }
]);


// Controller contendo as funções específicas para os relatórios do ADMINISTRATIVO:
angular.module('newApp').controller('RelatorioAdministrativoCtrl', ['$scope', 'GeralFactory', 'StaticFactories', 'ParamsService',

    function($scope, GeralFactory, StaticFactories, ParamsService) {

        $scope.initAdministrativo = function() {

            var tipoFilho = $scope.objRelatorio['par_c05'];
            switch (tipoFilho) {

                case 'LUC':
                    $scope.listarObjetos();
                    $scope.arrAcoes    = GeralFactory.listarAcoes();
                    $scope.arrEspecies = StaticFactories.ESPECIES_DOCUMENTO;

                    $scope.arrOrdenacao.order001 = [{
                        'id'   : 'fin_dat_lan|DESC',
                        'name' : 'Dt. de cadastro decrescente'
                    }, {
                        'id'   : 'fin_dat_lan|ASC',
                        'name' : 'Dt. de cadastro ascendente'
                    }, {
                        'id'   : 'fin_doc_nro|DESC',
                        'name' : 'Núm. de documento decrescente'
                    }, {
                        'id'   : 'fin_doc_nro|ASC',
                        'name' : 'Núm. de documento ascendente'
                    }, {
                        'id'   : 'ite_pro_cod_pro|DESC',
                        'name' : 'Cód. do produto decrescente'
                    }, {
                        'id'   : 'ite_pro_cod_pro|ASC',
                        'name' : 'Cód. do produto ascendente'
                    }];
                    break;
            }
        };

        /**
         * Método responsável em listar os objetos ou parâmetros que serão utilizados nos
         * componentes do relatório de lucratividade.
         */
        $scope.listarObjetos = function() {

            var strAssunto = 'q=(assunto:6025|6060|6010)';
            ParamsService.params.get({u : strAssunto}, function(retorno) {
                if (retorno.records) {

                    var objRetorno = retorno.records;
                    $scope.arrFases      = (objRetorno.arr_6025) ? objRetorno.arr_6025 : [];
                    $scope.arrVendedores = (objRetorno.arr_6010) ? objRetorno.arr_6010 : [];
                    $scope.arrFormasPgto = (objRetorno.arr_6060) ? objRetorno.arr_6060 : [];
                }
            });
        };

        $scope.initAdministrativo();
    }
]);


// Controller contendo as funções específicas para os relatórios de CADASTROS:
angular.module('newApp').controller('RelatorioCadastrosCtrl', ['$scope', 'StaticFactories', 'EndGeralService',

    function($scope, StaticFactories, EndGeralService) {

        $scope.initCadastros = function() {

            var tipoFilho = $scope.objRelatorio['par_c05'];
            switch (tipoFilho) {

                case 'CFT':
                    $scope.arrEstados        = EndGeralService.ufs.get({});
                    $scope.arrContribIcms    = StaticFactories.CONTRIB_ICMS;
                    $scope.arrTiposCadastro  = StaticFactories.TIPOS_CADASTRO;
                    $scope.arrStatusCadastro = StaticFactories.STATUS_CADASTRO;
                    break;
            }
        };

        /**
         * Método responsável em retornar as cidades de um determinado estado escolhido
         * pelo usuário através do formulário de pesquisa.
         */
        $scope.getCidadesPorUf = function () {

            EndGeralService.getCidadePorUf($scope.objFiltro.sub_001, function(retorno) {
                $scope.arrCidades = retorno.records;
            });
        };

        $scope.initCadastros();
    }
]);


// Controller contendo as funções específicas para os relatórios de ESTOQUE:
angular.module('newApp').controller('RelatorioProdutosCtrl', ['$scope', '$timeout', '$filter', 'StaticFactories', 'GeralFactory',

    function($scope, $timeout, $filter, StaticFactories, GeralFactory) {

        $scope.initEstoque = function() {

            var tipoFilho = $scope.objRelatorio['par_c05'];
            switch (tipoFilho) {

                case 'MOV':
                    $scope.objFiltro['list_001'] = [1, 2, 3, 4, 5, 6, 15, 16];
                    $scope.arrNaturezasMovimentacao = StaticFactories.NATUREZAS_MOVIMENTACAO;
                    break;

                case 'PRO':
                    $scope.objFiltro['code_008'] = 0;
                    $scope.objFiltro['list_001'] = [0, 1];
                    
                    $scope.arrTiposProducao = [{
                        id   : 'I',
                        nome : 'Insumo'
                    }, {
                        id   : 'T',
                        nome : 'Terceiros'
                    }, {
                        id   : 'P',
                        nome : 'Própria'
                    }];

                    $scope.arrOrdenacao.order001 = [{
                        'id'   : 'pro_dat_cadastro|ASC',
                        'name' : 'Dt. de cadastro ascendente'
                    }, {
                        'id'   : 'pro_dat_cadastro|DESC',
                        'name' : 'Dt. de cadastro decrescente'
                    }, {
                        'id'   : 'pro_descricao_longa|ASC',
                        'name' : 'Descrição ascendente'
                    }, {
                        'id'   : 'pro_descricao_longa|DESC',
                        'name' : 'Descrição decrescente'
                    }];
                    break;
            }
        };

        /**
         * Método responsável em calcular o saldo final de cada produto para o relatório
         * de movimentação de estoque.
         */
        $scope.getSaldoFinal = function(codProduto) {

            var saldo = 0;
            if (! _.isEmpty($scope.arrRegistros)) {

                /**
                 * Removendo o saldo inicial do cálculo na movimentação de estoque:
                 * saldo = parseFloat(arrMovimentacoes[0].sal_qtd_inicial);
                 */

                var arrMovimentacoes = $scope.arrRegistros[codProduto];
                angular.forEach(arrMovimentacoes, function(item) {

                    if (item.ite_pro_qtd) {

                        var qtde = parseFloat(item.ite_pro_qtd);
                        if (item.ite_6020_natureza == 1 || item.ite_6020_natureza == 4 || item.ite_6020_natureza == 5 || item.ite_6020_natureza == 15) {
                            qtde = qtde * (-1);
                        }

                        saldo = saldo + qtde;
                    }
                });
            }

            saldo = GeralFactory.isInt(saldo) ? saldo : saldo.toFixed(4);

            return saldo;
        };

        /**
         * Método responsável em retornar a totalização dos saldos referente aos produtos
         * exibidos no relatório de movimentação de estoque.
         */
        $scope.totalizarSaldo = function() {

            var total = 0;
            var elementos = angular.element('.row-hidden');

            angular.forEach(elementos, function(item) {

                var saldo = parseFloat(angular.element(item).text());
                total = total + saldo;
            });

            return GeralFactory.isInt(total) ? total : $filter('customCurrencyQtde')(total.toFixed(4));
        };

        /**
         * Método responsável em retornar a totalização referente ao relatório do livro
         * de registros do invetários contido na guia de produtos.
         */
        $scope.totalizarInventario = function() {

            var total = 0;
            var elementos = angular.element('.row-hidden');

            angular.forEach(elementos, function(item) {

                var valor = parseFloat(angular.element(item).text());
                total = total + valor;
            });

            return $filter('customCurrency')(total);
        };

        /**
         * Método responsável em limpar o campo tipo de produção (ui-select) do formulário
         * de pesquisa para geração dos relatórios.
         */
        $scope.limparTipoNatureza = function($event) {

            $event.stopPropagation();
            $scope.objFiltro.code_003 = undefined;
        };

        $scope.initEstoque();
    }
]);
