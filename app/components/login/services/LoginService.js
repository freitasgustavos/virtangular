'use strict';

angular.module('newApp')

    .factory('LoginService', [

        '$resource', 'CONFIG', 'AuthTokenFactory', 'Storage',

        function ($resource, CONFIG, AuthTokenFactory, Storage) {

            var objUsuario = Storage.usuario.getUsuario();

            var url = CONFIG.HOSTNAME + CONFIG.IDENT_SISTEMA +  CONFIG.SCHEMA_SISTEMA;
            return {

                logar : $resource(url + '/auth/', {cad_cod_cad : '@cad_cod_cad'}, {

                    create: {
                        method       : 'POST',
                        url          :  url + '/auth/',
                        interceptor  :  {
                            response : function(response) {

                                var arrToken = response.resource.records;

                                if (arrToken !== undefined) {

                                    AuthTokenFactory.setToken(response.resource.records.token);
                                }
                                return arrToken;
                            }
                        }
                    },

                    recuperar : {
                        method      : 'POST',
                        url         : url + '/auth/recuperar-senha',
                        interceptor : {
                            response: function(resposta) {
                                return resposta.data;
                            }
                        }
                    }

                }),

                logout : $resource(url + '/auth/logout', { }, {

                    get  : {
                        method       : 'GET',
                        interceptor  : {
                            response : function(resposta) {
                                return resposta.data;
                            }
                        }
                    }
                }),

                password : $resource(url + '/auth/', { }, {

                    alterar : {
                        method      : 'POST',
                        url         : url + '/auth/alterar-senha',
                        interceptor : {
                            response: function(resposta) {
                                return resposta.data;
                            }
                        }
                    },

                    validar : {
                        method      : 'POST',
                        url         : url + '/auth/validar-token',
                        interceptor : {
                            response: function(resposta) {
                                return resposta.data;
                            }
                        }
                    },

                    validarTknLed : {
                        method      : 'POST',
                        url         : url + '/auth/validar-token-led',
                        interceptor : {
                            response: function(resposta) {
                                return resposta.data;
                            }
                        }
                    }

                }),

                conta : $resource(url + '/sis-cta/', { u : '@u'}, {

                    ativar : {
                        method      : 'PUT',
                        url         : url + '/sis-cta/ativa-conta/:u',
                        interceptor : {
                            response: function(resposta) {
                                return resposta.data;
                            }
                        }
                    },
                    verificar : {
                        method      : 'POST',
                        url         : url + '/sis-led/verifica-conta',
                        interceptor : {
                            response: function(resposta) {
                                return resposta.data;
                            }
                        }
                    },

                    criar : {
                        method      : 'POST',
                        url         : url + '/sis-led/criar-conta',
                        interceptor : {
                            response: function(resposta) {
                                return resposta.data;
                            }
                        }
                    }
                })
            };
        }
    ]);
