'use strict';

angular.module('newApp')

    .controller('Controller', function Controller($scope, $http, store, auth, AuthTokenFactory) {

        $scope.verificarCache = function() {
            return $http.get('http://localhost:8081/restkitorig/properties?search=(city:Uber)', {
            }).then(function success(response) {
                alert('resp: '+response.data.records['aaa']);
            });
        };

        $scope.login = function(username, password) {
            return $http.post('http://localhost:8081/v1/v1/erp/auth', {
                username : username,
                password : password
            }).then(function success(response) {
                AuthTokenFactory.setToken(response.data.records.token);
                $scope.user = response.data.records.user;
            });
        };
    })

    .controller('ImagemCtrl', function Controller($scope, $http, Upload) {

        $scope.myImage = '';
        $scope.myCroppedImage = '';

        var handleFileSelect=function(evt) {
            var file=evt.currentTarget.files[0];
            var reader = new FileReader();
            reader.onload = function(evt) {
                $scope.$apply(function($scope){
                    $scope.myImage = evt.target.result;
                });
            };
            reader.readAsDataURL(file);
        };

        angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);





        $scope.upload2 = function (file,event) {

            //console.log(event);

            //if(event.type == 'click') {
            //    //console.log('aa');
            //    //return false;
            //}

            console.log('file: ',file);

            Upload.upload({
                //url: 'http://localhost:8081/v1/v1/erp/vix-pro/upload',
                url: 'http://localhost:8081/v1/v1/1000/erp/vix-mid/'+10,
                headers: {'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'},
                file: file,
                data: {mid_tab: 3,mid_posicao:'A1',mid_link:'www.asdf222.com',mid_ordem:2,mid_nro:10},
                fileFormDataName: 'imagem_upload'
            }).progress(function (evt) {
                //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                // console.log('progress: ' + progressPercentage + '% ' , evt.config);
            }).success(function (data, status, headers, config) {
                //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                console.log('successo',data, status, headers, config);
            }).error(function (data, status, headers, config) {
                //console.log('error status: ' + status);
                console.log('errroo',data,status,headers,config);
            });

            //uploader.onBeforeUploadItem = function(item) {
            //    var blob = dataURItoBlob($scope.croppedImage);
            //    item._file = blob;
            //};
        };










        $scope.upload = function (file, event) {
            if (event.type == 'click') {
                return false;
            }

            Upload.upload({

                url     : 'http://localhost:8081/v1/v1/erp/vix-pro/upload',
                headers : {
                    'Content-Type' : 'multipart/form-data',
                    'Accept'       : 'application/json'
                },
                file               : file,
                fileFormDataName   : 'imagem_upload'

            }).progress(function(evt) {

            }).success(function(data, status, headers, config) {

                console.log('Successo: ', data, status, headers, config);

            }).error(function(data, status, headers, config) {

                console.log('Erro: ', data, status, headers, config);

            });

            uploader.onBeforeUploadItem = function(item) {
                var blob = dataURItoBlob($scope.croppedImage);
                item._file = blob;
            };
        };
    });
