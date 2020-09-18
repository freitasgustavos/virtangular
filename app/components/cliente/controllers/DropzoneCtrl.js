angular.module('newApp').controller('DropzoneCtrl', [

    '$scope', '$rootScope', 'AuthTokenFactory', 'MidiaService', '$window', '$timeout', 'GeralFactory',

    function($scope, $rootScope, AuthTokenFactory, MidiaService, $window, $timeout, GeralFactory) {

        $scope.setDropzone = function (Migracao_type) {
            console.log('Migration type: ' + Migracao_type);

            var data = (Migracao_type != 'produto')? 'restore' : 'restore-prod';

            $scope.dropzoneConfig = {
                'init': function(){
                    this.removeAllFiles();
                },

                'options': {
                    'url': MidiaService.urlDragandDrop_virtux(data),
                    'headers': {
                        'Authorization': 'Bearer ' + AuthTokenFactory.getToken()
                    },
                    'clickable': false,
                    'acceptedFiles': '.xls',
                    'params': {
                        'tipo_emissao': 'T',
                        'natureza': 2
                    },
                    'dictInvalidFileType': 'Apenas arquivos XLS são aceitos!'
                },

                'eventHandlers': {
                    'addedfile': function(file){
                        console.log("File: ", file);
                        console.log("File size", file.size);
                    },
                    'sending': function (file, formData, xhr) {},
                    'uploadprogress': function(file, progress, size) {
                        if(progress >= 100){
                            GeralFactory.notify('warning', 'Atenção:', 'Aguarde alguns segundos, sua importação ja está sendo processada');
                            $timeout(function(){
                                $window.location.reload();
                            }, 5000);
                        }
                    },
                    'success': function (file, response) {
                        console.log('success');
                    },
                    'error': function (error) {
                        console.log("Erro!");
                        console.log(error);
                    }
                }
            };
        };
    }
]);