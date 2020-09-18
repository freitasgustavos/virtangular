
angular.module('newApp').controller('MeuPlanoCtrl', [

    '$scope', '$rootScope', '$timeout', '$window', '$uibModal', 'GeralFactory', 'PlanoService', 'EmpresaService', 'Storage', 'TermoAceite', 'AuthTokenFactory', 'Wizard',
    
    function ($scope, $rootScope, $timeout, $window, $uibModal, GeralFactory, PlanoService, EmpresaService, Storage, TermoAceite, AuthTokenFactory, Wizard) {

        $scope.arrPlanos   = [];
        $scope.arrSolucoes = [];
        $scope.objStatus   = {};
        $scope.objData     = {};


        $scope.objSelecionados = {
            plano   : null,
            index   : null,
            solucao : null
        };


        $rootScope.hasAutorizacao();
        $scope.$on('$viewContentLoaded', function() {

            $scope.setAbaInicial(1);
            $scope.meuPlano();

            $timeout(function () {
                Wizard.loadWizards.initialize(54);
            }, 2000);
        });


        /**
         * Construtor que chama as principais funções da tela de meu plano.
         */
        $scope.meuPlano = function() {

            $scope.getDataCorrente();
            $scope.listarPlanos();
            $scope.listarSolucoes();
        };


        /**
         * Lista os planos e soluções da empresa em questão.
         */
        $scope.listarPlanos = function() {

            // 'sol_status' : 1
            var strFiltro = GeralFactory.formatarPesquisar({
                'emp_ident_emp' : $rootScope.objUsuario.ident_emp
            });

            PlanoService.planos.get({u : strFiltro}, function(retorno) {
                if (! _.isEmpty(retorno.records)) {

                    $scope.vlrTotalPlanos = 0;
                    $scope.arrPlanos = retorno.records;

                    console.log('Planos da empresa: ', $scope.arrPlanos);
                    angular.forEach($scope.arrPlanos, function(item) {

                        var valor = parseFloat(item.iva_valor);
                        $scope.vlrTotalPlanos += valor;
                    });

                    // Verifica o status da empresa:
                    var arrFirst = $scope.arrPlanos[0];
                    $timeout(function() {

                        $scope.getPlano(arrFirst, 0);
                        $scope.getVerificaStatus(arrFirst);
                        $scope.listarTitulos();

                    }, 3000);
                }
            });
        };


        /**
         * Lista as soluções existentes para oferecer ao usuário da aplicação.
         */
        $scope.listarSolucoes = function() {

            var strFiltro = 'q=(arr_sis_cod_sol:2|7|10|11|12|13)';

            PlanoService.solucoes.get({u : strFiltro}, function(retorno) {
                if (! _.isEmpty(retorno.records)) {

                    $scope.arrSolucoes = retorno.records;
                    $scope.setDetalhesEmpresa();
                    $timeout(function() {

                        $scope.verificarSolucaoEmpresa();
                        console.log('Soluções exitentes: ', retorno.records);

                    }, 3000);
                }
            });
        };


        /**
         * Método responsável em verificar quais planos e preços uma determinada empresa detém
         * para uma determinada solução.
         */
        $scope.setDetalhesEmpresa = function() {

            angular.forEach($scope.arrSolucoes, function(solucao, k) {

                angular.forEach($scope.arrPlanos, function(plano) {

                    if (solucao.sol_cod_sol === plano.sol_cod_sol) {

                        $scope.arrSolucoes[k].sol_has_sol = true;

                        angular.forEach($scope.arrSolucoes[k].sol_sis_tpl, function(item, i) {

                            if (item.tpl_cod_tpl === plano.tpl_cod_tpl) {

                                $scope.arrSolucoes[k].sol_sis_tpl[i].tpl_has_tpl = true;

                                angular.forEach($scope.arrSolucoes[k].sol_sis_tpl[i].tpl_sis_iva, function(preco, j) {

                                    if (preco.iva_periodicidade === plano.iva_periodicidade) {

                                        $scope.arrSolucoes[k].sol_sis_tpl[i].tpl_sis_iva[j].iva_has_periodicidade = true;
                                    }
                                });
                            }
                        });
                    }
                });
            });
        };


        /**
         * Recolhe o mês e o ano corrente para verificar os títulos da empresa.
         */
        $scope.getDataCorrente = function() {

            var date = new Date();
            $scope.objData = {
                'dia' : date.getDate(),
                'mes' : date.getMonth(),
                'ano' : date.getFullYear()
            };

            var arrMeses = GeralFactory.getArrMeses(1);
            $scope.objData['mes_extenso'] = arrMeses[$scope.objData.mes];
        };


        /**
         * Verifica o status de uma determinada empresa.
         */
        $scope.getVerificaStatus = function(objPlano) {

            var objUsuario = $rootScope.objUsuario;
            console.log('USUÁRIO: ', objUsuario);
            
            if (objUsuario.meu_plano === null) {

                $scope.objStatus = {
                    'cta_status_class' : 'btn-success',
                    'cta_status_text'  : 'Pagamento Confirmado'
                };

            } else {

                var situacao = objUsuario.meu_plano.tit_situacao;
                switch (situacao) {
                    case 'VENCENDO':
                        $scope.objStatus = {
                            'cta_status_class' : 'btn-warning',
                            'cta_status_text'  : 'Pagamento a Expirar'
                        };
                        break;
                    case 'VENCIDO':
                    case 'EXPIRADO':
                        $scope.objStatus = {
                            'cta_status_class' : 'btn-danger',
                            'cta_status_text'  : 'Pagamento Pendente'
                        };
                        break;
                }
            }

            /**
             * var status = objPlano.cta_status_ativo;
             * switch (status) {
             *    case 0:
             *    case 1:
             *    case 3:
             *    case 4:
             *    case 5:
             *       $scope.objStatus = {
             *           'cta_status_ativo' :  objPlano.cta_status_ativo,
             *           'cta_status_class' : 'btn-danger',
             *           'cta_status_text'  : 'Pagamento Pendente'
             *       };
             *       break;
             *   case 2:
             *       $scope.objStatus = {
             *           'cta_status_ativo' :  objPlano.cta_status_ativo,
             *           'cta_status_class' : 'btn-success',
             *           'cta_status_text'  : 'Pagamento Confirmado'
             *       };
             *       break;
             * }
             */
        };


        /**
         * Método responsável em listar os títulos em aberto para uma determinada empresa.
         */
        $scope.listarTitulos = function() {

            if (_.isEmpty($rootScope.objUsuario)) {

                var mensagem = 'Não foi possível recuperar os dados da empresa para listar seus pagamentos!';
                GeralFactory.notify('warning', 'Atenção:', mensagem);

            } else {

                var objMes = GeralFactory.getInicioFimMes(), tipo = 'DV';

                // Recolhendo a lista de títulos da empresa na base padrão do Lojista Virtual:
                var cadCodCad = $rootScope.objUsuario.ident_emp;
                var strFiltro = GeralFactory.formatarPesquisar({
                    'tit_sistema'          : 1,
                    'tit_transacao'        : 1,
                    'tit_situacao_naopago' : 1,
                    'tit_dat_op'           : tipo,
                    'fin_cad_cod_cad'      : cadCodCad,
                    'tit_dat_end'          : objMes.dtFinal
                });

                PlanoService.pagamentos.get({u : strFiltro}, function(retorno) {
                    if (! _.isEmpty(retorno.records)) {

                        $scope.vlrTotalTitulos = 0;
                        $scope.arrTitulos = retorno.records;

                        angular.forEach($scope.arrTitulos, function(item) {

                            var valor = parseFloat(item.tit_doc_vlr_liquido);
                            $scope.vlrTotalTitulos += valor;
                        });
                    }
                });
            }
        };


        /**
         * Recolhe os dados de uma determinada solução escolhida pelo usuário.
         */
        $scope.getPlano = function(objPlano, key) {

            console.log('Plano selecionado: ', objPlano);

            $scope.objSelecionados.index = key;
            $scope.objSelecionados.plano = objPlano;
            $scope.verificarSolucaoEmpresa();
        };


        /**
         * Método responsável em verificar a solução que uma determinada empresa adquiriu.
         */
        $scope.verificarSolucaoEmpresa = function() {
            if (! _.isEmpty($scope.arrSolucoes)) {

                angular.forEach($scope.arrSolucoes, function(item) {

                    if (item.sol_cod_sol === $scope.objSelecionados.plano.sol_cod_sol) {
                        $scope.getPlanosBySolucao(item);
                    }
                });
            }
        };


        /**
         * Método responsável em recolher os planos de uma determinada solução.
         */
        $scope.getPlanosBySolucao = function(objSolucao) {

            console.log('Solução selecionada: ', objSolucao);
            $scope.objSelecionados.solucao = objSolucao;
        };


        /**
         * Método responsável em efetuar o upgrade de planos para uma empresa.
         */
        $scope.upgrade = function(objeto) {

            var validar = $scope.validar(objeto);
            if (validar['error']) {

                GeralFactory.notify('warning', 'Atenção:', validar['msg']);

            } else {

                var idEmpresa  = Storage.usuario.getUsuario()['ident_emp'];
                var objUpgrade = {
                    'sol_status'            : 1,
                    'sol_cod_cta'           : idEmpresa,
                    'sol_tpl_cod_tpl'       : objeto.tpl_cod_tpl,
                    'sol_cod_sol'           : $scope.objSelecionados.solucao.sol_cod_sol,
                    'sol_iva_periodicidade' : $scope.objSelecionados.plano.iva_periodicidade
                };

                GeralFactory.confirmar('Deseja alterar seu plano?', function() {

                    PlanoService.solucoes.upgrade(objUpgrade, function(retorno) {
                        if (! _.isEmpty(retorno.records)) {

                            $timeout(function() {
                                $scope.meuPlano();
                            });
                        }
                    });
                });
            }
        };


        /**
         * Método responsável em validar os dados antes de efetuar a mudança de plano/solução.
         */
        $scope.validar = function(objeto) {

            if (! _.isEmpty(objeto)) {

                for (var i = 0; i < $scope.arrPlanos.length; i++) {

                    if (objeto.tpl_sol_cod_sol === $scope.arrPlanos[i].sol_cod_sol) {

                        // Verificando a prioridade do plano:
                        if (objeto.tpl_prioridade < $scope.arrPlanos[i].tpl_prioridade) {

                            var mensagem = 'Caro usuário, você não pode efetuar a mudança para um plano inferior ao seu plano atual!';
                            return {
                                'error' : true,
                                'msg'   : mensagem
                            };
                        }

                        // Verificando se é o mesmo plano:
                        if (objeto.tpl_cod_tpl === $scope.arrPlanos[i].tpl_cod_tpl) {

                            var mensagem = 'Caro usuário, você já possui o plano escolhido!';
                            return {
                                'error' : true,
                                'msg'   : mensagem
                            };
                        }
                    }
                }
            }

            return {'error' : false};
        };


        /**
         * Método responsável em listar os documentos principais da empresa.
         */
        $scope.getTermo = function(codTermo) {

            switch (codTermo) {
                case 1:
                    $scope.verificarTermoAdesao();
                    break;
                case 2:
                    $scope.verificarTermoAceite();
                    break;
            }
        };


        /**
         * Método responsável em verificar se a empresa já assinou o termo de adesão.
         */
        $scope.verificarTermoAdesao = function() {

            var adesao = parseInt(Storage.usuario.getUsuario()['emp']['emp_termo_adesao']);
            if (adesao === 1) {

                $scope.downloadTermo(1);

            } else {

                EmpresaService.empresa.get({emp_cod_emp : '1'}, function(retorno) {
                    if (! _.isEmpty(retorno.records)) {

                        $scope.objEmpresa = retorno.records;
                        $scope.showTermoAdesao();
                    }
                });
            }
        };


        /**
         * Método responsável em mostrar a janela modal com os dados do termo de adesão.
         */
        $scope.showTermoAdesao = function() {

            var scope = $rootScope.$new();
            scope.objEmpresa = $scope.objEmpresa;

            var modalInstance = $uibModal.open({
                animation   :  true,
                templateUrl : 'home/views/janela-termo-adesao.html',
                controller  : 'TermoAdesaoModalCtrl',
                size        : 'lg',
                windowClass : 'center-modal modal-termo-adesao',
                backdrop    : 'static',
                scope       :  scope,
                resolve     :  { }
            });

            modalInstance.result.then(function(id) { }, function(msg) {
                if (msg === 'reload') {

                    scope.$destroy();
                    if (modalInstance.hasAlteracao) {
                        $scope.finalizar();
                    }
                }
            });
        };


        /**
         * Finalização do termo de adesão conforme a escolha do usuário.
         */
        $scope.finalizar = function() {

            delete $scope.objEmpresa.emp_nfe_pwd;
            delete $scope.objEmpresa.emp_nfe_cert_arq;

            EmpresaService.empresa.update($scope.objEmpresa, function(retorno) {
                if (! retorno.records.error) {

                    $scope.enviarEmail();
                    $timeout(function() {
                        $rootScope.setSisEmp($scope.objEmpresa);
                    }, 1000);
                }
            });
        };


        /**
         * Enviar e-mail com o termo de adesão.
         */
        $scope.enviarEmail = function() {

            var objEmpresa = $scope.objEmpresa;
            objEmpresa.cod_termo = 1;

            EmpresaService.termo.enviarEmail(objEmpresa, function(retorno) {

                var arrUsuario = Storage.usuario.getUsuario();
                arrUsuario['emp'].emp_termo_adesao = 1;

                Storage.implementacao.clear();
                $rootScope.setUsuario(arrUsuario);

                var classe = (retorno.records.error) ? 'warning' : 'success';
                GeralFactory.notify(classe, 'Atenção!', retorno.records.msg);
            });
        };


        /**
         * Método responsável em verificar se a empresa já assinou o termo de aceite.
         */
        $scope.verificarTermoAceite = function() {

            var aceite = parseInt(Storage.usuario.getUsuario()['emp']['emp_termo_aceite']);
            aceite === 1 ? $scope.downloadTermo(2) : TermoAceite.init();
        };


        /**
         * Método responsável em efetuar o download de um determinado tipo de termo.
         */
        $scope.downloadTermo = function(codTermo) {

            var strFiltro = GeralFactory.formatarPesquisar({
                'ken'       : AuthTokenFactory.getToken(),
                'cod_termo' : codTermo
            });

            var url = GeralFactory.getUrlApi() + '/erp/export/termo/download/?' + strFiltro;
            $window.open(url, 'Download do Termo');
        };


        /**
         * Inicializa uma determinada aba para ficar ativa.
         */
        $scope.setAbaInicial = function(id) {

            switch (id) {
                case 1:
                    $scope.tabs = [{active : true }, {active : false}, {active : false}];
                    break;
                case 2:
                    $scope.tabs = [{active : false}, {active : true }, {active : false}];
                    break;
                case 3:
                    $scope.tabs = [{active : false}, {active : false}, {active : true }];
                    break;
            }
        };
    }
]);
