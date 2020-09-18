'use strict';

angular.module('newApp')

    .factory('EndGeralService', ['$resource', 'CONFIG', function($resource, CONFIG) {

        var url = CONFIG.HOSTNAME + CONFIG.IDENT_SISTEMA + CONFIG.SCHEMA_SISTEMA;

        return {

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

            cidadeCodIbge : $resource(url + '/geral-end/cidade/ibge/:u', {u : '@u'}, {
                get : {
                    method: 'GET'
                }
            }),

            paises : $resource(url + '/geral-end/pais/:u', {u : '@u'}, {
                get : {
                    method: 'GET'
                }
            }),

            getEnderecoPorCep : function(cep, callback) {
                cep = cep.substr(0, 5) + '-' + cep.substr(5);

                var strFiltro = 'q=(cep:' + cep + ')';
                this.endereco.get({u : strFiltro}, function(data) {
                    callback(data.records);
                });
            },

            getCidadePorUf : function(uf, callback) {
                if(uf != null) {
                    var ret = uf.split('#');
                    var strFiltro = 'q=(end_endereco_uf:' + ret[0] + ')';
                    this.cidades.get({u : strFiltro}, function(data) {
                        callback(data);
                    });
                }

            }
        };

    }])

    .factory('ParamsService', ['$resource', 'CONFIG', 'GeralFactory', 'Storage',

        function ($resource, CONFIG, GeralFactory, Storage) {

            var objUsuario = Storage.usuario.getUsuario();
            var urlErp = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;
            var url = CONFIG.HOSTNAME + CONFIG.IDENT_SISTEMA + CONFIG.SCHEMA_SISTEMA;


            return {
                params  : $resource(urlErp + '/vix-par/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-par/:u',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                param  : $resource(urlErp + '/vix-par/:combinadoPar', {combinadoPar: '@combinadoPar'}, {

                    get : {
                        method : 'GET'
                    },

                    update: {
                        method: 'PUT',
                        url: urlErp + '/vix-par/:par_pai',
                        params: {
                            par_pai: '@par_pai'
                        },
                        interceptor: {
                            response: function (response) {
                                // GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                paramPadroesNat  : $resource(urlErp + '/vix-par/padroes-nat/:combinadoPar', {combinadoPar: '@combinadoPar'}, {

                    get : {
                        method : 'GET'
                    },

                }),

                paramsRot  : $resource(urlErp + '/vix-par-rot/?:u', {u : '@u'}, {
                    get : {
                        method : 'GET'
                    }
                }),

                getArrAssunto : function() {

                    /**
                     *  Removido a pedido do Amador através do TICKET 90899
                     * {'cod_assunto' : 6030 , 'desc_assunto' : 'Código RNTRC', 'desc_assunto_param' : 'param', 'desc_assunto_params' : 'param'}
                     */
                    return [
                        {'cod_assunto':6050, 'desc_assunto':'Centro de Custo'   , 'desc_assunto_param':'centroCusto'    , 'desc_assunto_params':'centroCustos'},
                        {'cod_assunto':5010, 'desc_assunto':'Contas Financeiras', 'desc_assunto_param':'contaFinanceira', 'desc_assunto_params':'contaFinanceiras'},
                        {'cod_assunto':6040, 'desc_assunto':'Depto de produtos' , 'desc_assunto_param':'deptoProduto'   , 'desc_assunto_params':'params'},
                        {'cod_assunto':6025, 'desc_assunto':'Fase'              , 'desc_assunto_param':'fase'           , 'desc_assunto_params':'params'},
                        {'cod_assunto':6060, 'desc_assunto':'Meio de Pagamento' , 'desc_assunto_param':'formaPagamento' , 'desc_assunto_params':'formaPagamentos'},
                        {'cod_assunto':6010, 'desc_assunto':'Vendedor'          , 'desc_assunto_param':'vendedor'       , 'desc_assunto_params':'vendedores'},
                        {'cod_assunto':2010, 'desc_assunto':'Tipo de Calendário', 'desc_assunto_param':'param'          , 'desc_assunto_params':'params'},
                        {'cod_assunto':1010, 'desc_assunto':'Campos adicionais' , 'desc_assunto_param':'param'          , 'desc_assunto_params':'params'},
                        {'cod_assunto':2040, 'desc_assunto':'Tipo de Cadastro'  , 'desc_assunto_param':'tipoCadastro'   , 'desc_assunto_params':'tiposCadastro'},
                        {'cod_assunto':1000, 'desc_assunto':'Parâmetros Gerais' , 'desc_assunto_param':'param'          , 'desc_assunto_params':'params'}
                    ];
                },

                getDescAssunto : function(codAssunto,acao) {

                    var d;

                    angular.forEach(this.getArrAssunto(),function(reg,k) {



                        if(reg.cod_assunto == codAssunto) {
                            if(acao) {
                                d = reg.desc_assunto_param;
                            } else {
                                d = reg.desc_assunto_params;
                            }
                        }
                    });

                    //console.log('dd: ',d);

                    return d;
                },

                getParametros : function(str, callback) {
                    if (str) {
                        var strFiltro = 'q=(assunto:' + str + ')';
                        this.params.get({u : strFiltro}, function(data) {
                            callback(data.records);
                        });
                    }
                },

                getParametro : function(str, callback) {
                    if (str) {
                        this.param.get({combinadoPar : str}, function(data) {
                            callback(data.records);
                        });
                    }
                },

                situacoes : {

                    get : function() {
                        return [
                            {par_pgm:6000, par_assunto:6035, par_pai: 0, par_c01:'Documento Pendente', par_c02:'#696969'},
                            {par_pgm:6000, par_assunto:6035, par_pai:12, par_c01:'Alerta'            , par_c02:'#FF0000'},
                            {par_pgm:6000, par_assunto:6035, par_pai:13, par_c01:'Aguardando'        , par_c02:'#FFA500'},
                            {par_pgm:6000, par_assunto:6035, par_pai:14, par_c01:'Erro'              , par_c02:'#FF0000'},
                            {par_pgm:6000, par_assunto:6035, par_pai:15, par_c01:'DPEC'              , par_c02:'#9400D3'},
                            {par_pgm:6000, par_assunto:6035, par_pai:81, par_c01:'Inutilizado'       , par_c02:'#FF1493'},
                            {par_pgm:6000, par_assunto:6035, par_pai:90, par_c01:'Autorizado'        , par_c02:'#008000'},
                            {par_pgm:6000, par_assunto:6035, par_pai:91, par_c01:'Denegado'          , par_c02:'#FF0000'},
                            {par_pgm:6000, par_assunto:6035, par_pai:92, par_c01:'Encerrado'         , par_c02:'#006400'},
                            {par_pgm:6000, par_assunto:6035, par_pai:99, par_c01:'Cancelado'         , par_c02:'#8B4513'}
                        ];
                    }

                },

                vendedor : $resource(urlErp + '/vix-vdd/:par_pai', {par_pai : '@par_pai'}, {

                    query: {
                        isArray: false
                    },

                    update: {
                        method: 'PUT',
                        url: urlErp + '/vix-vdd/:par_pai',
                        params: {
                            par_pai: '@par_pai'
                        },
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar: {
                        method: 'DELETE',
                        url: urlErp + '/vix-vdd/:combinadoPar',
                        params: {
                            combinadoPar: '@combinadoPar'
                        },
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                vendedores : $resource(urlErp +  '/vix-vdd/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-vdd/:u',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                formaPagamento : $resource(urlErp + '/vix-fpg/:par_pai', {par_pai : '@par_pai'}, {

                    query: {
                        isArray: false
                    },

                    update: {
                        method: 'PUT',
                        url: urlErp + '/vix-fpg/:par_pai',
                        params: {
                            par_pai: '@par_pai'
                        },
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar: {
                        method: 'DELETE',
                        url: urlErp + '/vix-fpg/:combinadoPar',
                        params: {
                            combinadoPar: '@combinadoPar'
                        },
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                formaPagamentos : $resource(urlErp +  '/vix-fpg/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-fpg/:u',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                tiposCadastro : $resource(urlErp + '/vix-tca/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-tca/:u',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                tipoCadastro : $resource(urlErp + '/vix-tca/:par_pai', {par_pai : '@par_pai'}, {

                    query : {
                        isArray : false
                    },
                    cancelar: {
                        method: 'DELETE',
                        url: urlErp + '/vix-tca/:combinadoPar',
                        params: {
                            combinadoPar: '@combinadoPar'
                        },
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },
                    update: {
                        method: 'PUT',
                        url: urlErp + '/vix-tca/:par_pai',
                        params: {
                            par_pai: '@par_pai'
                        },
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                fase : $resource(urlErp + '/vix-fas/:u', {par_pai : '@par_pai'}, {

                    query: {
                        isArray: false
                    },

                    update: {
                        method: 'PUT',
                        url: urlErp + '/vix-fas/:par_pai',
                        params: {
                            par_filho: '@par_pai'
                        },
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar: {
                        method: 'DELETE',
                        url: urlErp + '/vix-fas/:combinadoPar',
                        params: {
                            combinadoPar: '@combinadoPar'
                        },
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                fases : $resource(urlErp +  '/vix-fas/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-fas/:u',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                contaFinanceira : $resource(urlErp + '/vix-ctf/:par_pai', {par_pai : '@par_pai'}, {

                    query : {
                        isArray : false
                    },

                    update : {
                        method : 'PUT',
                        url    : urlErp + '/vix-ctf/:par_pai',
                        params : {
                            par_pai: '@par_pai'
                        },
                        interceptor  : {
                            response : function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method  : 'DELETE',
                        url     : urlErp + '/vix-ctf/:combinadoPar',
                        params: {
                            combinadoPar: '@combinadoPar'
                        },
                        interceptor  : {
                            response : function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                contaFinanceiras : $resource(urlErp +  '/vix-ctf/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-ctf/:u',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                centroCusto : $resource(urlErp + '/vix-cdc/:par_pai', {par_pai : '@par_pai'}, {

                    query: {
                        isArray: false
                    },

                    update: {
                        method: 'PUT',
                        url: urlErp + '/vix-cdc/:par_pai',
                        params: {
                            par_pai: '@par_pai'
                        },
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar: {
                        method: 'DELETE',
                        url: urlErp + '/vix-cdc/:combinadoPar',
                        params: {
                            combinadoPar: '@combinadoPar'
                        },
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                centroCustos : $resource(urlErp +  '/vix-cdc/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-cdc/:u',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                cfop : $resource(urlErp + '/vix-par/cfo/:id', {id : '@id'}, {

                    query: {
                        isArray: false
                    },
                    update: {
                        method: 'PUT',
                        url: urlErp + '/vix-par/cfo/:id',
                        params: {
                            par_pai: '@id'
                        },
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },
                }),

                cfops : $resource(urlErp +  '/vix-par/cfo/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    }

                }),

                transportadora : $resource(urlErp + '/vix-trp/:par_pai', {par_pai : '@par_pai'}, {

                    query: {
                        isArray: false
                    },

                    update: {
                        method: 'PUT',
                        url: urlErp + '/vix-trp/:par_pai',
                        params: {
                            par_pai: '@par_pai'
                        },
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar: {
                        method: 'DELETE',
                        url: urlErp + '/vix-trp/:combinadoPar',
                        params: {
                            combinadoPar: '@combinadoPar'
                        },
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                transportadoras : $resource(urlErp +  '/vix-trp/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method      : 'POST',
                        url         : urlErp + '/vix-trp/:u',
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }
                }),

                tabAliq : $resource(url +  '/util/tab-aliq/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    }

                }),
                tabAliqInter : $resource(url +  '/util/tab-aliq-inter/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    }

                })
            };
        }
    ])

    .factory('MidiaService', ['$resource', '$timeout', 'CONFIG', 'Upload', 'Storage',

        function ($resource, $timeout, CONFIG, Upload, Storage) {

            var objUsuario = Storage.usuario.getUsuario();

            var urlErp = CONFIG.HOSTNAME_1 + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;

            var urlErpTeste = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;

            var urlSistema = CONFIG.HOSTNAME_1 + objUsuario.ident_emp + CONFIG.SCHEMA_SISTEMA;

            return {
                midia : $resource(urlErp + '/vix-mid/:mid_nro', {mid_nro : '@mid_nro'}, {

                    query : {
                        isArray : false
                    },

                    remover : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-mid/:mid_nro',
                        params : {
                            mid_nro : '@mid_nro'
                        }
                    },

                    desativar : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-mid/desativar/:mid_nro',
                        params : {
                            mid_nro : '@mid_nro'
                        }
                    },

                    clonar : {
                        method      : 'POST',
                        url         : urlErp + '/vix-mid/clonar/:u',
                        params      : {u : '@u'},
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    }
                }),

                midias : $resource(urlErp + '/vix-mid/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    getEstampas : {
                        method  : 'GET',
                        url     :  urlErp + '/vix-mid/get-estampas/?:u',
                        params  :  {u : '@u'}
                    }

                }),

                upload : function(file,dataJson, funcao) {

                    var strComp = (dataJson.mid_nro) ? dataJson.mid_nro : '';
                    Upload.upload({

                        url : urlErpTeste + '/vix-mid/' + strComp,
                        headers : {
                            'Content-Type' : 'multipart/form-data',
                            'Accept' : 'application/json'
                        },
                        file : file,
                        data : dataJson,
                        fileFormDataName : 'imagem_upload'

                    }).progress(function(evt) {

                    }).success(function(data, status, headers, config) {

                        funcao(data);

                    }).error(function(data, status, headers, config) {

                    });
                },

                migracao : function(file, tipoImportacao, dataJson, funcao) {

                    //var strComp = (dataJson.mid_nro) ? dataJson.mid_nro : '';
                    Upload.upload({

                        url : urlSistema + '/migracao/' + tipoImportacao,
                        headers : {
                            'Content-Type' : 'multipart/form-data',
                            'Accept' : 'application/json'
                        },
                        file : file,
                        data : dataJson,
                        fileFormDataName : 'arquivo_upload'

                    }).progress(function(evt) {

                    }).success(function(data, status, headers, config) {

                        funcao(data);

                    }).error(function(data, status, headers, config) {

                    });
                },

                urlDragandDrop_virtux: function(tipoImportacao) {
                    return urlSistema + '/migracao/' + tipoImportacao;
                },

                logFilesNames: $resource(urlSistema + '/migracao/logsNames/?:u', {u: '@u'}, {
                    get : {
                        method: 'GET'
                    }
                }),

                backupData: $resource (urlSistema + '/migracao/backup/?:u', {u: '@u'}, {
                    get : {
                        method: 'GET'
                    }
                }),

                urlDragandDrop : function () {

                    return urlSistema + '/migracao/importa-xml-nfe';
                },

                lancarDadosNFeCompra : $resource(urlSistema + '/migracao/salvar-nfe-compra?:u', {u : '@u'}, {

                    post: {
                        method: 'POST'
                    }
                })
            };
        }
    ])

    .factory('WizardService', ['$resource', 'CONFIG', 'GeralFactory', 'Storage',

        function ($resource, CONFIG, GeralFactory, Storage) {
            var objUsuario = Storage.usuario.getUsuario();

            var url = CONFIG.HOSTNAME + CONFIG.IDENT_SISTEMA + CONFIG.SCHEMA_SISTEMA;

            return {
                updateWiz: $resource(url + '/sis-wiz-usu/set-wizards/:u', {u : '@u'}, {
                    update : {
                        method : 'PUT'
                    }
                })
            };
        }
    ])

    .factory('NotificacaoService', ['$resource', '$timeout', 'CONFIG', 'Upload', 'Storage','GeralFactory',

        function ($resource, $timeout, CONFIG, Upload, Storage, GeralFactory) {

            var objUsuario = Storage.usuario.getUsuario();

            var url = CONFIG.HOSTNAME + CONFIG.IDENT_SISTEMA + CONFIG.SCHEMA_SISTEMA;

            return {
                notificacao : $resource(url + '/sis-not/virtux/?:u', {u:'@u'}, {

                    query : {
                        isArray : false
                    }

                }),

                notificacoes : $resource(url + '/sis-not/virtux/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    },

                    atualizarLeuBadge : {
                        method      : 'POST',
                        url         : url + '/sis-not/atualizar-leu-badge/virtux/:u',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    }
                })
            };
        }
    ])

    .factory('NotaLogService', ['$resource', '$timeout', 'CONFIG', 'Upload', 'Storage', 'GeralFactory',

        function ($resource, $timeout, CONFIG, Upload, Storage, GeralFactory) {

            var objUsuario = Storage.usuario.getUsuario();

            var url = CONFIG.HOSTNAME + CONFIG.IDENT_SISTEMA + CONFIG.SCHEMA_ERP;

            return {
                notaLog : $resource(url + '/nota-log/?:u', {u:'@u'}, {

                    query : {
                        isArray : false
                    }

                }),

                notaLogs : $resource(url + '/nota-log/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    }

                })
            };
        }
    ])

    .factory('AutocompleteService', ['$resource', 'CONFIG', 'Storage', function($resource, CONFIG, Storage) {

        var objUsuario = Storage.usuario.getUsuario();

        var url = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;

        return {

            cliente        : $resource(url + '/vix-cad/autocomplete/?:u', {u:  '@u'}, {get : {method : 'GET'}}),
            produto        : $resource(url + '/vix-pro/autocomplete/?:u', {u : '@u'}, {get : {method : 'GET'}}),
            formaPgto      : $resource(url + '/vix-fpg/?:u', {u : '@u'}, {get : {method : 'GET'}}),
            vendedor       : $resource(url + '/vix-vdd/?:u', {u : '@u'}, {get : {method : 'GET'}}),
            transportadora : $resource(url + '/vix-trp/?:u', {u : '@u'}, {get : {method : 'GET'}}),
            contaFinan     : $resource(url + '/vix-ctf/?:u', {u : '@u'}, {get : {method : 'GET'}}),
            centroCusto    : $resource(url + '/vix-cdc/?:u', {u : '@u'}, {get : {method : 'GET'}}),
            tipoCadastro   : $resource(url + '/vix-tca/?:u', {u : '@u'}, {get : {method : 'GET'}}),
            agrupamento    : $resource(url + '/vix-agp/?:u', {u : '@u'}, {get : {method : 'GET'}}),
            veiculo        : $resource(url + '/vix-cte-vei/?:u', {u : '@u'}, {get : {method : 'GET'}})

        };
    }])

    .factory('ImpostoFactory', ['$resource', 'CONFIG', 'Storage','ParamsService','VendaService','ProdutoService', 'GeralFactory', 'EmpresaService', '$timeout',

        function($resource, CONFIG, Storage, ParamsService, VendaService, ProdutoService, GeralFactory, EmpresaService, $timeout) {

            return {
                setRegraSt: function (newTributoIcms,venda,cliente,empresa,produto,callback) {

                    //console.log('newTributoIcms33:',newTributoIcms);
                    //console.log('empresa: ' ,empresa);
                    //console.log('ba: ',newTributoIcms.tri_bc_vlr_bruto);
                    //console.log('produto: ',produto);
                    var bcVlrBruto = newTributoIcms.tri_bc_vlr_bruto;

                    newTributoIcms.tri_bc_perc_mva = 0;
                    newTributoIcms.tri_bc_perc_reducao = 0;

                    ParamsService.tabAliq.get({}, function(retorno) {

                        var arrAliq =  retorno.records;

                        //console.log('bcVlrBruto: ', bcVlrBruto);
                        //console.log('arrAliq: ',arrAliq);
                        //console.log('uffff: ',cliente.endereco.end_endereco_uf);

                        ParamsService.tabAliqInter.get({}, function(retornoAliqInter) {

                            var arrAliqInter =  retornoAliqInter.records;

                            newTributoIcms.tri_aliq_perc = arrAliq[cliente.endereco.end_endereco_uf];
                            newTributoIcms.tri_imp_cod_imp = 2;
                            newTributoIcms.tri_tab_aliq_interna = arrAliqInter[empresa['emp_uf']][cliente.endereco.end_endereco_uf];
                            newTributoIcms.tri_eh_retido = 1;
                            newTributoIcms.tri_eh_retido_aux = true;

                            //console.log('ncm vale: ',produto.pro_ncm);
                            //console.log('tri_tab_aliq_interna: ',newTributoIcms.tri_tab_aliq_interna);

                            if(produto.pro_ncm != '') {

                                produto.pro_ncm = produto.pro_ncm.replace(/\./gi, '');
                                //produto.pro_ncm = produto.pro_ncm.replace('.','');
                                //console.log('ncm vale2: ',produto.pro_ncm);

                                var objFiltro = {'ncm_nro_ncm':produto.pro_ncm};
                                var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                                //console.log('ncm eh diferente vazio');
                                ProdutoService.ncms.get({u : strFiltro},function(result) {

                                    //console.log('dentro ncm get');

                                    var mvaNota = 0;
                                    var pautaNota = 0;
                                    var reducaoNota = 0;

                                    var r = result.records;
                                    if(r.length > 0) {

                                        var reg = r[0];

                                        //console.log('reg ncm: ',reg);

                                        mvaNota = reg.ncm_perc_mva_padrao_contri;
                                        pautaNota = reg.ncm_vlr_pauta_padrao_contri;
                                        reducaoNota = reg.ncm_vlr_reducao_base_calc;

                                        if(pautaNota != 0) {

                                            bcVlrBruto = reg.ncm_perc_mva_padrao_consu;
                                            newTributoIcms.tri_bc_perc_mva = 0;

                                        } else {
                                            //console.log('tri_bc_perc_mva pega mvanota: ' ,mvaNota);
                                            newTributoIcms.tri_bc_perc_mva = mvaNota;

                                        }

                                        if(reducaoNota != 0) {
                                            newTributoIcms.tri_bc_perc_reducao = reducaoNota;
                                        }

                                        //console.log('mvaNota e pautaNota: ',mvaNota , ' -- ', pautaNota ,' -- ' , reducaoNota);
                                    }

                                    newTributoIcms.tri_bc_perc_mva = mvaNota;
                                    newTributoIcms.tri_bc_perc_reducao = reducaoNota;

                                    var vBCTemp = parseFloat(bcVlrBruto) - parseFloat(bcVlrBruto) * (newTributoIcms.tri_bc_perc_reducao/100);
                                    newTributoIcms.tri_bc_vlr_liquido = vBCTemp + (vBCTemp * (newTributoIcms.tri_bc_perc_mva/100));

                                    newTributoIcms.tri_imp_vlr_diferenca = (vBCTemp  * parseFloat(newTributoIcms.tri_tab_aliq_interna)/100  * -1);

                                    newTributoIcms.tri_imp_vlr_bruto   = (parseFloat(newTributoIcms.tri_bc_vlr_liquido) * newTributoIcms.tri_aliq_perc /100);
                                    newTributoIcms.tri_imp_vlr_liquido = GeralFactory.roundNumber((newTributoIcms.tri_imp_vlr_bruto + newTributoIcms.tri_imp_vlr_diferenca),2);

                                    callback(newTributoIcms);
                                });
                            } else {
                                //console.log('ncm else3');

                                // newTributoIcms.tri_bc_vlr_liquido = parseFloat(bcVlrBruto)
                                //     - (parseFloat(bcVlrBruto) * parseFloat(newTributoIcms.tri_bc_perc_reducao)/100)
                                //     + (parseFloat(bcVlrBruto) * parseFloat(newTributoIcms.tri_bc_perc_mva)/100);

                                var vBCTemp = (parseFloat(bcVlrBruto) - parseFloat(bcVlrBruto) * (newTributoIcms.tri_bc_perc_reducao/100));
                                newTributoIcms.tri_bc_vlr_liquido = (vBCTemp + (vBCTemp * (newTributoIcms.tri_bc_perc_mva/100)));

                                newTributoIcms.tri_imp_vlr_diferenca = (vBCTemp  * parseFloat(newTributoIcms.tri_tab_aliq_interna)/100  * -1);

                                //newTributoIcms.tri_imp_vlr_diferenca = parseFloat(bcVlrBruto) * parseFloat(newTributoIcms.tri_tab_aliq_interna)/100  * -1;

                                newTributoIcms.tri_imp_vlr_bruto   = (parseFloat(newTributoIcms.tri_bc_vlr_liquido) * newTributoIcms.tri_aliq_perc /100);
                                newTributoIcms.tri_imp_vlr_liquido = GeralFactory.roundNumber((newTributoIcms.tri_imp_vlr_bruto + newTributoIcms.tri_imp_vlr_diferenca),2);

                                callback(newTributoIcms);
                            }
                        });



                    });

                },

                mudarImposto: function(objImposto, itemProduto, callback) {

                    objImposto.tri_naotrib_tip = '0';
                    objImposto.tri_imp_vlr_diferenca = 0;
                    objImposto.tri_naotrib_vlr = 0;
                    objImposto.tri_bc_perc_mva = 0;
                    objImposto.tri_bc_perc_reducao = 0;
                    objImposto.tri_eh_retido_aux = false;
                    objImposto.tri_bc_vlr_bruto = itemProduto.ite_vlr_tot_bruto;  //vai usar o inicial la da VendaCtrl

                    if (!objImposto.tri_aliq_perc > 0) {
                        //console.log('aliq nao é maior que zero entao seta zero');
                        objImposto.tri_aliq_perc = 0;
                    }

                    //console.log('vlr aliq: ', objImposto.tri_aliq_perc);

                    objImposto.tri_imp_vlr_bruto = (parseFloat(objImposto.tri_bc_vlr_liquido) * objImposto.tri_aliq_perc / 100);
                    objImposto.tri_imp_vlr_liquido = objImposto.tri_imp_vlr_bruto;

                    //objImposto.tri_imp_cod_imp = 1;

                    if (objImposto.tri_imp_cod_imp == 2 || objImposto.tri_imp_cod_imp == 11) {
                        objImposto.tri_eh_retido_aux = true;

                    }

                    //console.log('tri bc vlrbruto: ', objImposto.tri_naotrib_vlr);

                    if (objImposto.tri_bc_vlr_bruto == '') {
                        objImposto.tri_naotrib_vlr = itemProduto.ite_vlr_tot_liquido;
                    }

                    callback(objImposto);
                },

                carregarListaCstCso: function(objImposto, tipCs, mudouEstado, callback) {

                    var retorno = {
                        arrCso : [],
                        arrCst : [],
                        labCs  : ''
                    };

                    switch (objImposto.tri_imp_cod_imp) {

                        case 1:
                            if (tipCs == 1 || tipCs == 2) {
                                //console.log('eh sn');
                                retorno.labCs = 2;
                                EmpresaService.csosn2.get({}, function (data) {
                                    //console.log('vai vir lista cso');
                                    retorno.arrCso = GeralFactory.formataObjSelect(data.records);

                                    EmpresaService.cst2.get({}, function (data) {
                                        retorno.arrCst = GeralFactory.formataObjSelect(data.records);

                                        callback(retorno);
                                    });
                                });
                            }

                            // else if(tipCs == 2) {
                            //     retorno.labCs = 2;
                            //     EmpresaService.csosn2.get({},function(retorno) {
                            //         //console.log('vai vir lista cso');
                            //         retorno.arrCso = GeralFactory.formataObjSelect(retorno.records);
                            //     });
                            //     EmpresaService.cst2.get({},function(retorno) {
                            //         retorno.arrCst = GeralFactory.formataObjSelect(retorno.records);
                            //     });
                            // }

                            break;
                        case 2:
                            retorno.labCs = 2;
                            if (mudouEstado) {
                                objImposto.tri_eh_retido_aux = true;
                            }

                            if (tipCs == 1 || tipCs == 2) {
                                retorno.labCs = 2;
                                EmpresaService.csosn2.get({}, function (data) {
                                    retorno.arrCso = GeralFactory.formataObjSelect(data.records);

                                    EmpresaService.cst2.get({}, function (data) {
                                        retorno.arrCst = GeralFactory.formataObjSelect(data.records);

                                        callback(retorno);
                                    });
                                });
                            }
                            // else if(tipCs == 2) {
                            //     retorno.labCs = 2;
                            //     EmpresaService.cst2.get({},function(retorno) {
                            //         retorno.arrCst = GeralFactory.formataObjSelect(retorno.records);
                            //     });
                            // }
                            break;
                        case 11:
                            retorno.labCs = 2;
                            //tipCs = 2;
                            if (mudouEstado) {
                                objImposto.tri_eh_retido_aux = true;
                            }
                            EmpresaService.cstIpi.get({}, function (data) {
                                //console.log('aadd:', data.records);

                                retorno.arrCst = GeralFactory.formataObjSelect(data.records, true);
                                //console.log('rrx2:', retorno.arrCst);

                                callback(retorno);
                            });
                            break;
                        case 12:
                        case 13:
                            retorno.labCs = 2;
                            //tipCs = 2;
                            EmpresaService.cstPisCofins.get({}, function (data) {
                                retorno.arrCst = GeralFactory.formataObjSelect(data.records);

                                callback(retorno);
                            });
                            break;
                        default:

                            retorno.labCs = 0;
                            callback(retorno);
                    }
                }

                /*
                 posRegraSt : function(newTributoIcms,bcVlrBruto,callback) {

                 //console.log('chama posRegraSt');
                 //console.log('tri_bc_perc_diferenca: ',newTributoIcms.tri_bc_perc_diferenca);
                 //console.log('tri_bc_vlr_bruto: ',bcVlrBruto);

                 //console.log('tri_tab_aliq_interna: ',newTributoIcms.tri_tab_aliq_interna);
                 //console.log('pp:',parseFloat(newTributoIcms.tri_bc_perc_diferenca)/100);
                 //console.log('bb: ', parseFloat(bcVlrBruto) * parseFloat(newTributoIcms.tri_bc_perc_diferenca)/100);

                 newTributoIcms.tri_bc_vlr_liquido = parseFloat(bcVlrBruto) + (parseFloat(bcVlrBruto) * parseFloat(newTributoIcms.tri_bc_perc_diferenca)/100);
                 newTributoIcms.tri_imp_vlr_diferenca = parseFloat(bcVlrBruto) * parseFloat(newTributoIcms.tri_tab_aliq_interna)/100  * -1;
                 newTributoIcms.tri_imp_vlr_bruto = (parseFloat(newTributoIcms.tri_bc_vlr_liquido) * newTributoIcms.tri_aliq_perc /100);
                 newTributoIcms.tri_imp_vlr_liquido =  parseFloat(newTributoIcms.tri_imp_vlr_bruto) + parseFloat(newTributoIcms.tri_imp_vlr_diferenca);


                 //console.log('newTributoIcms: ', newTributoIcms);

                 callback(newTributoIcms);
                 }*/
            };




        }])

    .factory('TributacaoService', ['$resource', '$timeout', 'CONFIG', 'Upload', 'Storage', 'GeralFactory',

        function ($resource, $timeout, CONFIG, Upload, Storage, GeralFactory) {

            var objUsuario = Storage.usuario.getUsuario();
            var urlErp = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;

            return {

                tributacao  : $resource(urlErp + '/tributacao/?:u', {u : '@u'}, {

                    aplicar : {
                        method      : 'POST',
                        url         : urlErp + '/tributacao/:u',
                        interceptor : {
                            response: function(response) {
                                return response.data;
                            }
                        }
                    },

                    aplicar_frete : {
                        method      : 'POST',
                        url         : urlErp + '/tributacao/frete/:u',
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