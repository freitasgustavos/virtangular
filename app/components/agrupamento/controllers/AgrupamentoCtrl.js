'use strict';

angular.module('newApp')

        .controller('AgrupamentoCtrl', [

            '$scope', '$rootScope', '$uibModal', '$sce', '$timeout', 'AgrupamentoService', 'ProdutoService', 'GeralFactory', 'MidiaService', 'Upload', 'Wizard',

            function ($scope, $rootScope, $uibModal, $sce, $timeout, AgrupamentoService, ProdutoService, GeralFactory, MidiaService, Upload, Wizard) {
                $rootScope.hasAutorizacao();

                if (! $rootScope.getPermissao('19')) {
                    $location.path('/');
                }

                $scope.$on('$viewContentLoaded', function() {
                    $scope.flagMsg  = false;
                    $scope.flagLoadingLista = false;
                    $scope.listaPesquisaAgrupamentoBusy = false;
                    $scope.listaAgrupamentoBusy = false;
                    $scope.salvaAgrupamentoLoading = false;
                    $scope.botaoSalvar = false;
                    $scope.limit = '300';
                    $scope.eye = 'eye';

                    $scope.produtosAgrupamento = {};
                    $scope.newItem = {};
                    $scope.agrupamento = {
                        agrupamentoProdutos : [],
                        agrupamentoMarcas : []
                    };
                    $scope.arrAgrupamento = {};
                    $scope.nomeBotao   = 'Cancelar';
                    $scope.arrMarca = [];

                    $scope.flagTutorial  =  true;
                    $scope.siglaTutorial = 'AGP';
                    $scope.labelTutorial = 'Cadastro de novos agrupamentos';

                    $scope.objFiltroProduto = {
                        pro_agp_cod_agp : '0'
                    };

                    $scope.reset();
                    $scope.listarAgrupamentos();
                    $scope.listarMarcas();

                    $timeout(function () {
                        Wizard.loadWizards.initialize(19);
                    }, 2000);
                });

                $scope.reset = function () {

                    $scope.newItem    = {};
                    $scope.agrupamento = {
                        agrupamentoProdutos : [],
                        agrupamentoMarcas : []
                    };
                };


                /**
                 * Obtém dados de uma determinado agrupamento ou lista todos os agrupamentos existentes.
                 */
                $scope.listarAgrupamentos = function(agp_cod_agp) {

                    $scope.reset();

                    $scope.flagLoadingLista = true;
                    $scope.listaPesquisaAgrupamentoBusy = true;

                    if (agp_cod_agp) {

                        AgrupamentoService.agrupamentos.get({u : agp_cod_agp}, function(retorno) {

                            $scope.arrAgrupamento          = retorno.records;
                            $scope.produto.pro_agp_cod_agp = agp_cod_agp;

                            $scope.flagLoadingLista = false;
                            $scope.listaPesquisaAgrupamentoBusy = false;
                        });
                    } else {

                        AgrupamentoService.agrupamentos.get({u : ''}, function(resposta) {

                            $scope.arrAgrupamento = resposta.records;

                            if(!$scope.arrAgrupamento.length){

                                $scope.flagMsg  = true;
                            }

                            $scope.flagLoadingLista = false;
                            $scope.listaPesquisaAgrupamentoBusy = false;
                        });
                    }
                };

                /**
                 * Retorna um registro do agrupamento
                 */
                $scope.getAgrupamento = function(agp_cod_agp) {

                    $scope.reset();

                    $scope.flagMsg  = false;
                    $scope.botaoSalvar = false;

                    $scope.agpCodAgpSelected = agp_cod_agp;
                    var arrPrincipal;

                    AgrupamentoService.agrupamentos.get({u : $scope.agpCodAgpSelected}, function(retorno) {

                        $scope.nomeBotao = 'Excluir';

                        $scope.agrupamento = retorno.records;

                        $scope.agrupamento.agrupamentoProdutos = [];
                        $scope.agrupamento.agrupamentoMarcas = [];

                        $scope.agrupamento.agp_cod_agp_aux = ($scope.agrupamento.agp_cod_agp);
                        $scope.agrupamento.agp_eh_visivel_aux = ($scope.agrupamento.agp_eh_visivel === 0) ? false : true;
                        $scope.agrupamento.agp_descricao_aux = ($scope.agrupamento.agp_descricao);

                        if($scope.agrupamento.agp_eh_visivel_aux){

                            $scope.eye = 'eye';
                        }else{
                            $scope.eye = 'eye-slash';
                        }

                        // Verifica se o agrupamento contem alguma imagem:
                        if (retorno.records.produto_imagem.length) {

                            arrPrincipal = retorno.records.produto_imagem[0];
                            $scope.agrupamento.imagem_principal = arrPrincipal;
                        }

                        // retorna os produtos desse agrupamento
                        var objFiltro = {
                            'pro_agp_cod_agp' : $scope.agpCodAgpSelected
                        };

                        var strFiltro = GeralFactory.formatarPesquisar(objFiltro, 'fields=(estampa)');

                        AgrupamentoService.produtosAgrupamento.get({u : strFiltro}, function(retorno) {

                            if (retorno.records) {

                                console.log(retorno.records);

                                $scope.agrupamento.agrupamentoProdutos = retorno.records;

                                if(!$scope.agrupamento.agrupamentoProdutos.length){

                                    $scope.flagMsg  = true;
                                }

                                angular.forEach($scope.agrupamento.agrupamentoProdutos, function(reg, k) {

                                    if(reg.pro_eh_visivel){

                                        $scope.agrupamento.agrupamentoProdutos[k].pro_eye = (reg.pro_eh_visivel === 0) ? "<i class='fa fa-eye-slash'></i>" : "<i class='fa fa-eye'></i>";
                                    }else{

                                        $scope.agrupamento.agrupamentoProdutos[k].pro_eye = "<i class='fa fa-eye-slash'></i>";
                                        $scope.agrupamento.agrupamentoProdutos[k].pro_eh_visivel = 0;
                                    }

                                    $scope.agrupamento.agrupamentoProdutos[k].pro_estampa = (_.isEmpty(reg.produto_estampa)) ? 'N' : 'S';
                                });
                            }

                            //retorna as marcas dese agrupamento
                            objFiltro = {
                                'ama_cod_agp' : $scope.agpCodAgpSelected
                            };

                            strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                            AgrupamentoService.agrupamentoMarcas.get({u : strFiltro}, function(retorno) {

                                $scope.botaoSalvar = true;

                                if(retorno.records){


                                    angular.forEach($scope.arrMarca, function(elem1, k1) {

                                        angular.forEach(retorno.records,function(elem2, k2) {

                                            if (elem1['mar_cod_marca'] == elem2['ama_cod_marca']) {

                                                $scope.agrupamento.agrupamentoMarcas.push({
                                                    name                : elem1.mar_descricao_marca,
                                                    mar_descricao_marca : elem1.mar_descricao_marca,
                                                    mar_cod_marca       : elem1.mar_cod_marca
                                                });
                                            }
                                        });
                                    });
                                }
                            });
                        });

                        $scope.flagTutorial = false;
                    });

                    $scope.setAbaInicial();
                };

                /**
                 * Seta para aba principal ficar ativa
                 */
                $scope.setAbaInicial = function() {

                    $scope.tabs = [{active: true}];
                };

                /**
                 * Método responsável em recuperar todas as informações de um determinado
                 * produto selecionado no componente TYPEAHEAD.
                 */
                $scope.setNewItemProdutoAgp = function(pro_cod_pro) {

                    if (pro_cod_pro) {

                        ProdutoService.produto.get({pro_cod_pro : pro_cod_pro}, function(data) {

                            $scope.newProduto = data.records;

                            $scope.newItem.pro_agp_cod_agp = $scope.agrupamento.agp_cod_agp_aux;
                            $scope.newItem.pro_cod_pro = $scope.newProduto.pro_cod_pro;
                            $scope.newItem.pro_descricao_longa = $scope.newProduto.pro_descricao_longa; //n'ao usar pro_descricao_longa pois  e usada como objeto mais abaixo
                            $scope.newItem.pro_modelo = $scope.newProduto.pro_modelo;
                            $scope.newItem.pro_cor_1 = $scope.newProduto.pro_cor_1;
                            $scope.newItem.pro_cor_2 = $scope.newProduto.pro_cor_2;
                            $scope.newItem.pro_eh_visivel = $scope.newProduto.pro_eh_visivel;
                            $scope.newItem.pro_eye = ($scope.newItem.pro_eh_visivel === 0) ? "<i class='fa fa-eye-slash'></i>" : "<i class='fa fa-eye'></i>";
                        });
                    }
                };

                /**
                 *
                 */
                $scope.onSelectProdutoAgp = function($item) {

                    $scope.newItem = {};
                    $scope.newItem.produto = {};
                    $scope.setNewItemProdutoAgp($item.pro_cod_pro);
                };

                /**
                 *
                 */
                $scope.addProdutoAgp = function($item) {

                    var objProduto = {
                        'pro_descricao_longa' : $item.trim(),
                        'pro_eh_inativo'      : 0,
                        'pro_eh_servico'      : 0
                    };

                    ProdutoService.produtos.create(objProduto, function(resposta) {
                        if (! resposta.records.error) {

                            $scope.setNewItemProdutoAgp(resposta.records.pro_cod_pro);
                        }
                    });
                };

                /**
                 * Auxilia na montagem do box com as cores
                 */
                $scope.getVerificaCor = function(objCores) {

                    var retorno = false;
                    if (objCores.pro_cor_2) {
                        var cor2 = objCores.pro_cor_2.trim();
                        if (cor2 !== '') {
                            retorno = true;
                        }
                    }
                    return retorno;
                };

                /**
                 * Adiciona um novo item  do objeto de itens.
                 * Itens que é o vetor que preenche a tabela de itens.
                 */
                $scope.addItemAgp = function() {

                    $scope.agrupamento.agrupamentoProdutos.push(angular.copy($scope.newItem));
                    $scope.newItem         = {};
                    $scope.newItem.produto = {};
                };

                /**
                 * Remove um item do objeto de itens.
                 */
                $scope.removeItem = function(item){
                    
                    var index = $scope.agrupamento.agrupamentoProdutos.indexOf(item);
                    $scope.agrupamento.agrupamentoProdutos.splice(index, 1);
                };

                $scope.novoAgrupamento = function () {

                    $scope.botaoSalvar = false;
                    $scope.forms.formAgrupamento.$setPristine();
                    $scope.newItem     = {};
                    $scope.agrupamento = {};
                    $scope.nomeBotao   = 'Cancelar';
                    $scope.reset();
                    $scope.setAbaInicial();
                    $scope.botaoSalvar = true;
                    $scope.flagTutorial = false;
                };


                /**
                 * Altera a visibilidade do agrupamento
                 */
                $scope.visibilidadeAgp = function() {

                    $scope.eye = ($scope.eye === 'eye') ? 'eye-slash' : 'eye';
                };

                /**
                 * Altera a visibilidade do produto
                 */
                $scope.visibilidadeProduto = function(item) {

                    var index = $scope.agrupamento.agrupamentoProdutos.indexOf(item);

                    if($scope.agrupamento.agrupamentoProdutos[index].pro_eye === "<i class='fa fa-eye'></i>"){

                        $scope.agrupamento.agrupamentoProdutos[index].pro_eye = "<i class='fa fa-eye-slash'></i>";

                        $scope.agrupamento.agrupamentoProdutos[index].pro_eh_visivel = 0;
                    }else{

                        $scope.agrupamento.agrupamentoProdutos[index].pro_eye = "<i class='fa fa-eye'></i>";
                        $scope.agrupamento.agrupamentoProdutos[index].pro_eh_visivel = 1;
                    }
                };

                /**
                 * Retorna uma lista de agrupamentos baseada no filtro
                 */
                $scope.getPesquisar = function() {

                    $scope.listaAgrupamentoBusy = true;

                    //o timeout é necessario pq se o usuario digita muito rapido a consulta ele nao retorna conforme esperado
                    $timeout(function() {

                        var objFiltro = $scope.filtroPesquisarAgrupamento();

                        var strFiltro = GeralFactory.formatarPesquisar(objFiltro,'limit='+$scope.limit+'&offset=0');

                        //se ja tiver executando alguma busca ele nao faz novamente
                        if($scope.listaPesquisaAgrupamentoBusy) {
                            return;
                        }

                        $scope.listaPesquisaAgrupamentoBusy = true;

                        AgrupamentoService.buscaAgrupamentos.get({u : strFiltro}, function(resposta) {

                            $scope.arrAgrupamento = resposta.records;
                            $scope.listaPesquisaAgrupamentoBusy = false;
                            $scope.listaAgrupamentoBusy = false;
                        });

                    }, 1300);
                };

                $scope.filtroPesquisarAgrupamento = function() {

                    return  {
                        'texto_agrupamento_pesquisar' : $scope.pesquisaAgrupamento.texto_agrupamento_pesquisar
                    };
                };

                /**
                 * Método responsável em abrir a janela modal contendo o formulário
                 * para envio de uma nova foto para um determinado produto.
                 */
                $scope.getFormUpload = function(agp_cod_agp) {

                    if (agp_cod_agp) {

                        var scope = $rootScope.$new();

                        scope.params = {};

                        //usanfo produto_imagem pois já é o retorno do midia service
                        var arrFotos = ($scope.agrupamento.produto_imagem === undefined) ? [] : $scope.agrupamento.produto_imagem;

                        scope.params.entity      = 'Agrupamento';
                        scope.params.arr_fotos   =  arrFotos;
                        scope.params.agp_cod_agp =  agp_cod_agp;

                        var modalInstance = $uibModal.open({
                            animation   :  true,
                            templateUrl : 'agrupamento/views/aba-agrupamento-upload.html',
                            controller  : 'AgrupamentoModalController',
                            windowClass : 'center-modal',
                            backdrop    : 'static',
                            scope       :  scope,
                            resolve     :  {
                                getEnd: function() {
                                    console.log('OK para modal de uplaod!');
                                }
                            }
                        });

                        modalInstance.result.then(function(id) { }, function(msg) {
                            if (msg === 'cancel') {

                                $scope.getAgrupamento(agp_cod_agp);
                            }
                        });
                    } else {

                        GeralFactory.notify('warning', 'Atenção!', 'Salve antes de prosseguir.');
                    }
                };

                /**
                 * lista todos as marcações cadastradas
                 */
                $scope.listarMarcas = function () {

                    ProdutoService.marcas.get({u : ''}, function (data) {

                        var arrMarcas = data.records, arrAuxiliar = [];

                        angular.forEach(arrMarcas, function (i, j) {
                            arrAuxiliar.push({
                                name: i.mar_descricao_marca,
                                mar_descricao_marca: i.mar_descricao_marca,
                                mar_cod_marca: i.mar_cod_marca
                            });
                        });

                        $scope.arrMarca = arrAuxiliar;
                    });
                };

                /**
                 * Adiciona a opção de uma nova marca para inserção no campo select do formulário.
                 */
                $scope.tagTransform = function(newTag) {
                    var item = {
                        name                : newTag,
                        mar_descricao_marca : newTag
                    };
                    return item;
                };

                /**
                 * Método responsável em adicionar uma nova marca através do plugin de ui-select.
                 */
                $scope.onSelectedMarca = function(item) {

                    if (item.hasOwnProperty('isTag')) {

                        var objeto = {mar_descricao_marca : item.mar_descricao_marca, mar_tab : 1};
                        ProdutoService.marcas.create(objeto, function(resposta) {
                            if (! resposta.records.error) {
                                GeralFactory.notify('success', 'Sucesso!', 'Marcação cadastra com sucesso!');

                                item.mar_cod_marca = resposta.records.mar_cod_marca;
                                delete item['isTag'];

                                $scope.arrMarca.push({
                                    name                : item.mar_descricao_marca,
                                    mar_descricao_marca : item.mar_descricao_marca,
                                    mar_cod_marca       : resposta.records.mar_cod_marca
                                });
                            }
                        });
                    }
                };

                /**
                 * Exclui um produto ou cancela a inclusão de um mesmo.
                 */
                $scope.cancelarAgrupamento = function() {

                    if ($scope.agrupamento.agp_cod_agp == null) {

                        $scope.novoAgrupamento();

                    } else {

                        GeralFactory.confirmar('Deseja remover o agrupamento escolhido?', function() {

                            var objeto = {agp_cod_agp : $scope.agrupamento.agp_cod_agp};
                            AgrupamentoService.agrupamentos.cancelar(objeto, function(retorno) {

                                $scope.listarAgrupamentos();
                                $scope.novoAgrupamento();
                            });
                        });
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

                    // Verificando para saber se vai salvar ou apenas voltar para aba anterior:
                    abaSelecionada === 0 ? $scope.flagTutorial = true : $scope.setAbaInicial(abaSelecionada);
                };

                /**
                 * Salva o agrupamento
                 */
                $scope.salvarAgrupamento = function(agp_cod_agp) {

                        var arrAgrupamento = [];
                    $scope.salvaAgrupamentoLoading = true;

                    //se tem agrupamento selecionado, atualiza
                    if(agp_cod_agp){

                        $scope.agrupamento.agp_eh_visivel = ($scope.eye === 'eye') ? 1 : 0;

                        AgrupamentoService.agrupamentos.update($scope.agrupamento, function(retorno) {

                            $scope.reset();
                            $scope.listarAgrupamentos();
                            $scope.listarMarcas();
                            $scope.getAgrupamento(agp_cod_agp);

                            $scope.salvaAgrupamentoLoading = false;
                        });

                    //se não tem agrupamento selecionado, cria
                    } else {

                        AgrupamentoService.agrupamentos.create($scope.agrupamento, function(retorno) {

                            $scope.agrupamento.agp_cod_agp = retorno.records.agp_cod_agp;

                            //atualiza o agrupamento criado para setar marcas e produtos.
                            AgrupamentoService.agrupamentos.update($scope.agrupamento, function(retorno) {

                                var aux = $scope.agrupamento.agp_cod_agp;

                                $scope.salvaAgrupamentoLoading = false;

                                $scope.reset();
                                $scope.listarAgrupamentos();
                                $scope.getAgrupamento(aux);
                            });

                        });
                    }
                };
            }
        ]);