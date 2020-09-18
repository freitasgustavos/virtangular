
angular.module('newApp')

    .controller ('AgendaCtrl', [

        '$scope', '$rootScope', '$timeout', '$uibModal', 'GeralFactory', 'ParamsService', 'ClienteService', 'uiCalendarConfig', 'Wizard',

        function($scope, $rootScope, $timeout, $uibModal, GeralFactory, ParamsService, ClienteService, uiCalendarConfig, Wizard) {

            $rootScope.hasAutorizacao();

            if (! $rootScope.getPermissao('23')) {
                $location.path('/');
            }

            var date = new Date();
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();

            $scope.events    = [];
            $scope.evento    = {};
            $scope.objFiltro = {};
            $scope.objClone  = {};

            $scope.$on('$viewContentLoaded', function() {

                $scope.tipoAgenda = 'W';
                $scope.listarParams();
                $scope.montarAgenda();

                $timeout(function () {
                    Wizard.loadWizards.initialize(23);
                }, 2000);
            });

            /**
             *
             */
            $scope.listarParams = function() {

                $scope.arrStatus = [{
                    'id'   : '0',
                    'nome' : 'Pendente'
                }, {
                    'id'   : '1',
                    'nome' : 'Concluída'
                }, {
                    'id'   : '2',
                    'nome' : 'Cancelada'
                }];

                ParamsService.getParametros('2010', function(retorno) {
                    if (retorno) {
                        $scope.listaPerfilAgenda = retorno.arr_2010;
                    }
                });
            };

            /**
             *
             */
            $scope.zerar = function() {

                $scope.events = [];
            };

            /**
             * Spinner para a agenda.
             */
            $scope.spinner = {
                active : false,
                on  : function() {
                    this.active = true;
                },
                off : function() {
                    this.active = false;
                }
            };

            $scope.getNovoEvento = function(date,jsEvent, view) {

                $scope.arrEventoDia = [];
                $scope.flgMsg = false;

                var dateStart = new Date(date);
                var dateEnd = new Date(date);
                dateEnd.setMinutes(dateEnd.getMinutes()+30);

                $scope.dataIni = (('0' + dateStart.getDate()).slice(-2) + '/' + ('0' + (dateStart.getMonth()+1)).slice(-2) + '/' + dateStart.getFullYear());
                $scope.horaIni = ((('0' + dateStart.getHours()).slice(-2) + ':' + ('0' + (dateStart.getMinutes())).slice(-2)));
                $scope.dataFim = (('0' + dateEnd.getDate()).slice(-2) + '/' + ('0' + (dateEnd.getMonth()+1)).slice(-2) + '/' + dateEnd.getFullYear());
                $scope.horaFim = ((('0' + dateEnd.getHours()).slice(-2) + ':' + ('0' + (dateEnd.getMinutes())).slice(-2)));

                $scope.novoEvento();
            };

            $scope.novoEvento = function(ano_seq_ano) {

                var scope = $rootScope.$new();
                scope.params = {};

                scope.params.dataIni = $scope.dataIni;
                scope.params.horaIni = $scope.horaIni;
                scope.params.dataFim = $scope.dataFim;
                scope.params.horaFim = $scope.horaFim;

                if (ano_seq_ano) {

                    scope.params.ano_seq_ano = ano_seq_ano;
                }

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'home/views/janela-cadastrar-evento.html',
                    controller  : 'EventoModalCtrl',
                    size        : 'lg',
                    windowClass : 'center-modal',
                    scope       :  scope
                });

                modalInstance.result.then(function(id) { }, function(msg) {
                    if (msg === 'reload') {

                        $scope.listarEventos();
                        $scope.events.splice(0, $scope.events.length);
                    }
                });
            };

            $scope.getEditEvento = function(date, event) {

                console.log('el',date);
                console.log('diid:',date.id);
                $scope.novoEvento(date.ano_seq_ano);

            };

            $scope.atualizarResize = function(event, delta, revertFunc, jsEvent, ui, view ){
                console.log('hhhh');
                console.log('event:',event);
                console.log('-- delta: ',delta);

                var dateStart = new Date(event.start);
                var dateEnd = new Date(event.end);

                var dataIni = (dateStart.getDate()) + '/' + (dateStart.getMonth()+1) + '/' + dateStart.getFullYear();
                var horaIni = (dateStart.getHours()) + ':' + (dateStart.getMinutes());
                var dataFim = (dateEnd.getDate()) + '/' + (dateEnd.getMonth()+1) + '/' + dateEnd.getFullYear();
                var horaFim = (dateEnd.getHours()) + ':' + (dateEnd.getMinutes());

                $scope.evento.ano_seq_ano = event.ano_seq_ano;
                $scope.evento.data_escolhida_ini = dataIni;
                $scope.evento.hora_escolhida_ini = horaIni;
                $scope.evento.data_escolhida_fim = dataFim;
                $scope.evento.hora_escolhida_fim = horaFim;

                ClienteService.clienteAnotacao.atualizarEventoResize($scope.evento, function(resposta) {

                    if (! resposta.records.error) {
                    }

                    $scope.salvarEventoLoading = false;
                });
            };

            $scope.atualizarDrop = function(event, delta, revertFunc, jsEvent, ui, view ){
                console.log('atualizarDrop');
                console.log('event:',event);
                console.log('-- delta: ',delta);

                var dateStart = new Date(event.start);
                var dateEnd = new Date(event.end);

                var dataIni = (dateStart.getDate()) + '/' + (dateStart.getMonth()+1) + '/' + dateStart.getFullYear();
                var horaIni = (dateStart.getHours()) + ':' + (dateStart.getMinutes());
                var dataFim = (dateEnd.getDate()) + '/' + (dateEnd.getMonth()+1) + '/' + dateEnd.getFullYear();
                var horaFim = (dateEnd.getHours()) + ':' + (dateEnd.getMinutes());

                $scope.evento.ano_seq_ano = event.ano_seq_ano;
                $scope.evento.data_escolhida_ini = dataIni;
                $scope.evento.hora_escolhida_ini = horaIni;
                $scope.evento.data_escolhida_fim = dataFim;
                $scope.evento.hora_escolhida_fim = horaFim;
                $scope.evento.atualizar_data = true;

                ClienteService.clienteAnotacao.atualizarEventoResize($scope.evento, function(resposta) {

                    if (! resposta.records.error) {
                    }

                    $scope.salvarEventoLoading = false;
                });
            };

            /* Change View */
            $scope.changeView = function(view,calendar) {
                $('#calendar').fullCalendar('refetchEvents')
                uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
            };
            /* Change View */
            $scope.renderCalender = function(calendar) {

                if(uiCalendarConfig.calendars[calendar]){
                    uiCalendarConfig.calendars[calendar].fullCalendar('render');
                }
            };

            $scope.montarAgenda = function() {

                $scope.evento    = {};
                $scope.uiConfig2 = {};

                $scope.listarEventos();
                $scope.uiConfig2 = {
                    calendar: {
                        year           : date.getFullYear(),
                        month          : date.getMonth(),
                        date           : date.getDate(),
                        height         : 870,
                        defaultView    : 'agendaWeek',
                        timezone       : 'local',
                        ignoreTimezone : false,
                        editable       : true,
                        firstHour      : 8,
                        firstDay       : 0,
                        allDayText     : 'No dia',
                        timeFormat     : 'H:mm',
                        axisFormat     : 'HH:mm',
                        buttonText     : {
                            today : 'hoje',
                            month : 'mês',
                            week  : 'semana',
                            day   : 'dia'
                        },
                        columnFormat   : {
                            month : 'ddd',
                            week  : 'ddd D/M',
                            day   : 'dddd d/M'
                        },
                        header  : {
                            left   : 'month agendaWeek agendaDay',
                            center : 'title',
                            right  : 'prev,next'
                        },
                        dayClick    : $scope.getNovoEvento,
                        eventClick  : $scope.getEditEvento,
                        eventResize : $scope.atualizarResize,
                        eventDrop   : $scope.atualizarDrop,
                        viewRender  : function(view) {

                        },
                        eventRender: function(event, element) {
                            if (event.tipoEvento === 3) {

                                var html, status = event.ano_status, titulo = (event.title) ? event.title.trim() : '';
                                switch (status)
                                {
                                    case 0:
                                        html = '<span style="font-style:italic">' + titulo +  '</span>';
                                        break;
                                    case 1:
                                        html = '<span style="font-weight:bolder">' + titulo +  '</span>';
                                        break;
                                    case 2:
                                        html = '<span style="text-decoration:line-through">' + titulo +  '</span>';
                                        break;
                                    default:
                                        html = '<span>' + titulo + '</span>';
                                        break;
                                }

                                element.find('div.fc-title').html(html);
                            }
                        }
                    }
                };

                $timeout(function() {
                    angular.element('.fc-agendaWeek-button').click(function () {
                        $scope.tipoAgenda      = 'W';
                        $scope.objFiltro.dtIni = ($scope.objClone) ? $scope.objClone.dtIni : null;
                        $scope.objFiltro.dtFim = ($scope.objClone) ? $scope.objClone.dtFim : null;
                        $scope.onChangeCalendario();
                    });

                    angular.element('.fc-month-button').click(function() {
                        $scope.tipoAgenda      = 'M';
                        $scope.objFiltro.dtIni = null;
                        $scope.objFiltro.dtFim = null;
                        $scope.onChangeCalendario();
                    });

                    angular.element('.fc-agendaDay-button').click(function () {
                        $scope.tipoAgenda = 'D';
                    });

                    angular.element('.fc-prev-button').click(function() {
                        $scope.triggerEventos({
                            'fDias' : 'delDiasData',
                            'fMes'  : 'getDatasMesAnterior'
                        });
                    });

                    angular.element('.fc-next-button').click(function() {
                        $scope.triggerEventos({
                            'fDias' : 'addDiasData',
                            'fMes'  : 'getDatasProximoMes'
                        });
                    });
                });
            };

            /**
             *
             */
            $scope.triggerEventos = function(objFuncao) {

                var trigger = false;
                switch ($scope.tipoAgenda) {
                    case 'W':
                        $scope.objFiltro.dtIni = GeralFactory[objFuncao.fDias]($scope.objFiltro.dtIni, 7);
                        $scope.objFiltro.dtFim = GeralFactory[objFuncao.fDias]($scope.objFiltro.dtFim, 7);

                        $scope.objClone = angular.copy($scope.objFiltro);
                        trigger = true;
                        break;

                    case 'M':
                        var arrDatas = GeralFactory[objFuncao.fMes]($scope.objFiltro.dtIni);
                        $scope.objFiltro.dtIni = arrDatas['dtInicio'];
                        $scope.objFiltro.dtFim = arrDatas['dtFinal'];
                        trigger = true;
                        break;
                }

                if (trigger) {
                    $scope.events.splice(0, $scope.events.length);
                    $scope.listarEventos();
                }
            };

            /**
             *
             */
            $scope.limparCalendario = function($event) {

                $event.stopPropagation();
                $scope.objFiltro.ano_2010_calendario = undefined;
                $scope.onChangeCalendario();
            };

            /**
             *
             */
            $scope.limparSituacao = function($event) {

                $event.stopPropagation();
                $scope.objFiltro.ano_status = undefined;
                $scope.onChangeCalendario();
            };

            /**
             *
             */
            $scope.onChangeCalendario = function(flag) {
                if (flag) {
                    $scope.objFiltro.dtIni = ($scope.objClone) ? $scope.objClone.dtIni : null;
                    $scope.objFiltro.dtFim = ($scope.objClone) ? $scope.objClone.dtFim : null;
                }

                $scope.events.splice(0, $scope.events.length);
                $scope.listarEventos();
            };


            /**
             *
             */
            $scope.listarEventos = function() {

                $scope.spinner.on();

                if (!$scope.objFiltro.dtIni && !$scope.objFiltro.dtFim) {

                    switch ($scope.tipoAgenda) {
                        case 'W':
                            var objDias = GeralFactory.getInicioFimSemana();
                            break;

                        case 'M':
                            var objDias = GeralFactory.getInicioFimMes();
                            break;
                    }

                    $scope.objFiltro.dtIni = objDias['dtInicio'];
                    $scope.objFiltro.dtFim = objDias['dtFinal'];
                }

                var objFiltro = {
                    'ano_dat_agenda_ini' : $scope.objFiltro.dtIni,
                    'ano_dat_agenda_fim' : $scope.objFiltro.dtFim
                };

                if ($scope.objFiltro.ano_2010_calendario)
                    objFiltro['ano_2010_calendario'] = $scope.objFiltro.ano_2010_calendario;

                if ($scope.objFiltro.ano_status)
                    objFiltro['ano_status'] = $scope.objFiltro.ano_status;


                var strFiltro = GeralFactory.formatarPesquisar(objFiltro);

                console.log($scope.objFiltro.dtIni, $scope.objFiltro.dtFim, $scope.tipoAgenda);

                ClienteService.clienteAnotacoes.listarEventos({u : strFiltro}, function(retorno) {
                    if (! _.isEmpty(retorno.records)) {
                        for (var i = 0; i < retorno.records.length; i++) {

                            $scope.events.push(retorno.records[i]);
                        }
                    }

                    $timeout(function() {
                        $scope.spinner.off();
                    }, 800);
                });
            };

            /**
             * Poupula o calendário!
             */
            $scope.eventSources = [$scope.events];
        }
    ]);