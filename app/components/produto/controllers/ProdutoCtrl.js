'use strict';

angular.module('newApp')

    .controller('ProdutoCtrl', [

        '$scope', '$rootScope', '$location', '$uibModal', '$timeout', '$window', 'ProdutoService', 'EmpresaService', 'GeralFactory', 'AuthTokenFactory', 'ClienteService', 'Constantes', 'StaticFactories', 'Storage', 'prompt', '$controller', 'Wizard', 'MidiaService', 

        function($scope, $rootScope, $location, $uibModal, $timeout, $window, ProdutoService, EmpresaService, GeralFactory, AuthTokenFactory, ClienteService, Constantes, StaticFactories, Storage, prompt, $controller, Wizard, MidiaService) {

            $rootScope.hasAutorizacao();

            if (! $rootScope.getPermissao('15')) {
                $location.path('/');
            }

            $scope.forms = {};

            $scope.arrMarcacoes  = [];
            $scope.arrParametros = [];

            $scope.$on('$viewContentLoaded', function() {
                $scope.produto = {
                    cor                      : '#CCCEEE',
                    pro_unidade              : 'UN',
                    equivalentes             :  { },
                    pro_eh_inativo_aux       : true,
                    pro_eh_inventariavel_aux : true,
                    pro_tip_unidade          :  1,
                    arr_estampa              :  [ ]
                };

                $scope.pesquisaProduto = {
                    'pro_status'   : 'T',
                    'pro_flag_ncm' : 'T',
                    'pro_flag_mid' : 'T'
                };

                $scope.produtoCopy      = { };
                $scope.fornecedorEqv    = { };
                $scope.arrProdutos      = [ ];
                $scope.objFornecedorEqv = [ ];

                $scope.eye            = 'eye';
                $scope.nomeBotao      = 'Cancelar';
                $scope.nomeMedida     = 'Unidade';
                $scope.nomeCorEstampa = 'Cores';
                $scope.flagTutorial   =  true;
                $scope.hasFilter      =  false;
                $scope.flagListAll    =  false;
                $scope.flagEmissor    =  $rootScope.getPermissaoSolRestrita('10');
                $scope.flagEcommerce  =  $rootScope.getPermissaoSolRestrita('7');
                $scope.frstTime = true;

                /**
                 * console.log('Apenas Emissor: ', $scope.flagEmissor);
                 * console.log('Apenas E-commerce: ', $scope.flagEcommerce);
                 */

                $scope.setLabelTitular();
                $scope.listarObjetosTela();

                if ($rootScope.getPermissaoSol('7')) {
                    $scope.produto.pro_eh_visivel_web_aux = true;
                }

                var dragCtrl = $scope.$new();
                $controller('DropzoneCtrl', {
                    $scope : $scope,
                    $rootScope: $rootScope,
                    AuthTokenFactory: AuthTokenFactory,
                    MidiaService: MidiaService,
                    $window: $window,
                    $timeout: $timeout,
                    GeralFactory: GeralFactory
                });
                dragCtrl.setDropzone('produto');

                $scope.modelType = 'produto';

                $timeout(function () {
                    Wizard.loadWizards.initialize(15);
                }, 2000);
            });


            /**
             * Regras a serem efetuadas dependendo do tipo da página: Produto ou Serviço.
             */
            $scope.setLabelTitular = function() {

                $scope.tipo_coluna = 1;
                $scope.setAbaInicial(1);
                $scope.initCKeditor();
                $scope.produto.tipo_pro_ser = $location.$$path.replace('/', '');

                /**
                 * Atenção: verifica o regime de tributação da empresa:
                 */
                if ($rootScope.objUsuario.emp.emp_reg_trib === 4 ||
                        $rootScope.objUsuario.emp.emp_reg_trib === 5 ||
                            $rootScope.objUsuario.emp.emp_reg_trib === 6) {

                    $scope.flgCst = true;

                } else {

                    $scope.flgCsosn = true;
                }

                if ($scope.produto.tipo_pro_ser === 'produto') {

                    $scope.pro_eh_servico =  0;
                    $scope.siglaTutorial  = 'PRO';
                    $scope.labelTutorial  = 'Cadastro de novos produtos';

                    $scope.objBundleTela = {
                        'B000'   : 'Não é possível excluir este produto, pois já existe movimentação. Deseja inativá-lo?',
                        'B001'   : 'Deseja remover o produto escolhido?',
                        'B002'   : 'Deseja escolher outra categoria para o produto ',
                        'B003'   : 'Salve antes de prosseguir.',
                        'B004'   : 'Caro usuário, a listagem dos produtos já se encontra completa!',
                        'B005'   : 'Favor informar o NCM e/ou CST/CSO na aba de impostos.',
                        'B006'   : 'Deseja duplicar o produto escolhido?',
                        'labels' : {
                            'L001' : 'produtos',
                            'L002' : 'produto',
                            'L003' : 'Pesquisar produtos...',
                            'L004' : ($scope.flagEmissor === false) ? 'Preços e Estoque' : 'Preços', 
                            'L005' : 'Duplicar produto'
                        }
                    };

                } else if ($scope.produto.tipo_pro_ser === 'servico') {

                    $scope.pro_eh_servico =  1;
                    $scope.siglaTutorial  = 'SER';
                    $scope.labelTutorial  = 'Cadastro de novos serviços';

                    $scope.flgCst   = false;
                    $scope.flgCsosn = false;

                    $scope.objBundleTela = {
                        'B000'   : 'Não é possível excluir este serviço, pois já existe movimentação. Deseja inativá-lo?',
                        'B001'   : 'Deseja remover o serviço escolhido?',
                        'B002'   : 'Deseja escolher outra categoria para o serviço ',
                        'B003'   : 'Salve antes de prosseguir.',
                        'B004'   : 'Caro usuário, a listagem dos serviços já se encontra completa!',
                        'B005'   : 'Favor informar o CNAE deste serviço.',
                        'B006'   : 'Deseja duplicar o serviço escolhido?',
                        'labels' : {
                            'L001' : 'serviços',
                            'L002' : 'serviço',
                            'L003' : 'Pesquisar serviços...',
                            'L004' : 'Preços',
                            'L005' : 'Duplicar serviço'
                        }
                    };

                } else {

                    $location.path('/');
                }
            };


            /**
             * Método responsável em listar todos os objetos da tela.
             */
            $scope.listarObjetosTela = function() {

                $scope.arrOrigem = StaticFactories.CST1;
                $scope.arrCst    = StaticFactories.CST2;
                $scope.arrCsosn  = StaticFactories.CSOSN2;

                $timeout(function() {

                    ProdutoService.produtos.getDados({u : 'q=(mar_tab:1)'}, function(retorno) {
                        if (retorno.records) {

                            var arrAuxiliar = [];
                            if (retorno.records.arr_marcacoes.length) {

                                var arrMarcacoes = retorno.records.arr_marcacoes;
                                angular.forEach(arrMarcacoes, function(item) {
                                    arrAuxiliar.push({
                                        name                : item.mar_descricao_marca,
                                        mar_descricao_marca : item.mar_descricao_marca,
                                        mar_cod_marca       : item.mar_cod_marca
                                    });
                                });
                            }

                            $scope.arrMarcacoes  = arrAuxiliar;
                            $scope.arrProdutoGrupoFiltro = retorno.records.arr_categorias;

                            $scope.arrParametros  = retorno.records.arr_parametros;
                            $scope.codBuscaPadrao = _.isEmpty($scope.arrParametros) ? 0 : parseInt($scope.arrParametros['par_i01']);

                            $scope.tipo_codigo = ($scope.codBuscaPadrao === 2) ? 'CB' : 'CN';
                        }
                    });

                    $timeout(function() {

                        $scope.listarTipoProducao();
                        $scope.triggerListarMovimentacao();
                        $scope.listarProdutos();

                    }, 800);
                });
            };


            /**
             * Método responsável em preparar o gatilho para efetuar a listagem dos NCM
             * de um determinado produto escolhido pelo usuário.
             */
            $scope.triggerListarMovimentacao = function() {

                angular.element('#tab-produto-estoque a').click(function() {

                    if ($scope.produto.pro_cod_pro && _.isEmpty($scope.produto.arr_movimentacao)) {

                        var strFiltro = GeralFactory.formatarPesquisar({
                            'pro_cod_pro' : $scope.produto.pro_cod_pro
                        });

                        $rootScope.spinnerForm.on();
                        ProdutoService.estoque.getMovimentacaoEstoque({u : strFiltro}, function(retorno) {
                            if (retorno.records.length > 0) {

                                var arrMovimentacao = [];
                                if (! _.isEmpty($scope.produto.produto_saldo)) {

                                    var qtdeSaldo = $scope.produto.produto_saldo['sal_qtd_inicial'];
                                    arrMovimentacao.push({
                                        'fin_tip_emitente'  : '',
                                        'fin_doc_nro'       : '',
                                        'ite_fin_doc_nro'   : '',
                                        'ite_dat_lan'       : '',
                                        'ite_pro_qtd'       : qtdeSaldo,
                                        'ite_6020_natureza' : 99,
                                        'ite_vlr_uni_bruto' : '',
                                        'ite_vlr_tot_bruto' : '',
                                        'ite_cad_cod_cad'   : ''
                                    });
                                }

                                var arrRetorno = retorno.records;
                                arrMovimentacao.length && arrRetorno.unshift(arrMovimentacao[0]);

                                console.log('Movimentacao: ', arrRetorno);
                                $timeout(function() {

                                    $scope.produto.has_movimentacao = true;
                                    $scope.produto.arr_movimentacao = arrRetorno;

                                    $timeout(function() {

                                        $scope.verificarEstoque();
                                        $rootScope.spinnerForm.off();

                                    }, 1000);

                                }, 1000);

                            } else {

                                $scope.produto.arr_movimentacao = [];
                                $scope.produto.has_movimentacao = false;
                                $rootScope.spinnerForm.off();
                            }
                        });
                    }
                });
            };


            /**
             * Inicializa as configurações do CK Editor na aba Loja Virtual.
             */
            $scope.initCKeditor = function() {

                $scope.editorOptions = {
                    language     : 'pt_br',
                    uiColor      : '#e2e2e2',
                    height       : '200px',
                    extraPlugins : 'button,panelbutton,youtube,panel,floatpanel,colorbutton'
                };
            };


            /**
             * Método responsável em listar as marcações disponíveis para produtos e serviços.
             */
            $scope.listarMarcacoes = function() {
                ProdutoService.marcas.get({u : 'q=(mar_tab:1)'}, function(retorno) {

                    var arrMarcas = retorno.records, arrAuxiliar = [];
                    angular.forEach(arrMarcas, function(item) {
                        arrAuxiliar.push({
                            name                : item.mar_descricao_marca,
                            mar_descricao_marca : item.mar_descricao_marca,
                            mar_cod_marca       : item.mar_cod_marca
                        });
                    });

                    $scope.arrMarcacoes = arrAuxiliar;
                });
            };


            /**
             * Seta para aba principal ficar ativa
             */
            $scope.setAbaInicial = function(aba) {

                if (aba == 1) {

                    $scope.tabs = [{active:true}, {active:false}, {active:false}, {active:false}];

                } else if (aba == 2) {

                    $scope.tabs = [{active:false}, {active:true}, {active:false}, {active:false}];

                } else if (aba == 3) {

                    $scope.tabs = [{active:false}, {active:false}, {active:true}, {active:false}];

                } else if (aba == 4) {

                    $scope.tabs = [{active:false}, {active:false}, {active:false}, {active:true}];
                }
            };


            /**
             * Lista os tipos de produção.
             */
            $scope.listarTipoProducao = function() {

                if ($rootScope.getPermissaoSol('21')) {

                    $scope.arrTipProducao = [{
                        id   : 'I',
                        nome : 'Insumo'
                    }, {
                        id   : 'T',
                        nome : 'Terceiros'
                    }, {
                        id   : 'P',
                        nome : 'Própria'
                    }];

                } else {

                    $scope.arrTipProducao = [{
                        id   : 'T',
                        nome : 'Terceiros'
                    }, {
                        id   : 'P',
                        nome : 'Própria'
                    }];
                }

                $scope.arrTipEspecifico = [{
                    id   :  0,
                    nome : 'Normal'
                }, {
                    id   :  1,
                    nome : 'Veículo'
                }, {
                    id   :  2,
                    nome : 'Medicamentos'
                }];

                $scope.arrTipSaldos = [{
                    id   : 'N',
                    nome : 'Negativos'
                }, {
                    id   : 'P',
                    nome : 'Positivos'
                }, {
                    id   : 'T',
                    nome : 'Todos'
                }, {
                    id   : 'Z',
                    nome : 'Zerados'
                }];
            };


            /**
             * Obtém dados de uma determinado agrupamento ou lista todos os agrupamentos existentes.
             */
            $scope.listarAgrupamentos = function(agp_cod_agp) {

                if (agp_cod_agp) {

                    ProdutoService.agrupamentos.get({u : agp_cod_agp}, function(retorno) {
                        $scope.objAgrupamento          = retorno.records;
                        $scope.produto.pro_agp_cod_agp = agp_cod_agp;
                    });
                } else {

                    ProdutoService.produtoAgrupamentos.get({u : ''}, function(retorno) {
                        $scope.arrAgrupamento = retorno.records;
                    });
                }
            };


            /**
             * Troca a medida no formulário de produto.
             */
            $scope.trocarMedida = function() {

                if ($scope.nomeMedida == 'Unidade') {

                    $scope.nomeMedida = 'Fração';
                    $scope.produto.pro_tip_unidade = 2;

                } else {

                    $scope.nomeMedida = 'Unidade';
                    $scope.produto.pro_tip_unidade = 1;
                }
            };


            /**
             * Troca o código da listagem de produtos.
             */
            $scope.trocarCodigo = function() {

                $scope.tipo_codigo = ($scope.tipo_codigo === 'CN') ? 'CB' : 'CN';
            };


            /**
             * Método responsável em alterar a visualização dos componentes de cor ou estampa
             * contidos na aba de loja virtual na tela de produtos.
             */
            $scope.trocarCorEstampa = function() {

                $scope.nomeCorEstampa = ($scope.nomeCorEstampa == 'Cores') ? 'Estampa' : 'Cores';
            };


            /**
             * Método responsável em inicializar a informação de visibilidade do produto
             * na página de categorias na loja virtual.
             */
            $scope.setVisibilidade = function() {

                $scope.eye = ($scope.eye === 'eye') ? 'eye-slash' : 'eye';
            };


            /**
             * Limpa o formulário de produtos e prepara para cadastrar um novo.
             */
            $scope.novoProduto = function() {

                $scope.setAbaInicial(1);
                $scope.initCKeditor();
                $scope.forms.formProduto.$setPristine();

                $scope.produto = {
                    pro_eh_inativo_aux       : true,
                    pro_eh_inventariavel_aux : true,
                    pro_tip_unidade          :  1,
                    pro_cs_origem            :  0,
                    pro_tip_especifico       :  0,
                    pro_unidade              : 'UN',
                    pro_cor_1                : '',
                    pro_cor_2                : '',
                    arr_estampa              : [],
                    pro_especificacao        : ''
                };

                $scope.flagTutorial      =  false;
                $scope.nomeBotao         = 'Cancelar';
                $scope.nomeCorEstampa    = 'Cores';
                $scope.proCodProSelected = '';

                if ($rootScope.getPermissaoSol('7')) {
                    $scope.produto.pro_eh_visivel_web_aux = true;
                }
            };


            /**
             * Exclui um produto ou cancela a inclusão de um mesmo.
             */
            $scope.cancelarProduto = function() {

                if ($scope.produto.pro_cod_pro == null) {

                    $scope.novoProduto();

                } else {

                    if ($scope.produto.has_movimentacao) {

                        GeralFactory.confirmar($scope.objBundleTela.B000, function() {

                            $scope.produto.pro_eh_inativo_aux = false;
                            $scope.salvarProduto();
                        });

                    } else {

                        GeralFactory.confirmar($scope.objBundleTela.B001, function() {

                            var objeto = {pro_cod_pro : $scope.produto.pro_cod_pro};
                            ProdutoService.produto.cancelar(objeto, function(retorno) {
                                if (! retorno.error) {

                                    $scope.listarProdutos();
                                    $scope.novoProduto();
                                }
                            });
                        });
                    }
                }
            };


            /**
             * Retorna um objeto contendo os dados para pesquisa de produtos e serviços.
             */
            $scope.filtroPesquisarProduto = function() {

                var objPesquisa = {
                    'pro_eh_servico'          : $scope.pro_eh_servico,
                    'pro_param_tipo'          : $scope.codBuscaPadrao,
                    'pro_gru_cod_gru'         : $scope.pesquisaProduto.categoria_produto_pesquisar,
                    'texto_produto_pesquisar' : $scope.pesquisaProduto.texto_produto_pesquisar,
                    'pro_status'              : $scope.pesquisaProduto.pro_status,
                    'pro_flag_ncm'            : $scope.pesquisaProduto.pro_flag_ncm,
                    'pro_flag_saldo'          : $scope.pesquisaProduto.pro_flag_saldo,
                    'pro_cso'                 : $scope.pesquisaProduto.pro_cso                 ? $scope.pesquisaProduto.pro_cso                 : '',
                    'pro_cst'                 : $scope.pesquisaProduto.pro_cst                 ? $scope.pesquisaProduto.pro_cst                 : '',
                    'pro_cod_marcacao'        : $scope.pesquisaProduto.pro_cod_marcacao        ? $scope.pesquisaProduto.pro_cod_marcacao        : '',
                    'pro_cod_pro_inicio'      : $scope.pesquisaProduto.pro_cod_pro_inicio      ? $scope.pesquisaProduto.pro_cod_pro_inicio      : '',
                    'pro_cod_pro_final'       : $scope.pesquisaProduto.pro_cod_pro_final       ? $scope.pesquisaProduto.pro_cod_pro_final       : '',
                    'pro_dat_cadastro_inicio' : $scope.pesquisaProduto.pro_dat_cadastro_inicio ? $scope.pesquisaProduto.pro_dat_cadastro_inicio : '',
                    'pro_dat_cadastro_final'  : $scope.pesquisaProduto.pro_dat_cadastro_final  ? $scope.pesquisaProduto.pro_dat_cadastro_final  : '',
                    'pro_tip_producao'        : $scope.pesquisaProduto.pro_tip_producao        ? $scope.pesquisaProduto.pro_tip_producao        : ''
                };

                if ($scope.pesquisaProduto.pro_flag_mid) {

                    var hasFotos = $scope.pesquisaProduto.pro_flag_mid;
                    if (hasFotos != 'T') {

                        console.log('Aplicar filtro de fotos para listagem de produtos!');
                        objPesquisa['pro_flag_mid'] = $scope.pesquisaProduto.pro_flag_mid;
                    }
                }

                return objPesquisa;
            };


            /**
             * Retorna uma lista de produtos ou serviços baseada na pesquisa efetuada pelo usuário.
             */
            $scope.getPesquisar = function(event) {

                if (! GeralFactory.inArray(event.which, Constantes.KEYS)) {
                    $timeout(function() {

                        $scope.flagListAll = false;
                        $scope.listarProdutos();

                    }, 500);
                }
            };


            /**
             * Método responsável em efetivar a pesquisa direto pelo botão de acordo com os filtros
             * aplicados pelo usuário através das opções disponibilizadas pelo formulário.
             */
            $scope.triggerPesquisar = function() {

                $timeout(function() {

                    angular.element('#trigger-filter').click();

                    $scope.flagListAll = false;
                    $scope.listarProdutos();
                });
            };


            /**
             * Efetua a listagem de todos os registros de produtos sem efetuar paginação.
             */
            $scope.listarTodosProdutos = function() {

                $timeout(function() {

                    $scope.flagListAll = true;
                    $scope.listarProdutos();
                });
            };


            /**
             * Retorna uma lista contedo os produtos ou serviços de um determinado usuário.
             */
            $scope.listarProdutos = function() {

                $rootScope.spinnerList.on();
                $scope.arrProdutos = [];

                var objFiltro = $scope.filtroPesquisarProduto();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=0');

                strFiltro = ($scope.flagListAll) ? '' : strFiltro;
                ProdutoService.produtos.getFast({u: strFiltro}, function(retorno) {
                    if($scope.frstTime){
                        $scope.isProdutoEmpty = retorno.records.length == 0;
                        $scope.frstTime = false;
                    }
                    
                    if (retorno.records.length > 0) {

                        $timeout(function() {
                            $scope.arrProdutos = retorno.records;
                            $rootScope.spinnerList.off();
                        });
                    } else {

                        $rootScope.spinnerList.off();
                    }
                });
            };


            /**
             * Método responsável efetuar a paginação dos produtos.
             */
            $scope.paginarProdutos = function() {

                $rootScope.spinnerList.on();

                var objFiltro = $scope.filtroPesquisarProduto();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=' + $scope.getOffset());

                ProdutoService.produtos.getFast({u: strFiltro}, function(retorno) {
                    if (retorno.records.length > 0) {

                        angular.forEach(retorno.records, function(item) {
                            $scope.arrProdutos.push(item);
                        });

                        $timeout(function() {
                            $rootScope.spinnerList.off();
                        });
                    } else {

                        $rootScope.spinnerList.off();
                        GeralFactory.notify('warning', 'Atenção:', $scope.objBundleTela.B004);
                    }
                });
            };


            /**
             * Retorna o limite de registros para a paginação.
             */
            $scope.getOffset = function() {

                return ($scope.arrProdutos.length) ? $scope.arrProdutos.length : 0;
            };


            /**
             * Determina o modo de visulização da tabela de produtos.
             */
            $scope.setColuna = function(codColuna) {

                $scope.tipo_coluna = parseInt(codColuna);
                GeralFactory.scrollToTop();
            };


            /**
             * Retorna um registro de produto ou serviço.
             */
            $scope.getProduto = function(pro_cod_pro) {

                $scope.proCodProSelected = pro_cod_pro;

                ProdutoService.produto.get({pro_cod_pro : pro_cod_pro}, function(retorno) {

                    $scope.initCKeditor();
                    $scope.marca      =  {};
                    $scope.produto    =  retorno.records;
                    $scope.nomeBotao  = 'Excluir';

                    $scope.eye        = ($scope.produto.pro_eh_visivel)       ? 'eye'    : 'eye-slash';
                    $scope.nomeMedida = ($scope.produto.pro_tip_unidade == 2) ? 'Fração' : 'Unidade';

                    $scope.produto.pro_cs_origem = ($scope.produto.pro_cs_origem === null) ? 0 : $scope.produto.pro_cs_origem;

                    $scope.produto.pro_eh_inativo_aux       = (retorno.records.pro_eh_inativo === 1)       ? false : true;
                    $scope.produto.pro_eh_visivel_web_aux   = (retorno.records.pro_eh_visivel_web === 1)   ? true : false;
                    $scope.produto.pro_eh_inventariavel_aux = (retorno.records.pro_eh_inventariavel === 1) ? true : false;

                    $scope.produto.produtoMarcas = [];
                    $scope.produto.proGruSelect  = retorno.records.produto_grupo.gru_descricao;

                    // Medidas que precisam ser convertidas:
                    if (retorno.records.produto_saldo) {

                        var saldo = retorno.records.produto_saldo.sal_atu_qtd_saldo;
                        $scope.produto.sal_atu_qtd_saldo = (GeralFactory.isInt(saldo)) ? parseInt(saldo) : saldo.replace('.', ',');
                    }

                    // Verificando o NCM do produto:
                    if ($scope.produto.pro_ncm && !$scope.produto.pro_eh_servico) {

                        var nroNCM = GeralFactory.formatarNCM($scope.produto.pro_ncm);
                        $scope.produto.pro_ncm = nroNCM;
                    }

                    // Verificando o peso bruto do produto escolhido:
                    $scope.produto.pro_peso_bruto = GeralFactory.formatarFloatBr(retorno.records.pro_peso_bruto);
                    $scope.produto.pro_peso_bruto = parseFloat($scope.produto.pro_peso_bruto.replace(',', '.'));

                    var strProdutoMarcas = 'q=(pma_cod_pro:' + pro_cod_pro + ')';
                    ProdutoService.produtoMarcas.get({u : strProdutoMarcas}, function(retorno) {

                        angular.forEach($scope.arrMarcacoes, function(item1) {
                            angular.forEach(retorno.records, function(item2) {
                                if (item1['mar_cod_marca'] == item2['pma_cod_marca']) {

                                    $scope.produto.produtoMarcas.push({
                                        name                : item1.mar_descricao_marca,
                                        mar_descricao_marca : item1.mar_descricao_marca,
                                        mar_cod_marca       : item1.mar_cod_marca
                                    });
                                }
                            });
                        });
                    });

                    // Verifica se o produto tem alguma imagem:
                    if (retorno.records.produto_imagem.length) {

                        var arrPrincipal = retorno.records.produto_imagem[0];
                        $scope.produto.imagem_principal = arrPrincipal;
                    }

                    // Verifica se o produto tem algum agrupamento:
                    if (retorno.records.produto_agrupamento) {

                        $scope.produto.pro_agp_cod_agp = retorno.records.produto_agrupamento.agp_cod_agp;
                        $scope.produto.agpProSelect    = retorno.records.produto_agrupamento.agp_descricao;
                    }

                    // Verifica se o produto possui equivalentes:
                    $scope.objFornecedorEqv = [];
                    if (retorno.records.produto_equivalentes) {

                        angular.forEach(retorno.records.produto_equivalentes, function(item) {

                            var auxiliar = [];
                            ClienteService.cliente.get({cad_cod_cad : item.eqv_cod_for}, function(retorno) {

                                auxiliar = retorno.records;
                                auxiliar.eqv_cod_equivalente = item.eqv_cod_equivalente;

                                $timeout(function() {
                                    $scope.objFornecedorEqv.push(auxiliar);
                                }, 300)
                            });
                        });
                    }

                    // Verifica se o produto tem alguma estampa ou cores:
                    $scope.nomeCorEstampa = 'Cores';
                    if ($scope.produto.arr_estampa.length) {

                        $scope.produto.pro_cor_2 = '';
                        $scope.produto.pro_cor_1 = '';
                        $scope.nomeCorEstampa    = 'Estampa';
                    }

                    if ($rootScope.objUsuario.emp.emp_reg_trib === 4 ||
                            $rootScope.objUsuario.emp.emp_reg_trib === 5 ||
                                $rootScope.objUsuario.emp.emp_reg_trib === 6) {

                        $scope.produto.pro_cso = 0;

                    } else {

                        $scope.produto.pro_cst = 0;
                    }

                    $scope.flagTutorial = false;
                    $scope.produtoCopy = angular.copy($scope.produto);
                });

                $scope.setAbaInicial(1);
            };


            /**
             * Adiciona a opção de uma nova marca para inserção no campo select do formulário.
             */
            $scope.tagTransform = function(newTag) {
                var item = {
                    name                : newTag,
                    mar_descricao_marca : newTag
                };
                return item;
            };


            /**
             * Método responsável em adicionar uma nova marca através do plugin de ui-select.
             */
            $scope.onSelectedMarcacao = function(item) {

                if (item.hasOwnProperty('isTag')) {

                    GeralFactory.confirmar('Deseja incluir a marcação em questão?', function() {

                        var objeto = {mar_descricao_marca : item.mar_descricao_marca, mar_tab : 1, mar_eh_vitrine : 0};
                        ProdutoService.marcas.create(objeto, function(resposta) {
                            if (! resposta.records.error) {
                                GeralFactory.notify('success', 'Sucesso!', 'Marcação cadastra com sucesso!');

                                item.mar_cod_marca = resposta.records.mar_cod_marca;
                                delete item['isTag'];

                                $scope.arrMarcacoes.push({
                                    name                : item.mar_descricao_marca,
                                    mar_descricao_marca : item.mar_descricao_marca,
                                    mar_cod_marca       : resposta.records.mar_cod_marca
                                });
                            }
                        });

                    }, 'Confirmação', function() {

                        var qtdeMarcas = $scope.produto.produtoMarcas.length;
                        if (qtdeMarcas > 0) {

                            var ultima = qtdeMarcas - 1;
                            $scope.produto.produtoMarcas.splice(ultima, 1);
                        }

                    }, 'Não', 'Sim');
                }
            };


            /**
             * Método responsável pela seleção dos dados de um determinado agrupamento pelo
             * componente de autocomplete contido na tela.
             */
            $scope.onSelectProdutoAgrupamento = function($item) {

                $scope.listarAgrupamentos($item.agp_cod_agp);
                $scope.produto.agpProSelect = $item.agp_descricao;
            };


            /**
             * Método responsável em adicionar um determinado agrupamento de forma direta pelo
             * componente de autocomplete contido na tela.
             */
            $scope.addProdutoAgrupamento = function($item) {

                var objAgrupamento = {
                    agp_descricao : $item.trim()
                };

                ProdutoService.agrupamentos.create(objAgrupamento, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.produto.agpProSelect    = $item.trim();
                        $scope.produto.pro_agp_cod_agp = retorno.records.agp_cod_agp;
                        $scope.listarAgrupamentos();
                    }
                });
            };


            /**
             * Retorna o registro de um determinado grupo(categoria)
             */
            $scope.getProdutoGrupo = function(gru_cod_gru) {

                ProdutoService.produtoGrupo.get({gru_cod_gru : gru_cod_gru}, function(data) {

                    $scope.produto.pro_gru_cod_gru = data.records.gru_cod_gru;
                });
            };


            /**
             * Método responsável em verificar os campos de tributação do produto antes
             * de salvar os dados do mesmo.
             */
            $scope.verificarTributos = function() {

                // Verificação apenas para as soluções de Gestão e Emissor NF-e:
                if ($rootScope.getPermissaoSolRestrita(2) || $rootScope.getPermissaoSolRestrita(10) ||
                        $rootScope.getPermissaoSol(2) || $rootScope.getPermissaoSol(10)) {

                    if ($scope.produto.pro_ncm === undefined || $scope.produto.pro_ncm === null || $scope.produto.pro_ncm === '') {
                        return false;
                    }

                    if ($scope.flgCst) {
                        if ($scope.produto.pro_cst === undefined || $scope.produto.pro_cst === null || $scope.produto.pro_cst === '') {
                            return false;
                        }
                    }

                    if ($scope.flgCsosn) {
                        if ($scope.produto.pro_cso === undefined || $scope.produto.pro_cso === null || $scope.produto.pro_cso === '') {
                            return false;
                        }
                    }
                }

                return true;
            };


            /**
             * Gatilho para salvar os dados do produto.
             */
            $scope.triggerSalvarProduto = function() {

                var form = $scope.forms.formProduto;
                if (form.$invalid) {

                    $scope.submitted = true;
                    console.log('Formulário: ', form.$invalid);

                } else {

                    var verificar = $scope.verificarTributos();
                    if (verificar) {

                        $scope.salvarProduto();

                    } else {

                        prompt({
                            message  : $scope.objBundleTela.B005,
                            buttons  : [{
                                label   : 'Sim',
                                primary : true,
                                value   : '1'
                            }]
                        }).then(function(result) {

                            if (result.value ==='1') {

                                // Caso esteja na tela de cadastro de serviço, seta o foco no campo do CNAE
                                if($scope.pro_eh_servico) {

                                    $scope.setAbaInicial(1);
                                    angular.element('#pro_ncm').focus();

                                } else {

                                    $scope.setAbaInicial(4);
                                }
                            }
                        });
                    }
                }
            };


            /**
             * Insere ou atualiza o produto
             */
            $scope.salvarProduto = function() {

                $scope.salvarProdutoLoading = true;

                // Parâmetro que define o produto o serviço:
                $scope.produto.pro_eh_servico = $scope.pro_eh_servico;

                // Monta o objeto de códigos equivalentes:
                if ($scope.objFornecedorEqv.length) {

                    var arrAuxiliar = [];
                    angular.forEach($scope.objFornecedorEqv, function(item) {
                        arrAuxiliar.push({
                            eqv_cod_pro         : $scope.proCodProSelected,
                            eqv_cod_equivalente : item.eqv_cod_equivalente,
                            eqv_cod_for         : item.cad_cod_cad
                        });
                    });

                    $scope.produto.equivalentes = arrAuxiliar;
                }

                // Verifica se o produto tem estampa ou cores:
                switch ($scope.nomeCorEstampa) {
                    
                    case 'Cores':
                        $scope.produto.arr_estampa = [];
                        break;

                    case 'Estampa':
                        if ($scope.produto.arr_estampa.length) {
                            var teste = $scope.produto.arr_estampa[0].mid_arq.split(".");

                            $scope.produto.pro_cor_1 = '@' + teste[0];
                            $scope.produto.pro_cor_2 = '';
                        }
                        break;
                }

                // Flags para verificar as situações do produto:
                $scope.produto.pro_eh_inventariavel = ($scope.produto.pro_eh_inventariavel_aux) ? 1 : 0;
                $scope.produto.pro_eh_visivel_web   = ($scope.produto.pro_eh_visivel_web_aux)   ? 1 : 0;
                $scope.produto.pro_eh_inativo       = ($scope.produto.pro_eh_inativo_aux)       ? 0 : 1;
                $scope.produto.pro_eh_visivel       = ($scope.eye === 'eye')                    ? 1 : 0;

                // Verificando a exitência do saldo:
                if ($scope.produto.produto_saldo) {

                    var saldo = $scope.produto.sal_atu_qtd_saldo;
                    $scope.produto.sal_atu_qtd_saldo = (GeralFactory.isInt(saldo)) ? parseInt(saldo) : saldo.replace(',', '.');
                }

                if ($scope.produto.pro_cod_pro) {

                    // Ajustando o peso do produto:
                    $scope.produto.pro_peso_bruto = $scope.produto.pro_peso_bruto.toString().replace('.', ',');

                    ProdutoService.produto.update($scope.produto, function(resposta) {
                        if (! resposta.records.error) {

                            $scope.listarProdutos();
                            $scope.getProduto($scope.produto.pro_cod_pro);
                        }

                        $scope.salvarProdutoLoading = false;
                    });
                } else {

                    $scope.setMedidasProduto();
                    ProdutoService.produtos.create($scope.produto, function(resposta) {

                        var codProduto = resposta.records.pro_cod_pro;
                        $scope.produto.pro_cod_pro = codProduto;

                        if (! resposta.records.error) {

                            $scope.getProduto(codProduto);
                            $scope.listarProdutos();
                        }

                        $scope.salvarProdutoLoading = false;
                    });
                }
            };


            /**
             * Inicializa o padrão de medidas para comprimento, altura, largura e
             * peso para um determinado produto.
             */
            $scope.setMedidasProduto = function() {

                $scope.produto.pro_peso_bruto         = '0,100';
                $scope.produto.pro_medida_altura      = 1;
                $scope.produto.pro_medida_largura     = 1;
                $scope.produto.pro_medida_comprimento = 1;
            };


            /**
             * Método responsável em abrir uma janela modal de seleção para uma
             * determinada categoria no produto escolhido pelo usuário.
             */
            $scope.getCategoria = function() {

                if ($scope.produto.pro_gru_cod_gru) {

                    var descProduto = ($scope.produto.pro_descricao_longa) ? $scope.produto.pro_descricao_longa : '';

                    GeralFactory.confirmar($scope.objBundleTela.B002 + descProduto + '?', function() {

                        $scope.openModalCategoria();
                    });
                } else {

                    $scope.openModalCategoria();
                }
            };


            /**
             * Método responsável em abrir a janela modal contendo todas as
             * categorias cadastradas no sistema.
             */
            $scope.openModalCategoria = function() {

                var scope = $rootScope.$new();
                scope.params = {};

                scope.params.tipo   = 'C';
                scope.params.entity = 'Categoria';

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'categoria-marca/views/janela-categoria-marca-selecao.html',
                    controller  : 'CategoriaMarcaSelecaoModalCtrl',
                    windowClass : 'center-modal',
                    backdrop    : 'static',
                    scope       :  scope,
                    resolve     :  { }
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'cancel') {
                        if (modalInstance.hasAlteracao) {

                            if (modalInstance.objSelected !== undefined) {
                                $scope.produto.proGruSelect    = modalInstance.objSelected.gru_descricao;
                                $scope.produto.pro_gru_cod_gru = modalInstance.objSelected.gru_cod_gru;
                            }
                        }
                    }
                });
            };


            /**
             * Método responsável em abrir a janela modal para configuração do NCM
             * de um determinado produto/serviço escolhido pelo usuário.
             */
            $scope.openModalNCM = function() {

                if ($scope.produto.pro_cod_pro) {

                    var scope = $rootScope.$new();
                    scope.params = {
                        objProduto : $scope.produto,
                        ehServico  : $scope.pro_eh_servico
                    };

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'produto/views/janela-ncm.html',
                        controller  : 'ProdutoModalNCMCtrl',
                        windowClass : 'center-modal',
                        backdrop    : 'static',
                        size        : 'lg',
                        scope       :  scope,
                        resolve     :  { }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'reload') {
                            if (modalInstance.hasAlteracao) {

                                var nro = modalInstance.ncm_seq;
                                ProdutoService.ncm.get({ncm_seq : nro}, function(retorno) {
                                    if (retorno.records) {
                                        $scope.produto.pro_ncm = retorno.records.ncm_nro_ncm.toString();
                                        $timeout(function() {
                                            $scope.triggerSalvarProduto();
                                        }, 500);
                                    }
                                });
                            }
                        }
                    });

                } else {

                    GeralFactory.notify('warning', 'Atenção!', $scope.objBundleTela.B003);
                }
            };


            /**
             * Método responsável em abrir uma janela modal para vinculo de fornecedores a
             * um determinado produto escolhido pelo usuário.
             */
            $scope.openModalFornecedor = function(produto) {

                var scope = $rootScope.$new();
                scope.params = {
                    objProduto      : produto,
                    arrEquivalentes : $scope.objFornecedorEqv
                };

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'produto/views/janela-fornecedor.html',
                    controller  : 'ProdutoModalFornecedorCtrl',
                    windowClass : 'center-modal',
                    backdrop    : 'static',
                    scope       :  scope,
                    resolve     :  { }
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'reload') {
                        if (modalInstance.hasAlteracao && ! _.isEmpty(modalInstance.arrFornecedor)) {

                            $scope.objFornecedorEqv = modalInstance.arrFornecedor;
                            scope.$destroy();
                        }
                    }
                });
            };


            /**
             * Método responsável em abrir a janela modal contendo o formulário
             * para envio de uma nova foto para um determinado produto.
             */
            $scope.getFormUpload = function(pro_cod_pro) {

                if ($scope.produto.pro_cod_pro) {

                    var scope = $rootScope.$new();
                    scope.params = {};

                    var arrFotos = ($scope.produto.produto_imagem === undefined) ? [] : $scope.produto.produto_imagem;

                    scope.params.entity      = 'Produto';
                    scope.params.arr_fotos   =  arrFotos;
                    scope.params.pro_cod_pro =  $scope.produto.pro_cod_pro;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'produto/views/aba-produto-upload.html',
                        controller  : 'ProdutoModalUploadCtrl',
                        windowClass : 'center-modal',
                        backdrop    : 'static',
                        scope       :  scope,
                        resolve     :  { }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'cancel') {

                            $scope.getImagemPrincipal($scope.produto.pro_cod_pro);
                            scope.$destroy();
                        }
                    });
                } else {

                    GeralFactory.notify('warning', 'Atenção!', $scope.objBundleTela.B003);
                }
            };


            /**
             * Método responsável em retornar a imagem principal de um determinado produto logo
             * após o upload de uma nova foto para o servidor.
             */
            $scope.getImagemPrincipal = function(proCodPro) {

                ProdutoService.produto.get({pro_cod_pro : proCodPro}, function(retorno) {
                    if (retorno.records.produto_imagem.length) {

                        $scope.produto.produto_imagem = retorno.records.produto_imagem;
                        $timeout(function() {
                            var arrPrincipal = retorno.records.produto_imagem[0];
                            $scope.produto.imagem_principal = arrPrincipal;
                        });
                    } else {

                        $scope.produto.produto_imagem   = [];
                        $scope.produto.imagem_principal = null;
                        console.log('Nenhuma imagem cadastrada para o produto em questão!');
                    }
                });
            };


            /**
             * Método responsável em abrir a janela modal para enviar a imagem de estampa a
             * ser selcionada pelo usuário.
             */
            $scope.getJanelaEstampa = function() {

                if ($scope.produto.pro_cod_pro) {

                    var scope = $rootScope.$new();

                    scope.params = {};
                    scope.params.pro_cod_pro = $scope.produto.pro_cod_pro;
                    scope.params.arr_estampa = $scope.produto.arr_estampa;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'produto/views/aba-produto-estampa.html',
                        controller  : 'ProdutoModalEstampaCtrl',
                        windowClass : 'center-modal',
                        backdrop    : 'static',
                        scope       :  scope,
                        resolve     :  { }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'reload') {
                            if (modalInstance.hasAlteracao) {

                                $scope.produto.arr_estampa[0] = modalInstance.objEstampa;
                                $timeout(function() {

                                    scope.$destroy();
                                    $scope.salvarProduto();

                                }, 1000);
                            }
                        }
                    });
                } else {

                    GeralFactory.notify('warning', 'Atenção!', $scope.objBundleTela.B003);
                }
            };


            /**
             * Método responsável em montar a URL amigavél do produto conforme a descrição
             * do mesmo escolhida pelo usuário da aplicação.
             */
            $scope.setUrlAmigavel = function() {

                if ($rootScope.getPermissaoSol('7')) {

                    $scope.produto.pro_url_amigavel = '';
                    if ($scope.produto.pro_descricao_longa) {

                        var descricao = $scope.produto.pro_descricao_longa;

                        descricao = GeralFactory.rmCaracteresEspeciais(descricao);
                        descricao = descricao.replace(/\s/g, '-');
                        descricao = descricao.replace(/(-)\1+/g, '-');

                        $scope.produto.pro_url_amigavel = descricao.toLowerCase().trim();
                    }
                }
            };


            /**
             * Mostra um alerta para que o cliente salve ou não os dados antes de sair da tela
             */
            $scope.alertaSalvar = function () {

                $rootScope.spinnerList.on();

                GeralFactory.confirmar('Deseja salvar antes de sair?',function () {

                    if ($scope.produto.pro_cod_pro) {

                        // Ajustando o peso do produto:
                        $scope.produto.pro_peso_bruto = $scope.produto.pro_peso_bruto.toString().replace('.', ',');

                        ProdutoService.produto.update($scope.produto, function(resposta) {

                            $scope.flagTutorial = true;
                            $scope.listarProdutos();
                        });
                    } else {

                        $scope.setMedidasProduto();
                        ProdutoService.produtos.create($scope.produto, function(resposta) {

                            $scope.flagTutorial = true;
                            $scope.listarProdutos();
                        });
                    }

                }, 'Título',  function () {

                    $scope.flagTutorial = true;
                    $rootScope.spinnerList.off();
                });
            };


            /**
             * Método responsável em retornar o saldo de um determinado produto de acordo
             * com a sua movimentação de estoque.
             */
            $scope.getSaldoMovimentacao = function() {

                var total = 0, arrMovimentacoes = $scope.produto.arr_movimentacao;
                angular.forEach(arrMovimentacoes, function(item) {

                    if (item.ite_pro_qtd) {

                        var qtde = parseFloat(item.ite_pro_qtd);
                        total = total + qtde;
                    }
                });

                total = GeralFactory.isInt(total) ? total : total.toFixed(4);
                return total;
            };


            /**
             * Método responsável em voltar o usuário de abas.
             */
            $scope.voltar = function() {

                var abaSelecionada = 0;
                angular.forEach($scope.tabs, function(item, i) {
                    if (item.active) {
                        abaSelecionada = i;
                    }
                });

                if ($scope.pro_eh_servico === 1 && abaSelecionada === 2) {
                    abaSelecionada = 1;
                }

                // Verificando para saber se vai salvar ou apenas voltar para aba anterior:
                if (abaSelecionada === 0) {

                    $scope.alertaSalvar();

                } else {

                    $scope.setAbaInicial(abaSelecionada)
                }
            };


            /**
             * Método responsável em gerar o relatório contendo a lista de produtos dando
             * foco na quantidade em estoque dos mesmos.
             */
            $scope.gerarRelatorio = function() {

                var objFiltro = $scope.filtroPesquisarProduto();

                objFiltro['type']    = 'C';
                objFiltro['emissor'] = $scope.flagEmissor === false ? 'N' : 'S';
                objFiltro['ken']     = AuthTokenFactory.getToken();

                var strFiltro = GeralFactory.formatarPesquisar(objFiltro);
                if (objFiltro) {

                    var url = GeralFactory.getUrlApi() + '/erp/export/produto/estoque/?' + strFiltro;
                    $timeout(function() {
                        $window.open(url, 'Relatório');
                    }, 50);
                }
            };


            /**
             * Método responsável em abrir uma janela modal contendo as opções de relatórios
             * disponiveis para produtos no lojista virtual.
             */
            $scope.getJanelaRelatorio = function() {

                var objFiltro = $scope.filtroPesquisarProduto();

                objFiltro['emissor'] = $scope.flagEmissor === false ? 'N' : 'S';

                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.objFiltro  = objFiltro;

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'produto/views/janela-relatorio.html',
                    controller  : 'ProdutoRelatorioModalCtrl',
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


            /**
             * Método responsável em verificar o estoque dos produtos de acordo com o saldo
             * inicial do mesmo para não existir discrepâncias de valores no estoque.
             */
            $scope.verificarEstoque = function() {

                if (! $scope.flagEcommerce) {

                    if ($rootScope.getPermissaoSol('2') && $scope.produto.pro_cod_pro) {

                        var total = $scope.getSaldoMovimentacao();
                        var saldo = $scope.produto.sal_atu_qtd_saldo;

                        saldo = GeralFactory.isInt(saldo) ? saldo : parseFloat(saldo.replace(',', '.')).toFixed(4);
                        if (saldo != total) {

                            console.log(saldo, total);
                            var strFiltro = GeralFactory.formatarPesquisar({
                                'pro_cod_pro' : $scope.produto.pro_cod_pro
                            });

                            ProdutoService.estoque.recalcular({u : strFiltro}, function(retorno) {
                                if (retorno.records) {
                                    var hasError = retorno.records.error;
                                    if (! hasError) {

                                        $timeout(function() {
                                            console.log('Estoque atualizado: ', retorno.records, saldo, total);
                                            $scope.produto.sal_atu_qtd_saldo = total;
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            };


            /**
             * Método responsável em não permitir a edição do campo tipo especifico quando o
             * mesmo já estiver preenchido no ato de atualizar um produto.
             */
            $scope.onChangeTipo = function() {

                if ($scope.produto.pro_cod_pro) {

                    GeralFactory.confirmar('Foram atribuídos dados específicos para este produto, este mesmos serão perdidos. Deseja prosseguir?', function() {

                        $rootScope.spinnerForm.on();
                        var objeto = {pro_cod_pro : $scope.produto.pro_cod_pro};

                        ProdutoService.tiposEspecificos.cancelAll(objeto, function(retorno) {
                            if (! retorno.records.error) {

                                $scope.produtoCopy.pro_tip_especifico = $scope.produto.pro_tip_especifico;
                                GeralFactory.notify('success', 'Atenção!', 'Registro(s) excluído(s) com sucesso!');
                            }

                            $rootScope.spinnerForm.off();
                        });

                    }, 'Confirmação', function() {

                        // Retornando ao tipo específico antigo em caso do usuário clicar na opção de não:
                        $scope.produto.pro_tip_especifico = $scope.produtoCopy.pro_tip_especifico;

                    }, 'Não', 'Sim');
                }
            };


            /**
             * Método responsável em abrir a janela modal para os tipo específico para um
             * determinado produto escolhido pelo usuário.
             */
            $scope.openModalTipoProduto = function() {

                if ($scope.produto.pro_cod_pro) {

                    var tipo = $scope.produto.pro_tip_especifico;
                    if (tipo) {

                        var scope = $rootScope.$new();
                        scope.params = {
                            'pro_cod_pro'        : $scope.produto.pro_cod_pro,
                            'pro_tip_especifico' : tipo
                        };

                        var modalInstance = $uibModal.open({
                            animation   :  true,
                            templateUrl : 'produto/views/janela-tipo.html',
                            controller  : 'ProdutoModalTipoEspecificoCtrl',
                            windowClass : 'center-modal',
                            backdrop    : 'static',
                            size        : 'lg',
                            scope       :  scope,
                            resolve     :  { }
                        });

                        modalInstance.result.then(function(id) { }, function(msg) {
                            if (msg === 'reload') {
                                
                            }
                        });
                    } else {

                        var mensagem = tipo === null ? 'Escolha uma opção para o campo tipo específico!' : 'A opção NORMAL não permite o cadastro de tipos específicos de produto!';
                        GeralFactory.notify('warning', 'Atenção!', mensagem);
                    }
                } else {
                    
                    GeralFactory.notify('warning', 'Atenção!', $scope.objBundleTela.B003);
                }
            };


            /**
             * Limpa todos os filtros efetuados pelo usuário.
             */
            $scope.limparPesquisa = function() {

                $scope.pesquisaProduto = {
                    'pro_status'   : 'T',
                    'pro_flag_ncm' : 'T',
                    'pro_flag_mid' : 'T'
                };
            };


            /**
             * Método responsável em duplicar um determinado produto, ou seja, inserir um novo produto
             * com base nas informações de um mesmo já existente na base de dados.
             */
            $scope.duplicarProduto = function() {

                $scope.salvarProdutoLoading = true;
                GeralFactory.confirmar($scope.objBundleTela.B006, function() {

                    var codProduto = $scope.produto.hasOwnProperty('pro_cod_pro') ? $scope.produto.pro_cod_pro : 0;
                    if (codProduto) {

                        var objProduto = {pro_cod_pro : codProduto};
                        ProdutoService.produto.duplicar(objProduto, function(resposta) {
                            if (resposta.records) {

                                $timeout(function() {

                                    $scope.getProduto(resposta.records.code);
                                    $scope.listarProdutos();
                                    $scope.salvarProdutoLoading = false;

                                }, 1000);
                            }
                        });
                    }
                });
            };
        }
    ]);