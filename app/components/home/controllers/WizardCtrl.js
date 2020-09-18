'use strict';

angular.module('newApp')

    .controller ('WizardCtrl', [

        '$scope', '$rootScope', '$timeout', '$location', '$uibModal', 'EmpresaService', 'ClienteService', 'GeralFactory', 'Storage',

        function($scope, $rootScope, $timeout, $location, $uibModal, EmpresaService, ClienteService, GeralFactory, Storage) {

            $rootScope.hasAutorizacao();

            $scope.forms       = {};
            $scope.empresa     = {};
            $scope.certificado = null;

            $scope.objWizard = {
                p1 : false,
                p2 : false,
                p3 : false
            };

            $scope.objModulos = {
                m1 : false,
                m2 : false,
                m3 : false,
                m4 : false
            };

            $scope.objPerfis = {
                VAREJO     : false,
                ATACADO    : false,
                INDUSTRIA  : false,
                SERVICOS   : false,
                TRANSPORTE : false
            };

            $scope.$on('$viewContentLoaded', function() {

                var objUsuario = Storage.usuario.getUsuario();
                var hasWizard  = $rootScope.objUsuario.wizard;
                if (hasWizard) {

                    $scope.arrEstados = EmpresaService.ufs.get({});
                    EmpresaService.setores.mesclar({}, function(retorno) {

                        $scope.arrSetores        = retorno.records.arr_setores;
                        $scope.arrSegmentos      = retorno.records.arr_segmentos;
                        $scope.arrSegmentosClone = angular.copy($scope.arrSegmentos);
                    });

                    $timeout(function() {
                        $scope.getEmpresa();
                    }, 1000);

                } else {

                    $location.path('/');
                }
            });

            /**
             * Método responsável em listar os segmentos de um setor.
             */
            $scope.onChangeSetor = function() {

                var codSetor = $scope.empresa.emp_cod_setor_pai;
                if (codSetor != 9000) {

                    $scope.empresa.emp_cod_setor = undefined;
                    var arrSegmentos = [];

                    angular.forEach($scope.arrSegmentosClone, function(item) {
                        if (codSetor === item.set_cod_seg) {
                            arrSegmentos.push(item);
                        }
                    });

                    $timeout(function() {
                        $scope.arrSegmentos = arrSegmentos;
                    });
                } else {

                    $scope.empresa.emp_cod_setor = codSetor;
                    console.log('Setor e segmento OUTROS!');
                }
            };

            /**
             * Efetua a troca do tipo de pessoa na tela.
             */
            $scope.trocarTipo = function() {

                $scope.empresa.emp_imun     = '';
                $scope.empresa.emp_rg_iest  = '';
                $scope.empresa.emp_cpf_cnpj = '';

                switch ($scope.empresa.emp_pf_pj) {

                    case 1:
                        $scope.empresa.emp_pf_pj = 2;
                        break;
                    case 2:
                        $scope.empresa.emp_pf_pj = 1;
                        break;
                    default:
                        $scope.empresa.emp_pf_pj = 2;
                        break;
                }
            };

            /**
             * Método responsável em recolher os dados de uma determinada empresa.
             */
            $scope.getEmpresa = function() {

                EmpresaService.empresa.get({emp_cod_emp : '1'}, function(retorno) {
                    if (retorno.records) {

                        var objEmpresa = retorno.records;
                        objEmpresa.emp_uf = objEmpresa.emp_cod_uf + '#' + objEmpresa.emp_uf;

                        console.log(objEmpresa);

                        EmpresaService.getCidadePorUf(objEmpresa.emp_uf, function(data) {
                            $scope.arrCidades = data;
                        });

                        objEmpresa.emp_imun    = objEmpresa.emp_imun ? objEmpresa.emp_imun.trim() : '';
                        objEmpresa.emp_pf_pj   = objEmpresa.emp_pf_pj ? parseInt(objEmpresa.emp_pf_pj) : 2;
                        objEmpresa.emp_cidade  = objEmpresa.emp_cod_cidade + '#' + objEmpresa.emp_cidade;
                        objEmpresa.emp_rg_iest = objEmpresa.emp_rg_iest ? objEmpresa.emp_rg_iest.trim() : '';

                        objEmpresa.emp_nfe_cert_arq_txt = objEmpresa.emp_nfe_cert_arq;
                        $scope.empresa = objEmpresa;
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
                                    $scope.arrCidades = data;
                                }
                            });
                        }
                    });
                }
            };

            /**
             * Retorna as cidades de um determinado estado.
             */
            $scope.getCidadePorUf = function() {

                EmpresaService.getCidadePorUf($scope.empresa.emp_uf, function(data) {
                    $scope.arrCidades = data;
                });
            };

            /**
             * Recolhe os dados da empresa direto da receita a partir do CNPJ.
             */
            $scope.getDadosReceita = function() {

                if ($scope.empresa.emp_pf_pj === 2) {

                    var tpPessoa  = 2;
                    var objFiltro = {
                        cad_cpf_cnpj    : $scope.empresa.emp_cpf_cnpj,
                        cad_tip_cli_for : tpPessoa
                    };

                    var strFiltro = GeralFactory.formatarPesquisar(objFiltro);
                    ClienteService.autoComplete.receitaWS({u : strFiltro}, function(retorno) {
                        if (retorno.records.error) {

                            var mensagem = 'Nenhuma informação encontrada!';
                            GeralFactory.notify('warning', 'Erro', mensagem);

                        } else {

                            var objEmpresa = retorno.records;

                            $scope.empresa.emp_cpf_cnpj         = objEmpresa.cad_cpf_cnpj;
                            $scope.empresa.emp_nome_razao       = objEmpresa.cad_nome_razao;
                            $scope.empresa.emp_apelido_fantasia = objEmpresa.cad_apelido_fantasia;

                            if (objEmpresa.endereco) {

                                $scope.empresa.emp_cep         = objEmpresa.endereco.end_cep.trim();
                                $scope.empresa.emp_endereco    = objEmpresa.endereco.end_endereco;
                                $scope.empresa.emp_nro         = objEmpresa.endereco.end_endereco_nro;
                                $scope.empresa.emp_bairro      = objEmpresa.endereco.end_endereco_bairro;
                                $scope.empresa.emp_complemento = objEmpresa.endereco.end_endereco_complemento;

                                if (objEmpresa.endereco.end_endereco_uf !== 'null#null') {

                                    $scope.empresa.emp_uf      = objEmpresa.endereco.end_endereco_uf;
                                    $scope.empresa.emp_cidade  = objEmpresa.endereco.end_endereco_cidade;

                                    EmpresaService.getCidadePorUf(objEmpresa.endereco.end_endereco_uf, function(data) {
                                        $scope.arrCidades = data;
                                    });
                                }
                            }
                        }
                    });
                }
            };

            /**
             * Método responsável em salvar os dados de um determinada empresa.
             */
            $scope.salvarEmpresa = function() {

                $scope.salvarEmpresaDadosLoading = true;
                $scope.$watch('forms.formWizard', function(form) {
                    if (form) {
                        console.log('Formulário: ', form);
                        if (form.$invalid) {

                            $scope.submitted = true;
                            $scope.salvarEmpresaDadosLoading = false;

                        } else {

                            $timeout(function() {
                                $scope.triggerSalvar('salvarEmpresaDadosLoading', 'p1');
                            });
                        }
                    }
                });
            };

            /**
             * Método responsável em finalizar o wizard com os dados de perfil e documentos
             * fiscais para o certificado mencionados pelo usuário da aplicação.
             */
            $scope.finalizar = function() {

                $scope.finalizarEmpresaDadosLoading = true;
                $scope.$watch('forms.formWizardModulos', function(form) {
                    if (form) {
                        if (form.$invalid) {

                            $scope.submitted = true;
                            $scope.finalizarEmpresaDadosLoading = false;

                        } else {

                            if ($scope.certificado) {

                                $scope.empresa.emp_tip_nota = $scope.certificado;
                                if ($scope.empresa.emp_tip_nota === 2) {

                                    $scope.empresa.emp_nfe_pwd = '';
                                    $scope.empresa.emp_nfe_cert_arq = '';
                                }
                            }

                            var arrEmpresaPerfis   = [];
                            var arrEmpresaSolucoes = [];

                            angular.forEach($scope.objPerfis, function(i, j) {
                                if (i) {
                                    switch (j) {
                                        case 'VAREJO':
                                            arrEmpresaPerfis.push(1);
                                            break;
                                        case 'ATACADO':
                                            arrEmpresaPerfis.push(2);
                                            break;
                                        case 'INDUSTRIA':
                                            arrEmpresaPerfis.push(3);
                                            arrEmpresaSolucoes.push({
                                                sol_cod_sol           : 21,
                                                sol_tpl_cod_tpl       : 41,
                                                sol_iva_periodicidade : 1,
                                                sol_tpr_cod_tpr       : 1,
                                                sol_status            : 1,
                                                sol_qtd               : 1
                                            });
                                            break;
                                        case 'SERVICOS':
                                            arrEmpresaPerfis.push(4);
                                            break;
                                        case 'TRANSPORTE':
                                            arrEmpresaPerfis.push(5);
                                            break
                                    }
                                }
                            });

                            angular.forEach($scope.objModulos, function(i, j) {
                                if (i) {
                                    switch (j) {
                                        case 'm1':
                                            arrEmpresaSolucoes.push({
                                                sol_cod_sol           : 15,
                                                sol_tpl_cod_tpl       : 31,
                                                sol_iva_periodicidade : 1,
                                                sol_tpr_cod_tpr       : 1,
                                                sol_status            : 1,
                                                sol_qtd               : 1
                                            });
                                            break;
                                        case 'm2':
                                            arrEmpresaSolucoes.push({
                                                sol_cod_sol           : 17,
                                                sol_tpl_cod_tpl       : 33,
                                                sol_iva_periodicidade : 1,
                                                sol_tpr_cod_tpr       : 1,
                                                sol_qtd               : 1
                                            });
                                            break;
                                        case 'm3':
                                            arrEmpresaSolucoes.push({
                                                sol_cod_sol           : 16,
                                                sol_tpl_cod_tpl       : 32,
                                                sol_iva_periodicidade : 1,
                                                sol_tpr_cod_tpr       : 1,
                                                sol_qtd               : 1
                                            });
                                            break;
                                        case 'm4':
                                            arrEmpresaSolucoes.push({
                                                sol_cod_sol           : 22,
                                                sol_tpl_cod_tpl       : 42,
                                                sol_iva_periodicidade : 1,
                                                sol_tpr_cod_tpr       : 1,
                                                sol_qtd               : 1
                                            });
                                            break;
                                    }
                                }
                            });

                            $timeout(function() {
                                $scope.empresa.perfis   = arrEmpresaPerfis;
                                $scope.empresa.solucoes = arrEmpresaSolucoes;
                                $scope.triggerSalvar('finalizarEmpresaDadosLoading', 'p2');
                            });
                        }
                    }
                });
            };

            /**
             * Método genérico responsável em salvar os dados da empresa.
             */
            $scope.triggerSalvar = function(strLadda, strWizard) {

                EmpresaService.empresa.update($scope.empresa, function(retorno) {

                    $scope[strLadda] = false;
                    if (! retorno.records.error) {

                        $timeout(function() {
                            $scope.objWizard[strWizard] = true;
                            $scope.getEmpresa();
                            $rootScope.setSisEmp($scope.empresa);

                            switch (strWizard) {
                                case 'p1':
                                    angular.element('.sf-nav-step-1').trigger('click');
                                    break;
                                case 'p2':
                                    angular.element('.sf-nav-step-2').trigger('click');
                                    break;
                            }
                        });
                    }
                });
            };

            /**
             * Método responsável em abrir a janela modal contendo o formulário para anexo do
             * certificado digital A1 por parte do usuário.
             */
            $scope.anexar = function(emp_cod_emp) {

                if (emp_cod_emp) {

                    var scope = $rootScope.$new();

                    scope.params = {};
                    scope.params.emp_cod_emp = emp_cod_emp;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        scope       :  scope,
                        windowClass : 'center-modal',
                        controller  : 'EmpresaNfeUploadCtrl',
                        templateUrl : 'empresa/views/nfe.html'
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'cancel') {
                            if (modalInstance.objSelected.nomeArquivo !== undefined) {
                                $scope.empresa.emp_nfe_cert_arq_txt = modalInstance.objSelected.nomeArquivo;
                            }
                        }
                    });
                }
            };

            /**
             * Método responsável em concluir o wizard redirecionando o usuário para o dashboard.
             */
            $scope.concluir = function() {

                $scope.concluirEmpresa = true;
                $scope.objWizard['p3'] = true;

                var mensagem = 'Aguarde enquanto você é redirecionado!';
                GeralFactory.notify('info', 'Info', mensagem);

                $timeout(function() {

                    var objUsuario = Storage.usuario.getUsuario();
                    objUsuario.wizard = false;

                    Storage.implementacao.clear();
                    $rootScope.setUsuario(objUsuario);

                    $scope.concluirEmpresa = false;
                    $location.path('/');

                }, 5000);
            };

            /**
             * Método responsável em verificar se o usuário assinalou algumas das opções
             * referentes as soluções existentes da nota fiscal eletrônica.
             */
            $scope.getVerificaCertificado = function() {

                var keepGoing = true;
                angular.forEach($scope.objModulos, function(i) {
                    if (keepGoing && i) {
                        keepGoing = false;
                    }
                });

                return !keepGoing;
            };

            /**
             * Método responsável em ativar ou desativar um determinado módulo.
             */
            $scope.triggerModulo = function(attr) {

                $scope.objModulos[attr] = !$scope.objModulos[attr];
                $scope.getVerificaCertificado();
            };

            /**
             * Método responsável em ativar ou desativar um determinado perfil da empresa.
             */
            $scope.triggerPerfil = function(attr) {

                $scope.objPerfis[attr] = !$scope.objPerfis[attr];
            };

            /**
             * Método responsável em verificar qual o tipo do certificado escolhido pelo usuário.
             */
            $scope.setCertificado = function(codĆertificado) {

                $scope.certificado = codĆertificado;
            };
        }
    ]);