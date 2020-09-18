'use strict';

angular.module('newApp')

    .factory('ProdutoService', [

        '$resource', 'CONFIG', 'GeralFactory', 'Storage',

        function($resource, CONFIG, GeralFactory, Storage) {

            var objUsuario = Storage.usuario.getUsuario();

            var urlErp = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;

            return {

                produto : $resource(urlErp + '/vix-pro/:pro_cod_pro', {pro_cod_pro : '@pro_cod_pro'}, {

                    query : {
                        isArray : false
                    },

                    update : {
                        method      : 'PUT',
                        url         : urlErp + '/vix-pro/:pro_cod_pro',
                        params      : {
                            pro_cod_pro : '@pro_cod_pro'
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
                        url    : urlErp + '/vix-pro/:pro_cod_pro',
                        params : {
                            pro_cod_pro : '@pro_cod_pro'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    duplicar : {
                        method      : 'GET',
                        url         : urlErp + '/vix-pro/duplicar/:pro_cod_pro',
                        params      : {
                            pro_cod_pro : '@pro_cod_pro'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    getComplementoImposto : {
                        method      : 'GET',
                        url         : urlErp + '/vix-pro/get-complemento-imposto',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    }

                }),

                produtos : $resource(urlErp + '/vix-pro/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    getFast : {
                        method : 'GET',
                        url    : urlErp + '/vix-pro/listar-fast/?:u',
                        params : {
                            u  : '@u'
                        }
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
                    },

                    getDados : {
                        method : 'GET',
                        url    : urlErp + '/vix-pro/get-dados-modulo/?:u',
                        params : {
                            u  : '@u'
                        }
                    }

                }),

                ncm : $resource(urlErp + '/vix-pro/ncm/:ncm_seq', {ncm_seq : '@ncm_seq'}, {

                    query : {
                        isArray : false
                    },

                    update: {
                        method  : 'PUT',
                        url     : urlErp + '/vix-pro/ncm/:ncm_seq',
                        params  : {
                            ncm_seq: '@ncm_seq'
                        },
                        interceptor : {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-pro/ncm/:u',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                estoque : $resource(urlErp + '/vix-pro/?:u', {u : '@u'}, {

                    recalcular : {
                        method : 'GET',
                        url    :  urlErp + '/vix-pro/recalc-sal-estoque/?:u'
                    },

                    getMovimentacaoEstoque : {
                        method      : 'GET',
                        url         : urlErp + '/vix-fin/get-movimentacao/?:u',
                        params      : {
                            u : '@u'
                        },
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    }

                }),

                ncms : $resource(urlErp + '/vix-pro/ncm/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET',
                        url    :  urlErp + '/vix-pro/ncm/?:u'
                    }

                }),

                tipoEspecifico : $resource(urlErp + '/vix-pro/:pro_cod_pro/:tipo/:tipo_seq', {

                    pro_cod_pro : '@pro_cod_pro',
                    tipo        : '@tipo',
                    tipo_seq    : '@tipo_seq'

                }, {

                    get : {
                        method : 'GET'
                    },

                    update : {
                        method   : 'PUT',
                        url      :  urlErp + '/vix-pro/:pro_cod_pro/:tipo/:tipo_seq',
                        params   :  {
                            pro_cod_pro : '@pro_cod_pro',
                            tipo        : '@tipo',
                            tipo_seq    : '@tipo_seq'
                        },
                        interceptor  : {
                            response : function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancel : {
                        method   : 'DELETE',
                        url      :  urlErp + '/vix-pro/:pro_cod_pro/:tipo/:tipo_seq',
                        params   :  {
                            pro_cod_pro : '@pro_cod_pro',
                            tipo        : '@tipo',
                            tipo_seq    : '@tipo_seq'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                tiposEspecificos : $resource(urlErp + '/vix-pro/:tipo/?:u', {u : '@u', tipo : '@tipo'}, {

                    query : {
                        isArray : false
                    },

                    get : {
                        method : 'GET',
                        url    :  urlErp + '/vix-pro/:tipo/?:u'
                    },

                    create : {
                        method       : 'POST',
                        url          :  urlErp + '/vix-pro/:tipo/:u',
                        interceptor  :  {
                            response :  function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelAll : {
                        method   : 'DELETE',
                        url      :  urlErp + '/vix-pro/tipo/:pro_cod_tip/:pro_cod_pro',
                        params   :  {
                            pro_cod_tip : '@pro_cod_tip',
                            pro_cod_pro : '@pro_cod_pro'
                        },
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    }

                }),

                produtoGrupo : $resource(urlErp + '/vix-pro-gru/:gru_cod_gru', {gru_cod_gru : '@gru_cod_gru'}, {

                    query : {
                        isArray : false
                    },

                    update : {
                        method      : 'PUT',
                        url         : urlErp + '/vix-pro-gru/:gru_cod_gru',
                        params      : {
                            pro_cod_pro : '@gru_cod_gru'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                produtoGrupos : $resource(urlErp + '/vix-pro-gru/:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    getByDescricao : {
                        method  : 'GET',
                        url     : urlErp + '/vix-pro-gru/?:u',
                        params  : {u : '@u'}
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-pro-gru/:u',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    },

                    update : {
                        method      : 'PUT',
                        url         : urlErp + '/vix-pro-gru/:gru_cod_gru',
                        params      : {
                            gru_cod_gru : '@gru_cod_gru'
                        },
                        interceptor : {
                            response: function (response) {
                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-pro-gru/:id',
                        params : {
                            id : '@id'
                        }
                    }

                }),

                produtoMarcas : $resource(urlErp + '/vix-pro-mar/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-pro-mar/:u',
                        interceptor : {
                            response: function (response) {
                                return response.data;
                            }
                        }
                    }

                }),

                produtoAgrupamentos : $resource(urlErp + '/vix-agp/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    }

                }),

                agrupamentos : $resource(urlErp + '/vix-agp/:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
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
                    }

                }),

                marcas : $resource(urlErp + '/vix-mar/?:u', {u : '@u'}, {

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
                    },

                    update : {
                        method      : 'PUT',
                        url         : urlErp + '/vix-mar/:mar_cod_marca',
                        params      : {
                           mar_cod_marca : '@mar_cod_marca'
                        },
                        interceptor : {
                            response: function (response) {
                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-mar/:id',
                        params : {
                            id : '@id'
                        }
                    }
                })
            };
        }
    ]);