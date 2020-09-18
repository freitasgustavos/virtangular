/**
 */
'use strict';

angular.module('newApp')


    .controller('MeuPerfilCtrl', [

        '$scope', '$rootScope', '$uibModal', '$timeout', 'UsuarioService', 'GeralFactory', 'Wizard',

        function ($scope, $rootScope, $uibModal, $timeout, UsuarioService, GeralFactory, Wizard) {
            $rootScope.hasAutorizacao();

            $scope.$on('$viewContentLoaded', function () {

                $scope.forms = {};
                $scope.salvarAlterarSenhaLoading = false;
                $scope.meuPerfil = {};

                $timeout(function () {
                    Wizard.loadWizards.initialize(38);
                }, 2000);
            });


            /**
             *
             */
            $scope.salvarAlterarSenha = function () {

                if($scope.meuPerfil.usu_nova_senha != $scope.meuPerfil.usu_repetir_nova_senha) {
                    GeralFactory.notify('warning', 'Erro!', 'A nova senha e a repetição de senha devem ser iguais.');
                    return false;
                }

                $scope.salvarAlterarSenhaLoading = true;

                var form = $scope.forms.formAlterarSenha;

                if (form.$invalid) {

                    $scope.submitted = true;
                    $scope.salvarAlterarSenhaLoading = false;

                } else {

                    UsuarioService.usuario.alterarSenhaUsuario($scope.meuPerfil, function (resposta) {

                        $scope.forms.formAlterarSenha.$setPristine();

                        if (!resposta.records.error) {

                            $scope.meuPerfil = {};
                            //$scope.getEmpresa();

                        }

                        $scope.salvarAlterarSenhaLoading = false;

                    });
                }

            };
        }

    ]);

