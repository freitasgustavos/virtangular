
angular.module('newApp').controller('UsuarioModalUploadCtrl', [

    '$scope', '$modalInstance', 'MidiaService', 'GeralFactory',

    function($scope, $modalInstance, MidiaService, GeralFactory) {

        $scope.foto = {};

        $modalInstance.opened.then(function() {

            $scope.foto.usu_cod_usu = $scope.params.usu_cod_usu;

            // Verificando a imagem mais atual do usuário:
            $scope.fotoAtual = $scope.params.imagem_atual;

            // Parâmetro que indica se alguma alteração foi efetuada:
            $modalInstance.hasAlteracao = false;
        });

        /**
         * Método responsável em recolher todas as fotos de um determinado usuário.
         */
        $scope.getMidia = function() {

            if ($scope.foto.usu_cod_usu) {

                var query = 'q=(mid_tab:9,mid_tab_cod:' + $scope.foto.usu_cod_usu + ')';
                MidiaService.midias.get({u : query}, function(retorno) {

                    $scope.fotoAtual = null;
                    if (retorno.records.length) {

                        var qtdeFotos = retorno.records.length;
                        $scope.fotoAtual = retorno.records[qtdeFotos - 1];
                    }
                });
            }
        };

        /**
         * Método responsável em efetuar o upload de uma nova foto para o usuário escolhido.
         */
        $scope.upload = function(file, event) {

            $scope.salvarFotoLoading = true;

            if (file === undefined || file === null) {

                GeralFactory.notify('warning', 'Atenção!', 'Caro usuário, selecione ao menos uma foto para efetuar o envio!');
                $scope.salvarFotoLoading = false;

            } else {

                if ($scope.foto.usu_cod_usu !== null) {

                    var objeto = {
                        mid_tab     :  9,
                        mid_status  :  1,
                        mid_posicao : '',
                        mid_link    : '',
                        mid_tab_cod : $scope.foto.usu_cod_usu
                    };

                    MidiaService.upload(file, objeto, function() {

                        $modalInstance.hasAlteracao = true;
                        GeralFactory.notify('success', 'Sucesso!', 'Foto cadastrada com sucesso!');

                        $scope.picFile           = null;
                        $scope.salvarFotoLoading = false;
                        $scope.getMidia();
                    });
                }
            }
        };

        /**
         * Efeuta o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };
    }
]);