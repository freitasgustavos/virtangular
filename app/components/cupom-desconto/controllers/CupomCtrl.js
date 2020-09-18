'use strict';

angular.module('newApp')

    .controller('CupomCtrl', [

        '$scope', '$rootScope', '$sce', '$timeout', 'CupomService', 'GeralFactory', 'ClienteService',

        function ($scope, $rootScope, $sce, $timeout, CupomService, GeralFactory, ClienteService) {
            $rootScope.hasAutorizacao();

            if (! $rootScope.getPermissao('21')) {
                $location.path('/');
            }

            $scope.$on('$viewContentLoaded', function() {
                $scope.flagMsg  = false;
                $scope.salvarCupomLoading = false;
                $scope.nomeBotao   = 'Cancelar';
                $scope.cad_tip_cli_for = 1; //somente clientes

                $scope.cupom = {
                    clienteSelect : ''
                };

                $scope.pesquisaCupom = {
                    texto_cupom_pesquisar : ''
                };

                $scope.flagTutorial  =  true;
                $scope.siglaTutorial = 'CUP';
                $scope.labelTutorial = 'Cadastro de novos cupons';

                $scope.objFiltroCliente = {
                    cad_tip_cli_for : 1
                };

                $scope.arrCupom = [];
                $scope.reset();
            });

            /**
             * Objeto contendo os atributos para configuraçao do infinite scroll.
             */
            $scope.objInfiniteScroll  = {
                'limit'             : '200',
                'strFiltroAnterior' : '',
                'strFiltroInicial'  : 'limit=200&offset=0',
                'flagPesquisaBusy'  : false,
                'flagCupomBusy'     : false,
                'flagCupomAuxBusy'  : false,
                'flagLoadingBusy'   : false
            };

            /**
             * Método responsável em recolher o filtro da busca para listagem.
             */
            $scope.filtroPesquisarCupom = function() {
                return {
                    'texto_cupom_pesquisar' : $scope.pesquisaCupom.texto_cupom_pesquisar
                };
            };

            /**
             * Método responsável em retornar a lista contendo os cupons por demanda.
             */
            $scope.listarCupons = function() {

                $scope.flagMsg = false;
                $scope.objInfiniteScroll['flagLoadingBusy'] = true;

                var strFiltro, intUltimo;
                var objFiltro = $scope.filtroPesquisarCupom();

                // Quando chamado pela primeira vez, ou seja, ao abrir a tela de cupons:
                if ($scope.objInfiniteScroll.strFiltroAnterior === '') {

                    strFiltro = GeralFactory.formatarPesquisar(objFiltro, $scope.objInfiniteScroll['strFiltroInicial']);

                } else {

                    intUltimo = $scope.arrCupom.length > 0 ? $scope.arrCupom.length : 0;
                    strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + $scope.objInfiniteScroll.limit + '&offset=' + intUltimo);
                }

                // Verifica se já existe uma requisição para a listagem ou consulta o andamento de algum cupom para prosseguir:
                if ($scope.objInfiniteScroll.flagCupomAuxBusy) {
                    return;
                }

                $scope.objInfiniteScroll['strFiltroAnterior'] = strFiltro;
                $scope.objInfiniteScroll['flagCupomAuxBusy']  = true;

                $timeout(function() {

                    CupomService.buscaCupons.get({u : strFiltro}, function(retorno) {
                        var flagMsg = true;
                        if (retorno.records.length > 0) {

                            flagMsg = false;
                            angular.forEach(retorno.records, function(item) {

                                // Empilhando os demais resultados da consulta:
                                $scope.arrCupom.push(item);
                            });
                        }

                        $scope.flagMsg = flagMsg;
                        $scope.objInfiniteScroll['flagCupomBusy']    = flagMsg;
                        $scope.objInfiniteScroll['flagLoadingBusy']  = false;
                        $scope.objInfiniteScroll['flagCupomAuxBusy'] = false;
                    });

                }, 1500);
            };

            /**
             * Método responsável em efetuar a busca dos cupons por demanda de acordo com
             * o filtro utilizado pelo usuário da aplicação.
             */
            $scope.getPesquisar = function() {

                $scope.flagMsg = false;
                $scope.objInfiniteScroll['flagCupomBusy']   = true;
                $scope.objInfiniteScroll['flagLoadingBusy'] = true;

                $timeout(function() {

                    var objFiltro = $scope.filtroPesquisarCupom();

                    var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'limit=' + $scope.objInfiniteScroll.limit + '&offset=0');
                    if ($scope.objInfiniteScroll.flagPesquisaBusy) {
                        return;
                    }

                    $scope.objInfiniteScroll['flagPesquisaBusy'] = true;
                    CupomService.buscaCupons.get({u : strFiltro}, function(retorno) {

                        $scope.arrCupom = retorno.records;

                        $scope.objInfiniteScroll['flagPesquisaBusy'] = false;
                        $scope.objInfiniteScroll['flagCupomBusy']    = false;

                        $scope.flagMsg = _.isEmpty($scope.arrCupom) ? true : false;
                        $scope.objInfiniteScroll['flagLoadingBusy'] = false;
                    });

                }, 1000);
            };

            /**
             * Retorna um registro do cupom
             */
            $scope.getCupom = function(cup_nro_cup) {

                $scope.cupCodCupSelected = cup_nro_cup;

                CupomService.cupons.get({u : $scope.cupCodCupSelected}, function(retorno) {

                    $scope.nomeBotao = 'Excluir';

                    $scope.cupom = retorno.records;
                    $scope.flagTutorial = false;

                    if($scope.cupom.cup_cad_cod_cad){

                        $scope.getCliente($scope.cupom.cup_cad_cod_cad);
                    }
                });
            };

            /**
             *
             */
            $scope.reset = function () {
                $scope.cupom = {
                    cup_vlr_desconto  : 0,
                    cup_perc_desconto : 0,
                    clienteSelect     : ''
                };
            };

            /**
             * Seta para aba principal ficar ativa
             */
            $scope.setAbaInicial = function() {

                $scope.tabs = [{active: true}];
            };

            /**
             * Prepara o formulário para um novo registro
             */
            $scope.novoCupom = function () {

                $scope.flagTutorial = false;
                $scope.forms.formCupom.$setPristine();
                $scope.reset();
                $scope.setAbaInicial();
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
                abaSelecionada === 0 ? $scope.flagTutorial = true : $scope.setAbaInicial();
            };

            /**
             * Lista os clientes para vinculação.
             */
            $scope.listarCliente = function(nome) {

                nome = nome.trim();

                var objFiltro = {
                    'cad_nome_razao'  : nome,
                    'cad_tip_cli_for' : $scope.cad_tip_cli_for
                };
                var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                return ClienteService.clientes.get({u : strFiltro}).$promise.then(function(resposta) {

                    resposta.records.push({
                        id             : '1#1',
                        nome_real      :  nome,
                        cad_nome_razao : 'Adicionar cliente ' + nome
                    });
                    return resposta.records;
                });
            };

            /**
             * Ao escolher algum cliente.
             */
            $scope.onSelectCliente = function($item) {

                $scope.getCliente($item.cad_cod_cad);

                $scope.cupom.clienteSelect   = $item.cad_nome_razao;
                $scope.cupom.cup_cad_cod_cad = $item.cad_cod_cad;
            };

            /**
             * Adiciona um cliente pelo plugin de autocomplete
             * @param termo
             */
            $scope.addCliente = function(termo) {

                var objCliente = {
                    'cad_pf_pj'       : 1,
                    'cad_eh_inativo'  : 0,
                    'cad_nome_razao'  : termo.trim(),
                    'cad_tip_cli_for' : $scope.cad_tip_cli_for
                };

                ClienteService.clientes.create(objCliente, function(retorno) {
                    if (! retorno.records.error) {

                        $scope.cupom.clienteSelect   = termo.trim();
                        $scope.cupom.cup_cad_cod_cad = retorno.records.cad_cod_cad;
                    }
                });
            };

            /**
             * Obtém dados de um determinado cliente.
             */
            $scope.getCliente = function(cad_cod_cad) {

                ClienteService.cliente.get({cad_cod_cad : cad_cod_cad}, function(data) {

                    var cliente = data.records;
                    $scope.cliente = cliente;

                    $scope.cupom.clienteSelect = $scope.cliente.cad_nome_razao;
                });
            };

            /**
             * Cancela um registro no banco de dados
             */
            $scope.cancelarCupom = function () {

                if ($scope.cupom.cup_nro_cup == null) {

                    $scope.novoCupom();

                } else {

                    GeralFactory.confirmar('Deseja remover o cupom escolhido?', function() {

                        var objeto = {cup_nro_cup : $scope.cupom.cup_nro_cup};
                        CupomService.cupons.cancelar(objeto, function(retorno) {

                            $scope.getPesquisar();
                            $scope.novoCupom();
                        });
                    });
                }
            };

            /**
             * Salva o cupom
             */
            $scope.salvarCupom = function(cup_nro_cup) {

                $scope.salvarCupomLoading = true;

                var arrCupom = [];

                var form = $scope.forms.formCupom;
                if (form.$invalid) {

                    $scope.submitted = true;
                    $scope.salvarCupomLoading = false;

                } else {

                    //se tem cupom selecionado, atualiza
                    if (cup_nro_cup) {

                        CupomService.cupons.update($scope.cupom, function (retorno) {

                            $scope.getPesquisar();
                            $scope.getCupom(cup_nro_cup);

                            $scope.salvarCupomLoading = false;
                        });

                        //se não tem cupom selecionado, cria
                    } else {


                        CupomService.cupons.create($scope.cupom, function (retorno) {

                            $scope.cupom.cup_nro_cup = retorno.records.cup_nro_cup;

                            $scope.getCupom($scope.cupom.cup_nro_cup);
                            $scope.getPesquisar();

                            $scope.salvarCupomLoading = false;
                        });
                    }
                }
            };
        }
    ]);