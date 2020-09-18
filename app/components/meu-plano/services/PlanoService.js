
angular.module('newApp').factory('PlanoService', [

    '$resource', 'CONFIG', 'GeralFactory', 'Storage',

    function($resource, CONFIG, GeralFactory, Storage) {

        var objUser = Storage.usuario.getUsuario(), id = (objUser) ? objUser.ident_emp : CONFIG.IDENT_SISTEMA;
        return {

            planos : $resource(CONFIG.HOSTNAME + CONFIG.IDENT_SISTEMA + CONFIG.SCHEMA_SISTEMA + '/sis-cta/listar-planos/?:u', {u : '@u'}, {

                get : {
                    method : 'GET'
                }

            }),

            pagamentos : $resource(CONFIG.HOSTNAME + CONFIG.IDENT_LOJISTA + CONFIG.SCHEMA_ERP + '/financa/receber/', {u : '@u'}, {

                get : {
                    method : 'GET',
                    url    :  CONFIG.HOSTNAME + CONFIG.IDENT_LOJISTA + CONFIG.SCHEMA_ERP + '/financa/receber/?:u'
                }

            }),

            solucoes :  $resource(CONFIG.HOSTNAME + CONFIG.IDENT_SISTEMA + CONFIG.SCHEMA_SISTEMA + '/sis-sol/?:u', {u : '@u'}, {

                get : {
                    method: 'GET'
                },

                upgrade : {
                    method       : 'POST',
                    url          :  CONFIG.HOSTNAME + CONFIG.IDENT_SISTEMA + CONFIG.SCHEMA_SISTEMA + '/sis-cta-sol/upgrade/?:u',
                    params       :  {u : '@u'},
                    interceptor  :  {
                        response : function(response) {
                            GeralFactory.notificar(response);
                            return response.data;
                        }
                    }
                }

            })

        };

    }

]);