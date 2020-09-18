'use strict';

angular.module('newApp')

    .controller('VendaCtrl', [

        '$scope', '$rootScope', '$uibModal', '$timeout','$sce', '$filter','$location', '$window', 'VendaService', 'NotaLogService',  'ParamsService', 'ClienteService', 'ProdutoService', 'EmpresaService', 'GeralFactory', 'CONFIG', 'AuthTokenFactory','prompt', 'Storage', 'NotifyFlag', 'UsuarioService', 'Constantes','ImpostoFactory', 'MidiaService', 'Wizard',

        function ($scope, $rootScope, $uibModal, $timeout, $sce, $filter, $location, $window, VendaService, NotaLogService, ParamsService, ClienteService, ProdutoService, EmpresaService, GeralFactory, CONFIG, AuthTokenFactory,prompt, Storage, NotifyFlag, UsuarioService, Constantes, ImpostoFactory,MidiaService, Wizard) {
            $rootScope.hasAutorizacao();

            $scope.$on('$viewContentLoaded', function () {

                $scope.arrFase = [];
                $scope.arrUsuarios = [];
                $scope.objFiltroProduto = {};

                $scope.listarParams();
                $scope.resetVars();

                $scope.tipo_codigo = 'CN';
                $scope.nomeBotao = 'Cancelar';
                $scope.setAbaInicial();
                $scope.tipContrib = 'Consumidor';
                $scope.clicouAcaoNfeA3 = false;


                $scope.venda.fin_6020_natureza = $scope.venda.codNatureza;
                $scope.venda.mvaValido = false;
                $scope.venda.valorMaiorZeroValido = false;

                $scope.flagTutorial = true;

                $scope.getUsuarios();

                $timeout(function () {
                    $scope.listarVendas();
                }, 400);

                $timeout(function () {
                    $scope.clicarConclusao();
                }, 1400);

                $scope.blurAtributoAtivo = false;
                $scope.objPeriodicidade = GeralFactory.listarPeriodicidade();
                $scope.arrTipoEmissao = GeralFactory.listarTipoEmissao();
                $scope.arrModeloReferenciado = GeralFactory.listarModeloReferenciado();

                $scope.listarCfop();
                $scope.objFiltroCliente = {
                    'cad_tip_cli_for': $scope.venda.cad_tip_cli_for
                };

                $scope.objFiltroPessoa = {};

                $scope.inputs = {
                    ite_vlr_uni_bruto : true
                };
            });

            $scope.listarParams = function () {

                var strFiltro = '';
                ParamsService.params.get({u: strFiltro}, function(resposta) {
                    $timeout(function() {

                        var arrResposta = resposta.records;

                        $scope.arrFase = arrResposta.arr_6025;
                        $scope.arr_6035 = arrResposta.arr_6035;
                        $scope.arrVendedores = arrResposta.arr_6010;
                        $scope.arrCentroCusto = arrResposta.arr_6050;
                        $scope.arrFormasPagamento = arrResposta.arr_6060;
                        $scope.arrContasFinan = arrResposta.arr_5010;

                        $scope.arr_1000 = arrResposta.arr_1000;

                        $scope.codBuscaPadrao = ($scope.arr_1000) ? $scope.arr_1000[0].par_i01 : 0;

                        $scope.tipo_codigo = ($scope.codBuscaPadrao === 2) ? 'CB' : 'CN';

                        console.log($scope.codBuscaPadrao, $scope.tipo_codigo);

                        $scope.getVerificaFasesByNatureza();

                    }, 1000);
                });

            };

            /**
             * Lista os CFOPs no banco diante de algum filtro
             */
            $scope.listarCfop = function () {

                var objCfop = {
                    'cfo_6020_natureza': $scope.venda.codNatureza
                };

                if ($scope.cliente.endereco.end_endereco_cod_uf != undefined) {
                    if ($scope.cliente.endereco.end_endereco_cod_uf != $scope.empresa.emp_cod_uf) {
                        objCfop.cfo_eh_fora_estado = 1;
                        $scope.vendaTmp.eh_fora_estado = 1;
                    } else {
                        objCfop.cfo_eh_fora_estado = 0;
                        $scope.vendaTmp.eh_fora_estado = 0;
                    }

                    if($scope.cliente.endereco.end_eh_exterior == 1) {

                        objCfop.cfo_eh_fora_estado = 3;
                        $scope.vendaTmp.eh_fora_estado = 3;
                    }
                }

                //console.log('objCfop: ', objCfop);

                var strCfop = GeralFactory.formatarPesquisar(objCfop);
                ParamsService.cfops.get({u: strCfop}, function (resposta) {
                    //console.log('rrr88:',resposta);
                    $scope.listaCfo = resposta.records;
                });
            };

            /**
             *
             */
            $scope.getUsuarios = function () {

                UsuarioService.usuarios.get({u: ''}, function (retorno) {
                    if (!_.isEmpty(retorno.records)) {

                        $timeout(function () {
                            $scope.arrUsuarios = retorno.records;
                        })
                    }
                });
            };

            $scope.getEmpresa = function (func) {

                EmpresaService.empresa.get({emp_cod_emp: '1'}, function (data) {
                    $scope.empresa = data.records;
                    // console.log('$scope.empresa: ',$scope.empresa);

                    if (func) {
                        func.call();
                    }
                });
            };

            /**
             *
             */
            $scope.resetVars = function () {

                $scope.nomeBotao = 'Cancelar';
                $scope.vendas = {};
                $scope.arrVendas = [];
                $scope.pesquisarVenda = {
                    arrSitSelecionadas: new Array()
                };

                $scope.opened = false;
                $scope.cliente = {};
                $scope.cliente.endereco = {};
                $scope.vendedor = {};
                $scope.formaPagamento = {};
                $scope.newItem = {};
                $scope.newItemParcela = {};
                $scope.objDropdown = {};
                $scope.arrParcelas = [];
                $scope.arrFiltroEspDoc = [];
                $scope.hasFilter = false;
                $scope.hasEditParcela = false;
                $scope.fase_escolhida = [];
                $scope.fase_escolhida_aux = [];

                $scope.inputs = {
                    ite_vlr_uni_bruto : true
                };

                $scope.venda = {
                    itens: [],
                    itens_produto: [],
                    selected: {},
                    selectedParcela: {},
                    parcelas: [],
                    itens_parcelas: [],
                    transporte: {},
                    valorIpi: 0,
                    valorIcmsSt: 0,
                    acao: 0,
                    somaTotalVlrLiquido: null,
                    descAcao: GeralFactory.getDescAcao(0)[2]
                };

                $scope.vendaTmp = {};
                $scope.vendaTmp.eh_fora_estado = 0;

                $scope.dateOptions = {
                    'year-format': "'yy'",
                    'show-weeks': false
                };

                $scope.inc = $scope.incParcela = 0;
                $scope.venda.fin_cod_periodicidade = 0;
                $scope.venda.fin_av_ap = 0;
                // $scope.venda.fin_nfe_finalidade = 1; //NFe normal
                $scope.venda.clienteSelect = '';
                //$scope.venda.vendedorSelect = 'escolha um vendedor';
                $scope.venda.fin_nome_situacao = 'Pendente Envio';
                $scope.venda.fin_dat_lan = GeralFactory.getDataAtualBr();
                $scope.venda.fin_modelo_referenciada = '0';
                $scope.venda.mostrarExcluirExcessao = false;

                $scope.setNomeOperacao();
                $scope.salvarVendaLoading = false;

                $scope.getEmpresa(function () {
                    $scope.setTipCs();
                    $scope.venda.fin_doc_serie = $scope.empresa.emp_nro_serie;
                    $scope.flagBoleto = $scope.empresa.emp_ativo_gn > 0 ? true : false;

                });


                $scope.arrAcoes = GeralFactory.listarAcoes();

                $scope.flagInputQdte = false;
                $scope.flagAddItem = true;
                $scope.liberarAddItem = true;
            };

            /**
             * Verifica as fases de uma determinada natureza.
             */
            $scope.getVerificaFasesByNatureza = function() {

                $timeout(function() {

                    var codNatureza = $scope.venda.codNatureza;
                    angular.forEach($scope.arrFase, function(item, chave) {
                        if (codNatureza === item.par_i01 || codNatureza === null || codNatureza === 0) {
                            $scope.fase_escolhida[chave] = item;
                        } else {
                            console.log('Registro: ', item);
                            $scope.arrFase.splice(chave, 1);
                        }
                    });

                }, 1000);
            };

            /**
             *
             */
            $scope.reset = function () {

                $scope.venda.selected = {};
                $scope.venda.selectedParcela = {};
            };


            $scope.setTipCs = function () {

                if ($scope.empresa.emp_reg_trib == 1 || $scope.empresa.emp_reg_trib == 2 || $scope.empresa.emp_reg_trib == 3) {
                    $scope.venda.tipCs = 1;
                } else {
                    $scope.venda.tipCs = 2;
                }
            };

            /**
             * Inicializa os labels padrões da operação selecionada.
             */
            $scope.setNomeOperacao = function () {

                var strCod = '';
                $scope.venda.tipoNatureza = $location.$$path.replace('/', '');
                console.log($location.$$path);

                //console.log('tiponat?: ', $scope.venda.tipoNatureza);

                if ($scope.venda.tipoNatureza == 'venda') {

                    if (!$rootScope.getPermissao('11')) {
                        $location.path('/');
                    }

                    $scope.siglaTutorial          = 'VEN';
                    $scope.labelTutorial          = 'Cadastro de novas vendas e DAV\'s';
                    $scope.labelDetalhe           = 'Dados da venda';
                    $scope.labelProduto           = 'produto';
                    $scope.venda.nomeNatureza     = 'Vendas e DAV\'s';
                    $scope.venda.explModulo       = 'suas vendas';
                    $scope.venda.nomeNaturezaSing = 'Venda';
                    $scope.venda.op               = 'venda';
                    $scope.venda.labelTitular     = 'Cliente';
                    $scope.venda.labelTitularSing = 'cliente';
                    $scope.venda.attrPrecoProduto = 'pro_preco5';
                    $scope.venda.cad_tip_cli_for  = 1;
                    $scope.venda.codNatureza      = 1;
                    $scope.venda.fin_sistema      = 1;
                    $scope.venda.fin_tip_emitente = ($scope.venda.fin_tip_emitente) ? $scope.venda.fin_tip_emitente : 'P';

                    // Nomes para a ação Editar
                    if($scope.venda.acao == 0) {

                        $scope.labelDetalhe           = 'Dados da venda (DAV)';
                        $scope.venda.explModulo       = 'suas vendas (DAV)';
                        $scope.venda.nomeNaturezaSing = 'Pedido de venda (DAV)';
                    }

                    if($scope.venda.fin_nfe_finalidade == 2) {

                        $scope.labelDetalhe           = 'Dados da Nota de Complemento';
                        $scope.venda.nomeNatureza     = 'Nota de Complemento';
                        $scope.venda.explModulo       = 'suas notas de complemento';
                        $scope.venda.nomeNaturezaSing = 'Nota de Complemento';
                    }

                    $scope.objDropdown.objCentroCusto = {'par_i03': 1};

                    $scope.objFiltroProduto = {
                        'pro_eh_servico'   : 'N',
                        'pro_arr_producao' : 'T|P',
                        'pro_param_tipo'   : $scope.codBuscaPadrao
                    };

                    $scope.arrFiltroEspDoc = [{
                        'id_esp_doc': '10',
                        'label_esp_doc': 'DAV'
                    }, {
                        'id_esp_doc': '55',
                        'label_esp_doc': 'NFe'
                    }, {
                        'id_esp_doc': '01',
                        'label_esp_doc': 'NFD'
                    }, {
                        'id_esp_doc': '65',
                        'label_esp_doc': 'NFC'
                    }, {
                        'id_esp_doc': '30',
                        'label_esp_doc': 'CUP'
                    }, {
                        'id_esp_doc': '59',
                        'label_esp_doc': 'SAT'
                    }];

                    strCod = '1|6020|1||';

                    $timeout(function () {
                        Wizard.loadWizards.initialize(8);
                    }, 2000);

                } else if ($scope.venda.tipoNatureza == 'compra') {

                    if (!$rootScope.getPermissao('16')) {
                        $location.path('/');
                    }

                    $scope.siglaTutorial          = 'COM';
                    $scope.labelTutorial          = 'Cadastro de novas compras';
                    $scope.labelDetalhe           = 'Dados da compra';
                    $scope.labelProduto           = 'produto';
                    $scope.venda.nomeNatureza     = 'Compras';
                    $scope.venda.explModulo       = 'suas compras incrementando seu estoque';
                    $scope.venda.nomeNaturezaSing = 'Compra';
                    $scope.venda.op               = 'compra';
                    $scope.venda.labelTitular     = 'Fornecedor';
                    $scope.venda.labelTitularSing = 'fornecedor';
                    $scope.venda.attrPrecoProduto = 'pro_preco1';
                    $scope.venda.cad_tip_cli_for  = 2;
                    $scope.venda.codNatureza      = 2;
                    $scope.venda.fin_sistema      = 2;

                    $scope.objDropdown.objCentroCusto = {'par_i03': 2};

                    $scope.objFiltroProduto = {
                        'pro_eh_servico'   : 'N',
                        'pro_arr_producao' : 'T|P|I',
                        'pro_param_tipo'   : $scope.codBuscaPadrao
                    };

                    var tipPadrao = (($rootScope.getPermissaoSol('10')) ? 'P' : 'T');

                    if($scope.venda.fin_nfe_finalidade == 2) {

                        $scope.labelDetalhe           = 'Dados da Nota de Complemento';
                        $scope.venda.nomeNatureza     = 'Nota de Complemento';
                        $scope.venda.explModulo       = 'suas notas de complemento';
                        $scope.venda.nomeNaturezaSing = 'Nota de Complemento';
                    }

                    $scope.venda.fin_tip_emitente = ($scope.venda.fin_tip_emitente) ? $scope.venda.fin_tip_emitente : tipPadrao;

                    $scope.arrFiltroEspDoc = [{
                        'id_esp_doc': '11',
                        'label_esp_doc': 'PED'
                    }, {
                        'id_esp_doc': '55',
                        'label_esp_doc': 'NFe'
                    }];

                    strCod = '1|6020|2||';

                    $scope.iniciaDragAndDrop();

                    $timeout(function () {
                        Wizard.loadWizards.initialize(16);
                    }, 2000);

                } else if ($scope.venda.tipoNatureza == 'orcamento') {

                    if (!$rootScope.getPermissao('26')) {
                        $location.path('/');
                    }

                    $scope.siglaTutorial          = 'ORC';
                    $scope.labelTutorial          = 'Cadastro de novos orçamentos e DAV\'s';
                    $scope.labelProduto           = 'produto';
                    $scope.labelDetalhe           = 'Dados do orçamento';
                    $scope.venda.nomeNatureza     = 'Orçamentos (DAV\'s)';
                    $scope.venda.explModulo       = 'seus orçamentos';
                    $scope.venda.nomeNaturezaSing = 'Orçamento';
                    $scope.venda.op               = 'orcamento';
                    $scope.venda.labelTitular     = 'Cliente';
                    $scope.venda.labelTitularSing = 'cliente';
                    $scope.venda.attrPrecoProduto = 'pro_preco5';
                    $scope.venda.cad_tip_cli_for  = 1;
                    $scope.venda.codNatureza      = 11;
                    $scope.venda.fin_sistema      = 1;

                    // Nomes para a ação Editar
                    if($scope.venda.acao == 0) {

                        $scope.labelDetalhe           = 'Dados do orçamento (DAV)';
                        $scope.venda.explModulo       = 'seus orçamentos (DAV)';
                        $scope.venda.nomeNaturezaSing = 'Orçamento (DAV)';
                    }

                    $scope.objDropdown.objCentroCusto = {'par_i03': 1};

                    $scope.objFiltroProduto = {
                        'pro_eh_servico'   : 'A',
                        'pro_param_tipo'   : $scope.codBuscaPadrao
                    };

                    $scope.arrFiltroEspDoc = [];

                    $scope.tabs = [
                        {active: false}, {active: true}, {active: false}
                    ];
                    //strCod = '1|6020|1||';

                    $timeout(function () {
                        Wizard.loadWizards.initialize(26);
                    }, 2000);

                } else if ($scope.venda.tipoNatureza == 'devolucao-venda') {

                    if (!$rootScope.getPermissao('27')) {
                        $location.path('/');
                    }

                    $scope.siglaTutorial          = 'DEV';
                    $scope.labelTutorial          = 'Cadastro de novas devoluções e DAV\'s';
                    $scope.labelProduto           = 'produto';
                    $scope.labelDetalhe           = 'Dados da devolução de venda';
                    $scope.venda.nomeNatureza     = 'Devoluções e DAV\'s';
                    $scope.venda.explModulo       = 'suas devoluções de venda';
                    $scope.venda.nomeNaturezaSing = 'Devolução de Venda';
                    $scope.venda.op               = 'devolucao-venda';
                    $scope.venda.labelTitular     = 'Cliente';
                    $scope.venda.labelTitularSing = 'cliente';
                    $scope.venda.attrPrecoProduto = 'pro_preco5';
                    $scope.venda.cad_tip_cli_for  = 1;
                    $scope.venda.codNatureza      = 3;
                    $scope.venda.fin_sistema      = 2;
                    $scope.venda.fin_tip_emitente = ($scope.venda.fin_tip_emitente) ? $scope.venda.fin_tip_emitente : 'P';

                    // Nomes para a ação Editar
                    if($scope.venda.acao == 0) {

                        $scope.labelDetalhe           = 'Dados da devolução de venda (DAV)';
                        $scope.venda.explModulo       = 'suas devoluções de venda (DAV)';
                        $scope.venda.nomeNaturezaSing = 'Devolução de Venda (DAV)';
                    }

                    if($scope.venda.fin_nfe_finalidade == 2) {

                        $scope.labelDetalhe           = 'Dados da Nota de Complemento';
                        $scope.venda.nomeNatureza     = 'Nota de Complemento';
                        $scope.venda.explModulo       = 'suas notas de complemento';
                        $scope.venda.nomeNaturezaSing = 'Nota de Complemento';
                    }

                    $scope.objDropdown.objCentroCusto = {'par_i03': 1};

                    $scope.objFiltroProduto = {
                        'pro_eh_servico'   : 'N',
                        'pro_arr_producao' : 'T|P',
                        'pro_param_tipo'   : $scope.codBuscaPadrao
                    };

                    $scope.arrFiltroEspDoc = [{
                        'id_esp_doc': '10',
                        'label_esp_doc': 'PED'
                    }, {
                        'id_esp_doc': '55',
                        'label_esp_doc': 'NFe'
                    }];

                    strCod = '1|6020|3||';

                    $timeout(function () {
                        Wizard.loadWizards.initialize(27);
                    }, 2000);

                } else if ($scope.venda.tipoNatureza == 'devolucao-compra') {

                    if (!$rootScope.getPermissao('31')) {
                        $location.path('/');
                    }

                    $scope.siglaTutorial          = 'DEVCOM';
                    $scope.labelTutorial          = 'Cadastro de novas devoluções e DAV\'s';
                    $scope.labelProduto           = 'produto';
                    $scope.labelDetalhe           = 'Dados da devolução de compra';
                    $scope.venda.nomeNatureza     = 'Devoluções e DAV\'s';
                    $scope.venda.explModulo       = 'suas devoluções de compra';
                    $scope.venda.nomeNaturezaSing = 'Devolução de Compra';
                    $scope.venda.op               = 'devolucao-compra';
                    $scope.venda.labelTitular     = 'Fornecedor';
                    $scope.venda.labelTitularSing = 'fornecedor';
                    $scope.venda.attrPrecoProduto = 'pro_preco1';
                    $scope.venda.cad_tip_cli_for  = 2;
                    $scope.venda.codNatureza      = 4;
                    $scope.venda.fin_sistema      = 1;
                    $scope.venda.fin_tip_emitente = ($scope.venda.fin_tip_emitente) ? $scope.venda.fin_tip_emitente : 'P';

                    // Nomes para a ação Editar quando emissão própria
                    if($scope.venda.acao == 0 && $scope.venda.fin_tip_emitente == 'P') {

                        $scope.labelDetalhe           = 'Dados da devolução de compra (DAV)';
                        $scope.venda.explModulo       = 'suas devoluções de compra (DAV)';
                        $scope.venda.nomeNaturezaSing = 'Devolução de Compra (DAV)';
                    }

                    $scope.objDropdown.objCentroCusto = {'par_i03': 2};

                    $scope.objFiltroProduto = {
                        'pro_eh_servico'   : 'N',
                        'pro_arr_producao' : 'T|P|I',
                        'pro_param_tipo'   : $scope.codBuscaPadrao
                    };

                    if($scope.venda.fin_nfe_finalidade == 2) {

                        $scope.labelDetalhe           = 'Dados da Nota de Complemento';
                        $scope.venda.nomeNatureza     = 'Nota de Complemento';
                        $scope.venda.explModulo       = 'suas notas de complemento';
                        $scope.venda.nomeNaturezaSing = 'Nota de Complemento';
                    }

                    $scope.arrFiltroEspDoc = [{
                        'id_esp_doc': '10',
                        'label_esp_doc': 'PED'
                    }, {
                        'id_esp_doc': '55',
                        'label_esp_doc': 'NFe'
                    }];

                    strCod = '1|6020|4||';

                    $timeout(function () {
                        Wizard.loadWizards.initialize(31);
                    }, 2000);

                } else if ($scope.venda.tipoNatureza == 'outras-saidas') {

                    if (!$rootScope.getPermissao('30')) {
                        $location.path('/');
                    }

                    $scope.siglaTutorial          = 'OUTSAI';
                    $scope.labelTutorial          = 'Cadastro de outras saídas e DAV\'s';
                    $scope.labelDetalhe           = 'Dados de outras saídas';
                    $scope.labelProduto           = 'produto';
                    $scope.venda.nomeNatureza     = 'Outras Saídas e DAV\'s';
                    $scope.venda.explModulo       = 'suas outras saídas';
                    $scope.venda.nomeNaturezaSing = 'Outra Saída';
                    $scope.venda.op               = 'outras-saidas';
                    $scope.venda.labelTitular     = 'Cadastro';
                    $scope.venda.labelTitularSing = 'cadastro';
                    $scope.venda.attrPrecoProduto = 'pro_preco5';
                    $scope.venda.cad_tip_cli_for  = 1;
                    $scope.venda.codNatureza      = 5;
                    $scope.venda.fin_sistema      = 1;
                    $scope.venda.fin_tip_emitente = ($scope.venda.fin_tip_emitente) ? $scope.venda.fin_tip_emitente : 'P';

                    // Nomes para a ação Editar quando emissão própria
                    if($scope.venda.acao == 0 && $scope.venda.fin_tip_emitente == 'P') {

                        $scope.labelDetalhe           = 'Dados de outras saídas (DAV)';
                        $scope.venda.explModulo       = 'suas outras saídas (DAV)';
                        $scope.venda.nomeNaturezaSing = 'Outra Saída (DAV)';
                    }

                    if($scope.venda.fin_nfe_finalidade == 2) {

                        $scope.labelDetalhe           = 'Dados da Nota de Complemento';
                        $scope.venda.nomeNatureza     = 'Nota de Complemento';
                        $scope.venda.explModulo       = 'suas notas de complemento';
                        $scope.venda.nomeNaturezaSing = 'Nota de Complemento';
                    }

                    $scope.objDropdown.objCentroCusto = {'par_i03': 1};

                    $scope.objFiltroProduto = {
                        'pro_eh_servico'   : 'N',
                        'pro_arr_producao' : 'T|P',
                        'pro_param_tipo'   : $scope.codBuscaPadrao
                    };

                    $scope.arrFiltroEspDoc = [{
                        'id_esp_doc': '10',
                        'label_esp_doc': 'PED'
                    }, {
                        'id_esp_doc': '55',
                        'label_esp_doc': 'NFe'
                    }];

                    strCod = '1|6020|5||';

                    $timeout(function () {
                        Wizard.loadWizards.initialize(30);
                    }, 2000);

                } else if ($scope.venda.tipoNatureza == 'outras-entradas') {

                    if (!$rootScope.getPermissao('29')) {
                        $location.path('/');
                    }

                    $scope.siglaTutorial          = 'OUTENT';
                    $scope.labelTutorial          = 'Cadastro de outras entradas e DAV\'s';
                    $scope.labelDetalhe           = 'Dados de outras entradas';
                    $scope.labelProduto           = 'produto';
                    $scope.venda.nomeNatureza     = 'Outras Entradas e DAV\'s';
                    $scope.venda.explModulo       = 'suas outras entradas';
                    $scope.venda.nomeNaturezaSing = 'Outra Entrada';
                    $scope.venda.op               = 'outras-entradas';
                    $scope.venda.labelTitular     = 'Fornecedor';
                    $scope.venda.labelTitularSing = 'fornecedor';
                    $scope.venda.attrPrecoProduto = 'pro_preco1';
                    $scope.venda.cad_tip_cli_for  = 2;
                    $scope.venda.codNatureza      = 6;
                    $scope.venda.fin_sistema      = 2;
                    $scope.venda.fin_tip_emitente = ($scope.venda.fin_tip_emitente) ? $scope.venda.fin_tip_emitente : 'P';

                    // Nomes para a ação Editar quando emissão própria
                    if($scope.venda.acao == 0 && $scope.venda.fin_tip_emitente == 'P') {

                        $scope.labelDetalhe           = 'Dados de outras entradas (DAV)';
                        $scope.venda.explModulo       = 'suas outras entradas (DAV)';
                        $scope.venda.nomeNaturezaSing = 'Outra Entrada (DAV)';
                    }

                    $scope.objDropdown.objCentroCusto = {'par_i03': 2};

                    $scope.objFiltroProduto = {
                        'pro_eh_servico'   : 'N',
                        'pro_arr_producao' : 'T|P|I',
                        'pro_param_tipo'   : $scope.codBuscaPadrao
                    };

                    var tipPadrao = (($rootScope.getPermissaoSol('10')) ? 'P' : 'T');

                    $scope.venda.fin_tip_emitente = ($scope.venda.fin_tip_emitente) ? $scope.venda.fin_tip_emitente : tipPadrao;

                    if($scope.venda.fin_nfe_finalidade == 2) {

                        $scope.labelDetalhe           = 'Dados da Nota de Complemento';
                        $scope.venda.nomeNatureza     = 'Nota de Complemento';
                        $scope.venda.explModulo       = 'suas notas de complemento';
                        $scope.venda.nomeNaturezaSing = 'Nota de Complemento';
                    }

                    $scope.arrFiltroEspDoc = [{
                        'id_esp_doc': '11',
                        'label_esp_doc': 'PED'
                    }, {
                        'id_esp_doc': '55',
                        'label_esp_doc': 'NFe'
                    }];

                    strCod = '1|6020|6||';

                    $timeout(function () {
                        Wizard.loadWizards.initialize(29);
                    }, 2000);

                } else if ($scope.venda.tipoNatureza == 'prest-servico') {

                    if (!$rootScope.getPermissao('34')) {
                        $location.path('/');
                    }

                    var opLabel = ($scope.venda.fin_6030_esp_doc != 10) ? 'Prestação' : 'Ordem';

                    $scope.siglaTutorial          = 'PRESTSERV';
                    $scope.labelTutorial          = 'Cadastro de '+ opLabel +' de Serviços';
                    $scope.labelDetalhe           = 'Dados da '+ opLabel +' de serviço';
                    $scope.labelProduto           = 'serviço';
                    $scope.venda.nomeNatureza     = opLabel +'de Serviços';
                    $scope.venda.explModulo       = 'suas prestações de serviços';
                    $scope.venda.nomeNaturezaSing = opLabel +' de Serviço';
                    $scope.venda.op               = 'prest-servico';
                    $scope.venda.labelTitular     = 'Cliente';
                    $scope.venda.labelTitularSing = 'cliente';
                    $scope.venda.attrPrecoProduto = 'pro_preco5';
                    $scope.venda.cad_tip_cli_for  = 1;
                    $scope.venda.codNatureza      = 31;
                    $scope.venda.fin_tip_emitente = 'P';
                    $scope.venda.fin_sistema      = 1;

                    $scope.objDropdown.objCentroCusto = {'par_i03': 1};

                    $scope.objFiltroProduto = {'pro_eh_servico': 'S'};

                    $scope.arrFiltroEspDoc = [{
                        'id_esp_doc': '10',
                        'label_esp_doc': 'OS'
                    }, {
                        'id_esp_doc': '88',
                        'label_esp_doc': 'NFSe'
                    }];

                    strCod = '1|6020|31||';

                    $timeout(function () {
                        Wizard.loadWizards.initialize(37);
                    }, 2000);
                }

                //obtem a descriçao e codigo do cfop padrao. Cada empresa pode ter o seu padrao
                if (!$scope.venda.fin_nro_lan) {

                    //console.log('eh novo entao vai setar um padrao 333');
                    ParamsService.getParametro(strCod, function (data) {
                        // console.log('getParametro:',data);
                        if (data) {
                            $scope.paramPadrao = data;
                            if (data.par_i01) {
                                $scope.venda.fin_cfo_cfop = $scope.venda.cfopOriginal = data.par_i01;

                            }
                        }

                        //console.log('data padrao: ',data);
                    });
                }
            };

            /**
             * Troca o código da listagem de produtos.
             */
            $scope.trocarCodigo = function() {

                $scope.tipo_codigo = ($scope.tipo_codigo === 'CN') ? 'CB' : 'CN';
            };

            /**
             * Seta para aba principal para ficar ativa.
             */
            $scope.setAbaInicial = function () {
                $scope.tabs = [
                    {active: true}, {active: false}, {active: false}
                ];

            };


            /**
             * Verifica qual venda foi selecionada.
             */
            $scope.isActive = function (k) {
                return $scope.keyEdit === k;
            };

            /**
             *
             */
            $scope.novaOperacao = function () {

                $timeout(function () {
                    $scope.flagTutorial = false;
                }, 500);

                $scope.primeiraEtapa();
                $scope.forms.form_venda.$setPristine();
                $scope.resetVars();

                $scope.listarVendas();
                $scope.listarFase();

                var objUsuario = Storage.usuario.getUsuario();

                //console.log('objUsuario:',objUsuario);
                if (objUsuario.usu_cod_vendedor) {

                    // Inicializando os dados do vendedor automaticamente:
                    $scope.venda.fin_vnd_cod_vendedor = objUsuario.usu_cod_vendedor;
                    $scope.venda.vendedorSelect = objUsuario.vendedor;

                }

                var strFiltro = $scope.paramPadrao.par_i03 + '|' + $scope.paramPadrao.par_i04 + '|' + $scope.paramPadrao.par_i05;

                ParamsService.paramPadroesNat.get({combinadoPar: strFiltro}, function (resposta) {

                    var objR = resposta.records;

                    //console.log('objR: ' ,objR);

                    if (objR != undefined) {
                        if (objR[6050] != undefined) {
                            $scope.venda.centroCustoSelect = objR[6050]['par_c01'];
                            $scope.venda.fin_6050_cdc = objR[6050]['par_pai'];
                        }
                        if (objR[5010] != undefined) {
                            $scope.venda.contaFinanceiraSelect = objR[5010]['par_c01'];
                            $scope.venda.fin_5010_conta_fin = objR[5010]['par_pai'];
                        }
                        if (objR[6010] != undefined) {
                            $scope.venda.vendedorSelect = objR[6010]['par_c01'];
                            $scope.venda.fin_vnd_cod_vendedor = objR[6010]['par_pai'];
                        }
                    }

                });

            };

            $scope.alterarInputDecimal = function(strCampo) {

                if (! $scope.venda.disabled) {

                    if ($scope.inputs[strCampo] === false) {

                        $scope.newItem[strCampo] = parseFloat($scope.newItem[strCampo].replace(',', '.'));

                    } else {

                        $scope.newItem[strCampo] = $scope.newItem[strCampo].toString().replace('.', ',');
                    }

                    $scope.inputs[strCampo] = !$scope.inputs[strCampo];
                }
            };

            /**
             * Retorna o registro de algum tipo de operaçao de transaçao financeira.
             */
            $scope.getOperacao = function (fin_nro_lan, func) {

                //$scope.onTimeout();

                VendaService.venda.get({fin_nro_lan: fin_nro_lan, op: $scope.venda.op}, function (data) {

                    var venda = data.records;
                    $scope.venda = venda;

                    //console.log('vv:', venda);

                    $scope.venda.selected = {};
                    $scope.venda.selectedParcela = {};

                    //console.log('sit:',$scope.venda.fin_6035_situacao);
                    if ($scope.venda.fin_6035_situacao == '81') {
                        //console.log('ven: ',$scope.venda);
                        $scope.chaveInutilizada = $scope.venda.fin_nfe_chave;
                        $scope.dataInutilizacao = GeralFactory.formatarDataBr($scope.venda.fin_dat_emi);
                        $scope.nroInutilizada = $scope.venda.fin_doc_nro;
                        $scope.espDoc = $scope.venda.fin_6030_esp_doc;
                        $scope.flagTutorial = true;
                        $scope.primeiraEtapa();
                        $scope.forms.form_venda.$setPristine();
                        //$scope.resetVars();

                        // $scope.listarVendas();
                        // $scope.listarFase();
                        //$scope.venda.fin_6035_situacao = '81';
                        $scope.ehInutilizado = true;
                        $scope.setNomeOperacao();

                        return;
                    }

                    $scope.venda.mostrarExcluirExcessao = false;
                    if ($scope.venda.fin_nfe_motivo == 'Rejeicao: Um numero da faixa ja foi utilizado' || $scope.venda.fin_nfe_motivo == 'Rejeicao: NF-e nao consta na base de dados da SEFAZ') {
                        $scope.venda.mostrarExcluirExcessao = true;
                    }

                    var vendedor = 'escolha um vendedor';

                    $scope.venda.fin_tip_emitente = (venda.fin_tip_emitente) ? venda.fin_tip_emitente : 'P';
                    $scope.venda.vendedorSelect = venda.fin_nome_vendedor; //vendedor;
                    $scope.venda.acao = venda.fin_cod_acao;
                    $scope.venda.clienteSelect = venda.fin_cad_nome_razao;
                    $scope.venda.formaPagamentoSelect = venda.fin_nome_forma_pagamento;
                    $scope.venda.centroCustoSelect = venda.fin_nome_centro_custo;
                    $scope.venda.contaFinanceiraSelect = venda.fin_nome_conta_financeira;
                    $scope.venda.fin_dat_lan = GeralFactory.formatarDataBr(venda.fin_dat_lan);
                    $scope.venda.fin_dat_emi = GeralFactory.formatarDataBr(venda.fin_dat_emi);

                    $scope.setNomeOperacao();
                    $scope.nomeBotao = 'Excluir';

                    //console.log('mot: ', $scope.venda.fin_nfe_motivo);
                    if ($scope.venda.fin_nfe_motivo != null && $scope.venda.fin_nfe_motivo.match(/diferen/)) {
                        $scope.venda.temDiferencaDup = true;
                    } else {
                        $scope.venda.temDiferencaDup = false;
                    }


                    if (venda.fin_dat_sai != null) {

                        //console.log('$scope.venda.fin_dat_sai: ',venda.fin_dat_sai);
                        var arrDh = venda.fin_dat_sai.split(' ');

                        //console.log('arrDh: ',arrDh);
                        $scope.venda.valorDataSai = GeralFactory.formatarDataBr(arrDh[0]);
                        $scope.venda.valorHoraSai = (arrDh[1] != '00:00:00') ? arrDh[1] : '';
                        $scope.venda.fin_dat_sai = $scope.venda.valorDataSai + ' ' + arrDh[1];
                    }
                    //$scope.venda.fin_dat_sai           = GeralFactory.formatarDataBr(venda.fin_dat_sai);

                    $scope.venda.descAcao = GeralFactory.getDescAcao(venda.fin_cod_acao)[2];
                    //$scope.venda.desc_fin_cfo_cfop = $scope.venda.cfo.cfo_cfop + ' - '+$scope.venda.cfo.cfo_descricao;
                    $scope.venda.codSituacao = $scope.venda.fin_6035_situacao;

                    if ($scope.venda.acao == 1 || $scope.venda.acao == 8 || $scope.venda.acao == 9) {
                        $scope.venda.disabled = true;
                    }

                    var reg = GeralFactory.getRegistroPorChave($scope.arr_6035, $scope.venda.fin_6035_situacao, 'par_pai');

                    $scope.venda.fin_nome_situacao = reg.par_c01;

                    //console.log('$scope.venda.fin_nome_situacao: ' , $scope.venda.fin_nome_situacao);
                    if (($scope.venda.fin_6035_situacao == 1203 || $scope.venda.fin_6035_situacao == 13) && $scope.empresa.emp_tip_nota == 2) {
                        $scope.venda.fin_nome_situacao = 'Aguardando Assinatura';

                    }

                    // Itens e parcelas da venda:
                    $scope.venda.itens = venda.itens_produto;
                    $scope.venda.parcelas = venda.parcelas;
                    $scope.objCloneParcelas = angular.copy($scope.venda.parcelas);
                    $scope.distribuirParcelas();

                    //console.log('$scope.venda.itens antesssssssssssss: ',$scope.venda.itens);

                    var despesas = 0;
                    angular.forEach($scope.venda.itens, function (i, j) {

                        //console.log('iiiiiiii3311: ',i);

                        $scope.venda.itens.key = 99;
                        $scope.venda.itens.pro_unidade = i.produto.pro_unidade;

                        if(i.produto.pro_ncm) {

                            //console.log('ttt: ',i.produto.pro_ncm);
                            $scope.venda.itens[j].pro_eh_complemento_imposto = (i.produto.pro_ncm.trim() == '99999999');
                        }

                        //console.log('$scope.venda.itens: ',$scope.venda.itens);

                        despesas = despesas + parseFloat(i.ite_vlr_tot_seguro) + parseFloat(i.ite_vlr_tot_despesas) + parseFloat(i.ite_vlr_tot_frete);
                        if (i.produto.pro_gru_cod_gru) {

                            ProdutoService.produtoGrupo.get({gru_cod_gru: i.produto.pro_gru_cod_gru}, function (data) {

                                $scope.venda.itens[j].produto_grupo = data.records;
                            });
                        }


                        angular.forEach(i.itens_tributo, function (regTrib, k) {

                            //console.log('ennnnn');
                            $scope.venda.itens[j].ite_cso = regTrib.tri_cso;
                            $scope.venda.itens[j].ite_cst = regTrib.tri_cst;
                        });

                        if ($scope.venda.fin_tip_cs_mudanca == '') {

                            if ($scope.empresa.emp_reg_trib == 4 || $scope.empresa.emp_reg_trib == 5) {
                                $scope.venda.itens[j].ite_valor_cs = $scope.venda.itens[j].ite_cst;
                            } else {
                                $scope.venda.itens[j].ite_valor_cs = $scope.venda.itens[j].ite_cso;
                            }
                        } else {
                            $scope.venda.itens[j].ite_valor_cs = ($scope.venda.fin_tip_cs_mudanca == 1) ? $scope.venda.itens[j].ite_cso : $scope.venda.itens[j].ite_cst;

                        }


                    });

                    $scope.venda.valorFrete = parseFloat($scope.venda.fin_doc_vlr_despesas) - despesas;

                    $scope.getCliente(venda.fin_cad_cod_cad);
                    $scope.getTotalItens();

                    $scope.getEmpresa(function () {
                        $scope.setTipCs();
                    });

                    var dtEmissao = $scope.venda.fin_dat_lan;
                    var arrDiferenca = [];

                    angular.forEach($scope.venda.parcelas, function (i, j) {

                        var dtFormatada = GeralFactory.formatarDataBr(i.tit_dat_vct);
                        $scope.venda.parcelas[j].tit_dat_vct = dtFormatada;

                        var diff = GeralFactory.diffDates(dtEmissao, dtFormatada);
                        arrDiferenca.push(diff);
                    });

                    // Verificando as parcelas da venda:
                    if ($scope.venda.fin_av_ap === 1) {

                        var qtdeParcelas;
                        if ($scope.venda.fin_cod_periodicidade === 0) {

                            qtdeParcelas = (arrDiferenca.length) ? arrDiferenca.join(' ') : '';
                            $scope.venda.qtde_parcelas = qtdeParcelas;

                        } else {

                            qtdeParcelas = $scope.venda.parcelas.length;
                            $scope.venda.qtde_parcelas = qtdeParcelas + 'x';
                        }
                    }

                    if ($scope.venda.fin_transportadora) {
                        $scope.venda.transportadoraSelect = $scope.venda.fin_transportadora.cad_nome_razao;
                    }

                    // TODO: Verificar quais campos da tabela são responsáveis pelos impostos:
                    $scope.venda.valorIpi = 0;
                    $scope.venda.valorIcmsSt = 0;

                    $timeout(function () {
                        $scope.flagTutorial = false;
                    }, 500);
                    $scope.listarFinObs();

                    //console.log('vend: ', $scope.venda);

                    if (func) {

                        //console.log('chamou função enviar nfe');

                        func.call();
                    }

                    $scope.getVerificaFasesByNatureza();

                    var seletor = ($scope.venda.acao === 0) ? '.sf-nav-step-1' : '.sf-nav-step-2';
                    angular.element(seletor).trigger('click');
                });
            };

            $scope.atualizarRetornoA3 = function () {

                $scope.emitirRetornoA3Loading = true;

                $scope.getOperacao($scope.venda.fin_nro_lan, function () {
                    angular.element('.sf-nav-step-2').click();
                    $scope.emitirRetornoA3Loading = false;

                    // console.log('sit: ', $scope.venda.fin_6035_situacao);
                    // console.log('click', $scope.clicouAcaoNfeA3);

                    if (($scope.clicouAcaoNfeA3 == 1 && ($scope.venda.fin_6035_situacao == 1200 || $scope.venda.fin_6035_situacao == 1203 || $scope.venda.fin_6035_situacao == 13))
                        || $scope.clicouAcaoNfeA3 == 2 && $scope.venda.fin_6035_situacao == 90) {

                        $scope.counter = 10;
                        $scope.onTimeout();
                        
                    } else {
                        $scope.countDownA3 = '';
                    }
                });
            };

            $scope.listarFinObs = function () {

                var strFiltro = 'q=(str_obs:' + $scope.venda.fin_nro_lan + ')'; //1= tipo cce

                $scope.arrVendaObs = [];
                $scope.hasCceAutorizada = false;
                $scope.totalCceAutorizada = 0;
                //$scope.arrVendaObsRef =[];
                var strCh = '';

                VendaService.vendasObs.get({u: strFiltro}).$promise.then(function (resposta) {

                    //console.log('rrrretorno CCeeee:',resposta);
                    angular.forEach(resposta.records, function (reg, k) {

                        if (reg['obs_tip'] == 1) {

                            var obsLength = resposta.records.length -1;

                            reg['obs_btenvia'] = true;

                            //se o registro da cce não tiver sido aceito pela sefaz
                            if (reg['obs_cod_retorno'] != '135' && reg['obs_cod_retorno'] != '573') {
                                reg['obs_str_retorno'] = 'Erro';

                            } else {

                                reg['obs_str_retorno']     = 'Enviado';
                                $scope.hasCceAutorizada    = true;
                                $scope.totalCceAutorizada += 1;
                            }

                            if($scope.totalCceAutorizada >= 20) {
                                reg['obs_btenvia'] = false;
                            }

                            if(k == obsLength) {
                                $scope.arrVendaObs.push(reg);
                            }

                        } else if (reg['obs_tip'] == 2) {

                            $scope.venda.fin_modelo_referenciada = '2';
                            $scope.venda.obs_chave = reg.obs_chave;

                        } else if (reg['obs_tip'] == 4) {


                            $scope.venda.fin_modelo_referenciada = '4';
                            $scope.venda.obs_doc_nro = reg.obs_doc_nro;
                            $scope.venda.obs_doc_dat_emi = GeralFactory.formatarDataBr(reg.obs_doc_dat_emi);

                        } else if (reg['obs_tip'] == 10) {

                            $scope.venda.fin_modelo_referenciada = '10';
                            $scope.venda.obs_doc_nro = reg.obs_doc_nro;
                            $scope.venda.obs_doc_dat_emi = GeralFactory.formatarDataBr(reg.obs_doc_dat_emi);

                        } else if (reg['obs_tip'] == 11) {

                            $scope.venda.fin_modelo_referenciada = '11';
                            $scope.venda.obs_doc_nro = reg.obs_doc_nro;
                            $scope.venda.obs_doc_dat_emi = GeralFactory.formatarDataBr(reg.obs_doc_dat_emi);

                        } else if (reg['obs_tip'] == 30) {

                            $scope.venda.fin_modelo_referenciada = '30';
                            $scope.venda.obs_doc_nro_ecf = reg.obs_doc_nro_ecf;
                            $scope.venda.obs_doc_coo = reg.obs_doc_coo;

                        } else if (reg['obs_tip'] == 65) {

                            $scope.venda.fin_modelo_referenciada = '65';
                            $scope.venda.obs_chave = reg.obs_chave;
                        }
                    });
                });
            };


            $scope.listarFase = function () {

                var strFiltro = GeralFactory.formatarPesquisar({par_i01 : $scope.venda.codNatureza});

                ParamsService.fases.get({u: strFiltro}).$promise.then(function (resposta) {

                    $scope.arrFase = resposta.records;

                    angular.forEach($scope.arrFase, function (reg, k) {

                        $scope.fase_escolhida[k] = reg;
                    });
                });

            };

            /**
             * Retorna um objeto contendo os filtros utilizados na busca.
             */
            $scope.filtroPesquisarVenda = function () {

                var strAcoes  = GeralFactory.getStringFiltroOffArray($scope.pesquisarVenda.acoes, 'id');

                var strFases  = GeralFactory.getStringFiltroOffArray($scope.pesquisarVenda.fases, 'par_i01');

                var strEspDoc = GeralFactory.getStringFiltroOffArray($scope.pesquisarVenda.especies, 'id_esp_doc');

                var strFormas = GeralFactory.getStringFiltroOffArray($scope.pesquisarVenda.formasPagamento, 'par_pai');

                var strSituacoes = '';
                if ($scope.pesquisarVenda.arrSitSelecionadas.length) {

                    strSituacoes = $scope.pesquisarVenda.arrSitSelecionadas.join('|');
                }

                var textoPesquisa = GeralFactory.replaceArray($scope.pesquisarVenda.texto_venda_pesquisar, ['.', '/', '-'], '');
                return {
                    'vendas_validas': 1,
                    'arr_acoes': strAcoes,
                    'arr_fase': strFases,
                    'arr_esp_doc': strEspDoc,
                    'arr_situacoes': strSituacoes,
                    'arr_formas' : strFormas,
                    'texto_venda_pesquisar': (textoPesquisa) ? textoPesquisa : '',
                    'dt_lan_inicio': ($scope.pesquisarVenda.dt_lan_inicio) ? $scope.pesquisarVenda.dt_lan_inicio : '',
                    'dt_lan_final': ($scope.pesquisarVenda.dt_lan_final) ? $scope.pesquisarVenda.dt_lan_final : '',
                    'doc_nro_inicio': ($scope.pesquisarVenda.doc_nro_inicio) ? $scope.pesquisarVenda.doc_nro_inicio : '',
                    'doc_nro_final': ($scope.pesquisarVenda.doc_nro_final) ? $scope.pesquisarVenda.doc_nro_final : '',
                    'fin_usu_cod_usuario': ($scope.pesquisarVenda.fin_usu_cod_usuario) ? $scope.pesquisarVenda.fin_usu_cod_usuario : '',
                    'vendedor': ($scope.pesquisarVenda.vendedor) ? $scope.pesquisarVenda.vendedor : '',
                    'pro_cod_pro_inicio': ($scope.pesquisarVenda.pro_cod_pro_inicio) ? $scope.pesquisarVenda.pro_cod_pro_inicio : '',
                    // 'arr_esp_doc': ($scope.pesquisarVenda.fin_6030_esp_doc) ? $scope.pesquisarVenda.fin_6030_esp_doc : '',
                    'pro_cod_pro_final': ($scope.pesquisarVenda.pro_cod_pro_final) ? $scope.pesquisarVenda.pro_cod_pro_final : ''
                };
            };

            /**
             * Mostra ou oculta o painel de pesquisa.
             */
            $scope.showPanel = function () {

                $scope.hasFilter = !$scope.hasFilter;
            };

            /**
             * Retorna uma lista de operações baseada no filtro utilizado pelo usuário.
             */
            $scope.getPesquisar = function () {

                $timeout(function () {

                    $scope.hasFilter && $scope.showPanel();
                    $scope.listarVendas();

                });
            };

            /**
             * Nova listagem das operações!
             */
            $scope.listarVendas = function () {

                $rootScope.spinnerList.on();
                $scope.arrVendas = [];

                $timeout(function () {

                    var objFiltro = $scope.filtroPesquisarVenda();
                    var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=0');

                    VendaService.vendas.get({u: strFiltro, op: $scope.venda.op}, function (retorno) {
                        if (retorno.records.length > 0) {

                            $scope.iterarVendas(retorno.records, true);
                            $timeout(function () {

                                $rootScope.spinnerList.off();
                                $scope.getSomaTotalVlrLiquido();

                            }, 2000);
                        } else {

                            $rootScope.spinnerList.off();
                        }
                    });

                }, 1000);
            };

            /**
             * Método responsável em efetuar a paginação das operações.
             */
            $scope.paginarVendas = function () {

                $rootScope.spinnerList.on();

                var objFiltro = $scope.filtroPesquisarVenda();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=' + $scope.getOffset());

                VendaService.vendas.get({u: strFiltro, op: $scope.venda.op}, function (retorno) {
                    if (retorno.records.length > 0) {

                        $scope.iterarVendas(retorno.records, false);
                        $timeout(function () {

                            $rootScope.spinnerList.off();
                            $scope.getSomaTotalVlrLiquido();

                        }, 2000);
                    } else {

                        $rootScope.spinnerList.off();
                        var mensagem = 'Caro usuário, a listagem já se encontra completa!';
                        GeralFactory.notify('warning', 'Atenção:', mensagem);
                    }
                });
            };

            /**
             * Método responsável em percorrer o retorno das vendas vindas da API e efetuar as
             * devidas tratativas para construção da listagem dos registros.
             */
            $scope.iterarVendas = function (arrVendas, reset) {

                if (!_.isEmpty(arrVendas)) {

                    if (reset)
                        $scope.arrVendas = [];

                    $timeout(function () {

                        angular.forEach(arrVendas, function (i) {

                            i['strEspDoc'] = GeralFactory.getAbrDescEspDoc(i['fin_6030_esp_doc'], i['fin_6035_situacao'], i['fin_6020_natureza']);

                            i['fase'] = GeralFactory.getRegistroPorChave($scope.arrFase, i['fin_6025_fase'], 'par_i01');

                            i['situacao'] = GeralFactory.getRegistroPorChave($scope.arr_6035, i['fin_6035_situacao'], 'par_pai');

                            i['nomeSituacao'] = (i['fin_cod_acao'] == '8' && i['fin_6035_situacao'] == '0') ? 'Cancelado' : i['situacao'].par_c01;

                            i['nomeAcao'] = GeralFactory.getDescAcao(i['fin_cod_acao'])[3];

                            if(i['fin_nfe_motivo'] != null) {

                                if(i['fin_nfe_motivo'].match(/aceite de cancelamento/i)) {
                                    //console.log('ooo');
                                    i['nomeSituacao'] = 'Aguardando Aceite';
                                }
                            }

                            $scope.arrVendas.push(i);
                        });

                    }, 2000);
                } else {

                    $scope.arrVendas = [];
                }
            };

            /**
             * Soma o valor total liquido na listagem da venda
             */
            $scope.getSomaTotalVlrLiquido = function () {

                var objFiltro = $scope.filtroPesquisarVenda();
                objFiltro['fin_6020_natureza'] = $scope.venda.codNatureza;

                var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                $scope.venda.somaTotalVlrLiquido = 0;
                VendaService.vendas.totalizar({u: strFiltro}, function (retorno) {
                    if (retorno.records) {
                        $timeout(function () {
                            $scope.venda.somaTotalVlrLiquido = retorno.records[0]['total'];
                        });
                    }
                });
            };

            /**
             * Retorna o limite de registros para a paginação.
             */
            $scope.getOffset = function () {

                return ($scope.arrVendas.length) ? $scope.arrVendas.length : 0;
            };

            /**
             *
             */
            $scope.sobreporNroDoc = function () {

                //console.log('vai sobrepor');
                var docNum = GeralFactory.getNroDocPorChave($scope.venda.fin_nfe_chave);
                //console.log('docNum: ',docNum);
                $scope.venda.fin_doc_nro = docNum;
            };

            /**
             * Efetua a totalização de valores dos itens da venda.
             */
            $scope.getTotalItens = function () {

                //console.log('chama getTotalItens');
                var somaValor = 0, somaDesconto = 0, somaDespesas = 0, somaFrete = 0, somaSeguro = 0, somaImpostosRetidos = 0, somaLiq = 0;

                $scope.totalItens = $scope.venda.itens.length;
                angular.forEach($scope.venda.itens, function (item, key) {

                    //console.log('somavalor1: ', parseFloat(somaValor));
                    //console.log('ite_pro_qtd1 -- ite_vlr_uni_bruto: ', item.ite_pro_qtd ,' * ',(item.ite_vlr_uni_bruto));

                    //console.log('item88: ',item);
                    var valorBrutoItem = 0;

                    if ($scope.venda.fin_nfe_finalidade == 2) {

                        valorBrutoItem = (item.ite_pro_qtd > 0) ? ((item.ite_pro_qtd) * (item.ite_vlr_uni_bruto)) : item.ite_vlr_uni_bruto;
                    } else {

                        valorBrutoItem = ((item.ite_pro_qtd) * (item.ite_vlr_uni_bruto));
                    }

                    valorBrutoItem = GeralFactory.roundNumber(valorBrutoItem, 2);

                    //console.log('valorBrutoItem: ' ,valorBrutoItem);

                    somaValor = parseFloat(somaValor) + valorBrutoItem;
                    //console.log('somaValorxx: ',somaValor);
                    //somaValor = somaValor.toFixed(2);
                    //somaValor = GeralFactory.roundNumber(somaValor,2);
                    somaDesconto = parseFloat(somaDesconto) + parseFloat(item.ite_vlr_tot_desconto);
                    somaDespesas = parseFloat(somaDespesas) + parseFloat(item.ite_vlr_tot_despesas);
                    somaFrete = parseFloat(somaFrete) + parseFloat(item.ite_vlr_tot_frete);
                    somaSeguro = parseFloat(somaSeguro) + parseFloat(item.ite_vlr_tot_seguro);
                    somaImpostosRetidos = parseFloat(somaImpostosRetidos) + parseFloat(item.ite_vlr_tot_impostos_retidos);

                    //console.log('somaliq7: ',parseFloat(somaLiq) , ' --- ', parseFloat(item.ite_vlr_tot_liquido));

                    somaLiq = parseFloat(somaLiq) + parseFloat(item.ite_vlr_tot_liquido);

                    somaLiq = GeralFactory.roundNumber(somaLiq, 2);

                    $scope.venda.itens[key].ite_vlr_tot_bruto = valorBrutoItem;
                    $scope.venda.itens[key].ite_vlr_tot_liquido = GeralFactory.roundNumber(item.ite_vlr_tot_liquido, 2);

                    //console.log('somaLiq666:',somaLiq);

                    //console.log('somaValor: ',somaValor);
                });

                $scope.venda.valorFrete = ($scope.venda.valorFrete) ? $scope.venda.valorFrete : 0;
                $scope.venda.fin_doc_vlr_bruto = somaValor;
                $scope.venda.somaSeguro = somaSeguro;
                $scope.venda.somaDesconto = somaDesconto;
                $scope.venda.somaDespesas = somaDespesas;
                $scope.venda.somaFrete = somaFrete;
                $scope.venda.somaImpostosRetidos = somaImpostosRetidos;
                $scope.venda.somaImpostosRetidos_format = GeralFactory.currencyDecimal(somaImpostosRetidos); //TODO DD

                //console.log('somaImpostosRetidos:', somaImpostosRetidos);
                //console.log('somaDesconto:', somaDesconto);
                //console.log('somaValor:', somaValor);
                //console.log('somaSeguro:', somaSeguro);
                //console.log('somaDespesas:', somaDespesas);
                //console.log('somaFrete:', parseFloat($scope.venda.somaFrete));

                //$scope.venda.somaFreteAntes    = somaFrete;



                //se for serviço (imposto iss) e cliente tem iss retido, entao vai diminuir no valor da nota
                if($scope.venda.codNatureza == 31 && $scope.cliente.cad_tip_contribuinte_iss) {
                    //console.log('servico22');
                    somaImpostosRetidos = parseFloat(parseFloat(somaImpostosRetidos) * (-1));
                }

                var somaTotLiquido4Digitos = somaValor + parseFloat($scope.venda.somaFrete) + somaDespesas + somaSeguro + somaImpostosRetidos - somaDesconto;

                //console.log('somaLiq: ', parseFloat(somaLiq));
                //console.log('somaTotLiquido4Digitos: ',parseFloat(somaTotLiquido4Digitos));

                somaLiq = GeralFactory.roundNumber(somaLiq, 2);
                somaTotLiquido4Digitos = GeralFactory.roundNumber(somaTotLiquido4Digitos, 2);

                //console.log('somaLiq2: ', somaLiq);

                //somaLiq = somaLiq.toFixed(4);
                //somaTotLiquido4Digitos = somaTotLiquido4Digitos.toFixed(4);


                d = parseFloat(somaTotLiquido4Digitos) - parseFloat(somaLiq);

                var e = parseFloat(somaTotLiquido4Digitos - somaLiq);
                //console.log('d vale: ',d);
                //console.log('e vale: ',e);


                //if(d > 0 && d < 0.04) {
                //    //console.log('difere:  ' , d);
                //   $scope.venda.somaTotalLiquido  = somaLiq;
                //} else {
                //   //console.log('elsg: ',d);
                //console.log('somaTotLiquido4Digitos2:',somaTotLiquido4Digitos);
                $scope.venda.somaTotalLiquido = somaTotLiquido4Digitos;
                //}
            };

            $scope.focusTypeHead = function () {


            };

            /**
             * Função para ser usada com typeahead, pois precisa de retornar uma $promise.
             */
            $scope.listarProduto = function (nome) {

                nome = nome.trim();

                var objFiltro = {
                    'pro_descricao_longa': nome
                };
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                return ProdutoService.produtos.get({u: strFiltro}).$promise.then(function (resposta) {

                    resposta.records.push({
                        id: '1#1',
                        nome_real_produto: nome,
                        pro_descricao_longa: 'Adicionar produto ' + nome
                    });
                    return resposta.records;
                });
            };

            /**
             * Lista os vendedores.
             */
            $scope.listarVendedor = function (nome) {

                nome = nome.trim();

                var objFiltro = {
                    'par_c01': nome
                };
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                return ParamsService.vendedores.get({u: strFiltro}).$promise.then(function (resposta) {
                    resposta.records.push({
                        id: '1#1',
                        nome_real: nome,
                        par_c01: 'Adicionar vendedor ' + nome
                    });
                    return resposta.records;
                });
            };

            /**
             * Ao escolher algum vendedor.
             */
            // $scope.onSelectVendedor = function($item, $model, $label) {
            //
            //     var objVendedor = {};
            //
            //     $scope.$item  = $item;
            //     $scope.$model = $model;
            //     $scope.$label = $label;
            //
            //     if ($item.id === '1#1') {
            //
            //         var nomeReal = $item.nome_real.trim();
            //         if (GeralFactory.ehVazioCombo($item)) {
            //             $scope.venda.vendedorSelect = '';
            //             return false;
            //         }
            //
            //         objVendedor.par_c01 = nomeReal;
            //         GeralFactory.verificarItem($scope.arrVendedores, nomeReal, 'par_c01', function(canSave) {
            //
            //             if (! canSave) {
            //
            //                 $scope.venda.vendedorSelect = '';
            //                 GeralFactory.notify('warning', 'Atenção!', 'Vendedor já existente!');
            //             } else {
            //
            //                 ParamsService.vendedores.create(objVendedor, function(resposta) {
            //                     $scope.venda.vendedorSelect = nomeReal;
            //                     $scope.venda.ite_vnd_cod_vendedor_item = resposta.records.par_pai;
            //                     $scope.getVendedor();
            //                 });
            //             }
            //         });
            //
            //     } else {
            //
            //         $scope.getVendedor($item.par_pai);
            //         $scope.venda.vendedorSelect = $item.par_c01;
            //     }
            // };
            //
            // /**
            //  * Obtém dados de um determinado vendedor.
            //  */
            // $scope.getVendedor = function(par_pai) {
            //
            //     if (par_pai) {
            //
            //         ParamsService.vendedor.get({par_pai : par_pai}, function(data) {
            //
            //             $scope.vendedor = data.records;
            //             $scope.venda.ite_vnd_cod_vendedor_item = par_pai;
            //         });
            //     } else {
            //
            //         ParamsService.vendedores.get({u : ''}, function(resposta) {
            //
            //             $scope.arrVendedores = resposta.records;
            //         });
            //     }
            // };


            /**
             * Método responsável pela seleção dos dados de um determinado centro de custo
             * pelo componente de autocomplete contido na tela.
             */
            $scope.onSelectVendedor = function ($item) {

                //console.log('it v: ',$item);
                $scope.getVendedor($item.par_pai);

                //$scope.venda.vendedorSelected = $item.par_pai;

            };

            /**
             * Método responsável em recolher os vendedores existente ou apenas um determinado
             * vendedor de acordo com o código de identificação do mesmo.
             */
            $scope.getVendedor = function (par_pai) {

                if (par_pai) {

                    ParamsService.vendedor.get({par_pai: par_pai}, function (resposta) {

                        $scope.vendedor = resposta.records;
                        $scope.venda.fin_vnd_cod_vendedor = par_pai;
                        //$scope.venda.vendedorSelected = $scope.venda.vendedorSelect = resposta.records.par_c01;

                    });
                } else {

                    ParamsService.vendedores.get({u: strFiltro}, function (resposta) {
                        $scope.arrVendedor = resposta.records;
                    });

                }

            };

            /**
             * Retorna a janela de form carta de correçao da nota ou uma nova
             */
            $scope.getFormCce = function (obs_seq) {

                //console.log('formccee');
                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.fin_nro_lan = $scope.venda.fin_nro_lan;

                if (obs_seq) {

                    scope.params.obs_seq = obs_seq;
                }

                //console.log('uuu');
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'venda/views/janela-cce.html',
                    controller: 'VendaCceModalCtrl',
                    size: 'lg',
                    windowClass: 'center-modal',
                    scope: scope,
                    resolve: {}
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {

                    if (msg === 'reload') {

                        $scope.listarFinObs();
                        // VendaService.clienteAnotacoes.get({cad_cod_cad : $scope.cliente.cad_cod_cad}, function(data) {
                        //     $scope.listaAnotacao = data.records;
                        // });
                    }
                });
            };


            $scope.getFormDocRef = function () {

                //console.log('formccee');
                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.fin_nro_lan = $scope.venda.fin_nro_lan;
                scope.params.v = $scope.venda;


                //console.log('uuu');
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'venda/views/janela-doc-ref.html',
                    controller: 'VendaDocRefModalCtrl',
                    size: 'lg',
                    windowClass: 'center-modal',
                    scope: scope,
                    resolve: {}
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {

                    //console.log('aaad: ',modalInstance.v);
                    if (msg === 'reload') {

                        if (modalInstance.v.fin_modelo_referenciada != undefined) {

                            $scope.venda.fin_modelo_referenciada = modalInstance.v.fin_modelo_referenciada;
                        }

                        if (modalInstance.v.obs_doc_nro != undefined) {

                            $scope.venda.obs_doc_nro = modalInstance.v.obs_doc_nro;
                        }

                        if (modalInstance.v.obs_doc_dat_emi != undefined) {

                            $scope.venda.obs_doc_dat_emi = modalInstance.v.obs_doc_dat_emi;
                        }

                        if (modalInstance.v.obs_chave != undefined) {

                            $scope.venda.obs_chave = modalInstance.v.obs_chave;
                        }

                        if (modalInstance.v.obs_doc_nro_ecf != undefined) {

                            $scope.venda.obs_doc_nro_ecf = modalInstance.v.obs_doc_nro_ecf;
                        }

                        if (modalInstance.v.obs_doc_coo != undefined) {

                            $scope.venda.obs_doc_coo = modalInstance.v.obs_doc_coo;
                        }

                    }
                });
            };

            /**
             * Método responsável pela seleção dos dados de uma determinada forma de pagamento
             * pelo componente de autocomplete contido na tela.
             */
            $scope.onSelectFormaPagamento = function ($item) {

                $scope.getFormaPagamento($item.par_pai);
                $scope.venda.formaPagamentoSelec = $item.par_c01;
            };

            /**
             * Método responsável em adicionar uma determinada forma de pagamento diretamente pelo
             * componente de autocomplete contido na tela.
             */
            $scope.addFormaPagamento = function ($item) {

                var objFormaPagamento = {
                    par_c01: $item.trim()
                };

                ParamsService.formaPagamentos.create(objFormaPagamento, function (retorno) {
                    if (!retorno.records.error) {

                        $scope.venda.formaPagamentoSelect = $item.trim();
                        $scope.venda.fin_6060_forma_pagamento = retorno.records.par_pai;
                        $scope.getFormaPagamento();
                    }
                });
            };

            /**
             * Obtém os dados de uma determinada forma de pagamento.
             */
            $scope.getFormaPagamento = function (par_pai) {

                if (par_pai) {

                    ParamsService.formaPagamento.get({par_pai: par_pai}, function (data) {

                        $scope.formaPagamento = data.records;
                        $scope.venda.fin_6060_forma_pagamento = par_pai;
                    });
                } else {

                    ParamsService.formaPagamentos.get({u: ''}, function (resposta) {
                        $scope.arrFormasPagamento = resposta.records;
                    });
                }
            };

            /**
             * Método responsável pela seleção dos dados de um determinado centro de custo
             * pelo componente de autocomplete contido na tela.
             */
            $scope.onSelectCentroCusto = function ($item) {

                $scope.getCentroCusto($item.par_pai);
                $scope.venda.centroCustoSelect = $item.par_c01;
            };

            /**
             * Método responsável em adicionar um determinado centro de custo diretamente pelo
             * componente de autocomplete contido na tela.
             */
            $scope.addCentroCusto = function ($item) {

                var objCentroCusto = {
                    par_c01: $item.trim()
                };

                if ($scope.objDropdown.objCentroCusto.par_i03) {

                    objCentroCusto['par_i03'] = $scope.objDropdown.objCentroCusto.par_i03;
                }

                ParamsService.centroCustos.create(objCentroCusto, function (retorno) {
                    if (!retorno.records.error) {

                        $scope.venda.centroCustoSelect = $item.trim();
                        $scope.venda.fin_6050_cdc = retorno.records.par_pai;
                        $scope.getCentroCusto();
                    }
                });
            };

            /**
             * Obtém dados de um determinado centro de custo.
             */
            $scope.getCentroCusto = function (par_pai) {

                if (par_pai) {

                    ParamsService.centroCusto.get({par_pai: par_pai}, function (data) {

                        $scope.centroCusto = data.records;
                        $scope.venda.fin_6050_cdc = par_pai;
                    });
                } else {

                    var strFiltro = '';
                    if ($scope.objDropdown.objCentroCusto.par_i03) {

                        strFiltro = GeralFactory.formatarPesquisar({
                            'par_i03': $scope.objDropdown.objCentroCusto.par_i03
                        });
                    }

                    ParamsService.centroCustos.get({u: strFiltro}, function (resposta) {
                        $scope.arrCentroCusto = resposta.records;
                    });
                }
            };

            /**
             * Método responsável pela seleção dos dados de uma determinada conta financeira
             * pelo componente de autocomplete contido na tela.
             */
            $scope.onSelectContaFinanceira = function ($item) {

                $scope.getContaFinanceira($item.par_pai);
                $scope.venda.contaFinanceiraSelect = $item.par_c01;
            };

            /**
             * Método responsável em adicionar uma determinada conta financeira diretamente pelo
             * componente de autocomplete contido na tela.
             */
            $scope.addContaFinanceira = function ($item) {

                var objContaFinanceira = {
                    par_c01: $item.trim()
                };

                ParamsService.contaFinanceiras.create(objContaFinanceira, function (retorno) {
                    if (!retorno.records.error) {

                        $scope.venda.contaFinanceiraSelect = $item.trim();
                        $scope.venda.tit_5010_conta_fin = retorno.records.par_pai;
                        $scope.getContaFinanceira();
                    }
                });
            };

            /**
             * Obtém dados de uma determinada conta financeira.
             */
            $scope.getContaFinanceira = function (par_pai) {

                if (par_pai) {

                    ParamsService.contaFinanceira.get({par_pai: par_pai}, function (data) {
                        $scope.contaFinanceira = data.records;
                        $scope.venda.fin_5010_conta_fin = par_pai;
                    });
                } else {

                    ParamsService.contaFinanceiras.get({u: ''}, function (resposta) {
                        $scope.arrContasFinan = resposta.records;
                    });
                }
            };

            /**
             *
             */
            $scope.editContact = function (item, k, $index) {

                //console.log('item ini: ',item);
                //console.log('ttt: ',item.ite_vlr_tot_naotrib);

                $scope.flgAlterouValorNota = true;
                item.ite_pro_qtd = parseFloat(item.ite_pro_qtd);

                $scope.keyEdit = k;
                $scope.venda.selected = item;
                $scope.venda.selected.ite_vlr_tot_naotrib = GeralFactory.verificarNaN($scope.venda.selected.ite_vlr_tot_naotrib);
                $scope.venda.selected.ite_vlr_tot_contabil = GeralFactory.verificarNaN($scope.venda.selected.ite_vlr_tot_contabil);


                if ($scope.venda.fin_nro_lan != undefined) {

                    angular.forEach($scope.venda.itens, function (i, j) {

                        if (i.ite_pro_cod_pro == item.ite_pro_cod_pro) {

                            $scope.produto = i.produto;
                        }
                    });
                }

                //console.log('p4:',$scope.produto);

                //console.log('eee: ',$scope.venda.selected.ite_vlr_tot_naotrib);
                // Abrir janela modal para edição do item escolhido:
                if (item) {

                    var scope = $rootScope.$new();

                    //console.log('selecteduuu: ',$scope.venda.selected);
                    scope.params = {};
                    scope.params.v = $scope.venda;
                    scope.params.venda = $scope.venda.selected;
                    scope.params.keyEdit = $scope.keyEdit;
                    scope.params.$index = $index;
                    scope.params.codNatureza = $scope.venda.codNatureza;
                    scope.params.empresa = $scope.empresa;
                    scope.params.cliente = $scope.cliente;
                    scope.params.produto = $scope.produto;
                    scope.params.interUf = '';
                    scope.params.endCliUf = $scope.cliente.endereco.end_endereco_uf;

                    if ($scope.cliente.endereco.end_endereco_cod_uf) {

                        if ($scope.cliente.endereco.end_endereco_cod_uf != $scope.empresa.emp_cod_uf) {

                            scope.params.interUf = 1;
                        }
                    }

                    //console.log('pp7:',scope.params.venda);

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'venda/views/janela-item.html',
                        controller: 'VendaModalCtrl',
                        size: 'lg',
                        windowClass: 'center-modal no-top-modal',
                        backdrop: 'static',
                        scope: scope,
                        resolve: {}
                    });

                    modalInstance.result.then(function (id) {
                    }, function (msg) {
                        if (msg === 'reload') {

                            if (modalInstance.hasAlteracao) {

                                switch (modalInstance.acaoEscolhida) {
                                    case 'cancelar':
                                        $scope.removerItem(modalInstance.itemDelIndex);
                                        $scope.zerarParcelas();
                                        break;

                                    case 'atualizar':
                                        var objVenda = modalInstance.objVenda.venda;
                                        var keyEdit = modalInstance.objVenda.keyEdit;

                                        // console.log('objVenda2', objVenda);

                                        //console.log('nnbbb:' ,modalInstance.objVenda.venda.ite_cso);

                                        //console.log('objVenda3333:', objVenda);

                                        $scope.venda.fin_tip_cs_mudanca = modalInstance.objVenda.v.fin_tip_cs_mudanca;

                                        //console.log('rrrrrrrrrrrr33:',$scope.venda.fin_tip_cs_mudanca);

                                        // Atualizando os campos de valores do item no escopo principal:
                                        $scope.venda.itens[keyEdit].ite_pro_qtd = parseFloat(objVenda.ite_pro_qtd);
                                        $scope.venda.itens[keyEdit].ite_vlr_uni_bruto = parseFloat(objVenda.ite_vlr_uni_bruto);
                                        $scope.venda.itens[keyEdit].ite_vlr_tot_bruto = parseFloat(objVenda.ite_vlr_tot_bruto);
                                        $scope.venda.itens[keyEdit].ite_vlr_tot_desconto = parseFloat(objVenda.ite_vlr_tot_desconto);
                                        $scope.venda.itens[keyEdit].ite_vlr_tot_liquido = parseFloat(objVenda.ite_vlr_tot_liquido);
                                        $scope.venda.itens[keyEdit].ite_vlr_tot_despesas = parseFloat(objVenda.ite_vlr_tot_despesas);
                                        $scope.venda.itens[keyEdit].ite_vlr_tot_frete = parseFloat(objVenda.ite_vlr_tot_frete);
                                        $scope.venda.itens[keyEdit].ite_vlr_tot_seguro = parseFloat(objVenda.ite_vlr_tot_seguro);
                                        $scope.venda.itens[keyEdit].itens_tributo = objVenda.itens_tributo;
                                        $scope.venda.itens[keyEdit].ite_cso = parseInt(objVenda.ite_cso);
                                        $scope.venda.itens[keyEdit].ite_cst = parseInt(objVenda.ite_cst);

                                        //ICMS NÃO TRIBUTADO "OUTROS"
                                        // if(parseFloat(objVenda.ite_vlr_tot_naotrib) > 0) {
                                        //
                                        //     $scope.venda.itens[keyEdit].itens_tributo[0].tri_naotrib_vlr = parseInt(objVenda.ite_vlr_tot_naotrib);
                                        //     $scope.venda.itens[keyEdit].itens_tributo[0].tri_naotrib_tip = '3';//"OUTROS"
                                        //
                                        //     //console.log('operação com "ICMS OUTROS": ',$scope.venda);
                                        // }

                                        //feito para que aparecesse no grid dos itens o cso/cst
                                        angular.forEach(objVenda.itens_tributo, function (reg, k) {

                                            if (reg.tri_imp_cod_imp == 1) {

                                                $scope.venda.itens[keyEdit].ite_cso = parseInt(reg.tri_cso);
                                                $scope.venda.itens[keyEdit].ite_cst = parseInt(reg.tri_cst);

                                                if ($scope.empresa.emp_reg_trib == 4 || $scope.empresa.emp_reg_trib == 5) {
                                                    $scope.venda.itens[keyEdit].ite_valor_cs = reg.tri_cst;
                                                } else {
                                                    $scope.venda.itens[keyEdit].ite_valor_cs = reg.tri_cso;

                                                }
                                            }
                                        });

                                        //console.log('objVenda: ',objVenda);

                                        $scope.venda.itens[keyEdit].ite_cfo_cfop = parseInt(objVenda.ite_cfo_cfop);
                                        $scope.venda.itens[keyEdit].ite_vlr_tot_impostos_retidos = parseFloat(objVenda.ite_vlr_tot_impostos_retidos);
                                        $scope.venda.itens[keyEdit].ite_vlr_tot_impostos_retidos_format = parseFloat(objVenda.ite_vlr_tot_impostos_retidos);
                                        $scope.venda.itens[keyEdit].ite_vnd_cod_vendedor_item = objVenda.ite_vnd_cod_vendedor_item;
                                        $scope.venda.itens[keyEdit].ite_pro_descricao = objVenda.ite_pro_descricao;

                                        // $scope.venda.itens[keyEdit].ite_cfo_cfop   = objVenda.ite_cfo_cfop;
                                        // $scope.venda.itens[keyEdit].desc_ite_cfo_cfop = objVenda.desc_ite_cfo_cfop;
                                        // $scope.venda.itens[keyEdit].ite_cs_origem   = parseInt(objVenda.ite_cs_origem);

                                        //console.log('itens2:', $scope.venda.itens);

                                        $scope.getTotalItens();
                                        modalInstance.zerarParcela && $scope.zerarParcelas();

                                        //console.log('vvee: ',$scope.venda);

                                        break;
                                }
                            }
                        }
                    });
                }
            };

            /**
             * Adiciona um novo item no objeto de venda.
             * Itens que é o vetor que preenche a tabela de itens.
             */
            $scope.addItem = function (isClick) {

                // console.log('ainda nao liberado');
                // console.log('isClick: ', isClick);

                // $scope.newItem['ite_vlr_uni_bruto'] = parseFloat($scope.newItem['ite_vlr_uni_bruto'].replace(',', '.'));

                if (_.isEmpty($scope.newItem)) {

                    GeralFactory.notify('danger', 'Atenção!', 'Escolha ao menos um produto para adicionar!');
                    return false;

                } else if (!$scope.newItem.ite_vlr_uni_bruto && $scope.venda.fin_nfe_finalidade != 2) {

                    //Permite adicionar o item com valor zerado apenas para nota de complemento!!!
                    GeralFactory.notify('danger', 'Atenção!', 'O valor do item não pode ser igual a 0!');
                    return false;

                } else if ($scope.venda.fin_nfe_finalidade == 2) {

                    $scope.liberarAddItem = true;
                    $scope.flagAddItem = true;

                } else {

                    // Quando adicionado pelo ENTER verificar os campos de quantidade e valor:
                    if (!isClick) {

                        if (!$scope.flagInputQdte) {

                            $('#new_qtde_id').focus().select();
                            $scope.flagAddItem = false;
                            $scope.flagInputQdte = true;
                            return false;

                        } else {

                            $('#new_vlr_bruto').focus().select();
                            $scope.flagAddItem = true;
                            return false;
                        }
                    } else {
                        //validacao muito importante para ele clicar varias vezes seguidas no additem e nao ir duplicado pra grade
                        if (!$scope.liberarAddItem) {
                            return false;
                        }

                        $scope.liberarAddItem = false;

                    }
                }

                // NÃO É PRODUTO, É COMPLEMENTO DE IMPOSTO, ADICIONA POIS NÃO TEM QUANTIDADE NEM VALOR!!!
                if($scope.newItem.pro_eh_complemento_imposto) {

                    $scope.newItem.ite_vlr_tot_bruto = 0;
                    $scope.newItem.ite_pro_qtd       = 0;
                    $scope.newItem.ite_vlr_uni_bruto = 0;

                    $scope.liberarAddItem = true;

                } else {

                    if (typeof($scope.newItem['ite_vlr_uni_bruto']) === 'string') {

                        $scope.newItem['ite_vlr_uni_bruto'] = parseFloat($scope.newItem['ite_vlr_uni_bruto'].replace(',', '.'));
                    }

                    var qtdStr = $scope.newItem.ite_pro_qtd.toString();

                    if (qtdStr.match(/,/gi)) {
                        $scope.newItem.ite_pro_qtd = $scope.newItem.ite_pro_qtd.replace(',', '.');
                    }

                    // Quantidade e valor unitário do item:
                    if($scope.venda.fin_nfe_finalidade == 2) {

                        $scope.newItem.ite_vlr_tot_bruto = (parseFloat($scope.newItem.ite_pro_qtd) > 0) ? parseFloat($scope.newItem.ite_pro_qtd) * $scope.newItem.ite_vlr_uni_bruto : $scope.newItem.ite_vlr_uni_bruto;

                    } else {

                        $scope.validarPrecoMaiorZero();

                        $scope.newItem.ite_pro_qtd = $scope.newItem.ite_pro_qtd ? $scope.newItem.ite_pro_qtd : 1;
                        $scope.newItem.ite_vlr_tot_bruto = parseFloat($scope.newItem.ite_pro_qtd) * $scope.newItem.ite_vlr_uni_bruto;

                        if (!$scope.venda.valorMaiorZeroValido) {

                            return false;
                        }

                        $scope.validarMvaZero();

                        if (!$scope.venda.mvaValido) {
                            return false;
                        }
                    }

                    //se produto for do tipo veiculo
                    if ($scope.produto.pro_tip_especifico == 1 || $scope.produto.pro_tip_especifico == 2) {

                        //console.log('eh veiculo');
                        $scope.getJanelaTipEspecifico();
                    }

                    //console.log('bruttu: ',$scope.newItem.ite_vlr_tot_bruto);
                    //$scope.newItem.ite_vlr_tot_bruto = $scope.newItem.ite_vlr_tot_bruto.toFixed(2);

                    //$scope.newItem.ite_vlr_tot_bruto = GeralFactory.roundNumber($scope.newItem.ite_vlr_tot_bruto,2);
                }

                $scope.setRegrasInicialCfop(function () {

                    //console.log('entra setRegrasInicialCfop', $scope.newItem);

                    $scope.newItem.ite_valor_cs = $scope.newItem.ite_cso;

                    // Valor líquido do produto:
                    $scope.newItem.ite_vlr_tot_liquido = $scope.newItem.ite_vlr_tot_bruto;

                    // Setar valores padroes para o tributo do item, sem precisar de abrir a modal
                    $scope.newItem.itens_tributo = [];

                    //se for natureza serviço seta apenas o ISS
                    if ($scope.venda.codNatureza == 31) {

                        $scope.setVlrPadroesTributoItemISS();
                        if($scope.newTributoIss.tri_eh_retido) {

                            $scope.newItem.ite_vlr_tot_impostos_retidos = $scope.newTributoIss.tri_imp_vlr_liquido;
                            $scope.newItem.ite_vlr_tot_impostos_retidos_format = GeralFactory.currencyDecimal($scope.newItem.ite_vlr_tot_impostos_retidos);
                        }


                        //console.log('new iss:',$scope.newTributoIss);
                        $scope.newItem.itens_tributo.push($scope.newTributoIss);

                        $scope.complementarAddItem();
                        //se for qualquer outra natureza seta os outros impostos
                    } else {

                        $scope.setVlrPadroesTributoItemICMS(function () {

                            //console.log('$scope.newTributoIcms77',$scope.newTributoIcms);

                            //CASO SEJA NOTA DE COMPLEMENTO, NÃO ADICIONA O ICMS PRÓPRIO POR DEFAULT!!!
                            // if(!$scope.newItem.pro_eh_complemento_imposto) {
                            $scope.newItem.itens_tributo.push($scope.newTributoIcms);
                            // }

                            if ($scope.venda.tipCs == 2 || $scope.venda.fin_cfo_cfop >= 7000) {

                                $scope.setVlrPadroesTributoItemPIS();
                                //console.log('$scope.newTributoPis',$scope.newTributoPis);
                                $scope.newItem.itens_tributo.push($scope.newTributoPis);

                                $scope.setVlrPadroesTributoItemCOFINS();
                                //console.log('$scope.newTributoCofins',$scope.newTributoCofins);
                                $scope.newItem.itens_tributo.push($scope.newTributoCofins);
                            }

                            //lança IPI na nota de exportação
                            if($scope.venda.fin_cfo_cfop >= 7000) {

                                $scope.setVlrPadroesTributoItemIPI();
                                $scope.newItem.itens_tributo.push($scope.newTributoIpi);
                            }

                            //console.log('vnda.itens: ',$scope.venda.itens);
                            //console.log('newiten11: ', $scope.newItem);
                            //$scope.venda.itens.push(angular.copy($scope.newItem));

                            $scope.complementarAddItem();
                        });
                    }
                    //console.log('liberado para adicionar novos');
                });

                if ($scope.venda.fin_mod_frete == undefined) {
                    $scope.venda.fin_mod_frete = 9;
                }

                $scope.flgAlterouValorNota = true;
            };

            /**
             * Validar se preço é maior que zero
             */
            $scope.validarPrecoMaiorZero = function () {

                if ($scope.newItem.ite_vlr_uni_bruto <= 0) {

                    GeralFactory.notify('danger', 'Atenção!', 'O preço do produto deve ser maior que zero!');
                    $('#new_vlr_bruto').select();
                    $scope.venda.valorMaiorZeroValido = false;
                    $scope.liberarAddItem = true;
                } else if ($scope.newItem.ite_pro_qtd <= 0) {

                    GeralFactory.notify('danger', 'Atenção!', 'A quantidade do produto deve ser maior que zero!');
                    $('#new_vlr_bruto').select();
                    $scope.venda.valorMaiorZeroValido = false;
                    $scope.liberarAddItem = true;
                } else {

                    $scope.venda.valorMaiorZeroValido = true;
                }
            };

            /**
             *se produto for ST (CST 10 ou 70 ou CSO 201 ou 202) ticket 52560 - alertar usuario de que mva nao pode ser 0
             */
            $scope.validarMvaZero = function () {

                //console.log('pro:', $scope.produto);
                if ($scope.produto.pro_cst == 10 || $scope.produto.pro_cst == 70 || $scope.produto.pro_cso == 201 || $scope.produto.pro_cso == 202) {

                    //console.log('eh prod st');
                    //console.log('auxcon:', $scope.cliente.auxContribuinte);
                    //console.log('ncm_perc_mva_padrao_contri:', $scope.produto.ncm.ncm_perc_mva_padrao_contri);

                    if ($scope.produto.ncm.ncm_perc_mva_padrao_contri == 0 || $scope.produto.ncm.ncm_perc_mva_padrao_contri == null) {

                        GeralFactory.notify('danger', 'Atenção!', 'O MVA deste produto não pode ser zero.');
                        $('#new_vlr_bruto').select();
                        $scope.venda.mvaValido = false;
                        $scope.liberarAddItem = true;
                    } else {
                        $scope.venda.mvaValido = true;

                    }

                } else {
                    $scope.venda.mvaValido = true;
                }
            };

            $scope.getJanelaComoProceder = function () {

                var scope = $rootScope.$new();
                scope.params = {};

                scope.params.str_titular = $scope.venda.labelTitular;
                scope.params.fin_nfe_motivo = $scope.venda.fin_nfe_motivo;
                scope.params.temDiferencaDup = $scope.venda.temDiferencaDup;
                scope.params.produto = $scope.produto;

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'venda/views/janela-info.html',
                    controller: 'VendaInfoCtrl',
                    size: 'lg',
                    windowClass: 'center-modal no-top-modal',
                    scope: scope,
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {

                    // var ind = $scope.venda.itens.length - 1;
                    //
                    // if (msg === 'reload') {
                    //     //console.log('reloaddd');
                    //
                    //     $scope.venda.itens[ind].ite_seq_tip_especifico = modalInstance.codTipProduto;
                    //
                    //     //console.log('ab:',$scope.venda.itens);
                    //
                    // } else {
                    //     $scope.venda.itens.pop();
                    //     //console.log('fechaaa');
                    // }
                });
            };

            /**
             * Abre a modal principal dos dados do cliente que tem todas as abas da tela de cliente.
             */
            $scope.getJanelaTipEspecifico = function () {

                var scope = $rootScope.$new();
                scope.params = {};

                scope.params.str_titular = $scope.venda.labelTitular;
                scope.params.produto = $scope.produto;

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'venda/views/janela-tip-especifico.html',
                    controller: 'VendaTipEspecificoCtrl',
                    size: 'lg',
                    windowClass: 'center-modal no-top-modal',
                    scope: scope,
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {

                    var ind = $scope.venda.itens.length - 1;

                    if (msg === 'reload') {
                        //console.log('reloaddd');

                        $scope.venda.itens[ind].ite_seq_tip_especifico = modalInstance.codTipProduto;

                        //console.log('ab:',$scope.venda.itens);

                    } else {
                        $scope.venda.itens.pop();
                        //console.log('fechaaa');
                    }
                });
            };

            /**
             * Complementa a açao de adicionar um item na grade
             */
            $scope.complementarAddItem = function () {

                //console.log('newiten33: ', $scope.newItem);

                $scope.venda.itens.push($scope.newItem);
                $scope.newItem = {};
                $scope.newItem.produto = {};
                $scope.venda.parcelas = []; // Caso adicione algum item novamente é zerado as parcelas.
                $scope.arrParcelas = [];

                //console.log('newiten22: ', $scope.venda.itens);
                // $scope.reset();
                // $scope.zerarParcelas();
                $scope.getTotalItens();

                $scope.flagInputQdte = false;
                $scope.flagAddItem = true;
                $scope.liberarAddItem = true;

                $scope.inputs = {
                    ite_vlr_uni_bruto : true
                };

                angular.element('#autocomplete-itens').focus();
            };


            /**
             * Ao alterar o cfop padrao
             */
            $scope.mudarCfop = function () {

                //console.log('mudarCfopmudarCfopmudarCfop');
                if ($scope.venda.itens.length > 0) {

                    var strB = [
                        {label: 'Ok', primary: true, value: '1'}
                    ];

                    prompt({
                        title: 'Informação',
                        message: 'As regras baseadas neste CFOP não serão aplicadas nos itens já lançados.',
                        buttons: strB
                    }).then(function (result) {

                    });
                }

            };


            /**
             * Regras iniciais de cfop a serem setados no item
             */
            $scope.setRegrasInicialCfop = function (func) {

                $scope.newItem.ite_cfo_cfop = $scope.venda.fin_cfo_cfop;

                ParamsService.cfop.get({id: $scope.venda.fin_cfo_cfop}, function (resposta) {
                    var ret = resposta.records;

                    //console.log('newitem: ',$scope.newItem);
                    //console.log('pegando o get cfop: ',$scope.newItem.produto.pro_tip_producao);
                    if ($scope.newItem.produto.pro_tip_producao == 'P') {

                        //console.log('tem prod propria');
                        if (ret.cfo_cfop_producao_propria != 0) {

                            //console.log('cfop de prod propria entao vai setar o item');
                            $scope.newItem.ite_cfo_cfop = ret.cfo_cfop_producao_propria;
                        }

                        if (ret.cfo_cfop_producao_propria_st != 0 && ($scope.newItem.produto.pro_cst == '10' || $scope.newItem.produto.pro_cst == '30' || $scope.newItem.produto.pro_cst == '60' || $scope.newItem.produto.pro_cst == '70' ||
                            $scope.newItem.produto.pro_cso == '201' || $scope.newItem.produto.pro_cso == '202' || $scope.newItem.produto.pro_cso == '203' || $scope.newItem.produto.pro_cso == '500')) {

                            //console.log('cfo_cfop_producao_propria_st vai setar o item com ',ret.cfo_cfop_producao_propria_st);
                            $scope.newItem.ite_cfo_cfop = ret.cfo_cfop_producao_propria_st;
                        }
                    }

                    if ($scope.newItem.produto.pro_tip_producao == 'T' && ret.cfo_cfop_st_com_icms != 0 && ($scope.newItem.produto.pro_cst == '10' || $scope.newItem.produto.pro_cst == '70' || $scope.newItem.produto.pro_cso == '201' || $scope.newItem.produto.pro_cso == '202')) {
                        //console.log('cfo com icms vai setar item com: ',ret.cfo_cfop_st_com_icms);
                        $scope.newItem.ite_cfo_cfop = ret.cfo_cfop_st_com_icms;
                    }

                    if ($scope.newItem.produto.pro_tip_producao == 'T' && ret.cfo_cfop_st_sem_icms != 0 && ($scope.newItem.produto.pro_cst == '30' || $scope.newItem.produto.pro_cst == '60' || $scope.newItem.produto.pro_cso == '203' || $scope.newItem.produto.pro_cso == '500')) {

                        //console.log('cfo sem icms vai setar item com: ',ret.cfo_cfop_st_sem_icms);
                        $scope.newItem.ite_cfo_cfop = ret.cfo_cfop_st_sem_icms;
                    }

                    $scope.newItem.eh_consumo = ret.cfo_eh_consumo;

                    func.call();

                });
            };

            /**
             * Essa função deve ser chamada quando um novo item for adicionado na grade ou quando um novo tributo de um
             * item for adicionado ao item
             */
            $scope.setVlrPadroesTributoItemICMS = function (func) {

                $scope.newTributoIcms = {
                    'tri_ite_seq': 0,
                    'tri_imp_cod_imp': 1,
                    'tri_cso': $scope.newItem.ite_cso, //TODO alterar pra pegar dinamico
                    'tri_cst': (($scope.produto['pro_cst'] == '' || $scope.produto['pro_cst'] == '0') ? '00' : $scope.produto['pro_cst']),
                    'tri_bc_vlr_bruto': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_bc_perc_mva': 0,
                    'tri_bc_perc_reducao': 0,
                    'tri_naotrib_tip': '0',
                    'tri_imp_vlr_bruto': 0,
                    // 'tri_aliq_perc' : $scope.tri_aliq_percTmp,
                    'tri_imp_vlr_diferenca': 0,
                    'tri_naotrib_vlr': 0,
                    //'tri_bc_vlr_liquido' : $scope.newItem.ite_vlr_tot_liquido,
                    'tri_contabil_vlr': $scope.newItem.ite_vlr_tot_liquido,
                    'ite_vlr_tot_liquido': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_eh_retido': 0
                };

                if($scope.venda.fin_cfo_cfop >= 7000) {

                    $scope.newTributoIcms.tri_cst = '41';
                }

                //console.log('newitem antes get:',$scope.newItem);

                //se for debito/credito
                if ($scope.venda.tipCs == 2) {

                    //console.log('debito e creditooo');

                    if ($scope.newTributoIcms.tri_cst != '40' && $scope.newTributoIcms.tri_cst != '41' && $scope.newTributoIcms.tri_cst != '50' && $scope.newTributoIcms.tri_cst != '51' && $scope.newTributoIcms.tri_cst != '60') {

                        ParamsService.tabAliq.get({}, function (retorno) {
                            //console.log('newitemu:',$scope.newItem);
                            var arrAliq = retorno.records;

                            //console.log('arrAliq: ',arrAliq);

                            $scope.newTributoIcms.tri_aliq_perc = arrAliq[$scope.empresa['emp_uf']];
                            //console.log('yy:',$scope.newItem.ite_vlr_tot_liquido);

                            $scope.newTributoIcms.tri_imp_vlr_bruto = $scope.newTributoIcms.ite_vlr_tot_liquido * $scope.newTributoIcms.tri_aliq_perc / 100;
                            $scope.newTributoIcms.tri_imp_vlr_liquido = $scope.newTributoIcms.tri_imp_vlr_bruto;

                            func.call();

                        });
                    } else {
                        $scope.newTributoIcms.tri_imp_vlr_liquido = 0;
                        $scope.newTributoIcms.tri_aliq_perc = 0;
                        $scope.newTributoIcms.tri_bc_vlr_bruto = 0;
                        $scope.newTributoIcms.tri_bc_vlr_liquido = 0;
                        func.call();
                    }
                } else {
                    //se for SN vai zerar o valor do bc bruto e liquido do icms proprio qdo nao for ST

                    if ($scope.newTributoIcms.tri_cso == '201' || $scope.newTributoIcms.tri_cso == '202' || $scope.newTributoIcms.tri_cso == '203') {

                        $scope.newTributoIcms.ite_vlr_tot_liquido = $scope.newItem.ite_vlr_tot_liquido;

                        ImpostoFactory.setRegraSt($scope.newTributoIcms, $scope.venda, $scope.cliente, $scope.empresa, $scope.produto, function (retorno) {

                            // console.log('rettt33333333333333333: ',retorno);
                            $scope.newTributoIcms = retorno;

                            //se for icms ST soma o imposto retido no vlr liquido do item e depois da nota
                            if ($scope.newTributoIcms.tri_imp_cod_imp == 2) {
                                //console.log('eh stttttt: ' , $scope.newTributoIcms.tri_imp_vlr_liquido);

                                $scope.newItem.ite_vlr_tot_impostos_retidos = $scope.newTributoIcms.tri_imp_vlr_liquido;
                                $scope.newItem.ite_vlr_tot_impostos_retidos = Math.round($scope.newItem.ite_vlr_tot_impostos_retidos * 100) / 100;

                                //console.log('ret111:',$scope.newItem.ite_vlr_tot_impostos_retidos);
                                $scope.newItem.ite_vlr_tot_impostos_retidos_format = GeralFactory.currencyDecimal($scope.newTributoIcms.tri_imp_vlr_liquido);

                                $scope.newItem.ite_vlr_tot_liquido = $scope.newItem.ite_vlr_tot_bruto + $scope.newItem.ite_vlr_tot_impostos_retidos;
                                //console.log('ni: ',$scope.newItem);
                            }

                            func.call();
                        });
                    } else {

                        //console.log('naooo eh ST elseeee');

                        $scope.newTributoIcms.tri_aliq_perc = 0;
                        $scope.newTributoIcms.tri_bc_vlr_bruto = 0;
                        $scope.newTributoIcms.tri_bc_vlr_liquido = 0;

                        func.call();

                    }
                }

            };

            /**
             * Array padrao PIS para inserir
             * TODO terminar o metodo
             */
            $scope.setVlrPadroesTributoItemPIS = function () {

                $scope.newTributoPis = {
                    'tri_ite_seq': 0,
                    'tri_imp_cod_imp': 12,
                    'tri_cso': $scope.produto['pro_cso'], //TODO alterar pra pegar dinamico
                    'tri_cst': '99', //$scope.produto['pro_cst'],
                    'tri_bc_vlr_bruto': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_bc_perc_mva': 0,
                    'tri_bc_perc_reducao': 0,
                    'tri_naotrib_tip': '0',
                    'tri_imp_vlr_bruto': 0,
                    'tri_aliq_perc': 0,
                    'tri_imp_vlr_diferenca': 0,
                    'tri_naotrib_vlr': 0,
                    'tri_bc_vlr_liquido': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_contabil_vlr': $scope.newItem.ite_vlr_tot_liquido,
                    'ite_vlr_tot_liquido': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_eh_retido': 0
                };

                if ($scope.venda.tipCs == 2) {
                    $scope.newTributoPis.tri_cst = '49';
                }

                if($scope.venda.fin_cfo_cfop >= 7000) {

                    $scope.newTributoPis.tri_cst = '08';
                }

                //console.log('newitem antes get:',$scope.newItem);

            };

            $scope.setVlrPadroesTributoItemIPI = function () {

                $scope.newTributoIpi = {
                    'tri_ite_seq': 0,
                    'tri_imp_cod_imp': 11,
                    'tri_cso': '', //TODO alterar pra pegar dinamico
                    'tri_cst': '53', //$scope.produto['pro_cst'],
                    'tri_bc_vlr_bruto': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_bc_perc_mva': 0,
                    'tri_bc_perc_reducao': 0,
                    'tri_naotrib_tip': '0',
                    'tri_imp_vlr_bruto': 0,
                    'tri_aliq_perc': 0,
                    'tri_imp_vlr_diferenca': 0,
                    'tri_naotrib_vlr': 0,
                    'tri_bc_vlr_liquido': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_contabil_vlr': $scope.newItem.ite_vlr_tot_liquido,
                    'ite_vlr_tot_liquido': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_eh_retido': 0
                };

                if($scope.venda.fin_cfo_cfop >= 7000) {

                    $scope.newTributoIpi.tri_cst = '53';
                }
            };

            /**
             * Array padrao COFINS para inserir
             * TODO terminar o metodo
             */
            $scope.setVlrPadroesTributoItemCOFINS = function () {

                $scope.newTributoCofins = {
                    'tri_ite_seq': 0,
                    'tri_imp_cod_imp': 13,
                    'tri_cso': $scope.produto['pro_cso'], //TODO alterar pra pegar dinamico
                    'tri_cst': '99',//$scope.produto['pro_cst'],
                    'tri_bc_vlr_bruto': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_bc_perc_mva': 0,
                    'tri_bc_perc_reducao': 0,
                    'tri_naotrib_tip': '0',
                    'tri_imp_vlr_bruto': 0,
                    'tri_aliq_perc': 0,
                    'tri_imp_vlr_diferenca': 0,
                    'tri_naotrib_vlr': 0,
                    'tri_bc_vlr_liquido': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_contabil_vlr': $scope.newItem.ite_vlr_tot_liquido,
                    'ite_vlr_tot_liquido': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_eh_retido': 0
                };

                if ($scope.venda.tipCs == 2) {
                    $scope.newTributoCofins.tri_cst = '49';
                }

                if($scope.venda.fin_cfo_cfop >= 7000) {

                    $scope.newTributoCofins.tri_cst = '08';
                }

            };
            /**
             * Array padrao IR para inserir
             * TODO terminar o metodo
             */
            $scope.setVlrPadroesTributoItemIR = function () {

                $scope.newTributo = {
                    'tri_ite_seq': 0,
                    'tri_imp_cod_imp': 14,
                    'tri_cso': $scope.produto['pro_cso'], //TODO alterar pra pegar dinamico
                    'tri_cst': $scope.produto['pro_cst'],
                    'tri_bc_vlr_bruto': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_bc_perc_mva': 0,
                    'tri_bc_perc_reducao': 0,
                    'tri_naotrib_tip': '0',
                    'tri_imp_vlr_bruto': 0,
                    'tri_aliq_perc': 0,//$scope.tri_aliq_percTmp,
                    'tri_imp_vlr_diferenca': 0,
                    'tri_naotrib_vlr': 0,
                    'tri_bc_vlr_liquido': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_contabil_vlr': $scope.newItem.ite_vlr_tot_liquido,
                    'ite_vlr_tot_liquido': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_eh_retido': 0
                };

                //console.log('newitem antes get:',$scope.newItem);

            };

            /**
             * Array padrao IR para inserir
             * TODO terminar o metodo
             */
            $scope.setVlrPadroesTributoItemCSLL = function () {

                $scope.newTributo = {
                    'tri_ite_seq': 0,
                    'tri_imp_cod_imp': 14,
                    'tri_cso': $scope.produto['pro_cso'], //TODO alterar pra pegar dinamico
                    'tri_cst': $scope.produto['pro_cst'],
                    'tri_bc_vlr_bruto': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_bc_perc_mva': 0,
                    'tri_bc_perc_reducao': 0,
                    'tri_naotrib_tip': '0',
                    'tri_imp_vlr_bruto': 0,
                    'tri_aliq_perc': 0,
                    'tri_imp_vlr_diferenca': 0,
                    'tri_naotrib_vlr': 0,
                    'tri_bc_vlr_liquido': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_contabil_vlr': $scope.newItem.ite_vlr_tot_liquido,
                    'ite_vlr_tot_liquido': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_eh_retido': 0
                };

                //console.log('newitem antes get:',$scope.newItem);

                ParamsService.tabAliq.get({}, function (retorno) {
                    //console.log('newitemu:',$scope.newItem);
                    var arrAliq = retorno.records;

                    //console.log('arrAliq: ',arrAliq);
                    $scope.newTributo.tri_aliq_perc = arrAliq[$scope.empresa['emp_uf']][$scope.cliente.endereco.end_endereco_uf];

                    //console.log('yy:',$scope.newItem.ite_vlr_tot_liquido);

                    $scope.newTributo.tri_imp_vlr_bruto = $scope.newTributo.ite_vlr_tot_liquido * $scope.newTributo.tri_aliq_perc / 100;
                    $scope.newTributo.tri_imp_vlr_liquido = $scope.newTributo.tri_imp_vlr_bruto;

                });

            };

            /**
             * Array padrao ISS para inserir
             * TODO terminar o metodo
             */
            $scope.setVlrPadroesTributoItemISS = function () {

                //console.log('cli4:',$scope.cliente);

                var aliq = 2;
                var impostoArredondado = parseFloat($scope.newItem.ite_vlr_tot_liquido) * aliq/100;
                var tri_imp_vlr_liquido = Math.round(impostoArredondado * 100) / 100;

                var cadTipContrIss;

                if($scope.cliente.cad_tip_contribuinte_iss) {
                    //console.log('iff876');
                    cadTipContrIss = 1;
                    $scope.newItem.ite_vlr_tot_liquido = $scope.newItem.ite_vlr_tot_liquido - tri_imp_vlr_liquido;

                } else {
                    //console.log('else876');
                    cadTipContrIss = 0;
                }

                //console.log('tri_imp_vlr_liquido: ',tri_imp_vlr_liquido);

                $scope.newTributoIss = {
                    'tri_ite_seq': 0,
                    'tri_imp_cod_imp': 10,
                    //'tri_cso' : $scope.produto['pro_cso'], //TODO alterar pra pegar dinamico
                    //'tri_cst' : '99', //$scope.produto['pro_cst'],
                    'tri_bc_vlr_bruto': $scope.newItem.ite_vlr_tot_bruto,
                    'tri_bc_perc_mva': 0,
                    'tri_bc_perc_reducao': 0,
                    'tri_naotrib_tip': '0',
                    'tri_imp_vlr_bruto': 0,
                    'tri_aliq_perc': 2,
                    'tri_imp_vlr_diferenca': 0,
                    'tri_naotrib_vlr': 0,
                    'tri_bc_vlr_liquido': $scope.newItem.ite_vlr_tot_bruto,
                    'tri_contabil_vlr': $scope.newItem.ite_vlr_tot_liquido,
                    'ite_vlr_tot_liquido': $scope.newItem.ite_vlr_tot_liquido,
                    'tri_eh_retido': cadTipContrIss,
                    'tri_imp_vlr_liquido': tri_imp_vlr_liquido
                };

                $scope.newTributoIss.tri_aliq_perc = ($scope.venda.tipCs) ? 0 : 2;

                if($scope.empresa.emp_ident_emp == '29078') {

                    $scope.newTributoIss.tri_aliq_perc = 3;
                }
                //console.log('newitem antes get:',$scope.newItem);

            };

            /**
             * Remove um item da venda.
             */
            $scope.removerItem = function ($index) {

                $scope.venda.itens.splice($index, 1);
                $scope.getTotalItens();
            };

            /**
             * Ao selecionar o produto no início preenche o objeto newItem que são os dados
             * iniciais do item para posterior preenchimento da tabela.
             */
            $scope.onSelectProduto = function (obj) {

                //console.log('obj', obj);

                $scope.atingiuEstoqueMinimo = false;

                $scope.newItem = {};
                $scope.newItem.produto = {};

                $scope.setNewItemProduto(obj.pro_cod_pro);
            };

            $scope.addProduto = function (termo) {

                var strProduto = termo.trim();

                GeralFactory.confirmar('Tem certeza que deseja incluir o registro ' + strProduto + '?', function () {

                    var objProduto = {
                        'pro_descricao_longa': strProduto,
                        'pro_eh_inativo': 0,
                        'pro_tip_unidade': 1
                    };

                    objProduto.pro_eh_servico = ($scope.venda.codNatureza == 31) ? 1 : 0;

                    $timeout(function () {

                        ProdutoService.produtos.create(objProduto, function (resposta) {
                            if (!resposta.records.error) {

                                $scope.setNewItemProduto(resposta.records.pro_cod_pro);
                                angular.element('#new_qtde_id').focus().select();
                            }
                        });
                    });

                }, 'Confirmação', function () {

                    $scope.newItem = {};
                    $scope.newItem.produto = {};

                }, 'Não', 'Sim');
            };

            /**
             * Método responsável em recuperar todas as informações de um determinado
             * produto selecionado no componente TYPEAHEAD.
             */
            $scope.setNewItemProduto = function (pro_cod_pro) {

                if (pro_cod_pro) {

                    ProdutoService.produto.get({pro_cod_pro: pro_cod_pro}, function (data) {

                        $scope.newItem = {
                            produto: {}
                        };

                        var produto = data.records;
                        $scope.produto = produto;
                        $scope.produto.fotoProduto = ((produto.produto_imagem.length > 0) ? CONFIG.CACHE_IMG + produto.produto_imagem[0].mid_id : '../app/images/sem-imagem.jpg');

                        var preco = (produto[$scope.venda.attrPrecoProduto]) ? parseFloat(produto[$scope.venda.attrPrecoProduto]) : 0;

                        $scope.newItem.key = $scope.inc++;
                        $scope.newItem.produto.pro_unidade = $scope.produto.pro_unidade === undefined ? 1 : $scope.produto.pro_unidade;
                        $scope.newItem.produto.pro_tip_producao = $scope.produto.pro_tip_producao;
                        $scope.newItem.produto.pro_cst = $scope.produto.pro_cst;
                        $scope.newItem.produto.pro_cso = $scope.produto.pro_cso;
                        $scope.newItem.produto_saldo = $scope.produto.produto_saldo;
                        $scope.newItem.produto_grupo = $scope.produto.produto_grupo;
                        $scope.newItem.id = produto.pro_cod_pro;
                        $scope.newItem.ite_pro_cod_pro = produto.pro_cod_pro;
                        $scope.newItem.ite_pro_descricao = produto.pro_descricao_longa;
                        $scope.newItem.ite_pro_inf_adicionais = produto.pro_inf_adicionais;
                        $scope.newItem.ite_vlr_uni_bruto = preco;
                        $scope.newItem.pro_foto = produto.pro_foto;
                        $scope.newItem.gru_descricao = produto.produto_grupo.gru_descricao !== undefined ? produto.produto_grupo.gru_descricao : '';
                        $scope.newItem.ite_pro_qtd = 1;
                        $scope.newItem.ite_vlr_tot_desconto = 0;
                        $scope.newItem.ite_vlr_tot_seguro = 0;
                        $scope.newItem.ite_vlr_tot_despesas = 0;
                        $scope.newItem.ite_vlr_tot_naotrib = 0;
                        $scope.newItem.ite_vlr_tot_impostos_retidos = 0;
                        $scope.newItem.ite_vlr_tot_impostos_retidos_format = 0;
                        $scope.newItem.ite_vlr_tot_contabil = 0;
                        $scope.newItem.ite_vlr_tot_desconto = 0;
                        $scope.newItem.ite_vlr_tot_frete = 0;
                        $scope.newItem.pro_estoque = parseFloat($scope.produto.produto_saldo.sal_atu_qtd_saldo);
                        $scope.newItem.pro_estoque_minimo = $scope.produto.pro_estoque_minimo;
                        $scope.newItem.pro_str_etoque = GeralFactory.getStringEstoque($scope.produto.produto_saldo.sal_atu_qtd_saldo);
                        $scope.newItem.ite_cs_origem = produto.pro_cs_origem;
                        $scope.newItem.pro_eh_complemento_imposto = (produto.pro_ncm.trim() == '99999999');

                        $scope.setRegrasImp(produto);
                        $scope.liberarAddItem = true;

                        $scope.comparaEstoqueMinimo();
                    });
                }
            };

            /**
             * Algumas regras ao descer o produto para a grade
             */
            $scope.setRegrasImp = function (produto) {

                //console.log('prod: ',produto);
                //console.log('eh consumo: ' , $scope.newItem.eh_consumo);
                if ($scope.newItem.eh_consumo) {
                    //console.log('eh consumo vai setar auxContribuinte = 9');
                    $scope.cliente.auxContribuinte = 9;
                }

                if (produto.pro_cso > 0) {
                    $scope.newItem.ite_cso = produto.pro_cso;
                } else {
                    $scope.newItem.ite_cso = $scope.empresa.emp_cod_csosn;
                }

                if ($scope.empresa.emp_reg_trib == 4 || $scope.empresa.emp_reg_trib == 5) {

                } else {
                    if (produto.pro_cso == 101 || produto.pro_cso == 102) {

                        //console.log('emp: ', $scope.empresa);
                        //console.log('emp cod cso: ' , $scope.empresa.emp_cod_csosn);
                        //console.log('aux contribuinte: ' , $scope.cliente.auxContribuinte);

                        if ($scope.empresa.emp_cod_csosn == 101 && produto.pro_cso == 101 && ($scope.cliente.auxContribuinte == 1 || $scope.cliente.auxContribuinte == 2)) {
                            $scope.newItem.ite_cso = 101;
                        } else {
                            //console.log('vai por o 102');
                            $scope.newItem.ite_cso = 102
                        }
                    }

                    if (produto.pro_cso == 201) {

                        if ($scope.empresa.emp_cod_csosn == 101 && ($scope.cliente.auxContribuinte == 1 || $scope.cliente.auxContribuinte == 2)) {
                            $scope.newItem.ite_cso = 201;
                        }
                        else if ($scope.empresa.emp_cod_csosn == 102 && ($scope.cliente.auxContribuinte == 1 || $scope.cliente.auxContribuinte == 2)) {
                            $scope.newItem.ite_cso = 202;
                        }
                        else {
                            $scope.newItem.ite_cso = 102;
                        }
                    }

                    //console.log('produto.pro_cso: ', produto.pro_cso);
                    if (produto.pro_cso == 202) {

                        //console.log('$scope.empresa.emp_cod_csosn: ', $scope.empresa.emp_cod_csosn);
                        //console.log('$scope.cliente.auxContribuinte: ', $scope.cliente.auxContribuinte);

                        if ($scope.cliente.auxContribuinte == 1 || $scope.cliente.auxContribuinte == 2) {
                            $scope.newItem.ite_cso = 202;
                        } else {
                            $scope.newItem.ite_cso = 102;
                        }
                    }

                    //se for cod cfop maior que isso é exportaçao
                    if ($scope.venda.fin_cfo_cfop >= 7000) {
                        $scope.newItem.ite_cso = 300;
                    }

                    //se for devoluçao de compra (vini pediu pra tirar depois colocar relacionado a ticket  56938
                    //if($scope.venda.codNatureza == 4) {
                    //  $scope.newItem.ite_cso = 900;
                    //}
                }

                //console.log('descendo na grade cso: ',$scope.newItem.ite_cso);
            };

            /**
             * Ao atualizar algum campo na tabela de itens várias variáveis devem ser atualizadas.
             * O $scope.venda.selected contém o registro que acabei de clicar. $scope.keyEdit é a chave da linha.
             */
            $scope.atualizarItem = function ($event) {

                /**
                 * Se valor antigo for diferente do valor novo chama novamente no banco os dados
                 * do produto para preencher o valor, unidade, dentre outras informações.
                 */
                if ($scope.venda.itens[$scope.keyEdit].id != $scope.venda.selected.id) {

                    ProdutoService.produto.get({pro_cod_pro: $scope.venda.selected.id}, function (data) {

                        var produto = data.records;
                        $scope.venda.itens[$scope.keyEdit].ite_vlr_uni_bruto = produto.pro_preco5;
                        $scope.venda.selected.ite_vlr_uni_bruto = produto.pro_preco5;

                        $scope.venda.itens[$scope.keyEdit].ite_vlr_tot_liquido = parseFloat((produto.pro_preco5 * $scope.venda.selected.ite_pro_qtd) - parseFloat($scope.venda.selected.ite_vlr_tot_desconto));
                        $scope.venda.selected.ite_vlr_tot_liquido = parseFloat((produto.pro_preco5 * $scope.venda.selected.ite_pro_qtd) - parseFloat($scope.venda.selected.ite_vlr_tot_desconto));

                        $scope.venda.selected.pro_unidade = produto.pro_unidade;
                        $scope.venda.itens[$scope.keyEdit].pro_unidade = produto.pro_unidade;
                    });

                } else {

                    $scope.venda.itens[$scope.keyEdit].ite_vlr_uni_bruto = $scope.venda.selected.ite_vlr_uni_bruto;

                    $scope.venda.itens[$scope.keyEdit].ite_vlr_tot_liquido = parseFloat(($scope.venda.selected.ite_vlr_uni_bruto * $scope.venda.selected.ite_pro_qtd) - parseFloat($scope.venda.selected.ite_vlr_tot_desconto));

                    $scope.venda.selected.ite_vlr_tot_liquido = ($scope.venda.selected.ite_vlr_uni_bruto * $scope.venda.selected.ite_pro_qtd) - $scope.venda.selected.ite_vlr_tot_desconto;

                }

                $scope.venda.itens[$scope.keyEdit].id = $scope.venda.selected.id;
                $scope.venda.itens[$scope.keyEdit].ite_pro_qtd = $scope.venda.selected.ite_pro_qtd;
                $scope.venda.itens[$scope.keyEdit].ite_vlr_tot_desconto = $scope.venda.selected.ite_vlr_tot_desconto;

                if (!$scope.venda.fin_nro_lan) {

                    $scope.venda.itens[$scope.keyEdit].ite_pro_descricao = $scope.getProdutoDesc($scope.venda.selected.id, $scope.keyEdit);
                }

                $scope.getTotalItens();
            };

            /**
             *
             */
            $scope.getProdutoDesc = function (pro_cod_pro, k) {

                ProdutoService.produto.get({pro_cod_pro: pro_cod_pro}, function (data) {

                    if (data.records) {

                        $scope.venda.itens[k].ite_pro_descricao = data.records.pro_descricao_longa;
                        $scope.venda.itens[k].ite_pro_inf_adicionais = data.records.pro_inf_adicionais;
                    }
                });
            };

            /**
             * Ao escolher algum cliente ou fornecedor.
             */
            $scope.onSelectCliente = function (obj) {

                $scope.getCliente(obj.cad_cod_cad);
                $scope.venda.clienteSelect = obj.cad_nome_razao;
            };

            /**
             * Adiciona um cliente pelo plugin de autocomplete
             * @param termo
             */
            $scope.addCliente = function (termo) {

                var obj = {
                    'cad_pf_pj': 1,
                    'cad_eh_inativo': 0,
                    'cad_nome_razao': termo.trim(),
                    'cad_tip_cli_for': $scope.venda.cad_tip_cli_for
                };

                ClienteService.clientes.create(obj, function (resposta) {

                    $scope.cliente.cad_cod_cad = resposta.records.cad_cod_cad;
                    $scope.cliente.codEnderecoFaturamento = 1;
                    $scope.getCliente(resposta.records.cad_cod_cad);
                });
            };

            /**
             * verifica se vai colocar CFOP padrao de outro estado
             */
            $scope.getCfopEstado = function () {

                //console.log('cli:',$scope.cliente);
                if ($scope.cliente.endereco.end_endereco_cod_uf != undefined) {

                    //console.log('enndd:',$scope.cliente.endereco.end_endereco_cod_uf +'-'+$scope.empresa.emp_cod_uf);
                    if ($scope.cliente.endereco.end_endereco_cod_uf != $scope.empresa.emp_cod_uf) {
                        $scope.venda.fin_cfo_cfop = $scope.venda.cfopOriginal = $scope.paramPadrao.par_i02;
                    }

                    if($scope.cliente.endereco.end_eh_exterior == '1') {

                        $scope.venda.fin_cfo_cfop = $scope.venda.cfopOriginal = $scope.paramPadrao.par_i03;
                    }
                }
            };

            /**
             * Obtém dados de um determinado cliente.
             */
            $scope.getCliente = function (cad_cod_cad) {

                var arrEnd, strEndEnt;
                var arrEndEnt = [];

                $scope.cliente.enderecoEntrega = undefined;

                ClienteService.cliente.get({cad_cod_cad: cad_cod_cad}, function (data) {

                    var cliente = data.records;
                    $scope.cliente = cliente;

                    //console.log('$scope.cliente: ', $scope.cliente.endereco);

                    $scope.venda.fin_cad_nome_razao = cliente.cad_nome_razao;
                    $scope.listaContato = data.records.listaContato;
                    $scope.listaEndereco = data.records.listaEndereco;
                    $scope.cliente.contato = $scope.listaContato[0] = data.records.listaContato[0];
                    //$scope.cliente.auxContribuinte = $scope.cliente.cad_tip_contribuinte;

                    //console.log('$scope.cliente.cad_tip_contribuinte: ',$scope.cliente.cad_tip_contribuinte);
                    //console.log('$scope.venda.fin_tip_contribuinte: ',$scope.venda.fin_tip_contribuinte);


                    if (($scope.venda.fin_tip_contribuinte == undefined && $scope.cliente.cad_tip_contribuinte != 9) || ($scope.venda.fin_tip_contribuinte != undefined && $scope.venda.fin_tip_contribuinte != 9)) {

                        //console.log('7777777777777777');
                        $scope.tipContrib = 'Contribuinte';
                        $scope.cliente.auxContribuinte = 1;
                    } else {
                        //console.log('8888888888888888');
                        $scope.tipContrib = 'Consumidor';
                        $scope.cliente.auxContribuinte = 9;
                    }


                    arrEnd = data.records.endereco;

                    $scope.venda.enderecoFaturamento = $scope.formatarEnderecoString(arrEnd);
                    $scope.cliente.codEnderecoFaturamento = 1;

                    angular.forEach($scope.listaEndereco, function (i, j) {

                        strEndEnt = $scope.formatarEnderecoString(i);
                        arrEndEnt.push({
                            id: i['end_seq_end'],
                            nome: strEndEnt
                        });
                    });

                    // Recolhendo a imagem mais recente do cliente:
                    $scope.cliente.imagem_atual = null;
                    if ($scope.cliente.cliente_imagem.length) {

                        var qtdeImagens = $scope.cliente.cliente_imagem.length;
                        $scope.cliente.imagem_atual = $scope.cliente.cliente_imagem[qtdeImagens - 1];
                    }

                    $scope.arrEnderecoEntrega = arrEndEnt;
                    if (!$scope.venda.fin_nro_lan) {

                        $scope.cliente.enderecoEntrega = $scope.cliente.cad_end_cod_end_ent_padrao;
                        //console.log('Venda: $scope.cliente.cad_end_cod_end_ent_padrao');

                    } else {

                        $scope.cliente.enderecoEntrega = $scope.venda.fin_end_cod_end_ent;
                        //console.log('Cliente: $scope.venda.fin_end_cod_end_ent');
                    }

                    //console.log($scope.cliente.enderecoEntrega);

                    $scope.listarCfop();
                    if (!$scope.venda.fin_nro_lan) {
                        //console.log('ta criando entao getCfopEstado');
                        $scope.getCfopEstado();
                    }

                    $scope.venda.clienteSelect = $scope.cliente.cad_nome_razao;

                });
            };

            /**
             * Abre a modal principal dos dados do cliente que tem todas as abas da tela de cliente.
             */
            $scope.getJanelaCliente = function (cad_cod_cad) {

                var scope = $rootScope.$new();
                scope.params = {};

                if (cad_cod_cad) {

                    scope.params.str_titular = $scope.venda.labelTitular;
                    scope.params.cad_cod_cad = cad_cod_cad;

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'cliente/views/janela-cliente.html',
                        controller: 'ClienteModalCtrl',
                        size: 'lg',
                        windowClass: 'center-modal no-top-modal',
                        scope: scope,
                        resolve: {
                            getEnd: function () {
                            }
                        }
                    });

                    modalInstance.result.then(function (id) {
                    }, function (msg) {

                        //console.log('modalInstance', modalInstance);

                        if (modalInstance.hasAlteracao) {

                            $scope.getCliente($scope.cliente.cad_cod_cad);
                            ClienteService.clienteEnderecos.get({cad_cod_cad: $scope.cliente.cad_cod_cad}, function (data) {

                                $scope.enderecos = data.records;
                            });
                        }
                    });
                }
            };

            /**
             *
             */
            $scope.getJanelaRastreamento = function (rastreamento, nroPedido) {

                if (rastreamento && nroPedido) {

                    var scope = $rootScope.$new();
                    scope.params = {};
                    scope.params.operacao = $scope.venda.op;

                    if (rastreamento) {
                        scope.params.rastreamento = rastreamento;
                    }

                    if (nroPedido) {
                        scope.params.nroPedido = nroPedido;
                    }

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'venda/views/janela-rastreamento.html',
                        controller: 'VendaRastreamentoCtrl',
                        size: 'lg',
                        windowClass: 'center-modal no-top-modal',
                        scope: scope,
                        resolve: {
                            getEnd: function () {
                            }
                        }
                    });

                    modalInstance.result.then(function (id) {
                    }, function (msg) {

                        if (msg === 'reload') {
                        }
                    });

                } else {

                    GeralFactory.notify('warning', 'Atenção!', 'Nenhum código de rastreamento foi informado!');
                }
            };

            /**
             *
             */
            $scope.getJanelaClienteEnderecoForm = function (cad_cod_cad, end_seq_end) {

                var scope = $rootScope.$new();
                scope.params = {};

                if (cad_cod_cad && end_seq_end) {

                    scope.params.cad_cod_cad = cad_cod_cad;
                    scope.params.end_seq_end = end_seq_end;
                }

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'cliente/views/aba-cliente-endereco-form.html',
                    controller: 'ClienteModalEnderecoCtrl',
                    windowClass: 'center-modal',
                    scope: scope,
                    resolve: {
                        getEnd: function () {
                        }
                    }
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {

                    if (msg === 'reload') {

                        $scope.getCliente($scope.cliente.cad_cod_cad);

                        var arrEndFat = $scope.cliente.endereco;
                        $scope.venda.enderecoFaturamento = arrEndFat['end_endereco'] + ', ' + arrEndFat['end_endereco_nro'] + ' ' + arrEndFat['end_endereco_complemento'] + '. ' + arrEndFat['end_endereco_bairro'] + '. ' + arrEndFat['end_endereco_cidade'] + '/' + arrEndFat['end_endereco_uf'] + ' - ' + arrEndFat['end_cep'];
                    }
                });
            };

            /**
             *
             */
            $scope.getTemplateParcela = function (item) {

                if (item.key != undefined && item.key === $scope.venda.selectedParcela.key) {
                    return 'editParcela';
                }

                if ($scope.venda.selectedParcela.tit_fatura_seq != undefined && $scope.venda.selectedParcela.tit_fatura_seq === item.tit_fatura_seq) {
                    return 'editParcela';
                }

                return 'displayParcela';
            };

            /**
             * Ao clicar no registro da parcela edita o campo.
             */
            $scope.editParcela = function (item, k) {

                $scope.keyEdit = k;
                $scope.venda.selectedParcela = angular.copy(item);
                $scope.venda.selectedParcela.tit_dat_vct = item.tit_dat_vct;
            };

            /**
             *
             */
            $scope.resetParcela = function () {

                $scope.venda.selectedParcela = {};
            };

            /**
             *
             */
            $scope.calcularSomaData = function () {

                var data = GeralFactreory.retornarSomaDiaData($scope.newItemParcela.dias);
                $scope.newItemParcela.tit_dat_vct = data;
            };

            /**
             *
             */
            $scope.calcularSomaValor = function () {

                $scope.venda.somaTudo = $scope.venda.somaTotalLiquido;

                var valorRateado = Math.floor($scope.venda.somaTudo / $scope.venda.parcelas.length * 100) / 100;
                var valorDifferenca = $scope.venda.somaTudo - (valorRateado * $scope.venda.parcelas.length);

                var flag = 1;
                angular.forEach($scope.venda.parcelas, function (elem, key) {

                    // Se for o primeiro registro ele adiciona o valor da diferença de rateio.
                    if (flag) {
                        flag = 0;
                        $scope.venda.parcelas[key].tit_doc_vlr_liquido = valorRateado + valorDifferenca;
                    } else {
                        $scope.venda.parcelas[key].tit_doc_vlr_liquido = valorRateado;
                    }
                });
            };

            /**
             * Calcula a soma de todos valores contabil de todos tributos de todos itens
             */
            $scope.calcularDocVlrContabil = function () {

                var somaVlrContabil = 0;
                //console.log('it prod: ',$scope.venda.itens_produto);
                angular.forEach($scope.venda.itens_produto, function (reg, k) {


                    // //console.log('cont: ',parseFloat(reg.ite_vlr_tot_contabil));
                    // //console.log('somaVlrContabil: ',somaVlrContabil);
                    // somaVlrContabil = parseFloat(somaVlrContabil) + parseFloat(reg.ite_vlr_tot_contabil);
                    //console.log('item ' ,k,' tributo dele: ' , reg.itens_tributo);
                    angular.forEach(reg.itens_tributo, function (tri, i) {

                        somaVlrContabil = parseFloat(somaVlrContabil) + parseFloat(tri.tri_contabil_vlr);
                    });
                });

                //console.log('somaVlrContabil: ',somaVlrContabil);

                $scope.venda.fin_doc_vlr_contabil = somaVlrContabil;

            };

            /**
             * Remove um item das parcelas.
             */
            $scope.removerParcela = function ($index) {

                $scope.venda.parcelas.splice($index, 1);
                $scope.calcularSomaValor();
                $scope.ajustarAlturaWizard();
            };

            $scope.validarSalvarVenda = function () {

                var msg = '';
                if ($scope.venda.fin_nfe_chave != '' && $scope.venda.fin_nfe_chave != undefined && $scope.venda.codNatureza != 31) {
                    if ($scope.venda.fin_nfe_chave.length != 44) {

                        msg = 'Chave no formato incorreto';
                    }
                }

                return msg;
            };

            /**
             * Salva uma venda.
             */
            $scope.salvarVenda = function (func) {

                $scope.salvarVendaLoading = true;
                $scope.emitirNfeLoading = true;

                var msg = $scope.validarSalvarVenda();

                if (msg != '') {
                    GeralFactory.notify('warning', 'Atenção!', msg);
                    $scope.salvarVendaLoading = false;
                    $scope.emitirNfeLoading = false;
                    return false;
                }

                var arrVerificaParcela = $scope.verificarParcelamento();
                if (arrVerificaParcela['flag']) {

                    GeralFactory.notify('warning', 'Atenção!', arrVerificaParcela['msg']);
                    $scope.salvarVendaLoading = false;
                    $scope.emitirNfeLoading = false;
                    return false;
                }

                NotifyFlag.setFlag(true);

                $scope.venda.itens_produto = [];
                $scope.venda.itens_parcelas = [];

                $scope.venda.fin_cad_cod_cad = $scope.cliente.cad_cod_cad;
                $scope.venda.fin_end_cod_end_fat = $scope.cliente.codEnderecoFaturamento;
                $scope.venda.fin_end_cod_end_ent = $scope.cliente.enderecoEntrega;
                $scope.venda.fin_tip_contribuinte = $scope.cliente.auxContribuinte;

                //console.log('itens antes salvar', $scope.venda);
                angular.forEach($scope.venda.itens, function (item, key) {

                    var arrItem = {};

                    //console.log('item ite.seq: ',item.ite_seq);
                    if (item.ite_seq) {

                        arrItem.ite_seq = item.ite_seq;
                    }

                    arrItem.ite_pro_cod_pro = item.ite_pro_cod_pro;
                    arrItem.ite_pro_descricao = item.ite_pro_descricao;
                    arrItem.ite_pro_inf_adicionais = item.ite_pro_inf_adicionais;
                    arrItem.ite_pro_qtd = item.ite_pro_qtd;

                    // Valores dos items:
                    arrItem.ite_vlr_uni_bruto = parseFloat(item.ite_vlr_uni_bruto);
                    arrItem.ite_vlr_tot_bruto = parseFloat(item.ite_vlr_tot_bruto);
                    arrItem.ite_vlr_tot_desconto = parseFloat(item.ite_vlr_tot_desconto);
                    arrItem.ite_vnd_cod_vendedor_item = item.ite_vnd_cod_vendedor_item;
                    arrItem.ite_vlr_tot_impostos_retidos = parseFloat(item.ite_vlr_tot_impostos_retidos);
                    arrItem.ite_vlr_tot_liquido = parseFloat(item.ite_vlr_tot_liquido);
                    arrItem.ite_vlr_tot_seguro = parseFloat(item.ite_vlr_tot_seguro);
                    arrItem.ite_vlr_tot_despesas = parseFloat(item.ite_vlr_tot_despesas);
                    arrItem.ite_vlr_tot_frete = parseFloat(item.ite_vlr_tot_frete);
                    arrItem.ite_vlr_uni_base = parseFloat(item.ite_vlr_tot_liquido); // o que vem da preco_5
                    arrItem.ite_vlr_uni_custo = parseFloat(item.ite_vlr_tot_liquido); // o que vem da preco_1
                    arrItem.ite_cfo_cfop = item.ite_cfo_cfop;
                    arrItem.ite_origem_ped_nro = item.ite_origem_ped_nro;
                    arrItem.ite_origem_ped_seq = item.ite_origem_ped_seq;
                    arrItem.ite_seq_tip_especifico = item.ite_seq_tip_especifico;

                    arrItem.ite_cs_origem = item.ite_cs_origem;

                    //console.log('ite_cs_origem: ',arrItem.ite_cs_origem);

                    arrItem.itens_tributo = item.itens_tributo;

                    $scope.venda.itens_produto.push(arrItem);
                });

                $scope.venda.fin_doc_vlr_liquido = $scope.venda.somaTotalLiquido;
                $scope.venda.fin_doc_vlr_despesas = $scope.venda.somaFrete + $scope.venda.somaDespesas + $scope.venda.somaSeguro;
                $scope.venda.fin_doc_vlr_descontos = $scope.venda.somaDesconto;

                //console.log('$scope.venda.fin_dat_sai: ' ,$scope.venda.fin_dat_sai);
                if ($scope.venda.fin_dat_sai != null) {

                    $scope.venda.fin_dat_sai = $scope.venda.fin_dat_sai.replace(':', '');
                }

                $scope.calcularDocVlrContabil();

                angular.forEach($scope.venda.parcelas, function (item, key) {

                    var objItensParcela = {};
                    if (item.tit_fatura_seq) {

                        objItensParcela.tit_fatura_seq = item.tit_fatura_seq;
                    }

                    objItensParcela.tit_dat_vct = item.tit_dat_vct;
                    objItensParcela.tit_doc_vlr_liquido = item.tit_doc_vlr_liquido;
                    objItensParcela.tit_5010_conta_fin = item.tit_5010_conta_fin;
                    objItensParcela.tit_6060_forma_pagamento = item.tit_6060_forma_pagamento;

                    $scope.venda.itens_parcelas.push(objItensParcela);
                });

                /**
                 * //console.log('Venda: ', $scope.venda);
                 * //console.log('SomaSub Total: ', $scope.venda.somaSubTotal);
                 * //console.log('Soma Total Liquido: ', $scope.venda.somaTotalLiquido);
                 * //console.log('Formulario de Venda:', $scope.forms.form_venda);
                 */

                var form = $scope.forms.form_venda;
                if (form.$invalid) {

                    $scope.submitted = true;
                    $scope.salvarVendaLoading = false;
                    $scope.emitirNfeLoading = false;

                } else {

                    if ($scope.venda.fin_cad_cod_cad == undefined) {

                        $scope.primeiraEtapa();
                        GeralFactory.notify('danger', 'Atenção!', 'Escolha algum cliente!');
                        $scope.emitirNfeLoading = $scope.emitirNfseLoading = $scope.salvarVendaLoading = false;
                        return false;
                    }

                    //console.log('afa: ',$scope.venda);
                    //console.log('func vale: ' ,func);

                    if (func) {
                        //console.log('tem func11');
                        NotifyFlag.setFlag(false);
                    } else {
                        //console.log('nao tem func11');
                    }

                    if ($scope.venda.fin_nro_lan) {


                        //console.log('$scope.venda vai atua:', $scope.venda);

                        VendaService.venda.update($scope.venda, function (resposta) {

                            $scope.salvarVendaLoading = false;
                            $scope.emitirNfeLoading = false;

                            if (func) {

                                //console.log('tem func8');
                                NotifyFlag.setFlag(false);
                                func.call();

                            } else {
                                //console.log('nao tem func8');
                                $scope.getOperacao(resposta.records.fin_nro_lan);
                                //$scope.listarOperacao();

                            }


                        });
                    } else {

                        VendaService.vendas.create($scope.venda, function (resposta) {

                            $timeout(function () {
                                $scope.salvarVendaLoading = false;
                                $scope.emitirNfeLoading = false;
                            }, 2000);


                            //console.log('rrr5:',resposta.records);
                            if (!resposta.records.error) {

                                //$scope.resetVars();

                                if (func) {

                                    $scope.venda.fin_nro_lan = resposta.records.fin_nro_lan;
                                    //console.log('tem func no salvar vendaaaaaaaaaaaaaaaa', resposta.records.fin_nro_lan);

                                    NotifyFlag.setFlag(false);
                                    func.call();

                                } else {
                                    //console.log('nao tem func');
                                    $scope.getOperacao(resposta.records.fin_nro_lan);
                                    $scope.listarVendas();

                                }
                            } else {
                                $scope.emitirNfeLoading = false;

                            }

                        });
                    }
                }
            };

            /**
             * Salva, fatura e emite Nfe
             */
            $scope.salvarFaturarEmitirNFe = function () {

                $scope.emitirNfeLoading = true;

                $scope.salvarVenda(function () {

                    $scope.faturar(1);
                });
            };


            /**
             * Salva, fatura e emite Nfse
             */
            $scope.salvarFaturarEmitirNFSe = function () {

                $scope.emitirNfseLoading = true;

                $scope.salvarVenda(function () {

                    $scope.faturarServico(1);
                });
            };


            /**
             * Salva e emite Nota Serie D
             */
            $scope.salvarEmitirSerieD = function () {

                $scope.emitirNfeLoading = true;

                $scope.salvarVenda(function () {

                    $scope.faturar(2);
                });
            };


            /**
             * Quando alterar algum item na listagem ele atualiza o scope e atualiza totais
             */
            $scope.atualizarItemParcela = function (i) {

                $scope.venda.parcelas[i].tit_dat_vct = $scope.venda.selectedParcela.tit_dat_vct;
                $scope.calcularSomaValor();
            };

            /**
             * Volta para a primeira etapa do wizard.
             */
            $scope.primeiraEtapa = function () {
                $timeout(function () {
                    angular.element('.sf-nav-step-0').trigger('click');
                }, 100);
            };

            $scope.clicarConclusao = function () {

                //if($scope.venda.codNatureza != 31) {

                angular.element('.sf-nav-step-2').click(function () {
                    $scope.verificarSobrescreveAdicionais();

                });
                //}
            };

            $scope.campoTotalSelecionado = function () {

                return false;
            };

            $scope.confirmarRatear = function (atributo) {

                if ($scope.blurAtributoAtivo) {
                    return false;
                }

                $scope.blurAtributoAtivo = true;

                var somaFrete = 0, somaSeguro = 0, somaDesconto = 0, somaDespesas = 0;
                angular.forEach($scope.venda.itens, function (item, key) {

                    somaDesconto = parseFloat(somaDesconto) + parseFloat(item.ite_vlr_tot_desconto);
                    somaDespesas = parseFloat(somaDespesas) + parseFloat(item.ite_vlr_tot_despesas);
                    somaFrete = parseFloat(somaFrete) + parseFloat(item.ite_vlr_tot_frete);
                    somaSeguro = parseFloat(somaSeguro) + parseFloat(item.ite_vlr_tot_seguro);
                });

                $scope.venda.frete_valor_old = somaFrete;
                $scope.venda.desconto_valor_old = somaDesconto;
                $scope.venda.despesa_valor_old = somaDespesas;
                $scope.venda.seguro_valor_old = somaSeguro;

                $scope.venda.atributo = atributo;

                // if($scope.venda.frete_valor_old == $scope.venda.somaFrete) {
                //     return false;
                // }

                GeralFactory.confirmar('Os valores de ' + atributo + ' dos itens serão recalculados. Deseja continuar?', function () {

                    $scope.blurAtributoAtivo = false;


                    VendaService.vendas.ratearAtributo($scope.venda, function (resposta) {

                        if (!resposta.records.error) {

                            angular.forEach($scope.venda.itens, function (reg, k) {


                                switch ($scope.venda.atributo) {

                                    case 'frete':
                                        $scope.venda.itens[k].ite_vlr_tot_frete = resposta.records.itens_frete[k].ite_vlr_tot_frete;
                                        break;
                                    case 'despesa':
                                        $scope.venda.itens[k].ite_vlr_tot_despesas = resposta.records.itens_despesa[k].ite_vlr_tot_despesas;
                                        break;
                                    case 'seguro':
                                        $scope.venda.itens[k].ite_vlr_tot_seguro = resposta.records.itens_seguro[k].ite_vlr_tot_seguro;
                                        break;
                                    case 'desconto':
                                        $scope.venda.itens[k].ite_vlr_tot_desconto = resposta.records.itens_desconto[k].ite_vlr_tot_desconto;
                                        //$scope.venda.itens[k].ite_vlr_tot_desconto = resposta.records.itens_desconto[k].ite_vlr_tot_desconto;
                                        break;
                                }

                            });

                            $scope.calcularVlrLiqItens();
                            $scope.getTotalItens();
                            $scope.zerarParcelas();
                        }
                    });

                }, '', function () {

                    $scope.blurAtributoAtivo = false;
                    //se cancelar janela de confirmaçao volta pro que estava antes
                    switch ($scope.venda.atributo) {

                        case 'frete':
                            $scope.venda.somaFrete = somaFrete;
                            break;
                        case 'despesa':
                            $scope.venda.somaDespesas = somaDespesas;
                            break;
                        case 'seguro':
                            $scope.venda.somaSeguro = somaSeguro;
                            break;
                        case 'desconto':
                            $scope.venda.somaDesconto = somaDesconto;
                            break;
                    }

                });
            };

            /**
             * Calcula o valor liquido de cada item
             */
            $scope.calcularVlrLiqItens = function () {

                angular.forEach($scope.venda.itens, function (reg, k) {


                    $scope.venda.itens[k].ite_vlr_tot_liquido =
                        parseFloat($scope.venda.itens[k].ite_vlr_tot_bruto) +
                        parseFloat($scope.venda.itens[k].ite_vlr_tot_frete) +
                        parseFloat($scope.venda.itens[k].ite_vlr_tot_despesas) +
                        parseFloat($scope.venda.itens[k].ite_vlr_tot_impostos_retidos) +
                        parseFloat($scope.venda.itens[k].ite_vlr_tot_seguro) -
                        parseFloat($scope.venda.itens[k].ite_vlr_tot_desconto);

                });

            };

            $scope.trocarTipContr = function () {

                if ($scope.tipContrib == 'Contribuinte') {

                    $scope.tipContrib = 'Consumidor';
                    $scope.cliente.auxContribuinte = 9;

                } else {

                    $scope.tipContrib = 'Contribuinte';
                    $scope.cliente.auxContribuinte = 1;
                }

                if ($scope.venda.itens.length > 0) {

                    var strB = [
                        {label: 'Ok', primary: true, value: '1'}
                    ];

                    prompt({
                        title: 'Informação',
                        message: 'As regras baseadas no tipo de contribuinte não serão aplicadas nos itens já lançados.',
                        buttons: strB
                    }).then(function (result) {

                    });
                }


            };

            /**
             * Formata em string do endereço completo.
             */
            $scope.formatarEnderecoString = function (arrEnd) {

                //console.log('arrEnd: ',arrEnd);
                var strEnd = '';
                if (arrEnd) {

                    if (arrEnd['end_endereco']) {

                        strEnd += arrEnd['end_endereco'] + ', ';
                    }

                    if (arrEnd['end_endereco_nro']) {

                        strEnd += arrEnd['end_endereco_nro'] + ', ';
                    }

                    if (arrEnd['end_endereco_bairro']) {

                        strEnd += arrEnd['end_endereco_bairro'] + '. ';
                    }

                    if (arrEnd['end_endereco_cidade']) {

                        strEnd += arrEnd['end_endereco_cidade'] + '/';
                    }

                    if (arrEnd['end_endereco_uf']) {

                        strEnd += arrEnd['end_endereco_uf'];
                    }
                }


                return strEnd;
            };

            /**
             * Método responsável em calcular o desconto para o valor líquido da venda.
             */
            // $scope.calcularDesconto = function(tipo) {
            //
            //     if ($scope.venda.fin_doc_vlr_bruto) {
            //
            //         var vlrLiquido = $scope.venda.fin_doc_vlr_bruto;
            //         if (tipo === 'p') {
            //
            //             var porcentagem = parseFloat($scope.venda.porcent_desconto);
            //             if (! isNaN(porcentagem) && porcentagem <= 100) {
            //
            //                 var desconto = vlrLiquido * porcentagem / 100;
            //                 $scope.venda.fin_doc_vlr_descontos = desconto;
            //
            //             } else {
            //
            //                 // Não efetuar desconto:
            //                 $scope.venda.fin_doc_vlr_descontos = null;
            //             }
            //         } else {
            //
            //             var vlrDesconto = parseFloat($scope.venda.fin_doc_vlr_descontos);
            //             vlrLiquido = parseFloat(vlrLiquido.toFixed(2));
            //
            //             if (! isNaN(vlrDesconto) && vlrDesconto <= vlrLiquido) {
            //
            //                 var descontoPorcento = vlrDesconto * 100 / vlrLiquido;
            //                 $scope.venda.porcent_desconto = parseFloat(descontoPorcento.toFixed(2));
            //             } else {
            //
            //                 // Não efetuar desconto:
            //                 $scope.venda.porcent_desconto = null;
            //             }
            //         };
            //     }
            // };

            /**
             * Ajusta o tamanho o tamanho do painel de wizard quando
             * o usuário escolhe a opção de parcelamento.
             */
            $scope.ajustarAlturaWizard = function () {
                var padrao = 300;
                $('.sf-step-2 .portlets.ui-sortable').css({height: padrao + 'px'});

                $timeout(function () {
                    var valor = $('.table-parcelas').height() + padrao;
                    $('.sf-step-2 .portlets.ui-sortable').css({height: (valor + 10) + 'px'});
                }, 300);
            };

            /**
             * Método responsável em faturar uma determinada venda ou compra respeitando o
             * tipo do documento (NF-e entre outros) e a ação do mesmo.
             */
            $scope.faturar = function (func) {


                if ($scope.venda.fin_nro_lan) {

                    console.log('entrou no $scope.faturarrrrrrrrrrrrrr', $scope.venda.fin_nro_lan)

                    $scope.salvarVendaLoading = true;

                    if ($scope.venda.fin_tip_emitente == 'T' && $scope.venda.fin_doc_nro == '') {

                        GeralFactory.notify('danger', '', 'É necessário informar o Nro. Doc.');
                        return false;
                    }

                    var objeto = {
                        'fin_nro_lan': $scope.venda.fin_nro_lan,
                        'fin_sistema': $scope.venda.fin_sistema,
                        'fin_tip_emitente': $scope.venda.fin_tip_emitente,
                        'fin_doc_nro': $scope.venda.fin_doc_nro,
                    };

                    if (func == 2) {
                        objeto.tip_seried = true;
                    }

                    console.log('$scope.venda.acao ======= 000000:', $scope.venda.acao)

                    if ($scope.venda.acao == 0 || $scope.venda.acao == 10) {

                        VendaService.venda.faturar(objeto, function (retorno) {

                            $scope.salvarVendaLoading = false;

                            if (func) {

                                if (retorno.records.error) {

                                    GeralFactory.notificar({data: retorno});
                                    $scope.salvarVendaLoading = false;
                                    $scope.emitirNfeLoading = false;

                                    if (func == 2) {

                                        GeralFactory.notify('danger', '', 'Algum erro ocorreu ao faturar');
                                        return false;
                                    }

                                } else {

                                    if (func == 2) {

                                        $scope.salvarVendaLoading = false;
                                        $scope.emitirNfeLoading = false;
                                        GeralFactory.notify('success', '', 'Registro cadastrado e faturado');
                                        $scope.getOperacao(objeto.fin_nro_lan);
                                        return false;
                                    }

                                    $scope.getOperacao(objeto.fin_nro_lan, function () {

                                        if (func != 2) {

                                            console.log('chamou função emitirNFe()');
                                            $scope.emitirNFe();
                                        }
                                    });
                                }

                            } else {
                                GeralFactory.notificar({data: retorno});
                                //console.log('nao tem func no faturar');
                                $scope.getOperacao(objeto.fin_nro_lan);
                                $scope.emitirNfeLoading = false;
                            }

                        });
                    } else {

                        $scope.salvarVendaLoading = false;

                        if (func) {

                            //console.log('entra func');
                            $scope.getOperacao(objeto.fin_nro_lan, function () {

                                if (func != 2) {

                                    $scope.emitirNFe();
                                }
                            });
                        } else {
                            GeralFactory.notificar({data: retorno});
                            //console.log('nao tem func');
                            $scope.getOperacao(objeto.fin_nro_lan);
                        }
                    }


                } else {

                    GeralFactory.notify('danger', '', 'Antes de faturar salve a operação.');
                }
            };

            $scope.faturarServico = function (func) {

                if ($scope.venda.fin_nro_lan) {

                    // console.log('if fat ser');

                    $scope.salvarVendaLoading = true;

                    var objeto = {
                        'fin_nro_lan': $scope.venda.fin_nro_lan,
                        'fin_sistema': $scope.venda.fin_sistema,
                        'fin_tip_emitente': $scope.venda.fin_tip_emitente,
                        'fin_doc_nro': $scope.venda.fin_doc_nro,
                    };

                    if ($scope.venda.acao == 0) {

                        VendaService.venda.faturarServico(objeto, function (retorno) {

                            $scope.salvarVendaLoading = false;

                            // console.log('retorna faturar servico com: ' , retorno);
                            // GeralFactory.notificar({data: retorno});
                            // $scope.getOperacao(objeto.fin_nro_lan);

                            if (func) {

                                if (retorno.records.error) {

                                    GeralFactory.notificar({data: retorno});
                                    $scope.salvarVendaLoading = false;
                                    $scope.emitirNfseLoading = false;

                                    if (func == 2) {

                                        GeralFactory.notify('danger', '', 'Algum erro ocorreu ao faturar');
                                        return false;
                                    }

                                } else {

                                    if (func == 2) {

                                        $scope.salvarVendaLoading = false;
                                        $scope.emitirNfseLoading = false;
                                        GeralFactory.notify('success', '', 'Registro cadastrado e faturado');
                                        return false;
                                    }

                                    $scope.getOperacao(objeto.fin_nro_lan, function () {

                                        if (func != 2) {

                                            $scope.emitirNFSe();
                                        }
                                    });
                                }

                            } else {
                                GeralFactory.notificar({data: retorno});
                                console.log('nao tem func no faturar');
                                $scope.getOperacao(objeto.fin_nro_lan);
                                $scope.emitirNfseLoading = false;
                            }

                        });

                    } else {
                        console.log('else fat ser. func vale: ', func);

                        if (func == 1) {

                            $scope.emitirNFSe();
                        }
                    }

                } else {

                    GeralFactory.notify('danger', '', 'Antes de faturar salve a operação.');
                }
            };

            /**
             * Método responsável em remover os dados de uma determinada venda ou compra que ainda não
             * teve lançamentos no financeiro e no estoque na base de dados.
             */
            $scope.excluir = function () {

                if (_.isEmpty($scope.venda.itens) && $scope.venda.clienteSelect.trim() === '') {

                    $scope.novaOperacao();

                } else {

                    GeralFactory.confirmar('Deseja excluir a ' + $scope.venda.op + ' em questão?', function () {
                        if ($scope.venda.fin_nro_lan) {

                            $scope.salvarVendaLoading = true;

                            var objeto = {'fin_nro_lan': $scope.venda.fin_nro_lan, 'op': $scope.venda.op};
                            VendaService.venda.cancelar(objeto, function (retorno) {

                                $scope.salvarVendaLoading = false;
                                if (!retorno.records.error) {

                                    $scope.novaOperacao();
                                }
                            });
                        } else {

                            $scope.novaOperacao();
                        }
                    });
                }
            };

            $scope.cancelarNovaOperacao = function () {

                GeralFactory.confirmar('Deseja cancelar a ' + $scope.venda.op + ' em questão?', function () {

                    $scope.novaOperacao();
                });
            };

            /**
             * Cancelar a NFe
             */
            $scope.cancelarNfe = function () {

                GeralFactory.confirmar('Deseja cancelar a NFe?', function () {

                    if ($scope.empresa.emp_tip_nota == 2) {

                        $scope.clicouAcaoNfeA3 = 2;
                    }

                    if ($scope.venda.fin_nro_lan) {

                        $scope.salvarVendaLoading = true;

                        VendaService.venda.cancelarStatusNFe($scope.venda, function (retorno) {

                            $scope.retornoEnvioNfe(retorno);

                        });
                    }
                });
            };

            /**
             * Inutilizar a NFe
             */
            $scope.inutilizarNfe = function () {

                GeralFactory.confirmar('Deseja inutilizar a NFe?', function () {

                    if ($scope.empresa.emp_tip_nota == 2) {

                        $scope.clicouAcaoNfeA3 = 4;
                    }

                    if ($scope.venda.fin_nro_lan) {

                        var obj = {'fin_nro_lan': $scope.venda.fin_nro_lan};

                        $scope.salvarVendaLoading = true;

                        VendaService.nfe.inutilizarNFe(obj, function (retorno) {

                            $scope.retornoEnvioNfe(retorno);

                        });
                    }
                });
            };

            /**
             * Cancelar a NFe
             */
            $scope.cancelarNfse = function () {

                GeralFactory.confirmar('Deseja cancelar a NFSe?', function () {
                    if ($scope.venda.fin_nro_lan) {

                        $scope.salvarVendaLoading = true;
                        var obj = {'fin_nro_lan': $scope.venda.fin_nro_lan};

                        VendaService.venda.cancelarStatusNFSe(obj, function (retorno) {

                            $scope.retornoEnvioNfe(retorno);

                        });
                    }
                });
            };

            /**
             * Exclui os dados de uma determinada venda ou compra quando a mesma existir na
             * base de dados ou apenas efetua o cancelamento no ato de salvar.
             */
            $scope.cancelar = function (flgExcluir) {

                GeralFactory.confirmar('Deseja cancelar a ' + $scope.venda.op + ' em questão?', function () {
                    if ($scope.venda.fin_nro_lan) {

                        var objeto = {
                            'fin_nro_lan': $scope.venda.fin_nro_lan,
                            'fin_sistema': $scope.venda.fin_sistema
                        };

                        if (flgExcluir == 1) {
                            objeto.excluir_nota = 1;
                        }

                        $scope.salvarVendaLoading = true;
                        VendaService.venda.cancelarDocumento(objeto, function (retorno) {

                            $scope.salvarVendaLoading = false;
                            if (!retorno.records.error) {

                                GeralFactory.notificar({data: retorno});
                                $timeout(function () {

                                    $scope.novaOperacao();
                                    $scope.getOperacao(objeto.fin_nro_lan);

                                }, 1000);
                            }
                        });
                    } else {

                        $scope.novaOperacao();
                    }
                });
            };

            $scope.reemitirNFeCont = function () {

                $scope.salvarVendaLoading = true;

                var objNfe = {};
                objNfe.fin_nro_lan = $scope.venda.fin_nro_lan;

                VendaService.vendas.enviarNfe(objNfe, function (retorno) {

                    $scope.retornoEnvioNfe(retorno);
                    $scope.salvarVendaLoading = false;

                });
            };


            /**
             * Método responsável em emitir a nota fiscal eletrônica referente a compra ou venda.
             * A nota é emitida no formato PDF com opção para extração do arquivo XML da mesma.
             */
            $scope.emitirNFe = function () {

                console.log('lan: ',$scope.venda.fin_nro_lan, ' acao: ',$scope.venda.fin_cod_acao );

                if ($scope.empresa.emp_tip_nota == 2) {

                    $scope.clicouAcaoNfeA3 = 1;
                }

                if ($scope.venda.fin_nro_lan) {

                    $scope.salvarVendaLoading = true;
                    $scope.emitirNfeLoading = true;

                    if ($scope.venda.fin_cod_acao === 1) {

                        //envia para a sefaz apenas se tiver situaçao pendente ou se estiver como erro
                        if ($scope.venda.fin_6035_situacao == 0 || $scope.venda.fin_6035_situacao == 14 || $scope.venda.fin_6035_situacao == 12 || $scope.venda.fin_6035_situacao == 13) {

                            var objNfe = {};
                            objNfe.fin_nro_lan = $scope.venda.fin_nro_lan;

                            VendaService.vendas.enviarNfe(objNfe, function (retorno) {

                                $scope.retornoEnvioNfe(retorno);
                                $scope.salvarVendaLoading = false;

                            });
                        } else {

                            $scope.atualizarStatusNFe();
                            $scope.salvarVendaLoading = false;
                            $scope.emitirNfeLoading = false;

                        }

                    } else if ($scope.venda.fin_cod_acao === 9) {

                        $scope.imprimirDANFE();
                        $scope.salvarVendaLoading = false;

                        //se tiver acao = cancelado e situaçao for pendente ou erro reenvia o cancelamento
                    } else if ($scope.venda.fin_cod_acao === 8 && ($scope.venda.fin_6035_situacao == 0 || $scope.venda.fin_6035_situacao == 14)) {
                        $scope.salvarVendaLoading = false;

                    } else {
                        $scope.emitirNfeLoading = false;
                    }

                }
            };

            /**
             * Método responsável em emitir a nota fiscal eletrônica referente a venda de serviço.
             * A nota é emitida no formato PDF com opção para extração do arquivo XML da mesma.
             */
            $scope.emitirNFSe = function () {

                // console.log('lan: ',$scope.venda.fin_nro_lan, ' acao: ',$scope.venda.fin_cod_acao );

                if ($scope.empresa.emp_tip_nota == 2) {

                    $scope.clicouAcaoNfeA3 = 1;
                }

                if ($scope.venda.fin_nro_lan) {

                    $scope.salvarVendaLoading = true;
                    $scope.emitirNfseLoading = true;

                    if ($scope.venda.fin_cod_acao === 1) {

                        // envia para a sefaz apenas se tiver situaçao pendente ou se estiver como erro
                        if ($scope.venda.fin_6035_situacao == 0 || $scope.venda.fin_6035_situacao == 14 || $scope.venda.fin_6035_situacao == 12 || $scope.venda.fin_6035_situacao == 13 || $scope.venda.fin_6035_situacao == 301) {

                            var objNfe = {};
                            objNfe.fin_nro_lan = $scope.venda.fin_nro_lan;

                            VendaService.vendas.enviarNfse(objNfe, function (retorno) {

                                $scope.retornoEnvioNfe(retorno);
                                $scope.salvarVendaLoading = false;

                            });
                        }
                    } else if ($scope.venda.fin_cod_acao === 9) {

                        $scope.imprimirNfse();
                        $scope.salvarVendaLoading = false;

                        // se tiver acao = cancelado e situaçao for pendente ou erro reenvia o cancelamento
                    } else if ($scope.venda.fin_cod_acao === 8 && ($scope.venda.fin_6035_situacao == 0 || $scope.venda.fin_6035_situacao == 14)) {

                        $scope.salvarVendaLoading = false;

                    } else {

                        $scope.emitirNfseLoading = false;
                    }
                }
            };


            $scope.atualizarStatusNFe = function (buscarPor) {

                $scope.emitirNfeLoading = true;

                if ($scope.empresa.emp_tip_nota != 2) {

                    if (buscarPor != undefined) {

                        $scope.venda.buscar_por = 2;
                    }

                    VendaService.venda.atualizarStatusNFe($scope.venda, function (retorno) {

                        // console.log('ret88:',retorno);

                        $scope.emitirNfeLoading = false;
                        $scope.retornoEnvioNfe(retorno);

                    });
                } else {

                    VendaService.venda.atualizarStatusNFe($scope.venda, function (retorno) {

                        // console.log('ret88:',retorno);

                        $scope.emitirNfeLoading = false;
                        $scope.retornoEnvioNfe(retorno);

                    });
                }
            };

            /**
             * Retorno das informaçoes do envio da nota
             */
            $scope.retornoEnvioNfe = function (retorno) {

                $scope.salvarVendaLoading = false;
                $scope.emitirNfeLoading   = false;
                $scope.emitirNfseLoading  = false;

                // console.log('ret222:',retorno);

                var retEnviarNfe = retorno.records;

                var retCodAcao = (retEnviarNfe.finCodAcao) ? retEnviarNfe.finCodAcao : 1;

                $scope.venda.fin_cod_acao = retCodAcao;
                $scope.venda.acao = retCodAcao;
                $scope.venda.fin_nfe_chave = retEnviarNfe.chave;
                $scope.venda.fin_nfe_motivo = retEnviarNfe.strMotivo;

                // console.log('cc:',retCodAcao);

                var ultLog = {};
                ultLog.motivo = retEnviarNfe.msg;
                ultLog.msg = retEnviarNfe.msg;
                ultLog.error = true;
                ultLog.status = retEnviarNfe.codSefaz;

                if (retEnviarNfe.codSituacao) {

                    var reg = GeralFactory.getRegistroPorChave($scope.arr_6035, retEnviarNfe.codSituacao, 'par_pai');
                    $scope.venda.fin_nome_situacao = reg.par_c01;
                    $scope.venda.codSituacao = retEnviarNfe.codSituacao;
                }

                // console.log('ultLog2:',ultLog);
                // console.log('retEnviarNfe: :',retEnviarNfe);

                //se estiver aguardando, cancelando, inutilizando a3
                if (ultLog.status != 1200 && ultLog.status != 1204 && ultLog.status != 1205) {

                    $scope.countDownA3 = '';
                    $scope.escolherOpcoesNfe(retCodAcao, ultLog);

                } else {

                    //chama o countdown
                    $scope.onTimeout();
                }

            };

            $scope.counter = 10;
            $scope.onTimeout = function () {

                // console.log('ontiemouttttt',$scope.counter);

                $scope.counter--;
                $scope.countDownA3 = ' em ' + $scope.counter + ' segundos.';

                if ($scope.counter > 0) {

                    var mytimeout = $timeout($scope.onTimeout, 1000);

                } else {

                    $scope.countDownA3 = '';
                    $scope.atualizarRetornoA3();
                }
            };


            /**
             * Método responsável em imprimir o arquivo relativo ao DANFE de uma determinada nota
             * fiscal de compra ou venda. A nota ainda não se encontra aprovada!
             */
            $scope.imprimirDANFE = function (ev) {

                //console.log('acao:',$scope.venda.fin_cod_acao);
                //console.log('fin_nro_lan:',$scope.venda.fin_nro_lan);

                if ($scope.venda.fin_nro_lan && ($scope.venda.fin_cod_acao == 9 || $scope.venda.fin_cod_acao == 8)) {

                    var objFiltro = {
                        'chave': $scope.venda.fin_nfe_chave,
                        'fin_nro_lan': $scope.venda.fin_nro_lan,
                        'ken': AuthTokenFactory.getToken()
                    };
                    if (ev) {
                        objFiltro.ev = ev;
                    }

                    var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                    //var rand = Math.random().toString(36).substr(2, 5);

                    $window.open(GeralFactory.getUrlApi1() + '/erp/nfe/danfe/?'+ strFiltro, 'Relatório');

                }
            };

            $scope.geraPreviewDanfe = function () {

                if ($scope.venda.fin_nro_lan) {

                    $scope.salvarVendaLoading = true;
                    $scope.emitirNfeLoading   = true;

                    var objNfe = {
                        'fin_nro_lan': $scope.venda.fin_nro_lan,
                        'preview': true
                    };

                    VendaService.vendas.previweNfe(objNfe, function (retorno) {

                        $scope.imprimirPreviewDANFE();
                        $scope.salvarVendaLoading = false;
                        $scope.emitirNfeLoading   = false;
                    });
                }
            };

            $scope.imprimirPreviewDANFE = function () {

                //console.log('acao:',$scope.venda.fin_cod_acao);
                //console.log('fin_nro_lan:',$scope.venda.fin_nro_lan);

                if ($scope.venda.fin_nro_lan && $scope.venda.fin_cod_acao != 9 && $scope.venda.fin_cod_acao != 8) {

                    var objFiltro = {
                        'fin_nro_lan': $scope.venda.fin_nro_lan,
                        'ken': AuthTokenFactory.getToken(),
                        'preview': true
                    };

                    var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                    $window.open(GeralFactory.getUrlApi() + '/erp/nfe/preview-danfe/?' + strFiltro, 'Relatório');

                }
            };

            /**
             * Método responsável em imprimir o arquivo relativo ao DANFE CCe
             */
            $scope.imprimirCce = function () {

                var objFiltro = {
                    'chave': $scope.venda.fin_nfe_chave,
                    'fin_nro_lan': $scope.venda.fin_nro_lan,
                    'ken': AuthTokenFactory.getToken(),
                    'ev': 'cce',
                    'seq': $scope.arrVendaObs[0].obs_seq
                };

                var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                $window.open(GeralFactory.getUrlApi1() + '/erp/nfe/danfe/?' + strFiltro, 'Relatório');

            };

            /**
             * Método responsável em abrir a janela modal contendo o formulário para escolha de uma
             * data de emissão ou de um vendedor para a venda/compra em questão.
             */
            $scope.getJanelaAtributoDocumento = function (campo) {

                var scope = $rootScope.$new();
                var valor;

                //console.log('vvvv:',$scope.venda);
                scope.params = {};

                switch (campo) {

                    case 'D':
                        valor = $scope.venda.fin_dat_lan;
                        scope.params.valorEmi = $scope.venda.fin_dat_emi;
                        if ($scope.venda.fin_dat_sai != '') {

                            scope.params.valorDataSai = $scope.venda.valorDataSai;
                            scope.params.valorHoraSai = $scope.venda.valorHoraSai;
                        }

                        break;
                    case 'V':
                        valor = $scope.venda.fin_vnd_cod_vendedor;
                        break;
                    case 'CF':
                        valor = $scope.venda.fin_cfo_cfop;
                        break;
                    case 'IN':
                        scope.params.fin_6030_esp_doc = 55;
                        scope.params.fin_6020_natureza = 1;
                        break;
                    case 'CC':
                        if (!$scope.venda.fin_6050_cdc || $scope.venda.centroCustoSelect == '') {
                            GeralFactory.notify('warning', 'Atenção!', 'Por favor selecione um centro de custo para defini-lo como padrão.');
                            return false;
                        }
                        break;

                    case 'CFIN':
                        //console.log('ccee:', $scope.venda.fin_5010_conta_fin , ' ---- ',$scope.venda.contaFinanceiraSelect);
                        if (!$scope.venda.fin_5010_conta_fin || $scope.venda.contaFinanceiraSelect == '') {
                            GeralFactory.notify('warning', 'Atenção!', 'Por favor selecione uma conta financeira para defini-la como padrão.');
                            return false;
                        }

                        break;

                    case 'INFCPL':
                        //console.log('INFCPL:', $scope.venda.fin_inf_complementar);
                        if ($scope.paramPadrao.par_t01 && $scope.paramPadrao.par_t01 != '') {

                            valor = $scope.paramPadrao.par_t01;
                        }

                        break;

                    case 'SD':
                        //valor = $scope.venda.fin_cfo_cfop;
                        break;

                    case 'CANCNF':
                        // valor = $scope.venda.fin_cfo_cfop;
                        break;
                }

                //console.log('valorrr: ', valor);
                scope.params.campo = campo;
                scope.params.valor = valor;
                scope.params.v = $scope.venda;
                scope.params.cliente = $scope.cliente;
                scope.params.empresa = $scope.empresa;
                scope.params.paramPadrao = $scope.paramPadrao;


                //console.log('scope.params: ',scope.params);

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'venda/views/janela-atributo.html',
                    controller: 'VendaAtributoCtrl',
                    windowClass: 'center-modal',
                    scope: scope,
                    resolve: {}
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {
                    if (msg === 'cancel') {
                        if (modalInstance.hasAlteracao) {

                            switch (campo) {
                                case 'D':
                                    $scope.venda.fin_dat_lan = modalInstance.fin_dat_lan ? modalInstance.fin_dat_lan : $scope.venda.fin_dat_lan;
                                    $scope.venda.fin_dat_emi = modalInstance.fin_dat_emi ? modalInstance.fin_dat_emi : $scope.venda.fin_dat_emi;
                                    $scope.venda.fin_dat_sai = modalInstance.fin_dat_sai ? modalInstance.fin_dat_sai : $scope.venda.fin_dat_sai;

                                    if ($scope.venda.fin_av_ap === 1) {
                                        $scope.parcelar();
                                    }
                                    break;


                                case 'CF':
                                    $timeout(function () {
                                        $scope.listaCfo = undefined;
                                        $scope.listarCfop();

                                        $scope.venda.fin_cfo_cfop = modalInstance.fin_cfo_cfop.toString(); //modalInstance.fin_cfo_cfop.toString();

                                    }, 2000);

                                    break;

                                case 'IN':
                                    $timeout(function () {

                                        var retorno = modalInstance.retornoNfe; //modalInstance.fin_cfo_cfop.toString();
                                        var mClass = (retorno.records.error) ? 'danger' : 'success';

                                        GeralFactory.notify(mClass, 'Atenção!', ((retorno.records.msg) ? retorno.records.msg : 'Numeração inutilizada.'));
                                        //console.log('ret91: ' , retorno);
                                        $scope.listarVendas();

                                    }, 1000);

                                    break;

                                case 'INFCPL':

                                    $timeout(function () {

                                        $scope.setNomeOperacao();
                                    }, 100);

                                    $timeout(function () {

                                        $scope.setRegrasAdicionaisNfe();
                                    }, 500);

                                    break;

                                case 'SD':
                                    $scope.venda.fin_doc_nro = modalInstance.fin_doc_nro;

                                    $scope.salvarEmitirSerieD();
                                    //console.log('doc nrr2: ', $scope.venda.fin_doc_nro);

                                    break;

                                case 'CANCNF':
                                    $scope.retornoEnvioNfe(modalInstance.retorno_canc_nfe);
                                    break;
                            }
                        }
                    }
                });
            };

            /**
             * Método responsável em retornar um objeto contendo o dia, mês e ano
             * de uma determinada data.
             */
            $scope.getObjetoData = function (strData) {
                var arrData = strData.split('/');
                return {
                    'dia': parseInt(arrData[0]),
                    'mes': parseInt(arrData[1]) - 1,
                    'ano': parseInt(arrData[2])
                };
            };

            /**
             * Método responsável em gerar as parcelas recorrentes referente a uma determinada a venda ou
             * compra conforme as escolhas do usuário da aplicação (12x ou 30 60 90)
             */
            $scope.parcelar = function () {

                $scope.hasEditParcela = false;
                if ($scope.venda.qtde_parcelas) {

                    if ($scope.venda.somaTotalLiquido) {

                        $scope.venda.parcelas = [];
                        $scope.venda.somaTudo = $scope.venda.somaTotalLiquido;
                        $scope.venda.dtPadrao = $scope.venda.fin_dat_lan;

                        if ($scope.venda.qtde_parcelas.match(/x/i)) {

                            var split1 = $scope.venda.qtde_parcelas.split('x');
                            var split2 = $scope.venda.qtde_parcelas.split('X');
                            var arrItem = split1.length > split2.length ? split1 : split2;

                            var qtdeParcelas = parseInt(arrItem[0]);
                            if (qtdeParcelas && (qtdeParcelas >= 1 && qtdeParcelas <= 360)) {

                                $scope.gerarParcelasByOcorrencia(qtdeParcelas)

                            } else {

                                $scope.setMensal();
                                GeralFactory.notify('warning', 'Atenção:', 'Caro usuário, o número mínimo de parcelas permitidas é 1 e o número máximo é 360!');
                            }
                        } else {

                            var arrParcelamento = $scope.venda.qtde_parcelas.match(/\d+/g);
                            if (Array.isArray(arrParcelamento)) {
                                $scope.gerarParcelasByAto(arrParcelamento);
                            }
                        }
                    } else {

                        var mensagem = 'Caro usuário, o valor total da venda deve ser maior que zero!';
                        GeralFactory.notify('warning', 'Atenção:', mensagem);
                    }
                } else {

                    var mensagem = 'Caro usuário, para gerar as parcelas é necessário mencionar o número de ocorrências!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                }
            };

            /**
             * Método responsável em gerar as parcelas recorrentes de acordo com a quantidade das mesmas
             * escolhidas pelo usuário no formato: 10x, 12x, 36x, etc.
             */
            $scope.gerarParcelasByOcorrencia = function (qtdeParcelas) {

                var periodicidade = $scope.venda.fin_cod_periodicidade;
                if (qtdeParcelas && periodicidade) {

                    var objData = $scope.getObjetoData($scope.venda.dtPadrao);
                    var defData = new Date(objData.ano, objData.mes, objData.dia);

                    var dtParcela, somaDias = 0, countMes = 1;
                    for (var i = 1; i <= qtdeParcelas; i++) {
                        var descParcela = i + '/' + qtdeParcelas;
                        switch (periodicidade) {
                            case 15:
                            case 90:
                            case 180:
                                // Somando o equivalente a 15 ou 90 ou 180 dias na data de emissão da venda:
                                dtParcela = new Date(new Date(defData).setDate(defData.getDate() + periodicidade));

                                objData = $scope.getObjetoData(GeralFactory.getDataFormatada(dtParcela));
                                defData = new Date(objData.ano, objData.mes, objData.dia);
                                break;


                            case 30:
                                // Somando o equivalente a 30 dias, verificando o último dia válido do mês:
                                dtParcela = new Date(new Date(defData).setMonth(defData.getMonth() + countMes));
                                if (dtParcela.getDate() !== objData.dia) {

                                    var dtMesPrev = new Date();
                                    dtMesPrev.setFullYear(dtParcela.getFullYear(), dtParcela.getMonth() - 1, 1);
                                    dtParcela = new Date(dtMesPrev.getFullYear(), dtMesPrev.getMonth() + 1, 0, 23, 59, 59);
                                }
                                break;


                            case 365:
                                // Somando o equivalente a um ano na data de emissão da venda:
                                dtParcela = new Date(new Date(defData).setFullYear(defData.getFullYear() + 1));

                                objData = $scope.getObjetoData(GeralFactory.getDataFormatada(dtParcela));
                                defData = new Date(objData.ano, objData.mes, objData.dia);

                                break;
                        }

                        // Verifica qual a forma de pagamento escolhida pelo usuário:
                        var codFormaPgto = 0, descFormaPgto = '';
                        if ($scope.venda.fin_6060_forma_pagamento) {

                            codFormaPgto = $scope.venda.fin_6060_forma_pagamento;
                            descFormaPgto = $scope.venda.formaPagamentoSelec;
                        }

                        var codContaFinan = 0, descContaFinan = '';
                        if ($scope.venda.fin_5010_conta_fin) {

                            codContaFinan = $scope.venda.fin_5010_conta_fin;
                            descContaFinan = $scope.venda.contaFinanceiraSelect;
                        }

                        countMes++;
                        somaDias = somaDias + periodicidade;
                        $scope.venda.parcelas.push({
                            'key': i,
                            'dias': somaDias,
                            'tit_descricao': descParcela,
                            'tit_faturado': 0,
                            'tit_dat_vct': GeralFactory.getDataFormatada(dtParcela),
                            'tit_6060_forma_pagamento': codFormaPgto,
                            'tit_6060_desc_forma_pgto': descFormaPgto,
                            'tit_5010_conta_fin': codContaFinan,
                            'tit_5010_desc_conta_fin': descContaFinan
                        });
                    }

                    $scope.calcularSomaValor();
                    $scope.distribuirParcelas();

                } else {

                    $scope.arrParcelas = [];
                    $scope.ajustarAlturaWizard();

                    var mensagem = 'Para gerar as parcelas é necessário informar o número de ocorrências e a periodicidade!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                }

                //console.log('Parcelas:', $scope.venda.parcelas);
            };

            /**
             * Método responsável em gerar as parcelas recorrentes de acordo com o sequência/ato
             * escolhido pelo usuário no formato: 30 60 90 120, etc.
             */
            $scope.gerarParcelasByAto = function (arrParcelas) {

                if (arrParcelas.length > 0) {

                    var objData = $scope.getObjetoData($scope.venda.dtPadrao);
                    var defData = new Date(objData.ano, objData.mes, objData.dia);

                    angular.forEach(arrParcelas, function (item, chave) {

                        var qtdeDias = parseInt(item);
                        var dtParcela = new Date(new Date(defData).setDate(defData.getDate() + qtdeDias));

                        // Verifica qual a forma de pagamento escolhida pelo usuário:
                        var codFormaPgto = 0, descFormaPgto = '';
                        if ($scope.venda.fin_6060_forma_pagamento) {

                            codFormaPgto = $scope.venda.fin_6060_forma_pagamento;
                            descFormaPgto = $scope.venda.formaPagamentoSelec;
                        }

                        var codContaFinan = 0, descContaFinan = '';
                        if ($scope.venda.fin_5010_conta_fin) {

                            codContaFinan = $scope.venda.fin_5010_conta_fin;
                            descContaFinan = $scope.venda.contaFinanceiraSelect;
                        }

                        var descParcela = ($scope.cliente) ? $scope.venda.nomeNaturezaSing + ' para ' + $scope.cliente.cad_nome_razao + ' ' + qtdeDias : qtdeDias;
                        $scope.venda.parcelas.push({
                            'key': chave,
                            'dias': qtdeDias,
                            'tit_descricao': descParcela,
                            'tit_faturado': 0,
                            'tit_dat_vct': GeralFactory.getDataFormatada(dtParcela),
                            'tit_6060_forma_pagamento': codFormaPgto,
                            'tit_6060_desc_forma_pgto': descFormaPgto,
                            'tit_5010_conta_fin': codContaFinan,
                            'tit_5010_desc_conta_fin': descContaFinan
                        });
                    });

                    $scope.venda.fin_cod_periodicidade = 0;
                    $scope.calcularSomaValor();
                    $scope.distribuirParcelas();

                } else {

                    var mensagem = 'Caro usuário, número de parcelas inválido!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                }
            };

            /**
             * Método responsável em distribuir as parcelas em três vetores para ficarem
             * melhores distribuidas na tela de vendas e compras.
             */
            $scope.distribuirParcelas = function () {

                var qtdeTotal = $scope.venda.parcelas.length;
                if (qtdeTotal) {

                    var fator = Math.floor(qtdeTotal / 2);
                    var arrParcelasOne = [], arrParcelasTwo = [];

                    angular.forEach($scope.venda.parcelas, function (item) {
                        arrParcelasOne.length < fator ? arrParcelasOne.push(item) : arrParcelasTwo.push(item);
                    });

                    $scope.arrParcelas = [arrParcelasOne, arrParcelasTwo];
                    $scope.ajustarAlturaWizard();
                }
            };

            /**
             * Método responsável em voltar as abas ou voltar para tela de listagem das vendas.
             */
            $scope.voltar = function () {

                $timeout(function () {

                    var abaAtiva = angular.element('.sf-active').attr('class');
                    if (abaAtiva) {

                        var aba = parseInt(abaAtiva.match(/\d+/)[0]);
                        if (aba === 0) {

                            $scope.flagTutorial = true;
                            $scope.primeiraEtapa();
                            $scope.forms.form_venda.$setPristine();
                            $scope.resetVars();

                            $scope.listarVendas();
                            $scope.listarFase();

                        } else {

                            aba = aba - 1;
                            var seletor = '.sf-nav-step-' + aba;
                            angular.element(seletor).trigger('click');
                        }
                    }
                }, 200);
            };

            /**
             * Método responsável em zerar as parcelas no ato de mudar a periodicidade
             * da venda/compra por parte do usuário.
             */
            $scope.setPeriodicidade = function () {

                if ($scope.venda.fin_cod_periodicidade === 0) {

                    GeralFactory.confirmar('Deseja cancelar as parcelas?', function () {
                        $scope.ajustarAlturaWizard();
                    });
                } else {

                    $scope.parcelar();
                }
            };

            /**
             * Método responsável em zerar as parcelas da venda.
             */
            $scope.zerarParcelas = function (flag) {

                $scope.arrParcelas = [];
                $scope.venda.fin_av_ap = 0;
                $scope.venda.qtde_parcelas = '';

                if (flag)
                    $scope.venda.parcelas = [];
            };

            /**
             * Inicializa a venda a prazo para uma determinada venda/compra.
             */
            $scope.setMensal = function () {

                if ($scope.venda.somaTotalLiquido) {

                    $scope.venda.fin_av_ap = 1;
                    $scope.venda.fin_cod_periodicidade = 30;

                    // Gerando parcela única para a venda a prazo:
                    $scope.venda.parcelas = [];
                    $scope.venda.somaTudo = $scope.venda.somaTotalLiquido;
                    $scope.venda.dtPadrao = $scope.venda.fin_dat_lan;

                    $scope.venda.qtde_parcelas = '1x';
                    $scope.gerarParcelasByOcorrencia(1);

                } else {

                    var mensagem = 'Caro usuário, o valor total da venda deve ser maior que zero!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);

                }
            };

            /**
             * Método responsável em gerar o boleto de pagamento para uma determinada
             * venda não vale para a tela de compras.
             */
            $scope.gerarBoleto = function () {

                if ($scope.venda.op === 'venda') {

                    var vlrFrete = $scope.venda.somaFrete ? parseFloat($scope.venda.somaFrete) : 0;
                    var objBoleto = {
                        'fin_nro_lan': $scope.venda.fin_nro_lan,
                        'frt_tipo_frete': GeralFactory.getTipoFrete($scope.venda.fin_tip_frete),
                        'frt_descricao': GeralFactory.getDescFrete($scope.venda.fin_tip_frete),
                        'frt_vlr_frete': vlrFrete,
                        'frt_dias_prazo_entrega': 0
                    };

                    /**
                     * q=(fin_nro_lan:320, frt_tipo_frete:4, frt_dias_prazo_entrega:0 , frt_descricao:PAC, frt_vlr_frete:18)
                     * q=(fin_nro_lan:342, frt_tipo_frete:4, frt_dias_prazo_entrega:13, frt_descricao:PAC, frt_vlr_frete:28, frt_end_cep:68627-459)
                     */

                    var strBoleto = GeralFactory.formatarPesquisar(objBoleto);
                    VendaService.pagamento.boleto({u: strBoleto}, function (retorno) {
                        if (retorno.records) {

                            var arrRetorno = retorno.records;
                            if (arrRetorno.error) {

                                var msg = arrRetorno.msg;
                                GeralFactory.notify('danger', 'Atenção!', msg);

                            } else {

                                //console.log(arrRetorno.response);

                                $scope.objBoleto = arrRetorno.response;
                                if (!_.isEmpty($scope.objBoleto.data)) {

                                    $timeout(function () {

                                        var url = $scope.objBoleto.data.link;
                                        $window.open(url, 'Boleto Bancário');

                                    }, 1000);
                                }
                            }
                        }
                    });
                }
            };

            /**
             *
             */
            $scope.hasBoleto = function () {

                $scope.getEmpresa(function () {

                    $scope.flagBoleto = $scope.empresa.emp_ativo_gn > 0 ? true : false;
                });
            };


            $scope.escolherOpcoesNfe = function (acao, retorno) {

                //console.log('acao: ',acao);
                //console.log('retorno: ',retorno);

                //var motivo = retorno.motivo;
                var msg = retorno.msg;
                var status = retorno.status;

                var opcoesBotoes = [];

                //se acao = cancelado
                if (acao == 9) {

                    if (status == 225) {

                        opcoesBotoes = [
                            {label: 'Ok', cancel: false, class: 'btn-primary', value: '1'}];

                    } else {

                        opcoesBotoes = [
                            {label: 'Ok', cancel: false, class: 'btn-primary', value: '1'},
                            // {label   : 'Imprimir',primary : true,value : '2'},
                            // {label   : 'Enviar E-mail',value : '3',primary : true}
                        ];
                    }

                } else if (acao == 8) {

                    opcoesBotoes = [
                        {label: 'Ok', cancel: false, class: 'btn-primary', value: '1'}];

                } else {

                    if (status == undefined || status == 225 || status == 1202) {
                        opcoesBotoes = [
                            {label: 'Ok', cancel: false, class: 'btn-primary', value: '1'},
                        ];
                    } else if (status == 105) {
                        opcoesBotoes = [
                            {label: 'Ok', cancel: false, class: 'btn-primary', value: '1'},
                            {label: 'Atualizar', primary: true, value: '4'}
                        ];
                    } else if (status == 1200) {

                        //console.log('eh status 1200');
                        opcoesBotoes = [
                            {label: 'Ok', cancel: false, class: 'btn-primary', value: '5'},
                        ];

                    } else {
                        opcoesBotoes = [
                            {label: 'Ok', cancel: false, class: 'btn-primary', value: '1'},
                            //{label   : 'Atualizar',primary : true,value : '4'}
                        ];
                    }

                }

                $timeout(function () {
                    $('.modal-sm').css('width', '450px');
                }, 600);

                var msgC = '';
                if ($scope.venda.codSituacao == 12 || $scope.venda.codSituacao == 14) {
                    msgC = '<strong><p align="center" style="text-align: center;font-size: 18px;"><i class="icon-close"></i>&nbsp;&nbsp; Erro</p></strong><br>';
                }

                msg = $sce.trustAsHtml(msgC + msg);

                prompt({
                    title: 'Escolha uma das opções',
                    message: msg,
                    buttons: opcoesBotoes
                }).then(function (result) {

                    //console.log('result: ',result);

                    if (result.value == '2') {

                        $scope.imprimirDANFE();

                    } else if (result.value == '3') {

                        $scope.enviarEmail();

                    } else if (result.value == '4') {

                        $scope.atualizarStatusNFe();

                    } else if (result.value == '5') {

                        //console.log('eh 5555');
                        //$scope.novaOperacao(); // tirei pq no A3 na hora que emite ele nao pode voltar pra aba 1
                    }

                }, function () {
                });
            };

            $scope.verificarSobrescreveAdicionais = function () {

                //console.log('a:',$scope.flgAlterouValorNota);
                //console.log('b:',$scope.venda.fin_inf_complementar);
                //console.log('c:',$scope.venda.tipCs);


                if ($scope.flgAlterouValorNota && $scope.venda.fin_inf_complementar && $scope.venda.tipCs == 1 && $scope.venda.codNatureza != 31) {

                    //console.log('if1');
                    var opcoesBotoes = [
                        {label: 'Não', cancel: true, class: 'btn-danger'},
                        {label: 'Sim', primary: true, value: '1'}
                    ];

                    prompt({
                        title: 'Escolha uma das opções',
                        message: 'Deseja redefinir a mensagem Dados Adicionais (NF-e) ?',
                        buttons: opcoesBotoes
                    }).then(function (result) {

                        //console.log('result: ',result);

                        if (result.value == '1') {

                            //console.log('if2');
                            $scope.setRegrasAdicionaisNfe();
                        }

                    });
                    $scope.flgAlterouValorNota = false;

                } else {
                    //console.log('else1');
                    ////console.log('vv:',$scope.flgAlterouValorNota);
                    if (!$scope.venda.fin_nro_lan && $scope.flgAlterouValorNota) {

                        //console.log('if3');
                        $scope.setRegrasAdicionaisNfe();
                        //console.log('a:',$scope.venda.fin_inf_complementar);
                    }
                }
            };

            $scope.setRegrasAdicionaisNfe = function () {

                if ($scope.venda.codNatureza == 31) {
                    //console.log('fff');
                    $scope.setMsgPadraoInfComplementar('');
                    return false;
                }

                var msg = '', somaIteVlrApr = 0;

                //console.log('ddd:', $scope.venda.fin_tip_emitente);

                $scope.flgAlterouValorNota = false;

                //msgs automaticas somente para Vendas e SN
                if ($scope.empresa.emp_reg_trib == 1 || $scope.empresa.emp_reg_trib == 2 || $scope.empresa.emp_reg_trib == 3) {

                    //console.log('fin_tip_emitente:', $scope.venda.fin_tip_emitente);
                    if ($scope.venda.fin_tip_emitente == 'P') {

                        msg += 'Documento emitido por ME ou EPP optante pelo Simples Nacional;';
                    }

                    //console.log('codNatureza:', $scope.venda.codNatureza);

                    if ($scope.venda.codNatureza == 1) {

                        //console.log('emp_cod_csosn:', $scope.empresa.emp_cod_csosn);
                        if ($scope.empresa.emp_cod_csosn == 102) {

                            //console.log('cso da emp eh 102');

                            msg += 'Não gera direito a crédito fiscal de ICMS e IPI;';
                        } else if ($scope.empresa.emp_aliq_icms_aprov) { //$scope.empresa.emp_cod_csosn == 101 &&

                            //console.log('a empresa tem aprov de credito');

                            angular.forEach($scope.venda.itens, function (item, key) {

                                //console.log('itemnn:',item);
                                if (item['ite_cso'] == 101 || item['ite_cso'] == 201) {
                                    //console.log('produto cso 101 ou 201: ',parseFloat(somaIteVlrApr) + ' --- ' , parseFloat(item['ite_vlr_tot_liquido']));
                                    somaIteVlrApr = parseFloat(somaIteVlrApr) + parseFloat(item['ite_vlr_tot_liquido']);
                                }
                            });

                            //console.log('somaIteVlrApr: ',parseFloat(somaIteVlrApr) , 'contr: ',$scope.cliente.auxContribuinte);

                            //se a soma liquida dos itens cso 101 for maior que zero e o cliente for contribuinte
                            if (somaIteVlrApr > 0 && $scope.cliente.auxContribuinte != 9) {

                                //console.log('valor aprov eh maior q zero');
                                somaIteVlrApr = somaIteVlrApr * ($scope.empresa.emp_aliq_icms_aprov / 100);
                                msg += 'Permite o aproveitamento do crédito de ICMS no valor de R$' + GeralFactory.toReais(somaIteVlrApr) + ' correspondente à alíquota de ' + $scope.empresa.emp_aliq_icms_aprov + '%, nos termos do Artigo 23 da LC 123;';
                            }
                        }


                        // mensagem para simples nacional quando exportação
                        if($scope.venda.fin_cfo_cfop >= 7000) {

                            msg += 'Não incidência de ICMS conforme Art. 4º, inc. II do RICMS-'+ $scope.empresa['emp_uf'] +'/2002;';
                            msg += 'Imune de IPI conforme Art. 18, inc. II do RIPI/2010;';
                        }
                    }

                    //console.log('msg1:', msg);

                } else {
                    //console.log('debito e cred');
                    // mensagem para debito e cred quando exportação
                    if($scope.venda.fin_cfo_cfop >= 7000) {

                        msg += 'Não incidência de ICMS conforme Art. 4º, inc. II do RICMS-'+ $scope.empresa['emp_uf'] +'/2002;';
                        msg += 'Imune de IPI conforme Art. 18, inc. II do RIPI/2010;';
                        msg += 'Não incidência do PIS/COFINS, conforme Art. 5º da Lei nº 10.637/02 e da COFINS, conforme Art. 6º da Lei nº 10.833/03';
                    }
                }



                if ($scope.venda.codNatureza == 1) {

                    var msgSt = false;
                    angular.forEach($scope.venda.itens, function (item, key) {

                        if ((item['ite_cso'] == 500 || item['ite_cso'] == 60) && !msgSt) {
                            msg += 'ICMS ST cobrado anteriormente por substituição tributária.';
                            msgSt = true;
                        }
                    });

                    //console.log('msggg:',msg);

                    //precisa do timeout pq nao estava aparecendo o valor no campo instantaneamente

                }
                //console.log('msg2:', msg);


                $scope.setMsgPadraoInfComplementar(msg);


            };


            $scope.setMsgPadraoInfComplementar = function (msg) {

                $timeout(function () {

                    if ($scope.paramPadrao.par_t01 && $scope.paramPadrao.par_t01 != '') {

                        msg += $scope.paramPadrao.par_t01 + ';';
                    }

                    //Adiciona o endereço de entrega às informações adicionais da nota
                    if($scope.cliente.enderecoEntrega != $scope.cliente.codEnderecoFaturamento) {

                        var strEndEnt = '';

                        angular.forEach($scope.cliente.listaEndereco, function (i, j) {

                            if(i.end_seq_end == $scope.cliente.enderecoEntrega) {

                                strEndEnt = $scope.formatarEnderecoString(i);
                                msg += 'Endereço para entrega: ' + strEndEnt;
                            }
                        });
                    }

                    $scope.venda.fin_inf_complementar = msg;
                }, 1200);
            };
            /**
             Retorna o XML da nota autorizada
             */
            $scope.getXmlAprovado = function () {

                var objFiltro = {
                    'tipo_retorno': 1,
                    'ken': AuthTokenFactory.getToken(),
                    'chave': $scope.venda.fin_nfe_chave,
                    'fin_nro_lan': $scope.venda.fin_nro_lan
                };

                var url = GeralFactory.getUrlApi() + '/erp/nfe/get-xml-aprovado/?' + GeralFactory.formatarPesquisar(objFiltro);
                $window.open(url, 'XML');
            };

            /**
             Retorna o XML de entrada
             */
            $scope.getXmlEntrada = function () {

                var objFiltro = {
                    //'tipo_retorno' : 1,
                    'ken': AuthTokenFactory.getToken(),
                    'chave': $scope.venda.fin_nfe_chave,
                    'fin_nro_lan': $scope.venda.fin_nro_lan
                };

                var url = GeralFactory.getUrlApi() + '/erp/nfe/get-xml-entrada-download/?' + GeralFactory.formatarPesquisar(objFiltro);
                $window.open(url, 'XML');
            };


            /**
             Retorna o XML da nota cancelado
             */
            $scope.getXmlCancelado = function () {

                var objFiltro = {
                    'tipo_retorno': 1,
                    'ken': AuthTokenFactory.getToken(),
                    'chave': $scope.venda.fin_nfe_chave,
                    'fin_nro_lan': $scope.venda.fin_nro_lan
                };

                var url = GeralFactory.getUrlApi() + '/erp/nfe/get-xml-cancelado/?' + GeralFactory.formatarPesquisar(objFiltro);
                $window.open(url, 'XML');
            };

            /**
             * Retorna o xml da ultima Cce enviada
             */
            $scope.getXmlCce = function () {

                var objFiltro = {
                    'tipo_retorno': 1,
                    'ken': AuthTokenFactory.getToken(),
                    'chave': $scope.venda.fin_nfe_chave,
                    'fin_nro_lan': $scope.venda.fin_nro_lan,
                    'seq': $scope.arrVendaObs[0].obs_seq
                };

                var url = GeralFactory.getUrlApi() + '/erp/nfe/get-xml-cce/?' + GeralFactory.formatarPesquisar(objFiltro);
                $window.open(url, 'XML');

            };

            /**
             * Abre a janela modal para ediçao de um determinado produto.
             */
            $scope.getJanelaProduto = function (pro_cod_pro) {

                var scope = $rootScope.$new();
                scope.params = {};

                if (pro_cod_pro) {

                    scope.params.pro_cod_pro = pro_cod_pro;
                    scope.params.pro_eh_servico = ($scope.venda.codNatureza === 31) ? 1 : 0;

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'produto/views/janela-produto.html',
                        controller: 'ProdutoModalCtrl',
                        size: 'lg',
                        windowClass: 'center-modal no-top-modal',
                        scope: scope,
                        resolve: {
                            getEnd: function () {
                            }
                        }
                    });

                    modalInstance.result.then(function (id) {
                    }, function (msg) {
                        if (msg === 'reload') {
                            if (modalInstance.hasAlteracao) {

                                $scope.setNewItemProduto(pro_cod_pro);
                                if (!_.isEmpty($scope.venda.itens)) {

                                    var flag = false;
                                    var produto = modalInstance.objProdutoUp;

                                    /**
                                     * Caso precise alterar os demais itens da venda remover hasOwnProperty('key').
                                     * Pois assim os itens antigos tambem serao alterados!
                                     */
                                    angular.forEach($scope.venda.itens, function (item, chave) {

                                        if (item.hasOwnProperty('key') && pro_cod_pro == item.ite_pro_cod_pro) {
                                            flag = true;
                                            var preco = (produto[$scope.venda.attrPrecoProduto]) ? parseFloat(produto[$scope.venda.attrPrecoProduto]) : 0;

                                            $scope.venda.itens[chave].ite_vlr_uni_bruto = preco;
                                            $scope.venda.itens[chave].ite_vlr_tot_bruto = preco * item.ite_pro_qtd;
                                            $scope.venda.itens[chave].ite_vlr_tot_liquido = preco * item.ite_pro_qtd;
                                            $scope.venda.itens[chave].ite_pro_descricao = produto.pro_descricao_longa;
                                            $scope.venda.itens[chave].ite_pro_inf_adicionais = produto.pro_inf_adicionais;
                                            $scope.venda.itens[chave].produto_saldo = produto.produto_saldo;
                                            $scope.venda.itens[chave].produto_grupo = produto.produto_grupo;
                                            $scope.venda.itens[chave].pro_estoque = parseFloat(produto.produto_saldo.sal_atu_qtd_saldo);
                                            $scope.venda.itens[chave].pro_str_etoque = GeralFactory.getStringEstoque(produto.produto_saldo.sal_atu_qtd_saldo);
                                        }
                                    });

                                    if (flag) {

                                        // TODO: necessita recalcular o frete, despesas e descontos???
                                        $scope.zerarParcelas();
                                        $scope.getTotalItens();
                                    }
                                }
                            }
                        }
                    });
                }
            };

            $scope.imprimirOrcamentoDAV = function (acao) {

                var strFiltro = '';

                if ($scope.venda.fin_nro_lan) {

                    strFiltro = GeralFactory.formatarPesquisar({
                        'fin_nro_lan'  : $scope.venda.fin_nro_lan,
                        'fin_doc_nro'  : $scope.venda.fin_doc_nro,
                        'cod_natureza' : $scope.venda.fin_6020_natureza,
                        'acao'         : acao,
                        'ken'          : AuthTokenFactory.getToken()
                    });

                    var url = GeralFactory.getUrlApi() + '/erp/export/orcamento/dav/?' + strFiltro;
                    $window.open(url, 'DAV - Documento Auxiliar de Venda - Orçamento');

                } else {

                    var mensagem = 'Para efetuar a impressão é necessário escolher um orçamento na listagem!';
                    GeralFactory.notify('warning', 'Atenção!', mensagem);

                }
            };

            /**
             * Abre a modal de envio de email com o email do cliente.
             */
            $scope.getJanelaEnviarEmail = function (tipo) {

                var obj = {
                    fin_nro_lan: $scope.venda.fin_nro_lan,
                    fin_doc_nro: $scope.venda.fin_doc_nro,
                    contato: {
                        cto_email: $scope.cliente.contato.cto_email
                    }
                };

                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.venda = obj;
                scope.params.codNatureza = $scope.venda.codNatureza;
                scope.params.tipo = tipo;

                var modalInstance = $uibModal.open({
                    templateUrl: 'venda/views/envia-email-cliente.html',
                    controller: 'VendaEnvioEmailModalCtrl',
                    windowClass: 'center-modal',
                    scope: scope,
                    size: 'md'
                });

            };

            /**
             * Método responsável em manipular os campos do tipo TAG referentes ao
             * campo situação da nota contido no formulário de pesquisa.
             */
            $scope.manipularSituacoes = function (objSituacao) {

                var arrSitSelecionadas = $scope.pesquisarVenda.arrSitSelecionadas;
                if (arrSitSelecionadas.length === 0) {

                    // Inicializando o vetor com as contas financeiras escolhidas para a pesquisa:
                    arrSitSelecionadas.push(objSituacao.par_pai);

                } else {

                    // Removendo o item escolhido caso o mesmo já exista no vetor:
                    var keepGoing = true;
                    angular.forEach(arrSitSelecionadas, function (i, j) {
                        if (keepGoing) {
                            if (i === objSituacao.par_pai) {
                                arrSitSelecionadas.splice(j, 1);
                                keepGoing = false;
                            }
                        }
                    });

                    // Adiciona o item escolhido caso o mesmo não exista no vetor:
                    keepGoing && arrSitSelecionadas.push(objSituacao.par_pai);
                    $scope.pesquisarVenda.arrSitSelecionadas = arrSitSelecionadas;
                }
            };

            /**
             * Verifica se a situação está selecionada para efetuar a pesquisa.
             */
            $scope.inSituacoes = function (objSituacao) {

                var keepGoing = true;
                angular.forEach($scope.pesquisarVenda.arrSitSelecionadas, function (i, j) {
                    if (keepGoing) {
                        if (i === objSituacao.par_pai) {
                            keepGoing = false;
                        }
                    }
                });

                return !keepGoing;
            };

            /**
             * Método responsável em editar os dados de uma determinada parcela.
             */
            $scope.editParcela = function (parcela, indice, numTabela) {

                if ($scope.venda.fin_nro_lan && parcela.tit_fatura_seq) {

                    // Edição das parcelas só pode acontecer em documentos em modo de edição:
                    if ($scope.venda.fin_cod_acao === 0) {

                        $scope.parcelaSelecionada = parcela;

                        var vlrIndiceParcela = 0;
                        switch (numTabela) {
                            case 0:
                                vlrIndiceParcela = indice + 1;
                                break;
                            case 1:
                                var vlrSubtracao = ($scope.objCloneParcelas.length % 2) === 0 ? 0 : 0.5;
                                vlrIndiceParcela = (indice + 1) + (($scope.objCloneParcelas.length / 2) - vlrSubtracao);
                                break;
                        }

                        var vlrLiquidoVenda = parseFloat($scope.venda.somaTotalLiquido);
                        var scope = $rootScope.$new();
                        scope.params = {
                            'objParcela': angular.copy(parcela),
                            'objVendaParcelas': $scope.objCloneParcelas,
                            'vlrLiquidoVenda': vlrLiquidoVenda,
                            'vlrIndiceParcela': vlrIndiceParcela
                        };

                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: 'venda/views/janela-parcela.html',
                            controller: 'VendaParcelaModalCtrl',
                            size: 'md',
                            windowClass: 'center-modal no-top-modal',
                            scope: scope,
                            resolve: {}
                        });

                        modalInstance.result.then(function (id) {
                        }, function (msg) {
                            if (msg === 'cancel') {
                                if (modalInstance.hasAlteracao) {

                                    // Indica que o usuário alterou os valores das parcelas.
                                    $scope.hasEditParcela = true;

                                    parcela.tit_dat_vct = modalInstance.objParcelaNova.tit_dat_vct;
                                    parcela.tit_doc_vlr_liquido = modalInstance.objParcelaNova.tit_doc_vlr_liquido;
                                    parcela.tit_6060_forma_pagamento = modalInstance.objParcelaNova.tit_6060_forma_pagamento;
                                    parcela.tit_6060_desc_forma_pgto = modalInstance.objParcelaNova.tit_6060_desc_forma_pgto;
                                    parcela.tit_5010_conta_fin = modalInstance.objParcelaNova.tit_5010_conta_fin;
                                    parcela.tit_5010_desc_conta_fin = modalInstance.objParcelaNova.tit_5010_desc_conta_fin;

                                    //console.log('Objeto clone: ', $scope.objCloneParcelas);
                                    if (modalInstance.vlrUntilParcela) {

                                        var arrParcelasRestantes = [], qtdeParcelasRestantes = 0;
                                        angular.forEach($scope.objCloneParcelas, function (item, chave) {

                                            // Verifica as parcelas restantes para rateio do valor liquído da venda:
                                            if (item.tit_fatura_seq > parcela.tit_fatura_seq) {

                                                qtdeParcelasRestantes++;
                                                arrParcelasRestantes.push(chave);
                                            }
                                        });

                                        if (qtdeParcelasRestantes) {

                                            var vlrRateio = vlrLiquidoVenda - parseFloat(modalInstance.vlrUntilParcela);

                                            vlrRateio = vlrRateio / qtdeParcelasRestantes;
                                            vlrRateio = parseFloat(vlrRateio.toFixed(2));

                                            angular.forEach(arrParcelasRestantes, function (item) {
                                                $scope.objCloneParcelas[item].tit_doc_vlr_liquido = vlrRateio;
                                            });

                                            $timeout(function () {
                                                var vlrTotal = 0;
                                                angular.forEach($scope.objCloneParcelas, function (item, chave) {

                                                    var vlrParcela = parseFloat(item.tit_doc_vlr_liquido);
                                                    vlrTotal += vlrParcela;

                                                    if (item.tit_fatura_seq !== parcela.tit_fatura_seq)
                                                        $scope.venda.parcelas[chave].tit_doc_vlr_liquido = vlrParcela;

                                                });

                                                // Verificação dos centavos com relação ao total das parcelas modificadas:
                                                var vlrSobra = vlrLiquidoVenda - vlrTotal;
                                                if (vlrSobra !== 0) {

                                                    vlrSobra = parseFloat(vlrSobra.toFixed(2));
                                                    $scope.venda.parcelas[0].tit_doc_vlr_liquido = parseFloat($scope.venda.parcelas[0].tit_doc_vlr_liquido) + vlrSobra;
                                                }


                                                $scope.objCloneParcelas = angular.copy($scope.venda.parcelas);
                                                //console.log('Sobra ou restante: ', vlrSobra);
                                                //console.log('Somatória dos itens: ', vlrTotal);

                                            }, 200);
                                        }
                                    }
                                }
                            }
                        });
                    } else {

                        var mensagem = 'A edição de uma determinada parcela só pode acontecer em modo de edição!';
                        GeralFactory.notify('warning', 'Atenção!', mensagem);
                    }
                } else {

                    var mensagem = 'Para editar os dados da parcela é necessário primeiramente salvar a ' + $scope.venda.nomeNaturezaSing + '!';
                    GeralFactory.notify('warning', 'Atenção!', mensagem);
                }
            };


            /**
             * Método responsável em gerar um pedido de venda e uma prestação de serviço de acordo
             * com os itens de um determinado orçamento selecionado pelo usuário.
             */
            $scope.gerarPedidos = function () {

                if ($scope.venda.codNatureza === 11 && $scope.venda.fin_nro_lan) {

                    // Verificando a existência de itens no orçamento escolhido:
                    if ($scope.venda.itens.length) {

                        GeralFactory.confirmar('Deseja gerar um novo Pedido de Venda e/ou Ordem de Serviço a partir deste orçamento?', function () {

                            $scope.salvarVendaLoading = true;
                            var arrProdutos = [], arrServicos = [];
                            var objGeracao = {
                                'pv': {},
                                'ps': {}
                            };

                            angular.forEach($scope.venda.itens, function (item, chave) {

                                var objProduto = $scope.venda.itens[chave];
                                if (objProduto) {

                                    var proEhServico = objProduto.produto.pro_eh_servico;
                                    proEhServico === 1 ? arrServicos.push(objProduto) : arrProdutos.push(objProduto);
                                }
                            });

                            // Salvar um novo pedido para os produtos:
                            if (arrProdutos.length) {

                                var objPedVenda = $scope.getObjetoGerarPedidos(1);
                                objPedVenda = $scope.getTotaisGerarPedidos(objPedVenda, arrProdutos);

                                //console.log('objPedVendaaaa', objPedVenda);

                                objPedVenda.fin_cfo_cfop = $scope.setCfopPadraoOperacao(1);


                                objGeracao['pv'] = objPedVenda;
                            }

                            // Salvar um novo pedido para os serviços:
                            if (arrServicos.length) {

                                var objPreServico = $scope.getObjetoGerarPedidos(31);
                                objPreServico = $scope.getTotaisGerarPedidos(objPreServico, arrServicos);
                                objGeracao['ps'] = objPreServico;
                            }

                            VendaService.gerarPedidos.create(objGeracao, function (retorno) {

                                var objRetorno = retorno.records, mensagem = '';
                                if (objRetorno['pv'].error && objRetorno['ps'].error) {

                                    // Erro na inserção de ambos:
                                    mensagem = objRetorno['pv'].msg + ' ' + objRetorno['ps'].msg;
                                    GeralFactory.notify('danger', 'Atenção:', mensagem);

                                } else {

                                    // Sucesso na inserção de ambos:
                                    if (!objRetorno['pv'].error && !objRetorno['ps'].error) {

                                        mensagem = 'Os pedidos foram gerados com sucesso!';
                                        GeralFactory.notify('success', 'Atenção:', mensagem);

                                    } else {

                                        // Erro em pelo menos algum:
                                        mensagem = objRetorno['pv'].error ? objRetorno['pv'].msg + ' ' : 'Pedido de venda gerado com sucesso! ';
                                        mensagem += objRetorno['ps'].error ? objRetorno['ps'].msg + ' ' : 'Prestação de serviço gerada com sucesso! ';

                                        GeralFactory.notify('info', 'Atenção:', mensagem);
                                    }
                                }

                                $timeout(function () {
                                    $scope.salvarVendaLoading = false;
                                    $window.location.href = '#orcamento';
                                }, 5000);
                            });
                        });
                    } else {

                        var mensagem = 'Caro usuário, não foi possível gerar o pedido pois o orçamento se encontra sem itens!';
                        GeralFactory.notify('warning', 'Atenção:', mensagem);
                    }
                } else {

                    var mensagem = 'Caro usuário, a geração de pedidos é permitida apenas a partir de um orçamento!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                }
            };

            /**
             * Método responsável em recalcular os valores dos itens para um determinado pedido de venda
             * ou prestação de serviço a serem gerados a partir de um orçamento.
             */
            $scope.getTotaisGerarPedidos = function (objPedido, arrItens) {

                objPedido.itens = arrItens;
                objPedido.itens_produto = arrItens;

                var sumValores = 0, sumDescontos = 0, sumDespesas = 0, sumFretes = 0, sumSeguros = 0, sumImpostos = 0, sumLiquida = 0, sumContabil = 0;
                angular.forEach(objPedido.itens, function (item, chave) {

                    objPedido.itens[chave].ite_vlr_tot_liquido =
                        parseFloat(objPedido.itens[chave].ite_vlr_tot_bruto) +
                        parseFloat(objPedido.itens[chave].ite_vlr_tot_frete) +
                        parseFloat(objPedido.itens[chave].ite_vlr_tot_despesas) +
                        parseFloat(objPedido.itens[chave].ite_vlr_tot_impostos_retidos) +
                        parseFloat(objPedido.itens[chave].ite_vlr_tot_seguro) -
                        parseFloat(objPedido.itens[chave].ite_vlr_tot_desconto);

                    sumValores = parseFloat(sumValores) + ((item.ite_pro_qtd) * (item.ite_vlr_uni_bruto));
                    sumDescontos = parseFloat(sumDescontos) + parseFloat(item.ite_vlr_tot_desconto);
                    sumDespesas = parseFloat(sumDespesas) + parseFloat(item.ite_vlr_tot_despesas);
                    sumFretes = parseFloat(sumFretes) + parseFloat(item.ite_vlr_tot_frete);
                    sumSeguros = parseFloat(sumSeguros) + parseFloat(item.ite_vlr_tot_seguro);
                    sumImpostos = parseFloat(sumImpostos) + parseFloat(item.ite_vlr_tot_impostos_retidos);
                    sumLiquida = parseFloat(sumLiquida) + parseFloat(item.ite_vlr_tot_liquido);

                    if (item.itens_tributo.length) {
                        angular.forEach(item.itens_tributo, function (tributo) {

                            sumContabil = parseFloat(sumContabil) + parseFloat(tributo.tri_contabil_vlr);
                        });
                    }
                });

                objPedido.valorFrete = objPedido.valorFrete ? objPedido.valorFrete : 0;
                objPedido.somaSeguro = sumSeguros;
                objPedido.somaDesconto = sumDescontos;
                objPedido.somaDespesas = sumDespesas;
                objPedido.somaFrete = sumFretes;
                objPedido.somaImpostosRetidos = sumImpostos;
                objPedido.somaImpostosRetidos_format = GeralFactory.currencyDecimal(sumImpostos);
                objPedido.fin_doc_vlr_bruto = sumValores;

                var sumLiquidaQuatroDig = sumValores + parseFloat(objPedido.somaFrete) + sumDespesas + sumSeguros + sumImpostos - sumDescontos;

                sumLiquida = sumLiquida.toFixed(4);
                sumLiquidaQuatroDig = sumLiquidaQuatroDig.toFixed(4);

                var diferenca = parseFloat(sumLiquidaQuatroDig) - parseFloat(sumLiquida);
                objPedido.somaTotalLiquido = (diferenca > 0 && diferenca < 0.04) ? sumLiquida : sumLiquidaQuatroDig;

                objPedido.fin_doc_vlr_liquido = objPedido.somaTotalLiquido;
                objPedido.fin_doc_vlr_frete = sumFretes;
                objPedido.fin_doc_vlr_seguro = sumSeguros;
                objPedido.fin_doc_vlr_despesas = sumFretes + sumDespesas + sumSeguros;
                objPedido.fin_doc_vlr_descontos = sumDescontos;
                objPedido.fin_doc_vlr_contabil = sumContabil;

                return $scope.getParcelasGerarPedidos(objPedido);
            };

            /**
             * Método responsável em efetuar o parcelamento do pedido ou da prestação de serviço
             * de acordo com o orçamento selecionado pelo usuário.
             */
            $scope.getParcelasGerarPedidos = function (objPedido) {

                var isParcelado = parseInt(objPedido.fin_av_ap);
                if (isParcelado === 1 && objPedido.parcelas.length) {

                    var objParcelas = [], qtdeParcelas = objPedido.parcelas.length;
                    var somaLiquida = parseFloat(objPedido.somaTotalLiquido).toFixed(2) / qtdeParcelas;

                    angular.forEach(objPedido.parcelas, function (valor, chave) {

                        delete valor.tit_fatura_seq;
                        delete valor.tit_2070_cod_transp;
                        delete valor.tit_dat_alt;
                        delete valor.tit_dat_cadastro;
                        delete valor.tit_dat_cancelamento;
                        delete valor.tit_dat_lan;
                        delete valor.tit_dat_pgt;
                        delete valor.tit_fatura_nro;
                        delete valor.tit_fatura_seq;
                        delete valor.tit_fin_nro_lan;

                        objPedido.parcelas[chave].tit_doc_vlr_bruto = somaLiquida;
                        objPedido.parcelas[chave].tit_doc_vlr_liquido = somaLiquida;

                        objParcelas.push({
                            'tit_dat_vct': valor.tit_dat_vct,
                            'tit_doc_vlr_liquido': valor.tit_doc_vlr_liquido,
                            'tit_5010_conta_fin': valor.tit_5010_conta_fin,
                            'tit_6060_forma_pagamento': valor.tit_6060_forma_pagamento
                        });
                    });

                    objPedido.itens_parcelas = objParcelas;

                } else {

                    objPedido.parcelas = [];
                    objPedido.itens_parcelas = [];
                }

                return objPedido;
            };

            /**
             * Método responsável em configurar o objeto para salvar os dados de um novo pedido
             * ou prestação de serviço a partir de um orçamento escolhido pelo usuário.
             */
            $scope.getObjetoGerarPedidos = function (codNatureza) {

                var objPedido = angular.copy($scope.venda);

                // Valores que são comuns para ambas as naturezas:
                objPedido.acao = 0;
                objPedido.fin_cod_acao = 0;
                objPedido.fin_6035_situacao = 0;
                objPedido.fin_6030_esp_doc = 10;
                objPedido.fin_6020_natureza = codNatureza;
                objPedido.codNatureza = codNatureza;

                // Dados relativos a natureza de venda:
                if (codNatureza === 1) {

                    objPedido.op = 'venda';
                    objPedido.fin_observacao = getObservacao(objPedido) +
                        'Venda oriunda do orçamento de número: ' + objPedido.fin_doc_nro;
                }

                // Dados relativos a natureza de prestação de serviço:
                if (codNatureza === 31) {

                    objPedido.op = 'prest-servico';
                    objPedido.fin_observacao = getObservacao(objPedido) +
                        'Prestação de serviço oriunda do orçamento de número: ' + objPedido.fin_doc_nro;
                }

                function getObservacao(objVenda) {
                    return (objVenda.fin_observacao) ? objVenda.fin_observacao.trim() + ' ** ' : '';
                }

                objPedido.fin_doc_nro = 0;
                objPedido = clearObjeto(objPedido);

                function clearObjeto(objeto) {

                    delete objeto.fin_nro_lan;
                    delete objeto.centroCustoSelect;
                    delete objeto.codSituacao;
                    delete objeto.contaFinanceiraSelect;
                    delete objeto.fin_6025_fase;
                    delete objeto.fin_carga;
                    delete objeto.fin_cod_origem_local;
                    delete objeto.fin_cod_sinc;
                    delete objeto.fin_comentario;
                    delete objeto.fin_conteudo;
                    delete objeto.fin_cup_nro_cup;
                    delete objeto.fin_dat_alt;
                    delete objeto.fin_dat_cadastro;
                    delete objeto.fin_dat_cancelamento;
                    delete objeto.fin_eh_marcado;
                    delete objeto.fin_faturado;
                    delete objeto.fin_inf_complementar;
                    delete objeto.fin_nfe_chave;
                    delete objeto.fin_nfe_lote;
                    delete objeto.fin_nfe_motivo;
                    delete objeto.fin_nfe_recibo;
                    delete objeto.fin_nome_conta_financeira;
                    delete objeto.fin_nome_natureza;

                    return objeto;
                }

                return objPedido;
            };


            /**
             * Método responsável em editar/inserir um determinado transporte para a
             * transportadora escolhida na venda/compra.
             */
            $scope.getJanelaTransporte = function () {

                var scope = $rootScope.$new();
                scope.params = {};
                scope.params.objVenda = $scope.venda;

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'venda/views/janela-transporte.html',
                    controller: 'VendaTransporteModalCtrl',
                    size: 'md',
                    windowClass: 'center-modal no-top-modal',
                    scope: scope,
                    resolve: {}
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {
                    if (msg === 'cancel') {
                        if (modalInstance.hasAlteracao) {

                            $timeout(function () {
                                $scope.venda.transporte = modalInstance.objTransporte;
                                scope.$destroy();
                            });
                        }
                    }
                });
            };

            /**
             * Método responsável em verificar se os valores das parcelas estão iguais ao
             * valor total da venda escolhida pelo usuário.
             */
            $scope.verificarParcelamento = function () {

                if ($scope.venda.fin_av_ap === 1 && $scope.hasEditParcela) {

                    var totalizacao = 0, mensagem = '', arrPacelasZeradas = [];
                    angular.forEach($scope.venda.parcelas, function (item) {

                        var vlrParcela = parseFloat(item.tit_doc_vlr_liquido);
                        totalizacao = totalizacao + vlrParcela;

                        if (vlrParcela === 0) {
                            arrPacelasZeradas.push(item);
                        }
                    });

                    if (arrPacelasZeradas.length) {

                        mensagem = 'Uma parcela se encontra com o valor zerado, por favor altere o valor da mesma para prosseguir!';
                        return {
                            'flag': true,
                            'msg': mensagem
                        };
                    } else {

                        var vlrLiquido = parseFloat($scope.venda.somaTotalLiquido);

                        totalizacao = parseFloat(totalizacao.toFixed(2));
                        if (vlrLiquido !== totalizacao) {

                            mensagem = 'O valor total da ' + $scope.venda.nomeNaturezaSing + ' não corresponde ao valor total das parcelas!';
                            return {
                                'flag': true,
                                'msg': mensagem
                            };
                        }
                    }
                }

                return {'flag': false};
            };

            /**
             * Abre a janela para que um arquivo xml seja selecionado.
             */
            // $scope.getJanelaInutilizar = function () {
            //
            //     var scope = $rootScope.$new();
            //     scope.params = $scope.venda;
            //
            //     var modalInstance = $uibModal.open({
            //         animation   :  true,
            //         templateUrl : 'venda/views/janela-atributo.html',
            //         controller  : 'VendaAtributoCtrl', //está no arquivo VendaModalCtrl.js
            //         size        : 'md',
            //         windowClass : 'center-modal no-top-modal',
            //         scope       :  scope,
            //         resolve     :  {
            //
            //         }
            //     });
            //
            //     modalInstance.result.then(function(id) { }, function(msg) {
            //
            //         //caso a nota tenha sido importada, dá um refresh na lista com as operações.
            //         if(modalInstance.notaImportada){
            //
            //             //$scope.listarVendas();
            //         }
            //     });
            // };

            /**
             * Efetua a limpeza do dropdown de usuários contido na parte de filtro
             * na tela de operações.
             */
            $scope.limparUsuarioFiltro = function ($event) {

                $event.stopPropagation();
                $scope.pesquisarVenda.fin_usu_cod_usuario = '';
            };

            /**
             * Efetua a limpeza do dropdown de vendedores contido na parte de filtro
             * na tela de operações.
             */
            $scope.limparVendedorFiltro = function ($event) {

                $event.stopPropagation();
                $scope.pesquisarVenda.vendedor = '';
            };

            /**
             * Método responsável em abrir uma janela modal contendo as opçoes para
             * geraçao do relatório de operações.
             */
            $scope.getJanelaRelatorio = function () {

                var objFiltro = $scope.filtroPesquisarVenda();

                objFiltro['ken'] = AuthTokenFactory.getToken();
                objFiltro['op_natureza'] = $scope.venda.op;
                objFiltro['cod_natureza'] = $scope.venda.codNatureza;
                objFiltro['desc_natureza'] = $scope.venda.nomeNatureza;

                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.objFiltro = objFiltro;

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'venda/views/janela-relatorio.html',
                    controller: 'VendaRelatorioModalCtrl',
                    size: 'md',
                    windowClass: 'center-modal no-top-modal',
                    scope: scope,
                    resolve: {}
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {
                    if (msg === 'cancel') {

                        $timeout(function () {
                            scope.$destroy();
                        });
                    }
                });
            };

            /**
             * Método responsável em gerar o relatório contendo a lista de operações.
             */
            $scope.gerarRelatorio = function () {

                var objFiltro = $scope.filtroPesquisarVenda();

                objFiltro['ken'] = AuthTokenFactory.getToken();
                objFiltro['op_natureza'] = $scope.venda.op;
                objFiltro['cod_natureza'] = $scope.venda.codNatureza;
                objFiltro['desc_natureza'] = $scope.venda.nomeNatureza;

                var strFiltro = GeralFactory.formatarPesquisar(objFiltro);
                if (objFiltro) {

                    var url = GeralFactory.getUrlApi() + '/erp/export/operacao/?' + strFiltro;
                    $timeout(function () {
                        $window.open(url, 'Relatório');
                    }, 50);
                }
            };

            /**
             * Duplica uma informação com base nos dados da operação selecionada
             */
            $scope.duplicarOperacao = function () {

                var novaVendaAux, novaVenda, novoCliente, scope, modalInstance;

                novaVendaAux = angular.copy($scope.venda);
                novaVenda    = $scope.limpaDadosParaNovaOperacao(novaVendaAux);
                novoCliente  = $scope.cliente;

                scope = $rootScope.$new();

                novaVenda.fin_6035_situacao = 0;
                novaVenda.fin_cod_acao = 0;

                scope.params = {
                    'venda'   : novaVenda,
                    'cliente' : novoCliente
                };

                modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'venda/views/janela-duplicar-operacao.html',
                    controller: 'VendaDuplicaarOperacaoCtrl',
                    size: 'md',
                    windowClass: 'center-modal no-top-modal',
                    scope: scope,
                    resolve: {}
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {
                    if (msg === 'cancel') {

                        $timeout(function () {
                            scope.$destroy();
                        });
                    }
                    // else {
                    //
                    //     $scope.resetVars();
                    //     $scope.listarVendas();
                    // }
                });
            };


            /**
             * Limpa os dados que não são necessários em
             * uma operação nova, para duplicar ou gerar
             * venda do orçamento
             */
            $scope.limpaDadosParaNovaOperacao = function (novaVenda) {

                novaVenda.acao = 0;

                novaVenda.fin_6035_situacao = 0;
                novaVenda.fin_cod_acao      = 0;
                novaVenda.fin_doc_nro       = 0;
                novaVenda.fin_av_ap         = 0;
                novaVenda.fin_6030_esp_doc  = 10;
                novaVenda.fin_dat_lan       = GeralFactory.getDataAtualBr();

                delete novaVenda.fin_nro_lan;
                delete novaVenda.centroCustoSelect;
                delete novaVenda.codSituacao;
                delete novaVenda.contaFinanceiraSelect;
                delete novaVenda.fin_6025_fase;
                delete novaVenda.fin_carga;
                delete novaVenda.fin_cod_origem_local;
                delete novaVenda.fin_cod_sinc;
                delete novaVenda.fin_comentario;
                delete novaVenda.fin_conteudo;
                delete novaVenda.fin_cup_nro_cup;
                delete novaVenda.fin_dat_alt;
                delete novaVenda.fin_dat_emi;
                delete novaVenda.fin_dat_lan;
                delete novaVenda.fin_dat_sai;
                delete novaVenda.fin_dat_cadastro;
                delete novaVenda.fin_dat_cancelamento;
                delete novaVenda.fin_eh_marcado;
                delete novaVenda.fin_faturado;
                delete novaVenda.fin_inf_complementar;
                delete novaVenda.fin_nfe_chave;
                delete novaVenda.fin_nfe_lote;
                delete novaVenda.fin_nfe_motivo;
                delete novaVenda.fin_nfe_recibo;
                delete novaVenda.fin_nome_conta_financeira;
                delete novaVenda.fin_nome_natureza;
                delete novaVenda.fin_nfe_motivo;
                delete novaVenda.fin_nfe_chave;
                delete novaVenda.somaTotalLiquido;
                delete novaVenda.fin_nome_situacao;

                return novaVenda;
            };

            /**
             * Método responsável por gerar uma venda a partir de um orçamento
             * @deprecated
             */
            $scope.geraPedidoVenda = function () {

                var labelOperacao = $scope.venda.codNatureza == 1 ? 'Venda' : 'Orçamento';

                GeralFactory.confirmar('Deseja replicar essas informações para um(a) novo(a) ' + labelOperacao + ' ?', function () {

                    $scope.salvarVendaLoading = true;

                    //seta os valores para uma venda
                    $scope.venda.fin_observacao = $scope.venda.fin_observacao + ' **' + labelOperacao + ' de origem nº ' + $scope.venda.fin_doc_nro;
                    $scope.venda.acao = 0;
                    $scope.venda.descAcao = 'edição';
                    $scope.venda.tipoNatureza = 'venda';
                    $scope.venda.nomeNatureza = 'Vendas';
                    // $scope.venda.nomeNaturezaSing = 'Venda';
                    $scope.venda.op = 'venda';
                    $scope.venda.explModulo = 'suas vendas';
                    $scope.venda.fin_6030_esp_doc = 10;
                    $scope.venda.codNatureza = 1;
                    $scope.venda.fin_6020_natureza = 1;
                    $scope.venda.fin_cod_acao = 0;

                    //veifica se o financeiro é a vista ou a prazo
                    if (!$scope.venda.fin_av_ap == 1) {

                        //se for a vista, zera os valores referentes ao parcelamento
                        $scope.venda.parcelas = [];
                        $scope.venda.itens_parcelas = [];
                        $scope.venda.selectedParcela = [];
                    } else {

                        //no caso de ser a prazo, zera os indices das parcelas para que um novo
                        //parcelamento seja feito com os dados da nova venda
                        angular.forEach($scope.venda.itens_parcelas, function (itens_parcelas, j) {

                            delete itens_parcelas.tit_fatura_seq;
                        });

                        angular.forEach($scope.venda.parcelas, function (parcelas, j) {

                            delete parcelas.tit_fatura_seq;
                            delete parcelas.tit_2070_cod_transp;
                            delete parcelas.tit_dat_alt;
                            delete parcelas.tit_dat_cadastro;
                            delete parcelas.tit_dat_cancelamento;
                            delete parcelas.tit_dat_lan;
                            delete parcelas.tit_dat_pgt;
                            delete parcelas.tit_fatura_nro;
                            delete parcelas.tit_fatura_seq;
                            delete parcelas.tit_fin_nro_lan;
                        });

                    }

                    //remove os campos que precisam ser criados para uma nova venda
                    $scope.limpaDadosParaNovaOperacao();

                    //chama o método para criar a venda
                    VendaService.vendas.create($scope.venda, function (resposta) {

                        $scope.salvarVendaLoading = false;

                        if (!resposta.records.error) {

                            GeralFactory.notify('success', 'Sucesso:', 'Venda criada com sucesso!');
                            $scope.arrFase = [];
                            $scope.arrUsuarios = [];
                            $scope.resetVars();

                            //$scope.listarFase();
                            $scope.nomeBotao = 'Cancelar';
                            $scope.setAbaInicial();

                            $scope.venda.fin_6020_natureza = $scope.venda.codNatureza;
                            $scope.flagTutorial = true;

                            //$scope.hasBoleto();
                            // $scope.getVendedor();
                            // $scope.getCentroCusto();
                            // $scope.getFormaPagamento();
                            // $scope.getContaFinanceira();
                            $scope.listarParams();
                            $scope.getUsuarios();
                            $scope.listarVendas();
                        }
                    });
                });
            };

            /**
             * Abre a janela para que um arquivo xml seja selecionado.
             */
            $scope.getJanelaImportaArquivoXML = function () {

                var scope = $rootScope.$new();
                scope.params = $scope.venda;

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'venda/views/janela-importa-xml.html',
                    controller: 'VendaImportaXMLModalCtrl', //está no arquivo VendaModalCtrl.js
                    size: 'md',
                    windowClass: 'center-modal no-top-modal',
                    scope: scope,
                    resolve: {}
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {

                    //caso a nota tenha sido importada, dá um refresh na lista com as operações.
                    if (modalInstance.notaImportada) {

                        $scope.listarVendas();
                    }
                });
            };

            $scope.iniciaDragAndDrop = function () {
                $scope.dropzoneConfig = {
                    'options': {
                        'url': MidiaService.urlDragandDrop,
                        'headers': {
                            'Authorization': 'Bearer ' + AuthTokenFactory.getToken()
                        },
                        'clickable': false,
                        'acceptedFiles': '.xml',
                        'params': {
                            'tipo_emissao': 'T',
                            'natureza': $scope.venda.codNatureza
                        },
                        'dictInvalidFileType': 'Apenas arquivos XML são aceitos!'
                    },

                    'eventHandlers': {
                        'sending': function (file, formData, xhr) {
                            //console.log('sending')
                        },
                        'success': function (file, response) {
                            //console.log('success', 'file', file, 'response', response)
                            $scope.trataRetornoDragandDrop(response)
                        }
                    }
                };
            };

            $scope.trataRetornoDragandDrop = function (response) {

                if (!response.records.error) {

                    var scope = $rootScope.$new();
                    scope.params = response.records;

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'venda/views/janela-visualiza-xml.html',
                        controller: 'VendaImportaNFeModalCtrl',
                        scope: scope,
                        size: 'lg',
                        windowClass: 'center-modal no-top-modal',
                        resolve: {
                            getEnd: function () {
                            }
                        }
                    });

                    modalInstance.result.then(function (id) {
                    }, function (msg) {

                        if (modalInstance.notaImportada) {

                            $scope.listarVendas();
                        }
                    });

                } else {

                    GeralFactory.notify('danger', response.records.title, response.records.msg);
                    $scope.importaxmlLoading = false;
                }
            };

            /**
             * Imprime a NFSe com o nosso layout de impressão
             */
            $scope.imprimirNfse = function () {

                if ($scope.venda.fin_nro_lan) {

                    var strFiltro = GeralFactory.formatarPesquisar({
                        'fin_nro_lan' : $scope.venda.fin_nro_lan,
                        'fin_doc_nro' : $scope.venda.fin_doc_nro,
                        'ken'         : AuthTokenFactory.getToken()
                    });

                    var url = GeralFactory.getUrlApi() + '/erp/export/imprime-nfse/?' + strFiltro;
                    $window.open(url, 'NFSe - '+$scope.venda.fin_nro_lan);

                } else {

                    var mensagem = 'Para efetuar a impressão é necessário escolher um Serviço na listagem!';
                    GeralFactory.notify('warning', 'Atenção!', mensagem);

                }
            };


            /**
             * Gera uma nota de complemento de valores com base nos dados da operação selecionada
             */
            $scope.gerarNotaComplemento = function () {

                //console.log('$scope.venda antes', $scope.venda);

                GeralFactory.confirmar('Deseja gerar uma nota de complemento para a NFe ' + $scope.venda.fin_doc_nro + '?', function () {


                    ProdutoService.produto.getComplementoImposto(function(retorno) {

                        //console.log('retorno getComplementoImposto', retorno.records);
                    });

                    var novaVendaBkp, novaVenda, novoCliente, scope, modalInstance;

                    novaVenda    = angular.copy($scope.venda);
                    novaVendaBkp = angular.copy($scope.venda);
                    novoCliente  = angular.copy($scope.cliente);
                    novaVenda    = $scope.limpaDadosParaNovaOperacao(novaVenda);

                    //console.log('novaVendaBkp', novaVendaBkp);

                    //Limpa os itens da vednda e leva o usuário para a tela de itens:
                    novaVenda.itens = [];
                    angular.element('.sf-nav-step-1').click();

                    //Limpa a venda
                    $scope.venda = {};

                    $timeout(function () {

                        $scope.venda = novaVenda;

                        $scope.venda.fin_nome_situacao       = 'Documento Pendente';
                        $scope.venda.fin_nfe_origem          = novaVendaBkp.fin_doc_nro;
                        $scope.venda.fin_nfe_finalidade      = 2; //NFe complementar
                        $scope.venda.disabled                = false;
                        $scope.venda.fin_dat_lan             = GeralFactory.getDataAtualBr();
                        $scope.venda.obs_chave               = novaVendaBkp.fin_nfe_chave;
                        $scope.venda.fin_modelo_referenciada = 3; //FIN_TIP_OBS_NFE_COMPLEMENTAR

                        $scope.setNomeOperacao();

                        //console.log('$scope.venda', $scope.venda);
                    })
                });
            };

            /**
             * Exibe o flag informando que o estoque minimo foi atingido
             */
            $scope.comparaEstoqueMinimo = function () {

                if($scope.newItem.pro_estoque_minimo) {
                    var saldoRemanecente;

                    $scope.atingiuEstoqueMinimo = false;

                    saldoRemanecente = parseFloat($scope.newItem.pro_estoque) - parseFloat($scope.newItem.ite_pro_qtd);

                    if (saldoRemanecente <= $scope.newItem.pro_estoque_minimo) {

                        $scope.atingiuEstoqueMinimo = true;
                    }
                }
            };

            /**
             * Busca e retorna o cfop padrão da empresa para a natureza passada
             * @param codNat
             */
            $scope.setCfopPadraoOperacao = function (codNat) {

                var strCod = '1|6020|'+ codNat +'||';

                //obtem a descriçao e codigo do cfop padrao. Cada empresa pode ter o seu padrao
                ParamsService.getParametro(strCod, function (data) {
                    //console.log('getParametro:',data);
                    if (data) {
                        if (data.par_i01) {
                            return ($scope.cliente.endereco.end_endereco_cod_uf != $scope.empresa.emp_cod_uf) ? data.par_i02 : data.par_i01;
                        }
                    }
                });
            }
        }
    ]);