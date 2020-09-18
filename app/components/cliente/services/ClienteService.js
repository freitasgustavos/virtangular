'use strict';

angular.module('newApp')

    .factory('ClienteService', [

        '$resource', 'CONFIG', 'AuthTokenFactory', 'GeralFactory', 'NotifyFlag', 'Storage',

        function($resource, CONFIG, AuthTokenFactory, GeralFactory, NotifyFlag, Storage) {

            var objUsuario = Storage.usuario.getUsuario();

            var urlErp = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;
            return {

                cliente : $resource(urlErp + '/vix-cad/:cad_cod_cad/?:u', {cad_cod_cad : '@cad_cod_cad', u : '@u'}, {

                    query : {
                        isArray : false
                    },

                    update : {
                        method      : 'PUT',
                        url         : urlErp + '/vix-cad/:cad_cod_cad',
                        params      : {
                            cad_cod_cad : '@cad_cod_cad'
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
                        url    : urlErp + '/vix-cad/:cad_cod_cad',
                        params : {
                            cad_cod_cad     : '@cad_cod_cad'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                clientes : $resource(urlErp + '/vix-cad/?:u', {u: '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    getFast : {
                        method : 'GET',
                        url    : urlErp + '/vix-cad/listar-fast/?:u',
                        params : {
                            u: '@u'
                        }
                    },

                    getTotais : {
                        method : 'GET',
                        url    : urlErp + '/vix-cad/get-totais/?:u',
                        params : {
                            u: '@u'
                        }
                    },

                    getDados : {
                        method : 'GET',
                        url    : urlErp + '/vix-cad/get-dados-modulo/?:u',
                        params : {
                            u: '@u'
                        }
                    },

                    create : {
                        method       : 'POST',
                        url          : urlErp + '/vix-cad/:u',
                        interceptor  : {
                            response : function(response) {
                                if (NotifyFlag.getFlag() === true) {
                                    GeralFactory.notificar(response);
                                }

                                NotifyFlag.deleteFlag();
                                return response.data;
                            }
                        }
                    }
                }),

                clienteEndereco : $resource(urlErp + '/vix-cad/:cad_cod_cad/endereco/:end_seq_end', {

                    cad_cod_cad : '@cad_cod_cad',
                    end_seq_end : '@end_seq_end'

                }, {

                    query : {
                        isArray : false
                    },

                    update : {
                        method       : 'PUT',
                        interceptor  : {
                            response : function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-cad/:cad_cod_cad/endereco/:end_seq_end',
                        params : {
                            cad_cod_cad : '@cad_cod_cad',
                            end_seq_end : '@end_seq_end'
                        }
                    }
                }),

                clienteEnderecos : $resource(urlErp + '/vix-cad/:cad_cod_cad/endereco/?:u', {cad_cod_cad : '@cad_cod_cad', u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-cad/:end_cad_cod_cad/endereco',
                        params      : {
                            end_cad_cod_cad : '@end_cad_cod_cad'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                clienteContato  : $resource(urlErp + '/vix-cad/:cad_cod_cad/contato/:cto_cod_cto', {

                    cad_cod_cad : '@cad_cod_cad',
                    cto_cod_cto : '@cto_cod_cto'

                }, {

                    query : {
                        isArray : false
                    },

                    update : {
                        method       : 'PUT',
                        interceptor  : {
                            response : function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-cad/:cad_cod_cad/contato/:cto_cod_cto',
                        params : {
                            cad_cod_cad     : '@cad_cod_cad',
                            cto_cod_cto : '@cto_cod_cto'
                        }
                    }
                }),

                clienteContatos : $resource(urlErp + '/vix-cad/:cad_cod_cad/contato/?:u', {cad_cod_cad : '@cad_cod_cad', u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-cad/:cto_cad_cod_cad/contato',
                        params      : {
                            cto_cad_cod_cad : '@cto_cad_cod_cad'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                clienteAnotacao  : $resource(urlErp + '/vix-cad/:cad_cod_cad/anotacao/:ano_seq_ano', {

                    cad_cod_cad : '@cad_cod_cad',
                    ano_seq_ano : '@ano_seq_ano'

                }, {

                    query : {
                        isArray : false
                    },

                    update : {
                        method       : 'PUT',
                        interceptor  : {
                            response : function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-cad/:ano_cad_cod_cad/anotacao/:ano_seq_ano',
                        params : {
                            ano_cad_cod_cad : '@ano_cad_cod_cad',
                            ano_seq_ano     : '@ano_seq_ano'
                        }
                    },

                    atualizarEvento : {
                        method       : 'PUT',
                        url    : urlErp + '/vix-cad/salvar-evento/:ano_seq_ano',
                        params : {
                            ano_seq_ano     : '@ano_seq_ano'
                        },
                        interceptor  : {
                            response : function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    atualizarEventoResize : {
                        method       : 'PUT',
                        url    : urlErp + '/vix-cad/salvar-evento-resize/:ano_seq_ano',
                        params : {
                            ano_seq_ano     : '@ano_seq_ano'
                        },
                        interceptor  : {
                            response : function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    getEvento : {
                        method : 'GET',
                        url    : urlErp + '/vix-cad/get-evento/:ano_seq_ano',
                        params : {
                            ano_seq_ano : '@ano_seq_ano'
                        }
                    },

                    cancelarEvento : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-cad/cancelar-evento/:ano_seq_ano',
                        params : {
                            ano_seq_ano     : '@ano_seq_ano'
                        }
                    }

                }),

                clienteMarcacoes : $resource(urlErp + '/vix-tab-mar/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-tab-mar/:u',
                        interceptor : {
                            response: function (response) {
                                return response.data;
                            }
                        }
                    }

                }),

                autoComplete : $resource(urlErp + '/vix-cad/auto-complete-receita-ws/?:u', {u : '@u'},{

                    receitaWS : {
                        method : 'GET'
                    }

                }),

                clienteAnotacoes : $resource(urlErp + '/vix-cad/:cad_cod_cad/anotacao/?:u', {

                    cad_cod_cad : '@cad_cod_cad',
                    u : '@u'

                }, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-cad/:ano_cad_cod_cad/anotacao',
                        params      : {
                            ano_cad_cod_cad : '@ano_cad_cod_cad'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    listarEventos : {
                        method : 'GET',
                        url    : urlErp + '/vix-cad/listar-eventos/?:u',
                        params : {u : '@u'}
                    },

                    criarEvento : {
                        method      : 'POST',
                        url         : urlErp + '/vix-cad/salvar-evento',
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