
angular.module('newApp').controller('ProdutoModalUploadCtrl', [

    '$scope', '$rootScope', '$sce', '$timeout', '$modalInstance', 'MidiaService', 'GeralFactory',

    function($scope, $rootScope, $sce, $timeout, $modalInstance, MidiaService, GeralFactory) {

        $scope.foto = {};
        $scope.foto.pro_hidden = true;

        $modalInstance.opened.then(function() {

            $scope.foto.entity      = $scope.params.entity;
            $scope.foto.pro_cod_pro = $scope.params.pro_cod_pro;

            if ($scope.params.arr_fotos.length) {

                var htmlFotos = GeralFactory.getFotosProduto($scope.params.arr_fotos);

                $scope.htmlFotosProdutos = $sce.trustAsHtml(htmlFotos);
                $scope.renderFotos(htmlFotos);

            } else {

                // Caso não exista fotos para o produto selecionado:
                $scope.foto.mensagem = true;
            }
        });

        /**
         * Método responsável em efetuar o upload de uma nova foto
         * para o produto escolhido pelo usuário.
         */
        $scope.upload = function(file, event) {

            $scope.salvarFotoLoading = true;

            if (file === undefined || file === null) {

                GeralFactory.notify('warning', 'Atenção!', 'Caro usuário, selecione ao menos uma foto para efetuar o envio!');

                $scope.salvarFotoLoading = false;

            } else {

                if ($scope.foto.pro_cod_pro !== null) {

                    var objeto = {
                        mid_tab     :  1,
                        mid_status  :  1,
                        mid_posicao : '',
                        mid_link    : '',
                        mid_tab_cod : $scope.foto.pro_cod_pro
                    };

                    MidiaService.upload(file, objeto, function(resposta) {

                        resposta.records.error ? GeralFactory.notify('danger', 'Erro!', resposta.records.msg) : GeralFactory.notify('success', 'Sucesso!', 'Foto cadastrada com sucesso!');

                        var query = 'q=(mid_tab:1,mid_tab_cod:' + $scope.foto.pro_cod_pro + ')';
                        MidiaService.midias.get({u : query}, function(retorno) {
                            if (retorno.records.length) {
                                /**
                                 * $modalInstance.arrFotos = retorno.records;
                                 * $modalInstance.dismiss('reload');
                                 */

                                $scope.picFile = null;
                                $scope.foto.mensagem   = false;
                                $scope.foto.pro_hidden = true;

                                var htmlFotos = GeralFactory.getFotosProduto(retorno.records);
                                $scope.renderFotos(htmlFotos);
                            }

                            $scope.salvarFotoLoading = false;
                        });
                    });
                }
            }
        };

        /**
         * Método responsável em renderizar o plugin contendo as fotos do produto
         * no corpo da janela modal.
         */
        $scope.renderFotos = function(htmlFotos) {

            if (htmlFotos) {

                $scope.htmlFotosProdutos = $sce.trustAsHtml(htmlFotos);
                $timeout(function() {
                    $scope.$apply(function() {
                        $.getScript('../app/components/produto/controllers/helpers/aba-produto-fotos.js');
                        $scope.removerMidia();
                    });
                }, 800);

                $scope.foto.pro_hidden = false;

                /**
                 * $timeout(function() {
                 *    $scope.foto.pro_hidden = false;
                 * }, 400);
                 */
            }
        };

        /**
         * Método responsável em remover uma determinada foto escolhida pelo
         * usuário na tela de produtos.
         */
        $scope.removerMidia = function() {
            $('button[data-mid-nro]').click(function() {
                var self = $(this), mid_nro = self.attr('data-mid-nro');

                GeralFactory.confirmar('Deseja remover o foto escolhida?', function() {

                    var objeto = {mid_nro : mid_nro};
                    MidiaService.midia.remover(objeto, function (resposta) {
                        if (resposta.records) {
                            if (! resposta.records.error) {

                                GeralFactory.notificar({data: resposta});
                                self.parent().detach();

                                var arrImagens = $('div.slide img').length;
                                if (arrImagens === 0) {
                                    $scope.foto.mensagem = true;
                                }
                            }
                        }
                    });
                });
            });
        };

        /**
         * Efeuta o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('ProdutoModalEstampaCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'MidiaService', 'GeralFactory',

    function($scope, $rootScope, $timeout, $uibModalInstance, MidiaService, GeralFactory) {

        $scope.forms      = {};
        $scope.objEstampa = {};
        $scope.arrEstampa = [];
        $scope.arrMidias  = [];

        $uibModalInstance.opened.then(function() {

            $scope.$angular = angular;
            $uibModalInstance.hasAlteracao = false;

            $scope.getEstampas();
            $scope.arrEstampa = $scope.params.arr_estampa;
            $timeout(function() {
                if ($scope.arrEstampa.length) {
                    $scope.objEstampa  = $scope.arrEstampa[0];
                    $scope.objAuxiliar = angular.copy($scope.arrEstampa[0]);
                }
            });
        });

        /**
         * Método responsável em efetuar o upload da estampa escolhida pelo usuário.
         */
        $scope.upload = function(file, event) {

            $scope.salvarEstampaLoading = true;
            if (file === undefined || file === null) {

                GeralFactory.notify('warning', 'Atenção!', 'Caro usuário, selecione ao menos uma estampa para efetuar o envio!');
                $scope.salvarFotoLoading = false;

            } else {

                var descricao = $scope.objEstampa.mid_descricao ? $scope.objEstampa.mid_descricao : '';
                var objeto    = {
                    mid_tab       : 10,
                    mid_status    : 1,
                    mid_posicao   : '',
                    mid_link      : '',
                    mid_descricao : descricao,
                    mid_tab_cod   : $scope.params.pro_cod_pro
                };

                /**
                 * Caso seja atualização de um registro:
                 * if ($scope.arrEstampa.length) {
                 *
                 *    objeto.mid_nro   = $scope.arrEstampa[0].mid_nro;
                 *    objeto.mid_ordem = null;
                 * }
                 */

                $scope.desativar(function() {
                    MidiaService.upload(file, objeto, function(retorno) {
                        console.log('Retorno 2: ', retorno);
                        if (retorno.records.error) {

                            GeralFactory.notify('danger', 'Erro!', retorno.records.msg);

                        } else {

                            GeralFactory.notify('success', 'Sucesso!', 'Estampa cadastrada com sucesso!');

                            $scope.getMidia(retorno.records.mid_nro);
                            $timeout(function() {

                                $scope.salvarEstampaLoading    = false;
                                $uibModalInstance.hasAlteracao = true;
                                $uibModalInstance.objEstampa   = $scope.objEstampa;

                                $scope.fecharModal('reload');

                            }, 1000);
                        }
                    });
                });
            }
        };

        /**
         * Método responsável em apenas desativar uma determinada mídia.
         */
        $scope.desativar = function(func) {

            console.log('Desativar!');
            if ($scope.objAuxiliar) {

                console.log('Preparando!');
                var codigo = $scope.objAuxiliar.mid_nro;
                MidiaService.midia.desativar({mid_nro : codigo}, function(retorno) {
                    console.log('Retorno 2: ', retorno);
                    if (retorno.records) {

                        $timeout(function() {
                            console.log('OK 1');
                            func();
                        });
                    }
                });
            } else {

                $timeout(function() {
                    console.log('OK 2!');
                    func();
                });
            }
        };

        /**
         * Método responsável em salvar uma estampa escolhida dentre as existentes.
         */
        $scope.clonar = function() {

            var objClone = $scope.objEstampa;
            $scope.clonarEstampaLoading = true;

            objClone['cod_vix_mid'] = $scope.params.pro_cod_pro;

            if ($scope.objAuxiliar)
                objClone['mid_nro_ref'] = $scope.objAuxiliar.mid_nro;

            if (($scope.arrEstampa.length) && ($scope.objEstampa.mid_arq === $scope.arrEstampa[0].mid_arq)) {

                $scope.clonarEstampaLoading = false;
                GeralFactory.notify('warning', 'Atenção!', 'Por gentileza escolha outra estampa pois o produto já se encontra com a estampa escolhida!');

            } else {

                MidiaService.midia.clonar(objClone, function(retorno) {
                    if (retorno.records) {
                        $timeout(function() {

                            $scope.clonarEstampaLoading    = false;
                            $uibModalInstance.hasAlteracao = true;
                            $uibModalInstance.objEstampa   = $scope.objEstampa;

                            $scope.fecharModal('reload');

                        }, 1000);
                    }
                });
            }
        };

        /**
         * Método responsável em resetar os vetores e objetos principais para escolha da estampa.
         */
        $scope.reset = function() {

            $scope.objEstampa = {};
            $scope.arrEstampa = [];
            $scope.arrMidias  = [];
            $scope.picEscolha = false;
        };

        /**
         * Retorna os dados de uma determinada mídia.
         */
        $scope.getMidia = function(mid_nro) {

            if (mid_nro) {

                MidiaService.midia.get({mid_nro : mid_nro}, function(retorno) {
                    if (retorno.records) {

                        $scope.objEstampa = retorno.records;
                        console.log('Estampa: ', $scope.objEstampa);
                    }
                });
            }
        };

        /**
         * Método responsável em retornar todas as estampas de um determinado produto.
         */
        $scope.getEstampas = function() {

            var strFiltro = GeralFactory.formatarPesquisar({
                'mid_status'  : 1 
            });

            MidiaService.midias.getEstampas({u : strFiltro}, function(retorno) {
                if (retorno.records.length) {

                    $timeout(function() {

                        $scope.arrMidias = retorno.records;
                        console.log('Estampas existentes: ', $scope.arrMidias);
                    });
                }
            });
        };

        /**
         * Método responsável em indicar qual a estampa escolhida pelo usuário.
         */
        $scope.escolherEstampa = function(objEstampa) {

            if (! _.isEmpty(objEstampa)) {

                $scope.picEscolha = true;
                $scope.objEstampa = objEstampa;

                console.log($scope.objEstampa);
            }
        };

        /**
         * Efeuta o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('ProdutoModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$modal', '$modalInstance', 'ProdutoService', 'GeralFactory', 'EmpresaService', '$uibModalInstance', 'ClienteService', 'StaticFactories',

    function($scope, $rootScope, $timeout, $uibModal, $modalInstance, ProdutoService, GeralFactory, EmpresaService, $uibModalInstance, ClienteService, StaticFactories) {

        $modalInstance.opened.then(function() {

            $scope.setAbaInicial(1);
            $modalInstance.hasAlteracao = false;
            $modalInstance.objProdutoUp = {};

            $scope.forms          =  {};
            $scope.eye            = 'eye';
            $scope.nomeMedida     = 'Unidade';
            $scope.nomeCorEstampa = 'Cores';

            $scope.arrMarcacoes = [];
            $scope.produtoCopy  = {};
            $scope.produto      = {
                pro_eh_inativo_aux :  true,
                pro_tip_unidade    :  1,
                pro_unidade        : 'UN',
                pro_cs_origem      :  0,
                pro_cor_1          : '',
                pro_cor_2          : '',
                arr_estampa        : []
            };

            if ($scope.params.importandoNFe) {
                $scope.produto              = $scope.params;
                $scope.produto.equivalentes = {};
                $scope.objFornecedorEqv     = [];

                $scope.flgCsosn = true;

                $scope.listarObjetosTela();
                $scope.setLabelTitular($scope.params.pro_eh_servico);
            }

            if ($scope.params.pro_cod_pro) {

                $scope.objFornecedorEqv = [];

                if ($rootScope.getPermissaoSol('7')) {
                    $scope.produto.pro_eh_visivel_web_aux = true;
                }

                $scope.listarObjetosTela();
                $scope.setLabelTitular($scope.params.pro_eh_servico);
                $scope.getProduto($scope.params.pro_cod_pro);
            }
        });


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

                        $scope.arrMarcacoes = arrAuxiliar;
                        $scope.arrProdutoGrupoFiltro = retorno.records.arr_categorias;
                    }
                });

                $scope.listarTipoProducao();
                $scope.triggerListarMovimentacao();
            });
        };


        /**
         * Método responsável em preparar o gatilho para efetuar a listagem dos NCM
         * de um determinado produto escolhido pelo usuário.
         */
        $scope.triggerListarMovimentacao = function() {

            angular.element('#tab-produto-estoque-modal a').click(function() {

                console.log('Carregando movimentações!');
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
                                $rootScope.spinnerForm.off();

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
         * Regras a serem efetuadas dependendo do tipo da página: Produto ou Serviço.
         */
        $scope.setLabelTitular = function(pro_eh_servico) {

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

            $scope.initCKeditor();
            if (pro_eh_servico === 0) {

                $scope.pro_eh_servico = 0;
                $scope.objBundleTela  = {
                    'B000'   : 'Não é possível excluir este produto, pois já existe movimentação. Deseja inativá-lo?',
                    'B001'   : 'Deseja remover o produto escolhido?',
                    'B002'   : 'Deseja escolher outra categoria para o produto ',
                    'B003'   : 'Salve antes de prosseguir.',
                    'B004'   : 'Caro usuário, a listagem dos produtos já se encontra completa!',
                    'B005'   : 'Favor informar o NCM e/ou CST/CSO na aba de impostos.',
                    'labels' : {
                        'L001' : 'produtos',
                        'L002' : 'produto',
                        'L003' : 'Pesquisar produtos...',
                        'L004' : 'Preços e Estoque'
                    }
                };

            } else if (pro_eh_servico === 1) {

                $scope.flgCst   = false;
                $scope.flgCsosn = false;

                $scope.pro_eh_servico = 1;
                $scope.objBundleTela  = {
                    'B000'   : 'Não é possível excluir este serviço, pois já existe movimentação. Deseja inativá-lo?',
                    'B001'   : 'Deseja remover o serviço escolhido?',
                    'B002'   : 'Deseja escolher outra categoria para o serviço ',
                    'B003'   : 'Salve antes de prosseguir.',
                    'B004'   : 'Caro usuário, a listagem dos serviços já se encontra completa!',
                    'B005'   : 'Favor informar o CNAE e/ou CST/CSO na aba de impostos.',
                    'labels' : {
                        'L001' : 'serviços',
                        'L002' : 'serviço',
                        'L003' : 'Pesquisar serviços...',
                        'L004' : 'Preços'
                    }
                };

            } else {

                $scope.fecharModal('reload');
            }
        };


        /**
         * Método responsável em alterar a visualização dos componentes de cor ou estampa
         * contidos na aba de loja virtual na tela de produtos.
         */
        $scope.trocarCorEstampa = function() {

            $scope.nomeCorEstampa = ($scope.nomeCorEstampa == 'Cores') ? 'Estampa' : 'Cores';
        };


        /**
         * Troca a medida utilizada por um determinado produto.
         */
        $scope.trocarMedida = function() {

            if ($scope.nomeMedida === 'Unidade') {

                $scope.nomeMedida = 'Fração';
                $scope.produto.pro_tip_unidade = 2;

            } else {

                $scope.nomeMedida = 'Unidade';
                $scope.produto.pro_tip_unidade = 1;
            }
        };


        /**
         * Habilita a visibilidade do produto para na loja para a categoria em questao.
         */
        $scope.setVisibilidade = function() {

            $scope.eye = ($scope.eye === 'eye') ? 'eye-slash' : 'eye';
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
         * Lista os parametros da aba de tributos.
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
        };


        /**
         * Retorna os dados de um determinado produto.
         */
        $scope.getProduto = function(pro_cod_pro) {

            $scope.proCodProSelected = pro_cod_pro;

            ProdutoService.produto.get({pro_cod_pro : pro_cod_pro}, function(retorno) {

                $scope.initCKeditor();
                $scope.marca   = {};
                $scope.produto = retorno.records;

                $scope.produto.pro_cs_origem = ($scope.produto.pro_cs_origem === null) ? 0 : $scope.produto.pro_cs_origem;

                $scope.produto.pro_eh_inativo_aux     = retorno.records.pro_eh_inativo === 1     ? false : true;
                $scope.produto.pro_eh_visivel_web_aux = retorno.records.pro_eh_visivel_web === 1 ? true  : false;

                // Informações referentes ao saldo:
                $scope.produto.produtoMarcas = [];
                $scope.produto.proGruSelect  = retorno.records.produto_grupo.gru_descricao;

                // Medidas que precisam ser convertidas:
                if (retorno.records.produto_saldo) {

                    var saldo = retorno.records.produto_saldo.sal_atu_qtd_saldo;
                    $scope.produto.sal_atu_qtd_saldo = (GeralFactory.isInt(saldo)) ? parseInt(saldo) : saldo.replace('.', ',');
                }

                // Informações referentes ao peso:
                $scope.produto.pro_peso_bruto = GeralFactory.formatarFloatBr(retorno.records.pro_peso_bruto);
                $scope.produto.pro_peso_bruto = parseFloat($scope.produto.pro_peso_bruto.replace(',', '.'));

                if ($rootScope.objUsuario.emp_reg_trib === 4 ||
                    $rootScope.objUsuario.emp_reg_trib === 5 ||
                    $rootScope.objUsuario.emp_reg_trib === 6) {

                    $scope.flgCst = true;
                    $scope.produto.pro_cso = 0;

                } else {

                    $scope.flgCsosn = true;
                    $scope.produto.pro_cst = 0;
                }

                $scope.eye        = ($scope.produto.pro_eh_visivel)        ? 'eye'    : 'eye-slash';
                $scope.nomeMedida = ($scope.produto.pro_tip_unidade === 2) ? 'Fração' : 'Unidade';

                var strProdutoMarcas = 'q=(pma_cod_pro:' + pro_cod_pro + ')';
                ProdutoService.produtoMarcas.get({u : strProdutoMarcas}, function(data) {

                    angular.forEach($scope.arrMarcacoes, function(item1) {
                        angular.forEach(data.records,function(item2) {
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

                // Monta o objeto de códigos equivalentes caso o fornecedor já esteja cadastrado:
                if ($scope.params.importandoNFe && $scope.params.tipEmissao == 'T') {

                    if ($scope.params.importandoNFe && $scope.params.eqv_cod_for) {

                        GeralFactory.confirmar('Deseja criar o relacionamento deste produto com o fornecedor desta nota?' , function() {

                            var arrAuxiliar = [];
                            var arr = {};

                            arr.eqv_cod_pro         = $scope.produto.pro_cod_pro;
                            arr.eqv_cod_equivalente = $scope.params.pro_cod_ori;
                            arr.eqv_cod_for         = $scope.params.eqv_cod_for;

                            arrAuxiliar.splice(0, 0, arr);

                            $scope.produto.equivalentes = arrAuxiliar;
                            $timeout(function () {

                                $scope.salvarProduto();
                            }, 300);
                        });
                    }

                    $scope.produtoCopy = angular.copy($scope.produto);
                    $uibModalInstance.produto = $scope.produto;

                } else if ($scope.params.importandoNFe) {

                    $uibModalInstance.produto = $scope.produto;
                }
            });
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

                            scope.$destroy();
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
         * Método responsável em retornar o saldo de um determinado produto de acordo
         * com a sua movimentação de estoque.
         */
        $scope.getSaldoMovimentacao = function() {

            var total = 0;
            if ($scope.produto.has_movimentacao) {

                var arrMovimentacoes = $scope.produto.arr_movimentacao;
                angular.forEach(arrMovimentacoes, function(item) {

                    if (item.ite_pro_qtd) {

                        var qtde = parseFloat(item.ite_pro_qtd);
                        total = total + qtde;
                    }
                });
            }

            return total;
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
         * Gatilho para salvar os dados do produto.
         */
        $scope.triggerSalvarProduto = function() {

            var form = $scope.forms.formProduto;
            if (form.$invalid) {

                $scope.submitted = true;

            } else {

                var verificar = $scope.verificarTributos();
                if (verificar) {

                    $scope.salvarProduto();

                } else {

                    GeralFactory.confirmar($scope.objBundleTela.B005, function() {

                        $scope.setAbaInicial(4);

                    }, 'Confirmação', function() {

                        $scope.salvarProduto();

                    }, 'Não', 'Sim');
                }
            }
        };


        /**
         * Método responsável em verificar os campos de tributação do produto antes
         * de salvar os dados do mesmo.
         */
        $scope.verificarTributos = function() {

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

            return true;
        };


        /**
         * Atualiza os dados de um determinado produto.
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

                        $scope.produto.pro_cor_1 = '@' + $scope.produto.arr_estampa[0].mid_nro;
                        $scope.produto.pro_cor_2 = '';
                    }
                    break;
            }

            // Flags para verificar as situações do produto (visível web)
            $scope.produto.pro_eh_visivel_web = $scope.produto.pro_eh_visivel_web_aux ? 1 : 0;
            $scope.produto.pro_eh_inativo     = $scope.produto.pro_eh_inativo_aux     ? 0 : 1;
            $scope.produto.pro_eh_visivel     = $scope.eye === 'eye'                  ? 1 : 0;

            // Verificando a exitência do saldo:
            if ($scope.produto.produto_saldo) {

                var saldo = $scope.produto.sal_atu_qtd_saldo;
                $scope.produto.sal_atu_qtd_saldo = (GeralFactory.isInt(saldo)) ? parseInt(saldo) : saldo.replace(',', '.');
            }

            if ($scope.produto.pro_cod_pro) {

                // Ajustando o peso do produto.
                $scope.produto.pro_peso_bruto = $scope.produto.pro_peso_bruto.toString().replace('.', ',');

                ProdutoService.produto.update($scope.produto, function(retorno) {
                    if (! retorno.records.error) {

                        $modalInstance.hasAlteracao = true;
                        $modalInstance.objProdutoUp = $scope.produto;

                        $timeout(function() {

                            $scope.salvarProdutoLoading = false;
                            $scope.fecharModal('reload');

                        }, 1000);

                    } else {

                        $scope.salvarProdutoLoading = false;
                        GeralFactory.notify('danger', 'Atenção!', retorno.records.msg);
                    }
                });
            } else {

                $scope.setMedidasProduto();
                if ($scope.params.importandoNFe && $scope.params.tipEmissao == 'P'){

                    if (! isNaN($scope.params.pro_cod_ori) && $scope.params.pro_cod_ori < 2147483647) {

                        $scope.produto.pro_cod_pro_antigo = $scope.params.pro_cod_ori;
                    }
                }

                ProdutoService.produtos.create($scope.produto, function(resposta) {
                    if (! resposta.records.error) {

                        var codProduto = resposta.records.pro_cod_pro;
                        $scope.produto.pro_cod_pro = codProduto;

                        $scope.getProduto(codProduto);
                    }

                    $scope.flagMsg = true;
                    $scope.salvarProdutoLoading = false;
                });
            }
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
         * Atribui a marca selecionado ao produto em questao.
         */
        $scope.onSelectedMarca = function(item) {

            if (item.hasOwnProperty('isTag')) {

                GeralFactory.confirmar('Deseja incluir a marcação em questão?', function() {

                    var objeto = {mar_descricao_marca : item.mar_descricao_marca, mar_tab : 1};
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
         * Retorna os dados de um determinado agrupamento ou todos os agrupamentos existentes.
         */
        $scope.listarAgrupamentos = function(agp_cod_agp) {

            if (agp_cod_agp) {

                ProdutoService.agrupamentos.get({u : agp_cod_agp}, function(retorno) {
                    $scope.objAgrupamento          = retorno.records;
                    $scope.produto.pro_agp_cod_agp = agp_cod_agp;
                });
            } else {

                ProdutoService.produtoAgrupamentos.get({u : ''}, function(resposta) {
                    $scope.arrAgrupamento = resposta.records;
                });
            }
        };


        /**
         * Lista os agrupamentos para escolha no componente Typeahead do formulario.
         */
        $scope.listarProdutoAgrupamento = function(nome) {

            nome = nome.trim();
            var strFiltro = GeralFactory.formatarPesquisar({
                'agp_descricao' : nome
            });

            return ProdutoService.produtoAgrupamentos.get({u : strFiltro}).$promise.then(function(resposta) {
                resposta.records.push({
                    id            : '1#1',
                    nome_real     :  nome,
                    agp_descricao : 'Adicionar agrupamento ' + nome
                });
                return resposta.records;
            });
        };


        /**
         * Atribui o agrupamento selecionado ao produto em questao.
         */
        $scope.onSelectProdutoAgrupamento = function($item, $model, $label) {

            var objAgrupamento = {};

            $scope.$item  = $item;
            $scope.$model = $model;
            $scope.$label = $label;

            if ($item.id === '1#1') {

                $scope.produto.agpProSelect = '';
                if (GeralFactory.ehVazioCombo($item)) {
                    return false;
                }

                var nomeReal = $item.nome_real.trim();
                objAgrupamento.agp_descricao = nomeReal;

                GeralFactory.verificarItem($scope.arrAgrupamento, nomeReal, 'agp_descricao', function(retorno) {
                    if (! retorno) {

                        $scope.produto.agpProSelect = '';
                        GeralFactory.notify('warning', 'Atenção!', 'Agrupamento de produto já existente!');

                    } else {

                        ProdutoService.agrupamentos.create(objAgrupamento, function(resposta) {

                            $scope.produto.agpProSelect    = nomeReal;
                            $scope.produto.pro_agp_cod_agp = resposta.records.agp_cod_agp;
                            $scope.listarAgrupamentos();
                        });
                    }
                });
            } else {

                $scope.listarAgrupamentos($item.agp_cod_agp);
                $scope.produto.agpProSelect = $item.agp_descricao;
            }
        };


        /**
         * Abre a janela modal para upload de imagem dos produtos.
         */
        $scope.getFormUpload = function(pro_cod_pro) {

            if (pro_cod_pro) {

                console.log('Produto escolhido: ' + pro_cod_pro);
            }
        };


        /**
         * Abre a janela modal para seleçao de uma determinada categoria ao produto.
         */
        $scope.getCategoria = function() {

            if ($scope.produto.pro_gru_cod_gru) {

                var descProduto = ($scope.produto.pro_descricao_longa) ? $scope.produto.pro_descricao_longa : '';

                GeralFactory.confirmar('Deseja escolher outra categoria para o produto ' + descProduto + '?', function() {

                    $scope.openModalCategoria();
                });
            } else {

                $scope.openModalCategoria();
            }
        };


        /**
         * Abre a janela modal para seleçao de uma determinada categoria ao produto.
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

                            scope.$destroy();
                            $scope.produto.arr_estampa[0] = modalInstance.objEstampa;
                        }
                    }
                });
            } else {

                GeralFactory.notify('warning', 'Atenção!', $scope.objBundleTela.B003);
            }
        };


        /**
         * Define a URL amigavel do produto para a Loja Virtual.
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
         * Fecha a janela modal.
         */
        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('ProdutoModalFornecedorCtrl', [

    '$scope', '$rootScope', '$timeout', '$modalInstance', 'ClienteService', 'GeralFactory',

    function($scope, $rootScope, $timeout, $uibModalInstance, ClienteService, GeralFactory) {

        $scope.forms         = {};
        $scope.objProduto    = {};
        $scope.objFornecedor = {};
        $scope.arrFornecedor = [];


        $uibModalInstance.opened.then(function() {

            $scope.objProduto = angular.copy($scope.params.objProduto);

            if (! _.isEmpty($scope.params.arrEquivalentes)) {

                // Recolhendo os equivalentes já cadastrados para popular a lista:
                $scope.arrFornecedor = $scope.params.arrEquivalentes;
            }

            $uibModalInstance.hasAlteracao = false;
            $scope.objFiltroFornecedor = {
                'cad_tip_cli_for' : 2
            };
        });


        /**
         * Método responsável em salvar todas as alterações feitas pela usuário com
         * relação aos fornecedores do produto escolhido.
         */
        $scope.salvarAlteracoes = function() {

            $scope.salvarFornecedorLoading = true;
            $scope.$watch('forms.formsFornecedor', function(form) {
                if (form) {
                    if (form.$invalid) {

                        $scope.submitted = true;
                        $scope.salvarFornecedorLoading = false;

                    } else {

                        $uibModalInstance.hasAlteracao = true;
                        $timeout(function() {

                            $scope.salvarFornecedorLoading  = false;
                            $uibModalInstance.arrFornecedor = $scope.arrFornecedor;
                            $scope.fecharModal('reload');
                            
                        }, 2000);
                    }
                }
            });
        };


        /**
         * Método responsável pela seleção dos dados de um determinado fornecedor
         * pelo componente de autocomplete contido na janela modal.
         */
        $scope.onSelectFornecedor = function($item) {

            $scope.getFornecedor($item.cad_cod_cad);
            $scope.fornecedorSelect = $item.cad_nome_razao;
        };


        /**
         * Método responsável em adicionar um determinado fornecedor diretamente pelo
         * componente de autocomplete contido na janela modal.
         */
        $scope.addFornecedor = function($item) {

            var objFornecedor = {
                'cad_pf_pj'       : 1,
                'cad_eh_inativo'  : 0,
                'cad_nome_razao'  : $item.trim(),
                'cad_tip_cli_for' : $scope.objFiltroFornecedor.cad_tip_cli_for
            };

            ClienteService.clientes.create(objFornecedor, function(resposta) {

                $scope.objFornecedor.cad_cod_cad = resposta.records.cad_cod_cad;
                $scope.getFornecedor(resposta.records.cad_cod_cad);
            });
        };


        /**
         * Obtém os dados do fornecedor selecionado pelo plugin de autocomplete.
         */
        $scope.getFornecedor = function(cad_cod_cad) {

            $scope.objFornecedor = {};
            if (cad_cod_cad) {

                ClienteService.cliente.get({cad_cod_cad : cad_cod_cad}, function(retorno) {
                    if (retorno.records) {

                        $scope.objFornecedor = retorno.records;
                    }
                });
            }
        };


        /**
         * Método responsável em adicionar um fornecedor equivalente ao produto
         * escolhido pelo usuário da aplicação.
         */
        $scope.incluirFornecedor = function() {

            if (! _.isEmpty($scope.objFornecedor)) {

                $scope.arrFornecedor.push($scope.objFornecedor);
                $timeout(function() {

                    $scope.objFornecedor    = {};
                    $scope.fornecedorSelect = '';
                });

            } else {

                var mensagem = 'Caro usuário, não foi possível incluir o fornecedor!';
                GeralFactory.notify('warning', 'Atenção!', mensagem);
            }
        };


        /**
         * Método responsável em remover um determinado fornecedor escolhido pelo
         * usuário da aplicação dentre os já existentes na lista (GRID).
         */
        $scope.removerFornecedor = function($item) {

            var index = $scope.arrFornecedor.indexOf($item);
            $scope.arrFornecedor.splice(index, 1);
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('ListaProdutoModalCtrl', [

    '$scope', '$rootScope', '$sce', '$timeout', '$uibModalInstance', 'GeralFactory', 'ProdutoService',

    function($scope, $rootScope, $sce, $timeout, $uibModalInstance, GeralFactory, ProdutoService) {

        $uibModalInstance.opened.then(function() {

            $scope.produtos         = [];
            $scope.produto          = {};
            $scope.pesquisaProduto  = {};
            $scope.listaProdutoBusy = false;
            $scope.flagLoadingLista = false;

            console.log('$scope.params', $scope.params);

        });

        /**
         * Retorna um objeto contendo os dados para pesquisa de produtos e serviços.
         */
        $scope.filtroPesquisarProduto = function() {

            return  {
                'pro_dat_cancelamento'    : null,
                'pro_eh_inativo'          : 0,
                'texto_produto_pesquisar' : $scope.pesquisaProduto.texto_produto_pesquisar
            };
        };

        /**
         * Retorna uma lista contedo os produtos ou serviços de um determinado usuário.
         */
        $scope.listarProduto = function() {
            var strFiltro, lastReg;
            var objFiltro = $scope.filtroPesquisarProduto();

            strFiltro = GeralFactory.formatarPesquisar(objFiltro);

            if ($scope.listaInfinitaProdutoBusy) {
                return;
            }

            $scope.strFiltroAnterior        = strFiltro;
            $scope.flagLoadingLista         = true;
            $scope.listaInfinitaProdutoBusy = true;

            $timeout(function() {
                ProdutoService.produtos.get({u: strFiltro}, function(retorno) {
                    if (retorno.records.length > 0) {

                        angular.forEach(retorno.records, function (item) {
                            $scope.produtos.push(item);
                        });

                        $scope.listaInfinitaProdutoBusy = false;

                    } else {

                        $scope.listaInfinitaProdutoBusy = true;
                    }

                    $scope.flagMsg          = true;
                    $scope.flagLoadingLista = false;
                });
            }, 2000);
        };

        /**
         * Retorna uma lista de produtos ou serviços baseada na pesquisa efetuada pelo usuário.
         */
        $scope.getPesquisar = function() {

            $scope.listaProdutoBusy = true;
            $timeout(function() {

                var objFiltro = $scope.filtroPesquisarProduto();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + $scope.limit + '&offset=0');

                if ($scope.listaPesquisaProdutoBusy) {
                    return;
                }

                $scope.listaPesquisaProdutoBusy = true;
                ProdutoService.produtos.get({u: strFiltro}, function(retorno) {

                    $scope.produtos                 = retorno.records;
                    $scope.listaPesquisaProdutoBusy = false;
                    $scope.listaProdutoBusy         = false;
                    $scope.flagMsg                  = true;
                });
            }, 1800);
        };

        $scope.setProdutoNFe = function (produto) {

            $scope.produto = produto;

            if($scope.params.tipEmissao == 'T'){

                GeralFactory.confirmar('Deseja adicionar esse fornecedor a lista de fornecedores desse produto?', function() {

                    var arrAuxiliar = [];
                    arrAuxiliar.push({
                        eqv_cod_pro         : $scope.produto.pro_cod_pro,
                        eqv_cod_equivalente : $scope.params.pro_cod_original,
                        eqv_cod_for         : $scope.params.cad_cod_cad
                    });

                    $scope.produto.equivalentes = arrAuxiliar;

                    console.log('produto', $scope.produto);

                    $scope.salvarProduto();
                });
            }

            $uibModalInstance.produto = $scope.produto;

            $scope.fecharModal();
        };

        $scope.salvarProduto = function () {

            ProdutoService.produto.update($scope.produto, function(resposta) {

                if (! resposta.records.error) {

                    GeralFactory.notify('success', resposta.records.title, resposta.records.msg);
                }

                $scope.flagMsg = true;
                $scope.salvarProdutoLoading = false;
            });
        };

        /**
         * Efeuta o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('ProdutoModalNCMCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'GeralFactory', 'ProdutoService',

    function($scope, $rootScope, $timeout, $uibModalInstance, GeralFactory, ProdutoService) {

        $scope.forms  = {};
        $scope.arrNCM = [];
        $scope.objNCM = {};

        $uibModalInstance.opened.then(function() {

            $scope.initialize();
            $uibModalInstance.hasAlteracao = false;

            if ($scope.params.objProduto.pro_ncm) {
                $scope.getNCM();
            }

            $scope.params.labelTela = ($scope.params.ehServico) ? 'CNAE' : 'NCM';

            console.log('$scope.params', $scope.params);
        });


        /**
         * Inicia os dados do objeto NCM.
         */
        $scope.initialize = function() {
            $scope.tipoMva = 1;
            $scope.objNCM  = {
                ncm_nro_cest              : '',
                ncm_aliq_ibpt             : 0,
                ncm_tem_icmsproprio       : 0,
                ncm_tem_icmsst            : 0,
                ncm_tem_ipi               : 0,
                ncm_tem_pis               : 0,
                ncm_tem_cofins            : 0,
                ncm_tem_iss               : 0,
                ncm_tem_ir                : 0,
                ncm_tem_ii                : 0,
                ncm_tem_inss              : 0,
                ncm_tem_csll              : 0,
                ncm_tem_fcp               : 0,
                ncm_vlr_reducao_base_calc : 0
            };
        };


        /**
         * Método responsável em alterar a visualização dos componentes de cor ou estampa
         * contidos na aba de loja virtual na tela de produtos.
         *
         * 1 - Padrão (%).
         * 2 - Pauta (R$).
         */
        $scope.trocarTipoMva = function() {

            $scope.tipoMva = ($scope.tipoMva == 1) ? 2 : 1;
        };


        /**
         * Método responsável em retornar os dados de um determinado NCM.
         */
        $scope.getNCM = function() {

            var nroNCM = $scope.params.objProduto.pro_ncm.trim(), arrNCM = [];

            arrNCM = nroNCM.split('.');
            nroNCM = arrNCM.length > 1 ? arrNCM[0] + arrNCM[1] + arrNCM[2] : arrNCM[0];

            angular.element('#ncm_nro_ncm_modal').val(nroNCM);
            
            var strFiltro = GeralFactory.formatarPesquisar({
                'ncm_nro_ncm'    : nroNCM,
                'ncm_eh_servico' : $scope.params.ehServico
            });

            ProdutoService.ncms.get({u: strFiltro}, function(retorno) {
                if (retorno.records) {
                    if (_.isEmpty(retorno.records)) {

                        $scope.initialize();
                        $timeout(function() {
                            $scope.objNCM.ncm_nro_ncm    = nroNCM;
                            $scope.objNCM.ncm_eh_servico = $scope.params.ehServico;
                        });
                    } else {

                        var objNCM = retorno.records[0];
                        objNCM.ncm_nro_ncm = GeralFactory.formatarNCM(objNCM.ncm_nro_ncm.toString());

                        $timeout(function() {
                            $scope.objNCM = objNCM;
                            $timeout(function() {
                                if (objNCM.ncm_perc_mva_padrao_contri != 0) {
                                    $scope.tipoMva = 1;
                                }

                                if (objNCM.ncm_vlr_pauta_padrao_contri != 0) {
                                    $scope.tipoMva = 2;
                                }
                            });
                        });
                    }
                }
            });
        };


        /**
         * Método responsável em salvar os dados do NCM.
         */
        $scope.salvarNCM = function() {

            var form = ($scope.params.ehServico) ? 'forms.formsCNAE' : 'forms.formsNCM';

            $scope.salvarNCMLoading = true;
            $scope.$watch(form, function(form) {
                if (form) {
                    if (form.$invalid) {

                        $scope.submitted = true;
                        $scope.salvarNCMLoading = false;

                    } else {

                        // Verificando qual tipo de MVA escolhido:
                        switch ($scope.tipoMva) {
                            case 1:
                                $scope.objNCM.ncm_vlr_pauta_padrao_contri = 0;
                                break;
                            case 2:
                                $scope.objNCM.ncm_perc_mva_padrao_contri = 0;
                                break;
                        }

                        var acao = ($scope.objNCM.ncm_seq) ? 'update' : 'create';

                        ProdutoService.ncm[acao]($scope.objNCM, function(resposta) {
                            if (! resposta.records.error) {

                                $timeout(function() {

                                    $uibModalInstance.ncm_seq      = resposta.records.ncm_seq;
                                    $uibModalInstance.hasAlteracao = true;
                                    $scope.fecharModal('reload');
                                });
                            }

                            $scope.salvarNCMLoading = false;
                        });
                    }
                }
            });
        };


        /**
         * Verifica se um determinado imposto esta assinalado ou não.
         */
        $scope.getClasseCss = function(strAttr) {

            var valor = $scope.objNCM[strAttr];
            if (valor === 1) {
                return 'btn-success'
            }

            if (valor === 0) {
                return 'btn-default';
            }
        };


        /**
         * Método responsável em inicializar o valor de um determinado imposto
         * escolhido pelo usuário na janela modal do NCM.
         */
        $scope.setImposto = function(strAttr) {

            var valor = $scope.objNCM[strAttr];
            if (valor === 1) {
                $scope.objNCM[strAttr] = 0;
            }

            if (valor === 0) {
                $scope.objNCM[strAttr] = 1;
            }
        };


        /**
         * Efeuta o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('ProdutoModalTipoEspecificoCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'GeralFactory', 'ProdutoService',

    function($scope, $rootScope, $timeout, $uibModalInstance, GeralFactory, ProdutoService) {

        $scope.objTipoProduto = {};
        $scope.arrTipoProduto = [];
        $scope.objSelecionado = null;

        $scope.forms   = {};
        $scope.objTela = {
            label   : '',
            service : {},
            include : {}
        };

        $uibModalInstance.opened.then(function() {

            $scope.novoTipo();
            $scope.initialize();
        });


        /**
         * Método responsável em iniciar o cadastro de um novo tipo de produto específico
         * quando o usuário clicar no botão novo.
         */
        $scope.novoTipo = function() {

            $scope.objSelecionado = null;
            $scope.objTipoProduto = {
                'tipo_especifico' : $scope.params.pro_tip_especifico
            };
        };


        /**
         * Método responsável em inicializar os dados da tela verificando qual o tipo
         * específico do produto escolhido pelo usuário.
         */
        $scope.initialize = function() {

            switch ($scope.objTipoProduto.tipo_especifico)
            {
                // VEÍCULOS:
                case 1:
                    $scope.getVeiculoGeneralidades();
                    $scope.objTela.label   = 'Veículos';
                    $scope.objTela.service = {
                        'name'        : 'veiculo',
                        'sequence'    : 'vei_seq',
                        'pro_cod_pro' : 'vei_pro_cod_pro'
                    };

                    $scope.objTela.include = {
                        'form' : 'produto/views/form-veiculo.html',
                        'list' : 'produto/views/lista-veiculo.html'
                    };
                    break;

                // MEDICAMENTOS:
                case 2:
                    $scope.objTela.label   = 'Medicamentos';
                    $scope.objTela.service = {
                        'name'        : 'lote',
                        'sequence'    : 'lot_seq',
                        'pro_cod_pro' : 'lot_pro_cod_pro'
                    };

                    $scope.objTela.include = {
                        'form' : 'produto/views/form-medicamento.html',
                        'list' : 'produto/views/lista-medicamento.html'
                    };
                    break;
            }

            $scope.listarTipos();
        };


        /**
         * Método responsável em inicializar as generalidades existentes para um tipo
         * de produto que seja um veículo.
         */
        $scope.getVeiculoGeneralidades = function() {

            $scope.arrTipoOperacao = [{
                'id'   :  0,
                'nome' : 'Outros'
            }, {
                'id'   :  1,
                'nome' : 'Venda concessionária'
            }, {
                'id'   :  2,
                'nome' : 'Faturamento direto para consumidor final'
            }, {
                'id'   :  3,
                'nome' : 'Venda direta para grandes consumidores'
            }];

            $scope.arrTipoCombustivel = [{
                'id'   :  1,
                'nome' : 'Álcool'
            }, {
                'id'   :  2,
                'nome' : 'Gasolina'
            }, {
                'id'   :  3,
                'nome' : 'Diesel'
            }, {
                'id'   :  16,
                'nome' : 'Álcool/Gasolina'
            }, {
                'id'   :  17,
                'nome' : 'Gasolina/Álcool/GNV'
            }, {
                'id'   :  18,
                'nome' : 'Gasolina/Elétrico'
            }];
            
            $scope.arrTipoVeiculo = [{
                'id'    :  2,
                'nome'  : 'Ciclomoto'
            }, {
                'id'   :  3,
                'nome' : 'Motoneta'
            }, {
                'id'   :  4,
                'nome' : 'Motociclo'
            }, {
                'id'   :  5,
                'nome' : 'Triciclo'
            }, {
                'id'   :  6,
                'nome' : 'Automóvel'
            }, {
                'id'   :  7,
                'nome' : 'Microônibus'
            }, {
                'id'   :  8,
                'nome' : 'Ônibus'
            }, {
                'id'   :  10,
                'nome' : 'Reboque'
            }, {
                'id'   :  11,
                'nome' : 'Semirreboque'
            }, {
                'id'   :  13,
                'nome' : 'Caminhoneta'
            }, {
                'id'   :  14,
                'nome' : 'Caminhão'
            }, {
                'id'   :  17,
                'nome' : 'C. Trator'
            }, {
                'id'   :  22,
                'nome' : 'ESP/Ônibus'
            }, {
                'id'   :  23,
                'nome' : 'Misto/CAM'
            }, {
                'id'   :  24,
                'nome' : 'CARGA/CAM'
            }];

            $scope.arrTipoPintura = [{
                'id'   : 'S',
                'nome' : 'Sólida'
            }, {
                'id'   : 'M',
                'nome' : 'Metálica'
            }, {
                'id'   : 'P',
                'nome' : 'Perolizada'
            }];

            $scope.arrEspecies = [{
                'id'   :  1,
                'nome' : 'Passageiro'
            }, {
                'id'   :  2,
                'nome' : 'Carga'
            }, {
                'id'   :  3,
                'nome' : 'Misto'
            }, {
                'id'   :  4,
                'nome' : 'Corrida'
            }, {
                'id'   :  5,
                'nome' : 'Tração'
            }, {
                'id'   :  6,
                'nome' : 'Especial'
            }];

            $scope.arrChassiRemarcado = [{
                'id'   : 'R',
                'nome' : 'Remarcado'
            }, {
                'id'   : 'N',
                'nome' : 'Normal'
            }];

            $scope.arrTipoCondicao = [{
                'id'   :  1,
                'nome' : 'Acabado'
            }, {
                'id'   :  2,
                'nome' : 'Inacabado'
            }, {
                'id'   :  3,
                'nome' : 'Semiacabado'
            }];

            $scope.arrTipoRestricao = [{
                'id'   :  0, 
                'nome' : 'Não há'
            }, {
                'id'   :  1, 
                'nome' : 'Alienação Fiduciária'
            }, {
                'id'   :  2, 
                'nome' : 'Arrendamento Mercantil'
            }, {
                'id'   :  3,
                'nome' : 'Reserva de Domínio'
            }, {
                'id'   :  4,
                'nome' : 'Penhor de Veículos'
            }, {
                'id'   :  9, 
                'nome' : 'Outras'
            }];

            $scope.arrCoresRenavam = [{
                'id'   :  1,
                'nome' : 'Amarelo'
            }, {
                'id'   :  2,
                'nome' : 'Azul'
            }, {
                'id'   :  3,
                'nome' : 'Bege'
            }, {
                'id'   :  4,
                'nome' : 'Branco'
            }, {
                'id'   :  5,
                'nome' : 'Cinza'
            }, {
                'id'   :  6,
                'nome' : 'Dourada'
            }, {
                'id'   :  7,
                'nome' : 'Grená'
            }, {
                'id'   :  8,
                'nome' : 'Laranja'
            }, {
                'id'   :  9,
                'nome' : 'Marrom'
            }, {
                'id'   :  10,
                'nome' : 'Prata'
            }, {
                'id'   :  11,
                'nome' : 'Preta'
            }, {
                'id'   :  12,
                'nome' : 'Rosa'
            }, {
                'id'   :  13,
                'nome' : 'Roxa'
            }, {
                'id'   :  14,
                'nome' : 'Verde'
            }, {
                'id'   :  15,
                'nome' : 'Vermelho'
            }, {
                'id'   :  16,
                'nome' : 'Fantasia'
            }];
        };


        /**
         * Método responsável em listar os tipos específicos de produto.
         */
        $scope.listarTipos = function() {

            var strFiltro = GeralFactory.formatarPesquisar($scope.params);

            ProdutoService.tiposEspecificos.get({u : strFiltro, tipo : $scope.objTela.service.name}, function(retorno) {
                if (retorno.records.length > 0) {

                    $timeout(function() {
                        $scope.arrTipoProduto = retorno.records;
                    });
                }
            });
        };


        /**
         * Método responsável em salvar algum tipo específico de produto.
         */
        $scope.salvarTipo = function() {

            $scope.salvarTipoEspecificoLoading = true;
            $scope.$watch('forms.formsTipoEspecifico', function(form) {
                if (form) {
                    if (form.$invalid) {

                        $scope.submitted = true;
                        $scope.salvarTipoEspecificoLoading = false;

                    } else {

                        // Código do produto dependendo do tipo escolhido pelo usuário:
                        $scope.objTipoProduto[$scope.objTela.service.pro_cod_pro] = $scope.params.pro_cod_pro;

                        $scope.objTipoProduto.tipo = $scope.objTela.service.name;

                        var strAttr = $scope.objTela.service.sequence;
                        if ($scope.objTipoProduto[strAttr]) {

                            console.log('Atualizar: ', $scope.objTipoProduto);
                            ProdutoService.tipoEspecifico.update($scope.objTipoProduto, $scope.finalizar);

                        } else {

                            console.log('Inserir: ', $scope.objTipoProduto);
                            ProdutoService.tiposEspecificos.create($scope.objTipoProduto, $scope.finalizar);
                        }
                    }
                }
            });
        };


        /**
         * Método responsável em finalizar por completo o processo de inserção ou atualização
         * de um determinado tipo de produto específico (ARMAS, MEDICAMENTOS, VEÍCULOS, ETC).
         */
        $scope.finalizar = function(retorno) {

            if (! retorno.records.error) {

                var codigo = retorno.records[$scope.objTela.service.sequence];
                $timeout(function() {
                    $scope.listarTipos();
                    $scope.getTipoProduto(parseInt(codigo));
                });
            }

            $scope.salvarTipoEspecificoLoading = false;
        };


        /**
         * Retorna os dados de um determinado tipo específico de produto.
         */
        $scope.getTipoProduto = function(codigo) {

            if ($scope.params.pro_cod_pro && codigo) {

                $scope.objSelecionado = codigo;
                var objeto = {
                    tipo_seq    : codigo,
                    tipo        : $scope.objTela.service.name,
                    pro_cod_pro : $scope.params.pro_cod_pro
                };

                ProdutoService.tipoEspecifico.get(objeto, function(retorno) {
                    if (retorno.records) {

                        var objTipoProduto  = retorno.records;
                        objTipoProduto.tipo = $scope.objTela.service.name;

                        if ($scope.params.pro_tip_especifico === 2) {

                            // Convertendo o valor da quantidade em inteiro:
                            objTipoProduto['lot_lote_qtd'] = parseInt(objTipoProduto['lot_lote_qtd']);

                            // Ajustando as datas para o valor padrão de views:
                            objTipoProduto['lot_dat_validade']   = GeralFactory.formatarDataBr(objTipoProduto['lot_dat_validade']);
                            objTipoProduto['lot_dat_fabricacao'] = GeralFactory.formatarDataBr(objTipoProduto['lot_dat_fabricacao']);
                        }

                        if ($scope.params.pro_tip_especifico === 1) {

                            // Convertendo o valor da quantidade e potência:
                            objTipoProduto['vei_qtd_saldo']    = parseFloat(objTipoProduto['vei_qtd_saldo']);
                            objTipoProduto['vei_vlr_potencia'] = parseFloat(objTipoProduto['vei_vlr_potencia']);
                        }

                        // Dados do tipo específico do produto escolhido pelo usuário:
                        $scope.objTipoProduto = objTipoProduto;

                        // Informações importantes para efetuar a atualizar de um determinado registro:
                        $scope.objTipoProduto.tipo_seq    = codigo;
                        $scope.objTipoProduto.pro_cod_pro = $scope.params.pro_cod_pro;

                        angular.element('.center-modal').scrollTop(0);
                    }
                });
            }
        };


        /**
         * Método responsável em remover os dados de um determinado tipo específico de produto
         * escolhido pelo usuário da aplicação.
         */
        $scope.cancelarTipo = function(objeto) {

            if ($scope.params.pro_cod_pro && objeto[$scope.objTela.service.sequence]) {

                GeralFactory.confirmar('Deseja remover o registro escolhido?', function() {

                    var objParams = {
                        tipo_seq    : objeto[$scope.objTela.service.sequence],
                        tipo        : $scope.objTela.service.name,
                        pro_cod_pro : $scope.params.pro_cod_pro
                    };

                    ProdutoService.tipoEspecifico.cancel(objParams, function(retorno) {
                        if (! retorno.records.error) {

                            $scope.novoTipo();
                            $scope.listarTipos();
                        }
                    });
                });
            }
        };


        /**
         * Efeuta o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('ProdutoRelatorioModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$window', '$uibModalInstance', 'GeralFactory', 'AuthTokenFactory',

    function ($scope, $rootScope, $timeout, $window, $uibModalInstance, GeralFactory, AuthTokenFactory) {

        $scope.forms       = {};
        $scope.objFiltro   = {};
        $scope.tpRelatorio = null;

        $uibModalInstance.opened.then(function () {

            $scope.objFiltro = $scope.params.objFiltro;
        });


        /**
         * Método responsável em gerar o relatório de operações de acordo com
         * o tipo escolhido pelo usuário (Sintético ou Analítico).
         */
        $scope.gerarRelatorio = function () {

            $scope.imprimirRelatorioLoading = true;
            if ($scope.tpRelatorio) {

                if ($scope.objFiltro) {

                    $scope.objFiltro['type'] = $scope.tpRelatorio;
                    $scope.objFiltro['ken']  = AuthTokenFactory.getToken();

                    $scope.objFiltro.hasOwnProperty('pro_flag_saldo') && delete $scope.objFiltro['pro_flag_saldo'];

                    var url = GeralFactory.getUrlApi() + '/erp/export/produto/estoque/?' + GeralFactory.formatarPesquisar($scope.objFiltro);

                    $window.open(url, 'Relatório');
                    $timeout(function() {

                        $scope.imprimirRelatorioLoading = false;
                        $scope.fecharModal('cancel');

                    }, 2000);
                }

            } else {

                GeralFactory.notify('danger', 'Atenção:', 'Caro usuário, escolha ao menos uma opção para gerar o relatório!');
                $scope.imprimirRelatorioLoading = false;
            }
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);

angular.module('newApp').controller('AtualizaPrecoCustoProdutoModalCtrl', [

    '$scope', '$rootScope', '$sce', '$timeout', '$modalInstance', 'ProdutoService', 'GeralFactory', '$uibModal',

    function($scope, $rootScope, $sce, $timeout, $modalInstance, ProdutoService, GeralFactory, $uibModal) {

        $modalInstance.opened.then(function() {

            console.log('$scope.params', $scope.params);

            $scope.flag_atualiza_custo_topo = true;

            $scope.arrItens = [];

            $scope.setProdutosAtualizar();
        });

        $scope.setProdutosAtualizar = function () {

            angular.forEach($scope.params, function(item, key) {

                if(item.prod.notFound == undefined) {

                    $scope.arrItens.push(item);

                    $scope.iteraFlagAtualiza();
                }
            });
        };

        $scope.iteraFlagAtualiza = function () {

            angular.forEach($scope.arrItens, function(itemm, key) {
                $timeout(function () {

                    $scope.arrItens[key].prod.flag_atualiza = $scope.flag_atualiza_custo_topo;
                },10)
            });
        };

        $scope.getJanelaProduto = function (pro_cod_pro) {

            if (pro_cod_pro) {

                var scope = $rootScope.$new();
                scope.params = {};

                scope.params.pro_cod_pro = pro_cod_pro;

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
            }
        };

        /**
         * Efeuta o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {
            
            if(str == 'continue') {
                
                var objProduto = {};

                angular.forEach($scope.arrItens, function(item, key) {
                    $timeout(function () {

                        if(item.prod.flag_atualiza) {

                            objProduto = {
                                pro_cod_pro    : item.prod.cProd,
                                pro_preco1     : item.prod.vCustoUni,
                                importando_nfe : true
                            };

                            ProdutoService.produto.update(objProduto, function(resposta) { });
                        }
                    },10)
                });

                $modalInstance.dismiss(str);
            } else {

                $modalInstance.dismiss(str);
            }
        };
    }
]);
