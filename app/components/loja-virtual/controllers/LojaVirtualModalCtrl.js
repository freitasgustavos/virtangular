
angular.module('newApp').controller('LojaVirtualContatoModalCtrl', [

    '$scope', '$rootScope', '$modalInstance', 'LojaVirtualService', 'GeralFactory',

    function($scope, $rootScope, $modalInstance, LojaVirtualService, GeralFactory) {

        $modalInstance.opened.then(function() {

            $scope.contato = {};

            if ($scope.params.cto_cod_cto) {

                $scope.cto_cod_cto = $scope.params.cto_cod_cto;
                $scope.getContato($scope.params.cto_cod_cto);
            }
        });

        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };

        /**
         *
         */
        $scope.getContato = function(cto_cod_cto) {

            var objeto = {
                cto_cod_cto : cto_cod_cto
            };

            LojaVirtualService.contato.get(objeto, function(data) {

                $scope.contato = data.records;

                $scope.contato.cto_respondido = ($scope.contato.cto_respondido)?true:false;

                console.log('nnn>',$scope.contato);
            });
        };

        /**
         * Salva as informações da janela de contato
         */
        $scope.salvarContato = function() {

            $scope.salvarContatoLoading = true;

            $scope.$watch('forms.fLojaVirtualContato', function(form) {

                if (form) {

                    if (form.$invalid) {

                        $scope.submitted = true;

                    } else {

                        if ($scope.contato.cto_cod_cto) {

                            LojaVirtualService.contato.update($scope.contato, function(resposta) {

                                if (! resposta.records.error) {

                                    $modalInstance.dismiss('reload');
                                }

                                $scope.salvarContatoLoading = false;

                            });
                        }
                    }
                }
            });
        };

        /**
         * Método responsável em remover um determinado contato.
         */
        $scope.cancelarContato = function(cad_cod_cad, cto_cod_cto) {

            GeralFactory.confirmar('Deseja remover este contato?', function() {

                var objeto = {
                    cto_cod_cto : cto_cod_cto
                };
                LojaVirtualService.contato.cancelar(objeto, function(resposta) {

                    if (resposta.records) {

                        GeralFactory.notificar({data: resposta});
                        $modalInstance.dismiss('reload');
                    }
                });
            });
        };
    }
]);


angular.module('newApp').controller('LojaVirtualTemplateBannerModalCtrl', [

    '$scope', '$rootScope', '$modalInstance', 'LojaVirtualService', 'GeralFactory', 'MidiaService',

    function($scope, $rootScope, $modalInstance, LojaVirtualService, GeralFactory, MidiaService) {

        $scope.objBanner = {};

        $modalInstance.opened.then(function() {

            $scope.objBanner.mid_posicao  = $scope.params.mid_posicao;
            $scope.objBanner.mid_dimensao = $scope.params.mid_dimensao;
            $scope.objBanner.mid_tip_mid = 2;

            if ($scope.params.mid_nro) {

                $scope.objBanner.mid_nro = $scope.params.mid_nro;
                $scope.getMidia();
            }
        });

        /**
         * Método responsável em recolher todas as fotos de um
         * determinado cliente ou fornecedor.
         */
        $scope.getMidia = function() {

            $('#pic-file').fadeOut('slow');

            var str = 'q=(mid_tab:3,mid_nro:' + $scope.objBanner.mid_nro + ')';

            MidiaService.midias.get({u : str}, function(retorno) {
                if (retorno.records) {
                    $scope.flagBanner =  false;
                    $scope.btnBanner  = 'Excluir';
                    $scope.objBanner  =  retorno.records[0];

                    // Verificando a situação do banner:
                    $scope.objBanner.mid_status_aux = ($scope.objBanner.mid_status === 1) ? true : false;

                    // Formatando e ajustando o valor da posição do banner:
                    $scope.objBanner.mid_posicao  = (retorno.records[0].mid_posicao) ? retorno.records[0].mid_posicao.trim() : '';
                    $scope.objBanner.mid_dimensao = $scope.params.mid_dimensao;

                    if ($scope.objBanner.mid_id) {
                        $scope.objBanner.has_foto  = true;
                        $scope.objBanner.is_edicao = false;
                        $scope.flagBanner          = true;
                    }
                }
            });
        };

        /**
         * Método responsável em salvar os dados de um determinado banner.
         */
        $scope.salvarBanner = function(file, event) {

            $scope.salvarBannerLoading = true;

            // Em caso de atualização não é necessário verificar o arquivo:
            if ($scope.objBanner.mid_nro) {

                $scope.finalizarSalvarBanner(file);

            } else {

                // Em caso de inserção validar a escolha da imagem:
                if (($scope.flagBanner === false || file === undefined || file === null) && $scope.objBanner.mid_tip_mid === 2) {

                    $scope.salvarBannerLoading = false;
                    GeralFactory.notify('danger', 'Atenção!', 'Caro usuário, selecione ao menos uma imagem para efetuar o envio!');

                } else {

                    $scope.finalizarSalvarBanner(file);
                }
            }
        };

        /**
         * Método responsável em finalizar o processo de atualização ou inserção
         * dos dados de um determinado banner.
         */
        $scope.finalizarSalvarBanner = function(file) {

            // Verificando a validação do formulário:
            if ($scope.forms.formBanner.$error.url === undefined) {

                var objeto = {
                    mid_tab       : 3,
                    mid_status    : $scope.objBanner.mid_status_aux ? 1 : 0,
                    mid_ordem     : $scope.objBanner.mid_ordem,
                    mid_posicao   : $scope.objBanner.mid_posicao,
                    mid_link      : $scope.objBanner.mid_link,
                    mid_descricao : $scope.objBanner.mid_descricao,
                    mid_tip_mid   : $scope.objBanner.mid_tip_mid
                };

                // Caso seja atualização de um registro:
                if ($scope.objBanner.mid_nro) {

                    objeto.mid_nro   = $scope.objBanner.mid_nro;
                    objeto.is_edicao = $scope.objBanner.is_edicao;
                }

                MidiaService.upload(file, objeto, function(retorno) {
                    if (! retorno.records.error) {

                        GeralFactory.notify('success', 'Sucesso!', 'Os dados do banner foram salvos com sucesso!');

                    } else {

                        GeralFactory.notify('danger', 'Atenção!', retorno.records.msg);
                    }

                    $scope.salvarBannerLoading = false;
                    $scope.fecharModal('reload');
                });
            } else {

                $scope.salvarBannerLoading = false;
                GeralFactory.notify('warning', 'Atenção!', 'Caro usuário, entre com uma URL válida para o campo link!');
            }
        };

        /**
         * Método responsável em remover um determinado banner.
         */
        $scope.cancelarBanner = function() {

            if ($scope.objBanner.mid_nro === null) {

                $modalInstance.dismiss('reload');

            } else {

                GeralFactory.confirmar('Deseja remover o banner escolhido?', function() {

                    var objeto = {mid_nro : $scope.objBanner.mid_nro};
                    MidiaService.midia.remover(objeto, function(retorno) {

                        $modalInstance.dismiss('reload');
                    });
                });
            }
        };

        /**
         * Método responsável em inicializar o arquivo para Upload do banner.
         */
        $scope.setFile = function(file) {
            if (file) {
                $scope.flagBanner = true;

                // Verificando se o usuário esta editando o banner:
                var isEdicao = false;
                if ($scope.objBanner.mid_nro) {
                    isEdicao = true;
                }

                $scope.objBanner.is_edicao = isEdicao;
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