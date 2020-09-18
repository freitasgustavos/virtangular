'use strict';

angular.module('newApp')

    .factory('FinanceiroService', [

        '$resource', 'CONFIG', 'GeralFactory', 'Storage',

        function($resource, CONFIG, GeralFactory, Storage) {

            var objUsuario = Storage.usuario.getUsuario();

            var urlErp = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;

            return {

                financas : $resource(urlErp + '/financa/:operacao/?:u', {u : '@u', operacao : '@operacao'}, {

                    query : {
                        isArray : false
                    },

                    get : {
                        method : 'GET',
                        url    :  urlErp + '/financa/:operacao/?:u'
                    },

                    create : {
                        method       : 'POST',
                        url          :  urlErp + '/financa/:operacao/:u',
                        interceptor  :  {
                            response :  function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    reports : {
                        method : 'GET',
                        url    :  urlErp + '/financa/relatorio/?:u',
                        params : {
                            u  : '@u'
                        }
                    },

                    batch : {
                        method : 'POST',
                        url    :  urlErp + '/financa/batch/:operacao/:u',
                        params : {
                            u  : '@u'
                        },
                        interceptor  :  {
                            response :  function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method : 'DELETE',
                        url    : urlErp + '/financa/batch/cancelar/:operacao/:tit_fin_nro_lan/:tit_fatura_seq',
                        params : {
                            operacao        : '@operacao',
                            tit_fatura_seq  : '@tit_fatura_seq',
                            tit_fin_nro_lan : '@tit_fin_nro_lan'
                        },
                        interceptor  :  {
                            response :  function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    transferencia : {
                        method : 'POST',
                        url    :  urlErp + '/financa/transferencia/:u',
                        params : {
                            u : '@u'
                        },
                        interceptor  :  {
                            response :  function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                financa : $resource(urlErp + '/financa/:tit_fin_nro_lan/:operacao/:tit_fatura_seq', {

                    tit_fin_nro_lan : '@tit_fin_nro_lan',
                    operacao        : '@operacao',
                    tit_fatura_seq  : '@tit_fatura_seq'

                }, {

                    get : {
                        method : 'GET'
                    },

                    update : {
                        method       : 'PUT',
                        url          :  urlErp + '/financa/:tit_fin_nro_lan/:operacao/:tit_fatura_seq',
                        params       :  {
                            tit_fin_nro_lan : '@tit_fin_nro_lan',
                            operacao        : '@operacao',
                            tit_fatura_seq  : '@tit_fatura_seq'
                        },
                        interceptor  : {
                            response : function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method      : 'DELETE',
                        url         : urlErp + '/financa/:tit_fin_nro_lan/:operacao/:tit_fatura_seq',
                        params      : {
                            tit_fin_nro_lan : '@tit_fin_nro_lan',
                            operacao        : '@operacao',
                            tit_fatura_seq  : '@tit_fatura_seq'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                extrato : $resource(urlErp + '/financa/:operacao/saldo/?:u', {u : '@u', operacao : '@operacao'}, {

                    query : {
                        isArray : false
                    },

                    get : {
                        method : 'GET'
                    }

                }),

                saldo : $resource(urlErp + '/financa/saldo/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    }

                }),

                nfe : $resource(urlErp + '/nfe/get-xml-entrada/?:u', {u : '@u'}, {

                    getXml : {
                        method : 'GET'
                    }

                }),

                boleto : $resource(urlErp + '/financa/boleto/?:u', {u : '@u'}, {

                    salvar : {
                        method       : 'POST',
                        url          :  urlErp + '/financa/boleto',
                        params       :  {u : '@u'},
                        interceptor  :  {
                            response :  function(response) {
                                return response.data;
                            }
                        }
                    },

                    segundaVia : {
                        method       : 'POST',
                        url          :  urlErp + '/financa/boleto/segunda-via',
                        params       :  {u : '@u'},
                        interceptor  :  {
                            response :  function(response) {
                                return response.data;
                            }
                        }
                    },
                    
                    get : {
                        method : 'GET', 
                        url    : urlErp + '/financa/boleto/:tra_cod_tra',
                        params : {tra_cod_tra : '@tra_cod_tra'}
                    }, 
                    
                    cancelar : {
                        method : 'DELETE', 
                        url    : urlErp + '/financa/boleto/cancelar/:tit_fin_nro_lan/:tit_fatura_seq',
                        params : {
                            tit_fin_nro_lan : '@tit_fin_nro_lan',
                            tit_fatura_seq  : '@tit_fatura_seq'
                        },
                        interceptor  : {
                            response : function(response) {
                                return response.data;
                            }
                        }
                    }

                }),

                pagamento : $resource(CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ECO + '/eco-vix-pag/:tp/?:u',

                    {u : '@u', tp : '@tp'},

                    {
                        boleto : {
                            method      : 'GET',
                            url         : urlErp + '/financa/boleto/erp/?:u',
                            params      : {u: '@u'},
                            interceptor : {
                                response: function(resposta) {
                                    return resposta.data;
                                }
                            }
                        }
                    }
                ),

                conciliacao : $resource(urlErp + '/conciliacao', {u : '@u'}, {

                    create : {
                        method       : 'POST',
                        url          :  urlErp + '/conciliacao/:u',
                        interceptor  :  {
                            response :  function (response) {
                                return response.data;
                            }
                        }
                    },

                    lancamentos : {
                        method  : 'GET',
                        url     :  urlErp + '/conciliacao/?:u'
                    },

                    extrato : {
                        method  : 'GET',
                        url     : urlErp + '/conciliacao/extrato/?:u'
                    },

                    desfazer : {
                        method       : 'POST',
                        url          :  urlErp + '/conciliacao/desfazer/:u',
                        interceptor  :  {
                            response :  function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    conciliar : {
                        method       : 'POST',
                        url          : urlErp + '/conciliacao/conciliar/:u',
                        interceptor  :  {
                            response :  function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    valorar : {
                        method       : 'POST',
                        url          : urlErp + '/conciliacao/valorar/:u',
                        interceptor  :  {
                            response :  function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    conciliarResidual : {
                        method       : 'POST',
                        url          : urlErp + '/conciliacao/conciliar/residual/:u',
                        interceptor  :  {
                            response :  function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    listarByData : {
                        method  : 'GET',
                        url     : urlErp + '/conciliacao/listar-by-data/?:u'
                    }

                }),

                cobranca : $resource(urlErp + '/cobranca', {u : '@u'}, {

                    criarConta : {
                        method       : 'POST',
                        url          :  urlErp + '/cobranca/conta/:u',
                        interceptor  :  {
                            response :  function (response) {
                                return response.data;
                            }
                        }
                    },

                    verificarConta : {
                        method       : 'POST',
                        url          :  urlErp + '/cobranca/conta/verificar/:u',
                        interceptor  :  {
                            response :  function (response) {
                                return response.data;
                            }
                        }
                    },

                    consultarConta : {
                        method  : 'GET',
                        url     :  urlErp + '/cobranca/conta/consultar/:bco_cod_bco',
                        params  :  {bco_cod_bco : '@bco_cod_bco'}
                    },

                    getTransacao : {
                        method  : 'GET',
                        url     :  urlErp + '/cobranca/transacao/:sequencial',
                        params  :  {sequencial : '@sequencial'}
                    }

                }),

                banco : $resource(urlErp + '/vix-bco/:bco_cod_bco', {bco_cod_bco : '@bco_cod_bco'}, {

                    get : {
                        method : 'GET'
                    },

                    getDefault : {
                        url     :  urlErp + '/vix-bco/default',
                        method  : 'GET'
                    },

                    list : {
                        method  : 'GET',
                        url     :  urlErp + '/vix-bco/?:u',
                        params  :  {u : '@u'}
                    },

                    create : {
                        method       : 'POST',
                        url          :  urlErp + '/vix-bco/:u',
                        params       :  {u : '@u'},
                        interceptor  :  {
                            response :  function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    update : {
                        method      : 'PUT',
                        url         : urlErp + '/vix-bco/:bco_cod_bco',
                        params      : {
                            bco_cod_bco : '@bco_cod_bco'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancel : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-bco/:bco_cod_bco',
                        params : {
                            bco_cod_bco : '@bco_cod_bco'
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