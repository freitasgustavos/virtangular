'use strict';

angular.module('newApp')

    .factory('CmsService', [

        '$resource', 'CONFIG', 'GeralFactory', 'Storage',

        function($resource, CONFIG, GeralFactory, Storage) {

            var objUsuario = Storage.usuario.getUsuario();

            var url = CONFIG.HOSTNAME + CONFIG.IDENT_SISTEMA + CONFIG.SCHEMA_SISTEMA;
            var urlErp = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;

            return {

                cms: $resource(url + '/sis-cms-emp-sec/1', {emp_cod_emp: '1'}, {

                    get: {
                        method: 'GET'
                    },

                    update: {
                        method: 'PUT',
                        url: url + '/sis-emp/:emp_cod_emp',
                        interceptor: {
                            response: function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                cmss : $resource(urlErp + '/sis-cms-emp-sec/', {u:'@u'}, {

                    get : {
                        method : 'GET',
                        url    :  url + '/sis-cms-emp-sec/:u'
                    },

                    create : {
                        method       : 'POST',
                        url          :  url + '/sis-cms-emp-sec/:u',
                        interceptor  :  {
                            response :  function (response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),


            }
        }
    ]);