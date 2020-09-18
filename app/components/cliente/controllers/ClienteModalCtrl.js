
angular.module('newApp').controller('ClienteModalEnderecoCtrl', [

    '$scope', '$rootScope', '$modalInstance', 'ClienteService', 'EndGeralService', 'GeralFactory', 'Constantes',

    function($scope, $rootScope, $modalInstance, ClienteService, EndGeralService, GeralFactory, Constantes) {

        $modalInstance.opened.then(function() {

            $scope.endereco = {};
            $scope.listaTipoEndereco = [{
                id   :  1,
                nome : 'Comercial'
            }, {
                id   :  2,
                nome : 'Residencial'
            }, {
                id   :  3,
                nome : 'Cobrança'
            }];

            $scope.listaUf = EndGeralService.ufs.get({});

            if ($scope.params.end_seq_end) {

                $scope.end_seq_end = $scope.params.end_seq_end;
                $scope.getEndereco($scope.params.end_seq_end);
            }

            
        });

        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };

        /**
         * Cancela um endereço de um cliente em uma janela modal
         */
        $scope.cancelarEndereco = function(cad_cod_cad, end_seq_end) {

            GeralFactory.confirmar('Deseja remover este endereço?', function() {
                if (end_seq_end === 1) {

                    var msg = 'Caro usuário, não se pode remover o endereço principal (endereço de cobrança)!';
                    GeralFactory.notify('warning', 'Atenção!', msg);

                } else {

                    var objeto = {
                        cad_cod_cad : cad_cod_cad,
                        end_seq_end : end_seq_end
                    };
                    ClienteService.clienteEndereco.cancelar(objeto, function (resposta) {

                        if (resposta.records) {

                            GeralFactory.notificar({data: resposta});
                            $modalInstance.dismiss('reload');
                        }
                    });
                }
            });
        };

        /**
         *
         */
        $scope.getEndereco = function(end_seq_end) {

            var objeto = {
                cad_cod_cad : $scope.params.cad_cod_cad,
                end_seq_end : end_seq_end
            };

            ClienteService.clienteEndereco.get(objeto, function(data) {

                if (data.records) {

                    $scope.endereco = data.records;
                    $scope.endereco.end_endereco_uf     = $scope.endereco.end_endereco_cod_uf + '#' + $scope.endereco.end_endereco_uf;
                    $scope.endereco.end_endereco_cidade = $scope.endereco.end_endereco_cod_cidade + '#' + $scope.endereco.end_endereco_cidade;

                    EndGeralService.getCidadePorUf($scope.endereco.end_endereco_uf, function(data) {

                        $scope.listaCidade = data;
                    });
                }
            });

        };

        /**
         *
         */
        $scope.getEnderecoPorCep = function(event) {

            if (! GeralFactory.inArray(event.which, Constantes.KEYS)) {

                if ($scope.endereco.end_cep.length == 8) {

                    EndGeralService.getEnderecoPorCep($scope.endereco.end_cep, function(data) {
                        if (data.error) {

                            var mensagem = 'Caro usuário, nenhum endereço foi encontrado para o CEP fornecido!';
                            GeralFactory.notify('danger', 'Atenção:', mensagem);

                        } else {

                            $scope.endereco.end_endereco             = data.nomeclog;
                            $scope.endereco.end_endereco_bairro      = data.bairro.nome;
                            $scope.endereco.end_endereco_uf          = data.uf_cod + '#' + data.uf;
                            $scope.endereco.end_endereco_cidade      = data.cidade_id + '#' + data.cidade.nome;
                            $scope.endereco.end_endereco_nro         = '';
                            $scope.endereco.end_endereco_complemento = '';

                            EndGeralService.getCidadePorUf($scope.endereco.end_endereco_uf, function(data) {
                                if (data) {

                                    $scope.listaCidade = data;
                                }
                            });
                        }
                    });
                }
            }
        };

        /**
         * Retorna a lista de cidades de algum estado
         */
        $scope.getCidadePorUf = function() {

            EndGeralService.getCidadePorUf($scope.endereco.end_endereco_uf, function(data) {

                console.log(data);

                if (data) {

                    $scope.listaCidade = data;
                }
            });
        };


        /**
         *
         */
        $scope.salvarEndereco = function() {

            $scope.salvarEnderecoLoading = true;

            $scope.$watch('forms.fClienteEndereco', function(form) {

                if (form) {

                    if (form.$invalid) {

                        $scope.submitted = true;
                        $scope.salvarEnderecoLoading = false;

                    } else {

                        if ($scope.endereco.end_seq_end) {

                            $scope.endereco.end_cad_cod_cad = $scope.endereco.cad_cod_cad = $scope.params.cad_cod_cad;
                            ClienteService.clienteEndereco.update($scope.endereco, function(resposta) {

                                if (! resposta.records.error) {

                                    $modalInstance.dismiss('reload');
                                }

                                $scope.salvarEnderecoLoading = false;
                            })
                        } else {

                            $scope.endereco.end_cad_cod_cad = $scope.params.cad_cod_cad;

                            ClienteService.clienteEnderecos.create($scope.endereco, function(resposta) {

                                if (! resposta.records.error) {

                                    $modalInstance.dismiss('reload');
                                }

                                $scope.salvarEnderecoLoading = false;
                            });
                        }
                    }
                }
            });
        };
    }
]);

angular.module('newApp').controller('ClienteModalContatoCtrl', [

    '$scope', '$rootScope', '$modalInstance', 'ClienteService', 'EndGeralService', 'GeralFactory', 'Constantes',

    function($scope, $rootScope, $modalInstance, ClienteService, EndGeralService, GeralFactory, Constantes) {

        $modalInstance.opened.then(function() {

            $scope.contato = {};

            if ($scope.params.cto_cod_cto) {

                $scope.cto_cod_cto = $scope.params.cto_cod_cto;
                $scope.getContato($scope.params.cto_cod_cto);
            }
        });

        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };

        /**
         *
         */
        $scope.getContato = function(cto_cod_cto) {

            var objeto = {
                cad_cod_cad : $scope.params.cad_cod_cad,
                cto_cod_cto : cto_cod_cto
            };

            ClienteService.clienteContato.get(objeto, function(data) {

                $scope.contato = data.records;
            });
        };

        /**
         *
         */
        $scope.salvarContato = function() {

            $scope.salvarContatoLoading = true;

            $scope.$watch('forms.fClienteContato', function(form) {

                if (form) {

                    if (form.$invalid) {

                        $scope.submitted = true;
                        $scope.salvarContatoLoading = false;

                    } else {

                        if ($scope.contato.cto_cod_cto) {

                            $scope.contato.cto_cad_cod_cad = $scope.contato.cad_cod_cad = $scope.params.cad_cod_cad;

                            ClienteService.clienteContato.update($scope.contato, function(resposta) {

                                if (! resposta.records.error) {

                                    $modalInstance.dismiss('reload');
                                }

                                $scope.salvarContatoLoading = false;

                            });
                        } else {

                            $scope.contato.cto_cad_cod_cad = $scope.params.cad_cod_cad;

                            ClienteService.clienteContatos.create($scope.contato, function(resposta) {

                                if (! resposta.records.error) {

                                    $modalInstance.dismiss('reload');
                                }

                                $scope.salvarContatoLoading = false;
                            });
                        }
                    }
                }
            });
        };

        /**
         * Método responsável em remover um determinado contato de um cliente.
         */
        $scope.cancelarContato = function(cad_cod_cad, cto_cod_cto) {

            GeralFactory.confirmar('Deseja remover este contato?', function() {

                var objeto = {
                    cad_cod_cad : cad_cod_cad,
                    cto_cod_cto : cto_cod_cto
                };
                ClienteService.clienteContato.cancelar(objeto, function(resposta) {

                    if (resposta.records) {

                        GeralFactory.notificar({data: resposta});
                        $modalInstance.dismiss('reload');
                    }
                });
            });
        };
    }
]);

angular.module('newApp').controller('ClienteModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModal', '$uibModalInstance', 'ClienteService', 'EndGeralService', 'ParamsService', 'ProdutoService', 'GeralFactory', 'Constantes',

    function($scope, $rootScope, $timeout, $uibModal, $uibModalInstance, ClienteService, EndGeralService, ParamsService, ProdutoService, GeralFactory, Constantes) {

        $uibModalInstance.opened.then(function() {

            $scope.cliente      = {};
            $scope.arrMarcacoes = [];
            $scope.cliente.cad_cod_cad = 1;

            $scope.listaUf_fat = EndGeralService.ufs.get({});
            $scope.arrPaises   = EndGeralService.paises.get({});
            $scope.getTipoCadastro();
            $scope.listarMarcacoes();

            $scope.labelTitular = $scope.params.str_titular;
            if ($scope.params.cad_cod_cad) {

                $uibModalInstance.hasAlteracao = false;
                $scope.getCliente($scope.params.cad_cod_cad);
            }

            if ($scope.params.importandoNFe) {

                $scope.cliente = $scope.params;
                $scope.trocarPessoa($scope.cliente.cad_pf_pj);
                $scope.labelTitular = $scope.params.cad_tip_cli_for == 1 ? 'Cliente' : 'Fornecedor';
                $scope.getCidadePorCodIbge();
            }
        });

        /**
         * Retorna os dados de determinada cidade com base no código IBGE
         */
        $scope.getCidadePorCodIbge = function() {

            $scope.salvarClienteLoading = true;

            EndGeralService.cidadeCodIbge.get({u : $scope.cliente.endereco.end_cod_ibge}, function(data) {
                if (data.records) {
    
                    $scope.cliente.endereco.end_endereco_uf     = data.records.estado_cod + '#' + data.records.uf;
                    $scope.cliente.endereco.end_endereco_cidade = data.records.id + '#' + data.records.nome;
                    $scope.salvarClienteLoading = false;

                } else {

                    $scope.salvarClienteLoading = false;
                }
            });
        };

        
        /**
         * Fecha a janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };

        /**
         * Verifica se é contribuinte conforme o tipo da pessoa
         */
        $scope.trocarPessoa = function(id) {

            $scope.cliente.eh_contribuinte_aux = (id == 1) ? false : true;
        };

        /**
         * Retorna os dados de um determinado cliente.
         */
        $scope.getCliente = function(cad_cod_cad) {

            ClienteService.cliente.get({cad_cod_cad : cad_cod_cad}, function(data) {

                $scope.cliente = data.records;
                $scope.cliente.objMarcacoes = [];

                // Dados dos contatos do cliente:
                $scope.listaContato    = data.records.listaContato;
                $scope.listaEndereco   = data.records.listaEndereco;
                $scope.cliente.contato = $scope.listaContato[0] = data.records.listaContato[0];

                if ($scope.listaContato.length) {

                    for (var i = $scope.listaContato.length - 1; i >= 0; i--) {
                        if ($scope.listaContato[i].cto_cod_cto == 1)
                            $scope.listaContato.splice(i, 1);
                    }
                }

                // Situação e a data de nascimento do cliente:
                $scope.cliente.cad_eh_inativo_aux      = ($scope.cliente.cad_eh_inativo === 1)        ? false : true;
                $scope.cliente.eh_contribuinte_aux     = ($scope.cliente.cad_tip_contribuinte == '9') ? false : true;
                $scope.cliente.eh_contribuinte_iss_aux = ($scope.cliente.cad_tip_contribuinte_iss == '1') ? true : false;

                console.log('contr:',$scope.cliente.eh_contribuinte_aux);

                $scope.cliente.cad_dat_nascimento = GeralFactory.formatarDataBr($scope.cliente.cad_dat_nascimento);

                // Dados de endereço do cliente:
                if ($scope.cliente.endereco.end_endereco_cod_uf)
                    $scope.cliente.endereco.end_endereco_uf = $scope.cliente.endereco.end_endereco_cod_uf + '#' + $scope.cliente.endereco.end_endereco_uf;

                if ($scope.cliente.endereco.end_endereco_cod_cidade)
                    $scope.cliente.endereco.end_endereco_cidade = $scope.cliente.endereco.end_endereco_cod_cidade + '#' + $scope.cliente.endereco.end_endereco_cidade;

                // Recolhendo a imagem mais recente do cliente:
                $scope.cliente.imagem_atual = null;
                if ($scope.cliente.cliente_imagem.length) {

                    var qtdeImagens = $scope.cliente.cliente_imagem.length;
                    $scope.cliente.imagem_atual = $scope.cliente.cliente_imagem[qtdeImagens - 1];
                }

                if ($scope.cliente.cad_tipo_cadastro) {
                    $scope.cliente.tipoCadastro = $scope.cliente.cad_tipo_cadastro.par_c01;
                }

                if ($scope.cliente.endereco.end_endereco_uf && !$scope.cliente.endereco.end_eh_exterior) {

                    EndGeralService.getCidadePorUf($scope.cliente.endereco.end_endereco_uf, function(data) {
                        $scope.listaCidade_fat = data;
                    });
                }

                ClienteService.clienteMarcacoes.get({u : 'q=(tma_cod_tab:' + cad_cod_cad + ',tma_tab:2)'}, function(retorno) {

                    angular.forEach($scope.arrMarcacoes, function(elem1, k1) {

                        angular.forEach(retorno.records,function(elem2, k2) {

                            if (elem1['mar_cod_marca'] == elem2['tma_cod_marca']) {

                                $scope.cliente.objMarcacoes.push({
                                    name                : elem1.mar_descricao_marca,
                                    mar_descricao_marca : elem1.mar_descricao_marca,
                                    mar_cod_marca       : elem1.mar_cod_marca
                                });
                            }
                        });
                    });
                });

                $scope.listaEndereco = data.records.listaEndereco;
                $scope.listaAnotacao = data.records.listaAnotacao;
            });
        };


        /**
         * Salvar cliente da modal
         */
        $scope.salvarCliente = function() {

            $scope.salvarClienteLoading = true;

            $uibModalInstance.hasAlteracao    = true;
            $uibModalInstance.objClienteClone = $scope.cliente;

            var validar = $scope.validarCliente();
            if (validar['error']) {

                GeralFactory.notify('danger', 'Atenção:', validar['msg']);
                $scope.salvarClienteLoading = false;

            } else {

                if ($scope.cliente.cad_cod_cad) {

                    angular.forEach($scope.cliente.objMarcacoes, function(item, i) {

                        $scope.cliente.objMarcacoes[i]['tma_tab']       = 2;
                        $scope.cliente.objMarcacoes[i]['tma_cod_tab']   = $scope.cliente.cad_cod_cad;
                        $scope.cliente.objMarcacoes[i]['tma_cod_marca'] = item.mar_cod_marca;
                    });

                    $scope.cliente.eh_contribuinte          = ($scope.cliente.eh_contribuinte_aux) ? 1 : 0;
                    $scope.cliente.cad_tip_contribuinte_iss = ($scope.cliente.eh_contribuinte_iss_aux) ? 1 : 0;

                    ClienteService.cliente.update($scope.cliente, function(resposta) {

                        if (! resposta.records.error) {

                            ClienteService.clienteMarcacoes.create($scope.cliente, function(retorno) {

                            });
                        }

                        if ($scope.cliente.cad_tip_cli_for === 3) {

                            $timeout(function() {
                                $scope.fecharModal('cancel');
                            }, 1000);
                        }

                        $scope.salvarClienteLoading = false;
                    });
                } else {

                    ClienteService.clientes.create($scope.cliente, function(resposta) {

                        if (! resposta.records.error) {

                            var codCliente = resposta.records.cad_cod_cad;
                            if ($scope.cliente.objMarcacoes) {

                                angular.forEach($scope.cliente.objMarcacoes, function(item, i) {

                                    $scope.cliente.objMarcacoes[i]['tma_tab']       = 2;
                                    $scope.cliente.objMarcacoes[i]['tma_cod_tab']   = codCliente;
                                    $scope.cliente.objMarcacoes[i]['tma_cod_marca'] = item.mar_cod_marca;
                                });

                                $scope.cliente.cad_cod_cad = codCliente;
                                ClienteService.clienteMarcacoes.create($scope.cliente, function(retorno) {

                                });
                            }

                            if ($scope.params.importandoNFe) {

                                $scope.cliente.cad_cod_cad    = codCliente;
                                $uibModalInstance.cad_cod_cad = codCliente;

                                $scope.getCliente($scope.cliente.cad_cod_cad);
                            }

                            if ($scope.cliente.cad_tip_cli_for === 3) {

                                $timeout(function() {
                                    $scope.fecharModal('cancel');
                                }, 1000);
                            }
                        }

                        $scope.salvarClienteLoading = false;
                    });
                }
            }
        };

        /**
         * Efetua validações dos dados antes de serem salvos pelo usuário.
         */
        $scope.validarCliente = function() {

            if ($scope.cliente.cad_tip_cli_for === 3) {

                var cpfCnpj = $scope.cliente.cad_cpf_cnpj;
                if (cpfCnpj === null || cpfCnpj === undefined || cpfCnpj.trim() === '') {

                    var tipo = ($scope.cliente.cad_pf_pj === '1') ? 'CPF' : 'CNPJ';
                    return {
                        'error' :  true,
                        'msg'   : 'Caro usuário, é necessário informar o ' + tipo + ' para finalizar o cadastro!'
                    };
                }
            }

            return {'error' : false};
        };

        /**
         *
         */
        $scope.getFormEndereco = function (end_seq_end) {

            var scope = $rootScope.$new();

            scope.params = {};
            scope.listaTipoEndereco  = $scope.listaTipoEndereco;
            scope.params.cad_cod_cad = $scope.cliente.cad_cod_cad;

            if (end_seq_end) {

                scope.params.end_seq_end = end_seq_end;
            }

            var modalInstance = $uibModal.open({
                animation   :  true,
                templateUrl : 'cliente/views/aba-cliente-endereco-form.html',
                controller  : 'ClienteModalEnderecoCtrl',
                size        : 'lg',
                windowClass : 'center-modal',
                scope       :  scope,
                resolve: {
                    getEnd  : function() {
                        console.log('OK para modal de endereço!');
                    }
                }
            });

            modalInstance.result.then(function (id) { }, function (msg) {

                if (msg === 'reload') {

                    ClienteService.clienteEnderecos.get({cad_cod_cad : $scope.cliente.cad_cod_cad},function(data) {

                        $scope.listaEndereco = data.records;
                    });
                }
            });
        };

        /**
         * Retorna o endereço completo ao digitar o CEP
         */
        $scope.getEnderecoPorCep = function(event) {

            if (! GeralFactory.inArray(event.which, Constantes.KEYS)) {

                if ($scope.cliente.endereco.end_cep.length == 8) {

                    EndGeralService.getEnderecoPorCep($scope.cliente.endereco.end_cep, function(data) {
                        if (data.error) {

                            var mensagem = 'Caro usuário, nenhum endereço foi encontrado para o CEP fornecido!';
                            GeralFactory.notify('danger', 'Atenção:', mensagem);

                        } else {

                            $scope.cliente.endereco.end_endereco             = data.nomeclog;
                            $scope.cliente.endereco.end_endereco_bairro      = data.bairro.nome;
                            $scope.cliente.endereco.end_endereco_uf          = data.uf_cod + '#' + data.uf;
                            $scope.cliente.endereco.end_endereco_cidade      = data.cidade_id + '#' + data.cidade.nome;
                            $scope.cliente.endereco.end_endereco_nro         = '';
                            $scope.cliente.endereco.end_endereco_complemento = '';

                            EndGeralService.getCidadePorUf($scope.cliente.endereco.end_endereco_uf, function(data) {
                                if (data) {

                                    $scope.listaCidade_fat = data;
                                }
                            });
                        }
                    });
                }
            }
        };

        /**
         *
         */
        $scope.getFormContato = function (cto_cod_cto) {

            var scope = $rootScope.$new();

            scope.params = {};
            scope.params.cad_cod_cad = $scope.cliente.cad_cod_cad;

            if (cto_cod_cto) {

                scope.params.cto_cod_cto = cto_cod_cto;
            }

            var modalInstance = $uibModal.open({
                animation   :  true,
                templateUrl : 'cliente/views/aba-cliente-contato-form.html',
                controller  : 'ClienteModalContatoCtrl',
                size        : 'lg',
                windowClass : 'center-modal',
                scope       :  scope,
                resolve: {
                    getEnd  : function() {
                        console.log('OK para modal de endereço!');
                    }
                }
            });

            modalInstance.result.then(function (id) { }, function (msg) {

                if (msg === 'reload') {

                    ClienteService.clienteContatos.get({cad_cod_cad : $scope.cliente.cad_cod_cad},function(data) {

                        $scope.listaContato = data.records;
                    });
                }
            });
        };

        /**
         *
         */
        $scope.getFormAnotacao = function (ano_seq_ano) {

            var scope = $rootScope.$new();

            scope.params = {};
            scope.params.cad_cod_cad = $scope.cliente.cad_cod_cad;

            if (ano_seq_ano) {

                scope.params.ano_seq_ano = ano_seq_ano;
            }

            var modalInstance = $uibModal.open({
                animation   :  true,
                templateUrl : 'cliente/views/aba-cliente-anotacoes-form.html',
                controller  : 'ClienteModalAnotacaoCtrl',
                size        : 'lg',
                windowClass : 'center-modal',
                scope       :  scope,
                resolve: {
                    getEnd  : function() {
                        console.log('OK para modal de endereço!');
                    }
                }
            });

            modalInstance.result.then(function (id) { }, function (msg) {

                if (msg === 'reload') {

                    ClienteService.clienteAnotacoes.get({cad_cod_cad : $scope.cliente.cad_cod_cad},function(data) {

                        $scope.listaAnotacao = data.records;
                    });
                }
            });
        };

        /**
         * Retorna a lista de cidades de algum estado
         */
        $scope.getCidadePorUf = function() {

            EndGeralService.getCidadePorUf($scope.cliente.endereco.end_endereco_uf, function(data) {

                if (data) {

                    $scope.listaCidade_fat = data;
                }
            });
        };

        /**
         * Inicializa um determinado tipo de cadastro ou a listagem completa.
         */
        $scope.getTipoCadastro = function(par_pai) {

            if (par_pai) {

                ParamsService.tipoCadastro.get({par_pai : par_pai}, function(data) {
                    $scope.objTipoCadastro           = data.records;
                    $scope.cliente.cad_2040_tipo_cad = par_pai;
                });
            } else {

                ParamsService.tiposCadastro.get({u : ''}, function(resposta) {
                    $scope.arrTiposCadastro = resposta.records;
                });
            }
        };

        /**
         * Efetua a listagem dos tipos de cadastro para cliente/fornecedor.
         */
        $scope.listarTipoCadastro = function(nome) {

            nome = nome.trim();
            var strFiltro = GeralFactory.formatarPesquisar({
                'par_c01' : nome
            });

            return ParamsService.tiposCadastro.get({u : strFiltro}).$promise.then(function(resposta) {
                resposta.records.push({
                    id        : '1#1',
                    nome_real :  nome,
                    par_c01   : 'Adicionar tipo de cadastro ' + nome
                });
                return resposta.records;
            });
        };

        /**
         * Seleciona um determinado tipo de cadastro para atribuir ao cliente e fornecedor.
         * Tem a funcionalidade em adicionar um tipo de cadastro.
         */
        $scope.onSelectTipoCadastro = function($item, $model, $label) {

            var objTipoCadastro = {};

            $scope.$item  = $item;
            $scope.$model = $model;
            $scope.$label = $label;

            if ($item.id === '1#1') {

                $scope.cliente.tipoCadastro = '';
                if (GeralFactory.ehVazioCombo($item)) {
                    return false;
                }

                var nomeReal = $item.nome_real.trim();
                objTipoCadastro.par_c01 = nomeReal;

                GeralFactory.verificarItem($scope.arrTiposCadastro, nomeReal, 'par_c01', function(retorno) {

                    if (! retorno) {

                        $scope.cliente.tipoCadastro = '';
                        GeralFactory.notify('warning', 'Atenção!', 'Tipo de cadastro já existente!');

                    } else {

                        ParamsService.tiposCadastro.create(objTipoCadastro, function(resposta) {

                            $scope.cliente.tipoCadastro = nomeReal;
                            $scope.cliente.cad_2040_tipo_cad = resposta.records.par_pai;
                            $scope.getTipoCadastro();
                        });
                    }
                });
            } else {

                $scope.getTipoCadastro($item.par_pai);
                $scope.cliente.tipoCadastro = $item.par_c01;
            }
        };

        /**
         * Recolhe todas as marcações existentes para o tipo cliente/fornecedor.
         */
        $scope.listarMarcacoes = function() {

            ProdutoService.marcas.get({u : 'q=(mar_tab:2)'}, function(data) {

                var arrMarcacoes = data.records, arrAuxiliar = [];

                angular.forEach(arrMarcacoes, function(i, j) {
                    arrAuxiliar.push({
                        name                : i.mar_descricao_marca,
                        mar_descricao_marca : i.mar_descricao_marca,
                        mar_cod_marca       : i.mar_cod_marca
                    });
                });

                $scope.arrMarcacoes = arrAuxiliar;
            });
        };

        /**
         * Adiciona a opção de uma nova marca para inserção no campo select do formulário.
         */
        $scope.tagTransform = function(newTag) {
            var item = {
                name                : newTag,
                mar_descricao_marca : newTag
            };
            return item;
        };

        /**
         * Método responsável em adicionar uma nova marca através do plugin de ui-select.
         */
        $scope.onSelectedMarcacao = function(item) {

            if (item.hasOwnProperty('isTag')) {

                var objeto = {mar_descricao_marca : item.mar_descricao_marca, mar_tab : 2, mar_eh_vitrine : 0};
                ProdutoService.marcas.create(objeto, function(resposta) {
                    if (! resposta.records.error) {
                        GeralFactory.notify('success', 'Sucesso!', 'Marcação cadastra com sucesso!');

                        item.mar_cod_marca = resposta.records.mar_cod_marca;
                        delete item['isTag'];

                        $scope.arrMarcacoes.push({
                            name                : item.mar_descricao_marca,
                            mar_descricao_marca : item.mar_descricao_marca,
                            mar_cod_marca       : resposta.records.mar_cod_marca,
                            mar_tab             : 2
                        });
                    }
                });
            }
        };


        /**
         * Busca os dados do CNPJ no servidor receitaWS
         */
        $scope.getDadosCadastraisReceitaWS = function () {

            $scope.autoPreencher = true;
            $scope.salvarClienteLoading = true;

            //seta pj para transportadora
            if($scope.cliente.cad_tip_cli_for == 3){

                $scope.cliente.cad_pf_pj = 2;
            }

            if($scope.cliente.cad_cpf_cnpj && $scope.cliente.cad_pf_pj == 2){

                var objFiltro = {};
                var strFiltro = '';

                objFiltro = {
                    cad_cpf_cnpj    : $scope.cliente.cad_cpf_cnpj,
                    cad_tip_cli_for : $scope.cliente.cad_tip_cli_for
                };

                strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                //manda a consulta
                ClienteService.autoComplete.receitaWS({u : strFiltro}, function (resposta) {

                    if(!resposta.records.error){

                        //caso não dê erro, seta o scopo com os dados do cliente
                        Object.assign($scope.cliente,resposta.records);
                        $scope.cliente.eh_contribuinte_aux = true;
                        $scope.cliente.cad_eh_inativo_aux  = true;

                        console.log('$scope.cliente', $scope.cliente);

                        if ($scope.cliente.endereco.end_endereco_uf != 'null#null') {
                            EndGeralService.getCidadePorUf($scope.cliente.endereco.end_endereco_uf, function(data) {

                                $scope.listaCidade_fat = data;
                            });
                        }

                        //gera uma notificação caso a situação cadastral retornada seja diferente de ATIVA
                        if(resposta.records.situacao){

                            GeralFactory.notify('danger', resposta.records.situacao.title, resposta.records.situacao.msg);
                        }

                        $scope.autoPreencher = false;
                        $scope.salvarClienteLoading = false;

                    } else {

                        //notifica caso a consulta retorne erro
                        GeralFactory.notify('danger', resposta.records.title, resposta.records.msg);
                        $scope.salvarClienteLoading = false;
                    }
                });

            }else{

                //notifica caso não tenha preenchido o cnpj
                GeralFactory.notify('warning', 'Atenção!', 'Primeiramente é necessário informar o CNPJ');
                $scope.salvarClienteLoading = false;
            }
        };
    }
]);

angular.module('newApp').controller('ClienteModalAnotacaoCtrl', [

    '$scope', '$rootScope', '$modalInstance', '$window', '$sce', '$timeout', 'ClienteService', 'GeralFactory', 'AuthTokenFactory',

    function($scope, $rootScope, $modalInstance, $window, $sce, $timeout, ClienteService, GeralFactory, AuthTokenFactory) {

        $modalInstance.opened.then(function() {

            $scope.forms    = {};
            $scope.anotacao = {};

            $scope.editorOptions = {
                language : 'pt_br',
                uiColor  : '#e2e2e2',
                'extraPlugins': "button,panelbutton,panel,floatpanel,colorbutton",
                height : 200
            };

            if ($scope.params.ano_seq_ano) {

                $scope.ano_seq_ano = $scope.params.ano_seq_ano;
                $scope.getAnotacao($scope.params.ano_seq_ano);
                $scope.isEdicao = false;

            } else {

                $scope.isEdicao = true;
                $scope.anotacao.ano_tip_ano = 1;
            }
        });

        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };

        /**
         * Redireciona o usuário para o arquivo de impressão de uma determinada anotação
         */
        $scope.imprimirAnotacao = function() {

            var strFiltro =  GeralFactory.formatarPesquisar({
                'cad_cod_cad' : $scope.params.cad_cod_cad,
                'ano_seq_ano' : $scope.params.ano_seq_ano,
                'ken'         : AuthTokenFactory.getToken()
            });

            var url = GeralFactory.getUrlApi() + '/erp/export/cliente/anotacao/?' + strFiltro;

            $window.open(url, 'Anotação');
        };

        /**
         * Recolhe os dados de uma determianda anotação.
         */
        $scope.getAnotacao = function(ano_seq_ano) {

            var objeto = {
                cad_cod_cad : $scope.params.cad_cod_cad,
                ano_seq_ano : ano_seq_ano
            };

            $scope.anotacao.ano_tip_ano = '1';

            ClienteService.clienteAnotacao.get(objeto, function(data) {

                $scope.anotacao = data.records;
            });
        };

        /**
         * Método responsável em remover uma determinada anotação.
         */
        $scope.cancelarAnotacao = function(ano_cad_cod_cad, ano_seq_ano) {

            GeralFactory.confirmar('Deseja remover esta anotação?', function() {

                var objeto = {
                    ano_cad_cod_cad : ano_cad_cod_cad,
                    ano_seq_ano     : ano_seq_ano
                };
                ClienteService.clienteAnotacao.cancelar(objeto, function(resposta) {

                    if (resposta.records) {

                        GeralFactory.notificar({data: resposta});
                        $modalInstance.dismiss('reload');
                    }
                });
            });
        };

        /**
         * Retorna o HTML convertido para mostrar o mesmo na janela modal.
         */
        $scope.getHTMLAnotacao = function(htmlAnotacao) {

            var strHtml = '';
            if (htmlAnotacao) {

                strHtml = $sce.trustAsHtml(htmlAnotacao);
            }

            return strHtml;
        };

        /**
         * Método responsável em ativar a edição dos campos na janela modal de anotações.
         */
        $scope.ativarEdicao = function() {

            $timeout(function() {

                $scope.isEdicao = true;

            }, 100);
        };

        /**
         * Insere ou atualiza os dados para uma determinada anotação.
         */
        $scope.salvarAnotacao = function() {

            $scope.salvarAnotacaoLoading = true;

            $scope.$watch('forms.fClienteAnotacao', function(form) {

                if (form) {

                    if (form.$invalid) {

                        $scope.submitted = true;

                    } else {

                        $scope.anotacao.ano_tip_ano = 1;

                        if ($scope.anotacao.ano_seq_ano) {

                            $scope.anotacao.ano_cad_cod_cad = $scope.anotacao.cad_cod_cad = $scope.params.cad_cod_cad;

                            ClienteService.clienteAnotacao.update($scope.anotacao, function(resposta) {

                                if (! resposta.records.error) {

                                    $modalInstance.dismiss('reload');
                                }

                                $scope.salvarAnotacaoLoading = false;

                            });
                        } else {

                            $scope.anotacao.ano_cad_cod_cad = $scope.params.cad_cod_cad;

                            ClienteService.clienteAnotacoes.create($scope.anotacao, function(resposta) {

                                if (! resposta.records.error) {

                                    $modalInstance.dismiss('reload');
                                }

                                $scope.salvarAnotacaoLoading = false;
                            });
                        }
                    }
                }
            });
        };
    }
]);

angular.module('newApp').controller('ClienteModalUploadCtrl', [

    '$scope', '$rootScope', '$sce', '$timeout', '$modalInstance', 'MidiaService', 'GeralFactory',

    function($scope, $rootScope, $sce, $timeout, $modalInstance, MidiaService, GeralFactory) {

        $scope.foto = {};

        $modalInstance.opened.then(function() {

            $scope.foto.entity      = $scope.params.entity;
            $scope.foto.cad_cod_cad = $scope.params.cad_cod_cad;

            // Verificando a imagem mais atual do cliente:
            $scope.fotoAtual = $scope.params.imagem_atual;

            // Parâmetro que indica se alguma alteração foi efetuada:
            $modalInstance.hasAlteracao = false;
        });

        /**
         * Método responsável em recolher todas as fotos de um
         * determinado cliente ou fornecedor.
         */
        $scope.getMidia = function() {

            if ($scope.foto.cad_cod_cad) {

                var query = 'q=(mid_tab:2,mid_tab_cod:' + $scope.foto.cad_cod_cad + ')';
                MidiaService.midias.get({u : query}, function(retorno) {

                    $scope.fotoAtual = null;
                    if (retorno.records.length) {

                        var qtdeFotos = retorno.records.length;
                        $scope.fotoAtual = retorno.records[qtdeFotos - 1];
                    }
                });
            }
        };

        /**
         * Método responsável em efetuar o upload de uma nova foto
         * para o cliente ou fornecedor escolhido pelo usuário.
         */
        $scope.upload = function(file, event) {

            $scope.salvarFotoLoading = true;

            if (file === undefined || file === null) {

                GeralFactory.notify('warning', 'Atenção!', 'Caro usuário, selecione ao menos uma foto para efetuar o envio!');
                $scope.salvarFotoLoading = false;

            } else {

                if ($scope.foto.cad_cod_cad !== null) {

                    var objeto = {
                        mid_tab     :  2,
                        mid_status  :  1,
                        mid_posicao : '',
                        mid_link    : '',
                        mid_tab_cod : $scope.foto.cad_cod_cad
                    };

                    MidiaService.upload(file, objeto, function() {

                        $modalInstance.hasAlteracao = true;

                        GeralFactory.notify('success', 'Sucesso!', 'Foto cadastrada com sucesso!');

                        $scope.picFile           = null;
                        $scope.salvarFotoLoading = false;
                        $scope.getMidia();
                    });
                }
            }
        };

        /**
         * Efeuta o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };
    }
]);

angular.module('newApp').controller('ClienteModalEmailsCtrl', [

    '$scope', '$rootScope', '$modalInstance', '$timeout', 'clipboard', 'GeralFactory',

    function($scope, $rootScope, $modalInstance, $timeout, clipboard, GeralFactory) {

        $modalInstance.opened.then(function() {

            $scope.arrEmails = [];
            angular.forEach($scope.params.objClientes, function(item, chave) {
                if (item.cto_email) {

                    var email = item.cto_email.trim();
                    if (email) {
                        $scope.arrEmails.push(email);
                    }
                }
            });

            // Verificando o vetor contendo os e-mails para mostrar na listagem da janela modal:
            $scope.params.objClientes = (_.isEmpty($scope.arrEmails)) ? [] : $scope.params.objClientes;
            
            console.log($scope.params.objClientes);
        });

        /**
         * Método responsável em copiar os e-mails dos clientes para a
         * área de transferência do usuário da aplicação.
         */
        $scope.copiar = function() {

            GeralFactory.confirmar('Deseja copiar todos estes e-mails para área de transferência?', function() {

                if (! _.isEmpty($scope.arrEmails)) {

                    var strEmails = $scope.arrEmails.join(', ');
                    clipboard.copyText(strEmails);

                    $timeout(function() {

                        var mensagem = 'Caro usuário, os e-mails foram copiados para área de transferência com sucesso!';
                        GeralFactory.notify('success', 'Sucesso', mensagem);
                        $scope.fecharModal('cancel');

                    }, 1000);
                }
            });
        };

        /**
         * Efeuta o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('ClienteModalAnexoCtrl', [

    '$scope', '$rootScope', '$modalInstance', '$timeout', 'GeralFactory', 'MidiaService',

    function ($scope, $rootScope, $modalInstance, $timeout, GeralFactory, MidiaService) {

        $scope.objAnexo = {};

        $modalInstance.opened.then(function() {

            $modalInstance.hasAlteracao = false;
            $scope.objAnexo.cad_cod_cad = $scope.params.cad_cod_cad;

        });


        /**
         * Método responsável em efetuar o upload do anexo.
         */
        $scope.upload = function(file, event) {

            $scope.salvarAnexoLoading = true;

            if (file === undefined || file === null) {

                GeralFactory.notify('warning', 'Atenção!', 'Caro usuário, selecione ao menos um anexo para efetuar o envio!');
                $scope.salvarAnexoLoading = false;

            } else {

                if ($scope.objAnexo.cad_cod_cad !== null) {

                    var objeto = {
                        mid_tab       : 12,
                        mid_status    : 1,
                        mid_posicao   : '',
                        mid_link      : '',
                        mid_tab_cod   : $scope.objAnexo.cad_cod_cad,
                        mid_descricao : $scope.objAnexo.mid_descricao ? $scope.objAnexo.mid_descricao : ''
                    };

                    MidiaService.upload(file, objeto, function(retorno) {
                        if (retorno.records.error) {

                            $scope.salvarAnexoLoading = false;
                            GeralFactory.notify('danger', retorno.records.msg);

                        } else {

                            GeralFactory.notify('success', 'Sucesso!', 'Anexo enviado com sucesso!');
                            var objMidia = retorno.records.hasOwnProperty('arr_mid') ? retorno.records.arr_mid : null;

                            $scope.salvarAnexoLoading = false;
                            $timeout(function() {

                                $modalInstance.objMidia = objMidia;
                                $modalInstance.hasAlteracao = true;
                                $scope.fecharModal('cancel');

                            }, 1000);
                        }
                    });
                }
            }
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $modalInstance.dismiss(str);
        };
    }
]);