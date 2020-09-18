'use strict';

angular.module('newApp')

    .factory('RelatorioService', [

        '$resource', '$timeout', '$window', 'CONFIG', 'GeralFactory', 'Storage', 'StaticFactories', 'AuthTokenFactory',

        function($resource, $timeout, $window, CONFIG, GeralFactory, Storage, StaticFactories, AuthTokenFactory) {

            var objUsuario = Storage.usuario.getUsuario();

            var urlErp = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;

            return {

                cadastros : $resource(urlErp + '/relatorio/cadastros/?:u', {u: '@u'}, {

                    get : {
                        method : 'GET'
                    }

                }),

                estoque : $resource(urlErp + '/relatorio/estoque/?:u', {u: '@u'}, {

                    movimentacao : {
                        method : 'GET',
                        url    :  GeralFactory.getUrlApi() + StaticFactories.RELATORIOS['MOV'] + ':u',
                        params :  {
                            u  : '@u'
                        }
                    }

                }),

                produtos : $resource(urlErp + '/relatorio/produtos/?:u', {u: '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    inventario : {
                        method : 'GET', 
                        url    :  GeralFactory.getUrlApi() + StaticFactories.RELATORIOS['INV'] + ':u',
                        params :  {
                            u  : '@u'
                        }
                    }

                }),

                admin : $resource(urlErp + '/relatorio/admin/?:u', {u: '@u'}, {

                    lucratividade : {
                        method : 'GET',
                        url    :  GeralFactory.getUrlApi() + StaticFactories.RELATORIOS['LUC'] + ':u',
                        params :  {
                            u  : '@u'
                        }
                    }

                }),

                /**
                 * Método responsável em retornar a URL correta para geração do relatório de acordo
                 * com a sigla do mesmo definido na sua configuração dos parâmetros.
                 */
                getURL : function(sigla) {

                    var url = GeralFactory.getUrlApi() + StaticFactories.RELATORIOS[sigla];
                    return url;
                },

                /**
                 * Método responsável em gerar os relatórios de PDF e Excel de acordo com
                 * o filtro utilizado pelo usuário.
                 */
                relatorio : function(objFiltro, objRelatorio) {

                    var url = this.getURL(objRelatorio['par_c05']);
                    if (url) {

                        objFiltro.token = AuthTokenFactory.getToken();
                        var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                        $timeout(function() {

                            url = url + strFiltro;
                            $window.open(url, 'Gerando relatório...');

                        });
                    }
                }

            };
        }
    ]);