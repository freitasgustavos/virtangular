'use strict';

angular.module('newApp')

    .controller('ConciliacaoCtrl', [

        '$scope', '$rootScope', '$uibModal', '$timeout', 'GeralFactory', 'FinanceiroService', 'MidiaService', 'prompt', '$sce', 'StaticFactories', 'Wizard',

        function ($scope, $rootScope, $uibModal, $timeout, GeralFactory, FinanceiroService, MidiaService, prompt, $sce, StaticFactories, Wizard) {
            
            $rootScope.hasAutorizacao();

            $scope.forms           = {};
            $scope.objPesquisa     = {};
            $scope.objBancoConta   = {};
            $scope.arrExtratoBanco = {};
            $scope.arrExtratoFinan = {};
            $scope.arrExtratoClone = {};
            $scope.arrBancoContas  = [];

            $scope.codAcaoPrincipal = 11;
            $scope.objSelecionados  = {
                vlrResidual   : 0.0,
                objBancario   : {},
                arrFinanceiro : []
            };

            $scope.objTotalizador = {
                extBancario   : 0.0,
                extFinanceiro : 0.0
            };

            $scope.$on('$viewContentLoaded', function() {

                $scope.$index   = null;
                $scope.$loader  = true;
                $scope.$angular = angular;

                $scope.setPesquisa();
                $scope.getContaBancaria();

                $scope.objPopover = {
                    title       : 'Filtrar por Datas:',
                    templateUrl : 'tplPopover.html'
                };

                $timeout(function () {
                    Wizard.loadWizards.initialize(40);
                }, 2000);
            });

            /**
             * Método responsável em inicializar os dados para pesquisa contendo os principais
             * dados da conta financeira escolhida pelo usuário dentre outros.
             */
            $scope.setPesquisa = function() {

                var descSituacao   = 'TU';
                var dtLancamento   = GeralFactory.getDataAtualBr();
                $scope.objPesquisa = {
                    'con_status_con' : descSituacao,
                    'con_dat_lan'    : dtLancamento
                };
            };

            /**
             * Método responsável em efetuar a pesquisa dos extratos financeiro e bancário conforme
             * a situação escolhida pelo usuário na tela de conciliação.
             */
            $scope.setStatus = function(status) {

                $scope.voltarListagem();
                $scope.objPesquisa['con_status_con'] = status;

                if (status === 'TU') {

                    $timeout(function() {
                        $scope.listarConciliacao();
                        $scope.closePopover();
                    });
                } else {

                    $timeout(function() {
                        $scope.filtrarExtratoBanco();
                        $scope.filtrarExtratoFinan();
                    }, 500);
                }
            };

            /**
             * Método responsável em recolher os dados da conta bancária padrão do usuário para
             * posteriormete listar os extratos financeiro e bancário do mesmo.
             */
            $scope.getContaBancaria = function() {

                FinanceiroService.banco.getDefault({}, function(retorno) {
                    var arrRecords = retorno.records;
                    if (arrRecords.error) {

                        $scope.resetConciliacao();
                        GeralFactory.notify('warning', 'Atenção!', arrRecords.msg);

                    } else {

                        var objContaBanco = arrRecords.response;

                        $scope.objPesquisa['bco_cod_bco']        = objContaBanco.bco_cod_bco;
                        $scope.objPesquisa['con_5010_conta_fin'] = objContaBanco.bco_5010_conta_fin;

                        $scope.objBancoConta = objContaBanco;
                        $timeout(function() {
                            $scope.getBanco();
                            $scope.listarByData('P');
                        }, 1000);

                        /**
                         * $scope.initConciliacao();
                         * console.log('Dados da conta: ', $scope.objBancoConta);
                         */
                    }
                });
            };

            /**
             * Método responsável em inicializar as principais variáveis de escopo contidas
             * na tela de conciliação bancária.
             */
            $scope.resetConciliacao = function() {

                $scope.arrExtratoBanco = [];
                $scope.arrExtratoFinan = [];
                $scope.arrExtratoClone = {};

                $scope.codAcaoPrincipal = 11;
                $scope.objSelecionados  = {
                    vlrResidual   : 0.0,
                    objBancario   : {},
                    arrFinanceiro : []
                };

                $scope.objTotalizador = {
                    extBancario   : 0.0,
                    extFinanceiro : 0.0
                };
            };

            /**
             * Método responsável em recolher os dados (descrição, código e logomarca) do banco de
             * acordo com o registro da conta bancária do usuário.
             */
            $scope.getBanco = function() {

                if (! GeralFactory.isObjEmpty($scope.objBancoConta)) {

                    var keepGoing = true;
                    angular.forEach(StaticFactories.BANCOS, function(item, chave) {
                        if (keepGoing) {
                            if (item.ban_cod_ban === $scope.objBancoConta.bco_cod_banco) {
                                $scope.objBancoConta.banco = item;
                                keepGoing = false;
                            }
                        }
                    });
                }
            };

            /**
             * Método responsável em inicializar a conciliação chamando a função que
             * verifica os dados da API hubx na nossa base de dados.
             */
            $scope.initConciliacao = function() {

                var objConta = $scope.objPesquisa;
                $scope.sincronizarConciliacaoLoading = true;

                FinanceiroService.conciliacao.create(objConta, function(retorno) {
                    if (retorno.records.error) {

                        GeralFactory.confirmar('Não foi possível efetuar a conexão com o banco escolhido! Tentar novamente?', function() {

                            $scope.initConciliacao();

                        }, '', function() {

                            var mensagem = retorno.records.msg;
                            mensagem && GeralFactory.notify('danger', 'Atenção!', retorno.records.msg);

                            $scope.resetConciliacao();
                            $timeout(function() {

                                ! _.isEmpty(retorno.records.response) && $scope.listarByData('P');
                                $scope.sincronizarConciliacaoLoading = false;

                            }, 1000);

                        }, 'Não', 'Sim');

                    } else {
                        if (retorno.records.hasOwnProperty('warning')) {

                            $scope.sincronizarConciliacaoLoading = false;
                            GeralFactory.notify('warning', 'Atenção!', retorno.records.msg);

                        } else {

                            $timeout(function() {
                                $scope.triggerConciliacao();
                                $scope.sincronizarConciliacaoLoading = false;
                                if (retorno.records.type === 'OFX') {

                                    var mensagem = 'Caro usuário, a importação do extrato bancário referente ao arquivo .OFX foi realizada com sucesso!';
                                    GeralFactory.notify('info', 'Aviso:', retorno.records.msg);
                                }
                            });
                        }
                    }
                });

            };

            /**
             * Método responsável em verificar se o usuário deseja efetuar a conciliação do extrato
             * bancário com o extrato financeiro de maneira automática.
             */
            $scope.triggerConciliacao = function() {

                $timeout(function() {
                    $scope.listarByData('P');
                });
            };

            /**
             * Método responsável em listar o extrato bancário e os títulos do usuário já efetuando
             * a verificação de conciliação entre os dados de ambos.
             */
            $scope.listarConciliacao = function() {

                $scope.spinner.on();
                var strFiltro = $scope.getPesquisa();

                FinanceiroService.conciliacao.extrato({u : strFiltro}, function(retorno) {
                    if (retorno.records.error) {

                        $scope.resetConciliacao();

                    } else {

                        var arrResponse = retorno.records.response;
                        $scope.finalizarListagem(arrResponse);
                    }

                    $timeout(function() {
                        $scope.spinner.off();
                    }, 2000);
                });
            };

            /**
             * Método responsável em inicializar os componentes da tela de acordo com o resultado
             * da pesquisa efetuada pelo usuário no extrato de conciliação.
             */
            $scope.finalizarListagem = function(arrRetorno) {

                $timeout(function() {

                    $scope.arrExtratoClone = arrRetorno.array;
                    $scope.arrExtratoBanco = arrRetorno.array.arr_000;
                    $scope.arrExtratoFinan = arrRetorno.array.arr_001;
                    $scope.objTotalizador.extBancario = arrRetorno.total.tot_000;

                });
            };

            /**
             * Método responsável em voltar para a listagem principal da tela contendo todos os
             * títulos da tabela de extrato financeiro do lojista virtual.
             */
            $scope.voltarListagem = function() {

                GeralFactory.clearTableInputs('grid-eb', 'radio');

                $scope.codAcaoPrincipal = 11;
                $scope.objSelecionados  = {
                    vlrResidual   : 0.0,
                    objBancario   : {},
                    arrFinanceiro : []
                };
            };

            /**
             * Método responsável em retornar uma string contendo todas as informações de filtro
             * para listagem dos lançamentos e extratos tudo já devidamente formatado.
             */
            $scope.getPesquisa = function(objAdicional) {

                var objPesquisa = angular.copy($scope.objPesquisa);

                objAdicional && Object.assign(objPesquisa, objAdicional);

                objPesquisa['con_dat_lan'] = GeralFactory.getDataAtual(objPesquisa['con_dat_lan']);

                if (objPesquisa['con_tit_dat_lan_end'])
                    objPesquisa['con_tit_dat_lan_end'] = GeralFactory.getDataAtual(objPesquisa['con_tit_dat_lan_end']);

                if (objPesquisa['con_tit_dat_lan_init'])
                    objPesquisa['con_tit_dat_lan_init'] = GeralFactory.getDataAtual(objPesquisa['con_tit_dat_lan_init']);

                return GeralFactory.formatarPesquisar(objPesquisa);
            };

            /**
             * Método responsável em retornar o background color de acordo com a conciliação de
             * cada item dependendo da GRID de visulização: Extrato Bancário ou Financeiro.
             */
            $scope.getBackground = function(objItem, tipo) {

                var retorno = '';
                switch (tipo) {
                    case 'EB':
                        retorno = (objItem.con_titulos) ? 'bg-azul' : 'bg-vermelho';
                        if (! GeralFactory.isObjEmpty($scope.objSelecionados.objBancario) &&
                                objItem.con_cod_con === $scope.objSelecionados.objBancario.con_cod_con) {
                            retorno = 'bg-amarelo';
                        }
                        break;

                    case 'EF':
                    case 'EO':
                        retorno = (objItem.tit_con_cod_con === null) ? 'bg-vermelho' : 'bg-azul';

                        var arrFinancas = $scope.objSelecionados.arrFinanceiro;
                        if (arrFinancas.length) {
                            var keepGoing = true;
                            angular.forEach(arrFinancas, function(item, chave) {
                                if (keepGoing) {
                                    if (item.tit_fin_nro_lan === objItem.tit_fin_nro_lan &&
                                            item.tit_cod_emp === objItem.tit_cod_emp && item.tit_fatura_seq === objItem.tit_fatura_seq) {
                                        retorno = 'bg-amarelo';
                                        keepGoing = false;
                                    }
                                }
                            });
                        }
                        break;
                }
                return retorno;
            };

            /**
             * Método responsável em verificar a ação principal da tela conforme a escolhe de um
             * determinado registro da tabela de extrato bancário.
             */
            $scope.setAcaoPrincipal = function(objItem) {

                $scope.codAcaoPrincipal = (objItem.con_titulos) ? 22 : 99;

                console.log('Ação: ', $scope.codAcaoPrincipal);
            };

            /**
             * Método responsável em selecionar um determinado item da tabela de extrato financeiro
             * ou da tabela de extrato bancário para posteriormete efetuar a conciliação.
             */
            $scope.setSelecionado = function(objItem, tipo) {

                switch (tipo) {

                    case 'EB':
                        var vlrItem = parseFloat(objItem.con_doc_vlr_dec);
                        $scope.setAcaoPrincipal(objItem);
                        $scope.objSelecionados  = {
                            vlrResidual   : vlrItem,
                            objBancario   : objItem,
                            arrFinanceiro : new Array()
                        };
                        break;

                    case 'EF':
                    case 'EO':
                        if (GeralFactory.isObjEmpty($scope.objSelecionados.objBancario)) {

                            var mensagem = 'Caro usuário, primeiramente é necessário escolher um registro da conta financeira!';
                            GeralFactory.notify('warning', 'Atenção!', mensagem);

                        } else {

                            // Não permite escolher títulos financeiros já conciliados:
                            var acao = $scope.codAcaoPrincipal;
                            if (acao === 99 && objItem.tit_con_cod_con) {

                                var mensagem = 'Caro usuário, o título escolhido já se encontra conciliado, por gentileza escolha outro!';
                                GeralFactory.notify('warning', 'Atenção!', mensagem);

                            } else {

                                // Verifica se o item escolhido já esta empilhado:
                                if (! $scope.getVerificaItem(objItem)) {

                                    $scope.calcularResidual(objItem, 'diff');
                                    $scope.objSelecionados.arrFinanceiro.push(objItem);

                                } else {

                                    $timeout(function() {
                                        $scope.calcularResidual(objItem, 'sum');
                                        $scope.objSelecionados.arrFinanceiro.splice($scope.$index, 1);
                                    });
                                }
                            }
                        }
                        break;
                }

                console.log('Selecionados [' + tipo + ']: ', $scope.objSelecionados);
            };

            /**
             * Método responsável em verificar se os registros conciliados da tabela de extrato
             * financeiro serão mostrados para o usuário da aplicação.
             */
            $scope.mostrarItemExtrato = function(objItem) {

                if ($scope.codAcaoPrincipal === 99) {
                    var codConciliacao = objItem.tit_con_cod_con;
                    if (codConciliacao !== null) {

                        return false;
                    }
                }

                return true;
            };

            /**
             * Método responsável em calcular o valor residual entre o registro bancário escolhido
             * e os títulos financeiros escolhidos pelo usuário na tela.
             */
            $scope.calcularResidual = function(objItem, operacao) {

                var vlrCalc = 0.0;
                var vlrItem = parseFloat(objItem.tit_doc_vlr_bruto);

                switch (operacao) {
                    case 'sum':
                        vlrCalc = $scope.objSelecionados.vlrResidual + vlrItem;
                        break;

                    case 'diff':
                        vlrCalc = $scope.objSelecionados.vlrResidual - vlrItem;
                        break;
                }

                // Cálculo do valor residual:
                $scope.objSelecionados.vlrResidual = vlrCalc;
            };

            /**
             * Método responsável em verificar se um determinado item do extrato financeiro já
             * se encontra no vetor de escolhas efetuadas pelo usuário.
             */
            $scope.getVerificaItem = function(objItem) {

                if (! GeralFactory.isObjEmpty(objItem)) {

                    var qtde = $scope.objSelecionados.arrFinanceiro.length;
                    if (qtde > 0) {

                        var flag = false;
                        $scope.$index = null;

                        angular.forEach($scope.objSelecionados.arrFinanceiro, function(item, chave) {
                            if (! flag) {
                                if (item.tit_cod_emp === objItem.tit_cod_emp &&
                                        item.tit_fatura_seq === objItem.tit_fatura_seq &&
                                            item.tit_fin_nro_lan === objItem.tit_fin_nro_lan) {

                                    flag = true;
                                    $scope.$index = chave;
                                }
                            }
                        });
                        return flag;
                    }
                }
                return false;
            };

            /**
             * Método responsável em verificar a quantidade de títulos financeiros do sistema que o usuário
             * da aplicação selecionou, pois esta mesma não pode ser igual a zero.
             */
            $scope.getVerificaQtdeTitulos = function() {

                var qtde = $scope.objSelecionados.arrFinanceiro.length;
                if (qtde === 0) {

                    var mensagem = 'Caro usuário, é necessário escolher um registro na listagem de títulos financeiros do sistema!';
                    return {
                        'error' : true,
                        'msg'   : mensagem
                    }
                }

                return {'error' : false};
            };

            /**
             * Método responsável em desfazer a conciliação entre um determinado título do extrato
             * bancário e um determinado título lançado no financeiro do sistema.
             */
            $scope.desfazerConciliacao = function() {

                var objVerifica = $scope.getVerificaQtdeTitulos();
                if (! objVerifica.error) {

                    var vlrResidual = parseFloat($scope.objSelecionados.vlrResidual);
                    if (vlrResidual > 0) {

                        var mensagem = 'Caro usuário, para concluir o processo de desconciliação o valor residual deve ser zero!';
                        GeralFactory.notify('warning', 'Atenção!', mensagem);

                    } else {

                        GeralFactory.confirmar('Deseja realmente desfazer esta conciliação?', function() {

                            $scope.desfazerConciliacaoLoading = true;
                            var objeto = {
                                '000' : $scope.objSelecionados.objBancario,
                                '001' : $scope.objSelecionados.arrFinanceiro
                            };

                            FinanceiroService.conciliacao.desfazer(objeto, function(retorno) {
                                if (retorno.records) {

                                    $scope.desfazerConciliacaoLoading = false;
                                    $timeout(function() {
                                        $scope.voltarListagem();
                                        $scope.listarConciliacao();
                                    }, 2000);
                                }
                            });
                        });
                    }
                } else {

                    GeralFactory.notify('warning', 'Atenção!', objVerifica.msg);
                }
            };

            /**
             * Método responsável em efetuar a conciliação de um ou mais títulos financeiros
             * escolhidos pelo usuário da aplicação.
             */
            $scope.salvarConciliacao = function() {

                var objVerifica = $scope.getVerificaQtdeTitulos();
                if (! objVerifica.error) {

                    // Conciliação direta, um para um com valor residual exato:
                    if ($scope.objSelecionados.vlrResidual === 0) {

                        GeralFactory.confirmar('Deseja quitar e confirmar a conciliação?', function() {

                            $scope.salvarConciliacaoLoading = true;
                            var objeto = {
                                '000' : $scope.objSelecionados.objBancario,
                                '001' : $scope.objSelecionados.arrFinanceiro
                            };

                            FinanceiroService.conciliacao.conciliar(objeto, function(retorno) {
                                if (retorno.records) {

                                    $scope.salvarConciliacaoLoading = false;
                                    $timeout(function() {
                                        $scope.voltarListagem();
                                        $scope.listarConciliacao();
                                    }, 2000);
                                }
                            });
                        });
                    } else {

                        var scope = $rootScope.$new();

                        scope.params = {};
                        scope.params.objSelecionados = angular.copy($scope.objSelecionados);

                        var modalInstance = $uibModal.open({
                            animation   :  true,
                            templateUrl : 'financeiro/views/janela-conciliacao.html',
                            controller  : 'ConciliacaoModalCtrl',
                            windowClass : 'center-modal',
                            backdrop    : 'static',
                            scope       :  scope,
                            resolve     :  { }
                        });

                        modalInstance.result.then(function(id) { }, function(msg) {

                            if (msg === 'reload' && modalInstance.hasAlteracoes) {
                                scope.$destroy();
                                $scope.voltarListagem();
                                $scope.listarConciliacao();
                            }
                        });
                    }
                } else {

                    GeralFactory.notify('warning', 'Atenção!', objVerifica.msg);
                }
            };

            /**
             * Método responsável em criar uma nova conciliação de um registro do extrato bancário
             * que não tenha lançado no extrato do financeiro do lojista.
             */
            $scope.criarConciliacao = function() {

                var qtde = $scope.objSelecionados.arrFinanceiro.length;
                if (qtde === 0) {

                    var scope = $rootScope.$new();

                    scope.params = {};
                    scope.params.objSelecionados = angular.copy($scope.objSelecionados);

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'financeiro/views/janela-criar-conciliacao.html',
                        controller  : 'CriarConciliacaoModalCtrl',
                        windowClass : 'center-modal',
                        backdrop    : 'static',
                        scope       :  scope,
                        resolve     :  { }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'reload' && modalInstance.hasAlteracoes) {
                            scope.$destroy();
                            $scope.voltarListagem();
                            $scope.listarConciliacao();
                        }
                    });
                }
            };

            /**
             * Método responsável em efetuar a transferência entre contas para um determinado registro
             * bancário e logo em seguida finalizar a conciliação do mesmo.
             */
            $scope.transferir = function() {

                var qtde = $scope.objSelecionados.arrFinanceiro.length;
                if (qtde === 0) {

                    var scope = $rootScope.$new();

                    scope.params = {};
                    scope.params.objBancario = angular.copy($scope.objSelecionados.objBancario);

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'financeiro/views/janela-transferencia-conciliacao.html',
                        controller  : 'TransferenciaConciliacaoModalCtrl',
                        windowClass : 'center-modal',
                        backdrop    : 'static',
                        size        : 'lg',
                        scope       :  scope,
                        resolve     :  { }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'reload' && modalInstance.hasAlteracoes) {
                            scope.$destroy();
                            $scope.voltarListagem();
                            $scope.listarConciliacao();
                        }
                    });
                }
            };

            /**
             * Método responsável em filtrar apenas os registros BANCÁRIOS de acordo com a
             * situação escolhida pelo usuário na tela de conciliação.
             */
            $scope.filtrarExtratoBanco = function() {

                var arrRetorno = [];
                var arrExtrato = _.isEmpty($scope.arrExtratoClone) ? [] : $scope.arrExtratoClone.arr_000;

                if (arrExtrato.length) {

                    var status = $scope.objPesquisa['con_status_con'];
                    angular.forEach(arrExtrato, function(item) {

                        var hasArrTitulo = item.hasOwnProperty('con_titulos');
                        switch (status)
                        {
                            case 'CO':
                                (hasArrTitulo) && arrRetorno.push(item);
                                break;
                            case 'NC':
                                (!hasArrTitulo) && arrRetorno.push(item);
                                break;
                        }
                    });
                }

                // Atribuindo a nova listagem do extrato BANCÁRIO de acordo com a situação:
                $scope.arrExtratoBanco = arrRetorno;
            };

            /**
             * Método responsável em filtrar apenas os registros FINANCEIROS do sistema de acordo
             * com a situação escolhida pelo usuário na tela de conciliação.
             */
            $scope.filtrarExtratoFinan = function() {

                var arrAuxiliar = [];
                var arrTitulos  = _.isEmpty($scope.arrExtratoClone) ? [] : $scope.arrExtratoClone.arr_001;

                if (arrTitulos.length) {

                    var status = $scope.objPesquisa['con_status_con'];
                    angular.forEach(arrTitulos, function(item) {

                        var codigo = item.tit_con_cod_con;
                        switch (status)
                        {
                            case 'CO':
                                (codigo) && arrAuxiliar.push(item);
                                break;
                            case 'NC':
                                (!codigo) && arrAuxiliar.push(item);
                                break;
                        }
                    });
                }

                // Atribuindo a nova listagem do extrato FINANCEIRO de acordo com a situação:
                $scope.arrExtratoFinan = arrAuxiliar;
            };

            /**
             * Método responsável em abrir a janela modal contendo o formulário de edição
             * e cadastro de um banco na base de dados
             */
            $scope.openJanelaBanco = function(codBcoCod) {

                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.cobAutomatica = false;
                scope.params.objBancoConta = codBcoCod ? angular.copy($scope.objBancoConta) : null;

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'financeiro/views/janela-banco.html',
                    controller  : 'ConciliacaoModalBancoCtrl',
                    windowClass : 'center-modal',
                    backdrop    : 'static',
                    size        : 'lg',
                    scope       :  scope,
                    resolve     :  { }
                });

                modalInstance.result.then(function(id) { }, function(msg) {

                    if (msg === 'reload' && modalInstance.hasAlteracoes) {
                        scope.$destroy();

                        var objConta   = modalInstance.objRetorno;
                        objConta.banco = StaticFactories.BANCOS[((objConta.bco_cod_banco === 101) ? 14 : objConta.bco_cod_banco - 1)];

                        var qtdeContas = $scope.arrBancoContas.length;
                        switch (modalInstance.strAcao)
                        {
                            case 'cancel':
                                // Remover a conta bancária do objeto:
                                if (qtdeContas > 0) {
                                    var kg1 = true;
                                    angular.forEach($scope.arrBancoContas, function(item, chave) {
                                        if (kg1) {
                                            if (item.bco_cod_bco === objConta.bco_cod_bco) {
                                                $scope.arrBancoContas.splice(chave, 1);
                                                kg1 = false;
                                            }
                                        }
                                    });
                                }

                                prompt({
                                    title   : 'Informação',
                                    message : 'Os dados da sua conta bancária mais atinga serão carregados.',
                                    buttons : [{
                                        label   : 'Ok',
                                        primary : true
                                    }]
                                }).then(function(result) {
                                    $timeout(function() {

                                        $scope.setPesquisa();
                                        $scope.getContaBancaria();

                                    }, 1000);
                                });
                                break;

                            case 'create':
                                // Adiciona a nova conta bancária no objeto:
                                $scope.arrBancoContas.push(objConta);
                                $scope.alterarContaBancaria(objConta, 'Caro usuário, deseja carregar os dados da nova conta bancária?');
                                break;

                            case 'update':
                                // Atualizar os dados da conta bancária no objeto:
                                $scope.objBancoConta = objConta;
                                if (qtdeContas > 0) {
                                    var kg2 = true;
                                    angular.forEach($scope.arrBancoContas, function(item, chave) {
                                        if (kg2) {
                                            if (item.bco_cod_bco === objConta.bco_cod_bco) {
                                                $scope.arrBancoContas[chave] = objConta;
                                                kg2 = false;
                                            }
                                        }
                                    });
                                }
                                break;
                        }
                    }
                });
            };

            /**
             * Método responsável em listar todas as contas bancárias existentes na base de dados
             * quando um determinado usuário solicitar.
             */
            $scope.getBancoContas = function() {

                if ($scope.$loader) {
                    $timeout(function() {
                        FinanceiroService.banco.list({}, function(retorno) {
                            if (retorno.records) {

                                var arrBancos = [];
                                if (retorno.records.response.length) {

                                    arrBancos = retorno.records.response;
                                    angular.forEach(arrBancos, function(item, chave) {
                                        if (item.bco_cod_banco) {

                                            var objBanco = StaticFactories.BANCOS[((item.bco_cod_banco === 101) ? 14 : item.bco_cod_banco - 1)];
                                            arrBancos[chave].banco = objBanco;
                                        }
                                    });
                                }

                                $scope.$loader = false;
                                $scope.arrBancoContas = arrBancos;
                            }
                        });
                    }, 1000);
                }
            };

            /**
             * Método responsável em selecionar uma determinada conta bancária escolhida pelo
             * usuário da aplicação para carregar os extratos bancário e financeiro.
             */
            $scope.alterarContaBancaria = function(objBancoConta, strPergunta) {

                if (! GeralFactory.isObjEmpty(objBancoConta)) {

                    strPergunta = strPergunta || 'Caro usuário, deseja carregar os dados da conta bancária selecionada?';
                    GeralFactory.confirmar(strPergunta, function() {

                        var dtLancamento = GeralFactory.getDataAtualBr();

                        $scope.objPesquisa['con_dat_lan']        = dtLancamento;
                        $scope.objPesquisa['bco_cod_bco']        = objBancoConta.bco_cod_bco;
                        $scope.objPesquisa['con_5010_conta_fin'] = objBancoConta.bco_5010_conta_fin;

                        $timeout(function() {
                            $scope.objBancoConta = objBancoConta;
                            if (objBancoConta.bco_midia) {

                                $scope.initConciliacao();
                                objBancoConta.bco_midia['mid_status'] = 0;

                            } else {

                                $scope.listarByData('P');
                            }
                        }, 1000);
                    });
                }
            };

            /**
             * Método responsável em abrir a janela modal para upload do arquivo OFX
             * para importação dos dados bancários do usuário.
             */
            $scope.openJanelaUpload = function() {

                var objConta = $scope.objBancoConta;
                if (! _.isEmpty(objConta)) {

                    var scope = $rootScope.$new();

                    scope.params = {};
                    scope.params.objBancoConta = angular.copy(objConta);

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'financeiro/views/janela-ofx.html',
                        controller  : 'ConciliacaoUploadModalCtrl',
                        windowClass : 'center-modal',
                        backdrop    : 'static',
                        scope       :  scope,
                        resolve     :  { }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {

                        if (msg === 'reload') {
                            if (modalInstance.hasAlteracao) {

                                var codMidia = modalInstance.retorno;
                                scope.$destroy();

                                MidiaService.midia.get({mid_nro : codMidia}, function(retorno) {
                                    if (retorno.records) {

                                        console.log('Midia: ', retorno.records);
                                        $timeout(function() {
                                            $scope.objBancoConta['bco_midia'] = retorno.records;
                                            $scope.alterarContaBancaria($scope.objBancoConta, 'Deseja importar o extrato bancário do arquivo .OFX enviado?');
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            };

            /**
             * Método responsável em verificar se o banco selecionado pelo usuário da aplicação
             * já tem a conciliação implementada, caso contrário o upload do OFX será liberado.
             */
            $scope.hasUpload = function() {

                var objBanco = $scope.objBancoConta;
                if (! _.isEmpty(objBanco)) {

                    // Banco 4 - Itaú removido a pedido do Amador:
                    var codBanco = objBanco.bco_cod_banco;
                    if (! GeralFactory.inArray(codBanco, [5, 6, 101])) {

                        return true;
                    }
                }
                return false;
            };

            /**
             * Método responsável em abrir uma janela modal contendo as informações de um determinado
             * arquivo do tipo .OFX importado pelo usuário da aplicação.
             */
            $scope.openJanelaArquivo = function() {

                if ($scope.objBancoConta.bco_midia !== null) {

                    var scope = $rootScope.$new();

                    scope.params = {};
                    scope.params.objArquivo = angular.copy($scope.objBancoConta.bco_midia);

                    var modalInstance = $uibModal.open({
                        templateUrl : 'financeiro/views/janela-arquivo.html',
                        controller  : 'ConciliacaoArquivoModalCtrl',
                        windowClass : 'center-modal',
                        backdrop    : 'static',
                        animation   :  true,
                        scope       :  scope
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'cancel') {

                            scope.$destroy();
                        }
                    });
                }
            };

            /**
             * Método responsável em fechar o componente POPOVER utilizado para pesquisar os
             * títulos do extrato financeiro do usuário na tela de conciliação.
             */
            $scope.closePopover = function(reload) {

                $scope.$angular.element('#btn-popover').click();
                if (reload) {

                    $scope.objPesquisa.con_tit_dat_lan_init = '';
                    $scope.objPesquisa.con_tit_dat_lan_end  = '';

                    $timeout(function() {
                        $scope.listarConciliacao();
                    });
                }
            };

            /**
             * Método responsável em retornar a data anterior ou próxima para efetuar a listagem
             * dos extratos existentes na tela de conciliação.
             */
            $scope.listarByData = function(tipo) {

                $scope.spinner.on();
                var data = GeralFactory.getDataAtual($scope.objPesquisa['con_dat_lan']);

                var strFiltro = GeralFactory.formatarPesquisar({
                    'con_tipo_data'      : tipo,
                    'con_dat_lan'        : data,
                    'bco_cod_bco'        : $scope.objPesquisa['bco_cod_bco'],
                    'con_5010_conta_fin' : $scope.objPesquisa['con_5010_conta_fin']
                });

                FinanceiroService.conciliacao.listarByData({u : strFiltro}, function(retorno) {
                    if (retorno.records.error) {

                        GeralFactory.notify('warning', 'Atenção!', retorno.records.msg);
                        $scope.resetConciliacao();

                    } else {

                        $scope.resetConciliacao();
                        var arrResponse = retorno.records.response;
                        $timeout(function() {

                            var dtPesquisa = GeralFactory.formatarDataBr(retorno.records.date);
                            $scope.finalizarListagem(arrResponse);
                            $scope.objPesquisa['con_dat_lan'] = dtPesquisa;

                        }, 1000);
                    }

                    $timeout(function() {
                        $scope.spinner.off();
                    }, 2000);
                });
            };

            /**
             * Spinner para a tela de conciliação.
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
        }
    ]);