'use strict';

angular.module('newApp')

    .filter('propsFilter', function() {
        return function(items, props) {
            var out = [];
            if (angular.isArray(items)) {
                var keys = Object.keys(props);
                items.forEach(function(item) {
                    var itemMatches = false;
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if(item[prop] !== null) {
                            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                                itemMatches = true;
                                break;
                            }
                        }

                    }
                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                out = items;
            }
            return out;
        };
    })

    .filter('strLimit', ['$filter', function($filter) {
        return function(input, limit) {
            if (! input) return;
            if (input.length <= limit) {
                return input;
            }
            return $filter('limitTo')(input, limit) + '...';
        };
    }])

    .filter('toInt', ['$filter', function($filter) {
        return function(input) {
            if(input != null) {
                return parseInt(input);
            }
        };
    }])

    .filter('semCif', function() {
        return function(input) {
            var str = '';
            if(input) {
                str = input + '';
                str = str.replace(/R\$/g, '');
            }
            return str;
        }
    })

    .filter('strReplace', ['$filter', function($filter) {
        return function(input, str) {
            if (! input) return;
            return input.replace(str, '');
        };
    }])

    .filter('tel', function() {
        return function(input) {
            var str = input + '';
            str = str.replace(/\D/g, '');
            str = (str.length === 11) ? str.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : str.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            return str;
        };
    })

    .filter('telefone', function () {
        return function (input) {
            var str = input + '';
            str = str.replace(/\D/g, '');
            if (str.length === 11) {
                str = str.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else {
                str = str.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            }
            return str;
        };
    })

    //.filter('strParcelas', function() {
    //    return function(input) {
    //        var str = '';
    //        if (input) {
    //            var arrResultado = input.match(/[^[\]]+(?=])/g);
    //            if (arrResultado) {
    //                var key = arrResultado.length - 1;
    //                str = arrResultado[key];
    //            }
    //        }
    //        return str;
    //    };
    //})

    .filter('strParcelas', function() {
        return function(input, arrParcelas) {
            var str = '';
            if (input) {
                var str = input;
                if (arrParcelas) {
                    str = str + '/' + arrParcelas.length;
                }
            }
            return str;
        };
    })

    .filter('dateFormat', function($filter) {
        return function(input) {
            if (input === null) {
                return;
            }

            var match = input.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
            var date = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);

            return $filter('date')(new Date(date),'dd/MM/yyyy');
        };
    })

    .filter('dateHoraFormat', function($filter) {
        return function(input) {
            return $filter('date')(new Date(input),'dd/MM/yyyy HH:mm'); // 'dd/mm/yyyy HH:mm:ss';
        };
    })

    .filter('hourFormat', function($filter) {
        return function(input) {
            if (input === null) {
                return;
            }

            var match = input.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
            var date = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);

            return $filter('date')(new Date(date),'HH:mm');
        };
    })

    .filter('finalAppend', function() {
        return function(array, value) {
            array.push({
                cad_nome_razao : 'Adicionar cliente ' + value,
                valor          : value
            });
            return array;
        };
    })

    .filter('sumByKey', function() {
        return function(data, key) {
            if (typeof(data) === 'undefined' || typeof(key) === 'undefined') {
                return 0;
            }
            var sum = 0;
            for (var i = data.length - 1; i >= 0; i--) {
                var value = (data[i][key] === null || data[i][key] === undefined) ? 0 : parseFloat(data[i][key]);
                sum += value;
            }
            return sum;
        };
    })

    .filter('customCurrency', ["$filter", function ($filter) {
        return function(amount, currencySymbol){
            var currency = $filter('currency');
            if (amount < 0){
                return currency(amount, currencySymbol).replace("(", "-").replace(")", "");
            }
            return currency(amount, currencySymbol);
        };
    }])

    .filter('customCurrencyQtde', ["$filter", function ($filter) {
        return function(amount, currencySymbol){
            var arrSaldo  = amount.split('.'),
                strFiltro = $filter('customCurrency');

            var valFiltro = strFiltro(arrSaldo[0], currencySymbol).replace('R$', '');
            valFiltro = valFiltro.split(',');

            return valFiltro[0] + ',' + arrSaldo[1];
        };
    }])

    /*
    .filter('currencyDecimal', function() {
        return function(input) {

            input = input.toString();
            var v = input.replace(/0+$/,'');
            var arr = v.split('.');

            if(arr[1] == '') {
                v = v.replace('.','');
            }

            if(arr[1] == undefined) {
                v = v+'00';
                console.log('v1: ', v);
            } else if(arr[1].length == 1) {
                v = v+'0';
                console.log('v2: ', v);
            }

            if(!v.match(/\./)) {
                v = v+'.00';
            }


            // v = 'R$ ' + v.replace(',');
            var arr2 = v.split('.');

            console.log('arr2: ',arr2);

            var c = arr2[1].length;
            var d = ',';
            var t = '.';

            var n = v;
            c = isNaN(c = Math.abs(c)) ? 2 : c;
            d = d == undefined ? "." : d;
            t = t == undefined ? "," : t;
            s = n < 0 ? "-" : "";
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c)));
            j = (j = i.length) > 3 ? j % 3 : 0;

            return 'R$ '+ s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");

        };
    })}*/

    .filter('toFloatDesc', function() {
        return function(input) {

            input = input.toString();
            var v = input;

            if (input.match(/\./)) {
                v = input.replace(/0+$/, '');
            }

            var arr = v.split('.');

            if(arr[1] == '') {
                v = v.replace('.','');
            }

            return v;
        };
    })

    .filter('toint', function() {
        return function(input) {
            return parseInt(input, 10);
        };
    })

    .filter('cnpj', function() {
        return function(input) {
            var str = input + '';
            str = str.replace(/\D/g, '');
            str = str.replace(/^(\d{2})(\d)/, '$1.$2');
            str = str.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            str = str.replace(/\.(\d{3})(\d)/, '.$1/$2');
            str = str.replace(/(\d{4})(\d)/, '$1-$2');
            return str;
        };
    })

    .filter('cpf', function() {
        return function(input) {
            var str = input + '';
            str = str.replace(/\D/g, '');
            str = str.replace(/(\d{3})(\d)/, '$1.$2');
            str = str.replace(/(\d{3})(\d)/, '$1.$2');
            str = str.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            return str;
        };
    });