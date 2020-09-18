'use strict';

angular.module('newApp')

    .controller('FinanceiroCtrl', [

        '$scope', '$rootScope', '$uibModal', '$window', '$routeParams', '$location', '$timeout', 'GeralFactory', 'Storage', 'FinanceiroService', 'ParamsService', 'ClienteService', 'MidiaService', 'AuthTokenFactory', 'prompt', 'Constantes', 'Wizard',

        function ($scope, $rootScope, $uibModal, $window, $routeParams, $location, $timeout, GeralFactory, Storage, FinanceiroService, ParamsService, ClienteService, MidiaService, AuthTokenFactory, prompt, Constantes, Wizard) {
            
            $rootScope.hasAutorizacao();

            if (! $rootScope.getPermissao('13')) {
                $location.path('/');
            }

            var sistema = null;
            if ($routeParams.sistema) {
                sistema = $routeParams.sistema.trim();
            } else {
                $location.path('/');
            }

            $scope.forms = {};
            $scope.dateOptions = {
                'year-format' : "'yy'",
                'show-weeks'  : false
            };

            $scope.$on('$viewContentLoaded', function() {

                $scope.$index        = null;
                $scope.flagMsg       = false;
                $scope.arrContas     = [];
                $scope.objTela       = {};
                $scope.objConta      = {};
                $scope.objCTFavorita = {};
                $scope.objContaClone = {};
                $scope.objDropdown   = {};

                $scope.objPesquisa   = {
                    arrContasSelecionadas : new Array(),
                    tipoNatureza :  0,
                    dtInicio     : '',
                    dtFinal      : ''
                };

                $scope.objRecorrencia   = {};
                $scope.arrSelecionados  = [];
                $scope.chkSelecionados  = false;
                $scope.objPeriodicidade = [{
                    'id'        : 15,
                    'sigla'     : 'Q',
                    'descricao' : 'Quinzenal'
                }, {
                    'id'        : 30,
                    'sigla'     : 'M',
                    'descricao' : 'Mensal'
                }, {
                    'id'        : 90,
                    'sigla'     : 'T',
                    'descricao' : 'Trimestral'
                }, {
                    'id'        : 180,
                    'sigla'     : 'S',
                    'descricao' : 'Semestral'
                }, {
                    'id'        : 365,
                    'sigla'     : 'A',
                    'descricao' : 'Anual'
                }, {
                    'id'        : 0,
                    'sigla'     : 'N',
                    'descricao' : 'Nenhuma'
                }];

                $scope.initConta();
                $scope.setSistema(sistema);
                $scope.listarObjetosTela();

                $timeout(function () {
                    Wizard.loadWizards.initialize(13);
                }, 2000);
            });

            /**
             * Método responsável em recolher os dados de um determinado título.
             */
            $scope.getConta = function(tit_fin_nro_lan, tit_fatura_seq) {

                if (tit_fin_nro_lan && tit_fatura_seq) {

                    var operacao = $scope.objConta.operacao;
                    var objeto   = {
                        operacao        : operacao,
                        tit_fin_nro_lan : tit_fin_nro_lan,
                        tit_fatura_seq  : tit_fatura_seq
                    };
                    FinanceiroService.financa.get(objeto, function(retorno) {
                        var objeto = retorno.records;
                        if (objeto) {

                            $scope.objConta = objeto;
                            $scope.objConta.operacao = operacao;
                            $scope.objConta.acaoTela = 'atualizar';

                            $scope.setObjetoConta(objeto);
                            $scope.calcularDesconto();
                            $scope.calcularAcrescimo();

                            // Dados referentes ao tipo de conta do registro selecionado:
                            $scope.objTela.flagGrid = true;
                            $scope.objPesquisa.sistema = objeto.tit_sistema;

                            // Variáveis para tratativa dos boletos bancários:
                            $scope.objTela.hasSegundaVia   = false;
                            $scope.objTela.canUpdateBoleto = false;

                            GeralFactory.scrollToTop();
                        }
                    });
                }
            };

            /**
             * Método responsável em quitar um título que ainda não esteja pago ou recebido.
             */
            $scope.quitarConta = function(conta) {

                if (conta) {

                    var verbo = (conta.tit_sistema === 1) ? 'receber' : 'quitar';
                    GeralFactory.confirmar('Deseja ' + verbo + ' esta conta?', function() {

                        var dtCorrente = GeralFactory.getDataAtualBrBanco(GeralFactory.getDataAtualBr());

                        // Formatando as datas para efetuar a atualização do registro:
                        conta.tit_dat_pgt     = dtCorrente;
                        conta.tit_dat_int     = dtCorrente;
                        conta.tit_dat_lan     = GeralFactory.formatarDataBr(conta.tit_dat_lan);
                        conta.tit_dat_vct     = GeralFactory.formatarDataBr(conta.tit_dat_vct);
                        conta.tit_cad_cod_cad = conta.tit_venda.fin_cad_cod_cad;

                        // Situação e operação:
                        conta.tit_faturado = 3;
                        conta.operacao     = $scope.objConta.operacao;

                        FinanceiroService.financa.update(conta, function(retorno) {
                            if (retorno.records.error) {

                                // Caso ocasione erro basta resetar os valores para a data e situação:
                                conta.tit_faturado = 0;
                                conta.tit_dat_pgt  = null;
                            }
                        });
                    });
                }
            };

            /**
             * Método responsável em recolher os dados de um extrato.
             */
            $scope.getExtrato = function(objExtrato) {

                if (objExtrato.tit_fin_nro_lan && objExtrato.tit_fatura_seq && objExtrato.tit_sistema) {

                    var operacao = (objExtrato.tit_sistema === 1) ? 'receber' : 'pagar';
                    var objeto   = {
                        operacao        : operacao,
                        tit_fin_nro_lan : objExtrato.tit_fin_nro_lan,
                        tit_fatura_seq  : objExtrato.tit_fatura_seq
                    };

                    FinanceiroService.financa.get(objeto, function(retorno) {
                        var objeto = retorno.records;
                        if (objeto) {

                            $scope.objConta = objeto;
                            $scope.setObjetoConta(objeto);
                            $scope.objConta.operacao = operacao;
                            $scope.objConta.acaoTela = 'atualizar';

                            // Variáveis para tratativa dos boletos bancários:
                            $scope.objTela.flagGrid        = true;
                            $scope.objTela.hasSegundaVia   = false;
                            $scope.objTela.canUpdateBoleto = false;

                            // Algumas informações para a tela no formulário a partir da operação de extrato:
                            GeralFactory.scrollToTop();
                            if (objExtrato.tit_sistema === 1) {

                                $scope.objTela.descDataSistema       = 'Data de Recebimento';
                                $scope.objTela.descSitSistema        = 'Recebido';
                                $scope.objDropdown.objCentroCusto    = {'par_i03' : 1};
                                $scope.objDropdown.objEntidadePessoa = {'cad_tip_cli_for' : 1};

                            } else {

                                $scope.objTela.descDataSistema       = 'Data de Pagamento';
                                $scope.objTela.descSitSistema        = 'Pago';
                                $scope.objDropdown.objCentroCusto    = {'par_i03' : 2};
                                $scope.objDropdown.objEntidadePessoa = {'cad_tip_cli_for' : 2};
                            }
                        }
                    });
                }
            };

            /**
             * Método responsável em inicializar algumas informações relativas
             * ao título escolhido pelo usuário.
             */
            $scope.setObjetoConta = function(objConta) {
                if (objConta) {

                    if (objConta.tit_centro_custo) {
                        $scope.objConta.centroCusto = objConta.tit_centro_custo.par_c01;
                    }

                    if (objConta.tit_conta_finan) {
                        $scope.objConta.contaFinanceira = objConta.tit_conta_finan.par_c01;
                    }

                    if (objConta.tit_forma_pgto) {
                        $scope.objConta.formaPagamento = objConta.tit_forma_pgto.par_c01;
                    }

                    // Recolhendo os dados do titular:
                    $scope.objConta.pessoa          = objConta.tit_venda.fin_cad_nome_razao;
                    $scope.objConta.tit_cad_cod_cad = objConta.tit_venda.fin_cad_cod_cad;

                    // Recolhendo os dados adicionais:
                    $scope.objConta.tit_fin_placa = objConta.tit_venda.fin_placa;
                    $scope.objConta.tit_fin_carga = objConta.tit_venda.fin_carga;

                    // Recolhendo os campos do tipo data do título:
                    $scope.objConta.tit_dat_lan = GeralFactory.formatarDataBr(objConta.tit_dat_lan);
                    $scope.objConta.tit_dat_vct = GeralFactory.formatarDataBr(objConta.tit_dat_vct);
                    $scope.objConta.tit_dat_pgt = GeralFactory.formatarDataBr(objConta.tit_dat_pgt);

                    // Verificando os valores monetários do título:
                    $scope.objConta.tit_doc_vlr_bruto     = (objConta.tit_doc_vlr_bruto)     ? objConta.tit_doc_vlr_bruto     : 0;
                    $scope.objConta.tit_doc_vlr_descontos = (objConta.tit_doc_vlr_descontos) ? objConta.tit_doc_vlr_descontos : 0;
                    $scope.objConta.tit_doc_vlr_despesas  = (objConta.tit_doc_vlr_despesas)  ? objConta.tit_doc_vlr_despesas  : 0;
                    $scope.objConta.tit_doc_vlr_liquido   = (objConta.tit_doc_vlr_liquido)   ? objConta.tit_doc_vlr_liquido   : 0;

                    // Verificando a situação de um determinado título:
                    $scope.objConta.tit_situacao_flag = (objConta.tit_faturado === 3) ? true : false;

                    // Verificando a existência de recorrência de títulos:
                    $scope.objConta.tit_recorrente_flag = (objConta.tit_recorrente.length) ? true : false;

                    // Verificando se a forma de pagamento do título é referente a boleto bancário:
                    $scope.objConta.tit_is_boleto = GeralFactory.isPgtoBoleto(objConta);

                    $scope.distribuirRecorrencias();
                    objConta.tit_venda.fin_tit_not === 1 && $scope.setNfeMidias();

                    /**
                     * Objeto contendo os dados iniciais do título, caso necessite desfazer algo com
                     * relação aos dados do título basta atribuir este objeto ao $scope.objConta!
                     */
                    $scope.objContaClone = objConta;

                    /**
                     * console.log($scope.objConta);
                     * console.log($scope.objConta.tit_recorrente);
                     * console.log($scope.objContaClone);
                     */
                }
            };

            /**
             * Método responsável em adicionar as mídias relativas a NFE ao vetor contendo
             * todas as mídias de uma determinada conta selecionada pelo usuário.
             */
            $scope.setNfeMidias = function() {

                if ($scope.objConta.tit_venda.fin_cod_acao === 9 && $scope.objConta.tit_venda.fin_cod_acao === 90) {

                    $timeout(function() {
                        var arrNfeMidias = [{
                            'mid_nfe'           :  true,
                            'mid_nro'           :  false,
                            'mid_dat_cadastro'  :  $scope.objConta.tit_venda.fin_dat_cadastro,
                            'mid_descricao'     : 'NFE Danfe',
                            'mid_nfe_tipo'      : 'PDF'
                        }, {
                            'mid_nfe'           :  true,
                            'mid_nro'           :  false,
                            'mid_dat_cadastro'  :  $scope.objConta.tit_venda.fin_dat_cadastro,
                            'mid_descricao'     : 'NFE XML',
                            'mid_nfe_tipo'      : 'XML'
                        }];

                        var arrTemporario = $scope.objConta.tit_midia.concat(arrNfeMidias);
                        $scope.objConta.tit_midia = arrTemporario;
                    }, 200);
                }
            };

            /**
             * Método responsável em construir o objeto contendo todos os filtros utilizados
             * pelo usuário no formulário de pesquisa do financeiro.
             */
            $scope.getFiltro = function() {

                var strContas = '';
                if ($scope.objPesquisa.arrContasSelecionadas.length)
                    strContas = $scope.objPesquisa.arrContasSelecionadas.join('|');

                var objFiltro = {
                    'tit_5010_conta_fin'       : strContas,
                    'tit_sistema'              : $scope.objPesquisa.sistema,
                    'tit_faturado'             : $scope.objPesquisa.situacao,
                    'tit_dat_init'             : $scope.objPesquisa.dtInicio,
                    'tit_dat_end'              : $scope.objPesquisa.dtFinal,
                    'tit_dat_op'               : $scope.objPesquisa.opDataPesquisa,
                    'tit_6050_cdc'             : $scope.objPesquisa.centroCusto,
                    'tit_6020_natureza'        : $scope.objPesquisa.tipoNatureza,
                    'tit_6060_forma_pagamento' : $scope.objPesquisa.formaPagamento
                };
                
                if ($scope.objPesquisa.criterio)
                    objFiltro.tit_pesquisa = $scope.objPesquisa.criterio;

                if ($scope.objPesquisa.finPlaca)
                    objFiltro.tit_fin_placa = $scope.objPesquisa.finPlaca;

                if ($scope.objPesquisa.finCarga)
                    objFiltro.tit_fin_carga = $scope.objPesquisa.finCarga;

                return objFiltro;
            };

            /**
             * Método responsável em efetuar a listagem completa dos títulos. Também efetua
             * pesquisa dos títulos conforme o filtro utilizado pelo usuário.
             */
            $scope.listarConta = function() {

                $scope.spinner.on();
                $scope.arrContas = [];

                var objFiltro = $scope.getFiltro();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT_FINAN + '&offset=0');

                FinanceiroService.financas.get({u:strFiltro, operacao:$scope.objConta.operacao}, function(retorno) {
                    if (retorno.records) {

                        var arrContas = retorno.records;
                        if (arrContas.length > 0) {

                            $timeout(function() {
                                $scope.arrContas = arrContas;
                                $scope.flagMsg   = true;
                                $scope.totalizar();
                            });

                        } else {

                            $scope.arrContas = [];
                            $scope.flagMsg = true;
                        }
                    }

                    // Desativando o spinner da pesquisa!
                    $timeout(function() { $scope.spinner.off() }, 2000);
                });
            };

            /**
             * Método responsável em efetuar a paginação por demanda dos títulos para deixar o módulo
             * financeiro mais rápido no ato do carregamento. Não é válido para extrato!
             */
            $scope.paginarConta = function() {

                $scope.spinner.on();
                
                var objFiltro = {
                    'objeto' : $scope.getFiltro(),
                    'offset' : $scope.arrContas.length ? $scope.arrContas.length : 0
                };

                var strFiltro = GeralFactory.formatarPesquisar(objFiltro.objeto, 'limit=' + Constantes.LIMIT_FINAN + '&offset=' + objFiltro.offset);

                FinanceiroService.financas.get({u:strFiltro, operacao:$scope.objConta.operacao}, function(retorno) {
                    if (retorno.records) {

                        var arrContas = retorno.records;
                        if (arrContas.length > 0) {

                            angular.forEach(arrContas, function(item) {
                                $scope.arrContas.push(item);
                            });
                        } else {

                            var mensagem = 'Caro usuário, a listagem dos títulos já se encontra completa!';
                            GeralFactory.notify('warning', 'Atenção:', mensagem);
                        }
                    }

                    // Desativando o spinner da pesquisa!
                    $timeout(function() { $scope.spinner.off() }, 2000);
                });
            };

            /**
             * Método responsável em efetuar a ordenação da listagem dos títulos de acordo com a coluna
             * escolhida pelo usuário da aplicação. Não se aplica a listagem do extrato.
             */
            $scope.ordenarPor = function(propriedade) {

                var reverso = ($scope.objOrdenacao.coluna === propriedade) ? !$scope.objOrdenacao.reverso : false;

                $timeout(function() {
                    $scope.objOrdenacao.coluna  = propriedade;
                    $scope.objOrdenacao.reverso = reverso;
                });
            };

            /**
             * Método responsável em inicializar a configuração da ordenação contida na listagem dos
             * títulos financeiros na tela. Não se aplica a listagem do extrato.
             */
            $scope.initOrdenacao = function() {

                $scope.objOrdenacao = {
                    coluna  : '',
                    reverso : true
                };
            };

            /**
             * Método responsável em efetuar a listagem completa do extrato financeiro.
             */
            $scope.listarExtrato = function() {

                $scope.spinner.on();
                $scope.arrContas = [];

                var strContas = '';
                if ($scope.objPesquisa.arrContasSelecionadas.length) {

                    strContas = $scope.objPesquisa.arrContasSelecionadas.join('|');
                }

                if ($scope.objPesquisa.dtInicio) {

                    var strFiltro = GeralFactory.formatarPesquisar({
                        'tit_5010_conta_fin'       : strContas,
                        'tit_faturado'             : $scope.objPesquisa.situacao,
                        'tit_dat_init'             : $scope.objPesquisa.dtInicio,
                        'tit_dat_end'              : $scope.objPesquisa.dtFinal,
                        'tit_dat_op'               : $scope.objPesquisa.opDataPesquisa,
                        'tit_6050_cdc'             : $scope.objPesquisa.centroCusto,
                        'tit_6020_natureza'        : $scope.objPesquisa.tipoNatureza,
                        'tit_6060_forma_pagamento' : $scope.objPesquisa.formaPagamento,
                        'tit_fin_placa'            : $scope.objPesquisa.finPlaca,
                        'tit_fin_carga'            : $scope.objPesquisa.finCarga
                    });

                    var objFiltro = {u : strFiltro, operacao : $scope.objConta.operacao};

                    FinanceiroService.extrato.get(objFiltro, function(retExtrado) {
                        if (retExtrado.records) {

                            var arrSaldo = retExtrado.records;
                            FinanceiroService.financas.get(objFiltro, function(retFinanca) {
                                if (! _.isEmpty(retFinanca.records)) {

                                    var arrContas = retFinanca.records;
                                    console.log('Extrato: ', arrContas);

                                    if (arrContas.length) {
                                        $scope.flagMsg = false;

                                        var saldo = arrSaldo.saldo, tipo = '';
                                        angular.forEach(arrContas, function(i, j) {

                                            var vlrLiquido = parseFloat(i.tit_doc_vlr_liquido);
                                            if (i.tit_sistema === 1) {

                                                tipo  = 'c-green';
                                                saldo = saldo + vlrLiquido;
                                                i.tit_saldo = {
                                                    tit_css_saldo   : tipo,
                                                    tit_vlr_debito  : null,
                                                    tit_vlr_credito : vlrLiquido,
                                                    tit_vlr_saldo   : saldo
                                                };
                                            } else {

                                                tipo  = 'c-red';
                                                saldo = saldo - vlrLiquido;
                                                i.tit_saldo = {
                                                    tit_css_saldo   : tipo,
                                                    tit_vlr_debito  : vlrLiquido,
                                                    tit_vlr_credito : null,
                                                    tit_vlr_saldo   : saldo
                                                };
                                            }
                                        });

                                        arrSaldo.novo_saldo = saldo;
                                        $scope.arrContas    = arrContas;
                                        $scope.extratoSaldo = arrSaldo;
                                    }
                                } else {
                                    $scope.flagMsg = true;
                                }
                            });
                        }

                        // Desativando o spinner da pesquisa!
                        $timeout(function() {
                            $scope.spinner.off();
                        }, 2000);
                    });
                }
            };

            /**
             * Método responsável em listar todas as contas financeiras existentes.
             */
            $scope.listarObjetosTela = function(sistema) {

                $scope.arrSituacoes = [{
                    id   :  0,
                    nome : 'Em aberto'
                }, {
                    id   :  3,
                    nome : 'Pago'
                }, {
                    id   :  999,
                    nome : 'Vencidos'
                }];

                $scope.arrTiposNatureza = [{
                    id   :  0,
                    nome : 'Todos'
                }, {
                    id   :  1,
                    nome : 'Operações'
                }, {
                    id   :  2,
                    nome : 'Títulos'
                }];

                $scope.listarParametros();
            };

            /**
             * Método responsável em listar os tipos de parâmetros utilizados na tela do financeiro:
             * Forma de Pagamento, Conta Financeira e Centro de Custo.
             */
            $scope.listarParametros = function(codAssunto) {

                var strAssunto = (codAssunto) ? 'q=(assunto:' + codAssunto + ')' : 'q=(assunto:5010|6050|6060|1010)';
                ParamsService.params.get({u : strAssunto}, function(retorno) {
                    if (retorno.records) {

                        var objRetorno = retorno.records;
                        $scope.arrFormasPgto = (objRetorno.arr_6060) ? objRetorno.arr_6060 : [];

                        if (objRetorno.arr_5010) {

                            $scope.arrContasFinanceiras = objRetorno.arr_5010;

                            var arrContas = [], count = 0;
                            angular.forEach($scope.arrContasFinanceiras, function(item) {

                                arrContas.push(item.par_pai);
                                if (item.par_i03 === 1)
                                    $scope.objCTFavorita = item;

                                count++;
                            });

                            $scope.qtdeContasFinanceiras = count;
                            var strFiltroSaldo = 'q=(tit_5010_conta_fin:' + arrContas.join('|') + ',tit_dat_op:' + $scope.objPesquisa.opDataPesquisa + ')';
                            FinanceiroService.saldo.get({u : strFiltroSaldo}, function(retorno) {
                                if (retorno.records) {

                                    $scope.arrSaldoContaFinanceira = retorno.records.saldo_conta_fin;
                                }
                            });
                        }

                        if (objRetorno.arr_6050) {

                            var arrCentroCusto = objRetorno.arr_6050, arrAuxiliar = [];
                            if ($scope.objDropdown.objCentroCusto.par_i03) {

                                angular.forEach(arrCentroCusto, function(item) {

                                    var i03 = item.par_i03;
                                    if (i03 == $scope.objDropdown.objCentroCusto.par_i03 || i03 == null || i03 == 0)
                                        arrAuxiliar.push(item);
                                });
                            }

                            // Verificando se o centro de custo tem alguma categoria vinculada (RECEITA ou DESPESA):
                            $scope.arrCentrosCustos = _.isEmpty(arrAuxiliar) ? arrCentroCusto : arrAuxiliar;
                        }

                        if (objRetorno.arr_1010) {

                            $scope.arrCamposAdicionais = {};
                            angular.forEach(objRetorno.arr_1010, function(item) {

                                if (item.par_i02 == 1) {

                                    $scope.arrCamposAdicionais.length = 1;
                                    if (item.par_filho == 11) {

                                        $scope.arrCamposAdicionais.tit_fin_carga = {
                                            required : (item.par_i01 == 1),
                                            label    :  item.par_c01
                                        };
                                    }

                                    if (item.par_filho == 10) {

                                        $scope.arrCamposAdicionais.tit_fin_placa = {
                                            required : (item.par_i01 == 1),
                                            label    :  item.par_c01
                                        };
                                    }
                                }
                            });
                        }
                    }
                });
            };

            /**
             * Método responsável em listar as contas financeiras existentes e contabilizar
             * além de totalizar o saldo de cada uma separadamente.
             */
            $scope.listarContasFinanceiras = function() {

                ParamsService.contaFinanceiras.get({u : ''}, function(retorno) {
                    if (retorno.records) {
                        $scope.arrContasFinanceiras = retorno.records;

                        var arrContas = [], count = 0;
                        angular.forEach($scope.arrContasFinanceiras,function(item) {

                            arrContas.push(item.par_pai);
                            if (item.par_i03 === 1)
                                $scope.objCTFavorita = item;

                            count++;
                        });

                        $scope.qtdeContasFinanceiras = count;
                        var strFiltroSaldo = 'q=(tit_5010_conta_fin:' + arrContas.join('|') + ',tit_dat_op:' + $scope.objPesquisa.opDataPesquisa + ')';
                        FinanceiroService.saldo.get({u : strFiltroSaldo}, function(retorno) {
                            if (retorno.records) {

                                $scope.arrSaldoContaFinanceira = retorno.records.saldo_conta_fin;
                            }
                        });
                    }
                });
            };

            /**
             * Método responsável em cancelar um determinado título ou vários títulos desde
             * que exista ligação de recorrência entre os mesmos.
             */
            $scope.cancelarConta = function() {

                if ($scope.objConta.tit_fin_nro_lan && $scope.objConta.tit_fatura_seq) {

                    var qtdeIntes = $scope.objConta.tit_venda_itens.length;
                    if (qtdeIntes !== 0) {

                        var mensagem = 'Caro usuário, títulos relativos a venda ou compra não podem ser removidos!';
                        GeralFactory.notify('warning', 'Atenção:', mensagem);

                    } else {

                        var qtdeParcelas = $scope.objConta.tit_recorrente.length;
                        var objeto = {
                            operacao        : $scope.objConta.operacao,
                            tit_fatura_seq  : $scope.objConta.tit_fatura_seq,
                            tit_fin_nro_lan : $scope.objConta.tit_fin_nro_lan
                        };

                        if (qtdeParcelas > 1) {

                            prompt({
                                title   : 'Cancelamento de Títulos:',
                                message : 'Cancelamento de Títulos:',
                                buttons :  [{
                                    cancel :  false,
                                    value  : '1',
                                    label  : 'Cancelar apenas este título?',
                                    class  : 'btn-danger btn-prompt'
                                }, {
                                    cancel :  false,
                                    value  : '2',
                                    label  : 'Cancelar este e os próximos títulos?',
                                    class  : 'btn-danger btn-prompt'
                                }]
                            }).then(function(resultado) {

                                switch (resultado.value)
                                {
                                    case '1':
                                        $scope.cancelarContaAvulsa(objeto);
                                        break;

                                    case '2':
                                        FinanceiroService.financas.cancelar(objeto, function(retorno) {
                                            if (! retorno.records.error) {

                                                $timeout(function() {
                                                    $scope.listarConta();
                                                    $scope.objTela.flagGrid = false;
                                                });
                                            }
                                        });
                                        break;
                                }
                            });
                        } else if (qtdeParcelas === 1) {

                            GeralFactory.confirmar('Deseja remover o título escolhido?', function() {

                                $scope.cancelarContaAvulsa(objeto);
                            });
                        }
                    }
                }
            };

            /**
             * Método responsável em cancelar um determinado título, verifica se
             * o mesmo está vinculado a alguma venda ou compra.
             */
            $scope.cancelarContaAvulsa = function(objeto) {

                if (! _.isEmpty(objeto)) {

                    FinanceiroService.financa.cancelar(objeto, function(retorno) {
                        if (! retorno.records.error) {

                            $scope.listarConta();
                            $scope.objTela.flagGrid = false;
                        }
                    });
                }
            };

            /**
             * Método responsável em inicializar o tipo de conta, ou seja, sistema
             * escolhido pelo usuário na aplicação.
             */
            $scope.setSistema = function(sistema) {

                $scope.objTela.flagGrid  = false;
                $scope.objTela.hasFilter = false;
                $scope.objPesquisa.centroCusto = undefined;

                switch (sistema) {

                    case 'receber':
                        $scope.objPesquisa.sistema           = 1;
                        $scope.objPesquisa.cad_tip_cli_for   = 1;
                        $scope.objDropdown.objCentroCusto    = {'par_i03' : 1};
                        $scope.objDropdown.objEntidadePessoa = {'cad_tip_cli_for' : 1};

                        /**
                         * Antes o critério era a data de vencimento e não a data inteligente:
                         * $scope.objPesquisa.opDataPesquisa   = 'DV';
                         * $scope.objPesquisa.descDataPesquisa = 'Data de Vencimento';
                         */

                        $scope.objPesquisa.opDataPesquisa    = 'DI';
                        $scope.objPesquisa.descDataPesquisa  = 'Data Inteligente';

                        $scope.objTela.isExtrato             =  false;
                        $scope.objTela.descSistema           = 'Receitas';
                        $scope.objTela.descDataSistema       = 'Data de Recebimento';
                        $scope.objTela.descSitSistema        = 'Recebido';
                        $scope.objTela.descAcaoSistema       = 'Receber Marcados';
                        $scope.objConta.operacao             = 'receber';

                        $scope.setFiltroDataPadrao();
                        $scope.listarConta();
                        break;


                    case 'pagar':
                        $scope.objPesquisa.sistema           = 2;
                        $scope.objPesquisa.cad_tip_cli_for   = 2;
                        $scope.objDropdown.objCentroCusto    = {'par_i03' : 2};
                        $scope.objDropdown.objEntidadePessoa = {'cad_tip_cli_for' : 2};

                        /**
                         * Antes o critério era a data de vencimento e não a data inteligente:
                         * $scope.objPesquisa.opDataPesquisa   = 'DV';
                         * $scope.objPesquisa.descDataPesquisa = 'Data de Vencimento';
                         */

                        $scope.objPesquisa.opDataPesquisa    = 'DI';
                        $scope.objPesquisa.descDataPesquisa  = 'Data Inteligente';

                        $scope.objTela.isExtrato             =  false;
                        $scope.objTela.descSistema           = 'Despesas';
                        $scope.objTela.descDataSistema       = 'Data de Pagamento';
                        $scope.objTela.descSitSistema        = 'Pago';
                        $scope.objTela.descAcaoSistema       = 'Pagar Marcados';
                        $scope.objConta.operacao             = 'pagar';

                        $scope.setFiltroDataPadrao();
                        $scope.listarConta();
                        break;


                    case 'extrato':
                        // Data para pesquisa é a data de emissão:
                        $scope.objPesquisa.opDataPesquisa   = 'DD';
                        $scope.objPesquisa.descDataPesquisa = 'Data de Pagamento';
                        $scope.objTela.descDataSistema      = 'Data de Pagamento';
                        $scope.objDropdown.objCentroCusto   = {'par_i03' : 0};

                        $scope.objPesquisa.sistema          =  3;
                        $scope.objTela.descSistema          = 'Extrato';
                        $scope.objConta.operacao            = 'extrato';
                        $scope.objTela.isExtrato            =  true;

                        $scope.setFiltroDataPadrao();
                        $scope.listarExtrato();
                        break;


                    default:
                        $location.path('/');
                        break;
                }

                $scope.initOrdenacao();
                $scope.clearSelecionados();
            };

            /**
             * Filtro padrão para a listagem de títulos do financeiro.
             */
            $scope.setFiltroDataPadrao = function() {

                var arrDataAtual = GeralFactory.getDataAtualBr().split('/');
                var ultimoDiaMes = GeralFactory.getUltimoDiaMes();

                var dataInicioPadrao = '01/' + arrDataAtual[1] + '/' + arrDataAtual[2];
                var dataFinalPadrao  = ultimoDiaMes + '/' + arrDataAtual[1] + '/' + arrDataAtual[2];

                if ($scope.objPesquisa.dtInicio == dataInicioPadrao || $scope.objPesquisa.dtInicio == '') {

                    $scope.objPesquisa.dtInicio = dataInicioPadrao;
                }

                if ($scope.objPesquisa.dtFinal == dataFinalPadrao || $scope.objPesquisa.dtFinal == '') {

                    $scope.objPesquisa.dtFinal = dataFinalPadrao;
                }

                $scope.objPesquisa.tipoDataPesquisa = ($scope.objPesquisa.tipoDataPesquisa == 'M' || $scope.objPesquisa.tipoDataPesquisa == undefined) ? 'M' : $scope.objPesquisa.tipoDataPesquisa;
            };

            /**
             * Método responsável em modificar o campo de data para pesquisa dos títulos
             * de acordo com a escolha do usuário.
             */
            $scope.setDataPesquisa = function(tipo) {

                $scope.objPesquisa.opDataPesquisa = tipo;

                var descData = '';
                switch (tipo) {
                    case 'DE' : descData = 'Data de Lançamento'; break;

                    case 'DV' : descData = 'Data de Vencimento'; break;

                    case 'DI' : descData = 'Data Inteligente';   break;

                    default   : descData = $scope.objTela.descDataSistema; break;
                }

                $scope.objPesquisa.descDataPesquisa = descData;

                // Agora o usuário tem que clicar no botão para efetuar a pesquisa.
                // $scope.listarTrigger();
            };

            /**
             * Método responsável em informar o tipo de data utilizado pelo usuário
             * no filtro da pesquisa dos títulos.
             */
            $scope.setTipoData = function() {

                var tipo = $scope.objPesquisa.tipoDataPesquisa;
                if (tipo !== null) {
                    var dtAtual = GeralFactory.getDataAtualBr();
                    switch (tipo) {
                        case 'D':
                            $scope.objPesquisa.dtFinal  = dtAtual;
                            $scope.objPesquisa.dtInicio = dtAtual;
                            break;

                        case 'S':
                            var objDatas = GeralFactory.getInicioFimSemana();
                            $scope.objPesquisa.dtFinal  = objDatas.dtFinal;
                            $scope.objPesquisa.dtInicio = objDatas.dtInicio;
                            break;

                        case 'M':
                            var ultimoDia = GeralFactory.getUltimoDiaMes();
                            dtAtual = dtAtual.split('/');
                            $scope.objPesquisa.dtFinal  = ultimoDia + '/' + dtAtual[1] + '/' + dtAtual[2];
                            $scope.objPesquisa.dtInicio = '01/' + dtAtual[1] + '/' + dtAtual[2];
                            break;

                        case 'I':
                            var diferenca = GeralFactory.getDiferencaDias(10);
                            $scope.objPesquisa.dtFinal  = dtAtual;
                            $scope.objPesquisa.dtInicio = diferenca;
                            break;

                        case 'T':
                            $scope.objPesquisa.dtFinal  = '';
                            $scope.objPesquisa.dtInicio = '';
                            break;
                    }
                }

                // Agora o usuário tem que clicar no botão para efetuar a pesquisa.
                // $scope.listarTrigger();
            };

            /**
             * Método responsável em disparar qual buscar deverá ser efetuada a partir das
             * mudanças no formulário de pesquisa dos títulos. Data, Conta e Tipo de Data.
             */
            $scope.listarTrigger = function() {

                /**
                 * console.log($scope.objPesquisa.dtFinal);
                 * console.log($scope.objPesquisa.dtInicio);
                 */

                var sistema = parseInt($scope.objPesquisa.sistema);
                switch (sistema) {
                    case 1:
                    case 2:
                        $scope.listarConta();
                        break;

                    case 3:
                        $scope.listarExtrato();
                        break;
                }
            };

            /**
             * Método responsável em ajustar as datas de ínicio e fim dos filtros
             * conforme a escolha do usuário.
             */
            $scope.ajustarData = function(tipo) {

                var criterio = $scope.objPesquisa.tipoDataPesquisa;
                if (criterio !== null) {

                    var objFuncao;
                    if (tipo === 'A') {

                        // Funções para regredir dias a partir de uma data:
                        objFuncao = {
                            'fDias' : 'delDiasData',
                            'fMes'  : 'getDatasMesAnterior'
                        };
                    } else {

                        // Funções para adicionar dias a partir de uma data:
                        objFuncao = {
                            'fDias' : 'addDiasData',
                            'fMes'  : 'getDatasProximoMes'
                        };
                    }

                    switch (criterio) {
                        case 'D':
                            $scope.objPesquisa.dtInicio = GeralFactory[objFuncao.fDias]($scope.objPesquisa.dtInicio, 1);
                            $scope.objPesquisa.dtFinal  = GeralFactory[objFuncao.fDias]($scope.objPesquisa.dtFinal, 1);
                            break;

                        case 'S':
                            $scope.objPesquisa.dtInicio = GeralFactory[objFuncao.fDias]($scope.objPesquisa.dtInicio, 7);
                            $scope.objPesquisa.dtFinal  = GeralFactory[objFuncao.fDias]($scope.objPesquisa.dtFinal, 7);
                            break;

                        case 'M':
                            var arrDatas = GeralFactory[objFuncao.fMes]($scope.objPesquisa.dtInicio);
                            $scope.objPesquisa.dtInicio = arrDatas['dtInicio'];
                            $scope.objPesquisa.dtFinal  = arrDatas['dtFinal'];
                            break;

                        case 'I':
                            $scope.objPesquisa.dtInicio = GeralFactory[objFuncao.fDias]($scope.objPesquisa.dtInicio, 10);
                            $scope.objPesquisa.dtFinal  = GeralFactory[objFuncao.fDias]($scope.objPesquisa.dtFinal, 10);
                            break;
                    }

                    $scope.listarTrigger();
                }
            };

            /**
             * Método responsável em efetuar a totalização do valor líquido dos títulos
             * existentes na tabela do financeiro.
             */
            $scope.totalizar = function() {

                var total = 0, quantidade = 0;
                if ($scope.arrContas.length) {

                    angular.forEach($scope.arrContas, function(i, j) {

                        var valor = parseFloat(i.tit_doc_vlr_liquido);
                        total = total + valor;
                        quantidade++;
                    });
                }

                $scope.quantidade  = quantidade;
                $scope.totalizacao = total;
            };

            /**
             * Método responsável em renderizar o formulário para inserção de
             * um novo título por parte do usuário.
             */
            $scope.novaConta = function() {

                if ($scope.objPesquisa.sistema !== undefined) {

                    $scope.objTela.flagGrid = true;

                    var operacao = $scope.objConta.operacao;

                    $scope.initConta();
                    $scope.objConta.acaoTela = 'inserir';
                    $scope.objConta.operacao = operacao;

                    /**
                     * if ($scope.objConta.operacao === 'pagar') {
                     *
                     *    var dtCorrente = GeralFactory.getDataAtualBr();
                     *    $scope.objConta.tit_dat_lan = dtCorrente;
                     *    $scope.objConta.tit_dat_vct = dtCorrente;
                     * }
                     */

                    var dtCorrente = GeralFactory.getDataAtualBr();
                    $scope.objConta.tit_dat_lan = dtCorrente;
                    $scope.objConta.tit_dat_vct = dtCorrente;

                    // Verifica se existe uma conta favorita configurada pelo usuário:
                    if (! _.isEmpty($scope.objCTFavorita)) {

                        $scope.objConta.contaFinanceira    = $scope.objCTFavorita.par_c01;
                        $scope.objConta.tit_5010_conta_fin = $scope.objCTFavorita.par_pai;
                    }
                } else {

                    var titulo   = 'Atenção:';
                    var mensagem = 'Por gentileza escolha algum tipo da conta para poder prosseguir!';
                    GeralFactory.notify('warning', titulo, mensagem);
                }
            };

            /**
             * Método responsável em inicializar o objeto principal de conta (título).
             */
            $scope.initConta = function() {

                $scope.objConta = {
                    tit_doc_vlr_liquido     : 0,
                    tit_doc_vlr_bruto       : 0,
                    tit_doc_vlr_descontos   : 0,
                    tit_doc_vlr_despesas    : 0,
                    tit_doc_porct_descontos : 0,
                    tit_doc_porct_despesas  : 0,
                    tit_recorrente          : []
                };
            };

            /**
             * Método responsável em fechar o formulário de cadastra/edição de um título e
             * posteriormente renderizar a listagem completa dos títulos.
             */
            $scope.voltarConta = function() {
                $scope.objTela.flagGrid = false;

                var operacao = $scope.objConta.operacao;

                $scope.initConta();
                $scope.clearSelecionados();
                $scope.objConta.operacao = operacao;

                $scope.forms.formFinanca.$setPristine();
            };

            /**
             * Método responsável em inserir ou atualizar os dados de um título.
             */
            $scope.salvarConta = function() {

                $scope.salvarContaLoading = true;
                $scope.$watch('forms.formFinanca', function(form) {
                    if (form) {
                        if (form.$invalid) {

                            $scope.submitted = true;
                            $scope.salvarContaLoading = false;

                        } else {

                            // Verificando qual a situação do título:
                            $scope.objConta.tit_faturado = ($scope.objConta.tit_situacao_flag) ? 3 : 0;
                            if ($scope.objConta.tit_fin_nro_lan) {

                                // TODO: Adicionar verificação da data de vencimento!
                                $scope.objTela.hasSegundaVia = $scope.getVerificaSegundaViaBoleto();
                                if ($scope.objTela.hasSegundaVia) {

                                    var message = 'Você alterou o valor deste título e o mesmo contém um boleto vinculado, portanto uma segunda via será gerada automaticamente!';
                                    prompt({
                                        title   : 'Segunda via de boleto:',
                                        message :  message,
                                        buttons :  [{
                                            cancel :  false,
                                            value  : '1',
                                            label  : 'Ok',
                                            class  : 'btn-primary'
                                        }]
                                    }).then(function(resultado) {

                                        if (resultado.value === '1') {
                                            $scope.atualizarConta();
                                        }
                                    });
                                } else {

                                    // TODO: remover este ELSE!
                                    $scope.objTela.canUpdateBoleto = $scope.getVerificaCanSaveBoleto();
                                    $scope.atualizarConta();
                                }
                            } else {

                                $scope.setVerificaRecorrencia();
                                FinanceiroService.financas.create($scope.objConta, function(retorno) {
                                    if (! retorno.records.error) {

                                        $scope.listarConta();
                                        $scope.listarContasFinanceiras();
                                        $scope.getConta(retorno.records.fin_nro_lan, retorno.records.tit_fatura_seq);

                                        /**
                                         * Não redirecionar mais para a listagem dos registros:
                                         * $scope.objTela.flagGrid = false;
                                         */
                                    }
                                    $scope.salvarContaLoading = false;
                                    $scope.forms.formFinanca.$setPristine();
                                });
                            }
                        }
                    }
                });
            };

            /**
             * Método responsável em atualizar os dados de um determinado título.
             */
            $scope.atualizarConta = function() {

                FinanceiroService.financa.update($scope.objConta, function(retorno) {
                    if (! retorno.records.error) {

                        if (! _.isEmpty($scope.objConta.tit_transacao)) {

                            $timeout(function() {
                                if ($scope.objTela.hasSegundaVia) {
                                    console.log('Criar a segunda via do boleto bancário!');
                                    $scope.gerarSegundaViaBoleto();
                                }

                                // TODO: remover este IF!
                                if ($scope.objTela.canUpdateBoleto) {
                                    console.log('Atualizar a dt. de vencimento do boleto!');
                                    $scope.salvarBoleto();
                                }
                            });
                        }

                        if ($scope.objTela.isExtrato) {

                            $scope.objConta.operacao = 'extrato';
                            $scope.listarExtrato();

                        } else {

                            $scope.listarConta();
                        }
                    }

                    $scope.objTela.flagGrid   = false;
                    $scope.salvarContaLoading = false;
                    $scope.listarContasFinanceiras();
                    $scope.forms.formFinanca.$setPristine();
                });
            };

            /**
             * Método responsável em verificar o vetor contendo as recorrências/parcelas
             * da conta a ser salva pelo usuário .
             */
            $scope.setVerificaRecorrencia = function() {

                if ($scope.objConta.tit_recorrente.length) {
                    $scope.objConta.tit_recorrente.splice(0, 1);
                }
            };

            /**
             * Método responsável em calcular o valor líquido do título.
             */
            $scope.calcular = function(flag) {

                if (flag && $scope.objConta.tit_situacao_flag) {
                    $scope.zerarDescontos();
                }

                var vlrBruto     = parseFloat($scope.objConta.tit_doc_vlr_bruto);
                var vlrDespesas  = parseFloat($scope.objConta.tit_doc_vlr_despesas);
                var vlrDescontos = parseFloat($scope.objConta.tit_doc_vlr_descontos);

                var vlrLiquido = vlrBruto + vlrDespesas - vlrDescontos;
                $scope.objConta.tit_doc_vlr_liquido = vlrLiquido;
            };

            /**
             * Método responsável em calcular o desconto de valores.
             */
            $scope.calcularDesconto = function() {

                var vlrDesconto = parseFloat($scope.objConta.tit_doc_vlr_descontos);
                var vlrLiquido  = parseFloat($scope.objConta.tit_doc_vlr_bruto).toFixed(2);

                if (! isNaN(vlrDesconto) && vlrDesconto <= vlrLiquido) {

                    var descontoPorcento = vlrDesconto * 100 / vlrLiquido;
                    $scope.objConta.tit_doc_porct_descontos = parseFloat(descontoPorcento.toFixed(2));
                    $scope.calcular();
                }
            };

            /**
             * Método responsável em calcular o acréscimo de valores.
             */
            $scope.calcularAcrescimo = function() {

                var vlrAcrescimo = parseFloat($scope.objConta.tit_doc_vlr_despesas);
                var vlrLiquido   = parseFloat($scope.objConta.tit_doc_vlr_bruto).toFixed(2);

                if (! isNaN(vlrAcrescimo) && vlrAcrescimo <= vlrLiquido) {

                    var acrescimoPorcento = vlrAcrescimo * 100 / vlrLiquido;
                    $scope.objConta.tit_doc_porct_despesas = parseFloat(acrescimoPorcento.toFixed(2));
                    $scope.calcular();
                }
            };

            /**
             * Método responsável em efetuar o cálculo do acréscimo de um determinado
             * título por meio de porcentagem.
             */
            $scope.calcularPorcAcrescimo = function() {

                if ($scope.objConta.tit_doc_vlr_bruto) {

                    var vlrLiquido  = parseFloat($scope.objConta.tit_doc_vlr_bruto);
                    var porcentagem = parseFloat($scope.objConta.tit_doc_porct_despesas);

                    if (! isNaN(porcentagem) && porcentagem <= 100) {

                        var despesa = vlrLiquido * porcentagem / 100;
                        $scope.objConta.tit_doc_vlr_despesas = despesa;
                        $scope.calcular();

                    } else {

                        $scope.objConta.tit_doc_porct_despesas = 0;
                        $scope.calcular();
                    }
                }
            };

            /**
             * Método responsável em efetuar o cálculo do descontos de um determinado
             * título por meio de porcentagem.
             */
            $scope.calcularPorcDesconto = function() {

                if ($scope.objConta.tit_doc_vlr_bruto) {

                    var vlrLiquido  = parseFloat($scope.objConta.tit_doc_vlr_bruto);
                    var porcentagem = parseFloat($scope.objConta.tit_doc_porct_descontos);

                    if (! isNaN(porcentagem) && porcentagem <= 100) {

                        var desconto = vlrLiquido * porcentagem / 100;
                        $scope.objConta.tit_doc_vlr_descontos = desconto;
                        $scope.calcular();
                    }
                }
            };

            /**
             * Método responsável em zerar a base de cálculo para o valor líquido do título.
             */
            $scope.zerarBaseCalculo = function() {

                $scope.objConta.tit_doc_vlr_bruto = $scope.objConta.tit_doc_vlr_liquido;
                $scope.zerarDescontos();
            };

            /**
             * Método responsável em zerar a base de descontos e acréscimos.
             */
            $scope.zerarDescontos = function() {

                $scope.objConta.tit_doc_vlr_despesas    = 0;
                $scope.objConta.tit_doc_porct_despesas  = 0;
                $scope.objConta.tit_doc_vlr_descontos   = 0;
                $scope.objConta.tit_doc_porct_descontos = 0;
            };

            /**
             * Método responsável em manipular os campos do tipo 'checkbox' referentes ao
             * campo conta financeira contido no formulário de pesquisa.
             */
            $scope.manipularCF = function(contaFinanceira) {

                var arrContasSelecionadas = $scope.objPesquisa.arrContasSelecionadas;
                if (arrContasSelecionadas.length === 0) {

                    // Inicializando o vetor com as contas financeiras escolhidas para a pesquisa:
                    arrContasSelecionadas.push(contaFinanceira.par_pai);

                } else {

                    // Removendo o item escolhido caso o mesmo já exista no vetor:
                    var keepGoing = true;
                    angular.forEach(arrContasSelecionadas, function(i, j) {
                        if (keepGoing) {
                            if (i === contaFinanceira.par_pai) {
                                arrContasSelecionadas.splice(j, 1);
                                keepGoing = false;
                            }
                        }
                    });

                    // Adiciona o item escolhido caso o mesmo não exista no vetor:
                    keepGoing && arrContasSelecionadas.push(contaFinanceira.par_pai);
                    $scope.objPesquisa.arrContasSelecionadas = arrContasSelecionadas;
                }

                $scope.listarTrigger();
            };

            /**
             * Método responsável em inicializar a data de pagamento ou recebimento de
             * um determinado título para a data atual.
             */
            $scope.setDataAtual = function() {
                if ($scope.objConta.tit_situacao_flag) {

                    $scope.objConta.tit_dat_pgt = GeralFactory.getDataAtualBr();

                } else {

                    $scope.zerarDescontos();
                    $scope.objConta.tit_dat_pgt = null;
                    $scope.objConta.tit_doc_vlr_liquido = $scope.objConta.tit_doc_vlr_bruto;
                }
            };

            /**
             * Método responsável em limpar o campo centro de custo (ui-select) do
             * formulário de pesquisa dos títulos.
             */
            $scope.limparCentroCusto = function($event) {

                $event.stopPropagation();
                $scope.objPesquisa.centroCusto = undefined;
                $scope.listarTrigger();
            };

            /**
             * Método responsável em limpar o campo situação (ui-select) do
             * formulário de pesquisa dos títulos.
             */
            $scope.limparSituacao = function($event) {

                $event.stopPropagation();
                $scope.objPesquisa.situacao = undefined;
                $scope.listarTrigger();
            };

            /**
             * Método responsável em limpar o campo tipo de natureza (ui-select) do
             * formulário de pesquisa dos títulos.
             */
            $scope.limparTipoNatureza = function($event) {

                $event.stopPropagation();
                $scope.objPesquisa.tipoNatureza = undefined;
                $scope.listarTrigger();
            };

            /**
             * Método responsável em limpar o campo forma de pagamento (ui-select) do
             * formulário de pesquisa dos títulos.
             */
            $scope.limparFormaPagamento = function($event) {

                $event.stopPropagation();
                $scope.objPesquisa.formaPagamento = undefined;
                $scope.listarTrigger();
            };

            /**
             * Método responsável pela seleção dos dados de uma determinada pessoa pelo componente de
             * autocomplete de cliente/fornecedor contido na tela.
             */
            $scope.onSelectPessoa = function($item) {

                $scope.getPessoa($item.cad_cod_cad);
                $scope.objConta.pessoa = $item.cad_nome_razao;
            };

            /**
             * Método responsável em adicionar um determinado cliente/fornecedor de forma direta pelo
             * componente de autocomplete contido na tela.
             */
            $scope.addPessoa = function($item) {

                var objPessoa = {
                    cad_nome_razao  : $item.trim(),
                    cad_tip_cli_for : $scope.objDropdown.objEntidadePessoa.cad_tip_cli_for,
                    cad_pf_pj       : 1,
                    cad_eh_inativo  : 0
                };

                ClienteService.clientes.create(objPessoa, function(retorno) {
                    if (! retorno.records.error) {
                        
                        $scope.objConta.pessoa          = $item.trim();
                        $scope.objConta.tit_cad_cod_cad = retorno.records.cad_cod_cad;
                    }
                });
            };

            /**
             * Método responsável pela seleção dos dados de uma determinada forma de pagamento
             * pelo componente de autocomplete contido na tela.
             */
            $scope.onSelectFormaPagamento = function($item) {

                $scope.getFormaPagamento($item.par_pai);
                $scope.objConta.formaPagamento = $item.par_c01;
            };

            /**
             * Método responsável em adicionar uma determinada forma de pagamento diretamente pelo
             * componente de autocomplete contido na tela.
             */
            $scope.addFormaPagamento = function($item) {

                var objFormaPagamento = {
                    par_c01 : $item.trim()
                };

                ParamsService.formaPagamentos.create(objFormaPagamento, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.objConta.formaPagamento           = $item.trim();
                        $scope.objConta.tit_6060_forma_pagamento = retorno.records.par_pai;
                        $scope.getFormaPagamento();
                    }
                });
            };

            /**
             * Método responsável pela seleção dos dados de uma determinada conta financeira
             * pelo componente de autocomplete contido na tela.
             */
            $scope.onSelectContaFinanceira = function($item) {

                $scope.getContaFinanceira($item.par_pai);
                $scope.objConta.contaFinanceira = $item.par_c01;
            };

            /**
             * Método responsável em adicionar uma determinada conta financeira diretamente pelo
             * componente de autocomplete contido na tela.
             */
            $scope.addContaFinanceira = function($item) {

                var objContaFinanceira = {
                    par_c01 : $item.trim()
                };

                ParamsService.contaFinanceiras.create(objContaFinanceira, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.objConta.contaFinanceira    = $item.trim();
                        $scope.objConta.tit_5010_conta_fin = retorno.records.par_pai;
                        $scope.getContaFinanceira();
                    }
                });
            };

            /**
             * Método responsável pela seleção dos dados de um determinado centro de custo
             * pelo componente de autocomplete contido na tela.
             */
            $scope.onSelectCentroCusto = function($item) {

                $scope.getCentroCusto($item.par_pai);
                $scope.objConta.centroCusto = $item.par_c01;
            };

            /**
             * Método responsável em adicionar um determinado centro de custo diretamente pelo
             * componente de autocomplete contido na tela.
             */
            $scope.addCentroCusto = function($item) {

                var objCentroCusto = {
                    par_c01 : $item.trim(),
                    par_i03 : $scope.objDropdown.objCentroCusto.par_i03
                };

                ParamsService.centroCustos.create(objCentroCusto, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.objConta.centroCusto  = $item.trim();
                        $scope.objConta.tit_6050_cdc = retorno.records.par_pai;
                        $scope.getCentroCusto();
                    }
                });
            };

            /**
             * Método responsável em retornar todas as informações de um determinado centro de custo.
             */
            $scope.getCentroCusto = function(par_pai) {

                if (par_pai) {

                    ParamsService.centroCusto.get({par_pai : par_pai}, function(data) {
                        $scope.objCentroCusto        = data.records;
                        $scope.objConta.tit_6050_cdc = par_pai;
                    });
                } else {

                    var strFiltro = '';
                    if ($scope.objDropdown.objCentroCusto.par_i03) {

                        strFiltro = GeralFactory.formatarPesquisar({
                            'par_i03' : $scope.objDropdown.objCentroCusto.par_i03
                        });
                    }

                    ParamsService.centroCustos.get({u : strFiltro}, function(retorno) {
                        $scope.arrCentrosCustos = retorno.records;
                    });
                }
            };

            /**
             * Método responsável em retornar todas as informações de uma determinada forma de pagamento.
             */
            $scope.getFormaPagamento = function(par_pai) {

                if (par_pai) {

                    ParamsService.formaPagamento.get({par_pai : par_pai}, function(data) {
                        $scope.objFormaPagamento                 = data.records;
                        $scope.objConta.tit_6060_forma_pagamento = par_pai;
                    });
                } else {

                    ParamsService.formaPagamentos.get({u : ''}, function(resposta) {
                        $scope.arrFormasPgto = resposta.records;
                    });
                }
            };

            /**
             * Método responsável em retornar todas as informações de uma determinada pessoa.
             */
            $scope.getPessoa = function(cad_cod_cad) {

                ClienteService.cliente.get({cad_cod_cad : cad_cod_cad}, function(retorno) {
                    $scope.objPessoa                = retorno.records;
                    $scope.objConta.tit_cad_cod_cad = cad_cod_cad;
                });
            };

            /**
             * Método responsável em retornar todas as informações de uma determinada conta financeira.
             */
            $scope.getContaFinanceira = function(par_pai) {

                if (par_pai) {

                    ParamsService.contaFinanceira.get({par_pai : par_pai}, function(data) {
                        $scope.objContaFinanceira          = data.records;
                        $scope.objConta.tit_5010_conta_fin = par_pai;
                    });
                } else {

                    ParamsService.contaFinanceiras.get({u : ''}, function(retorno) {
                        $scope.arrContasFinanceiras = retorno.records;
                    });
                }
            };

            /**
             * Método responsável em gerar os relatórios financeiros.
             */
            $scope.imprimirRelatorio = function(tipo) {

                $scope.arrContas = [];
                tipo = tipo || 'pdf';

                var strContas = '';
                if ($scope.objPesquisa.arrContasSelecionadas.length) {

                    strContas = $scope.objPesquisa.arrContasSelecionadas.join('|');
                }

                var objFiltro = {
                    'tit_5010_conta_fin'       : strContas,
                    'tit_rel_formato'          : tipo,
                    'tit_qtde_conta_fin'       : $scope.qtdeContasFinanceiras,
                    'tit_pesquisa'             : $scope.objPesquisa.criterio,
                    'tit_6050_cdc'             : $scope.objPesquisa.centroCusto,
                    'tit_faturado'             : $scope.objPesquisa.situacao,
                    'tit_dat_init'             : $scope.objPesquisa.dtInicio,
                    'tit_dat_end'              : $scope.objPesquisa.dtFinal,
                    'tit_fin_placa'            : $scope.objPesquisa.finPlaca,
                    'tit_fin_carga'            : $scope.objPesquisa.finCarga,
                    'tit_dat_op'               : $scope.objPesquisa.opDataPesquisa,
                    'tit_6060_forma_pagamento' : $scope.objPesquisa.formaPagamento,
                    'ken'                      : AuthTokenFactory.getToken()
                };

                // Parâmetro válido apenas para o contas a pagar e receber:
                if (parseInt($scope.objPesquisa.sistema) !== 3) {

                    objFiltro['tit_sistema'] = $scope.objPesquisa.sistema;
                }

                var arrRelatorio = $scope.getConfigRelatorio(GeralFactory.formatarPesquisar(objFiltro));
                if (arrRelatorio) {

                    $window.open(arrRelatorio.url, 'Relatório');
                    $timeout(function() {
                        angular.element(arrRelatorio.btn).triggerHandler('click');
                    }, 50);
                }
            };

            /**
             * Método responsável em retornar um vetor com as configurações necessárias
             * para a geração do relatório escolhido pelo usuário da aplicação.
             */
            $scope.getConfigRelatorio = function(strFiltro) {

                if (strFiltro) {

                    var arrRetorno = [];
                    var codSistema = parseInt($scope.objPesquisa.sistema);
                    switch (codSistema) {
                        case 1:
                            arrRetorno['url'] =  GeralFactory.getUrlApi() + '/erp/export/financa/receber/?' + strFiltro;
                            arrRetorno['btn'] = '#btn-contas-receber';
                            break;

                        case 2:
                            arrRetorno['url'] =  GeralFactory.getUrlApi() + '/erp/export/financa/pagar/?' + strFiltro;
                            arrRetorno['btn'] = '#btn-contas-pagar';
                            break;

                        case 3:
                            arrRetorno['url'] =  GeralFactory.getUrlApi() + '/erp/export/financa/extrato/?' + strFiltro;
                            arrRetorno['btn'] = '#btn-extrato';
                            break;
                    }

                    return arrRetorno;
                }

                return null;
            };

            /**
             * Método responsável em abrir a janela modal contendo o formulário
             * para anexar documentos para um determinado título.
             */
            $scope.getFormUpload = function() {

                if ($scope.objConta.tit_fatura_seq && $scope.objConta.tit_fin_nro_lan) {

                    var scope = $rootScope.$new();

                    scope.params = {};

                    scope.params.tit_fatura_seq  = $scope.objConta.tit_fatura_seq;
                    scope.params.tit_fin_nro_lan = $scope.objConta.tit_fin_nro_lan;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'financeiro/views/documentos.html',
                        controller  : 'FinanceiroModalCtrl',
                        windowClass : 'center-modal',
                        backdrop    : 'static',
                        scope       :  scope,
                        resolve     :  {
                            getEnd: function() { }
                        }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'cancel') {
                            if (modalInstance.hasAlteracao) {

                                $scope.getDocumentos();
                            }
                        }
                    });
                }
            };

            /**
             * Método responsável em recolher todos os documentos vinculados a
             * um determinado título financeiro.
             */
            $scope.getDocumentos = function() {

                $scope.objConta.tit_midia = [];

                if ($scope.objConta.tit_fatura_seq && $scope.objConta.tit_fin_nro_lan) {

                    var query = 'q=(mid_tab:6,mid_tab_cod:' + $scope.objConta.tit_fin_nro_lan + ',mid_tab_cod_sub:' + $scope.objConta.tit_fatura_seq + ')';
                    MidiaService.midias.get({u: query}, function(retorno) {
                        if (! retorno.records.error) {

                            $scope.objConta.tit_midia = retorno.records;
                            $scope.objConta.tit_venda.fin_tit_not === 1 && $scope.setNfeMidias();
                        }
                    });
                }
            };

            /**
             * Método responsável em efetuar o download de um determinado
             * documento de um determinado título financeiro.
             */
            $scope.download = function(objDocumento) {
                if (objDocumento.hasOwnProperty('mid_nfe')) {

                    var tipo = objDocumento.mid_nfe_tipo;
                    switch (tipo) {
                        case 'PDF':
                            $scope.imprimirDANFE();
                            break;

                        case 'XML':
                            $scope.gerarXML();
                            break;
                    }
                } else {

                    var url = $rootScope.documentCache + objDocumento.mid_id;
                    $window.open(url);
                }
            };

            /**
             * Método responsável em gerar o PDF contendo os dados da nota fiscal
             * para um determinado título escolhido pelo usuário.
             */
            $scope.imprimirDANFE = function() {

                if ($scope.objConta.tit_venda.fin_tit_not === 1 && ($scope.objConta.tit_venda.fin_cod_acao === 9 || $scope.objConta.tit_venda.fin_cod_acao === 8)) {

                    var objFiltro = {
                        'ken'         : AuthTokenFactory.getToken(),
                        'chave'       : $scope.objConta.tit_venda.fin_nfe_chave,
                        'fin_nro_lan' : $scope.objConta.tit_venda.fin_nro_lan
                    };

                    var url = GeralFactory.getUrlApi() + '/erp/nfe/danfe/?' + GeralFactory.formatarPesquisar(objFiltro);
                    $window.open(url, 'DANFE');

                } else {

                    var mensagem = 'Caro usuário, não foi possível imprimir a nota fiscal!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                }
            };

            /**
             * Método responsável em gerar um arquivo XML contendo os dados de um
             * determinado título escolhido pelo usuário.
             */
            $scope.gerarXML = function() {

                if ($scope.objConta.tit_venda.fin_tit_not === 1 && ($scope.objConta.tit_venda.fin_cod_acao === 9)) {

                    var objFiltro = {
                        'ken'         : AuthTokenFactory.getToken(),
                        'chave'       : $scope.objConta.tit_venda.fin_nfe_chave,
                        'fin_nro_lan' : $scope.objConta.tit_venda.fin_nro_lan
                    };

                    var url = GeralFactory.getUrlApi() + '/erp/nfe/get-xml-aprovado/?' + GeralFactory.formatarPesquisar(objFiltro);
                    $window.open(url, 'XML');

                } else {

                    var mensagem = 'Caro usuário, não foi possível gerar o XML!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                }
            };

            /**
             * Método responsável em remover um determinado documento de
             * um determinado título financeiro.
             */
            $scope.removerDocumento = function(mid_nro) {

                if (mid_nro) {

                    GeralFactory.confirmar('Deseja remover o documento?', function() {

                        var objeto = {mid_nro : mid_nro};
                        MidiaService.midia.remover(objeto, function(resposta) {
                            if (! resposta.records.error) {

                                GeralFactory.notificar({data : resposta});
                                $scope.getDocumentos();
                            }
                        });
                    });
                }
            };

            /**
             * Método responsável em gerar um recibo para um determinado título de
             * conta a receber escolhido pelo usuário.
             */
            $scope.gerarRecibo = function() {

                var objConta = $scope.objConta;
                if (objConta.tit_fatura_seq && objConta.tit_fin_nro_lan && objConta.tit_faturado === 3) {

                    var codSistema = parseInt($scope.objPesquisa.sistema);

                    var strFiltro = GeralFactory.formatarPesquisar({
                        'tit_sistema'     : codSistema,
                        'tit_fatura_seq'  : objConta.tit_fatura_seq,
                        'tit_fin_nro_lan' : objConta.tit_fin_nro_lan,
                        'ken'             : AuthTokenFactory.getToken()
                    });

                    var objRecibo = {};
                    if (codSistema === 1) {

                        objRecibo = {
                            'url'    :  GeralFactory.getUrlApi() + '/erp/export/financa/receber/recibo/?' + strFiltro,
                            'titulo' : 'Recibo de Receita'
                        };
                    } else {

                        objRecibo = {
                            'url'    :  GeralFactory.getUrlApi() + '/erp/export/financa/pagar/recibo/?' + strFiltro,
                            'titulo' : 'Recibo de Despesa'
                        };
                    }

                    $timeout(function() {
                        $window.open(objRecibo.url, objRecibo.titulo);
                    }, 50);

                } else {

                    var mensagem = 'Caro usuário, para emitir um recibo a conta deve estar paga/faturada!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                }
            };

            /**
             * Método responsável em gerar uma duplicata para um determinado título de
             * conta a receber escolhido pelo usuário.
             */
            $scope.gerarDuplicata = function() {

                var objConta = $scope.objConta;
                if (objConta.tit_fatura_seq && objConta.tit_fin_nro_lan && objConta.tit_sistema === 1) {

                    var scope  = $rootScope.$new();
                    var objeto = {
                        'tit_venda'       : objConta.tit_venda,
                        'tit_fatura_seq'  : objConta.tit_fatura_seq,
                        'tit_fin_nro_lan' : objConta.tit_fin_nro_lan,
                        'tit_cad_cod_cad' : objConta.tit_cad_cod_cad,
                        'ken'             : AuthTokenFactory.getToken()
                    };

                    scope.params = {};
                    scope.params.objDuplicata = objeto;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'financeiro/views/janela-duplicata.html',
                        controller  : 'DuplicataModalCtrl',
                        windowClass : 'center-modal',
                        backdrop    : 'static',
                        scope       :  scope,
                        resolve     :  { }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {

                        if (msg === 'reload' && modalInstance.end_cobranca) {
                            scope.$destroy();
                            $scope.objConta.tit_end_cod_end_cob = modalInstance.end_cobranca;
                            $timeout(function() {
                                $scope.salvarConta();
                            }, 500);
                        }
                    });
                }
            };

            /**
             * Método responsável em mostrar todas as informações de uma determinada parcela quando a
             * mesma for selecionada pelo usuário na tabela de recorrências do título.
             */
            $scope.getParcela = function(parcela) {

                if (parcela.hasOwnProperty('tit_fatura_seq') && parcela.hasOwnProperty('tit_fin_nro_lan')) {

                    var faturaSeq = parcela.tit_fatura_seq;
                    var numeroLan = parcela.tit_fin_nro_lan;
                    if (faturaSeq && numeroLan) {

                        GeralFactory.scrollToTop();
                        $scope.getConta(numeroLan, faturaSeq);
                    }
                }
            };

            /**
             * Método responsável em retornar um objeto contendo o dia, mês e ano
             * de uma determinada data.
             */
            $scope.getObjetoData = function(strData) {
                var arrData = strData.split('/');
                return {
                    'dia' : parseInt(arrData[0]),
                    'mes' : parseInt(arrData[1]) - 1,
                    'ano' : parseInt(arrData[2])
                };
            };

            /**
             * Método responsável em gerar as parcelas referente as recorrência de um determinado
             * título conforme as escolhas do usuário da aplicação.
             */
            $scope.gerarParcelas = function() {

                if ($scope.objConta.tit_ocorrencia) {

                    if (/^\d*$/.test($scope.objConta.tit_ocorrencia)) {

                        var qtdeParcelas = parseInt($scope.objConta.tit_ocorrencia);
                        $scope.gerarParcelasByOcorrencias(qtdeParcelas);

                    } else {

                        if ($scope.objConta.tit_ocorrencia.match(/x/i)) {

                            var split1 = $scope.objConta.tit_ocorrencia.split('x');
                            var split2 = $scope.objConta.tit_ocorrencia.split('X');

                            var arrItem = (split1.length > split2.length) ? split1 : split2;
                            $scope.gerarParcelasByOcorrencias(parseInt(arrItem[0]));

                        } else {

                            /**
                             * var mensagem = 'Caro usuário, entrada inválida para o campo contendo o número de ocorrências!';
                             * GeralFactory.notify('warning', 'Atenção:', mensagem);
                             */

                            var arrParcelamento = $scope.objConta.tit_ocorrencia.match(/\d+/g);
                            if (Array.isArray(arrParcelamento)) {

                                $scope.objConta.tit_periodicidade = 0;
                                $scope.gerarParcelasByAto(arrParcelamento);
                            }
                        }
                    }
                } else {

                    var mensagem = 'Caro usuário, é necessário entrar com a quantidade de parcelas!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                }
            };

            /**
             * Método responsável em gerar as parcelas no formato 10x respeitando
             * a periodicidade escolhida pelo usuário.
             */
            $scope.gerarParcelasByOcorrencias = function(qtdeParcelas) {

                if (qtdeParcelas && (qtdeParcelas >= 1 && qtdeParcelas <= 360)) {

                    var periodicidade = $scope.objConta.tit_periodicidade;
                    if (periodicidade) {

                        var dtReferencia = $scope.objConta.tit_dat_vct ? $scope.objConta.tit_dat_vct : GeralFactory.getDataAtualBr();
                        var vlrParcelas  = $scope.objConta.tit_doc_vlr_liquido ? $scope.objConta.tit_doc_vlr_liquido : 0;

                        qtdeParcelas = qtdeParcelas - 1;
                        $scope.objRecorrencia = {
                            'ocorrencias'   : qtdeParcelas,
                            'periodicidade' : periodicidade,
                            'dt_referencia' : dtReferencia,
                            'vlr_parcelas'  : vlrParcelas
                        };

                        switch (periodicidade) {
                            case 15:
                                $scope.parcelarQuinzenal();
                                break;

                            case 30:
                                $scope.parcelarMensal();
                                break;

                            case 90:
                            case 180:
                                $scope.parcelarTrimestreSemestre();
                                break;

                            case 365:
                                $scope.parcelarAnual();
                                break;
                        }
                    } else {

                        var mensagem = 'Caro usuário, para gerar as parcelas é necessário escolher uma periodicidade!';
                        GeralFactory.notify('warning', 'Atenção:', mensagem);
                    }
                } else {

                    var mensagem = 'Caro usuário, o número mínimo de parcelas permitidas é 1 e o número máximo é 360!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                }
            };

            /**
             * Método responsável em gerar as parcelas ou recorrências de forma quinzenal, ou seja,
             * apenas adiciona o período de 15 dias nas parcelas/data recorrentes.
             */
            $scope.parcelarQuinzenal = function() {

                var arrParcelas = [];
                if ($scope.objRecorrencia) {

                    var objData = $scope.getObjetoData($scope.objRecorrencia['dt_referencia']);
                    var defData = new Date(objData.ano, objData.mes, objData.dia);

                    // Primeira parcela da recorrência:
                    var qtdeParcelas = $scope.objRecorrencia['ocorrencias'] + 1;
                    var descPrimeira = '1/' + qtdeParcelas;
                    arrParcelas.push({
                        'tit_index'           : 0,
                        'tit_dat_vct'         : GeralFactory.getDataFormatadaBanco(defData),
                        'tit_doc_vlr_liquido' : $scope.objRecorrencia['vlr_parcelas'],
                        'tit_periodicidade'   : $scope.objRecorrencia['periodicidade'],
                        'tit_descricao'       : descPrimeira,
                        'tit_faturado'        : $scope.objConta.tit_situacao_flag ? 3 : 0
                    });

                    for (var i = 1; i <= $scope.objRecorrencia['ocorrencias']; i++)
                    {
                        var descParcelamento = '' + (i + 1) + '/' + qtdeParcelas;

                        // Somando quinze dias na data definida:
                        var dtParcelamento = new Date(new Date(defData).setDate(defData.getDate() + 15));
                        arrParcelas.push({
                            'tit_index'           : i,
                            'tit_dat_vct'         : GeralFactory.getDataFormatadaBanco(dtParcelamento),
                            'tit_doc_vlr_liquido' : $scope.objRecorrencia['vlr_parcelas'],
                            'tit_periodicidade'   : $scope.objRecorrencia['periodicidade'],
                            'tit_descricao'       : descParcelamento,
                            'tit_faturado'        : 0
                        });

                        // Base de cálculo para a próxima parcela:
                        objData = $scope.getObjetoData(GeralFactory.getDataFormatada(dtParcelamento));
                        defData = new Date(objData.ano, objData.mes, objData.dia);
                    }
                }

                $scope.objConta.tit_recorrente = arrParcelas;
                $scope.distribuirRecorrencias();
            };

            /**
             * Método responsável em gerar as parcelas ou recorrências de forma mensal, respeitando
             * a regra do último dia do mês para datas específicas.
             */
            $scope.parcelarMensal = function() {

                var arrParcelas = [];
                if ($scope.objRecorrencia) {

                    var objData = $scope.getObjetoData($scope.objRecorrencia['dt_referencia']);
                    var defData = new Date(objData.ano, objData.mes, objData.dia);

                    // Primeira parcela da recorrência:
                    var qtdeParcelas = $scope.objRecorrencia['ocorrencias'] + 1;
                    var descPrimeira = '1/' + qtdeParcelas;
                    arrParcelas.push({
                        'tit_index'           : 0,
                        'tit_dat_vct'         : GeralFactory.getDataFormatadaBanco(defData),
                        'tit_doc_vlr_liquido' : $scope.objRecorrencia['vlr_parcelas'],
                        'tit_periodicidade'   : $scope.objRecorrencia['periodicidade'],
                        'tit_descricao'       : descPrimeira,
                        'tit_faturado'        : $scope.objConta.tit_situacao_flag ? 3 : 0
                    });

                    // Recolhendo as parcelas conforme os dados da recorrência:
                    for (var i = 1; i <= $scope.objRecorrencia['ocorrencias']; i++)
                    {
                        var descParcelamento = '' + (i + 1) + '/' + qtdeParcelas;

                        // Somando um mês na data escolhida:
                        var dtParcelamento = new Date(new Date(defData).setMonth(defData.getMonth() + i));
                        if (dtParcelamento.getDate() === objData.dia) {

                            // Se o dia da data escolhida for idêntico ao do parcelamento atual:
                            arrParcelas.push({
                                'tit_index'            : i,
                                'tit_dat_vct'          : GeralFactory.getDataFormatadaBanco(dtParcelamento),
                                'tit_doc_vlr_liquido'  : $scope.objRecorrencia['vlr_parcelas'],
                                'tit_periodicidade'    : $scope.objRecorrencia['periodicidade'],
                                'tit_descricao'        : descParcelamento,
                                'tit_faturado'         : 0
                            });

                        } else {

                            // Caso não seja igual recolher o último dia do mês anterior:
                            var mesAnterior = dtParcelamento.getMonth() - 1;

                            var dtMesPrev = new Date();
                            dtMesPrev.setFullYear(dtParcelamento.getFullYear(), mesAnterior, 1);

                            var ultimoDia = new Date(dtMesPrev.getFullYear(), dtMesPrev.getMonth() + 1, 0, 23, 59, 59);
                            arrParcelas.push({
                                'tit_index'           : i,
                                'tit_dat_vct'         : GeralFactory.getDataFormatadaBanco(ultimoDia),
                                'tit_doc_vlr_liquido' : $scope.objRecorrencia['vlr_parcelas'],
                                'tit_periodicidade'   : $scope.objRecorrencia['periodicidade'],
                                'tit_descricao'       : descParcelamento,
                                'tit_faturado'        : 0
                            });
                        }
                    }
                }

                $scope.objConta.tit_recorrente = arrParcelas;
                $scope.distribuirRecorrencias();
            };

            /**
             * Método responsável em gerar as parcelas ou recorrências de forma semestral ou trimestral,
             * ou seja, somando 180 ou 90 dias a data principal.
             */
            $scope.parcelarTrimestreSemestre = function() {

                var arrParcelas   = [];
                var periodicidade = $scope.objRecorrencia['periodicidade'];
                if ($scope.objRecorrencia) {

                    var objData = $scope.getObjetoData($scope.objRecorrencia['dt_referencia']);
                    var defData = new Date(objData.ano, objData.mes, objData.dia);

                    // Primeira parcela da recorrência:
                    var qtdeParcelas = $scope.objRecorrencia['ocorrencias'] + 1;
                    var descPrimeira = '1/' + qtdeParcelas;
                    arrParcelas.push({
                        'tit_index'           : 0,
                        'tit_dat_vct'         : GeralFactory.getDataFormatadaBanco(defData),
                        'tit_doc_vlr_liquido' : $scope.objRecorrencia['vlr_parcelas'],
                        'tit_periodicidade'   : $scope.objRecorrencia['periodicidade'],
                        'tit_descricao'       : descPrimeira,
                        'tit_faturado'        : $scope.objConta.tit_situacao_flag ? 3 : 0
                    });

                    for (var i = 1; i <= $scope.objRecorrencia['ocorrencias']; i++)
                    {
                        var descParcelamento = '' + (i + 1) + '/' + qtdeParcelas;

                        var dtParcelamento = new Date(new Date(defData).setDate(defData.getDate() + periodicidade));
                        arrParcelas.push({
                            'tit_index'           : i,
                            'tit_descricao'       : descParcelamento,
                            'tit_dat_vct'         : GeralFactory.getDataFormatadaBanco(dtParcelamento),
                            'tit_doc_vlr_liquido' : $scope.objRecorrencia['vlr_parcelas'],
                            'tit_periodicidade'   : periodicidade,
                            'tit_faturado'        : 0
                        });

                        // Base de cálculo para a próxima parcela trimestral ou semestral:
                        objData = $scope.getObjetoData(GeralFactory.getDataFormatada(dtParcelamento));
                        defData = new Date(objData.ano, objData.mes, objData.dia);
                    }
                }

                $scope.objConta.tit_recorrente = arrParcelas;
                $scope.distribuirRecorrencias();
            };

            /**
             * Método responsável em montar as parcelas ou recorrências de forma anual, ou seja,
             * apenas somando um ano a cada parcela/data recorrente.
             */
            $scope.parcelarAnual = function() {

                var arrParcelas = [];
                if ($scope.objRecorrencia) {

                    var objData = $scope.getObjetoData($scope.objRecorrencia['dt_referencia']);
                    var defData = new Date(objData.ano, objData.mes, objData.dia);

                    // Primeira parcela da recorrência:
                    var qtdeParcelas = $scope.objRecorrencia['ocorrencias'] + 1;
                    var descPrimeira = '1/' + qtdeParcelas;
                    arrParcelas.push({
                        'tit_index'           : 0,
                        'tit_dat_vct'         : GeralFactory.getDataFormatadaBanco(defData),
                        'tit_doc_vlr_liquido' : $scope.objRecorrencia['vlr_parcelas'],
                        'tit_periodicidade'   : $scope.objRecorrencia['periodicidade'],
                        'tit_descricao'       : descPrimeira,
                        'tit_faturado'        : $scope.objConta.tit_situacao_flag ? 3 : 0
                    });

                    for (var i = 1; i <= $scope.objRecorrencia['ocorrencias']; i++)
                    {
                        var descParcelamento = '' + (i + 1) + '/' + qtdeParcelas;

                        var dtParcelamento = new Date(new Date(defData).setFullYear(defData.getFullYear() + 1));
                        arrParcelas.push({
                            'tit_index'           : i,
                            'tit_dat_vct'         : GeralFactory.getDataFormatadaBanco(dtParcelamento),
                            'tit_doc_vlr_liquido' : $scope.objRecorrencia['vlr_parcelas'],
                            'tit_periodicidade'   : $scope.objRecorrencia['periodicidade'],
                            'tit_descricao'       : descParcelamento,
                            'tit_faturado'        : 0
                        });

                        // Base de cálculo para a próxima parcela anual:
                        objData = $scope.getObjetoData(GeralFactory.getDataFormatada(dtParcelamento));
                        defData = new Date(objData.ano, objData.mes, objData.dia);
                    }
                }

                $scope.objConta.tit_recorrente = arrParcelas;
                $scope.distribuirRecorrencias();
            };

            /**
             * Método responsável em gerar as parcelas no formato: 30 60 90.
             */
            $scope.gerarParcelasByAto = function(arrParcelamento) {

                if (arrParcelamento) {

                    var strData = $scope.objConta.tit_dat_vct ? $scope.objConta.tit_dat_vct : GeralFactory.getDataAtualBr();
                    var objData = $scope.getObjetoData(strData);

                    // Objeto Date contendo a data que define o parcelamento:
                    strData = new Date(objData.ano, objData.mes, objData.dia);

                    // Recolhendo o valor do parcelamento:
                    var vlrParcelamento = $scope.objConta.tit_doc_vlr_liquido ? $scope.objConta.tit_doc_vlr_liquido : 0;

                    var arrParcelas = [], count = 0;
                    angular.forEach(arrParcelamento, function(i, k) {

                        var qtdeDias = parseInt(i), descParcelamento = '' + (count + 1) + '/' + arrParcelamento.length;

                        var dtParcelamento = new Date(new Date(strData).setDate(strData.getDate() + qtdeDias));
                        arrParcelas.push({
                            'tit_index'           : k,
                            'tit_dat_vct'         : GeralFactory.getDataFormatadaBanco(dtParcelamento),
                            'tit_descricao'       : descParcelamento,
                            'tit_doc_vlr_liquido' : vlrParcelamento,
                            'tit_periodicidade'   : 0,
                            'tit_faturado'        : 0
                        });

                        count++;
                    });

                    $scope.objConta.tit_recorrente = arrParcelas;
                    $scope.distribuirRecorrencias();
                }
            };

            /**
             * Método responsável em distribuir as recorrências em dois vetores para ficarem
             * melhores distribuidas na tela do financeiro.
             */
            $scope.distribuirRecorrencias = function() {

                var qtdeTotal = $scope.objConta.tit_recorrente.length;
                if (qtdeTotal) {

                    var fator = qtdeTotal / 2;
                    var arrRecorrenciasOne = [], arrRecorrenciasTwo = [];
                    angular.forEach($scope.objConta.tit_recorrente, function(item, chave) {

                        chave < fator ? arrRecorrenciasOne.push(item) : arrRecorrenciasTwo.push(item);
                    });

                    $scope.arrRecorrenciaOne = arrRecorrenciasOne;
                    $scope.arrRecorrenciaTwo = arrRecorrenciasTwo;
                }
            };

            /**
             * Método responsável em verificar e validar a possível atualização das parcelas
             * e recorrências dos títulos vinculados ao título em questão.
             */
            $scope.verificarRecorrencias = function(campo) {
                if ($scope.objConta.tit_recorrente.length) {
                    $scope.tipoCampoRecorrencia = campo;
                    switch (campo) {
                        case 'D':
                            var periodicidadeRecorrente = $scope.objConta.tit_recorrente[0].tit_periodicidade;
                            if (periodicidadeRecorrente) {

                                var qtdeCaracteres = $scope.objConta.tit_dat_vct.length;
                                qtdeCaracteres === 10 && $scope.atualizarRecorrencias();

                            } else {

                                var arrParcelamento = $scope.objConta.tit_ocorrencia.match(/\d+/g);
                                if (Array.isArray(arrParcelamento)) {
                                    $scope.gerarParcelasByAto(arrParcelamento);
                                }
                            }
                            break;

                        case 'V':
                            $scope.atualizarRecorrencias();
                            break;
                    }
                }
            };

            /**
             * Método responsável em atualizar as datas e valores dos títulos recorrentes
             * ou parcelas através da periodicidade do título em questão.
             */
            $scope.atualizarRecorrencias = function() {

                var objTitulo = {
                    'num_fatura'    : $scope.objConta.tit_fatura_seq,
                    'vlr_liquido'   : $scope.objConta.tit_doc_vlr_liquido,
                    'periodicidade' : $scope.objConta.tit_periodicidade
                };

                if ($scope.objConta.tit_recorrente.length > 1 && $scope.objConta.acaoTela === 'atualizar') {

                    var campo  = $scope.tipoCampoRecorrencia === 'D' ? 'a data de vencimento' : 'o valor';
                    var funcao = function() {
                        $timeout(function() {
                            $scope.atualizarParcela(objTitulo);
                        }, 1000);
                    };

                    GeralFactory.confirmar('Deseja alterar ' + campo + ' para os próximos títulos?', function() {

                        // Verifica as regras utilizadas para atualização das parcelas ou recorrências:
                        $scope.setRegrasAtualizacaoRecorrencias(objTitulo);

                    }, '', funcao, 'Não', 'Sim');

                } else {

                    // Apenas para contas que tenham apenas UMA parcela recorrente:
                    $scope.setRegrasAtualizacaoRecorrencias(objTitulo);
                }
            };

            /**
             * Método responsável em atualizar o valor líquido ou a data de vencimento para
             * uma determinada parcela escolhida pelo usuário da aplicação.
             */
            $scope.atualizarParcela = function(objTitulo) {

                var arrParcelas = $scope.objConta.tit_recorrente;
                if (arrParcelas.length) {
                    angular.forEach(arrParcelas, function(item, chave) {

                        if ($scope.objConta.tit_fatura_seq === item.tit_fatura_seq) {
                            switch ($scope.tipoCampoRecorrencia)
                            {
                                case 'V':
                                    arrParcelas[chave].tit_doc_vlr_liquido = objTitulo.vlr_liquido;
                                    break;

                                case 'D':
                                    var objData = $scope.getObjetoData($scope.objConta.tit_dat_vct);
                                    arrParcelas[chave].tit_dat_vct = GeralFactory.getDataFormatadaBanco(new Date(objData.ano, objData.mes, objData.dia));
                                    break;
                            }
                        }
                    });

                    $scope.objConta.tit_recorrente = arrParcelas;
                    $scope.distribuirRecorrencias();
                }
            };

            /**
             * Método responsável em atualizar o vetor contendo as parcelas ou recorrências
             * de acordo com a modificação da data de vencimento ou valor do título.
             */
            $scope.setRegrasAtualizacaoRecorrencias = function(objTitulo) {

                // Data parâmetro para modificação das datas de vencimento das parcelas/recorrências:
                if ($scope.objConta.tit_dat_vct) {

                    var objData = $scope.getObjetoData($scope.objConta.tit_dat_vct);
                    var defData = new Date(objData.ano, objData.mes, objData.dia);
                }

                var arrParcelas = $scope.objConta.tit_recorrente;
                if (arrParcelas.length === 1) {

                    arrParcelas[0].tit_dat_vct = GeralFactory.getDataFormatadaBanco(defData);
                    arrParcelas[0].tit_doc_vlr_liquido = objTitulo.vlr_liquido;

                } else {

                    var countFatura = 1, countMes = 1;
                    angular.forEach(arrParcelas, function(item, chave) {

                        // Verifica se a parcela ou recorrência pode ser atualizada:
                        if (countFatura >= objTitulo.num_fatura || objTitulo.num_fatura === undefined) {

                            switch ($scope.tipoCampoRecorrencia)
                            {
                                case 'V':
                                    arrParcelas[chave].tit_doc_vlr_liquido = objTitulo.vlr_liquido;
                                    break;

                                case 'D':
                                    if (objTitulo.periodicidade) {

                                        var dtParcela = new Date(new Date(defData).setMonth(defData.getMonth()));
                                        switch (objTitulo.periodicidade)
                                        {
                                            case 15:
                                            case 90:
                                            case 180:
                                                if (countFatura !== objTitulo.num_fatura) {
                                                    if (objTitulo !== undefined && chave !== 0) {

                                                        // Verificando a primeira parcela da recorrência:
                                                        dtParcela = new Date(new Date(defData).setDate(defData.getDate() + objTitulo.periodicidade));
                                                    }
                                                }

                                                arrParcelas[chave].tit_dat_vct = GeralFactory.getDataFormatadaBanco(dtParcela);
                                                objData = $scope.getObjetoData(GeralFactory.getDataFormatada(dtParcela));
                                                defData = new Date(objData.ano, objData.mes, objData.dia);
                                                break;

                                            case 0:
                                            case 30:
                                                if (countFatura !== objTitulo.num_fatura) {
                                                    if (objTitulo !== undefined && chave !== 0) {

                                                        // Verificando a primeira parcela da recorrência:
                                                        dtParcela = new Date(new Date(defData).setMonth(defData.getMonth() + countMes));
                                                        countMes++;
                                                    }
                                                }

                                                if (dtParcela.getDate() === objData.dia) {

                                                    arrParcelas[chave].tit_dat_vct = GeralFactory.getDataFormatadaBanco(dtParcela);

                                                } else {

                                                    var dtMesPrev = new Date();
                                                    dtMesPrev.setFullYear(dtParcela.getFullYear(), dtParcela.getMonth() - 1, 1);

                                                    var ultimoDia = new Date(dtMesPrev.getFullYear(), dtMesPrev.getMonth() + 1, 0, 23, 59, 59);
                                                    arrParcelas[chave].tit_dat_vct = GeralFactory.getDataFormatadaBanco(ultimoDia);
                                                }
                                                break;


                                            case 365:
                                                if (countFatura !== objTitulo.num_fatura) {
                                                    if (objTitulo !== undefined && chave !== 0) {

                                                        // Verificando a primeira parcela da recorrência:
                                                        dtParcela = new Date(new Date(defData).setFullYear(defData.getFullYear() + 1));
                                                    }
                                                }

                                                arrParcelas[chave].tit_dat_vct = GeralFactory.getDataFormatadaBanco(dtParcela);
                                                objData = $scope.getObjetoData(GeralFactory.getDataFormatada(dtParcela));
                                                defData = new Date(objData.ano, objData.mes, objData.dia);
                                                break;
                                        }
                                    }
                                    break;

                                default:
                                    break;
                            }
                        }
                        countFatura++;
                    });
                }

                $scope.objConta.tit_recorrente = arrParcelas;
                $scope.distribuirRecorrencias();
            };

            /**
             * Método responsável em inicializar a periodicidade dos títulos quando o
             * usuário escolher a opção de recorrência.
             */
            $scope.setPeriodicidade = function() {

                var recorrencia = $scope.objConta.tit_recorrente_flag;
                if (recorrencia) {

                    // Por padrão deixar a periodicidade como mensal:
                    $scope.objConta.tit_periodicidade = 30;

                } else {

                    $scope.objConta.tit_ocorrencia    = '';
                    $scope.objConta.tit_recorrente    = [];
                    $scope.objConta.tit_periodicidade = 0;
                }
            };

            /**
             * Método responsável em verificar as regras que são comuns tanto para salvar os dados de
             * um boleto quanto para gerar uma segunda via de um mesmo.
             */
            $scope.getVerificaRegrasBoleto = function() {

                // Boleto bancário apenas para contas a receber!
                if ($scope.objPesquisa.sistema === 1) {

                    // Boleto bancáro apenas para forma de pgto boleto e transação existentes!
                    var objConta = $scope.objConta;
                    if (objConta['tit_forma_pgto'] && objConta['tit_transacao']) {

                        // Boleto bancário apenas para um título que já tenha cadastro na base de dados!
                        var strPgto = objConta['tit_forma_pgto']['par_c01'];
                        if (objConta.tit_fatura_seq && objConta.tit_fin_nro_lan && (strPgto.match(/boleto/gi) || strPgto.match(/boleto gerencia/gi))) {

                            return true;
                        }
                    }
                }

                return false;
            };

            /**
             * Método responsável em verificar se existe a necessidade de gerar a segunda via do boleto
             * de acordo com alteração dos dados do título.
             */
            $scope.getVerificaSegundaViaBoleto = function() {

                var retorno = $scope.getVerificaRegrasBoleto();
                if (retorno) {

                    // Recolhendo os dados da transação:
                    var objTransacao = $scope.objConta['tit_transacao'];
                    if (! _.contains([3, 5, 6, 7], parseInt(objTransacao.tra_status_transacao))) {

                        // Segunda via é gerada apenas se existir mudança no valor do título:
                        var vlrTransacao = parseFloat(objTransacao.tra_valor_transacao), vlrTitulo = parseFloat($scope.objConta.tit_doc_vlr_bruto);
                        if (vlrTransacao !== vlrTitulo) {

                            return true;
                        }
                    }
                }

                return false;
            };

            /**
             * Método responsável em verificar se existe a necessidade em ALTERAR os dados do boleto
             * conforme a mudança na data de vencimento do título escolhido pelo usuário.
             */
            $scope.getVerificaCanSaveBoleto = function() {

                var retorno = $scope.getVerificaRegrasBoleto();
                if (retorno) {

                    var dtVctNew = getObjetoData($scope.objConta['tit_dat_vct']);
                    var dtVctOld = getObjetoData(GeralFactory.formatarDataBr($scope.objConta.tit_transacao.tra_dat_expiracao));
                    if (dtVctNew < dtVctOld) {

                        $scope.objConta['tit_dat_vct'] = GeralFactory.formatarDataBr($scope.objConta.tit_transacao.tra_dat_expiracao);
                        $timeout(function() {

                            var mensagem = 'Não é possível antecipar a data de vencimento de um boleto bancário!';
                            GeralFactory.notify('warning', 'Atenção!', mensagem);
                        });

                        return false;

                    } else {

                        return true;
                    }
                }

                function getObjetoData(data) {
                    var objData = $scope.getObjetoData(data);
                    return new Date(objData.ano, objData.mes, objData.dia);
                }

                return false;
            };

            /**
             * Método responsável em gerar o boleto de pagamento para um determinado
             * título financeiro. Obs.: Vale apenas para conta a receber.
             */
            $scope.gerarBoleto = function() {

                // Verifica se o usuário configurou o ambiente do GerenciaNet:
                var GN = Storage.usuario.getUsuario()['emp']['emp_ativo_gn'];
                if (GN == 0 || GN == null || GN == undefined) {

                    var mensagem = 'Para gerar o boleto é necessário configurar o ambiente no site do GerenciaNet!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);

                } else {

                    var objConta = $scope.objConta;
                    if (objConta['tit_forma_pgto']) {

                        var strPgto = objConta['tit_forma_pgto']['par_c01'];
                        if (objConta.tit_fatura_seq && objConta.tit_fin_nro_lan && (strPgto.match(/boleto/gi) || strPgto.match(/boleto gerencia/gi))) {

                            var scope = $rootScope.$new();

                            scope.params = {};
                            scope.params.objBoleto = {
                                'fin_nro_lan'     : objConta.tit_fin_nro_lan,
                                'fatura_seq'      : objConta.tit_fatura_seq,
                                'tit_transacao'   : objConta.tit_transacao,
                                'fin_cad_cod_cad' : objConta.tit_venda.fin_cad_cod_cad
                            };

                            var modalInstance = $uibModal.open({
                                animation   :  true,
                                templateUrl : 'financeiro/views/boleto.html',
                                controller  : 'FinanceiroBoletoModalCtrl',
                                windowClass : 'center-modal',
                                backdrop    : 'static',
                                scope       :  scope,
                                resolve     :  { }
                            });

                            modalInstance.result.then(function(id) { }, function(msg) {
                                if (msg === 'cancel') {
                                    if (modalInstance.hasAlteracao) {

                                        $scope.getTransacao(modalInstance.traCodTra);
                                        scope.$destroy();
                                    }
                                }
                            });
                        } else {

                            var mensagem = 'Caro usuário, não foi possível gerar o boleto!';
                            GeralFactory.notify('warning', 'Atenção:', mensagem);
                        }
                    } else {

                        var mensagem = 'Caro usuário, não se pode gerar um boleto para uma forma de pagamento diferente!';
                        GeralFactory.notify('warning', 'Atenção:', mensagem);
                    }
                }
            };

            /**
             * Método responsável em cancelar um o boleto de pagamento para um determinado
             * título financeiro enviando a requisição para o GerenciaNet.
             */
            $scope.cancelarBoleto = function() {

                // Verifica se o usuário configurou o ambiente do GerenciaNet:
                var GN = Storage.usuario.getUsuario()['emp']['emp_ativo_gn'];
                if (GN == 0 || GN == null || GN == undefined) {

                    var mensagem = 'Para cancelar um boleto é necessário configurar o ambiente no site do GerenciaNet!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);

                } else {

                    var objConta = $scope.objConta, strPgto = objConta['tit_forma_pgto']['par_c01'];
                    if (objConta.tit_fatura_seq && objConta.tit_fin_nro_lan && (strPgto.match(/boleto/gi) || strPgto.match(/boleto gerencia/gi))) {

                        // Verificando o status do boleto para permitir a remoção do mesmo:
                        var status = parseInt($scope.objConta.tit_transacao.tra_status_transacao);
                        if (_.contains([3, 5, 6, 7], status)) {

                            var mensagem = 'Não se pode cancelar boletos que já estejam pagos, cancelados ou contestados!';
                            GeralFactory.notify('warning', 'Atenção:', mensagem);

                        } else {

                            GeralFactory.confirmar('Deseja realmente cancelar o boleto vinculado ao título em questão?', function() {

                                $scope.salvarContaLoading = true;
                                var objeto = {
                                    tit_fatura_seq  : $scope.objConta.tit_fatura_seq,
                                    tit_fin_nro_lan : $scope.objConta.tit_fin_nro_lan
                                };

                                FinanceiroService.boleto.cancelar(objeto, function(retorno) {

                                    var arrRetorno = retorno.records;
                                    var strClasse  = arrRetorno.error ? 'danger' : 'success';

                                    $scope.salvarContaLoading = false;
                                    $timeout(function() {

                                        GeralFactory.notify(strClasse, 'Atenção!', arrRetorno.msg);
                                        $scope.getConta(objeto.tit_fin_nro_lan, objeto.tit_fatura_seq);

                                    }, 500);
                                });
                            });
                        }
                    } else {

                        var mensagem = 'Caro usuário, não foi possível efetuar o cancelamento do boleto!';
                        GeralFactory.notify('warning', 'Atenção:', mensagem);
                    }
                }
            };

            /**
             * Método responsável em gerar a segunda via do boleto bancário para um determinado
             * título escolhido pelo usuário da aplicação.
             */
            $scope.gerarSegundaViaBoleto = function() {

                var objConta = $scope.objConta;
                $timeout(function() {

                    var mensagem = 'Aguarde alguns segundos pois a segunda via do boleto está sendo gerada!';
                    GeralFactory.notify('info', 'Informação:', mensagem);

                    var objBoleto = {
                        'fin_nro_lan'     : objConta.tit_fin_nro_lan,
                        'fatura_seq'      : objConta.tit_fatura_seq,
                        'tit_transacao'   : objConta.tit_transacao,
                        'fin_bol_email'   : objConta.tit_transacao.tra_email_destino,
                        'fin_cad_cod_cad' : objConta.tit_venda.fin_cad_cod_cad
                    };

                    FinanceiroService.boleto.segundaVia(objBoleto, function(retorno) {
                        if (retorno.records) {

                            var arrRetorno = retorno.records;
                            if (arrRetorno.error) {

                                GeralFactory.notify('danger', 'Atenção!', arrRetorno.msg);
                                $scope.getTransacao(objConta.tit_transacao.tra_cod_tra);

                            } else {

                                if (! _.isEmpty(arrRetorno.response.data)) {

                                    $scope.getTransacao(retorno.records.tra_cod_tra);
                                    $timeout(function() {
                                        var url = arrRetorno.response.data.link;
                                        $window.open(url, 'Boleto Bancário');
                                    });
                                }
                            }
                        }
                    });
                });
            };

            /**
             * Método responsável em verificar se existe a necessidade de atualizar os dados do boleto
             * bancário, apenas quando a data de vencimento do mesmo é alterada.
             */
            $scope.salvarBoleto = function() {

                var objConta = $scope.objConta;
                $timeout(function() {

                    var vencimento = $scope.getObjetoData(objConta.tit_dat_vct);
                    var objBoleto  = {
                        'tit_fin_nro_lan' : objConta.tit_fin_nro_lan,
                        'tit_fatura_seq'  : objConta.tit_fatura_seq,
                        'tit_dat_vct'     : GeralFactory.getDataFormatadaBanco(new Date(vencimento.ano, vencimento.mes, vencimento.dia))
                    };

                    FinanceiroService.boleto.salvar(objBoleto, function(retorno) {
                        if (! _.isEmpty(retorno.records)) {

                            var objMensagem = {};
                            if (! retorno.records.error) {

                                $scope.getTransacao(retorno.records.tra_cod_tra);
                                objMensagem = {
                                    'tipo' : 'info',
                                    'msg'  : 'Este título contém um boleto gerado e a dt. de vencimento do mesmo foi atualizada!'
                                };
                            } else {

                                objMensagem = {
                                    'tipo' : 'danger',
                                    'msg'  :  retorno.records.msg
                                };
                            }

                            console.log('Dados do boleto atualizado: ', retorno.records);
                            GeralFactory.notify(objMensagem.tipo, 'Atenção:', objMensagem.msg);
                        }
                    });
                });
            };

            /**
             * Método responsável em retornar os dados de uma determinada transação para acoplar a mesma
             * no objeto de um determinado título escolhido pelo usuário.
             */
            $scope.getTransacao = function(traCodTra) {

                if (traCodTra) {

                    FinanceiroService.boleto.get({tra_cod_tra : traCodTra}, function(retorno) {
                        var objTransacao = retorno.records;
                        if (objTransacao) {
                            $timeout(function() {

                                $scope.objConta.tit_transacao = objTransacao;
                                console.log('Dados da transação gerada: ', objTransacao);
                            })
                        }
                    });
                }
            };

            /**
             * Método responsável em abrir a janela modal contendo o formulário para o
             * usuário efetuar o pagamento parcial para um determinado título.
             */
            $scope.pgtoParcial = function() {

                if ($scope.objConta.tit_fatura_seq && $scope.objConta.tit_fin_nro_lan) {

                    var scope = $rootScope.$new();

                    scope.params = {};
                    scope.params.objConta = $scope.objConta;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'financeiro/views/pgto-parcial.html',
                        controller  : 'FinanceiroPgtoParcialModalCtrl',
                        windowClass : 'center-modal',
                        backdrop    : 'static',
                        scope       :  scope,
                        resolve     :  {
                            getEnd: function() { }
                        }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'cancel') {
                            if (modalInstance.hasAlteracao) {

                                $scope.objConta = modalInstance.objContaNovo;
                                $scope.calcular(true);

                                $timeout(function() {
                                    $scope.salvarConta();
                                }, 500);
                            }
                        }
                    });
                }
            };

            /**
             * Método responsável em verificar se o botão para gerar o boleto pode ser mostrado
             * na tela para o usuário do financeiro da aplicação.
             */
            $scope.hasBoleto = function() {

                // Apenas para títulos já criados:
                if ($scope.objConta.tit_fin_nro_lan && $scope.objConta.tit_fatura_seq) {

                    // Apenas para títulos a receber (receitas) e forma de pagamento igual a boleto bancário:
                    if ($scope.objConta.tit_sistema === 1 && $scope.objConta.tit_is_boleto === true) {

                        // Apenas para títulos que não estejam faturados:
                        if ($scope.objConta.tit_faturado === 0 || $scope.objConta.tit_faturado === null) {

                            return true;
                        }
                    }
                }

                return false;
            };

            /**
             * Spinner para a tela do financeiro.
             */
            $scope.spinner = {
                active : false,
                on  : function() {
                    this.active = true;
                },
                off : function() {
                    this.active = false;
                }
            };

            /**
             * Metodo responsavel em abrir a janela modal para ediçao dos dados um
             * determinado cliente ou fornecedor.
             */
            $scope.getJanelaCliente = function(cad_cod_cad) {

                var scope = $rootScope.$new();
                scope.params = {};

                if (cad_cod_cad) {

                    scope.params.cad_cod_cad = cad_cod_cad;
                    scope.params.str_titular = $scope.objPesquisa.sistema === 1 ? 'cliente' : 'fornecedor';

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'cliente/views/janela-cliente.html',
                        controller  : 'ClienteModalCtrl',
                        size        : 'lg',
                        windowClass : 'center-modal no-top-modal',
                        scope       :  scope,
                        resolve     :  {}
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (modalInstance.hasAlteracao) {

                            $scope.getPessoa(cad_cod_cad);
                            $scope.objConta.pessoa = modalInstance.objClienteClone.cad_nome_razao;
                        }
                    });
                }
            };

            /**
             * Método responsável em selecionar ou desfazer a seleção de uma determinada conta
             * escolhida pelo usuário para as ações em cascata (remover, quitar, etc.).
             */
            $scope.selecionar = function(evento, objConta) {

                evento.stopPropagation();
                $scope.verificarItem(objConta) ? $scope.arrSelecionados.splice($scope.$index, 1) : $scope.arrSelecionados.push(objConta);
            };

            /**
             * Método responsável em selecionar ou desmarcar todos os registros da GRID de títulos
             * conforme a escolha do usuário para a quitação em lote dos mesmos.
             */
            $scope.selecionarTodos = function() {

                var arrTitulos = $scope.arrContas;
                if (arrTitulos.length) {

                    if ($scope.chkSelecionados) {

                        $scope.clearSelecionados();

                    } else {
                        angular.forEach(arrTitulos, function(objeto) {
                            var isSelecionado = $scope.verificarItem(objeto);
                            isSelecionado === false && $scope.arrSelecionados.push(objeto);
                        });

                        $scope.chkSelecionados = true;
                        GeralFactory.checkTableInputs('grid-contas');
                    }
                }
            };

            /**
             * Método responsável em verificar se uma determinada conta já se encontra
             * no vetor de escolhas efetuadas pelo usuário da aplicação.
             */
            $scope.verificarItem = function(objeto) {

                if (! GeralFactory.isObjEmpty(objeto)) {

                    var qtdeSelecionados = $scope.arrSelecionados.length;
                    if (qtdeSelecionados > 0) {

                        var retorno = false;
                        $scope.$index = null;

                        angular.forEach($scope.arrSelecionados, function(o, i) {
                            if (retorno === false) {
                                if (o.tit_cod_emp == objeto.tit_cod_emp && o.tit_fatura_seq == objeto.tit_fatura_seq && o.tit_fin_nro_lan == objeto.tit_fin_nro_lan) {

                                    retorno = true;
                                    $scope.$index = i;
                                }
                            }
                        });

                        return retorno;
                    }
                }

                return false;
            };

            /**
             * Método responsável em retornar o background color de acordo com cada registro
             * da GRID de contas verificando se os mesmos estão selecionados.
             */
            $scope.isSelecionado = function(objConta) {

                var strRetorno = '', arrTitulos = $scope.arrSelecionados;
                if (arrTitulos.length) {

                    var keepGoing = true;
                    angular.forEach(arrTitulos, function(o) {
                        if (keepGoing) {
                            if (o.tit_fin_nro_lan == objConta.tit_fin_nro_lan && o.tit_cod_emp == objConta.tit_cod_emp && o.tit_fatura_seq == objConta.tit_fatura_seq) {

                                keepGoing  = false;
                                strRetorno = 'bg-amarelo';
                            }
                        }
                    });
                }

                return strRetorno;
            };

            /**
             * Método responsável em quitar ou receber todas os títulos selecionados pelo
             * usuário da aplicação através da GRID de contas.
             */
            $scope.triggerAcaoTodos = function() {

                $scope.triggerAcaoLoading = true;

                var arrSelecao = $scope.filtrarTitulos();
                if (arrSelecao.length) {

                    var objeto = {
                        selecao  : arrSelecao,
                        operacao : $scope.objConta.operacao
                    };

                    FinanceiroService.financas.batch(objeto, function(retorno) {
                        if (retorno.records) {

                            $scope.triggerAcaoLoading = false;
                            $timeout(function() {
                                $scope.listarConta();
                                $scope.clearSelecionados();
                            });
                        }
                    });
                } else {

                    $scope.triggerAcaoLoading = false;
                    GeralFactory.notify('warning', 'Atenção:', 'Selecione ao menos um título ou verifique se os títulos já estão faturados!');
                }
            };

            /**
             * Método responsável em desmarcar os registros selecionados, assim como limpar
             * o vetor que armazena os mesmos para manipulação da tela.
             */
            $scope.clearSelecionados = function() {

                $scope.arrSelecionados = [];
                $scope.chkSelecionados = false;
                GeralFactory.clearTableInputs('grid-contas', 'checkbox');
            };

            /**
             * Método responsável em retornar apenas os títulos válidos selecionados pelo
             * usuário para a quitação ou recebimento em lote.
             */
            $scope.filtrarTitulos = function() {

                var arrTitulos = $scope.arrSelecionados, arrRetorno = [];
                if (arrTitulos.length) {

                    angular.forEach(arrTitulos, function(item) {
                        if (item.tit_faturado !== 3 && item.tit_sistema === parseInt($scope.objPesquisa.sistema)) {

                            arrRetorno.push({
                                'tit_cod_emp'     : item.tit_cod_emp,
                                'tit_fatura_seq'  : item.tit_fatura_seq,
                                'tit_fin_nro_lan' : item.tit_fin_nro_lan
                            })
                        }
                    });
                }

                return arrRetorno;
            };

            /**
             * Método responsável em abrir a janela modal para inserção ou atualização de uma
             * determinada conta financeira por parte do usuário da aplicação.
             */
            $scope.openModalContaFinanceira = function(par_pai) {

                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.par_pai = (par_pai) ? par_pai : null;

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'financeiro/views/janela-ctf.html',
                    controller  : 'FinanceiroCtfModalCtrl',
                    windowClass : 'center-modal',
                    backdrop    : 'static',
                    scope       :  scope
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'reload' && modalInstance.hasAlteracao) {

                        scope.$destroy();
                        if (par_pai) {

                            var arrContaFinanceiras = $scope.arrContasFinanceiras;
                            if (arrContaFinanceiras.length) {

                                var keepGoing = true;
                                angular.forEach($scope.arrContasFinanceiras, function(item, chave) {

                                    if (keepGoing) {
                                        var codPai = parseInt(item.par_pai);
                                        if (codPai === par_pai) {

                                            $scope.arrContasFinanceiras[chave]['par_c01'] = modalInstance.objContaFinanceira.par_c01;
                                            keepGoing = false;
                                        }
                                    }
                                });
                            }
                        } else {

                            $timeout(function() {
                                console.log('Listar novamente as contas financeiras!');
                                $scope.listarContasFinanceiras();
                            });
                        }
                    }
                });
            };

            /**
             * Método responsável em abrir a janela modal contendo o formulário para
             * cadastro de uma nova transferência entre contas.
             */
            $scope.openModalTransferencia = function() {

                var scope = $rootScope.$new();
                scope.params = {};

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'financeiro/views/janela-transferencia.html',
                    controller  : 'TransferenciaModalCtrl',
                    windowClass : 'center-modal',
                    backdrop    : 'static',
                    size        : 'lg',
                    scope       :  scope
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'reload') {

                        scope.$destroy();
                        if (modalInstance.hasAlteracao) {

                            $scope.listarTrigger();
                        }
                    }
                });
            };
        }
    ]);