angular.module('newApp').controller('AgrupamentoModalController', [

    '$scope', '$rootScope', '$sce', '$timeout', '$modalInstance', 'MidiaService', 'GeralFactory',

    function($scope, $rootScope, $sce, $timeout, $modalInstance, MidiaService, GeralFactory) {

        $scope.foto = {};
        $scope.foto.agp_hidden = true;

        $modalInstance.opened.then(function() {

            $scope.foto.entity      = $scope.params.entity;
            $scope.foto.agp_cod_agp = $scope.params.agp_cod_agp;

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

                if ($scope.foto.agp_cod_agp !== null) {

                    var objeto = {
                        mid_tab     :  8,
                        mid_status  :  1,
                        mid_posicao : '',
                        mid_link    : '',
                        mid_tab_cod : $scope.foto.agp_cod_agp
                    };



                    MidiaService.upload(file, objeto, function(ret) {

                        if(ret.records.error) {

                            GeralFactory.notify('danger', 'Erro!', ret.records.msg);
                        } else {
                            GeralFactory.notify('success', 'Sucesso!', 'Foto cadastrada com sucesso!');

                        }

                        var query = 'q=(mid_tab:8,mid_tab_cod:' + $scope.foto.agp_cod_agp + ')';
                        MidiaService.midias.get({u : query}, function(retorno) {
                            if (retorno.records.length) {
                                /**
                                 * $modalInstance.arrFotos = retorno.records;
                                 * $modalInstance.dismiss('reload');
                                 */

                                $scope.picFile = null;
                                $scope.foto.mensagem   = false;
                                $scope.foto.agp_hidden = true;

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

                $scope.foto.agp_hidden = false;

                /**
                 * $timeout(function() {
                 *    $scope.foto.agp_hidden = false;
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
