'use strict';

angular.module('newApp')

    .controller('LojaVirtualCtrl', [

        '$scope', '$rootScope', '$uibModal', '$timeout', '$location', 'LojaVirtualService', 'MidiaService', 'GeralFactory', 'EmpresaService', 'CupomService', 'ParamsService', 'ClienteService', 'Constantes', '$window', 'Wizard',

        function ($scope, $rootScope, $uibModal, $timeout, $location, LojaVirtualService, MidiaService, GeralFactory, EmpresaService, CupomService, ParamsService, ClienteService, Constantes, $window, Wizard) {
            $rootScope.hasAutorizacao();

            if (! $rootScope.getPermissao('17')) {
                $location.path('/');
            }

            $scope.forms    = {};
            $scope.pagina   = {};
            $scope.contato  = {};
            $scope.parcelas = {};
            $scope.template = {
                tem_ativo_novidades_aux : false,
                tem_ativo_promocoes_aux : false
            };

            $scope.flagMsg        = false;
            $scope.cupomLoading   = false;
            $scope.conteudopagina = false;

            $scope.listaTiposLoja = [{
                'id'   :  1,
                'nome' : 'Varejo'
            }, {
                'id'   :  2,
                'nome' : 'Vitrine'
            }, {
                'id'   :  3,
                'nome' : 'Orçamento'
            }];

            $scope.listaTiposExibicao = [{
                'id'   :  1,
                'nome' : 'Padrão'
            }, {
                'id'   :  2,
                'nome' : 'Evidenciar parcelamento'
            }];

            $scope.$on('$viewContentLoaded', function() {

                $scope.nomeBotao = 'Cancelar';
                $scope.contato.cto_tipo_cto_pesquisar = 1;

                LojaVirtualService.paginas.get({u : ''}, function(data) {
                    if (data.records.length) {

                        $scope.getOrdem();
                        $scope.lista_nivel_pagina = data.records;
                    }
                });

                $scope.resetCupom();
                $scope.getEmpresa();
                $scope.listarFrete();
                $scope.listarContato();
                $scope.getConfigParcelamento();

                $scope.editorOptions = {
                    language     : 'pt_br',
                    uiColor      : '#e2e2e2',
                    height       : '400px',
                    extraPlugins : 'button,panelbutton,youtube,panel,floatpanel,colorbutton'
                };

                $timeout(function () {
                    Wizard.loadWizards.initialize(17);
                }, 2000);
            });

            /**
             * Limpa o formulário de pagina e prepara para cadastrar
             */
            $scope.novaPagina = function() {

                $scope.forms.formPagina.$setPristine();
                $scope.pagina    =  {};
                $scope.show      =  false;
                $scope.nomeBotao = 'Cancelar';
                $scope.getOrdem();
            };

            /**
             * Método responsável em retornar a ordem máxima possível para
             * um determinado nível.
             */
            $scope.getOrdem = function() {
                var nivel = $scope.pagina.con_nivel;
                nivel = (nivel) ? nivel : 0;

                LojaVirtualService.pagina.getOrdem({id : nivel}, function(resposta) {
                    if (resposta.records) {

                        $scope.pagina.con_ordem = resposta.records.con_max_ordem;
                    }
                })
            };

            /**
             * Retorna um registro de uma determinada página.
             */
            $scope.getPagina = function(con_cod_con) {

                $scope.salvarPaginaLoading = false;
                LojaVirtualService.pagina.get({con_cod_con : con_cod_con}, function(data) {

                    $scope.nomeBotao = 'Excluir';
                    $scope.pagina = data.records;

                    if (data.records.con_tipo_pos_tpl === 2) {

                        $scope.pagina.con_status_aux = (data.records.con_status === 1) ? false : true;
                    }

                    if (data.records.con_conteudo) {

                        $scope.show = true;
                        $scope.pagina.con_flag_conteudo = true;

                    } else {

                        $scope.show = false;
                        $scope.pagina.con_flag_conteudo = false;
                    }
                });
            };

            /**
             * Método responsável em salvar ou atualizar os dados de uma página.
             */
            $scope.salvarPagina = function() {

                $scope.salvarPaginaLoading = true;

                var form = $scope.forms.formPagina;
                if (form == undefined) {
                    form = {};
                }

                if (form.$invalid) {

                    $scope.submitted = true;
                    $scope.salvarPaginaLoading = false;

                } else {

                    $scope.pagina.con_conteudo = ($scope.pagina.con_flag_conteudo) ? $scope.pagina.con_conteudo : '';
                    if ($scope.pagina.con_cod_con) {

                        if ($scope.pagina.con_tipo_pos_tpl === 2) {

                            $scope.pagina.con_status = ($scope.pagina.con_status_aux) ? 0 : 1;
                        }

                        LojaVirtualService.paginas.update($scope.pagina, function(resposta) {
                            if (! resposta.records.error) {

                                $scope.listarPaginas();
                                $scope.getPagina($scope.pagina.con_cod_con);
                            }

                            $scope.salvarPaginaLoading = false;
                        });
                    } else {

                        LojaVirtualService.paginas.create($scope.pagina, function(resposta) {

                            $scope.listarPaginas();
                            $scope.getPagina(resposta.records.con_cod_con);

                            LojaVirtualService.paginas.get({u : ''}, function(data) {
                                if (data.records.length) {

                                    $scope.lista_nivel_pagina = data.records;
                                }
                            });

                            $scope.salvarPaginaLoading = false;
                        });
                    }
                }
            };

            /**
             * Método responsável em listar todas as páginas.
             */
            $scope.listarPaginas = function() {

                LojaVirtualService.paginas.get({u : ''}, function(data) {
                    if (data.records.length) {

                        $scope.lista_nivel_pagina = data.records;
                        $scope.flagMsg = true;
                    }
                });
            };

            /**
             * Exclui uma determinada página ou cancela a inclusão da mesma.
             */
            $scope.cancelarPagina = function() {

                if ($scope.pagina.con_tipo_pos_tpl == 2) {

                    GeralFactory.notify('danger', 'Atenção!', 'Caro usuário, essa operação de exclusão não é permitida!');
                    return false;
                }

                if ($scope.pagina.con_cod_con == null) {

                    $scope.novaPagina();

                } else {

                    GeralFactory.confirmar('Deseja remover a página escolhida?', function() {

                        var objeto = {con_cod_con : $scope.pagina.con_cod_con};
                        LojaVirtualService.paginas.cancelar(objeto, function(retorno) {

                            $scope.novaPagina();
                            $scope.listarPaginas();
                        });
                    });
                }
            };


            /**
             * Implementação referente a aba correspondente ao módulo de BANNERS daqui em diante.
             */
            $scope.btnBanner    =  'Cancelar';
            $scope.flagBanner   =  false;
            $scope.arrBannersA1 =  [];
            $scope.arrBannersE1 =  [];
            $scope.arrBannersA2 =  [];
            $scope.arrBannersB1 =  [];
            $scope.objBanner    =  {
                mid_status_aux : true
            };

            /**
             * Método responsável em efetuar a listagem dos banners.
             */
            $scope.listarBanners = function() {

                var str = 'q=(mid_tab:3)';
                MidiaService.midias.get({u : str}, function(retorno) {

                    $scope.getPosicaoBanner(retorno);
                });
            };

            /**
             * Divide cada banner em uma posicao e coloca no vetor correspondente.
             */
            $scope.getPosicaoBanner = function(retorno) {

                $scope.arrBannersA1 = [];
                $scope.arrBannersE1 = [];
                $scope.arrBannersA2 = [];
                $scope.arrBannersB1 = [];

                if (retorno.records.length) {
                    angular.forEach(retorno.records, function (reg, i) {
                        switch (reg['mid_posicao'].trim()) {
                            case 'A1':
                                $scope.arrBannersA1.push(reg);
                                break;
                            case 'A2':
                                $scope.arrBannersA2.push(reg);
                                break;
                            case 'E1':
                                $scope.arrBannersE1.push(reg);
                                break;
                            case 'B1':
                                $scope.arrBannersB1.push(reg);
                                break;
                        }
                    });
                }
            };

            /**
             * Recolhe os dados de um determinado banner.
             */
            $scope.getBanner = function(mid_nro) {

                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.mid_posicao  = $scope.template.posicaoBanner;
                scope.params.mid_dimensao = $scope.template.dimensaoAprox;

                if (mid_nro) {

                    scope.params.mid_nro = mid_nro;
                }

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'loja-virtual/views/form-loja-virtual-banner.html',
                    controller  : 'LojaVirtualTemplateBannerModalCtrl',
                    size        : 'lg',
                    backdrop    : 'static',
                    windowClass : 'center-modal',
                    scope       :  scope,
                    resolve     :  { }
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'reload'){

                        $scope.listarBanners();
                    }
                });
            };


            /**
             * Implementação referente a aba correspondente ao módulo de TEMPLATE da loja virtual.
             */
            $scope.parcelas = {
                par_v01 : 0,
                par_i01 : 0
            };

            /**
             * Retorna os dados referente ao parcelamento da loja virtual para os produtos.
             */
            $scope.getConfigParcelamento = function() {

                ParamsService.getParametro('1|1500|1|0|0', function(retorno) {
                    if (retorno) {

                        $scope.parcelas = retorno;
                        console.log('Parcelamento: ', retorno);
                    }
                });

            };

            /**
             * Método responsável em salvar as informações refetente ao template
             * da loja virtual da empresa em questão.
             */
            $scope.salvarTemplate = function(func) {

                $scope.salvarTemplateLoading    = true;
                $scope.template.tem_st1_topo    = $scope.template.tem_st1_topo_aux    ? 1 : 0;
                $scope.template.tem_st2_topo    = $scope.template.tem_st2_topo_aux    ? 1 : 0;
                $scope.template.tem_st3_topo    = $scope.template.tem_st3_topo_aux    ? 1 : 0;
                $scope.template.tem_ativo_frete = $scope.template.tem_ativo_frete_aux ? 1 : 0;

                if ($scope.template.tem_ativo_newsletter_aux != undefined) {
                    $scope.template.tem_ativo_newsletter = $scope.template.tem_ativo_newsletter_aux ? 1 : 0;
                }

                if ($scope.template.tem_ativo_words_aux != undefined) {
                    $scope.template.tem_ativo_words = $scope.template.tem_ativo_words_aux ? 1 : 0;
                }

                if ($scope.template.tem_ativo_instagram_aux != undefined) {
                    $scope.template.tem_ativo_instagram = $scope.template.tem_ativo_instagram_aux ? 1 : 0;
                }

                EmpresaService.template.update($scope.template, function(resposta) {
                    if (! resposta.records.error) {

                        func && func.call();
                        /**
                         * $scope.forms.formsTemplate.$setPristine();
                         * $scope.getEmpresa();
                         */
                    }

                    $scope.salvarTemplateLoading = false;
                });
            };

            /**
             * Método responsável em retornar os dados da empresa.
             */
            $scope.getEmpresa = function() {

                EmpresaService.empresa.get({emp_cod_emp : '1'}, function(retorno) {

                    if (! retorno.records.error) {

                        $scope.objEmpresa = retorno.records;
                        $scope.template   = retorno.records.template;

                        $scope.template.tem_st1_topo_aux         = $scope.template.tem_st1_topo         === 1 ? true : false;
                        $scope.template.tem_st2_topo_aux         = $scope.template.tem_st2_topo         === 1 ? true : false;
                        $scope.template.tem_st3_topo_aux         = $scope.template.tem_st3_topo         === 1 ? true : false;
                        $scope.template.tem_ativo_frete_aux      = $scope.template.tem_ativo_frete      === 1 ? true : false;
                        $scope.template.tem_ativo_words_aux      = $scope.template.tem_ativo_words      === 1 ? true : false;
                        $scope.template.tem_ativo_instagram_aux  = $scope.template.tem_ativo_instagram  === 1 ? true : false;
                        $scope.template.tem_ativo_newsletter_aux = $scope.template.tem_ativo_newsletter === 1 ? true : false;
                        $scope.template.tem_ativo_promocoes_aux  = $scope.template.tem_ativo_promocoes  === 1 ? true : false;
                        $scope.template.tem_ativo_novidades_aux  = $scope.template.tem_ativo_novidades  === 1 ? true : false;

                        $scope.listarBanners();
                        $scope.setTemplate(retorno.records.template.tem_cod_template);

                        // Informações sobre as opções de pagamento da loja virtual:
                        $scope.objEmpresa.emp_ativo_gn       = retorno.records.emp_ativo_gn       == 1;
                        $scope.objEmpresa.emp_ativo_cielo    = retorno.records.emp_ativo_cielo    == 1;
                        $scope.objEmpresa.emp_ativo_pagseg   = retorno.records.emp_ativo_pagseg   == 1;
                        $scope.objEmpresa.emp_ativo_deposito = retorno.records.emp_ativo_deposito == 1;

                        // Valores de juros e multa do boleto bancário:
                        $scope.objEmpresa.emp_gn_vlr_juros = retorno.records.emp_gn_vlr_juros ? retorno.records.emp_gn_vlr_juros : 0;
                        $scope.objEmpresa.emp_gn_vlr_multa = retorno.records.emp_gn_vlr_multa ? retorno.records.emp_gn_vlr_multa : 0;

                        // Verifica se esta ativo a multa e juros do boleto:
                        $scope.objEmpresa.emp_gn_juros = retorno.records.emp_gn_juros == 1;
                        $scope.objEmpresa.emp_gn_multa = retorno.records.emp_gn_multa == 1;

                        if ($scope.objEmpresa.emp_gn_juros && $scope.objEmpresa.emp_gn_obs1.match(/juros/i)) {

                            $scope.objEmpresa.emp_str_juros = '#emp_gn_obs1';
                            angular.element($scope.objEmpresa.emp_str_juros).prop('disabled', true);
                        }

                        if ($scope.objEmpresa.emp_gn_juros && $scope.objEmpresa.emp_gn_obs2.match(/juros/i)) {

                            $scope.objEmpresa.emp_str_juros = '#emp_gn_obs2';
                            angular.element($scope.objEmpresa.emp_str_juros).prop('disabled', true);
                        }

                        if ($scope.objEmpresa.emp_gn_multa && $scope.objEmpresa.emp_gn_obs1.match(/multa/i)) {

                            $scope.objEmpresa.emp_str_multa = '#emp_gn_obs1';
                            angular.element($scope.objEmpresa.emp_str_multa).prop('disabled', true);
                        }

                        if ($scope.objEmpresa.emp_gn_multa && $scope.objEmpresa.emp_gn_obs2.match(/multa/i)) {

                            $scope.objEmpresa.emp_str_multa = '#emp_gn_obs2';
                            angular.element($scope.objEmpresa.emp_str_multa).prop('disabled', true);
                        }
                    }
                });
            };

            /**
             * Método responsável em salvar os dados da empresa.
             */
            $scope.salvarEmpresa = function(strForm) {

                $scope.salvarEmpresaLoading = true;

                $scope.objEmpresa.emp_ativo_gn       = $scope.objEmpresa.emp_ativo_gn       ? 1 : 0;
                $scope.objEmpresa.emp_ativo_cielo    = $scope.objEmpresa.emp_ativo_cielo    ? 1 : 0;
                $scope.objEmpresa.emp_ativo_pagseg   = $scope.objEmpresa.emp_ativo_pagseg   ? 1 : 0;
                $scope.objEmpresa.emp_ativo_deposito = $scope.objEmpresa.emp_ativo_deposito ? 1 : 0;

                if (strForm === 'forms.formEmpresaSocial') {

                    $scope.template.tem_ativo_promocoes = $scope.template.tem_ativo_promocoes_aux ? 1 : 0;
                    $scope.template.tem_ativo_novidades = $scope.template.tem_ativo_novidades_aux ? 1 : 0;
                }

                $scope.$watch(strForm, function(form) {
                    if (form) {
                        if (form.$invalid) {

                            $scope.submitted = true;
                            $scope.salvarEmpresaLoading = false;
                            GeralFactory.notify('danger', 'Atenção!', 'Verifique novamente os campos no formulário!');

                        } else {

                            delete $scope.objEmpresa.emp_cpf_cnpj;
                            EmpresaService.empresa.update($scope.objEmpresa, function(resposta) {
                                if (! resposta.records.error) {

                                    $scope.getEmpresa();
                                    $rootScope.setSisEmp($scope.objEmpresa);

                                    if (strForm === 'forms.formEmpresaSocial') {
                                        $timeout(function() {

                                            $scope.parcelas.par_v01 = ($scope.parcelas.par_v01) ? parseFloat($scope.parcelas.par_v01) : 0;
                                            $scope.parcelas.par_i01 = ($scope.parcelas.par_i01) ? parseInt($scope.parcelas.par_i01)   : 0;

                                            ($scope.objEmpresa.template.tem_parc_tip_exibicao || $scope.objEmpresa.template.tem_whatsapp_fone || $scope.objEmpresa.template.tem_ativo_promocoes_aux || $scope.objEmpresa.template.tem_ativo_novidades_aux) && $scope.salvarTemplate();
                                            ParamsService.param.update($scope.parcelas, function(retorno) {
                                                if (retorno.records) {

                                                    console.log('Dados do parcelamentos salvos com sucesso!');
                                                    $scope.getConfigParcelamento();
                                                }
                                            });

                                        }, 1000);
                                    }
                                }
                                $scope.salvarEmpresaLoading = false;
                            });
                        }
                    }
                });
            };

            /**
             * Atualiza as instruções do boleto quando o usuário altera o valor
             * do campo de juros ou multas contido no formulário.
             */
            $scope.upInstrucao = function(tipo) {

                switch (tipo) {
                    case 'J':
                        var strJuros = $scope.objEmpresa.emp_str_juros.replace('#', '');
                        $scope.objEmpresa[strJuros] = 'Sr. Caixa, cobrar juros de ' + angular.element('#emp_gn_vlr_juros').val() + ' ao dia após vencimento.';
                        break;

                    case 'M':
                        var strMulta = $scope.objEmpresa.emp_str_multa.replace('#', '');
                        $scope.objEmpresa[strMulta] = 'Sr. Caixa, cobrar multa de ' + angular.element('#emp_gn_vlr_multa').val() + ' após vencimento.';
                        break;
                }
            };

            /**
             * Cria automaticamente as instruções do boleto quando o usuário ativa o
             * campo de juros ou multa.
             */
            $scope.setInstrucao = function(tipo) {

                switch (tipo) {

                    // Ativando instrução para juros no boleto bancário:
                    case 'J':
                        $scope.setRegrasInstrucoes('emp_gn_juros', 'emp_str_juros', 'emp_gn_vlr_juros', tipo);
                        break;

                    // Ativando instrução para multa no boleto bancário:
                    case 'M':
                        $scope.setRegrasInstrucoes('emp_gn_multa', 'emp_str_multa', 'emp_gn_vlr_multa', tipo);
                        break;
                }
            };

            /**
             * Método responsável em inicializar as regras de juros e multas para os
             * boletos bancários contidas na tela de empresa.
             */
            $scope.setRegrasInstrucoes = function(strAtivo, strAttr, strValue, tipo) {

                var ativo = false;
                if ($scope.objEmpresa[strAtivo]) {

                    ativo = true;
                    var string = $scope.objEmpresa.emp_gn_obs1 ? '#emp_gn_obs2' : '#emp_gn_obs1', strScope = string.replace('#', '');

                    var mensagem = tipo === 'J' ? 'Sr. Caixa, cobrar juros de ' + $scope.objEmpresa[strValue] + '% ao dia após vencimento.' : 'Sr. Caixa, cobrar multa de ' + $scope.objEmpresa[strValue] + '% após vencimento.';

                    $scope.objEmpresa[strAttr]  = string;
                    $scope.objEmpresa[strScope] = mensagem;

                } else {

                    ativo = false;
                    var string = $scope.objEmpresa[strAttr].replace('#', '');

                    $scope.objEmpresa[strValue] = 0;
                    $scope.objEmpresa[string]   = '';
                }

                angular.element($scope.objEmpresa[strAttr]).prop('disabled', ativo);
            };

            /**
             * Método responsável em verificar partes do template.
             */
            $scope.setParteTemplate = function(parte, posicao) {

                console.log(parte, posicao);

                $scope.template.visivelSalvar    = true;
                $scope.template.parteTemplate    = parte;
                $scope.template.tem_cod_template = $scope.template.tem_cod_template ? $scope.template.tem_cod_template : 1;

                if (parte.match(/bann/g)) {

                    $scope.template.visivelSalvar = false;
                    $scope.template.posicaoBanner = posicao;
                    $scope.template.dimensaoAprox = GeralFactory.getDimensaoAproxBanner(posicao, $scope.template.tem_cod_template);
                }
            };

            /**
             * Lista os contatos do site, passando como parâmetro o tipo da mensagem.
             */
            $scope.listarContato = function() {

                if ($scope.contato.cto_tipo_cto_pesquisar != 3) {

                    var str = 'q=(cto_tipo_cto:' + $scope.contato.cto_tipo_cto_pesquisar + ')';
                    LojaVirtualService.contatos.get({u : str}, function(retorno) {

                        $scope.contatos = retorno.records;
                        $scope.getTemplateContato();
                    });

                } else {

                    LojaVirtualService.contatosNewsLetter.get(function(retorno) {

                        $scope.contatos = retorno.records;
                        $scope.getTemplateContato();
                    });
                }
            };

            /**
             * Exporta os emails cadastrados no newsleter.
             */
            $scope.exportarNewsLetter = function() {

                if ($scope.contato.cto_tipo_cto_pesquisar == 3) {

                    var url = GeralFactory.getUrlApi() + '/eco/cms-new/exportar-newsletter/';
                    $window.open(url, 'Relatório');
                }
            };

            /**
             * Método responsável em abrir a janela modal de contato.
             */
            $scope.getFormContato = function(cto_cod_cto) {

                var scope = $rootScope.$new();
                scope.params = {};

                if (cto_cod_cto) {

                    scope.params.cto_cod_cto = cto_cod_cto;
                }

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'loja-virtual/views/aba-loja-virtual-contato-form.html',
                    controller  : 'LojaVirtualContatoModalCtrl',
                    size        : 'lg',
                    windowClass : 'center-modal',
                    scope       :  scope,
                    resolve     :  {
                        getEnd: function() { }
                    }
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'reload') {

                        var strFiltro = 'q=(cto_tipo_cto:' + $scope.contato.cto_tipo_cto_pesquisar + ')';
                        LojaVirtualService.contatos.get({u : strFiltro}, function(data) {

                            $scope.contatos = data.records;
                        });
                    }
                });
            };

            /**
             * Retorna o template da aba de contato.
             */
            $scope.getTemplateContato = function() {

                if ($scope.contato.cto_tipo_cto_pesquisar != undefined && $scope.contato.cto_tipo_cto_pesquisar == 1) {

                    return 'grid-tipo-cto-1';

                } else if ($scope.contato.cto_tipo_cto_pesquisar != undefined && $scope.contato.cto_tipo_cto_pesquisar == 2) {

                    return 'grid-tipo-cto-2';

                } else {

                    return 'grid-tipo-cto-3';
                }
            };

            /**
             * Método responsável em recolher o código do template selecionado pelo
             * usuário da aplicação.
             */
            $scope.slideChange = function() {

                var slideAtivo = angular.element('.slick-active');
                if (slideAtivo) {

                    var codTemplate = slideAtivo.find('input').val();
                    $scope.template.tem_cod_template = codTemplate;
                }
            };

            /**
             * Método responsável em retornar os templates disponíveis para escolha
             * por parte do usuário da aplicação.
             */
            $scope.getTemplates = function() {
                return [{
                    id   : 1,
                    nome : 'Template 1 (Rosa e Preto (1 banner)'
                }, {
                    id   : 2,
                    nome : 'Template 2 (Rosa e Preto (2 banners)'
                }, {
                    id   : 3,
                    nome : 'Template 3 (Azul e Branco)'
                }, {
                    id   : 4,
                    nome : 'Template 4 (Preto e Marrom, com Sidebar)'
                }];
            };

            /**
             * Método responsável em verificar qual template foi escolhido pelo usuário
             * para efetuar o carregamento do mesmo em primeiro plano no slider.
             */
            $scope.setTemplate = function(template) {

                var arrTemplates = $scope.getTemplates();
                if (template) {

                    var arrSelected = [], arrNoSelected = [];
                    angular.forEach(arrTemplates, function(i, j) {
                        (i.id === template) ? arrSelected.push(i) : arrNoSelected.push(i);
                    });

                    arrTemplates = arrSelected.concat(arrNoSelected);
                }

                $timeout(function() {

                    $rootScope.arrTemplates = arrTemplates;
                    $rootScope.dataLoaded   = true;

                    $scope.$apply(function() {
                        $.getScript('../app/components/loja-virtual/controllers/helpers/lista-loja-virtual-template.js');
                    });
                }, 700);
            };

            /**
             * Método responsável em efetuar a abertura da janela modal contendo o
             * formulário para upload do favicon para a loja virtual.
             */
            $scope.getFormFavicon = function(emp_cod_emp) {
                if (emp_cod_emp) {

                    var scope = $rootScope.$new();

                    scope.params = {};
                    scope.params.emp_cod_emp = emp_cod_emp;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl :  'empresa/views/favicon.html',
                        controller  :  'EmpresaFaviconUploadCtrl',
                        windowClass :  'center-modal',
                        scope       :  scope,
                        resolve     :  {
                            getEnd: function() { }
                        }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'cancel') { }
                    });
                }
            };


            /**
             * ----------------------------------------------------------------
             * Implementação referente a aba correspondente ao módulo de FRETE.
             * ----------------------------------------------------------------
             */
            $scope.newItem = {};
            $scope.frete   = {
                itens    : [],
                selected : {}
            };

            /**
             * Método responsável em salvar os dados do frete.
             */
            $scope.salvarFrete = function() {

                $scope.salvarFreteLoading = true;
                $scope.salvarTemplate(function() {

                    EmpresaService.fretes.create($scope.frete, function(resposta) {
                        if (! resposta.records.error) {

                            $scope.listarFrete();
                        }

                        $scope.salvarFreteLoading = false;
                    });
                });
            };

            /**
             * Método responsável em adicionar um novo item no objeto de frete.
             */
            $scope.addItemFrete = function() {

                $scope.newItem = {};
                $scope.frete.itens.push(angular.copy($scope.newItem));
                $scope.newItem = {};

                angular.element('html, body').animate({scrollTop : $(document).height()}, 1000);
            };

            /**
             * Retorna o template a ser utilizado na aba de frete.
             */
            $scope.getTemplate = function(item, k) {

                return 'edit';
            };

            /**
             * Método responsável em listar os fretes cadastrados na loja virtual.
             */
            $scope.listarFrete = function() {

                var strFiltro = '';
                EmpresaService.fretes.get({u : strFiltro}, function(resposta) {

                    $scope.frete.itens = resposta.records;

                    angular.forEach($scope.frete.itens, function(item, chave) {
                        var cep = item.frt_cep_mascara;
                        if (cep != null && cep != '') {

                            var arrCep = GeralFactory.getCepFretePartido(cep);
                            $scope.frete.itens[chave].frt_cep_mascara_1 = arrCep[0];
                            $scope.frete.itens[chave].frt_cep_mascara_2 = arrCep[1];
                            $scope.frete.itens[chave].frt_cep_mascara_3 = arrCep[2];
                        }
                    });
                });
            };

            /**
             * Remove um item da listagem de frete.
             */
            $scope.removerItem = function($index) {

                $scope.frete.itens.splice($index, 1);
            };


            /**
             * ----------------------------------------------------------------
             * Implementação referente a aba correspondente ao módulo de CUPOM.
             * ----------------------------------------------------------------
             */

            $scope.arrCupons        = [];
            $scope.objPesquisaCupom = {
                texto_cupom_pesquisar : ''
            };

            /**
             * Método responsável em inicializar ou resetar os dados do cupom.
             */
            $scope.resetCupom = function() {

                $scope.objCupom = {
                    cup_vlr_desconto  : 0,
                    cup_perc_desconto : 0,
                    clienteSelect     : ''
                };
            };

            /**
             * Prepara o formulário para um novo registro.
             */
            $scope.novoCupom = function () {

                $scope.forms.formCupom.$setPristine();
                $scope.cupCodCupSelected = null;
                $scope.resetCupom();
            };

            /**
             * Método responsável em listar os cupons de desconto.
             */
            $scope.listarCupom = function() {

                $rootScope.spinnerList.on();
                $scope.arrCupons = [];

                var objFiltro = {
                    'texto_cupom_pesquisar' : $scope.objPesquisaCupom.texto_cupom_pesquisar
                };

                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=0');

                CupomService.buscaCupons.get({u : strFiltro}, function(retorno) {
                    if (retorno.records.length > 0) {

                        $timeout(function() {
                            $scope.arrCupons = retorno.records;
                            $rootScope.spinnerList.off();
                        });
                    } else {

                        $rootScope.spinnerList.off();
                    }
                });
            };

            /**
             * Método responsável efetuar a paginação dos clientes.
             */
            $scope.paginarCupons = function() {

                $rootScope.spinnerList.on();

                var objFiltro = {
                    'texto_cupom_pesquisar' : $scope.objPesquisaCupom.texto_cupom_pesquisar
                };

                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=' + $scope.getOffset());

                CupomService.buscaCupons.get({u : strFiltro}, function(retorno) {
                    if (retorno.records.length > 0) {

                        angular.forEach(retorno.records, function(item) {
                            $scope.arrCupons.push(item);
                        });

                        $timeout(function() {
                            $rootScope.spinnerList.off();
                        });
                    } else {

                        $rootScope.spinnerList.off();

                        var mensagem = 'Caro usuário, a listagem dos cupons já se encontra completa!';
                        GeralFactory.notify('warning', 'Atenção:', mensagem);
                    }
                });
            };

            /**
             * Retorna o limite de registros para a paginação.
             */
            $scope.getOffset = function() {

                return ($scope.arrCupons.length) ? $scope.arrCupons.length : 0;
            };


            /**
             * Insere ou atualiza os dados de um cupom.
             */
            $scope.salvarCupom = function(cup_nro_cup) {

                $scope.cupomLoading = true;

                var form = $scope.forms.formCupom;
                if (form.$invalid) {

                    $scope.submitted = true;
                    $scope.cupomLoading = false;

                } else {
                    if (cup_nro_cup) {

                        CupomService.cupons.update($scope.objCupom, function(retorno) {

                            $scope.listarCupom();
                            $scope.getCupom(cup_nro_cup);
                            $scope.cupomLoading = false;
                        });
                    } else {

                        CupomService.cupons.create($scope.objCupom, function(retorno) {

                            $scope.objCupom.cup_nro_cup = retorno.records.cup_nro_cup;

                            $scope.getCupom($scope.objCupom.cup_nro_cup);
                            $scope.listarCupom();

                            $scope.cupomLoading = false;
                        });
                    }
                }
            };

            /**
             * Cancela um determinado cupom escolhido pelo usuário.
             */
            $scope.cancelarCupom = function () {

                if ($scope.objCupom.cup_nro_cup == null) {

                    $scope.novoCupom();

                } else {

                    GeralFactory.confirmar('Deseja remover o cupom escolhido?', function() {

                        var objeto = {cup_nro_cup : $scope.objCupom.cup_nro_cup};
                        CupomService.cupons.cancelar(objeto, function(retorno) {

                            $scope.listarCupom();
                            $scope.novoCupom();
                        });
                    });
                }
            };

            /**
             * Retorna um registro do cupom
             */
            $scope.getCupom = function(cup_nro_cup) {

                $scope.cupCodCupSelected = cup_nro_cup;
                CupomService.cupons.get({u : cup_nro_cup}, function(retorno) {

                    $scope.nomeBotao = 'Excluir';
                    $scope.objCupom  =  retorno.records;

                    $scope.objCupom.cup_cad_cod_cad && $scope.getCliente($scope.objCupom.cup_cad_cod_cad);
                });
            };

            /**
             * Obtém dados de um determinado cliente.
             */
            $scope.getCliente = function(cad_cod_cad) {

                ClienteService.cliente.get({cad_cod_cad : cad_cod_cad}, function(retorno) {

                    var objCliente = retorno.records;
                    $scope.objCupom.clienteSelect = objCliente.cad_nome_razao;
                });
            };

            /**
             * Adiciona um cliente pelo plugin de autocomplete.
             */
            $scope.addCliente = function(termo) {

                var objCliente = {
                    'cad_pf_pj'       : 1,
                    'cad_eh_inativo'  : 0,
                    'cad_nome_razao'  : termo.trim(),
                    'cad_tip_cli_for' : 1
                };

                ClienteService.clientes.create(objCliente, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.objCupom.clienteSelect   = termo.trim();
                        $scope.objCupom.cup_cad_cod_cad = retorno.records.cad_cod_cad;
                    }
                });
            };

            /**
             * Método responsável em selecionar um determinado cliente.
             */
            $scope.onSelectCliente = function($item) {

                $scope.getCliente($item.cad_cod_cad);

                $scope.objCupom.clienteSelect   = $item.cad_nome_razao;
                $scope.objCupom.cup_cad_cod_cad = $item.cad_cod_cad;
            };
        }
    ]);
