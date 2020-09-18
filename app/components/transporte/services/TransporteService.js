'use strict';

angular.module('newApp')

    .factory('TransporteService', [

        '$resource', 'CONFIG', 'GeralFactory', 'NotifyFlag', 'Storage', 'Upload',

        function ($resource, CONFIG, GeralFactory, NotifyFlag, Storage, Upload) {

            var objUsuario = Storage.usuario.getUsuario();

            var urlErp = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;
            var urlErp1 = CONFIG.HOSTNAME_1 + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;

            return {

                frete : $resource(urlErp + '/vix-cte/:cte_fin_nro_lan', {cte_fin_nro_lan : '@cte_fin_nro_lan'}, {

                    get : {
                        method : 'GET',
                        url    :  urlErp + '/vix-cte/:cte_fin_nro_lan'
                    },

                    query : {
                        isArray : false
                    },

                    update : {
                        method       : 'PUT',
                        url          :  urlErp + '/vix-cte/:cte_fin_nro_lan',
                        params       :  {
                            cte_fin_nro_lan : '@cte_fin_nro_lan',
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
                        url    : urlErp + '/vix-cte/:fin_nro_lan',
                        params : {
                            cte_fin_nro_lan : '@fin_nro_lan'
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
                        url    :  urlErp + '/vix-cte/faturar'
                    },

                    cancelarDocumento : {
                        method : 'POST',
                        url    :  urlErp + '/vix-cte/acao-cancelar'
                    },

                    atualizarStatusCTe : {
                        method       : 'PUT',
                        url          :  urlErp + '/cte/atualizar-status-cte/:cte_fin_nro_lan',
                        params       :  {
                            cte_fin_nro_lan : '@cte_fin_nro_lan'
                        },
                        interceptor  :  {
                            response :  function (response) {
                                //GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelarStatusCTe : {
                        method       : 'PUT',
                        url          :  urlErp + '/cte/cancelar-cte/:cte_fin_nro_lan',
                        params       :  {
                            cte_fin_nro_lan : '@cte_fin_nro_lan'
                        },
                        interceptor  :  {
                            response :  function (response) {
                                //GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                fretes : $resource(urlErp + '/vix-cte/?:u', {u:'@u'}, {

                    get : {
                        method : 'GET',
                        url    :  urlErp + '/vix-cte/?:u'
                    },

                    totalizar : {
                        method : 'GET',
                        url    :  urlErp + '/vix-cte/totalizar/?:u'
                    },

                    create : {
                        method       : 'POST',
                        url          :  urlErp + '/vix-cte/:u',
                        interceptor  :  {
                            response :  function (response) {

                                if (NotifyFlag.getFlag() == 'true') {
                                    GeralFactory.notificar(response);
                                } else {
                                }

                                NotifyFlag.deleteFlag();
                                return response.data;
                            }
                        }
                    },

                    enviarCTe : {
                        method       : 'POST',
                        url          :  urlErp + '/cte/criar-cte/:u',
                        interceptor  :  {
                            response :  function (response) {
                                return response.data;
                            }
                        }
                    }
                }),

                veiculos : $resource(urlErp + '/vix-cte-vei/?:u', {u:'@u'}, {

                    get : {
                        method : 'GET',
                        url    :  urlErp + '/vix-cte-vei/:u'
                    },

                    listar : {
                        method : 'GET',
                        url    :  urlErp + '/vix-cte-vei/?:u'
                    },

                    cancelar : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-cte-vei/:vei_cod_vei',
                        params : {
                            vei_cod_vei     : '@vei_cod_vei'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    create : {
                        method       : 'POST',
                        url          :  urlErp + '/vix-cte-vei/:u',
                        interceptor  :  {
                            response :  function (response) {

                                if (NotifyFlag.getFlag() == 'true') {
                                    GeralFactory.notificar(response);
                                } else {
                                }

                                NotifyFlag.deleteFlag();
                                return response.data;
                            }
                        }
                    }
                }),

                impostos : $resource(urlErp + '/vix-imp/?:u', {u:'@u'}, {

                    get : {
                        method : 'GET',
                        url    :  urlErp + '/vix-imp/?:u'
                    },

                    aliqInterIcms : {
                        method : 'GET',
                        url    :  urlErp + '/vix-cte/aliquota-icms'
                    }
                }),

                cte : $resource(urlErp + '/cte/criar/:u', {u:'@u'}, {

                    enviarEmail : {
                        method : 'POST',
                        url    : urlErp + '/cte/enviar-email-tomador/:u',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    },

                    atualizarCertificado : {
                        method : 'POST',
                        url    : urlErp + '/cte/enviar-email-consumidor/:u',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    },

                    enviarCce : {
                        method : 'POST',
                        url    : urlErp + '/cte/enviar-cce/:u',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    },
                    inutilizarCTe : {
                        method : 'POST',
                        url    : urlErp + '/cte/inutilizar-cte/:u',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    }

                }),

                freteObs : $resource(urlErp + '/vix-fin/obs/:fin_nro_lan/?:u', {fin_nro_lan : '@fin_nro_lan', u:'@u'}, {

                    query : {
                        isArray : false
                    }

                }),
                
                fretesObs : $resource(urlErp + '/vix-cte/obs/:u', {u : '@u'}, {
                
                    get : {
                        method : 'GET',
                        url    : urlErp + '/vix-cte/obs/?:u'
                    },
                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-cte/obs/:u',
                        interceptor : {
                            response: function (response) {
                                return response.data;
                            }
                        }
                    }
                })
                //
                // cteUpload : function(file,dataJson, funcao) {
                //
                //     Upload.upload({
                //         url: urlErp1 + '/cte/atualizar-dados-cte-empresa/1',
                //         headers: {'Content-Type': 'multipart/form-data',
                //             'Accept': 'application/json'},
                //         file: file,
                //         data: dataJson, //{mid_tab: 3,mid_posicao:'A1',mid_link:'www.asdf222.com',mid_ordem:2,mid_nro:10},
                //         fileFormDataName: 'imagem_upload'
                //     }).progress(function (evt) {
                //
                //     }).success(function(data, status, headers, config) {
                //         funcao(data);
                //
                //     }).error(function(data, status, headers, config) {
                //     });
                // }
            };
        }
    ]);