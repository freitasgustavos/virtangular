'use strict';

angular.module('newApp')

    .factory('AgrupamentoService', [

        '$resource', 'CONFIG', 'GeralFactory', 'Storage',

        function($resource, CONFIG, GeralFactory, Storage) {

            var objUsuario = Storage.usuario.getUsuario();

            var urlErp = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;

            return {

                produtos : $resource(urlErp + '/vix-pro/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-pro/:u',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                produtosAgrupamento : $resource(urlErp + '/vix-pro/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    }

                }),

                agrupamentos : $resource(urlErp + '/vix-agp/:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    update : {
                        method      : 'PUT',
                        url         : urlErp + '/vix-agp/:agp_cod_agp',
                        params      : {
                            agp_cod_agp : '@agp_cod_agp'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-agp/:u',
                        interceptor : {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-agp/:agp_cod_agp',
                        params : {
                            agp_cod_agp : '@agp_cod_agp'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                buscaAgrupamentos : $resource(urlErp + '/vix-agp/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    }
                }),

                agrupamentoMarcas : $resource(urlErp + '/vix-agp-mar/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-mar/:u',
                        interceptor : {
                            response: function (response) {
                                return response.data;
                            }
                        }
                    }
                })
            };
        }
    ]);