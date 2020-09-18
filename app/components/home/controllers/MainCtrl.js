angular.module('newApp').controller('MainCtrl', [

    '$rootScope', '$scope', 'applicationService', 'quickViewService', 'pluginsService', '$location', '$sce', 'Storage', 'CONFIG', 'AuthTokenFactory', 'LoginService', 'EmpresaService', 'GeralFactory', 'NotificacaoService', 'jwtHelper', '$window', '$timeout', 'Initialize', 'ScriptChat', 'TermoAceite', 'WizardService',

    function ($rootScope, $scope, applicationService, quickViewService, pluginsService, $location, $sce, Storage, CONFIG, AuthTokenFactory, LoginService, EmpresaService, GeralFactory, NotificacaoService, jwtHelper, $window, $timeout, Initialize, ScriptChat, TermoAceite, WizardService) {

        $(document).ready(function () {
            applicationService.init();
            quickViewService.init();
            pluginsService.init();
        });

        $scope.$on('$viewContentLoaded', function () {
            pluginsService.init();
            applicationService.customScroll();
            applicationService.handlePanelAction();

            $('.nav.nav-sidebar .nav-active').removeClass('nav-active active');
            $('.nav.nav-sidebar .active:not(.nav-parent)').closest('.nav-parent').addClass('nav-active active');

            if ($location.$$path === '/' || $location.$$path === '/layout-api') {
                $('.nav.nav-sidebar .nav-parent').removeClass('nav-active active');
                $('.nav.nav-sidebar .nav-parent .children').removeClass('nav-active active');
                if ($('body').hasClass('sidebar-collapsed') && !$('body').hasClass('sidebar-hover')) return;
                if ($('body').hasClass('submenu-hover')) return;
                $('.nav.nav-sidebar .nav-parent .children').slideUp(200);
                $('.nav-sidebar .arrow').removeClass('active');
            }

            TermoAceite.init();
            Initialize.verificarPlano();

            $rootScope.scriptChat = '';
            $rootScope.scriptChat = ScriptChat.getScript();
        });

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };

        $rootScope.documentCache = CONFIG.CACHE_DOC;
        $rootScope.imageCache = CONFIG.CACHE_IMG;
        $rootScope.isLogado = Storage.usuario.isLogado();
        $rootScope.objUsuario = Storage.usuario.getUsuario();

        $rootScope.setUsuario = function (objUsuario) {
            if (objUsuario) {
                Storage.usuario.init(objUsuario);
                $rootScope.isLogado = Storage.usuario.isLogado();
                $rootScope.objUsuario = Storage.usuario.getUsuario();
            }
        };

        $rootScope.getPermissao = function (modCorrente) {

            var arrUsuario = Storage.usuario.getUsuario();
            if (arrUsuario) {

                if (!_.isEmpty(arrUsuario.arr_modulos)) {

                    if (_.contains(arrUsuario.arr_modulos, modCorrente)) {
                        return true;
                    }
                }
            }
            return false;
        };

        $rootScope.getPermissaoSol = function (codSol) {

            codSol = parseInt(codSol);
            var arrUsuario = Storage.usuario.getUsuario();
            if (arrUsuario) {

                if (!_.isEmpty(arrUsuario.arr_solucoes)) {

                    if (_.contains(arrUsuario.arr_solucoes, codSol)) {
                        return true;
                    }
                }
            }
            return false;
        };

        $rootScope.getPermissaoPlan = function (codPlan) {

            codPlan = parseInt(codPlan);
            var arrUsuario = Storage.usuario.getUsuario();
            if (arrUsuario) {

                if (!_.isEmpty(arrUsuario.arr_planos)) {

                    if (_.contains(arrUsuario.arr_planos, codPlan)) {
                        return true;
                    }
                }
            }
            return false;
        };

        $rootScope.getPermissaoSolRestrita = function (codSol) {

            codSol = parseInt(codSol);
            var arrSolucoes = [2, 7, 10, 11], arrUsuario = Storage.usuario.getUsuario(); // Remoção do 16!

            if (arrUsuario) {
                if (!_.isEmpty(arrUsuario.arr_solucoes)) {
                    var arrSolucoesTemp = [];
                    angular.forEach(arrUsuario.arr_solucoes, function (i) {
                        if (GeralFactory.inArray(i, arrSolucoes)) {
                            arrSolucoesTemp.push(i);
                        }
                    });

                    if (!_.isEmpty(arrSolucoesTemp)) {
                        if (arrSolucoesTemp.length === 1) {
                            var codSolTemp = arrSolucoesTemp[0];
                            if (codSolTemp === codSol) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        };

        $rootScope.objLogin = {
            redirect: false,
            isLogado: $rootScope.isLogado
        };

        $rootScope.maphilight = function () {
            $('.maphilight').maphilight();
        };

        /**
         * Verifica se o usuário já esta logado na aplicação para efetuar
         * as devidas tratativas de redirecionamento.
         */
        if ($rootScope.objLogin.isLogado) {
            $rootScope.objLogin.redirect = true;
            if ($location.$$path === '/login') {
                $location.path('/');
            }
        }

        $rootScope.logout = function () {

            var msg = 'Deseja realmente sair?';
            msg = $sce.trustAsHtml(msg);

            GeralFactory.confirmar(msg, function () {

                $rootScope.sair(true);
            });
        };

        $rootScope.sair = function (flag) {

            if (flag) {

                LoginService.logout.get({}, function (resposta) {
                    if (!resposta.records.error) {
                        Storage.implementacao.clear();
                        window.localStorage.removeItem('wizard');

                        $rootScope.isLogado = Storage.usuario.isLogado();
                        $rootScope.objUsuario = {};

                        AuthTokenFactory.setToken();
                        // socket.emit('disconnect2', {});

                        location.reload('/');
                    }
                });
            }
        };

        // $scope.setSocket = function () {
        //
        //     socket.emit('subscribe', {});
        //
        //     socket.on('receberMensagem', function (data) {
        //         GeralFactory.notificacaoHtml5(data);
        //
        //         $rootScope.arrNotificacao.push(data);
        //         $rootScope.arrContNaoLeuBadge.push(1);
        //     });
        // };

        $rootScope.notificacao = function () {

            // $scope.setSocket();
            var strFiltro = 'q=(not_usuario_leu:0)';

            NotificacaoService.notificacoes.get({u: strFiltro}, function (retorno) {

                $rootScope.arrContNaoLeuBadge = [];
                $rootScope.arrNotificacao = retorno.records;

                angular.forEach(retorno.records, function (reg) {
                    if (reg.not_usuario_leu_badge != '1') {

                        $rootScope.arrContNaoLeuBadge.push(0);
                    }
                });
            });
        };

        $rootScope.atualizarLeuNotBadge = function () {
            if ($rootScope.arrContNaoLeuBadge.length > 0) {

                NotificacaoService.notificacoes.atualizarLeuBadge({}, function (retorno) {

                    if (!retorno.records.error) {

                        $rootScope.arrContNaoLeuBadge = [];
                    }
                });
            }
        };


        /**
         * Notificações do sistema e verificação do ambiente no qual o usuário
         * da aplicação está logado: Mobile ou Navegador convencional.
         */
        $rootScope.notificacao();
        if (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)
        ) {
            $rootScope.isMobile = true;
        } else {
            $rootScope.isMobile = false;
        }


        /**
         * Spinner utilizado em todas as listagens do sistema.
         */
        $rootScope.spinnerList = {
            active: false,
            on: function () {
                this.active = true;
            },
            off: function () {
                this.active = false;
            }
        };


        /**
         * Spinner utilizado em todos os formulário com abas do sistema.
         */
        $rootScope.spinnerForm = {
            active: false,
            on: function () {
                this.active = true;
            },
            off: function () {
                this.active = false;
            }
        };


        /**
         * Verifica se o usuário tem autorização para acessar a aplicação.
         */
        $rootScope.hasAutorizacao = function () {

            var store = $window.localStorage, key = 'auth-token-virtux';

            function clear() {
                store.removeItem(key);
                Storage.implementacao.clear();

                $rootScope.isLogado = Storage.usuario.isLogado();
                $rootScope.objUsuario = {};

                location.reload('/');
            }

            var tokenStorage = store.getItem(key);
            if (tokenStorage) {
                if (jwtHelper.isTokenExpired(tokenStorage)) {
                    clear();
                } else {
                    var objUsuario = Storage.usuario.getUsuario();
                    if (objUsuario.wizard === true) {
                        $location.path('/wizard');
                    }
                }
            } else {
                clear();
            }
        };


        /**
         * Método responsável em verificar se o usuário tem acesso ao menu de acordo com
         * os dados do plano de uma determinada empresa.
         */
        $rootScope.getVerificaMenu = function () {

            var objUsuario = Storage.usuario.getUsuario();
            if (objUsuario.emp.emp_cod_prc === 1 && objUsuario.meu_plano !== null &&
                objUsuario.meu_plano.tit_situacao === 'EXPIRADO') {

                return false;
            }

            return true;
        };


        /**
         * Método que inicializa os dados da empresa no objeto $rootScope da aplicação.
         */
        $rootScope.getSisEmp = function () {

            $timeout(function () {
                if ($rootScope.objEmpresa === undefined) {

                    EmpresaService.empresa.get({emp_cod_emp: '1'}, function (retorno) {
                        if (!retorno.records.error) {

                            retorno.records.emp_ativo_gn = retorno.records.emp_ativo_gn == 1;
                            retorno.records.emp_ativo_cielo = retorno.records.emp_ativo_cielo == 1;
                            retorno.records.emp_ativo_pagseg = retorno.records.emp_ativo_pagseg == 1;

                            // Atribuindo os dados da empresa ao $rootScope da aplicação:
                            $rootScope.objEmpresa = retorno.records;
                        }
                    });
                }
            }, 1000);
        };


        /**
         * Método responsável em redirecionar o usuário para o manual do módulo específico.
         */
        $rootScope.redirectManual = function (sigla) {

            var url = '';
            switch (sigla) {
                case 'CLI':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/cadastros-clientesfornecedores/cadastro-de-clientes/';
                    break;

                case 'FOR':
                case 'TRA':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/cadastros-clientesfornecedores/cadastro-de-fornecedores/';
                    break;

                case 'PRO':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/produtos/produtos/';
                    break;

                case 'SER':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/servicos-2/cadastro/';
                    break;

                case 'PRESTSERV':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/produtos/';
                    break;

                case 'AGP':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/produtos/agrupamentos/';
                    break;

                case 'VEN':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/vendas/vendas-nf-e/';
                    break;

                case 'COM':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/compras/compras/';
                    break;

                case 'OUTENT':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/compras/outras-entradas/';
                    break;

                case 'DEVCOM':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/compras/devolucao-de-compra/';
                    break;

                case 'OUTSAI':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/vendas/outras-saidas/';
                    break;

                case 'ORC':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/vendas/orcamentos-dav/';
                    break;

                case 'DEV':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/vendas/devolucoes-de-vendas/';
                    break;

                case 'VEI':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/transporte/veiculos/';
                    break;

                case 'FRE':
                    url = 'http://sac.lojistavirtual.com.br/docs/gestao-empresarial/transporte/frete-cte/';
                    break;
            }

            url && $window.open(url, '_blank');
        };


        /**
         * Método responsável em atualizar os dados da empresa no objeto $rootScope da aplicação.
         */
        $rootScope.setSisEmp = function (objSisEmp) {

            $rootScope.objEmpresa = !_.isEmpty(objSisEmp) ? objSisEmp : undefined;
        };


        /**
         * Método responsável em retornar uma STRING contendo o título principal da aplicação.
         */
        $rootScope.getTituloApp = function () {

            var strTitulo = Storage.usuario.getUsuario()['sol_nome'];
            var objUsuario = Storage.usuario.getUsuario()['emp'];
            if (objUsuario) {

                if (objUsuario['emp_nome_razao'])
                    strTitulo = objUsuario['emp_nome_razao'];

                if (objUsuario['emp_fantasia'])
                    strTitulo = objUsuario['emp_fantasia'];
            }

            $timeout(function () {
                angular.element('title').text(strTitulo);
            });

            return strTitulo;
        };


        /**
         * Verifica se o usuário tem uma única solução possível passando o código da mesma.
         */
        $rootScope.hasOnlySolucao = function (codSolucao) {

            var arrSolucoes = Storage.usuario.getUsuario()['arr_solucoes'];
            if (arrSolucoes) {

                var qtdePlanos = arrSolucoes.length;
                if (qtdePlanos === 1) {

                    return (arrSolucoes[0] === codSolucao) ? true : false;
                }
            }

            return false;
        };


        $rootScope.setWizard = function (arrSteps, objConfigWizard) {

            $rootScope.objCurrentWizard = arrSteps;

            if(0 >= arrSteps.steps.length) return;
            var arr = [];
            if (arrSteps.steps[0].sequence == true)
                arr = [arrSteps.steps[0], arrSteps.steps[1]];
            else
                arr = [arrSteps.steps[0]];

            console.log('Arr: ', arr);

            $rootScope.setOptionsWizard(arr, objConfigWizard, true);

            console.log("arrSteps: ", arrSteps);
            console.log("CrrStep: ", arrSteps.steps[0]);

            if(arrSteps.steps[0]){
                // if(arrSteps.steps[0].ehMenu) {
                //     angular.element('#btn-gatilho-dashboard').triggerHandler('click');
                // }

                var el = arrSteps.steps[0].element;
                var ev = arrSteps.steps[0].event;
                var el_dest = arrSteps.steps[0].element_dest;
                if (el_dest != "#undefined" && el_dest != '#')
                    arrSteps.steps[0].element = el_dest;

                console.log((el_dest != "#undefined" && el_dest != '#'));
                console.log(el);

                var $side_mnu = $($('#mCSB_1').parent()[0]);


                angular.element(el).on(ev, function (event) {
                    angular.element('#btn-gatilho-dashboard').triggerHandler('click');

                    if(arrSteps.steps[0].ehMenu) {
                        $side_mnu.attr('style', 'position: absolute');
                        console.log($side_mnu);
                     } else
                        $side_mnu.attr('style', '');

                    var objOptions = {};
                    objOptions = {'highlightClass': 'introjs-background'};

                    arrSteps.steps.splice(0, 1);
                    console.log(arrSteps.steps);
                    angular.element(el).off();

                    $timeout(function(){
                        $rootScope.setWizard(arrSteps, objOptions);
                    }, 200);
                });
            }
        };

        $rootScope.setOptionsWizard = function (arrSteps, objConfigWizard, showBnts) {

            var objWizard = {
                steps: arrSteps,
                showStepNumbers: false,
                showProgress: false,
                showBullets: false,
                showButtons: true,
                exitOnOverlayClick: true,
                exitOnEsc: true,
                hidePrev: showBnts,
                hideNext: showBnts,
                nextLabel: '<strong>Próximo</strong>',
                prevLabel: '<strong>Anterior</strong>',
                doneLabel: '<strong>OK</strong>',
                skipLabel: '<strong>Sair</strong>'
            };

            objConfigWizard && Object.assign(objWizard, objConfigWizard);
            $rootScope.objRootWizard = objWizard;
        };

        $scope.CompletedEventRoot = function (scope) {
            console.log("Completed Event called");

            var last = IsLast();
            console.log('Último: ', last);
            console.log('Wizerd', $rootScope.objCurrentWizard);

            if (last) {
                console.log('Atualizar storage com complete TRUE do wizard! wizid: ' + $rootScope.objCurrentWizard.wizid);

                var jsonWizard = JSON.parse(window.localStorage.getItem('wizard'));

                for(var keyName in jsonWizard){
                    if(keyName == $rootScope.objCurrentWizard.mod)
                        jsonWizard[keyName][0].status = 1;
                }

                window.localStorage.setItem('wizard', JSON.stringify(jsonWizard));

                WizardService.updateWiz.update({u : $rootScope.objCurrentWizard.wizid}, function(retorno){
                    // console.log(retorno);
                });
            }
        };

        $scope.ExitEventRoot = function (scope) {
            console.log("Exit Event called");
        };

        $scope.ChangeEventRoot = function (targetElement, scope) {
            var step = this._currentStep;
            // console.log(step);
            console.log("Change Event called: ", step);
            // console.log(targetElement);
            // console.log(this);
        };

        $scope.BeforeChangeEventRoot = function (targetElement, scope) {
            // console.log("Before Change Event called");
            // console.log(targetElement);
        };

        $scope.AfterChangeEventRoot = function (targetElement, scope) {
            // console.log("After Change Event called");
            // console.log(targetElement);
        };

        /**
         * @returns {boolean}
         */
        function IsLast() {
            return (($rootScope.objCurrentWizard.steps.length) <= 0);
        }
    }
]);

// Controller para a página 404 do sistema:
angular.module('newApp').controller('404Controller', ['$rootScope',

    function ($rootScope) {

        $rootScope.hasAutorizacao();
        console.log('Entrou na página 404!');

    }
]);