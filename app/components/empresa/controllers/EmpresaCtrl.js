'use strict';

angular.module('newApp')

    .controller('EmpresaCtrl', [

        '$scope', '$rootScope', '$uibModal', '$location', '$timeout', '$window', '$routeParams', '$interval', 'EmpresaService', 'MidiaService', 'GeralFactory', 'Storage', '$sce', 'ProdutoService', 'AuthTokenFactory', '$controller', 'FinanceiroService', 'Wizard',

        function ($scope, $rootScope, $uibModal, $location, $timeout, $window, $routeParams, $interval, EmpresaService, MidiaService, GeralFactory, Storage, $sce, ProdutoService, AuthTokenFactory, $controller, FinanceiroService, Wizard) {
            $rootScope.hasAutorizacao();

            $scope.cda_camps = "Codigo;Codigo Externo;Data de Cadastro;Inativo;Cliente ou Fornecedor;Pessoa Fisica ou Pessoa Juritica;Nome da razão social;Apelido fantasia;Cpf/Cnpj;Registro Geral/Inscrição estadual;Inscrição Municipal;Sexo;Contribuinte icms;Contribuinte iss;Data de Nascimento;Tipo do Cadastro;Email;CEP;Logradouro;Numero;Complemento;Bairro;Cidade;Nome do contato;Fone;Fone 2;Celular;Site;Anotações";
            $scope.prd_camps = "Codigo do produto;Data de cadastro;Descrição;Inativo;Nomenclatura Comum do MERCOSUL;Código Especificador da Substituição Tributária;Código de Situação Tributária;Código de Situação da Operação do Simples Nacional;Codigo de Barra;Código de Origem;Unidade;Peso Liquido;Peso Bruto;Tipo Producao;É Serviço;Tipo Específico;Preço 1;Preço 2;Preço 3;Preço 4;Preço 5;Código da Categoria";

            $scope.$on('$viewContentLoaded', function () {

                $scope.loadLogNames('Cliente');
                
                // Variável que controla as abas para tela:
                $scope.tab = $routeParams.aba ? parseInt($routeParams.aba) : 1;

                $scope.getEmpresa();
                $scope.empresa           = {};
                $scope.forms             = {};
                $scope.forms.formNfe     = {};
                $scope.forms.formEmpresa = {};
                $scope.arrBancoContas    = [];

                $scope.listaUf_fat   = EmpresaService.ufs.get({});
                $scope.listaAmbiente = [{
                    'id'   :  1,
                    'nome' : 'Produção'
                }, {
                    'id'   :  2,
                    'nome' : 'Teste'
                }];

                $scope.listaTipNota = [{
                    'id'   :  0,
                    'nome' : 'Nenhum'
                }, {
                    'id'   :  1,
                    'nome' : 'A1'
                }, {
                    'id'   :  2,
                    'nome' : 'A3'
                }];

                $scope.listaRegimeTributario = [{
                    'id'   :  1,
                    'nome' : 'Microempreendedor Individual (MEI)'
                }, {
                    'id'   :  2,
                    'nome' : 'Simples Nacional - Empresa de Pequeno Porte (EPP)'
                }, {
                    'id'   :  3,
                    'nome' : 'Simples Nacional - Microempresa (ME)'
                }, {
                    'id'   :  4,
                    'nome' : 'Lucro Real'
                }, {
                    'id'   :  5,
                    'nome' : 'Lucro Presumido'
                }];

                $scope.listaFormaEmissao = [{
                    'id'   :  1,
                    'nome' : 'Emissão Normal'
                }, {
                    'id'   :  4,
                    'nome' : 'Contingência DPEC'
                }, {
                    'id'   :  6,
                    'nome' : 'Contingência SVC-AN'
                }, {
                    'id'   :  7,
                    'nome' : 'Contingência SVC-RS'
                }];

                EmpresaService.csosn2.get({},function(retorno) {
                    $scope.arrCsosn2 = GeralFactory.formataObjSelect(retorno.records);
                });

                $scope.dragCtrl = $scope.$new();
                $controller('DropzoneCtrl', {
                    $scope : $scope,
                    $rootScope: $rootScope,
                    AuthTokenFactory: AuthTokenFactory,
                    MidiaService: MidiaService,
                    $window: $window,
                    $timeout: $timeout,
                    GeralFactory: GeralFactory
                });
                $scope.dragCtrl.setDropzone('cliente');

                $scope.getContasBancarias();
                $scope.resetMigracaoDados();
            });

            $scope.loadLogNames = function(tipoMig){
                var strFiltro = GeralFactory.formatarPesquisar({miglog: tipoMig, ken: AuthTokenFactory.getToken()});
                MidiaService.logFilesNames.get({u: strFiltro}, function(retorno){
                    console.log("Log Files: ", retorno);

                    $scope.logFiles = [];
                    angular.forEach(retorno.records, function(data){

                        var fileName = data.substring(data.lastIndexOf('/')+1, data.lastIndexOf('.'));

                        var datas = fileName.split('_');
                        //35908_CAD_20180104162011_0_427_8.xls
                        var ano = datas[2].substring(0,4);
                        var mes = datas[2].substring(4,6);
                        var dia = datas[2].substring(6,8);
                        var hrs = datas[2].substring(8,10);
                        var min = datas[2].substring(10,12);

                        $scope.logFiles.push({
                            fileName: data,
                            data: dia+'/'+mes+'/'+ano+' as '+hrs+':'+min,
                            cads: parseInt(datas[3]),
                            atzs: parseInt(datas[4]),
                            errs: parseInt(datas[5])
                        });
                    });
                    $scope.logScreen = $scope.logFiles.length != 0;
                });
            };

            $scope.novaMigracao = function() {
                $scope.logScreen = false;
            };

            /**
             * Retorna os dados da empresa.
             */
            $scope.getEmpresa = function() {

                EmpresaService.empresa.get({emp_cod_emp : '1'}, function(data) {

                    $scope.empresa = data.records;

                    $scope.empresa.nro_prox_nota      = $scope.empresa.nro_atual_nota + 1;
                    $scope.empresa.nro_prox_cte       = $scope.empresa.nro_atual_cte + 1;
                    $scope.empresa.nro_prox_rps       = $scope.empresa.nro_atual_rps + 1;
                    $scope.empresa.nro_prox_nfse      = $scope.empresa.nro_atual_nfse + 1;
                    $scope.empresa.nro_prox_lote_nfse = $scope.empresa.nro_atual_lote_nfse + 1;

                    $scope.empresa.emp_uf = data.records.emp_cod_uf + '#' + data.records.emp_uf;
                    $scope.empresa.emp_nfe_cert_arq_txt = data.records.emp_nfe_cert_arq;

                    // Informações sobre as opções de pagamento da empresa:
                    $scope.empresa.emp_ativo_gn       = data.records.emp_ativo_gn       == 1;
                    $scope.empresa.emp_ativo_cielo    = data.records.emp_ativo_cielo    == 1;
                    $scope.empresa.emp_ativo_pagseg   = data.records.emp_ativo_pagseg   == 1;
                    $scope.empresa.emp_ativo_auto_cob = data.records.emp_ativo_auto_cob == 1;
                    $scope.empresa.emp_ativo_gn_auto  = data.records.emp_gn_qtd_dias    == 0 ? false : true;

                    EmpresaService.getCidadePorUf($scope.empresa.emp_uf, function(data) {
                        if (data) {
                            $scope.listaCidade_fat = data;
                        }
                    });

                    $scope.trocarPessoa($scope.empresa.emp_pf_pj);
                    $scope.empresa.emp_cidade = data.records.emp_cod_cidade + '#' + data.records.emp_cidade;

                    // 101 sim - 102 não
                    $scope.empresa.permite_aprov = ($scope.empresa.emp_cod_csosn == 101);

                    // Valores de juros e multa do boleto bancário:
                    $scope.empresa.emp_gn_vlr_juros = data.records.emp_gn_vlr_juros ? data.records.emp_gn_vlr_juros : 0;
                    $scope.empresa.emp_gn_vlr_multa = data.records.emp_gn_vlr_multa ? data.records.emp_gn_vlr_multa : 0;

                    // Verifica se esta ativo a multa e juros do boleto:
                    $scope.empresa.emp_gn_juros = data.records.emp_gn_juros == 1;
                    $scope.empresa.emp_gn_multa = data.records.emp_gn_multa == 1;

                    if ($scope.empresa.emp_gn_juros && $scope.empresa.emp_gn_obs1.match(/juros/i)) {

                        $scope.empresa.emp_str_juros = '#emp_gn_obs1';
                        angular.element($scope.empresa.emp_str_juros).prop('disabled', true);
                    }

                    if ($scope.empresa.emp_gn_juros && $scope.empresa.emp_gn_obs2.match(/juros/i)) {

                        $scope.empresa.emp_str_juros = '#emp_gn_obs2';
                        angular.element($scope.empresa.emp_str_juros).prop('disabled', true);
                    }

                    if ($scope.empresa.emp_gn_multa && $scope.empresa.emp_gn_obs1.match(/multa/i)) {

                        $scope.empresa.emp_str_multa = '#emp_gn_obs1';
                        angular.element($scope.empresa.emp_str_multa).prop('disabled', true);
                    }

                    if ($scope.empresa.emp_gn_multa && $scope.empresa.emp_gn_obs2.match(/multa/i)) {

                        $scope.empresa.emp_str_multa = '#emp_gn_obs2';
                        angular.element($scope.empresa.emp_str_multa).prop('disabled', true);
                    }

                    $scope.empresa.emp_rg_iest = $scope.empresa.emp_rg_iest ? $scope.empresa.emp_rg_iest.trim() : '';
                });
            };

            /**
             * Método responsável em adicionar uma nova conta financeira.
             */
            $scope.adicionarContaBancaria = function(objBancoConta) {

                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.cobAutomatica = true;
                scope.params.objBancoConta = objBancoConta ? objBancoConta : null;

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'financeiro/views/janela-banco.html',
                    controller  : 'ConciliacaoModalBancoCtrl',
                    windowClass : 'center-modal',
                    backdrop    : 'static',
                    size        : 'lg',
                    scope       :  scope,
                    resolve     :  { }
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'reload' && modalInstance.hasAlteracoes) {

                        var objContaBanco = modalInstance.objRetorno, qtdeContas = $scope.arrBancoContas.length;
                        switch (modalInstance.strAcao)
                        {
                            case 'create':
                                $scope.arrBancoContas.push(objContaBanco);
                                $scope.salvarCobrancaAutomatica(objContaBanco);
                                break;
                        }

                        scope.$destroy();
                    }
                });
            };

            /**
             * Método responsável em listar as contas bancárias com cobrança automática
             * configurada pelo usuário da aplicação.
             */
            $scope.getContasBancarias = function() {

                $timeout(function() {
                    FinanceiroService.banco.list({u : 'q=(bco_auto_cob:1)'}, function(retorno) {
                        if (retorno.records.response.length) {

                            var arrBancos = retorno.records.response;
                            $scope.arrBancoContas = arrBancos;
                        }
                    });
                }, 1000);
            };

            /**
             * Método responsável em salvar os dados de uma nova cobrança automática a partir de
             * uma determinada conta bancária previamente cadastrada.
             */
            $scope.salvarCobrancaAutomatica = function(objContaBanco) {

                console.log('Conta bancária: ', objContaBanco);
                var objeto = {
                    'bco_cod_bco' : objContaBanco.bco_cod_bco,
                    'bco_cod_emp' : objContaBanco.bco_cod_emp
                };

                FinanceiroService.cobranca.criarConta(objeto, function(retorno) {
                    if (retorno.records.error) {

                        var mensagem = retorno.records.msg;
                        GeralFactory.notify('danger', 'Atenção:', mensagem);

                    } else {

                        var objConta = retorno.records.response;
                        $scope.iterarContas(objConta);
                    }
                });
            };

            /**
             * Método responsável em verificar se uma determinada conta bancária esta apta para
             * efetuar as cobranças automáticas no sistema.
             */
            $scope.verificarContaBancaria = function(objConta) {

                if (objConta.bco_iugu_status_conta) {

                    switch (objConta.bco_iugu_status_conta)
                    {
                        case 1:
                            var objeto = {bco_cod_bco : objConta.bco_cod_bco};
                            FinanceiroService.cobranca.consultarConta(objeto, function(retorno) {
                                if (retorno.records.error) {

                                    var mensagem = retorno.records.msg;
                                    GeralFactory.notify('danger', 'Atenção:', mensagem);

                                } else {

                                    var objConta = retorno.records.response;
                                    $scope.iterarContas(objConta);
                                }
                            });
                            break;

                        case 2:
                            var mensagem = 'Caro usuário, a conta bancária escolhida já foi verificada e se encontra ativa!';
                            GeralFactory.notify('warning', 'Atenção:', mensagem);
                            break;
                    }
                } else {

                    GeralFactory.confirmar('Deseja verificar a conta bancária escolhida?', function() {

                        var objeto = {
                            'bco_cod_bco' : objConta.bco_cod_bco,
                            'bco_cod_emp' : objConta.bco_cod_emp
                        };
                        FinanceiroService.cobranca.verificarConta(objeto, function(retorno) {
                            if (retorno.records.error) {

                                var mensagem = retorno.records.msg;
                                GeralFactory.notify('danger', 'Atenção:', mensagem);

                            } else {

                                var objConta = retorno.records.response;
                                $scope.iterarContas(objConta);
                            }
                        });
                    });
                }
            };

            /**
             * Método responsável em atualizar os dados de uma determinada conta bancária existente
             * na grid apartir de algum gatilho: inserção, alteração ou verificação.
             */
            $scope.iterarContas = function(objConta) {

                var keepGoing = true;
                angular.forEach($scope.arrBancoContas, function(item, chave) {
                    if (keepGoing) {
                        if (item.bco_cod_bco === objConta.bco_cod_bco) {
                            $scope.arrBancoContas[chave] = objConta;
                            keepGoing = false;
                        }
                    }
                });
            };

            /**
             * Verifica a quantidade de dias para vencimento do boleto caso o
             * usuário tenha escolhido esta opção.
             */
            $scope.setQtdeDias = function() {

                if (! $scope.empresa.emp_ativo_gn_auto) {

                    GeralFactory.confirmar('Deseja cancelar a geração de boletos automáticos?', function() {

                        $scope.empresa.emp_gn_qtd_dias = 0;

                    }, 'Confirmação', function() {

                        $timeout(function() {
                            $scope.empresa.emp_ativo_gn_auto = true;
                        }, 500);

                    }, 'Não', 'Sim');
                }
            };

            /**
             * Retorna a lista de cidades de algum estado.
             */
            $scope.getCidadePorUf = function() {
                EmpresaService.getCidadePorUf($scope.empresa.emp_uf, function(data) {
                    if (data) {
                        $scope.listaCidade_fat = data;
                    }
                });
            };

            /**
             * Retorna o endereço completo ao digitar o CEP.
             */
            $scope.getEnderecoPorCep = function() {

                if ($scope.empresa.emp_cep.length == 8) {

                    EmpresaService.getEnderecoPorCep($scope.empresa.emp_cep, function(data) {
                        if (! data.error) {

                            $scope.empresa.emp_endereco    = data.nomeclog;
                            $scope.empresa.emp_bairro      = data.bairro.nome;
                            $scope.empresa.emp_uf          = data.uf_cod + '#' + data.uf;
                            $scope.empresa.emp_cidade      = data.cidade_id + '#' + data.cidade.nome;
                            $scope.empresa.emp_nro         = '';
                            $scope.empresa.emp_complemento = '';

                            EmpresaService.getCidadePorUf($scope.empresa.emp_uf, function(data) {
                                if (data) {
                                    $scope.listaCidade_fat = data;
                                }
                            });
                        }
                    });
                }
            };

            /**
             * Método responsável em salvar os dados da empresa.
             */
            $scope.salvarEmpresa = function(strForm) {

                var aba = $scope.tab;
                if (aba === 1) {

                    var scope = $rootScope.$new();
                    scope.objEmpresa = $scope.empresa;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'home/views/janela-termo-adesao.html',
                        controller  : 'TermoAdesaoModalCtrl',
                        size        : 'lg',
                        windowClass : 'center-modal modal-termo-adesao',
                        backdrop    : 'static',
                        scope       :  scope,
                        resolve     :  { }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'reload') {

                            scope.$destroy();
                            if (modalInstance.hasAlteracao) {

                                $scope.hasTermo = true;
                                $scope.finalizar(strForm);
                            }
                        }
                    });
                } else {

                    $scope.hasTermo = false;
                    $scope.finalizar(strForm);
                }
            };

            /**
             * Define se é uma transportadoa com base na solução CTe
             * @returns {boolean}
             */
            $scope.ehTransportadora = function () {

                // 20 solução cte
                return ($rootScope.objUsuario.arr_solucoes.indexOf(20) != -1);
            };

            /**
             * Método que finaliza o processo de salvar os dados de uma determinada empresa.
             */
            $scope.finalizar = function(strForm) {

                var strLadda = $scope.getLadda();
                $scope[strLadda] = true;

                $scope.empresa.emp_ativo_gn      = $scope.empresa.emp_ativo_gn        ?    1  :     0;
                $scope.empresa.emp_ativo_cielo   = $scope.empresa.emp_ativo_cielo     ?    1  :     0;
                $scope.empresa.emp_ativo_pagseg  = $scope.empresa.emp_ativo_pagseg    ?    1  :     0;
                $scope.empresa.emp_ativo_auto_cob = $scope.empresa.emp_ativo_auto_cob ?    1  :     0;
                $scope.empresa.emp_cod_csosn     = $scope.empresa.permite_aprov       ? '101' : '102';

                $scope.$watch(strForm, function(form) {
                    if (form) {
                        if (form.$invalid) {

                            $scope.submitted = true;
                            $scope[strLadda] = false;
                            GeralFactory.notify('danger', 'Atenção!', 'Verifique novamente os campos no formulário.');

                        } else {

                            delete $scope.empresa.emp_nfe_pwd;
                            delete $scope.empresa.emp_nfe_cert_arq;

                            EmpresaService.empresa.update($scope.empresa, function(resposta) {
                                if (resposta.records.error) {

                                    $scope[strLadda] = false;

                                } else {
                                    // Rejeição do termo de adesão:
                                    $scope[strLadda] = false;
                                    if ($scope.hasTermo) {

                                        switch ($scope.empresa.emp_termo_adesao) {

                                            case 1:
                                                $scope.enviarEmail();
                                                $scope.getEmpresa();
                                                $rootScope.setSisEmp($scope.empresa);
                                                break;

                                            case 2:
                                                $rootScope.sair(true);
                                                break;
                                        }
                                    } else {

                                        $scope.getEmpresa();
                                        $rootScope.setSisEmp($scope.empresa);
                                    }
                                }
                            });
                        }
                    }
                });
            };

            /**
             * Enviar e-mail com o termo de adesão.
             */
            $scope.enviarEmail = function() {

                var objEmpresa = $scope.empresa;
                objEmpresa.cod_termo = 1;

                EmpresaService.termo.enviarEmail(objEmpresa, function(retorno) {

                    var arrUsuario = Storage.usuario.getUsuario();
                    arrUsuario['emp'].emp_termo_adesao = 1;

                    Storage.implementacao.clear();
                    $rootScope.setUsuario(arrUsuario);

                    var classe = (retorno.records.error) ? 'warning' : 'success';
                    GeralFactory.notify(classe, 'Atenção!', retorno.records.msg);
                });
            };

            /**
             * Retorna a string contendo o nome do botão para a aplicar o loading do plugin
             * ladda isto de acordo com a aba na qual o usuário esteja localizado.
             */
            $scope.getLadda = function() {

                switch ($scope.tab) {
                    case 1:
                        return 'salvarEmpresaDadosLoading';
                    case 2:
                        return 'salvarEmpresaCertificadoLoading';
                    case 3:
                        return 'salvarEmpresaTributosLoading';
                    case 4:
                        return 'salvarEmpresaCobrancasLoading';
                }
            };

            /**
             * Efetua a abertura da janela modal para upload da logomarca da empresa.
             */
            $scope.getFormUpload = function(emp_cod_emp) {

                if (emp_cod_emp) {

                    var scope = $rootScope.$new();

                    scope.params             = {};
                    scope.params.logomarca   = $scope.empresa.logomarca;
                    scope.params.emp_cod_emp = emp_cod_emp;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'empresa/views/upload.html',
                        controller  : 'EmpresaModalUploadCtrl',
                        windowClass : 'center-modal',
                        scope       :  scope,
                        resolve     :  {
                            getEnd: function() { }
                        }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'cancel') {
                            if (modalInstance.hasAlteracao) {

                                var query = 'q=(mid_tab:4)';
                                MidiaService.midias.get({u : query}, function(retorno) {
                                    if (retorno.records.length) {

                                        var qtdeFotos = retorno.records.length;
                                        $scope.empresa.logomarca = retorno.records[qtdeFotos - 1].mid_id;
                                    }
                                });
                            }
                        }
                    });
                }
            };

            /**
             * Atualiza as instruções do boleto quando o usuário altera o valor
             * do campo de juros ou multas contido no formulário.
             */
            $scope.upInstrucao = function(tipo) {

                switch (tipo) {
                    case 'J':
                        var strJuros = $scope.empresa.emp_str_juros.replace('#', '');
                        $scope.empresa[strJuros] = 'Sr. Caixa, cobrar juros de ' + angular.element('#emp_gn_vlr_juros').val() + ' ao dia após vencimento.';
                        break;

                    case 'M':
                        var strMulta = $scope.empresa.emp_str_multa.replace('#', '');
                        $scope.empresa[strMulta] = 'Sr. Caixa, cobrar multa de ' + angular.element('#emp_gn_vlr_multa').val() + ' após vencimento.';
                        break;
                }
            };

            /**
             * Cria automaticamente as instruções do boleto quando o usuário ativa o
             * campo de juros ou multa.
             */
            $scope.setInstrucao = function(tipo) {

                switch (tipo){

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
                if ($scope.empresa[strAtivo]) {

                    ativo = true;
                    var string = $scope.empresa.emp_gn_obs1 ? '#emp_gn_obs2' : '#emp_gn_obs1', strScope = string.replace('#', '');

                    var mensagem = tipo === 'J' ? 'Sr. Caixa, cobrar juros de ' + $scope.empresa[strValue] + '% ao dia após vencimento.' : 'Sr. Caixa, cobrar multa de ' + $scope.empresa[strValue] + '% após vencimento.';

                    $scope.empresa[strAttr]  = string;
                    $scope.empresa[strScope] = mensagem;

                } else {

                    ativo = false;
                    var string = $scope.empresa[strAttr].replace('#', '');

                    $scope.empresa[strValue] = 0;
                    $scope.empresa[string]   = '';
                }

                angular.element($scope.empresa[strAttr]).prop('disabled', ativo);
            };

            /**
             * Método responsável em efetuar a abertura da janela modal contendo o
             * formulário para upload do certificado nfe.
             */
            $scope.getFormNfe = function(emp_cod_emp) {

                if (emp_cod_emp) {

                    var scope = $rootScope.$new();

                    scope.params = {};
                    scope.params.emp_cod_emp = emp_cod_emp;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'empresa/views/nfe.html',
                        controller  : 'EmpresaNfeUploadCtrl',
                        windowClass : 'center-modal',
                        scope       :  scope,
                        resolve     :  {
                            getEnd  : function() { }
                        }
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'cancel') {
                            if (modalInstance.objSelected.nomeArquivo != undefined) {

                                $scope.empresa.emp_nfe_cert_arq_txt = modalInstance.objSelected.nomeArquivo;
                            }
                        }
                    });
                }
            };

            /**
             * Método responsável em redirecionar o usuário para o LINK de validação de CNPJ.
             */
            $scope.validarCNPJ = function() {

                if ($scope.empresa.emp_cpf_cnpj) {

                    // Verifica se o CNPJ é válido com relação a máscara!
                    if ($scope.forms.formEmpresa.emp_cpf_cnpj.$error.cnpj) {

                        var mensagem = 'Caro usuário, o CNPJ mencionado é inválido!';
                        GeralFactory.notify('danger', 'Atenção:', mensagem);

                    } else {

                        var url = 'http://www.receita.fazenda.gov.br/pessoajuridica/cnpj/cnpjreva/Cnpjreva_Solicitacao2.asp?cnpj=';
                        url = url + $scope.empresa.emp_cpf_cnpj;
                        $timeout(function() {
                            $window.open(url, 'Validar CNPJ');
                        }, 300);
                    }
                } else {

                    var mensagem = 'Caro usuário, nenhum CNPJ foi mencionado para efetuar a validação junto a receita!';
                    GeralFactory.notify('danger', 'Atenção:', mensagem);
                }
            };

            /**
             * Método responsável em retornar a altura ideal para o painel da logomarca.
             */
            $scope.trocarPessoa = function(tpEmpresa, flag) {

                if (flag) {

                    $scope.empresa.emp_imun     = '';
                    $scope.empresa.emp_rg_iest  = '';
                    $scope.empresa.emp_cpf_cnpj = '';
                }

                var tamanho = tpEmpresa === 2 ? 260 : 160;
                $timeout(function() {

                    $('#box-logomarca').css({
                        'height' : tamanho + 'px'
                    });

                }, 500);
            };

            $scope.salvarSeq = function(tipo) {

                console.log('salvarseq');
                var novoNro;

                switch(tipo) { 
                    case 'seq_nfe':
                        novoNro = $scope.empresa.nro_prox_nota;
                        break;
                    case 'seq_cte':
                        novoNro = $scope.empresa.nro_prox_cte;
                        break;
                    case 'seq_rps':
                        novoNro = $scope.empresa.nro_prox_rps;
                        break;
                    case 'seq_nfse':
                        novoNro = $scope.empresa.nro_prox_nfse;
                        break;
                    case 'seq_lote_nfse':
                        novoNro = $scope.empresa.nro_prox_lote_nfse;
                        break;
                }

                var obj = {'novo_nro' : novoNro,
                           'tipo_seq' : tipo,
                           'emp_nro_serie' : $scope.empresa.emp_nro_serie};

                EmpresaService.sequence.create(obj, function(resposta) {

                    console.log('resp: ',resposta);

                });
            };

            /**
             * Configura as variáveis da aba de acordo com o tipo de importação selecionado no menu
             * @param tipoMigracao
             */
            $scope.setAbaMigracao = function(tipoMigracao) {

                $scope.resetMigracaoDados();

                $scope.migracaoDados.tipoMigracao = tipoMigracao;

                switch ($scope.migracaoDados.tipoMigracao) {
                    case 1:
                        $scope.migracaoDados.migracaoLabel   = 'CLIENTE';
                        $scope.migracaoDados.layoutMigracao  = 1;
                        $scope.migracaoDados.cad_tip_cli_for = 1;
                        $scope.dragCtrl.setDropzone('cliente');
                        break;
                    case 2:
                        $scope.migracaoDados.migracaoLabel = 'PRODUTO';
                        $scope.dragCtrl.setDropzone('produto');
                        break;
                    case 3:
                        $scope.migracaoDados.migracaoLabel = 'FINANÇAS';
                        break;
                    case 4:
                        $scope.migracaoDados.migracaoLabel  = 'INVENTÁRIO';
                        $scope.migracaoDados.layoutMigracao = 1;
                        $scope.migracaoDados.tip_arquivo    = 1;
                        $scope.migracaoDados.telaLiberada   = false;
                        break;
                    default:
                        $scope.migracaoDados.migracaoLabel   = 'CLIENTE';
                        $scope.migracaoDados.layoutMigracao  = 1;
                        $scope.migracaoDados.cad_tip_cli_for = 1;
                }

                $scope.loadLogNames($scope.migracaoDados.migracaoLabel);

            };

            /**
             * Método responsável por efetuar a leitura de um arquivo .txt
             * @param $fileContent
             */
            $scope.showFileContent = function($fileContent){
                if (! $fileContent) {

                    GeralFactory.notify('danger', 'Atenção!', 'Selecione um arquivo para importação.');
                }
            };

            /**
             * Seta as variáveis em branco para a importação começar.
             */
            $scope.resetMigracaoDados = function () {

                $scope.migracaoDados = {
                    cad_tip_cli_for  : 1,
                    layoutMigracao   : 0,
                    extensaoMigracao : '.txt',
                    tipoMigracao     : 1,
                    migracaoLabel    : 'CLIENTE',
                    logRetorno       : [],
                    headerArquivo    : {
                        tipoRegistros : '',
                        qtdRegistros  : ''
                    },
                    telaLiberada     : true,
                    usu_senha_inventario : ''
                };

                console.log('$scope.migracaoDados', $scope.migracaoDados);

                //limpa o campo
                $('#fileImport').val(null);

                $scope.setLinkModelo();
            };

            /**
             * Seta o link para o download do modelo de arquivo de importação
             */
            $scope.setLinkModelo = function () {

                if($scope.migracaoDados.extensaoMigracao == '.xls') {

                    $scope.migracaoDados.linkModelo = '';
                } else {

                    var strFiltro = GeralFactory.formatarPesquisar({
                        'ext'  : $scope.migracaoDados.extensaoMigracao,
                        'type' : $scope.migracaoDados.tipoMigracao,
                        'ken'  : AuthTokenFactory.getToken()
                    });

                    $scope.migracaoDados.linkModelo = GeralFactory.getUrlApi() + '/erp/export/modelo-importacao/?' + strFiltro;
                }
            };

            $scope.baixarModelo = function () {
                if($scope.migracaoDados.tipoMigracao != 5)
                    $window.open($scope.migracaoDados.linkModelo, 'Modelo de Importação');
                else{
                    var fileName = 'MigrarCadastroCliente';
                    if($scope.migracaoDados.migracaoLabel != 'CLIENTE')
                        fileName = 'MigrarCadastroProduto';

                    $window.open('../app/ImportacaoModels/'+ fileName +'.xls', 'Modelo de Importação');
                }
            };

            /**
             * Seta a extensão permitida para selecionar arquivos de acordo com o layout selecionado
             * @param layoutMigracao
             */
            $scope.setExtensaoMigracao = function (layoutMigracao) {

                if(layoutMigracao == 1){

                    $scope.migracaoDados.extensaoMigracao = '.txt';

                } else if(layoutMigracao == 2){

                    $scope.migracaoDados.extensaoMigracao = '.xls';

                }else if(layoutMigracao == 3){

                    $scope.migracaoDados.extensaoMigracao = '.xml';
                } else {

                    var mig = $scope.migracaoDados.migracaoLabel;
                    if(mig == 'CLIENTE' || mig == 'PRODUTO'){
                        $scope.migracaoDados.extensaoMigracao = '.xls';
                        $scope.migracaoDados.tipoMigracao = 5;
                    }
                }

                $timeout(function () {
                    $scope.setLinkModelo();
                },100);
            };

            /**
             * Lê o arquivo e retorna a quantiade de registros.
             * @param $fileContent
             */
            $scope.exibeConteudoTXT = function($fileContent) {

                if($scope.migracaoDados.tipoMigracao != 4) {

                    var header = GeralFactory.qtdRegistrosTXT($fileContent);

                    $scope.migracaoDados.headerArquivo.tipoRegistros = header[0];
                    $scope.migracaoDados.headerArquivo.qtdRegistros  = header[1];
                }
            };

            /**
             * Método responsável em verificar qual função de cadastro será executada.
             * Ex: salvarDadosImportacaoCliente, salvarDadosImportacaoProduto, etc.
             * @param file
             * @param event
             */
            $scope.migrarDados = function(file, event) {
                file = $('#fileImport')[0].files[0];


                $scope.salvarEmpresaLoading = true;
                console.log("Teste: ", $scope.migracaoDados);

                if (!$scope.migracaoDados.headerArquivo.qtdRegistros == $scope.migracaoDados.migracaoLabel) {

                    GeralFactory.notify('danger', 'Atenção!', 'O arquivo que você escolheu não pertence ao tipo de migração selecionado.');
                    $scope.salvarEmpresaLoading = false;

                } else if ($scope.migracaoDados.tipoMigracao == 3 && $scope.migracaoDados.extensaoMigracao == '.txt') {

                    GeralFactory.notify('danger', 'Atenção!', 'A migração de dados financeiros está disponível apenas para o layout "Conta Azul (.csv)"! Por favor verifique.');
                    $scope.salvarEmpresaLoading = false;

                }else if ($scope.migracaoDados.tipoMigracao == 4 && $scope.migracaoDados.extensaoMigracao == '.xml') {

                    GeralFactory.notify('danger', 'Atenção!', 'O arquivo XML está disponível apenas para importação de notas fiscais eletrônicas.');
                    $scope.salvarEmpresaLoading = false;

                } else {

                    console.log("Cliente");

                    $scope.$watch('forms.formMigracao', function(form) {
                        if (form) {
                            if (form.$invalid) {

                                $scope.submitted = true;
                                $scope.salvarEmpresaLoading = false;
                                GeralFactory.notify('danger', 'Atenção!', 'Por favor, selecione um arquivo.');

                            } else {

                                switch ($scope.migracaoDados.tipoMigracao) {
                                    case 1:
                                        $scope.salvarDadosMigracao(file, 'cliente-migracao');
                                        break;
                                    case 2:
                                        $scope.salvarDadosMigracao(file, 'produto-migracao');
                                        break;
                                    case 3:
                                        $scope.salvarDadosMigracao(file, 'financas-migracao');
                                        break;
                                    case 4:
                                        $scope.salvarDadosMigracao(file, 'saldo-inicial');
                                        break;
                                    case 5:
                                        if($scope.migracaoDados.migracaoLabel == 'CLIENTE')
                                            $scope.salvarDadosMigracao(file, 'restore');
                                        else if($scope.migracaoDados.migracaoLabel == 'PRODUTO')
                                            $scope.salvarDadosMigracao(file, 'restore-prod');
                                        break;

                                    default:
                                        $scope.salvarDadosMigracao(file, 'cliente-migracao');
                                }
                            }
                        }
                    });
                }
            };
            
            $scope.cadastroTipo = 1;
            $scope.setCadastro = function(cad){
                $scope.cadastroTipo = cad;
            };

            $scope.fazerBackup = function(){
                console.log("Downloading...");

                var strFiltro;

                if($scope.migracaoDados.migracaoLabel == 'CLIENTE') {
                    strFiltro = GeralFactory.formatarPesquisar({cad_tip_cli_for_bk: $scope.cadastroTipo, bkuptype: 'client', ken: AuthTokenFactory.getToken()});
                    backupFile(strFiltro);

                } else {
                    strFiltro = GeralFactory.formatarPesquisar({cad_tip_cli_for_bk: $scope.cadastroTipo, bkuptype: 'produto', ken: AuthTokenFactory.getToken()});
                    backupFile(strFiltro);
                }
            };

            function backupFile(strFiltro){
                var url = GeralFactory.getUrlApi() + '/erp/export/backup/?' + strFiltro;
                $window.open(url);
            }

            $scope.baixarLog = function(fileName){
                var logName = fileName.substring(fileName.lastIndexOf('/')+1, fileName.lastIndexOf('.'));

                var strFiltro = GeralFactory.formatarPesquisar({miglog: fileName, logfilename: logName, ken: AuthTokenFactory.getToken()});
                var url = GeralFactory.getUrlApi() + '/sistema/migracao/migracaolog/?' + strFiltro;
                $window.open(url);
            };

            $scope.baixarOrg = function(fileName){
                var logName = fileName.substring(fileName.lastIndexOf('/')+1, fileName.lastIndexOf('.'));
                var datas = logName.split('_');
                var orgName = datas[0] + '_' + datas[1] + '_' + datas[2];

                var strFiltro = GeralFactory.formatarPesquisar({logfilename: orgName, ken: AuthTokenFactory.getToken()});
                var url = GeralFactory.getUrlApi() + '/sistema/migracao/migracaoorg/?' + strFiltro;
                $window.open(url);
            };

            /**
             * Aciona a API para a gravação dos dados do arquivo.
             * @param tipoMigracao
             */
            $scope.salvarDadosMigracao = function(file, tipoMigracao) {

                var arrData = {};

                if($scope.migracaoDados.cad_tip_cli_for){

                    arrData.cad_tip_cli_for = $scope.migracaoDados.cad_tip_cli_for
                }

                if($scope.migracaoDados.tip_arquivo){

                    arrData.tip_arquivo = $scope.migracaoDados.tip_arquivo
                }

                console.log('arrData', arrData);
                console.log('MigracaoDados', $scope.migracaoDados);

                MidiaService.migracao(file, tipoMigracao, arrData, function (data) {

                    /* Para a importação do inventário, trata o retorno
                    de maneira diferente, mostrando uma mensagem para cada item */
                    if($scope.migracaoDados.tipoMigracao == 4) {

                        if(data.records.error) {

                            GeralFactory.notify('danger', 'Erro', data.records.msg);
                        } else {

                            GeralFactory.notify('success', 'Sucesso', 'Arquivo importado com sucesso!');

                            angular.forEach(data.records,function(retorno,k) {

                                $scope.migracaoDados.logMigracao += $sce.trustAsHtml('<div class="alert alert-'+ ((retorno.error) ? 'danger' : 'success') +'">'+ retorno.msg +'</div>');
                            });
                        }

                        $scope.salvarEmpresaLoading = false;

                    } else {

                        if($scope.migracaoDados.tipoMigracao != 5){
                            if (!data.records.error) {

                                GeralFactory.notify('success', data.records.title, data.records.msg);
                                // $scope.migracaoDados.logRetorno = logRetorno;

                                $timeout(function () {

                                    $scope.migracaoDados.logMigracao += $sce.trustAsHtml('<div class="alert alert-'+ ((data.records.error) ? 'danger' : 'success') +'">'+ data.records.msg +'</div>');
                                    $scope.salvarEmpresaLoading = false;
                                }, 500);

                                $scope.qtdRegistros = false;

                            } else {

                                GeralFactory.notify('danger', data.records.title, data.records.msg);
                                $timeout(function () {

                                    $scope.migracaoDados.logMigracao += $sce.trustAsHtml('<div class="alert alert-'+ ((data.records.error) ? 'danger' : 'success') +'">'+ data.records.msg +'</div>');
                                    $scope.salvarEmpresaLoading = false;
                                }, 500);

                                $scope.resetMigracaoDados();
                            }
                        } else {
                            var aceitos = 0, rejeitados = 0, total = 0;

                            GeralFactory.notify('success', 'Dados importados', 'Dados importados');

                            $timeout(function () {

                                total = aceitos + rejeitados;
                                var msg = 'Dados Lidos: ' + total + ', Dados Importados: ' + aceitos + ', Dados Rejeitados: ' + rejeitados;

                                $scope.migracaoDados.logMigracao += $sce.trustAsHtml('<div class="alert alert-success' +'">'+ msg +'</div>');
                                $scope.salvarEmpresaLoading = false;
                            }, 500);

                            $scope.qtdRegistros = false;
                        }
                    }
                });
            };

            /**
             * Recalcula o estoque com base no saldo inicial
             */
            $scope.recalculaEstoque = function () {

                $scope.salvarEmpresaLoading = true;

                ProdutoService.estoque.recalcular(function (data) {

                    console.log('data', data);

                    if(data.records.error) {

                        GeralFactory.notify('danger', 'Erro', data.records.msg);
                    } else {

                        GeralFactory.notify('success', 'Sucesso', 'Estoque recalculado com sucesso!');

                        angular.forEach(data.records,function(retorno,k) {

                            $scope.migracaoDados.logMigracao += $sce.trustAsHtml('<div class="alert alert-'+ ((retorno.error) ? 'danger' : 'success') +'">'+ retorno.msg +'</div>');
                        });
                    }

                    $scope.salvarEmpresaLoading = false;
                });
            };

            /**
             * Função responsável por liberar a tela de inventário
             */
            $scope.liberaTelaInventario = function () {

                $scope.salvarEmpresaLoading = true;

                if($scope.migracaoDados.usu_senha_inventario) {

                    EmpresaService.inventario.liberaTela($scope.migracaoDados, function (retorno) {

                        if(!retorno.records.error) {

                            $scope.migracaoDados.telaLiberada = true;
                        } else {

                            GeralFactory.notify('danger', 'Atenção!', 'A senha informada é inválida!');
                        }

                        $scope.salvarEmpresaLoading = false;
                    });
                } else {

                    GeralFactory.notify('danger', 'Atenção!', 'Informe a senha!');
                    $scope.salvarEmpresaLoading = false;
                }
            };
        }
    ]);

function fileChange(evt) {

    console.log(evt);

    var $input    = $('#fileImport'),
        $fileName = $('#file-name');

    console.log('$input.val()', $input.val());

    $fileName.html($input.val());
}