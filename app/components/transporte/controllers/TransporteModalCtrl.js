angular.module('newApp').controller('TransporteModalVeiculoCtrl', [

    '$scope', '$rootScope', '$uibModal', '$uibModalInstance', '$timeout', 'clipboard', 'GeralFactory', 'TransporteService', 'EndGeralService',

    function($scope, $rootScope, $uibModal, $uibModalInstance, $timeout, clipboard, GeralFactory, TransporteService, EndGeralService) {

        $uibModalInstance.opened.then(function() {

            $scope.veiculo = {};

            $scope.submitted            = false;
            $scope.salvarVeiculoLoading = false;

            if($scope.params.vei_cod_vei) {

                $scope.veiculo.vei_cod_vei = $scope.params.vei_cod_vei;

                $timeout(function () {

                    $scope.getVeiculo();
                });
            }

            $scope.veiculo.vei_tipo_prop            = 'T';
            $scope.veiculo.vei_cad_cod_proprietario = $scope.params.cad_cod_cad;

            $scope.veiculo.vei_tipo_veic_cte = 0;
            $scope.veiculo.vei_tipo_rodado   = 0;
            $scope.veiculo.vei_tipo_carroc   = 0;

            console.log('tá nela!', $scope.params);

            $scope.listaUfs();
            $scope.listaTpVeic();
            $scope.listaTpRodado();
            $scope.listaTpCarroceria();
        });

        $scope.listaUfs = function () {

            $scope.salvarVeiculoLoading = true;

            EndGeralService.ufs.get({}, function(retorno) {

                $scope.arrUF = retorno.records;
                $scope.salvarVeiculoLoading = false;
            });
        };

        $scope.listaTpVeic = function () {

            $scope.arrTpVeic = [{
                id   :  0,
                nome : 'Tração'
            }, {
                id   :  1,
                nome : 'Reboque'
            }];
        };

        $scope.listaTpRodado = function () {

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
        };

        $scope.listaTpCarroceria = function () {

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
         * Salva o cadastro do veículo
         */
        $scope.salvarVeiculo = function () {

            $scope.salvarVeiculoLoading = true;

            console.log('$scope.veiculo', $scope.veiculo);

            var placa = ($scope.veiculo.vei_placa) ? $scope.veiculo.vei_placa.toUpperCase() : '';
            if (placa && !placa.match(/[A-Z]{3}[0-9]{4}$/)) {

                GeralFactory.notify('danger', 'Atenção:', 'A placa está no formato inválido!');
                $scope.salvarVeiculoLoading = false;

            } else {

                $scope.$watch('forms.formsVeiculo', function(form) {

                    if (form) {

                        console.log('adasdas', form.$invalid);

                        if (form.$invalid) {

                            console.log('inválido');
                            $scope.submitted = true;

                            $scope.salvarVeiculoLoading = false;
                        } else {

                            $scope.submitted = false;


                            TransporteService.veiculos.create($scope.veiculo, function (retorno) {

                                console.log('retorno', retorno);

                                if(!retorno.records.error) {

                                    GeralFactory.notify('success', 'Sucesso!', retorno.records.msg);

                                    $scope.fecharModal('reload');

                                    $scope.salvarVeiculoLoading = false;

                                } else {

                                    GeralFactory.notify('danger', 'Erro!', retorno.records.msg);

                                    $scope.salvarVeiculoLoading = false;
                                }

                            });
                        }
                    }
                });
            }
        };

        /**
         * Busca um veículo passando o código do mesmo.
         */
        $scope.getVeiculo = function () {

            if($scope.veiculo.vei_cod_vei && $scope.veiculo.vei_cad_cod_proprietario){

                TransporteService.veiculos.get({u : $scope.veiculo.vei_cod_vei}, function (retorno) {

                    console.log('retorno', retorno);

                    if(!retorno.records.error) {

                        $scope.veiculo = retorno.records;
                    } else {

                        GeralFactory.notify('danger', 'Erro!', retorno.records.msg);
                    }
                });
            }
        };

        /**
         * Cancela um registro no banco de dados
         */
        $scope.cancelarVeiculo = function () {

            GeralFactory.confirmar('Deseja remover este veículo?', function() {

                var objeto = {
                    vei_cod_vei : $scope.veiculo.vei_cod_vei
                };

                TransporteService.veiculos.cancelar(objeto, function (resposta) {

                    console.log('resposta', resposta);

                    if (resposta.records) {
                        $scope.fecharModal('reload');
                    }
                });
            });

        };

        /**
         * Efeuta o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
        
    }
]);

angular.module('newApp').controller('TransporteCceModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'GeralFactory', 'TransporteService', 'prompt',

    function($scope, $rootScope, $timeout, $uibModalInstance, GeralFactory, TransporteService, prompt) {

        $scope.forms          = {};
        $scope.objModal       = {};
        $scope.cce = {};
        $scope.cce.obs_descricao = '';

        $uibModalInstance.opened.then(function() {

            $uibModalInstance.hasAlteracao = false;
            $scope.salvarCceLoading        = false;

            if($scope.params.obs_seq) {

                var strFiltro = GeralFactory.formatarPesquisar({
                    'str_obs' : $scope.params.fin_nro_lan+'|57|'+$scope.params.obs_seq
                });

                TransporteService.freteObs.get({fin_nro_lan:$scope.params.fin_nro_lan,u : strFiltro}, function(resposta) {

                    $scope.cce = resposta.records;
                });
            }

            $scope.getCamposCorrigir();
        });

        $scope.getCamposCorrigir = function () {

            $scope.arrCamposCorrigir = GeralFactory.listarCamposCceCte();
            $scope.cce.campoCorrigir = $scope.arrCamposCorrigir[0].campo;
        };

        /**
         */
        $scope.clicarBotaoModal = function(str) {

            $uibModalInstance.dismiss(str);
        };

        $scope.salvarCteCce = function() {

            $scope.salvarCceLoading = true;

            $scope.$watch('forms.fCteCce', function(form) {

                if (form) {

                    if (form.$invalid) {

                        $scope.submitted = true;

                    } else {

                        $scope.cce.obs_tip = 57;
                        $scope.cce.obs_fin_nro_lan = $scope.params.fin_nro_lan;

                        if($scope.params.obs_seq) {
                            $scope.cce.obs_seq = $scope.params.obs_seq;
                        }

                        TransporteService.fretesObs.create($scope.cce, function(resposta) {

                            console.log('resposta vale: ', resposta);
                            $scope.cce.obs_seq = resposta.records.obs_seq;
                            TransporteService.cte.enviarCce($scope.cce, function(r) {

                                var opcoesBotoes = [
                                    {label  : 'Ok',cancel : false,class  : 'btn-primary',value : '1'}
                                ];

                                prompt({
                                    title      : r.records.title,
                                    message    : r.records.msg,
                                    buttons    : opcoesBotoes
                                }).then(function(result) {

                                    $uibModalInstance.dismiss('reload');

                                }, function() {
                                });

                                $scope.salvarCceLoading = false;
                            });
                        });
                    }
                }
            });

        };

        $scope.incluirCampo = function(id) {

            console.log('$scope.cce.campoCorrigir', $scope.cce.campoCorrigir);

            if(!$scope.cce.campoCorrigir) {

                GeralFactory.notify('danger', 'Erro!', 'Informe o campo a ser corrigido!');
                return;
            }

            var descriaco = ($scope.cce.obs_descricao != '') ? $scope.cce.obs_descricao + "\r\n" : '';

            $scope.cce.obs_descricao = descriaco + '|Corrigir ' + $scope.cce.campoCorrigir + ' para: ';
        };

        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);

angular.module('newApp').controller('TransporteModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'GeralFactory', 'TransporteService',

    function($scope, $rootScope, $timeout, $uibModalInstance, GeralFactory, TransporteService) {

        $scope.forms          = {};
        $scope.objModal       = {};

        $uibModalInstance.opened.then(function() {

            $uibModalInstance.hasAlteracao = false;

        });

        /**
         * Inutilizar o CTe
         */
        $scope.inutilizarCte = function() {

            $scope.salvarFreteLoading = true;

            GeralFactory.confirmar('Deseja prossegior com a inutilização?', function () {
                if ($scope.params.cte_fin_nro_lan) {

                    var obj = {
                        'cte_fin_nro_lan' : $scope.params.cte_fin_nro_lan
                    };

                    $scope.salvarfreteLoading = true;

                    TransporteService.cte.inutilizarCTe(obj, function(retorno) {

                        $scope.retornoEnvioCte(retorno);

                    });
                }
            });
        };

        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);