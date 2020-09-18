'use strict';

angular.module('newApp')

    .factory('CupomService', [

        '$resource', 'CONFIG', 'GeralFactory', 'Storage',

        function($resource, CONFIG, GeralFactory, Storage) {

            var objUsuario = Storage.usuario.getUsuario();

            var urlErp = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;

            return {

                cupons: $resource(urlErp + '/vix-cup/:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    update : {
                        method      : 'PUT',
                        url         : urlErp + '/vix-cup/:cup_nro_cup',
                        params      : {
                            cup_nro_cup : '@cup_nro_cup'
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
                        url         : urlErp + '/vix-cup/:u',
                        interceptor : {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-cup/:cup_nro_cup',
                        params : {
                            cup_nro_cup : '@cup_nro_cup'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                buscaCupons: $resource(urlErp + '/vix-cup/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    }

                })
            };
         }
    ]);