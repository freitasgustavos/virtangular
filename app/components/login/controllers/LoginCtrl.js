'use strict';

angular.module('newApp')

    .controller('LoginCtrl', ['$scope', '$rootScope', '$routeParams', '$route', '$timeout', '$location', '$window', '$controller', 'LoginService', 'jwtHelper', '$sce', 'GeralFactory', 'ScriptChat', 'FaturaService',

        function($scope, $rootScope, $routeParams, $route, $timeout, $location, $window, $controller, LoginService, jwtHelper, $sce, GeralFactory, ScriptChat, FaturaService) {

            $scope.token        = '';
            $scope.forms        = {};
            $scope.objLogin     = {};
            $scope.objLembrete  = {};
            $scope.objResposta  = {};
            $scope.objRecuperar = {};
            $scope.objNovaConta = {};
            $scope.scriptChat   = '';
            $scope.ano = new Date().getFullYear();

            /**
             * A página de login deve ter o fundo claro.
             */
            $('body').css({
                'background' : '#f2f2f2'
            });

            /**
             * Objeto contedo as variáveis para manipulação da tela.
             */
            $scope.flags = {
                flagFormLogin      : true,
                flagFormSenha      : false,
                flagAtivaConta     : false,
                flagShowMsg        : false,
                flagSenha          : false,
                flagSalvarToken    : false,
                flagValidarToken   : false,
                flagFormCriarSenha : false,
                flagPgto           : false
            };

            /**
             * Script para o passo-a-passo na tela inicial
             * @type {string}
             */
            $scope.scriptWizard = '<script type="text/javascript">(function() {var walkme = document.createElement("script"); walkme.type = "text/javascript"; walkme.async = true; walkme.src = "https://cdn.walkme.com/users/66234c00dc0144df93e295c973701b3c/walkme_66234c00dc0144df93e295c973701b3c_https.js"; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(walkme, s); window._walkmeConfig = {smartLoad:true}; })();</script>';

            // $scope.scriptHotJar = "<!-- Hotjar Tracking Code for app.lojistavirtual.com.br --><script>(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:443534,hjsv:5};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'//static.hotjar.com/c/hotjar-','.js?sv=');</script>";

            /**
             * Nome e imagem utilizados para a solução lojista virtual.
             */
            if ($location.$$host.match(/cdlnfe/)) {

                $scope.nomeSolucao = 'CDL NF-e';
                $scope.nomeLogo    = 'logo-lojista-cdl-udia-white.png';
                $scope.imgLogin    = 'logo-lojista-cdl-udia.png';
                $scope.isCDL       =  true;
                // $scope.scriptChat  = '<script type="text/javascript"> var LHCChatOptions = {}; LHCChatOptions.opt = {widget_height:340,widget_width:300,popup_height:520,popup_width:500}; (function() { var po = document.createElement("script"); po.type = "text/javascript"; po.async = true; var referrer = (document.referrer) ? encodeURIComponent(document.referrer.substr(document.referrer.indexOf("://")+1)) : ""; var location  = (document.location) ? encodeURIComponent(window.location.href.substring(window.location.protocol.length)) : ""; po.src = "//chat.lojistavirtual.com.br/19609/index.php/por/chat/getstatus/(click)/internal/(position)/bottom_left/(ma)/br/(top)/350/(units)/pixels/(leaveamessage)/true?r="+referrer+"&l="+location; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(po, s); })(); </script>';
                var scriptChat  = '<script type="text/javascript">var mdChatClient="48F0CE94562A466C9C2E139ECC42684D";</script><script src="https://chat.movidesk.com/Scripts/chat-widget.min.js"></script>';

            } else {

                $scope.nomeSolucao = 'Lojista Virtual';
                $scope.nomeLogo    = 'logo-lojista-white.png';
                $scope.imgLogin    = 'logo-lojista-nova.png';
                $scope.isCDL       =  false;
                var scriptChat  = '<script type="text/javascript">var mdChatClient="C6DD542D990249F0A318510F36EDD48E";</script><script src="https://chat.movidesk.com/Scripts/chat-widget.min.js"></script>';
                // $scope.scriptChat  = '<script type="text/javascript"> var LHCChatOptions = {}; LHCChatOptions.opt = {widget_height:340,widget_width:300,popup_height:520,popup_width:500}; (function() { var po = document.createElement("script"); po.type = "text/javascript"; po.async = true; var referrer = (document.referrer) ? encodeURIComponent(document.referrer.substr(document.referrer.indexOf("://")+1)) : ""; var location  = (document.location) ? encodeURIComponent(window.location.href.substring(window.location.protocol.length)) : ""; po.src = "//chat.lojistavirtual.com.br/1000/index.php/por/chat/getstatus/(click)/internal/(position)/bottom_left/(ma)/br/(top)/350/(units)/pixels/(leaveamessage)/true?r="+referrer+"&l="+location; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(po, s); })(); </script>';
            }

            $.getScript( 'https://chat.movidesk.com/Scripts/chat-widget.min.js' )
                .done(function( script, textStatus ) {

                    $scope.scriptChat = scriptChat;
                })
                .fail(function( jqxhr, settings, exception ) {

                    console.log('erro ao carregar chat: ', jqxhr);
                });

            $timeout(function() {

                //inicia o chat antes do login
                $rootScope.scriptChat = $sce.trustAsHtml($scope.scriptChat);
            }, 2000);

            $timeout(function() {

                angular.element('title').text($scope.nomeSolucao);
            });

            /**
             * Verifica se o usuário deverá ser redirecionado para a página
             * contendo o formulário para recuperação de senha.
             */
            if ($location.$$path.match(/recuperar-senha/)) {

                var token = $location.$$path.split('/recuperar-senha/');
                $scope.token = token[1];

                if (token[1] === '') {

                    $scope.flags.flagSenha = false;

                } else {

                    $scope.flags.flagSenha = true;
                    var objeto = {token : $scope.token};

                    LoginService.password.validar(objeto, function(retorno) {
                        if (retorno.records.error) {

                            $scope.flags.flagValidarToken = true;
                            $scope.msgValidarToken = 'Caro usuário, ocorreu um erro ao tentar recuperar sua senha!';

                        } else {

                            $timeout(function() {
                                $scope.flags.flagValidarToken = false;
                            }, 1000);
                        }
                    });
                }
            }

            if ($location.$$path.match(/aitva-conta/)) {

                $scope.flags.flagAtivaConta = true;
                $scope.flags.flagFormLogin  = false;

                var params         = $location.$$path.split('/');
                $scope.token       = params[2].trim();
                $scope.cta_cod_cta = params[3].trim();

                if ($scope.token === '' || $scope.cta_cod_cta === '') {

                    $scope.flags.flagAtivaConta = false;
                    $scope.flags.flagFormLogin  = true;

                } else {

                    $scope.flags.flagAtivaConta = true;
                    $scope.flags.flagFormLogin  = false;
                    var objToken = {token : $scope.token};

                    LoginService.password.validar(objToken, function(retorno) {
                        if (retorno.records.error) {

                            $scope.flags.flagValidarToken = true;
                            $scope.msgValidarToken = 'Caro usuário, ocorreu algum erro ao ativar sua conta!';

                        } else {

                            $timeout(function() {
                                $scope.flags.flagValidarToken = false;
                                $scope.ativarConta();
                            }, 1000);
                        }
                    });
                }
            }

            if ($location.$$path.match(/nova-conta-sis-led/)) {


                console.log('entrou verificar conta');

                $scope.flags.flagFormCriarSenha = true;
                $scope.flags.flagFormLogin      = false;

                var params = $location.$$path.split('/');
                $scope.token = params[2].trim();

                if ($scope.token === '') {

                    $scope.flags.flagFormCriarSenha = false;
                    $scope.flags.flagFormLogin      = true;

                } else {

                    console.log('tem token');

                    $scope.flags.flagFormCriarSenha = true;
                    $scope.flags.flagFormLogin      = false;
                    var objToken = {token : $scope.token};

                    LoginService.password.validarTknLed(objToken, function(retorno) {
                        if (retorno.records.error) {

                            console.log('token inválido');

                            $scope.flags.flagValidarToken = true;
                            $scope.msgValidarToken = 'Caro usuário, ocorreu algum erro ao ativar sua conta!';

                            if(retorno.records.msg) {

                                if(retorno.records.msg == "Expired token") {

                                    $scope.msgValidarToken = 'Caro usuário, o seu link de ativação não é mais válido, por favor, faça um novo cadastro em nosso site!';
                                }
                            }

                        } else {

                            $timeout(function() {
                                $scope.flags.flagValidarToken = false;
                                $scope.verificaContaExiste();
                            }, 1000);
                        }
                    });
                }
            }

            /**
             * Ativa a função que irá ativar a conta solicitada
             */
            $scope.ativarConta = function () {

                if(! $scope.flags.flagValidarToken) {

                    LoginService.conta.ativar({u : $scope.cta_cod_cta}, function(retorno) {
                        if (! retorno.records.error) {

                            GeralFactory.notify('success', retorno.records.title, retorno.records.msg);
                            $scope.flags.flagAtivaConta = false;
                            $scope.flags.flagFormLogin  = true;

                        } else {

                            retorno.records.error ? GeralFactory.notify('danger', retorno.records.title, retorno.records.msg) : GeralFactory.notify('danger', 'Erro!', 'Ocorreu algum erro ao ativar sua conta!');
                            $scope.flags.flagAtivaConta = false;
                            $scope.flags.flagFormLogin  = true;
                        }
                    })
                }
            };

            /**
             * Verifica com base no token se uma conta precisa ser criada ou se essa já existe
             */
            $scope.verificaContaExiste = function () {

                if(!$scope.flags.flagValidarToken) {

                    var objToken   = {
                        token : $scope.token
                    };

                    LoginService.conta.verificar(objToken, function(retorno) {

                        console.log('verifica conta', retorno);

                        if (!retorno.records.error) {

                            $scope.flags.flagFormLogin      = false;
                            $scope.flags.flagFormCriarSenha = true;

                        } else {

                            GeralFactory.notify('success', retorno.records.title, retorno.records.msg);
                            $scope.flags.flagFormCriarSenha = false;
                            $scope.flags.flagFormLogin      = true;
                        }
                    })
                }
            };

            /**
             * Método responsável em redirecionar para o site do Lojista Virtual.
             */
            $scope.go = function() {
                if ($scope.nomeSolucao === 'Lojista Virtual') {

                    $window.location.href = 'http://www.lojistavirtual.com.br';
                }
            };

            /**
             * Método responsável em voltar o usuário para a página anterior.
             */
            $scope.voltar = function() {
                $window.history.back();
            };

            /**
             * Método responsável em efetuar a validação e o login de um
             * determinado usuário na aplicação.
             */
            $scope.login = function() {

                $scope.loginUsuarioLoading = true;
                $scope.$watch('forms.formLogin', function(form) {
                    if (form && form.$invalid) {

                        $scope.loginUsuarioLoading = false;
                        $scope.forms.formLogin.submitted = true;

                    } else {
                        var codAplicacao = 2;
                        var objUsuario   = {
                            usu_email       : $scope.objLogin.email,
                            usu_senha       : $scope.objLogin.senha,
                            usu_sol_cod_sol : codAplicacao.toString()
                        };
                        LoginService.logar.create(objUsuario, function(retorno) {
                            if (retorno) {
                                if (retorno.error) {

                                    $scope.objResposta = {
                                        classe   : 'alert alert-danger',
                                        mensagem :  $sce.trustAsHtml(retorno.msg)
                                    };

                                    $scope.loginUsuarioLoading = false;
                                    $timeout(function() {
                                        $scope.objResposta = {};
                                    }, 20000);

                                } else {
                                    /**
                                     * $scope.objResposta = {
                                     *     classe   : 'alert alert-success',
                                     *     mensagem : 'Autenticação efetuada com sucesso, aguarde o redirecionamento!'
                                     * };
                                     */
                                    var objToken = jwtHelper.decodeToken(retorno.token);

                                    objUsuario.ident_emp    = objToken.emp_ident_emp;
                                    objUsuario.arr_planos   = objToken.usu_arr_cod_tpl;
                                    objUsuario.arr_modulos  = objToken.usu_arr_mod_perm;
                                    objUsuario.arr_solucoes = objToken.usu_arr_cod_sol;
                                    objUsuario.arr_planos   = objToken.usu_arr_cod_tpl;
                                    objUsuario.arr_modulos  = objToken.usu_arr_mod_perm;
                                    objUsuario.usu_nome     = retorno.user.usu_nome;
                                    objUsuario.usu_cod_usu  = retorno.user.usu_cod_usu;
                                    objUsuario.wizard       = retorno.wizard;
                                    objUsuario.emp          = retorno.user.emp;

                                    // Dados do redirecionamento da loja virtual de uma determinada empresa:
                                    objUsuario.sol_logo         = $scope.nomeLogo;
                                    objUsuario.sol_nome         = $scope.nomeSolucao;
                                    objUsuario.is_cdl           = $scope.isCDL;
                                    objUsuario.scriptChat       = $scope.scriptChat;
                                    objUsuario.scriptWizard     = $scope.scriptWizard;
                                    objUsuario.usu_cod_vendedor = retorno.user.usu_cod_vendedor;
                                    objUsuario.vendedor         = retorno.vendedor;
                                    objUsuario.usu_ativo_wizard = retorno.user.usu_ativo_wizard;
                                    objUsuario.meu_plano        = _.isEmpty(retorno.meu_plano) ? null : retorno.meu_plano;

                                    if(!retorno.wizard.error) {
                                        window.localStorage.setItem('wizard', JSON.stringify(retorno.wizard.data));
                                    } else {
                                        window.localStorage.setItem('wizard', JSON.stringify({}));
                                    }

                                    $scope.setUsuario(objUsuario);
                                    $scope.loginUsuarioLoading = false;
                                    $timeout(function() {
                                        location.reload($location.$$path);
                                    }, 2000);
                                }
                            }
                        });
                    }
                });
            };

            /**
             * Método responsável em manipular (mostrar/ocultar) os dois formulários
             * existentes na tela de login da aplicação.
             */
            $scope.mostrar = function(aba) {
                if (aba) {
                    if (aba === 'E') {

                        $scope.flags.flagFormLogin = false;
                        $timeout(function() {
                            $scope.flags.flagFormSenha = true;
                        }, 1000);
                    } else {

                        $scope.flags.flagAtivaConta     = false;
                        $scope.flags.flagFormCriarSenha = false;
                        $scope.flags.flagFormSenha      = false;
                        $timeout(function() {
                            $scope.flags.flagFormLogin = true;
                        }, 1000);
                    }
                }
                
            };

            /**
             * Método responsável em efetuar a recuperação da senha para um
             * determinado usuário que tenha esquecido a mesma.
             */
            $scope.recuperar = function() {

                $scope.recuperarSenhaLoading = true;
                $scope.$watch('forms.formLembrete', function(form) {

                    if (form && form.$invalid) {

                        $scope.recuperarSenhaLoading = false;
                        $scope.forms.formLembrete.submitted = true;

                    } else {

                        var objUsuario = {usu_email : $scope.objLembrete.email};
                        LoginService.logar.recuperar(objUsuario, function(retorno) {
                            if (retorno.records) {
                                if (! retorno.records.error) {

                                    $scope.recuperarSenhaLoading = false;
                                    $scope.flags.flagShowMsg = true;

                                } else {

                                    $scope.objRespostaRecuperar = {
                                        classe   : 'alert alert-danger',
                                        mensagem :  retorno.records.msg
                                    };

                                    $scope.recuperarSenhaLoading = false;
                                    $timeout(function() {
                                        $scope.objRespostaRecuperar = {};
                                    }, 5000);
                                }
                            }
                        });
                    }
                });
            };

            /**
             * Método responsável em efetuar a troca da senha do usuário.
             * Redirecionado através do e-mail enviado.
             */
            $scope.salvar = function() {

                $scope.loginUsuarioLoading = true;
                $scope.$watch('forms.formRecuperar', function(form) {

                    if (form && form.$invalid) {

                        $scope.loginUsuarioLoading = false;
                        $scope.forms.formRecuperar.submitted = true;

                    } else {

                        var objeto = {
                            token : $scope.token,
                            senha : $scope.objRecuperar.senha
                        };
                        LoginService.password.alterar(objeto, function(retorno) {
                            if (retorno.records.error) {

                                $scope.loginUsuarioLoading = false;
                                $scope.objRespostaSalvar = {
                                    classe   : 'alert alert-danger',
                                    mensagem : 'Ocorreu um erro ao tentar modificar sua senha!'
                                };
                            } else {

                                $scope.loginUsuarioLoading = false;
                                $scope.objRespostaSalvar = {
                                    classe   : 'alert alert-success',
                                    mensagem : 'Sua senha foi atualizada com sucesso, aguarde pois você será redirecionado!'
                                };

                                $timeout(function() {

                                    $scope.flags.flagSenha = false;

                                    var url = $location.$$absUrl.split('recuperar-senha/')[0];
                                    $window.location.href = url;

                                }, 5000);
                            }
                        });
                    }
                });
            };

            /**
             * Cria a conta conforme a nova senha e o token passados
             */
            $scope.criarSenha = function () {

                $scope.novaSenhaLoading = true;

                $scope.$watch('forms.formCriarSenha', function(form) {

                    if (form && form.$invalid) {

                        $scope.novaSenhaLoading = false;
                        $scope.forms.formCriarSenha.submitted = true;

                    } else {

                        var objeto = {
                            token: $scope.token,
                            senha: $scope.objNovaConta.senha
                        };

                        LoginService.conta.criar(objeto, function(retorno) {

                            if (!retorno.records.error) {

                                GeralFactory.notify('success', retorno.records.title, retorno.records.msg);
                                $scope.flags.flagFormLogin      = true;
                                $scope.flags.flagFormCriarSenha = false;

                            } else {

                                GeralFactory.notify('danger', retorno.records.title, retorno.records.msg);
                                $scope.flags.flagFormLogin      = false;
                                $scope.flags.flagFormCriarSenha = true;
                            }

                            $scope.novaSenhaLoading = false;
                        })
                    }
                });
            };



            /* TELA DE PAGAMENTOS ---------------------------------------------------------------------------------- */

            /* Controle para visualização da tela de pagamentos! */
            $scope.resetFlags = function() {

                $scope.flags = {
                    flagPgto           : false,
                    flagFormLogin      : false,
                    flagFormSenha      : false,
                    flagAtivaConta     : false,
                    flagShowMsg        : false,
                    flagSenha          : false,
                    flagSalvarToken    : false,
                    flagValidarToken   : false,
                    flagFormCriarSenha : false
                };
            };

            /* Código e regras para a tela de pagamentos via cartão de crédito! */
            if ($location.$$path.match(/fatura/)) {

                $scope.resetFlags();
                $timeout(function() {

                    $scope.flags.flagPgto = true;
                    var objParams = {
                        $scope        : $scope,
                        $route        : $route,
                        $timeout      : $timeout,
                        $rootScope    : $rootScope,
                        FaturaService : FaturaService,
                        GeralFactory  : GeralFactory
                    };

                    $controller('FaturaCtrl', objParams);
                    $scope.verificarTokenPgto($routeParams.token);

                }, 1500);
            }
        }
    ]);

