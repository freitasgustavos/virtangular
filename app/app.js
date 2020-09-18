/**
 * @since 30 de Setembro, 2015
 * @author Erik Urbanski Santos
 * @author José Guilherme Honorato
 * @description
 *      Objeto responsável em configurar o módulo principal da aplicação,
 *      ou seja, todos os componentes do AngularJS utilizados na mesma.
 */
var app = angular.module('newApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',  
    'ngRoute',
    'ngLocale',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap',
    'ui.select',
    'ui.utils.masks',
    'malihu.scrollbar',
    'angular-jwt',
    'angular-storage',
    'ngFileUpload',
    'minicolors',
    'ngStorage',
    'angular-ladda',
    'ngCkeditor',
    'slick',
    'btford.socket-io',
    'notification',
    'cgPrompt',
    'angularTreeview',
    'angular-clipboard',
    'chart.js',
    'ui.calendar',
    'ui.mask',
    'ui.bootstrap.timepicker',
    'lv-autocomplete',
    'treasure-overlay-spinner',
    'checklist-model',
    'angular-loading-bar',
    'angular.filter',
    'angular-intro',
    'credit-cards'
]);

app.run(['$window', 'CONFIG', function($window, CONFIG) {

    if ($window.isIE9 && xdomain) {
        var objSlaves = {};
        objSlaves[CONFIG.X_DOMAIN] = '/proxy.html';

        xdomain.debug = true;
        xdomain.slaves(objSlaves);
    }
}]);

app.config(function($routeProvider, $resourceProvider, $tooltipProvider, $httpProvider) {

    $resourceProvider.defaults.stripTrailingSlashes = false;

    $httpProvider.interceptors.push('AuthInterceptor');

    $routeProvider
        .when('/', {
            controller  : 'HomeCtrl',
            templateUrl : 'home/views/index.html'
        })
        .when('/cliente', {
            controller  : 'ClienteCtrl',
            templateUrl : 'cliente/views/cliente.html'
        })
        .when('/produto', {
            controller  : 'ProdutoCtrl',
            templateUrl : 'produto/views/produto.html'
        })
        .when('/servico', {
            controller  : 'ProdutoCtrl',
            templateUrl : 'produto/views/produto.html'
        })
        .when('/categoria-marca', {
            controller  : 'CategoriaMarcaCtrl',
            templateUrl : 'categoria-marca/views/categoria-marca.html'
        })
        .when('/agrupamento', {
            controller  : 'AgrupamentoCtrl',
            templateUrl : 'agrupamento/views/agrupamento.html'
        })
        .when('/venda', {
            controller  : 'VendaCtrl',
            templateUrl : 'venda/views/venda.html'
        })
        .when('/lista-venda', {
            controller  : 'ListaVendaCtrl',
            templateUrl : 'venda/views/lista-venda.html'
        })
        .when('/transporte/frete', {
            controller  : 'TransporteCtrl',
            templateUrl : 'transporte/views/transporte.html'
        })
        .when('/transporte/veiculos', {
            controller  : 'VeiculosCtrl',
            templateUrl : 'transporte/views/veiculos.html'
        })
        .when('/login/', {
            controller  : 'LoginCtrl',
            templateUrl : 'login/views/login.html'
        })
        .when('/teste', {
            controller  : 'TesteCtrl',
            templateUrl : 'teste/views/teste.html'
        })
        .when('/teste/tour', {
            controller  : 'TesteCtrl',
            templateUrl : 'teste/views/tour.html'
        })
        .when('/usuario', {
            controller  : 'UsuarioCtrl',
            templateUrl : 'usuario/views/usuario.html'
        })
        .when('/loja-virtual', {
            controller  : 'LojaVirtualCtrl',
            templateUrl : 'loja-virtual/views/loja-virtual.html'
        })
        .when('/empresa/:aba?', {
            controller  : 'EmpresaCtrl',
            templateUrl : 'empresa/views/empresa.html'
        })
        .when('/fiscal/:aba?', {
            controller  : 'FiscalCtrl',
            templateUrl : 'fiscal/views/fiscal.html'
        })
        .when('/financeiro/:sistema', {
            controller  : 'FinanceiroCtrl',
            templateUrl : 'financeiro/views/financeiro.html'
        })
        .when('/compra', {
            controller  : 'VendaCtrl',
            templateUrl : 'venda/views/venda.html'
        })
        .when('/orcamento', {
            controller  : 'VendaCtrl',
            templateUrl : 'venda/views/venda.html'
        })
        .when('/devolucao-venda', {
            controller  : 'VendaCtrl',
            templateUrl : 'venda/views/venda.html'
        })
        .when('/devolucao-compra', {
            controller  : 'VendaCtrl',
            templateUrl : 'venda/views/venda.html'
        })
        .when('/fornecedor', {
            controller  : 'ClienteCtrl',
            templateUrl : 'cliente/views/cliente.html'
        })
        .when('/transportadora', {
            controller  : 'ClienteCtrl',
            templateUrl : 'cliente/views/cliente.html'
        })
        .when('/outras-saidas', {
            controller  : 'VendaCtrl',
            templateUrl : 'venda/views/venda.html'
        })
        .when('/outras-entradas', {
            controller  : 'VendaCtrl',
            templateUrl : 'venda/views/venda.html'
        })
        .when('/prest-servico', {
            controller  : 'VendaCtrl',
            templateUrl : 'venda/views/venda.html'
        })
        .when('/relatorio/:pai?', {
            controller  : 'RelatorioCtrl',
            templateUrl : 'relatorio/views/relatorio.html'
        })
        .when('/parametro', {
            controller  : 'ParametroCtrl',
            templateUrl : 'parametro/views/parametro.html'
        })
        .when('/meu-perfil', {
            controller  : 'MeuPerfilCtrl',
            templateUrl : 'meu-perfil/views/meu-perfil.html'
        })
        .when('/perfil', {
            controller  : 'PerfilCtrl',
            templateUrl : 'perfil/views/perfil.html'
        })
        .when('/teste/arvore', {
            controller  : 'TesteCtrl',
            templateUrl : 'teste/views/teste-tree.html'
        })
        .when('/cms', {
            controller  : 'CmsCtrl',
            templateUrl : 'cms/views/cms.html'
        })
        .when('/agenda', {
            controller  : 'AgendaCtrl',
            templateUrl : 'agenda/views/agenda.html'
        })
        .when('/recuperar-senha/:token', {
            controller  : 'RecuperarSenhaCtrl',
            templateUrl : 'login/views/recuperar-senha.html'
        })
        .when('/meu-plano', {
            controller  : 'MeuPlanoCtrl',
            templateUrl : 'meu-plano/views/meu-plano.html'
        })
        .when('/conciliacao', {
            controller  : 'ConciliacaoCtrl',
            templateUrl : 'financeiro/views/conciliacao.html'
        })
        .when('/wizard', {
            controller  : 'WizardCtrl',
            templateUrl : 'home/views/wizard.html'
        })
        .when('/saida-insumos', {
            controller  : 'ProducaoCtrl',
            templateUrl : 'producao/views/producao.html'
        })
        .when('/entrada-producao', {
            controller  : 'ProducaoCtrl',
            templateUrl : 'producao/views/producao.html'
        })
        .when('/contrato', {
            controller  : 'ContratoCtrl',
            templateUrl : 'contrato/views/contrato.html'
        })
        .when('/cobranca/:tipo/:sequencial?', {
            controller  : 'CobrancaCtrl',
            templateUrl : 'cobranca/views/retorno-sucesso.html'
        })
        .when('/faturas/:token?', {
            controller  : 'FaturaCtrl',
            templateUrl : 'fatura/views/fatura.html'
        })
        .otherwise({
            controller  : '404Controller',
            templateUrl : 'home/views/404.html'
        });
    

    $tooltipProvider.setTriggers({
        'show' : 'hide'
    });
});

app.directive('ngSpinnerLoader', ['$rootScope',
    function($rootScope) {
        return {
            link : function(scope, element, attrs) {
                element.addClass('hide');
                $rootScope.$on('$routeChangeStart', function() {
                    element.removeClass('hide');
                });
                $rootScope.$on('$routeChangeSuccess', function() {
                    setTimeout(function() {
                        element.addClass('hide');
                    }, 500);
                    $('html, body').animate({
                        scrollTop : 0
                    }, 500);
                });
            }
        };
    }
]);

app.directive('ngViewClass', function($location) {
    return {
        link : function(scope, element, attrs, controllers) {
            var classes = attrs.ngViewClass ? attrs.ngViewClass.replace(/ /g, '').split(',') : [];
            setTimeout(function() {
                if ($(element).hasClass('ng-enter')) {
                    for (var i = 0; i < classes.length; i++) {
                        var route = classes[i].split(':')[1];
                        var newclass = classes[i].split(':')[0];
                        if (route === $location.path()) {
                            $(element).addClass(newclass);
                        } else {
                            $(element).removeClass(newclass);
                        }
                    }
                }
            });
        }
    };
});

app.factory('Constantes', function() {
    return {
        LIMIT       :  50,
        LIMIT_TESTE :  5,
        LIMIT_FINAN :  300,
        KEYS        : [
            13, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 91, 92, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 144, 145, 225
        ]
    };
});