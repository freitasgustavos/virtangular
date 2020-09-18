'use strict';

var imp;

angular.module('newApp')

    .controller('TransporteCtrl', [

        '$scope', '$rootScope', '$uibModal', '$timeout','$sce', '$filter','$location', '$window', 'TransporteService', 'VendaService', 'NotaLogService',  'ParamsService', 'ClienteService', 'EmpresaService', 'GeralFactory', 'CONFIG', 'AuthTokenFactory','prompt', 'Storage', 'NotifyFlag', 'UsuarioService', 'Constantes','ImpostoFactory',

        function ($scope, $rootScope, $uibModal, $timeout, $sce, $filter, $location, $window, TransporteService, VendaService, NotaLogService, ParamsService, ClienteService, EmpresaService, GeralFactory, CONFIG, AuthTokenFactory,prompt, Storage, NotifyFlag, UsuarioService, Constantes, ImpostoFactory) {
            $rootScope.hasAutorizacao();

            $scope.$on('$viewContentLoaded', function () {

                $scope.siglaTutorial               = 'FRE';
                $scope.labelTutorial               = 'Cadastro de novos fretes';

                /**
                 * Spinner utilizado em todas as listagens do sistema.
                 */
                $scope.spinnerVerificaSisEmp = {
                    active : false,
                    on  : function() {
                        this.active = true;
                    },
                    off : function() {
                        this.active = false;
                    }
                };

                $scope.spinnerVerificaSisEmp.on();

                /* Busca os dados da empresa */
                $scope.setEmpresa();

                $scope.forms = {};

                //console.log('$scope.frete', $scope.frete);

                $scope.newNotasFiscais = {};
                $scope.newDocAnterior  = {};
                $scope.totalNotas      = {};

                $scope.remetente    = {};
                $scope.tomador      = {};
                $scope.destinatario = {};
                $scope.recebedor    = {};

                $scope.arrFase     = [];
                $scope.arrUsuarios = [];
                $scope.resetVars();

                $scope.listarFase();
                $scope.nomeBotao = 'Cancelar';
                $scope.setAbaInicial(1,3);

                $scope.getUsuarios();

                $scope.newTributoFrete = true;

                /**
                 * Obtém os dados na tabela de parametros de: vendedor, centro de custo, natureza,
                 * forma de pagamento e preenche todos os dropdowns contidos na tela.
                 */
                ParamsService.getParametros('6035', function(data) {

                    $scope.arr_6020 = [{'par_c01' : 'Fretes', 'par_pai' : '1'}];
                    if (data) {
                        //console.log(data);
                        //console.log(data['arr_6035']);
                        $scope.arr_6035 = data['arr_6035'];
                    }

                });

                $scope.flagTutorial = true;

                // $scope.hasBoleto();
                // $scope.getCentroCustoFrete();
                // $scope.getFormaPagamentoFrete();
                // $scope.getContaFinanceiraFrete();
                // $scope.getUsuarios();
                $scope.listarFretes();
                $scope.listarImpostos(function() {

                    angular.forEach($scope.frete.tributos, function(reg,i) {

                        imp = GeralFactory.getRegistroPorChave($scope.arrImposto,reg['tri_imp_cod_imp'],'imp_cod_imp');
                        $scope.frete.tributos[i].nomeImposto = imp['imp_descricao'];

                        ////console.log('itt88:',$scope.frete.tributos);

                    });
                });

                // $timeout(function() {
                //     $scope.clicarConclusao();
                // },400);

                $scope.blurAtributoAtivo = false;
                $scope.objPeriodicidade = [{
                    'id'        : 0,
                    'sigla'     : 'N',
                    'descricao' : 'Nenhuma'
                }, {
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
                }];

                // $scope.listarCfop();

                $scope.habilitaEnter();
            });

            /**
             * Funções para setar as abas principais ativas
             *
             */
            $scope.setEtapaEnvolvidos = function() {
                $timeout(function() {
                    angular.element('.sf-nav-step-0').trigger('click');
                }, 100);
            };

            $scope.setEtapaDocumentos = function() {
                $timeout(function() {
                    angular.element('.sf-nav-step-1').trigger('click');
                }, 100);
            };

            $scope.setEtapaConclusao = function() {
                $timeout(function() {
                    angular.element('.sf-nav-step-2').trigger('click');
                    $scope.setAbaInicial(1,4);
                }, 100);
            };

            /**
             * Método responsável em manipular os campos do tipo TAG referentes ao
             * campo situação da nota contido no formulário de pesquisa.
             */
            $scope.manipularSituacoesFrete = function(objSituacao) {

                var arrSitSelecionadas = $scope.pesquisarFrete.arrSitSelecionadas;
                if (arrSitSelecionadas.length === 0) {

                    // Inicializando o vetor com as contas financeiras escolhidas para a pesquisa:
                    arrSitSelecionadas.push(objSituacao.par_pai);

                } else {

                    // Removendo o item escolhido caso o mesmo já exista no vetor:
                    var keepGoing = true;
                    angular.forEach(arrSitSelecionadas, function(i, j) {
                        if (keepGoing) {
                            if (i === objSituacao.par_pai) {
                                arrSitSelecionadas.splice(j, 1);
                                keepGoing = false;
                            }
                        }
                    });

                    // Adiciona o item escolhido caso o mesmo não exista no vetor:
                    keepGoing && arrSitSelecionadas.push(objSituacao.par_pai);
                    $scope.pesquisarFrete.arrSitSelecionadas = arrSitSelecionadas;

                    //console.log('$scope.pesquisarFrete', $scope.pesquisarFrete);
                }
            };

            /**
             * Verifica se a situação está selecionada para efetuar a pesquisa.
             */
            $scope.inSituacoes = function(objSituacao) {

                var keepGoing = true;
                angular.forEach($scope.pesquisarFrete.arrSitSelecionadas, function(i, j) {
                    if (keepGoing) {
                        if (i === objSituacao.par_pai) {
                            keepGoing = false;
                        }
                    }
                });

                return !keepGoing;
            };

            /**
             * Retorna um objeto contendo os filtros utilizados na busca.
             */
            $scope.filtroPesquisarFrete = function() {

                var strAcoes = GeralFactory.getStringFiltroOffArray($scope.pesquisarFrete.acoes, 'id');

                var strFases = GeralFactory.getStringFiltroOffArray($scope.pesquisarFrete.fases, 'par_pai');

                var strSituacoes = '';
                if ($scope.pesquisarFrete.arrSitSelecionadas.length) {

                    strSituacoes = $scope.pesquisarFrete.arrSitSelecionadas.join('|');
                }

                var textoPesquisa = GeralFactory.replaceArray($scope.pesquisarFrete.texto_venda_pesquisar, ['.', '/', '-'], '');
                return {
                    'vendas_validas'        : 1,
                    'arr_acoes'             : strAcoes,
                    'arr_situacoes'         : strSituacoes,
                    'texto_venda_pesquisar' : (textoPesquisa) ? textoPesquisa : '',
                    'dt_lan_inicio'         : ($scope.pesquisarFrete.dt_lan_inicio)       ? $scope.pesquisarFrete.dt_lan_inicio       : '',
                    'dt_lan_final'          : ($scope.pesquisarFrete.dt_lan_final)        ? $scope.pesquisarFrete.dt_lan_final        : '',
                    'doc_nro_inicio'        : ($scope.pesquisarFrete.doc_nro_inicio)      ? $scope.pesquisarFrete.doc_nro_inicio      : '',
                    'doc_nro_final'         : ($scope.pesquisarFrete.doc_nro_final)       ? $scope.pesquisarFrete.doc_nro_final       : '',
                    'arr_esp_doc'           : ($scope.pesquisarFrete.fin_6030_esp_doc)    ? $scope.pesquisarFrete.fin_6030_esp_doc    : '',
                    'fin_usu_cod_usuario'   : ($scope.pesquisarFrete.fin_usu_cod_usuario) ? $scope.pesquisarFrete.fin_usu_cod_usuario : ''
                };
            };

            /**
             * Retorna uma lista de operações baseada no filtro utilizado pelo usuário.
             */
            $scope.getPesquisarFrete = function(event) {

                if (! GeralFactory.inArray(event.which, Constantes.KEYS)) {
                    $timeout(function() {
                        $scope.listarFretes();
                    }, 500);
                }
            };

            /**
             * Habilita o enter para fazer a função que o TAB já tem
             */
            $scope.habilitaEnter = function () {

                $(document).on('keypress', 'input,select', function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        // Get all focusable elements on the page
                        var $canfocus = $(':focusable');
                        var index = $canfocus.index(this) + 1;
                        if (index >= $canfocus.length) index = 0;
                        $canfocus.eq(index).focus();
                    }
                });
            };

            /**
             * libera o botão para que o cliente possa adicionar a nfe ao cte
             */
            $scope.liberarAddNFe = function () {

                if(!$scope.newNotasFiscais.ctd_6030_esp_doc_ref
                    || !$scope.frete.cte_carga_prod_pred
                    || !$scope.newNotasFiscais.ctd_vlr_peso
                    || !$scope.newNotasFiscais.ctd_qtd_volume
                    || !$scope.newNotasFiscais.ctd_vlr_nota
                    || !$scope.newNotasFiscais.ctd_doc_chave
                    || ($scope.newNotasFiscais.ctd_doc_chave.length != 44)) {

                    $scope.liberarNfe = false;
                } else {

                    $scope.liberarNfe = true;
                }
            };

            /**
             * libera o botão para que o cliente possa adicionar o doc anterior ao cte
             */
            $scope.liberarAddDocAnterior = function () {

                if(!$scope.newDocAnterior.ctd_doc_chave
                    || ($scope.newDocAnterior.ctd_doc_chave.length != 44)
                    || !$scope.newDocAnterior.ctd_cad_cod_cad) {

                    $scope.liberarDocAnterior = false;
                } else {

                    $scope.liberarDocAnterior = true;
                }
            };


            /**
             * Adciona uma NFe ao array de notas fiscais do CTe
             */
            $scope.addNotaFiscal = function () {

                if($scope.inArrayNfe()) {

                    GeralFactory.notify('warning', 'Atenção!', 'Essa nota já foi adicionada!');
                    return;
                }

                $scope.liberarNfe = false;

                //console.log('$scope.newNotasFiscais', $scope.newNotasFiscais);

                $scope.frete.notas_fiscais.push($scope.newNotasFiscais);
                //console.log('$scope.frete', $scope.frete.notas_fiscais);

                $scope.newNotasFiscais = {};
                $scope.newNotasFiscais.ctd_6030_esp_doc_ref = 55;

                $timeout(function () {

                    $scope.totalizaNotasFiscais();
                }, 500)
            };

            /**
             * Verifica se determinada nota já está no array de notas
             * @returns {boolean}
             */
            $scope.inArrayNfe = function () {

                var retorno = false;

                if($scope.frete.notas_fiscais.length) {

                    angular.forEach($scope.frete.notas_fiscais, function(nota, key) {

                        retorno = (nota.ctd_doc_chave == $scope.newNotasFiscais.ctd_doc_chave);

                        if(retorno) {

                            return retorno;
                        }
                    });
                }

                return retorno;
            };

            /**
             * Adciona um Documento anterior ao array de documentos fiscais do CTe
             */
            $scope.addDocAnterior = function () {

                //console.log('frete', $scope.frete);

                $scope.liberarDocAnterior = false;

                $scope.newDocAnterior.ctd_6030_esp_doc_ref = 57;

                //console.log('$scope.newDocAnterior', $scope.newDocAnterior);
                $scope.frete.doc_anteriores.push($scope.newDocAnterior);
                $scope.atualizaDocAnterior();
                $scope.newDocAnterior = {};
            };

            $scope.atualizaDocAnterior = function () {

                $timeout(function () {
                    angular.forEach($scope.frete.doc_anteriores, function(doc, key) {

                        $scope.frete.doc_anteriores[key].ctd_seq = key + 1;
                    });
                }, 200);
            };

            /**
             * Totaliza as notas fiscais para exibição ao usuário
             */
            $scope.totalizaNotasFiscais = function () {

                if($scope.frete.notas_fiscais.length) {

                    $scope.totalNotas.notas_lancadas = 0;
                    $scope.totalNotas.volume_total   = parseFloat(0);
                    $scope.totalNotas.peso_total     = parseFloat(0);
                    $scope.totalNotas.total_notas    = parseFloat(0);

                    angular.forEach($scope.frete.notas_fiscais, function(nota, key) {

                        $scope.frete.notas_fiscais[key].ctd_seq = key + 1;

                        //console.log('nota', nota);

                        $scope.totalNotas.notas_lancadas = $scope.frete.notas_fiscais.length;
                        $scope.totalNotas.volume_total   += parseFloat(nota.ctd_qtd_volume);
                        $scope.totalNotas.peso_total     += parseFloat(nota.ctd_vlr_peso);
                        $scope.totalNotas.total_notas    += parseFloat(nota.ctd_vlr_nota);

                        //console.log('$scope.totalNotas', $scope.totalNotas);
                    });
                }

                $('#ctd_doc_chave').focus();
            };

            /**
             * Soma os valores informados e lança no total do frete
             */
            $scope.getTotalFrete = function () {

                var totalFrete = 0;

                totalFrete += ($scope.frete.cte_doc_vlr_prest) ? parseFloat($scope.frete.cte_doc_vlr_prest) : 0;
                totalFrete += ($scope.frete.cte_vlr_seguro)    ? parseFloat($scope.frete.cte_vlr_seguro)    : 0;
                totalFrete += ($scope.frete.cte_vlr_pedagio)   ? parseFloat($scope.frete.cte_vlr_pedagio)   : 0;
                totalFrete += ($scope.frete.cte_vlr_outros)    ? parseFloat($scope.frete.cte_vlr_outros)    : 0;
                totalFrete += ($scope.frete.ite_vlr_tot_impostos_retidos) ? $scope.frete.ite_vlr_tot_impostos_retidos : 0;

                $scope.frete.cte_doc_vlr_rec = parseFloat(totalFrete);

                if($scope.newTributoFrete) {
                    $timeout(function () {
                        $scope.setTributoFrete();
                    }, 200)
                }
            };

            /**
             * Remove um uma nota do objeto de notas do cte
             */
            $scope.removeNota = function(nota){

                var index = $scope.frete.notas_fiscais.indexOf(nota);
                $scope.frete.notas_fiscais.splice(index, 1);

                $timeout(function () {

                    $scope.totalizaNotasFiscais();
                }, 500)
            };

            $scope.removeDocAnterior = function(doc){

                var index = $scope.frete.doc_anteriores.indexOf(doc);
                $scope.frete.doc_anteriores.splice(index, 1);

                $timeout(function () {
                    $scope.atualizaDocAnterior();
                }, 200)
            };

            /**
             * Verifica se os endereços estão devidamente preenchidos
             * @returns {boolean}
             */
            $scope.verificaEnderecos = function () {
                if(!$scope.remetente.endereco) {
                    return false;
                }
                if(!$scope.destinatario.endereco) {
                    return false;
                }
                if(!$scope.remetente.endereco.end_endereco_uf) {
                    return false;
                }
                if(!$scope.destinatario.endereco.end_endereco_uf) {
                    return false;
                }
                return true;
            };

            /**
             * Seta as mensagens padrões do CTe
             */
            $scope.setMensagensPadrao = function () {

                $scope.setTomador();

                var msg = '';

                if($scope.empresa.tipCs == 1) {
                    msg += 'Documento emitido por ME ou EPP optante pelo Simples Nacional;';
                }

                if ($scope.empresa.emp_cod_csosn == 102) {

                    msg += 'Não gera direito a crédito fiscal de ICMS;';
                } else if ($scope.empresa.emp_aliq_icms_aprov) { //$scope.empresa.emp_cod_csosn == 101 &&

                    //se a soma liquida dos itens cso 101 for maior que zero e o cliente for contribuinte
                    if ($scope.frete.cte_doc_vlr_rec > 0 && $scope.tomador.cad_tip_contribuinte != 9) {

                        //console.log('valor aprov eh maior q zero');
                        var vlrAproveitamento = $scope.frete.cte_doc_vlr_rec * ($scope.empresa.emp_aliq_icms_aprov / 100);
                        msg += 'Permite o aproveitamento do crédito de ICMS no valor de R$' + GeralFactory.toReais(vlrAproveitamento) + ' correspondente à alíquota de ' + $scope.empresa.emp_aliq_icms_aprov + '%, nos termos do Artigo 23 da LC 123;';
                    }
                }

                $scope.frete.fin_observacao = msg;
            };


            /**
             * Gera o ICMS no frete com base nos dados passados anteriormente
             */
            $scope.setTributoFrete = function () {

                //console.log('entrou na setTributoFrete');

                var freteOrigem = '', aliq = 0, cstCso = '90';

                //trata o começo do serviço quando começar fora do estado
                if($scope.verificaEnderecos()) {

                    var ufInicio = $scope.remetente.endereco.end_endereco_cod_uf,
                        ufDestino  = $scope.destinatario.endereco.end_endereco_cod_uf,
                        ufEmitente = $scope.empresa.emp_cod_uf;

                    if((ufInicio == ufEmitente) && (ufDestino == ufEmitente)) {

                        freteOrigem = 'ehMesmoEstado';

                    } else if((ufInicio != ufEmitente) && (ufDestino == ufEmitente)) {

                        freteOrigem = 'comecaForaEstado';
                    } else if((ufInicio == ufEmitente) && (ufDestino != ufEmitente)) {

                        freteOrigem = 'comecaDentroEstado';
                    } else {

                        freteOrigem = 'ehForaEstado';
                    }
                } else {

                    GeralFactory.notify('warning', 'Atenção!', 'Confirme o endereço do Remetente e do Destinatário');
                    //Seta o valor do frete para zero para obrigar o usuário a digitar o valor novamente
                    $scope.frete.cte_doc_vlr_rec = 0;
                    $scope.setEtapaEnvolvidos();
                    return;
                }

                //console.log('freteOrigem: ', freteOrigem);

                switch (freteOrigem)
                {

                    case 'ehMesmoEstado':

                        aliq   = 0;
                        cstCso = '40';
                        $scope.frete.fin_cfo_cfop = $scope.listaCfo[1].cfo_cfop;

                        break;

                    case 'comecaDentroEstado':

                        aliq   = $scope.aliqInterIcms[$scope.destinatario.endereco.end_endereco_uf][$scope.remetente.endereco.end_endereco_uf];
                        cstCso = '00';
                        $scope.frete.fin_cfo_cfop = $scope.listaCfo[1].cfo_cfop;

                        break;

                    case 'comecaForaEstado':

                        aliq   = $scope.aliqInterIcms[$scope.remetente.endereco.end_endereco_uf][$scope.destinatario.endereco.end_endereco_uf];
                        cstCso = '00';
                        $scope.frete.fin_cfo_cfop = $scope.listaCfo[4].cfo_cfop;

                        break;

                    case 'ehForaEstado':

                        aliq   = $scope.aliqInterIcms[$scope.remetente.endereco.end_endereco_uf][$scope.destinatario.endereco.end_endereco_uf];
                        cstCso = '90';
                        $scope.frete.fin_cfo_cfop = $scope.listaCfo[4].cfo_cfop;

                        break;
                }

                if($scope.empresa.tipCs == 1) {

                    aliq   = 0;
                    cstCso = '102';
                    $scope.setIcms(cstCso, aliq);
                }

                $timeout(function () {
                    $scope.getTotalTributo(aliq);
                    $scope.setMensagensPadrao();
                }, 500)

            };

            /**
             * Seta o ICMS padrão no CTe
             * @param cstCso
             * @param aliqota
             */
            $scope.setIcms = function (cstCso, aliqota) {

                var icms = {
                    labelDiffBc                : 'Diferença de BC (%)',
                    labelAliq                  : 'Alíquota',
                    tri_imp_cod_imp            : 1,
                    tri_eh_retido_aux          : false,
                    tri_naotrib_tip            : '0',
                    tri_imp_vlr_diferenca      : 0,
                    tri_naotrib_vlr            : 0,
                    tri_bc_perc_mva            : 0,
                    tri_bc_perc_reducao        : 0,
                    tri_bc_vlr_bruto           : 0,
                    tri_aliq_perc              : aliqota,
                    tri_cst                    : cstCso,
                    tri_cso                    : cstCso,
                    tri_imp_vlr_bruto          : 0,
                    tri_imp_vlr_liquido        : 0,
                    tri_bc_vlr_liquido         : 0,
                    tri_eh_retido              : 0,
                    nomeImposto                : 'ICMS Próprio'
                };

                //remove o campo conforme o perfil tributário da empresa
                ($scope.empresa.tipCs == 1) ? delete icms.tri_cst : delete icms.tri_cso;

                $scope.frete.tributos[0] = icms;

                //console.log('setIcms: ', $scope.frete.tributos);
            };

            /**
             * Calcula o valor do IBPT conforme a aliquota informada
             */
            $scope.getTotalIbpt = function () {

                $scope.frete.cte_vlr_ibpt = $scope.frete.cte_doc_vlr_rec * ($scope.frete.cte_aliq_ibpt / 100);
            };

            /**
             * Totaliza o ICMS lançado automaticamente no frete
             * @param aliq
             */
            $scope.getTotalTributo = function (aliq) {

                if($scope.frete.cte_doc_vlr_rec) {

                    $scope.frete.tributos[0].tri_imp_vlr_bruto  = $scope.frete.tributos[0].tri_imp_vlr_liquido = parseFloat($scope.frete.cte_doc_vlr_rec * (aliq / 100));
                    $scope.frete.tributos[0].tri_bc_vlr_liquido = (aliq) ? parseFloat($scope.frete.cte_doc_vlr_rec) : 0;
                }
            };

            /**
             * Lista os CFOPs no banco diante de algum filtro
             */
            $scope.listarCfop = function() {

                var objCfop = {
                    'cfo_6020_natureza' : $scope.frete.fin_6020_natureza
                };

                if($scope.remetente.endereco && $scope.destinatario.endereco) {

                    if($scope.remetente.endereco.end_endereco_cod_uf != $scope.empresa.emp_cod_uf) {

                        // objCfop.cfo_eh_fora_estado = 1;
                        $scope.frete.eh_fora_estado = 1;

                        if($scope.destinatario.endereco.end_endereco_cod_uf == $scope.empresa.emp_cod_uf) {

                            // objCfop.cfo_eh_fora_estado = 0;
                        }

                    } else {

                        // objCfop.cfo_eh_fora_estado = 0;
                        $scope.freteTmp.eh_fora_estado = 0;

                        if($scope.destinatario.endereco.end_endereco_cod_uf != $scope.empresa.emp_cod_uf) {

                            // objCfop.cfo_eh_fora_estado = 1;
                        }
                    }

                } else {
                    console.log('DESTINATÁRIO OU REMETENTE SEM ENDEREÇO!')
                }

                $timeout(function () {

                    console.log('objCfop: ', objCfop);

                    var strCfop = GeralFactory.formatarPesquisar(objCfop);

                    ParamsService.cfops.get({u : strCfop}, function(resposta) {

                        $scope.listaCfo = resposta.records;
                    });
                },300)
            };

            /**
             * Busca a tabela de alíquotas interestaduais do ICMS
             */
            $scope.listarAliquotasInterestaduisIcms = function () {

                TransporteService.impostos.aliqInterIcms(function (retorno) {

                    $scope.aliqInterIcms = retorno.records;
                });
            };

            /**
             *
             */
            $scope.getUsuarios = function() {

                UsuarioService.usuarios.get({u : ''}, function(retorno) {
                    if (! _.isEmpty(retorno.records)) {

                        $timeout(function() {
                            $scope.arrUsuarios = retorno.records;
                        })
                    }
                });
            };

            /**
             * Seta os dados da empresa emitente
             */
            $scope.setEmpresa = function () {

                EmpresaService.empresa.get({emp_cod_emp : '1'}, function(data) {
                    //console.log('data: ',data);
                    $scope.empresa = data.records;

                    //console.log('$scope.empresa', $scope.empresa);

                    // TODO: Regra passou a ser despresada no dia 12/12/2017 a pedido do Vinicius!
                    // if($scope.empresa.emp_tip_nota == 2) {
                    //
                    //     GeralFactory.notify('warning', 'Atenção:', 'Emissão de CT-e disponível apenas para certificados tipo A1!');
                    //
                    //     $timeout(function () {
                    //
                    //         $location.path('/');
                    //         location.reload('/');
                    //     }, 2000);
                    //
                    //     return;
                    // }

                    if($scope.empresa.emp_reg_trib == 1 || $scope.empresa.emp_reg_trib == 2 || $scope.empresa.emp_reg_trib == 3) {
                        $scope.empresa.tipCs = 1;
                    } else {
                        $scope.empresa.tipCs = 2;
                    }

                    $scope.spinnerVerificaSisEmp.off();
                });
            };

            /**
             *
             */
            $scope.resetVars = function() {

                $scope.setEtapaEnvolvidos();

                $('#forms.form_cte_frete').find("input[type=text], textarea").val("");

                $scope.salvarFreteLoading = false;

                $scope.nomeBotao           = 'Cancelar';
                $scope.arrFretes           = [];
                $scope.pesquisarFrete      = {
                    arrSitSelecionadas : new Array()
                };

                $scope.opened             = false;
                $scope.remetente          = {};
                $scope.tomador            = {};
                $scope.destinatario       = {};
                $scope.recebedor          = {};
                $scope.expedidor          = {};

                $scope.formaPagamento     = {};
                $scope.objDropdown        = {};
                $scope.arrParcelas        = [];
                $scope.hasFilter          = false;
                $scope.haseditParcelaFrete     = false;
                $scope.fase_escolhida     = [];
                $scope.fase_escolhida_aux = [];

                $scope.objFiltroMotorista = {'cad_pf_pj' : '1'};

                $scope.frete = {
                    selected            : {},
                    selectedParcela     : {},
                    parcelas            : [],
                    valorIcmsSt         : 0,
                    acao                : 0,
                    somaTotalVlrLiquido : null,
                    descAcao            : GeralFactory.getDescAcao(0)[2],
                    tomador             : $scope.tomador,
                    remetente           : $scope.remetente,
                    emitente            : $scope.destinatario,
                    destinatario        : $scope.emitente,
                    recebedor           : $scope.recebedor,
                    expedidor           : $scope.expedidor,
                    tributos            : [],
                    notas_fiscais       : [],
                    doc_anteriores      : [],
                    fin_6020_natureza   : 57,
                    fin_cod_acao        : 0,
                    fin_6035_situacao   : 0,
                    fin_tip_emitente    : 'P',
                    fin_nome_situacao   : 'Pendente Envio',
                    cte_vlr_ibpt        : 0,
                    cte_aliq_ibpt       : 0
                };

                $scope.selectedVeiculo = '';

                $scope.freteTmp = {};
                $scope.freteTmp.eh_fora_estado = 0;

                $scope.dateOptions = {
                    'year-format' : "'yy'",
                    'show-weeks'  : false
                };

                $scope.inc = $scope.incParcela     = 0;
                $scope.frete.fin_cod_periodicidade = 0;
                $scope.frete.fin_av_ap             = 1;
                $scope.frete.clienteSelect         = '';
                $scope.frete.cte_dat_lan           = GeralFactory.getDataAtualBr();
                $scope.setNomeOperacao();
                $scope.salvarFreteLoading = false;

                //$scope.$broadcast('lv-autocomplete:clearInput');

                $scope.totalNotas = {

                    notas_lancadas : 0,
                    volume_total   : 0,
                    peso_total     : 0,
                    total_notas    : 0
                };

                $scope.newNotasFiscais.ctd_6030_esp_doc_ref = 55;

                /* array com as espécies de documentos a serem vinculados ao CTe */
                $scope.arrEspDocs = [{
                    'esp'       : 55,
                    'descricao' : 'Nota Fiscal Eletrônica (NF-e)'
                }];

                $scope.arrFiltroEspDoc = [{
                    'id_esp_doc'    : '10',
                    'label_esp_doc' : 'PED'
                },{
                    'id_esp_doc'    : '57',
                    'label_esp_doc' : 'CTe'
                }];

                /* array com as modalidades de frete a serem vinculados ao CTe */
                $scope.arrModalidadesFrete = [
                    {
                        'id'        : 1,
                        'descricao' : 'Rodoviário'
                    }, {
                        'id'        : 2,
                        'descricao' : 'Aereo'
                    }, {
                        'id'        : 3,
                        'descricao' : 'Aquaviário'
                    }, {
                        'id'        : 4,
                        'descricao' : 'Ferroviário'
                    }, {
                        'id'        : 5,
                        'descricao' : 'Dutoviário'
                    }, {
                        'id'        : 5,
                        'descricao' : 'Multimodal'
                    }
                ];
                $scope.frete.cte_tip_modalidade = 1;

                /* array com as modalidades de frete a serem vinculados ao CTe */
                $scope.arrTipoServicoFrete = [
                    {
                        'id'        : 0,
                        'descricao' : 'Normal'
                    }, {
                        'id'        : 1,
                        'descricao' : 'Sub-contratação'
                    }, {
                        'id'        : 2,
                        'descricao' : 'Redespacho'
                    }, {
                        'id'        : 3,
                        'descricao' : 'Red. Intermediário'
                    }, {
                        'id'        : 4,
                        'descricao' : 'Vinculado a multimodal'
                    }
                ];
                $scope.frete.cte_tipo_servico = 0;

                /* array com os tipos de CTe passivos de emissão */
                $scope.arrTipoCTe = [
                    {
                        'id'        : 0,
                        'descricao' : 'CT-e Normal'
                    }, {
                        'id'        : 1,
                        'descricao' : 'CT-e de Complemento de Valores'
                    }, {
                        'id'        : 2,
                        'descricao' : 'CT-e de Anulação'
                    }, {
                        'id'        : 3,
                        'descricao' : 'CT-e Substituto'
                    }
                ];
                $scope.frete.cte_tip_cte = 0;

                /* array com os possíveis responsáveis pelo pagamento do CTe */
                $scope.arrTomador = [
                    {
                        'id'        : 0,
                        'descricao' : 'Remetente'
                    }, {
                        'id'        : 1,
                        'descricao' : 'Expedidor'
                    }, {
                        'id'        : 2,
                        'descricao' : 'Recebedor'
                    }, {
                        'id'        : 3,
                        'descricao' : 'Destinatário'
                    }, {
                        'id'        : 4,
                        'descricao' : 'Outros'
                    }
                ];
                $scope.frete.cte_toma_serv = 0;

                /* array om os possíveis responsáveis pelo pagamento do seguro da carga */
                $scope.arrResponsavelSeguro = [
                    {
                        'id'        : 0,
                        'descricao' : 'Remetente'
                    }, {
                        'id'        : 1,
                        'descricao' : 'Expedidor'
                    }, {
                        'id'        : 2,
                        'descricao' : 'Recebedor'
                    }, {
                        'id'        : 3,
                        'descricao' : 'Destinatário'
                    }, {
                        'id'        : 4,
                        'descricao' : 'Emitente'
                    }, {
                        'id'        : 5,
                        'descricao' : 'Tomador'
                    }
                ];
                $scope.frete.cte_responsavel_seguro = 0;

                $scope.arrAcoes = [{
                    'id'   : 0,
                    'name' : 'Edição'
                }, {
                    'id'   : 1,
                    'name' : 'Faturado'
                }, {
                    'id'   : 8,
                    'name' : 'Cancelado'
                }, {
                    'id'   : 9,
                    'name' : 'Concluído'
                }];

                $scope.veiculo = {};

                $scope.arrTpVeic = [{
                    id   :  0,
                    nome : 'Tração'
                }, {
                    id   :  1,
                    nome : 'Reboque'
                }];


                $scope.arrTpRodado = [{
                    id   :  0,
                    nome : 'Não aplicável'
                }, {
                    id   :  1,
                    nome : 'Truck'
                }, {
                    id   :  2,
                    nome : 'Toco'
                }, {
                    id   :  3,
                    nome : 'Cavalo Mecânico'
                }, {
                    id   :  4,
                    nome : 'VAN'
                }, {
                    id   :  5,
                    nome : 'Utilitário'
                }, {
                    id   :  6,
                    nome : 'Outros'
                }];


                $scope.arrTpCarroceria = [{
                    id   :  0,
                    nome : 'Não aplicável'
                }, {
                    id   :  1,
                    nome : 'Aberta'
                }, {
                    id   :  2,
                    nome : 'Fechada/Baú'
                }, {
                    id   :  3,
                    nome : 'Granelera'
                }, {
                    id   :  4,
                    nome : 'Porta Container'
                }, {
                    id   :  5,
                    nome : 'Sider'
                }];

                $scope.listarAliquotasInterestaduisIcms();
                //console.log('$scope.frete na resetVars:', $scope.frete);
            };

            /**
             *
             */
            $scope.reset = function() {

                $scope.frete.selected        = {};
                $scope.frete.selectedParcela = {};
            };

            // $scope.mudarTipoEmissao = function() {
            //
            //     // $scope.frete.fin_tipo_da_emissao
            // };

            /**
             * Inicializa os labels padrões da operação selecionada.
             */
            $scope.setNomeOperacao = function() {

                var strCod = '';
                $scope.frete.tipoNatureza = $location.$$path.replace('/', '');

                if ($scope.frete.tipoNatureza == 'frete') {

                    if (!$rootScope.getPermissao('8')) {
                        $location.path('/');
                    }

                    $scope.siglaTutorial = 'FRT';
                    $scope.labelTutorial = 'Cadastro de novos fretes';
                    $scope.frete.nomeNatureza = 'Fretes';
                    $scope.frete.explModulo = 'seus fretes';
                    $scope.frete.nomeNaturezaSing = 'Frete';
                    $scope.frete.op = 'frete';
                    $scope.frete.labelTitular = 'Tomador';
                    $scope.frete.labelTitularSing = 'tomador';
                    $scope.frete.fin_sistema = 1;
                    $scope.frete.fin_tip_emitente = ($scope.frete.fin_tip_emitente) ? $scope.frete.fin_tip_emitente : 'P';
                    $scope.objDropdown.objCentroCusto = {'par_i03': 1};

                    strCod = '1|6020|1||';
                }

                //obtem a descriçao e codigo do cfop padrao. Cada empresa pode ter o seu padrao
                if(! $scope.frete.cte_fin_nro_lan) {

                    //console.log('eh novo entao vai setar um padrao 333');
                    ParamsService.getParametro(strCod, function(data) {
                        //console.log('data:',data);

                        if (data) {
                            $scope.cfopPadrao = data;
                            if(data.par_i01) {
                                $scope.frete.fin_cfo_cfop = data.par_i01;

                            }
                        }
                    });
                }
            };

            /**
             * Seta para aba principal para ficar ativa.
             */
            $scope.setAbaInicial = function(tab1, tab2) {

                $scope.tabs = [
                    {active : (tab1 == 1)},
                    {active : (tab1 == 2)},
                    {active : (tab2 == 3)},
                    {active : (tab2 == 4)}
                ];
            };

            /**
             * Verifica qual frete foi selecionada.
             */
            $scope.isActive = function(k) {
                return $scope.keyEdit === k;
            };

            /**
             * Limpa a tela para receber os dados de um novo frete
             */
            $scope.novoFrete = function() {

                $timeout(function() {
                    $scope.flagTutorial = false;
                }, 500);
                $scope.resetVars();
                $scope.listarFretes();
                $scope.listarFase();

                $scope.setAbaInicial(1,3)
            };

            /**
             * Nova listagem das operações!
             */
            $scope.listarFretes = function() {

                $rootScope.spinnerList.on();
                $scope.arrFretes = [];

                var objFiltro = $scope.filtroPesquisarFrete();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=0');

                TransporteService.fretes.get({u : strFiltro}, function(retorno) {
                    if (retorno.records.length > 0) {

                        $scope.iterarFretes(retorno.records, true);

                        $timeout(function() {

                            $rootScope.spinnerList.off();
                            // $scope.getSomaTotalVlrLiquido();
                        });
                    } else {

                        $rootScope.spinnerList.off();
                    }
                });
            };

            /**
             * Método responsável em efetuar a paginação das operações.
             */
            $scope.paginarListagem = function() {

                $rootScope.spinnerList.on();

                var objFiltro = $scope.filtroPesquisarFrete();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=' + $scope.getOffset());

                TransporteService.fretes.get({u : strFiltro}, function(retorno) {
                    if (retorno.records.length > 0) {

                        $scope.iterarFretes(retorno.records, true);

                        $timeout(function() {

                            $rootScope.spinnerList.off();
                        });
                    } else {

                        $rootScope.spinnerList.off();
                        var mensagem = 'Caro usuário, a listagem já se encontra completa!';
                        GeralFactory.notify('warning', 'Atenção:', mensagem);
                    }
                });
            };

            /**
             * Retorna o limite de registros para a paginação.
             */
            $scope.getOffset = function() {

                return ($scope.arrFretes.length) ? $scope.arrFretes.length : 0;
            };

            /**
             * Método responsável em percorrer o retorno das vendas vindas da API e efetuar as
             * devidas tratativas para construção da listagem dos registros.
             */
            $scope.iterarFretes = function(arrFretes, reset) {

                if (! _.isEmpty(arrFretes)) {

                    if (reset) {

                        $scope.arrFretes = [];
                    }

                    $timeout(function() {

                        angular.forEach(arrFretes, function(i) {

                            i['strEspDoc']    = GeralFactory.getAbrDescEspDoc(i['fin_6030_esp_doc'],i['fin_6035_situacao']);
                            i['fase']         = GeralFactory.getRegistroPorChave($scope.arrFase, i['fin_6025_fase'], 'par_pai');
                            i['situacao']     = GeralFactory.getRegistroPorChave($scope.arr_6035, i['fin_6035_situacao'], 'par_pai');
                            i['nomeSituacao'] = (i['fin_cod_acao'] == '8' && i['fin_6035_situacao'] == '0') ? 'Cancelado' : i['situacao'].par_c01;
                            i['nomeAcao']     = GeralFactory.getDescAcao(i['fin_cod_acao'])[3];

                            if(i['fin_6035_situacao'] == 81) {

                                i['cte_cad_nome_tomador'] = 'DOCUMENTO INUTILIZADO.';
                                i['cte_doc_vlr_rec']      = 0;

                            }

                            $scope.arrFretes.push(i);
                        });
                    });

                    $timeout(function () {

                        //console.log('$scope.arrFretes', $scope.arrFretes);
                    }, 3000);
                } else {

                    $scope.arrFretes = [];
                }
            };

            /**
             * Retorna o registro de algum tipo de operaçao de transaçao financeira.
             */
            $scope.getFrete = function(cte_fin_nro_lan, func) {

                TransporteService.frete.get({cte_fin_nro_lan : cte_fin_nro_lan}, function(data) {

                    $scope.frete = data.records;

                    if($scope.frete) {

                        // seta a tela para documento inutilizado
                        //console.log('$scope.frete', $scope.frete);
                        if($scope.frete.fin_6035_situacao == '81') {

                            $scope.chaveInutilizada = $scope.frete.fin_nfe_chave;
                            $scope.dataInutilizacao = $scope.frete.fin_dat_emi;
                            $scope.nroInutilizada   = $scope.frete.fin_doc_nro;
                            $scope.espDoc           = $scope.frete.fin_6030_esp_doc;
                            $scope.flagTutorial     = true;
                            $scope.resetVars();

                            $scope.listarFretes();
                            $scope.listarFase();
                            $scope.frete.fin_6035_situacao = '81';
                            $scope.ehInutilizado           = true;

                            return;
                        }

                        $scope.setNomeOperacao();

                        $scope.frete.cte_dat_lan           = GeralFactory.formatarDataBr($scope.frete.cte_dat_lan);
                        $scope.frete.cte_rodo_dat_prev     = GeralFactory.formatarDataBr($scope.frete.cte_rodo_dat_prev);
                        $scope.frete.cte_rodo_lota         = ($scope.frete.cte_rodo_lota == 1);
                        $scope.frete.acao                  = $scope.frete.fin_cod_acao;
                        $scope.frete.codSituacao           = $scope.frete.fin_6035_situacao;
                        $scope.frete.formaPagamentoSelect  = $scope.frete.fin_nome_forma_pagamento;
                        $scope.frete.centroCustoSelect     = $scope.frete.fin_nome_centro_custo;
                        $scope.frete.contaFinanceiraSelect = $scope.frete.fin_nome_conta_financeira;
                        $scope.frete.descAcao              = GeralFactory.getDescAcao($scope.frete.fin_cod_acao)[2];
                        $scope.frete.codSituacao           = $scope.frete.fin_6035_situacao;

                        if($scope.frete.fin_dat_sai != null) {

                            //console.log('$scope.frete.fin_dat_sai: ',$scope.frete.fin_dat_sai);
                            var arrDh = $scope.frete.fin_dat_sai.split(' ');

                            //console.log('arrDh: ',arrDh);
                            $scope.frete.valorDataSai = GeralFactory.formatarDataBr(arrDh[0]);
                            $scope.frete.valorHoraSai = (arrDh[1] != '00:00:00')?arrDh[1]:'';
                            $scope.frete.fin_dat_sai = $scope.frete.valorDataSai + ' ' +  arrDh[1];
                        }

                        /* busca as informações do veículo */
                        if($scope.frete.cte_vei_cod_vei) {

                            TransporteService.veiculos.get({u : $scope.frete.cte_vei_cod_vei}, function (retorno) {

                                if(!retorno.records.error) {

                                    $scope.selectedVeiculo = retorno.records.vei_placa;
                                }
                            });
                        }

                        if($scope.frete.cte_cad_cod_rem) {

                            ClienteService.cliente.get({cad_cod_cad : $scope.frete.cte_cad_cod_rem}, function(retorno) {
                                if (! retorno.records.error) {

                                    $scope.remetente = retorno.records;

                                    $timeout(function () {

                                        $scope.listarCfop();
                                    }, 500);
                                    // //console.log('remetente: ', $scope.remetente);
                                }
                            });
                        }

                        if($scope.frete.cte_cad_cod_dest) {

                            ClienteService.cliente.get({cad_cod_cad : $scope.frete.cte_cad_cod_dest}, function(retorno) {
                                if (! retorno.records.error) {

                                    $scope.destinatario = retorno.records;
                                    // //console.log('destinatario: ', $scope.destinatario);
                                }
                            });
                        }

                        if($scope.frete.cte_cad_cod_exp) {

                            ClienteService.cliente.get({cad_cod_cad : $scope.frete.cte_cad_cod_exp}, function(retorno) {
                                if (! retorno.records.error) {

                                    $scope.expedidor = retorno.records;
                                    // //console.log('expedidor: ', $scope.expedidor);
                                }
                            });
                        }

                        if($scope.frete.cte_cad_cod_rec) {

                            ClienteService.cliente.get({cad_cod_cad : $scope.frete.cte_cad_cod_rec}, function(retorno) {
                                if (! retorno.records.error) {

                                    $scope.recebedor = retorno.records;
                                    // //console.log('recebedor: ', $scope.recebedor);
                                }
                            });
                        }

                        if($scope.frete.cte_cad_cod_tom) {

                            ClienteService.cliente.get({cad_cod_cad : $scope.frete.cte_cad_cod_tom}, function(retorno) {
                                if (! retorno.records.error) {

                                    $scope.tomador = retorno.records;
                                    // //console.log('tomador: ', $scope.tomador);
                                }
                            });
                        }

                        if($scope.frete.cte_cad_cod_mot) {

                            ClienteService.cliente.get({cad_cod_cad : $scope.frete.cte_cad_cod_mot}, function(retorno) {
                                if (! retorno.records.error) {

                                    $scope.frete.cte_cad_nome_motorista = (retorno.records.cad_nome_razao) ? retorno.records.cad_nome_razao : retorno.records.cad_nome_fantasia;
                                }
                            });
                        }

                        if($scope.frete.notas_fiscais.length) {

                            $scope.totalizaNotasFiscais();
                        }

                        // Verificando as parcelas do frete:
                        $scope.objCloneParcelas = angular.copy($scope.frete.parcelas);
                        $scope.distribuirParcelasFrete();

                        var arrDiferenca = [];

                        angular.forEach($scope.frete.parcelas, function(i, j) {

                            var dtFormatada = GeralFactory.formatarDataBr(i.tit_dat_vct);
                            $scope.frete.parcelas[j].tit_dat_vct = dtFormatada;

                            var diff = GeralFactory.diffDates($scope.frete.cte_dat_lan, dtFormatada);
                            arrDiferenca.push(diff);
                        });

                        if ($scope.frete.fin_av_ap === 1) {

                            var qtdeParcelas;
                            if ($scope.frete.fin_cod_periodicidade === 0) {

                                qtdeParcelas = (arrDiferenca.length) ? arrDiferenca.join(' ') : '';
                                $scope.frete.qtde_parcelas = qtdeParcelas;

                            } else {

                                qtdeParcelas = $scope.frete.parcelas.length;
                                $scope.frete.qtde_parcelas = qtdeParcelas + 'x';
                            }
                        }
                    }

                    $scope.setNomeOperacao();
                    $scope.nomeBotao = 'Excluir';
                    $timeout(function() {

                        $scope.flagTutorial = false;
                        $scope.setEtapaConclusao();
                    }, 500);

                    if(func) {

                        func.call();
                    }

                    var reg = GeralFactory.getRegistroPorChave($scope.arr_6035, $scope.frete.fin_6035_situacao, 'par_pai');
                    $scope.frete.fin_nome_situacao = reg.par_c01;

                    $scope.listarVixCteObs();

                    console.log('$scope.frete', $scope.frete);
                });
            };

            $scope.listarFase = function() {

                var strFiltro = ''; //GeralFactory.formatarPesquisar(objFiltro);

                ParamsService.fases.get({u : strFiltro}).$promise.then(function(resposta) {

                    $scope.arrFase = resposta.records;

                    angular.forEach($scope.arrFase,function(reg, k){

                        $scope.fase_escolhida[k] = reg;
                    });
                });

            };

            $scope.setTomador = function () {

                $scope.tomador = {};

                //console.log('$scope.frete.cte_toma_serv', $scope.frete.cte_toma_serv);

                //0. REMETENTE / 1. EXPEDIDOR / 2. RECEBEDOR / 3. DESTINATARIO / 4. OUTROS ( SEGUINDO PADRÃO SEFAZ)
                switch ($scope.frete.cte_toma_serv)
                {

                    case 0:

                        if(!$scope.frete.cte_cad_nome_remetente) {

                            GeralFactory.notify('warning', 'Atenção!', 'Primeiro, selecione o Remetente!');

                        } else {

                            $scope.frete.cte_cad_cod_tom = $scope.frete.cte_cad_cod_rem;
                            $scope.tomador = $scope.remetente;
                        }

                        break;

                    case 1:

                        if(!$scope.frete.cte_cad_nome_expedidor) {

                            GeralFactory.notify('warning', 'Atenção!', 'Primeiro, selecione o Expedidor!');
                        } else {

                            $scope.frete.cte_cad_cod_tom = $scope.frete.cte_cad_cod_exp;
                            $scope.tomador = $scope.expedidor;
                        }

                        break;

                    case 2:

                        if(!$scope.frete.cte_cad_nome_recebedor) {

                            GeralFactory.notify('warning', 'Atenção!', 'Primeiro, selecione o Recebedor!');
                        } else {

                            $scope.frete.cte_cad_cod_tom = $scope.frete.cte_cad_cod_rec;
                            $scope.tomador = $scope.recebedor;
                        }

                        break;

                    case 3:

                        if(!$scope.frete.cte_cad_cod_dest) {

                            GeralFactory.notify('warning', 'Atenção!', 'Primeiro, selecione o Destinatário!');
                        } else {

                            $scope.frete.cte_cad_cod_tom = $scope.frete.cte_cad_cod_dest;
                            $scope.tomador = $scope.destinatario;
                        }

                        break;

                    case 4:
                        $scope.tomador = {};
                        //VAI EXIBIR O INPUT PARA QUE O USUÁRIO ESCOLHA O TOMADOR
                        break;
                }

                $timeout(function () {
                    //console.log('$scope.tomador', $scope.tomador);
                }, 100)

            };

            $scope.onSelectRemetente = function (obj) {

                $scope.frete.cte_cad_nome_remetente = (obj.cad_nome_razao) ? obj.cad_nome_razao : obj.cad_nome_fantasia;
                $scope.frete.cte_cad_cod_rem        = obj.cad_cod_cad;

                ClienteService.cliente.get({cad_cod_cad : obj.cad_cod_cad}, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.remetente = retorno.records;

                        $timeout(function () {

                            $scope.listarCfop();
                            // $scope.setTributoFrete();
                        }, 2000);
                        //console.log('remetente: ', $scope.remetente);
                    }
                });
            };

            $scope.onSelectDestinatario = function (obj) {

                $scope.frete.cte_cad_nome_destinatario = (obj.cad_nome_razao) ? obj.cad_nome_razao : obj.cad_nome_fantasia;
                $scope.frete.cte_cad_cod_dest          = obj.cad_cod_cad;

                ClienteService.cliente.get({cad_cod_cad : obj.cad_cod_cad}, function(retorno) {
                    if (!retorno.records.error) {

                        $scope.destinatario = retorno.records;

                        $timeout(function () {

                            $scope.listarCfop();
                            // $scope.setTributoFrete();
                        }, 2000);

                        //console.log('destinatario: ', $scope.destinatario);
                    }
                });
            };

            $scope.onSelectExpedidor = function (obj) {

                $scope.frete.cte_cad_nome_expedidor = (obj.cad_nome_razao) ? obj.cad_nome_razao : obj.cad_nome_fantasia;
                $scope.frete.cte_cad_cod_exp        = obj.cad_cod_cad;

                ClienteService.cliente.get({cad_cod_cad : obj.cad_cod_cad}, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.expedidor = retorno.records;
                        //console.log('expedidor: ', $scope.expedidor);
                    }
                });
            };

            $scope.onSelectTomador = function (obj) {

                $scope.frete.cte_cad_nome_tomador = (obj.cad_nome_razao) ? obj.cad_nome_razao : obj.cad_nome_fantasia;
                $scope.frete.cte_cad_cod_tom      = obj.cad_cod_cad;

                ClienteService.cliente.get({cad_cod_cad : obj.cad_cod_cad}, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.tomador = retorno.records;

                        //console.log('tomador: ', $scope.tomador);
                    }
                });
            };

            $scope.onSelectRecebedor = function (obj) {

                $scope.frete.cte_cad_nome_recebedor = (obj.cad_nome_razao) ? obj.cad_nome_razao : obj.cad_nome_fantasia;
                $scope.frete.cte_cad_cod_rec        = obj.cad_cod_cad;

                ClienteService.cliente.get({cad_cod_cad : obj.cad_cod_cad}, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.recebedor = retorno.records;
                        //console.log('recebedor: ', $scope.recebedor);
                    }
                });
            };

            $scope.onSelectSeguradora = function (obj) {

                $scope.frete.cte_cad_nome_seguradora = (obj.cad_nome_razao) ? obj.cad_nome_razao : obj.cad_nome_fantasia;
                $scope.frete.cte_cad_cod_seg         = obj.cad_cod_cad;
            };

            $scope.onSelectMotorista = function (obj) {

                $scope.frete.cte_cad_nome_motorista = (obj.cad_nome_razao) ? obj.cad_nome_razao : obj.cad_nome_fantasia;
                $scope.frete.cte_cad_cod_mot  = obj.cad_cod_cad;
            };

            $scope.onSelectVeiculo = function (obj) {

                $scope.selectedVeiculo       = obj.vei_placa;
                $scope.frete.cte_vei_cod_vei = obj.vei_cod_vei;
            };

            $scope.onSelectEmitenteDocAnterior = function (obj) {

                $scope.newDocAnterior.ctd_cad_nome_emitente = (obj.cad_nome_razao) ? obj.cad_nome_razao : obj.cad_nome_fantasia;
                $scope.newDocAnterior.ctd_cad_cod_cad       = obj.cad_cod_cad;
            };

            /**
             * Abre a modal principal dos dados do cliente que tem todas as abas da tela de cliente.
             */
            $scope.getJanelaCadastro = function(cad_cod_cad, type) {

                var scope = $rootScope.$new();
                scope.params = {};

                if (cad_cod_cad) {

                    scope.params.str_titular = 'Cadastro';
                    scope.params.cad_cod_cad = cad_cod_cad;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'cliente/views/janela-cliente.html',
                        controller  : 'ClienteModalCtrl',
                        size        : 'lg',
                        windowClass : 'center-modal no-top-modal',
                        scope       :  scope,
                        resolve: {
                            getEnd: function() { }
                        }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {

                        if (modalInstance.hasAlteracao) {

                            switch (type) {

                                case 'rem':
                                    $scope.onSelectRemetente(modalInstance.objClienteClone);
                                    break;
                                case 'exp':
                                    $scope.onSelectExpedidor(modalInstance.objClienteClone);
                                    break;
                                case 'dest':
                                    $scope.onSelectDestinatario(modalInstance.objClienteClone);
                                    break;
                                case 'rec':
                                    $scope.onSelectRecebedor(modalInstance.objClienteClone);
                                    break;
                                case 'tom':
                                    $scope.onSelectTomador(modalInstance.objClienteClone);
                                    break;
                                case 'mot':
                                    $scope.onSelectMotorista(modalInstance.objClienteClone);
                                    break;
                            }
                        }
                    });
                }
            };

            /**
             * Lista os impostos da tabela
             */
            $scope.listarImpostos = function(func) {

                var objeto = {};
                VendaService.impostos.get(objeto, function(retorno) {

                    $scope.arrImposto =  retorno.records;

                    func.call();
                });
            };

            /**
             * Método responsável pela manipulação dos impostos do CTe
             * @param item
             * @param k
             * @param $index
             */
            $scope.editTributoFrete = function(item, k, $index) {

                $scope.setTomador();

                if(!$scope.tomador.listaEndereco || !$scope.tomador.listaEndereco.length) {

                    GeralFactory.notify('warning', 'Atenção!', 'O Tomador informado está sem endereço em seu cadastro!');
                    return false;
                }

                if(!$scope.frete.cte_doc_vlr_rec) {

                    GeralFactory.notify('warning', 'Atenção!', 'Informe os totais do frete para só depois lançar os impostos!');
                    return false;
                }

                //console.log('fafa: ',item);
                var scope = $rootScope.$new();

                scope.params = {};

                /* Mascara um produto com os totais do frete */
                var objProduto = [];

                scope.params.v           = $scope.frete;
                scope.params.empresa     = $scope.empresa;
                scope.params.cliente     = $scope.tomador;
                scope.params.endCliUf    = $scope.tomador.listaEndereco[0].end_endereco_uf;
                scope.params.arrImposto  = $scope.arrImposto;
                scope.params.$index      = $index;
                scope.params.codNatureza = 57;

                scope.params.itemProduto = {};
                scope.params.produto     = {};

                if(k != undefined) {

                    objProduto                     = item;
                    objProduto.ite_vlr_tot_bruto   = $scope.frete.cte_doc_vlr_rec;
                    objProduto.ite_vlr_tot_liquido = $scope.frete.cte_doc_vlr_prest;
                    objProduto.itens_tributo       = $scope.frete.tributos;

                    scope.params.itemProduto = objProduto;
                    scope.params.produto     = objProduto;

                    scope.params.objImposto = objProduto;
                    $scope.chaveTributo     = k;
                    scope.params.acao       = 2;

                } else {

                    scope.params.objImposto = {};
                    scope.params.acao       = 1;
                    $scope.chaveTributo     = parseInt($scope.frete.tributos.length);
                }

                scope.params.tipCs = $scope.empresa.tipCs;

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'venda/views/janela-tributo.html',
                    controller  : 'VendaTributoCtrl',
                    windowClass : 'center-modal',
                    scope       :  scope,
                    resolve     :  { }
                });

                modalInstance.result.then(function(id) { }, function(msg) {

                    console.log('modalInstance', modalInstance)
                    console.log('$scope.frete.tributos[$scope.chaveTributo]',$scope.frete.tributos[$scope.chaveTributo])

                    if (msg === 'reload') {

                        if (modalInstance.hasAlteracao) {

                            switch (modalInstance.acaoEscolhida) {

                                case 'cancelar':

                                    $scope.removerTributo(modalInstance.itemDelIndex);
                                    //$scope.zerarParcelas();

                                    $scope.calcularVlrTotTri();
                                    $scope.calcularVlrTotImpRetidos();

                                    $scope.newTributoFrete = false;
                                    $scope.getTotalFrete(); //calcula novamente para chegar ao valor liquido

                                    break;

                                case 'atualizar':

                                    var objImposto = modalInstance.objImposto;
                                    var tipCs = modalInstance.tipCs;
                                    var flgNaoSet = false;

                                    console.log('objImposto:', objImposto);
                                    console.log('ch: ',$scope.chaveTributo);
                                    //console.log('tipCs: ',tipCs);
                                    //console.log('tri_imp_cod_imp: ',objImposto.tri_imp_cod_imp);
                                    //console.log('tri_cso: ',objImposto.tri_cso);

                                    // Atualizando os campos de valores do item no escopo principal:
                                    var proxI = $scope.frete.tributos.length;
                                    //console.log('proxI:',proxI);
                                    //console.log('flgNovoSt:',modalInstance.flgNovoSt);

                                    if(modalInstance.flgNovoSt) {

                                        //console.log('tem novo st');
                                        var objImpostoSt      =  {
                                            'tri_imp_cod_imp' : 2,
                                            'tri_aliq_perc' : 0,
                                            'tri_bc_vlr_bruto': modalInstance.objImposto.tri_bc_vlr_bruto,
                                            'tri_bc_perc_mva' : 40,
                                            'tri_bc_perc_reducao' : 0,
                                            'tri_bc_vlr_liquido' :0,
                                            'tri_imp_vlr_diferenca' : modalInstance.objImposto.tri_imp_vlr_liquido, //conforme doc.
                                            //  tri_contabil_tip: 0
                                            'tri_contabil_vlr':0
                                        };

                                        ImpostoFactory.setRegraSt(objImpostoSt,$scope.tomador,$scope.empresa,$scope.produto,function(retorno) {

                                            $scope.frete.tributos[proxI] = retorno;

                                            $scope.listarImpostos(function() {

                                                imp = GeralFactory.getRegistroPorChave($scope.arrImposto,objImposto['tri_imp_cod_imp'],'imp_cod_imp');
                                                $scope.frete.tributos[$scope.chaveTributo].nomeImposto = imp['imp_descricao'];
                                            });
                                        });
                                    } else {

                                        $scope.frete.tributos[$scope.chaveTributo] = objImposto;

                                        $scope.listarImpostos(function() {
                                            console.log('$scope.arrImposto',$scope.arrImposto);

                                            imp = GeralFactory.getRegistroPorChave($scope.arrImposto,objImposto['tri_imp_cod_imp'],'imp_cod_imp');
                                            $scope.frete.tributos[$scope.chaveTributo].nomeImposto = imp['imp_descricao'];

                                            console.log('itt77:',$scope.frete.tributos);

                                            if(objImposto['tri_imp_cod_imp'] == 2) {
                                                $scope.frete.tributos[$scope.chaveTributo].tri_eh_retido = 1;
                                                $scope.frete.tributos[$scope.chaveTributo].nomeImposto = 'ICMS ST';
                                            }
                                        });

                                    }

                                    $scope.newTributoFrete = false;

                                    $scope.calcularVlrTotTri();
                                    $scope.calcularVlrTotImpRetidos();
                                    $scope.getTotalFrete(); //calcula novamente para chegar ao valor liquido

                                    break;
                            }
                        }
                    }
                });
            };

            /**
             * Remove um item da frete.
             */
            $scope.removerTributo = function($index) {

                //console.log('vai remover: ',$index);
                //$scope.frete.itens.splice($index, 1);
                $scope.frete.tributos.splice($index, 1);

                //console.log('nova lista: ',$scope.frete.tributos);


            };

            /**
             * Calcula alguns campos tributos para somar na janela do item
             */
            $scope.calcularVlrTotTri = function() {

                //console.log('calcularVlrTotTri');
                var somaContab = 0;
                var somaNaoTrib = 0;

                //console.log('bb: ',$scope.frete);
                angular.forEach($scope.frete.tributos,function(reg,i) {

                    //console.log('reghh: ',reg);

                    //console.log('somaNaoTrib: ',somaNaoTrib);
                    //console.log('vai somar ',parseFloat(GeralFactory.verificarNaN(reg.tri_contabil_vlr)) ,' com ', parseFloat(somaContab));
                    somaContab = parseFloat(GeralFactory.verificarNaN(reg.tri_contabil_vlr)) + parseFloat(somaContab);
                    somaNaoTrib = parseFloat(GeralFactory.verificarNaN(reg.tri_naotrib_vlr)) + parseFloat(somaNaoTrib);
                });

                $scope.frete.ite_vlr_tot_naotrib  = somaNaoTrib;
                $scope.frete.ite_vlr_tot_contabil = somaContab;

            };

            /**
             * Calcula os impostos retiros da lista de impostos
             */
            $scope.calcularVlrTotImpRetidos = function() {

                //console.log('calcularVlrTotImpRetidos');
                var somaImpRet = 0;

                angular.forEach($scope.frete.tributos,function(reg,i) {

                    //console.log('retido: ',reg.tri_eh_retido);
                    if(reg.tri_eh_retido == 1) {

                        //console.log('vai somar ',parseFloat(reg.tri_imp_vlr_liquido) ,' com ', parseFloat(somaImpRet));
                        somaImpRet = parseFloat(reg.tri_imp_vlr_liquido) + parseFloat(somaImpRet);
                    }
                });

                $scope.frete.ite_vlr_tot_impostos_retidos = somaImpRet;
            };

            /**
             * Cria o registro de frete que será a base para a emissão do CTe
             */
            $scope.salvarFrete = function(func) {

                if(!$scope.validaEntradaInicial()) {

                    return;
                }

                $scope.setTomador();

                $scope.salvarFreteLoading = true;

                // $scope.setTributoFrete();
                $timeout(function () {

                    if(!$scope.frete.tributos.length) {

                        GeralFactory.notify('warning', 'Atenção!', 'Informe o ICMS do CT-e!');

                        $scope.tabs = [
                            {active : false}, {active : false}, {active : true}
                        ];

                        $scope.salvarFreteLoading = false;

                        return;
                    }

                    if(!$scope.tomador.cad_cod_cad) {

                        GeralFactory.notify('warning', 'Atenção!', 'Informe o tomador do serviço!');
                        $scope.salvarFreteLoading = false;

                        return;
                    }

                    $scope.frete.cte_carga_peso = 0;

                    angular.forEach($scope.frete.notas_fiscais, function(nota, key) {

                        $scope.frete.notas_fiscais[key].ctd_dat_prev = $scope.frete.cte_rodo_dat_prev;
                        $scope.frete.cte_carga_peso += parseFloat(nota.ctd_vlr_peso);
                    });

                    $scope.frete.cte_carga_vlr  = $scope.totalNotas.total_notas;
                    $scope.frete.cte_carga_peso = $scope.totalNotas.peso_total;
                    $scope.frete.cte_rodo_lota  = ($scope.frete.cte_rodo_lota) ? 1 : 0;

                    $scope.frete.fin_doc_vlr_liquido   = $scope.frete.cte_doc_vlr_prest;
                    $scope.frete.fin_doc_vlr_despesas  = $scope.frete.cte_vlr_seguro + $scope.frete.cte_vlr_pedagio + $scope.frete.cte_vlr_outros;
                    //console.log('frete: ',$scope.frete);
                    //console.log('frete: ',JSON.stringify($scope.frete.tributos));

                    if ($scope.frete.cte_fin_nro_lan) {

                        TransporteService.frete.update($scope.frete, function (resposta) {

                            //console.log('retorno', resposta.records);

                            if(!resposta.records.error) {

                                if(func) {

                                    console.log('tem func vai fat');
                                    NotifyFlag.setFlag(false);
                                    func.call();

                                } else {
                                    //console.log('nao tem func');
                                    $scope.getFrete(resposta.records.cte_fin_nro_lan);
                                    $scope.listarFretes();

                                }

                                $scope.setEtapaConclusao();

                                GeralFactory.notify('success', resposta.records.title, resposta.records.msg);
                            } else {

                                GeralFactory.notify('danger', resposta.records.title, resposta.records.msg);
                            }

                            if(!func) {

                                $scope.salvarFreteLoading = false;
                            }

                        });
                    } else {

                        TransporteService.fretes.create($scope.frete, function (resposta) {

                            //console.log('retorno', resposta.records);

                            $timeout(function() {
                                $scope.salvarFreteLoading = false;
                            }, 2000);

                            if(! resposta.records.error) {

                                if(func) {

                                    //console.log('tem func');
                                    $scope.frete.cte_fin_nro_lan = resposta.records.cte_fin_nro_lan;
                                    NotifyFlag.setFlag(false);
                                    func.call();

                                } else {
                                    //console.log('nao tem func');
                                    $scope.getFrete(resposta.records.cte_fin_nro_lan);
                                    $scope.listarFretes();
                                }

                                $scope.setEtapaConclusao();

                                GeralFactory.notify('success', resposta.records.title, resposta.records.msg);
                            } else {

                                GeralFactory.notify('danger', resposta.records.title, resposta.records.msg);
                            }
                        });
                    }

                }, 1500);
            };

            /**
             * Valida os principais campos do frete
             * @returns {boolean}
             */
            $scope.validaEntradaInicial = function () {

                if(!$scope.frete.cte_cad_cod_rem) {

                    GeralFactory.notify('warning', 'Atenção!', 'Informe o remetente!');
                    $scope.setEtapaEnvolvidos();

                    return false;
                }

                if(!$scope.frete.cte_cad_cod_dest) {

                    GeralFactory.notify('warning', 'Atenção!', 'Informe o destinatário!');
                    $scope.setEtapaEnvolvidos();

                    return false;
                }

                // if(!$scope.frete.cte_cad_cod_mot && !$scope.frete.doc_anteriores.length) {
                //
                //     GeralFactory.notify('warning', 'Atenção!', 'Informe o motorista!');
                //     $scope.setEtapaEnvolvidos();
                //
                //     return false;
                // }
                //
                // if(!$scope.frete.cte_vei_cod_vei) {
                //
                //     GeralFactory.notify('warning', 'Atenção!', 'Informe o veículo!');
                //     $scope.setEtapaEnvolvidos();
                //
                //     return false;
                // }

                if(!$scope.frete.cte_carga_prod_pred) {

                    GeralFactory.notify('warning', 'Atenção!', 'Informe o produto predominante!');
                    $scope.setEtapaDocumentos();

                    return false;
                }

                if(!$scope.frete.cte_rodo_dat_prev) {

                    GeralFactory.notify('warning', 'Atenção!', 'Informe a data de previsão!');
                    $scope.setEtapaDocumentos();

                    return false;
                }

                if(!$scope.frete.notas_fiscais.length && !$scope.frete.doc_anteriores.length) {

                    GeralFactory.notify('warning', 'Atenção!', 'Informe ao menos um documento fiscal!');
                    $scope.setEtapaDocumentos();

                    return false;
                }

                if(!$scope.frete.cte_doc_vlr_prest) {

                    GeralFactory.notify('warning', 'Atenção!', 'Informe o valor do frete!');
                    $scope.setEtapaConclusao();

                    $scope.tabs = [
                        {active : true},
                        {active : false},
                        {active : true},
                        {active : false}
                    ];

                    return false;
                }

                return true;
            };

            /**
             * Ativa a aba passada como parametro
             * @param id
             */
            // $scope.setTab = function (aba) {
            //
            //     if (aba == 1) {
            //
            //         $scope.tabs = [{active:true}, {active:false}, {active:false}, {active:false}];
            //
            //     } else if (aba == 2) {
            //
            //         $scope.tabs = [{active:false}, {active:true}, {active:false}, {active:false}];
            //
            //     } else if (aba == 3) {
            //
            //         $scope.tabs = [{active:false}, {active:false}, {active:true}, {active:false}];
            //
            //     } else if (aba == 4) {
            //
            //         $scope.tabs = [{active:false}, {active:false}, {active:false}, {active:true}];
            //     }
            // };


            /**
             * Método responsável em voltar as abas ou voltar para tela de listagem das vendas.
             */
            $scope.voltar = function() {

                $timeout(function() {

                    var abaAtiva = angular.element('.sf-active').attr('class');
                    if (abaAtiva) {

                        var aba = parseInt(abaAtiva.match(/\d+/)[0]);
                        if (aba === 0) {

                            $scope.flagTutorial = true;
                            $scope.primeiraEtapa();
                            $scope.resetVars();

                            $scope.listarFretes();
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
             * Volta para a primeira etapa do wizard.
             */
            $scope.primeiraEtapa = function() {
                $timeout(function() {
                    angular.element('.sf-nav-step-0').trigger('click');
                }, 100);
            };


            /**
             * Método responsável em abrir a janela modal contendo o formulário para escolha de uma
             * data de emissão ou de um vendedor para a venda/compra em questão.
             */
            $scope.getJanelaAtributoDocumento = function(campo) {

                var scope = $rootScope.$new();
                var valor;

                //console.log('vvvv:',$scope.frete);
                scope.params = {};

                valor = $scope.frete.fin_dat_lan;
                scope.params.valorEmi = $scope.frete.fin_dat_emi;

                if($scope.frete.fin_dat_sai != '') {

                    scope.params.valorDataSai = $scope.frete.valorDataSai;
                    scope.params.valorHoraSai = $scope.frete.valorHoraSai;
                }

                if(campo == 'IN') {

                    scope.params.fin_6030_esp_doc  = 57;
                    scope.params.fin_6020_natureza = 57;
                }

                scope.params.campo = campo;
                scope.params.valor = valor;
                console.log('scope.params: ',scope.params);

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'venda/views/janela-atributo.html',
                    controller  : 'VendaAtributoCtrl',
                    windowClass : 'center-modal',
                    scope       :  scope,
                    resolve     :  { }
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    console.log('modalInstance', modalInstance);

                    if (msg === 'cancel') {
                        if (modalInstance.hasAlteracao) {

                            switch (campo) {
                                case 'D':

                                    $scope.frete.cte_dat_lan = modalInstance.fin_dat_lan ? modalInstance.fin_dat_lan : $scope.frete.cte_dat_lan;
                                    $scope.frete.fin_dat_emi = modalInstance.fin_dat_emi ? modalInstance.fin_dat_emi : $scope.frete.fin_dat_emi;
                                    $scope.frete.fin_dat_sai = modalInstance.fin_dat_sai ? modalInstance.fin_dat_sai : $scope.frete.fin_dat_sai;

                                    if ($scope.frete.fin_av_ap === 1) {
                                        $scope.parcelarFrete();
                                    }
                                    break;
                                case 'IN':

                                    $scope.listarFretes();
                                    break;
                            }
                        }
                    }
                });
            };

            /**
             * Abre a janela para inserir as informações para inutilização
             */
            $scope.getJanelaInutilizar = function() {

                var scope = $rootScope.$new();

                scope.params = {
                    'cte_fin_nro_lan' : $scope.frete.fin_nro_lan
                };

                //console.log('scope.params: ',scope.params);

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'transporte/views/janela-inutilizar.html',
                    controller  : 'TransporteModalCtrl',
                    windowClass : 'center-modal',
                    scope       :  scope,
                    resolve     :  { }
                });

                modalInstance.result.then(function(id) { }, function(msg) {

                    if (msg === 'reload') {

                        $scope.listarFrete();
                    }
                });
            };

            /**
             * Fatura um frete para o financeiro
             * @param func
             * @returns {boolean}
             */
            $scope.faturar = function(func) {

                //console.log('fatt');
                //console.log('func faturar: ' , func);

                if ($scope.frete.cte_fin_nro_lan) {

                    $scope.salvarFreteLoading = true;

                    var objeto  = {
                        'fin_nro_lan'      : $scope.frete.cte_fin_nro_lan,
                        'fin_sistema'      : $scope.frete.fin_sistema,
                        'fin_tip_emitente' : $scope.frete.fin_tip_emitente,
                        'fin_doc_nro'      : $scope.frete.cte_fin_doc_nro
                    };

                    //console.log('obj faturar: ', objeto);
                    //console.log('obj $scope.frete: ', $scope.frete);

                    if($scope.frete.acao == 0) {

                        /**
                         * var acao = (($scope.frete.fin_cod_origem_local == 1) ? 'faturar' : 'faturarEco');
                         */

                        //console.log('obj faturar: ', objeto);
                        TransporteService.frete.faturar(objeto, function (retorno) {

                            $scope.salvarFreteLoading = false;
                            //console.log('retorna faturar com: ', retorno);
                            //console.log('func faturar2: ', func);

                            if (func) {

                                console.log('entra func vai emit');
                                $scope.getFrete(objeto.fin_nro_lan, function () {
                                    $scope.emitirCTe();
                                });
                            } else {
                                GeralFactory.notificar({data: retorno});
                                //console.log('nao tem func no faturar');
                                $scope.getFrete(objeto.fin_nro_lan);
                            }

                            $scope.listarFretes();

                        });

                    } else if($scope.frete.acao == 1) {

                        if(func) {

                            console.log('entra func vai emit');
                            $scope.emitirCTe();
                        }

                    } else {

                        $scope.salvarFreteLoading = false;

                        if(func) {

                            //console.log('entra func');
                            $scope.getFrete(objeto.fin_nro_lan);
                        } else {
                            GeralFactory.notify('warning', 'Atenção!', 'Não pode ser faturado!');
                            //console.log('nao tem func');
                            $scope.getFrete(objeto.fin_nro_lan);
                        }
                    }


                } else {

                    //console.log('err');
                    GeralFactory.notify('danger','','Antes de faturar salve as alterações.');
                }
            };

            /**
             * Método responsável em emitir o cte.
             */
            $scope.emitirCTe = function() {

                //console.log('lan: ',$scope.frete.cte_fin_nro_lan, ' acao: ',$scope.frete.fin_cod_acao );
                if ($scope.frete.cte_fin_nro_lan) {

                    if($scope.frete.fin_cod_acao === 1) {

                        //envia para a sefaz apenas se tiver situaçao pendente ou se estiver como erro
                        if ($scope.frete.fin_6035_situacao != 15 ||
                            $scope.frete.fin_6035_situacao != 81 ||
                            $scope.frete.fin_6035_situacao != 90 ||
                            $scope.frete.fin_6035_situacao != 91 ||
                            $scope.frete.fin_6035_situacao != 92 ||
                            $scope.frete.fin_6035_situacao != 99
                        ) {

                            var objCte = {};
                            objCte.cte_fin_nro_lan = $scope.frete.cte_fin_nro_lan;

                            $scope.salvarFreteLoading = true;

                            TransporteService.fretes.enviarCTe(objCte, function(retorno) {

                                if(retorno.records.error) {

                                    GeralFactory.notify('danger', 'Erro!', retorno.records.msg);
                                } else {

                                    GeralFactory.notify('success', 'Erro!', retorno.records.msg);
                                }

                                $scope.setEtapaConclusao();

                                //console.log('retorno CTE: ', retorno);
                                $scope.retornoEnvioCte(retorno);

                            });
                        } else  {

                            //console.log('status não permite enviar');
                            // $scope.atualizarStatusNFe();
                            $scope.salvarFreteLoading = false;

                        }

                    } else if($scope.frete.fin_cod_acao === 9) {

                        $scope.imprimirDACTE();

                        //se tiver acao = cancelado e situaçao for pendente ou erro reenvia o cancelamento
                    } else if($scope.frete.fin_cod_acao === 8 && ($scope.frete.fin_6035_situacao == 0 || $scope.frete.fin_6035_situacao == 14)) {

                    }

                }
            };

            /**
             * Retorno das informaçoes do envio da nota
             */
            $scope.retornoEnvioCte = function(retorno) {

                $scope.salvarFreteLoading = false;

                console.log('ret222:',retorno);

                var retEnviarCte = retorno.records;

                var retCodAcao = (retEnviarCte.finCodAcao)?retEnviarCte.finCodAcao:1;

                $scope.frete.fin_cod_acao = retCodAcao;
                $scope.frete.acao = retCodAcao;
                $scope.frete.fin_nfe_chave = retEnviarCte.chave;
                $scope.frete.fin_nfe_motivo = retEnviarCte.strMotivo;

                //console.log('cc:',retCodAcao);

                var ultLog = {};
                ultLog.motivo = retEnviarCte.msg;
                ultLog.msg = retEnviarCte.msg;
                ultLog.error = true;
                ultLog.status = retEnviarCte.codSefaz;

                if(retEnviarCte.codSituacao) {

                    var reg = GeralFactory.getRegistroPorChave($scope.arr_6035, retEnviarCte.codSituacao, 'par_pai');
                    $scope.frete.fin_nome_situacao = reg.par_c01;
                    $scope.frete.codSituacao = retEnviarCte.codSituacao;
                }

                //console.log('ultLog2:',ultLog);
                //console.log('retEnviarCte: :',retEnviarCte);

                //se estiver aguardando, cancelando, inutilizando a3
                if (ultLog.status != 1200 && ultLog.status != 1204 && ultLog.status != 1205) {

                    $scope.countDownA3 = '';
                    $scope.escolherOpcoesCte(retCodAcao,ultLog);
                    $scope.listarFretes();

                } else {

                    if(ultLog.status == 1204) {
                        $scope.counter = 20;
                    }
                    //chama o countdown
                    $scope.onTimeout();
                }
            };

            $scope.escolherOpcoesCte = function(acao,retorno) {

                // console.log('acao: ',acao);
                // console.log('retorno: ',retorno);

                //var motivo = retorno.motivo;
                var msg = retorno.msg;
                var status = retorno.status;

                var opcoesBotoes =[];

                //se acao = cancelado
                if(acao == 9) {

                    if(status == 225) {

                        opcoesBotoes = [
                            {label  : 'Ok',cancel : false,class  : 'btn-primary',value : '1'}];

                    } else {

                        opcoesBotoes = [
                            {label  : 'Ok',cancel : false,class  : 'btn-primary',value : '1'},
                            // {label   : 'Imprimir',primary : true,value : '2'},
                            // {label   : 'Enviar E-mail',value : '3',primary : true}
                        ];
                    }

                } else if(acao == 8) {

                    opcoesBotoes = [
                        {label  : 'Ok',cancel : false,class  : 'btn-primary',value : '1'}];

                } else {

                    if(status == undefined || status == 225 || status == 1202) {
                        opcoesBotoes = [
                            {label  : 'Ok',cancel : false,class  : 'btn-primary',value : '1'},
                        ];
                    } else if(status == 105){
                        opcoesBotoes = [
                            {label  : 'Ok',cancel : false,class  : 'btn-primary',value : '1'},
                            {label   : 'Atualizar',primary : true,value : '4'}
                        ];
                    } else if(status == 1200) {

                        //console.log('eh status 1200');
                        opcoesBotoes = [
                            {label  : 'Ok',cancel : false,class  : 'btn-primary',value : '5'},
                        ];

                    }else {
                        opcoesBotoes = [
                            {label  : 'Ok',cancel : false,class  : 'btn-primary',value : '1'},
                            //{label   : 'Atualizar',primary : true,value : '4'}
                        ];
                    }

                }

                $timeout(function() {
                    $('.modal-sm').css('width','450px');
                },600);

                var msgC = '';
                if($scope.frete.codSituacao == 12 || $scope.frete.codSituacao == 14) {
                    msgC = '<strong><p align="center" style="text-align: center;font-size: 18px;"><i class="icon-close"></i>&nbsp;&nbsp; Erro</p></strong><br>';
                }

                msg = $sce.trustAsHtml(msgC+msg);

                prompt({
                    title      : 'Escolha uma das opções',
                    message    :  msg,
                    buttons    : opcoesBotoes
                }).then(function(result) {

                    //console.log('result: ',result);

                    if(result.value == '2') {

                        $scope.imprimirDACTE();

                    } else if(result.value == '3') {

                        $scope.enviarEmail();

                    } else if(result.value == '4') {

                        $scope.atualizarStatusCTe();

                    } else if(result.value == '5') {

                        //console.log('eh 5555');
                        //$scope.novoFrete(); // tirei pq no A3 na hora que emite ele nao pode voltar pra aba 1
                    }

                }, function() {
                });
            };

            $scope.atualizarStatusCTe = function() {

                $scope.salvarFreteLoading = true;

                TransporteService.frete.atualizarStatusCTe($scope.frete, function(retorno) {
                    $scope.salvarFreteLoading = false;
                    $scope.retornoEnvioCte(retorno);
                });
            };

            /**
             * Método responsável em imprimir o arquivo relativo ao DANFE de uma determinada nota
             * fiscal de frete. A nota ainda não se encontra aprovada!
             */
            $scope.imprimirDACTE = function(ev) {

                //console.log('acao:',$scope.frete.fin_cod_acao);
                //console.log('cte_fin_nro_lan:',$scope.frete.cte_fin_nro_lan);

                if ($scope.frete.cte_fin_nro_lan && ($scope.frete.fin_cod_acao == 9 || $scope.frete.fin_cod_acao == 8)) {

                    var objFiltro = {
                        'chave' : $scope.frete.fin_nfe_chave,
                        'cte_fin_nro_lan' : $scope.frete.cte_fin_nro_lan,
                        'ken' : AuthTokenFactory.getToken()
                    };
                    if(ev) {
                        objFiltro.ev = ev;
                    }

                    var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                    $window.open(GeralFactory.getUrlApi()+'/erp/cte/dacte/?'+strFiltro, 'Relatório');
                }
            };

            /**
             * Inutilizar o CTe
             */
            $scope.inutilizarCte = function() {

                GeralFactory.confirmar('Deseja inutilizar este CTe?', function () {
                    if ($scope.frete.cte_fin_nro_lan) {

                        var obj = {'cte_fin_nro_lan' : $scope.frete.cte_fin_nro_lan};

                        $scope.salvarfreteLoading = true;

                        TransporteService.cte.inutilizarCTe(obj, function(retorno) {

                            $scope.retornoEnvioCte(retorno);

                        });
                    }
                });
            };

            /**
             * Cancelar o CTe
             */
            $scope.cancelarCte = function() {

                GeralFactory.confirmar('Deseja cancelar o CTe?', function () {
                    if ($scope.frete.cte_fin_nro_lan) {

                        $scope.salvarFreteLoading = true;

                        TransporteService.frete.cancelarStatusCTe($scope.frete, function(retorno) {

                            $scope.retornoEnvioCte(retorno);
                        });
                    }
                });
            };

            $scope.getJanelaComoProceder = function () {

                var scope = $rootScope.$new();
                scope.params = {};

                scope.params.fin_nfe_motivo = $scope.frete.fin_nfe_motivo;

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

                    // var ind = $scope.frete.itens.length - 1;
                    //
                    // if (msg === 'reload') {
                    //     //console.log('reloaddd');
                    //
                    //     $scope.frete.itens[ind].ite_seq_tip_especifico = modalInstance.codTipProduto;
                    //
                    //     //console.log('ab:',$scope.frete.itens);
                    //
                    // } else {
                    //     $scope.frete.itens.pop();
                    //     //console.log('fechaaa');
                    // }
                });
            };

            /**
             * Exclui os dados de uma determinada venda ou compra quando a mesma existir na
             * base de dados ou apenas efetua o cancelamento no ato de salvar.
             */
            $scope.cancelar = function (flgExcluir) {

                GeralFactory.confirmar('Deseja cancelar o documento em questão?', function () {
                    if ($scope.frete.fin_nro_lan) {

                        var objeto = {
                            'fin_nro_lan': $scope.frete.fin_nro_lan,
                            'fin_sistema': $scope.frete.fin_sistema
                        };

                        if (flgExcluir == 1) {
                            objeto.excluir_nota = 1;
                        }

                        $scope.salvarFreteLoading = true;
                        VendaService.venda.cancelarDocumento(objeto, function (retorno) {

                            $scope.salvarFreteLoading = false;
                            if (!retorno.records.error) {

                                GeralFactory.notificar({data: retorno});
                                $timeout(function () {

                                    $scope.novoFrete();
                                }, 1000);
                            }
                        });
                    } else {

                        $scope.novoFrete();
                    }
                });
            };

            /**
             Retorna o XML cancelado
             */
            $scope.getXmlCancelado = function() {

                var objFiltro = {
                    'tipo_retorno' : 1,
                    'ken'         : AuthTokenFactory.getToken(),
                    'chave'       : $scope.frete.fin_nfe_chave,
                    'fin_nro_lan' : $scope.frete.fin_nro_lan
                };

                var url = GeralFactory.getUrlApi() + '/erp/cte/get-xml-cancelado/?' + GeralFactory.formatarPesquisar(objFiltro);
                $window.open(url, 'XML');
            };

            /**
             * Abre a modal de envio de email com o email do tomador.
             */
            $scope.getJanelaEnviarEmailTomador = function(tipo) {

                $scope.setTomador();

                $timeout(function () {

                    var obj = {
                        fin_nro_lan: $scope.frete.cte_fin_nro_lan,
                        fin_doc_nro : $scope.frete.cte_fin_doc_nro,
                        contato : {
                            cto_email : $scope.tomador.listaContato[0].cto_email
                        }
                    };


                    //console.log('obj', obj);

                    var scope = $rootScope.$new();

                    scope.params             = {};
                    scope.params.venda       = obj;
                    scope.params.codNatureza = $scope.frete.fin_6020_natureza;
                    scope.params.tipo        = tipo;

                    var modalInstance = $uibModal.open({
                        templateUrl : 'venda/views/envia-email-cliente.html',
                        controller  : 'VendaEnvioEmailModalCtrl',
                        windowClass : 'center-modal',
                        scope       : scope,
                        size: 'md'
                    });
                }, 1000);
            };


            /**
             * Método responsável pela seleção dos dados de uma determinada forma de pagamento
             * pelo componente de autocomplete contido na tela.
             */
            $scope.onSelectFormaPagamentoFrete = function($item) {

                $scope.getFormaPagamentoFrete($item.par_pai);
                $scope.frete.formaPagamentoSelec = $item.par_c01;
            };

            /**
             * Método responsável em adicionar uma determinada forma de pagamento diretamente pelo
             * componente de autocomplete contido na tela.
             */
            $scope.getFormaPagamentoFrete = function($item) {

                var objFormaPagamento = {
                    par_c01 : $item.trim()
                };

                ParamsService.formaPagamentos.create(objFormaPagamento, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.frete.formaPagamentoSelect     = $item.trim();
                        $scope.frete.fin_6060_forma_pagamento = retorno.records.par_pai;
                        $scope.getFormaPagamentoFrete();
                    }
                });
            };

            /**
             * Obtém os dados de uma determinada forma de pagamento.
             */
            $scope.getFormaPagamentoFrete = function(par_pai) {

                if (par_pai) {

                    ParamsService.formaPagamento.get({par_pai : par_pai}, function(data) {

                        $scope.formaPagamento                 = data.records;
                        $scope.frete.fin_6060_forma_pagamento = par_pai;
                    });
                } else {

                    ParamsService.formaPagamentos.get({u : ''}, function(resposta) {
                        $scope.arrFormasPagamento = resposta.records;
                    });
                }
            };

            /**
             * Método responsável pela seleção dos dados de um determinado centro de custo
             * pelo componente de autocomplete contido na tela.
             */
            $scope.onSelectCentroCustoFrete = function($item) {

                $scope.getCentroCustoFrete($item.par_pai);
                $scope.frete.centroCustoSelect = $item.par_c01;
            };

            /**
             * Método responsável em adicionar um determinado centro de custo diretamente pelo
             * componente de autocomplete contido na tela.
             */
            $scope.addCentroCustoFrete = function($item) {

                var objCentroCusto = {
                    par_c01 : $item.trim()
                };

                if ($scope.objDropdown.objCentroCusto.par_i03) {

                    objCentroCusto['par_i03'] = $scope.objDropdown.objCentroCusto.par_i03;
                }

                ParamsService.centroCustos.create(objCentroCusto, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.frete.centroCustoSelect = $item.trim();
                        $scope.frete.fin_6050_cdc      = retorno.records.par_pai;
                        $scope.getCentroCustoFrete();
                    }
                });
            };

            /**
             * Obtém dados de um determinado centro de custo.
             */
            $scope.getCentroCustoFrete = function(par_pai) {

                if (par_pai) {

                    ParamsService.centroCusto.get({par_pai : par_pai}, function(data) {

                        $scope.centroCusto        = data.records;
                        $scope.frete.fin_6050_cdc = par_pai;
                    });
                } else {

                    var strFiltro = '';
                    if ($scope.objDropdown.objCentroCusto.par_i03) {

                        strFiltro = GeralFactory.formatarPesquisar({
                            'par_i03' : $scope.objDropdown.objCentroCusto.par_i03
                        });
                    }

                    ParamsService.centroCustos.get({u : strFiltro}, function(resposta) {
                        $scope.arrCentroCusto = resposta.records;
                    });
                }
            };

            /**
             * Método responsável pela seleção dos dados de uma determinada conta financeira
             * pelo componente de autocomplete contido na tela.
             */
            $scope.onSelectContaFinanceiraFrete = function($item) {

                $scope.getContaFinanceiraFrete($item.par_pai);
                $scope.frete.contaFinanceiraSelect = $item.par_c01;
            };

            /**
             * Método responsável em adicionar uma determinada conta financeira diretamente pelo
             * componente de autocomplete contido na tela.
             */
            $scope.addContaFinanceiraFrete = function($item) {

                var objContaFinanceira = {
                    par_c01 : $item.trim()
                };

                ParamsService.contaFinanceiras.create(objContaFinanceira, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.frete.contaFinanceiraSelect = $item.trim();
                        $scope.frete.tit_5010_conta_fin    = retorno.records.par_pai;
                        $scope.getContaFinanceiraFrete();
                    }
                });
            };

            /**
             * Obtém dados de uma determinada conta financeira.
             */
            $scope.getContaFinanceiraFrete = function(par_pai) {

                if (par_pai) {

                    ParamsService.contaFinanceira.get({par_pai : par_pai}, function(data) {
                        $scope.contaFinanceira          = data.records;
                        $scope.frete.fin_5010_conta_fin = par_pai;
                    });
                } else {

                    ParamsService.contaFinanceiras.get({u : ''}, function(resposta) {
                        $scope.arrContasFinan = resposta.records;
                    });
                }
            };


            /**
             * Inicializa a venda a prazo para uma determinada venda/compra.
             */
            $scope.setMensalFrete = function() {

                if ($scope.frete.cte_doc_vlr_rec) {

                    $scope.frete.fin_av_ap = 1;
                    $scope.frete.fin_cod_periodicidade = 30;

                    // Gerando parcela única para a venda a prazo:
                    $scope.frete.parcelas = [];
                    $scope.frete.fin_dat_lan = $scope.frete.cte_dat_lan;

                    $scope.frete.qtde_parcelas = '1x';

                    //console.log('$scope.frete na setMensalFrete:', $scope.frete);

                    $scope.gerarParcelasByOcorrenciaFrete(1);

                } else {

                    var mensagem = 'Caro usuário, o valor total do frete deve ser maior que zero!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);

                    $scope.tabs = [
                        {active : false}, {active : true}, {active : false}
                    ];
                }
            };

            /**
             * Método responsável em gerar as parcelas recorrentes referente a uma determinada a venda ou
             * compra conforme as escolhas do usuário da aplicação (12x ou 30 60 90)
             */
            $scope.parcelarFrete = function() {

                var mensagem = '';

                $scope.haseditParcelaFrete = false;
                if ($scope.frete.qtde_parcelas) {

                    if ($scope.frete.cte_doc_vlr_rec) {

                        $scope.frete.parcelas = [];
                        $scope.frete.fin_dat_lan = $scope.frete.cte_dat_lan;

                        if ($scope.frete.qtde_parcelas.match(/x/i)) {

                            var split1  = $scope.frete.qtde_parcelas.split('x');
                            var split2  = $scope.frete.qtde_parcelas.split('X');
                            var arrItem = split1.length > split2.length ? split1 : split2;

                            var qtdeParcelas = parseInt(arrItem[0]);
                            qtdeParcelas ? $scope.gerarParcelasByOcorrenciaFrete(qtdeParcelas) : $scope.setMensalFrete();

                        } else {

                            var arrParcelamento = $scope.frete.qtde_parcelas.match(/\d+/g);
                            if (Array.isArray(arrParcelamento)) {
                                $scope.gerarParcelasByAtoFrete(arrParcelamento);
                            }
                        }
                    } else {

                        mensagem = 'Caro usuário, o valor total da venda deve ser maior que zero!';
                        GeralFactory.notify('warning', 'Atenção:', mensagem);
                    }
                } else {

                    mensagem = 'Caro usuário, para gerar as parcelas é necessário mencionar o número de ocorrências!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                }
            };

            /**
             * Método responsável em gerar as parcelas recorrentes de acordo com a quantidade das mesmas
             * escolhidas pelo usuário no formato: 10x, 12x, 36x, etc.
             */
            $scope.gerarParcelasByOcorrenciaFrete = function(qtdeParcelas) {

                var periodicidade = $scope.frete.fin_cod_periodicidade;
                if (qtdeParcelas && periodicidade) {

                    //console.log('$scope.frete na gerarParcelasByOcorrenciaFrete:', $scope.frete);

                    var objData = $scope.getObjetoDataFrete($scope.frete.cte_dat_lan);
                    var defData = new Date(objData.ano, objData.mes, objData.dia);

                    var dtParcela, somaDias = 0, countMes = 1;
                    for (var i = 1; i <= qtdeParcelas; i++)
                    {
                        var descParcela = i + '/' + qtdeParcelas;
                        switch (periodicidade)
                        {
                            case 15:
                            case 90:
                            case 180:
                                // Somando o equivalente a 15 ou 90 ou 180 dias na data de emissão da venda:
                                dtParcela = new Date(new Date(defData).setDate(defData.getDate() + periodicidade));

                                objData = $scope.getObjetoDataFrete(GeralFactory.getDataFormatada(dtParcela));
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

                                objData = $scope.getObjetoDataFrete(GeralFactory.getDataFormatada(dtParcela));
                                defData = new Date(objData.ano, objData.mes, objData.dia);

                                break;
                        }

                        // Verifica qual a forma de pagamento escolhida pelo usuário:
                        var codFormaPgto = 0, descFormaPgto = '';
                        if ($scope.frete.fin_6060_forma_pagamento) {

                            codFormaPgto  = $scope.frete.fin_6060_forma_pagamento;
                            descFormaPgto = $scope.frete.formaPagamentoSelec;
                        }

                        var codContaFinan = 0, descContaFinan = '';
                        if ($scope.frete.fin_5010_conta_fin) {

                            codContaFinan  = $scope.frete.fin_5010_conta_fin;
                            descContaFinan = $scope.frete.contaFinanceiraSelect;
                        }

                        countMes++;
                        somaDias = somaDias + periodicidade;
                        $scope.frete.parcelas.push({
                            'key'                      : i,
                            'dias'                     : somaDias,
                            'tit_descricao'            : descParcela,
                            'tit_faturado'             : 0,
                            'tit_dat_vct'              : GeralFactory.getDataFormatada(dtParcela),
                            'tit_6060_forma_pagamento' : codFormaPgto,
                            'tit_6060_desc_forma_pgto' : descFormaPgto,
                            'tit_5010_conta_fin'       : codContaFinan,
                            'tit_5010_desc_conta_fin'  : descContaFinan
                        });
                    }

                    $scope.calcularSomaValorFrete();
                    $scope.distribuirParcelasFrete();

                } else {

                    $scope.arrParcelas = [];
                    // $scope.ajustarAlturaWizard();

                    var mensagem = 'Para gerar as parcelas é necessário informar o número de ocorrências e a periodicidade!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                }

                //console.log('Parcelas:', $scope.frete.parcelas);
            };

            /**
             *
             */
            $scope.calcularSomaValorFrete = function() {

                var valorRateado    = Math.floor($scope.frete.cte_doc_vlr_rec / $scope.frete.parcelas.length * 100) / 100;
                var valorDifferenca = $scope.frete.cte_doc_vlr_rec - (valorRateado * $scope.frete.parcelas.length);

                var flag = 1;
                angular.forEach($scope.frete.parcelas, function(elem, key) {

                    // Se for o primeiro registro ele adiciona o valor da diferença de rateio.
                    if (flag) {
                        flag = 0;
                        $scope.frete.parcelas[key].tit_doc_vlr_liquido = valorRateado + valorDifferenca;
                    } else {
                        $scope.frete.parcelas[key].tit_doc_vlr_liquido = valorRateado;
                    }
                });
            };

            /**
             * Método responsável em gerar as parcelas recorrentes de acordo com o sequência/ato
             * escolhido pelo usuário no formato: 30 60 90 120, etc.
             */
            $scope.gerarParcelasByAtoFrete = function(arrParcelas) {

                if (arrParcelas.length > 0) {

                    var objData = $scope.getObjetoDataFrete($scope.frete.cte_dat_lan);
                    var defData = new Date(objData.ano, objData.mes, objData.dia);

                    angular.forEach(arrParcelas, function(item, chave) {

                        var qtdeDias  = parseInt(item);
                        var dtParcela = new Date(new Date(defData).setDate(defData.getDate() + qtdeDias));

                        // Verifica qual a forma de pagamento escolhida pelo usuário:
                        var codFormaPgto = 0, descFormaPgto = '';
                        if ($scope.frete.fin_6060_forma_pagamento) {

                            codFormaPgto  = $scope.frete.fin_6060_forma_pagamento;
                            descFormaPgto = $scope.frete.formaPagamentoSelec;
                        }

                        var codContaFinan = 0, descContaFinan = '';
                        if ($scope.frete.fin_5010_conta_fin) {

                            codContaFinan  = $scope.frete.fin_5010_conta_fin;
                            descContaFinan = $scope.frete.contaFinanceiraSelect;
                        }

                        var descParcela = ($scope.cliente) ? $scope.frete.nomeNaturezaSing + ' para ' + $scope.cliente.cad_nome_razao + ' ' + qtdeDias : qtdeDias;
                        $scope.frete.parcelas.push({
                            'key'                      : chave,
                            'dias'                     : qtdeDias,
                            'tit_descricao'            : descParcela,
                            'tit_faturado'             : 0,
                            'tit_dat_vct'              : GeralFactory.getDataFormatada(dtParcela),
                            'tit_6060_forma_pagamento' : codFormaPgto,
                            'tit_6060_desc_forma_pgto' : descFormaPgto,
                            'tit_5010_conta_fin'       : codContaFinan,
                            'tit_5010_desc_conta_fin'  : descContaFinan
                        });
                    });

                    $scope.frete.fin_cod_periodicidade = 0;
                    $scope.calcularSomaValorFrete();
                    $scope.distribuirParcelasFrete();

                } else {

                    var mensagem = 'Caro usuário, número de parcelas inválido!';
                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                }
            };

            /**
             * Método responsável em distribuir as parcelas em três vetores para ficarem
             * melhores distribuidas na tela de vendas e compras.
             */
            $scope.distribuirParcelasFrete = function() {

                var qtdeTotal = $scope.frete.parcelas.length;
                if (qtdeTotal) {

                    var fator = Math.floor(qtdeTotal / 2);
                    var arrParcelasOne = [], arrParcelasTwo = [];

                    angular.forEach($scope.frete.parcelas, function(item) {
                        arrParcelasOne.length < fator ? arrParcelasOne.push(item) : arrParcelasTwo.push(item);
                    });

                    $scope.arrParcelas = [arrParcelasOne, arrParcelasTwo];
                    // $scope.ajustarAlturaWizard();
                }
            };

            /**
             * Método responsável em retornar um objeto contendo o dia, mês e ano
             * de uma determinada data.
             */
            $scope.getObjetoDataFrete = function(strData) {
                var arrData = strData.split('/');
                return {
                    'dia' : parseInt(arrData[0]),
                    'mes' : parseInt(arrData[1]) - 1,
                    'ano' : parseInt(arrData[2])
                };
            };

            /**
             * Método responsável em editar os dados de uma determinada parcela.
             */
            $scope.editParcelaFrete = function(parcela) {

                var mensagem = '';

                if ($scope.frete.fin_nro_lan && parcela.tit_fatura_seq) {

                    // Edição das parcelas só pode acontecer em documentos em modo de edição:
                    if ($scope.frete.fin_cod_acao === 0) {

                        $scope.parcelaSelecionada = parcela;

                        var vlrLiquidoFrete = parseFloat($scope.frete.cte_doc_vlr_rec);
                        var scope = $rootScope.$new();
                        scope.params = {
                            'objParcela'       : angular.copy(parcela),
                            'objVendaParcelas' : $scope.objCloneParcelas,
                            'vlrLiquidoVenda'  : vlrLiquidoFrete
                        };

                        var modalInstance = $uibModal.open({
                            animation   :  true,
                            templateUrl : 'venda/views/janela-parcela.html',
                            controller  : 'VendaParcelaModalCtrl',
                            size        : 'md',
                            windowClass : 'center-modal no-top-modal',
                            scope       :  scope,
                            resolve     :  {}
                        });

                        modalInstance.result.then(function(id) { }, function(msg) {
                            if (msg === 'cancel') {
                                if (modalInstance.hasAlteracao) {

                                    // Indica que o usuário alterou os valores das parcelas.
                                    $scope.hasEditParcela = true;

                                    parcela.tit_dat_vct              = modalInstance.objParcelaNova.tit_dat_vct;
                                    parcela.tit_doc_vlr_liquido      = modalInstance.objParcelaNova.tit_doc_vlr_liquido;
                                    parcela.tit_6060_forma_pagamento = modalInstance.objParcelaNova.tit_6060_forma_pagamento;
                                    parcela.tit_6060_desc_forma_pgto = modalInstance.objParcelaNova.tit_6060_desc_forma_pgto;
                                    parcela.tit_5010_conta_fin       = modalInstance.objParcelaNova.tit_5010_conta_fin;
                                    parcela.tit_5010_desc_conta_fin  = modalInstance.objParcelaNova.tit_5010_desc_conta_fin;

                                    //console.log('Objeto clone: ', $scope.objCloneParcelas);
                                    if (modalInstance.vlrUntilParcela) {

                                        var arrParcelasRestantes = [], qtdeParcelasRestantes = 0;
                                        angular.forEach($scope.objCloneParcelas, function(item, chave) {

                                            // Verifica as parcelas restantes para rateio do valor liquído da frete:
                                            if (item.tit_fatura_seq > parcela.tit_fatura_seq) {

                                                qtdeParcelasRestantes++;
                                                arrParcelasRestantes.push(chave);
                                            }
                                        });

                                        if (qtdeParcelasRestantes) {

                                            var vlrRateio = vlrLiquidoFrete - parseFloat(modalInstance.vlrUntilParcela);

                                            vlrRateio = vlrRateio / qtdeParcelasRestantes;
                                            vlrRateio = parseFloat(vlrRateio.toFixed(2));

                                            angular.forEach(arrParcelasRestantes, function(item) {
                                                $scope.objCloneParcelas[item].tit_doc_vlr_liquido = vlrRateio;
                                            });

                                            $timeout(function() {
                                                angular.forEach($scope.objCloneParcelas, function(item, chave) {
                                                    if (item.tit_fatura_seq !== parcela.tit_fatura_seq) {

                                                        $scope.frete.parcelas[chave].tit_doc_vlr_liquido = parseFloat(item.tit_doc_vlr_liquido);
                                                    }
                                                });

                                                $scope.objCloneParcelas = angular.copy($scope.frete.parcelas);
                                            }, 200);
                                        }
                                    }
                                }
                            }
                        });
                    } else {

                        mensagem = 'A edição de uma determinada parcela só pode acontecer em modo de edição!';
                        GeralFactory.notify('warning', 'Atenção!', mensagem);
                    }
                } else {

                    mensagem = 'Para editar os dados da parcela é necessário primeiramente salvar o Frete!';
                    GeralFactory.notify('warning', 'Atenção!', mensagem);
                }
            };

            /**
             * Baixa o xml do CTe autorizado
             */
            $scope.baixarXml = function() {

                var objFiltro = {
                    'tipo_retorno' : 1,
                    'ken'         : AuthTokenFactory.getToken(),
                    'chave'       : $scope.frete.fin_nfe_chave,
                    'cte_fin_nro_lan' : $scope.frete.fin_nro_lan
                };

                var target = 'get-xml-aprovado';

                if($scope.frete.codSituacao == 14) {

                    target = 'get-xml-erro';
                }

                var url = GeralFactory.getUrlApi() + '/erp/cte/'+ target +'/?' + GeralFactory.formatarPesquisar(objFiltro);
                $window.open(url, 'XML');
            };


            /**
             * Salva, fatura e emite Nfe
             */
            $scope.salvarFaturarEmitirCTe = function() {

                $scope.emitirNfeLoading = true;

                //console.log('frete', $scope.frete);

                $scope.salvarFrete(function() {

                    $scope.faturar(1);
                });
            };

            /**
             * Cancela um Frete no banco de dados
             */
            $scope.excluirFrete = function () {

                GeralFactory.confirmar('Deseja realmente excluir o frete?', function() {
                    if ($scope.frete.fin_nro_lan) {

                        $scope.salvarFreteLoading = true;

                        var objeto = {'fin_nro_lan' : $scope.frete.fin_nro_lan};
                        TransporteService.frete.cancelar(objeto, function(retorno) {

                            $scope.salvarFreteLoading = false;
                            if (! retorno.records.error) {

                                $scope.novoFrete();
                            }
                        });
                    } else {

                        $scope.novoFrete();
                    }
                });
            };

            /**
             * Retorna a janela de form carta de correçao da nota ou uma nova
             */
            $scope.getFormCceCte = function(obs_seq) {

                //console.log('formccee');
                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.fin_nro_lan = $scope.frete.fin_nro_lan;

                if (obs_seq) {

                    scope.params.obs_seq = obs_seq;
                }

                //console.log('uuu');
                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'transporte/views/janela-cte-cce.html',
                    controller  : 'TransporteCceModalCtrl',
                    size        : 'lg',
                    windowClass : 'center-modal',
                    scope       :  scope,
                    resolve     :  {

                    }
                });

                modalInstance.result.then(function(id) { }, function(msg) {

                    if (msg === 'reload'){

                        $scope.listarVixCteObs();
                        // VendaService.clienteAnotacoes.get({cad_cod_cad : $scope.cliente.cad_cod_cad}, function(data) {
                        //     $scope.listaAnotacao = data.records;
                        // });
                    }
                });
            };

            /**
             * Método responsável em imprimir o arquivo relativo ao DANFE CCe
             */
            $scope.imprimirCceFrete = function() {

                var objFiltro = {
                    'chave'           : $scope.frete.fin_nfe_chave,
                    'cte_fin_nro_lan' : $scope.frete.fin_nro_lan,
                    'ken'             : AuthTokenFactory.getToken(),
                    'ev'              : 'cce',
                    'seq'             : $scope.arrFreteObs.length
                };

                var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                $window.open(GeralFactory.getUrlApi()+'/erp/cte/dacte/?'+strFiltro, 'Relatório');

            };

            /**
             * Retorna o xml da ultima Cce enviada
             */
            $scope.getXmlCceFrete = function() {

                console.log('$scope.arrFreteObs.length', $scope.arrFreteObs.length)
                console.log('$scope.arrFreteObs', $scope.arrFreteObs)

                var objFiltro = {
                    'tipo_retorno'    : 1,
                    'ken'             : AuthTokenFactory.getToken(),
                    'chave'           : $scope.frete.fin_nfe_chave,
                    'cte_fin_nro_lan' : $scope.frete.fin_nro_lan,
                    'seq'             : $scope.arrFreteObs.length
                };

                var url = GeralFactory.getUrlApi() + '/erp/cte/get-xml-cce/?' + GeralFactory.formatarPesquisar(objFiltro);
                console.log('url', url);

                $window.open(url, 'XML');

            };

            /**
             * Lista as cartas de correção associadas ao CTe
             */
            $scope.listarVixCteObs = function() {

                var strFiltro = 'q=(str_obs:'+$scope.frete.fin_nro_lan+')'; //1= tipo cce

                $scope.liberaNovaCce = false;
                $scope.arrFreteObs   = [];
                var strCh = '';

                TransporteService.fretesObs.get({u : strFiltro}).$promise.then(function(resposta) {

                    //console.log('rrrr:',resposta);
                    angular.forEach(resposta.records, function(reg, k) {

                        if(reg['obs_tip'] == 57) {
                            reg['obs_btenvia'] = false;

                            //se o registro da cce não tiver sido aceito pela sefaz
                            if(reg['obs_cod_retorno'] != '135' && reg['obs_cod_retorno'] != '573')  {
                                reg['obs_btenvia'] = true;
                                reg['obs_str_retorno'] = 'Erro';

                                $scope.liberaNovaCce = true;

                            } else {
                                reg['obs_str_retorno'] = 'Enviado';
                            }

                            $scope.arrFreteObs.push(reg);

                        } else if(reg['obs_tip'] == 2) {

                            $scope.frete.fin_modelo_referenciada = '2';
                            $scope.frete.obs_chave = reg.obs_chave;

                        } else if(reg['obs_tip'] == 4) {


                            $scope.frete.fin_modelo_referenciada = '4';
                            $scope.frete.obs_doc_nro = reg.obs_doc_nro;
                            $scope.frete.obs_doc_dat_emi = GeralFactory.formatarDataBr(reg.obs_doc_dat_emi);

                        } else if(reg['obs_tip'] == 10) {

                            $scope.frete.fin_modelo_referenciada = '10';
                            $scope.frete.obs_doc_nro = reg.obs_doc_nro;
                            $scope.frete.obs_doc_dat_emi = GeralFactory.formatarDataBr(reg.obs_doc_dat_emi);

                        } else if(reg['obs_tip'] == 11) {

                            $scope.frete.fin_modelo_referenciada = '11';
                            $scope.frete.obs_doc_nro = reg.obs_doc_nro;
                            $scope.frete.obs_doc_dat_emi = GeralFactory.formatarDataBr(reg.obs_doc_dat_emi);

                        } else if(reg['obs_tip'] == 30) {

                            $scope.frete.fin_modelo_referenciada = '30';
                            $scope.frete.obs_doc_nro_ecf = reg.obs_doc_nro_ecf;
                            $scope.frete.obs_doc_coo = reg.obs_doc_coo;

                        } else if(reg['obs_tip'] == 65) {

                            $scope.frete.fin_modelo_referenciada = '65';
                            $scope.frete.obs_chave = reg.obs_chave;
                        }
                    });
                });
            };

            $scope.atualizarRetornoA3 = function () {

                $scope.emitirRetornoA3Loading = true;

                $scope.getFrete($scope.frete.fin_nro_lan, function () {
                    $scope.setEtapaConclusao();
                    $scope.emitirRetornoA3Loading = false;

                    // console.log('sit: ', $scope.venda.fin_6035_situacao);
                    // console.log('click', $scope.clicouAcaoNfeA3);

                    if ($scope.frete.fin_6035_situacao == 1200 || $scope.frete.fin_6035_situacao == 1203 || $scope.frete.fin_6035_situacao == 1204 || $scope.frete.fin_6035_situacao == 1205 || $scope.frete.fin_6035_situacao == 13) {

                        $scope.counter = 10;
                        $scope.onTimeout();

                    } else {
                        $scope.countDownA3 = '';
                        $scope.listarFretes();
                    }
                });
            };


            $scope.counter = 10;
            $scope.onTimeout = function () {

                // console.log('ontiemouttttt',$scope.counter);

                $scope.counter--;
                $scope.countDownA3 = ' Atualizando em ' + $scope.counter + ' segundos.';

                if ($scope.counter > 0) {

                    var mytimeout = $timeout($scope.onTimeout, 1000);

                } else {

                    $scope.countDownA3 = '';
                    $scope.atualizarRetornoA3();
                }
            };
        }
    ]);

angular.module('newApp')

    .controller('VeiculosCtrl', [

        '$scope', '$rootScope', '$uibModal', '$timeout','$sce', '$filter','$location', '$window', 'TransporteService', 'GeralFactory', 'CONFIG', 'AuthTokenFactory','prompt', 'Storage', 'NotifyFlag', 'Constantes', 'EndGeralService',

        function ($scope, $rootScope, $uibModal, $timeout, $sce, $filter, $location, $window, TransporteService, GeralFactory, CONFIG, AuthTokenFactory,prompt, Storage, NotifyFlag, Constantes, EndGeralService) {
            $rootScope.hasAutorizacao();

            $scope.$on('$viewContentLoaded', function () {

                $scope.flagTutorial = true;

                $scope.veiculo     = {};
                $scope.arrVeiculos = {};

                //console.log('$scope.veiculo', $scope.veiculo);
                //console.log('$scope.arrVeiculos', $scope.arrVeiculos);

                $scope.listarVeiculos();
                $scope.resetVeicVars();
                $scope.listaUfs();

                $scope.siglaTutorial               = 'VEI';
                $scope.labelTutorial               = 'Cadastro de novos veículos';
            });

            /**
             *
             */
            $scope.resetVeicVars = function() {

                $scope.salvarVeiculoLoading = false;

                $scope.veiculo = {};

                $scope.arrTpVeic = [{
                    id   :  0,
                    nome : 'Tração'
                }, {
                    id   :  1,
                    nome : 'Reboque'
                }];


                $scope.arrTpRodado = [{
                    id   :  0,
                    nome : 'Não aplicável'
                }, {
                    id   :  1,
                    nome : 'Truck'
                }, {
                    id   :  2,
                    nome : 'Toco'
                }, {
                    id   :  3,
                    nome : 'Cavalo Mecânico'
                }, {
                    id   :  4,
                    nome : 'VAN'
                }, {
                    id   :  5,
                    nome : 'Utilitário'
                }, {
                    id   :  6,
                    nome : 'Outros'
                }];


                $scope.arrTpCarroceria = [{
                    id   :  0,
                    nome : 'Não aplicável'
                }, {
                    id   :  1,
                    nome : 'Aberta'
                }, {
                    id   :  2,
                    nome : 'Fechada/Baú'
                }, {
                    id   :  3,
                    nome : 'Granelera'
                }, {
                    id   :  4,
                    nome : 'Porta Container'
                }, {
                    id   :  5,
                    nome : 'Sider'
                }];
            };


            /**
             * Lista os veículos de propriedade da empres:  'vei_tipo_prop' : 'P';
             */
            $scope.listarVeiculos = function () {

                $rootScope.spinnerList.on();

                var objFiltro = {
                    'vei_tipo_prop' : 'P'
                };

                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=0');

                TransporteService.veiculos.listar({u : strFiltro}, function (retorno) {

                    if(!retorno.records.error) {

                        $scope.arrVeiculos = retorno.records;
                        //console.log('$scope.arrVeiculos', $scope.arrVeiculos);
                    }

                    $rootScope.spinnerList.off();
                });
            };

            /**
             * Busca por um veículo específico
             * @param id
             */
            $scope.getVeiculo = function (id) {

                $rootScope.spinnerList.on();

                TransporteService.veiculos.get({u : id}, function (retorno) {

                    if(!retorno.records.error) {

                        $scope.veiculo = retorno.records;
                        //console.log('$scope.veiculo', $scope.veiculo);
                    }

                    $timeout(function () {
                        $rootScope.spinnerList.off();
                        $scope.flagTutorial = false;
                    }, 500);
                });
            };

            /**
             * Seta o form para um novo veículo
             */
            $scope.novoVeiculo = function() {

                //console.log('$scope.novoVeiculo');

                $timeout(function() {
                    $scope.flagTutorial = false;
                }, 500);

                $scope.forms.form_veiculo.$setPristine();

                $scope.resetVeicVars();
                $scope.listarVeiculos();
            };

            $scope.listaUfs = function () {

                EndGeralService.ufs.get({}, function(retorno) {

                    $scope.arrUF = retorno.records;
                });
            };

            /**
             * Salva o cadastro do veículo
             */
            $scope.salvarVeiculo = function () {

                $scope.salvarVeiculoLoading = true;

                //console.log('$scope.veiculo', $scope.veiculo);

                $scope.$watch('forms.form_veiculo', function(form) {

                    if (form) {

                        if (form.$invalid) {

                            //console.log('inválido');
                            $scope.submitted = true;
                            $scope.salvarVeiculoLoading = false;

                            GeralFactory.notify('danger', 'Erro!', 'Todos os campos são de preenchimento obrigatório!');

                        } else {

                            $scope.veiculo.vei_tipo_prop            = 'P';
                            $scope.veiculo.vei_cad_cod_proprietario = 0;

                            $scope.submitted = false;
                            TransporteService.veiculos.create($scope.veiculo, function (retorno) {

                                //console.log('retorno', retorno);

                                if(!retorno.records.error) {

                                    GeralFactory.notify('success', 'Sucesso!', retorno.records.msg);
                                    $scope.listarVeiculos();
                                    $scope.getVeiculo(retorno.records.vei_cod_vei);

                                    $scope.salvarVeiculoLoading = false;

                                } else {

                                    GeralFactory.notify('danger', 'Erro!', retorno.records.msg);

                                    $scope.salvarVeiculoLoading = false;
                                }

                            });
                        }
                    }
                });
            };

            /**
             * Cancela o registro do veículo no banco de dados
             */
            $scope.cancelarVeiculo = function() {

                if ($scope.veiculo.vei_cod_vei == null) {

                    $scope.novoVeiculo();

                } else {

                    GeralFactory.confirmar('Deseja realmente excluir esse veículo?', function() {

                        var objeto = {vei_cod_vei : $scope.veiculo.vei_cod_vei};
                        TransporteService.veiculos.cancelar(objeto, function(retorno) {
                            if (! retorno.error) {

                                $scope.listarVeiculos();
                                $scopecou.novoVeiculo();
                            }
                        });
                    });
                }
            };
        }
    ]);