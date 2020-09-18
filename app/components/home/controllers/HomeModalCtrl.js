
angular.module('newApp')

    .controller ('EventoModalCtrl', [

        '$scope', '$rootScope', '$modalInstance', '$uibModal', 'GeralFactory', 'ParamsService', 'ClienteService', 'UsuarioService','AuthTokenFactory',

        function($scope, $rootScope, $modalInstance, $uibModal, GeralFactory, ParamsService, ClienteService, UsuarioService, AuthTokenFactory) {
            $rootScope.hasAutorizacao();

            $modalInstance.opened.then(function() {

                $scope.arrStatus = [{
                    'id'   : 0,
                    'nome' : 'Pendente'
                }, {
                    'id'   : 1,
                    'nome' : 'Concluída'
                }, {
                    'id'   : 2,
                    'nome' : 'Cancelada'
                }];

                $scope.evento = {
                    repetirEvento : {}
                };

                ParamsService.getParametros('2010', function(data) {
                    if (data) {
                        $scope.listaPerfilAgenda = data.arr_2010;
                    }
                });

                $scope.evento.ano_2010_calendario = '1';

                $scope.objFiltroCliente = {
                    'cad_tip_cli_for' : 1
                };

                $scope.arrUsuario = [];

                $scope.listarUsuario();

                $scope.evento.data_escolhida_ini = $scope.params.dataIni;

                if ($scope.params.ano_seq_ano) {

                    $scope.evento.ano_seq_ano = $scope.params.ano_seq_ano;
                    $scope.getEvento($scope.evento.ano_seq_ano);

                } else {

                    var d1 = new Date(), d2 = new Date();

                    d1.setHours(8);
                    d1.setMinutes(0);

                    d2.setHours(9);
                    d2.setMinutes(0);

                    $scope.evento.data_escolhida_fim = $scope.evento.data_escolhida_ini;
                    $scope.evento.hora_ini   = d1;
                    $scope.evento.hora_fim   = d2;
                    $scope.evento.ano_status = 0;
                }

                $scope.ocorrenciasEnabled = true;
                $scope.dataFimEnabled     = true;
            });


            $scope.onChangeHoraInicial = function () {

                var d = angular.copy($scope.evento.hora_ini);

                d.setTime(d.getTime() + (1*60*60*1000));

                $scope.evento.hora_fim = d;

            };

             /**
             * Abre o modal para definir a repetição do evento
             */
            $scope.modalRepetirEvento = function() {

                var scope = $rootScope.$new();

                $scope.setRepetirEventoParams();

                var modalInstance = $uibModal.open({
                    animation   :  true,
                    templateUrl : 'agenda/views/janela-repetir-evento.html',
                    controller  : 'EventoModalCtrl',
                    size        : 'md',
                    windowClass : 'center-modal',
                    scope       :  scope
                });

                modalInstance.result.then(function(id) { }, function(obj) {

                    $scope.evento.repetirEvento = obj;
                    $scope.fraseResumoRepetir   = obj.mensagem;

                    /**
                     * console.log($scope.fraseResumoRepetir);
                     * console.log($scope.repetirEvento);
                     */
                });
            };

            /**
             * seta as variáveis para a repetição do evento
             */
            $scope.setRepetirEventoParams = function () {

                // 0 - nada, 1 - diário, 2 - semanal, 3 - mensal, 4 - anual
                $scope.repetirEventoParams = {
                    repeticao        : '',
                    dataInicio       : $scope.evento.data_escolhida_ini,
                    tipoFim          : '',
                    ocorrencias      : '',
                    dataFim          : '',
                    repeteACada      :  0,
                    labelRepeteACada : 'Dia',
                    mensagem         : ''
                };
            };

            /**
             * Define o resumo para a repetição do evento
             */
            $scope.resumoRepetirEvento = function () {

                $scope.ocorrenciasEnabled = true;
                $scope.dataFimEnabled     = true;

                $scope.repeteACada  = parseInt($scope.repetirEventoParams.repeteACada);
                $scope.ocorrencias  = '';
                $scope.dataFim      = '';
                $scope.eventoResumo = '';

                if($scope.repetirEventoParams.repeticao){

                    if($scope.repetirEventoParams.repeticao == 1){

                        $scope.repetirEventoParams.labelRepeteACada = 'Dia';

                        if($scope.repetirEventoParams.repeteACada && $scope.repetirEventoParams.repeteACada > 0){

                            $scope.repetirEventoParams.labelRepeteACada = 'Dias';
                            $scope.eventoResumo = 'A cada ' + $scope.repeteACada + ' dias ';
                        }else{

                            $scope.eventoResumo = 'Diário ';
                        }
                    }else if($scope.repetirEventoParams.repeticao == 2){

                        $scope.repetirEventoParams.labelRepeteACada = 'Semana';

                        if($scope.repetirEventoParams.repeteACada && $scope.repetirEventoParams.repeteACada > 0){

                            $scope.repetirEventoParams.labelRepeteACada = 'Semanas';
                            $scope.eventoResumo = 'A cada ' + $scope.repeteACada + ' semanas ';
                        }else {

                            $scope.eventoResumo = 'Semanal ';
                        }
                    }else if($scope.repetirEventoParams.repeticao == 3){

                        $scope.repetirEventoParams.labelRepeteACada = 'Mês';

                        if($scope.repetirEventoParams.repeteACada && $scope.repetirEventoParams.repeteACada > 0){

                            $scope.repetirEventoParams.labelRepeteACada = 'Meses';
                            $scope.eventoResumo = 'A cada ' + $scope.repeteACada + ' meses ';
                        }else {

                            $scope.eventoResumo = 'Mensal ';
                        }
                    }else if($scope.repetirEventoParams.repeticao == 4){

                        $scope.repetirEventoParams.labelRepeteACada = 'Ano';

                        if($scope.repetirEventoParams.repeteACada && $scope.repetirEventoParams.repeteACada > 0){

                            $scope.repetirEventoParams.labelRepeteACada = 'Anos';
                            $scope.eventoResumo = 'A cada ' + $scope.repeteACada + ' anos ';
                        }else {

                            $scope.eventoResumo = 'Anual ';
                        }
                    }
                }

                if($scope.repetirEventoParams.dataInicio){

                    $scope.eventoResumo = $scope.eventoResumo + ' começando em ' + $scope.repetirEventoParams.dataInicio;
                }

                if($scope.repetirEventoParams.tipoFim){

                    if($scope.repetirEventoParams.tipoFim == 1){

                        $scope.ocorrenciasEnabled = false;
                        $scope.dataFimEnabled     = true;

                        $scope.repetirEventoParams.dataFim = '';

                        if($scope.repetirEventoParams.ocorrencias != '' && $scope.repetirEventoParams.ocorrencias != undefined && $scope.repetirEventoParams.ocorrencias != null){

                            $scope.eventoResumo = $scope.eventoResumo + ', ' + $scope.repetirEventoParams.ocorrencias + ' vezes ';
                        }
                    }else if($scope.repetirEventoParams.tipoFim == 2){

                        $scope.ocorrenciasEnabled = true;
                        $scope.dataFimEnabled     = false;

                        $scope.repetirEventoParams.ocorrencias = '';

                        if($scope.repetirEventoParams.dataFim != '' && $scope.repetirEventoParams.dataFim != undefined && $scope.repetirEventoParams.dataFim != null){

                            $scope.eventoResumo = $scope.eventoResumo  + ' terminando em ' + $scope.repetirEventoParams.dataFim;
                        }
                    }
                }

                return $scope.eventoResumo;
            };

            $scope.salvarRepetirEvento = function () {

                $scope.salvarEventoLoading = true;

                $scope.$watch('forms.formRepetirEvento', function(form) {

                    if (form) {

                        if (form.$invalid) {

                            $scope.submitted = true;
                            $scope.salvarEventoLoading = false;

                        } else {

                            $scope.repetirEvento = $scope.repetirEventoParams;
                            $scope.repetirEventoParams.mensagem = '<strong>Este evento repetirá conforme definido: </strong>' + $scope.resumoRepetirEvento();

                            $scope.salvarEventoLoading = false;
                            $scope.fecharModal($scope.repetirEvento);
                        }
                    }
                });
            };

            /**
             * Ao escolher algum cliente.
             */
            $scope.onSelectCliente = function(obj) {

                $scope.getCliente(obj.cad_cod_cad);
                $scope.evento.clienteSelect   = obj.cad_nome_razao;
                $scope.evento.ano_cad_cod_cad = obj.cad_cod_cad;
            };

            /**
             * Adiciona um cliente pelo plugin de autocomplete
             * @param termo
             */
            $scope.addCliente = function(termo) {

                var objCliente = {
                    'cad_pf_pj'       : 1,
                    'cad_eh_inativo'  : 0,
                    'cad_tip_cli_for' : 1,
                    'cad_nome_razao'  : termo.trim()
                };

                ClienteService.clientes.create(objCliente, function(retorno) {

                    $scope.evento.ano_cad_cod_cad = retorno.records.cad_cod_cad;
                    $scope.evento.clienteSelect   = termo.trim();
                });
            };

            /**
             * Obtém dados de um determinado cliente.
             */
            $scope.getCliente = function(cad_cod_cad) {

                ClienteService.cliente.get({cad_cod_cad : cad_cod_cad}, function(retorno) {

                    $scope.evento.clienteSelect   = retorno.records.cad_nome_razao;
                    $scope.evento.ano_cad_cod_cad = retorno.records.cad_cod_cad;
                });
            };

            /**
             * Listar os agrupamentos de produtos.
             */
            $scope.listarUsuario = function(nome) {

                UsuarioService.usuarios.get({u : ''}, function(data) {

                    $scope.arrUsuario = data.records;
                });
            };

            $scope.salvarEvento = function() {

                $scope.salvarEventoLoading = true;
                $scope.$watch('forms.formEvento', function(form) {
                    if (form) {
                        if (form.$invalid) {

                            $scope.submitted = true;
                            $scope.salvarEventoLoading = false;

                        } else {

                            $scope.evento.hora_escolhida_ini = GeralFactory.getHourFromDate($scope.evento.hora_ini);
                            $scope.evento.hora_escolhida_fim = GeralFactory.getHourFromDate($scope.evento.hora_fim);

                            if ($scope.evento.ano_seq_ano) {

                                console.log('Atualizar evento!');
                                console.log($scope.evento);

                                ClienteService.clienteAnotacao.atualizarEvento($scope.evento, function(resposta) {

                                    if (! resposta.records.error) {

                                        $modalInstance.dismiss('reload');
                                    }

                                    $scope.salvarEventoLoading = false;
                                });
                            } else {

                                console.log('Inserir evento!');
                                console.log($scope.evento);

                                ClienteService.clienteAnotacoes.criarEvento($scope.evento, function(resposta) {

                                    if (! resposta.records.erro) {

                                        $modalInstance.dismiss('reload');
                                    }

                                    $scope.salvarEventoLoading = false;
                                });
                            }
                        }
                    }
                });
            };

            /**
             * Retorna o registro do evento
             * @param ano_seq_ano
             */
            $scope.getEvento = function(ano_seq_ano) {

                ClienteService.clienteAnotacao.getEvento({ano_seq_ano : ano_seq_ano}, function(data) {

                    var d1 = new Date(), d2 = new Date();

                    $scope.evento = data.records;
                    $scope.evento.ano_2010_calendario = $scope.evento.ano_2010_calendario.toString();

                    var horaIni = $scope.evento.hora_escolhida_ini.split(':');
                    var horaFim = $scope.evento.hora_escolhida_fim.split(':');

                    d1.setHours(parseInt(horaIni[0]));
                    d1.setMinutes(parseInt(horaIni[1]));

                    d2.setHours(parseInt(horaFim[0]));
                    d2.setMinutes(parseInt(horaFim[1]));

                    $scope.evento.hora_ini = d1;
                    $scope.evento.hora_fim = d2;

                    if ($scope.evento.ano_cad_cod_cad) {

                        $scope.getCliente($scope.evento.ano_cad_cod_cad);
                    }
                });

            };

            /**
             * Método responsável em remover um determinado evento.
             */
            $scope.cancelarEvento = function() {

                GeralFactory.confirmar('Deseja remover o evento?', function() {

                    var objeto = {ano_seq_ano : $scope.evento.ano_seq_ano};
                    ClienteService.clienteAnotacao.cancelarEvento(objeto, function(retorno) {

                        console.log('rr:',retorno);
                        $modalInstance.dismiss('reload');
                    });
                });

            };

            $scope.fecharModal = function(str) {

                $modalInstance.dismiss(str);
            };
        }
    ]);


angular.module('newApp').controller('TermoAceiteModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$window', '$uibModalInstance', 'EmpresaService', 'GeralFactory', 'AuthTokenFactory', 'Storage',

    function($scope, $rootScope, $timeout, $window, $uibModalInstance, EmpresaService, GeralFactory, AuthTokenFactory, Storage) {

        $scope.forms       = {};
        $scope.objEmpresa  = {};

        $uibModalInstance.opened.then(function() {

            $scope.objEmpresa = $scope.params.objEmpresa;
            $timeout(function() {
                var arrUsuario = Storage.usuario.getUsuario();
                if (arrUsuario.is_cdl) {

                    $scope.objEmpresa.is_parceiro = 1;
                    $scope.objParceiro = {
                        'alias' : 'CDL Uberlândia',
                        'sigla' : 'CDL'
                    };
                } else {

                    $scope.objEmpresa.is_parceiro = 0;
                    $scope.objParceiro = {
                        'nome'  : 'LOJISTA VIRTUAL',
                        'alias' : 'LOJISTA'
                    };
                }
            });

            $uibModalInstance.hasAlteracao = false;
        });


        /**
         * Método responsável em aceitar o termo de ACEITE.
         */
        $scope.aceitar = function() {

            $scope.termoAceiteSimLoading = true;
            if (! _.isEmpty($scope.objEmpresa)) {

                $timeout(function() {
                    $scope.objEmpresa.emp_termo_aceite = 1;
                    $scope.salvar('termoAceiteSimLoading');
                });
            }
        };


        /**
         * Método responsável em negar o termo de ACEITE.
         */
        $scope.negar = function() {

            $scope.termoAceiteNaoLoading = true;
            if (! _.isEmpty($scope.objEmpresa)) {

                $timeout(function() {
                    $scope.objEmpresa.emp_termo_aceite = 0;
                    $scope.salvar('termoAceiteNaoLoading');
                });
            }
        };


        /**
         * Método responsável em gerar o termo de ACEITE para impressão.
         */
        $scope.imprimir = function() {

            if (! _.isEmpty($scope.objEmpresa)) {

                var strFiltro  = GeralFactory.formatarPesquisar({
                    'acao'        : 'I',
                    'cod_termo'   :  2,
                    'ken'         : AuthTokenFactory.getToken(),
                    'is_parceiro' : $scope.objEmpresa.is_parceiro,
                    'ident_emp'   : $scope.objEmpresa.emp_ident_emp
                });

                var url = GeralFactory.getUrlApi() + '/erp/export/termo/?' + strFiltro;
                $window.open(url, 'Termo de Adesão');
            }
        };


        /**
         * Salva os dados da empresa com o termo de ACEITE.
         */
        $scope.salvar = function(strLadda) {

            EmpresaService.empresa.update($scope.objEmpresa, function(retorno) {
                if (! retorno.records.error) {

                    $rootScope.setSisEmp($scope.objEmpresa);
                    $scope[strLadda] = false;

                    $timeout(function() {

                        $uibModalInstance.objEmpresa   = $scope.objEmpresa;
                        $uibModalInstance.hasAlteracao = true;
                        $scope.fecharModal('cancel');

                    }, 2000);
                }
            });
        };


        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);

angular.module('newApp').controller('AlertaMigrarUpModalCtrl', [

    '$scope', '$rootScope', '$timeout', '$window', '$uibModalInstance', 'EmpresaService', 'GeralFactory', 'AuthTokenFactory', 'Storage', 'LoginService',

    function($scope, $rootScope, $timeout, $window, $uibModalInstance, EmpresaService, GeralFactory, AuthTokenFactory, Storage, LoginService) {


        $uibModalInstance.opened.then(function() {

            $scope.migrarLoading = false;
            $scope.objModal = { };

            $scope.objModal.dtInicio = GeralFactory.getDataAtualBr();

            if($rootScope.objUsuario.is_cdl) {
                $scope.objModal.url     = 'https://www.cdlgestao.org.br/';
                $scope.objModal.urlDesc = 'https://www.CDLGestao.org.br/';
                $scope.objModal.solName = 'CDLGestão';
                $scope.objModal.dtFim   = '21/06/2018';
            } else {
                $scope.objModal.url     = 'https://www.upgestao.com.br/';
                $scope.objModal.urlDesc = 'https://www.UpGestao.com.br/';
                $scope.objModal.solName = 'UpGestão';
                $scope.objModal.dtFim   = '14/06/2018';
            }

            var diaFimAlerta = ($rootScope.objUsuario.is_cdl) ? 21 : 14,
                dataFim      = new Date(2018,6-1,diaFimAlerta),
                hoje         = new Date();

            dataFim.setHours(0,0,0,0);
            hoje.setHours(0,0,0,0);

            $scope.objModal.diffDias = GeralFactory.diffDates($scope.objModal.dtInicio,$scope.objModal.dtFim) * ((hoje >= dataFim) ? -1 : 1);
            $scope.objModal.tempoExcedido = ($scope.objModal.diffDias > 0);
        });

        /**
         * Método responsável em gerar o termo de ACEITE para impressão.
         */
        $scope.migrar = function() {

            $scope.migrarLoading = true;

            LoginService.logout.get({}, function (resposta) {
                if (!resposta.records.error) {
                    Storage.implementacao.clear();
                    window.localStorage.removeItem('wizard');

                    $rootScope.isLogado = Storage.usuario.isLogado();
                    $rootScope.objUsuario = {};

                    AuthTokenFactory.setToken();
                    $window.location = $scope.objModal.url;
                }
            });
        };

        /**
         * Efetua o fechamento da janela modal.
         */
        $scope.fecharModal = function(str) {

            $uibModalInstance.dismiss(str);
        };
    }
]);