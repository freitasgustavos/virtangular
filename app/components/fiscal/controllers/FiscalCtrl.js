'use strict';

angular.module('newApp')

    .controller('FiscalCtrl', [

        '$scope', '$rootScope', '$uibModal', '$timeout', '$window', '$routeParams', '$interval', 'FiscalService', 'MidiaService', 'GeralFactory', 'AuthTokenFactory', 'Wizard',

        function ($scope, $rootScope, $uibModal, $timeout, $window, $routeParams, $interval, FiscalService, MidiaService, GeralFactory, AuthTokenFactory, Wizard) {
            $rootScope.hasAutorizacao();

            var _namespace = 'SPED_VARS';

            $scope.fiscalGerarSintegraLoading = false;
            $scope.fiscalExportaXMLLoading    = false;
            $scope.spedLoadding = false;

            $scope.sintegra = {};
            $scope.sintegra.dataProcessamento = '';
            $scope.sintegra.finalidadeArquivo = 1;
            $scope.sintegra.inventario        = 0;
            $scope.sintegra.dataInventario    = '';
            $scope.sintegra.tipo_arqivo       = 'A';

            $scope.arrTipoArquivoSintegra = [{
                'id'    : 'A',
                'label' : 'Notas Fiscais'
            }
            //     ,{
            //     'id'    : 'B',
            //     'label' : 'Cupons Fiscais'
            // },{
            //     'id'    : 'C',
            //     'label' : 'Geral'
            // }
            ];

            $scope.submitted = false;

            $scope.sped = {};
            $scope.sped.dataProcessamento = '';
            $scope.sped.finalidadeArquivo = 1;
            $scope.sped.inventario        = 0;
            $scope.sped.dataInventario    = '';
            $scope.sped.perfil            = 'A';

            $scope.objFiltroContador      = {'cad_tip_cli_for' : '1|2', 'cad_pf_pj' : '1'};
            $scope.objFiltroContabilidade = {'cad_tip_cli_for' : '2', 'cad_pf_pj' : '2'};

            $scope.exportarXML             = {};
            $scope.exportarXML.periodo     = '';
            $scope.exportarXML.exporta_pdf = false;

            $scope.$on('$viewContentLoaded', function () {

                // Variável que controla as abas para tela:
                $scope.tab = $routeParams.aba ? parseInt($routeParams.aba) : 1;

                //no caso do sped ter sido gerado alguma vez, pega os dados armazenados em storage
                $scope.getStoredVars();

                //inicia o campo com o mês anterior para geração do arquivo
                $scope.setaDataProcessamento(1);

                $timeout(function () {
                    Wizard.loadWizards.initialize(40);
                }, 2000);
            });

            /**
             * Seta o período mes/ano para a geração do arquivo
             * @param aux
             */
            $scope.setaDataProcessamento = function (aux) {

                var date = new Date();
                var mes = date.getMonth();


                if(aux === 1){

                    mes = (mes == 0) ? 11 : mes -1;
                }

                var meses = [
                    'Janeiro',
                    'Fevereiro',
                    'Março',
                    'Abril',
                    'Maio',
                    'Junho',
                    'Julho',
                    'Agosto',
                    'Setembro',
                    'Outubro',
                    'Novembro',
                    'Dezembro'
                ];

                var periodo = meses[mes] +'-'+ ((mes == 11) ? date.getFullYear() -1 : date.getFullYear());

                $scope.sintegra.dataProcessamento = periodo;
                $scope.sped.dataProcessamento     = periodo;
                $scope.exportarXML.periodo        = periodo;
            };

            /**
             * Prepara para a geração do sintegra
             */
            $scope.preparaGerarSintegra = function () {

                delete $scope.logError;

                //caso a data esteja vazia, seta novamente o valor
                if(!$scope.sintegra.dataProcessamento){

                    $scope.setaDataProcessamento(1);
                }

                if($scope.sintegra.inventario) {

                    var scope = $rootScope.$new();

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'fiscal/views/janela-data-inventario.html',
                        controller  : 'FiscalModalCtrl',
                        size        : 'md',
                        windowClass : 'center-modal no-top-modal',
                        scope       :  scope,
                        resolve     :  {}
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'ok') {

                            $scope.sintegra.dataInventario = modalInstance.dataInventario;
                            $scope.gerarSintegra();
                        }
                    });
                } else {

                    $scope.gerarSintegra();
                }
            };

            /**
             * Aciona a API para gerar o arquivo
             */
            $scope.gerarSintegra = function () {

                $scope.fiscalGerarSintegraLoading = true;

                var strFiltro = GeralFactory.formatarPesquisar({
                    'data'            : $scope.sintegra.dataProcessamento,
                    'finalidade'      : $scope.sintegra.finalidadeArquivo,
                    'inventario'      : $scope.sintegra.inventario,
                    'data_inventario' : $scope.sintegra.dataInventario,
                    'tipo_arqivo'     : $scope.sintegra.tipo_arqivo
                });

                FiscalService.sintegra.get({u: strFiltro}, function (data) {

                    if (!data.records.error) {

                        var strFiltro = GeralFactory.formatarPesquisar({
                            'file_path': data.records.file,
                            'ken': AuthTokenFactory.getToken()
                        });

                        var objBaixarSintegra = {};

                        objBaixarSintegra = {
                            'url': GeralFactory.getUrlApi() + '/erp/export/sintegra/download/?' + strFiltro,
                            'titulo': 'Recibo de Receita'
                        };

                        $timeout(function () {
                            $window.open(objBaixarSintegra.url, objBaixarSintegra.titulo);
                        }, 50);

                        if(data.records.msg.constructor === Array) {

                            GeralFactory.notify('danger', 'Erro!', 'Error ao gerar sintegra, verifique os erros citados abaixo e corrija-os!');

                            $scope.logError = data.records.msg;

                        } else {

                            GeralFactory.notify('success', 'Sucesso!', 'Arquivo gerado com sucesso!');
                        }

                        $scope.fiscalGerarSintegraLoading = false;
                    } else {

                        if(data.records.msg.constructor === Array) {

                            GeralFactory.notify('danger', 'Erro!', 'Error ao gerar sintegra, verifique os erros citados abaixo e corrija-os!');

                            $scope.logError = data.records.msg;

                        } else {

                            GeralFactory.notify('danger', data.records.title, data.records.msg);
                        }

                        $scope.fiscalGerarSintegraLoading = false;
                    }
                })
            };

            /**
             * Aciona a API para gerar o arquivo
             */
            $scope.exportaXML = function () {

                $scope.fiscalExportaXMLLoading = true;

                var strFiltro = {
                    'data'        : $scope.exportarXML.periodo,
                    'exporta_pdf' : $scope.exportarXML.exporta_pdf
                };

                strFiltro = GeralFactory.formatarPesquisar(strFiltro);

                FiscalService.exporta_xml.get({u: strFiltro}, function (data) {

                    if (!data.records.error) {

                        var objFiltro = {
                            'file_path'    : data.records.file_path,
                            'ken'          : AuthTokenFactory.getToken()
                        };

                        var url = GeralFactory.getUrlApi() + '/sistema/fiscal/baixar-zip/?' + GeralFactory.formatarPesquisar(objFiltro);
                        $window.open(url, 'ZIP');

                        GeralFactory.notify('success', 'Sucesso!', 'Arquivo gerado com sucesso!');

                        $scope.fiscalExportaXMLLoading = false;
                    } else {

                        GeralFactory.notify('danger', data.records.title, data.records.msg);
                        $scope.fiscalExportaXMLLoading = false;
                    }

                })
            };

            /* FUNÇÕES PARA O SPED EFD */


            $scope.onSelectContador = function (obj) {

                $scope.sped.cad_nome_razao = (obj.cad_nome_razao) ? obj.cad_nome_razao : obj.cad_nome_fantasia;
                $scope.sped.cad_cod_cad    = obj.cad_cod_cad;
            };

            $scope.onSelectContabilidade = function (obj) {

                $scope.sped.contabilidade_cad_nome_razao = (obj.cad_nome_razao) ? obj.cad_nome_razao : obj.cad_nome_fantasia;
                $scope.sped.contabilidade_cad_cod_cad    = obj.cad_cod_cad;
            };

            $scope.preparaGerarSped = function () {

                delete $scope.logError;

                //caso a data esteja vazia, seta novamente o valor
                if(!$scope.sped.dataProcessamento){

                    $scope.setaDataProcessamento(1);
                }

                if($scope.sped.inventario) {

                    var scope = $rootScope.$new();

                    var modalInstance = $uibModal.open({
                        animation   :  true,
                        templateUrl : 'fiscal/views/janela-data-inventario.html',
                        controller  : 'FiscalModalCtrl',
                        size        : 'md',
                        windowClass : 'center-modal no-top-modal',
                        scope       :  scope,
                        resolve     :  {}
                    });

                    modalInstance.result.then(function(id) { }, function(msg) {
                        if (msg === 'ok') {

                            $scope.sped.dataInventario = modalInstance.dataInventario;
                            $scope.gerarSped();
                        }
                    });
                } else {

                    $scope.gerarSped();
                }
            };

            /* ARMAZENA OS PARAMETROS PARA A GERAÇÃO DO SPED NA STORAGE */
            $scope.storeSpedVars = function (objeto) {

                window.localStorage.setItem(_namespace, JSON.stringify(objeto));
            };

            /* PEGA OS PARAMETROS DO SPED ARMAZENADOS NA STORAGE */
            $scope.getStoredVars = function () {

                var objeto = window.localStorage.getItem(_namespace);

                if(objeto) {

                    $scope.sped = JSON.parse(objeto);
                    return true;
                }

                return false;
            };

            /**
             * Aciona a API para gerar o arquivo
             */
            $scope.gerarSped = function () {

                var objPesquisar = {
                    'data'            : $scope.sped.dataProcessamento,
                    'finalidade'      : $scope.sped.finalidadeArquivo,
                    'inventario'      : $scope.sped.inventario,
                    'data_inventario' : $scope.sped.dataInventario,
                    'perfil'          : $scope.sped.perfil
                };

                if($scope.sped.cad_cod_cad) {

                    objPesquisar.cod_contador = $scope.sped.cad_cod_cad;
                    objPesquisar.contador_crc = $scope.sped.contador_crc;
                }

                if($scope.sped.contabilidade_cad_cod_cad) {

                    objPesquisar.cod_contabilidade = $scope.sped.contabilidade_cad_cod_cad;
                }

                var strFiltro = GeralFactory.formatarPesquisar(objPesquisar);

                $scope.storeSpedVars($scope.sped);

                $scope.spedLoadding = true;

                FiscalService.sped.get({u: strFiltro}, function (data) {

                    console.log('data', data);

                    if (!data.records.error) {

                        var strFiltro = GeralFactory.formatarPesquisar({
                            'file_path': data.records.file,
                            'ken': AuthTokenFactory.getToken()
                        });

                        var objBaixarsped = {};

                        objBaixarsped = {
                            'url': GeralFactory.getUrlApi() + '/erp/export/sintegra/download/?' + strFiltro,
                            'titulo': 'Sped Fiscal'
                        };

                        $timeout(function () {
                            $window.open(objBaixarsped.url, objBaixarsped.titulo);
                        }, 50);

                        // if(data.records.msg.constructor === Array) {
                        //
                        //     GeralFactory.notify('danger', 'Erro!', 'Error ao gerar sped, verifique os erros citados abaixo e corrija-os!');
                        //
                        //     $scope.logError = data.records.msg;
                        //
                        // } else {

                            GeralFactory.notify('success', 'Sucesso!', 'Arquivo gerado com sucesso!');
                        // }

                        $scope.spedLoadding = false;
                    } else {

                        // if(data.records.msg.constructor === Array) {
                        //
                        //     GeralFactory.notify('danger', 'Erro!', 'Error ao gerar sped, verifique os erros citados abaixo e corrija-os!');
                        //
                        //     $scope.logError = data.records.msg;
                        //
                        // } else {

                            GeralFactory.notify('danger', data.records.title, data.records.msg);
                        // }

                        $scope.spedLoadding = false;
                    }
                })
            };

        }
    ]);