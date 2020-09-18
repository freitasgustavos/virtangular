/**
 * Created by rubens on 13/11/15.
 */
'use strict';

angular.module('newApp')

    .factory('FiscalService', [

        '$resource', 'CONFIG', 'GeralFactory', 'Storage',

        function($resource, CONFIG, GeralFactory, Storage) {

            var objUsuario = Storage.usuario.getUsuario(),
                identity = (objUsuario) ? objUsuario.ident_emp : CONFIG.IDENT_SISTEMA;

            var url    = CONFIG.HOSTNAME + identity + CONFIG.SCHEMA_SISTEMA;
            var urlErp = CONFIG.HOSTNAME + identity + CONFIG.SCHEMA_ERP;

            return {

                sintegra : $resource(url + '/fiscal/gerar-sintegra/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    }
                }),

                sped : $resource(url + '/fiscal/gerar-sped-efd/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    }
                }),

                exporta_xml : $resource(url + '/fiscal/exporta-xml/?:u', {u : '@u'}, {

                    get : {
                        method : 'GET'
                    }
                })

            };

        }

    ]);