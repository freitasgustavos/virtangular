'use strict';

angular.module('newApp')

    .factory('GeralFactory', function(CONFIG, Storage, $notification, prompt, $timeout) {
        return {
            notify: function (acao, title, msg) {
                var container = '';
                var style = 'box';
                var position = 'topCenter';
                var openAnimation = 'animated fadeIn';
                var closeAnimation = 'animated fadeOut';
                var method = 6000;
                var type = acao;

                var ic = (acao === 'success') ? 'fa-check-circle' : 'fa-warning';

                //var content = '<div class="alert alert-' + acao + ' media fade in"><p><i class="fa '+ic+' "></i>&nbsp;&nbsp;<strong>' + title + '</strong></p><p>' + msg + '</p></div>';
                var content = '<div style="padding: 4px; padding-bottom:2px" class="alert alert-' + acao + ' media fade in"><strong><p style="font-size:13px;text-align: center">' + msg + '</p></strong></div>';

                if (container === '') {
                    var n = noty({
                        text: content,
                        type: type,
                        dismissQueue: true,
                        layout: position,
                        closeWith: ['click'],
                        theme: 'made',
                        maxVisible: 10,
                        animation: {
                            open: openAnimation,
                            close: closeAnimation,
                            easing: 'swing',
                            speed: 100
                        },
                        timeout: method,
                        buttons: '',
                        callback: {
                            onShow: function () {
                            }
                        }
                    });
                }
            },

            scrollToTop: function(delay) {
                delay = delay || 1000;
                $timeout(function() {
                    angular.element('html, body').animate({scrollTop:0}, 'slow');
                }, delay);
            },

            scrollToElement: function(elem, fator, delay) {
                delay = delay || 1000;
                fator = fator || 0;
                $timeout(function() {
                    elem = angular.element(elem);
                    angular.element('body').animate({scrollTop : elem.offset().top + fator}, 'slow');
                }, delay);
            },

            notificar: function (response) {
                if (!response.data.records.error) {
                    this.notify('success', response.data.records.title || '', response.data.records.msg);
                } else {
                    this.notify('danger', response.data.records.title || '', response.data.records.msg);
                }
            },

            verificarNaN : function(valor) {
                return (isNaN(valor) ? 0 : valor);
            },

            isInt : function(n) {
                return n % 1 === 0;
            },

            getStringEstoque : function(strSaldo) {

                var saldo = parseFloat(strSaldo);
                
                return (this.isInt(saldo)) ? saldo : strSaldo.replace('.', ',');
            },

            ehVazioCombo: function (item) {

                if (item.nome_real == '') {
                    this.notify('danger', 'Atenção!', 'Digite alguma descrição');
                    return true;
                }

                return false;
            },

            retornarSomaDiaData: function (somaDias) {
                var myDate = new Date(new Date().getTime() + (somaDias * 24 * 60 * 60 * 1000));
                return ('0' + myDate.getDate()).slice(-2) + '/' + ('0' + (myDate.getMonth() + 1)).slice(-2) + '/' + myDate.getFullYear();
            },

            somaHora : function(horario,num) {
              
                var concatena = '';
                var arrH = horario.split(':');

                console.log('sss:' ,arrH[0]);
                console.log('sss11:' ,num);
                var valorSoma = parseInt(parseInt(arrH[0]) + num);

                console.log('valorSoma:' ,valorSoma);
                
                if(valorSoma > 0 && valorSoma < 10) {
                    concatena = '0';
                }
                
                if(valorSoma > 23) {
                    return '00:00';
                } else {
                    console.log('ccc:',concatena+valorSoma + ':00');
                    return concatena+valorSoma + ':00';
                }

            },

            inArray : function(needle, haystack) {
                var length = haystack.length;
                for(var i = 0; i < length; i++)
                {
                    if(haystack[i] == needle) return true;
                }
                return false;
            },

            /**
             * Retorna para o formato 4,10
             */
            toReais : function(num) {

                return num.toFixed(2).replace('.', ',');
            },

            formataObjSelect : function(arr,put0) {

                var arrFinal = [];
                angular.forEach(arr,function(reg,i) {

                    var objReg = {};
                    if(put0 && i < 10) {
                        i = '0'+i;
                    }
                    objReg.id = i;
                    objReg.nome = reg;
                    arrFinal.push(objReg);

                });

                return arrFinal;
            },

            confirmar: function (texto, funcao, titulo, funcaoCancel, labelNo, labelOk) {

                titulo  = titulo  || 'Confirmação:';
                labelNo = labelNo || 'Não';
                labelOk = labelOk || 'Sim';

                prompt({
                    title      : titulo,
                    message    : texto,
                    buttons    : [{
                        label  : labelNo,
                        cancel : true,
                        class  : 'btn-danger pull-left'
                    }, {
                        label   : labelOk,
                        primary : true,
                        class   : 'btn-primary m-r-0'
                    }]
                }).then(function() {

                    funcao.call();

                }, function() {

                    if (funcaoCancel) {
                        funcaoCancel.call();
                    }
                });
            },

            /**
             * Retorna a data atual no formato dd/mm/yyyy
             * @returns {string}
             */
            getDataAtualBr: function () {

                var data = new Date();
                return ('0' + data.getDate()).substr(-2) + '/' + ('0' + (data.getMonth() + 1)).substr(-2) + '/' + data.getFullYear();
            },

            /**
             * Converte uma DD/MM/YYYY para YYYY-MM-DD HH:II:SS
             * @param d
             * @returns {string}
             */
            getDataAtualBrBanco : function(d) {

                var data = new Date();
                if (d) {

                    var arr  = d.split('/');
                    var hora = data.getHours(), minutos = data.getMinutes();

                    return arr[2] + '-' + arr[1] + '-' + arr[0] + ' ' + hora + ':' + minutos + ':00';
                }

                return '';
            },

            /**
             * Converte uma DD/MM/YYYY para YYYY-MM-DD
             * @param d
             * @returns {string}
             */
            getDataAtual: function(d) {

                if (d) {

                    var arr  = d.split('/');
                    return arr[2] + '-' + arr[1] + '-' + arr[0];
                }

                return '';
            },

            /**
             * Retorna o ultimo dia de determinado mes. Se nao passar nada retorna o ultimo dia do mes atual.
             * @returns {string}
             */
            getUltimoDiaMes: function (mes) {

                var data = new Date();
                var m = (mes) ? mes : ('0' + (data.getMonth() + 1)).substr(-2);

                return (new Date(data.getFullYear(), m, 0)).getDate();
            },

            /**
             * Retorna o primeiro dia de determinado mês.
             * @returns {string}
             */
            getPrimeiroDiaMes: function() {

                var arrDataAtual = this.getDataAtualBr().split('/');
                return '01/' + arrDataAtual[1] + '/' + arrDataAtual[2];
            },

            /**
             * Retorna a diferença em dias para a data corrente.
             * @returns {string}
             */
            getDiferencaDias: function (diferenca) {

                diferenca = diferenca || 1;

                var d = new Date();
                d.setDate(d.getDate() - diferenca);

                return this.getFormatoJsBr(d);
            },

            /**
             * Retorna a data de inicio e fim da semana de acordo com o dia corrente.
             * @returns {object}
             */
            getInicioFimSemana: function () {
                var hoje = new Date();

                // Primeiro dia da semana:
                var primeiroDia = hoje.getDate() - hoje.getDay();
                var numDomingo, ultimoDia;

                // Último dia da semana:
                numDomingo = 6 - hoje.getDay();
                ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + numDomingo);

                return {
                    dtInicio: this.getFormatoJsBr(new Date(hoje.setDate(primeiroDia))),
                    dtFinal: this.getFormatoJsBr(ultimoDia)
                };
            },

            /**
             * Retorna um vetor contendo as datas de ínicio e fim do mês corrente.
             * @param data
             * @returns {object}
             */
            getInicioFimMes: function() {

                var date = new Date();
                var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

                return {
                    dtInicio: this.getFormatoJsBr(firstDay),
                    dtFinal: this.getFormatoJsBr(lastDay)
                };
            },

            /**
             * Método responsável em adicionar uma quantidade determinada de dias
             * numa determinada data mencionada.
             * @param data
             * @param qtdeDias
             * @returns {string}
             */
            addDiasData: function (data, qtdeDias) {

                var objData = this.getObjetoJsDate(data);
                data = objData.setDate(objData.getDate() + qtdeDias);

                return this.getFormatoJsBr(new Date(data));
            },

            /**
             * Verifica a quantidade de dias de um mês.
             * @param month
             * @param year
             * @returns {number}
             */
            daysInMonth: function(month, year) {
                return new Date(year, month, 0).getDate();
            },

            /**
             * Método responsável em remover uma quantiade determinada de dias
             * numa determinada data mencionada.
             * @param data
             * @param qtdeDias
             * @returns {string}
             */
            delDiasData: function (data, qtdeDias) {

                var objData = this.getObjetoJsDate(data);
                data = objData.setDate(objData.getDate() - qtdeDias);

                return this.getFormatoJsBr(new Date(data));
            },

            /**
             * Retorna um vetor contendo as datas de ínicio e fim do próximo mês
             * a partir da data mencionada pelo usuário.
             * @param data
             * @returns {object}
             */
            getDatasProximoMes: function (data) {

                var objData = this.getObjetoJsDate(data);
                objData.setMonth(objData.getMonth() + 1, 1);

                var objRetorno = {
                    'dtInicio': this.getFormatoJsBr(new Date(objData)),
                    'dtFinal': this.getFormatoJsBr(new Date(objData.getFullYear(), objData.getMonth() + 1, 0))
                };

                return objRetorno;
            },

            /**
             * Método responsável em retornar a descrição contendo as parcelas para os títulos.
             * @param descOficial
             * @param qtdeParcelas
             * @param parcela
             * @returns {string}
             */
            getDescTitulo: function(descOficial, qtdeParcelas, parcela) {

                if (descOficial) {

                    parcela = parcela || 1;
                    qtdeParcelas = qtdeParcelas || 1;

                    // Quando existir apenas uma parcela, pois a descrição do título vem sem as parcelas!
                    if (qtdeParcelas === 1) {

                        qtdeParcelas = qtdeParcelas + 1;

                        var string = descOficial + ' [' + parcela + '/' + qtdeParcelas + ']';
                        return string;

                    } else {

                        qtdeParcelas = qtdeParcelas + 1;

                        var replace = '[' + parcela + '/' + qtdeParcelas + ']';
                        string = descOficial.replace(/\[[\d]+\/[\d]+\]/g, replace); // Procura por [1/12] (Exemplo)!

                        return string;
                    }
                }

                return '';
            },

            /**
             * Retorna um vetor contendo as datas de ínicio e fim do mês anterior
             * a partir de uma data mencionada pelo usuário.
             * @param data
             * @returns {object}
             */
            getDatasMesAnterior: function (data) {

                var objData = this.getObjetoJsDate(data);
                objData.setMonth(objData.getMonth() - 1, 1);

                var objRetorno = {
                    'dtInicio': this.getFormatoJsBr(new Date(objData)),
                    'dtFinal': this.getFormatoJsBr(new Date(objData.getFullYear(), objData.getMonth() + 1, 0))
                };

                return objRetorno;
            },

            /**
             * Retorna um objeto do tipo DATE para um determinada data no formato DD/MM/YYYY.
             * @param data
             * @returns {string}
             */
            getObjetoJsDate: function (data) {

                var arrData = data.split('/');
                return new Date(arrData[2], arrData[1] - 1, arrData[0]);
            },

            /**
             * Método responsável em retornar um data formata DD/MM/YYY a partir de um objeto DATE.
             * @param d
             * @return {string}
             */
            getDataFormatada: function(d) {
                return ('0' + d.getDate()).substr(-2) + '/' + ('0' + (d.getMonth() + 1)).substr(-2) + '/' + d.getFullYear();
            },

            /**
             * Método responsável em retornar um data formata DD/MM/YYY a partir de um objeto DATE.
             * @param d
             * @return {string}
             */
            getDataFormatadaBanco: function(d) {
                var str = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).substr(-2) + '-' + ('0' + d.getDate()).substr(-2) + ' 00:00:00';
                return str;
            },

            /**
             * Formata a data contida no objeto JS para o formato DD/MM/YYYY
             * @param data
             * @returns {string}
             */
            getFormatoJsBr: function (data) {
                return ('0' + data.getDate()).substr(-2) + '/' + ('0' + (data.getMonth() + 1)).substr(-2) + '/' + data.getFullYear()
            },

            /**
             * Formata o modo yyyy-mm-dd hh:ii:ss ou yyyy-mm-dd para o formato dd/mm/yyyy
             * @param data
             * @returns {string}
             */
            formatarDataBr: function (data) {
                if (data) {
                    var arrData, arrDataHora;
                    if (data.length > 12) {

                        arrDataHora = data.split(' ');
                        data = arrDataHora[0];
                    }

                    arrData = data.split('-');
                    return arrData[2] + '/' + arrData[1] + '/' + arrData[0];
                }

                return '';
            },

            /**
             * Recolhe a midia principal de um determinado produto.
             */
            getFirstMidia: function(objProduto) {

                var strMidia = ((objProduto.produto_imagem.length > 0) ? CONFIG.CACHE_IMG + objProduto.produto_imagem[0].mid_id : '../app/images/sem-imagem.jpg');

                return strMidia;
            },

            /**
             * Formata um float com ponto para float com virgula (padrao BR). Ex: 1.5 para 1,5
             */
            formatarFloatBr: function (v) {

                if (v) {

                    return v.replace('.', ',');
                }

                return '';
            },

            getFotosProduto: function (arrFotos) {
                var html = '';

                if (arrFotos) {
                    html += '<div class="widget widget_slider p-t-0">';
                    html += '<div class="responsive-slick" data-arrows="true" data-num-slides="3" data-num-scroll="3">';

                    angular.forEach(arrFotos, function (i, j) {
                        html += '<div class="slide" style="width:126px">';
                        html += '<img class="product" src="' + CONFIG.CACHE_IMG + i.mid_id + '">';
                        html += '<button type="button" class="btn btn-sm btn-danger btn-image" data-mid-nro="' + i.mid_nro + '"><i class="fa fa-remove"></i></button>';
                        html += '</div>';
                    });

                    html += '</div>';
                    html += '</div>';
                }

                return html;
            },

            allReplace : function(retStr, obj) {
                for (var x in obj) {
                    retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
                }
                return retStr;
            },

            /**
             * Retona a string da pesquisa formatada no padrão da API
             * @param arr
             */
            formatarPesquisar: function (arr,comp) {

                var arrFiltro = new Array(), strFiltro = '';

                angular.forEach(arr, function (item, key) {
                    if (item || item === 0) {

                        if (typeof (item) === 'object') {

                            if (item.length) {
                                arrFiltro.push(key + ':' + item.join('|'));
                            }
                        } else {

                            arrFiltro.push(key + ':' + item);
                        }
                    }
                });

                if (arrFiltro.length) {
                    strFiltro = 'q=(' + arrFiltro.join(',') + ')';
                }

                if(comp != '' && comp != undefined) {

                    if (strFiltro == '') {
                        strFiltro = comp;
                    } else {
                        strFiltro = strFiltro + '&' + comp;
                    }
                }

                return strFiltro;
            },

            getUrlApi: function () {

                var objUsuario = Storage.usuario.getUsuario();
                return CONFIG.HOSTNAME + objUsuario.ident_emp;
            },

            getUrlApi1: function () {

                var objUsuario = Storage.usuario.getUsuario();
                return CONFIG.HOSTNAME_1 + objUsuario.ident_emp;
            },

            getCepFretePartido: function (cep) {

                var tam = cep.length;

                switch (tam) {

                    case 1:
                        return [cep.substring(0, 1), '', ''];
                        break;
                    case 2:
                        return [cep.substring(0, 2), '', ''];
                        break;
                    case 3:
                        return [cep.substring(0, 2), cep.substring(2, 3), ''];
                        break;
                    case 4:
                        return [cep.substring(0, 2), cep.substring(2, 4), ''];
                        break;
                    case 5:
                        return [cep.substring(0, 2), cep.substring(2, 5), ''];
                        break;
                    case 6:
                        return [cep.substring(0, 2), cep.substring(2, 5), cep.substring(5, 6)];
                        break;
                    case 7:
                        return [cep.substring(0, 2), cep.substring(2, 5), cep.substring(5, 7)];
                        break;
                    case 8:
                        return [cep.substring(0, 2), cep.substring(2, 5), cep.substring(5, 8)];
                        break;
                }
            },

            formatarNCM: function(ncm) {

                if (ncm) {

                    var retorno = ncm.trim();
                    return retorno.substring(0, 4) + '.' + retorno.substring(4, 6) + '.' + retorno.substring(6, 8);
                }
                return null;
            },

            getDimensaoAproxBanner: function (pos, codTemplate) {


                codTemplate = codTemplate.toString();

                switch (codTemplate) {

                    case '1':
                        switch (pos) {
                            case 'A1':
                                return '1170 x 240 pixels';
                                break;
                            case 'B1':
                                return '1170 x 240 pixels';
                                break;
                        }
                        break;

                    case '2':
                        switch (pos) {
                            case 'A1':
                                return '570 x 568 pixels';
                                break;
                            case 'A2':
                                return '225 x 225 pixels';
                                break;
                            case 'B1':
                                return '1170 x 240 pixels';
                                break;
                        }
                        break;

                    case '3':
                        switch (pos) {
                            case 'A1':
                                return '1170 x 240 pixels';
                                break;
                            case 'B1':
                                return '1170 x 240 pixels';
                                break;
                        }
                        break;

                    case '4':
                        switch (pos) {
                            case 'A1':
                                return '1170 x 240 pixels';
                                break;
                            case 'E1':
                                return '270 x 490 pixels';
                                break;
                            case 'B1':
                                return '1170 x 240 pixels';
                                break;
                        }
                        break;
                }
            },

            currencyDecimal : function(input) {

                input = input.toString();

                var v;
                var arr = [];

                if(input.match(/\./)) {
                    arr = input.split('.');
                } else {
                    arr[0] = input;
                }


                // console.log('arr1:',arr);
                if(arr[1] == '') {

                    input = input.replace('.','');
                }


                if(arr[1] == undefined) {
                    // console.log('if1');
                    v = arr[0]+'.00';

                } else if(arr[1].length == 1) {

                    v = arr[0]+'.'+arr[1]+'0';
                    // console.log('else1');
                } else {
                    v = input;
                }

                // console.log('v2: ' ,v);

                if(!input.match(/\./)) {
                    v = input+'.00';
                }

                // console.log('v3:',v);

                var arr2 = v.split('.');

                // console.log('arr2: ',arr2);

                var c = arr2[1].length;
                var d = ',';
                var t = '.';

                if(c > 4) {
                    c = 4;
                }

                var n = v;
                c = isNaN(c = Math.abs(c)) ? 2 : c;

                d = d == undefined ? "." : d;
                t = t == undefined ? "," : t;
                s = n < 0 ? "-" : "";
                i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c)));
                j = (j = i.length) > 3 ? j % 3 : 0;

                return 'R$ '+ s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");

            },

            roundNumber : function (num, scale) {
                if(!("" + num).includes("e")) {
                    return +(Math.round(num + "e+" + scale)  + "e-" + scale);
                } else {
                    var arr = ("" + num).split("e");
                    var sig = "";
                    if(+arr[1] + scale > 0) {
                        sig = "+";
                    }
                    return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
                }
            },

            /**
             * Emite a janela de notificação do html5
             * @param data
             */
            notificacaoHtml5: function (data) {

                $notification(data.not_titulo, {
                    body: data.not_desc,
                    dir: 'auto',
                    lang: 'en',
                    tag: 'my-tag',
                    icon: 'app/images/dollar.png',
                    delay: 8000, // in ms
                    focusWindowOnClick: true // focus the window on click
                });
            },

            /**
             * Retorna os meses. Se tipo = 1 -> mes completo. Se tipo = 2 -> mes abreviado
             * @param tipo
             * @returns {string[]}
             */
            getArrMeses: function (tipo) {

                switch (tipo) {
                    case 1:
                        return ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                    case 2:
                        return ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

                }
            },

            /**
             * Retorna os dias da semana. Se tipo = 1 -> dia completo. Se tipo = 2 -> dia abreviado
             * @param tipo
             * @returns {string[]}
             */
            getArrDiasSemana: function (tipo) {

                switch (tipo) {
                    case 1:
                        return ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                    case 2:
                        return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
                    case 3:
                        return ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado','Domingo'];
                }
            },

            /**
             * Retorna um array de posições zeradas
             * @param n
             * @returns {Array}
             */
            getArrZeros: function (n) {

                var arr = [];
                for (var i = 0; i < n; i++) {
                    arr.push(0);
                }
                return arr;
            },

            /**
             * Método responsável em verificar a existência de um item numa lista que
             * esteja carregando o componente TYPEAHEAD.
             * @param arrItens
             * @param item
             * @param chave
             * @param callback
             */
            verificarItem: function (arrItens, item, chave, callback) {
                if (arrItens) {
                    var keepGoing = true;
                    angular.forEach(arrItens, function (i, j) {
                        if (keepGoing) {
                            var descItem = i[chave].trim();
                            if (descItem === item) {
                                keepGoing = false;
                            }
                        }
                    });
                    callback(keepGoing);
                }
            },

            /**
             * Método responsável em construir o JSON contendo os dados para criação
             * da árvore através do plugin Angular TreeView.
             * @param arrItens
             * @param attrId
             * @param attrIdPai
             * @param attrLabel
             */
            getJSONTree: function (arrItens, attrId, attrIdPai, attrLabel, entidade, selectedPai) {

                angular.forEach(arrItens, function (item, chave) {
                    var id = entidade + '-' + item[attrId];
                    var idPai = entidade + '-' + item[attrIdPai];

                    item['id'] = id;
                    item['parent_id'] = idPai;
                    item['label'] = item[attrLabel];
                });

                function getTreeRecursiva(array, parent, tree) {
                    var idNulo = entidade + '-null';

                    tree = typeof tree !== 'undefined' ? tree : [];
                    parent = typeof parent !== 'undefined' ? parent : {id: idNulo};

                    var children = _.filter(array, function (child) {

                        if (selectedPai === child.id) {
                            child['selected'] = 'selected';
                        }

                        return child.parent_id == parent.id;
                    });

                    if (!_.isEmpty(children)) {
                        if (parent.id == idNulo || parent.id == null) {
                            tree = children;
                        } else {
                            parent['children'] = children
                        }
                        _.each(children, function (child) {
                            getTreeRecursiva(array, child)
                        });
                    }

                    return tree;
                }

                return getTreeRecursiva(arrItens);
            },

            /**
             * Método responsável em construir o JSON contendo os dados para criação
             * da árvore através do plugin Angular TreeView.
             * var objJSONTree = GeralFactory.getJSONTree($scope.objTela.object, attrId, attrLabel, attrParent, selectedParent, selectedId);
             * @param arrItens
             * @param attrId
             * @param attrLabel
             * @param attrPai
             * @param selectedParent
             * @param selectedId
             */
            getJSONTreeOld: function (arrItens, attrId, attrLabel, attrPai, selectedParent, selectedId) {
                var retorno = {}, items = {};

                var j = 0;
                for (var i = 0; i < arrItens.length; i++) {
                    var item = arrItens[i];

                    var valueId = item[attrId],
                        valuePai = item[attrPai],
                        valueLabel = item[attrLabel];

                    if (valueId !== selectedId) {

                        var aliasId = '';
                        if (items[valuePai]) {

                            aliasId = 'role-' + valueId;
                            var item = {id: aliasId, label: valueLabel};

                            if (selectedParent === aliasId) {
                                item.selected = 'selected';
                            }

                            if (!items[valuePai].children) {
                                items[valuePai].children = [];
                            }

                            items[valuePai].children[items[valuePai].children.length] = item;
                            items[valueId] = item;

                        } else {

                            aliasId = 'role-' + valueId;
                            items[valueId] = {id: aliasId, label: valueLabel, children: []};

                            if (selectedParent === aliasId) {
                                items[valueId].selected = 'selected';
                            }

                            retorno[valueId] = items[valueId];
                            j++;
                        }
                    }
                }
                return retorno;
            },

            /**
             * Busca em um multarray um registro, passando o array que queremos buscar, o valor da chave do registro e o nome da chave.
             * Ex: no array arrFase que é um multarray com as fases do sistema procuramos qual a cor do par_filho = 1. Então passamos:
             * 1- array da fase, 2- "1", 3- "par_filho". Retornamos então o registro inteiro relacionado a esse par_filho
             * @param arr
             * @param codChave
             * @param chave
             */
            getRegistroPorChave: function (arr, codChave, chave) {

                var ret = [];
                angular.forEach(arr, function (reg,k) {

                    if (codChave == reg[chave]) {
                        ret = reg;
                    }
                });

                return ret;
            },

            /**
             * Verifica se um determinado objeto é vazio {}.
             * @param obj
             * @returns {boolean}
             */
            isObjEmpty: function(obj) {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop))
                        return false;
                }
                return JSON.stringify(obj) === JSON.stringify({});
            },

            /**
             * Retorna o icone da açao
             * @param codAcao
             */
            getDescAcao : function(codAcao) {

                switch(codAcao) {
                    case 0:
                        return ['fa fa-edit','Ação de Rascunho, nota ainda não foi gerada.','edição','Edição'];
                        break;
                    case 1:
                        return ['fa fa-dollar','Venda Faturada, porém ainda não obteve retorno da Sefaz','faturamento','Faturado'];
                        break;
                    case 8:
                        return ['fa fa-minus-circle text-danger','Retorno Cancelada','cancelamento','Cancelado'];
                        break;
                    case 9:
                        return ['fa fa-check text-success','Ação Concluída','conclusão','Concluído'];
                        break;
                    case 10:
                        return ['fa fa-shopping-basket text-danger','Não concluído (e-commerce)','Não Concluído'];
                        break;
                    default:
                        return ['fa fa-edit','Ação de Rascunho, nota ainda não foi gerada.','Edição'];
                        break;
                }
            },

            getAbrDescEspDoc : function(codEspDoc,sit,nat) {

                if(sit == '81'
                    && codEspDoc != 57
                    && codEspDoc != 65
                    && codEspDoc != 59
                    && codEspDoc != 30
                    && codEspDoc != 2
                ) {

                    return 'NF';
                } else {

                    switch(codEspDoc) {
                        case 10:
                            return (nat == 31) ?  'OS' : 'DAV';
                        case 11:
                            return 'PED';
                            break;
                        case 55:
                            return 'NFe';
                            break;
                        case 57:
                            return 'CTe';
                            break;
                        case 65:
                            return 'NFC';
                            break;
                        case 88:
                            return 'NFS';
                            break;
                        case 59:
                            return 'SAT';
                            break;
                        case 30:
                            return 'CUP';
                            break;
                        case 2:
                            return 'NFD';
                            break;
                        case 115:
                            return 'INS';
                            break;
                        case 116:
                            return 'PRO';
                            break;
                        default:
                            return '';
                            break;
                    }
                }




            },

            /**
             * Retorna um valor hexadecimal randômico para cor.
             * @returns String
             */
            getHexaColor: function() {
                var hexaColor = '#' + (function co(lor){ return (lor +=
                        [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
                    && (lor.length == 6) ?  lor : co(lor); })('');

                return hexaColor;
            },

            /**
             * Retorna um icone de uma determinada forma de pagamento
             * @returns String
             */
            getIconFormaPgto : function(str) {

                if (str) {
                    if(str.match(/dinheiro/gi)) {
                        return 'fa-money';
                    } else if (str.match(/visa/gi)) {
                        return 'fa-cc-visa';
                    } else if (str.match(/mastercard/gi)) {
                        return 'fa-cc-mastercard';
                    } else if (str.match(/boleto/gi)) {
                        return 'fa-barcode';
                    } else if (str.match(/Cart/gi)) {
                        return 'fa-credit-card';
                    } else if (str.match(/Transf/gi)) {
                        return 'fa-exchange';
                    }
                }

                return 'fa-check';
            },

            /**
             * Verifica se a forma de pagamento é de boleto bancário.
             * @param str
             * @return {boolean}
             */
            isPgtoBoleto : function(objConta) {

                if (! _.isEmpty(objConta)) {
                    if (objConta.hasOwnProperty('tit_forma_pgto')) {

                        var descPgto = objConta.tit_forma_pgto.par_c01;
                        if (descPgto) {
                            if (descPgto.match(/boleto/gi)) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            },

            /**
             * Retorna um objeto Date contendo a data de acordo com o formato aceito na base de dados.
             * @param String
             * @returns Object
             */
            getDateFromBD : function(strData) {

                if (strData) {

                    var arrData = strData.trim().split(' ');
                    arrData = arrData[0].split('-');

                    return new Date(parseInt(arrData[0]), parseInt(arrData[1]) - 1, parseInt(arrData[2]));
                }

                return null;
            },

            /**
             * Retorna a diferença em dias de duas datas.
             * @param String strData1
             * @param String strData2
             * @returns Integer
             */
            diffDates : function(strData1, strData2) {

                if (strData1 && strData2) {

                    var objData1 = this.getObjetoData(strData1), objData2 = this.getObjetoData(strData2);

                    var d1 = new Date(objData1.ano, objData1.mes, objData1.dia);
                    var d2 = new Date(objData2.ano, objData2.mes, objData2.dia);

                    var timeDiff = Math.abs(d2.getTime() - d1.getTime());
                    return Math.ceil(timeDiff / (1000 * 3600 * 24));
                }

                return null;
            },

            /**
             * Retorna a hora no formato HH::MM a partir de uma data.
             */
            getHourFromDate: function(data) {

                if (data) {

                    return ((data.getHours() < 10 ? '0' : '') + data.getHours()) + ':' + ((data.getMinutes() < 10 ? '0' : '') + data.getMinutes());
                }
                return null;
            },

            /**
             * Método responsável em retornar um objeto contendo o dia, mês e ano
             * de uma determinada data.
             */
            getObjetoData : function(strData) {
                var arrData = strData.split('/');
                return {
                    'dia' : parseInt(arrData[0]),
                    'mes' : parseInt(arrData[1]) - 1,
                    'ano' : parseInt(arrData[2])
                };
            },

            /**
             * Método responsável em remover os caracteres especiais de uma string.
             * @param  String
             * @return String
             */
            rmCaracteresEspeciais : function(string) {

                if (string) {

                    string = string.replace(/[á|ã|â|à]/gi, 'a');
                    string = string.replace(/[é|ê|è]/gi, 'e');
                    string = string.replace(/[í|ì|î]/gi, 'i');
                    string = string.replace(/[õ|ò|ó|ô]/gi, 'o');
                    string = string.replace(/[ú|ù|û]/gi, 'u');
                    string = string.replace(/[ç]/gi, 'c');
                    string = string.replace(/[ñ]/gi, 'n');
                    string = string.replace(/[á|ã|â]/gi, 'a');
                    string = string.replace(/[^a-zA-Z0-9 ]/g, "");

                    return string;
                }

                return '';
            },

            /**
             * Método responsável em retornar o código do frete para a venda escolhida.
             * @param   Integer
             * @returns Integer
             */
            getTipoFrete : function(tpFrete) {

                var codFrete = 0;
                if (tpFrete) {

                    codFrete = (tpFrete === 5 || tpFrete === 6) ? 4 : tpFrete;
                }

                return codFrete;
            },

            /**
             * Método responsável em retornar a descrição do frete para a venda escolhida.
             * @param   String
             * @returns String
             */
            getDescFrete : function(tpFrete) {

                var descFrete = 'Nenhum';
                if (tpFrete) {

                    switch (tpFrete) {
                        case 1:
                            descFrete = 'Frete gratis';
                            break;
                        case 2:
                            descFrete = 'Frete fixo';
                            break;
                        case 3:
                            descFrete = 'Frete a combinar';
                            break;
                        case 5:
                            descFrete = 'PAC';
                            break;
                        case 6:
                            descFrete = 'Sedex';
                            break;
                    }
                }

                return descFrete;
            },

            /**
             * Substitui alguns caracteres de uma determinada STRING por um outro caracter desejado.
             * @param String str
             * @param Array  find
             * @param String replace
             */
            replaceArray : function(str, find, replace) {

                if (str) {

                    for (var i = 0; i < str.length; i++) {
                        for (var j = 0; j < find.length; j++) {
                            if (str[i] === find[j]) {

                                str = str.substr(0, i) + ((replace) ? replace : '') + str.substr(i + 1);
                            }
                        }
                    }
                }

                return str;
            },

            /**
             * Método que retorna uma STRING contendo os valores de um determinado atributo do ARRAY.
             * @param Array  arrItens
             * @param String attr
             */
            getStringFiltroOffArray : function(arrItens, attr) {

                var strItens = '';

                if (arrItens) {

                    var arrAux = [];
                    angular.forEach(arrItens, function(item) {
                        if (attr && item[attr] !== '' && item[attr] !== undefined && item[attr] !== null) {
                            arrAux.push(item[attr]);
                        }
                    });

                    strItens = arrAux.join('|');
                }

                return strItens;
            },

            /**
             *
             * @param $fileContent
             * @returns {{lines: (*|Array), tipoImportacao: string}}
             */
            qtdRegistrosTXT : function($fileContent){

                var content = $fileContent;

                var lines = content.split("\n");
                var header = lines[0].split("|");

                return header;
            },

            /**
             * Tipos da não tributação
             */
            listarTiposNaoTributacao : function() {

                return  [{
                    id   :  '0',
                    nome : 'Nenhum'
                }, {
                    id   :  '1',
                    nome : 'Isento'
                }, {
                    id   :  '2',
                    nome : 'Não Tributado'
                }, {
                    id   :  '3',
                    nome : 'Outras'
                }];
            },

            listarPeriodicidade : function() {

                return [{
                    'id'        : 0,
                    'sigla'     : 'N',
                    'descricao' : 'Nenhuma'
                }, {
                    'id'        : 15,
                    'sigla'     : 'Q',
                    'descricao' : 'Quinzenal'
                }, {
                    'id'        : 30,
                    'sigla'     : 'M',
                    'descricao' : 'Mensal'
                }, {
                    'id'        : 90,
                    'sigla'     : 'T',
                    'descricao' : 'Trimestral'
                }, {
                    'id'        : 180,
                    'sigla'     : 'S',
                    'descricao' : 'Semestral'
                }, {
                    'id'        : 365,
                    'sigla'     : 'A',
                    'descricao' : 'Anual'
                }];
            },

            listarTipoEmissao : function() {

                return [{
                    'id'        : 'P',
                    'nome' : 'Com nota própria'
                }, {
                    'id'        : 'T',
                    'nome' : 'Com nota de terceiros'
                }];
            },

            listarModeloReferenciado : function() {

                return [{
                    'id'        : '4',
                    'nome' : '04 - Nota Fiscal de Produtor Rural'
                },{
                    'id'        : '10',
                    'nome' : '10 - Nota Fiscal Série Única'
                }, {
                    'id'        : '11',
                    'nome' : '11 - Nota Fiscal Série D (Consumidor)'
                }, {
                    'id'        : '30',
                    'nome' : '30 - Cupom Fiscal (emitido por ECF)'
                }, {
                    'id'        : '2',
                    'nome' : '55 - Nota Fiscal Eletrônica'
                }, {
                    'id'        : '65',
                    'nome' : '65 - Cupom Fiscal Eletrônica'
                }];
            },


            listarAcoes : function() {

                return [{
                    'id'   : 0,
                    'name' : 'Edição'
                }, {
                    'id'   : 1,
                    'name' : 'Faturado'
                }, {
                    'id'   : 8,
                    'name' : 'Cancelado'
                }, {
                    'id'   : 9,
                    'name' : 'Concluído'
                }, {
                    'id'   : 10,
                    'name' : 'Não concluído (E-commerce)'
                }];
            },

            listarCamposCorrigir : function() {

                return [{
                    id   :  '1',
                    nome : 'Razão Social'
                }, {
                    id   :  '2',
                    nome : 'Endereço'
                }, {
                    id   :  '3',
                    nome : 'Município'
                }, {
                    id   :  '4',
                    nome : 'Estado'
                }, {
                    id   :  '5',
                    nome : 'N. Inscrição no CNPJ/CPF'
                }, {
                    id   :  '6',
                    nome : 'N. Inscrição Estadual'
                }, {
                    id   :  '7',
                    nome : 'Natureza da Operação'
                }, {
                    id   :  '8',
                    nome : 'Cod. Fiscal da Operação'
                }, {
                    id   :  '9',
                    nome : 'Via de Transporte'
                }, {
                    id   :  '10',
                    nome : 'Data da Emissão'
                }, {
                    id   :  '11',
                    nome : 'Data da Saída'
                }, {
                    id   :  '12',
                    nome : 'Unidade (produto)'
                }, {
                    id   :  '13',
                    nome : 'Descrição dos Produtos'
                }, {
                    id   :  '14',
                    nome : 'Classificação Fiscal'
                }, {
                    id   :  '15',
                    nome : 'Nome do Transportador'
                }, {
                    id   :  '16',
                    nome : 'End. do Transportador'
                }, {
                    id   :  '17',
                    nome : 'Termo de Isenção do IPI'
                }, {
                    id   :  '18',
                    nome : 'Termo de Isenção ICMS'
                }, {
                    id   :  '19',
                    nome : 'Peso Bruto/Líquido'
                }, {
                    id   :  '20',
                    nome : 'Vol Marca / N / Quant.'
                }, {
                    id   :  '21',
                    nome : 'N. Nota Fiscal'
                }, {
                    id   :  '22',
                    nome : 'Dados Adicionais'
                }, {
                    id   :  '23',
                    nome : 'Outras Informações'
                }];
            },

            listarModFrete : function() {
                return [{
                    id   :  0,
                    nome : 'Por conta do emitente'
                }, {
                    id   :  1,
                    nome : 'Por conta do destinatário'
                }, {
                    id   :  2,
                    nome : 'Por conta de terceiros'
                }, {
                    id   :  9,
                    nome : 'Sem frete'
                }];
            },

            listarUnidades : function() {

                return [
                    {
                        id : 'UN',
                        nome : 'Unidade'
                    },
                    {
                        id : 'PC',
                        nome : 'Peça'
                    },
                    {
                        id : 'CX',
                        nome : 'Caixa'
                    },
                    {
                        id : 'LT',
                        nome : 'Litro'
                    },
                    {
                        id : 'KG',
                        nome : 'Kilograma'
                    },
                    {
                        id : 'PCT',
                        nome : 'Pacote'
                    }
                ];
            },

            listarCamposCceCte : function () {

                return [{
                    'campo' : 'CFOP',
                    'rotulo' : 'CFOP'
                }, {
                    'campo' : 'natOp',
                    'rotulo' : 'Nat. Operação'
                }, {
                    'campo' : 'forPag',
                    'rotulo' : 'Forma Pagamento'
                }, {
                    'campo' : 'cMunEnv',
                    'rotulo' : 'Cod. Municipio Envio'
                }, {
                    'campo' : 'xMunEnv',
                    'rotulo' : 'Nome Municipio Envio'
                }, {
                    'campo' : 'UFEnv',
                    'rotulo' : 'UF Municipio Envio'
                }, {
                    'campo' : 'cMunIni',
                    'rotulo' : 'Cod. Municipio Inicio'
                }, {
                    'campo' : 'xMunIni',
                    'rotulo' : 'Nome Municipio Inicio'
                }, {
                    'campo' : 'UFIni',
                    'rotulo' : 'UF Municipio Inicio'
                }, {
                    'campo' : 'cMunFim',
                    'rotulo' : 'Cod. Municipio Fim'
                }, {
                    'campo' : 'xMunFim',
                    'rotulo' : 'Nome Municipio Fim'
                }, {
                    'campo' : 'UFFim',
                    'rotulo' : 'UF Municipio Fim'
                }, {
                    'campo' : 'retira',
                    'rotulo' : 'Retira'
                }, {
                    'campo' : 'xDetRetira',
                    'rotulo' : 'Detalhes Retira'
                }, {
                    'campo' : 'RENAVAM',
                    'rotulo' : 'RENAVAM'
                }, {
                    'campo' : 'placa',
                    'rotulo' : 'Placa'
                }, {
                    'campo' : 'tara',
                    'rotulo' : 'Tara'
                }, {
                    'campo' : 'capKG',
                    'rotulo' : 'Capacidade Kg'
                }, {
                    'campo' : 'capM3',
                    'rotulo' : 'Capacidade M3'
                }, {
                    'campo' : 'tpProp',
                    'rotulo' : 'Tipo Propriedade'
                }, {
                    'campo' : 'tpVeic',
                    'rotulo' : 'Tipo Veiculo'
                }, {
                    'campo' : 'tpRod',
                    'rotulo' : 'Tipo Rodado'
                }, {
                    'campo' : 'tpCar',
                    'rotulo' : 'Tipo Carroceria'
                }];
            },

            /**
             * Obtem o doc nro pelo num da chave
             * @param ch
             * @returns {string}
             */
            getNroDocPorChave : function(ch) {

                ch = ch.trim();
                console.log('qtd:',ch.length);
                if(ch.length == 44) {
                    var nnf = ch.substr(25,9);
                    console.log('nnf: ',nnf);
                    return parseInt(nnf);
                }
            },

            /**
             * Seleciona todos o campos do tipo checkbox em uma determina tabela HTML.
             * @param tabela
             */
            checkTableInputs: function(tabela) {

                if (tabela) {
                    var table = angular.element('#' + tabela).parent().parent().parent().parent();
                    if (table.length) {
                        var arrInputs = table.find('i.fa-square-o');
                        if (arrInputs.length) {
                            angular.forEach(arrInputs, function(item) {
                                angular.element(item).removeClass('fa-square-o').addClass('fa-check-square-o');
                            });
                        }
                    }
                }
            },

            /**
             * Limpa todos os campos do tipo radio ou check de uma determinada tabela HTML.
             * @param string tabela
             * @param string tipo
             */
            clearTableInputs: function(tabela, tipo) {

                if (tabela && tipo) {

                    var objTipo = {};
                    switch (tipo)
                    {
                        case 'radio':
                            objTipo = {'normal':'fa-circle-o', 'checked':'fa-check-circle'};
                            break;

                        case 'checkbox':
                            objTipo = {'normal':'fa-square-o', 'checked':'fa-check-square-o'};
                            break;
                    }

                    var table = angular.element('#' + tabela).parent().parent().parent().parent();
                    if (table.length) {
                        var arrInputs = table.find('i.' + objTipo['checked']);
                        if (arrInputs.length) {
                            angular.forEach(arrInputs, function(item) {
                                angular.element(item).removeClass(objTipo['checked']).addClass(objTipo['normal']);
                            });
                        }
                    }
                }
            }
            
        }
    })

    .factory('AuthTokenFactory', function AuthTokenFactory($rootScope, $window, jwtHelper, Storage) {
        'use strict';

        var store = $window.localStorage, key = 'auth-token-virtux';
        return {
            getToken : getToken,
            setToken : setToken
        };

        function getToken() {
            var tokenStorage = store.getItem(key);
            if (tokenStorage) {
                if (jwtHelper.isTokenExpired(tokenStorage)) {
                    store.removeItem(key);
                    Storage.implementacao.clear();
                    window.localStorage.removeItem('wizard');

                    $rootScope.isLogado = Storage.usuario.isLogado();
                    $rootScope.objUsuario = {};

                    this.setToken();
                    location.reload('/');
                }

                return tokenStorage;
            } else {
                return false;
            }
        }

        function setToken(token) {
            if (token) {
                store.setItem(key, token);
            } else {
                store.removeItem(key);
            }
        }
    })

    .factory('NotifyFlag', function($window) {

        var store = $window.localStorage, key = 'notify-flag';
        return {

            setFlag : function(flag) {
                store.setItem(key, flag);
            },

            getFlag : function() {
                var flag = store.getItem(key);
                if (flag !== null) {
                    return flag;
                } else {
                    return true;
                }
            },

            deleteFlag : function () {
                store.removeItem(key);
            }

        };
    })

    .factory('focus', function($timeout, $window) {
        return function(id) {
            $timeout(function() {
                var element = $window.document.getElementById(id);
                if(element)
                    element.focus();
            });
        };
    })

    .factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory) {
        'use strict';

        return {
            request : addToken
        };

        function addToken(config) {
            var token = AuthTokenFactory.getToken();
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = 'Bearer ' + token;
            }
            return config;
        }
    })

    // .factory('socket', function($rootScope, AuthTokenFactory, CONFIG) {
    //     var socket = io.connect(CONFIG.HOSTNAME_NODEJS, {'query' : 'token=' + AuthTokenFactory.getToken()});
    //     return {
    //         on: function(eventName, callback) {
    //             socket.on(eventName, function() {
    //                 var args = arguments;
    //                 $rootScope.$apply(function() {
    //                     callback.apply(socket, args);
    //                 });
    //             });
    //         },
    //         emit: function(eventName, data, callback) {
    //             socket.emit(eventName, data, function() {
    //                 var args = arguments;
    //                 $rootScope.$apply(function() {
    //                     if (callback) {
    //                         callback.apply(socket, args);
    //                     }
    //                 });
    //             })
    //         }
    //     };
    //
    //
    // })

    .factory('ScriptChat', function(Storage, $rootScope, $sce) {

        var arrUsuario = Storage.usuario.getUsuario();
        return {

            getScript: function() {
                return $sce.trustAsHtml(arrUsuario.scriptChat);
            }

        };
    })

    .factory('Movidesk', function(Storage, $rootScope, $window) {

        var arrUsuario = Storage.usuario.getUsuario();

        return {
            init : function () {
                if ($window.movideskLogin) {
                    $window.movideskLogin({
                        name: arrUsuario.usu_nome,
                        email: arrUsuario.usu_email,
                        codeReference: null,
                        organizationCodeReference: arrUsuario.ident_emp,
                        stayConnected: false,
                        emptySubject: false,
                        startChat: false
                    });
                }
            }
        };
    })

    .factory('Initialize', function(Storage, $rootScope, $location, $timeout) {

        var arrUsuario = Storage.usuario.getUsuario();
        return {

            verificarPlano: function() {
                if (arrUsuario.emp.emp_cod_prc === 1 && arrUsuario.meu_plano !== null &&
                        arrUsuario.meu_plano.tit_situacao === 'EXPIRADO') {
                    $timeout(function() {
                        angular.element('#trigger-plano').click();
                    });
                }
            }

        };
    })

    .factory('Wizard', function(Storage, $rootScope, $window, $sce, UsuarioService) {

        var arrUsuario = Storage.usuario.getUsuario();
        return {

            /**
             * carrega o script do passo-a-passo caso o usuário esteja com o parametro ativo em seu perfil
             * @returns {*}
             */
            getScript : function () {

                if(arrUsuario.usu_ativo_wizard) {

                    return $sce.trustAsHtml(arrUsuario.scriptWizard);
                } else {

                    return null;
                }
            },


            /**
             * inicializa o passo-a-passo caso o usuário o tenha ativo em seu perfil
             */
            init : function () {

                if(arrUsuario.usu_ativo_wizard) {

                    $window.WalkMeAPI.log.enable();
                    $window.WalkMeAPI.startWalkthruByIndex(0);
                }

                /**
                 * Acompanha os eventos do walkme para atualizar os dados do usuário quando o cliente completar/cancelar o passo-a-passo
                 * @param eventData
                 */
                $window.walkme_event = function(eventData) {

                    if (eventData.Type === ("UserStoppedWalkthru" || "UserStoppedWalkthruAfterStop" || "TaskCompleted" || "DoneButtonClicked")) {

                        console.log('usuário cancelou/encerrou o walkme, vai atualizar o perfil desativando o walkme automático.');

                        arrUsuario.usu_email_antigo = arrUsuario.usu_email;
                        arrUsuario.usu_ativo_wizard = 0;

                        UsuarioService.usuario.update(arrUsuario, function(retorno) {

                            if(!retorno.records.error) {

                                console.log('atualizou o usuário');

                                delete arrUsuario.usu_email_antigo;

                                Storage.implementacao.clear();

                                $rootScope.setUsuario(arrUsuario);
                            }
                        });
                    }
                };
            }
        };
    })

    .factory('TermoAceite', function(Storage, $rootScope, $uibModal, $timeout, EmpresaService, GeralFactory) {

        var arrUsuario = Storage.usuario.getUsuario();
        return {

            init: function() {

                var termoAceite = arrUsuario['emp'].emp_termo_aceite;
                if (! termoAceite) {

                    var self = this;
                    angular.element('section.content-master').fadeOut('slow');

                    EmpresaService.empresa.get({emp_cod_emp : '1'}, function(retorno) {
                        if (! _.isEmpty(retorno.records)) {

                            var scope = $rootScope.$new();
                            scope.params = {
                                objEmpresa : retorno.records
                            };

                            var modalInstance = $uibModal.open({
                                animation   :  true,
                                templateUrl : 'home/views/janela-termo-aceite.html',
                                controller  : 'TermoAceiteModalCtrl',
                                size        : 'lg',
                                windowClass : 'center-modal modal-termo-aceite',
                                backdrop    : 'static',
                                scope       :  scope,
                                resolve     :  { }
                            });

                            modalInstance.result.then(function(id) { }, function(msg) {
                                if (msg === 'cancel') {

                                    scope.$destroy();
                                    if (modalInstance.hasAlteracao) {
                                        switch (modalInstance.objEmpresa.emp_termo_aceite) {
                                            case 1:
                                                self.aceitar(modalInstance.objEmpresa);
                                                break;

                                            case 0:
                                            case 2:
                                                $rootScope.sair(true);
                                                break;
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
            },

            aceitar: function(objEmpresa) {

                if (! _.isEmpty(objEmpresa)) {

                    Storage.implementacao.clear();

                    arrUsuario['emp'].emp_termo_aceite = 1;
                    $rootScope.setUsuario(arrUsuario);

                    angular.element('section.content-master').fadeIn('slow');

                    objEmpresa.cod_termo   = 2;
                    objEmpresa.is_parceiro = (arrUsuario.is_cdl) ? 1 : 0;

                    EmpresaService.termo.enviarEmail(objEmpresa, function(retorno) {

                        var classe = (retorno.records.error) ? 'warning' : 'success';
                        GeralFactory.notify(classe, 'Atenção!', retorno.records.msg);
                    });
                }
            }
        }
    });


