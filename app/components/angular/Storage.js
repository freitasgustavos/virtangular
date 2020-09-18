'use strict';

angular

    .module('newApp')

    .factory('Storage', ['CONFIG', function(CONFIG) {

        var _factory   = {},
            _storage   = ('localStorage' in window),
            _namespace = 'VIRTUX_ADMIN';

        /**
         * Objeto contendo todas as funções utilizadas para
         * manipular as informações contidas no Storage.
         */
        _factory.implementacao = {

            /**
             * Construtor do objeto responsável em inicializar
             * os comportamentos para utilização do Storage.
             */
            initialize: function() {
                var objeto = {
                    ARR_USUARIO : []
                };
                this.create(objeto);
            },

            /**
             * Método responsável em criar a Storage que irá armazenar
             * os dados da loja virtual num objeto JSON.
             */
            create: function(objeto) {
                if (! this.isEmpty(objeto)) {
                    if (_storage) {
                        if (! this.hasStorage()) {
                            window.localStorage.setItem(_namespace, JSON.stringify(objeto));
                            return this.getJSONStorage();
                        }
                    }
                }
                return null;
            },

            /**
             * Método responsável em remover e posteriormente limpar
             * todos os dados contidos na Storage.
             */
            clear: function() {
                var hasStorage = this.hasStorage();
                if (hasStorage) {
                    window.localStorage.removeItem(_namespace);
                    return true;
                }
                return false;
            },

            /**
             * Método responsável em verificar a existências de uma
             * Storage com os dados para a loja virtual.
             */
            hasStorage: function() {
                if (_storage) {
                    var objeto = window.localStorage.getItem(_namespace);
                    if (objeto) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * Método responsável em verificar se um objeto está vazio ou não.
             */
            isEmpty: function(objeto) {
                for (var item in objeto) {
                    if (objeto.hasOwnProperty(item)) {
                        return false;
                    }
                }
                return true;
            },

            /**
             * Método responsável em retornar o objeto JSON contendo todos
             * os dados contidos na Storage da loja virtual.
             */
            getJSONStorage: function() {
                var hasStorage = this.hasStorage();
                if (hasStorage) {
                    var objeto = window.localStorage.getItem(_namespace);
                    return JSON.parse(objeto);
                }
                return null;
            },

            /**
             * Método responsável em retornar o objeto contendo os dados
             * do usuário logado na loja virtual.
             */
            getUsuario: function() {
                var objeto = this.getJSONStorage();
                if (objeto) {
                    var objUsuario = objeto.ARR_USUARIO;
                    return objUsuario;
                }
                return [];
            },

            /**
             * Método responsável em atualizar o objeto contendo os dados
             * do usuário na sessão da loja virtual.
             */
            upUsuario: function(objUsuario) {
                if (objUsuario) {
                    var objCarrinho = this.getUsuario();
                    var objeto = {
                        ARR_USUARIO  : objUsuario
                    };
                    window.localStorage.setItem(_namespace, JSON.stringify(objeto));
                    return this.getJSONStorage();
                }
                return null;
            }

        };

        /**
         * Objeto contendo todas as funções utilizadas para manipular
         * as informações do usuário logado na loja virtual.
         */
        _factory.usuario = {

            /**
             * Método responsável em gravar os dados de um determinado
             * usuario na sessão da loja virtual.
             */
            init: function(objUsuario) {
                if (objUsuario) {
                    var arrUsuario = _factory.implementacao.getUsuario();
                    if (_factory.implementacao.isEmpty(arrUsuario)) {
                        arrUsuario.push(objUsuario);
                        _factory.implementacao.upUsuario(arrUsuario);
                        return true;
                    }
                }
                return false;
            },

            /**
             * Método responsável em limpar os dados de um determinado
             * usuário na sessão da loja virtual.
             */
            clear: function() {
                var arrUsuario = _factory.implementacao.getUsuario();
                if (arrUsuario) {
                    arrUsuario = [];
                    _factory.implementacao.upUsuario(arrUsuario);
                    return true;
                }
                return false;
            },

            /**
             * Método responsável em retornar o objeto contendo os dados
             * do usuário logado na loja virtual.
             */
            getUsuario: function() {
                var arrUsuario = _factory.implementacao.getUsuario();
                if (! _factory.implementacao.isEmpty(arrUsuario)) {
                    return arrUsuario[0];
                }
                return null;
            },

            /**
             * Método responsável em verificar se um determinado usuário
             * contem uma sessão de login na loja virtual.
             */
            isLogado: function() {
                var arrUsuario = _factory.implementacao.getUsuario();
                if (! _factory.implementacao.isEmpty(arrUsuario)) {
                    return true;
                }
                return false;
            }

        };

        return _factory;
    }]);
