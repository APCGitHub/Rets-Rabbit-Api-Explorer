(function() {
    'use strict';
    angular
        .module('rr.api.v2.explorer.directive.explorer', [])
        .directive('apiExplorer', Directive);

    Directive.$inject = ['ApiConfig', 'PropertyFactoryV2'];

    function Directive(ApiConfig, PropertyFactory) {
        var controller = ['$scope', '$interval', '$timeout', '$document', 'PropertyFactoryV2', 'uiGmapGoogleMapApi', 'uiGmapIsReady', function($scope, $interval, $timeout, $document, PropertyFactory, uiGmapGoogleMapApi, uiGmapIsReady) {
            var vm = this,
                promise,
                someElement = angular.element(document.getElementById('rr-query-results')),
                shapeProps = {
                    fillColor: '#ec6952',
                    fillOpacity: 0.5,
                    editable: true,
                    draggable: true,
                    strokeWeight: 3,
                    geodesic: true
                },
                gMap = null;

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
                    skip: '',
                    geo: {
                        intersects: { points: [] },
                        within: { center: {}, distance: -1 }
                    }
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
                    },
                    markers: []
                },
                fullRequest: ApiConfig.v2.apiUrl + 'property?',
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
                    polygonOptions: shapeProps,
                    circleOptions: shapeProps,
                    rectangleOptions: shapeProps
                };

                vm.data.map.bounds = new google.maps.LatLngBounds();
            });

            //Map UI is loaded so hook up event listeners
            uiGmapIsReady.promise().then(function(maps) {
                var gMap = maps[0].map;

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

                //watch for any overlay finish to hide controls
                google.maps.event.addListener(vm.data.map.drawingManagerControl.getDrawingManager(), 'overlaycomplete', function(e) {
                    var drawingManager = vm.data.map.drawingManagerControl.getDrawingManager();
                    if (e.type != google.maps.drawing.OverlayType.MARKER) {
                        // Switch back to non-drawing mode after drawing a shape.
                        drawingManager.setDrawingMode(null);
                        // To hide:
                        drawingManager.setOptions({
                            drawingControl: false
                        });
                    }
                });

                //add control to handle removing current shape
                var rightControlDiv = document.createElement('div');
                var rightControl = new RightControl(rightControlDiv, gMap);

                rightControlDiv.index = 1;
                gMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(rightControlDiv);

                $timeout(function() {
                    vm.data.map.drawingManagerControl.getDrawingManager().setDrawingMode(null);
                }, 500);
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

                    $timeout(function () {
                        _plotPoints(res.value);
                    }, 1);
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
                if (vm.data.searchForm.filter.length || vm.data.searchForm.geo.within.distance > 0 || vm.data.searchForm.geo.intersects.points.length) {
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

                    //distance
                    if (vm.data.searchForm.geo.within.distance > 0) {
                        if (vm.data.searchForm.filter.length)
                            _q += ' and ';

                        _q += 'geo.distance(location, POINT(' + vm.data.searchForm.geo.within.center.lng + ' ' + vm.data.searchForm.geo.within.center.lat + ')) le ' + vm.data.searchForm.geo.within.distance;

                        console.log('did hte distance');

                    }

                    //intersects
                    if (vm.data.searchForm.geo.intersects.points.length > 0) {
                        if (vm.data.searchForm.filter.length)
                            _q += ' and ';

                        _q += 'geo.intersects(location, POLYGON((';

                        _q += vm.data.searchForm.geo.intersects.points.map(function(point) {
                            return point.lng + ' ' + point.lat;
                        }).join(', ');

                        _q += ')))';
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

                vm.data.fullRequest = ApiConfig.v2.apiUrl + 'property?' + _q;
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

            function _plotPoints(listings) {
                vm.data.map.markers = [];

                for (var i = 0; i < listings.length; i++) {
                    var listing = listings[i];
                    var lat = 0, lng = 0;

                    if(listing['listing']){
                        //this will be deprecated in the future
                        lat = listing.listing.lat;
                        lng = listing.listing.long;
                    } else if (listing['Latitude'] && listing['Longitude']) {
                        //if MLS fields exist go ahead and use those
                        lat = listing.Latitude;
                        lng = listing.Longitude;
                    } else if(listing.lat && listing.long) {
                        //we will be flattening the response at some point
                        //so this will becoming the future use case
                        lat = listing.lat;
                        lng = listing.long;
                    }

                    var marker = {
                        id: (new Date()).getTime(),
                        coords: {
                            latitude: parseFloat(lat),
                            longitude: parseFloat(lng)
                        }
                    };

                    var latlng = new google.maps.LatLng(lat, lng);
                    vm.data.map.bounds.extend(latlng);

                    vm.data.map.markers.push(marker);
                }

                if(vm.data.map.markers.length){
                    $timeout(function () {
                        gMap.fitBounds(vm.data.map.bounds);
                    }, 1);
                }
            }

            function _setCircle(circle) {
                var radius = circle.getRadius();
                var pos = { lat: circle.center.lat(), lng: circle.center.lng() };

                vm.data.searchForm.geo.within.center = pos;
                vm.data.searchForm.geo.within.distance = radius / 111195; //force some fancy math

                $timeout(function() {
                    _buildQuery();
                }, 1);
            }

            function _setIntersects(points) {
                vm.data.searchForm.geo.intersects.points = points;

                $timeout(function() {
                    _buildQuery();
                }, 1);
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

                _setCircle(vm.data.map.shape.circle);

                if (isNull) {
                    //circle radius change
                    vm.data.map.shape.circle.addListener('radius_changed', function() {
                        console.log('radius change');

                        _setCircle(vm.data.map.shape.circle);
                    });

                    vm.data.map.shape.circle.addListener('center_changed', function() {
                        console.log('circle center change');

                        _setCircle(vm.data.map.shape.circle);
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

                _setIntersects(points);

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

                        _setIntersects(points);
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

                _setIntersects(points);

                if (isNull) {
                    google.maps.event.addListener(vm.data.map.shape.polygon.getPath(), 'set_at', function() {
                        var points = [];
                        for (var i = 0; i < polygon.getPath().getLength(); i++) {
                            var coord = polygon.getPath().getAt(i);
                            points.push({ lat: coord.lat(), lng: coord.lng() });
                        }
                        _setIntersects(points);
                    });

                    google.maps.event.addListener(vm.data.map.shape.polygon.getPath(), 'insert_at', function() {
                        var points = [];
                        for (var i = 0; i < polygon.getPath().getLength(); i++) {
                            var coord = polygon.getPath().getAt(i);
                            points.push({ lat: coord.lat(), lng: coord.lng() });
                        }
                        _setIntersects(points);
                    });

                    google.maps.event.addListener(vm.data.map.shape.polygon.getPath(), 'remove_at', function() {
                        var points = [];
                        for (var i = 0; i < polygon.getPath().getLength(); i++) {
                            var coord = polygon.getPath().getAt(i);
                            points.push({ lat: coord.lat(), lng: coord.lng() });
                        }
                        _setIntersects(points);
                    });
                }
            }

            function RightControl(controlDiv, map) {
                var controlUI = document.createElement('div');
                controlUI.style.backgroundColor = '#fff';
                controlUI.style.border = '2px solid #fff';
                controlUI.style.borderRadius = '3px';
                controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
                controlUI.style.cursor = 'pointer';
                controlUI.style.marginBottom = '22px';
                controlUI.style.marginRight = '10px';
                controlUI.style.marginTop = '10px';
                controlUI.style.textAlign = 'center';
                controlUI.title = 'Click to delete current selected shape';
                controlDiv.appendChild(controlUI);

                // Set CSS for the control interior.
                var controlText = document.createElement('div');
                controlText.style.color = 'rgb(25,25,25)';
                controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
                controlText.style.fontSize = '16px';
                controlText.style.lineHeight = '38px';
                controlText.style.paddingLeft = '5px';
                controlText.style.paddingRight = '5px';
                controlText.innerHTML = 'Delete Shape';
                controlUI.appendChild(controlText);

                // Setup the click event listeners
                controlUI.addEventListener('click', function() {
                    if (vm.data.map.shape.circle) {
                        vm.data.map.shape.circle.setMap(null);
                    }

                    if (vm.data.map.shape.rectangle) {
                        vm.data.map.shape.rectangle.setMap(null);
                    }

                    if (vm.data.map.shape.polygon) {
                        vm.data.map.shape.polygon.setMap(null);
                    }

                    vm.data.searchForm.geo.within.distance = -1;
                    vm.data.searchForm.geo.within.center = {};
                    vm.data.searchForm.geo.intersects.points = [];

                    // To show:
                    if (vm.data.map.drawingManagerControl.getDrawingManager()) {
                        vm.data.map.drawingManagerControl.getDrawingManager().setOptions({
                            drawingControl: true
                        });
                    }

                    $timeout(function() {
                        vm.data.map.markers = [];
                        _buildQuery();
                    }, 1);
                });
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
