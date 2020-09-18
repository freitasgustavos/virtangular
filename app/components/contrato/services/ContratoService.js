'use strict';

angular.module('newApp')

    .factory('ContratoService', [

        '$resource', 'CONFIG', 'GeralFactory', 'Storage',

        function($resource, CONFIG, GeralFactory, Storage) {

            var objUsuario = Storage.usuario.getUsuario();

            var urlErp = CONFIG.HOSTNAME + objUsuario.ident_emp + CONFIG.SCHEMA_ERP;

            return {

                contratos : $resource(urlErp + '/vix-ctt/?:u', {u : '@u'}, {

                    query : {
                        isArray : false
                    },

                    get : {
                        method : 'GET'
                    },

                    create : {
                        method       : 'POST',
                        url          :  urlErp + '/vix-ctt/:u',
                        interceptor  :  {
                            response :  function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    }

                }),

                contrato : $resource(urlErp + '/vix-ctt/?:u', {u : '@u'}, {

                    update : {
                        method : 'PUT',
                        url    :  urlErp + '/vix-ctt/:ctt_cod_ctt/recorrencia/:ctt_num_seq',
                        params :  {
                            ctt_cod_ctt : '@ctt_cod_ctt',
                            ctt_num_seq : '@ctt_num_seq'
                        },
                        interceptor  : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    cancelar : {
                        method : 'DELETE',
                        url    : urlErp + '/vix-ctt/:ctt_cod_ctt/recorrencia/:ctt_num_seq',
                        params : {
                            ctt_cod_ctt : '@ctt_cod_ctt',
                            ctt_num_seq : '@ctt_num_seq'
                        },
                        interceptor : {
                            response: function(response) {
                                GeralFactory.notificar(response);
                                return response.data;
                            }
                        }
                    },

                    get : {
                        method : 'GET',
                        url    :  urlErp + '/vix-ctt/:ctt_cod_ctt/recorrencia/:ctt_num_seq'
                    }

                }),

                midia : {

                    getUrlUpload : function() {

                        var url = urlErp + '/vix-mid';
                        return url;
                    }
                }
            };
        }
    ]);