angular.module('newApp').controller('VendaModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', '$uibModal', 'CONFIG', 'MidiaService', 'GeralFactory', 'ParamsService', 'EmpresaService', 'VendaService', 'AuthTokenFactory', 'ImpostoFactory', 'Storage',

    function ($scope, $rootScope, $timeout, $uibModalInstance, $uibModal, CONFIG, MidiaService, GeralFactory, ParamsService, EmpresaService, VendaService, AuthTokenFactory, ImpostoFactory, Storage) {

        $scope.objModal = {};

        $uibModalInstance.opened.then(function () {

            $scope.objModal.$index = $scope.params.$index;
            $scope.objModal.venda = $scope.params.venda;
            $scope.objModal.v = $scope.params.v;

            console.log('vv8:',$scope.objModal.venda);

            console.log('v.fin_tip_cs_mudanca:', $scope.objModal.v.fin_tip_cs_mudanca);
            //$scope.objModal.fin_tip_cs_mudanca = $scope.objModal.v.fin_tip_cs_mudanca;

            console.log('ite_vlr_tot_impostos_retidos: ', $scope.objModal.venda.ite_vlr_tot_impostos_retidos);

            $scope.objModal.venda.ite_pro_descricao = $scope.objModal.venda.ite_pro_descricao.substring(0, 42);

            // console.log('ite_vlr_tot_impostos_retidos2: ',$scope.objModal.venda.ite_vlr_tot_impostos_retidos);

            $scope.objModal.venda.ite_pro_qtd_br = $scope.objModal.venda.ite_pro_qtd; //GeralFactory.toReais($scope.objModal.venda.ite_pro_qtd);
            $scope.objModal.venda.ite_vlr_tot_impostos_retidos_format = GeralFactory.currencyDecimal($scope.objModal.venda.ite_vlr_tot_impostos_retidos);

            $scope.objModal.keyEdit = $scope.params.keyEdit;
            $scope.objModal.codNatureza = $scope.params.codNatureza;
            $scope.objModal.empresa = $scope.params.empresa;
            $scope.objModal.cliente = $scope.params.cliente;
            $scope.objModal.produto = $scope.params.produto;
            $scope.objModal.interUf = $scope.params.interUf;
            $scope.objModal.endCliUf = $scope.params.endCliUf;

            if($scope.objModal.codNatureza == 31) {

                $scope.objModal.colLinhaTrib = 3;
                $scope.objModal.colLinhaBaixo = 4;
            } else {
                $scope.objModal.colLinhaTrib = 2;
                $scope.objModal.colLinhaBaixo = 2;
            }

            console.log('vvv:', $scope.params.venda);
            console.log('emp:', $scope.params.empresa);
            console.log('prod44:', $scope.objModal.produto);


            if ($scope.params.empresa.emp_reg_trib == 1 || $scope.params.empresa.emp_reg_trib == 2 || $scope.params.empresa.emp_reg_trib == 3) {

                $scope.objModal.labelCs = 'CSO';
                $scope.objModal.tipCs = 1;
            } else {
                $scope.objModal.labelCs = 'CST';
                $scope.objModal.tipCs = 2;

            }

            $scope.objModal.venda.ite_cfo_cfop = $scope.params.venda.ite_cfo_cfop;

            $scope.getMidias();

            $uibModalInstance.hasAlteracao = false;
            $scope.getDescontoPorcentagem();

            $scope.objMedida = {
                codMedida: 1,
                nomeMedida: 'R$'
            };

            // Objeto para verificar se os valores foram modificados pelo usuário na tela:
            $scope.objItemValores = {
                'ite_pro_qtd': parseFloat($scope.objModal.venda.ite_pro_qtd),
                'ite_vlr_uni_bruto': parseFloat($scope.objModal.venda.ite_vlr_uni_bruto),
                'ite_vlr_tot_desconto': parseFloat($scope.objModal.venda.ite_vlr_tot_desconto),
                'ite_vlr_tot_despesas': parseFloat($scope.objModal.venda.ite_vlr_tot_despesas),
                'ite_vlr_tot_frete': parseFloat($scope.objModal.venda.ite_vlr_tot_frete),
                'ite_vlr_tot_seguro': parseFloat($scope.objModal.venda.ite_vlr_tot_seguro)
            };

            if ($scope.objModal.empresa.emp_reg_trib == 4 || $scope.objModal.empresa.emp_reg_trib == 5 || $scope.objModal.empresa.emp_reg_trib == 6) {
                $scope.flgCst = true;
            } else {
                $scope.flgCsosn = true;
            }

            //($scope.objModal.venda.fin_vnd_cod_vendedor) && $scope.getVendedor($scope.objModal.venda.fin_vnd_cod_vendedor);

            //$scope.listarParametrosTributos();
            $scope.listarCfop();
            $scope.calcularVlrTotTri();
            $scope.listarImpostos(function () {

                angular.forEach($scope.objModal.venda.itens_tributo, function (reg, i) {

                    imp = GeralFactory.getRegistroPorChave($scope.arrImposto, reg['tri_imp_cod_imp'], 'imp_cod_imp');
                    $scope.objModal.venda.itens_tributo[i].nomeImposto = imp['imp_descricao'];

                    //console.log('itt88:',$scope.objModal.venda.itens_tributo);

                });
            });

            $scope.objModal.inputs = {
                ite_vlr_uni_bruto: true,
                ite_vlr_tot_desconto: true
            };


            //não se usa padrao do vendedor nessa janela do item, apenas cabeça da nota
            $scope.objModal.venda.vendedorSelect = $scope.objModal.venda.ite_nome_vendedor;

            // $scope.venda.fin_vnd_cod_vendedor = objR[6010]['par_pai'];

            /*
             var objUsuario = Storage.usuario.getUsuario();
             if (objUsuario['usu_cod_vendedor']) {

             $scope.getVendedor(objUsuario['usu_cod_vendedor']);
             }*/
        });


        /**
         * Método responsável em alterar o campo de input para um determinado campo.
         */
        $scope.alterarInputDecimal = function (strCampo) {

            if ($scope.objModal.inputs[strCampo] === false) {

                $scope.objModal.venda[strCampo] = parseFloat($scope.objModal.venda[strCampo].replace(',', '.'));

            } else {

                $scope.objModal.venda[strCampo] = $scope.objModal.venda[strCampo].toString().replace('.', ',');
            }

            $scope.objModal.inputs[strCampo] = !$scope.objModal.inputs[strCampo];
        };


        /**
         * Ao escolher algum vendedor.
         */
        $scope.onSelectVendedor = function ($item) {

            $scope.getVendedor($item.par_pai);
            $scope.objModal.venda.vendedorSelect = $scope.objModal.venda.ite_nome_vendedor = $item.par_c01;

            //$scope.obModal.venda. objVenda

            console.log('vendedorSelect: ',$scope.objModal.venda.vendedorSelect);
        };


        /**
         * Método responsável em adicionar um determinado vendedor diretamente pelo
         * componente de autocomplete contido na tela.
         */
        $scope.addVendedor = function ($item) {

            var objVendedor = {
                par_c01: $item.trim()
            };

            ParamsService.vendedores.create(objVendedor, function (retorno) {
                if (!retorno.records.error) {

                    $scope.objModal.venda.vendedorSelect = $item.trim();
                    $scope.objModal.venda.fin_vnd_cod_vendedor = retorno.records.par_pai;
                    $scope.getVendedor();
                }
            });
        };


        /**
         * Método responsável em recolher os vendedores existente ou apenas um determinado
         * vendedor de acordo com o código de identificação do mesmo.
         */
        $scope.getVendedor = function (par_pai) {

            if (par_pai) {

                ParamsService.vendedor.get({par_pai: par_pai}, function (retorno) {

                    $scope.objModal.venda.vendedorSelect = retorno.records.par_c01;
                    $scope.objModal.venda.ite_vnd_cod_vendedor_item = par_pai;

                });
            } else {

                ParamsService.vendedores.get({u: ''}, function (retorno) {
                    $scope.arrVendedores = retorno.records;
                });
            }
        };


        /**
         * Método responsável em efetuar a troca da medida.
         */
        $scope.trocarMedida = function () {

            if ($scope.objMedida.nomeMedida === 'R$') {

                $scope.objMedida = {
                    codMedida: 2,
                    nomeMedida: '%'
                };
            } else {

                $scope.objMedida = {
                    codMedida: 1,
                    nomeMedida: 'R$'
                };
            }
        };

        /**
         * Lista os impostos da tabela
         */
        $scope.listarImpostos = function (func) {

            var objeto = {};
            VendaService.impostos.get(objeto, function (retorno) {

                $scope.arrImposto = retorno.records;

                func.call();
            });
        };


        /**
         * Método responsável em calcular o desconto em porcentagem.
         */
        $scope.getDescontoPorcentagem = function () {

            $scope.objModal.venda.ite_por_tot_desconto = 0;
        };


        /**
         * Método responsável em recolher as fotos de um determinado item.
         */
        $scope.getMidias = function () {

            $scope.objModal.venda.produto_foto = '../app/images/sem-imagem.jpg';
            if ($scope.objModal.venda.ite_pro_cod_pro) {

                var query = 'q=(mid_tab:1,mid_tab_cod:' + $scope.objModal.venda.ite_pro_cod_pro + ')';
                MidiaService.midias.get({u: query}, function (retorno) {

                    if (retorno.records.length) {

                        $scope.objModal.venda.produto_foto = CONFIG.CACHE_IMG + retorno.records[0].mid_id;
                    }
                });
            }
        };


        /**
         * Método responsável em atualizar os dados de um determinado item.
         */
        $scope.salvarItem = function () {

            $scope.salvarItemLoading = true;

            $uibModalInstance.acaoEscolhida = 'atualizar';
            $uibModalInstance.hasAlteracao = true;
            $uibModalInstance.objVenda = $scope.objModal;
            console.log('oooo:', $uibModalInstance.objVenda);

            $uibModalInstance.zerarParcela = $scope.getVerificaAlteracao();

            $timeout(function () {
                $scope.salvarItemLoading = false;
                $uibModalInstance.dismiss('reload');
            }, 1000);
        };


        /**
         * Método responsável em verificar se houve alguma verificação com relação ao valores
         * relativos ao item. Desconto, despesa, frete, seguro, valor unitário e quantidade.
         */
        $scope.getVerificaAlteracao = function () {
            /**
             * console.log('Valores', $scope.objItemValores);
             * console.log('Venda', $scope.objModal.venda);
             */

            var retorno = false;

            angular.forEach($scope.objItemValores, function (valor, chave) {
                if (chave === 'ite_pro_qtd') {

                    var qtde = parseInt($scope.objModal.venda[chave]);
                    if (qtde != valor) {
                        retorno = true;
                    }
                } else {

                    var vlrFloat = parseFloat($scope.objModal.venda[chave]);
                    if (vlrFloat != valor) {
                        retorno = true;
                    }
                }
            });

            return retorno;
        };


        /**
         * Método responsável em calcular o valor líquido de um determinado item.
         */
        $scope.calcular = function () {

            var objVenda = $scope.objModal.venda;
            // $scope.objModal.venda.ite_pro_qtd = parseFloat(objVenda.ite_pro_qtd_br.replace(',','.'));

            $scope.objModal.venda.ite_pro_qtd = parseFloat(objVenda.ite_pro_qtd_br);


            var vlrBruto = ($scope.objModal.inputs.ite_vlr_uni_bruto) ? objVenda.ite_vlr_uni_bruto : objVenda.ite_vlr_uni_bruto.replace(',', '.');

            var vlrBrutoItem = $scope.objModal.venda.ite_pro_qtd * $scope.verificarNaN(parseFloat(vlrBruto));

            vlrBrutoItem = GeralFactory.roundNumber(vlrBrutoItem, 2);


            if (!isNaN(vlrBrutoItem)) {

                objVenda.ite_vlr_tot_bruto = vlrBrutoItem;

                // Valor referente ao desconto do item:
                var vlrDesconto = ($scope.objModal.inputs.ite_vlr_tot_desconto) ? objVenda.ite_vlr_tot_desconto : objVenda.ite_vlr_tot_desconto.replace(',', '.');

                var vlrDescontoItem = $scope.verificarNaN(parseFloat(vlrDesconto));


                // Cálculo do valor líquido do item:
                var vlrLiquidoItem = vlrBrutoItem + $scope.getDespesas() - vlrDescontoItem;
                if (!isNaN(vlrLiquidoItem)) {

                    objVenda.ite_vlr_tot_liquido = vlrLiquidoItem;
                }
            }
        };


        /**
         * Método responsável em retornar as despesas de um determinado item.
         */
        $scope.getDespesas = function () {

            var objVenda = $scope.objModal.venda;

            // Valor referente as despesas adicionais do item:
            var vlrDespesasItem = $scope.verificarNaN(parseFloat(objVenda.ite_vlr_tot_despesas));

            // Valor referente ao frete do item:
            var vlrFreteItem = $scope.verificarNaN(parseFloat(objVenda.ite_vlr_tot_frete));

            // Valor referente ao seguro do item:
            var vlrSeguroItem = $scope.verificarNaN(parseFloat(objVenda.ite_vlr_tot_seguro));

            // Valor referente ao seguro do item:
            var vlrRetidosItem = $scope.verificarNaN(parseFloat(objVenda.ite_vlr_tot_impostos_retidos));

            console.log('nattt:',$scope.objModal.codNatureza);
            if($scope.objModal.codNatureza == 31) {
                console.log('servico22');
                vlrRetidosItem = parseFloat(parseFloat(objVenda.ite_vlr_tot_impostos_retidos) * (-1));
            }

            console.log('vlrRetidosItem: ',vlrRetidosItem);

            return (vlrDespesasItem + vlrFreteItem + vlrSeguroItem + vlrRetidosItem)
        };


        /**
         * Verifica se um determinado valor é válido.
         */
        $scope.verificarNaN = function (valor) {
            return (isNaN(valor) ? 0 : valor);
        };


        /**
         * Método responsável em remover um determinado item da venda.
         */
        $scope.cancelarItem = function ($index) {

            GeralFactory.confirmar('Deseja remover o item escolhido?', function () {

                $uibModalInstance.acaoEscolhida = 'cancelar';
                $uibModalInstance.hasAlteracao = true;
                $uibModalInstance.itemDelIndex = $index;

                $timeout(function () {
                    $uibModalInstance.dismiss('reload');
                }, 1000);
            });
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function (str) {

            GeralFactory.confirmar('Deseja salvar as alterações?', function () {

                $scope.salvarItem();

            }, '', function () {

                $uibModalInstance.dismiss(str);
            }, 'Não');

        };


        /**
         * Método responsável em recolher os vendedores existente ou apenas um determinado
         * vendedor de acordo com o código de identificação do mesmo.
         */
        $scope.listarCfop = function () {

            var objCfop = {
                'cfo_6020_natureza': $scope.objModal.codNatureza,
            };

            if ($scope.objModal.interUf) {

                objCfop.cfo_eh_fora_estado = 1;
            }

            if ($scope.params.venda.produto.pro_tip_producao == '')

                console.log('objCfop: ', objCfop);


            var strCfop = GeralFactory.formatarPesquisar(objCfop);

            ParamsService.cfops.get({u: strCfop}, function (resposta) {
                console.log('rrr lista cfop:', resposta);
                $scope.listaCfo = resposta.records;
            });
        };

        $scope.getJanelaAtributoDocumento = function (campo) {

            var scope = $rootScope.$new();

            scope.params = {};

            scope.params.campo = campo;

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'venda/views/janela-atributo.html',
                controller: 'VendaAtributoCtrl',
                windowClass: 'center-modal',
                scope: scope,
                resolve: {}
            });

            modalInstance.result.then(function (id) {
            }, function (msg) {
                if (msg === 'cancel') {

                }
            });
        };


        /**
         * Janela modal para alterar as informações adicionais de um determinado item.
         */
        $scope.editInformacoesAdicionais = function (objItem) {

            if (objItem) {

                var scope = $rootScope.$new();

                scope.params = {};
                scope.params.objItem = objItem;

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'venda/views/janela-info-adicionais.html',
                    controller: 'VendaInfoAdicionaisCtrl',
                    windowClass: 'center-modal',
                    scope: scope,
                    resolve: {}
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {
                    if (msg === 'reload') {
                        if (modalInstance.hasAlteracao) {

                            var mensagem = 'As informações adicionais alteradas com sucesso!';
                            GeralFactory.notify('success', 'Sucesso!', mensagem);
                        }
                    }
                });
            }
        };


        /**
         * Abre a janela modal para ediçao de um determinado produto.
         */
        $scope.openJanelaProduto = function (pro_cod_pro) {

            if (pro_cod_pro) {

                var scope = $rootScope.$new();
                scope.params = {};

                scope.params.pro_cod_pro = pro_cod_pro;
                scope.params.pro_eh_servico = ($scope.params.codNatureza === 31) ? 1 : 0;

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'produto/views/janela-produto.html',
                    controller: 'ProdutoModalCtrl',
                    size: 'lg',
                    windowClass: 'center-modal no-top-modal',
                    scope: scope,
                    resolve: {
                        getEnd: function () {
                        }
                    }
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {
                    if (msg === 'reload') {
                        if (modalInstance.hasAlteracao) {

                            var produto = modalInstance.objProdutoUp;
                            $timeout(function () {

                                $scope.objModal.venda.ite_pro_descricao = produto.pro_descricao_longa;
                                $scope.objModal.venda.ite_pro_inf_adicionais = produto.pro_inf_adicionais;

                            }, 1000);
                        }
                    }
                });
            }
        };


        /**
         * Calcula alguns campos tributos para somar na janela do item
         */
        $scope.calcularVlrTotTri = function () {

            console.log('calcularVlrTotTri');
            var somaContab = 0;
            var somaNaoTrib = 0;

            console.log('bb: ', $scope.objModal.venda);
            angular.forEach($scope.objModal.venda.itens_tributo, function (reg, i) {

                console.log('reghh: ', reg);

                console.log('somaNaoTrib: ', somaNaoTrib);
                console.log('vai somar ', parseFloat(GeralFactory.verificarNaN(reg.tri_contabil_vlr)), ' com ', parseFloat(somaContab));
                somaContab = parseFloat(GeralFactory.verificarNaN(reg.tri_contabil_vlr)) + parseFloat(somaContab);
                somaNaoTrib = parseFloat(GeralFactory.verificarNaN(reg.tri_naotrib_vlr)) + parseFloat(somaNaoTrib);
            });

            $scope.objModal.venda.ite_vlr_tot_naotrib = somaNaoTrib;
            $scope.objModal.venda.ite_vlr_tot_contabil = somaContab;

        };

        /**
         * Calcula os impostos retiros da lista de impostos
         */
        $scope.calcularVlrTotImpRetidos = function () {

            console.log('calcularVlrTotImpRetidos');
            var somaImpRet = 0;

            //console.log('bb: ',$scope.objModal.venda);
            angular.forEach($scope.objModal.venda.itens_tributo, function (reg, i) {

                console.log('retido: ', reg.tri_eh_retido);
                if (reg.tri_eh_retido == 1) {

                    console.log('verifica iss9');
                    //se for iss e cliente for retido iss ele diminui o valor retido ao inves de somar
                    if(reg.tri_imp_cod_imp == 10 && $scope.objModal.cliente.cad_tip_contribuinte_iss) {
                        console.log('eh iss entao vai diminuir: ',parseFloat(reg.tri_imp_vlr_liquido),' --- ',parseFloat(somaImpRet));
                        somaImpRet = parseFloat(reg.tri_imp_vlr_liquido) - parseFloat(somaImpRet);

                    } else {

                        console.log('vai somar ', parseFloat(reg.tri_imp_vlr_liquido), ' com ', parseFloat(somaImpRet));
                        somaImpRet = parseFloat(reg.tri_imp_vlr_liquido) + parseFloat(somaImpRet);

                    }
                }
            });

            console.log('somaImpRet88: ',somaImpRet);
            $scope.objModal.venda.ite_vlr_tot_impostos_retidos = somaImpRet;

            $scope.objModal.venda.ite_vlr_tot_impostos_retidos_format = GeralFactory.currencyDecimal(somaImpRet);

        };

        /**
         * Remove um item da venda.
         */
        $scope.removerTributo = function ($index) {

            console.log('vai remover: ', $index);
            //$scope.venda.itens.splice($index, 1);
            $scope.objModal.venda.itens_tributo.splice($index, 1);

            console.log('nova lista: ', $scope.objModal.venda.itens_tributo);
        };


        /**
         * Editar na janela o tributo que escolhi
         * @param item
         * @param k
         * @param $index
         */
        $scope.editTributo = function (item, k, $index) {

            console.log('fafa: ', item);
            var scope = $rootScope.$new();

            scope.params = {};

            console.log('k vale: ', k);
            console.log('tt:', $scope.objModal.venda.itens_tributo);

            console.log('pp9:', $scope.objModal.produto);
            scope.params.v = $scope.objModal.v;
            scope.params.empresa = $scope.objModal.empresa;
            scope.params.cliente = $scope.objModal.cliente;
            scope.params.produto = $scope.objModal.produto;
            scope.params.endCliUf = $scope.objModal.endCliUf;
            scope.params.arrImposto = $scope.arrImposto;
            scope.params.$index = $index;
            scope.params.codNatureza = $scope.objModal.codNatureza;
            scope.params.itemProduto = $scope.objModal.venda;

            if (k != undefined) {

                scope.params.objImposto = item;
                $scope.chaveTributo = k;
                scope.params.acao = 2;

            } else {
                scope.params.objImposto = {};
                scope.params.acao = 1;
                console.log('tam: ', $scope.objModal.venda.itens_tributo.length);
                $scope.chaveTributo = parseInt($scope.objModal.venda.itens_tributo.length);
            }

            scope.params.tipCs = $scope.objModal.tipCs;
            console.log('ii:', $scope.objModal.venda);
            scope.params.itemProduto = $scope.objModal.venda;

            var controller = ($scope.objModal.venda.pro_eh_complemento_imposto) ? 'VendaComplementoTributoCtrl' : 'VendaTributoCtrl';

            var modalInstance = $uibModal.open({
                animation   : true,
                templateUrl : 'venda/views/janela-tributo.html',
                controller  : controller,
                windowClass : 'center-modal',
                scope       : scope,
                resolve     : {}
            });

            modalInstance.result.then(function (id) {
            }, function (msg) {

                if (msg === 'reload') {

                    if (modalInstance.hasAlteracao) {

                        switch (modalInstance.acaoEscolhida) {

                            case 'cancelar':
                                $scope.removerTributo(modalInstance.itemDelIndex);
                                //$scope.zerarParcelas();

                                $scope.calcularVlrTotTri();
                                $scope.calcularVlrTotImpRetidos();
                                $scope.calcular();

                                break;

                            case 'atualizar':

                                var objImposto = modalInstance.objImposto;
                                var tipCs = modalInstance.tipCs;
                                var flgNaoSet = false;

                                console.log('objImposto:', objImposto);
                                console.log('ch: ', $scope.chaveTributo);
                                console.log('tipCs: ', tipCs);
                                console.log('tri_imp_cod_imp: ', objImposto.tri_imp_cod_imp);
                                console.log('tri_cso: ', objImposto.tri_cso);

                                // Atualizando os campos de valores do item no escopo principal:
                                var proxI = $scope.objModal.venda.itens_tributo.length;
                                console.log('proxI:', proxI);
                                console.log('flgNovoSt:', modalInstance.flgNovoSt);

                                if (modalInstance.flgNovoSt) {

                                    console.log('tem novo st');
                                    var objImpostoSt = {
                                        'tri_imp_cod_imp': 2,
                                        'tri_aliq_perc': 0,
                                        'tri_bc_vlr_bruto': modalInstance.objImposto.tri_bc_vlr_bruto,
                                        'tri_bc_perc_mva': 40,
                                        'tri_bc_perc_reducao': 0,
                                        'tri_bc_vlr_liquido': 0,
                                        'tri_imp_vlr_diferenca': modalInstance.objImposto.tri_imp_vlr_liquido, //conforme doc.
                                        //  tri_contabil_tip: 0
                                        'tri_contabil_vlr': 0
                                    };

                                    ImpostoFactory.setRegraSt(objImpostoSt, $scope.objModal.v, $scope.objModal.cliente, $scope.objModal.empresa, $scope.objModal.produto, function (retorno) {

                                        $scope.objModal.venda.itens_tributo[proxI] = retorno;

                                        $scope.listarImpostos(function () {

                                            imp = GeralFactory.getRegistroPorChave($scope.arrImposto, objImposto['tri_imp_cod_imp'], 'imp_cod_imp');
                                            $scope.objModal.venda.itens_tributo[$scope.chaveTributo].nomeImposto = imp['imp_descricao'];

                                            imp = GeralFactory.getRegistroPorChave($scope.arrImposto, objImpostoSt['tri_imp_cod_imp'], 'imp_cod_imp');
                                            $scope.objModal.venda.itens_tributo[proxI].nomeImposto = imp['imp_descricao'];

                                            console.log('itt77:', $scope.objModal.venda.itens_tributo);

                                        });
                                    });
                                } else {

                                    $scope.objModal.venda.itens_tributo[$scope.chaveTributo] = objImposto;

                                    $scope.listarImpostos(function () {

                                        imp = GeralFactory.getRegistroPorChave($scope.arrImposto, objImposto['tri_imp_cod_imp'], 'imp_cod_imp');
                                        $scope.objModal.venda.itens_tributo[$scope.chaveTributo].nomeImposto = imp['imp_descricao'];

                                        //imp = GeralFactory.getRegistroPorChave($scope.arrImposto,objImpostoSt['tri_imp_cod_imp'],'imp_cod_imp');
                                        //$scope.objModal.venda.itens_tributo[proxI].nomeImposto = imp['imp_descricao'];

                                        console.log('itt77:', $scope.objModal.venda.itens_tributo);

                                        if (objImposto['tri_imp_cod_imp'] == 2) {
                                            $scope.objModal.venda.itens_tributo[$scope.chaveTributo].tri_eh_retido = 1;
                                            $scope.objModal.venda.itens_tributo[$scope.chaveTributo].nomeImposto = 'ICMS ST';
                                        }
                                    });
                                }

                                $scope.objModal.v = modalInstance.v;

                                console.log('$scope.objModal 888: ', $scope.objModal);
                                console.log('vvd:', $scope.objModal.venda.itens_tributo);

                                if($scope.objModal.venda.pro_eh_complemento_imposto) {

                                    $scope.setRegraNotaComplemento();
                                }

                                $scope.calcularVlrTotTri();
                                $scope.calcularVlrTotImpRetidos();
                                $scope.calcular(); //calcula novamente para chegar ao valor liquido

                                break;
                        }
                    }
                }
            });
        };

        $scope.setRegraNotaComplemento = function () {

            angular.forEach($scope.objModal.venda.itens_tributo, function (reg, k) {

                switch (reg.tri_imp_cod_imp)
                {
                    case 1:
                        $scope.objModal.venda.itens_tributo[k].tri_cso = '900';
                        $scope.objModal.venda.itens_tributo[k].tri_cst = '90';
                        break;

                    case 2:
                        $scope.objModal.venda.itens_tributo[k].tri_cso = '900';
                        $scope.objModal.venda.itens_tributo[k].tri_cst = '10';
                        break;

                    case 11:
                        $scope.objModal.venda.itens_tributo[k].tri_cso = '900';
                        $scope.objModal.venda.itens_tributo[k].tri_cst = '99';
                        break;
                }
            });
        };
    }
]);

angular.module('newApp').controller('VendaComplementoTributoCtrl', [
    '$scope', '$rootScope', '$timeout', '$uibModalInstance', '$uibModal', 'GeralFactory', 'EmpresaService', 'VendaService', 'ParamsService', 'ImpostoFactory',

    function ($scope, $rootScope, $timeout, $uibModalInstance, $uibModal, GeralFactory, EmpresaService, VendaService, ParamsService, ImpostoFactory) {

        $uibModalInstance.opened.then(function () {

            $scope.tipCs = $scope.params.tipCs;
            $scope.objImposto = $scope.params.objImposto;
            $scope.objImposto.$index = $scope.params.$index;
            $scope.itemProduto = $scope.params.itemProduto;

            $scope.v = $scope.params.v;
            $scope.empresa = $scope.params.empresa;
            $scope.cliente = $scope.params.cliente;
            $scope.produto = $scope.params.produto;
            $scope.endCliUf = $scope.params.endCliUf;
            $scope.arrImposto = $scope.params.arrImposto;
            $scope.codNatureza = $scope.params.codNatureza;
            $scope.objImposto.tri_imp_cod_imp_antes = $scope.objImposto.tri_imp_cod_imp;

            if($scope.itemProduto.pro_eh_complemento_imposto) {

                $scope.objImposto.tri_bc_vlr_liquido_format  = ($scope.objImposto.tri_bc_vlr_liquido_format)  ? $scope.objImposto.tri_bc_vlr_liquido_format  : 0;
                $scope.objImposto.tri_imp_vlr_liquido_format = ($scope.objImposto.tri_imp_vlr_liquido_format) ? $scope.objImposto.tri_imp_vlr_liquido_format : 0;
            }

            console.log('iten:', $scope.itemProduto);
            console.log('fff: ', $scope.params);
            console.log('iiimmmpppp:', $scope.objImposto);
            console.log('naturezaa:', $scope.codNatureza);
            console.log('tipCs:', $scope.tipCs);
            console.log('produto8:', $scope.produto);
            console.log('v:', $scope.v);

            //se for inserir um novo imposto, obter alguns valores padrões
            if ($scope.params.acao == 1) {
                console.log('acao inserir');

                $scope.escondePnlImp = true;

            } else {
                console.log('acao atualizarr');

                $scope.objImposto.tri_eh_retido_aux = ($scope.objImposto.tri_eh_retido) ? true : false;
            }

            $uibModalInstance.hasAlteracao = false;

            $scope.setAtivarCsoCsn();
            $scope.carregarListaCstCso();
        });

        $scope.setAtivarCsoCsn = function () {

            console.log('tipCs', $scope.tipCs, ' --- tri_imp_cod_imp: ', $scope.objImposto.tri_imp_cod_imp);
            if ($scope.tipCs == 1 && ($scope.objImposto.tri_imp_cod_imp == 1 || $scope.objImposto.tri_imp_cod_imp == 2) && $scope.codNatureza != 31) {

                console.log('111');
                $scope.flgAtivoCso = true;
                $scope.flgAtivoCst = false;

                console.log('bl:', $scope.v.fin_tip_cs_mudanca);
                if ($scope.v.fin_tip_cs_mudanca > 0) {
                    console.log('if troc');
                    $scope.flgAtivoCso = ($scope.v.fin_tip_cs_mudanca == 1) ? true : false;
                    $scope.flgAtivoCst = ($scope.v.fin_tip_cs_mudanca == 2) ? true : false;

                }

            } else {

                console.log('222');
                $scope.flgAtivoCso = false;
                $scope.flgAtivoCst = true;

                if ($scope.codNatureza == 31 || ($scope.objImposto.tri_imp_cod_imp == 10 || $scope.objImposto.tri_imp_cod_imp == 14 || $scope.objImposto.tri_imp_cod_imp == 15 || $scope.objImposto.tri_imp_cod_imp == 16 || $scope.objImposto.tri_imp_cod_imp == 17 || $scope.objImposto.tri_imp_cod_imp == 18)) {
                    $scope.flgAtivoCst = false;
                }
            }
        };

        $scope.trocarSituacaoCs = function (t) {
            console.log('trocar sit cs');
            $scope.v.fin_tip_cs_mudanca = t;
            $scope.setAtivarCsoCsn();
        };

        $scope.mudarImposto = function (mudouEstado) {

            if (mudouEstado) {
                $scope.objImposto.tri_eh_retido_aux = false;
            }

            $scope.setAtivarCsoCsn();

            $scope.objImposto.tri_naotrib_tip = '0';
            $scope.objImposto.tri_imp_vlr_diferenca = 0;
            $scope.objImposto.tri_naotrib_vlr = 0;
            $scope.objImposto.tri_bc_perc_mva = 0;
            $scope.objImposto.tri_bc_perc_reducao = 0;
            $scope.objImposto.tri_eh_retido_aux = false;
            $scope.objImposto.tri_bc_vlr_bruto = $scope.itemProduto.ite_vlr_tot_bruto;  //vai usar o inicial la da VendaCtrl

            console.log('uf origej: ', $scope.empresa['emp_uf']);
            console.log('uf dest: ', $scope.endCliUf);

            if (!$scope.objImposto.tri_aliq_perc > 0) {
                console.log('aliq nao é maior que zero entao seta zero');
                $scope.objImposto.tri_aliq_perc = 0;
            }

            console.log('vlr aliq: ', $scope.objImposto.tri_aliq_perc);

            $scope.objImposto.tri_imp_vlr_bruto = (parseFloat($scope.objImposto.tri_bc_vlr_liquido) * $scope.objImposto.tri_aliq_perc / 100);
            $scope.objImposto.tri_imp_vlr_liquido = $scope.objImposto.tri_imp_vlr_bruto;

            //$scope.objImposto.tri_imp_cod_imp = 1;

            if ($scope.objImposto.tri_imp_cod_imp == 2 || $scope.objImposto.tri_imp_cod_imp == 11) {
                $scope.objImposto.tri_eh_retido_aux = true;

            }

            console.log('tri bc vlrbruto: ', $scope.objImposto.tri_naotrib_vlr);

            if ($scope.objImposto.tri_bc_vlr_bruto == '') {
                $scope.objImposto.tri_naotrib_vlr = $scope.itemProduto.ite_vlr_tot_liquido;
            }

            $scope.carregarListaCstCso(mudouEstado);
        };

        $scope.carregarListaCstCso = function (mudouEstado) {

            console.log('carregarListaCstCso');
            console.log('imp: ', $scope.objImposto.tri_imp_cod_imp);
            switch ($scope.objImposto.tri_imp_cod_imp) {

                case 1:
                    if ($scope.tipCs == 1 || $scope.tipCs == 2) {
                        console.log('eh sn');
                        $scope.labCs = 2;
                        EmpresaService.csosn2.get({}, function (retorno) {
                            console.log('vai vir lista cso');
                            $scope.arrCso = GeralFactory.formataObjSelect(retorno.records);
                        });
                        EmpresaService.cst2.get({}, function (retorno) {
                            $scope.arrCst = GeralFactory.formataObjSelect(retorno.records);
                        });
                    }

                    // else if($scope.tipCs == 2) {
                    //     $scope.labCs = 2;
                    //     EmpresaService.csosn2.get({},function(retorno) {
                    //         console.log('vai vir lista cso');
                    //         $scope.arrCso = GeralFactory.formataObjSelect(retorno.records);
                    //     });
                    //     EmpresaService.cst2.get({},function(retorno) {
                    //         $scope.arrCst = GeralFactory.formataObjSelect(retorno.records);
                    //     });
                    // }

                    break;
                case 2:
                    $scope.labCs = 2;
                    if (mudouEstado) {
                        $scope.objImposto.tri_eh_retido_aux = true;
                    }

                    if ($scope.tipCs == 1 || $scope.tipCs == 2) {
                        $scope.labCs = 2;
                        EmpresaService.csosn2.get({}, function (retorno) {
                            $scope.arrCso = GeralFactory.formataObjSelect(retorno.records);
                        });
                        EmpresaService.cst2.get({}, function (retorno) {
                            $scope.arrCst = GeralFactory.formataObjSelect(retorno.records);
                        });
                    }
                    // else if($scope.tipCs == 2) {
                    //     $scope.labCs = 2;
                    //     EmpresaService.cst2.get({},function(retorno) {
                    //         $scope.arrCst = GeralFactory.formataObjSelect(retorno.records);
                    //     });
                    // }
                    break;
                case 11:
                    $scope.labCs = 2;
                    //$scope.tipCs = 2;
                    if (mudouEstado) {
                        $scope.objImposto.tri_eh_retido_aux = true;
                    }
                    EmpresaService.cstIpi.get({}, function (retorno) {
                        console.log('aadd:', retorno.records);

                        $scope.arrCst = GeralFactory.formataObjSelect(retorno.records, true);
                        console.log('rrx2:', $scope.arrCst);
                    });
                    break;
                case 12:
                case 13:
                    $scope.labCs = 2;
                    //$scope.tipCs = 2;
                    EmpresaService.cstPisCofins.get({}, function (retorno) {
                        $scope.arrCst = GeralFactory.formataObjSelect(retorno.records);
                    });
                    break;
                default:

                    $scope.labCs = 0;
            }
        };

        $scope.salvarImposto = function () {

            $scope.salvarImpostoLoading = true;

            console.log('aux: ', $scope.objImposto.tri_eh_retido_aux);
            $scope.objImposto.tri_eh_retido = ($scope.objImposto.tri_eh_retido_aux) ? 1 : 0;

            $scope.objImposto.tri_aliq_perc    = 0;
            $scope.objImposto.tri_naotrib_vlr  = 0;
            $scope.objImposto.tri_contabil_vlr = 0;
            $scope.objImposto.tri_bc_perc_mva  = '0.00';

            console.log('retido: ', $scope.objImposto.tri_eh_retido);
            console.log('salvar imposto: ', $scope.objImposto);

            $uibModalInstance.acaoEscolhida = 'atualizar';
            $uibModalInstance.hasAlteracao  = true;
            $uibModalInstance.objImposto    = $scope.objImposto;
            $uibModalInstance.flgNovoSt     = false;
            $uibModalInstance.v             = $scope.v;

            console.log('tipcs: ', $scope.tipCs);
            if (($scope.tipCs == 2 && ($scope.objImposto.tri_cst == '10' || $scope.objImposto.tri_cst == '30' || $scope.objImposto.tri_cst == '70' ))) {

                console.log('iffff primeiro');

                $uibModalInstance.flgNovoSt = true;

                angular.forEach($scope.itemProduto.itens_tributo, function (reg, k) {

                    if (reg.tri_imp_cod_imp == 2) {
                        $uibModalInstance.flgNovoSt = false;
                    }
                });

                $uibModalInstance.tipCs = $scope.tipCs;
            }

            $timeout(function () {
                $scope.salvarImpostoLoading = false;
                $scope.fecharModal('reload');
            }, 1000);
        };

        $scope.cancelarTributo = function ($index) {

            GeralFactory.confirmar('Deseja remover o tributo escolhido?', function () {

                console.log('$index a cancelar: ', $index);
                $uibModalInstance.acaoEscolhida = 'cancelar';
                $uibModalInstance.hasAlteracao = true;
                $uibModalInstance.itemDelIndex = $index;

                $timeout(function () {
                    $scope.fecharModal('reload');
                }, 1000);
            });
        };

        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };

    }

]);

angular.module('newApp').controller('VendaTributoCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', '$uibModal', 'GeralFactory', 'EmpresaService', 'VendaService', 'ParamsService', 'ImpostoFactory',

    function ($scope, $rootScope, $timeout, $uibModalInstance, $uibModal, GeralFactory, EmpresaService, VendaService, ParamsService, ImpostoFactory) {

        $scope.forms = {};
        $scope.objImposto = {};
        $scope.objNotificacao = {};
        $scope.empresa = {};
        $scope.cliente = {};
        $scope.produto = {};
        $scope.v = {};

        $uibModalInstance.opened.then(function () {

            $scope.tipCs = $scope.params.tipCs;
            $scope.objImposto = $scope.params.objImposto;
            $scope.objImposto.$index = $scope.params.$index;
            $scope.itemProduto = $scope.params.itemProduto;

            $scope.v = $scope.params.v;
            $scope.empresa = $scope.params.empresa;
            $scope.cliente = $scope.params.cliente;
            $scope.produto = $scope.params.produto;
            $scope.endCliUf = $scope.params.endCliUf;
            $scope.arrImposto = $scope.params.arrImposto;
            $scope.codNatureza = $scope.params.codNatureza;
            $scope.objImposto.tri_imp_cod_imp_antes = $scope.objImposto.tri_imp_cod_imp;

            console.log('iten:', $scope.itemProduto);
            console.log('fff: ', $scope.params);
            console.log('iiimmmpppp:', $scope.objImposto);
            console.log('naturezaa:', $scope.codNatureza);
            console.log('tipCs:', $scope.tipCs);
            console.log('produto8:', $scope.produto);
            console.log('v:', $scope.v);


            //se for inserir um novo imposto, obter alguns valores padrões
            if ($scope.params.acao == 1) {
                console.log('acao inserir');

                $scope.escondePnlImp = true;

            } else {
                console.log('acao atualizarr');

                $scope.objImposto.tri_eh_retido_aux = ($scope.objImposto.tri_eh_retido) ? true : false;

                //preciso de calcular imposto novamente quando abre por conta do ST que é criado quando criamos icms proprio 201 por exemplo.. precisa recalcular
                $scope.calcularImp();
                $scope.verificarEscondePnlImp();
                //$scope.carregarListaCstCso();
            }


            $uibModalInstance.hasAlteracao = false;

            console.log('eh retido aux: ', $scope.objImposto.tri_eh_retido_aux);
            console.log('imp q veio: ', $scope.objImposto.tri_imp_cod_imp);

            $scope.setAtivarCsoCsn();
            $scope.carregarListaCstCso();
            $scope.listarTiposNaoTributacao();
            $scope.setNomeLabelDiffBc();
            $scope.setNomeLabelAliq();


            //$scope.mudarCstCso();

            console.log('jjj: ', $scope.objImposto.tri_bc_perc_mva, ' -- ', $scope.objImposto.tri_bc_perc_reducao);
        });

        $scope.setAtivarCsoCsn = function () {

            console.log('tipCs', $scope.tipCs, ' --- tri_imp_cod_imp: ', $scope.objImposto.tri_imp_cod_imp);
            if ($scope.tipCs == 1 && ($scope.objImposto.tri_imp_cod_imp == 1 || $scope.objImposto.tri_imp_cod_imp == 2) && $scope.codNatureza != 31) {

                console.log('111');
                $scope.flgAtivoCso = true;
                $scope.flgAtivoCst = false;

                console.log('bl:', $scope.v.fin_tip_cs_mudanca);
                if ($scope.v.fin_tip_cs_mudanca > 0) {
                    console.log('if troc');
                    $scope.flgAtivoCso = ($scope.v.fin_tip_cs_mudanca == 1) ? true : false;
                    $scope.flgAtivoCst = ($scope.v.fin_tip_cs_mudanca == 2) ? true : false;

                }

            } else {

                console.log('222');
                $scope.flgAtivoCso = false;
                $scope.flgAtivoCst = true;

                if ($scope.codNatureza == 31 || ($scope.objImposto.tri_imp_cod_imp == 10 || $scope.objImposto.tri_imp_cod_imp == 14 || $scope.objImposto.tri_imp_cod_imp == 15 || $scope.objImposto.tri_imp_cod_imp == 16 || $scope.objImposto.tri_imp_cod_imp == 17 || $scope.objImposto.tri_imp_cod_imp == 18)) {
                    $scope.flgAtivoCst = false;
                }
            }


        };

        $scope.trocarSituacaoCs = function (t) {
            console.log('trocar sit cs');
            $scope.v.fin_tip_cs_mudanca = t;
            $scope.setAtivarCsoCsn();

        };

        $scope.calcularBcVlrLiquido = function () {

            console.log('calcularBcVlrLiquido');
            console.log('tri_bc_vlr_bruto: ', $scope.objImposto.tri_bc_vlr_bruto);
            console.log('tri_bc_perc_mva: ', $scope.objImposto.tri_bc_perc_mva);
            console.log('tri_bc_perc_reducao: ', $scope.objImposto.tri_bc_perc_reducao);

            // var vBCTemp = vBCBruta - ( vBCBruta * (pBCRed/100) )
            // vBCLiq = vBCTemp + ( vBCTemp * (pBCMVA/100) )

            var vBCTemp = parseFloat($scope.objImposto.tri_bc_vlr_bruto) - (parseFloat($scope.objImposto.tri_bc_vlr_bruto) * ($scope.objImposto.tri_bc_perc_reducao / 100));
            $scope.objImposto.tri_bc_vlr_liquido = vBCTemp + (vBCTemp * ($scope.objImposto.tri_bc_perc_mva / 100));


            // $scope.objImposto.tri_bc_vlr_liquido = parseFloat($scope.objImposto.tri_bc_vlr_bruto)
            //     - (parseFloat($scope.objImposto.tri_bc_vlr_bruto) * $scope.objImposto.tri_bc_perc_reducao/100)
            //     + (parseFloat($scope.objImposto.tri_bc_vlr_bruto) * $scope.objImposto.tri_bc_perc_mva/100);


            $scope.objImposto.tri_bc_vlr_liquido_format = GeralFactory.currencyDecimal($scope.objImposto.tri_bc_vlr_liquido);

            console.log('tri_bc_vlr_liquido_format: ', $scope.objImposto.tri_bc_vlr_liquido_format);
            console.log('resultado tri_bc_vlr_liquido: ', $scope.objImposto.tri_bc_vlr_liquido);

        };

        $scope.calcularImpVlrLiquido = function () {

            console.log('calcularImpVlrLiquido');
            console.log('tri_imp_vlr_bruto: ', $scope.objImposto.tri_imp_vlr_bruto);
            console.log('tri_imp_vlr_diferenca: ', $scope.objImposto.tri_imp_vlr_diferenca);

            var impostoArredondado = parseFloat($scope.objImposto.tri_imp_vlr_bruto) + parseFloat($scope.objImposto.tri_imp_vlr_diferenca);
            $scope.objImposto.tri_imp_vlr_liquido = Math.round(impostoArredondado * 100) / 100;

            console.log('tri_imp_vlr_bruto2: ', $scope.objImposto.tri_imp_vlr_bruto);
            $scope.objImposto.tri_imp_vlr_bruto_format = GeralFactory.currencyDecimal($scope.objImposto.tri_imp_vlr_bruto);
            console.log('resultado $scope.objImposto.tri_imp_vlr_bruto_format: ', $scope.objImposto.tri_imp_vlr_bruto_format);

            console.log('resultado tri_imp_vlr_liquido: ', $scope.objImposto.tri_imp_vlr_liquido);

            $scope.objImposto.tri_imp_vlr_liquido_format = GeralFactory.currencyDecimal($scope.objImposto.tri_imp_vlr_liquido);

        };

        $scope.calcularImp = function () {

            console.log('calcularImp');
            $scope.calcularBcVlrLiquido();

            console.log('bc liq: ', $scope.objImposto.tri_bc_vlr_liquido);
            console.log('aliq perc: ', $scope.objImposto.tri_aliq_perc);

            $scope.objImposto.tri_imp_vlr_bruto = (parseFloat($scope.objImposto.tri_bc_vlr_liquido) * $scope.objImposto.tri_aliq_perc / 100);
            $scope.objImposto.tri_imp_vlr_bruto_format = GeralFactory.currencyDecimal($scope.objImposto.tri_imp_vlr_bruto);

            $scope.calcularImpVlrLiquido();
        };


        /**
         * Lista os tipos de não tributação
         */
        $scope.listarTiposNaoTributacao = function () {

            $scope.arrTipoNaoTributacao = GeralFactory.listarTiposNaoTributacao();
        };

        /**
         * Seta o nome do label da diferença de BC
         */
        $scope.setNomeLabelDiffBc = function () {

            console.log('heeeeee: ', $scope.objImposto.tri_imp_cod_imp);

            if ($scope.objImposto.tri_imp_cod_imp == 2) {

                $scope.objImposto.labelDiffBc = 'MVA (%)';
            } else if ($scope.objImposto.tri_imp_cod_imp == 1 && $scope.objImposto.tri_cst == '20') {
                $scope.objImposto.labelDiffBc = 'Redução BC (%)';
                //$scope.objImposto.sinalDiffBc = '-';

            } else {
                $scope.objImposto.labelDiffBc = 'Diferença de BC (%)';
                //$scope.objImposto.sinalDiffBc = '+';
            }
        };

        /**
         * Seta o nome do label da aliquota
         */
        $scope.setNomeLabelAliq = function () {

            if ($scope.objImposto.tri_imp_cod_imp == 2) {

                $scope.objImposto.labelAliq = 'Alíquota UF Destino';
            } else {
                $scope.objImposto.labelAliq = 'Alíquota';
            }
        };


        $scope.setOutrosValores = function () {

            if (!$scope.escondePnlImp) {
                //VLR_NAOTRIB = BC_DIF * BC_BRU
                $scope.objImposto.tri_naotrib_vlr = parseFloat($scope.objImposto.tri_aliq_perc) * parseFloat($scope.objImposto.tri_bc_vlr_bruto);

                if(parseFloat($scope.objImposto.tri_naotrib_vlr) > 0) {

                    $scope.objImposto.tri_naotrib_tip = '3'; //ICMS OUTROS
                }

                if ($scope.objImposto.tri_imp_cod_imp == 1) {

                    $scope.objImposto.tri_contabil_vlr = parseFloat($scope.objImposto.tri_bc_vlr_bruto) + parseFloat($scope.objImposto.tri_naotrib_vlr);
                } else {
                    $scope.objImposto.tri_contabil_vlr = parseFloat($scope.objImposto.tri_bc_vlr_liquido);
                }
            }
        };


        /**
         * Ao mudar o imposto executar algumas ações na tela
         */
        $scope.mudarImposto = function (mudouEstado) {

            if (mudouEstado) {
                $scope.objImposto.tri_eh_retido_aux = false;
            }

            $scope.setAtivarCsoCsn();

            $scope.objImposto.tri_naotrib_tip = '0';
            $scope.objImposto.tri_imp_vlr_diferenca = 0;
            $scope.objImposto.tri_naotrib_vlr = 0;
            $scope.objImposto.tri_bc_perc_mva = 0;
            $scope.objImposto.tri_bc_perc_reducao = 0;
            $scope.objImposto.tri_eh_retido_aux = false;
            $scope.objImposto.tri_bc_vlr_bruto = $scope.itemProduto.ite_vlr_tot_bruto;  //vai usar o inicial la da VendaCtrl

            console.log('uf origej: ', $scope.empresa['emp_uf']);
            console.log('uf dest: ', $scope.endCliUf);

            if (!$scope.objImposto.tri_aliq_perc > 0) {
                console.log('aliq nao é maior que zero entao seta zero');
                $scope.objImposto.tri_aliq_perc = 0;
            }

            console.log('vlr aliq: ', $scope.objImposto.tri_aliq_perc);

            $scope.objImposto.tri_imp_vlr_bruto = (parseFloat($scope.objImposto.tri_bc_vlr_liquido) * $scope.objImposto.tri_aliq_perc / 100);
            $scope.objImposto.tri_imp_vlr_liquido = $scope.objImposto.tri_imp_vlr_bruto;

            //$scope.objImposto.tri_imp_cod_imp = 1;

            if ($scope.objImposto.tri_imp_cod_imp == 2 || $scope.objImposto.tri_imp_cod_imp == 11) {
                $scope.objImposto.tri_eh_retido_aux = true;

            }

            console.log('tri bc vlrbruto: ', $scope.objImposto.tri_naotrib_vlr);

            if ($scope.objImposto.tri_bc_vlr_bruto == '') {
                $scope.objImposto.tri_naotrib_vlr = $scope.itemProduto.ite_vlr_tot_liquido;

                if(parseFloat($scope.objImposto.tri_naotrib_vlr) > 0) {

                    $scope.objImposto.tri_naotrib_tip = '3';
                }
            }

            //$scope.setAtivarCsoCsn();

            $scope.calcularImp();


            $scope.carregarListaCstCso(mudouEstado);

            $scope.setNomeLabelDiffBc();
            $scope.setNomeLabelAliq();
            $scope.verificarEscondePnlImp();
        };

        /**
         * Carrega a lista de CST ou CSO na modal de tributo
         * @param mudouEstado
         */
        $scope.carregarListaCstCso = function (mudouEstado) {

            console.log('carregarListaCstCso');
            console.log('imp: ', $scope.objImposto.tri_imp_cod_imp);
            switch ($scope.objImposto.tri_imp_cod_imp) {

                case 1:
                    if ($scope.tipCs == 1 || $scope.tipCs == 2) {
                        console.log('eh sn');
                        $scope.labCs = 2;
                        EmpresaService.csosn2.get({}, function (retorno) {
                            console.log('vai vir lista cso');
                            $scope.arrCso = GeralFactory.formataObjSelect(retorno.records);
                        });
                        EmpresaService.cst2.get({}, function (retorno) {
                            $scope.arrCst = GeralFactory.formataObjSelect(retorno.records);
                        });
                    }

                    // else if($scope.tipCs == 2) {
                    //     $scope.labCs = 2;
                    //     EmpresaService.csosn2.get({},function(retorno) {
                    //         console.log('vai vir lista cso');
                    //         $scope.arrCso = GeralFactory.formataObjSelect(retorno.records);
                    //     });
                    //     EmpresaService.cst2.get({},function(retorno) {
                    //         $scope.arrCst = GeralFactory.formataObjSelect(retorno.records);
                    //     });
                    // }

                    break;
                case 2:
                    $scope.labCs = 2;
                    if (mudouEstado) {
                        $scope.objImposto.tri_eh_retido_aux = true;
                    }

                    if ($scope.tipCs == 1 || $scope.tipCs == 2) {
                        $scope.labCs = 2;
                        EmpresaService.csosn2.get({}, function (retorno) {
                            $scope.arrCso = GeralFactory.formataObjSelect(retorno.records);
                        });
                        EmpresaService.cst2.get({}, function (retorno) {
                            $scope.arrCst = GeralFactory.formataObjSelect(retorno.records);
                        });
                    }
                    // else if($scope.tipCs == 2) {
                    //     $scope.labCs = 2;
                    //     EmpresaService.cst2.get({},function(retorno) {
                    //         $scope.arrCst = GeralFactory.formataObjSelect(retorno.records);
                    //     });
                    // }
                    break;
                case 11:
                    $scope.labCs = 2;
                    //$scope.tipCs = 2;
                    if (mudouEstado) {
                        $scope.objImposto.tri_eh_retido_aux = true;
                    }
                    EmpresaService.cstIpi.get({}, function (retorno) {
                        console.log('aadd:', retorno.records);

                        $scope.arrCst = GeralFactory.formataObjSelect(retorno.records, true);
                        console.log('rrx2:', $scope.arrCst);
                    });
                    break;
                case 12:
                case 13:
                    $scope.labCs = 2;
                    //$scope.tipCs = 2;
                    EmpresaService.cstPisCofins.get({}, function (retorno) {
                        $scope.arrCst = GeralFactory.formataObjSelect(retorno.records);
                    });
                    break;
                default:

                    $scope.labCs = 0;
            }
        };

        /**
         * Salva na memoria os dados de determinado imposto
         */
        $scope.salvarImposto = function () {

            $scope.salvarImpostoLoading = true;

            console.log('aux: ', $scope.objImposto.tri_eh_retido_aux);
            $scope.objImposto.tri_eh_retido = ($scope.objImposto.tri_eh_retido_aux) ? 1 : 0;

            console.log('retido: ', $scope.objImposto.tri_eh_retido);
            console.log('salvar imposto: ', $scope.objImposto);

            $uibModalInstance.acaoEscolhida = 'atualizar';
            $uibModalInstance.hasAlteracao = true;
            $uibModalInstance.objImposto = $scope.objImposto;
            $uibModalInstance.flgNovoSt = false;
            $uibModalInstance.v = $scope.v;

            console.log('tipcs: ', $scope.tipCs);
            if (($scope.tipCs == 2 && ($scope.objImposto.tri_cst == '10' || $scope.objImposto.tri_cst == '30' || $scope.objImposto.tri_cst == '70' ))) {

                console.log('iffff primeiro');

                $uibModalInstance.flgNovoSt = true;

                angular.forEach($scope.itemProduto.itens_tributo, function (reg, k) {

                    if (reg.tri_imp_cod_imp == 2) {
                        $uibModalInstance.flgNovoSt = false;
                    }
                });


                $uibModalInstance.tipCs = $scope.tipCs;
            }

            //console.log('iiinnn: ',$uibModalInstance.objImpostoSt);

            //console.log('oooo:',$scope.objModal);
            //$uibModalInstance.zerarParcela  =  $scope.getVerificaAlteracao();

            $timeout(function () {
                $scope.salvarImpostoLoading = false;
                $scope.fecharModal('reload');
            }, 1000);
        };

        /**
         * Método responsável em remover um determinado tributo do item.
         */
        $scope.cancelarTributo = function ($index) {

            GeralFactory.confirmar('Deseja remover o tributo escolhido?', function () {

                console.log('$index a cancelar: ', $index);
                $uibModalInstance.acaoEscolhida = 'cancelar';
                $uibModalInstance.hasAlteracao = true;
                $uibModalInstance.itemDelIndex = $index;

                $timeout(function () {
                    $scope.fecharModal('reload');
                }, 1000);
            });
        };

        $scope.abrirEditarBc = function () {

            if ($scope.objImposto.editarBc == 1) {
                $scope.objImposto.editarBc = 0;

            } else {
                $scope.objImposto.editarBc = 1;
            }

            $scope.objImposto.editarImp = 0;
            console.log('edit: ', $scope.objImposto.editarBc);
        };

        $scope.abrirEditarImp = function () {

            if ($scope.objImposto.editarImp == 1) {
                $scope.objImposto.editarImp = 0;
            } else {
                $scope.objImposto.editarImp = 1;
            }

            $scope.objImposto.editarBc = 0;
            console.log('edit: ', $scope.objImposto.editarImp);
        };

        $scope.abrirEditarDadosContab = function () {

            if ($scope.objImposto.editarDadosContab == 1) {
                $scope.objImposto.editarDadosContab = 0;
            } else {
                $scope.objImposto.editarDadosContab = 1;
            }

            console.log('edit: ', $scope.objImposto.editarDadosContab);
        };

        $scope.mudarCstCso = function () {

            console.log('acessa mudarCstCso');
            console.log('ee:', $scope.empresa);
            console.log('pp:', $scope.produto);

            console.log('$scope.tipCs: ', $scope.tipCs);
            console.log('tri_imp_cod_imp: ', $scope.objImposto.tri_imp_cod_imp);
            console.log('tri_cso: ', $scope.objImposto.tri_cso);

            console.log('tippppppppp emittttttttttt', $scope.v.fin_tip_emitente);

            if($scope.v.fin_tip_emitente == 'P') {

                if ($scope.tipCs == 1 && ($scope.objImposto.tri_imp_cod_imp == 1) && ($scope.objImposto.tri_cso == '201' || $scope.objImposto.tri_cso == '202' || $scope.objImposto.tri_cso == '203')) {

                    console.log('it: ', $scope.itemProduto.ite_vlr_tot_liquido);
                    $scope.objImposto.tri_bc_vlr_bruto = $scope.itemProduto.ite_vlr_tot_liquido;
                    $scope.objImposto.tri_bc_perc_mva = 0;
                    $scope.objImposto.tri_bc_perc_reducao = 0;

                    console.log('emp33: ', $scope.empresa);
                    console.log('imp888888: ', $scope.objImposto);
                    console.log('tri_bc_perc_mva33: ', $scope.objImposto.tri_bc_perc_mva);
                    console.log('tri_bc_perc_reducao33: ', $scope.objImposto.tri_bc_perc_reducao);

                    ImpostoFactory.setRegraSt($scope.objImposto, $scope.v, $scope.cliente, $scope.empresa, $scope.produto, function (retorno) {

                        console.log('retornost: ', retorno);
                        console.log('iniiiii');
                        console.log('itens tribtt: ', $scope.itemProduto.itens_tributo);
                        console.log('objImposto5:', $scope.objImposto);

                        if ($scope.objImposto.tri_imp_cod_imp_antes == 1) {

                            console.log('existe imp 1');
                            console.log('rettt3: ', retorno);
                            $scope.newTributoIcms = retorno;
                            $scope.newTributoIcms.tri_bc_vlr_bruto = $scope.itemProduto.ite_vlr_tot_bruto;

                            console.log('new: ', $scope.newTributoIcms);
                            //flgNaoSet = true;
                        }


                        $scope.calcularImp();
                        $scope.verificarEscondePnlImp();

                    });
                } else if ($scope.tipCs == 1 && ($scope.objImposto.tri_imp_cod_imp == 2) && ($scope.objImposto.tri_cso != '201' && $scope.objImposto.tri_cso != '202' && $scope.objImposto.tri_cso != '203' && $scope.objImposto.tri_cso != '900')) {

                    console.log('else iffff');
                    $scope.newTributoIcms = {};
                    $scope.objImposto.tri_imp_cod_imp = 1;
                    //$scope.newTributoIcms =
                    $scope.calcularImp();
                } else if ($scope.objImposto.tri_cso != '900') {

                    console.log('900');

                } else {

                    console.log('nenhumaa');
                }
            }

            $scope.verificarEscondePnlImp();
            $scope.setNomeLabelDiffBc();
        };

        $scope.verificarEscondePnlImp = function () {

            $scope.escondePnlImp = false;

            if (($scope.tipCs == 2 && ($scope.objImposto.tri_imp_cod_imp == 1 || $scope.objImposto.tri_imp_cod_imp == 2) && ($scope.objImposto.tri_cst == '40' || $scope.objImposto.tri_cst == '41' || $scope.objImposto.tri_cst == '50' || $scope.objImposto.tri_cst == '51' || $scope.objImposto.tri_cst == '60')) ||
                ($scope.tipCs == 1 && $scope.objImposto.tri_imp_cod_imp == 1 && $scope.objImposto.tri_cso != '900')) {

                $scope.escondePnlImp = true;
                $scope.objImposto.tri_imp_vlr_bruto = 0;
                $scope.objImposto.tri_imp_vlr_liquido = 0;
                $scope.objImposto.tri_bc_vlr_bruto = 0;
                $scope.objImposto.tri_bc_vlr_liquido = 0;
                $scope.objImposto.tri_imp_vlr_diferenca = 0;
                $scope.objImposto.tri_aliq_perc = 0;
                $scope.objImposto.tri_bc_perc_mva = 0;
                $scope.objImposto.tri_bc_perc_reducao = 0;
            }

            if($scope.v.fin_tip_emitente == 'T') {
                $scope.escondePnlImp = false;
            }
        };

        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };
    }]);

angular.module('newApp').controller('VendaRastreamentoCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'GeralFactory', 'EmpresaService', 'VendaService',

    function ($scope, $rootScope, $timeout, $uibModalInstance, GeralFactory, EmpresaService, VendaService) {

        $scope.forms = {};
        $scope.objModal = {};
        $scope.objNotificacao = {};

        $uibModalInstance.opened.then(function () {

            $scope.objModal.operacao = $scope.params.operacao;
            $scope.objModal.nroPedido = $scope.params.nroPedido;
            $scope.objModal.codRastreamento = $scope.params.rastreamento;

            $uibModalInstance.hasAlteracao = false;

            $scope.getRastreamento();
            $scope.setAbaInicial();
        });

        /**
         * Método responsável em efetuar o rastreamento da mercadoria efetuando
         * a consulta no WS dos Correios.
         */
        $scope.getRastreamento = function () {

            var objeto = {u: $scope.objModal.codRastreamento};
            EmpresaService.rastreamento.get(objeto, function (retorno) {

                var detalhes = (retorno.records.categoria) ? retorno.records.categoria : '';
                detalhes += (retorno.records.nome) ? ' ' + retorno.records.nome : '';

                var objRastreamento = retorno.records.evento;
                objRastreamento['detalhes'] = detalhes;

                $scope.objModal.arrRastreamento = [objRastreamento];
            });
        };

        /**
         * Método responsável em inicializar a aba na janela modal.
         */
        $scope.setAbaInicial = function () {

            $scope.tabs = [{active: true}, {active: false}, {active: false}];
        };

        /**
         * Método responsável em enviar um e-mail notificando o usuário do andamento
         * e rastreamento da mercadoria.
         */
        $scope.enviar = function () {

            $scope.enivarNotificacaoLoading = true;

            $scope.$watch('forms.formNotificacao', function (form) {
                if (form) {
                    if (form.$invalid) {

                        $scope.submitted = true;
                        $scope.enivarNotificacaoLoading = false;

                    } else {

                        $scope.objModal.op = $scope.objModal.operacao;

                        VendaService.emailRastreio.enviar($scope.objModal, function (retorno) {
                            if (retorno.records) {

                                var mensagem = 'O email de rastreamento foi enviado com sucesso para o cliente.';// ' + $scope.objNotificacao.email + '.';
                                GeralFactory.notify('success', 'Sucesso!', mensagem);

                                $timeout(function () {
                                    $scope.enivarNotificacaoLoading = false;
                                    $scope.forms.formNotificacao.$setPristine();
                                    $scope.objNotificacao = angular.copy({});
                                    $scope.setAbaInicial();
                                }, 1000);
                            }
                        });
                    }
                }
            });
        };

        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('VendaAtributoCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'ParamsService', 'GeralFactory', 'VendaService', 'UsuarioService', 'Storage',

    function ($scope, $rootScope, $timeout, $uibModalInstance, ParamsService, GeralFactory, VendaService, UsuarioService, Storage) {

        $scope.forms = {};
        $scope.objModal = {};
        $scope.objVendedor = {};
        $scope.objCfo = {};

        $uibModalInstance.opened.then(function () {

            $scope.atributoLoading = false;

            $scope.objModal.v = $scope.params.v;

            console.log('pp3:', $scope.params);
            ////{{objModal.campo == 'IN'?'Inutilizar':'Selecionar'}}
            var label;
            switch ($scope.params.campo) {
                case 'D':
                    label = 'Data de Lançamento';

                    if ($scope.params.valorEmi == undefined) {

                        $scope.objModal.valorEmi = $scope.params.valor;
                    } else {
                        $scope.objModal.valorEmi = $scope.params.valorEmi;
                    }
                    $scope.objModal.valorDataSai = $scope.params.valorDataSai;
                    $scope.objModal.valorHoraSai = $scope.params.valorHoraSai;

                    $scope.objModal.labelSalvar = 'Salvar';
                    break;

                case 'V':
                    label = 'Vendedor';

                    $scope.objModal.vendedor_padrao_tmp = false;

                    var objUsuario = Storage.usuario.getUsuario();
                    $scope.objModal.objUsuario = objUsuario;

                    if(objUsuario['usu_cod_vendedor'] == $scope.params.v.ite_vnd_cod_vendedor_item) {
                        $scope.objModal.vendedor_padrao_tmp = true;
                    }

                    $scope.objModal.labelSalvar = 'Salvar';
                    break;

                case 'CF':
                    label = 'CFOP';

                    $scope.objModal.cfop_padrao_tmp = false;

                    var strCod = '1|6020|' + $scope.params.v.codNatureza + '||';

                    ParamsService.getParametro(strCod, function (data) {
                        if (data) {
                            //$scope.cfopPadrao = data;
                            if (data.par_i01) {

                                $scope.params.v.cfopOriginal = data.par_i01;
                                $scope.params.v.cfopOriginalTipo = 'par_i01';

                                if ($scope.params.cliente.endereco.end_endereco_cod_uf != undefined) {

                                    if ($scope.params.cliente.endereco.end_endereco_cod_uf != $scope.params.empresa.emp_cod_uf) {
                                        $scope.params.v.cfopOriginal = data.par_i02;
                                        $scope.params.v.cfopOriginalTipo = 'par_i02';
                                    }
                                }
                            }

                            console.log($scope.params.v.cfopOriginal + ' -- ' + $scope.params.valor);

                            if ($scope.params.v.cfopOriginal == $scope.params.valor) {
                                $scope.objModal.cfop_padrao_tmp = true;
                            }

                        }

                    });

                    ParamsService.cfop.get({id: $scope.params.valor}, function (resposta) {
                        console.log('resop:', resposta);
                        $scope.objModal.valorCfop = resposta.records.cfo_descricao;
                        $scope.objModal.fin_cfo_cfop = $scope.params.valor;
                    });

                    $scope.objModal.labelSalvar = 'Salvar';
                    break;

                case 'IN':
                    label = 'Inutilizar';

                    ParamsService.cfop.get({id: $scope.params.valor}, function (resposta) {
                        console.log('resop:', resposta);
                        $scope.objModal.valorCfop = resposta.records.cfo_descricao;
                        $scope.objModal.fin_cfo_cfop = $scope.params.valor;
                    });

                    $scope.objModal.labelSalvar = 'Inutilizar';
                    break;

                case 'CC':
                    label = 'Centro de Custo';
                    $scope.objModal.cc_padrao_tmp = false;

                    $scope.verificarPadroes(function () {

                        console.log('objpp: ',$scope.objPadroes);

                        if($scope.objPadroes[6050] != undefined) {

                            if ($scope.params.v.fin_6050_cdc == $scope.objPadroes[6050]['par_pai']) {
                                $scope.objModal.cc_padrao_tmp = true;
                            }
                        }

                    });

                    $scope.objModal.labelSalvar = 'Salvar';
                    break;

                case 'CFIN':
                    label = 'Conta Financeira';
                    $scope.objModal.cfin_padrao_tmp = false;

                    $scope.verificarPadroes(function () {

                        console.log('objpp: ',$scope.objPadroes);

                        if($scope.objPadroes[5010] != undefined) {

                            if ($scope.params.v.fin_5010_conta_fin == $scope.objPadroes[5010]['par_pai']) {
                                $scope.objModal.cfin_padrao_tmp = true;
                            }
                        }

                    });

                    $scope.objModal.labelSalvar = 'Salvar';
                    break;

                case 'INFCPL':

                    console.log('$scope.params.v.codNatureza', $scope.params.v.codNatureza);

                    label = 'Informação Complementar';
                    $scope.objModal.infcpl_padrao_tmp = ($scope.params.valor) ? $scope.params.valor : '';

                    $scope.objModal.labelSalvar = 'Salvar';
                    break;

                case 'SD':

                    //console.log('$scope.params.v.codNatureza', $scope.params.v.codNatureza);

                    //$scope.objModal.infcpl_padrao_tmp = ($scope.params.valor) ? $scope.params.valor : '';

                    $scope.objModal.labelSalvar = 'Salvar';
                    break;

                case 'CANCNF':

                    $scope.objModal.fin_comentario_tmp = (!$scope.objModal.v.fin_comentario) ? 'Cancelamento da NFe' : $scope.objModal.v.fin_comentario;

                    console.log('$scope.params', $scope.params.v, $scope.objModal.fin_comentario_tmp);

                    $scope.objModal.labelSalvar = 'Cancelar NFe';
                    break;

            }

            $scope.objModal.label = label;
            $scope.objModal.campo = $scope.params.campo;
            $scope.objModal.valor = $scope.params.valor;

            $uibModalInstance.hasAlteracao = false;
        });


        $scope.verificarPadroes = function (func) {

            if ($scope.params.paramPadrao.par_i03 == null) {
                $scope.params.paramPadrao.par_i03 = '';
            }
            if ($scope.params.paramPadrao.par_i04 == null) {
                $scope.params.paramPadrao.par_i04 = '';
            }
            if ($scope.params.paramPadrao.par_i05 == null) {
                $scope.params.paramPadrao.par_i05 = '';
            }


            var strFiltro = $scope.params.paramPadrao.par_i03 + '|' + $scope.params.paramPadrao.par_i04 + '|' + $scope.params.paramPadrao.par_i05;

            ParamsService.paramPadroesNat.get({combinadoPar: strFiltro}, function (resposta) {

                $scope.objPadroes = resposta.records;
                func.call();
            });
        };

        /**
         * Método responsável em finalizar a escolha feita pela o usuário e
         * voltar para a tela principal de venda/compra.
         */
        $scope.finalizar = function () {

            $uibModalInstance.hasAlteracao = true;
            var horaS = '';
            var dataS = '';

            console.log('campo: ',$scope.params.campo);

            if ($scope.params.campo === 'D') {

                $scope.$watch('forms.formAtributos', function (form) {
                    if (form) {
                        if (form.$invalid) {

                            $scope.submitted = true;

                        } else {

                            $uibModalInstance.fin_dat_lan = $scope.objModal.valor;
                            $uibModalInstance.fin_dat_emi = $scope.objModal.valorEmi;

                            console.log('e1:', $scope.objModal.valorDataSai);
                            console.log('e2:', $scope.objModal.valorHoraSai);

                            if ($scope.objModal.valorDataSai != undefined) {

                                if ($scope.objModal.valorHoraSai != undefined) {
                                    horaS = $scope.objModal.valorHoraSai;
                                    horaS = horaS.split(':');
                                    if (horaS.length === 1) {

                                        h = horaS[0].substr(0, 2);
                                        m = horaS[0].substr(2, 2);
                                    } else {

                                        h = horaS[0];
                                        m = horaS[1];
                                    }
                                    horaS = h + ':' + m;
                                } else {
                                    horaS = '00:00';
                                }

                                console.log('horaS: ', horaS)
                                dataS = $scope.objModal.valorDataSai;

                                $uibModalInstance.fin_dat_sai = dataS + ' ' + horaS;
                            } else {

                                $uibModalInstance.fin_dat_sai = '';
                            }

                            $scope.fecharModal('cancel');
                        }
                    }
                });

            } else if ($scope.params.campo === 'CF') {

                console.log('objmodal: ', $scope.objModal);
                $scope.objModal.id = $scope.objModal.fin_cfo_cfop;
                $scope.objModal.cfo_descricao = $scope.objModal.valorCfop;

                ParamsService.cfop.update($scope.objModal, function (resposta) {
                    console.log('resop:', resposta);
                    $scope.objModal.valorCfop = resposta.records.cfo_descricao;
                    $uibModalInstance.fin_cfo_cfop = $scope.objModal.fin_cfo_cfop;

                    if ($scope.objModal.cfop_padrao_tmp) {

                        var obj = {
                            'par_pai': $scope.params.v.codNatureza,
                            'par_assunto': '6020',

                        };

                        if ($scope.params.v.cfopOriginalTipo == 'par_i01') {
                            obj.par_i01 = $scope.objModal.fin_cfo_cfop;
                        } else if ($scope.params.v.cfopOriginalTipo == 'par_i02') {
                            obj.par_i02 = $scope.objModal.fin_cfo_cfop;
                        }

                        ParamsService.param.update(obj, function (resposta) {


                        });
                    }

                });


                $scope.fecharModal('cancel');

            } else if ($scope.params.campo === 'IN') {

                $scope.atributoLoading = true;

                //$scope.objModal.id = $scope.objModal.fin_cfo_cfop;

                $scope.objModal.fin_6020_natureza = $scope.params.fin_6020_natureza;
                $scope.objModal.fin_6030_esp_doc = $scope.params.fin_6030_esp_doc;

                VendaService.venda.inutilizarNfeAvulso($scope.objModal, function (retorno) {

                    console.log('ret:', retorno);
                    $uibModalInstance.retornoNfe = retorno;

                    $scope.atributoLoading = false;

                    $scope.fecharModal('cancel');
                });

            } else if ($scope.params.campo === 'CC') {

                if ($scope.objModal.cc_padrao_tmp) {

                    var obj = {
                        'par_pai': $scope.params.v.codNatureza,
                        'par_assunto': '6020',
                        'par_i03' : $scope.objModal.v.fin_6050_cdc

                    };

                    ParamsService.param.update(obj, function (resposta) {

                        $scope.params.paramPadrao.par_i03 = $scope.objModal.v.fin_6050_cdc;

                    });
                }


                $scope.fecharModal('cancel');

            } else if ($scope.params.campo === 'CFIN') {

                if ($scope.objModal.cfin_padrao_tmp) {

                    var obj = {
                        'par_pai': $scope.params.v.codNatureza,
                        'par_assunto': '6020',
                        'par_i04' : $scope.objModal.v.fin_5010_conta_fin

                    };

                    ParamsService.param.update(obj, function (resposta) {

                        $scope.params.paramPadrao.par_i04 = $scope.objModal.v.fin_5010_conta_fin;

                    });
                }


                $scope.fecharModal('cancel');

            } else if ($scope.params.campo === 'V') {

                console.log('ffffddsaaa: ',$scope.objModal.objUsuario);
                if ($scope.objModal.vendedor_padrao_tmp) {

                    var obj = {
                        'usu_cod_vendedor' : $scope.params.v.ite_vnd_cod_vendedor_item,
                        'usu_cod_usu' : $scope.objModal.objUsuario.usu_cod_usu

                    };

                    UsuarioService.usuario.atualizarUsuVendedor(obj, function (resposta) {

                        //$scope.params.paramPadrao.par_i04 = $scope.objModal.v.fin_5010_conta_fin;

                    });
                }


                $scope.fecharModal('cancel');

            } else if ($scope.params.campo === 'INFCPL') {

                console.log('$scope.objModal.infcpl_padrao_tmp', $scope.objModal.infcpl_padrao_tmp);

                if ($scope.objModal.infcpl_padrao_tmp && $scope.objModal.infcpl_padrao_tmp != '') {

                    obj = {
                        'par_pai'    : $scope.params.v.codNatureza,
                        'par_assunto': '6020',
                        'par_t01'    : $scope.objModal.infcpl_padrao_tmp
                    };

                    ParamsService.param.update(obj, function (resposta) {});
                }

                $scope.fecharModal('cancel');

            } else if ($scope.params.campo === 'SD') {

                console.log('doc nrr: ',$scope.objModal.fin_doc_nro);

                var objFiltro = {
                    'fin_6030_esp_doc' : '2',
                    'fin_doc_nro' : $scope.objModal.fin_doc_nro
                };

                var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                VendaService.vendas.verExiste({u : strFiltro}, function(retorno) {


                    console.log('ok',retorno.records);
                    if(!retorno.records.ok) {

                        console.log('ifffdd');
                        $uibModalInstance.fin_doc_nro = $scope.objModal.fin_doc_nro;
                        $scope.fecharModal('cancel');

                    } else {

                        console.log('elkseee');

                        GeralFactory.notify('warning', 'Atenção','Essa numeração já existe para série D');
                        return false;

                    }
                });

            }  else if ($scope.params.campo === 'CANCNF') {

                if($scope.objModal.fin_comentario_tmp.length < 15) {

                    GeralFactory.notify('danger', 'Erro!', 'A justificativa deve possuir ao menos 15 caracteres!');
                    return;
                }

                $scope.atributoLoading = true;

                $scope.objModal.v.fin_comentario = $scope.objModal.fin_comentario_tmp;

                console.log('$scope.objModal.v: ',$scope.objModal.v);

                VendaService.venda.update($scope.objModal.v, function (resposta) {

                    VendaService.venda.cancelarStatusNFe($scope.objModal.v, function (retorno) {

                        $uibModalInstance.retorno_canc_nfe = retorno;
                        $scope.atributoLoading = false;

                        $scope.fecharModal('cancel')
                    });
                });
            }
        };



        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);

angular.module('newApp').controller('VendaEnvioEmailModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'GeralFactory', 'VendaService', 'AuthTokenFactory', 'TransporteService',

    function ($scope, $rootScope, $timeout, $uibModalInstance, GeralFactory, VendaService, AuthTokenFactory, TransporteService) {

        $scope.forms = {};
        $scope.objModal = {};

        $uibModalInstance.opened.then(function () {

            $uibModalInstance.hasAlteracao = false;

            $scope.objModal.venda = $scope.params.venda;
            $scope.objModal.keyEdit = $scope.params.keyEdit;
            $scope.objModal.codNatureza = $scope.params.codNatureza;

            if ($scope.params.tipo == 'orcamento') {
                $scope.objModal.funcEnvio = 'enviarOrcamentoDAV()';

            } else if ($scope.params.tipo == 'nfe') {
                $scope.objModal.funcEnvio = 'enviarEmailNfe()';

            } else if ($scope.params.tipo == 'cte') {
                $scope.objModal.funcEnvio = 'enviarEmailCte()';
            }

            console.log('func: ', $scope.objModal.funcEnvio);

        });

        /**
         */
        $scope.clicarBotaoModal = function (str) {

            $uibModalInstance.dismiss(str);
        };


        $scope.enviarOrcamentoDAV = function () {

            $scope.objModal.enviarOrcamentoLoading = false;
            var strFiltro = '';
            var mensagem = '';

            if ($scope.objModal.venda.fin_nro_lan) {

                $scope.objModal.enviarOrcamentoLoading = true;

                strFiltro = GeralFactory.formatarPesquisar({
                    'fin_nro_lan': $scope.objModal.venda.fin_nro_lan,
                    'fin_doc_nro': $scope.objModal.venda.fin_doc_nro,
                    'acao': 'enviar',
                    'ken': AuthTokenFactory.getToken()
                });

                VendaService.orcamentoEnviar.get({u: strFiltro}, function (resposta) {

                    if (resposta.records.ok) {

                        mensagem = 'Email enviado com sucesso!';
                        GeralFactory.notify('success', 'Sucesso!', mensagem);

                        $scope.objModal.enviarOrcamentoLoading = false;

                        $scope.fecharModal('reload');
                    } else {

                        mensagem = 'Erro ao enviar o email, por favor, tente novamente mais tarde.';
                        GeralFactory.notify('warning', 'Atenção!', mensagem);
                    }
                });

            } else {

                mensagem = 'Para efetuar a impressão é necessário escolher um orçamento na listagem.';
                GeralFactory.notify('warning', 'Atenção!', mensagem);

            }
        };

        /**
         * Método responsável em enviar um e-mail com os dados da venda ou compra num arquivo
         * anexado ao mesmo no formato PDF contendo a nota fiscal eletrônica.
         */
        $scope.enviarEmailNfe = function () {

            $scope.objModal.enviarOrcamentoLoading = false;

            if ($scope.objModal.venda.fin_nro_lan) {

                $scope.objModal.enviarOrcamentoLoading = true;
                $scope.v = {};
                $scope.v.fin_nro_lan = $scope.objModal.venda.fin_nro_lan;
                $scope.v.cto_email = $scope.objModal.venda.contato.cto_email;
                VendaService.nfe.enviarEmail($scope.v, function (retorno) {

                    GeralFactory.notify('success', '', 'E-mail enviado ao cliente');
                    $scope.fecharModal('reload');
                    $scope.objModal.enviarOrcamentoLoading = false;
                });
            }
        };

        /**
         * Método responsável em enviar um e-mail com os dados da venda ou compra num arquivo
         * anexado ao mesmo no formato PDF contendo a nota fiscal eletrônica.
         */
        $scope.enviarEmailCte = function () {

            $scope.objModal.enviarOrcamentoLoading = false;

            if ($scope.objModal.venda.fin_nro_lan) {

                $scope.objModal.enviarOrcamentoLoading = true;
                $scope.v = {};
                $scope.v.cte_fin_nro_lan = $scope.objModal.venda.fin_nro_lan;
                $scope.v.fin_doc_nro = $scope.objModal.venda.fin_doc_nro;
                $scope.v.cto_email = $scope.objModal.venda.contato.cto_email;
                TransporteService.cte.enviarEmail($scope.v, function (retorno) {

                    GeralFactory.notify('success', '', 'E-mail enviado ao tomador');
                    $scope.fecharModal('reload');
                    $scope.objModal.enviarOrcamentoLoading = false;
                });
            }
        };

        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);

angular.module('newApp').controller('VendaCceModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'GeralFactory', 'VendaService',

    function ($scope, $rootScope, $timeout, $uibModalInstance, GeralFactory, VendaService) {

        $scope.forms = {};
        $scope.objModal = {};
        $scope.cce = {};
        $scope.cce.obs_descricao = '';

        $uibModalInstance.opened.then(function () {

            $uibModalInstance.hasAlteracao = false;

            //var strFiltro = '?q=(str_obs:'+$scope.params.fin_nro_lan+'|1|'+$scope.params.obs_seq+')';

            var strFiltro = GeralFactory.formatarPesquisar({
                'str_obs': $scope.params.fin_nro_lan + '|1|' + $scope.params.obs_seq
            });

            if ($scope.params.obs_seq) {

                VendaService.vendaObs.get({fin_nro_lan: $scope.params.fin_nro_lan, u: strFiltro}, function (resposta) {

                    console.log('rra:', resposta);
                    $scope.cce = resposta.records;

                });
            }
        });

        /**
         */
        $scope.clicarBotaoModal = function (str) {

            $uibModalInstance.dismiss(str);
        };

        $scope.incluirCampo = function () {

            $scope.cce.obs_descricao = 'Corrigir campo ';
        };

        $scope.salvarCce = function () {

            $scope.salvarCceLoading = true;

            $scope.$watch('forms.fVendaCce', function (form) {

                if (form) {

                    if (form.$invalid) {

                        $scope.submitted = true;

                    } else {

                        $scope.cce.obs_tip = 1;
                        $scope.cce.obs_fin_nro_lan = $scope.params.fin_nro_lan;

                        // CASO ESTEJA AUTORIZADA, MANDA CRIAR UMA NOVA SEQ
                        if ($scope.cce.obs_cod_retorno == '135') {
                            delete($scope.cce.obs_seq);
                        }

                        // if ($scope.params.obs_seq) {
                        //     $scope.cce.obs_seq = $scope.params.obs_seq;
                        // }
                        console.log('cce: ', $scope.cce);

                        VendaService.vendasObs.create($scope.cce, function (resposta) {

                            console.log('resposta vale: ', resposta);
                            $scope.cce.obs_seq = resposta.records.obs_seq;
                            VendaService.nfe.enviarCce($scope.cce, function (r) {

                                console.log('r vale: ', r);
                                if (!r.records.error) {

                                    $uibModalInstance.dismiss('reload');
                                } else {
                                    GeralFactory.notify('danger', 'Erro!', r.records.msg);
                                }

                                $scope.salvarCceLoading = false;
                            });
                        });
                    }
                }
            });

        };

        /**
         * TODO ainda nao está implementado para utilizar o metodo abaixo
         */
        $scope.listarCamposCorrigir = function () {

            $scope.arrCamposCorrigir = GeralFactory.listarCamposCorrigir();
        };

        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('VendaDocRefModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'GeralFactory', 'VendaService',

    function ($scope, $rootScope, $timeout, $uibModalInstance, GeralFactory, VendaService) {

        $scope.forms = {};
        $scope.objModal = {};

        $scope.objModal.v = $scope.params.v;

        console.log('v: ', $scope.objModal.v);

        //$scope.params
        //$scope.cce = {};
        //$scope.cce.obs_descricao = '';

        $uibModalInstance.opened.then(function () {

            $uibModalInstance.hasAlteracao = false;

            //var strFiltro = '?q=(str_obs:'+$scope.params.fin_nro_lan+'|1|'+$scope.params.obs_seq+')';

            // var strFiltro = GeralFactory.formatarPesquisar({
            //     'str_obs' : $scope.params.fin_nro_lan+'|1|'+$scope.params.obs_seq
            // });
            //
            // if($scope.params.obs_seq) {
            //
            //     VendaService.vendaObs.get({fin_nro_lan:$scope.params.fin_nro_lan,u : strFiltro}, function(resposta) {
            //
            //         console.log('rra:',resposta);
            //         $scope.cce = resposta.records;
            //
            //     });
            // }
        });

        /**
         */
        $scope.clicarBotaoModal = function (str) {

            $uibModalInstance.dismiss(str);
        };


        $scope.salvarDocRef = function () {

            $scope.salvarDocRefLoading = true;

            $scope.$watch('forms.fVendaDocRef', function (form) {

                if (form) {

                    if (form.$invalid) {

                        $scope.submitted = true;

                    } else {

                        console.log('vvv:' ,$scope.objModal.v);
                        $uibModalInstance.v = $scope.objModal.v;

                        $scope.fecharModal('reload');

                    }
                }
            });

        };

        /**
         * TODO ainda nao está implementado para utilizar o metodo abaixo
         */
        $scope.listarCamposCorrigir = function () {

            $scope.arrCamposCorrigir = GeralFactory.listarCamposCorrigir();
        };

        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);

angular.module('newApp').controller('ConfirmaNfeCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'GeralFactory',

    function ($scope, $rootScope, $timeout, $uibModalInstance, GeralFactory) {

        $scope.forms = {};
        //$scope.objModal       = {};

        $uibModalInstance.opened.then(function () {

            // $scope.objModal.operacao        = $scope.params.operacao;
            // $scope.objModal.nroPedido       = $scope.params.nroPedido;
            // $scope.objModal.codRastreamento = $scope.params.rastreamento;

            $uibModalInstance.hasAlteracao = false;

        });

        /**
         */
        $scope.clicarBotaoModal = function (str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('VendaTipEspecificoCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', '$uibModal', 'GeralFactory', 'ProdutoService', 'VendaService', 'ParamsService', 'ImpostoFactory',

    function ($scope, $rootScope, $timeout, $uibModalInstance, $uibModal, GeralFactory, ProdutoService, VendaService, ParamsService, ImpostoFactory) {

        $scope.forms = {};
        $scope.empresa = {};
        $scope.objTela = {};
        $scope.produto = {};


        $uibModalInstance.opened.then(function () {

            console.log('to na VendaTipEspecificoCtrl');

            $scope.produto = $scope.params.produto;

            switch ($scope.produto.pro_tip_especifico) {

                case 1:
                    $scope.objTela.label = 'Veículos';
                    $scope.objTela.service = {
                        'name': 'veiculo',
                        'sequence': 'vei_seq',
                        'pro_cod_pro': 'vei_pro_cod_pro'
                    };
                    $scope.objTela.include = {
                        'list': 'venda/views/lista-veiculo.html'
                    };
                    break;

                case 2:
                    $scope.objTela.label = 'Medicamentos';
                    $scope.objTela.service = {
                        'name': 'lote',
                        'sequence': 'lot_seq',
                        'pro_cod_pro': 'lot_pro_cod_pro'
                    };
                    $scope.objTela.include = {
                        'list': 'venda/views/lista-medicamento.html'
                    };
                    break;
            }


            $scope.params = {
                'pro_cod_pro': $scope.produto.pro_cod_pro,
                'pro_tip_especifico': $scope.produto.pro_tip_especifico
            };

            console.log('produto3:', $scope.produto);

            var strFiltro = GeralFactory.formatarPesquisar($scope.params);

            ProdutoService.tiposEspecificos.get({u: strFiltro, tipo: $scope.objTela.service.name}, function (retorno) {
                if (retorno.records.length > 0) {

                    $timeout(function () {
                        $scope.arrTipoProduto = retorno.records;
                        console.log('arrTipoProduto:', $scope.arrTipoProduto);

                    });
                }
            });

        });

        $scope.getTipoProduto = function (cod) {

            $uibModalInstance.codTipProduto = cod;
            $scope.fecharModal('reload');
        };

        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };

    }
]);


angular.module('newApp').controller('VendaParcelaModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'ParamsService', 'GeralFactory',

    function ($scope, $rootScope, $timeout, $uibModalInstance, ParamsService, GeralFactory) {

        $scope.forms = {};
        $scope.formaPgto = {};
        $scope.contaFinan = {};
        $scope.objParcela = {};
        $scope.vlrUntilParcela = 0;
        $scope.vlrIndiceParcela = 0;

        $uibModalInstance.opened.then(function () {

            $scope.objParcela = $scope.params.objParcela;
            $scope.vlrIndiceParcela = $scope.params.vlrIndiceParcela;

            console.log('Parcela selecionada: ', $scope.objParcela);
            console.log('Indice da parcela: ', $scope.vlrIndiceParcela);

            $uibModalInstance.hasAlteracao = false;
            if ($scope.objParcela.tit_6060_forma_pagamento) {

                // Verifica se a parcela tem alguma forma de pagamento vinculada:
                $scope.formaPgto.descricao = $scope.objParcela.tit_6060_desc_forma_pgto;
            }

            if ($scope.objParcela.tit_5010_conta_fin) {

                // Verifica se a parcela tem alguma conta financeira vinculada:
                $scope.contaFinan.descricao = $scope.objParcela.tit_5010_desc_conta_fin;
            }
        });

        /**
         * Método responsável pela seleção dos dados de uma determinada forma de pagamento
         * pelo componente de autocomplete contido na janela modal.
         */
        $scope.onSelectFormaPagamentoModal = function ($item) {

            $scope.getFormaPagamento($item.par_pai);
            $scope.formaPgto.descricao = $item.par_c01;
        };

        /**
         * Método responsável em adicionar uma determinada forma de pagamento diretamente pelo
         * componente de autocomplete contido na janela modal.
         */
        $scope.addFormaPagamentoModal = function ($item) {

            var objFormaPagamento = {
                par_c01: $item.trim()
            };

            ParamsService.formaPagamentos.create(objFormaPagamento, function (retorno) {
                if (!retorno.records.error) {

                    $scope.formaPgto.descricao = $item.trim();
                    $scope.objParcela.tit_6060_forma_pagamento = retorno.records.par_pai;
                    $scope.getFormaPagamento();
                }
            });
        };

        /**
         * Obtém os dados de uma determinada forma de pagamento.
         */
        $scope.getFormaPagamento = function (par_pai) {

            if (par_pai) {

                ParamsService.formaPagamento.get({par_pai: par_pai}, function (data) {
                    $scope.formaPagamento = data.records;
                    $scope.objParcela.tit_6060_forma_pagamento = par_pai;
                });
            } else {

                ParamsService.formaPagamentos.get({u: ''}, function (resposta) {
                    $scope.arrFormasPagamento = resposta.records;
                });
            }
        };

        /**
         * Método responsável pela seleção dos dados de uma determinada conta financeira
         * pelo componente de autocomplete contido na janela modal.
         */
        $scope.onSelectContaFinanceiraModal = function ($item) {

            $scope.getContaFinanceira($item.par_pai);
            $scope.contaFinan.descricao = $item.par_c01;
        };

        /**
         * Método responsável em adicionar uma determinada conta financeria diretamente pelo
         * componente de autocomplete contido na janela modal.
         */
        $scope.addContaFinanceiraModal = function ($item) {

            var objContaFinanceira = {
                par_c01: $item.trim()
            };

            ParamsService.contaFinanceiras.create(objContaFinanceira, function (retorno) {
                if (!retorno.records.error) {

                    $scope.contaFinan.descricao = $item.trim();
                    $scope.objParcela.tit_5010_conta_fin = retorno.records.par_pai;
                    $scope.getContaFinanceira();
                }
            });
        };

        /**
         * Obtém dados de uma determinada conta financeira.
         */
        $scope.getContaFinanceira = function (par_pai) {

            if (par_pai) {

                ParamsService.contaFinanceira.get({par_pai: par_pai}, function (data) {
                    $scope.contaFinanceira = data.records;
                    $scope.objParcela.tit_5010_conta_fin = par_pai;
                });
            } else {

                ParamsService.contaFinanceiras.get({u: ''}, function (resposta) {
                    $scope.arrContasFinan = resposta.records;
                });
            }
        };

        /**
         * Método responsável em editar os dados de uma determinada parcela e logo
         * em seguida atualizar os valores no objeto de parcelas da tela pai.
         */
        $scope.salvarParcela = function () {

            $scope.salvarParcelaLoading = true;

            var validar = $scope.validar();
            if (validar['error']) {

                GeralFactory.notify('danger', 'Atenção:', validar['msg']);
                $scope.salvarParcelaLoading = false;

            } else {

                $scope.$watch('forms.formParcela', function (form) {
                    if (form) {

                        if (form.$invalid) {

                            $scope.submitted = true;
                            $scope.salvarParcelaLoading = false;

                        } else {

                            $scope.setParcela();

                            // Fechando a janela modal para alterar os dados da parcela escohida:
                            $scope.salvarParcelaLoading = false;
                            $timeout(function () {

                                $scope.objParcela.tit_6060_desc_forma_pgto = ($scope.formaPgto.descricao) ? $scope.formaPgto.descricao : '';
                                $scope.objParcela.tit_5010_desc_conta_fin = ($scope.contaFinan.descricao) ? $scope.contaFinan.descricao : '';

                                $uibModalInstance.hasAlteracao = true;
                                $uibModalInstance.objParcelaNova = $scope.objParcela;
                                $uibModalInstance.vlrUntilParcela = $scope.vlrUntilParcela;
                                $scope.fecharModal('cancel');

                            }, 500);
                        }
                    }
                });
            }
        };

        /**
         * Altera os valor da parcela escolhida no vetor de parcelas auxiliar que ajuda no
         * cálculo do rateio das demais parcelas da venda.
         */
        $scope.setParcela = function () {

            var keepGoing = true;
            angular.forEach($scope.params.objVendaParcelas, function (item, chave) {

                if (keepGoing) {
                    if (item.tit_fatura_seq === $scope.objParcela.tit_fatura_seq) {

                        $scope.params.objVendaParcelas[chave].tit_doc_vlr_liquido = $scope.objParcela.tit_doc_vlr_liquido;
                        keepGoing = false;
                    }
                }
            });
        };

        /**
         * Método responsável em validar os dados do formulário de pagamento parcial de
         * um determinado título, valida datas e valores.
         */
        $scope.validar = function () {

            var vlrQuitado = parseFloat($scope.objParcela.tit_doc_vlr_liquido);
            if (vlrQuitado <= 0) {
                var mensagem = 'Caro usuário, o valor não pode ser menor ou igual a 0!';
                return {
                    'error': true,
                    'msg': mensagem
                };
            }

            if (vlrQuitado > $scope.params.vlrLiquidoVenda) {
                var mensagem = 'Caro usuário, o valor da parcela não pode ser maior do que o valor total da venda!';
                return {
                    'error': true,
                    'msg': mensagem
                };
            }

            var qtdeParcelas = $scope.params.objVendaParcelas.length;
            if (qtdeParcelas === $scope.vlrIndiceParcela) {

                var vlrUltimaParcela = parseFloat($scope.params.objVendaParcelas[qtdeParcelas - 1].tit_doc_vlr_liquido);
                if (vlrQuitado !== vlrUltimaParcela) {

                    var mensagem = 'Caro usuário, não se pode alterar o valor líquido da última parcela da recorrência!';
                    return {
                        'error': true,
                        'msg': mensagem
                    };
                }
            }

            var dtVencimento = $scope.objParcela.tit_dat_vct.split('/');
            dtVencimento = new Date(dtVencimento[2], dtVencimento[1] - 1, dtVencimento[0]);

            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() - 1);

            if (dtVencimento < tomorrow) {
                var mensagem = 'Caro usuário, a data de vencimento não pode ser menor que a data atual!';
                return {
                    'error': true,
                    'msg': mensagem
                };
            }

            var vlrTotalUntilParcela = 0;
            angular.forEach($scope.params.objVendaParcelas, function (item) {

                if (item.tit_fatura_seq < $scope.objParcela.tit_fatura_seq) {

                    var vlrParcela = parseFloat(item.tit_doc_vlr_liquido);
                    vlrTotalUntilParcela = vlrTotalUntilParcela + vlrParcela;
                }
            });

            vlrTotalUntilParcela = vlrTotalUntilParcela + vlrQuitado;

            $scope.vlrUntilParcela = vlrTotalUntilParcela;
            console.log('Valor total até a parcela: ', vlrTotalUntilParcela);

            if (vlrTotalUntilParcela > $scope.params.vlrLiquidoVenda) {
                var mensagem = 'O valor de rateio das demais parcelas não pode ser maior que o valor total da venda!';
                return {
                    'error': true,
                    'msg': mensagem
                };
            }

            return {'error': false};
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('VendaTransporteModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModal', '$uibModalInstance', 'GeralFactory', 'VendaService', 'ClienteService', 'EndGeralService',

    function ($scope, $rootScope, $timeout, $uibModal, $uibModalInstance, GeralFactory, VendaService, ClienteService, EndGeralService) {

        $scope.forms = {};
        $scope.objTransporte = {};

        $uibModalInstance.opened.then(function () {

            $uibModalInstance.hasAlteracao = false;

            $scope.objVenda = $scope.params.objVenda;

            $scope.objTransporte = (_.isEmpty($scope.params.objVenda.transporte)) ? {} : $scope.params.objVenda.transporte;

            ($scope.objVenda.fin_2070_cod_transp) ? $scope.getTransportadora($scope.objVenda.fin_2070_cod_transp) : '';

            $scope.listarModFrete();
            $scope.objFiltroTransportadora = {
                'cad_tip_cli_for' : '3'
            };

            if (! $scope.objVenda.fin_2070_cod_transp) {

                $scope.objVenda.transportadoraSelect = '';
            }
        });

        /**
         * Lista as modalidades de frete existentes.
         */
        $scope.listarModFrete = function () {

            $scope.arrModFrete = GeralFactory.listarModFrete();

            EndGeralService.ufs.get({}, function (retorno) {
                $scope.arrUF = retorno.records;
            });
        };

        $scope.limparCamposTransporte = function () {

            $scope.listarModFrete();

            $scope.objTransporte                 = {};
            $scope.transportadora                = {};
            $scope.params.objVenda.transporte    = {};
            $scope.objVenda.transportadoraSelect = '';
            $scope.objVenda.fin_2070_cod_transp  = 0;
            $scope.objVenda.fin_mod_frete        = 9;
        };

        /**
         * Método responsável em salvar os dados de um determinado transporte
         */
        $scope.salvarTransporte = function () {

            $scope.salvarTransporteLoading = true;
            if ($scope.objVenda.fin_mod_frete == 2) {

                $scope.$watch('forms.formsTransporte', function(form) {
                    if (form) {
                        if (form.$invalid) {

                            $scope.submitted = true;
                            $scope.salvarTransporteLoading = false;

                        } else {

                            var codTransportadora = parseInt($scope.objVenda.fin_2070_cod_transp);
                            if (codTransportadora) {

                                $scope.setTransporte();

                            } else {

                                GeralFactory.notify('danger', 'Atenção:', 'Caro usuário, escolha uma transportadora!');
                                $scope.salvarTransporteLoading = false;
                            }
                        }
                    }
                });
            } else {

                $scope.setTransporte();
            }
        };

        /**
         * Seta o transporte e fecha a modal e logo
         * em seguida atualizar os valores no objeto transporte na tela pai.
         */
        $scope.setTransporte = function () {

            var placa = ($scope.objTransporte.tpt_veic_placa) ? $scope.objTransporte.tpt_veic_placa.toUpperCase() : '';
            $scope.objTransporte.tpt_veic_placa = placa;

            if (placa && !placa.match(/[A-Z]{3}[0-9]{4}$/)) {

                GeralFactory.notify('danger', 'Atenção:', 'A placa está no formato inválido!');
                $scope.salvarTransporteLoading = false;

            } else {

                $uibModalInstance.hasAlteracao = true;
                $timeout(function() {

                    console.log('Transporte: ', $scope.objTransporte);

                    $scope.salvarTransporteLoading = false;
                    $uibModalInstance.objTransporte = $scope.objTransporte;
                    $scope.fecharModal('cancel');

                }, 2000);
            }
        };

        /**
         * Obtém dados de uma determinada transportadora.
         */
        $scope.getTransportadora = function (cad_cod_cad) {
            if (cad_cod_cad) {

                ClienteService.cliente.get({cad_cod_cad: cad_cod_cad}, function (retorno) {
                    if (!retorno.records.error) {

                        $scope.transportadora = retorno.records;
                        $scope.objVenda.transportadoraSelect = retorno.records.cad_nome_razao;
                        $scope.objVenda.fin_2070_cod_transp = cad_cod_cad;
                    }
                });
            }
        };

        /**
         * Método responsável pela seleção dos dados de uma determinada transportadora
         * pelo componente de autocomplete contido na tela.
         */
        $scope.onSelectTransportadora = function ($item) {

            $scope.getTransportadora($item.cad_cod_cad);
            $scope.objVenda.transportadoraSelect = $item.cad_nome_razao;
        };

        /**
         * Método responsável em adicionar uma determinada transportadora diretamente pelo
         * componente de autocomplete contido na tela.
         */
        $scope.addTransportadora = function ($item) {

            var objTransportadora = {
                'cad_pf_pj': 2,
                'cad_eh_inativo': 0,
                'cad_tip_cli_for': 3,
                'cad_nome_razao': $item.trim()
            };

            ClienteService.clientes.create(objTransportadora, function (retorno) {
                if (!retorno.records.error) {

                    $scope.objVenda.transportadoraSelect = $item.trim();
                    $scope.objVenda.fin_2070_cod_transp = retorno.records.cad_cod_cad;
                }
            });
        };

        /**
         * Método responsável em abrir a janela modal para edição dos dados de uma determinada
         * transportadora escolhida pelo usuário da aplicação.
         */
        $scope.getJanelaEdicaoTransporte = function (fin_2070_cod_transp) {

            if (fin_2070_cod_transp) {

                var scope = $rootScope.$new();
                scope.params = {};

                scope.params.str_titular = 'Transportadora';
                scope.params.cad_cod_cad = fin_2070_cod_transp;

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'cliente/views/janela-cliente.html',
                    controller: 'ClienteModalCtrl',
                    size: 'lg',
                    windowClass: 'center-modal no-top-modal',
                    scope: scope,
                    resolve: {}
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {
                    if (msg === 'cancel') {
                        if (modalInstance.hasAlteracao) {

                            scope.$destroy();
                            $scope.getTransportadora(fin_2070_cod_transp);
                        }
                    }
                });
            }
        };

        /**
         * Método responsável em remover um determinado item da venda.
         */
        $scope.cancelarTransporte = function ($index) {

            GeralFactory.confirmar('Deseja remover o transporte escolhido?', function () {

                $scope.limparCamposTransporte();

                VendaService.venda.cancelarTransporte({fin_nro_lan: $scope.objVenda.fin_nro_lan}, function (data) {

                    $uibModalInstance.acaoEscolhida = 'cancelar';
                    $uibModalInstance.hasAlteracao = true;
                    $uibModalInstance.itemDelIndex = $index;

                    $timeout(function () {
                        $uibModalInstance.dismiss('reload');
                    }, 1000);
                });
            });
        };

        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function (str) {

            // Comentado para testes
            // if (str === 'reload') {
            //     $scope.objTransporte = {};
            //     $scope.objVenda.transporte = {};
            //     $scope.objVenda.fin_mod_frete = 9;
            //     $scope.objVenda.fin_2070_cod_transp = 0;
            //     $scope.objVenda.transportadoraSelect = '';
            // }

            $timeout(function () {
                $uibModalInstance.dismiss(str);
            }, 200);
        };
    }
]);


angular.module('newApp').controller('VendaRelatorioModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$window', '$uibModalInstance', 'GeralFactory',

    function ($scope, $rootScope, $timeout, $window, $uibModalInstance, GeralFactory) {

        $scope.forms = {};
        $scope.objFiltro = {};
        $scope.tpRelatorio = null;


        $uibModalInstance.opened.then(function () {

            $scope.objFiltro = $scope.params.objFiltro;
        });


        /**
         * Método responsável em gerar o relatório de operações de acordo com
         * o tipo escolhido pelo usuário (Sintético ou Analítico).
         */
        $scope.gerarRelatorio = function () {

            $scope.imprimirRelatorioLoading = true;

            console.log($scope.tpRelatorio);
            if ($scope.tpRelatorio) {

                $scope.objFiltro['type'] = $scope.tpRelatorio;

                // if ($scope.objFiltro.cod_natureza !== 31)
                //    $scope.objFiltro['arr_situacoes'] = $scope.objFiltro['arr_situacoes'] ? $scope.objFiltro['arr_situacoes'] : '90';

                if ($scope.objFiltro.hasOwnProperty('vendedor')) {
                    $scope.objFiltro['fin_vendedor'] = $scope.objFiltro['vendedor'];
                }

                var strFiltro = GeralFactory.formatarPesquisar($scope.objFiltro);
                if ($scope.objFiltro) {

                    var url = GeralFactory.getUrlApi() + '/erp/export/operacao/?' + strFiltro;
                    $window.open(url, 'Relatório');

                    $timeout(function () {

                        $scope.imprimirRelatorioLoading = false;
                        $scope.fecharModal('cancel');

                    }, 2000);
                }

            } else {

                GeralFactory.notify('danger', 'Atenção:', 'Caro usuário, escolha ao menos uma opção para gerar o relatório!');
                $scope.imprimirRelatorioLoading = false;
            }
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('VendaImportaXMLModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$window', '$modalInstance', '$uibModalInstance', 'GeralFactory', 'MidiaService', '$uibModal',

    function ($scope, $rootScope, $timeout, $window, $modalInstance, $uibModalInstance, GeralFactory, MidiaService, $uibModal) {

        $scope.objXml = {};

        $uibModalInstance.opened.then(function () {

            $uibModalInstance.notaImportada = false;

            $scope.objXml = $scope.params;
            $scope.objXml.tipo_emissao = 'T';
            $scope.importaxmlLoading = false;

            if ($scope.objXml.codNatureza == 1) {

                $scope.objXml.tipo_emissao = 'P';
            }

            //console.log('$scope.objXml', $scope.objXml);
        });

        /**
         * Método responsável por ler o arquivo e chamar os dados para a tela
         * @param file
         */
        $scope.importaArquivo = function (file) {

            $scope.importaxmlLoading = true;

            $scope.$watch('forms.formsImportaXML', function (form) {
                    if (form) {
                        if (form.$invalid) {

                            $scope.submitted = true;
                            $scope.importaxmlLoading = false;

                        } else {

                            var arrData = {};

                            arrData = {

                                'tipo_emissao': $scope.objXml.tipo_emissao,
                                'natureza': $scope.objXml.codNatureza
                            };

                            //console.log('arrData', arrData);

                            MidiaService.migracao(file, 'importa-xml-nfe', arrData, function (data) {

                                //console.log('data', data);

                                if (!data.records.error) {

                                    //QUANDO IMPORTAÇÃO DE NOTA, TRATA O RETORNO DOS DADOS
                                    GeralFactory.notify('success', data.records.title, data.records.msg);

                                    if (data.records.emitente.notFound) {

                                        GeralFactory.notify('danger', 'Erro!', data.records.emitente.msg);
                                    }

                                    if (data.records.destinatario.notFound) {

                                        GeralFactory.notify('danger', 'Erro!', data.records.destinatario.msg);
                                    }

                                    angular.forEach(data.records.itens, function (item, chave) {

                                        if (item.prod.notFound) {

                                            GeralFactory.notify('danger', 'Erro!', item.prod.msg);
                                        }
                                    });

                                    var scope = $rootScope.$new();
                                    scope.params = data.records;

                                    var modalInstance = $uibModal.open({
                                        animation: true,
                                        templateUrl: 'venda/views/janela-visualiza-xml.html',
                                        controller: 'VendaImportaNFeModalCtrl',
                                        scope: scope,
                                        size: 'lg',
                                        windowClass: 'center-modal no-top-modal',
                                        resolve: {
                                            getEnd: function () {
                                            }
                                        }
                                    });

                                    $scope.importaxmlLoading = false;

                                    modalInstance.result.then(function (id) {
                                    }, function (msg) {

                                        $uibModalInstance.notaImportada = modalInstance.notaImportada;

                                        if ($uibModalInstance.notaImportada) {

                                            $scope.fecharModal();
                                        }
                                    });

                                } else {

                                    GeralFactory.notify('danger', data.records.title, data.records.msg);
                                    $scope.importaxmlLoading = false;
                                }
                            });
                        }
                    }
                }
            )
        };

        $scope.fecharModal = function (str) {

            $modalInstance.dismiss(str);
        };
    }
]);

angular.module('newApp').controller('VendaImportaNFeModalCtrl', [

    '$scope', '$modalInstance', 'VendaService', 'GeralFactory', '$timeout', '$rootScope', '$uibModal', '$interval', 'ParamsService', 'MidiaService', '$uibModalInstance', 'ClienteService', 'EmpresaService',

    function ($scope, $modalInstance, VendaService, GeralFactory, $timeout, $rootScope, $uibModal, $interval, ParamsService, MidiaService, $uibModalInstance, ClienteService, EmpresaService) {

        $scope.objImportaNFe = $scope.params;
        $scope.disableBtnImportar = true;
        $scope.importaNFeLoading = false;
        $scope.objImportaNFe.fin_cfo_cfop = 1102;
        $scope.eh_conversao_ativo = 0;

        //GERA UM BACKUP DO OBJETO DA NOTA FISCAL PARA SER USADO EM COMPARAÇÕES AO LONGO DA VALIDAÇÃO DOS DADOS DA NOTA
        $scope.objImportaNFe.itensBKP = angular.copy($scope.objImportaNFe.itens);

        $uibModalInstance.opened.then(function () {

            $uibModalInstance.notaImportada = false;

            console.log('objImportacaoNFe', $scope.objImportaNFe);

            $scope.getEmpresa(function(){
                $scope.getDadosEmitDest()
            });

            $scope.setCliFor();
            $scope.listaCFOP();
            $scope.validaTelaImportacao();

            $interval(function () {

                $scope.validaTelaImportacao();
            }, 50000);

            $scope.listaUnidades = GeralFactory.listarUnidades();

            if ($scope.objImportaNFe.transporte.transporta) {

                $scope.verificaCadastroTransportadora();
            }

        });

        /**
         * Busca os dados do emitente e do destinatário
         * Persistidos no banco de dados.
         */
        $scope.getDadosEmitDest = function () {

            // É nota de terceiros e o fornecedor já possui cadastro:
            if($scope.objImportaNFe.dados_importacao.tipo_emissao == 'T') {

                if($scope.objImportaNFe.emitente.cad_cod_cad) {

                    var strFiltro = 'q=(cad_cod_cad:' + $scope.objImportaNFe.emitente.cad_cod_cad + ')';

                    ClienteService.clientes.get({u: strFiltro}, function (retorno) {

                        if(!retorno.records.error) {
                            $scope.objImportaNFe.emitente.xFant = retorno.records[0].cad_apelido_fantasia.trim();
                            $scope.objImportaNFe.emitente.xNome = retorno.records[0].cad_nome_razao.trim();
                            $scope.objImportaNFe.emitente.CNPJ  = retorno.records[0].cad_cpf_cnpj.trim();
                            $scope.objImportaNFe.emitente.IE    = retorno.records[0].cad_rg_iest.trim();
                        }
                    });
                }

                if($scope.empresa) {

                    //console.log('$scope.empresa', $scope.empresa);

                    $scope.objImportaNFe.destinatario.xNome = $scope.empresa.emp_nome_razao.trim();
                    $scope.objImportaNFe.destinatario.CNPJ  = $scope.empresa.emp_cpf_cnpj.trim();
                    $scope.objImportaNFe.destinatario.IE    = $scope.empresa.emp_rg_iest.trim();
                }

            }
        };

        /**
         * Busca os dados da empresa
         * @param func
         */
        $scope.getEmpresa = function(func) {

            EmpresaService.empresa.get({emp_cod_emp : '1'}, function(data) {
                $scope.empresa = data.records;

                //console.log('$scope.empresa', $scope.empresa)

                if(func) {
                    func.call();
                }
            });
        };

        /**
         * verifica se tem a transportadora cadastrada
         */
        $scope.verificaCadastroTransportadora = function () {

            var strFiltro = 'q=(cad_tip_cli_for:3,cad_cpf_cnpj:' + $scope.objImportaNFe.transporte.transporta.CNPJ + ')';

            //console.log('pesquisando transportadora', strFiltro);

            ClienteService.clientes.get({u: strFiltro}, function (retorno) {

                //console.log('pesquisando transportadora retorno', retorno);

                if (!retorno.records.error) {

                    if (retorno.records.length > 0) {

                        $scope.objImportaNFe.transporte.transporta.fin_2070_cod_transp = retorno.records[0].cad_cod_cad;

                        // //console.log('$scope.objImportaNFe.transporte', $scope.objImportaNFe.transporte);

                    } else {

                        GeralFactory.confirmar('Transportadora ' + $scope.objImportaNFe.transporte.transporta.xNome + ' não cadastrada, deseja cadastrar?', function () {

                            $scope.addTransportadora();
                        }, null, null, 'Não');
                    }
                }
            });
        };

        /**
         * Cadastra a transportadora
         */
        $scope.addTransportadora = function () {

            var objTransportadora = {
                'cad_pf_pj': $scope.objImportaNFe.transporte.transporta.CNPJ ? 2 : 1,
                'cad_cpf_cnpj': $scope.objImportaNFe.transporte.transporta.CNPJ ? $scope.objImportaNFe.transporte.transporta.CNPJ : $scope.objImportaNFe.transporte.transporta.CPF,
                'cad_rg_iest': $scope.objImportaNFe.transporte.transporta.IE ? $scope.objImportaNFe.transporte.transporta.IE : null,
                'cad_eh_inativo': 0,
                'cad_tip_cli_for': 3,
                'cad_nome_razao': $scope.objImportaNFe.transporte.transporta.xNome,
                'endereco': {

                    'end_endereco': $scope.objImportaNFe.transporte.transporta.xEnder,
                    'end_endereco_uf': '0#' + (($scope.objImportaNFe.transporte.transporta.UF) ? $scope.objImportaNFe.transporte.transporta.UF : '0'),
                    'end_endereco_cidade': '0#' + (($scope.objImportaNFe.transporte.transporta.xMun) ? $scope.objImportaNFe.transporte.transporta.xMun : '0')
                }
            };

            //console.log('cadastrando transportadora', objTransportadora);

            ClienteService.clientes.create(objTransportadora, function (retorno) {

                //console.log('cadastrando transportadora retorno', retorno);

                if (!retorno.records.error) {

                    $scope.objImportaNFe.transporte.transporta.fin_2070_cod_transp = retorno.records.cad_cod_cad;
                }
            });

            //console.log('$scope.objImportaNFe.transporte', $scope.objImportaNFe.transporte);

        };

        $scope.setCliFor = function () {

            if ($scope.objImportaNFe.destinatario.notFound) {

                $scope.objImportaNFe.destinatario.cad_cli_for = 2;
            }

            if ($scope.objImportaNFe.emitente.notFound) {

                $scope.objImportaNFe.emitente.cad_cli_for = 2;
            }
        };

        $scope.listaCFOP = function () {

            var ehFordaEstado = 0;

            if ($scope.objImportaNFe.emitente.enderEmit.UF != $scope.objImportaNFe.destinatario.enderDest.UF) {

                ehFordaEstado = 1;
            }

            var objCfop = {
                'cfo_6020_natureza': $scope.objImportaNFe.dados_importacao.natureza,
                'cfo_eh_fora_estado': ehFordaEstado
            };

            var strCfop = GeralFactory.formatarPesquisar(objCfop);
            ParamsService.cfops.get({u: strCfop}, function (resposta) {
                // //console.log('CFOP:',resposta);
                $scope.listaCfo = resposta.records;

                //seta o CFOP para o padrão da natureza escolhida
                if ($scope.listaCfo) {

                    var strCod = '1|6020|'+$scope.objImportaNFe.dados_importacao.natureza+'||';

                    //obtem a descriçao e codigo do cfop padrao. Cada empresa pode ter o seu padrao
                    ParamsService.getParametro(strCod, function (data) {

                        if (data) {
                            $scope.paramPadrao = data;
                            if (data.par_i01) {
                                $scope.objImportaNFe.fin_cfo_cfop = ($scope.objImportaNFe.emitente.enderEmit.UF == $scope.empresa.emp_uf) ? data.par_i01 : data.par_i02;
                                $scope.alterarCfop = true;
                            }
                        }
                    });

                    // if ($scope.objImportaNFe.dados_importacao.natureza == 1) {
                    //
                    //     $scope.objImportaNFe.fin_cfo_cfop = $scope.listaCfo[4].cfo_cfop;
                    //
                    // } else if ($scope.objImportaNFe.dados_importacao.natureza == 2) {
                    //
                    //     $scope.objImportaNFe.fin_cfo_cfop = $scope.listaCfo[1].cfo_cfop;
                    //
                    // } else {
                    //
                    //     $scope.objImportaNFe.fin_cfo_cfop = $scope.listaCfo[0].cfo_cfop;
                    // }
                }
            });
        };

        $scope.validaTelaImportacao = function () {

            var aux = true;

            angular.forEach($scope.objImportaNFe.itens, function (item, chave) {

                if (aux) {

                    if (item.prod.notFound) {

                        aux = false;
                    } else {

                        aux = true;
                    }
                }
            });

            if (aux) {

                if ($scope.objImportaNFe.emitente.notFound) {

                    aux = false;
                } else {

                    aux = true;
                }
            }

            if (aux) {

                if ($scope.objImportaNFe.destinatario.notFound) {

                    aux = false;
                } else {

                    aux = true;
                }
            }

            $scope.importar = aux;
        };

        /**
         * Formata data e hora do padrão da NF-e para o padrão BR
         * @param dataNFe
         * @returns {*}
         */
        $scope.dataNFeToBR = function (dataNFe) {

            var horaNfe = [];

            if (dataNFe) {
                var arrData, arrDataHora;
                if (dataNFe.length > 12) {

                    arrDataHora = dataNFe.split('T');
                    dataNFe = arrDataHora[0];
                    horaNfe = arrDataHora[1]
                }

                horaNfe = horaNfe.split('-');
                arrData = dataNFe.split('-');

                return arrData[2] + '/' + arrData[1] + '/' + arrData[0];
            }

            return '';
        };

        /**
         * Seta a classe para a linha da tabela de acordo com o status do produto
         * @param item
         * @returns {*}
         */
        $scope.statusItemClass = function (item) {

            if (item.notFound) {

                return 'warning';
            }

            return 'default';
        };

        /**
         * Converte um valor com ponto (float) para um valor com vírgula ex: 1.5 / 1,5
         * @param nro
         * @returns {*}
         */
        $scope.toFloat = function (nro) {

            var aux = 0.00;

            aux = parseFloat(nro);
            aux = aux.toFixed(2);

            return aux;
        };

        /**
         * Converte uma data padrão americano para padrão BR
         * @param data
         * @returns {*|string}
         */
        $scope.dataBr = function (data) {

            return GeralFactory.formatarDataBr(data);
        };

        /**
         * Monta o objeto pessoa para o cadastro, está apenas para o cadastro de emitente
         * @param pessoa
         * @param cliFor
         */
        $scope.getObjPessoa = function (pessoa) {

            var objPessoa = {};

            if (pessoa.CNPJ && pessoa.CNPJ != '') {

                objPessoa.cad_cpf_cnpj = pessoa.CNPJ;
                objPessoa.cad_pf_pj = 2;

            } else if (pessoa.CPF && pessoa.CPF != '') {

                objPessoa.cad_cpf_cnpj = pessoa.CPF;
                objPessoa.cad_pf_pj = 1;
            }

            objPessoa.cad_apelido_fantasia = pessoa.xFant;
            objPessoa.cad_nome_razao = pessoa.xNome;
            objPessoa.cad_end_cod_end_ent_padrao = 1;
            objPessoa.cad_eh_inativo = 0;
            objPessoa.eh_contribuinte = 0;
            objPessoa.cad_rg_iest = pessoa.IE;
            objPessoa.cad_arquivo_foto = null;
            objPessoa.imagem_atual = null;

            if (objPessoa.cad_rg_iest != '') {

                objPessoa.eh_contribuinte = 1;
            }

            if (pessoa.enderEmit) {

                objPessoa.cad_tip_cli_for = $scope.objImportaNFe.emitente.cad_cli_for;

                objPessoa.endereco = {

                    end_cep: pessoa.enderEmit.CEP,
                    end_endereco: pessoa.enderEmit.xLgr,
                    end_endereco_bairro: pessoa.enderEmit.xBairro,
                    end_endereco_cidade: pessoa.enderEmit.xMun,
                    end_endereco_uf: pessoa.enderEmit.UF,
                    end_endereco_nro: pessoa.enderEmit.nro,
                    end_cod_ibge: pessoa.enderEmit.cMun,
                    end_seq_end: 1,
                    end_tip_end: 0,
                    end_eh_exterior: 0,
                    end_cod_pais: 1058
                };

                objPessoa.contato = {

                    cto_cod_cto: 1,
                    cto_fone: pessoa.enderEmit.fone,
                    cto_email: pessoa.email ? pessoa.email : null
                };
            } else {

                objPessoa.cad_tip_cli_for = $scope.objImportaNFe.destinatario.cad_cli_for;

                objPessoa.endereco = {

                    end_cep: pessoa.enderDest.CEP,
                    end_endereco: pessoa.enderDest.xLgr,
                    end_endereco_bairro: pessoa.enderDest.xBairro,
                    end_endereco_cidade: pessoa.enderDest.xMun,
                    end_endereco_uf: pessoa.enderDest.UF,
                    end_endereco_nro: pessoa.enderDest.nro,
                    end_cod_ibge: pessoa.enderDest.cMun,
                    end_seq_end: 1,
                    end_tip_end: 0
                };

                objPessoa.contato = {

                    cto_cod_cto: 1,
                    cto_fone: pessoa.enderDest.fone,
                    cto_email: pessoa.email ? pessoa.email : null
                };
            }

            //console.log('objPessoa', objPessoa);

            if (objPessoa) {

                $scope.getJanelaPessoa(objPessoa);
            }
        };

        /**
         * Abre a tela com os dados da pessoa não cadastrada
         * @param objPessoa
         */
        $scope.getJanelaPessoa = function (objPessoa) {

            var scope = $rootScope.$new();
            scope.params = objPessoa;
            scope.params.importandoNFe = true;

            //console.log('getJanelaPessoa', scope.params);

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'cliente/views/janela-cliente.html',
                controller: 'ClienteModalCtrl',
                size: 'lg',
                windowClass: 'center-modal no-top-modal',
                scope: scope,
                resolve: {
                    getEnd: function () {
                    }
                }
            });

            modalInstance.result.then(function (id) {
            }, function (msg) {

                // //console.log('modalInstance', modalInstance);

                // //console.log('$scope.objImportaNFe.dados_importacao.tipo_emissao', $scope.objImportaNFe.dados_importacao.tipo_emissao);

                $timeout(function () {

                    if (modalInstance.cad_cod_cad != undefined) {

                        // //console.log('modalInstance.cad_cod_cad', modalInstance.cad_cod_cad);

                        if ($scope.objImportaNFe.dados_importacao.tipo_emissao == 'P') {

                            // //console.log('seta destinatario', modalInstance.cad_cod_cad);

                            $scope.objImportaNFe.destinatario.cad_cod_cad = modalInstance.cad_cod_cad;
                            $scope.objImportaNFe.destinatario.notFound = false;
                        } else {

                            // //console.log('seta emite', modalInstance.cad_cod_cad);

                            $scope.objImportaNFe.emitente.cad_cod_cad = modalInstance.cad_cod_cad;
                            $scope.objImportaNFe.emitente.notFound = false;
                        }

                    }
                }, 500);

                $timeout(function () {

                    $scope.validaTelaImportacao();
                }, 1500);

            });
        };

        /**
         * Monta o objeto do produto para o cadastro.
         * @param produto
         */
        $scope.getObjProduto = function (produto) {

            //console.log('produ', produto);

            var objProduto = {};
            objProduto = {

                pro_cod_ori         : produto.prod.cProd,
                pro_descricao       : produto.prod.xProd.substring(0, 80),
                pro_descricao_longa : produto.prod.xProd,
                pro_unidade         : produto.prod.uCom,
                pro_ncm             : (produto.prod.NCM)  ? produto.prod.NCM  : null,
                pro_cest            : (produto.prod.CEST) ? produto.prod.CEST : null,
                pro_cod_bar         : (produto.prod.cEAN) ? produto.prod.cEAN : null,
                pro_eh_inativo_aux  : true,
                pro_eh_servico      : 0,
                pro_tip_producao    : 'P',
                pro_tip_especifico  : '0'
            };

            //seta o preço de custo nas operações relativas a compra
            if($scope.objImportaNFe.dados_importacao.natureza){

                switch($scope.objImportaNFe.dados_importacao.natureza) {
                    case '2':
                    case '4':
                    case '6':
                        objProduto.pro_preco1       = (produto.prod.vCustoUni) ? produto.prod.vCustoUni : produto.prod.vUnCom;
                        objProduto.pro_tip_producao = 'T';
                        break;

                    default:
                        objProduto.pro_preco5 = produto.prod.vUnCom;
                        break;
                }
            }

            if(produto.infAdProd) {

                objProduto.pro_inf_adicionais = produto.infAdProd;
            }

            if(produto.imposto.ICMS.ICMSSN102){

                objProduto.pro_cs_origem = produto.imposto.ICMS.ICMSSN102.orig;
                objProduto.pro_cso       = produto.imposto.ICMS.ICMSSN102.CSOSN;
            }

            if(produto.imposto.ICMS.ICMSSN101){

                objProduto.pro_cs_origem = produto.imposto.ICMS.ICMSSN101.orig;
                objProduto.pro_cso       = produto.imposto.ICMS.ICMSSN101.CSOSN;
            }

            if(produto.imposto.ICMS.ICMSSN201){

                objProduto.pro_cs_origem = produto.imposto.ICMS.ICMSSN201.orig;
                objProduto.pro_cso       = produto.imposto.ICMS.ICMSSN201.CSOSN;
            }

            if(produto.imposto.ICMS.ICMSSN202){

                objProduto.pro_cs_origem = produto.imposto.ICMS.ICMSSN202.orig;
                objProduto.pro_cso       = produto.imposto.ICMS.ICMSSN202.CSOSN;
            }

            if(produto.imposto.ICMS.ICMSSN203){

                objProduto.pro_cs_origem = produto.imposto.ICMS.ICMSSN203.orig;
                objProduto.pro_cso       = produto.imposto.ICMS.ICMSSN203.CSOSN;
            }

            if(produto.imposto.ICMS.ICMSSN500){

                objProduto.pro_cs_origem = produto.imposto.ICMS.ICMSSN500.orig;
                objProduto.pro_cso       = produto.imposto.ICMS.ICMSSN500.CSOSN;
            }

            if(produto.imposto.ICMS.ICMS10){

                objProduto.pro_cs_origem = produto.imposto.ICMS.ICMS10.orig;
                objProduto.pro_cst       = produto.imposto.ICMS.ICMS10.CST;
            }

            if(produto.imposto.ICMS.ICMS30){

                objProduto.pro_cs_origem = produto.imposto.ICMS.ICMS30.orig;
                objProduto.pro_cst       = produto.imposto.ICMS.ICMS30.CST;
            }

            if(produto.imposto.ICMS.ICMS60){

                objProduto.pro_cs_origem = produto.imposto.ICMS.ICMS60.orig;
                objProduto.pro_cst       = produto.imposto.ICMS.ICMS60.CST;
            }

            if(produto.imposto.ICMS.ICMS70){

                objProduto.pro_cs_origem = produto.imposto.ICMS.ICMS70.orig;
                objProduto.pro_cst       = produto.imposto.ICMS.ICMS70.CST;
            }

            //Ajuste técnico Para cliente RACCO.
            if($scope.empresa.emp_ident_emp === 76350) {

                objProduto.pro_cod_bar = produto.prod.cProd;
            }

            if(objProduto){

                $scope.getJanelaProduto(objProduto);
            }
        };

        /**
         * Abre a modal com o produto não cadastrado
         * @param produto
         */
        $scope.getJanelaProduto = function (produto) {

            var scope = $rootScope.$new();
            scope.params = produto;
            scope.params.importandoNFe = true;
            scope.params.tipEmissao = $scope.objImportaNFe.dados_importacao.tipo_emissao;

            if ($scope.objImportaNFe.emitente.cad_cod_cad) {

                scope.params.eqv_cod_for = $scope.objImportaNFe.emitente.cad_cod_cad;

            } else if ($scope.objImportaNFe.destinatario.cad_cod_cad) {

                scope.params.eqv_cod_for = $scope.objImportaNFe.destinatario.cad_cod_cad;
            }


            if (!scope.params.eqv_cod_for) {

                GeralFactory.notify('danger', 'Erro!', 'Fornecedor não encontrado!');

            } else {

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'produto/views/janela-produto.html',
                    controller: 'ProdutoModalCtrl',
                    size: 'lg',
                    windowClass: 'center-modal no-top-modal',
                    scope: scope,
                    resolve: {
                        getEnd: function () {
                        }
                    }
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {

                    // //console.log('voltou do produto', modalInstance);

                    if (modalInstance.produto) {
                        $timeout(function () {

                            angular.forEach($scope.objImportaNFe.itens, function (item, chave) {

                                if (item.prod.cProd == produto.pro_cod_ori) {

                                    item.prod.cProd = modalInstance.produto.pro_cod_pro;
                                    item.prod.xProd = modalInstance.produto.pro_descricao;
                                    item.prod.notFound = false;
                                }
                            });
                        }, 500);
                    }

                    $timeout(function () {

                        $scope.validaTelaImportacao();
                    }, 1500);
                });
            }
        };

        /**
         * Aciona a modal para a escolha de um produto substituto ao produto cadastrado
         * @param produto
         */
        $scope.getJanelaTrocaProduto = function (produto) {

            // //console.log('produto', produto);
            if ($scope.objImportaNFe.emitente.cad_cod_cad || $scope.objImportaNFe.destinatario.cad_cod_cad) {

                var scope = $rootScope.$new();
                scope.params = {};
                scope.params.cad_cod_cad = $scope.objImportaNFe.emitente.cad_cod_cad ? $scope.objImportaNFe.emitente.cad_cod_cad : $scope.objImportaNFe.destinatario.cad_cod_cad;
                scope.params.importandoNFe = true;
                scope.params.tipEmissao = $scope.objImportaNFe.dados_importacao.tipo_emissao;

                if (produto.prod.pro_cod_original) {

                    scope.params.pro_cod_original = produto.prod.pro_cod_original;
                } else {

                    scope.params.pro_cod_original = produto.prod.cProd;
                }

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'produto/views/janela-lista-produto.html',
                    controller: 'ListaProdutoModalCtrl',
                    size: 'lg',
                    windowClass: 'center-modal no-top-modal',
                    scope: scope,
                    resolve: {
                        getEnd: function () {
                        }
                    }
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {

                    $timeout(function () {

                        if (modalInstance.produto) {

                            angular.forEach($scope.objImportaNFe.itens, function (item, chave) {

                                if (item.prod.cProd == produto.prod.cProd) {

                                    item.prod.cProd = modalInstance.produto.pro_cod_pro;
                                    item.prod.xProd = (!modalInstance.produto.pro_descricao == '') ? modalInstance.produto.pro_descricao : modalInstance.produto.pro_descricao_longa;
                                    item.prod.notFound = false;
                                }
                            });
                        }
                    }, 500);

                    $timeout(function () {

                        $scope.validaTelaImportacao();
                    }, 1500);
                });
            } else {

                GeralFactory.notify('danger', 'Erro!', 'Fornecedor não encontrado!');
            }
        };

        /**
         * Converte a quantidade informada na nota para a quantidade informada pelo cliente
         * @param produto
         */
        $scope.converteQTD = function (produto) {

            //console.log('produto:', produto);

            if (!produto.prod.qCom == '' && !isNaN(produto.prod.qCom && !produto.prod.qCom <= 0)) {

                var valorProtudo = produto.prod.vProd;
                var qtdVenda = produto.prod.qCom;

                qtdVenda = qtdVenda.replace(/,/g, '.');

                valorProtudo = parseFloat(valorProtudo);
                qtdVenda = parseFloat(qtdVenda);

                //sempre pega o valor original armazenado no backup para garantir o valor correto na conversão
                angular.forEach($scope.objImportaNFe.itensBKP, function (item, chave) {

                    if (item.prod.cProd == produto.prod.cProd) {

                        valorProtudo = parseFloat(item.prod.vProd);
                    }

                });

                $timeout(function () {

                    var novoVlrUn = parseFloat(valorProtudo / qtdVenda);

                    GeralFactory.confirmar('Novo valor unitário R$' + novoVlrUn.toFixed(2) + '. Deseja aplicar?', function () {

                        produto.prod.vUnCom = novoVlrUn;
                    });

                }, 500);
            }
        };

        /**
         * Aciona a API para envio das informações da nota pra gravação
         */
        $scope.salvarNFe = function () {

            $scope.objImportaNFe.eh_simples_nacional = 0;

            var atualizaCusto = false;

            angular.forEach($scope.objImportaNFe.itens, function(i, j) {

                if(i.prod.notFound == undefined && !atualizaCusto) {

                    atualizaCusto = true;
                }
            });

            if(atualizaCusto) {

                if($scope.objImportaNFe.dados_importacao.natureza == '2') {

                    var scope = $rootScope.$new();
                    scope.params = $scope.objImportaNFe.itens;
                    scope.params.importandoNFe = true;

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'produto/views/janela-set-novo-preco-custo-compra.html',
                        controller: 'AtualizaPrecoCustoProdutoModalCtrl',
                        size: 'lg',
                        windowClass: 'center-modal no-top-modal',
                        scope: scope,
                        resolve: {
                            getEnd: function () {
                            }
                        }
                    });

                    modalInstance.result.then(function (id) { }, function (msg) {

                        $timeout(function () {

                            if (msg == 'continue') {

                                $scope.verificaSimplesNacional();
                            }
                        }, 100);
                    });
                } else {

                    $scope.verificaSimplesNacional();
                }
            } else {

                $scope.verificaSimplesNacional();
            }
        };

        /**
         * Atenção: verifica o regime de tributação da empresa, se tem ICMS e se é uma compra:
         */
        $scope.verificaSimplesNacional = function () {

            if ((
                    $scope.objImportaNFe.dados_importacao.natureza == 2 ||
                    $scope.objImportaNFe.dados_importacao.natureza == 6
                ) && (
                    $scope.empresa.emp_reg_trib === 1 ||
                    $scope.empresa.emp_reg_trib === 2 ||
                    $scope.empresa.emp_reg_trib === 3
                ) && (
                    parseFloat($scope.objImportaNFe.totais.ICMSTot.vICMS) > 0 ||
                    parseFloat($scope.objImportaNFe.totais.ICMSTot.vBC)   > 0
                )) {

                GeralFactory.confirmar('Sua empresa é do Simples Nacional, deseja zerar os valores de ICMS?', function () {

                    $scope.objImportaNFe.eh_simples_nacional = 1;

                    $scope._salvarNFe();

                }, '', function () {

                    $scope._salvarNFe();
                });
            } else {

                $scope._salvarNFe();
            }
        }

        /**
         * Salva os dados da nota
         * @private
         */
        $scope._salvarNFe = function () {

            if ($scope.importar) {

                $scope.importaNFeLoading = true;

                //console.log('objNFe', $scope.objImportaNFe);

                MidiaService.lancarDadosNFeCompra.post($scope.objImportaNFe, function (resposta) {

                    // //console.log('resposta', resposta);

                    if (!resposta.records.error) {

                        GeralFactory.notify('success', resposta.records.title, resposta.records.msg);
                        $scope.importaNFeLoading = false;

                        $uibModalInstance.notaImportada = true;

                        $scope.fecharModal();
                    } else {

                        GeralFactory.notify('danger', resposta.records.title, resposta.records.msg);
                        $scope.importaNFeLoading = false;
                    }
                });
            }
        };

        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function (str) {

            $modalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('VendaInfoAdicionaisCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance',

    function ($scope, $rootScope, $timeout, $uibModalInstance) {

        $scope.forms = {};
        $scope.objModal = {};


        $uibModalInstance.opened.then(function () {

            $uibModalInstance.hasAlteracao = false;
            $scope.objModal = $scope.params.objItem;
        });


        /**
         * Método responsável em salvar os dados da informação adicional.
         */
        $scope.salvar = function () {

            $scope.salvarInfoAdicionaisLoading = true;
            $timeout(function () {

                $uibModalInstance.hasAlteracao = true;
                $scope.salvarInfoAdicionaisLoading = false;
                $scope.fecharModal('reload');

            }, 1000);
        };


        /**
         * Método responsável em fechar a janela modal.
         */
        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('VendaDuplicaarOperacaoCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance', 'VendaService', 'ParamsService', 'GeralFactory', 'ClienteService', 'EmpresaService',

    function ($scope, $rootScope, $timeout, $uibModalInstance, VendaService, ParamsService, GeralFactory, ClienteService, EmpresaService) {

        $uibModalInstance.opened.then(function () {

            $scope.salvarVendaLoading = false;

            $scope.objModal     = {};
            $scope.arrOperacoes = {};

            $scope.objModal.novaVenda    = $scope.params.venda;
            $scope.objModal.novoCliente  = $scope.params.cliente;

            console.log('$scope.objModal', $scope.objModal);

            $scope.getEmpresa();
            $scope.setOperacoes();
        });

        /**
         * Preenche o select com as opções viáveis a operação atual informado
         */
        $scope.setOperacoes = function () {

            delete($scope.objModal.novaVenda.fin_nro_lan);

            $scope.objFiltroPessoa = {
                'cad_tip_cli_for' : $scope.objModal.novaVenda.cad_tip_cli_for
            };

            $scope.alterarCadastro = false;
            $scope.alterarCfop     = false;

            $scope.cfop = $scope.params.venda.fin_cfo_cfop;

            // if ($scope.objModal.novoCliente.cad_tip_cli_for == 1) {

            $scope.objModal.novaVenda.fin_6020_natureza_aux = $scope.objModal.novaVenda.fin_6020_natureza;

            $scope.arrOperacoes = [{
                id: 1,
                nome: 'Venda'
            }, {
                id: 3,
                nome: 'Devolução de Venda'
            }, {
                id: 5,
                nome: 'Outras Saídas'
            }, {
                id: 11,
                nome: 'Orçamento'
            }, {
                id: 2,
                nome: 'Compra'
            }, {
                id: 4,
                nome: 'Devolução de Compra'
            }, {
                id: 6,
                nome: 'Outras Entradas'
            }];

            if($scope.objModal.novaVenda.fin_6020_natureza == 31) {

                $scope.arrOperacoes = [{
                    id: 31,
                    nome: 'Prestação de serviço'
                }];
            }

            switch ($scope.objModal.novaVenda.fin_6020_natureza)
            {

                case 2:
                case 4:
                case 6:
                    $scope.nomeAtualOperacao = 'compra';
                    break;

                case 31:
                    $scope.nomeAtualOperacao = 'prest-servico';
                    break;

                default:
                    $scope.nomeAtualOperacao = 'venda';
                    break;
            }

            // } else if ($scope.objModal.novoCliente.cad_tip_cli_for == 2) {
            //
            //     $scope.arrOperacoes = [{
            //         id: 2,
            //         nome: 'Compra'
            //     }, {
            //         id: 4,
            //         nome: 'Devolução de Compra'
            //     }, {
            //         id: 6,
            //         nome: 'Outras Entradas'
            //     }];
            // }

            $scope.setNomeOperacao();
        };

        /**
         * Ao selecionar uma operação, verifica a configuração
         */
        $scope.setParametrosTela = function () {

            //console.log('onSelectNovaOperacao');

            if($scope.nomeAtualOperacao) {

                if($scope.nomeAtualOperacao == $scope.nomeNovaOperacao) {

                    $scope.objModal.novaVenda.clienteSelect   = $scope.params.venda.clienteSelect;
                    $scope.objModal.novaVenda.fin_cad_cod_cad = $scope.params.venda.fin_cad_cod_cad;

                    $scope.alterarCadastro = false;
                } else {

                    $scope.objModal.novaVenda.clienteSelect = '';

                    $scope.alterarCadastro = true;
                    $scope.objFiltroPessoa = {
                        'cad_tip_cli_for' : 1
                    };

                    if($scope.nomeNovaOperacao == 'compra') {

                        $scope.objFiltroPessoa = {
                            'cad_tip_cli_for' : 2
                        };
                    }
                }

                $scope.setNomeOperacao();
            }
        };

        /**
         * Verifica qual o tipo de operação selecionada na tela
         */
        $scope.onSelectNovaOperacao = function () {

            $scope.alterarCadastro = false;

            $scope.objModal.novaVenda.fin_6020_natureza_aux = parseInt($scope.objModal.novaVenda.fin_6020_natureza_aux);

            switch ($scope.objModal.novaVenda.fin_6020_natureza_aux)
            {

                case 2:
                case 4:
                case 6:
                    $scope.nomeNovaOperacao = 'compra';
                    break;

                default:
                    $scope.nomeNovaOperacao = 'venda';
                    break;
            }

            $timeout(function () {

                $scope.setParametrosTela();
            });
        };

        $scope.onSelectCliente = function (obj) {

            $scope.getCliente(obj.cad_cod_cad);
            $scope.objModal.novaVenda.clienteSelect = obj.cad_nome_razao;
        };

        /**
         * Obtém dados de um determinado cliente.
         */
        $scope.getCliente = function(cad_cod_cad) {

            var arrEnd, strEndEnt;
            var arrEndEnt = [];

            $scope.objModal.novoCliente.enderecoEntrega = undefined;

            ClienteService.cliente.get({cad_cod_cad : cad_cod_cad}, function(data) {

                var cliente = data.records;
                $scope.objModal.novoCliente = cliente;

                $scope.objModal.novaVenda.fin_cad_nome_razao = cliente.cad_nome_razao;
                $scope.listaContato                 = data.records.listaContato;
                $scope.listaEndereco                = data.records.listaEndereco;
                $scope.objModal.novoCliente.contato          = $scope.listaContato[0] = data.records.listaContato[0];
                //$scope.objModal.novoCliente.auxContribuinte = $scope.objModal.novoCliente.cad_tip_contribuinte;


                if(($scope.objModal.novaVenda.fin_tip_contribuinte == undefined && $scope.objModal.novoCliente.cad_tip_contribuinte != 9) || ($scope.objModal.novaVenda.fin_tip_contribuinte != undefined && $scope.objModal.novaVenda.fin_tip_contribuinte != 9)) {

                    $scope.tipContrib = 'Contribuinte';
                    $scope.objModal.novoCliente.auxContribuinte = 1;
                } else {
                    $scope.tipContrib = 'Consumidor';
                    $scope.objModal.novoCliente.auxContribuinte = 9;
                }



                arrEnd = data.records.endereco;

                $scope.objModal.novaVenda.enderecoFaturamento = $scope.formatarEnderecoString(arrEnd);
                $scope.objModal.novoCliente.codEnderecoFaturamento = 1;

                angular.forEach($scope.listaEndereco, function(i, j) {

                    strEndEnt = $scope.formatarEnderecoString(i);
                    arrEndEnt.push({
                        id   : i['end_seq_end'],
                        nome : strEndEnt
                    });
                });

                // Recolhendo a imagem mais recente do cliente:
                $scope.objModal.novoCliente.imagem_atual = null;
                if ($scope.objModal.novoCliente.cliente_imagem.length) {

                    var qtdeImagens = $scope.objModal.novoCliente.cliente_imagem.length;
                    $scope.objModal.novoCliente.imagem_atual = $scope.objModal.novoCliente.cliente_imagem[qtdeImagens - 1];
                }

                $scope.arrEnderecoEntrega = arrEndEnt;
                if (! $scope.objModal.novaVenda.fin_nro_lan) {

                    $scope.objModal.novoCliente.enderecoEntrega = $scope.objModal.novoCliente.cad_end_cod_end_ent_padrao;

                } else {

                    $scope.objModal.novoCliente.enderecoEntrega = $scope.objModal.novaVenda.fin_end_cod_end_ent;
                }

                if(! $scope.objModal.novaVenda.fin_nro_lan) {
                    $scope.getCfopEstado();
                }

            });
        };

        /**
         * Formata em string do endereço completo.
         */
        $scope.formatarEnderecoString = function(arrEnd) {

            var strEnd = '';
            if(arrEnd) {

                if (arrEnd['end_endereco']) {

                    strEnd += arrEnd['end_endereco'] + ', ';
                }

                if (arrEnd['end_endereco_nro']) {

                    strEnd += arrEnd['end_endereco_nro'] + ', ';
                }

                if (arrEnd['end_endereco_bairro']) {

                    strEnd += arrEnd['end_endereco_bairro'] + '. ';
                }

                if (arrEnd['end_endereco_cidade']) {

                    strEnd += arrEnd['end_endereco_cidade'] + '/';
                }

                if (arrEnd['end_endereco_uf']) {

                    strEnd += arrEnd['end_endereco_uf'];
                }
            }


            return strEnd;
        };

        $scope.getEmpresa = function(func) {

            EmpresaService.empresa.get({emp_cod_emp : '1'}, function(data) {
                $scope.empresa = data.records;

                if(func) {
                    func.call();
                }
            });
        };

        /**
         * verifica se vai colocar CFOP padrao de outro estado
         */
        $scope.getCfopEstado = function() {

            if($scope.objModal.novoCliente.endereco.end_endereco_cod_uf != undefined) {

                if($scope.objModal.novoCliente.endereco.end_endereco_cod_uf != $scope.empresa.emp_cod_uf) {

                    $scope.cfop = $scope.paramPadrao.par_i02;

                    if($scope.objModal.novaVenda.fin_cfo_cfop != $scope.cfop) {
                        $scope.alterarCfop = true;
                    }
                }
            }
        };

        /**
         * Inicializa os labels padrões da operação selecionada.
         */
        $scope.setNomeOperacao = function () {

            $scope.objModal.novaVenda.fin_6020_natureza_aux = parseInt($scope.objModal.novaVenda.fin_6020_natureza_aux);

            var strCod = '';

            if ($scope.objModal.novaVenda.fin_6020_natureza_aux == 1) {

                if (!$rootScope.getPermissao('8')) {
                    $location.path('/');
                }

                $scope.objModal.novoSiglaTutorial = 'VEN';
                $scope.objModal.novoLabelTutorial = 'Cadastro de novas vendas';
                $scope.objModal.novoLabelProduto = 'produto';
                $scope.objModal.novaVenda.nomeNatureza = 'Vendas';
                $scope.objModal.novaVenda.explModulo = 'suas vendas';
                $scope.objModal.novaVenda.nomeNaturezaSing = 'Venda';
                $scope.objModal.novaVenda.op = 'venda';
                $scope.objModal.novaVenda.labelTitular = 'Cliente';
                $scope.objModal.novaVenda.labelTitularSing = 'cliente';
                $scope.objModal.novaVenda.attrPrecoProduto = 'pro_preco5';
                $scope.objModal.novaVenda.cad_tip_cli_for = 1;
                $scope.objModal.novaVenda.codNatureza = 1;
                $scope.objModal.novaVenda.fin_sistema = 1;
                $scope.objModal.novaVenda.fin_tip_emitente = ($scope.objModal.novaVenda.fin_tip_emitente) ? $scope.objModal.novaVenda.fin_tip_emitente : 'P';

                strCod = '1|6020|1||';

            } else if ($scope.objModal.novaVenda.fin_6020_natureza_aux == 2) {

                if (!$rootScope.getPermissao('16')) {
                    $location.path('/');
                }

                $scope.objModal.novoSiglaTutorial = 'COM';
                $scope.objModal.novoLabelTutorial = 'Cadastro de novas compras';
                $scope.objModal.novoLabelProduto = 'produto';
                $scope.objModal.novaVenda.nomeNatureza = 'Compras';
                $scope.objModal.novaVenda.explModulo = 'suas compras incrementando seu estoque';
                $scope.objModal.novaVenda.nomeNaturezaSing = 'Compra';
                $scope.objModal.novaVenda.op = 'compra';
                $scope.objModal.novaVenda.labelTitular = 'Fornecedor';
                $scope.objModal.novaVenda.labelTitularSing = 'fornecedor';
                $scope.objModal.novaVenda.attrPrecoProduto = 'pro_preco1';
                $scope.objModal.novaVenda.cad_tip_cli_for = 2;
                $scope.objModal.novaVenda.codNatureza = 2;
                $scope.objModal.novaVenda.fin_sistema = 2;
                $scope.objModal.novaVenda.fin_tip_emitente = ($scope.objModal.novaVenda.fin_tip_emitente) ? $scope.objModal.novaVenda.fin_tip_emitente : 'T';

                strCod = '1|6020|2||';

            } else if ($scope.objModal.novaVenda.fin_6020_natureza_aux == 11) {

                if (!$rootScope.getPermissao('26')) {
                    $location.path('/');
                }

                $scope.objModal.novoSiglaTutorial = 'ORC';
                $scope.objModal.novoLabelTutorial = 'Cadastro de novos orçamentos';
                $scope.objModal.novoLabelProduto = 'produto';
                $scope.objModal.novaVenda.nomeNatureza = 'Orçamentos';
                $scope.objModal.novaVenda.explModulo = 'seus orçamentos';
                $scope.objModal.novaVenda.nomeNaturezaSing = 'Orçamento';
                $scope.objModal.novaVenda.op = 'orcamento';
                $scope.objModal.novaVenda.labelTitular = 'Cliente';
                $scope.objModal.novaVenda.labelTitularSing = 'cliente';
                $scope.objModal.novaVenda.attrPrecoProduto = 'pro_preco5';
                $scope.objModal.novaVenda.cad_tip_cli_for = 1;
                $scope.objModal.novaVenda.codNatureza = 11;
                $scope.objModal.novaVenda.fin_sistema = 1;

                //strCod = '1|6020|1||';

            } else if ($scope.objModal.novaVenda.fin_6020_natureza_aux == 3) {

                if (!$rootScope.getPermissao('27')) {
                    $location.path('/');
                }

                $scope.objModal.novoSiglaTutorial = 'DEV';
                $scope.objModal.novoLabelTutorial = 'Cadastro de novas devoluções';
                $scope.objModal.novoLabelProduto = 'produto';
                $scope.objModal.novaVenda.nomeNatureza = 'Devoluções';
                $scope.objModal.novaVenda.explModulo = 'suas devoluções de venda';
                $scope.objModal.novaVenda.nomeNaturezaSing = 'Devolução de Venda';
                $scope.objModal.novaVenda.op = 'devolucao-venda';
                $scope.objModal.novaVenda.labelTitular = 'Cliente';
                $scope.objModal.novaVenda.labelTitularSing = 'cliente';
                $scope.objModal.novaVenda.attrPrecoProduto = 'pro_preco5';
                $scope.objModal.novaVenda.cad_tip_cli_for = 1;
                $scope.objModal.novaVenda.codNatureza = 3;
                $scope.objModal.novaVenda.fin_sistema = 2;
                $scope.objModal.novaVenda.fin_tip_emitente = ($scope.objModal.novaVenda.fin_tip_emitente) ? $scope.objModal.novaVenda.fin_tip_emitente : 'P';

                strCod = '1|6020|3||';

            } else if ($scope.objModal.novaVenda.fin_6020_natureza_aux == 4) {

                if (!$rootScope.getPermissao('31')) {
                    $location.path('/');
                }

                $scope.objModal.novoSiglaTutorial = 'DEVCOM';
                $scope.objModal.novoLabelTutorial = 'Cadastro de novas devoluções';
                $scope.objModal.novoLabelProduto = 'produto';
                $scope.objModal.novaVenda.nomeNatureza = 'Devoluções';
                $scope.objModal.novaVenda.explModulo = 'suas devoluções de compra';
                $scope.objModal.novaVenda.nomeNaturezaSing = 'Devolução de Compra';
                $scope.objModal.novaVenda.op = 'devolucao-compra';
                $scope.objModal.novaVenda.labelTitular = 'Fornecedor';
                $scope.objModal.novaVenda.labelTitularSing = 'fornecedor';
                $scope.objModal.novaVenda.attrPrecoProduto = 'pro_preco1';
                $scope.objModal.novaVenda.cad_tip_cli_for = 2;
                $scope.objModal.novaVenda.codNatureza = 4;
                $scope.objModal.novaVenda.fin_sistema = 1;
                $scope.objModal.novaVenda.fin_tip_emitente = ($scope.objModal.novaVenda.fin_tip_emitente) ? $scope.objModal.novaVenda.fin_tip_emitente : 'P';

                strCod = '1|6020|4||';

            } else if ($scope.objModal.novaVenda.fin_6020_natureza_aux == 5) {

                if (!$rootScope.getPermissao('30')) {
                    $location.path('/');
                }

                $scope.objModal.novoSiglaTutorial = 'OUTSAI';
                $scope.objModal.novoLabelTutorial = 'Cadastro de outras saídas';
                $scope.objModal.novoLabelProduto = 'produto';
                $scope.objModal.novaVenda.nomeNatureza = 'Outras Saídas';
                $scope.objModal.novaVenda.explModulo = 'suas outras saídas';
                $scope.objModal.novaVenda.nomeNaturezaSing = 'Outra Saída';
                $scope.objModal.novaVenda.op = 'outras-saidas';
                $scope.objModal.novaVenda.labelTitular = 'Cliente';
                $scope.objModal.novaVenda.labelTitularSing = 'cliente';
                $scope.objModal.novaVenda.attrPrecoProduto = 'pro_preco5';
                $scope.objModal.novaVenda.cad_tip_cli_for = 1;
                $scope.objModal.novaVenda.codNatureza = 5;
                $scope.objModal.novaVenda.fin_sistema = 1;
                $scope.objModal.novaVenda.fin_tip_emitente = ($scope.objModal.novaVenda.fin_tip_emitente) ? $scope.objModal.novaVenda.fin_tip_emitente : 'P';

                strCod = '1|6020|5||';

            } else if ($scope.objModal.novaVenda.fin_6020_natureza_aux == 6) {

                if (!$rootScope.getPermissao('29')) {
                    $location.path('/');
                }

                $scope.objModal.novoSiglaTutorial = 'OUTENT';
                $scope.objModal.novoLabelTutorial = 'Cadastro de outras entradas';
                $scope.objModal.novoLabelProduto = 'produto';
                $scope.objModal.novaVenda.nomeNatureza = 'Outras Entradas';
                $scope.objModal.novaVenda.explModulo = 'suas outras entradas';
                $scope.objModal.novaVenda.nomeNaturezaSing = 'Outra Entrada';
                $scope.objModal.novaVenda.op = 'outras-entradas';
                $scope.objModal.novaVenda.labelTitular = 'Fornecedor';
                $scope.objModal.novaVenda.labelTitularSing = 'fornecedor';
                $scope.objModal.novaVenda.attrPrecoProduto = 'pro_preco1';
                $scope.objModal.novaVenda.cad_tip_cli_for = 2;
                $scope.objModal.novaVenda.codNatureza = 6;
                $scope.objModal.novaVenda.fin_sistema = 2;
                $scope.objModal.novaVenda.fin_tip_emitente = ($scope.objModal.novaVenda.fin_tip_emitente) ? $scope.objModal.novaVenda.fin_tip_emitente : 'T';

                strCod = '1|6020|6||';
            } else if ($scope.objModal.novaVenda.fin_6020_natureza_aux == 31) {

                if (!$rootScope.getPermissao('34')) {
                    $location.path('/');
                }

                var opLabel = ($scope.objModal.novaVenda.fin_6030_esp_doc != 10) ? 'Prestação' : 'Ordem';

                $scope.objModal.siglaTutorial = 'PRESTSERV';
                $scope.objModal.labelTutorial = 'Cadastro de '+ opLabel +' de Serviços';
                $scope.objModal.labelDetalhe = 'Dados da '+ opLabel +' de serviço';
                $scope.objModal.labelProduto = 'serviço';
                $scope.objModal.novaVenda.nomeNatureza = opLabel +'de Serviços';
                $scope.objModal.novaVenda.explModulo = 'suas prestações de serviços';
                $scope.objModal.novaVenda.nomeNaturezaSing = opLabel +' de Serviço';
                $scope.objModal.novaVenda.op = 'prest-servico';
                $scope.objModal.novaVenda.labelTitular = 'Cliente';
                $scope.objModal.novaVenda.labelTitularSing = 'cliente';
                $scope.objModal.novaVenda.attrPrecoProduto = 'pro_preco5';
                $scope.objModal.novaVenda.cad_tip_cli_for = 1;
                $scope.objModal.novaVenda.codNatureza = 31;
                $scope.objModal.novaVenda.fin_sistema = 1;
                // $scope.objModal.objDropdown.objCentroCusto = {'par_i03': 1};
                // $scope.objModal.objFiltroProduto = {'pro_eh_servico': 'S'};
                $scope.objModal.novaVenda.fin_tip_emitente = 'P';

                strCod = '1|6020|31||';
            }

            //obtem a descriçao e codigo do cfop padrao. Cada empresa pode ter o seu padrao
            if (!$scope.objModal.novaVenda.fin_nro_lan) {

                ParamsService.getParametro(strCod, function (data) {

                    if (data) {
                        $scope.paramPadrao = data;
                        if (data.par_i01) {
                            $scope.cfop = data.par_i01;

                            if($scope.objModal.novaVenda.fin_cfo_cfop != $scope.cfop) {
                                $scope.alterarCfop = true;
                            }
                        }
                    }
                });
            }
        };

        /**
         * Abre a modal principal dos dados do cliente que tem todas as abas da tela de cliente.
         */
        $scope.getJanelaCliente = function(cad_cod_cad) {

            var scope = $rootScope.$new();
            scope.params = {};

            if (cad_cod_cad) {

                scope.params.str_titular = $scope.objModal.novaVenda.labelTitular;
                scope.params.cad_cod_cad = cad_cod_cad;

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'cliente/views/janela-cliente.html',
                    controller  : 'ClienteModalCtrl',
                    size        : 'lg',
                    windowClass : 'center-modal no-top-modal',
                    scope       :  scope,
                    resolve: {
                        getEnd: function() { }
                    }
                });

                modalInstance.result.then(function(id) { }, function(msg) {

                    if (modalInstance.hasAlteracao) {

                        $scope.getCliente($scope.objModal.novoCliente.cad_cod_cad);
                        ClienteService.clienteEnderecos.get({cad_cod_cad : $scope.objModal.novoCliente.cad_cod_cad}, function(data) {

                            $scope.enderecos = data.records;
                        });
                    }
                });
            }
        };


        /**
         * Método responsável em salvar os dados da informação adicional.
         */
        $scope.duplicarOperacao = function () {

            $scope.salvarVendaLoading = true;
            $scope.objModal.novaVenda.fin_dat_lan       = GeralFactory.getDataAtualBr();
            $scope.objModal.novaVenda.fin_cfo_cfop      = $scope.cfop;
            $scope.objModal.novaVenda.fin_cad_cod_cad   = $scope.objModal.novoCliente.cad_cod_cad;
            $scope.objModal.novaVenda.fin_6020_natureza = $scope.objModal.novaVenda.fin_6020_natureza_aux;

            angular.forEach($scope.objModal.novaVenda.itens, function (reg, i) {

                $scope.objModal.novaVenda.itens[i].ite_cfo_cfop = $scope.cfop;
            });

            console.log('$scope.objModal.novaVenda', $scope.objModal.novaVenda);

            VendaService.vendas.create($scope.objModal.novaVenda, function (resposta) {

                $timeout(function () {
                    $scope.salvarVendaLoading = false;
                }, 2000);

                if (!resposta.records.error) {

                    $scope.fecharModal('reload');
                    $scope.salvarVendaLoading = false;
                }

            });
        };


        /**
         * Método responsável em fechar a janela modal.
         */
        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);


angular.module('newApp').controller('VendaInfoCtrl', [

    '$scope', '$rootScope', '$timeout', '$uibModalInstance',

    function ($scope, $rootScope, $timeout, $uibModalInstance) {

        $scope.forms = {};
        $scope.objModal = {};

        $uibModalInstance.opened.then(function () {

            $scope.objModal = $scope.params.objItem;
        });


        /**
         * Método responsável em fechar a janela modal.
         */
        $scope.fecharModal = function (str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);