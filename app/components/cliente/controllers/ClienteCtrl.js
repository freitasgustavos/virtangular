'use strict';

angular.module('newApp')

    .controller('ClienteCtrl', [

        '$scope', '$rootScope', '$uibModal', '$location', '$timeout', '$window', '$sce', '$filter', 'MidiaService', 'AuthTokenFactory', 'ClienteService', 'EndGeralService','GeralFactory', 'NotifyFlag', 'ParamsService', 'ProdutoService', 'Constantes', '$controller', 'Wizard',

        function($scope, $rootScope, $uibModal, $location, $timeout, $window, $sce, $filter, MidiaService, AuthTokenFactory, ClienteService, EndGeralService, GeralFactory, NotifyFlag, ParamsService, ProdutoService, Constantes, $controller, Wizard) {

            $rootScope.hasAutorizacao();

            $scope.$on('$viewContentLoaded', function() {

                $scope.setAbaInicial(1);

                $scope.flagTutorial         = true;
                $scope.salvarClienteClique  = true;
                $scope.hasFilter            = false;
                $scope.flagMsg              = false;
                $scope.flgAbrirModalContato = false;
                $scope.nomeBotaoCancelar    = 'Cancelar';

                $scope.setLabelTitular();
                $scope.getRandFoto();

                $scope.cliente.cad_eh_inativo_aux      = true;
                $scope.cliente.cad_eh_cancelado_aux    = false;
                $scope.cliente.eh_contribuinte_aux     = false;
                $scope.cliente.eh_contribuinte_iss_aux = false;

                $scope.autoPreencher = true;
                $scope.frstTime = true;
                $scope.listarClientes();
                $scope.listarObjetosTela();

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
                dragCtrl.setDropzone('cliente');
                
                $scope.modelType = 'cliente';

                $timeout(function(){
                    Wizard.loadWizards.initialize(25);
                }, 2000);
            });

            $scope.activeTab          = true;
            $scope.arrTipos           = [];
            $scope.arrMarcacoes       = [];
            $scope.totais             = [];
            $scope.arrClientes        = [];
            $scope.arrAnexos          = [];
            $scope.arrPaises          = [];
            $scope.forms              = {};
            $scope.cliente            = {};
            $scope.cliente.endereco   = {};
            $scope.clienteSelecionado = {};
            $scope.isOnlyNotaFiscal   = $rootScope.hasOnlySolucao(10);
            $scope.objFiltro          = {
                texto_pesquisa : '',
                cad_status     : 'A'
            };


            /**
             * Retorna uma lista de clientes ou fornecedores baseada na pesquisa efetuada pelo usuário.
             */
            $scope.getPesquisar = function(event) {

                if (! GeralFactory.inArray(event.which, Constantes.KEYS)) {
                    $timeout(function() {
                        $scope.listarClientes();
                    }, 500);
                }
            };

            /**
             * Método responsável em retornar a lista contendo os clientes ou fornecedores.
             */
            $scope.listarClientes = function() {

                $rootScope.spinnerList.on();
                $scope.arrClientes = [];

                var objFiltro = $scope.getObjFiltro();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=0');

                ClienteService.clientes.getFast({u : strFiltro}, function(retorno) {
                    if($scope.frstTime){
                        $scope.isClientEmpty = retorno.records.length < 1;
                        $scope.frstTime = false;
                    }
                    
                    if (retorno.records.length > 0) {

                        $timeout(function() {
                            $scope.arrClientes = retorno.records;
                            $rootScope.spinnerList.off();
                        });
                    } else {

                        $rootScope.spinnerList.off();
                    }

                    $scope.getTotais();
                });
            };

            /**
             * Método responsável efetuar a paginação dos clientes.
             */
            $scope.paginarClientes = function() {

                $rootScope.spinnerList.on();

                var objFiltro = $scope.getObjFiltro();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=' + $scope.getOffset());

                ClienteService.clientes.getFast({u : strFiltro}, function(retorno) {
                    if (retorno.records.length > 0) {

                        angular.forEach(retorno.records, function(item) {
                            $scope.arrClientes.push(item);
                        });

                        $timeout(function() {
                            $rootScope.spinnerList.off();
                        });
                    } else {

                        $rootScope.spinnerList.off();

                        var mensagem = 'Caro usuário, a listagem ' + $scope.cliente.labelTitularPlural + ' já se encontra completa!';
                        GeralFactory.notify('warning', 'Atenção:', mensagem);
                    }
                });
            };

            /**
             * Retorna o limite de registros para a paginação.
             */
            $scope.getOffset = function() {

                return ($scope.arrClientes.length) ? $scope.arrClientes.length : 0;
            };

            /**
             * Método responsável em retornar o objeto contendo o filtro aplicado pelo usuário.
             */
            $scope.getObjFiltro = function() {

                var objFiltro = {
                    'texto_pesquisa'      : GeralFactory.replaceArray($scope.objFiltro.texto_pesquisa, ['.', '/', '-'], ''),
                    'cad_sexo'            : GeralFactory.getStringFiltroOffArray($scope.objFiltro.sexo, 'id'),
                    'cad_pf_pj'           : GeralFactory.getStringFiltroOffArray($scope.objFiltro.tipoPessoa, 'id'),
                    'arr_2040_tipo_cad'   : GeralFactory.getStringFiltroOffArray($scope.objFiltro.tipoCadastro, 'par_pai'),
                    'cad_tip_cli_for'     : $scope.cliente.cad_tip_cli_for,
                    'cad_status'          : $scope.objFiltro.cad_status,
                    'dt_cad_inicio'       : $scope.objFiltro.dt_cad_inicio,
                    'dt_cad_final'        : $scope.objFiltro.dt_cad_final,
                    'cad_cod_cad_inicio'  : $scope.objFiltro.cad_cod_cad_inicio,
                    'cad_cod_cad_final'   : $scope.objFiltro.cad_cod_cad_final,
                    'dt_cad_niver_inicio' : $scope.objFiltro.dt_cad_niver_inicio,
                    'dt_cad_niver_final'  : $scope.objFiltro.dt_cad_niver_final
                };

                return objFiltro;
            };

            /**
             * Metodo responsavel em retornar o total de clientes ou fornecedores ativos, inativos e novos.
             */
            $scope.getTotais = function() {

                var strFiltro = GeralFactory.formatarPesquisar({
                    'cad_tip_cli_for' : $scope.cliente.cad_tip_cli_for,
                    'cad_status'      : 'T'
                });

                delete strFiltro.cad_status;
                ClienteService.clientes.getTotais({u : strFiltro}, function(data) {
                    if (data.records) {

                        $scope.totais = data.records;
                    }
                });
            };

            /**
             * Efetua a troca da pessoa.
             */
            $scope.trocarPessoa = function(id) {

                $scope.cliente.eh_contribuinte_aux = (id == 1) ? false : true;
            };

            /**
             * Recolhe todas as marcações existentes para o tipo cliente/fornecedor.
             */
            $scope.listarObjetosTela = function() {

                $timeout(function() {

                    $scope.triggerListarAnexos();
                    $scope.listaUf_fat = EndGeralService.ufs.get({});

                    ClienteService.clientes.getDados({u : 'q=(mar_tab:2)'}, function(retorno) {
                        if (retorno.records) {

                            $scope.arrTiposCadastro = retorno.records.arr_tipos;
    
                            var arrMarcacoes = retorno.records.arr_marcas, arrAuxiliar = [];
                            angular.forEach(arrMarcacoes, function(item) {
                                arrAuxiliar.push({
                                    name                : item.mar_descricao_marca,
                                    mar_descricao_marca : item.mar_descricao_marca,
                                    mar_cod_marca       : item.mar_cod_marca
                                });
                            });

                            $scope.arrMarcacoes = arrAuxiliar;
                        }
                    });

                    $scope.arrSexo = [{
                        'id'   : 1,
                        'name' : 'Masculino'
                    }, {
                        'id'   : 2,
                        'name' : 'Feminino'
                    }];

                    $scope.arrTipoPessoa = [{
                        'id'   : 1,
                        'name' : 'Pessoa Física'
                    }, {
                        'id'   : 2,
                        'name' : 'Pessoa Jurídica'
                    }];
                });
            };

            /**
             * Método que é chamado no cadastro de cliente ou fornecedor quando o usuário clica
             * nas outras abas para forçar a inserção dos dados.
             */
            $scope.getOutrasAbas = function(id) {

                if ($scope.cliente.cad_cod_cad == undefined) {
                    $scope.verificarSalvarCliente(function() {

                        $scope.setAbaInicial(id);
                    });
                }
            };

            /**
             * Método responsável em salvar os dados do cliente ou fornecedor fora do método convecional do botão salvar.
             * Se o cliente não for salvo ele salva quando clicar no botão novo contato.
             */
            $scope.verificarSalvarCliente = function(func) {

                $scope.$watch('forms.form1', function(form) {
                    if (form) {
                        if (form.$invalid) {

                            $scope.submitted = true;

                        } else {

                            $scope.cliente.cad_eh_inativo = ($scope.cliente.cad_eh_inativo_aux) ? 0 : 1;
                            NotifyFlag.setFlag(false);

                            ClienteService.clientes.create($scope.cliente, function(resposta) {

                                $scope.listarClientes();
                                $scope.getCliente(resposta.records.cad_cod_cad);

                                $scope.cliente.cad_cod_cad = resposta.records.cad_cod_cad;
                                func.call();
                            });
                        }
                    }
                });
            };

            /**
             * Seleciona uma foto de maneira randômica para o usuário.
             */
            $scope.getRandFoto = function(cad_sexo) {

                if ($scope.cliente.cad_cod_cad == null) {

                    var arrFeminino  = [3, 5, 7, 8, 12];
                    var arrMasculino = [1, 2, 4, 6, 9, 10, 11, 13];

                    var arrAuxiliar = [], avatar = null;
                    if (cad_sexo) {

                        // Verificando qual vetor utilizar de acordo com o sexo para escolha da foto.
                        arrAuxiliar = (cad_sexo === 1) ? arrMasculino : arrFeminino;
                        avatar = arrAuxiliar[Math.floor(Math.random() * arrAuxiliar.length)];

                    } else {

                        // Quando não existir a escolha de um sexo, unificar o vetor para escolha da foto.
                        arrAuxiliar = arrFeminino.concat(arrMasculino);
                        avatar = Math.floor(Math.random() * ((arrAuxiliar.length - 1) - 0 + 1)) + 1;
                    }

                    $scope.cliente.cad_arquivo_foto = avatar;
                }
            };

            /**
             * Seta os labels padrões da cliente/fornecedor
             */
            $scope.setLabelTitular = function() {

                $scope.cliente.tipoCliFor = $location.$$path.replace('/', '');

                if ($scope.cliente.tipoCliFor === 'cliente') {

                    if (! $rootScope.getPermissao('25')) {
                        $location.path('/');
                    }

                    $scope.siglaTutorial               = 'CLI';
                    $scope.labelTutorial               = 'Cadastro de novos clientes';
                    $scope.cliente.labelTitular        = 'Clientes';
                    $scope.cliente.labelTitularSing    = 'Cliente';
                    $scope.cliente.labelTitularMin     = 'clientes';
                    $scope.cliente.labelTitularPlural  = 'dos clientes';
                    $scope.cliente.labelTitularSingMin = 'cliente';
                    $scope.cliente.cad_tip_cli_for     =  1;
                    $scope.cliente.cad_pf_pj           =  $scope.cliente.cad_pf_pj ? $scope.cliente.cad_pf_pj : '1';
                    $scope.cliente.eh_contribuinte_aux =  false;
                    $scope.cliente.eh_contribuinte_iss_aux = false;

                } else if ($scope.cliente.tipoCliFor === 'fornecedor') {

                    if (! $rootScope.getPermissao('14')) {
                        $location.path('/');
                    }

                    $scope.siglaTutorial               = 'FOR';
                    $scope.labelTutorial               = 'Cadastro de novos fornecedores';
                    $scope.cliente.labelTitular        = 'Fornecedores';
                    $scope.cliente.labelTitularSing    = 'Fornecedor';
                    $scope.cliente.labelTitularMin     = 'fornecedores';
                    $scope.cliente.labelTitularPlural  = 'dos fornecedores';
                    $scope.cliente.labelTitularSingMin = 'fornecedor';
                    $scope.cliente.cad_tip_cli_for     =  2;
                    $scope.cliente.cad_pf_pj           =  $scope.cliente.cad_pf_pj ? $scope.cliente.cad_pf_pj : '2';
                    $scope.cliente.eh_contribuinte_aux =  true;
                    $scope.cliente.eh_contribuinte_iss_aux = false;

                    $timeout(function () {
                        Wizard.loadWizards.initialize(14);
                    }, 2000);

                } else if ($scope.cliente.tipoCliFor === 'transportadora') {

                    if (! $rootScope.getPermissao('43')) {
                        $location.path('/');
                    }

                    $scope.siglaTutorial               = 'TRA';
                    $scope.labelTutorial               = 'Cadastro de novas transportadoras';
                    $scope.cliente.labelTitular        = 'Transportadoras';
                    $scope.cliente.labelTitularSing    = 'Transportadora';
                    $scope.cliente.labelTitularMin     = 'transportadoras';
                    $scope.cliente.labelTitularPlural  = 'das transportadoras';
                    $scope.cliente.labelTitularSingMin = 'transportadora';
                    $scope.cliente.cad_tip_cli_for     =  3;
                    $scope.cliente.cad_pf_pj           =  $scope.cliente.cad_pf_pj ? $scope.cliente.cad_pf_pj : '2';
                    $scope.cliente.eh_contribuinte_aux =  true;
                    $scope.cliente.eh_contribuinte_iss_aux = false;

                    $timeout(function () {
                        Wizard.loadWizards.initialize(43);
                    }, 2000);

                } else {

                    $location.path('/');
                }
            };

            /**
             * Verifica qual cliente foi escolhido para efetuar o efeito do CSS na listagem de clientes.
             */
            $scope.isActive = function(cliente) {

                return $scope.clienteSelecionado === cliente.cad_cod_cad;
            };

            /**
             * Obtém os dados do cliente. Seta também as variáveis de contato e endereço.
             * OBS.: Tudo que atualizar nesta função deve atualizar na controller ModalJanelaCliente -> getCliente
             * @param cad_cod_cad
             */
            $scope.getCliente = function(cad_cod_cad) {

                var strFiltro = '';
                strFiltro = GeralFactory.formatarPesquisar({
                    'cad_status' : $scope.objFiltro.cad_status
                });

                if (_.isEmpty($scope.arrPaises))
                    $scope.arrPaises = EndGeralService.paises.get({});

                $scope.clienteSelecionado = cad_cod_cad;
                ClienteService.cliente.get({cad_cod_cad : cad_cod_cad, u : strFiltro}, function(data) {

                    $scope.arrAnexos = [];
                    $scope.cliente = data.records;
                    $scope.cliente.objMarcacoes = [];

                    $scope.setLabelTitular();

                    // Dados dos contatos do cliente:
                    $scope.listaContato    = data.records.listaContato;
                    $scope.cliente.contato = $scope.listaContato[0] = data.records.listaContato[0];

                    if ($scope.listaContato.length) {

                        for (var i = $scope.listaContato.length - 1; i >= 0; i--) {
                            if ($scope.listaContato[i].cto_cod_cto == 1)
                                $scope.listaContato.splice(i, 1);
                        }
                    }

                    $scope.cliente.cad_eh_inativo_aux   = ($scope.cliente.cad_eh_inativo === 1 || $scope.cliente.cad_eh_inativo === null) ? false : true;
                    $scope.cliente.cad_eh_cancelado_aux = ($scope.cliente.cad_dat_cancelamento !== null);

                    $scope.cliente.eh_contribuinte_aux     = ($scope.cliente.cad_tip_contribuinte == '9')     ? false : true;
                    $scope.cliente.eh_contribuinte_iss_aux = ($scope.cliente.cad_tip_contribuinte_iss == '1') ? true  : false;

                    // Data de nascimento do cliente:
                    $scope.cliente.cad_dat_nascimento  = GeralFactory.formatarDataBr($scope.cliente.cad_dat_nascimento);

                    // Dados de endereço do cliente:
                    if ($scope.cliente.endereco.end_endereco_cod_uf)
                        $scope.cliente.endereco.end_endereco_uf = $scope.cliente.endereco.end_endereco_cod_uf + '#' + $scope.cliente.endereco.end_endereco_uf;

                    if ($scope.cliente.endereco.end_endereco_cod_cidade)
                        $scope.cliente.endereco.end_endereco_cidade = $scope.cliente.endereco.end_endereco_cod_cidade + '#' + $scope.cliente.endereco.end_endereco_cidade;

                    // Recolhendo a imagem mais recente do cliente:
                    $scope.cliente.imagem_atual = null;
                    if ($scope.cliente.cliente_imagem.length) {

                        var qtdeImagens = $scope.cliente.cliente_imagem.length;
                        $scope.cliente.imagem_atual = $scope.cliente.cliente_imagem[qtdeImagens - 1];
                    }

                    if ($scope.cliente.endereco.end_endereco_uf && $scope.cliente.endereco.end_eh_exterior == 0) {

                        EndGeralService.getCidadePorUf($scope.cliente.endereco.end_endereco_uf, function(data) {
                            $scope.listaCidade_fat = data;
                        });
                    }

                    if ($scope.cliente.cad_tipo_cadastro) {
                        $scope.cliente.tipoCadastro = $scope.cliente.cad_tipo_cadastro.par_c01;
                    }

                    if ($scope.flgAbrirModalContato) {

                        $scope.salvarContato();
                        $scope.flgAbrirModalContato = false;
                    }

                    var strMarcacoes = 'q=(tma_cod_tab:' + cad_cod_cad + ',tma_tab:2)';
                    ClienteService.clienteMarcacoes.get({u : strMarcacoes}, function(retorno) {

                        angular.forEach($scope.arrMarcacoes, function(elem1, k1) {

                            angular.forEach(retorno.records,function(elem2, k2) {

                                if (elem1['mar_cod_marca'] == elem2['tma_cod_marca']) {

                                    $scope.cliente.objMarcacoes.push({
                                        name                : elem1.mar_descricao_marca,
                                        mar_descricao_marca : elem1.mar_descricao_marca,
                                        mar_cod_marca       : elem1.mar_cod_marca
                                    });
                                }
                            });
                        });
                    });

                    // Atribui à um objeto específico para facilitar a manipulação:
                    $scope.listaEndereco = data.records.listaEndereco;
                    $scope.listaAnotacao = data.records.listaAnotacao;

                    $scope.nomeBotaoCancelar = 'Excluir';
                    $scope.flagTutorial = false;
                });

                $scope.setAbaInicial(1);
            };

            /**
             * Retorna a STRING contendo HTML a ser renderizado de uma determinada anotação
             * na tabela de anotações.
             */
            $scope.getHTMLAnotacao = function(htmlAnotacao) {

                var strHtml = '', strEnd= '';
                if (htmlAnotacao) {

                    strHtml = htmlAnotacao.replace(/(<([^>]+)>)/ig, "");

                    strEnd  = (strHtml.match(/is/g) || []).length < 100 ? '' : '...';

                    strHtml = String(strHtml).substring(0, 100) + strEnd;

                    strHtml = $sce.trustAsHtml(strHtml);
                }

                return strHtml;
            };

            /**
             * Método responsável em mostar ou ocultar a descrição completa de uma
             * determinada anotação na tabela de anotações.
             */
            $scope.mostrarAnotacao = function(objAnotacao, code) {

                if (objAnotacao.ano_historico) {
                    var row =
                        $('<tr id="descAnotacao-' + code + '">').html(
                            $('<td colspan="4">').html(
                                $('<blockquote class="annotation">').html(objAnotacao.ano_historico)
                            )
                        );

                    var ele = $('#descAnotacao-' + code);
                    if (ele.is(':hidden') || ele.length) {

                        ele.detach();
                        $('tr#anotacao-' + code).find('.a-trigger').text('Mais');

                    } else {

                        $('.grid-anotacoes').find('tr#anotacao-' + code).after(row);
                        $('tr#anotacao-' + code).find('.a-trigger').text('Menos');
                    }
                }
            };

            /**
             * Limpa o formulário de cliente e prepara para cadastrar um novo cliente
             */
            $scope.novoCliente = function() {

                $scope.autoPreencher = true;

                if (_.isEmpty($scope.arrPaises))
                    $scope.arrPaises = EndGeralService.paises.get({});

                $scope.setAbaInicial(1);
                $scope.forms.form1.$setPristine();

                $scope.arrAnexos         =  [];
                $scope.cliente           =  {};
                $scope.flagTutorial      =  false;
                $scope.nomeBotaoCancelar = 'Cancelar';
                $scope.cliente.endereco  = {
                    end_cod_pais    : '1058',
                    end_eh_exterior : 0
                };

                $scope.setLabelTitular();
                $scope.getRandFoto();

                $scope.cliente.cad_eh_inativo_aux = true;
            };

            /**
             * Verificando se o endereço é do exterior.
             */
            $scope.verificaEhExterior = function() {

                $scope.cliente.endereco.end_eh_exterior = ($scope.cliente.endereco.end_cod_pais == '1058') ? 0 : 1;

                $scope.cliente.endereco.end_endereco_uf         = 'EX';
                $scope.cliente.endereco.end_endereco_cod_uf     = 0;
                $scope.cliente.endereco.end_endereco_cod_cidade = 0;
                $scope.cliente.endereco.end_endereco_cidade     = '';
            };

            /**
             * Exclui um contato de um cliente
             */
            $scope.cancelarCliente = function() {

                if ($scope.cliente.cad_cod_cad == null) {

                    $scope.novoCliente();

                } else {

                    if ($scope.cliente.has_movimentacao) {

                        GeralFactory.confirmar('Não é possível excluir este ' + $scope.cliente.labelTitularSingMin + ', pois já existe movimentação. Deseja inativá-lo ?', function() {

                            $scope.cliente.cad_eh_inativo_aux = false;
                            $scope.salvarCliente();
                        });

                    } else {

                        GeralFactory.confirmar('Deseja remover o ' + $scope.cliente.labelTitularSingMin + ' escolhido?', function() {

                            var objeto = {cad_cod_cad : $scope.cliente.cad_cod_cad};
                            ClienteService.cliente.cancelar(objeto, function(retorno) {
                                if (! retorno.error) {

                                    $scope.listarClientes();
                                    $scope.novoCliente();
                                }
                            });
                        });
                    }
                }
            };

            /**
             * Salva os dados do cliente/fornecedor. Tanto inserção quanto atualização
             */
            $scope.salvarCliente = function() {

                if ($scope.validaCidadeEstado()) {

                    $scope.salvarClienteLoading = true;
                    $scope.$watch('forms.form1', function(form) {
                        if (form) {
                            if (form.$invalid) {

                                $scope.submitted = true;
                                $scope.salvarClienteLoading = false;

                            } else {

                                var validar = $scope.validar();
                                if (validar['error']) {

                                    GeralFactory.notify('danger', 'Atenção:', validar['msg']);
                                    $scope.salvarClienteLoading = false;

                                } else {

                                    // Evitar cadastro redundante no ato do duplo clique no botão salvar:
                                    if ($scope.salvarClienteClique) {

                                        $scope.salvarClienteClique = false;
                                        $timeout(function() {

                                            $scope.cliente.cad_eh_inativo           = ($scope.cliente.cad_eh_inativo_aux) ? 0 : 1;
                                            $scope.cliente.eh_contribuinte          = ($scope.cliente.eh_contribuinte_aux) ? 1 : 0;
                                            $scope.cliente.cad_tip_contribuinte_iss = ($scope.cliente.eh_contribuinte_iss_aux) ? 1 : 0;

                                            if ($scope.cliente.cad_cod_cad) {

                                                angular.forEach($scope.cliente.objMarcacoes, function(item, i) {

                                                    $scope.cliente.objMarcacoes[i]['tma_tab']       = 2;
                                                    $scope.cliente.objMarcacoes[i]['tma_cod_tab']   = $scope.cliente.cad_cod_cad;
                                                    $scope.cliente.objMarcacoes[i]['tma_cod_marca'] = item.mar_cod_marca;
                                                });

                                                $scope.cliente.cad_status = $scope.objFiltro.cad_status;
                                                ClienteService.cliente.update($scope.cliente, function(resposta) {

                                                    if (! resposta.records.error) {

                                                        ClienteService.clienteMarcacoes.create($scope.cliente, function(resposta) {

                                                            if($scope.objFiltro.cad_status == 'E') {
                                                                $scope.objFiltro.cad_status = 'A'
                                                            }

                                                            $scope.listarClientes();
                                                            $scope.getCliente($scope.cliente.cad_cod_cad);
                                                        });
                                                    }

                                                    $scope.salvarClienteClique = true;
                                                    $scope.salvarClienteLoading = false;
                                                });
                                            } else {

                                                ClienteService.clientes.create($scope.cliente, function(resposta) {

                                                    if (! resposta.records.error) {

                                                        var codCliente = resposta.records.cad_cod_cad;
                                                        if ($scope.cliente.objMarcacoes) {

                                                            angular.forEach($scope.cliente.objMarcacoes, function(item, i) {

                                                                $scope.cliente.objMarcacoes[i]['tma_tab']       = 2;
                                                                $scope.cliente.objMarcacoes[i]['tma_cod_tab']   = codCliente;
                                                                $scope.cliente.objMarcacoes[i]['tma_cod_marca'] = item.mar_cod_marca;
                                                            });

                                                            $scope.cliente.cad_cod_cad = codCliente;
                                                            ClienteService.clienteMarcacoes.create($scope.cliente, function(retorno) {

                                                            });
                                                        }

                                                        $scope.listarClientes();
                                                        $scope.getCliente(codCliente);
                                                    }

                                                    $scope.salvarClienteClique = true;
                                                    $scope.salvarClienteLoading = false;
                                                });
                                            }
                                        }, 500);
                                    }
                                }
                            }
                        }
                    });
                }
            };

            /**
             * Método responsável por verificar se a UF e a cidade estão preenchidos de acordo;
             * @returns {boolean}
             */
            $scope.validaCidadeEstado = function () {

                // Cliente ainda não está cadastrado, sendo assim não tem o que validar:
                if (! $scope.cliente.cad_cod_cad || ! $scope.cliente.endereco.end_cep) {
                    return true;
                }

                var mensagem            = 'Selecione um Estado e uma Cidadae para finalizar o cadastro!',
                    end_endereco_uf     = '',
                    end_endereco_cidade = '';

                if ($scope.cliente.endereco != undefined) {

                    if ($scope.cliente.endereco.end_endereco_uf) {
                        end_endereco_uf = $scope.cliente.endereco.end_endereco_uf;
                    }

                    if ($scope.cliente.endereco.end_endereco_cidade) {
                        end_endereco_cidade = $scope.cliente.endereco.end_endereco_cidade;
                    }
                }

                if (! end_endereco_uf || ! end_endereco_cidade) {

                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                    $scope.setAbaInicial(2);
                    $scope.$broadcast('end_endereco_uf');
                    return false;
                }

                if (end_endereco_uf.length == 0 || end_endereco_cidade.length == 0) {

                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                    $scope.setAbaInicial(2);
                    $scope.$broadcast('end_endereco_uf');
                    return false;
                }

                if ($scope.cliente.endereco.end_eh_exterior) {
                    return true;
                }

                end_endereco_uf     = end_endereco_uf.split('#');
                end_endereco_cidade = end_endereco_cidade.split('#');

                if (end_endereco_uf.length != 2 || end_endereco_cidade.length != 2) {

                    GeralFactory.notify('warning', 'Atenção:', mensagem);
                    $scope.setAbaInicial(2);
                    $scope.$broadcast('end_endereco_uf');
                    return false;

                } else {

                    if (end_endereco_uf[0] == '0' || end_endereco_cidade[0] == '0') {

                        GeralFactory.notify('warning', 'Atenção:', mensagem);
                        $scope.setAbaInicial(2);
                        $scope.$broadcast('end_endereco_uf');
                        return false;
                    }
                }

                return true;
            };

            /**
             * Efetua validações dos dados antes de serem salvos pelo usuário.
             */
            $scope.validar = function() {

                if ($scope.cliente.cad_tip_cli_for === 3) {

                    var cpfCnpj = $scope.cliente.cad_cpf_cnpj;
                    if (cpfCnpj === null || cpfCnpj === undefined || cpfCnpj.trim() === '') {

                        var tipo = ($scope.cliente.cad_pf_pj === '1') ? 'CPF' : 'CNPJ';
                        return {
                            'error' :  true,
                            'msg'   : 'Caro usuário, é necessário informar o ' + tipo + ' para finalizar o cadastro!'
                        };
                    }
                }

                return {'error' : false};
            };

            /**
             * Atualiza o endereço padrão do cliente
             */
            $scope.salvarEnderecoPadrao = function() {

                $scope.salvarEnderecoLoading = true;
                var objeto = {
                    cad_cod_cad                : $scope.cliente.cad_cod_cad,
                    cad_end_cod_end_ent_padrao : $scope.cliente.cad_end_cod_end_ent_padrao
                };

                ClienteService.cliente.update(objeto, function(resposta) {

                    $scope.salvarEnderecoLoading = false;
                });
            };

            /**
             * Retorna o endereço completo ao digitar o CEP
             */
            $scope.getEnderecoPorCep = function(event) {

                if (! GeralFactory.inArray(event.which, Constantes.KEYS)) {

                    if ($scope.cliente.endereco.end_cep.length == 8) {

                        EndGeralService.getEnderecoPorCep($scope.cliente.endereco.end_cep, function(data) {
                            if (data.error) {

                                var mensagem = 'Caro usuário, nenhum endereço foi encontrado para o CEP fornecido!';
                                GeralFactory.notify('danger', 'Atenção:', mensagem);

                            } else {

                                $scope.cliente.endereco.end_endereco             = data.logradouro + ' ' + data.nomeslog;
                                $scope.cliente.endereco.end_endereco_bairro      = data.bairro.nome;
                                $scope.cliente.endereco.end_endereco_uf          = data.uf_cod + '#' + data.uf;
                                $scope.cliente.endereco.end_endereco_cidade      = data.cidade_id + '#' + data.cidade.nome;
                                $scope.cliente.endereco.end_endereco_nro         = '';
                                $scope.cliente.endereco.end_endereco_complemento = '';

                                EndGeralService.getCidadePorUf($scope.cliente.endereco.end_endereco_uf, function(data) {
                                    if (data) {

                                        $scope.listaCidade_fat = data;
                                    }
                                });
                            }
                        });
                    }
                }
            };

            /**
             * Retorna a lista de cidades de algum estado
             */
            $scope.getCidadePorUf = function() {

                EndGeralService.getCidadePorUf($scope.cliente.endereco.end_endereco_uf, function(data) {
                    if (data) {

                        $scope.listaCidade_fat = data;
                    }
                });
            };

            /**
             * Cancela um endereço de um cliente em uma janela modal
             */
            $scope.cancelarEndereco = function(end_cad_cod_cad,end_seq_end) {

                GeralFactory.confirmar('Tem certeza que deseja excluir?',function () {

                    ClienteService.clienteEndereco.cancelar({cad_cod_cad : $scope.cliente.cad_cod_cad, end_seq_end:end_seq_end}, function(data) {

                        ClienteService.clienteEnderecos.get({cad_cod_cad : $scope.cliente.cad_cod_cad}, function(data) {

                            $scope.listaEndereco = data.records;
                        });
                    });
                });
            };

            /**
             * Seta para aba principal ficar ativa
             */
            $scope.setAbaInicial = function(id) {

                switch (id) {
                    case 1:
                        $scope.tabs = [{active:true}, {active:false}, {active:false}, {active:false}, {active:false}];
                        break;
                    case 2:
                        $scope.tabs = [{active:false}, {active:true}, {active:false}, {active:false}, {active:false}];
                        break;
                    case 3:
                        $scope.tabs = [{active:false}, {active:false}, {active:true}, {active:false}, {active:false}];
                        break;
                    case 4:
                        $scope.tabs = [{active:false}, {active:false}, {active:false}, {active:true}, {active:false}];
                        break;
                    case 5:
                        $scope.tabs = [{active:false}, {active:false}, {active:false}, {active:false}, {active:true}];
                        break;
                }
            };

            /**
             * Abre a janela modal para inserção de anexos.
             */
            $scope.getFormAnexo = function() {

                if ($scope.cliente.cad_cod_cad) {

                    var scope = $rootScope.$new();

                    scope.params = {};
                    scope.params.cad_cod_cad = $scope.cliente.cad_cod_cad;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'cliente/views/aba-cliente-anexos-form.html',
                        controller  : 'ClienteModalAnexoCtrl',
                        windowClass : 'center-modal',
                        backdrop    : 'static',
                        scope       :  scope,
                        resolve     :  { }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'cancel') {
                            if (modalInstance.hasAlteracao && modalInstance.objMidia) {

                                console.log('Anexo: ', modalInstance.objMidia);
                                $scope.arrAnexos.push(modalInstance.objMidia);
                            }
                        }
                    });
                }
            };

            /**
             * Método responsável em preparar o gatilho para efetuar a listagem dos anexos
             * de um determinado cliente escolhido pelo usuário.
             */
            $scope.triggerListarAnexos = function() {

                angular.element('#tab-cliente-anexo a').click(function() {

                    if ($scope.cliente.cad_cod_cad && _.isEmpty($scope.arrAnexos)) {

                        $rootScope.spinnerForm.on();

                        var strFiltro = GeralFactory.formatarPesquisar({
                            'mid_status'  : 1,
                            'mid_tab'     : 12,
                            'mid_tab_cod' : $scope.cliente.cad_cod_cad
                        });

                        MidiaService.midias.get({u : strFiltro}, function(retorno) {
                            if (retorno.records.length > 0) {

                                $timeout(function() {
                                    $scope.arrAnexos = retorno.records;
                                    $rootScope.spinnerForm.off();
                                }, 1000);
                            } else {

                                $rootScope.spinnerForm.off();
                            }
                        });
                    }
                });
            };

            /**
             * Método responsável em remover um determinado anexo.
             */
            $scope.removerAnexo = function(midNro) {
                if (midNro) {

                    GeralFactory.confirmar('Deseja remover o anexo?', function() {

                        var objeto = {mid_nro : midNro};
                        MidiaService.midia.remover(objeto, function(resposta) {
                            if (! resposta.records.error) {

                                GeralFactory.notificar({data : resposta});

                                var keepGoing = true;
                                angular.forEach($scope.arrAnexos, function(item, chave) {
                                    if (keepGoing && item.mid_nro === midNro) {

                                        keepGoing = false;
                                        $scope.arrAnexos.splice(chave, 1);
                                    }
                                });
                            }
                        });
                    });
                }
            };

            /**
             * Método responsável em efetuar o download de um determinado anexo.
             */
            $scope.downloadAnexo = function(objAnexo) {

                console.log('Anexo: ', objAnexo);
                if (objAnexo) {

                    var url = $rootScope.documentCache + objAnexo.mid_id;
                    $window.open(url);

                    console.log('URL: ', url);
                }
            };

            /**
             * Retorna o endereço do cliente passando o codigo sequencial
             */
            $scope.getFormEndereco = function(end_seq_end) {

                var scope = $rootScope.$new();

                scope.params = {};
                scope.listaTipoEndereco  = $scope.listaTipoEndereco;
                scope.params.cad_cod_cad = $scope.cliente.cad_cod_cad;

                if (end_seq_end) {

                    scope.params.end_seq_end = end_seq_end;
                }

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'cliente/views/aba-cliente-endereco-form.html',
                    controller  : 'ClienteModalEnderecoCtrl',
                    size        : 'lg',
                    windowClass : 'center-modal',
                    scope       :  scope,
                    resolve     :  {
                        getEnd: function() { }
                    }
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'reload'){

                        ClienteService.clienteEnderecos.get({cad_cod_cad : $scope.cliente.cad_cod_cad}, function(data) {
                            $scope.listaEndereco = data.records;
                        });
                    }
                });
            };

            /**
             * Retorna um contato do cliente passando o codigo como parametro
             */
            $scope.getFormContato = function(cto_cod_cto) {

                // Caso o cliente não tenha sido salvo o mesmo salva quando clicar no botão novo contato.
                if ($scope.cliente.cad_cod_cad == undefined) {

                    $scope.verificarSalvarCliente(function() {

                        $scope.salvarContato();
                    });
                } else {

                    $scope.salvarContato(cto_cod_cto);
                }
            };

            /**
             * Retorna a anotacao do cliente passando o codigo sequencial
             */
            $scope.getFormAnotacao = function(ano_seq_ano) {

                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.cad_cod_cad = $scope.cliente.cad_cod_cad;

                if (ano_seq_ano) {

                    scope.params.ano_seq_ano = ano_seq_ano;
                }

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'cliente/views/aba-cliente-anotacoes-form.html',
                    controller  : 'ClienteModalAnotacaoCtrl',
                    size        : 'lg',
                    windowClass : 'center-modal',
                    scope       :  scope,
                    resolve     :  {
                        getEnd: function() { }
                    }
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'reload'){
                        ClienteService.clienteAnotacoes.get({cad_cod_cad : $scope.cliente.cad_cod_cad}, function(data) {

                            $scope.listaAnotacao = data.records;
                        });
                    }
                });
            };

            /**
             * Exclui uma anotação de um cliente
             */
            $scope.cancelarAnotacao = function(ano_seq_ano) {

                GeralFactory.confirmar('Tem certeza que deseja excluir?',function () {

                    ClienteService.clienteAnotacao.cancelar({cad_cod_cad : $scope.cliente.cad_cod_cad, ano_seq_ano:ano_seq_ano}, function(data) {

                        ClienteService.clienteAnotacoes.get({cad_cod_cad : $scope.cliente.cad_cod_cad}, function(data) {

                            $scope.listaAnotacao = data.records;
                        });
                    });
                });
            };

            /**
             * Abre a janela de formulario de contato
             * @param cto_cod_cto
             */
            $scope.salvarContato = function(cto_cod_cto) {

                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.cad_cod_cad = $scope.cliente.cad_cod_cad;

                if (cto_cod_cto) {

                    scope.params.cto_cod_cto = cto_cod_cto;
                }

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'cliente/views/aba-cliente-contato-form.html',
                    controller  : 'ClienteModalContatoCtrl',
                    size        : 'lg',
                    windowClass : 'center-modal',
                    scope       :  scope,
                    resolve     :  {
                        getCto : function() { }
                    }
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'reload'){
                        ClienteService.clienteContatos.get({cad_cod_cad : $scope.cliente.cad_cod_cad}, function(data) {

                            $scope.listaContato = data.records;
                        });
                    }
                });
            };

            /**
             * Exclui um contato de um cliente
             */
            $scope.cancelarContato = function(cto_cod_cto) {

                GeralFactory.confirmar('Tem certeza que deseja excluir?',function () {

                    ClienteService.clienteContato.cancelar({cad_cod_cad : $scope.cliente.cad_cod_cad, cto_cod_cto:cto_cod_cto}, function(data) {

                        ClienteService.clienteContatos.get({cad_cod_cad : $scope.cliente.cad_cod_cad}, function(data) {

                            $scope.listaContato = data.records;
                        });
                    });
                });
            };

            /**
             *
             */
            $scope.getJanelaCliente = function(end_seq_end) {

                var scope = $rootScope.$new();

                scope.params = {};
                scope.listaTipoEndereco  = $scope.listaTipoEndereco;
                scope.params.cad_cod_cad = $scope.cliente.cad_cod_cad;

                if (end_seq_end) {

                    scope.params.end_seq_end = end_seq_end;
                }

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'cliente/views/janela-cliente.html',
                    controller  : 'ClienteModalCtrl',
                    size        : 'lg',
                    windowClass : 'center-modal',
                    scope       :  scope,
                    resolve     :  {
                        getEnd  : function() {

                        }
                    }
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'reload') {
                        ClienteService.clienteEnderecos.get({cad_cod_cad : $scope.cliente.cad_cod_cad}, function(data) {

                            $scope.listaEndereco = data.records;
                        });
                    }
                });
            };

            /**
             * Método responsável em abrir a janela modal contedo o formulário de upload
             * para foto dos clientes e fornecedores.
             * @param cad_cod_cad
             */
            $scope.getFormUpload = function(cad_cod_cad) {

                if (cad_cod_cad) {

                    var scope = $rootScope.$new();

                    scope.params = {};

                    scope.params.entity       = $scope.cliente.labelTitularSing;
                    scope.params.imagem_atual = $scope.cliente.imagem_atual;
                    scope.params.cad_cod_cad  = cad_cod_cad;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'cliente/views/aba-cliente-upload.html',
                        controller  : 'ClienteModalUploadCtrl',
                        windowClass : 'center-modal',
                        backdrop    : 'static',
                        scope       :  scope,
                        resolve     :  {
                            getEnd: function() { }
                        }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'cancel') {
                            if (modalInstance.hasAlteracao) {

                                $scope.listarClientes();
                                $scope.getCliente(cad_cod_cad);
                            }
                        }
                    });
                } else {

                    GeralFactory.notify('warning', 'Atenção!', 'Salve antes de prosseguir.');
                }
            };

            /**
             * Método responsável em efetuar a abertura da janela modal contendo a listagem
             * dos e-mails dos cliente para futura cópia dos mesmos por parte do usuário.
             */
            $scope.getJanelaEmails = function() {

                var scope = $rootScope.$new();
                var objClientes = ($scope.objFiltro.texto_pesquisa) ? $filter('filter')($scope.arrClientes, {cad_nome_razao : $scope.objFiltro.texto_pesquisa}) : $scope.arrClientes;

                scope.params = {};
                scope.params.objClientes = objClientes;

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'cliente/views/janela-emails.html',
                    controller  : 'ClienteModalEmailsCtrl',
                    windowClass : 'center-modal',
                    backdrop    : 'static',
                    scope       :  scope,
                    resolve     :  { }
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'cancel') { }
                });
            };

            /**
             * Método responsável em imprimir a ficha contendo todos os dados do cliente.
             */
            $scope.imprimirFicha = function() {

                if ($scope.cliente.cad_cod_cad) {

                    var strFiltro = GeralFactory.formatarPesquisar({
                        'type' : $scope.cliente.tipoCliFor,
                        'ken'  : AuthTokenFactory.getToken()
                    });

                    var url = GeralFactory.getUrlApi() + '/erp/export/cliente/ficha/' + $scope.cliente.cad_cod_cad + '/?' + strFiltro;
                    $window.open(url, 'Ficha do Cliente');

                } else {

                    var mensagem = 'Para efetuar a impressão é necessário escolher um cliente na listagem!';
                    GeralFactory.notify('warning', 'Atenção!', mensagem);
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
             * Método responsável em adicionar uma nova marca através do plugin de ui-select.
             */
            $scope.onSelectedMarcacao = function(item) {

                if (item.hasOwnProperty('isTag')) {

                    var objeto = {mar_descricao_marca : item.mar_descricao_marca, mar_tab : 2, mar_eh_vitrine : 0};
                    ProdutoService.marcas.create(objeto, function(resposta) {
                        if (! resposta.records.error) {
                            GeralFactory.notify('success', 'Sucesso!', 'Marcação cadastra com sucesso!');

                            item.mar_cod_marca = resposta.records.mar_cod_marca;
                            delete item['isTag'];

                            $scope.arrMarcacoes.push({
                                name                : item.mar_descricao_marca,
                                mar_descricao_marca : item.mar_descricao_marca,
                                mar_cod_marca       : resposta.records.mar_cod_marca,
                                mar_tab             : 2
                            });
                        }
                    });
                }
            };

            /**
             * Mostra um alerta para que o cliente salve ou não os dados antes de sair da tela
             */
            $scope.alertaSalvar = function() {

                $rootScope.spinnerList.on();
                GeralFactory.confirmar('Deseja salvar antes de sair?',function () {

                    if ($scope.cliente.cad_cod_cad) {

                        ClienteService.cliente.update($scope.cliente, function(resposta) {

                            $scope.flagTutorial = true;
                            $scope.listarClientes();
                        });
                    } else {

                        ClienteService.clientes.create($scope.cliente, function(resposta) {

                            $scope.flagTutorial = true;
                            $scope.listarClientes();
                        });
                    }

                }, 'Título', function() {

                    $scope.flagTutorial = true;
                    $rootScope.spinnerList.off();
                });
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

                // Verificando para saber se vai salvar ou apenas voltar para aba anterior:
                if (abaSelecionada === 0) {

                    $scope.alertaSalvar();

                } else {

                    $scope.setAbaInicial(abaSelecionada)
                }
            };

            /**
             * Inicializa um determinado tipo de cadastro ou a listagem completa.
             */
            $scope.getTipoCadastro = function(par_pai) {

                if (par_pai) {

                    ParamsService.tipoCadastro.get({par_pai : par_pai}, function(data) {
                        $scope.objTipoCadastro           = data.records;
                        $scope.cliente.cad_2040_tipo_cad = par_pai;
                    });
                } else {

                    ParamsService.tiposCadastro.get({u : ''}, function(resposta) {
                        $scope.arrTiposCadastro = resposta.records;
                    });
                }
            };

            /**
             * Método responsável pela seleção dos dados de um determinado tipo de cadastro
             * pelo componente de autocomplete contido na tela.
             */
            $scope.onSelectTipoCadastro = function($item) {

                $scope.getTipoCadastro($item.par_pai);
                $scope.cliente.tipoCadastro = $item.par_c01;
            };

            /**
             * Método responsável em adicionar um determinado tipo de cadastro diretamente pelo
             * componente de autocomplete contido na tela.
             */
            $scope.addTipoCadastro = function($item) {

                var objTipoCadastro = {
                    par_c01 : $item.trim()
                };

                ParamsService.tiposCadastro.create(objTipoCadastro, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.cliente.tipoCadastro      = $item.trim();
                        $scope.cliente.cad_2040_tipo_cad = retorno.records.par_pai;
                        $scope.getTipoCadastro();
                    }
                });
            };

            /**
             * Método responsável em reutilizar os dados de um cliente já removido no sistema.
             */
            $scope.reutilizarCliente = function() {

                if ($scope.validaCidadeEstado()) {

                    $scope.salvarClienteLoading = true;
                    $scope.$watch('forms.form1', function(formulario) {
                        if (formulario.$invalid) {

                            $scope.submitted = true;
                            $scope.salvarClienteLoading = false;

                        } else {

                            var validar = $scope.validar();
                            if (validar['error']) {

                                GeralFactory.notify('danger', 'Atenção:', validar['msg']);
                                $scope.salvarClienteLoading = false;

                            } else {

                                delete $scope.cliente.cad_cod_cad;
                                delete $scope.cliente.cad_dat_cancelamento;

                                ClienteService.clientes.create($scope.cliente, function(resposta) {

                                    if (! resposta.records.error) {

                                        var codCliente = resposta.records.cad_cod_cad;
                                        if ($scope.cliente.objMarcacoes) {

                                            angular.forEach($scope.cliente.objMarcacoes, function(item, i) {

                                                $scope.cliente.objMarcacoes[i]['tma_tab']       = 2;
                                                $scope.cliente.objMarcacoes[i]['tma_cod_tab']   = codCliente;
                                                $scope.cliente.objMarcacoes[i]['tma_cod_marca'] = item.mar_cod_marca;
                                            });

                                            $scope.cliente.cad_cod_cad = codCliente;
                                            ClienteService.clienteMarcacoes.create($scope.cliente, function(retorno){});
                                        }

                                        $scope.listarClientes();
                                        $scope.getCliente(codCliente);
                                    }

                                    $scope.salvarClienteClique = true;
                                    $scope.salvarClienteLoading = false;
                                });
                            }
                        }
                    });
                }
            };

            /**
             * Método responsável em gerar o relatório de clientes no formatos PDF e
             * Excel conforme o filtro utilizado pelo usuário.
             */
            $scope.gerarRelatorio = function(tipo) {

                if ($scope.arrClientes.length) {

                    var objFiltro = $scope.getObjFiltro();

                    objFiltro['ken']  = AuthTokenFactory.getToken();
                    objFiltro['type'] = tipo;

                    var url = GeralFactory.getUrlApi() + '/erp/export/cliente/?' + GeralFactory.formatarPesquisar(objFiltro);
                    $window.open(url, 'Relatório de Clientes');

                } else {

                    var msg = 'Caro usuário, nenhum registro foi encontrado para geração do relatório!';
                    GeralFactory.notify('warning', 'Atenção!', msg);
                }
            };



            /**
             * Busca os dados do CNPJ no servidor receitaWS
             */
            $scope.getDadosCadastraisReceitaWS = function () {

                $scope.autoPreencher = true;
                $scope.salvarClienteLoading = true;

                //seta pj para transportadora
                if($scope.cliente.cad_tip_cli_for == 3){

                    $scope.cliente.cad_pf_pj = 2;
                }

                if($scope.cliente.cad_cpf_cnpj && $scope.cliente.cad_pf_pj == 2){

                    var objFiltro = {};
                    var strFiltro = '';

                    objFiltro = {
                        cad_cpf_cnpj    : $scope.cliente.cad_cpf_cnpj,
                        cad_tip_cli_for : $scope.cliente.cad_tip_cli_for
                    };

                    strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                    //manda a consulta
                    ClienteService.autoComplete.receitaWS({u : strFiltro}, function (resposta) {

                        if(!resposta.records.error){

                            //caso não dê erro, seta o scopo com os dados do cliente
                            $scope.cliente = resposta.records;
                            $scope.cliente.eh_contribuinte_aux = true;
                            $scope.cliente.cad_eh_inativo_aux  = true;

                            console.log('$scope.cliente', $scope.cliente);

                            if ($scope.cliente.endereco.end_endereco_uf != 'null#null') {
                                EndGeralService.getCidadePorUf($scope.cliente.endereco.end_endereco_uf, function(data) {

                                    $scope.listaCidade_fat = data;
                                });
                            }

                            //gera uma notificação caso a situação cadastral retornada seja diferente de ATIVA
                            if(resposta.records.situacao){

                                GeralFactory.notify('danger', resposta.records.situacao.title, resposta.records.situacao.msg);
                            }

                            $scope.autoPreencher = false;
                            $scope.salvarClienteLoading = false;

                        } else {

                            //notifica caso a consulta retorne erro
                            GeralFactory.notify('danger', resposta.records.title, resposta.records.msg);
                            $scope.salvarClienteLoading = false;
                        }
                    });

                }else{

                    //notifica caso não tenha preenchido o cnpj
                    GeralFactory.notify('warning', 'Atenção!', 'Primeiramente é necessário informar o CNPJ');
                    $scope.salvarClienteLoading = false;
                }
            };


            $scope.getFormVeiculo = function (id) {

                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.cad_cod_cad = $scope.cliente.cad_cod_cad;

                if(id) {

                    scope.params.vei_cod_vei = id;
                }

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'cliente/views/janela-transportadora-veiculo.html',
                    controller  : 'TransporteModalVeiculoCtrl',
                    size        : 'md',
                    windowClass : 'center-modal no-top-modal',
                    scope       :  scope,
                    resolve     :  {
                        getEnd: function() {

                        }
                    }
                });

                modalInstance.result.then(function(id) { }, function(msg) {

                    if(msg == 'reload') {

                        $scope.getCliente($scope.cliente.cad_cod_cad);
                        $scope.setAbaInicial(4);
                    }

                    console.log('vorto');

                });
            };

        }
    ]);
