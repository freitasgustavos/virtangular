'use strict';

angular.module('newApp')

    .controller('UsuarioCtrl', [

        '$scope', '$rootScope', '$uibModal', '$timeout', 'UsuarioService', 'ParamsService', 'GeralFactory', 'Constantes', '$location', 'Wizard',

        function ($scope, $rootScope, $uibModal, $timeout, UsuarioService, ParamsService, GeralFactory, Constantes, $location, Wizard) {

            $rootScope.hasAutorizacao();

            if (! $rootScope.getPermissao('35')) {
                $location.path('/');
            }

            /**
             * $scope.perfis = [
             *      {cod : '2112', nome : 'Admin' }
             * ];
             */

            $scope.$on('$viewContentLoaded', function() {

                $scope.usuario   = {};
                $scope.objFiltro = {
                    texto_usuario : ''
                };

                $scope.usuarios    = [];
                $scope.perfis      = [];
                $scope.arrVendedor = [];
                $scope.nomeBotao   = 'Cancelar';

                $scope.listarUsuarios();
                $scope.listarComponentes();

                $scope.flagTutorial  =  true;
                $scope.siglaTutorial = 'USU';
                $scope.labelTutorial = 'Cadastro de novos usuários';

                $timeout(function () {
                    Wizard.loadWizards.initialize(35);
                }, 2000);
            });

            /**
             * Retorna os perfis existentes.salva
             */
            $scope.listarComponentes = function() {

                UsuarioService.perfis.get({u : ''}, function(retorno) {
                    if (! _.isEmpty(retorno.records.arr_perfis)) {

                        var arrPerfis = retorno.records.arr_perfis;

                        $scope.perfis = arrPerfis;
                        $scope.perfis.unshift(retorno.records.arr_admin);
                    }
                });

                ParamsService.vendedores.get({u : ''}, function(retorno) {
                    if (! _.isEmpty(retorno.records)) {
                        $scope.arrVendedor = retorno.records;
                    }
                });
            };

            /**
             * Limpa o formulário de usuário e prepara para cadastrar um novo usuário.
             */
            $scope.novoUsuario = function() {

                $scope.forms.formUsuario.$setPristine();
                $scope.usuario      =  {};
                $scope.nomeBotao    = 'Cancelar';
                $scope.flagTutorial =  false;
            };

            /**
             * Retorna uma lista de usuários baseado no filtro utilizado pelo usuário por demanda.
             */
            $scope.getPesquisar = function() {

                if (! GeralFactory.inArray(event.which, Constantes.KEYS)) {
                    $timeout(function() {
                        $scope.listarUsuarios();
                    }, 500);
                }
            };

            /**
             * Método responsável em listar os usuários de aplicação por demanda.
             */
            $scope.listarUsuarios = function() {

                $rootScope.spinnerList.on();
                $scope.usuarios = [];

                var objFiltro = $scope.getObjFiltro();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=0');

                UsuarioService.usuarios.get({u : strFiltro}, function(retorno) {
                    if (retorno.records.length > 0) {

                        $timeout(function() {
                            $scope.usuarios = retorno.records;
                            $rootScope.spinnerList.off();
                        });
                    } else {

                        $rootScope.spinnerList.off();
                    }
                });
            };

            /**
             * Método responsável efetuar a paginação dos usuários.
             */
            $scope.paginarUsuarios = function() {

                $rootScope.spinnerList.on();

                var objFiltro = $scope.getObjFiltro();
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + Constantes.LIMIT + '&offset=' + $scope.getOffset());

                console.log('Filtro utilizado na paginação: ', strFiltro);
                UsuarioService.usuarios.get({u : strFiltro}, function(retorno) {
                    if (retorno.records.length > 0) {

                        angular.forEach(retorno.records, function(item) {
                            $scope.usuarios.push(item);
                        });

                        $timeout(function() {
                            $rootScope.spinnerList.off();
                        });
                    } else {

                        $rootScope.spinnerList.off();
                        GeralFactory.notify('warning', 'Atenção:', 'Caro usuário, a listagem de usuários já se encontra completa!');
                    }
                });
            };

            /**
             * Retorna o limite de registros para a paginação.
             */
            $scope.getOffset = function() {

                return ($scope.usuarios.length) ? $scope.usuarios.length : 0;
            };

            /**
             * Método responsável em retornar o objeto contendo o filtro aplicado pelo usuário.
             */
            $scope.getObjFiltro = function() {

                var objFiltro = {
                    'usu_nome' : GeralFactory.replaceArray($scope.objFiltro.texto_usuario, ['.', '/', '-'], '')
                };
                return objFiltro;
            };

            /**
             * Retorna os dados de um determinado usuário.
             */
            $scope.getUsuario = function(usu_cod_usu) {

                $scope.usuCodUsuSelected = usu_cod_usu;
                UsuarioService.usuario.get({usu_cod_usu : usu_cod_usu}, function(data) {

                    $scope.nomeBotao    = 'Excluir';
                    $scope.usuario      =  data.records;
                    $scope.flagTutorial =  false;

                    $scope.usuario.usu_status_ativo_aux = $scope.usuario.usu_status_ativo == 1;
                    $scope.usuario.usu_email_antigo = data.records.usu_email;

                    delete $scope.usuario.usu_senha;
                    $scope.forms.formUsuario.$setPristine();

                    // Recolhendo a imagem mais recente do usuário:
                    $scope.usuario.imagem_atual = null;
                    if ($scope.usuario.usuario_imagem.length) {

                        var qtdeImagens = $scope.usuario.usuario_imagem.length;
                        $scope.usuario.imagem_atual = $scope.usuario.usuario_imagem[qtdeImagens - 1];
                    }
                });
            };

            /**
             * Exclui um usuário ou cancela a inclusão do mesmo.
             */
            $scope.cancelarUsuario = function() {

                if ($scope.usuario.usu_cod_usu == null) {

                    $scope.novoUsuario();

                } else {

                    if ($scope.usuario.usu_eh_proprietario === 1) {

                        var mensagem = 'Atenção, pois o usuário principal da aplicação não se pode remover!';
                        GeralFactory.notify('warning', 'Atenção', mensagem);

                    } else {

                        GeralFactory.confirmar('Deseja remover o usuário escolhido?', function() {

                            var objeto = {usu_cod_usu : $scope.usuario.usu_cod_usu};
                            UsuarioService.usuario.cancelar(objeto, function(retorno) {

                                $scope.novoUsuario();
                                $scope.getPesquisar();
                            });
                        });
                    }
                }
            };

            /**
             * Insere ou atualiza um registro de usuário.
             */
            $scope.salvarUsuario = function() {

                $scope.salvarUsuarioLoading = true;

                var form = $scope.forms.formUsuario;
                if (form.$invalid) {

                    $scope.submitted = true;
                    $scope.salvarUsuarioLoading = false;

                } else {

                    $scope.usuario.usu_ativo_wizard = 0;
                    $scope.usuario.usu_status_ativo = ($scope.usuario.usu_status_ativo_aux) ? 1 : 0;

                    if ($scope.usuario.usu_cod_usu) {

                        UsuarioService.usuario.update($scope.usuario, function (resposta) {
                            if (! resposta.records.error) {
                                $scope.listarUsuarios();
                                $scope.getUsuario($scope.usuario.usu_cod_usu);

                                // if ($scope.usuario.usu_ativo_wizard)
                                //    GeralFactory.notify('info', 'Atenção!', 'Faça login novamente para ativar o passo-a-passo!');
                            }

                            $scope.salvarUsuarioLoading = false;
                        });
                    } else {

                        UsuarioService.usuarios.create($scope.usuario, function (resposta) {

                            if (! resposta.records.error) {
                                $scope.listarUsuarios();
                                $scope.getUsuario(resposta.records.usu_cod_usu);
                            }

                            $scope.salvarUsuarioLoading = false;
                        });
                    }
                }
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

                abaSelecionada === 0 ? $scope.flagTutorial = true : $scope.setAbaInicial(abaSelecionada);
            };

            /**
             * Método responsável em abrir a janela modal contedo o formulário de upload
             * para foto dos usuários.
             */
            $scope.getFormUpload = function(usu_cod_usu) {

                if (usu_cod_usu) {

                    var scope = $rootScope.$new();
                    scope.params = {};

                    scope.params.imagem_atual = $scope.usuario.imagem_atual;
                    scope.params.usu_cod_usu  = usu_cod_usu;

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'usuario/views/aba-usuario-upload.html',
                        controller  : 'UsuarioModalUploadCtrl',
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

                                $scope.getPesquisar();
                                $scope.getUsuario(usu_cod_usu);
                            }
                        }
                    });
                } else {

                    GeralFactory.notify('warning', 'Atenção!', 'Caro usuário, primeiramente é necessário cadastrar um usuário!');
                }
            };
        }
    ]);

