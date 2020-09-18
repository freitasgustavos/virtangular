'use strict';

angular.module('newApp').controller('ConciliacaoModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'GeralFactory', 'FinanceiroService', 'ClienteService', 'ParamsService',

    function ($scope, $rootScope, $timeout, $uibModalInstance, GeralFactory, FinanceiroService, ClienteService, ParamsService) {

        $scope.forms          = {};
        $scope.objModalOpcoes = {};
        $scope.objConciliacao = {};
        $scope.objFormulario  = {};
        $scope.objLancamento  = {};


        $uibModalInstance.opened.then(function() {

            $uibModalInstance.hasAlteracoes = false;
            $scope.objConciliacao = GeralFactory.isObjEmpty($scope.params.objSelecionados) ? { } : $scope.params.objSelecionados;

            $scope.objModalOpcoes = {
                FLAG : false,
                ACAO : null
            };
        });

        /**
         * Método responsável em salvar a conciliação com o valor do residual referente
         * aos títulos financeiros escolhidos pelo usuário da aplicação.
         */
        $scope.usarValor = function() {

            var objVerifica = $scope.getVerificaQtdeTitulos();
            if (objVerifica.error) {

                GeralFactory.notify('warning', 'Atenção!', objVerifica.msg);

            } else {

                GeralFactory.confirmar('Deseja quitar e confirmar a conciliação?', function() {
                
                    var strLadda = 'usarValorLoading';
                    var objeto   = {
                        '000' : $scope.objConciliacao.objBancario,
                        '001' : $scope.objConciliacao.arrFinanceiro,
                        '002' : $scope.objConciliacao.vlrResidual
                    };

                    $scope.finalizarConciliacao(objeto, strLadda);
                });
            }
        };

        /**
         * Método responsável em gerar uma nova conciliação a partir do cálculo de juros ou descontos
         * entre um registro do extrato bancaŕio e outro relativo ao financeiro do usuário.
         */
        $scope.calcularJurosOuDescontos = function() {

            var objVerifica = $scope.getVerificaQtdeTitulos();
            if (objVerifica.error) {

                GeralFactory.notify('warning', 'Atenção!', objVerifica.msg);

            } else {

                var vlConciliacao = parseFloat($scope.objConciliacao.vlrResidual);
                if (vlConciliacao) {

                    GeralFactory.confirmar('Deseja efetuar a conciliação?', function() {

                        var strLadda = 'jurosOuDescontosLoading';
                        var objeto   = {
                            '000' : $scope.objConciliacao.objBancario,
                            '001' : $scope.objConciliacao.arrFinanceiro,
                            '007' : $scope.objConciliacao.vlrResidual
                        };

                        $scope.finalizarConciliacao(objeto, strLadda);
                    });
                }
            }
        };

        /**
         * Método genérico responsável em finalizar toda e qualquer tipo de conciliação feita pelo
         * usuário da aplicação através da janela modal de conciliação.
         */
        $scope.finalizarConciliacao = function(objeto, strLadda) {

            $scope[strLadda] = true;
            FinanceiroService.conciliacao.conciliar(objeto, function(retorno) {
                if (retorno.records) {

                    $scope[strLadda] = false;
                    $timeout(function() {

                        $uibModalInstance.hasAlteracoes = !retorno.records.error;
                        $scope.fecharModal('reload');

                    }, 2000);
                }
            });
        };

        /**
         * Método responsavél em salvar uma conciliação ou apenas configurar os juros de uma mesma
         * conforme os registros escolhidos pelo usuário na tela de conciliação.
         */
        $scope.salvarConciliacao = function() {

            var qtde = $scope.objConciliacao.arrFinanceiro.length;
            if (qtde) {

                var acao = $scope.objModalOpcoes.ACAO;
                if (acao === 'NOVO') {

                    GeralFactory.confirmar('Deseja efetuar a conciliação?', function() {

                        $scope.salvarConciliacaoModalLoading = true;
                        $scope.$watch('forms.formConciliacaoNovaModal', function(form) {

                            if (form.$invalid) {

                                $scope.submitted = true;
                                $scope.salvarConciliacaoModalLoading = false;

                            } else {

                                var objeto = {
                                    '000' : $scope.objConciliacao.objBancario,
                                    '001' : $scope.objConciliacao.arrFinanceiro,
                                    '008' : $scope.objFormulario
                                };

                                FinanceiroService.conciliacao.conciliarResidual(objeto, function(retorno) {
                                    if (! retorno.records.error) {

                                        $uibModalInstance.hasAlteracoes = true;
                                        $scope.fecharModal('reload');
                                    }

                                    $scope.salvarConciliacaoModalLoading = false;
                                    $scope.forms.formConciliacaoNovaModal.$setPristine();
                                });
                            }
                        });
                    });
                }

                if (acao === 'VALOR') {

                    GeralFactory.confirmar('Deseja efetuar a conciliação?', function() {

                        $scope.salvarConciliacaoModalLoading = true;
                        if (_.isEmpty($scope.objLancamento)) {

                            var mensagem = 'Caro usuário, escolhe ao menos um lançamento da listagem para atribuir o valor residual!';
                            GeralFactory.notify('warning', 'Atenção!', mensagem);

                        } else {

                            var objeto = {
                                '000' : $scope.objConciliacao.objBancario,
                                '001' : $scope.objConciliacao.arrFinanceiro,
                                '006' : $scope.objLancamento
                            };

                            FinanceiroService.conciliacao.valorar(objeto, function(retorno) {
                                if (! retorno.records.error) {

                                    $uibModalInstance.hasAlteracoes = true;
                                    $scope.fecharModal('reload');
                                }
                            });
                        }
                    });
                }
            } else {

                var mensagem = 'Caro usuário, escolha ao menos um título financeiro para salvar esta conciliação!';
                GeralFactory.notify('warning', 'Atenção!', mensagem);
            }
        };

        /**
         * Método responsavél em abrir a janela modal para criação de uma nova conciliação com base
         * nos registros escolhidos pelo usuário da aplicação na tela de conciliação.
         */
        $scope.escolherOpcao = function(opcao) {

            $scope.objFormulario  = {};
            $scope.objLancamento  = {};
            $scope.objModalOpcoes = {
                FLAG : true,
                ACAO : opcao
            };

            var objBancario = $scope.objConciliacao.objBancario;
            if (opcao === 'NOVO') {

                var vlConciliacao = parseFloat($scope.objConciliacao.vlrResidual);
                vlConciliacao = (vlConciliacao < 0) ? vlConciliacao * (-1) : vlConciliacao;

                var dtConciliacao = GeralFactory.formatarDataBr(objBancario.con_dat_lan), dtCorrente = GeralFactory.getDataAtualBr();
                $scope.objFormulario = {
                    tit_doc_vlr_liquido     : 0,
                    tit_doc_vlr_descontos   : 0,
                    tit_doc_vlr_despesas    : 0,
                    tit_doc_porct_descontos : 0,
                    tit_doc_porct_despesas  : 0,
                    tit_faturado            : 3,
                    tit_recorrente          : [],
                    tit_situacao_flag       : true,
                    tit_dat_pgt             : dtCorrente,
                    tit_dat_lan             : dtConciliacao,
                    tit_dat_vct             : dtConciliacao,
                    tit_doc_vlr_bruto       : vlConciliacao,
                    tit_5010_conta_fin      : objBancario.con_5010_conta_fin,
                    tit_con_cod_con         : objBancario.con_cod_con
                };

                $scope.getContaFinanceira(objBancario.con_5010_conta_fin);
            }
        };

        /**
         * Método responsável em cancelar uma nova conciliação além de inicializar as variáveis do
         * formulário contido na janela modal.
         */
        $scope.cancelar = function() {

            $scope.objFormulario  = {};
            $scope.objLancamento  = {};
            $scope.objModalOpcoes = {
                FLAG : false,
                ACAO : null
            };
        };

        /**
         * Método responsável em verificar qual lançamento foi selecionado pelo usuário para
         * posteriomente aplicar a regra de juros da conciliação.
         */
        $scope.selecionarLcto = function(objLcto) {

            $scope.objLancamento = objLcto;
        };

        /**
         * Método responsável em retornar o background color de acordo com a conciliação de
         * cada item na GRID de visulização.
         */
        $scope.getBackground = function(objLcto) {

            if (! GeralFactory.isObjEmpty($scope.objLancamento)) {

                var objLctoScope = $scope.objLancamento;
                if (objLctoScope.tit_fin_nro_lan === objLcto.tit_fin_nro_lan &&
                        objLctoScope.tit_fatura_seq === objLcto.tit_fatura_seq && objLctoScope.tit_cod_emp === objLcto.tit_cod_emp) {

                    return 'bg-amarelo';
                }
            }

            return '';
        };

        /**
         * Método responsável em verificar a quantidade de títulos financeiros do sistema que o usuário
         * da aplicação selecionou, pois esta mesma não pode ser igual a zero.
         */
        $scope.getVerificaQtdeTitulos = function() {

            var qtde = $scope.objConciliacao.arrFinanceiro.length;
            if (qtde > 1) {

                var mensagem = 'Caro usuário, escolha apenas um título financeiro para finalizar a conciliação!';
                return {
                    'error' : true,
                    'msg'   : mensagem
                }
            }

            return {'error' : false};
        };

        /**
         * Método responsável em retornar todas as informações de uma determinada conta financeira.
         */
        $scope.getContaFinanceira = function(par_pai) {

            ParamsService.contaFinanceira.get({par_pai : par_pai}, function(retorno) {

                $scope.objFormulario.contaFinanceira    = retorno.records.par_c01;
                $scope.objFormulario.tit_5010_conta_fin = par_pai;
            });
        };

        /**
         * Método responsável pela seleção dos dados de uma determinada pessoa pelo componente de
         * autocomplete de cliente/fornecedor contido na tela.
         */
        $scope.onSelectPessoa = function($item) {

            $scope.getPessoa($item.cad_cod_cad);
            $scope.objFormulario.pessoa = $item.cad_nome_razao;
        };

        /**
         * Método responsável em retornar todas as informações de uma determinada pessoa.
         */
        $scope.getPessoa = function(cad_cod_cad) {

            ClienteService.cliente.get({cad_cod_cad : cad_cod_cad}, function(retorno) {

                $scope.objPessoa = retorno.records;
                $scope.objFormulario.tit_cad_cod_cad = cad_cod_cad;
            });
        };

        /**
         * Método responsável pela seleção dos dados de uma determinada forma de pagamento
         * pelo componente de autocomplete contido na tela.
         */
        $scope.onSelectFormaPagamento = function($item) {

            $scope.getFormaPagamento($item.par_pai);
            $scope.objFormulario.formaPagamento = $item.par_c01;
        };

        /**
         * Método responsável em retornar todas as informações de uma determinada forma de pagamento.
         */
        $scope.getFormaPagamento = function(par_pai) {

            ParamsService.formaPagamento.get({par_pai : par_pai}, function(retorno) {

                $scope.objFormaPagamento = retorno.records;
                $scope.objFormulario.tit_6060_forma_pagamento = par_pai;
            });
        };

        /**
         * Método responsável pela seleção dos dados de um determinado centro de custo
         * pelo componente de autocomplete contido na tela.
         */
        $scope.onSelectCentroCusto = function($item) {

            $scope.getCentroCusto($item.par_pai);
            $scope.objFormulario.centroCusto = $item.par_c01;
        };

        /**
         * Método responsável em retornar todas as informações de um determinado centro de custo.
         */
        $scope.getCentroCusto = function(par_pai) {

            ParamsService.centroCusto.get({par_pai : par_pai}, function(retorno) {

                $scope.objCentroCusto = retorno.records;
                $scope.objFormulario.tit_6050_cdc = par_pai;
            });
        };

        /**
         * Método responsável em fechar a janela modal.
         */
        $scope.fecharModal = function(str) {
            
            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('TransferenciaConciliacaoModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'GeralFactory', 'ClienteService', 'ParamsService', 'FinanceiroService',

    function ($scope, $rootScope, $timeout, $uibModalInstance, GeralFactory, ClienteService, ParamsService, FinanceiroService) {

        $scope.forms            = {};
        $scope.objBancario      = {};
        $scope.objModalOpcoes   = {};
        $scope.objTransferencia = {};


        $uibModalInstance.opened.then(function() {

            $uibModalInstance.hasAlteracoes = false;

            $scope.objBancario    = GeralFactory.isObjEmpty($scope.params.objBancario) ? { } : $scope.params.objBancario;
            $scope.objModalOpcoes = {
                FLAG_ORIGEM  : true,
                FLAG_DESTINO : true
            };

            $timeout(function() {
                $scope.initTransferencia();
            });
        });

        /**
         * Método responsável em inicializar os dados para a transferência entre contas.
         */
        $scope.initTransferencia = function() {

            var vlConciliacao = parseFloat($scope.objBancario.con_doc_vlr_dec);
            var dtConciliacao = GeralFactory.formatarDataBr($scope.objBancario.con_dat_lan);

            $scope.objTransferencia = {
                tit_dat_vct             : dtConciliacao,
                tit_doc_vlr_liquido     : vlConciliacao,
                tit_doc_vlr_bruto       : vlConciliacao,
                tit_doc_vlr_descontos   : 0,
                tit_doc_vlr_despesas    : 0,
                tit_doc_porct_descontos : 0,
                tit_doc_porct_despesas  : 0,
                tit_recorrente          : [],
                tit_con_cod_con         : $scope.objBancario.con_cod_con
            };

            var codTipo = $scope.objBancario.con_tipo_con;
            var objAttr = {
                strAttr  : '',
                strScope : ''
            };

            switch (codTipo) {
                case 2:
                    $scope.objModalOpcoes.FLAG_ORIGEM = false;
                    $scope.objTransferencia.tit_5010_transferencia = 'O';
                    objAttr = {
                        strAttr  : 'tit_5010_conta_fin_origem',
                        strScope : 'contaFinanceiraOrigem'
                    };
                    break;
                default:
                    $scope.objModalOpcoes.FLAG_DESTINO = false;
                    $scope.objTransferencia.tit_5010_transferencia = 'D';
                    objAttr = {
                        strAttr  : 'tit_5010_conta_fin_destino',
                        strScope : 'contaFinanceiraDestino'
                    };
                    break;
            }

            $scope.getContaFinanceira($scope.objBancario.con_5010_conta_fin, objAttr.strAttr, function() {
                $timeout(function() {
                    $scope.objTransferencia[objAttr.strScope] = $scope.objContaFinanceira.par_c01;
                });
            });
        };

        /**
         * Método responsável em efetuar a transferência entre contas para um determinado registro
         * bancário e logo em seguida finalizar a conciliação do mesmo.
         */
        $scope.transferir = function() {

            $scope.transferenciaConciliacaoModalLoading = true;
            $scope.$watch('forms.formConciliacaoTransferenciaModal', function(form) {
                if (form.$invalid) {

                    $scope.submitted = true;
                    $scope.transferenciaConciliacaoModalLoading = false;

                } else {

                    if ($scope.objBancario.con_cod_con) {

                        var vlrTransferencia = $scope.objTransferencia.tit_doc_vlr_bruto;
                        if (vlrTransferencia > 0) {

                            var objeto = $scope.objTransferencia;
                            FinanceiroService.financas.transferencia(objeto, function(retorno) {
                                if (! retorno.records.error) {

                                    $timeout(function() {
                                        $uibModalInstance.hasAlteracao = true;
                                        $scope.fecharModal('reload');
                                    });
                                }

                                $scope.transferenciaConciliacaoModalLoading = false;
                                $scope.forms.formConciliacaoTransferenciaModal.$setPristine();
                            });
                        } else {

                            $scope.transferenciaConciliacaoModalLoading = false;
                            GeralFactory.notify('danger', 'Atenção:', 'O valor da transferência deve ser maior que zero!');
                        }
                    } else {

                        $scope.transferenciaConciliacaoModalLoading = false;
                        GeralFactory.notify('warning', 'Atenção!', 'Caro usuário, escolha ao menos um registro do extrato bancário para efetuar a transferência!');
                    }
                }
            });
        };

        /**
         * Método responsável em retornar todas as informações de uma determinada pessoa.
         */
        $scope.getPessoa = function(cad_cod_cad) {

            ClienteService.cliente.get({cad_cod_cad : cad_cod_cad}, function(retorno) {
                $scope.objPessoa                        = retorno.records;
                $scope.objTransferencia.tit_cad_cod_cad = cad_cod_cad;
            });
        };

        /**
         * Método responsável em retornar todas as informações de uma determinada conta financeira.
         */
        $scope.getContaFinanceira = function(par_pai, strAttr, funcao) {

            ParamsService.contaFinanceira.get({par_pai : par_pai}, function(retorno) {
                $scope.objContaFinanceira        = retorno.records;
                $scope.objTransferencia[strAttr] = par_pai;
                funcao && funcao.call();
            });
        };

        /**
         * Método responsável em retornar todas as informações de uma determinada forma de pagamento.
         */
        $scope.getFormaPagamento = function(par_pai) {

            ParamsService.formaPagamento.get({par_pai : par_pai}, function(retorno) {
                $scope.objFormaPagamento                         = retorno.records;
                $scope.objTransferencia.tit_6060_forma_pagamento = par_pai;
            });
        };

        /**
         * Método responsável em retornar todas as informações de um determinado centro de custo.
         */
        $scope.getCentroCusto = function(par_pai) {

            ParamsService.centroCusto.get({par_pai : par_pai}, function(retorno) {
                $scope.objCentroCusto                = retorno.records;
                $scope.objTransferencia.tit_6050_cdc = par_pai;
            });
        };

        /**
         * Método responsável pela seleção dos dados de uma determinada pessoa pelo componente de
         * autocomplete de cliente/fornecedor contido na tela.
         */
        $scope.onSelectPessoa = function($item) {

            $scope.getPessoa($item.cad_cod_cad);
            $scope.objTransferencia.pessoa = $item.cad_nome_razao;
        };

        /**
         * Método responsável pela seleção dos dados de uma determinada conta financeira de ORIGEM
         * pelo componente de autocomplete contido na tela.
         */
        $scope.onSelectContaFinanceiraOrigem = function($item) {

            $scope.getContaFinanceira($item.par_pai, 'tit_5010_conta_fin_origem');
            $scope.objTransferencia.contaFinanceiraOrigem = $item.par_c01;
        };

        /**
         * Método responsável pela seleção dos dados de uma determinada conta financeira de DESTINO
         * pelo componente de autocomplete contido na tela.
         */
        $scope.onSelectContaFinanceiraDestino = function($item) {

            $scope.getContaFinanceira($item.par_pai, 'tit_5010_conta_fin_destino');
            $scope.objTransferencia.contaFinanceiraDestino = $item.par_c01;
        };

        /**
         * Método responsável pela seleção dos dados de uma determinada forma de pagamento
         * pelo componente de autocomplete contido na tela.
         */
        $scope.onSelectFormaPagamento = function($item) {

            $scope.getFormaPagamento($item.par_pai);
            $scope.objTransferencia.formaPagamento = $item.par_c01;
        };

        /**
         * Método responsável pela seleção dos dados de um determinado centro de custo
         * pelo componente de autocomplete contido na tela.
         */
        $scope.onSelectCentroCusto = function($item) {

            $scope.getCentroCusto($item.par_pai);
            $scope.objTransferencia.centroCusto = $item.par_c01;
        };

        /**
         * Método responsável em fechar a janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('ConciliacaoModalBancoCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'GeralFactory', 'FinanceiroService', 'ParamsService', 'StaticFactories',

    function ($scope, $rootScope, $timeout, $uibModalInstance, GeralFactory, FinanceiroService, ParamsService, StaticFactories) {

        $scope.forms         = {};
        $scope.arrBancos     = [];
        $scope.objBancoConta = {};

        $uibModalInstance.opened.then(function() {

            $scope.arrBancos = StaticFactories.BANCOS;
            $scope.arrTipos  = [{
                'id'   : 'cc',
                'name' : 'Conta Corrente'
            }, {
                'id'   : 'cp',
                'name' : 'Conta Poupança'
            }];

            $uibModalInstance.hasAlteracoes = false;
            if ($scope.params.objBancoConta === null) {

                $scope.objBancoConta = {};
                $scope.canAutorizado = false;

                $scope.strImagemTela = '../app/images/sem-imagem.jpg';
                $scope.strTituloTela = 'Cadastro de Banco';

            } else {

                $scope.canAutorizado = true;
                $scope.objBancoConta = $scope.params.objBancoConta;

                $scope.objBancoConta.bco_tipo_aux      = $scope.params.objBancoConta.bco_tipo;
                $scope.objBancoConta.bco_cod_banco_aux = $scope.params.objBancoConta.bco_cod_banco;

                $scope.strTituloTela = 'Edição de Banco';
                $scope.strImagemTela =  $scope.objBancoConta.banco.ban_img_url;

                $scope.getContaFinanceira($scope.objBancoConta.bco_5010_conta_fin);
                $scope.getFormaPagamento($scope.objBancoConta.bco_6060_forma_pagamento);
            }
        });

        /**
         * Método responsável em atualizar ou inserir os dados de um banco.
         */
        $scope.salvarBanco = function() {

            $scope.salvarBancoLoading = true;
            $scope.$watch('forms.formBancoModal', function(form) {
                if (form) {
                    if (form.$invalid) {

                        $scope.submitted = true;
                        $scope.salvarBancoLoading = false;

                    } else {

                        // Verifica se o usuário autorizou o uso de sua senha bancária:
                        if ($scope.canAutorizado) {

                            // Verifica se a questão das cobranças automáticas:
                            $scope.objBancoConta.bco_eh_iugu = ($scope.params.cobAutomatica) ? 1 : 0;

                            var acao = ($scope.objBancoConta.bco_cod_bco) ? 'update' : 'create';
                            FinanceiroService.banco[acao]($scope.objBancoConta, function(retorno) {

                                $scope.salvarBancoLoading = false;
                                if (! retorno.records.error) {

                                    $uibModalInstance.hasAlteracoes = true;
                                    $timeout(function() {

                                        $uibModalInstance.strAcao    = acao;
                                        $uibModalInstance.objRetorno = retorno.records.response;
                                        $scope.fecharModal('reload');

                                    }, 2000);
                                }
                            });

                        } else {

                            $scope.salvarBancoLoading = false;
                            GeralFactory.notify('warning', '', 'Não foi possível salvar os dados da conta pois a autorização da senha não foi assinalada!');
                        }
                    }
                }
            });
        };

        /**
         * Método responsável em cancelar os dados de uma determinada conta bancária
         * escolhida pelo usuário da aplicação.
         */
        $scope.cancelarBanco = function() {

            if ($scope.objBancoConta.bco_cod_bco) {

                GeralFactory.confirmar('Deseja realmente remover este registro?', function() {

                    var objeto = {bco_cod_bco : $scope.objBancoConta.bco_cod_bco};
                    FinanceiroService.banco.cancel(objeto, function(retorno) {
                        if (! retorno.records.error) {

                            $uibModalInstance.hasAlteracoes = true;
                            $timeout(function() {

                                $uibModalInstance.strAcao    = 'cancel';
                                $uibModalInstance.objRetorno = $scope.objBancoConta;
                                $scope.fecharModal('reload');

                            }, 2000);

                        }
                    });
                });
            }
        };

        /**
         * Método responsável em inicializar os dados do banco escolhido pelo usuário,
         * ajuda na validação da tela e renderiza a imagem do banco.
         */
        $scope.onChangeBanco = function() {
            var codBanco = $scope.objBancoConta.bco_cod_banco;
            if (codBanco) {
                $scope.objBancoConta.bco_cod_banco_aux = codBanco;

                var keepGoing = true;
                angular.forEach(StaticFactories.BANCOS, function(item) {
                    if (keepGoing) {
                        if (item.ban_cod_ban === codBanco) {
                            $scope.strImagemTela = item.ban_img_url;
                            keepGoing = false;
                        }
                    }
                });
            }
        };

        /**
         * Método responsável em inicializar o tipo de conta bancária escolhida pelo
         * usuário da aplicação para não ocorrer problemas na validação do form.
         */
        $scope.onChangeTipo = function() {

            var codTipo = $scope.objBancoConta.bco_tipo;
            $scope.objBancoConta.bco_tipo_aux = codTipo;
        };

        /**
         * Método responsável pela seleção dos dados de uma determinada conta financeira
         * pelo componente de autocomplete contido na tela.
         */
        $scope.onSelectContaFinanceira = function($item) {

            $scope.getContaFinanceira($item.par_pai);
            $scope.objBancoConta.contaFinanceira = $item.par_c01;
        };

        /**
         * Método responsável pela seleção dos dados de uma determinada forma de pagamento
         * pelo componente de autocomplete contido na tela.
         */
        $scope.onSelectFormaPagamento = function($item) {

            $scope.getFormaPagamento($item.par_pai);
            $scope.objBancoConta.formaPagamento = $item.par_c01;
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

                    $scope.objBancoConta.contaFinanceira    = $item.trim();
                    $scope.objBancoConta.bco_5010_conta_fin = retorno.records.par_pai;
                    $scope.getContaFinanceira();
                }
            });
        };

        /**
         * Método responsável em retornar todas as informações de uma determinada forma de pagamento.
         */
        $scope.getFormaPagamento = function(par_pai) {

            if (par_pai) {

                ParamsService.formaPagamento.get({par_pai : par_pai}, function(data) {
                    $scope.objBancoConta.formaPagamento           = data.records.par_c01;
                    $scope.objBancoConta.bco_6060_forma_pagamento = par_pai;
                });
            } else {

                ParamsService.formaPagamentos.get({u : ''}, function(resposta) {
                    $scope.arrFormasPgto = resposta.records;
                });
            }
        };

        /**
         * Método responsável em retornar todas as informações de uma determinada conta financeira.
         */
        $scope.getContaFinanceira = function(par_pai) {

            if (par_pai) {

                ParamsService.contaFinanceira.get({par_pai : par_pai}, function(data) {
                    $scope.objBancoConta.contaFinanceira    = data.records.par_c01;
                    $scope.objBancoConta.bco_5010_conta_fin = par_pai;
                });
            } else {

                ParamsService.contaFinanceiras.get({u : ''}, function(retorno) {
                    $scope.arrContasFinanceiras = retorno.records;
                });
            }
        };

        /**
         * Método responsável em autorizar ou desautorizar o uso da senha de uma determinada
         * conta bancária do usuário pela nossa aplicação.
         */
        $scope.autorizarAcesso = function() {

            $scope.canAutorizado = !$scope.canAutorizado;
        };

        /**
         * Método responsável em fechar a janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('CriarConciliacaoModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', '$uibModal', 'GeralFactory', 'ClienteService', 'ParamsService', 'FinanceiroService',

    function ($scope, $rootScope, $timeout, $uibModalInstance, $uibModal, GeralFactory, ClienteService, ParamsService, FinanceiroService) {

        $scope.forms          = {};
        $scope.objComponentes = {};
        $scope.objConciliacao = {};
        $scope.objTituloFinan = {};

        $uibModalInstance.opened.then(function() {

            $uibModalInstance.hasAlteracoes = false;
            $scope.objConciliacao = GeralFactory.isObjEmpty($scope.params.objSelecionados) ? { } : $scope.params.objSelecionados;

            $timeout(function() {
                $scope.setTituloFinanceiro();
                console.log('Dados da conciliação: ', $scope.objConciliacao);
            });
        });

        /**
         * Método responsável em inicializar os dados do título financeiro a partir do
         * registro do extrato bancário escolhido pelo usuário.
         */
        $scope.setTituloFinanceiro = function() {

            var objBancario = $scope.objConciliacao.objBancario;
            $scope.setComponentes(objBancario.con_tipo_con);

            var dtConciliacao = GeralFactory.formatarDataBr(objBancario.con_dat_lan), dtCorrente = GeralFactory.getDataAtualBr();
            var vlConciliacao = objBancario.con_doc_vlr_dec ? objBancario.con_doc_vlr_dec : 0;

            $scope.objTituloFinan = {
                tit_doc_vlr_liquido     : 0,
                tit_doc_vlr_descontos   : 0,
                tit_doc_vlr_despesas    : 0,
                tit_doc_porct_descontos : 0,
                tit_doc_porct_despesas  : 0,
                tit_faturado            : 3,
                tit_recorrente          : [],
                tit_situacao_flag       : true,
                tit_dat_pgt             : dtCorrente,
                tit_dat_lan             : dtConciliacao,
                tit_dat_vct             : dtConciliacao,
                tit_doc_vlr_bruto       : vlConciliacao,
                tit_descricao           : objBancario.con_descricao ? objBancario.con_descricao.trim() : '',
                tit_5010_conta_fin      : objBancario.con_5010_conta_fin,
                tit_con_cod_con         : objBancario.con_cod_con
            };

            $scope.getContaFinanceira(objBancario.con_5010_conta_fin);
        };

        /**
         * Método responsável em inicializar alguns componentes da tela conforme o tipo
         * do título escolhido: Receita, Despesa ou Outros.
         */
        $scope.setComponentes = function(codTipoCon) {

            switch (codTipoCon)
            {
                case 0:
                    $scope.objComponentes = {
                        descTipo        : '',
                        descSistema     : '',
                        descSitSistema  : 'Quitado',
                        descDataSistema : 'Data',
                        codSistema      :  codTipoCon
                    };
                    break;

                case 1:
                    $scope.objComponentes = {
                        descTipo        : 'receber',
                        descSistema     : 'Receita',
                        descSitSistema  : 'Recebido',
                        descDataSistema : 'Dt. de Recebimento',
                        codSistema      :  codTipoCon,
                        objDropdown     :  {
                            centro : {par_i03 : 1},
                            pessoa : {cad_tip_cli_for : 1}
                        }
                    };
                    break;

                case 2:
                    $scope.objComponentes = {
                        descTipo        : 'pagar',
                        descSistema     : 'Despesa',
                        descSitSistema  : 'Pago',
                        descDataSistema : 'Dt. de Pagamento',
                        codSistema      :  codTipoCon,
                        objDropdown     :  {
                            centro : {par_i03 : 2},
                            pessoa : {cad_tip_cli_for : 2}
                        }
                    };
                    break;
            }
        };

        /**
         * Método responsável em salvar o novo título na tabela de finanças além de já
         * efetuar a conciliação do mesmo com o extrato bancário.
         */
        $scope.salvarConciliacao = function() {

            $scope.novaConciliacaoLoading = true;
            if ($scope.objComponentes.codSistema === 0) {

                $scope.novaConciliacaoLoading = false;
                GeralFactory.notify('warning', 'Atenção!', 'Por gentileza escolha se deseja conciliar uma despesa ou receita!');

            } else {

                $scope.$watch('forms.formCriarConciliacaoModal', function(form) {
                    if (form) {
                        if (form.$invalid) {

                            $scope.submitted = true;
                            $scope.novaConciliacaoLoading = false;

                        } else {

                            $timeout(function() {
                                $scope.objTituloFinan.operacao            = $scope.objComponentes.descTipo;
                                $scope.objTituloFinan.tit_faturado        = $scope.objTituloFinan.tit_situacao_flag ? 3 : 0;
                                $scope.objTituloFinan.tit_doc_vlr_liquido = $scope.objTituloFinan.tit_doc_vlr_bruto;

                                FinanceiroService.financas.create($scope.objTituloFinan, function(retorno) {
                                    if (! retorno.records.error) {

                                        $uibModalInstance.hasAlteracoes = true;
                                        $scope.fecharModal('reload');
                                    }
                                    $scope.novaConciliacaoLoading = false;
                                    $scope.forms.formCriarConciliacaoModal.$setPristine();
                                });
                            });
                        }
                    }
                });
            }
        };

        /**
         * Método responsável em retornar todas as informações de uma determinada pessoa.
         */
        $scope.getPessoa = function(cad_cod_cad) {

            ClienteService.cliente.get({cad_cod_cad : cad_cod_cad}, function(retorno) {
                $scope.objPessoa                      = retorno.records;
                $scope.objTituloFinan.tit_cad_cod_cad = cad_cod_cad;
            });
        };

        /**
         * Método responsável pela seleção dos dados de uma determinada pessoa pelo componente de
         * autocomplete de cliente/fornecedor contido na tela.
         */
        $scope.onSelectPessoa = function($item) {

            $scope.getPessoa($item.cad_cod_cad);
            $scope.objTituloFinan.pessoa = $item.cad_nome_razao;
        };

        /**
         * Método responsável em adicionar um determinado cliente/fornecedor de forma direta pelo
         * componente de autocomplete contido na tela.
         */
        $scope.addPessoa = function($item) {

            var objPessoa = {
                cad_nome_razao  : $item.trim(),
                cad_tip_cli_for : $scope.objComponentes.objDropdown.pessoa.cad_tip_cli_for,
                cad_pf_pj       : 1,
                cad_eh_inativo  : 0
            };

            ClienteService.clientes.create(objPessoa, function(retorno) {
                if (! retorno.records.error) {

                    $scope.objTituloFinan.pessoa          = $item.trim();
                    $scope.objTituloFinan.tit_cad_cod_cad = retorno.records.cad_cod_cad;
                }
            });
        };

        /**
         * Método responsável em retornar todas as informações de uma determinada forma de pagamento.
         */
        $scope.getFormaPagamento = function(par_pai) {

            if (par_pai) {

                ParamsService.formaPagamento.get({par_pai : par_pai}, function(data) {
                    $scope.objFormaPagamento                       = data.records;
                    $scope.objTituloFinan.tit_6060_forma_pagamento = par_pai;
                });
            } else {

                ParamsService.formaPagamentos.get({u : ''}, function(resposta) {
                    $scope.arrFormasPgto = resposta.records;
                });
            }
        };

        /**
         * Método responsável pela seleção dos dados de uma determinada forma de pagamento
         * pelo componente de autocomplete contido na tela.
         */
        $scope.onSelectFormaPagamento = function($item) {

            $scope.getFormaPagamento($item.par_pai);
            $scope.objTituloFinan.formaPagamento = $item.par_c01;
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

                    $scope.objTituloFinan.formaPagamento           = $item.trim();
                    $scope.objTituloFinan.tit_6060_forma_pagamento = retorno.records.par_pai;
                    $scope.getFormaPagamento();
                }
            });
        };

        /**
         * Método responsável em retornar todas as informações de uma determinada conta financeira.
         */
        $scope.getContaFinanceira = function(par_pai) {

            if (par_pai) {

                ParamsService.contaFinanceira.get({par_pai : par_pai}, function(data) {
                    $scope.objTituloFinan.tit_5010_conta_fin = par_pai;
                    $scope.objTituloFinan.contaFinanceira    = data.records.par_c01;
                });
            } else {

                ParamsService.contaFinanceiras.get({u : ''}, function(retorno) {
                    $scope.arrContasFinanceiras = retorno.records;
                });
            }
        };

        /**
         * Método responsável pela seleção dos dados de uma determinada conta financeira
         * pelo componente de autocomplete contido na tela.
         */
        $scope.onSelectContaFinanceira = function($item) {

            $scope.getContaFinanceira($item.par_pai);
            $scope.objTituloFinan.contaFinanceira = $item.par_c01;
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

                    $scope.objTituloFinan.contaFinanceira    = $item.trim();
                    $scope.objTituloFinan.tit_5010_conta_fin = retorno.records.par_pai;
                    $scope.getContaFinanceira();
                }
            });
        };

        /**
         * Método responsável em retornar todas as informações de um determinado centro de custo.
         */
        $scope.getCentroCusto = function(par_pai) {

            if (par_pai) {

                ParamsService.centroCusto.get({par_pai : par_pai}, function(data) {
                    $scope.objCentroCusto              = data.records;
                    $scope.objTituloFinan.tit_6050_cdc = par_pai;
                });
            } else {

                var strFiltro = '';
                if ($scope.objComponentes.objDropdown.centro.par_i03) {
                    strFiltro = GeralFactory.formatarPesquisar({
                        'par_i03' : $scope.objComponentes.objDropdown.centro.par_i03
                    });
                }

                ParamsService.centroCustos.get({u : strFiltro}, function(retorno) {
                    $scope.arrCentrosCustos = retorno.records;
                });
            }
        };

        /**
         * Método responsável pela seleção dos dados de um determinado centro de custo
         * pelo componente de autocomplete contido na tela.
         */
        $scope.onSelectCentroCusto = function($item) {

            $scope.getCentroCusto($item.par_pai);
            $scope.objTituloFinan.centroCusto = $item.par_c01;
        };

        /**
         * Método responsável em adicionar um determinado centro de custo diretamente pelo
         * componente de autocomplete contido na tela.
         */
        $scope.addCentroCusto = function($item) {

            var objCentroCusto = {
                par_c01 : $item.trim(),
                par_i03 : $scope.objComponentes.objDropdown.centro.par_i03
            };

            ParamsService.centroCustos.create(objCentroCusto, function(retorno) {
                if (! retorno.records.error) {

                    $scope.objTituloFinan.centroCusto  = $item.trim();
                    $scope.objTituloFinan.tit_6050_cdc = retorno.records.par_pai;
                    $scope.getCentroCusto();
                }
            });
        };

        /**
         * Método responsável em inicializar a data de pagamento ou recebimento de
         * um determinado título para a data atual.
         */
        $scope.setDataAtual = function() {
            if ($scope.objTituloFinan.tit_situacao_flag) {

                $scope.objTituloFinan.tit_dat_pgt = GeralFactory.getDataAtualBr();

            } else {

                $scope.objTituloFinan.tit_dat_pgt = null;
                $scope.objTituloFinan.tit_doc_vlr_liquido = $scope.objTituloFinan.tit_doc_vlr_bruto;
            }
        };

        /**
         * Metodo responsavel em abrir a janela modal para ediçao dos dados um
         * determinado cliente ou fornecedor.
         */
        $scope.getJanelaCliente = function(cadCodCad) {

            if (cadCodCad) {

                var scope = $rootScope.$new();
                scope.params = {};

                scope.params.cad_cod_cad = cadCodCad;
                scope.params.str_titular = $scope.objComponentes.codSistema === 1 ? 'cliente' : 'fornecedor';

                var modalInstance = $uibModal.open({
                    templateUrl : 'cliente/views/janela-cliente.html',
                    controller  : 'ClienteModalCtrl',
                    size        : 'lg',
                    windowClass : 'center-modal no-top-modal',
                    animation   :  true,
                    scope       :  scope
                });

                modalInstance.result.then(function(id) { }, function() {
                    if (modalInstance.hasAlteracao) {

                        $scope.getPessoa(cadCodCad);
                        $scope.objTituloFinan.pessoa = modalInstance.objClienteClone.cad_nome_razao;
                    }
                });
            }
        };

        /**
         * Método responsável em fechar a janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('ConciliacaoUploadModalCtrl', [

    '$scope', '$rootScope', '$uibModalInstance', '$timeout', 'GeralFactory', 'MidiaService',

    function ($scope, $rootScope, $uibModalInstance, $timeout, GeralFactory, MidiaService) {

        $scope.forms   = {};
        $scope.objFile = {};

        $uibModalInstance.opened.then(function() {

            $uibModalInstance.hasAlteracao = false;
            $scope.objFile.mid_tab_cod = $scope.params.objBancoConta.bco_cod_bco;
        });

        /**
         * Método responsável em realizar o upload do arquivo .OFX selecionado
         * pelo usuário da apĺicação.
         */
        $scope.upload = function(file, event) {

            $scope.salvarArquivoLoading = true;
            if (file === undefined || file === null) {

                GeralFactory.notify('warning', 'Atenção!', 'Caro usuário, selecione ao menos uma arquivo para efetuar o envio!');
                $scope.salvarArquivoLoading = false;

            } else {

                var descricao = $scope.objFile.mid_descricao;
                if (descricao === '' || descricao === undefined || descricao === null) {

                    GeralFactory.notify('warning', 'Atenção!', 'Caro usuário, o campo descrição é de preenchimento obrigatório!');
                    $scope.salvarArquivoLoading = false;

                } else {

                    var objeto = {
                        mid_tab         : 11,
                        mid_status      : 1,
                        mid_posicao     : '',
                        mid_link        : '',
                        mid_descricao   : descricao,
                        mid_tab_cod     : $scope.objFile.mid_tab_cod ? $scope.objFile.mid_tab_cod : 0
                    };

                    MidiaService.upload(file, objeto, function(retorno) {

                        $uibModalInstance.hasAlteracao = true;
                        GeralFactory.notify('success', 'Sucesso!', 'Arquivo enviado com sucesso!');

                        $scope.salvarArquivoLoading = false;
                        $timeout(function() {

                            $scope.fecharModal('reload');
                            $uibModalInstance.retorno = retorno.records.mid_nro;

                        }, 1000);
                    });
                }
            }
        };

        /**
         * Método responsável em fechar a janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('ConciliacaoArquivoModalCtrl', [

    '$scope', '$rootScope', '$uibModalInstance', '$timeout', '$window',

    function ($scope, $rootScope, $uibModalInstance, $timeout, $window) {

        $scope.forms      = {};
        $scope.objArquivo = {};

        $uibModalInstance.opened.then(function() {

            $scope.objArquivo = $scope.params.objArquivo;
        });

        /**
         * Método responsável em efetuar o download de um determinado arquivo .OFX.
         */
        $scope.download = function() {

            var url = $rootScope.documentCache + $scope.objArquivo.mid_id;
            $timeout(function() {

                $window.open(url);
                $scope.fecharModal('cancel');
                
            }, 2000);
        };

        /**
         * Método responsável em fechar a janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);
