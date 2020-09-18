/**
 * Created by rubens on 13/11/15.
 */
'use strict';

angular.module('newApp')

    .factory('EmpresaService', [

        '$resource', 'CONFIG', 'GeralFactory', 'Storage',

        function($resource, CONFIG, GeralFactory, Storage) {

            var objUsuario = Storage.usuario.getUsuario(),
                identity = (objUsuario) ? objUsuario.ident_emp : CONFIG.IDENT_SISTEMA;

            var url = CONFIG.HOSTNAME + CONFIG.IDENT_SISTEMA + CONFIG.SCHEMA_SISTEMA;
            var urlErp = CONFIG.HOSTNAME + identity + CONFIG.SCHEMA_ERP;

            return {

                empresa : $resource(url + '/sis-emp/1', {emp_cod_emp : '1'}, {

                    get : {
                        method : 'GET'
                    },

                    update : {
                        method      : 'PUT',
                        url         : url + '/sis-emp/:emp_cod_emp',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                setores : $resource(url + '/sis-set/:u', {u: '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    mesclar : {
                        method : 'GET',
                        url    :  url + '/sis-set/mesclar/:u'
                    }

                }),

                sequence : $resource(url + '/sis-emp/set-seq', {u:'@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method       : 'POST',
                        url          :  url + '/sis-emp/set-seq/:u',
                        interceptor  :  {
                            response :  function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                empresateste : $resource(url + '/util/teste-render-html/', {emp_cod_emp : '1'}, {

                    get : {
                        method : 'GET'
                    }

                }),

                template : $resource(url + '/sis-tem/1', {emp_cod_emp : '1'}, {

                    get : {
                        method : 'GET'
                    },

                    update : {
                        method      : 'PUT',
                        url         : url + '/sis-tem/:emp_cod_emp',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                cst1 : $resource(url + '/util/cst1/?:u', {u : '@u'}, {
                    get : {
                        method : 'GET'
                    }
                }),
                cst2 : $resource(url + '/util/cst2/?:u', {u : '@u'}, {
                    get : {
                        method : 'GET'
                    }
                }),
                csosn1 : $resource(url + '/util/csosn1/?:u', {u : '@u'}, {
                    get : {
                        method : 'GET'
                    }
                }),
                csosn2 : $resource(url + '/util/csosn2/?:u', {u : '@u'}, {
                    get : {
                        method : 'GET'
                    }
                }),
                cstPisCofins : $resource(url + '/util/cst-pis-cofins/?:u', {u : '@u'}, {
                    get : {
                        method : 'GET'
                    }
                }),
                cstIpi : $resource(url + '/util/cst-ipi/?:u', {u : '@u'}, {
                    get : {
                        method : 'GET'
                    }
                }),

                ufs : $resource(url + '/geral-end/uf', { }, {
                    get : {
                        method : 'GET'
                    }
                }),

                cidades : $resource(url + '/geral-end/cidade/uf/?:u', {u : '@u'}, {
                    get : {
                        method : 'GET'
                    }
                }),

                endereco : $resource(url + '/geral-end/cep/?:u', {u : '@u'}, {
                    get : {
                        method: 'GET'
                    }
                }),

                paises : $resource(url + '/geral-end/pais/:u', {u : '@u'}, {
                    get : {
                        method: 'GET'
                    }
                }),

                getCidadePorUf : function(uf, callback) {
                    var ret = uf.split('#');
                    var strFiltro = 'q=(end_endereco_uf:' + ret[0] + ')';
                    this.cidades.get({u : strFiltro}, function(data) {
                        callback(data);
                    });
                },

                getEnderecoPorCep : function(cep, callback) {
                    cep = cep.substr(0, 5) + '-' + cep.substr(5);

                    var strFiltro = 'q=(cep:' + cep + ')';
                    this.endereco.get({u : strFiltro}, function(data) {
                        callback(data.records);
                    });
                },

                fretes : $resource(urlErp + '/vix-frt/', {u:'@u'}, {

                    get : {
                        method : 'GET',
                        url    :  urlErp + '/vix-frt/:u'
                    },

                    create : {
                        method       : 'POST',
                        url          :  urlErp + '/vix-frt/:u',
                        interceptor  :  {
                            response :  function (response) {
                                return response.data;
                            }
                        }
                    }

                }),

                rastreamento : $resource(urlErp + '/vix-frt/rastreamento/?:u', {u:'@u'}, {

                    get : {
                        method : 'GET',
                        url    : urlErp + '/vix-frt/rastreamento/:u'
                    }

                }),

                sincronismoproduto : $resource(urlErp + '/sinc-sistemas/sinc-produto', {

                    get : {
                        method : 'GET'
                    }

                }),


                sincronismoprodutosaldo : $resource(urlErp + '/sinc-sistemas/sinc-saldo-produto', {

                    get : {
                        method : 'GET'
                    }

                }),

                listarlogsmigracaoatual : $resource(url + '/migracao/listar-logs-migracao-atual/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    }

                }),

                termo : $resource(url + '/sis-emp/enviar-termo/:u', {u : '@u'}, {

                    enviarEmail : {
                        method : 'POST',
                        url    : url + '/sis-emp/enviar-termo/:u',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    }

                }),

                inventario : $resource(url + '/sis-usu/libera-importacao-inventario', {u : '@u'}, {

                    liberaTela : {
                        method : 'POST',
                        url    : url + '/sis-usu/libera-importacao-inventario',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    }

                })

            };

        }

    ]);