'use strict';

/**
 * Ao cancelar um contrato deve-se cancelar as recorrências? Sim!
 */

angular.module('newApp')

    .controller('ContratoCtrl', [

        '$scope', '$rootScope', '$uibModal', '$timeout', '$window', 'prompt', 'GeralFactory', 'Constantes', 'ContratoService', 'ClienteService', 'ParamsService', 'VendaService', 'AuthTokenFactory',

        function ($scope, $rootScope, $uibModal, $timeout, $window, prompt, GeralFactory, Constantes, ContratoService, ClienteService, ParamsService, VendaService, AuthTokenFactory) {
            
            $rootScope.hasAutorizacao();

            $scope.forms        = {};
            $scope.objCliente   = {};
            $scope.objServico   = {};
            $scope.objPesquisa  = {};
            $scope.objContrato  = {};
            $scope.arrServicos  = [];
            $scope.arrContratos = [];
            $scope.arrHistorico = [];

            $scope.$on('$viewContentLoaded', function() {

                $scope.flagTutorial  =  true;
                $scope.siglaTutorial = 'CON';
                $scope.labelTutorial = 'Cadastro de novos contratos';

                $scope.initContrato();
                $scope.initDropzone();

                $scope.arrEmissoes = [{
                    'id'   :  0,
                    'name' : 'Ao quitar cobrança'
                }, {
                    'id'   :  1,
                    'name' : 'Ao emitir cobrança'
                }];

                $scope.arrTipoCobranca = [{
                    'id'   :  1,
                    'name' : 'Único'
                }, {
                    'id'   :  2,
                    'name' : 'Até a validade'
                }, {
                    'id'   :  3,
                    'name' : 'Recorrente'
                }, {
                    'id'   :  4,
                    'name' : 'Carnê até a validade do contrato'
                }];

                $scope.arrPeriodicidade = [{
                    'id'   :  30,
                    'name' : 'Mensal'
                }, {
                    'id'   :  90,
                    'name' : 'Trimestral'
                }, {
                    'id'   :  180,
                    'name' : 'Semestral'
                }, {
                    'id'   :  365,
                    'name' : 'Anual'
                }];
            });


            /**
             * Inicializa os dados e componentes na tela de contratos.
             */
            $scope.initContrato = function() {

                $scope.resetObjetos();
                $scope.listarContratos();
            };


            /**
             * Prepara a tela para criação de um novo contrato.
             */
            $scope.novoContrato = function() {

                $scope.setAbaWizard(0);
                $scope.initAbaCobranca();
                $scope.resetObjetos();

                $scope.aliasStatus  = 'INATIVO';
                $scope.cttSelected  =  null;
                $scope.flagTutorial =  false;
                $scope.forms.formContrato.$setPristine();
            };


            /**
             * Inicializa os principais objetos da tela de contratos.
             */
            $scope.resetObjetos = function() {

                $scope.arrServicos  = [];
                $scope.arrHistorico = [];
                $scope.objCliente   = {};
                $scope.objServico   = {
                    itens_produto       : [],
                    somaDespesas        : 0,
                    somaDescontos       : 0,
                    somaTotalLiquido    : 0,
                    somaImpostosRetidos : 0
                };

                $scope.objContrato = {
                    strVendedor        : '',
                    strCliente         : '',
                    strServico         : '',
                    strFormaPgto       : '',
                    strCentroCusto     : '',
                    strContaFinanceira : '',
                    objMidia           : {},
                    objCliente         : {},
                    objServico         : {
                        somaDespesas        : 0,
                        somaDescontos       : 0,
                        somaTotalLiquido    : 0,
                        somaImpostosRetidos : 0
                    },
                    ctt_vlr_tot           : 0,
                    ctt_qtde_cob_emi      : 0,
                    ctt_qtde_cob_res      : 0,
                    ctt_eh_ativo          : true,
                    ctt_cod_periodicidade : 30,
                    ctt_dias_para_faturar : 15,
                    ctt_tip_cobranca      : 3
                };

                $scope.objFiltroCliente = {
                    cad_tip_cli_for : 1
                };
            };


            /**
             * Efetua a pesquisa de contratos de acordo com os filtros utilizados pelo usuário.
             */
            $scope.getPesquisar = function() {

                $timeout(function() {
                    $scope.listarContratos();
                }, 100);
            };


            /**
             * Efetua a listagem dos contratos.
             */
            $scope.listarContratos = function() {

                $rootScope.spinnerList.on();
                $scope.arrContratos = [];

                var objFiltro = $scope.getFiltros();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=0');

                ContratoService.contratos.get({u: strFiltro}, function(retorno) {
                    if (retorno.records.length > 0) {

                        $timeout(function() {
                            $scope.arrContratos = retorno.records;
                            $rootScope.spinnerList.off();
                        });
                    } else {

                        $rootScope.spinnerList.off();
                    }
                });
            };


            /**
             * Gera a paginação por demanda da listagem de contratos.
             */
            $scope.paginarContratos = function() {

                $rootScope.spinnerList.on();

                var objFiltro = $scope.getFiltros();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=' + $scope.getOffset());

                ContratoService.contratos.get({u: strFiltro}, function(retorno) {
                    if (retorno.records.length > 0) {

                        angular.forEach(retorno.records, function(item) {
                            $scope.arrContratos.push(item);
                        });

                        $timeout(function() {
                            $rootScope.spinnerList.off();
                        });
                    } else {

                        $rootScope.spinnerList.off();
                        GeralFactory.notify('warning', 'Atenção:', 'Caro usuário, a listagem de contratos já se encontra completa!');
                    }
                });
            };


            /**
             * Retorna o limite de registros para a paginação.
             */
            $scope.getOffset = function() {

                return ($scope.arrContratos.length) ? $scope.arrContratos.length : 0;
            };


            /**
             * Retorna o objeto contendo os filtros utilizados pelo usuário.
             */
            $scope.getFiltros = function() {

                var objFiltro = {
                    'ctt_str_pesquisa' : GeralFactory.replaceArray($scope.objPesquisa.ctt_str_pesquisa, ['.', '/', '-'], '')
                };

                return objFiltro;
            };


            /**
             * Retorna os dados de um determinado contrato.
             */
            $scope.getContrato = function(objContrato) {

                $scope.arrHistorico = [];
                $scope.flagTutorial = false;

                $rootScope.spinnerForm.on();

                var objeto = {
                    'ctt_cod_ctt' : objContrato.ctt_cod_ctt,
                    'ctt_num_seq' : objContrato.ctt_num_seq
                };

                $scope.cttSelected = objContrato.ctt_cod_ctt;

                ContratoService.contrato.get(objeto, function(retorno) {
                    if (! _.isEmpty(retorno.records)) {

                        var arrContrato = retorno.records;
                        $scope.objContrato = arrContrato;

                        var status = parseInt(arrContrato.ctt_eh_ativo);

                        $scope.objContrato.ctt_dat_ven  = GeralFactory.formatarDataBr(arrContrato.ctt_dat_ven);
                        $scope.objContrato.ctt_eh_ativo = status === 1 ? true : status;

                        var tpCobranca = arrContrato.ctt_tip_cobranca;
                        if (tpCobranca && tpCobranca !== 3) {

                            var dtValidade = GeralFactory.formatarDataBr(arrContrato.ctt_dat_val_contrato);
                            $scope.objContrato.ctt_dat_val_contrato = dtValidade;
                        }

                        $timeout(function() {

                            $scope.setServico();
                            $scope.getCliente(arrContrato.ctt_cad_cod_cad);

                            $scope.initDropzone();
                            $scope.setAbaWizard(0);
                            $scope.initAbaCobranca();
                            $rootScope.spinnerForm.off();

                        }, 300);
                    }
                });
            };
            


            /**
             * Inicializa os dados do serviço logo depois de recolher os dados do contrato.
             */
            $scope.setServico = function() {

                $scope.objServico = $scope.objContrato.objServico;

                var arrServicos = new Array();
                arrServicos.push({
                    'fin_doc_nro'         : $scope.objServico.fin_doc_nro,
                    'fin_dat_lan'         : $scope.objServico.fin_dat_lan,
                    'fin_nro_lan'         : $scope.objServico.fin_nro_lan,
                    'fin_cad_nome_razao'  : $scope.objServico.fin_cad_nome_razao,
                    'fin_doc_vlr_liquido' : $scope.objServico.fin_doc_vlr_liquido
                });

                $scope.arrServicos = arrServicos;
                $scope.objContrato.strServico = $scope.objServico.fin_doc_nro;

                $scope.getTotalizacao();
            };


            /**
             * Salva os dados de um determinado contrato.
             */
            $scope.salvarContrato = function() {

                $scope.salvarContratoLoading = true;

                var arrVerifica = $scope.getVerificaContrato();
                if (arrVerifica['error']) {

                    $scope.salvarContratoLoading = false;
                    GeralFactory.notify('warning', 'Atenção!', arrVerifica['msg']);

                } else {

                    var form = $scope.forms.formContrato;
                    if (form.$invalid) {

                        $scope.submitted = true;
                        $scope.salvarContratoLoading = false;

                    } else {

                        var objeto = $scope.objContrato;

                        objeto.ctt_vlr_tot  =  objeto.objServico.somaTotalLiquido;
                        objeto.ctt_eh_ativo = ((objeto.ctt_eh_ativo != 2) ? ((objeto.ctt_eh_ativo === true) ? 1 : objeto.ctt_eh_ativo) : 2);

                        if (objeto.ctt_cod_ctt) {

                            ContratoService.contrato.update($scope.objContrato, function(retorno) {
                                if (retorno.records) {

                                    $scope.salvarContratoLoading = false;
                                    $timeout(function() {

                                        var objeto = {
                                            'ctt_cod_ctt' : retorno.records.ctt_cod_ctt,
                                            'ctt_num_seq' : retorno.records.ctt_num_seq
                                        };

                                        $scope.listarContratos();
                                        $scope.getContrato(objeto);

                                        console.log('Atualização: ', retorno.records);
                                    });
                                }
                            });

                        } else {

                            $scope.objContrato.ctt_dat_emissao_proxima = $scope.getDataGatilhoEmissao();

                            var tpCobranca = parseInt($scope.objContrato.ctt_tip_cobranca);
                            var dtValidade = $scope.objContrato.ctt_dat_val_contrato;

                            if (tpCobranca === 1) {

                                dtValidade = $scope.objContrato.ctt_dat_ven;
                                $scope.objContrato.ctt_cod_periodicidade = 0;
                            }

                            $scope.objContrato.ctt_dat_val_contrato = dtValidade;
                            ContratoService.contratos.create($scope.objContrato, function(retorno) {
                                if (retorno.records) {

                                    $scope.salvarContratoLoading = false;
                                    $timeout(function() {

                                        var objeto = {
                                            'ctt_cod_ctt' : retorno.records.ctt_cod_ctt,
                                            'ctt_num_seq' : retorno.records.ctt_num_seq
                                        };

                                        $scope.listarContratos();
                                        $scope.getContrato(objeto);

                                        console.log('Inserção: ', retorno.records);
                                    });
                                }
                            });
                        }
                    }
                }
            };


            /**
             * Retorna a data de gatilho do CRON para um novo contrato.
             */
            $scope.getDataGatilhoEmissao = function() {

                var dtGatilho = GeralFactory.delDiasData($scope.objContrato.ctt_dat_ven, parseInt($scope.objContrato.ctt_dias_para_faturar));

                dtGatilho = dtGatilho.split('/');
                dtGatilho = dtGatilho[2] + '-' + dtGatilho[1] + '-' + dtGatilho[0];

                return dtGatilho;
            };


            /**
             * Verifica se existe algum erro antes de salvar o contrato.
             */
            $scope.getVerificaContrato = function() {

                var tpCobranca = $scope.objContrato.ctt_tip_cobranca;

                if (! $scope.objContrato.ctt_cad_cod_cad) {
                    return {
                        'error' :  true,
                        'msg'   : 'Para salvar os dados do contrato é necessário escolher um cliente!'
                    };
                }

                if (! $scope.objContrato.ctt_fin_nro_lan) {
                    return {
                        'error' :  true,
                        'msg'   : 'Para salvar os dados do contrato é necessário escolher um serviço!'
                    };
                }

                if ($scope.objContrato.objServico.somaTotalLiquido <= 0) {
                    return {
                        'error' :  true,
                        'msg'   : 'Caro usuário, o valor do contrato não pode ser menor ou igual a zero!'
                    };
                }

                if (tpCobranca && (tpCobranca != 1 && !$scope.objContrato.ctt_cod_periodicidade)) {
                    $scope.setAbaWizard(2);
                    return {
                        'error' :  true,
                        'msg'   : 'Para salvar os dados do contrato é necessário escolher uma periodicidade!'
                    };
                }

                if (! $scope.objContrato.ctt_dat_ven) {
                    $scope.setAbaWizard(2);
                    return {
                        'error' :  true,
                        'msg'   : 'Para salvar os dados do contrato é necessário entrar com a data de vencimento!'
                    };
                }

                if (tpCobranca && (tpCobranca === 2 || tpCobranca === 4) && !$scope.objContrato.ctt_dat_val_contrato) {
                    $scope.setAbaWizard(2);
                    return {
                        'error' :  true,
                        'msg'   : 'Para salvar os dados do contrato é necessário entrar com a data de validade!'
                    };
                }

                if ($scope.objContrato.ctt_dias_para_faturar) {
                    var diasParaVencimento = parseInt($scope.objContrato.ctt_dias_para_faturar);
                    if (diasParaVencimento < 3 || diasParaVencimento > 31) {
                        return {
                            'error' :  true,
                            'msg'   : 'O campo dias para faturar não pode ser menor que 3 ou maior que 31!'
                        };
                    }
                }

                if (! $scope.objContrato.ctt_cod_ctt) {

                    var dtVencimento = $scope.objContrato.ctt_dat_ven.split('/');
                    dtVencimento = new Date(dtVencimento[2], dtVencimento[1] - 1, dtVencimento[0]);

                    if (dtVencimento < Date.now()) {
                        return {
                            'error' :  true,
                            'msg'   : 'Caro usuário, a data para vencimento não pode ser menor ou igual a data atual!'
                        };
                    }
                }

                return {'error' : false};
            };


            /**
             * Efetua a busca do histórico de recorrências de um determinado contrato.
             */
            $scope.listarHistorico = function() {

                if ($scope.objContrato.ctt_cod_ctt && _.isEmpty($scope.arrHistorico)) {

                    $rootScope.spinnerForm.on();

                    var strFiltro = GeralFactory.formatarPesquisar({
                        'ctt_all_ctt' : true,
                        'ctt_cod_ctt' : $scope.objContrato.ctt_cod_ctt
                    });

                    ContratoService.contratos.get({u: strFiltro}, function(retorno) {
                        if (retorno.records.length > 0) {

                            var arrHistorico = retorno.records;
                            $timeout(function() {

                                $scope.arrHistorico  = arrHistorico;
                                $scope.qtdeHistorico = arrHistorico.length;
                                $rootScope.spinnerForm.off();

                            });
                        } else {

                            $rootScope.spinnerForm.off();
                        }
                    });
                }
            };


            /**
             * Cancela um determinado contrato.
             */
            $scope.cancelarContrato = function() {

                if ($scope.objContrato.ctt_cod_ctt) {

                    GeralFactory.confirmar('Deseja cancelar o contrato em questão?', function() {

                        $scope.salvarContratoLoading = true;
                        var objeto = {
                            'ctt_cod_ctt': $scope.objContrato.ctt_cod_ctt,
                            'ctt_num_seq': $scope.objContrato.ctt_num_seq
                        };

                        ContratoService.contrato.cancelar(objeto, function(retorno) {
                            if (retorno.records) {

                                $scope.salvarContratoLoading = false;
                                $timeout(function() {

                                    $scope.initAbaCobranca();
                                    $scope.initContrato();

                                }, 1000);
                            }
                        });
                    });
                }
            };


            /**
             * Efetua a configuração do plugin de DRAG AND DROP para upload dos contratos.
             */
            $scope.initDropzone = function() {

                var objParams = {
                    mid_tab         : 13,
                    mid_status      : 1,
                    mid_posicao     : '',
                    mid_link        : '',
                    mid_descricao   : '',
                    mid_tab_cod     : $scope.objContrato.ctt_cod_ctt ? $scope.objContrato.ctt_cod_ctt : 0,
                    mid_tab_cod_sub : $scope.objContrato.ctt_num_seq ? $scope.objContrato.ctt_num_seq : 0
                };

                $scope.dropzoneConfig = {
                    'options' : {
                        'url' : ContratoService.midia.getUrlUpload(),
                        'headers' : {
                            'Authorization' : 'Bearer ' + AuthTokenFactory.getToken()
                        },
                        'clickable'           :  false,
                        'params'              :  objParams,
                        'acceptedFiles'       : '.doc, .docx, .pdf',
                        'dictInvalidFileType' : 'Apenas arquivos .DOC e .PDF são aceitos!'
                    },
                    'eventHandlers' : {
                        'sending' : function(file, xhr, formData) {

                            formData.append('mid_tab_cod', $scope.objContrato.ctt_cod_ctt);
                            formData.append('mid_tab_cod_sub', $scope.objContrato.ctt_num_seq);

                        },
                        'success' : function(file, response) {

                            var objResposta = response.records;
                            if (objResposta.error) {

                                $scope.objContrato.objMidia = null;
                                GeralFactory.notify('danger', objResposta.title, objResposta.msg);

                            } else {

                                GeralFactory.notify('success', 'Sucesso', 'Documento enviado com sucesso!');
                                $timeout(function() {

                                    $scope.objContrato.objMidia = objResposta.arr_mid;
                                    $scope.atualizarGridContratos(objResposta.arr_mid);

                                });
                            }
                        },
                        'complete' : function(file) {

                            console.log('Arquivo: ', file);
                            this.removeFile(file);
                        }
                    }
                };
            };


            /**
             * Atualiza os dados de um determinado registro na GRID de contratos.
             */
            $scope.atualizarGridContratos = function(objMidia) {

                if (! _.isEmpty($scope.arrContratos) && $scope.cttSelected) {

                    var keepGoing = true;
                    angular.forEach($scope.arrContratos, function(item, chave) {
                        if (keepGoing) {

                            var cttCodCtt = item.ctt_cod_ctt;
                            if (cttCodCtt == $scope.cttSelected) {

                                $scope.arrContratos[chave]['ctt_mid_id'] = objMidia.mid_id;
                                keepGoing = false;
                            }
                        }
                    });
                }
            };


            /**
             * Efetua o download do modelo de contrato.
             */
            $scope.downloadContrato = function() {

                if ($scope.objContrato.objMidia) {

                    var url = $rootScope.documentCache + $scope.objContrato.objMidia.mid_id;
                    $window.open(url);

                } else {

                    var mensagem = 'Caro usuário, esse contrato ainda não possui documento anexado!';
                    GeralFactory.notify('warning', 'Atenção!', mensagem);
                }
            };


            /**
             * Retorna os serviços de acordo com o código ou número do mesmo pesquisados.
             */
            $scope.listarServicos = function() {

                if ($scope.objContrato.strServico === '') {

                    var mensagem = 'Efetue a pesquise de um serviço!';
                    GeralFactory.notify('warning', 'Atenção!', mensagem);

                } else {

                    var codNaturezaServico = 31;
                    $rootScope.spinnerForm.on();

                    var strFiltro = GeralFactory.formatarPesquisar({
                        'texto_contrato'    : $scope.objContrato.strServico.trim(),
                        'fin_6020_natureza' : codNaturezaServico
                    });

                    VendaService.vendas.get({u: strFiltro, op: 'prest-servico'}, function(retorno) {
                        if (retorno.records) {

                            $scope.arrServicos = retorno.records;
                            var qtde = $scope.arrServicos.length;
                            if (qtde == 1) {

                                $scope.getServico($scope.arrServicos[0].fin_nro_lan);
                                console.log('Dados do serviço: ', $scope.arrServicos[0]);

                            } else if (qtde === 0) {

                                $scope.objServico  = {};
                                $scope.arrServicos = [];
                                $rootScope.spinnerForm.off();

                            } else {

                                $rootScope.spinnerForm.off();
                            }
                        }
                    });
                }
            };


            /**
             * Retorna os dados de um determinado serviço selecionado pelo usuário.
             */
            $scope.getServico = function(finNroLan) {

                $scope.objContrato.ctt_fin_nro_lan = finNroLan;
                var objServico = {
                    op          : 'prest-servico',
                    fin_nro_lan :  finNroLan
                };

                VendaService.venda.get(objServico, function(retorno) {
                    if (retorno.records) {

                        $scope.objServico = retorno.records;
                        $timeout(function() {

                            $scope.getTotalizacao();
                            $scope.objContrato.objServico = $scope.objServico;
                            $rootScope.spinnerForm.off();
                        });
                    }
                });
            };


            /**
             * Efetua a totalização dos impostos e itens do serviço.
             */
            $scope.getTotalizacao = function() {

                var somaValor     = 0,
                    somaImpostos  = 0,
                    somaDespesas  = 0,
                    somaDescontos = 0,
                    somaLiquida   = 0;

                angular.forEach($scope.objServico.itens_produto, function(item, chave) {

                    var valorBrutoItem = 0;

                    if ($scope.objServico.fin_nfe_finalidade === 2) {

                        valorBrutoItem = (item.ite_pro_qtd > 0) ? ((item.ite_pro_qtd) * (item.ite_vlr_uni_bruto)) : item.ite_vlr_uni_bruto;

                    } else {

                        valorBrutoItem = ((item.ite_pro_qtd) * (item.ite_vlr_uni_bruto));
                    }

                    valorBrutoItem = GeralFactory.roundNumber(valorBrutoItem, 2);

                    somaValor     = parseFloat(somaValor) + valorBrutoItem;
                    somaImpostos  = parseFloat(somaImpostos) + parseFloat(item.ite_vlr_tot_impostos_retidos);
                    somaDespesas  = parseFloat(somaDespesas) + parseFloat(item.ite_vlr_tot_despesas);
                    somaDescontos = parseFloat(somaDescontos) + parseFloat(item.ite_vlr_tot_desconto);

                    somaLiquida = parseFloat(somaLiquida) + parseFloat(item.ite_vlr_tot_liquido);
                    somaLiquida = GeralFactory.roundNumber(somaLiquida, 2);

                    $scope.objServico.itens_produto[chave].ite_vlr_tot_bruto   = valorBrutoItem;
                    $scope.objServico.itens_produto[chave].ite_vlr_tot_liquido = GeralFactory.roundNumber(item.ite_vlr_tot_liquido, 2);
                });

                $scope.objServico.fin_doc_vlr_bruto   = somaValor;
                $scope.objServico.somaDespesas        = somaDespesas;
                $scope.objServico.somaDescontos       = somaDescontos;
                $scope.objServico.somaImpostosRetidos = somaImpostos;

                var somaTotLiquido4Digitos = somaValor + somaDespesas + somaImpostos - somaDescontos;

                somaLiquida = GeralFactory.roundNumber(somaLiquida, 2);
                somaTotLiquido4Digitos = GeralFactory.roundNumber(somaTotLiquido4Digitos, 2);

                $scope.objServico.somaTotalLiquido = somaTotLiquido4Digitos;
            };


            /**
             * Aplica regras específicas a tela de acordo com o cliente escolhido.
             */
            $scope.onSelectCliente = function(objCliente) {

                $scope.getCliente(objCliente.cad_cod_cad);
                $scope.objContrato.strCliente = objCliente.cad_nome_razao;
            };


            /**
             * Retorna os dados de um determinado cliente.
             */
            $scope.getCliente = function(cadCodCad) {

                var objeto = {
                    cad_cod_cad : cadCodCad
                };

                $scope.objContrato.ctt_cad_cod_cad = cadCodCad;
                ClienteService.cliente.get(objeto, function(retorno) {
                    if (retorno.records) {

                        var objCliente = retorno.records;

                        $scope.objCliente = objCliente;
                        $scope.objCliente.contato = objCliente.listaContato[0];

                        // Atribuindo os dados do cliente escolhido ao contrato em questão:
                        $scope.objContrato.objCliente = $scope.objCliente;
                        $scope.objContrato.strCliente = objCliente.cad_nome_razao;
                    }
                });
            };


            /**
             * Aplica regras específicas a tela de acordo com o vendedor escolhido.
             */
            $scope.onSelectVendedor = function(objVendedor) {

                $scope.objContrato.strVendedor          = objVendedor.par_c01;
                $scope.objContrato.ctt_vnd_cod_vendedor = objVendedor.par_pai;
            };


            /**
             * Aplica regras específicas a tela de acordo com o centro de custo escolhido.
             */
            $scope.onSelectCentroCusto = function(objCentroCusto) {

                $scope.objContrato.ctt_6050_cdc   = objCentroCusto.par_pai;
                $scope.objContrato.strCentroCusto = objCentroCusto.par_c01;
            };


            /**
             * Aplica regras específicas a tela de acordo com a conta finan. escolhida.
             */
            $scope.onSelectContaFinanceira = function(objContaFinan) {

                $scope.objContrato.ctt_5010_conta_fin = objContaFinan.par_pai;
                $scope.objContrato.strContaFinanceira = objContaFinan.par_c01;
            };


            /**
             * Adiciona uma nova conta financeira diretamente pelo componente de autocomplete.
             */
            $scope.addContaFinanceira = function($item) {

                var objContaFinanceira = {
                    par_c01 : $item.trim()
                };

                ParamsService.contaFinanceiras.create(objContaFinanceira, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.objContrato.strContaFinanceira = $item.trim();
                        $scope.objContrato.ctt_5010_conta_fin = retorno.records.par_pai;
                    }
                });
            };


            /**
             * Aplica regras específicas a tela de acordo com a forma de pgto. escolhida.
             */
            $scope.onSelectFormaPgto = function(objFormaPgto) {

                $scope.objContrato.strFormaPgto             = objFormaPgto.par_c01;
                $scope.objContrato.ctt_6060_forma_pagamento = objFormaPgto.par_pai;
            };


            /**
             * Adiciona uma nova forma de pgto. diretamente pelo componente de autocomplete.
             */
            $scope.addFormaPgto = function($item) {

                var objFormaPagamento = {
                    par_c01 : $item.trim()
                };

                ParamsService.formaPagamentos.create(objFormaPagamento, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.objContrato.strFormaPgto             = $item.trim();
                        $scope.objContrato.ctt_6060_forma_pagamento = retorno.records.par_pai;
                    }
                });
            };


            /**
             * Abertura da janela modal de clientes para edição dos dados do mesmo.
             */
            $scope.openModalCliente = function(cadCodCad) {

                if (cadCodCad) {

                    var scope = $rootScope.$new();

                    scope.params = {};
                    scope.params.str_titular = $scope.objCliente.cad_tip_cli_for === 1 ? 'cliente' : 'fornecedor';
                    scope.params.cad_cod_cad = cadCodCad;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'cliente/views/janela-cliente.html',
                        controller  : 'ClienteModalCtrl',
                        size        : 'lg',
                        windowClass : 'center-modal no-top-modal',
                        scope       :  scope
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (modalInstance.hasAlteracao) {

                            scope.$destroy();
                            $scope.getCliente(cadCodCad);
                        }
                    });
                }
            };


            /**
             * Controle das abas de observação e histórico na guia de cobranças.
             */
            $scope.initAbaCobranca = function() {

                $timeout(function() {

                    var seletor = '#tab-contrato-observacao a';
                    angular.element(seletor).trigger('click');

                }, 200);
            };


            /**
             * Efetua a transição para uma determinada aba.
             */
            $scope.setAbaWizard = function(aba) {

                $timeout(function () {

                    var seletor = '.sf-nav-step-' + aba;
                    angular.element(seletor).trigger('click');

                }, 100);
            };


            /**
             * Transição entre as abas a partir da ação de voltar.
             */
            $scope.voltar = function() {

                $timeout(function() {

                    var abaAtiva = angular.element('.sf-active').attr('class');
                    if (abaAtiva) {

                        var aba = parseInt(abaAtiva.match(/\d+/)[0]);
                        if (aba === 0) {

                            $scope.resetObjetos();
                            $scope.flagTutorial = true;

                        } else {

                            var seletor = '.sf-nav-step-' + (aba - 1);
                            angular.element(seletor).trigger('click');
                        }
                    }

                }, 100);
            };
        }
    ]);