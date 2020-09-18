
angular.module('newApp').controller('EmpresaModalUploadCtrl', [

    '$scope', '$rootScope', '$timeout', '$modalInstance', 'MidiaService', 'GeralFactory',

    function($scope, $rootScope, $timeout, $modalInstance, MidiaService, GeralFactory) {

        $scope.foto = {};

        $modalInstance.opened.then(function() {

            $scope.foto.emp_cod_emp = $scope.params.emp_cod_emp;

            $scope.fotoAtual = $scope.params.logomarca;

            $modalInstance.hasAlteracao = false;
        });

        /**
         *
         */
        $scope.getMidia = function() {

            if ($scope.foto.emp_cod_emp) {

                var query = 'q=(mid_tab:4)';
                MidiaService.midias.get({u : query}, function(retorno) {

                    $scope.fotoAtual = null;
                    if (retorno.records.length) {

                        var qtdeFotos = retorno.records.length;
                        var arrFotos  = retorno.records[qtdeFotos - 1];
                        $scope.fotoAtual = arrFotos.mid_id;
                    }
                });
            }
        };

        /**
         *
         */
        $scope.upload = function(file, event) {

            $scope.salvarFotoLoading = true;

            if (file === undefined || file === null) {

                GeralFactory.notify('warning', 'Atenção!', 'Caro usuário, selecione ao menos uma foto para efetuar o envio!');
                $scope.salvarFotoLoading = false;

            } else {

                if ($scope.foto.emp_cod_emp !== null) {

                    var objeto = {
                        mid_tab     : 4,
                        mid_status  : 1,
                        mid_posicao : '',
                        mid_link    : ''
                    };

                    MidiaService.upload(file, objeto, function() {

                        $modalInstance.hasAlteracao = true;

                        GeralFactory.notify('success', 'Sucesso!', 'Foto cadastrada com sucesso!');

                        $scope.picFile           = null;
                        $scope.salvarFotoLoading = false;
                        $scope.getMidia();
                    });
                }
            }
        };

        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('EmpresaFaviconUploadCtrl', [

    '$scope', '$modalInstance', 'MidiaService', 'GeralFactory',

    function($scope, $modalInstance, MidiaService, GeralFactory) {

        $scope.favicon = null;

        $modalInstance.opened.then(function() {

            $scope.emp_cod_emp = $scope.params.emp_cod_emp;
            $scope.getFavicon();
        });

        /**
         *
         */
        $scope.upload = function(file, event) {

            $scope.salvarFaviconLoading = true;

            if (file === undefined || file === null) {

                GeralFactory.notify('warning', 'Atenção!', 'Caro usuário, selecione ao menos um arquivo para efetuar o envio!');
                $scope.salvarFaviconLoading = false;

            } else {

                if ($scope.emp_cod_emp !== null) {

                    var objeto = {
                        mid_tab     : 7,
                        mid_status  : 1,
                        mid_posicao : '',
                        mid_link    : ''
                    };

                    MidiaService.upload(file, objeto, function() {

                        GeralFactory.notify('success', 'Sucesso!', 'Favicon cadastrado com sucesso!');

                        $scope.picFile              = null;
                        $scope.salvarFaviconLoading = false;
                        $scope.getFavicon();
                    });
                }
            }
        };

        /**
         *
         */
        $scope.getFavicon = function() {

            if ($scope.emp_cod_emp) {

                var query = 'q=(mid_tab:7)';
                MidiaService.midias.get({u : query}, function(retorno) {

                    if (retorno.records.length) {

                        var qtdeFavs = retorno.records.length;
                        $scope.favicon = retorno.records[qtdeFavs - 1];
                    }
                });
            }
        };

        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('EmpresaNfeUploadCtrl', [

    '$scope', '$modalInstance', 'VendaService', 'GeralFactory',

    function($scope, $modalInstance, VendaService, GeralFactory) {

        $scope.objNfe = {};


        $modalInstance.opened.then(function() {

            $scope.emp_cod_emp = $scope.params.emp_cod_emp;
            //$scope.getFavicon();

            $modalInstance.objSelected = {};
            $scope.objNfe.emp_nfe_pwd = '';
        });

        /**
         *
         */
        $scope.atualizarDadosNfe = function(file, event) {

            $scope.salvarNfeLoading = true;

            console.log('file:',file);

            if($scope.objNfe.emp_nfe_pwd == '') {
                $scope.salvarNfeLoading = false;
                GeralFactory.notify('danger', 'Erro!', 'A senha precisa de ser preenchida');
                return false;
            }

            if ($scope.emp_cod_emp !== null) {

                if($scope.objNfe.emp_nfe_pwd != '') {
                    var objeto = {
                        emp_nfe_pwd: $scope.objNfe.emp_nfe_pwd,
                    };
                } else {

                }

                VendaService.nfeUpload(file, objeto,function(retorno) {

                    var ret = retorno.records;


                    if(!ret.error) {

                        GeralFactory.notify('success', 'Sucesso!', 'Dados de NFe atualizados com sucesso!');

                        if(file != undefined) {

                            console.log('iff');
                            $modalInstance.objSelected.nomeArquivo = file.name;
                        } else {
                            console.log('elseee');
                        }

                        $scope.salvarNfeLoading = false;


                    } else {
                        GeralFactory.notify('danger', 'Erro!', ret.msg);
                    }

                });
            }
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };
    }
]);

angular.module('newApp').controller('TermoAdesaoModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$window', '$uibModalInstance', 'Storage', 'GeralFactory', 'AuthTokenFactory',

    function($scope, $rootScope, $timeout, $window, $uibModalInstance, Storage, GeralFactory, AuthTokenFactory) {

        $scope.forms       = {};
        $scope.objParceiro = {};

        $uibModalInstance.opened.then(function() {

            $timeout(function() {
                var arrUsuario = Storage.usuario.getUsuario();
                if (arrUsuario.is_cdl) {

                    $scope.objEmpresa.is_parceiro = 1;
                    $scope.objParceiro = {
                        'nome'       : 'CÂMARA DE DIRIGENTES LOJISTAS DE UBERLÂNDIA',
                        'alias'      : 'CDL UDI',
                        'sigla'      : 'CDL',
                        'endereco'   : 'Avenida Belo Horizonte, 1290.',
                        'cnpj'       : '19.460.807/0001-35',
                        'contato'    : '(34) 3239-3400',
                        'cidade'     : 'Uberlândia (MG)',
                        'url_portal' : 'www.cdlnfe.com.br',
                        'url_helper' : 'http://suporte.cdlnfe.com',
                        'vlr_basico' : 'R$ 90,00'
                    };
                } else {

                    $scope.objEmpresa.is_parceiro = 0;
                    $scope.objParceiro = {
                        'nome'       : 'LOJISTA VIRTUAL',
                        'alias'      : 'LOJISTA VIRTUAL',
                        'sigla'      : 'LOJISTA',
                        'endereco'   : 'Avenida Governador Rondon Pacheco, 3338',
                        'cnpj'       : '04.907.793/0001-88',
                        'contato'    : '(34) 3236-1002',
                        'cidade'     : 'Uberlândia (MG)',
                        'url_portal' : 'www.lojistavirtual.com.br',
                        'url_helper' : 'http://sac.lojistavirtual.com.br',
                        'vlr_basico' : 'R$ 80,00'
                    };
                }
            });

            $uibModalInstance.hasAlteracao = false;
        });


        /**
         * Método responsável em aceitar o termo de adesão.
         */
        $scope.aceitar = function() {

            $scope.termoAdesaoSimLoading = true;
            if (! _.isEmpty($scope.objEmpresa)) {

                $timeout(function() {
                    $scope.objEmpresa.emp_termo_adesao = 1;
                    $scope.salvar('termoAdesaoSimLoading');
                });
            }
        };


        /**
         * Método responsável em negar o termo de adesão.
         */
        $scope.negar = function() {

            $scope.termoAdesaoNaoLoading = true;
            if (! _.isEmpty($scope.objEmpresa)) {

                $timeout(function() {
                    $scope.objEmpresa.emp_termo_adesao = 2;
                    $scope.salvar('termoAdesaoNaoLoading');
                });
            }
        };


        /**
         * Método responsável em gerar o termo de ADESÃO para impressão.
         */
        $scope.imprimir = function() {

            if (! _.isEmpty($scope.objEmpresa)) {

                var strFiltro  = GeralFactory.formatarPesquisar({
                    'acao'        : 'I',
                    'cod_termo'   :  1,
                    'ken'         : AuthTokenFactory.getToken(),
                    'is_parceiro' : $scope.objEmpresa.is_parceiro,
                    'ident_emp'   : $scope.objEmpresa.emp_ident_emp
                });

                var url = GeralFactory.getUrlApi() + '/erp/export/termo/?' + strFiltro;
                $window.open(url, 'Termo de Adesão');
            }
        };


        /**
         * Salva os dados da empresa com o termo de adesão.
         */
        $scope.salvar = function(strLadda) {

            $timeout(function() {

                $scope[strLadda] = false;
                $uibModalInstance.hasAlteracao = true;
                $scope.fecharModal('reload');

            }, 2000);
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);