'use strict';

angular.module('newApp')

    .controller('FaturaCtrl', [

        '$scope', '$route', '$timeout', '$rootScope', 'FaturaService', 'GeralFactory',

        function($scope, $route, $timeout, $rootScope, FaturaService, GeralFactory) {

            if ($rootScope.isLogado) {

                $rootScope.sair(true);
                $timeout(function() {

                    console.log('Efetuar o reload da rota!');
                    $route.reload();

                }, 2000);
            }

            $scope.forms = {};
            $scope.error = false;

            $scope.objCreditCard = {};
            $scope.objResponse   = {};
            $scope.objPayment    = {};
            $scope.objCompany    = {
                access_token       : '',
                company_code       : 0,
                company_identifier : 1000
            };


            /* Verifica se o token de pagamento é válido. */
            $scope.verificarTokenPgto = function(token) {

                $rootScope.spinnerList.on();
                $scope.objCompany.access_token = token;

                var strFiltro = GeralFactory.formatarPesquisar({k : token});
                var objFiltro = {
                    company : '1000',
                    filter  : strFiltro
                };

                FaturaService.token.verificar(objFiltro, function(retorno) {
                    if (retorno.records.error) {

                        $scope.error = true;
                        $rootScope.spinnerList.off();
                        GeralFactory.notify('danger', 'Erro', retorno.records.msg);

                    } else {

                        console.log('Message: ', retorno.records.msg);
                        var objCompany = retorno.records.data;
                        $timeout(function() {

                            $scope.objCompany.company_code       = objCompany.company_code;
                            $scope.objCompany.company_identifier = objCompany.company_identifier;
                            $scope.getCobranca();

                        }, 1000);
                    }
                });
            };


            /* Retorna os dados da cobrança para construção da tela de pagamento. */
            $scope.getCobranca = function() {

                var strFiltro = GeralFactory.formatarPesquisar({k : $scope.objCompany.access_token});
                var objFiltro = {
                    filter  : strFiltro,
                    company : $scope.objCompany.company_identifier
                };

                FaturaService.cobranca.get(objFiltro, function(retorno) {
                    if (retorno.records.error) {

                        $scope.error = true;
                        $rootScope.spinnerList.off();
                        GeralFactory.notify('danger', 'Erro', retorno.records.msg);

                    } else {

                        $rootScope.spinnerList.off();

                        var objStatus  = {};
                        var objRetorno = retorno.records.data;
                        switch (objRetorno.finance.status) {

                            case 'paid':
                                objStatus = {
                                    text  : 'Paga',
                                    style : 'invoice-badge-green'
                                };
                                break;

                            case 'pending':
                                objStatus = {
                                    text  : 'Pendente',
                                    style : 'invoice-badge-yellow'
                                };
                                break;

                            case 'expired':
                                objStatus = {
                                    text  : 'Expirado',
                                    style : 'invoice-badge-gray'
                                };
                                break;
                        }

                        objRetorno.status = objStatus;
                        $scope.objPayment = objRetorno;
                    }
                });
            };
            

            /* Efetua o pagamento da cobrança. */
            $scope.efetuarPgto = function() {

                $scope.salvarPgtoLoading = true;
                $scope.$watch('forms.form_cc', function(form) {
                    if (form.$invalid) {

                        $scope.submitted = true;
                        $scope.salvarPgtoLoading = false;
                        GeralFactory.notify('danger', 'Erro', 'Caro usuário, atente-se para os campos de preenchimento obrigatório!');

                    } else {

                        var objPayment = {
                            'cc'      : $scope.objCreditCard,
                            'token'   : $scope.objCompany.access_token,
                            'company' : $scope.objCompany.company_identifier
                        };

                        FaturaService.cobranca.pagar(objPayment, function(retorno) {

                            var style = (retorno.records.error) ? 'alert-danger' : 'alert-success';
                            $timeout(function() {

                                angular.element('#box-form-pgto').fadeOut('slow');
                                angular.element('#box-mssg-pgto').fadeIn('slow');

                                $scope.salvarPgtoLoading = false;
                                $scope.objResponse = {
                                    style   : style,
                                    error   : retorno.records.error,
                                    message : retorno.records.msg
                                };

                            }, 1000);
                        });
                    }
                });
            };


            /* Verifica se a fatura esta pendente para mostrar o formulário de pagamento via cartão */
            $scope.isPending = function() {

                var status = $scope.objPayment.finance.status;
                return (status === 'pending');
            };


            /* Limpa os campos do formulário do cartão para o usuário tentar novamente em caso de erro */
            $scope.tentarNovamente = function() {

                $scope.objCreditCard = {};
                $scope.forms.form_cc.$setPristine();

                $timeout(function() {

                    angular.element('#box-mssg-pgto').fadeOut('slow');
                    angular.element('#box-form-pgto').fadeIn('slow');
                    $scope.objResponse = {};

                }, 1000);
            };
        }
    ]);