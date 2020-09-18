
define(['app'], function(app) {

    app.factory('EndGeralService', [

        '$resource', 'CONFIG',

        function($resource, CONFIG) {

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
                    var ret = uf.split('#');
                    var strFiltro = 'q=(end_endereco_uf:' + ret[0] + ')';
                    this.cidades.get({u : strFiltro}, function(data) {
                        callback(data);
                    });
                }
            };
        }]
    );
});
