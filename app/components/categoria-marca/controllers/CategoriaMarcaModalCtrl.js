'use strict';

angular.module('newApp')

    .controller('CategoriaMarcaModalCtrl', [

        '$scope', '$rootScope', '$modalInstance', '$timeout', 'ProdutoService', 'GeralFactory',

        function($scope, $rootScope, $modalInstance, $timeout, ProdutoService, GeralFactory) {
            $rootScope.hasAutorizacao();

            $scope.forms    = {};
            $scope.objDados = {};
            $scope.objTela  = {};
            $scope.selected = {};
            $scope.objLista = {};


            $modalInstance.opened.then(function() {

                $scope.objTela.id     = $scope.params.id;
                $scope.objTela.tipo   = $scope.params.tipo;
                $scope.objTela.name   = $scope.params.name;
                $scope.objTela.entity = $scope.params.entity;

                $scope.getDados();
                $modalInstance.hasAlteracao = true;
            });


            /**
             * Método responsável em recolher os dados caso a operação escolhida seja de atualização.
             */
            $scope.getDados = function() {

                $scope.objDados.dd_descricao = ($scope.objTela.name) ? $scope.objTela.name : '';

                switch ($scope.objTela.tipo) {
                    case 'C':
                        $scope.objTela.attrs = [
                            'gru_cod_gru',
                            'gru_descricao',
                            'gru_cod_pai'
                        ];
                        $scope.objTela.id !== null ? $scope.getCategoria() : $scope.configArvore();
                        break;

                    case 'M':
                        $scope.objTela.attrs = [
                            'mar_cod_marca',
                            'mar_descricao_marca',
                            'mar_cod_pai'
                        ];
                        $scope.objTela.id !== null ? $scope.getMarca() : $scope.configArvore();
                        break;
                }
            };


            /**
             * Efetua a chamada para recolher as categorias cadastradas.
             */
            $scope.getListaCategorias = function() {

                ProdutoService.produtoGrupos.get({}, function(retorno) {
                    if (retorno.records.length) {

                        $scope.objLista = retorno.records;
                    }
                });
            };


            /**
             * Método responsável em recolher os dados de uma determinada categoria.
             */
            $scope.getCategoria = function() {

                ProdutoService.produtoGrupos.get({u : $scope.objTela.id}, function(retorno) {
                    if (retorno.records) {

                        $scope.objDados.dd_descricao = retorno.records.gru_descricao;

                        var pai = retorno.records.gru_cod_pai === null ? null : 'modal-' + retorno.records.gru_cod_pai;
                        var id  = retorno.records.gru_cod_gru;

                        $scope.selected.id = pai;
                        $scope.configArvore(pai, id);
                    }
                });
            };


            /**
             * Método responsável em recolher os dados de uma determinada marca.
             */
            $scope.getMarca = function() {

                var strFiltro = GeralFactory.formatarPesquisar({
                    'mar_cod_marca': $scope.objTela.id,
                    'mar_tab'      : 1
                });

                ProdutoService.marcas.get({u : strFiltro}, function(retorno) {
                    if (retorno.records) {
                        var arrMarca = retorno.records[0];

                        $scope.objDados.dd_descricao      = arrMarca.mar_descricao_marca;
                        $scope.objDados.dd_eh_vitrine_aux = arrMarca.mar_eh_vitrine === 1 ? true : false;

                        var pai = arrMarca.mar_cod_pai === null ? null : 'modal-' + arrMarca.mar_cod_pai;
                        var id  = arrMarca.mar_cod_marca;

                        $scope.selected.id = pai;
                        $scope.configArvore(pai, id);
                    }
                });
            };


            /**
             * Método responsável em recolher os dados que vão popular a árvore.
             */
            $scope.configArvore = function(selectedParent, selectedId) {

                if ($scope.objTela.tipo === 'C') {

                    ProdutoService.produtoGrupos.get({}, function(retorno) {
                        if (retorno.records.length) {

                            $scope.setArvore(retorno.records, selectedParent, selectedId);
                        }
                    });

                } else {

                    ProdutoService.marcas.get({u : 'q=(mar_tab:1)'}, function(retorno) {
                        if (retorno.records.length) {

                            var arrMarcas = [];
                            angular.forEach(retorno.records, function(i ,j) {

                                var codMarca = parseInt(i.mar_cod_marca);
                                codMarca !== 10 && codMarca !== 11 && codMarca !== 12 && codMarca !== 13 && arrMarcas.push(i);
                            });

                            $scope.setArvore(arrMarcas, selectedParent, selectedId);
                        }
                    });
                }
            };


            /**
             * Método responsável em montar a árvore de MARCAS ou CATEGORIAS.
             */
            $scope.setArvore = function(objeto, selectedParent, selectedId) {

                var attrId      = $scope.objTela.attrs[0];
                var attrLabel   = $scope.objTela.attrs[1];
                var attrParent  = $scope.objTela.attrs[2];

                var objJSONTree = GeralFactory.getJSONTree(objeto, attrId, attrParent, attrLabel, 'modal', selectedParent);

                var isSelected  = selectedParent === null ? 'selected' : '';
                $scope.objTree  = [{
                    'id'       : 'modal',
                    'label'    :  $scope.params.entity,
                    'children' :  objJSONTree,
                    'selected' :  isSelected
                }];
            };


            /**
             * Método responsável em salvar os dados da marca ou categoria.
             */
            $scope.salvarDados = function() {

                $scope.salvarDadosLoading = true;

                $scope.$watch('forms.formCategoriaMarca', function(form) {
                    if (form) {
                        if (form.$invalid) {

                            $scope.submitted = true;
                            $scope.salvarDadosLoading = false;

                        } else {

                            switch ($scope.objTela.tipo) {
                                case 'C':
                                    $scope.salvarCategoria();
                                    break;

                                case 'M':
                                    $scope.salvarMarca();
                                    break;
                            }
                        }
                    }
                });
            };


            /**
             * Método responsável em salvar os dados de uma determinada CATEGORIA.
             */
            $scope.salvarCategoria = function() {

                var canSave = true;
                var objCategoria = {
                    'gru_eh_visivel_web'   : 0,
                    'gru_eh_visivel_venda' : 0,
                    'gru_descricao'        : $scope.objDados.dd_descricao.trim()
                };

                objCategoria = $scope.addItensObjeto(objCategoria);
                var operacao = objCategoria.operacao;

                if (operacao === 'update' &&
                    objCategoria.objDados.gru_cod_gru === objCategoria.objDados.gru_cod_pai) {

                    var mensagem = 'Caro usuário, uma categoria não pode ser pai dela mesma, tente novamente!';
                    GeralFactory.notify('warning', 'Atenção!', mensagem);

                    canSave = false;
                    $scope.salvarDadosLoading = false;
                }

                if (canSave) {
                    ProdutoService.produtoGrupos[operacao](objCategoria.objDados, function (retorno) {
                        if (retorno.records) {

                            $scope.applyRetorno(retorno);
                        }
                    });
                }
            };


            /**
             * Método responsável em salvar os dados de uma determinada MARCA.
             */
            $scope.salvarMarca = function() {

                var canSave  = true;
                var objMarca = {
                    'mar_tab'             : 1,
                    'mar_eh_vitrine'      : $scope.objDados.dd_eh_vitrine_aux ? 1 : 0,
                    'mar_descricao_marca' : $scope.objDados.dd_descricao.trim()
                };

                objMarca = $scope.addItensObjeto(objMarca);
                var operacao = objMarca.operacao;

                if (operacao === 'update' &&
                    objMarca.objDados.mar_cod_marca === objMarca.objDados.mar_cod_pai) {

                    var mensagem = 'Caro usuário, uma marca não pode ser pai dela mesma, tente novamente!';
                    GeralFactory.notify('warning', 'Atenção!', mensagem);

                    canSave = false;
                    $scope.salvarDadosLoading = false;
                }

                if (canSave) {
                    ProdutoService.marcas[operacao](objMarca.objDados, function(retorno) {
                        if (retorno.records) {

                            $scope.applyRetorno(retorno);
                        }
                    });
                }
            };


            /**
             * Método responsável em aplicar os comportamentos necessários após receber a resposta
             * do servidor referente a inserção ou atualização dos dados.
             */
            $scope.applyRetorno = function(retorno) {

                if (retorno.records.error) {

                    $scope.salvarDadosLoading = false;
                    GeralFactory.notify('danger', 'Atenção!', retorno.records.msg);

                } else {

                    $scope.salvarDadosLoading = false;
                    if ($scope.objTela.id === null) {

                        var attrId = $scope.objTela.attrs[0];
                        $modalInstance.idInserido = retorno.records[attrId];
                    }

                    var mensagem = 'Os dados da ' + $scope.objTela.entity + ' foram salvos com sucesso!';
                    GeralFactory.notify('success', 'Sucesso!', mensagem);

                    $timeout(function() {
                        $scope.fecharModal('cancel');
                    }, 2000);
                }
            };


            /**
             * Método responsável em adicionar alguns item ao objeto a ser salvo de acordo com
             * o tipo de operação a ser realizada. inserção ou atualização.
             */
            $scope.addItensObjeto = function(objDados) {

                // Verifica se é uma operação de inserção ou atualização dos dados:
                var operacao = 'create';
                if ($scope.objTela.id !== null) {

                    operacao = 'update';
                    var attrId = $scope.objTela.attrs[0];
                    objDados[attrId] = $scope.objTela.id;
                }

                var attrParent = $scope.objTela.attrs[2];
                objDados[attrParent] = null;

                // Verifica se o usuário selecionou alguma opção da árvore:
                if ($scope.selected.hasOwnProperty('id')) {

                    if ($scope.selected.id !== null) {

                        var arrSelecionado = $scope.selected.id.split('-');
                        if (arrSelecionado.length > 1) {

                            objDados[attrParent] = parseInt(arrSelecionado[1]);
                        }
                    }
                }

                return {
                    objDados : objDados,
                    operacao : operacao
                };
            };


            /**
             * Método responsável em remover uma determinada categoria ou marca.
             */
            $scope.cancelar = function() {

                if ($scope.objTela.id !== null) {

                    var objeto = {id : $scope.objTela.id};

                    var objAux = {};
                    if ($scope.objTela.tipo === 'C') {

                        objAux = {
                            'service'  : 'produtoGrupos',
                            'mensagem' : 'Deseja remover esta categoria?'
                        };
                    } else {

                        objAux = {
                            'service'  : 'marcas',
                            'mensagem' : 'Deseja remover esta marca?'
                        };
                    }

                    GeralFactory.confirmar(objAux.mensagem, function() {

                        ProdutoService[objAux.service].cancelar(objeto, function(retorno) {
                            if (retorno.records) {

                                GeralFactory.notificar({data: retorno});
                                if (! retorno.records.error) {

                                    $timeout(function () {
                                        $scope.fecharModal('cancel');
                                    }, 2000);
                                }
                            }
                        });
                    });
                }
            };


            /**
             * Evento disparado quando algum item da árvore é selecionado.
             */
            $scope.$watch('tree.currentNode', function(objNovo, objAntigo) {

                $('span.selected').removeClass('selected');
                if ($scope.tree && angular.isObject($scope.tree.currentNode)) {

                    $scope.selected = $scope.tree.currentNode;
                }
            }, false);


            /**
             * Efeuta o fechamento da janela modal.
             */
            $scope.fecharModal = function(str) {

                $modalInstance.dismiss(str);
            };
        }
    ]);


angular.module('newApp')

    .controller('CategoriaMarcaSelecaoModalCtrl', [

        '$scope', '$rootScope', '$uibModal', '$modalInstance', 'GeralFactory', 'ProdutoService',

        function($scope, $rootScope, $uibModal, $modalInstance, GeralFactory, ProdutoService) {

            $rootScope.hasAutorizacao();

            $scope.objTela  = {};
            $scope.selected = {};

            $modalInstance.opened.then(function() {

                $scope.objTela.tipo   = $scope.params.tipo;
                $scope.objTela.entity = $scope.params.entity;

                $scope.getDados();
                $modalInstance.hasAlteracao = true;
            });


            /**
             * Método responsável em recolher os dados para montar a janela modal
             * conforme o tipo escolhido, Categorias ou Marcas.
             */
            $scope.getDados = function() {

                switch ($scope.objTela.tipo) {
                    case 'C':
                        $scope.getCategorias();
                        break;

                    case 'M':
                        console.log('Implementar marcas quando necessário!');
                        break;
                }
            };


            /**
             * Método responsável em recolher toda as categorias para montar a árvore.
             */
            $scope.getCategorias = function() {

                ProdutoService.produtoGrupos.get({}, function(retorno) {
                    if (retorno.records.length) {

                        var attrs = [
                            'gru_cod_gru',
                            'gru_cod_pai',
                            'gru_descricao',
                            'categoria'
                        ];

                        var objTree = GeralFactory.getJSONTree(retorno.records, attrs[0], attrs[1], attrs[2], attrs[3]);
                        $scope.objTree = [{
                            'label'     : 'Categorias',
                            'id'        :  attrs[3],
                            'children'  :  objTree
                        }];
                    }
                });
            };


            /**
             * Método responsável em abrir a janela modal contendo o formulário para
             * inserir uma nova categoria.
             */
            $scope.openModal = function() {

                var scope = $rootScope.$new();
                scope.params = {};

                scope.params.id     = null;
                scope.params.name   = '';
                scope.params.tipo   = 'C';
                scope.params.entity = 'Categoria';

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'categoria-marca/views/janela-categoria-marca.html',
                    controller  : 'CategoriaMarcaModalCtrl',
                    windowClass : 'center-modal',
                    backdrop    : 'static',
                    scope       :  scope,
                    resolve     :  { }
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'cancel') {
                        if (modalInstance.hasAlteracao) {

                            $scope.getCategorias();
                        }
                    }
                });
            };


            /**
             * Evento disparado quando algum item da árvore é selecionado.
             */
            $scope.$watch('tree.currentNode', function(objNovo, objAntigo) {

                if ($scope.tree && angular.isObject($scope.tree.currentNode)) {

                    $scope.selected = $scope.tree.currentNode;
                    $modalInstance.objSelected = $scope.tree.currentNode;

                    $scope.fecharModal('cancel');
                }
            }, false);


            /**
             * Efeuta o fechamento da janela modal.
             */
            $scope.fecharModal = function(str) {

                $modalInstance.dismiss(str);
            };
        }
    ]);