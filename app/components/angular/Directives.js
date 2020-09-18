'use strict';

angular.module('lv-autocomplete', [])

    .directive('lvAutocomplete', ['$timeout', 'AutocompleteService', 'lv-keys', 'GeralFactory', function($timeout, AutocompleteService, Keys, GeralFactory) {
        return {
            template :
                '<input type="text" class="form-control autocomplete-input" maxlength="{{maxLength}}" id="{{stringId}}" placeholder="{{placeHolder}}" ng-class="inputClass" ng-model="ngModel" ng-blur="onblur()" ng-focus="onfocus()" ng-keydown="keydown($event)">' +
                '<div id="{{stringId}}-container" class="autocomplete-options-container">' +
                    '<div ng-if="showItens" class="autocomplete-options-dropdown">' +
                        '<div ng-if="hasItens">' +
                            '<ul class="autocomplete-options-list">' +
                                '<li class="autocomplete-option" ng-repeat="item in objItens" ng-mousedown="selecionarItem(item)" ng-mouseenter="onItemHover(item)" ng-class="{selected: isOpDestacada(item)}">' +
                                    '<i ng-class="getIconClass(iconClass)"></i><span>{{item[displayProperty]}}</span> ' +
                                    '<span ng-if="displayComplement && hasComplement && item[displayComplement]">({{item[displayComplement]}})</span> ' +
                                '</li>' +
                                '<li class="autocomplete-option autocomplete-more" ng-click="listarMaisItens()" ng-mouseenter="onAcaoHover(1)">' +
                                    '<i class="icon-reload"></i><span>Listar mais</span>' +
                                '</li>' +
                            '</ul>' +
                        '</div>' +
                        '<div ng-if="!hasItens && ngModel">' +
                            '<ul ng-if="addSelectItem" class="autocomplete-options-list">' +
                                '<li class="autocomplete-option autocomplete-more" ng-mousedown="adicionarItem(ngModel)" ng-mouseenter="onAcaoHover(2)">' +
                                    '<i class="icon-plus"></i><span>Adicionar {{stringEntity}} {{ngModel}}</span>' +
                                '</li>' +
                            '</ul>' +
                            '<ul ng-if="!addSelectItem" class="autocomplete-options-list">' +
                                '<li class="autocomplete-option autocomplete-more">' +
                                    '<i class="fa fa-info"></i><span>Nenhum registro encontrado.</span>' +
                                '</li>' +
                            '</ul>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            restrict   : 'E',
            require    : 'ngModel',
            scope      : {
                onSelect          : '=',
                ngModel           : '=',
                addSelectItem     : '=',
                objSearch         : '=',
                onEnter           : '=',
                searchLimit       : '@',
                placeHolder       : '@',
                iconClass         : '@',
                displayProperty   : '@',
                displayComplement : '@',
                stringEntity      : '@',
                stringService     : '@',
                stringId          : '@',
                clearInput        : '@',
                triggerList       : '@',
                confirmAdd        : '@',
                maxLength         : '@',
                triggerBlur       : '@'
            },
            controller : function($scope) {

                /**
                 * Variáveis para manipulação do componente.
                 */
                $scope.objItens      = [];
                $scope.trigger       = false;
                $scope.hasItens      = false;
                $scope.showItens     = false;
                $scope.showMore      = false;
                $scope.hoverListMore = false;
                $scope.hasComplement = false;
                $scope.opDestacada   = null;
                $scope.opSelecionada = null;
                $scope.maxLength     = $scope.maxLength === undefined ? 255 : $scope.maxLength;

                /**
                 * Executado a cada mudança efetuada no termo para busca dos registros.
                 */
                $scope.$watch('ngModel', function(value) {

                    $scope.objItens = [];
                    $scope.showMore = false;

                    $timeout(function() {

                        value = value || '';
                        if (value.length > 0 && $scope.trigger) {

                            $scope.listar(value);
                        } else {

                            $scope.fechar();
                        }
                    });
                });

                /**
                 * Fechar o componente ao deixar o componente.
                 */
                $scope.onblur = function() {

                    if ($scope.triggerBlur === 'true') {

                        angular.element('body').click(function(e) {

                            var strClass = angular.element(e.target).attr('class');
                            if (typeof strClass != 'undefined') {

                                strClass = strClass.trim();
                                var arrClass = strClass.split(' ');

                                if (_.contains(arrClass, 'autocomplete-option') &&
                                    _.contains(arrClass, 'autocomplete-input')) {

                                    return;

                                } else {

                                    $scope.fechar();
                                    $timeout(function() {

                                        var seletor = '#' + $scope.stringId + '-container';
                                        angular.element(seletor).trigger('mouseenter');

                                    });
                                }
                            }
                        });
                    } else {

                        if (! $scope.hoverListMore) {
                            $scope.fechar();
                        }
                    }
                };

                /**
                 * Efetua a chamada para listar os registros ao colocar foco no campo de pesquisa.
                 */
                $scope.onfocus = function() {
                    $scope.hoverListMore = false;
                    if ($scope.hasFocus() && !$scope.showMore) {

                        $scope.objItens = [];
                        $timeout(function() {

                            $scope.trigger = true;
                            $scope.listar();
                        });
                    }
                };

                /**
                 * Método responsável em listar os registros.
                 * @param Event event
                 */
                $scope.listar = function(value) {

                    var objFiltro = $scope.getFiltro(value);
                    var strFiltro = $scope.formatar(objFiltro, 'limit=' + $scope.getLimit() + '&offset=0');

                    if ($scope.stringService) {
                        AutocompleteService[$scope.stringService].get({u : strFiltro}).$promise.then(function(retorno) {

                            var hasItens = false;
                            if (retorno.records.length > 0) {
                                hasItens = true;
                                $scope.objItens = retorno.records;

                                if ($scope.displayComplement) {
                                    $timeout(function() {
                                        if (typeof retorno.records[0][$scope.displayComplement] !== 'undefined') {
                                            $scope.hasComplement = true;
                                        }
                                    }, 300);
                                }
                            }

                            $timeout(function() {
                                $scope.hasItens  = hasItens;
                                $scope.showItens = true;
                            });
                        });
                    }
                };

                /**
                 * Verifica se foi escolhida a função de focus no campo de pesquisa.
                 * @return Boolean
                 */
                $scope.hasFocus = function() {
                    if ($scope.triggerList) {

                        switch ($scope.triggerList) {
                            case 'false':
                                return false;
                            case 'true':
                                return true;
                        }
                    }
                    return false;
                };

                /**
                 * Gatilho para limpar o campo que recebe o componente do autocomplete.
                 */
                $scope.$on('lv-autocomplete:clearInput', function() {
                    $scope.ngModel = '';
                });

                /**
                 * Manipulações do componente via teclado.
                 * @param Event event
                 */
                $scope.keydown = function(event) {
                    // Gatilho para controle do componente:
                    $scope.trigger = true;

                    switch (event.which)
                    {
                        case Keys.BACKSPACE:
                            if ($scope.ngModel !== undefined) {
                                var tamanho = $scope.ngModel.length - 1;
                                if (tamanho === 0) {
                                    $scope.ngModel = '';
                                    $scope.listar();
                                }
                            }
                            break;

                        case Keys.UP_ARROW:
                            event.preventDefault();
                            if ($scope.showItens) {
                                $scope.getAnterior();
                            }
                            break;

                        case Keys.DOWN_ARROW:
                            event.preventDefault();
                            if ($scope.showItens) {
                                $scope.getProximo();
                            }
                            break;

                        case Keys.ENTER:
                            event.preventDefault();
                            if ($scope.opDestacada) {
                                $scope.selecionarItem($scope.opDestacada);
                            } else {
                                $scope.setEnter();
                            }
                            break;

                        case Keys.ESCAPE:
                            $scope.showMore      = false;
                            $scope.hoverListMore = false;
                            $scope.opSelecionada = null;
                            $scope.fechar();
                            break;
                    }
                };

                /**
                 * Evento para tecla enter chamando a função de callback para alguma ação específica.
                 * $scope.selecionarItem($scope.objItens[0]);
                 */
                $scope.setEnter = function() {
                    if ($scope.hasItens) {
                        $scope.onEnter && $scope.onEnter();
                    } else {
                        $scope.hasItens = true;
                        $scope.adicionarItem($scope.ngModel);
                    }
                };

                /**
                 * Retorna a class CSS utilizada nas opções do componente.
                 * @param String iconClass
                 */
                $scope.getIconClass = function(iconClass) {
                    return iconClass === undefined ? 'fa fa-user' : iconClass;
                };

                /**
                 * Retorna o limite de registros a serem mostrados no componente.
                 * @return Integer
                 */
                $scope.getLimit = function() {
                    return $scope.searchLimit ? parseInt($scope.searchLimit) : 10;
                };

                /**
                 * Recolhe o item anterior da lista de registros.
                 */
                $scope.getAnterior = function() {
                    if (! $scope.opDestacada) {
                        $scope.opDestacada = $scope.objItens[$scope.objItens.length - 1];
                        angular.element($scope.getStrSeletor()).scrollTop(40 * $scope.objItens.length - 1);
                    } else {
                        var indiceAtual = $scope.getIndiceAtual();
                        var prevIndex = indiceAtual == 0 ? $scope.objItens.length - 1 : indiceAtual - 1;

                        $scope.opDestacada = $scope.objItens[prevIndex];
                        $scope.scroller(prevIndex);
                    }
                };

                /**
                 * Recolhe o próximo item da lista de registros.
                 */
                $scope.getProximo = function() {
                    if (! $scope.opDestacada) {
                        $scope.opDestacada = $scope.objItens[0];
                    } else {
                        var indexAtual = $scope.getIndiceAtual();
                        var proxIndex  = indexAtual + 1 === $scope.objItens.length ? 0 : indexAtual + 1;

                        $scope.opDestacada = $scope.objItens[proxIndex];
                        $scope.scroller(proxIndex);
                    }
                };

                /**
                 * Método responsável em efetuar o scroll do componente ao apertar a tecla DOWN_ARROW.
                 * @param Integer proxIndex
                 */
                $scope.scroller = function(proxIndex) {

                    var vlrScroll = ((proxIndex >= 4) ? (40 * (proxIndex - 4)) : 0);
                    angular.element($scope.getStrSeletor()).scrollTop(vlrScroll);
                };

                /**
                 * Método responsável em retornar o string ID.
                 * @return String
                 */
                $scope.getStrSeletor = function() {

                    var strId = ($scope.stringId) ? $scope.stringId : 'autocomplete-' + $scope.stringService;
                    return ('#' + strId + '-container .autocomplete-options-dropdown');
                };

                /**
                 * Retorna o índice referente a opção destacada.
                 * @return Integer
                 */
                $scope.getIndiceAtual = function() {
                    return ($scope.objItens.indexOf($scope.opDestacada) > 0) ? $scope.objItens.indexOf($scope.opDestacada) : 0;
                };

                /**
                 * Verifica se a opção esta destacada.
                 * @param  Object objItem
                 * @return Boolean
                 */
                $scope.isOpDestacada = function(objItem) {
                    return objItem === $scope.opDestacada;
                };

                /**
                 * Deixa um item destacado ao passar o mouse em cima.
                 * @param  Object objItem
                 *
                 */
                $scope.onItemHover = function(objItem) {
                    $scope.opDestacada = objItem;
                    $scope.hoverListMore = false;
                };

                /**
                 * Anula o item destacada quando estiver com foco em alguma ação.
                 * Exemplo: Listar mais e Adicionar.
                 */
                $scope.onAcaoHover = function(acao) {
                    $scope.opDestacada = null;
                    switch (acao) {
                        case 1:
                            $scope.hoverListMore = true;
                            break;
                        case 2:
                            $scope.hoverListMore = false;
                            break;
                    }
                };

                /**
                 * Fechando o componente de autocomplete.
                 */
                $scope.fechar = function() {
                    $scope.objItens      = [];
                    $scope.trigger       = false;
                    $scope.showMore      = false;
                    $scope.showItens     = false;
                    $scope.hoverListMore = false;
                    $scope.opDestacada   = null;
                };

                /**
                 * Selecionando uma determinada opção.
                 * @param Object option
                 */
                $scope.selecionarItem = function(objItem) {

                    $scope.opSelecionada = objItem;
                    $scope.onSelect(objItem);

                    $scope.ngModel = ($scope.clearInput != 'false') ? '' : objItem[$scope.displayProperty];
                    $scope.fechar();
                };

                /**
                 * Adiciona o item quando o mesmo não existir na pesquisa.
                 * @param String termo
                 */
                $scope.adicionarItem = function(termo) {
                    if (termo.length > 0) {

                        var hasConfirmDialog = false;
                        if ($scope.confirmAdd) {
                            switch ($scope.confirmAdd) {
                                case 'false':
                                    hasConfirmDialog = false;
                                    break;
                                case 'true':
                                    hasConfirmDialog = true;
                                    break;
                            }
                        }

                        if (hasConfirmDialog) {

                            $scope.hasItens = true;
                            $timeout(function() {

                                var strPergunta = 'Tem certeza que deseja incluir o registo ' + termo.trim() + '?';
                                GeralFactory.confirmar(strPergunta, function() {

                                    $scope.addSelectItem(termo);
                                    $timeout(function() {
                                        $scope.fechar();
                                        $scope.inputElement.blur();
                                    });

                                }, 'Confirmação', function() {

                                    $scope.ngModel = '';
                                    $timeout(function() {
                                        $scope.onfocus();
                                        $scope.inputElement.focus();
                                    });

                                }, 'Não', 'Sim');

                            }, 600);

                        } else {

                            $scope.addSelectItem(termo);
                            $scope.fechar();
                        }
                    }
                };

                /**
                 * Acopla mais itens no componente.
                 */
                $scope.listarMaisItens = function() {

                    if ($scope.stringService) {

                        var objFiltro = $scope.getFiltro();
                        var strFiltro = $scope.formatar(objFiltro, 'limit=' + $scope.getLimit() + '&offset=' + $scope.objItens.length);

                        AutocompleteService[$scope.stringService].get({u : strFiltro}).$promise.then(function(retorno) {
                            $scope.showMore = true;
                            if (retorno.records.length > 0) {

                                angular.forEach(retorno.records, function(item) {
                                    $scope.objItens.push(item);
                                });

                                if (! $scope.hasFocus()) {
                                    $timeout(function() {
                                        $scope.inputElement.focus();
                                        $scope.hoverListMore = false;
                                    });
                                }
                            }
                        });
                    }
                };

                /**
                 * Retorna o filtro a ser utilizado.
                 * @param  String termo
                 * @return Object objFiltro
                 */
                $scope.getFiltro = function(termo) {

                    var objFiltro = {};

                    termo = termo || $scope.ngModel;
                    objFiltro[$scope.displayProperty] = termo; // $scope.removerAcentos(termo);

                    if (! $scope.isEmpty($scope.objSearch)) {
                        angular.forEach($scope.objSearch, function(valor, chave) {
                            if ($scope.objSearch.hasOwnProperty(chave)) {
                                objFiltro[chave] = valor;
                            }
                        });
                    }

                    return objFiltro;
                };

                /**
                 * Verifica se um objeto é vazio.
                 * @param Object objeto
                 * @param Boolean
                 */
                $scope.isEmpty = function(objeto) {
                    for (var prop in objeto) {
                        if (objeto.hasOwnProperty(prop)) {
                            return false;
                        }
                    }

                    return true && JSON.stringify(objeto) === JSON.stringify({});
                };

                /**
                 * Retona a string da pesquisa formatada no padrão da API
                 * @param  Object objFiltro
                 * @param  String complemento
                 * @return String strFiltro
                 */
                $scope.formatar = function(objFiltro, complemento) {

                    var arrFiltro = new Array(), strFiltro = '';
                    angular.forEach(objFiltro, function(item, key) {
                        if (item || item === 0) {
                            arrFiltro.push(key + ':' + item);
                        }
                    });

                    if (arrFiltro.length) {
                        strFiltro = 'q=(' + arrFiltro.join(',') + ')';
                    }

                    if (complemento != '' && complemento != undefined) {
                        if (strFiltro == '') {
                            strFiltro = complemento;
                        } else {
                            strFiltro = strFiltro + '&' + complemento;
                        }
                    }

                    return strFiltro;
                };

                /**
                 * Remove acentos de uma determinada palavra utilizada na pesquisa.
                 * @param  String strParam
                 * @return String string
                 */
                $scope.removerAcentos = function(strParam) {
                    if (strParam) {
                        var string = strParam;
                        var mapaAcentos = {
                            a : /[\xE0-\xE6]/g,
                            A : /[\xC0-\xC6]/g,
                            e : /[\xE8-\xEB]/g,
                            E : /[\xC8-\xCB]/g,
                            i : /[\xEC-\xEF]/g,
                            I : /[\xCC-\xCF]/g,
                            o : /[\xF2-\xF6]/g,
                            O : /[\xD2-\xD6]/g,
                            u : /[\xF9-\xFC]/g,
                            U : /[\xD9-\xDC]/g,
                            c : /\xE7/g,
                            C : /\xC7/g,
                            n : /\xF1/g,
                            N : /\xD1/g
                        };

                        for (var letra in mapaAcentos) {
                            var ER = mapaAcentos[letra];
                            string = string.replace(ER, letra);
                        }
                        return string;
                    }
                    return '';
                };
            },
            link : function(scope, element, attrs, ngModel) {
                scope.inputElement = element.children('.autocomplete-input')[0];
            }
        }
    }])

    .factory('lv-keys', function() {
        return {
            UP_ARROW   : 38,
            DOWN_ARROW : 40,
            ENTER      : 13,
            ESCAPE     : 27,
            BACKSPACE  : 8
        };
    });

angular.module('newApp')

    .directive('icheck', function($timeout, $parse) {
        return {
            require : 'ngModel',
            link    : function($scope, element, $attrs, ngModel) {
                return $timeout(function() {
                    var value = $attrs['value'];

                    $scope.$watch($attrs['ngModel'], function(newValue){
                        $(element).iCheck('update');
                    });
                    $scope.$watch($attrs['ngDisabled'], function(newValue) {
                        $(element).iCheck(newValue ? 'disable':'enable');
                        $(element).iCheck('update');
                    });

                    return $(element).iCheck({
                        checkboxClass : 'iradio_square-blue',
                        radioClass    : 'iradio_square-blue'
                    }).on('ifToggled', function(event) {
                        if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                            $scope.$apply(function() {
                                return ngModel.$setViewValue(event.target.checked);
                            });
                        }
                        if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                            return $scope.$apply(function() {
                                return ngModel.$setViewValue(value);
                            });
                        }
                    });
                }, 300);
            }
        };
    })

    .directive('lvMoney', function($timeout, $parse) {
        return {
            restrict : 'A',
            require  : 'ngModel',
            link     : function (scope, element, attrs, ctrl) {

                console.log(scope, element, attrs, ctrl);
                function parser(value)
                {
                    if (ctrl.$isEmpty(value)) {
                        return value;
                    }

                    if (/^[0-9,]+$/.test(value)) {

                        console.log(value);
                        ctrl.$setViewValue(value);
                        ctrl.$render();
                        return value;

                    } else {

                        var exp = /[a-z{(-+?!@#$%&'.:;~<>_="|´^\\\/\]\-[*)}]/g;
                        value = value.replace(exp, '');

                        console.log(value);

                        ctrl.$setViewValue(value);
                        ctrl.$render();
                        return value;
                    }
                }

                if (attrs.lvMoney) {
                    scope.$watch(attrs.ngModel, function(value) {
                        parser(ctrl.$viewValue);
                    });
                }
            }
        }
    })

    .directive('lvLinkEcommerce', function($compile) {
        return {
            scope: {
                data: '=lvLinkEcommerce'
            },
            restrict: 'A',
            link: function(scope, element, attrs) {

                var template = '';
                if (attrs.dominio) {

                    var url  = 'http://' + attrs.dominio;
                    template = '<a title="Site" href="' + url + '" target="_blank">' +
                                   '<i class="fa fa-globe fa-white"></i>' +
                               '</a>';
                }

                element.html(template).show();
                $compile(element.contents())(scope);
            }
        }
    })

    .directive('restrict', function($parse) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, iElement, iAttrs, controller) {
                scope.$watch(iAttrs.ngModel, function(value) {
                    if (!value) {
                        return;
                    }
                    $parse(iAttrs.ngModel).assign(scope, value.replace(new RegExp(iAttrs.restrict, 'g'), '').replace(/\s+/g, '-'));
                });
            }
        }
    })

    .directive('compareTo', function() {
        return {
            require: 'ngModel',
            scope: {
                otherModelValue: '=compareTo'
            },
            link: function(scope, element, attributes, ngModel) {
                ngModel.$validators.compareTo = function(modelValue) {
                    return modelValue == scope.otherModelValue;
                };
                scope.$watch('otherModelValue', function() {
                    ngModel.$validate();
                });
            }
        };
    })

    .directive('validNumber', function() {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModelCtrl) {
                if(!ngModelCtrl) {
                    return;
                }

                ngModelCtrl.$parsers.push(function(val) {
                    if (angular.isUndefined(val)) {
                        var val = '';
                    }

                    var clean = val ? val.replace(/[^-0-9\,]/g, '') : '';
                    var decimalCheck = clean.split(',');

                    if (! angular.isUndefined(decimalCheck[1])) {
                        decimalCheck[1] = decimalCheck[1].slice(0,4);
                        clean = decimalCheck[0] + ',' + decimalCheck[1];
                    }

                    if (val !== clean) {
                        ngModelCtrl.$setViewValue(clean);
                        ngModelCtrl.$render();
                    }
                    return clean;
                });

                element.bind('keypress', function(event) {
                    if(event.keyCode === 32) {
                        event.preventDefault();
                    }
                });
            }
        };
    })

    .directive('inputBlock', function() {
        return function(scope, element, attrs) {
            var keyCode = [46, 45, 47, 59, 189, 190, 191];
            element.bind("keydown keypress", function(event) {
                if ($.inArray(event.which, keyCode) !== -1) {
                    scope.$apply(function() {
                        scope.$eval(attrs.inputBlock);
                        event.preventDefault();
                    });
                    event.preventDefault();
                }
            });
        };
    })

    .directive('submitForm', function() {
        return function(scope, element, attrs) {
            element.bind('keypress', function(event) {
                if (event.which === 13) {
                    var seletor = '#' + attrs.submitForm;
                    angular.element(seletor).click();
                }
            });
        };
    })

    .directive('bgcolored', function() {
        return function(scope, elem) {
            $(elem).on('focusout',function() {
                $(this).css('background', '#e9ebef');
            });
            $(elem).on('focus',function() {
                $(this).css('background', '#fffec3 !important');
            });
        };
    })

    .directive('eventFocus', function(focus) {
        return function(scope, elem, attr) {
            elem.on(attr.eventFocus, function() {
                focus(attr.eventFocusId);
            });
            scope.$on('$destroy', function() {
                elem.off(attr.eventFocus);
            });
        };
    })

    .directive('numberRange', function() {
        return {
            require  : 'ngModel',
            restrict : 'ACE',
            link: function(scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function(inputValue) {
                    var inputValue = element.val();
                    if (inputValue == undefined) {
                        return '';
                    }

                    var firstParse = inputValue.replace(/[^0-9 . ]/g, '');

                    var safeParse   = firstParse.charAt(0);
                    var prepParse   = firstParse.substring(1,firstParse.length);
                    var secondParse = safeParse + prepParse.replace(/[^0-9 .]/g, '');

                    var n = secondParse.indexOf(".");
                    var transformedInput;
                    if (n == -1) {

                        transformedInput = secondParse;
                    } else {
                        safeParse = secondParse.substring(0,n+1);
                        firstParse = (secondParse.substring(n+1,secondParse.length)).replace(/[^0-9]/g, '');
                        n = 2;

                        if (firstParse.length <= n) {
                            transformedInput = safeParse + firstParse;
                        } else {
                            transformedInput = safeParse + firstParse.substring(0,n);
                        }
                    }

                    var min = parseInt(attrs.minvalue);
                    var max = parseInt(attrs.maxvalue);

                    if (transformedInput != inputValue ||
                        transformedInput < min ||
                        transformedInput > max) {

                        var returnValue;

                        if (transformedInput < min || transformedInput > max) {
                            returnValue = transformedInput.substring(0,transformedInput.length-1);
                        } else {
                            returnValue=transformedInput;
                        }

                        modelCtrl.$setViewValue(returnValue);
                        modelCtrl.$render();
                    } else {

                        returnValue = transformedInput;
                    }

                    return returnValue;
                });
            }
        }
    })

    .directive('numeric', function() {
        return {
            restrict : 'A',
            link     : function(scope, element) {
                element.numeric({
                    decimal  : ".",
                    negative : true,
                    scale    : 3
                });
            }
        }
    })

    .directive('maskncm', function() {
        return {
            restrict : 'A',
            link     : function(scope, element) {
                element.mask("9999.99.99");
            }
        }
    })

    .directive('datepicker1', function() {
        return {
            restrict : 'A',
            require  : 'ngModel',
            link     : function(scope, element, attrs, ngModelCtrl) {
                $(function() {
                    var formato = attrs['maskDatepicker'] ? attrs['maskDatepicker'] : 'dd/mm/yy';
                    element.datepicker({
                        dateFormat : formato, 
                        language   : 'pt-BR',
                        monthNames : [
                            'Janeiro',
                            'Fevereiro',
                            'Março',
                            'Abril',
                            'Maio',
                            'Junho',
                            'Julho',
                            'Agosto',
                            'Setembro',
                            'Outubro',
                            'Novembro',
                            'Dezembro'
                        ],
                        dayNames    : [
                            'Domingo',
                            'Segunda',
                            'Terça',
                            'Quarta',
                            'Quinta',
                            'Sexta',
                            'Sábado'
                        ],
                        dayNamesMin : [
                            'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'
                        ],
                        onSelect    : function(date) {
                            ngModelCtrl.$setViewValue(date);

                            // Trigger apenas para os calendários existentes na tela de financeiro:
                            if (attrs.hasOwnProperty('trigger')) {
                                scope.listarTrigger();
                            }

                            scope.$apply();
                        }
                    });
                });
            }
        }
    })

    .directive('monthdatepicker', function() {
        return {
            restrict : 'A',
            require  : 'ngModel',
            link     : function(scope, element, attrs, ngModelCtrl) {
                $(function() {
                    element.datepicker({
                        dateFormat: 'MM-yy',
                        language   : 'pt-BR',
                        monthNames : [
                            'Janeiro',
                            'Fevereiro',
                            'Março',
                            'Abril',
                            'Maio',
                            'Junho',
                            'Julho',
                            'Agosto',
                            'Setembro',
                            'Outubro',
                            'Novembro',
                            'Dezembro'
                        ],
                        onSelect : function(date) {

                            ngModelCtrl.$setViewValue(date);
                            scope.$apply();

                            scope.sintegra.dataProcessamento = date;
                            scope.sped.dataProcessamento     = date;
                            scope.exportarXML.periodo        = date;
                        }
                    });
                });
            }
        }
    })

    .directive('numberOnly', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');
                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;  // or return Number(transformedInput)
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    })

    .directive('onlyHyphenNumber', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModelCtrl) {
                ngModelCtrl.$parsers.push(function(inputValue) {
                    var transformedInput = inputValue.replace(/[^0-9\-]+/g, '');
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                    return transformedInput;
                });
            }
        }
    })

    .directive('onlyDotNumber', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModelCtrl) {
                ngModelCtrl.$parsers.push(function(inputValue) {
                    var transformedInput = inputValue.replace(/[^0-9\.]+/g, '');
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                    return transformedInput;
                });
            }
        }
    })

    .directive('toint2', function() {
        return {
            require: 'ngModel',
            link: function(scope, ele, attr, ctrl){
                ctrl.$parsers.unshift(function(viewValue){
                    return parseInt(viewValue, 10);
                });
            }
        };
    })

    .directive('tofloat', function() {
        return {
            require: 'ngModel',
            link: function(scope, ele, attr, ctrl){
                ctrl.$parsers.unshift(function(viewValue){
                    return viewValue.replace(/\./g, ',');
                    //return parseInt(viewValue, 10);
                });
            }
        };

    })

    .directive('mydatepicker', function() {
        return {
            restrict : "E",
            scope    : {
                ngModel     : "=",
                dateOptions : "=",
                opened      : "="
            },
            link: function($scope, element, attrs,ngModel) {
                $scope.open = function(event,input) {
                    event.preventDefault();
                    event.stopPropagation();
                    $scope.opened  = true;
                    $scope.ngModel = 'aaa';
                };
            },
            templateUrl : 'app/components/angular/helpers/datepicker.html'
        }
    })

    .directive('mask', function() {
        return {
            restrict : 'A',
            link     : function(scope, elem, attr, ctrl) {
                if (attr.mask) {
                    elem.mask(attr.mask, {placeholder : attr.maskPlaceholder});
                }
            }
        };
    })

    .directive('uploadfile', function() {
        return {
            restrict : 'A',
            link     : function(scope, element) {
                element.bind('click', function(e) {
                    e.preventDefault();
                    angular.element('#btn-upload').trigger('click');
                });
            }
        };
    })

    .directive('getPermissao', function() {
        return {
            scope: {
                data: '=getPermissao'
            },
            restrict: 'EA',
            link: function(scope, element, attrs) {
                var codModulo = parseInt(attrs.getPermissao);
                if (codModulo === 8) {
                    $(element).hide();
                }
            }
        };
    })

    .directive('myElement', function($filter, $compile) {
        return {
            scope: {
                data: '=myElement'
            },
            restrict: 'EA',
            link: function (scope, element, attrs) {
                var template = '';

                if (scope.data) {

                    var match = scope.data.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
                    var date = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);

                    var hoje = $filter('date')(new Date(), 'dd/MM/yyyy');
                    var data = $filter('date')(new Date(date), 'dd/MM/yyyy');

                    template += (process(data) < process(hoje)) ? '<span class="c-red">' + data + '</span>' : '<span>' + data + '</span>';
                } else {

                    template += '<span>-</span>';
                }

                function process(date) {
                    var parts = date.split('/');
                    return new Date(parts[2], parts[1] - 1, parts[0]);
                }

                element.html(template).show();
                $compile(element.contents())(scope);
            }
        };
    })

    .directive('parcelamento', function($filter, $compile) {
        return {
            restrict : 'EA',
            link     : function (scope, element, attrs) {

                var template = '';
                if (attrs) {

                    var qtdeParcelas = parseInt(attrs.total), vlrIndiceParcela = 0;
                    switch (parseInt(attrs.tabela))
                    {
                        case 0:
                            vlrIndiceParcela = parseInt(attrs.indice) + 1;
                            break;

                        case 1:
                            var vlrSubtracao = (qtdeParcelas % 2) === 0 ? 0 : 0.5;
                            vlrIndiceParcela = (parseInt(attrs.indice) + 1) + ((qtdeParcelas / 2) - vlrSubtracao);
                            break;
                    }

                    template = vlrIndiceParcela + '/' + qtdeParcelas;
                }

                element.html(template).show();
                $compile(element.contents())(scope);
            }
        };
    })

    .directive('getDataAnterior', function($filter, $compile) {
        return {
            restrict : 'EA',
            link     : function(scope, element, attrs) {

                var template = '';
                if (attrs) {

                    var data = attrs.registro;
                    if (data) {
                        template = '<span>Anterior a ' + data + '</span>';
                    }
                }

                element.html(template).show();
                $compile(element.contents())(scope);
            }
        }
    })

    .directive('myEstoque', function($filter, $compile) {
        return {
            scope : {
                data  : '=myEstoque',
                value : '@'
            },
            restrict : 'EA',
            link     : function(scope, element, attrs) {
                var produto  =  scope.data;
                var template = '<span>' + scope.value + '</span>';

                if (getSaldo(produto.msa_atu_estoque_minimo) < getSaldo(produto.produto_saldo.sal_atu_qtd_saldo)) {
                    template = '<span class="c-red">' + scope.value + '</span>';
                }

                function getSaldo(valor) {
                    return (valor != null) ? parseInt(valor) : 0;
                }

                element.html(template).show();
                $compile(element.contents())(scope);
            }
        };
    })

    .directive('getBanco', function($compile) {
        return {
            scope : {
                data  : '=getBanco',
                value : '@'
            },
            restrict : 'EA',
            link     : function(scope, element) {

                var objBancoConta = scope.data, template = '';
                switch (objBancoConta.bco_cod_banco)
                {
                    case 101:
                        template = 'NE:' + objBancoConta.bco_num_estabelecimento;
                        break;

                    default:
                        template = 'AG:' + objBancoConta.bco_agencia + ' - Conta:' + objBancoConta.bco_conta;
                        break;
                }

                element.html(template).show();
                $compile(element.contents())(scope);
            }
        }
    })

    .directive('getEstoque', function($filter, $compile) {
        return {
            scope : {
                data  : '=getEstoque',
                value : '@'
            },
            restrict : 'EA',
            link     : function (scope, element) {
                if (scope.value) {

                    var saldo = parseFloat(scope.value), valSaldo = saldo;
                    if (! isInt(saldo)) {

                        var arrSaldo  = scope.value.split('.'),
                            strFiltro = $filter('customCurrency');

                        var valFiltro = strFiltro(arrSaldo[0]).replace('R$', '');
                        valFiltro = valFiltro.split(',');

                        valSaldo = valFiltro[0] + ',' + arrSaldo[1];
                    }

                    element.html('<span class="row-saldo">' + valSaldo + '</span><span class="row-hidden">' + saldo + '</span>');
                    $compile(element.contents())(scope);
                }
                function isInt(n) {
                    return n % 1 === 0;
                }
            }
        };
    })

    .directive('getTotalByAttr', function($filter, $compile) {
        return {
            scope : {
                data  : '=getTotalByAttr',
                value : '@'
            },
            restrict : 'EA',
            link     : function(scope, element, attrs) {
                if (scope.value && scope.data && attrs.attr) {

                    var atributo = attrs.attr;
                    if (scope.data[atributo]) {

                        var saldo  = parseFloat(scope.value),
                            valor  = parseFloat(scope.data[atributo]),
                            filtro = $filter('customCurrency');

                        var total = saldo * valor;
                        element.html('<span class="row-calc">' + (filtro(total)) + '</span><span class="row-hidden">' + (total) + '</span>');
                        $compile(element.contents())(scope);
                    }
                }

                function isInt(n) {
                    return n % 1 === 0;
                }
            }
        };
    })

    .directive('nfeAcao', function($compile) {
        return {
            scope : {
                data  : '=nfeAcao',
                value : '@'
            },
            restrict : 'EA',
            link     : function(scope, element, attr) {

                var arrDados = scope.data, html = '';
                if (! _.isEmpty(arrDados.situacao)) {

                    var objeto = {
                        small   : (arrDados[attr.atributo])   ? arrDados[attr.atributo]   : "",
                        tooltip : (arrDados.fin_nfe_motivo)   ? arrDados.fin_nfe_motivo   : "",
                        style   : (arrDados.situacao.par_c02) ? arrDados.situacao.par_c02 : "#e2e2e2"
                    };
                    
                    html += '<span class="label" style="background-color:' + objeto.style + '" tooltip-placement="top" tooltip="' + objeto.tooltip + '">' +
                                '<small>' + objeto.small + '</small>' +
                            '<span>';
                }

                element.html(html);
                $compile(element.contents())(scope);
            }
        }
    })

    .directive('imgTooltip', function($compile) {
        return {
            scope: {
                data: '=imgTooltip'
            },
            restrict: 'EA',
            link: function(scope, element, attrs) {

                var teste = scope.data;
                scope.hidden = true;

                var tooltipElement = angular.element('<div ng-hide="hidden" class="img-estampa-thumb">');
                tooltipElement.append('<div><img src="' + attrs.ngSrc + '"></div>');

                element.parent().parent().parent().append(tooltipElement);
                element
                    .on('mouseenter', function() { scope.hidden = false; scope.$digest(); })
                    .on('mouseleave', function() { scope.hidden = true ; scope.$digest(); });

                var toolTipScope = scope.$new(true);
                angular.extend(toolTipScope, scope.data);

                $compile(tooltipElement.contents())(toolTipScope);
                $compile(tooltipElement)(scope);
            }
        };
    })

    .directive('legendValue', function($filter, $compile, $location) {
        return {
            restrict: 'EA',
            link: function(scope, element, attrs) {
                var tipo = $location.$$path.replace('/', '');

                var texto = '1 - ';
                if (tipo === 'venda') {

                    texto += 'Cliente';
                } else if (tipo === 'orcamento') {

                    texto += 'Cliente';
                } else if(tipo == 'outras-entradas' || tipo == 'outras-saidas') {

                    texto += 'Cadastro';
                } else if(tipo == 'prest-servico'){

                    texto += 'Cliente';
                } else {
                    texto += 'Fornecedor';
                }

                element.html(texto).show();
                $compile(element.contents())(scope);
            }
        }
    })

    .directive('legendItens', function($filter, $compile, $location) {
        return {
            restrict: 'EA',
            link: function(scope, element, attrs) {
                var tipo = $location.$$path.replace('/', '');

                var texto = '2 - ';
                if (tipo === 'prest-servico') {

                    texto += 'Serviços';
                } else {
                    texto += 'Itens';
                }

                element.html(texto).show();
                $compile(element.contents())(scope);
            }
        }
    })

    .directive('showHide', function($timeout) {
        return {
            restrict : 'EA',
            link : function(scope, element, attrs) {
                if (attrs['showHide']) {

                    var strSeletor = '#box-cf-' + attrs['showHide'];
                    angular.element(element).mouseenter(function() {

                        angular.element(strSeletor).fadeIn('slow');

                    }).mouseleave(function() {

                        $timeout(function() {
                            angular.element(strSeletor).fadeOut('slow');
                        }, 3000);
                    });
                }
            }
        }
    })

    .directive('tdChecked', function() {
        return {
            restrict : 'EA',
            link : function(scope, element) {
                element.click(function() {
                    var objIcons = {
                        normal  : 'fa-square-o',
                        checked : 'fa-check-square-o'
                    };
                    var input = element.find('i.fa');
                    if (input.length) {
                        var status = input.hasClass(objIcons.normal);
                        status ? input.removeClass(objIcons.normal).addClass(objIcons.checked) : input.removeClass(objIcons.checked).addClass(objIcons.normal);
                    }
                });
            }
        }
    })

    .directive('trChecked', function() {
        return {
            restrict: 'EA',
            link: function(scope, element, attrs) {

                element.click(function() {
                    var tipo = (attrs['trChecked']) ? attrs['trChecked'] : 'checkbox';
                    switch (tipo) {

                        case 'radio':
                            var objeto = {'normal':'fa-circle-o', 'checked':'fa-check-circle'};
                            break;

                        case 'checkbox':
                            var objeto = {'normal':'fa-square-o', 'checked':'fa-check-square-o'};
                            break;
                    }

                    var input = element.find('td.td-fa').find('i.fa');
                    if (input.length) {
                        tipo === 'radio' && clearAll(input);
                        var status = input.hasClass(objeto['normal']);
                        if (status) {
                            input.removeClass(objeto['normal']).addClass(objeto['checked']);
                        } else {
                            input.removeClass(objeto['checked']).addClass(objeto['normal']);
                        }
                    }

                    function clearAll(input) {
                        var table = input.parent().parent().parent().parent();
                        if (table.length) {
                            var arrInputs = table.find('i.fa-check-circle');
                            if (arrInputs.length) {
                                angular.forEach(arrInputs, function(item) {
                                    angular.element(item).removeClass('fa-check-circle').addClass('fa-circle-o');
                                });
                            }
                        }
                    }
                });
            }
        }
    })

    .directive('getIcon', function($compile, GeralFactory) {
        return {
            scope    : {
                data : '=getIcon'
            },
            restrict : 'EA',
            link     : function(scope, element, attrs) {

                var objItem = scope.data, html = '';
                if (objItem) {

                    var codFormPgto = (objItem.tit_6060_forma_pagamento) ? parseInt(objItem.tit_6060_forma_pagamento) : 0;
                    if (codFormPgto) {

                        var icon = GeralFactory.getIconFormaPgto(objItem.tit_forma_pgto);
                        html = '<i class="fa ' + icon + '" tooltip-placement="top" ' +
                            'tooltip="' + objItem.tit_forma_pgto + '"></i>';
                    }
                }

                element.html(html).show();
                $compile(element.contents())(scope);
            }
        }
    })

    .directive('bankName', function($filter, $compile, StaticFactories) {
        return {
            scope: {
                data: '=bankName'
            },
            restrict: 'EA',
            link: function(scope, element) {

                var descBanco = '', codBanco = scope.data.bco_cod_banco;
                var keepGoing = true;

                angular.forEach(StaticFactories.BANCOS, function(item) {
                    if (keepGoing) {
                        if (item.ban_cod_ban === codBanco) {

                            descBanco = item.ban_descricao;
                            keepGoing = false;
                        }
                    }
                });

                element.html(descBanco).show();
                $compile(element.contents())(scope);
            }
        }
    })

    .directive('sincCode', function($filter, $compile, $rootScope) {
        return {
            scope: {
                data: '=sincCode'
            },
            restrict: 'EA',
            link: function(scope, element, attrs) {

                var html = '';
                if (scope.data) {

                    var proCodSinc = scope.data.pro_cod_sinc, codigo;
                    switch (attrs.tipo) {

                        case 'CN':
                            codigo = scope.data.pro_cod_pro;
                            break;

                        case 'CB':
                            codigo = scope.data.pro_cod_bar ? scope.data.pro_cod_bar.trim() : '';
                            break;
                    }

                    html  = '<span>' + codigo + '</span>';
                    if ($rootScope.getPermissaoSol('9') && proCodSinc) {

                        html  = '<span tooltip-placement="right" tooltip="Sincronismo: ' + proCodSinc + '">'
                                    + codigo +
                                '</span>'
                    }
                }

                element.html(html).show();
                $compile(element.contents())(scope);
            }
        }
    })

    .directive('descButton', function($compile) {
        return {
            scope: {
                data: '=descButton'
            },
            restrict: 'EA',
            link: function(scope, element) {

                var dados = scope.data, html  = '<span>Juros</span>';
                if (dados) {

                    var vlrResidual = parseFloat(scope.data.vlrResidual);
                    if (vlrResidual) {

                        html = '<span><small>' + ((vlrResidual > 0) ? 'Juros' : 'Descontos') + '</small></span>';
                    }
                }

                element.html(html).show();
                $compile(element.contents())(scope);
            }
        }
    })

    .directive('isVencida', function($filter, $compile) {
        return {
            scope: {
                data: '=isVencida'
            },
            restrict: 'EA',
            link: function(scope, element, attrs) {

                var atributo = (scope.data[attrs.atributo]) ?  scope.data[attrs.atributo] : '';

                var template = '<span>' + atributo + '</span>';

                if (scope.data) {

                    if (scope.data.tit_faturado === 0) {

                        var dtVencimento = scope.data.tit_dat_vct;
                        if (dtVencimento !== null) {

                            var match = dtVencimento.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
                            var date  = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);

                            date = $filter('date')(new Date(date), 'dd/MM/yyyy');
                            if (process(date) < process($filter('date')(new Date(), 'dd/MM/yyyy'))) {

                                template  = '<span class="c-red">' + atributo + '</span>';
                            }
                        }
                    }
                }

                function process(date) {
                    var parts = date.split('/');
                    return new Date(parts[2], parts[1] - 1, parts[0]);
                }

                element.html(template).show();
                $compile(element.contents())(scope);
            }
        }
    })

    .directive('httpPrefix', function() {
        return {
            restrict : 'A',
            require  : 'ngModel',
            link     : function(scope, element, attrs, controller) {
                function ensureHttpPrefix(value) {
                    if(value && !/^(https?):\/\//i.test(value) && 'http://'.indexOf(value) === -1) {
                        controller.$setViewValue('http://' + value);
                        controller.$render();
                        return 'http://' + value;
                    }
                    return value;
                }
                controller.$formatters.push(ensureHttpPrefix);
                controller.$parsers.splice(0, 0, ensureHttpPrefix);
            }
        };
    })

    .directive('dlEnterKey', function() {
        return function(scope, element, attrs) {
            element.bind('keydown', function(e) {
                var tecla = event.keyCode;
                var ctrl  = event.ctrlKey;
                if (ctrl && tecla === 74) {
                    event.keyCode     = 0;
                    event.returnValue = false;
                    scope.$apply(function() {
                        scope.$eval(attrs.dlEnterKey);
                    });
                    event.preventDefault();
                }
            });
        };
    })

    .directive('isCm', function () {
        return {
            restrict : 'A',
            link     : function(scope, element, attrs) {
                scope.$watch(attrs.ngModel, function(v) {
                    if (! v) {
                        element.val(1);
                    }
                });
            }
        };
    })

    .directive('periodicidade', function($filter, $compile) {
        return {
            scope: {
                data: '=periodicidade'
            },
            restrict: 'EA',
            link: function(scope, element, attrs) {

                var objeto = scope.data, periodicidade = '';
                switch (objeto.iva_periodicidade) {
                    case 1:
                        periodicidade = 'mês';
                        break;
                    case 3:
                        periodicidade = 'semestral';
                        break;
                    case 4:
                        periodicidade = 'anual';
                        break;
                    case 5:
                        periodicidade = 'avulso';
                        break;
                    default:
                        periodicidade = 'mês';
                        break;
                }

                element.html('<span>' + periodicidade + '</span>').show();
                $compile(element.contents())(scope);
            }
        }
    })

    .directive('maphilight', function(){
        return {
            restrict: 'CA',
            link: function(scope, element, attr){
                var has_VML,
                    has_canvas,
                    create_canvas_for,
                    add_shape_to,
                    clear_canvas,
                    shape_from_area,
                    canvas_style,
                    hex_to_decimal,
                    css3color,
                    is_image_loaded,
                    options_from_area;

                $(element).bind('mouseover', function(){});
                $(element).bind('mouseout',  function(){});
            }
        }
    })

    .directive('onReadFile', function ($parse) {
        return {
            restrict: 'A',
            scope: false,
            link: function(scope, element, attrs) {
                var fn = $parse(attrs.onReadFile);

                element.on('change', function(onChangeEvent) {
                    var reader = new FileReader();

                    reader.onload = function(onLoadEvent) {
                        scope.$apply(function() {
                            fn(scope, {$fileContent:onLoadEvent.target.result});
                        });
                    };

                    reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                });
            }
        };
    })

    .directive('allowPattern', function allowPatternDirective() {
        return {
            restrict : 'A',
            compile  : function (el, at) {
                return function (scope, element, attrs) {
                    element.bind('keypress', function (event) {
                        var keyCode = event.which || event.keyCode, keyCodeChar = String.fromCharCode(keyCode);
                        if (! keyCodeChar.match(new RegExp(attrs.allowPattern, 'i'))) {
                            event.preventDefault();
                            return false;
                        }
                    });
                };
            }
        };
    })

    .directive('scrollOnClick', function() {
        return {
            restrict : 'A',
            link     : function(scope, elem) {
                elem.on('click', function() {
                    angular.element('body').animate({scrollTop : elem.offset().top}, 'slow');
                });
            }
        }
    })

    .directive('typeaheadFocus', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                // Array of keyCode values for arrow keys
                // const ARROW_KEYS = [37,38,39,40];

                var ARROW_KEYS = [37,38,39,40];
                function manipulateViewValue(e) {
                    /* we have to check to see if the arrow keys were in the input because if they were trying to select
                     * a menu option in the typeahead, this may cause unexpected behavior if we were to execute the rest
                     * of this function
                     */
                    if( [37,38,39,40].indexOf(e.keyCode) >= 0 )
                        return;

                    var viewValue = ngModel.$viewValue;

                    //restore to null value so that the typeahead can detect a change
                    if (ngModel.$viewValue == ' ') {
                        ngModel.$setViewValue(null);
                    }

                    //force trigger the popup
                    ngModel.$setViewValue(' ');

                    //set the actual value in case there was already a value in the input
                    ngModel.$setViewValue(viewValue || ' ');
                }

                /* trigger the popup on 'click' because 'focus'
                 * is also triggered after the item selection.
                 * also trigger when input is deleted via keyboard
                 */
                element.bind('click keyup', manipulateViewValue);

                //compare function that treats the empty space as a match
                scope.$emptyOrMatch = function (actual, expected) {
                    if (expected == ' ') {
                        return true;
                    }
                    return actual ? actual.toString().toLowerCase().indexOf(expected.toLowerCase()) > -1 : false;
                };
            }
        };
    })

    .directive('dropzone', function () {
        return function (scope, element, attrs) {
            var config, dropzone;

            config = scope[attrs.dropzone];

            // create a Dropzone for the element with the given options
            dropzone = new Dropzone(element[0], config.options);

            // bind the given event handlers
            angular.forEach(config.eventHandlers, function (handler, event) {
                dropzone.on(event, handler);
            });
        };
    });

(function () {
    'use strict';

    angular.module('malihu.scrollbar', []).directive('mhScrollbar', mhScrollbar);

    function mhScrollbar() {
        return {
            restrict : 'A',
            link     : function (scope, element, attrs) {
                var conf = getConf(attrs, scope);
                element.mCustomScrollbar(conf);
            }
        }
    }

    function getConf(attrs, scope) {
        var confObj = {};
        for (var attr in attrs) {
            if (attr.indexOf('mcs') === 0) {
                var field = attr.charAt(3).toLowerCase() + attr.substring(4, attr.length);
                confObj[field] = convert(attrs[attr], scope);
            }
        }
        return confObj;
    }

    function convert(input, scope) {
        if (input === undefined || input === null)
            return null;

        var primary = primaryData(input, scope);
        if (primary !== null)
            return primary;

        var parsed = null;
        try {
            var parser = JSON.parse;
            if (jQuery.parseJSON)
                parser = jQuery.parseJSON;

            parsed = parser(input);
            return primaryData(parsed, scope);
        } catch (e) {
            return input;
        }
    }

    function primaryData(input, scope) {
        var temp = Number(input);
        if (!isNaN(temp)) {
            return temp;
        }

        if (input === "true" || input === "false") {
            if (input === "true")
                return true;
            else
                return false;
        }

        if (angular.isObject(input) && !angular.isDate(input) && !angular.isArray(input)) {
            for (var field in input) {
                var data = primaryData(input[field], scope);
                input[field] = (data !== null) ? data : parseFunctions(input[field], scope);
                return input;
            }
        }
        return null;
    }

    function parseFunctions(input,scope) {
        if (input.indexOf("()") > 0) {
            var splitted = input.split(".");
            var parsedFunc = scope;
            for (var i = 0, length = splitted.length; i < length-1; i++) {
                parsedFunc = parsedFunc[splitted[i]];
            }
            var last = splitted[splitted.length - 1].substring(0, splitted[splitted.length - 1].length - 2);
            return parsedFunc[last];
        }
        return null;
    }

})();
