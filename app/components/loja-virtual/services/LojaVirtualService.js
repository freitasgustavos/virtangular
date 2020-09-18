'use strict';

angular.module('newApp')

    .factory('LojaVirtualService', [

        '$resource', 'CONFIG', 'GeralFactory', 'Storage',

        function($resource, CONFIG, GeralFactory, Storage) {

            var objUsuario = Storage.usuario.getUsuario();

            var urlEco = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ECO;

            return {

                paginas : $resource(urlEco + '/cms-con/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlEco + '/cms-con/:u',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    update : {
                        method      : 'PUT',
                        url         : urlEco + '/cms-con/:con_cod_con',
                        params      : {
                            con_cod_con : '@con_cod_con'
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
                        url    : urlEco + '/cms-con/:con_cod_con',
                        params : {
                            con_cod_con : '@con_cod_con'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                pagina : $resource(urlEco + '/cms-con/:con_cod_con', {con_cod_con:'@con_cod_con'},{

                    get : {
                        method : 'GET'
                    },

                    getOrdem : {
                        method : 'GET',
                        url    :  urlEco + '/cms-con/ordem/:id',
                        params : {
                            id : '@id'
                        },
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    }

                }),

                contatos : $resource(urlEco + '/cms-cto/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlEco + '/cms-cto/:u',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }


                }),

                contatosNewsLetter : $resource(urlEco + '/cms-new/', {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlEco + '/cms-new/',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }


                }),

                contato : $resource(urlEco + '/cms-cto/:cto_cod_cto', {cto_cod_cto:'@cto_cod_cto'},{

                    get : {
                        method : 'GET'
                    },

                    update : {
                        method      : 'PUT',
                        url         : urlEco + '/cms-cto/:cto_cod_cto',
                        params      : {
                            cto_cod_cto : '@cto_cod_cto'
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
                        url    : urlEco + '/cms-cto/:cto_cod_cto',
                        params : {
                            cto_cod_cto : '@cto_cod_cto'
                        },
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