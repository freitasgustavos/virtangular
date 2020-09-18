
angular.module('newApp').controller('FinanceiroModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$modalInstance', 'MidiaService', 'GeralFactory',

    function($scope, $rootScope, $timeout, $modalInstance, MidiaService, GeralFactory) {

        $scope.documento = {};

        $modalInstance.opened.then(function() {

            $scope.documento.tit_fatura_seq  = $scope.params.tit_fatura_seq;
            $scope.documento.tit_fin_nro_lan = $scope.params.tit_fin_nro_lan;

            $modalInstance.hasAlteracao = false;
        });


        /**
         * Método responsável em efetuar o upload do documento.
         */
        $scope.upload = function(file, event) {

            $scope.salvarDocumentoLoading = true;

            if (file === undefined || file === null) {

                GeralFactory.notify('warning', 'Atenção!', 'Caro usuário, selecione ao menos um arquivo para efetuar o envio!');
                $scope.salvarDocumentoLoading = false;

            } else {

                if ($scope.documento.tit_fatura_seq !== null && $scope.documento.tit_fin_nro_lan !== null) {

                    var objeto = {
                        mid_tab         : 6,
                        mid_status      : 1,
                        mid_posicao     : '',
                        mid_link        : '',
                        mid_tab_cod     : $scope.documento.tit_fin_nro_lan,
                        mid_tab_cod_sub : $scope.documento.tit_fatura_seq,
                        mid_descricao   : $scope.documento.mid_descricao ? $scope.documento.mid_descricao : ''
                    };

                    MidiaService.upload(file, objeto, function() {

                        $modalInstance.hasAlteracao = true;
                        GeralFactory.notify('success', 'Sucesso!', 'Documento enviado com sucesso!');

                        $scope.salvarFotoLoading = false;
                        $timeout(function() {
                            $scope.fecharModal('cancel');
                        }, 1000);
                    });
                }

            }
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('FinanceiroPgtoParcialModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$modalInstance', 'GeralFactory',

    function($scope, $rootScope, $timeout, $modalInstance, GeralFactory) {

        $scope.forms = {};
        $scope.objPgtoParcial = {};

        $scope.objTela = {
            vlr_quitado    : 0,
            vlr_restante   : 0,
            tit_fatura_nro : null,
            dt_vct_nova    : GeralFactory.addDiasData(GeralFactory.getDataAtualBr(), 10)
        };

        $modalInstance.opened.then(function() {

            $scope.objPgtoParcial = $scope.params.objConta;
            $modalInstance.hasAlteracao = false;
        });


        /**
         * Método responsável em efetuar o cálculo do valor restante que será empregado
         * ao novo título a ser criado em decorrência do pagamento parcial.
         */
        $scope.getRestante = function() {

            var vlrTotal  = parseFloat($scope.objPgtoParcial.tit_doc_vlr_bruto);
            var vlrQuitar = parseFloat($scope.objTela.vlr_quitado);

            /**
             * Alteração pedida pelo amador para o cliente da Hamarec.
             * vlrQuitar < vlrTotal && vlrQuitar > 0
             */
            if (vlrQuitar != 0) {

                var vlrRestante = vlrTotal - vlrQuitar;
                $scope.objTela.vlr_restante = vlrRestante;

            } else {

                $scope.objTela.vlr_restante = 0;
            }
        };


        /**
         * Método responsável em verificar se o valor a ser quitado é maior que o valor
         * do título para não existir o cálculo errado e divergente do pg. parcial.
         */
        $scope.verificarRestante = function() {

            var vlrTotal  = parseFloat($scope.objPgtoParcial.tit_doc_vlr_bruto);
            var vlrQuitar = parseFloat($scope.objTela.vlr_quitado);

            if (vlrQuitar >= vlrTotal) {

                $scope.objTela.vlr_quitado  = 0;
                $scope.objTela.vlr_restante = 0;
            }
        };


        /**
         * Método responsável em salvar o pagamento parcial de um determinado título.
         * Cria um novo título com a diferença do valor total com o valor pago.
         */
        $scope.salvar = function() {

            $scope.salvarPgtoParcialLoading = true;

            var validar = $scope.validar();
            if (validar['error']) {

                GeralFactory.notify('danger', 'Atenção:', validar['msg']);
                $scope.salvarPgtoParcialLoading = false;

            } else {

                $scope.$watch('forms.formPgtoParcial', function(form) {
                    if (form) {

                        if (form.$invalid) {

                            $scope.submitted = true;
                            $scope.salvarPgtoParcialLoading = false;

                        } else {

                            var qtdeParcelas, ultima;
                            qtdeParcelas = ultima = $scope.objPgtoParcial.tit_recorrente.length ? $scope.objPgtoParcial.tit_recorrente.length : 1;

                            // Alterando a descrição de todas as parcelas recorrentes:
                            if (qtdeParcelas) {

                                var vlrRestante = 0;
                                angular.forEach($scope.objPgtoParcial.tit_recorrente, function(item, chave) {
                                    if (item.tit_descricao !== '') {

                                        var descTitulo = GeralFactory.getDescTitulo(item.tit_descricao, qtdeParcelas, item.tit_fatura_seq);
                                        $scope.objPgtoParcial.tit_recorrente[chave].tit_descricao = descTitulo;
                                    }

                                    if (item.tit_fatura_seq === $scope.objPgtoParcial.tit_fatura_seq) {

                                        var vlrTotalItem = parseFloat($scope.objPgtoParcial.tit_recorrente[chave].tit_doc_vlr_bruto);
                                        var vlrPagoItem  = parseFloat($scope.objTela.vlr_quitado);

                                        // Valor restante do pagamento parcial:
                                        vlrRestante = vlrTotalItem - vlrPagoItem;

                                        // Caso o valor pago seja maior que o da dívida:
                                        vlrPagoItem = (vlrRestante < 0) ? vlrTotalItem : vlrPagoItem;

                                        $scope.objPgtoParcial.tit_recorrente[chave].tit_doc_vlr_bruto   = vlrPagoItem;
                                        $scope.objPgtoParcial.tit_recorrente[chave].tit_doc_vlr_liquido = vlrPagoItem;

                                        $scope.objPgtoParcial.tit_recorrente[chave].tit_faturado = 3;
                                        $scope.objPgtoParcial.tit_recorrente[chave].tit_dat_pgt  = GeralFactory.getDataAtualBrBanco(GeralFactory.getDataAtualBr());
                                    }
                                });
                            }

                            var objData = GeralFactory.getObjetoData($scope.objTela.dt_vct_nova);
                            var defData = new Date(objData.ano, objData.mes, objData.dia);

                            // Título a ser criado referente ao valor restante do pagamento parcial:
                            var descAtual = GeralFactory.getDescTitulo($scope.objPgtoParcial.tit_descricao, qtdeParcelas, $scope.objPgtoParcial.tit_fatura_seq);
                            var arrConta  = [{
                                'tit_faturado'        :  0,
                                'tit_doc_vlr_liquido' :  vlrRestante,
                                'tit_fatura_nro'      :  $scope.objTela.tit_fatura_nro,
                                'tit_periodicidade'   :  $scope.objPgtoParcial.tit_periodicidade,
                                'tit_dat_vct'         :  GeralFactory.getDataFormatadaBanco(defData),
                                'tit_dat_lan'         :  GeralFactory.getDataAtualBrBanco(GeralFactory.getDataAtualBr()),
                                'tit_descricao'       :  GeralFactory.getDescTitulo($scope.objPgtoParcial.tit_descricao, qtdeParcelas, ultima + 1),
                                'tit_observacao'      : 'Restante referente ao pagamento parcial do título: ' + descAtual
                            }];

                            // Novo título referente ao pagamento parcial:
                            var arrTemporario = $scope.objPgtoParcial.tit_recorrente.concat(arrConta);
                            $scope.objPgtoParcial.tit_recorrente   = arrTemporario;
                            $scope.objPgtoParcial.tit_descricao    = descAtual;
                            $scope.objPgtoParcial.tit_pgto_parcial = true;

                            console.log('Pgto parcial: ', $scope.objPgtoParcial);

                            // Fechando a janela modal para salvar os dados do pagamento parcial:
                            $scope.salvarPgtoParcialLoading = false;
                            $timeout(function() {

                                $modalInstance.hasAlteracao = true;
                                $modalInstance.objContaNovo = $scope.objPgtoParcial;
                                $scope.fecharModal('cancel');

                            }, 500);
                        }
                    }
                });
            }
        };


        /**
         * Método responsável em validar os dados do formulário de pagamento parcial de
         * um determinado título, valida datas e valores.
         */
        $scope.validar = function() {

            var vlrRestante = parseFloat($scope.objTela.vlr_restante);
            if (vlrRestante === 0) {
                var mensagem = 'Caro usuário, o valor restante não pode ser igual a 0!';
                return {
                    'error' : true,
                    'msg'   : mensagem
                };
            }

            var vlrQuitado = parseFloat($scope.objTela.vlr_quitado);
            if (vlrQuitado <= 0) {
                var mensagem = 'Caro usuário, o valor a ser quitado não pode ser menor ou igual a 0!';
                return {
                    'error' : true,
                    'msg'   : mensagem
                };
            }

            var dtVencimento = $scope.objTela.dt_vct_nova.split('/');
            dtVencimento = new Date(dtVencimento[2], dtVencimento[1] - 1, dtVencimento[0]);

            if (dtVencimento < Date.now()) {
                var mensagem = 'Caro usuário, a data para vencer não pode ser menor ou igual a data atual!';
                return {
                    'error' : true,
                    'msg'   : mensagem
                };
            }

            return {'error' : false};
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('FinanceiroBoletoModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$window', '$uibModalInstance', 'GeralFactory', 'ClienteService', 'FinanceiroService',

    function($scope, $rootScope, $timeout, $window, $uibModalInstance, GeralFactory, ClienteService, FinanceiroService) {

        $scope.forms      = {};
        $scope.objParams  = {};
        $scope.objBoleto  = {};
        $scope.objCliente = {};
        $scope.arrEmails  = [];
        $scope.codContato = null;

        $uibModalInstance.opened.then(function() {

            $uibModalInstance.hasAlteracao = false;
            $scope.objBoleto = $scope.params.objBoleto;

            // Verifica se já existe uma transação de boleto para o título em questão!
            $scope.hasBoleto = false;
            if ($scope.objBoleto.tit_transacao) {

                var objTransacao = $scope.objBoleto.tit_transacao;
                if (! _.isEmpty(objTransacao)) {

                    $scope.hasBoleto = true;
                    $scope.objParams['bol_email'] = objTransacao.tra_email_destino;
                }
            } else {

                // Recolhendo o e-mail do cliente deste título em questão!
                if ($scope.objBoleto.fin_cad_cod_cad) {

                    $scope.getCliente($scope.objBoleto.fin_cad_cod_cad);
                }
            }
        });


        /**
         * Método responsável em recolher as informações necessárias de um determinado cliente.
         * @param cad_cod_cad
         */
        $scope.getCliente = function(cad_cod_cad) {

            if (! $scope.hasBoleto) {

                ClienteService.cliente.get({cad_cod_cad : cad_cod_cad}, function(retorno) {
                    if (! _.isEmpty(retorno.records)) {

                        $scope.objCliente = retorno.records;
                        $scope.arrEmails  = retorno.records.listaContato.length ? retorno.records.listaContato : [];
                    }
                });
            }
        };


        /**
         * Método responsável em gerar a segunda via de um determinado boleto bancário, ou seja,
         * gera um novo boleto cancelando o antigo da base de dados.
         */
        $scope.gerarSegundaVia = function() {

            if ($scope.hasBoleto) {

                GeralFactory.confirmar('Deseja realmente gerar a segunda via do boleto bancário para este título?',function() {

                    var status = parseInt($scope.objBoleto.tit_transacao.tra_status_transacao);
                    if (_.contains([3, 5, 6, 7], status)) {

                        var mensagem = 'Não se pode gerar a segunda via para boletos pagos, cancelados ou contestados!';
                        GeralFactory.notify('warning', 'Atenção:', mensagem);

                    } else {

                        $scope.segundaViaLoading = true;

                        var mensagem = 'Aguarde alguns segundos pois a segunda via do boleto está sendo gerada!';
                        GeralFactory.notify('info', 'Informação:', mensagem);

                        if ($scope.objBoleto.fin_nro_lan && $scope.objBoleto.fatura_seq) {

                            var objBoleto = $scope.objBoleto;
                            objBoleto['fin_bol_email'] = GeralFactory.allReplace($scope.objParams.bol_email, {',' : '|'});

                            FinanceiroService.boleto.segundaVia(objBoleto, function(retorno) {
                                if (retorno.records) {

                                    var arrRetorno = retorno.records;
                                    $scope.finalizarGeracaoBoleto(arrRetorno, 'segundaViaLoading');
                                }
                            });
                        }
                    }
                });
            }
        };


        /**
         * Método responsável em gerar o boleto bancário para um determinado título escolhido
         * pelo usuário, permite alterar o e-mail para envio do boleto.
         */
        $scope.gerarBoleto = function() {

            $scope.salvarBoletoLoading = true;
            $scope.$watch('forms.formBoleto', function(form) {
                if (form) {
                    if (form.$invalid) {

                        $scope.submitted = true;
                        $scope.salvarBoletoLoading = false;

                    } else {

                        if ($scope.objParams.bol_email) {

                            var mensagem = 'Caro usuário, aguarde alguns segundos pois seu boleto está sendo gerado!';
                            GeralFactory.notify('info', 'Informação:', mensagem);

                            var objBoleto = $scope.objBoleto;
                            objBoleto['fin_bol_email'] = GeralFactory.allReplace($scope.objParams.bol_email, {',' : '|'});

                            FinanceiroService.pagamento.boleto({u : GeralFactory.formatarPesquisar(objBoleto)}, function(retorno) {
                                if (retorno.records) {

                                    var arrRetorno = retorno.records;
                                    $scope.finalizarGeracaoBoleto(arrRetorno, 'salvarBoletoLoading');
                                }
                            });
                        } else {

                            $scope.salvarBoletoLoading = false;
                            GeralFactory.notify('warning', 'Informação:', 'Caro usuário, escolha ao menos um contato!');
                        }
                    }
                }
            });
        };


        /**
         * Método responsável em definir qual endereço para geração da duplicata.
         */
        $scope.setContato = function(cto_cod_cto) {

            if (cto_cod_cto) {

                var keepGoing = true;
                $scope.codContato = cto_cod_cto;

                angular.forEach($scope.arrEmails, function(item) {
                    if (keepGoing) {
                        if (item.cto_cod_cto === cto_cod_cto) {
                            keepGoing = false;
                            $scope.objParams  = {
                                bol_email : (item.cto_email) ? item.cto_email.trim() : ''
                            };
                        }
                    }
                });
            }
        };


        /**
         * Método responsável em finalizar a geração do boleto e efetuar as devidas
         * tratativas na tela do financeiro no ato de gerar o boleto.
         */
        $scope.finalizarGeracaoBoleto = function(arrRetorno, strLadda) {

            if (arrRetorno.error) {

                var msg = arrRetorno.msg;
                GeralFactory.notify('danger', 'Atenção!', msg);
                $scope[strLadda] = false;

            } else {

                if (! _.isEmpty(arrRetorno.response.data)) {

                    $uibModalInstance.hasAlteracao = true;
                    $timeout(function() {

                        $scope[strLadda] = false;

                        var url = arrRetorno.response.data.link;
                        $window.open(url, 'Boleto Bancário');

                        $uibModalInstance.traCodTra = arrRetorno.tra_cod_tra;
                        $scope.fecharModal('cancel');

                    }, 1000);
                }
            }
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('DuplicataModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$window', '$uibModalInstance', 'ClienteService', 'GeralFactory', 'AuthTokenFactory',

    function($scope, $rootScope, $timeout, $window, $uibModalInstance, ClienteService, GeralFactory, AuthTokenFactory) {

        $scope.objDuplicata = {};
        $scope.arrEnderecos = [];
        $scope.fin_end_cod_end_cob = null;


        $uibModalInstance.opened.then(function() {

            $scope.objDuplicata = $scope.params.objDuplicata;
            $scope.getEnderecos();

            $uibModalInstance.end_cobranca = null;
        });


        /**
         * Método responsável em recolher uma lista contendo todos os endereços de
         * um determinado cliente que esteja vinculado a finança escolhida.
         */
        $scope.getEnderecos = function() {

            var objeto = {cad_cod_cad : $scope.objDuplicata.tit_cad_cod_cad};
            ClienteService.clienteEnderecos.get(objeto, function(retorno) {
                if (retorno.records) {

                    $scope.arrEnderecos = retorno.records;
                    $timeout(function() {
                        console.log('Endereços: ', $scope.arrEnderecos);
                        $scope.fin_end_cod_end_cob = $scope.objDuplicata.tit_venda.fin_end_cod_end_cob;
                    });
                }
            });
        };


        /**
         * Método responsável em gerar uma duplicata para um determinado título de
         * conta a receber escolhido pelo usuário.
         */
        $scope.gerarDuplicata = function() {

            if ($scope.fin_end_cod_end_cob) {

                $uibModalInstance.end_cobranca = $scope.fin_end_cod_end_cob;

                var strFiltro = GeralFactory.formatarPesquisar({
                    'tit_fatura_seq'      : $scope.objDuplicata.tit_fatura_seq,
                    'tit_fin_nro_lan'     : $scope.objDuplicata.tit_fin_nro_lan,
                    'fin_end_cod_end_cob' : $scope.fin_end_cod_end_cob,
                    'ken'                 : AuthTokenFactory.getToken()
                });

                var url = GeralFactory.getUrlApi() + '/erp/export/financa/duplicata/?' + strFiltro;
                $timeout(function() {
                    $window.open(url, 'Duplicata');
                    $scope.fecharModal('reload');
                }, 1000);

            } else {

                var mensagem = 'Caro usuário, escolha um endereço para efetuar a geração da duplicata!';
                GeralFactory.notify('warning', 'Atenção:', mensagem);
            }
        };


        /**
         * Método responsável em definir qual endereço para geração da duplicata.
         */
        $scope.setEnderecoCobranca = function(end_seq_end) {

            $scope.fin_end_cod_end_cob = end_seq_end;
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('FinanceiroCtfModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$window', '$uibModalInstance', 'ParamsService',

    function($scope, $rootScope, $timeout, $window, $uibModalInstance, ParamsService) {

        $scope.objContaFinanceira = {};

        $uibModalInstance.opened.then(function() {

            $uibModalInstance.hasAlteracao = false;
            $scope.params.par_pai && $scope.getContaFinanceira();
        });


        /**
         * Recolhe os dados de uma determinada conta financeira.
         */
        $scope.getContaFinanceira = function(par_pai) {

            par_pai = (par_pai) ? par_pai : $scope.params.par_pai;

            ParamsService.contaFinanceira.get({par_pai : par_pai}, function(retorno) {
                if (! _.isEmpty(retorno.records)) {

                    $timeout(function() {
                        $scope.objContaFinanceira = retorno.records;
                    });
                }
            });
        };


        /**
         * Método responsável em salvar os dados de uma determinada conta financeira.
         */
        $scope.salvarConta = function() {

            $scope.salvarContaFinanceiraLoading = true;
            $scope.$watch('forms.formContaFinanceira', function(form) {
                if (form) {
                    if (form.$invalid) {

                        $scope.submitted = true;
                        $scope.salvarContaFinanceiraLoading = false;

                    } else {

                        var objeto = $scope.objContaFinanceira;
                        if ($scope.params.par_pai) {

                            ParamsService.contaFinanceira.update(objeto, function(retorno) {
                                if (! retorno.records.error) {
                                    $scope.finalizar(retorno.records);
                                }
                            });

                        } else {

                            ParamsService.contaFinanceiras.create(objeto, function(retorno) {
                                if (! retorno.records.error) {
                                    $scope.finalizar(retorno.records);
                                }
                            });
                        }
                    }
                }
            });
        };


        /**
         * Método responsável em finalizar o processo de atualização ou inserção de uma
         * determinada conta financeira na base de dados.
         */
        $scope.finalizar = function(objRetorno) {

            $uibModalInstance.hasAlteracao = true;
            $scope.getContaFinanceira(objRetorno.par_pai);

            $timeout(function() {

                $uibModalInstance.objContaFinanceira = $scope.objContaFinanceira;
                $scope.salvarContaFinanceiraLoading  = false;
                $scope.fecharModal('reload');

            }, 1000);
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('TransferenciaModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$window', '$uibModalInstance', 'GeralFactory', 'ClienteService', 'ParamsService', 'FinanceiroService',

    function($scope, $rootScope, $timeout, $window, $uibModalInstance, GeralFactory, ClienteService, ParamsService, FinanceiroService) {

        $scope.objTransferencia = {};

        $uibModalInstance.opened.then(function() {

            $scope.initTransferencia();
            $uibModalInstance.hasAlteracao = false;
        });


        /**
         * Método responsável em inicializar os dados para a transferência entre contas.
         */
        $scope.initTransferencia = function() {

            $scope.objTransferencia = {
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
         * Método responsável em salvar os dados de uma determinada transferência.
         */
        $scope.salvarTransferencia = function() {

            $scope.salvarTransferenciaLoading = true;
            $scope.$watch('forms.formTransferenciaModal', function(form) {
                if (form) {
                    if (form.$invalid) {

                        $scope.submitted = true;
                        $scope.salvarTransferenciaLoading = false;

                    } else {

                        var vlrTransferencia = $scope.objTransferencia.tit_doc_vlr_bruto;
                        if (vlrTransferencia > 0) {

                            var objeto = $scope.objTransferencia;
                            FinanceiroService.financas.transferencia(objeto, function(retorno) {
                                if (! retorno.records.error) {

                                    $uibModalInstance.hasAlteracao = true;
                                    $timeout(function() {

                                        $uibModalInstance.objRetorno = retorno.records;
                                        $scope.fecharModal('reload');
                                    });
                                }
                            });
                        } else {

                            $scope.salvarTransferenciaLoading = false;
                            GeralFactory.notify('danger', 'Atenção:', 'O valor da transferência deve ser maior que zero!');
                        }
                    }
                }
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
        $scope.getContaFinanceira = function(par_pai, strAttr) {

            ParamsService.contaFinanceira.get({par_pai : par_pai}, function(retorno) {
                $scope.objContaFinanceira        = retorno.records;
                $scope.objTransferencia[strAttr] = par_pai;
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
         * Método responsável em adicionar uma determinada forma de pagamento diretamente pelo
         * componente de autocomplete contido na tela.
         */
        $scope.addFormaPagamento = function($item) {

            var objFormaPagamento = {
                par_c01 : $item.trim()
            };

            ParamsService.formaPagamentos.create(objFormaPagamento, function(retorno) {
                if (! retorno.records.error) {

                    $scope.objTransferencia.formaPagamento           = $item.trim();
                    $scope.objTransferencia.tit_6060_forma_pagamento = retorno.records.par_pai;
                }
            });
        };


        /**
         * Método responsável em retornar todas as informações de uma determinada forma de pagamento.
         */
        $scope.getFormaPagamento = function(par_pai) {

            if (par_pai) {

                ParamsService.formaPagamento.get({par_pai : par_pai}, function(retorno) {
                    $scope.objFormaPagamento                         = retorno.records;
                    $scope.objTransferencia.tit_6060_forma_pagamento = par_pai;
                });
            } else {

                ParamsService.formaPagamentos.get({u : ''}, function(retorno) {
                    $scope.arrFormasPgto = retorno.records;
                });
            }
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);