
angular.module('newApp')

    .directive('myDirective', function($parse) {
        return function(scope, element, attr) {
            element.html($parse(attr.myDirective)(scope));
        };
    })

    .directive('myDirective2', function() {
        return function(scope, element, attr) {
            attr.$observe('value', function(actual_value) {
                element.val('value = ' + actual_value);
            });
        }
    })

    .directive('dynamic', function($compile) {
        return {
            restrict : 'A',
            replace  : true,
            scope    : {dynamic: '=dynamic'},
            link     : function postLink(scope, element, attrs) {
                scope.$watch('dynamic' , function(html) {
                    element.html(html);
                    $compile(element.contents())(scope);
                });
            }
        };
    })

    .directive('ngHtmlCompile', function($compile) {
        return {
            restrict : 'A',
            link     : function(scope, element, attrs) {
                scope.$watch(attrs.ngHtmlCompile, function(newValue, oldValue) {
                    element.html(newValue);
                    $compile(element.contents())(scope);
                });
            }
        }
    })

    .controller ('HomeCtrl', [

        '$scope', '$rootScope', '$timeout', '$uibModal', '$window', '$location', 'GeralFactory', 'ParamsService', 'FinanceiroService', 'VendaService', 'ClienteService', 'AuthTokenFactory', 'uiCalendarConfig', 'ScriptChat', 'TermoAceite', 'Movidesk', 'Initialize', 'Wizard', 'StaticFactories',
        
        function($scope, $rootScope, $timeout, $uibModal, $window, $location, GeralFactory, ParamsService, FinanceiroService, VendaService, ClienteService, AuthTokenFactory, uiCalendarConfig, ScriptChat, TermoAceite, Movidesk, Initialize, Wizard, StaticFactories) {
            $rootScope.hasAutorizacao();

            $scope.objVendedores = {};
            $scope.objContasFinanceiras = {};
            $scope.objSaldoContasFinanceiras = {};
            $scope.objFaturamentoAnual = {};
            $scope.objReceitasDespesasAnual = {};

            $scope.objLegendaSaldo = {};
            $scope.objLegendaVendedor = {};
            $scope.objGraficoSaldo = {};
            $scope.objGraficoVendedor = {};
            $scope.objGraficoCentroCusto = {};
            $scope.objGraficoFaturamentoAnual = {};
            $scope.objGraficoReceitasDespesasAnual = {};

            var date = new Date();
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();

            $scope.events = [];
            $scope.evento = {};

            $scope.arrEventoDia = [];
            $scope.flagMsg = false;

            $scope.$on('$viewContentLoaded', function() {
                // Se o cara for apenas ecommerce
                // if($rootScope.objUsuario.arr_solucoes.length != 1 && ($rootScope.objUsuario.arr_solucoes[0] != 7)) {
                    // if ($rootScope.getPermissaoSolRestrita(7) && $rootScope.objUsuario.arr_solucoes.length != 2) {
                    if ($rootScope.getPermissaoSol(7)) {
                        console.log('tem ecommerce', $rootScope.objUsuario)
                    } else {
                        $scope.getModalMigracao();
                    }
                // } else {
                //     console.log('eh só ecommerce', $rootScope.objUsuario)
                // }

                var hasWizard = $rootScope.objUsuario.wizard;
                if (hasWizard) {

                    $location.path('/wizard');

                } else {

                    TermoAceite.init();
                    Initialize.verificarPlano();

                    $rootScope.scriptChat = ScriptChat.getScript();
                    $timeout(function() {
                        Movidesk.init();
                    }, 2000);

                    /**
                     * $timeout(function() { $rootScope.scriptWizard = Wizard.getScript(); }, 1000);
                     * $timeout(function() { Wizard.init(); }, 4000);
                     */

                    $scope.montarAgendaHome();
                    $scope.objFiltro = {
                        tipo : 0,
                        mes  : new Date().getMonth()
                    };

                    $scope.objCores = ['#619ED6', '#F3B084'];
                    $scope.objMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                    $scope.objTipos = ['Ambos', 'Receitas', 'Despesas'];

                    $scope.opGraficoFaturamento = 'A';
                    $scope.opGraficoReceitasDespesas = 'A';

                    $timeout(function() {
                        $scope.getGraficoSaldo();
                        $scope.getGraficoVendedor();
                        $scope.getGraficoFaturamentoAnual();
                        $scope.getGraficoReceitasDespesasAnual();
                        $scope.getGraficoCentroCusto();
                        $scope.listarEventosPorDia();

                        $timeout(function() {
                            $('.fc-row fc-week fc-widget-content').css('height', '39px !important');
                        }, 3000);
                    }, 1000)
                }

                $timeout(function () {
                    Wizard.loadWizards.initialize(36);
                }, 2000);
            });
            
            $scope.getModalMigracao = function () {

                var diaInicioAlerta = ($rootScope.objUsuario.is_cdl) ? 18 : 11,
                    dataBase        = new Date(y,6-1,diaInicioAlerta),
                    hoje            = new Date();

                dataBase.setHours(0,0,0,0);
                hoje.setHours(0,0,0,0);

                if(hoje >= dataBase) {

                    var scope = $rootScope.$new();

                    scope.params = {};

                    $uibModal.open({
                        animation: true,
                        templateUrl: 'home/views/janela-alerta-migrar-up.html',
                        controller: 'AlertaMigrarUpModalCtrl',
                        size: 'md',
                        windowClass: 'center-modal no-top-modal',
                        backdrop: 'static',
                        keyboard: false,
                        scope: scope
                    });
                    
                } else {
                    console.log('data de migração: ', dataBase)
                }
            };

            /**
             * Método responsável em ajustar os dados necessários para contrução do gráfico
             * relativo ao saldo das contas financeiras.
             */
            $scope.getGraficoSaldo = function() {

                ParamsService.contaFinanceiras.get({u: ''}, function(retorno) {

                    if (retorno.records) {

                        $scope.setContasFinanceiras(retorno.records);
                        if (! _.isEmpty($scope.arrContasFinanceiras)) {

                            $scope.objContasFinanceiras = retorno.records;

                            var strFiltro = 'q=(tit_5010_conta_fin:' + $scope.arrContasFinanceiras.join('|') + ')';
                            FinanceiroService.saldo.get({u : strFiltro}, function(retorno) {
                                if (retorno.records) {

                                    $scope.objSaldoContasFinanceiras = retorno.records['saldo_conta_fin'];
                                    $scope.upContasFinanceiras();

                                    var vlrTotal = 0, vlrTotalGrafico = 0;
                                    var arrLabels = [], arrData = [], arrColours = [], arrLegenda = [];

                                    angular.forEach($scope.objContasFinanceiras, function(item, chave) {

                                        var vlrSaldo = item.par_saldo;
                                        if (vlrSaldo !== 0) {

                                            vlrTotal = vlrTotal + vlrSaldo;
                                            var descConta = item.par_c01, hexaColor = $scope.objCoresSaldo[chave];

                                            // Verificando se o valor é negativo para efetuar a devida tratativa:
                                            var vlrGrafico  = (vlrSaldo < 0) ? vlrSaldo * (-1) : vlrSaldo;
                                            vlrTotalGrafico = vlrTotalGrafico + vlrGrafico;

                                            arrLabels.push(descConta);
                                            arrData.push(vlrGrafico);
                                            arrColours.push(hexaColor);

                                            // Objeto para montar a legenda de maneira dinâmica:
                                            arrLegenda.push({
                                                'gra_descricao' : descConta,
                                                'gra_vlr_saldo' : vlrSaldo,
                                                'gra_hexa_cor'  : hexaColor
                                            })
                                        }
                                    });

                                    if (! _.isEmpty(arrLabels) && ! _.isEmpty(arrData)) {


                                        console.log(arrData);

                                        $scope.setLegendaSaldo(arrLegenda, vlrTotalGrafico);
                                        $scope.vlrGraficoSaldo = vlrTotal;
                                        $scope.objGraficoSaldo = {
                                            'data'    : arrData,
                                            'labels'  : arrLabels,
                                            'colours' : arrColours,
                                            'options' : {
                                                tooltipTemplate: "<%=label%>: R$ <%=value%>"
                                            }
                                        };
                                    }
                                }
                            });
                        }
                    }
                });
                $scope.objCoresSaldo = StaticFactories.CORES;
            };

            /**
             * Método responsável em ajustar os dados necessários para contrução do gráfico
             * relativo as vendas efetuadas pelos vendedores.
             */
            $scope.getGraficoVendedor = function() {

                $timeout(function() {
                    $scope.objCoresSaldo = StaticFactories.CORES;
                    ParamsService.vendedores.get({u : ''}, function(retorno) {
                        if (retorno.records) {

                            $scope.setVendedores(retorno.records);
                            if (! _.isEmpty($scope.arrVendedores)) {

                                $scope.objVendedores = retorno.records;
                                $scope.buildGraficoVendedor();
                            }
                        }
                    });
                }, 500);
            };

            /**
             * Método responsável em construir de fato o relatório de vendas por vendedor.
             */
            $scope.buildGraficoVendedor = function() {

                var mes = parseInt($scope.objFiltro.mes) + 1;
                var strFiltro = 'q=(tipo_rel:2,vendas_validas_faturamento:1,fin_dat_ex_month:' + mes + ')';

                VendaService.relatorioVendas.get({u: strFiltro, op: 'venda'}, function(retorno) {
                    if (! _.isEmpty(retorno.records)) {

                        var objTotalVendedores = retorno.records;
                        $scope.upVendedores(objTotalVendedores);

                        var vlrTotalGrafico = 0, vlrTotalizacao = 0;
                        var arrLabels = [], arrData = [], arrColours = [], arrLegenda = [];

                        angular.forEach($scope.objVendedores, function(item, chave) {

                            if (item.par_total) {

                                var vlrTotal = item.par_total;
                                if (vlrTotal !== 0) {

                                    vlrTotalizacao = vlrTotalizacao + vlrTotal;

                                    // Verificando se o valor é negativo para efetuar a devida tratativa:
                                    var vlrGrafico  = (vlrTotal < 0) ? vlrTotal * (-1) : vlrTotal;
                                    vlrTotalGrafico = vlrTotalGrafico + vlrGrafico;

                                    var descVendedor = item.par_c01, hexaColor = $scope.objCoresSaldo[chave];
                                    arrLabels.push(descVendedor);
                                    arrData.push(vlrGrafico);
                                    arrColours.push(hexaColor);

                                    // Objeto para montar a legenda de maneira dinâmica:
                                    arrLegenda.push({
                                        'gra_descricao' : descVendedor,
                                        'gra_vlr_total' : vlrTotal,
                                        'gra_hexa_cor'  : hexaColor
                                    });
                                }
                            }
                        });

                        if (! _.isEmpty(arrLabels) && ! _.isEmpty(arrData)) {

                            $scope.setLegendaVendedor(arrLegenda, vlrTotalGrafico);
                            $scope.vlrGraficoVendedor = vlrTotalizacao;
                            $scope.objGraficoVendedor = {
                                'error'   : false,
                                'data'    : arrData,
                                'labels'  : arrLabels,
                                'colours' : arrColours,
                                'options' : {
                                    tooltipTemplate: "<%=label%>: R$ <%=value%>"
                                }
                            };
                        } else {

                            $scope.vlrGraficoVendedor = 0;
                            $scope.objGraficoVendedor['error'] = true;
                        }
                    } else {

                        $scope.vlrGraficoVendedor = 0;
                        $scope.objGraficoVendedor['error'] = true;
                    }
                });
            };

            /**
             * Método responsável em efetuar o cálculo da porcentagem para cada saldo de conta
             * financeira existente e posteriormente construir a legenda para o gráfico.
             */
            $scope.setLegendaSaldo = function(arrLegenda, vlrTotal) {

                if (! _.isEmpty(arrLegenda)) {

                    angular.forEach(arrLegenda, function(item, chave) {

                        var vlrPorcentagem = (item.gra_vlr_saldo / vlrTotal) * 100;
                        arrLegenda[chave]['gra_vlr_porcentagem'] = vlrPorcentagem.toFixed(2);
                    });

                    $scope.objLegendaSaldo = arrLegenda;
                }
            };

            /**
             * Método responsável em efetuar o cálculo da porcentagem para cada total de vendedor
             * existente e posteriormente construir a legenda para o gráfico.
             */
            $scope.setLegendaVendedor = function(arrLegenda, vlrTotalizacao) {

                if (! _.isEmpty(arrLegenda)) {

                    angular.forEach(arrLegenda, function(item, chave) {

                        var valor = (item.gra_vlr_total / vlrTotalizacao) * 100;
                        arrLegenda[chave]['gra_vlr_porcentagem'] = valor.toFixed(2);
                    });

                    $scope.objLegendaVendedor = arrLegenda;
                }
            };

            /**
             * Método responsável em inicializar o vetor com as contas financeiras.
             */
            $scope.setContasFinanceiras = function(objContas) {
                if (objContas) {

                    $scope.arrContasFinanceiras = [];
                    angular.forEach(objContas, function(i) {

                        $scope.arrContasFinanceiras.push(i.par_pai);
                    });
                }
            };

            /**
             * Método responsável em atualizar os dados do vetor de vendedores adicionando
             * o total de vendas de cada vendedor.
             */
            $scope.upVendedores = function(objTotalVendedores) {

                if (! _.isEmpty(objTotalVendedores)) {

                    angular.forEach($scope.objVendedores, function(oVendedor, iVendedor) {

                        angular.forEach(objTotalVendedores, function(oTotal) {

                            if (oVendedor.par_pai === oTotal.ret_vendedor)
                                $scope.objVendedores[iVendedor]['par_total'] = parseFloat(oTotal.ret_totalizacao);
                        });
                    });
                }
            };

            /**
             * Método responsável em inicializar o vetor com os vendedores.
             */
            $scope.setVendedores = function(objVendedores) {
                if (objVendedores) {

                    $scope.arrVendedores = [];
                    angular.forEach(objVendedores, function(i) {

                        $scope.arrVendedores.push(i.par_pai);
                    });
                }
            };

            /**
             * Método responsável em atualizar os dados do vetor de contas financeiras adicionando
             * o saldo da conta no mesmo.
             */
            $scope.upContasFinanceiras = function() {

                if (! _.isEmpty($scope.objSaldoContasFinanceiras)) {

                    angular.forEach($scope.objContasFinanceiras, function(iConta, kConta) {

                        angular.forEach($scope.objSaldoContasFinanceiras, function(iSaldo, kSaldo) {

                            var codSaldo = parseInt(kSaldo);
                            if (codSaldo === iConta.par_pai)
                                $scope.objContasFinanceiras[kConta]['par_saldo'] = iSaldo;
                        });
                    });
                }
            };

            /**
             * Método responsável em gerar o gráfico relativo ao faturamento anual do financeiro.
             */
            $scope.getGraficoFaturamentoAnual = function() {

                var anoAtual = new Date().getFullYear(), anoAnterior = anoAtual - 1;
                var arrSeries = [anoAtual, anoAnterior];

                $scope.setFaturamentoAnual(anoAtual);
                $scope.setFaturamentoAnual(anoAnterior);

                console.log($scope.objFaturamentoAnual);

                $timeout(function() {
                    var arrData = [
                        $scope.objFaturamentoAnual[anoAtual],
                        $scope.objFaturamentoAnual[anoAnterior]
                    ];

                    $scope.objAnosFaturamento = [anoAtual, anoAnterior];
                    $scope.objGraficoFaturamentoAnual = {
                        'data'    : arrData,
                        'series'  : arrSeries,
                        'colours' : $scope.objCores,
                        'labels'  : $scope.objMeses
                    };
                }, 8000);
            };

            /**
             * Método responsável em recolher os dados de faturamento anual de vendas relativos a um
             * determinado ano para posteriormente construir o gráfico.
             */
            $scope.setFaturamentoAnual = function(ano) {

                var arrFaturamento = [];
                var strFiltro = 'q=(tipo_rel:1,fin_dat_lan_ano:' + ano + ',vendas_validas_faturamento:1)';

                VendaService.relatorioVendas.get({u: strFiltro, op: 'venda'}, function(retorno) {
                    if (retorno.records) {

                        angular.forEach(retorno.records, function(iVenda) {

                            var mes = parseInt(iVenda.data_trunc.substr(5, 2), 10);
                            angular.forEach($scope.objMeses, function(iMes, kMes) {

                                var flagMes = mes - 1;
                                if (flagMes === kMes) {

                                    var vlrTotal = parseFloat(iVenda.soma_total);
                                    arrFaturamento[kMes] = vlrTotal;

                                } else {

                                    if (!arrFaturamento[kMes])
                                        arrFaturamento[kMes] = 0;
                                }
                            });
                        });

                        $scope.objFaturamentoAnual[ano] = _.isEmpty(arrFaturamento) ? GeralFactory.getArrZeros(12) : arrFaturamento;
                        /**
                         * console.log(ano, $scope.objFaturamentoAnual[ano]);
                         */
                    }
                });
            };

            /**
             * Método responsável em gerar o gráfico relativo às receitas e despesas do financeiro.
             */
            $scope.getGraficoReceitasDespesasAnual = function() {

                var ano = new Date().getFullYear();

                FinanceiroService.financas.reports({u: 'q=(tit_rel_tipo:1,tit_dat_year:' + ano + ')'}, function(retorno) {
                    if (retorno.records) {

                        var arrReceita = $scope.getArrGrafico(retorno.records['arr_receita']);
                        var arrDespesa = $scope.getArrGrafico(retorno.records['arr_despesa']);

                        $timeout(function() {
                            var arrSeries  = ['Receitas', 'Despesas'];
                            var arrDataset = [arrReceita, arrDespesa];

                            $scope.objGraficoReceitasDespesasAnual = {
                                'data'    : arrDataset,
                                'series'  : arrSeries,
                                'colours' : $scope.objCores,
                                'labels'  : $scope.objMeses,
                                'options' : {
                                    barStrokeWidth  : 1,
                                    barValueSpacing : 8
                                }
                            };
                        }, 5000);
                    }
                });
            };

            /**
             * Método responsável em gerar o gráfico relativo ao saldo dos centros de
             * custo existentes num determinado mês e ano.
             */
            $scope.getGraficoCentroCusto = function() {

                var tipo = 2, mes = parseInt($scope.objFiltro.mes), sistema = parseInt($scope.objFiltro.tipo);
                var strFiltro = GeralFactory.formatarPesquisar({
                    'tit_rel_tipo'     : tipo,
                    'tit_sistema'      : sistema,
                    'tit_dat_ex_month' : mes + 1,
                    'tit_dat_ex_year'  : new Date().getFullYear()
                });

                FinanceiroService.financas.reports({u: strFiltro}, function(retorno) {
                    if (! _.isEmpty(retorno.records)) {

                        var arrLabels = [], arrReport = [];
                        angular.forEach(retorno.records, function(item) {
                            if (item) {

                                arrLabels.push(item['tit_6050_desc']);
                                arrReport.push(item['tit_6050_soma'])
                            }
                        });

                        $timeout(function() {
                            var arrSeries  = ['Centro de Custo'];
                            var arrDataset = [arrReport];

                            var strCor = '';
                            switch (sistema) {
                                case 0:
                                    strCor = '#4EB23D';
                                    break;
                                case 1:
                                    strCor = '#619ED6';
                                    break;
                                case 2:
                                    strCor = '#F3B084';
                                    break;
                            }

                            $scope.objGraficoCentroCusto = {
                                'error'   : false,
                                'data'    : arrDataset,
                                'series'  : arrSeries,
                                'colours' : [strCor],
                                'labels'  : arrLabels,
                                'options' : {
                                    barStrokeWidth  : 1,
                                    barValueSpacing : 8
                                    /**
                                     * scales: {
                                     *      yAxes: [{
                                     *          display: false
                                     *      }]
                                     * }
                                     */
                                }
                            };
                        }, 1000);
                    } else {

                        $scope.objGraficoCentroCusto['error'] = true;
                    }
                });
            };

            /**
             * Método responsável em retornar o vetor no formato apropriado para construção
             * do gráfico de receitas e despesas.
             */
            $scope.getArrGrafico = function(arrDados) {

                var arrGrafico = [];
                angular.forEach(arrDados, function(item) {

                    var mes = parseInt(item.tit_mes_lan.substr(5, 2), 10);
                    angular.forEach($scope.objMeses, function(iMes, kMes) {

                        var flagMes = mes - 1;
                        if (flagMes === kMes) {

                            var vlrTotal = parseFloat(item.tit_vlr_total);
                            arrGrafico[kMes] = vlrTotal;

                        } else {

                            if (!arrGrafico[kMes])
                                arrGrafico[kMes] = 0;
                        }
                    });
                });

                return arrGrafico;
            };

            /**
             * Método responsável em imprimir os dados de um determinado relatório
             * escolhido pelo usuário da aplicação no dashboard.
             */
            $scope.imprimir = function(codRelatorio) {

                switch (codRelatorio) {
                    case 1:
                        alert('Relatório de Faturamento!');
                        break;

                    case 2:
                        alert('Relatório de Receitas e Despesas!');
                        break;

                    case 3:
                        $scope.getRelatorioSaldo();
                        break;
                }
            };

            /**
             * Método responsável em gerar o relatório de saldo das contas financeiras.
             */
            $scope.getRelatorioSaldo = function() {

                if ($scope.arrContasFinanceiras.length) {

                    var strContas = $scope.arrContasFinanceiras.join('|');
                    var strFiltro = GeralFactory.formatarPesquisar({
                        'tit_5010_conta_fin': strContas,
                        'ken': AuthTokenFactory.getToken()
                    });

                    $timeout(function() {

                        var url = GeralFactory.getUrlApi() + '/erp/export/financa/saldo/?' + strFiltro;
                        $window.open(url, 'Relatório');

                    }, 1000);
                }
            };

            $scope.getFaturamentoMensal = function(points, evt) {
                console.log(points, evt);
            };

            $scope.getReceitasDespesasMensal = function(points, evt) {
                console.log(points, evt);
            };

            $scope.getCentroCusto = function(points, evt) {
                console.log(points, evt);
            };

            /* ------------------------------------------------------------------------------------------------------ */

            $scope.zerar = function() {
                $scope.events.splice(0, $scope.events.length);
            };

            $scope.listarEventosPorDia = function (date, jsEvent, view) {

                $scope.arrEventoDia = [];
                $scope.arrAniversarianteDia = [];
                $scope.arrContaDia = [];

                $scope.flgMsg = false;

                var dataIni;
                var arrDat;

                if (date === undefined) {
                    var d = new Date();

                    dataIni = (('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear());
                    $scope.diaClicado = ('0' + d.getDate()).slice(-2);
                    $scope.diaSemana = GeralFactory.getArrDiasSemana(1)[d.getDay()];
                } else {


                    if (date.id == undefined) {
                        var d = new Date(date);
                        var w = d.getDay();
                        arrDat = date.format().split('-');

                    } else {

                        var dateStart = new Date(date.start).toUTCString();

                        dateStart = new Date(dateStart);

                        var w = dateStart.getDay();
                        arrDat = [dateStart.getFullYear(), ('0' + (dateStart.getMonth() + 1)).slice(-2), ('0' + (dateStart.getDate())).slice(-2)];

                    }

                    dataIni = (('0' + arrDat[2]).slice(-2) + '/' + ('0' + (arrDat[1])).slice(-2) + '/' + arrDat[0]);
                    $scope.diaClicado = ('0' + arrDat[2]).slice(-2);
                    $scope.diaSemana = GeralFactory.getArrDiasSemana(3)[w];
                }

                $scope.dataIni = dataIni;

                var objFiltro = {
                    'ano_dat_agenda_ini': dataIni,
                    'ano_dat_agenda_fim': dataIni
                };

                var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                ClienteService.clienteAnotacoes.listarEventos({u: strFiltro}, function (retorno) {

                    var somaPagar = 0, somaReceber = 0;
                    angular.forEach(retorno.records, function (reg, k) {

                        switch (reg.tipoEvento) {

                            case 1:
                                somaReceber = parseFloat(somaReceber) + parseFloat(reg.vlrLiquido);
                                $scope.arrContaDia.push(reg);
                                break;
                            case 2:
                                somaPagar = parseFloat(somaPagar) + parseFloat(reg.vlrLiquido);
                                $scope.arrContaDia.push(reg);
                                break;
                            case 3:
                                reg.start = reg.start.substr(11, 5); //.replace('-',':');
                                reg.corBg = 'background-color:'+reg.color;

                                $scope.arrEventoDia.push(reg);
                                break;
                            case 4:
                                $scope.arrAniversarianteDia.push(reg);
                                break;
                        }
                    });

                    $scope.somaReceber = somaReceber;
                    $scope.somaPagar = somaPagar;

                    $scope.flgMsg = true;

                });

            };

            $scope.montarAgendaHome = function () {

                $scope.uiConfig3 = {};
                $scope.evento = {};

                $scope.uiConfig3 = {
                    calendar: {
                        height: 370,
                        editable: false,
                        ignoreTimezone: true,
                        fixedWeekCount: false,
                        //theme:true,
                        header: {
                            left: '',
                            center: 'title',
                            right: 'prev,next'
                        },
                        dayClick: $scope.listarEventosPorDia,
                        viewRender: $scope.listarEventos
                    }
                };

            };


            /**
             * Abre janela de novo evento
             * @param ano_seq_ano
             */
            $scope.novoEvento = function (ano_seq_ano) {

                var scope = $rootScope.$new();

                scope.params = {};
                //scope.listaTipoEndereco  = $scope.listaTipoEndereco;

                scope.params.dataIni = $scope.dataIni;
                if (ano_seq_ano) {

                    scope.params.ano_seq_ano = ano_seq_ano;
                } else {
                }

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'home/views/janela-cadastrar-evento.html',
                    controller: 'EventoModalCtrl',
                    size: 'lg',
                    windowClass: 'center-modal',
                    scope: scope
                });

                modalInstance.result.then(function (id) {
                }, function (msg) {

                    if (msg === 'reload') {

                        $scope.listarEventosPorDia();

                        $scope.listarEventos();

                        $scope.events.splice(0, $scope.events.length);

                        // ClienteService.clienteEnderecos.get({cad_cod_cad : $scope.cliente.cad_cod_cad}, function(data) {
                        //     $scope.listaEndereco = data.records;
                        // });
                    }
                });

            };

            /* Change View */
            $scope.changeView = function (view, calendar) {
                uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
            };
            /* Change View */
            $scope.renderCalender = function (calendar) {
                if (uiCalendarConfig.calendars[calendar]) {
                    uiCalendarConfig.calendars[calendar].fullCalendar('render');
                }
            };


            $scope.listarEventos = function(view, element) {

                $scope.zerar();

                var calendar  = $('#calendar'),
                    anoBase   = calendar.fullCalendar('getDate').format('YYYY'),
                    mesBase   = calendar.fullCalendar('getDate').format('MM'),
                    ultDiaMes = GeralFactory.getUltimoDiaMes(mesBase),
                    dataIni   = ('01/' + mesBase + '/' + anoBase),
                    dataFim   = (ultDiaMes + '/' + mesBase + '/' + anoBase);

                var objFiltro = {
                    'ano_dat_agenda_ini': dataIni,
                    'ano_dat_agenda_fim': dataFim,
                    'agenda_mes_dashboard': true
                };

                var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                ClienteService.clienteAnotacoes.listarEventos({u : strFiltro}, function(retorno) {
                    for (var i = 0; i < retorno.records.length; i++)
                    {
                        arrD = retorno.records[i].start.split(' ');
                        $scope.events.push(retorno.records[i]);
                    }
                });
            };

            $scope.getColor = function(evento) {

                return (evento.color) ? evento.color : '#000';
            };

            $scope.eventSources = [ $scope.events ];
        }
    ]);