//(function (factory) {
//  'use strict';
//  if (typeof exports === 'object') {
//    // Node/CommonJS
//    module.exports = factory(
//      typeof angular !== 'undefined' ? angular : require('angular'),
//      typeof Chart !== 'undefined' ? Chart : require('chart.js'));
//  }  else if (typeof define === 'function' && define.amd) {
//    // AMD. Register as an anonymous module.
//    define(['angular', 'chart'], factory);
//  } else {
//    // Browser globals
//    factory(angular, Chart);
//  }
//}(function (angular, Chart) {
//  'use strict';
//
//  Chart.defaults.global.responsive = true;
//  Chart.defaults.global.multiTooltipTemplate = '<%if (datasetLabel){%><%=datasetLabel%>: <%}%><%= value %>';
//
//  Chart.defaults.global.colours = [
//    '#97BBCD', // blue
//    '#DCDCDC', // light grey
//    '#F7464A', // red
//    '#46BFBD', // green
//    '#FDB45C', // yellow
//    '#949FB1', // grey
//    '#4D5360'  // dark grey
//  ];
//
//  var usingExcanvas = typeof window.G_vmlCanvasManager === 'object' &&
//    window.G_vmlCanvasManager !== null &&
//    typeof window.G_vmlCanvasManager.initElement === 'function';
//
//  if (usingExcanvas) Chart.defaults.global.animation = false;
//
//  return angular.module('chart.js', [])
//    .provider('ChartJs', ChartJsProvider)
//    .factory('ChartJsFactory', ['ChartJs', '$timeout', ChartJsFactory])
//    .directive('chartBase', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory(); }])
//    .directive('chartLine', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('Line'); }])
//    .directive('chartBar', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('Bar'); }])
//    .directive('chartRadar', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('Radar'); }])
//    .directive('chartDoughnut', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('Doughnut'); }])
//    .directive('chartPie', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('Pie'); }])
//    .directive('chartPolarArea', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('PolarArea'); }]);
//
//  /**
//   * Wrapper for chart.js
//   * Allows configuring chart js using the provider
//   *
//   * angular.module('myModule', ['chart.js']).config(function(ChartJsProvider) {
//   *   ChartJsProvider.setOptions({ responsive: true });
//   *   ChartJsProvider.setOptions('Line', { responsive: false });
//   * })))
//   */
//  function ChartJsProvider () {
//    var options = {};
//    var ChartJs = {
//      Chart: Chart,
//      getOptions: function (type) {
//        var typeOptions = type && options[type] || {};
//        return angular.extend({}, options, typeOptions);
//      }
//    };
//
//    /**
//     * Allow to set global options during configuration
//     */
//    this.setOptions = function (type, customOptions) {
//      // If no type was specified set option for the global object
//      if (! customOptions) {
//        customOptions = type;
//        options = angular.extend(options, customOptions);
//        return;
//      }
//      // Set options for the specific chart
//      options[type] = angular.extend(options[type] || {}, customOptions);
//    };
//
//    this.$get = function () {
//      return ChartJs;
//    };
//  }
//
//  function ChartJsFactory (ChartJs, $timeout) {
//    return function chart (type) {
//      return {
//        restrict: 'CA',
//        scope: {
//          data: '=?',
//          labels: '=?',
//          options: '=?',
//          series: '=?',
//          colours: '=?',
//          getColour: '=?',
//          chartType: '=',
//          legend: '@',
//          click: '=?',
//          hover: '=?',
//
//          chartData: '=?',
//          chartLabels: '=?',
//          chartOptions: '=?',
//          chartSeries: '=?',
//          chartColours: '=?',
//          chartLegend: '@',
//          chartClick: '=?',
//          chartHover: '=?'
//        },
//        link: function (scope, elem/*, attrs */) {
//          var chart, container = document.createElement('div');
//          container.className = 'chart-container';
//          elem.replaceWith(container);
//          container.appendChild(elem[0]);
//
//          if (usingExcanvas) window.G_vmlCanvasManager.initElement(elem[0]);
//
//          ['data', 'labels', 'options', 'series', 'colours', 'legend', 'click', 'hover'].forEach(deprecated);
//          function aliasVar (fromName, toName) {
//            scope.$watch(fromName, function (newVal) {
//              if (typeof newVal === 'undefined') return;
//              scope[toName] = newVal;
//            });
//          }
//          /* provide backward compatibility to "old" directive names, by
//           * having an alias point from the new names to the old names. */
//          aliasVar('chartData', 'data');
//          aliasVar('chartLabels', 'labels');
//          aliasVar('chartOptions', 'options');
//          aliasVar('chartSeries', 'series');
//          aliasVar('chartColours', 'colours');
//          aliasVar('chartLegend', 'legend');
//          aliasVar('chartClick', 'click');
//          aliasVar('chartHover', 'hover');
//
//          // Order of setting "watch" matter
//
//          scope.$watch('data', function (newVal, oldVal) {
//            if (! newVal || ! newVal.length || (Array.isArray(newVal[0]) && ! newVal[0].length)) {
//              destroyChart(chart, scope);
//              return;
//            }
//            var chartType = type || scope.chartType;
//            if (! chartType) return;
//
//            if (chart && canUpdateChart(newVal, oldVal))
//              return updateChart(chart, newVal, scope, elem);
//
//            createChart(chartType);
//          }, true);
//
//          scope.$watch('series', resetChart, true);
//          scope.$watch('labels', resetChart, true);
//          scope.$watch('options', resetChart, true);
//          scope.$watch('colours', resetChart, true);
//
//          scope.$watch('chartType', function (newVal, oldVal) {
//            if (isEmpty(newVal)) return;
//            if (angular.equals(newVal, oldVal)) return;
//            createChart(newVal);
//          });
//
//          scope.$on('$destroy', function () {
//            destroyChart(chart, scope);
//          });
//
//          function resetChart (newVal, oldVal) {
//            if (isEmpty(newVal)) return;
//            if (angular.equals(newVal, oldVal)) return;
//            var chartType = type || scope.chartType;
//            if (! chartType) return;
//
//            // chart.update() doesn't work for series and labels
//            // so we have to re-create the chart entirely
//            createChart(chartType);
//          }
//
//          function createChart (type) {
//            if (isResponsive(type, scope) && elem[0].clientHeight === 0 && container.clientHeight === 0) {
//              return $timeout(function () {
//                createChart(type);
//              }, 50, false);
//            }
//            if (! scope.data || ! scope.data.length) return;
//            scope.getColour = typeof scope.getColour === 'function' ? scope.getColour : getRandomColour;
//            var colours = getColours(type, scope);
//            var cvs = elem[0], ctx = cvs.getContext('2d');
//            var data = Array.isArray(scope.data[0]) ?
//              getDataSets(scope.labels, scope.data, scope.series || [], colours) :
//              getData(scope.labels, scope.data, colours);
//            var options = angular.extend({}, ChartJs.getOptions(type), scope.options);
//
//            // Destroy old chart if it exists to avoid ghost charts issue
//            // https://github.com/jtblin/angular-chart.js/issues/187
//            destroyChart(chart, scope);
//            chart = new ChartJs.Chart(ctx)[type](data, options);
//            scope.$emit('create', chart);
//
//            // Bind events
//            cvs.onclick = scope.click ? getEventHandler(scope, chart, 'click', false) : angular.noop;
//            cvs.onmousemove = scope.hover ? getEventHandler(scope, chart, 'hover', true) : angular.noop;
//
//            if (scope.legend && scope.legend !== 'false') setLegend(elem, chart);
//          }
//
//          function deprecated (attr) {
//            if (typeof console !== 'undefined' && ChartJs.getOptions().env !== 'test') {
//              var warn = typeof console.warn === 'function' ? console.warn : console.log;
//              if (!! scope[attr]) {
//                warn.call(console, '"%s" is deprecated and will be removed in a future version. ' +
//                  'Please use "chart-%s" instead.', attr, attr);
//              }
//            }
//          }
//        }
//      };
//    };
//
//    function canUpdateChart (newVal, oldVal) {
//      if (newVal && oldVal && newVal.length && oldVal.length) {
//        return Array.isArray(newVal[0]) ?
//        newVal.length === oldVal.length && newVal.every(function (element, index) {
//          return element.length === oldVal[index].length; }) :
//          oldVal.reduce(sum, 0) > 0 ? newVal.length === oldVal.length : false;
//      }
//      return false;
//    }
//
//    function sum (carry, val) {
//      return carry + val;
//    }
//
//    function getEventHandler (scope, chart, action, triggerOnlyOnChange) {
//      var lastState = null;
//      return function (evt) {
//        var atEvent = chart.getPointsAtEvent || chart.getBarsAtEvent || chart.getSegmentsAtEvent;
//        if (atEvent) {
//          var activePoints = atEvent.call(chart, evt);
//          if (triggerOnlyOnChange === false || angular.equals(lastState, activePoints) === false) {
//            lastState = activePoints;
//            scope[action](activePoints, evt);
//            scope.$apply();
//          }
//        }
//      };
//    }
//
//    function getColours (type, scope) {
//      var notEnoughColours = false;
//      var colours = angular.copy(scope.colours ||
//        ChartJs.getOptions(type).colours ||
//        Chart.defaults.global.colours
//      );
//      while (colours.length < scope.data.length) {
//        colours.push(scope.getColour());
//        notEnoughColours = true;
//      }
//      // mutate colours in this case as we don't want
//      // the colours to change on each refresh
//      if (notEnoughColours) scope.colours = colours;
//      return colours.map(convertColour);
//    }
//
//    function convertColour (colour) {
//      if (typeof colour === 'object' && colour !== null) return colour;
//      if (typeof colour === 'string' && colour[0] === '#') return getColour(hexToRgb(colour.substr(1)));
//      return getRandomColour();
//    }
//
//    function getRandomColour () {
//      var colour = [getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255)];
//      return getColour(colour);
//    }
//
//    function getColour (colour) {
//      return {
//        fillColor: rgba(colour, 0.2),
//        strokeColor: rgba(colour, 1),
//        pointColor: rgba(colour, 1),
//        pointStrokeColor: '#fff',
//        pointHighlightFill: '#fff',
//        pointHighlightStroke: rgba(colour, 0.8)
//      };
//    }
//
//    function getRandomInt (min, max) {
//      return Math.floor(Math.random() * (max - min + 1)) + min;
//    }
//
//    function rgba (colour, alpha) {
//      if (usingExcanvas) {
//        // rgba not supported by IE8
//        return 'rgb(' + colour.join(',') + ')';
//      } else {
//        return 'rgba(' + colour.concat(alpha).join(',') + ')';
//      }
//    }
//
//    // Credit: http://stackoverflow.com/a/11508164/1190235
//    function hexToRgb (hex) {
//      var bigint = parseInt(hex, 16),
//        r = (bigint >> 16) & 255,
//        g = (bigint >> 8) & 255,
//        b = bigint & 255;
//
//      return [r, g, b];
//    }
//
//    function getDataSets (labels, data, series, colours) {
//      return {
//        labels: labels,
//        datasets: data.map(function (item, i) {
//          return angular.extend({}, colours[i], {
//            label: series[i],
//            data: item
//          });
//        })
//      };
//    }
//
//    function getData (labels, data, colours) {
//      return labels.map(function (label, i) {
//        return angular.extend({}, colours[i], {
//          label: label,
//          value: data[i],
//          color: colours[i].strokeColor,
//          highlight: colours[i].pointHighlightStroke
//        });
//      });
//    }
//
//    function setLegend (elem, chart) {
//      var $parent = elem.parent(),
//          $oldLegend = $parent.find('chart-legend'),
//          legend = '<chart-legend>' + chart.generateLegend() + '</chart-legend>';
//      if ($oldLegend.length) $oldLegend.replaceWith(legend);
//      else $parent.append(legend);
//    }
//
//    function updateChart (chart, values, scope, elem) {
//      if (Array.isArray(scope.data[0])) {
//        chart.datasets.forEach(function (dataset, i) {
//          (dataset.points || dataset.bars).forEach(function (dataItem, j) {
//            dataItem.value = values[i][j];
//          });
//        });
//      } else {
//        chart.segments.forEach(function (segment, i) {
//          segment.value = values[i];
//        });
//      }
//      chart.update();
//      scope.$emit('update', chart);
//      if (scope.legend && scope.legend !== 'false') setLegend(elem, chart);
//    }
//
//    function isEmpty (value) {
//      return ! value ||
//        (Array.isArray(value) && ! value.length) ||
//        (typeof value === 'object' && ! Object.keys(value).length);
//    }
//
//    function isResponsive (type, scope) {
//      var options = angular.extend({}, Chart.defaults.global, ChartJs.getOptions(type), scope.options);
//      return options.responsive;
//    }
//
//    function destroyChart(chart, scope) {
//      if(! chart) return;
//      chart.destroy();
//      scope.$emit('destroy', chart);
//    }
//  }
//}));


/*!
 * angular-chart.js - An angular.js wrapper for Chart.js
 * http://jtblin.github.io/angular-chart.js/
 * Version: 1.0.0-beta1
 *
 * Copyright 2016 Jerome Touffe-Blin
 * Released under the BSD-2-Clause license
 * https://github.com/jtblin/angular-chart.js/blob/master/LICENSE
 */
(function (factory) {
    'use strict';
    if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory(
            typeof angular !== 'undefined' ? angular : require('angular'),
            typeof Chart !== 'undefined' ? Chart : require('chart.js'));
    }  else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['angular', 'chart'], factory);
    } else {
        // Browser globals
        if (typeof angular === 'undefined' || typeof Chart === 'undefined') throw new Error('Chart.js library needs to included, ' +
        'see http://jtblin.github.io/angular-chart.js/');
        factory(angular, Chart);
    }
}(function (angular, Chart) {
    'use strict';

    Chart.defaults.global.multiTooltipTemplate = '<%if (datasetLabel){%><%=datasetLabel%>: <%}%><%= value %>';
    Chart.defaults.global.tooltips.mode = 'label';
    Chart.defaults.global.elements.line.borderWidth = 2;
    Chart.defaults.global.elements.rectangle.borderWidth = 2;
    Chart.defaults.global.legend.display = false;
    Chart.defaults.global.colors = [
        '#97BBCD', // blue
        '#DCDCDC', // light grey
        '#F7464A', // red
        '#46BFBD', // green
        '#FDB45C', // yellow
        '#949FB1', // grey
        '#4D5360'  // dark grey
    ];

    var useExcanvas = typeof window.G_vmlCanvasManager === 'object' &&
        window.G_vmlCanvasManager !== null &&
        typeof window.G_vmlCanvasManager.initElement === 'function';

    if (useExcanvas) Chart.defaults.global.animation = false;

    return angular.module('chart.js', [])
        .provider('ChartJs', ChartJsProvider)
        .factory('ChartJsFactory', ['ChartJs', '$timeout', ChartJsFactory])
        .directive('chartBase', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory(); }])
        .directive('chartLine', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('line'); }])
        .directive('chartBar', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('bar'); }])
        .directive('chartHorizontalBar', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('horizontalBar'); }])
        .directive('chartRadar', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('radar'); }])
        .directive('chartDoughnut', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('doughnut'); }])
        .directive('chartPie', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('pie'); }])
        .directive('chartPolarArea', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('polarArea'); }])
        .directive('chartBubble', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('bubble'); }])
        .name;

    /**
     * Wrapper for chart.js
     * Allows configuring chart js using the provider
     *
     * angular.module('myModule', ['chart.js']).config(function(ChartJsProvider) {
   *   ChartJsProvider.setOptions({ responsive: false });
   *   ChartJsProvider.setOptions('Line', { responsive: true });
   * })))
     */
    function ChartJsProvider () {
        var options = { responsive: true };
        var ChartJs = {
            Chart: Chart,
            getOptions: function (type) {
                var typeOptions = type && options[type] || {};
                return angular.extend({}, options, typeOptions);
            }
        };

        /**
         * Allow to set global options during configuration
         */
        this.setOptions = function (type, customOptions) {
            // If no type was specified set option for the global object
            if (! customOptions) {
                customOptions = type;
                options = angular.extend(options, customOptions);
                return;
            }
            // Set options for the specific chart
            options[type] = angular.extend(options[type] || {}, customOptions);
        };

        this.$get = function () {
            return ChartJs;
        };
    }

    function ChartJsFactory (ChartJs, $timeout) {
        return function chart (type) {
            return {
                restrict: 'CA',
                scope: {
                    chartGetColor: '=?',
                    chartType: '=',
                    chartData: '=?',
                    chartLabels: '=?',
                    chartOptions: '=?',
                    chartSeries: '=?',
                    chartColors: '=?',
                    chartClick: '=?',
                    chartHover: '=?',
                    chartDatasetOverride: '=?'
                },
                link: function (scope, elem/*, attrs */) {
                    if (useExcanvas) window.G_vmlCanvasManager.initElement(elem[0]);

                    // Order of setting "watch" matter
                    scope.$watch('chartData', watchData, true);
                    scope.$watch('chartSeries', watchOther, true);
                    scope.$watch('chartLabels', watchOther, true);
                    scope.$watch('chartOptions', watchOther, true);
                    scope.$watch('chartColors', watchOther, true);
                    scope.$watch('chartDatasetOverride', watchOther, true);
                    scope.$watch('chartType', watchType, false);

                    scope.$on('$destroy', function () {
                        destroyChart(scope);
                    });

                    scope.$on('$resize', function () {
                        if (scope.chart) scope.chart.resize();
                    });

                    function watchData (newVal, oldVal) {
                        if (! newVal || ! newVal.length || (Array.isArray(newVal[0]) && ! newVal[0].length)) {
                            destroyChart(scope);
                            return;
                        }
                        var chartType = type || scope.chartType;
                        if (! chartType) return;

                        if (scope.chart && canUpdateChart(newVal, oldVal))
                            return updateChart(newVal, scope);

                        createChart(chartType, scope, elem);
                    }

                    function watchOther (newVal, oldVal) {
                        if (isEmpty(newVal)) return;
                        if (angular.equals(newVal, oldVal)) return;
                        var chartType = type || scope.chartType;
                        if (! chartType) return;

                        // chart.update() doesn't work for series and labels
                        // so we have to re-create the chart entirely
                        createChart(chartType, scope, elem);
                    }

                    function watchType (newVal, oldVal) {
                        if (isEmpty(newVal)) return;
                        if (angular.equals(newVal, oldVal)) return;
                        createChart(newVal, scope, elem);
                    }
                }
            };
        };

        function createChart (type, scope, elem) {
            var options = getChartOptions(type, scope);
            if (! hasData(scope) || ! canDisplay(type, scope, elem, options)) return;

            var cvs = elem[0];
            var ctx = cvs.getContext('2d');

            scope.chartGetColor = getChartColorFn(scope);
            var data = getChartData(type, scope);

            // Destroy old chart if it exists to avoid ghost charts issue
            // https://github.com/jtblin/angular-chart.js/issues/187
            destroyChart(scope);

            scope.chart = new ChartJs.Chart(ctx, {
                type: type,
                data: data,
                options: options
            });
            scope.$emit('chart-create', scope.chart);
            bindEvents(cvs, scope);
        }

        function canUpdateChart (newVal, oldVal) {
            if (newVal && oldVal && newVal.length && oldVal.length) {
                return Array.isArray(newVal[0]) ?
                newVal.length === oldVal.length && newVal.every(function (element, index) {
                    return element.length === oldVal[index].length; }) :
                    oldVal.reduce(sum, 0) > 0 ? newVal.length === oldVal.length : false;
            }
            return false;
        }

        function sum (carry, val) {
            return carry + val;
        }

        function getEventHandler (scope, action, triggerOnlyOnChange) {
            var lastState = null;
            return function (evt) {
                var atEvent = scope.chart.getElementsAtEvent || scope.chart.getPointsAtEvent;
                if (atEvent) {
                    var activePoints = atEvent.call(scope.chart, evt);
                    if (triggerOnlyOnChange === false || angular.equals(lastState, activePoints) === false) {
                        lastState = activePoints;
                        scope[action](activePoints, evt);
                    }
                }
            };
        }

        function getColors (type, scope) {
            var colors = angular.copy(scope.chartColors ||
                ChartJs.getOptions(type).chartColors ||
                Chart.defaults.global.colors
            );
            var notEnoughColors = colors.length < scope.chartData.length;
            while (colors.length < scope.chartData.length) {
                colors.push(scope.chartGetColor());
            }
            // mutate colors in this case as we don't want
            // the colors to change on each refresh
            if (notEnoughColors) scope.chartColors = colors;
            return colors.map(convertColor);
        }

        function convertColor (color) {
            if (typeof color === 'object' && color !== null) return color;
            if (typeof color === 'string' && color[0] === '#') return getColor(hexToRgb(color.substr(1)));
            return getRandomColor();
        }

        function getRandomColor () {
            var color = [getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255)];
            return getColor(color);
        }

        function getColor (color) {
            return {
                backgroundColor: rgba(color, 0.2),
                pointBackgroundColor: rgba(color, 1),
                pointHoverBackgroundColor: rgba(color, 0.8),
                borderColor: rgba(color, 1),
                pointBorderColor: '#fff',
                pointHoverBorderColor: rgba(color, 1)
            };
        }

        function getRandomInt (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function rgba (color, alpha) {
            // rgba not supported by IE8
            return useExcanvas ? 'rgb(' + color.join(',') + ')' : 'rgba(' + color.concat(alpha).join(',') + ')';
        }

        // Credit: http://stackoverflow.com/a/11508164/1190235
        function hexToRgb (hex) {
            var bigint = parseInt(hex, 16),
                r = (bigint >> 16) & 255,
                g = (bigint >> 8) & 255,
                b = bigint & 255;

            return [r, g, b];
        }

        function hasData (scope) {
            return scope.chartData && scope.chartData.length;
        }

        function getChartColorFn (scope) {
            return typeof scope.chartGetColor === 'function' ? scope.chartGetColor : getRandomColor;
        }

        function getChartData (type, scope) {
            var colors = getColors(type, scope);
            return Array.isArray(scope.chartData[0]) ?
                getDataSets(scope.chartLabels, scope.chartData, scope.chartSeries || [], colors, scope.chartDatasetOverride) :
                getData(scope.chartLabels, scope.chartData, colors, scope.chartDatasetOverride);
        }

        function getDataSets (labels, data, series, colors, datasetOverride) {
            return {
                labels: labels,
                datasets: data.map(function (item, i) {
                    var dataset = angular.extend({}, colors[i], {
                        label: series[i],
                        data: item
                    });
                    if (datasetOverride && datasetOverride.length >= i) {
                        angular.merge(dataset, datasetOverride[i]);
                    }
                    return dataset;
                })
            };
        }

        function getData (labels, data, colors, datasetOverride) {
            var dataset = {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.map(function (color) {
                        return color.pointBackgroundColor;
                    }),
                    hoverBackgroundColor: colors.map(function (color) {
                        return color.backgroundColor;
                    })
                }]
            };
            if (datasetOverride) {
                angular.merge(dataset.datasets[0], datasetOverride);
            }
            return dataset;
        }

        function getChartOptions (type, scope) {
            return angular.extend({}, ChartJs.getOptions(type), scope.chartOptions);
        }

        function bindEvents (cvs, scope) {
            cvs.onclick = scope.chartClick ? getEventHandler(scope, 'chartClick', false) : angular.noop;
            cvs.onmousemove = scope.chartHover ? getEventHandler(scope, 'chartHover', true) : angular.noop;
        }

        function updateChart (values, scope) {
            if (Array.isArray(scope.chartData[0])) {
                scope.chart.data.datasets.forEach(function (dataset, i) {
                    dataset.data = values[i];
                });
            } else {
                scope.chart.data.datasets[0].data = values;
            }

            scope.chart.update();
            scope.$emit('chart-update', scope.chart);
        }

        function isEmpty (value) {
            return ! value ||
            (Array.isArray(value) && ! value.length) ||
            (typeof value === 'object' && ! Object.keys(value).length);
        }

        function canDisplay (type, scope, elem, options) {
            // TODO: check parent?
            if (options.responsive && elem[0].clientHeight === 0) {
                $timeout(function () {
                    createChart(type, scope, elem);
                }, 50, false);
                return false;
            }
            return true;
        }

        function destroyChart(scope) {
            if(! scope.chart) return;
            scope.chart.destroy();
            scope.$emit('chart-destroy', scope.chart);
        }
    }
}));