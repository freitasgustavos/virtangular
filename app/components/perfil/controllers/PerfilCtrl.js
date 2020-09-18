'use strict';

angular.module('newApp')

    .controller('PerfilCtrl', [

        '$scope', '$rootScope', '$timeout', '$location', 'GeralFactory', 'UsuarioService', 'Modulos', 'Constantes', 'Wizard',

        function ($scope, $rootScope, $timeout, $location, GeralFactory, UsuarioService, Modulos, Constantes, Wizard) {

            $rootScope.hasAutorizacao();

            if (! $rootScope.getPermissao('38')) {
                $location.path('/');
            }

            $scope.forms       = {};
            $scope.objFiltro   = {};
            $scope.arrPerfis   = [];
            $scope.arrUsuarios = [];
            $scope.objPerfil   = {
                modulos : []
            };

            $scope.$on('$viewContentLoaded', function() {

                $scope.setAbaInicial(1);

                $scope.flagTutorial  =  true;
                $scope.siglaTutorial = 'PER';
                $scope.labelTutorial = 'Cadastro de novos perfis';
                $scope.nomeBotao     = 'Cancelar';

                $timeout(function() {
                    $scope.arrModulos = Modulos;
                });


                $scope.listarPerfis();
                $timeout(function() {
                    $scope.triggerListarUsuarios();
                }, 1000);

                $timeout(function () {
                    Wizard.loadWizards.initialize(38);
                }, 2000);
            });


            /**
             * Prepara a tela para inserção de um novo perfil.
             */
            $scope.novoPerfil = function() {

                $scope.forms.formPerfil.$setPristine();

                $scope.flagTutorial =  false;
                $scope.nomeBotao    = 'Cancelar';
                $scope.objPerfil    =  {
                    modulos : []
                };
            };


            /**
             * Retorna uma lista dos perfis ativos.
             */
            $scope.listarPerfis = function() {

                $rootScope.spinnerList.on();
                $scope.arrPerfis = [];

                var objFiltro = $scope.getFiltro();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=0');

                UsuarioService.perfis.get({u : strFiltro}, function(retorno) {
                    if (retorno.records.arr_perfis) {

                        var arrPerfis = $.map(retorno.records.arr_perfis, function(value, index) {
                            return [value];
                        });

                        $timeout(function() {
                            $scope.arrPerfis = arrPerfis;
                            $scope.arrPerfis.unshift(retorno.records.arr_admin);
                            console.log('$scope.arrPerfis',$scope.arrPerfis)
                            $rootScope.spinnerList.off();
                        },500);
                    } else {

                        $scope.arrPerfis.push(retorno.records.arr_admin);
                        $rootScope.spinnerList.off();
                    }
                });
            };


            /**
             * Efetua a paginação dos perfis ativos.
             */
            $scope.paginarPerfis = function() {

                $rootScope.spinnerList.on();

                var objFiltro = $scope.getFiltro();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=' + $scope.getOffset());

                UsuarioService.perfis.get({u : strFiltro}, function(retorno) {
                    if (retorno.records.arr_perfis.length > 0) {

                        var arrPerfis = retorno.records.arr_perfis;
                        angular.forEach(arrPerfis, function(item) {
                            $scope.arrPerfis.push(item);
                        });

                        $timeout(function() {
                            $rootScope.spinnerList.off();
                        });
                    } else {

                        $rootScope.spinnerList.off();
                        GeralFactory.notify('warning', 'Atenção:', 'Caro usuário, a listagem dos perfis já se encontra completa!');
                    }
                });
            };


            /**
             * Efetua a listagem dos usuários de um determinado perfil.
             */
            $scope.triggerListarUsuarios = function() {

                angular.element('#tab-perfil-usuarios a').click(function() {

                    console.log($scope.objPerfil);

                    if ($scope.objPerfil.prf_cod_prf && _.isEmpty($scope.arrUsuarios)) {

                        var strFiltro = GeralFactory.formatarPesquisar({
                            'prf_cod_prf' : $scope.objPerfil.prf_cod_prf
                        });

                        $rootScope.spinnerForm.on();
                        UsuarioService.usuarios.getByPerfil({u : strFiltro}, function(retorno) {
                            if (retorno.records.length > 0) {

                                $timeout(function() {
                                    $scope.arrUsuarios = retorno.records;
                                    $rootScope.spinnerForm.off();
                                });

                            } else {

                                $rootScope.spinnerForm.off();
                            }
                        });
                    }
                });
            };


            /**
             * Retorna o limite de registros para a paginação.
             */
            $scope.getOffset = function() {

                return ($scope.arrPerfis.length) ? $scope.arrPerfis.length : 0;
            };


            /**
             * Retorna uma lista de produtos ou serviços baseada na pesquisa efetuada pelo usuário.
             */
            $scope.getPesquisar = function(event) {

                if (! GeralFactory.inArray(event.which, Constantes.KEYS)) {
                    $timeout(function() {
                        $scope.listarPerfis();
                    }, 500);
                }
            };


            /**
             * Retorna um objeto com o filtro utilizado na pesquisa.
             */
            $scope.getFiltro = function() {

                var objFiltro = {
                    'texto_perfil' : $scope.objFiltro.texto_perfil
                };
                return objFiltro;
            };


            /**
             * Recolhe os dados de um determinado perfil.
             */
            $scope.getPerfil = function(codPerfil) {

                $scope.perfilSelected = codPerfil;

                var arrAdmins = [2112, 5192, 9211, 9589, 6589];
                if (_.contains(arrAdmins, codPerfil)) {

                    var keepGoing = true;
                    angular.forEach($scope.arrPerfis, function(item) {

                        if (keepGoing && codPerfil === item.prf_cod_prf) {

                            keepGoing = false;
                            $scope.setPerfil(item);
                        }
                    });
                } else {

                    UsuarioService.perfil.get({prf_cod_prf : codPerfil}, function(retorno) {
                        if (! _.isEmpty(retorno.records)) {

                            var objPerfil = retorno.records;
                            $scope.setPerfil(objPerfil);
                        }
                    });
                }
            };


            /**
             * Inicializa um determinado perfil escolhido pelo usuário.
             */
            $scope.setPerfil = function(objPerfil) {

                $scope.arrUsuarios  =  [];
                $scope.objPerfil    =  objPerfil;
                $scope.flagTutorial =  false;
                $scope.nomeBotao    = 'Excluir';
                $scope.setAbaInicial(1);
                
                console.log('Perfil escolhido: ', objPerfil);
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

                    $scope.setAbaInicial(abaSelecionada);
                }
            };


            /**
             * Mostra um alerta para que o cliente salve ou não os dados antes de sair da tela
             */
            $scope.alertaSalvar = function() {

                $rootScope.spinnerList.on();
                GeralFactory.confirmar('Deseja salvar antes de sair?',function () {

                    if ($scope.objPerfil.prf_cod_prf) {

                        UsuarioService.perfil.update($scope.objPerfil, function() {

                            $scope.flagTutorial = true;
                            $scope.callback();
                        });
                    } else {

                        UsuarioService.perfis.create($scope.objPerfil, function() {

                            $scope.flagTutorial = true;
                            $scope.callback();
                        });
                    }

                }, 'Título', function() {

                    $scope.flagTutorial = true;
                    $rootScope.spinnerList.off();
                });
            };


            /**
             * Seta para aba principal ficar ativa
             */
            $scope.setAbaInicial = function(id) {

                switch (id) {
                    case 1:
                        $scope.tabs = [{active:true}, {active:false}];
                        break;
                    case 2:
                        $scope.tabs = [{active:false}, {active:true}];
                        break;
                }
            };


            /**
             * Método responsável em salvar ou atualizar os dados de um determinado perfil.
             */
            $scope.salvarPerfil = function() {

                $scope.salvarPerfilLoading = true;

                var validar = $scope.validar();
                if (validar['error']) {

                    GeralFactory.notify('danger', 'Atenção:', validar['msg']);
                    $scope.salvarPerfilLoading = false;

                } else {

                    $scope.$watch('forms.formPerfil', function(form) {
                        if (form) {
                            if (form.$invalid) {

                                $scope.submitted = true;
                                $scope.salvarPerfilLoading = false;

                            } else {

                                if ($scope.objPerfil.prf_cod_prf) {

                                    UsuarioService.perfil.update($scope.objPerfil, $scope.callback);

                                } else {

                                    UsuarioService.perfis.create($scope.objPerfil, $scope.callback);
                                }
                            }
                        }
                    });
                }
            };


            /**
             * Efetua a validação do formulário antes de salvar os dados de um perfil.
             */
            $scope.validar = function() {

                if (_.isEmpty($scope.objPerfil.modulos)) {
                    var mensagem = 'Para salvar um perfil é necessário escolher ao menos um módulo!';
                    return {
                        'error' : true,
                        'msg'   : mensagem
                    };
                }

                return {'error' : false};
            };


            /**
             * Função de callback chamada quando atualizar ou inserir um determinado perfil.
             */
            $scope.callback = function(retorno) {

                var codPerfil = retorno.records.prf_cod_prf;
                if (! retorno.records.error) {

                    $scope.getPerfil(codPerfil);
                    $scope.listarPerfis();
                }

                $scope.salvarPerfilLoading = false;
            };


            /**
             * Exclui um perfil.
             */
            $scope.cancelarPerfil = function() {

                if ($scope.objPerfil.prf_cod_prf == null) {

                    $scope.novoPerfil();

                } else {

                    var codPerfil = parseInt($scope.objPerfil.prf_cod_prf);
                    if (codPerfil === 5192) {

                        GeralFactory.notify('warning', 'Atenção:', 'Caro usuário, este é o perfil principal e o mesmo não pode ser editado ou removido!');
                        return false;

                    } else {

                        GeralFactory.confirmar('Deseja remover o perfil escolhido?', function() {

                            var objeto = {prf_cod_prf : $scope.objPerfil.prf_cod_prf};
                            UsuarioService.perfil.cancelar(objeto, function(retorno) {
                                if (! retorno.records.error) {

                                    $scope.listarPerfis();
                                    $scope.novoPerfil();
                                }
                            });
                        });
                    }
                }
            };
        }
    ])

    .factory('Modulos', function() {
        return [{
            'nome' : 'Cliente',
            'id'   : '25'
        }, {
            'nome' : 'Produto',
            'id'   : '15'
        }, {
            'nome' : 'Orçamento',
            'id'   : '26'
        }, {
            'nome' : 'Devolução de Venda',
            'id'   : '27'
        }, {
            'nome' : 'Empresa',
            'id'   : '22'
        }, {
            'nome' : 'Agenda',
            'id'   : '23'
        }, {
            'nome' : 'NF-e',
            'id'   : '11'
        }, {
            'nome' : 'Financeiro',
            'id'   : '13'
        }, {
            'nome' : 'Fornecedor',
            'id'   : '14'
        }, {
            'nome' : 'Compra',
            'id'   : '16'
        }, {
            'nome' : 'Devolução de Compra',
            'id'   : '31'
        }, {
            'nome' : 'Outras Entradas',
            'id'   : '29'
        }, {
            'nome' : 'Outras Saídas',
            'id'   : '30'
        }, {
            'nome' : 'Agrupamento de Produtos',
            'id'   : '19'
        }, {
            'nome' : 'Parâmetros',
            'id'   : '18'
        }, {
            'nome' : 'Categorização (Marcações)',
            'id'   : '20'
        }, {
            'nome' : 'Cupons de Desconto',
            'id'   : '21'
        }, {
            'nome' : 'Relatórios',
            'id'   : '24'
        }, {
            'nome' : 'Usuários',
            'id'   : '35'
        }, {
            'nome' : 'Prestação de Serviços',
              'id' : '34'
        }, {
            'nome' : 'Loja Virtual',
            'id'   : '17'
        }, {
            'nome' : 'Dashboard Financeiro',
            'id'   : '36'
        }, {
            'nome' : 'Perfis',
            'id'   : '38'
        }, {
            'nome' : 'Transportadora',
            'id'   : '43'
        }, {
            'nome' : 'Fiscal',
            'id'   : '40'
        }, {
            'nome' : 'Transporte',
            'id'   : '48'
        }, {
            'nome' : 'Meu Plano',
            'id'   : '54'
        }, {
            'nome' : 'Entrada para Produção',
            'id'   : '55'
        }, {
            'nome' : 'Saída de Insumos',
            'id'   : '56'
        }, {
            'nome' : 'Exportar Dados',
            'id'   : '58'
        }, {
            'nome' : 'Sintegra/Sped',
            'id'   : '59'
        }];
    });
