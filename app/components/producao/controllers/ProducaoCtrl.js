'use strict';

angular.module('newApp')

    .controller('ProducaoCtrl', [

        '$scope', '$rootScope', '$uibModal', '$timeout','$location', 'VendaService', 'ProdutoService', 'ParamsService', 'GeralFactory', 'Constantes', 'NotifyFlag', 'AuthTokenFactory', 'Wizard',

        function ($scope, $rootScope, $uibModal, $timeout, $location, VendaService, ProdutoService, ParamsService, GeralFactory, Constantes, NotifyFlag, AuthTokenFactory, Wizard) {

            $rootScope.hasAutorizacao();
            $scope.$on('$viewContentLoaded', function() {

                $scope.objPesquisa  = { };
                $scope.objProduto   = { };
                $scope.arrFases     = [ ];
                $scope.arrRegistros = [ ];

                $scope.hasFilter    = false;
                $scope.flagTutorial = true;

                $scope.initProducao();
                $scope.listarParams();
                $scope.listar();
            });

            $scope.initProducao = function() {

                $scope.incremento  = 0;
                $scope.objItem     = { };
                $scope.objTela     = { };
                $scope.objProducao = {
                    itens                   : [ ],
                    itens_produto           : [ ],
                    itens_parcelas          : [ ],
                    transporte              : { },
                    valorIpi                :  0,
                    valorIcmsSt             :  0,
                    acao                    :  0,
                    descAcao                :  GeralFactory.getDescAcao(0)[2],
                    fin_dat_lan             :  GeralFactory.getDataAtualBr(),
                    fin_cod_periodicidade   :  0,
                    fin_av_ap               :  0,
                    fin_modelo_referenciada :  0,
                    fin_tip_emitente        : 'P'
                };

                $scope.setObjetoTela();
                $scope.objFlags = {
                    add_item : true,
                    lib_item : true,
                    qtd_item : false
                };

                $scope.objProducao.fin_6020_natureza = $scope.objTela.cod_natureza;
                $scope.objProducao.fin_6030_esp_doc  = $scope.objTela.espec_documento;

                $scope.salvarVendaLoading = false;
            };


            $scope.listarParams = function() {

                ParamsService.params.get({u : ''}, function(resposta) {
                    if (resposta.records) {

                        $scope.arr_6035 = resposta.records.arr_6035;
                        $scope.arr_6025 = resposta.records.arr_6025;

                        $timeout(function() {
                            var i = 0;
                            var codNatureza = $scope.objProducao.fin_6020_natureza;
                            angular.forEach($scope.arr_6025, function(item) {
                                if (codNatureza === item.par_i01) {

                                    $scope.arrFases[i] = item;
                                    i++;
                                }
                            });
                        }, 500);
                    }
                });

                $scope.arrAcoes = [{
                    'id'   :  0,
                    'name' : 'Pendente'
                }, {
                    'id'   :  1,
                    'name' : 'Lançado'
                }];
            };

            
            $scope.novo = function() {

                $scope.flagTutorial = false;
                $scope.forms.formProducao.$setPristine();
                $scope.initProducao();
            };


            $scope.setObjetoTela = function() {

                var tipo = $location.$$path.replace('/', '');
                switch (tipo)
                {
                    case 'saida-insumos':
                        $scope.objProducao['fin_sistema']       = 1;
                        $scope.objProducao['fin_6020_natureza'] = 15;

                        $scope.siglaTutorial = 'INS';
                        $scope.labelTutorial = 'Cadastro de novas saídas de insumos';

                        $scope.objTela = {
                            opcao           : 'saida-insumos',
                            nome_natureza   : 'Saída de Insumos',
                            icone_natureza  : 'fa-ticket',
                            cod_natureza    :  15,
                            espec_documento :  115,
                            filtro_produto  :  {
                                pro_eh_servico   : 'N',
                                pro_tip_producao : 'I'
                            }
                        };

                        $timeout(function () {
                            Wizard.loadWizards.initialize(56);
                        }, 2000);

                        break;

                    case 'entrada-producao':
                        $scope.objProducao['fin_sistema']       = 2;
                        $scope.objProducao['fin_6020_natureza'] = 16;

                        $scope.siglaTutorial = 'EPR';
                        $scope.labelTutorial = 'Cadastro de novas entradas de produção';

                        $scope.objTela = {
                            opcao           : 'entrada-producao',
                            nome_natureza   : 'Entrada de Produção',
                            icone_natureza  : 'fa-database',
                            cod_natureza    :  16,
                            espec_documento :  116,
                            filtro_produto  :  {
                                pro_eh_servico   : 'N',
                                pro_tip_producao : 'P'
                            }
                        };

                        $timeout(function () {
                            Wizard.loadWizards.initialize(55);
                        }, 2000);

                        break;
                }
            };


            $scope.voltar = function() {

                $timeout(function() {

                    $scope.flagTutorial = true;
                    $scope.forms.formProducao.$setPristine();
                    $scope.initProducao();

                });
            };


            $scope.getPesquisar = function() {

                $timeout(function() {

                    $scope.hasFilter && $scope.showPanel();
                    $scope.listar();

                });
            };


            $scope.listar = function() {

                $rootScope.spinnerList.on();
                $timeout(function() {

                    $scope.arrRegistros = [];

                    var objFiltro = $scope.getFiltros();
                    var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=0');

                    VendaService.vendas.get({u : strFiltro, op : $scope.objTela.opcao}, function(retorno) {
                        if (retorno.records.length > 0) {

                            $timeout(function() {
                                $scope.iterar(retorno.records, true);
                                $rootScope.spinnerList.off();
                            });
                        } else {

                            $rootScope.spinnerList.off();
                        }
                    });

                }, 1000);
            };


            $scope.paginar = function() {

                $rootScope.spinnerList.on();

                var objFiltro = $scope.getFiltros();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=' + (($scope.arrRegistros.length) ? $scope.arrRegistros.length : 0));

                VendaService.vendas.get({u : strFiltro, op : $scope.objTela.opcao}, function(retorno) {
                    if (retorno.records.length > 0) {
                        $timeout(function() {

                            $scope.iterar(retorno.records, false);
                            $rootScope.spinnerList.off();

                        }, 1000);
                    } else {

                        $rootScope.spinnerList.off();
                        GeralFactory.notify('warning', 'Atenção:', 'Caro usuário, a listagem já se encontra completa!');
                    }
                });
            };


            $scope.getFiltros = function() {

                var strAcoes  = GeralFactory.getStringFiltroOffArray($scope.objPesquisa.acoes, 'id');

                var strFiltro = GeralFactory.replaceArray($scope.objPesquisa.texto_venda_pesquisar, ['.', '/', '-'], '');
                var objFiltro = {
                    'vendas_validas'        : 1,
                    'arr_acoes'             : (strAcoes) ? strAcoes : '',
                    'texto_venda_pesquisar' : (strFiltro) ? strFiltro : '',
                    'dt_lan_inicio'         : ($scope.objPesquisa.dt_lan_inicio)       ? $scope.objPesquisa.dt_lan_inicio       : '',
                    'dt_lan_final'          : ($scope.objPesquisa.dt_lan_final)        ? $scope.objPesquisa.dt_lan_final        : '',
                    'doc_nro_inicio'        : ($scope.objPesquisa.doc_nro_inicio)      ? $scope.objPesquisa.doc_nro_inicio      : '',
                    'doc_nro_final'         : ($scope.objPesquisa.doc_nro_final)       ? $scope.objPesquisa.doc_nro_final       : '',
                    'pro_cod_pro_inicio'    : ($scope.objPesquisa.pro_cod_pro_inicio)  ? $scope.objPesquisa.pro_cod_pro_inicio  : '',
                    'pro_cod_pro_final'     : ($scope.objPesquisa.pro_cod_pro_final)   ? $scope.objPesquisa.pro_cod_pro_final   : ''
                };

                return objFiltro;
            };


            $scope.iterar = function(arr, reset) {

                if (! _.isEmpty(arr)) {
                    if (reset)
                        $scope.arrRegistros = [];

                    $timeout(function() {
                        angular.forEach(arr, function(item) {

                            item['nomeAcao']  = GeralFactory.getDescAcao(item['fin_cod_acao'])[3];
                            item['strEspDoc'] = GeralFactory.getAbrDescEspDoc(item['fin_6030_esp_doc'], item['fin_6035_situacao']);

                            $scope.arrRegistros.push(item);
                        });
                    });

                } else {
                    $scope.arrRegistros = [];
                }
            };

            $scope.removerItem = function($index) {

                $scope.objProducao.itens.splice($index, 1);
            };


            $scope.showPanel = function() {

                $scope.hasFilter = !$scope.hasFilter;
            };


            $scope.isActive = function(objeto) {

                return $scope.selecionado === objeto.fin_nro_lan;
            };


            $scope.onSelectProduto = function(objProduto) {

                $scope.objItem = {};
                $scope.objItem.produto = {};
                $scope.setItem(objProduto.pro_cod_pro);
            };


            $scope.addProduto = function(termo) {

                var strProduto = termo.trim();
                GeralFactory.confirmar('Tem certeza que deseja incluir o registro ' + strProduto + '?', function() {

                    var objProduto = {
                        'pro_descricao_longa' : strProduto,
                        'pro_eh_servico'      : 0,
                        'pro_eh_inativo'      : 0,
                        'pro_tip_unidade'     : 1,
                        'pro_tip_producao'    : $scope.objTela.filtro_produto.pro_tip_producao
                    };

                    $timeout(function() {
                        ProdutoService.produtos.create(objProduto, function(resposta) {
                            if (! resposta.records.error) {

                                $scope.setItem(resposta.records.pro_cod_pro);
                                angular.element('#qtde-itens').focus().select();
                            }
                        });
                    });

                }, 'Confirmação', function() {

                    $scope.objItem = {};
                    $scope.objItem.produto = {};

                }, 'Não', 'Sim');
            };


            $scope.setItem = function(proCodPro) {

                if (proCodPro) {

                    ProdutoService.produto.get({pro_cod_pro : proCodPro}, function(retorno) {
                        if (retorno.records) {

                            var objProduto = retorno.records;
                            if (! _.isEmpty(objProduto)) {

                                $scope.objProduto = objProduto;
                                $scope.objProduto.pro_midia = GeralFactory.getFirstMidia(objProduto);

                                var vlrPreco = (objProduto['pro_preco1']) ? parseFloat(objProduto['pro_preco1']) : 0;

                                $scope.objItem.key                          = $scope.incremento++;
                                $scope.objItem.pro_cod_pro                  = objProduto.pro_cod_pro;
                                $scope.objItem.pro_cod_bar                  = objProduto.pro_cod_bar;
                                $scope.objItem.pro_unidade                  = objProduto.pro_unidade === undefined ? 1 : objProduto.pro_unidade;
                                $scope.objItem.pro_cst                      = objProduto.pro_cst;
                                $scope.objItem.pro_cso                      = objProduto.pro_cso === undefined ? 0 : objProduto.pro_cso;
                                $scope.objItem.produto_saldo                = objProduto.produto_saldo;
                                $scope.objItem.pro_tip_producao             = objProduto.pro_tip_producao;
                                $scope.objItem.ite_pro_cod_pro              = objProduto.pro_cod_pro;
                                $scope.objItem.ite_pro_descricao            = objProduto.pro_descricao_longa;
                                $scope.objItem.ite_pro_inf_adicionais       = objProduto.pro_inf_adicionais;
                                $scope.objItem.ite_cs_origem                = objProduto.pro_cs_origem;
                                $scope.objItem.gru_descricao                = objProduto.produto_grupo.gru_descricao !== undefined ? objProduto.produto_grupo.gru_descricao : '';
                                $scope.objItem.ite_vlr_uni_bruto            = vlrPreco;
                                $scope.objItem.produto.pro_cod_bar          = objProduto.pro_cod_bar;
                                $scope.objItem.produto.pro_unidade          = $scope.objItem.pro_unidade;
                                $scope.objItem.ite_pro_qtd                  = 1;
                                $scope.objItem.ite_vlr_tot_desconto         = 0;
                                $scope.objItem.ite_vlr_tot_seguro           = 0;
                                $scope.objItem.ite_vlr_tot_despesas         = 0;
                                $scope.objItem.ite_vlr_tot_naotrib          = 0;
                                $scope.objItem.ite_vlr_tot_impostos_retidos = 0;
                                $scope.objItem.ite_vlr_tot_contabil         = 0;
                                $scope.objItem.ite_vlr_tot_desconto         = 0;
                                $scope.objItem.ite_vlr_tot_frete            = 0;
                                $scope.objItem.ite_cso                      = 0;
                                $scope.objItem.itens_tributo                = [ ];
                                $scope.objItem.pro_estoque                  = parseFloat(objProduto.produto_saldo.sal_atu_qtd_saldo);
                                $scope.objItem.pro_str_etoque               = GeralFactory.getStringEstoque(objProduto.produto_saldo.sal_atu_qtd_saldo);

                                // Liberando o botão para inserção do item na grade:
                                $scope.objFlags.lib_item = true;
                            }
                        }
                    });
                }
            };


            $scope.addItem = function(click) {

                if (_.isEmpty($scope.objItem)) {

                    GeralFactory.notify('danger', 'Atenção!', 'Escolha ao menos um produto para adicionar!');
                    return false;

                } else {

                    if ($scope.objProducao.fin_cod_acao === 1) {

                        GeralFactory.notify('danger', 'Atenção!', 'Não se pode adicionar mais itens para um documento que já se encontra faturado!');
                        return false;

                    } else {

                        // Quando adicionado pelo ENTER verificar os campos de quantidade e valor:
                        if (! click) {
                            if (! $scope.objFlags['qtd_item']) {

                                $scope.objFlags['qtd_item'] = true;
                                $scope.objFlags['add_item'] = false;
                                angular.element('#qtde-itens').focus().select();

                                return false;

                            } else {

                                $scope.objFlags['add_item'] = true;
                                angular.element('#vlr-bruto').focus().select();

                                return false;
                            }

                        } else {

                            if (! $scope.objFlags['lib_item'])
                                return false;

                            $scope.objFlags['lib_item'] = false;
                        }
                    }
                }

                $timeout(function() {

                    if ($scope.objProduto.pro_tip_especifico == 1 || $scope.objProduto.pro_tip_especifico == 2)
                        $scope.getJanelaTipEspecifico();

                    var qtdeStr = $scope.objItem.ite_pro_qtd.toString();
                    if (qtdeStr.match(/,/gi))
                        $scope.objItem.ite_pro_qtd = $scope.objItem.ite_pro_qtd.replace(',', '.');

                    // Calculando o valor total bruto por item:
                    $scope.objItem.ite_pro_qtd = $scope.objItem.ite_pro_qtd ? $scope.objItem.ite_pro_qtd : 1;
                    var vlrTotalBruto = parseFloat($scope.objItem.ite_pro_qtd) * $scope.objItem.ite_vlr_uni_bruto;

                    $scope.objItem.ite_valor_cs        = $scope.objItem.pro_cso;
                    $scope.objItem.ite_vlr_tot_bruto   = vlrTotalBruto;
                    $scope.objItem.ite_vlr_tot_liquido = vlrTotalBruto;

                    if ($scope.objProducao.fin_mod_frete === undefined)
                        $scope.objProducao.fin_mod_frete = 9;

                    $scope.finalizarAddItem();

                }, 1000);
            };


            $scope.finalizarAddItem = function() {

                angular.element('#autocomplete-itens').focus();
                $scope.objProducao.itens.push($scope.objItem);

                $scope.getTotalItens();
                $scope.objItem  = { };
                $scope.objFlags = {
                    add_item : true,
                    lib_item : true,
                    qtd_item : false
                };
            };


            $scope.getTotalItens = function() {

                var somaValor = 0, somaDesconto = 0, somaDespesas = 0, somaFrete = 0, somaSeguro = 0, somaImpostosRetidos = 0, somaLiq = 0, somaItens = 0;
                angular.forEach($scope.objProducao.itens, function(item, chave) {

                    var valorBrutoItem = 0;
                    valorBrutoItem = item.ite_pro_qtd * item.ite_vlr_uni_bruto;
                    valorBrutoItem = GeralFactory.roundNumber(valorBrutoItem, 2);

                    somaValor    = parseFloat(somaValor)    + valorBrutoItem;
                    somaItens    = parseFloat(somaItens)    + parseFloat(item.ite_pro_qtd);
                    somaDesconto = parseFloat(somaDesconto) + parseFloat(item.ite_vlr_tot_desconto);
                    somaDespesas = parseFloat(somaDespesas) + parseFloat(item.ite_vlr_tot_despesas);
                    somaFrete    = parseFloat(somaFrete)    + parseFloat(item.ite_vlr_tot_frete);
                    somaSeguro   = parseFloat(somaSeguro)   + parseFloat(item.ite_vlr_tot_seguro);

                    somaLiq = parseFloat(somaLiq) + parseFloat(item.ite_vlr_tot_liquido);
                    somaLiq = GeralFactory.roundNumber(somaLiq, 2);

                    $scope.objProducao.itens[chave].ite_vlr_tot_bruto   = valorBrutoItem;
                    $scope.objProducao.itens[chave].ite_vlr_tot_liquido = GeralFactory.roundNumber(item.ite_vlr_tot_liquido, 2);
                });

                $scope.objProducao.somaSeguro   = somaSeguro;
                $scope.objProducao.somaDesconto = somaDesconto;
                $scope.objProducao.somaDespesas = somaDespesas;
                $scope.objProducao.somaFrete    = somaFrete;
                $scope.objProducao.somaItens    = somaItens;

                var somaTotLiquido4Dig = somaValor + parseFloat(somaFrete) + somaDespesas + somaSeguro + somaImpostosRetidos - somaDesconto;

                somaLiq = GeralFactory.roundNumber(somaLiq, 2);
                somaTotLiquido4Dig = GeralFactory.roundNumber(somaTotLiquido4Dig, 2);

                $scope.objProducao.somaTotalBruto   = somaValor;
                $scope.objProducao.somaTotalLiquido = somaTotLiquido4Dig;
            };


            $scope.getProducao = function(finNroLan) {

                $scope.selecionado = finNroLan;
                var objeto = {
                    op : $scope.objTela.opcao,
                    fin_nro_lan : finNroLan
                };

                VendaService.venda.get(objeto, function(resposta) {
                    if (resposta.records) {

                        var objProducao = resposta.records;

                        if (objProducao.fin_6025_fase === 0 || objProducao.fin_6025_fase === null)
                            delete objProducao.fin_6025_fase;

                        $scope.objProducao = objProducao;

                        $scope.objProducao.descAcao         = GeralFactory.getDescAcao(objProducao.fin_cod_acao)[2];
                        $scope.objProducao.fin_dat_lan      = GeralFactory.formatarDataBr(objProducao.fin_dat_lan);
                        $scope.objProducao.fin_dat_emi      = GeralFactory.formatarDataBr(objProducao.fin_dat_emi);
                        $scope.objProducao.acao             = objProducao.fin_cod_acao;
                        $scope.objProducao.fin_tip_emitente = objProducao.fin_tip_emitente ? objProducao.fin_tip_emitente : 'P';

                        if (objProducao.fin_dat_sai != null) {

                            var arrData = objProducao.fin_dat_sai.split(' ');

                            $scope.objProducao.valorDataSai = GeralFactory.formatarDataBr(arrData[0]);
                            $scope.objProducao.valorHoraSai = arrData[1] != '00:00:00' ? arrData[1] : '';
                            $scope.objProducao.fin_dat_sai  = $scope.objProducao.valorDataSai + ' ' +  arrData[1];
                        }

                        $scope.objProducao.itens    = objProducao.itens_produto;
                        $scope.objProducao.parcelas = objProducao.parcelas;
                        $timeout(function() {

                            $scope.getTotalItens();
                            $scope.flagTutorial = false;

                            console.log($scope.objProducao);

                        }, 1000);
                    }
                });
            };


            $scope.salvar = function() {

                $scope.salvarVendaLoading = true;

                var arrItens = $scope.objProducao.itens;
                if (arrItens.length) {

                    $scope.objProducao.itens_produto        = [ ];
                    $scope.objProducao.itens_parcelas       = [ ];
                    $scope.objProducao.fin_cad_cod_cad      = 0;
                    $scope.objProducao.fin_end_cod_end_fat  = 0;
                    $scope.objProducao.fin_end_cod_end_ent  = 0;
                    $scope.objProducao.fin_tip_contribuinte = 0;

                    angular.forEach(arrItens, function(item) {

                        var objItem = {};
                        if (item.ite_seq)
                            objItem.ite_seq = item.ite_seq;

                        /**
                         * Conforme verificado pelo Amador não armazenar o valores brutos do produto na tabela de itens.
                         * parseFloat(item.ite_vlr_uni_bruto);
                         * parseFloat(item.ite_vlr_tot_bruto);
                         * parseFloat(item.ite_vlr_tot_liquido);
                         */
                        objItem.ite_pro_cod_pro              = item.ite_pro_cod_pro;
                        objItem.ite_pro_descricao            = item.ite_pro_descricao;
                        objItem.ite_pro_inf_adicionais       = item.ite_pro_inf_adicionais;
                        objItem.ite_pro_qtd                  = item.ite_pro_qtd;
                        objItem.ite_cs_origem                = item.ite_cs_origem;
                        objItem.itens_tributo                = item.itens_tributo;
                        objItem.ite_seq_tip_especifico       = item.ite_seq_tip_especifico;
                        objItem.ite_vlr_uni_bruto            = parseFloat(item.ite_vlr_uni_bruto);
                        objItem.ite_vlr_tot_bruto            = parseFloat(item.ite_vlr_tot_bruto);
                        objItem.ite_vlr_tot_desconto         = parseFloat(item.ite_vlr_tot_desconto);
                        objItem.ite_vlr_tot_impostos_retidos = parseFloat(item.ite_vlr_tot_impostos_retidos);
                        objItem.ite_vlr_tot_liquido          = parseFloat(item.ite_vlr_tot_liquido);
                        objItem.ite_vlr_tot_seguro           = parseFloat(item.ite_vlr_tot_seguro);
                        objItem.ite_vlr_tot_despesas         = parseFloat(item.ite_vlr_tot_despesas);
                        objItem.ite_vlr_tot_frete            = parseFloat(item.ite_vlr_tot_frete);
                        objItem.ite_vlr_uni_base             = parseFloat(item.ite_vlr_tot_liquido);
                        objItem.ite_vlr_uni_custo            = parseFloat(item.ite_vlr_uni_bruto);
                        objItem.ite_vnd_cod_vendedor_item    = 0;
                        objItem.ite_cfo_cfop                 = 0;
                        objItem.ite_origem_ped_nro           = 0;
                        objItem.ite_origem_ped_seq           = 0;

                        // Empilhando o item para salvar em definitivo:
                        $scope.objProducao.itens_produto.push(objItem);
                    });

                    // Todos os totais relativos a operação em si:
                    $scope.objProducao.fin_doc_vlr_liquido   = $scope.objProducao.somaTotalBruto;
                    $scope.objProducao.fin_doc_vlr_bruto     = $scope.objProducao.somaTotalLiquido;
                    $scope.objProducao.fin_doc_vlr_retencoes = 0;
                    $scope.objProducao.fin_doc_vlr_seguro    = 0;
                    $scope.objProducao.fin_doc_vlr_frete     = 0;
                    $scope.objProducao.fin_doc_vlr_despesas  = 0;
                    $scope.objProducao.fin_doc_vlr_descontos = 0;
                    $scope.objProducao.fin_doc_vlr_contabil  = 0;

                    if ($scope.objProducao.fin_dat_sai != null)
                        $scope.objProducao.fin_dat_sai = $scope.objProducao.fin_dat_sai.replace(':', '');

                    var form = $scope.forms.formProducao;
                    if (form.$invalid) {

                        $scope.submitted = true;
                        $scope.salvarVendaLoading = false;

                    } else {

                        $scope.objProducao.op = $scope.objTela.opcao;
                        if ($scope.objProducao.fin_nro_lan) {

                            NotifyFlag.setFlag(true);
                            VendaService.venda.update($scope.objProducao, function(resposta) {

                                $scope.salvarVendaLoading = false;
                                $scope.getProducao(resposta.records.fin_nro_lan);
                                NotifyFlag.setFlag(false);
                            });

                        } else {

                            VendaService.vendas.create($scope.objProducao, function(resposta) {
                                if (! resposta.records.error) {

                                    $scope.salvarVendaLoading = false;
                                    $scope.getProducao(resposta.records.fin_nro_lan);
                                    $scope.listar();
                                }
                            });
                        }
                    }

                } else {

                    GeralFactory.notify('danger', 'Atenção!', 'Adicione ao menos um produto!');
                    $scope.salvarVendaLoading = false;

                }
            };


            $scope.excluir = function() {

                GeralFactory.confirmar('Caro usuário, deseja realmente cancelar a ' + $scope.objTela.nome_natureza + ' em questão?', function() {
                    if ($scope.objProducao.fin_nro_lan) {

                        var objeto  = {
                            'op'          : $scope.objTela.opcao,
                            'fin_nro_lan' : $scope.objProducao.fin_nro_lan,
                            'fin_sistema' : $scope.objProducao.fin_sistema
                        };

                        $scope.salvarVendaLoading = true;
                        VendaService.venda.cancelar(objeto, function(retorno) {

                            $scope.salvarVendaLoading = false;
                            if (! retorno.records.error) {

                                $timeout(function() {
                                    $scope.novo();
                                    $scope.listar();
                                });
                            }
                        });

                    } else {
                        
                        $scope.novo();
                    }
                });
            };


            $scope.faturar = function() {

                if ($scope.objProducao.fin_nro_lan) {

                    $scope.salvarVendaLoading = true;
                    var objeto  = {
                        'op'          : $scope.objTela.opcao,
                        'fin_nro_lan' : $scope.objProducao.fin_nro_lan,
                        'fin_sistema' : $scope.objProducao.fin_sistema,
                        'fin_doc_nro' : $scope.objProducao.fin_doc_nro
                    };

                    VendaService.venda.faturarGenerico(objeto, function(retorno) {
                        if (retorno.records.error) {

                            GeralFactory.notificar({data: retorno});
                            $scope.salvarVendaLoading = false;

                        } else {

                            $scope.salvarVendaLoading = false;
                            GeralFactory.notify('success', '', 'Registro cadastrado e faturado com sucesso!');
                            $timeout(function() {

                                $scope.getProducao($scope.objProducao.fin_nro_lan);
                                $scope.listar();

                            });
                        }
                    });
                }
            };


            $scope.getJanelaProduto = function(proCodPro) {

                var scope = $rootScope.$new();
                scope.params = {};

                if (proCodPro) {

                    scope.params.pro_cod_pro    = proCodPro;
                    scope.params.pro_eh_servico = 0;

                    var modalInstance = $uibModal.open({
                        templateUrl : 'produto/views/janela-produto.html',
                        controller  : 'ProdutoModalCtrl',
                        size        : 'lg',
                        windowClass : 'center-modal no-top-modal',
                        animation   :  true,
                        scope       :  scope,
                        resolve     :  { }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'reload') {
                            if (modalInstance.hasAlteracao) {

                                $scope.setItem(proCodPro);
                                if (! _.isEmpty($scope.objProducao.itens)) {

                                    var produto = modalInstance.objProdutoUp;
                                    angular.forEach($scope.objProducao.itens, function(item, chave) {

                                        if (item.hasOwnProperty('key') && proCodPro == item.ite_pro_cod_pro) {

                                            var preco = (produto['pro_preco1']) ? parseFloat(produto['pro_preco1']) : 0;

                                            $scope.objProducao.itens[chave].ite_vlr_uni_bruto      = preco;
                                            $scope.objProducao.itens[chave].ite_vlr_tot_bruto      = preco * item.ite_pro_qtd;
                                            $scope.objProducao.itens[chave].ite_vlr_tot_liquido    = preco * item.ite_pro_qtd;
                                            $scope.objProducao.itens[chave].ite_pro_descricao      = produto.pro_descricao_longa;
                                            $scope.objProducao.itens[chave].ite_pro_inf_adicionais = produto.pro_inf_adicionais;
                                            $scope.objProducao.itens[chave].produto_saldo          = produto.produto_saldo;
                                            $scope.objProducao.itens[chave].produto_grupo          = produto.produto_grupo;
                                            $scope.objProducao.itens[chave].pro_estoque            = parseFloat(produto.produto_saldo.sal_atu_qtd_saldo);
                                            $scope.objProducao.itens[chave].pro_str_etoque         = GeralFactory.getStringEstoque(produto.produto_saldo.sal_atu_qtd_saldo);
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            };


            $scope.getJanelaTipEspecifico = function() {

                var scope = $rootScope.$new();
                scope.params = {};

                scope.params.produto     = $scope.objProduto;
                scope.params.str_titular = $scope.objTela.nome_natureza;

                var modalInstance = $uibModal.open({
                    templateUrl : 'venda/views/janela-tip-especifico.html',
                    controller  : 'VendaTipEspecificoCtrl',
                    size        : 'lg',
                    windowClass : 'center-modal no-top-modal',
                    animation   :  true,
                    scope       :  scope
                });

                modalInstance.result.then(function(id) { }, function(msg) {

                    var chave = $scope.objProducao.itens.length - 1;
                    if (msg === 'reload') {

                        $scope.objProducao.itens[chave].ite_seq_tip_especifico = modalInstance.codTipProduto;

                    } else {

                        $scope.objProducao.itens.pop();
                    }
                });
            };


            $scope.getJanelaRelatorio = function() {

                var objFiltro = $scope.getFiltros();

                objFiltro['ken']           = AuthTokenFactory.getToken();
                objFiltro['op_natureza']   = $scope.objTela.opcao;
                objFiltro['cod_natureza']  = $scope.objTela.cod_natureza;
                objFiltro['desc_natureza'] = $scope.objTela.nome_natureza;

                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.objFiltro = objFiltro;

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'venda/views/janela-relatorio.html',
                    controller  : 'VendaRelatorioModalCtrl',
                    size        : 'md',
                    windowClass : 'center-modal no-top-modal',
                    scope       :  scope,
                    resolve     :  { }
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'cancel') {

                        $timeout(function() {
                            scope.$destroy();
                        });
                    }
                });
            };
        }
    ]);
