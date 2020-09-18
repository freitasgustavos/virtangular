'use strict';

angular.module('newApp')

    .factory('UsuarioService', [

        '$resource', 'CONFIG', 'GeralFactory',

        function($resource, CONFIG, GeralFactory) {

            var url = CONFIG.HOSTNAME + CONFIG.IDENT_SISTEMA + CONFIG.SCHEMA_SISTEMA;
            return {

                usuario : $resource(url + '/sis-usu/:usu_cod_usu', {usu_cod_usu : '@usu_cod_usu'}, {

                    query : {
                        isArray : false
                    },

                    update : {
                        method      : 'PUT',
                        url         : url + '/sis-usu/:usu_cod_usu',
                        params      : {
                            usu_cod_usu : '@usu_cod_usu'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method : 'DELETE',
                        url    : url + '/sis-usu/:usu_cod_usu',
                        params : {
                            usu_cod_usu : '@usu_cod_usu'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    alterarSenhaUsuario : {
                        method      : 'PUT',
                        url         : url + '/sis-usu/alterar-senha-usuario/1',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }, atualizarUsuVendedor : {
                        method      : 'POST',
                        url         : url + '/sis-usu/vendedor',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                usuarios : $resource(url + '/sis-usu/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : url + '/sis-usu/:u',
                        interceptor : {
                            response: function(response) {
                               GeralFactory.notificar(response);
                               return response.data;
                            }
                        }
                    }, 
                    
                    getByPerfil : {
                        method  : 'GET',
                        url     :  url + '/sis-usu/listar-sis-usu-admin-por-perfil/?:u',
                        params  :  {
                            u : '@u'
                        }
                    }

                }),

                perfil : $resource(url + '/sis-prf/:prf_cod_prf', {prf_cod_prf : '@prf_cod_prf'}, {

                    query : {
                        isArray : false
                    },

                    update : {
                        method      : 'PUT',
                        url         : url + '/sis-prf/:prf_cod_prf',
                        params      : {
                            prf_cod_prf : '@prf_cod_prf'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method : 'DELETE',
                        url    : url + '/sis-prf/:prf_cod_prf',
                        params : {
                            prf_cod_prf : '@prf_cod_prf'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                perfis : $resource(url + '/sis-prf/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : url + '/sis-prf/:u',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                })
            };
        }
    ]);