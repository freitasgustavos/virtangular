'use strict';

angular.module('newApp')

    .factory('VendaService', [

        '$resource', 'CONFIG', 'GeralFactory', 'NotifyFlag', 'Storage', 'Upload',

        function ($resource, CONFIG, GeralFactory, NotifyFlag, Storage, Upload) {

            var objUsuario = Storage.usuario.getUsuario();

            var urlErp = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;
            var urlErp1 = CONFIG.HOSTNAME_1 + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;

            return {

                pagamento : $resource(CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ECO + '/eco-vix-pag/:tp/?:u',

                    {u : '@u', tp : '@tp'},

                    {
                        boleto : {
                            method       : 'GET',
                            url          : urlErp + '/financa/boleto/eco/?:u',
                            params       : {u : '@u'},
                            interceptor  : {
                                response : function (resposta) {
                                    return resposta.data;
                                }
                            }
                        }
                    }
                ),

                venda : $resource(urlErp + '/vix-fin/:op/:fin_nro_lan', {fin_nro_lan : '@fin_nro_lan', op:'@op'}, {

                    query : {
                        isArray : false
                    },

                    update : {
                        method       : 'PUT',
                        url          :  urlErp + '/vix-fin/:op/:fin_nro_lan',
                        params       :  {
                            fin_nro_lan : '@fin_nro_lan',
                            op : '@op'
                        },
                        interceptor  : {
                            response : function (response) {

                                if (NotifyFlag.getFlag() == 'true') {
                                    console.log('vai colocar notify');
                                    GeralFactory.notificar(response);
                                } else {
                                    console.log('nao vai colocar notify');
                                }

                                NotifyFlag.deleteFlag();

                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-fin/:op/:fin_nro_lan',
                        params : {
                            fin_nro_lan : '@fin_nro_lan'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelarTransporte : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-fin/transporte/:fin_nro_lan',
                        params : {
                            fin_nro_lan : '@fin_nro_lan'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    faturar : {
                        method : 'POST',
                        url    :  urlErp + '/vix-fin/venda/faturar'
                    },

                    faturarServico : {
                        method : 'POST',
                        url    :  urlErp + '/vix-fin/prest-servico/faturar'
                    },

                    faturarGenerico : {
                        method : 'POST',
                        url    :  urlErp + '/vix-fin/:op/faturar/:fin_nro_lan'
                    },

                    cancelarDocumento : {
                        method : 'POST',
                        url    :  urlErp + '/vix-fin/venda/acao-cancelar'
                    },

                    inutilizarNfeAvulso : {
                        method : 'POST',
                        url    :  urlErp + '/vix-fin/inutilizar-nfe-avulso'
                    },

                    atualizarStatusNFe : {
                        method       : 'PUT',
                        url          :  urlErp + '/nfe/atualizar-status-nfe/:fin_nro_lan',
                        params       :  {
                            fin_nro_lan : '@fin_nro_lan'
                        },
                        interceptor  :  {
                            response :  function (response) {
                                //GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelarStatusNFe : {
                        method       : 'PUT',
                        url          :  urlErp + '/nfe/cancelar-nfe/:fin_nro_lan',
                        params       :  {
                            fin_nro_lan : '@fin_nro_lan'
                        },
                        interceptor  :  {
                            response :  function (response) {
                                //GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelarStatusNFSe : {
                        method       : 'PUT',
                        url          :  urlErp + '/nfse/cancelar-nfse/:fin_nro_lan',
                        params       :  {
                            fin_nro_lan : '@fin_nro_lan'
                        },
                        interceptor  :  {
                            response :  function (response) {
                                //GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                vendas : $resource(urlErp + '/vix-fin/?:op', {u:'@u', op:'@op'}, {

                    get : {
                        method : 'GET',
                        url    :  urlErp + '/vix-fin/:op/?:u'
                    },

                    totalizar : {
                        method : 'GET',
                        url    :  urlErp + '/vix-fin/totalizar/?:u'
                    },

                    create : {
                        method       : 'POST',
                        url          :  urlErp + '/vix-fin/:op/:u',
                        interceptor  :  {
                            response :  function (response) {

                                console.log('responseee:',response);
                                if (NotifyFlag.getFlag() == 'true' || response.data.records.error) {
                                    GeralFactory.notificar(response);
                                } else {
                                }

                                NotifyFlag.deleteFlag();
                                return response.data;
                            }
                        }
                    },

                    ratearAtributo : {
                        method       : 'POST',
                        url          :  urlErp + '/vix-fin/ratear-valores-atributo/:u'
                    },

                    enviarNfe : {
                        method       : 'POST',
                        url          :  urlErp + '/nfe/criar-nfe/:u',
                        interceptor  :  {
                            response :  function (response) {
                                return response.data;
                            }
                        }
                    },

                    previweNfe : {
                        method       : 'POST',
                        url          :  urlErp + '/nfe/gera-preview-danfe/:u',
                        interceptor  :  {
                            response :  function (response) {
                                return response.data;
                            }
                        }
                    },

                    enviarNfse : {
                        method       : 'POST',
                        url          :  urlErp + '/nfse/criar-nfse/:u',
                        interceptor  :  {
                            response :  function (response) {
                                return response.data;
                            }
                        }
                    },
                    verExiste : {
                        method :'GET',
                        url : urlErp + '/vix-fin/ver-existe/?:u'
                    }
                }),


                relatorioVendas : $resource(urlErp + '/vix-fin/:op/rel/?:u', {u:'@u', op:'@op'}, {

                    get : {
                        method : 'GET',
                        url    :  urlErp + '/vix-fin/:op/rel/?:u'
                    }
                }),

                emailRastreio: $resource(urlErp + '/vix-fin/:op/rastreio/?:u', {u:'@u', op:'@op'}, {

                    enviar : {
                        method : 'POST',
                        url    : urlErp + '/vix-fin/:op/rastreio/:u',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    }
                }),

                impostos : $resource(urlErp + '/vix-imp/?:u', {u:'@u'}, {

                    get : {
                        method : 'GET',
                        url    :  urlErp + '/vix-imp/?:u'
                    }
                }),

                orcamentoEnviar: $resource(urlErp + '/vix-fin/orcamento/enviar/?:u', {u:'@u'}, {

                    get : {
                        method : 'GET',
                        url    : urlErp + '/vix-fin/orcamento/enviar/?:u'
                    }
                }),

                nfe : $resource(urlErp + '/nfe/criar/:u', {u:'@u'}, {

                    enviarEmail : {
                        method : 'POST',
                        url    : urlErp + '/nfe/enviar-email-consumidor/:u',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    },

                    atualizarCertificado : {
                        method : 'POST',
                        url    : urlErp + '/nfe/enviar-email-consumidor/:u',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    },

                    enviarCce : {
                        method : 'POST',
                        url    : urlErp + '/nfe/enviar-cce/:u',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    },
                    inutilizarNFe : {
                        method : 'POST',
                        url    : urlErp + '/nfe/inutilizar-nfe/:u',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    }
                }),

                vendaObs : $resource(urlErp + '/vix-fin/obs/:fin_nro_lan/?:u', {fin_nro_lan : '@fin_nro_lan', u:'@u'}, {

                    query : {
                        isArray : false
                    }

                }),

                vendasObs : $resource(urlErp + '/vix-fin/obs/:u', {u : '@u'}, {

                    get : {
                        method : 'GET',
                        url    : urlErp + '/vix-fin/obs/?:u'
                    },
                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-fin/obs/:u',
                        interceptor : {
                            response: function (response) {
                                return response.data;
                            }
                        }
                    }
                }),

                gerarPedidos : $resource(urlErp + '/vix-fin/gerar-pedidos/:u', {u : '@u'}, {

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-fin/gerar-pedidos/:u',
                        interceptor : {
                            response: function (response) {
                                return response.data;
                            }
                        }
                    }

                }),

                nfeUpload : function(file,dataJson, funcao) {
                    
                    Upload.upload({
                        url: urlErp + '/nfe/atualizar-dados-nfe-empresa/1',
                        headers: {'Content-Type': 'multipart/form-data',
                            'Accept': 'application/json'},
                        file: file,
                        data: dataJson, //{mid_tab: 3,mid_posicao:'A1',mid_link:'www.asdf222.com',mid_ordem:2,mid_nro:10},
                        fileFormDataName: 'imagem_upload'
                    }).progress(function (evt) {

                    }).success(function(data, status, headers, config) {
                        funcao(data);

                    }).error(function(data, status, headers, config) {
                    });
                }
            };
        }
    ]);