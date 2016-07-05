(function() {
    'use strict';
    angular
        .module('rr.api.v2.explorer.directive.explorer', [])
        .directive('apiExplorer', Directive);

    Directive.$inject = ['ApiConfig', 'PropertyFactory'];

    function Directive(ApiConfig, PropertyFactory) {
        var controller = ['$scope', '$interval', '$document', 'PropertyFactory', 'uiGmapGoogleMapApi', 'uiGmapIsReady', function($scope, $interval, $document, PropertyFactory, uiGmapGoogleMapApi, uiGmapIsReady) {
            var vm = this,
                promise,
                someElement = angular.element(document.getElementById('rr-query-results')),
                shapeProps = {
                    fillColor: '#ec6952',
                    fillOpacity: 0.5,
                    editable: true,
                    draggable: true,
                    zIndex: 1,
                    clickable: false,
                    strokeWeight: 3,
                    geodesic: true
                };
            //drawnItems = new L.FeatureGroup();

            //Watch for when the search attribute value changes from the parent scope
            $scope.$watch(angular.bind(this, function() {
                return this.search;
            }), function(newVal) {
                if (newVal && newVal !== 'undefined' && newVal !== undefined && (typeof newVal) != 'function') {
                    vm.data.searchForm.select = newVal.query.select;
                    vm.data.searchForm.filter = newVal.query.filter;
                    vm.data.searchForm.orderby = newVal.query.orderby;
                    vm.data.searchForm.top = newVal.query.top;
                    vm.data.searchForm.skip = newVal.query.skip;

                    //reset to default
                    vm.data.error = null;
                    vm.data.results = null;
                    vm.data.searching = false;
                    vm.data.total_results = -1;

                    _buildQuery();
                }
            });

            //Set the view model data
            vm.data = {
                searchForm: {
                    select: '',
                    filter: [{ value: '', join: 'and' }],
                    orderby: [{ value: '', direction: 'asc' }],
                    top: '',
                    skip: ''
                },
                map: {
                    //Columbus
                    center: {
                        latitude: 39.9612,
                        longitude: -82.9988
                    },
                    zoom: 11,
                    drawingManagerOptions: {},
                    drawingManagerControl: {},
                    bounds: {},
                    shape: {
                        circle: null,
                        rectangle: null,
                        polygon: null
                    }
                },
                fullRequest: ApiConfig.apiUrl + 'property?',
                request: '',
                results: null,
                total_results: -1,
                error: null,
                searching: false,
                query_time: -1
            };

            //Handle map instantiation stuffs
            uiGmapGoogleMapApi.then(function(maps) {
                vm.data.map.drawingManagerOptions = {
                    drawingMode: google.maps.drawing.OverlayType.MARKER,
                    drawingControl: true,
                    drawingControlOptions: {
                        position: google.maps.ControlPosition.TOP_CENTER,
                        drawingModes: [
                            google.maps.drawing.OverlayType.CIRCLE,
                            google.maps.drawing.OverlayType.POLYGON,
                            google.maps.drawing.OverlayType.RECTANGLE
                        ]
                    },
                    polygonOptions: {},
                    circleOptions: {},
                    rectangleOptions: {}
                };

                //All shapes have the same settings
                angular.extend(vm.data.map.drawingManagerOptions.polygonOptions, shapeProps);
                angular.extend(vm.data.map.drawingManagerOptions.circleOptions, shapeProps);
                angular.extend(vm.data.map.drawingManagerOptions.rectangleOptions, shapeProps);
            });

            //Map UI is loaded so hook up event listeners
            uiGmapIsReady.promise().then(function(maps) {
                //circle finish
                google.maps.event.addListener(vm.data.map.drawingManagerControl.getDrawingManager(), 'circlecomplete', function(circle) {
                    _circle(circle);
                });

                //polygon finish
                google.maps.event.addListener(vm.data.map.drawingManagerControl.getDrawingManager(), 'polygoncomplete', function(polygon) {
                    _polygon(polygon);
                });

                //rectangle finish
                google.maps.event.addListener(vm.data.map.drawingManagerControl.getDrawingManager(), 'rectanglecomplete', function(rectangle) {
                    _rectangle(rectangle);
                });
            });

            /* --- Bind Method Handles --- */
            vm.doSearch = _search;
            vm.addFilter = _addFilter;
            vm.removeFilter = _removeFilter;
            vm.addOrderby = _addOrderby;
            vm.removeOrderby = _removeOrderby;
            vm.updateQuery = _buildQuery;

            /* --- Methods --- */
            function _search(valid) {
                if (!valid)
                    return;

                vm.data.total_results = -1;
                vm.data.error = null;
                vm.data.results = null;
                vm.data.searching = true;

                var start = new Date();

                PropertyFactory.search(vm.data.request).then(function(res) {
                    $document.scrollToElement(someElement, 70, 300);
                    var end = new Date();

                    //vm.data.query_time = end.getTime() - start.getTime();
                    vm.data.error = null;
                    vm.data.results = res;
                    vm.data.total_results = res.value.length;
                    vm.data.searching = false;
                    _startCount(end.getTime() - start.getTime());
                }, function(err) {
                    $document.scrollToElement(someElement, 70, 300);
                    vm.data.query_time = -1;
                    vm.data.searching = false;
                    vm.data.error = err ? err.error : {};
                });
            }


            function _addFilter() {
                vm.data.searchForm.filter.push({
                    value: '',
                    join: 'and'
                });
            }

            function _removeFilter(filter) {
                var i = vm.data.searchForm.filter.indexOf(filter);
                vm.data.searchForm.filter.splice(i, 1);
                _buildQuery();
            }

            function _addOrderby() {
                vm.data.searchForm.orderby.push({
                    value: '',
                    direction: 'asc'
                });
            }

            function _removeOrderby(orderby) {
                var i = vm.data.searchForm.orderby.indexOf(orderby);
                vm.data.searchForm.orderby.splice(i, 1);
                _buildQuery();
            }

            /**
             * This method handles building the query string based on the selected
             * parameters
             * 
             * @return void
             */
            function _buildQuery() {
                var _q = '';
                var i = 0;

                var params = [0, 0, 0, 0, 0]; //select, filter, orderby, top, skip

                //select
                if (vm.data.searchForm.select !== '') {
                    params[0] = 1;
                    _q += '$select=' + vm.data.searchForm.select;
                }

                //filter
                if (vm.data.searchForm.filter.length) {
                    params[1] = 1;

                    if (params[0])
                        _q += '&$filter=';
                    else
                        _q += '$filter=';

                    for (i = 0; i < vm.data.searchForm.filter.length; i++) {
                        _q += vm.data.searchForm.filter[i].value;

                        if (vm.data.searchForm.filter[i].value !== '' && i + 1 < vm.data.searchForm.filter.length) {
                            _q += ' ' + vm.data.searchForm.filter[i].join;
                        }

                        if (i + 1 < vm.data.searchForm.filter.length)
                            _q += ' ';
                    }
                }

                //orderby
                if (vm.data.searchForm.orderby.length) {
                    params[2] = 1;

                    if (params[0] + params[1] > 0)
                        _q += '&$orderby=';
                    else
                        _q += '$orderby=';

                    _q += vm.data.searchForm.orderby.map(function(orderby) {
                        if (orderby.value !== '')
                            return orderby.value + ' ' + orderby.direction;
                        else
                            return '';
                    }).join(', ');
                }

                //top
                if (vm.data.searchForm.top != '') {
                    params[3] = 1;

                    if (params[0] + params[1] + params[2] > 0)
                        _q += '&$top=';
                    else
                        _q += '$top='

                    _q += vm.data.searchForm.top;
                }

                //skip
                if (vm.data.searchForm.skip != '') {
                    params[4] = 1;

                    if (params[0] + params[1] + params[2] + params[3] > 0)
                        _q += '&$skip=';
                    else
                        _q += '$skip='

                    _q += vm.data.searchForm.skip;
                }

                vm.data.fullRequest = ApiConfig.apiUrl + 'property?' + _q;
                vm.data.request = _q;
            }

            function _startCount(total_time) {
                var time = 0;
                vm.data.query_time = 0;
                var interval = 5;
                var max_time = 750;

                //skip counter if too long
                if (total_time > 750) {
                    vm.data.query_time = total_time;
                } else {
                    promise = $interval(function(time) {
                        if (vm.data.query_time == total_time) {

                            $interval.cancel(promise);
                            // textAnim = $timeout(function() {
                            //     $scope.text = 'done!';
                            // }, 1000);

                        } else {
                            vm.data.query_time++;
                        }
                    }, interval);
                }
            }

            function _clearShapes(shape) {
                switch (shape) {
                    case 1: //circle
                        vm.data.map.shape.rectangle = null;
                        vm.data.map.shape.polygon = null;
                        break;

                    case 2: //rectangle
                        vm.data.map.shape.circle = null;
                        vm.data.map.shape.polygon = null;
                        break;

                    case 3: //polygon
                        vm.data.map.shape.circle = null;
                        vm.data.map.shape.rectangle = null;
                        break;
                }
            }

            function _circle(circle) {
                _clearShapes(1);

                var isNull = vm.data.map.shape.circle === null ? true : false;
                vm.data.map.shape.circle = circle;
                var radius = circle.getRadius();
                var pos = { lat: circle.center.lat(), lng: circle.center.lng() };
                console.log(JSON.stringify(pos) + ' ' + radius);

                if (isNull) {
                    //circle radius change
                    google.maps.event.addListener(vm.data.map.shape.circle, 'radius_changed', function() {
                        console.log('radius change');
                        var radius = vm.data.map.shape.circle.getRadius();
                        var pos = { lat: vm.data.map.shape.circle.center.lat(), lng: vm.data.map.shape.circle.center.lng() };
                        console.log(JSON.stringify(pos) + ' ' + radius);
                    });

                    google.maps.event.addListener(vm.data.map.shape.circle, 'dragend', function() {
                        console.log('dragend change');
                        var radius = vm.data.map.shape.circle.getRadius();
                        var pos = { lat: vm.data.map.shape.circle.center.lat(), lng: vm.data.map.shape.circle.center.lng() };
                        console.log(JSON.stringify(pos) + ' ' + radius);
                    });
                }
            }

            function _rectangle(rectangle) {
                _clearShapes(2);

                var isNull = vm.data.map.shape.rectangle === null ? true : false;
                vm.data.map.shape.rectangle = rectangle;

                var points = [];
                var bounds = rectangle.getBounds();
                var NE = bounds.getNorthEast();
                var SW = bounds.getSouthWest();

                points.push({ lat: NE.lat(), lng: SW.lng() });
                points.push({ lat: NE.lat(), lng: NE.lng() });
                points.push({ lat: SW.lat(), lng: NE.lng() });
                points.push({ lat: SW.lat(), lng: SW.lng() });

                console.log(points);

                if (isNull) {
                    google.maps.event.addListener(vm.data.map.shape.rectangle, 'bounds_changed', function() {
                        console.log('bounds changed');
                        var points = [];
                        var bounds = vm.data.map.shape.rectangle.getBounds();
                        var NE = bounds.getNorthEast();
                        var SW = bounds.getSouthWest();

                        points.push({ lat: NE.lat(), lng: SW.lng() });
                        points.push({ lat: NE.lat(), lng: NE.lng() });
                        points.push({ lat: SW.lat(), lng: NE.lng() });
                        points.push({ lat: SW.lat(), lng: SW.lng() });
                    });
                }
            }

            function _polygon(polygon) {
                _clearShapes(3);

                var isNull = vm.data.map.shape.polygon === null ? true : false;
                vm.data.map.shape.polygon = polygon;

                var points = [];
                for (var i = 0; i < polygon.getPath().getLength(); i++) {
                    var coord = polygon.getPath().getAt(i);
                    points.push({ lat: coord.lat(), lng: coord.lng() });
                }
            }
        }];

        return {
            restrict: 'EA',
            scope: true,
            link: function(scope, element, attrs, controller) {},
            templateUrl: 'explorer.bootstrap.html',
            controller: controller,
            controllerAs: 'vm',
            bindToController: {
                search: '=',
                loader: '='
            }
        };
    }
})();
