'use strict';

angular.module('newApp')

    .controller('CategoriaMarcaCtrl', [

        '$scope', '$rootScope', '$uibModal', '$timeout', 'GeralFactory', 'ProdutoService',

        function($scope, $rootScope, $uibModal, $timeout, GeralFactory, ProdutoService) {

            $rootScope.hasAutorizacao();

            if (! $rootScope.getPermissao('20')) {
                $location.path('/');
            }

            $scope.objMarcas    = {};
            $scope.objTreeMarca = {};

            $scope.objCategorias    = {};
            $scope.objTreeCategoria = {};


            $scope.$on('$viewContentLoaded', function() {

                $scope.getMarcas();
                $scope.getCategorias();
            });


            /**
             * Efetua a chamada para recolher as marcas cadastradas.
             */
            $scope.getMarcas = function() {

                ProdutoService.marcas.get({u : 'q=(mar_tab:1)'}, function(retorno) {
                    if (retorno.records.length) {

                        $scope.objMarcas = retorno.records;
                        $scope.filterMarcas();
                        $scope.getTreeMarcas();
                    }
                });
            };


            /**
             * Monta a árvore contendo todas as marcas.
             */
            $scope.getTreeMarcas = function() {

                var entidade = 'marca';
                var objTree  = GeralFactory.getJSONTree($scope.objMarcas, 'mar_cod_marca', 'mar_cod_pai', 'mar_descricao_marca', entidade);

                $scope.objTreeMarca = [{
                    'label'    : 'Marcações',
                    'id'       :  entidade,
                    'children' :  objTree
                }];
            };


            /**
             * Remove as marcas especiais para não aparecer no árvore.
             */
            $scope.filterMarcas = function() {

                if ($scope.objMarcas) {

                    var arrMarcas = [];
                    angular.forEach($scope.objMarcas, function(i ,j) {

                        var codMarca = parseInt(i.mar_cod_marca);
                        codMarca !== 10 && codMarca !== 11 && codMarca !== 12 && codMarca !== 13 && arrMarcas.push(i);
                    });

                    // Alterando o objeto contendo a listagem das marcas:
                    $scope.objMarcas = arrMarcas;
                }
            };


            /**
             * Efetua a chamada para recolher as categorias cadastradas.
             */
            $scope.getCategorias = function() {

                ProdutoService.produtoGrupos.get({}, function(retorno) {
                    if (retorno.records.length) {

                        $scope.objCategorias = retorno.records;
                        $scope.getTreeCategorias();
                    }
                });
            };


            /**
             * Monta a árvore contendo todas as categorias.
             */
            $scope.getTreeCategorias = function() {

                var entidade = 'categoria';
                var objTree  =  GeralFactory.getJSONTree($scope.objCategorias, 'gru_cod_gru', 'gru_cod_pai', 'gru_descricao', entidade);

                $scope.objTreeCategoria = [{
                    'label'     : 'Categorias',
                    'id'        :  entidade,
                    'children'  :  objTree
                }];
            };


            /**
             * Método responsável em abrir a janela a modal para o cadastro e alteração
             * dos dados de uma determinada marca ou categoria.
             */
            $scope.openModal = function(tipo, id) {

                var scope = $rootScope.$new();
                
                scope.params = {};
                scope.params.id = (id) ? id : null;

                if (tipo === 'M') {

                    scope.params.tipo   = 'M';
                    scope.params.entity = 'Marcação';

                } else {

                    scope.params.tipo   = 'C';
                    scope.params.entity = 'Categoria';

                }

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

                            tipo === 'M' ? $scope.getMarcas() : $scope.getCategorias();
                        }
                    }
                });
            };


            /**
             * Evento disparado quando algum item da árvore de marcas é selecionado.
             */
            $scope.$watch('treeMarca.currentNode', function(newObj, oldObj) {

                if ($scope.treeMarca && angular.isObject($scope.treeMarca.currentNode)) {

                    var arrMarca = $scope.treeMarca.currentNode.id.split('-');
                    if (arrMarca.length === 1) {

                        GeralFactory.notify('warning', 'Atenção!', 'Não se pode alterar os dados da marca principal!');

                    } else {

                        var id = parseInt(arrMarca[1]);
                        $scope.openModal('M', id);
                    }
                }
            }, false);


            /**
             * Evento disparado quando algum item da árvore de categorias é selecionado.
             */
            $scope.$watch('treeCategoria.currentNode', function(newObj, oldObj) {

                if ($scope.treeCategoria && angular.isObject($scope.treeCategoria.currentNode)) {

                    var arrCategoria = $scope.treeCategoria.currentNode.id.split('-');
                    if (arrCategoria.length === 1) {

                        GeralFactory.notify('warning', 'Atenção!', 'Não se pode alterar os dados da categoria principal!');

                    } else {

                        var id = parseInt(arrCategoria[1]);
                        $scope.openModal('C', id);
                    }
                }
            }, false);
        }
    ]);
