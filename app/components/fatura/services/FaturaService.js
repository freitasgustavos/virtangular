'use strict';

angular.module('newApp')

    .factory('FaturaService', [

        '$resource', 'CONFIG',

        function($resource, CONFIG) {

            var url = CONFIG.HOSTNAME + ':company' +  CONFIG.SCHEMA_SISTEMA;
            return {

                token : $resource(url + '/gateway/?:filter', {company : '@company', filter : '@filter'}, {

                    get : {
                        method : 'GET'
                    },

                    verificar : {
                        method : 'GET',
                        url    :  url + '/gateway/token/?:filter',
                        params : {
                            company : '@company',
                            filter  : '@filter'
                        }
                    }

                }),

                cobranca : $resource(url + '/gateway/cobranca/?:filter', {company : '@company', filter : '@filter'}, {

                    get : {
                        method : 'GET'
                    },

                    pagar : {
                        method       : 'POST',
                        url          :  url + '/gateway/pagamento/:filter',
                        interceptor  :  {
                            response :  function(response) {
                                return response.data;
                            }
                        }
                    }

                })

            };
        }
    ]);