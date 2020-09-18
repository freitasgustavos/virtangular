
angular.module('newApp').controller('FiscalModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance',

    function($scope, $rootScope, $timeout, $uibModalInstance) {


        $uibModalInstance.opened.then(function() {

            $scope.objModal = {};
            $scope.setDataInventario();
        });

        /**
         * Seta a data padrão para a geração do inventário
         */
        $scope.setDataInventario = function () {

            var date = new Date();
            var ano  = date.getFullYear() - 1;
            var data = '31/12/' + ano;

            $timeout(function () {

                $scope.objModal.dataInventario = data;
            })
        };

        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dataInventario = $scope.objModal.dataInventario;
            $uibModalInstance.dismiss(str);
        };

    }
]);