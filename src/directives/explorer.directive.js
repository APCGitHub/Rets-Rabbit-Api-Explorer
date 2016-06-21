(function() {
    'use strict';
    angular
        .module('rr.api.v2.explorer.directive.explorer', [])
        .directive('apiExplorer', Directive);

    Directive.$inject = ['ApiConfig', 'PropertyFactory'];

    function Directive(ApiConfig, PropertyFactory) {
        var controller = ['$scope', function($scope) {
            var vm = this;

            $scope.$watch(angular.bind(this, function() {
                return this.search;
            }), function(newVal) {
                console.log('search changed to ' + newVal);
            });

            vm.data = {
                searchForm: {
                    select: '',
                    filter: [{ value: '', operator: '', join: 'and' }],
                    orderby: [{ value: '', direction: 'asc' }],
                    top: '',
                    skip: ''
                },
                fullRequest: ApiConfig.apiUrl + 'property?',
                request: '',
                results: null,
                total_results: -1,
                error: null,
                searching: false
            };

            /* --- Bind Method Handles --- */
            vm.search = _search;
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

                PropertyFactory.search(vm.data.request).then(function(res) {
                    vm.data.error = null;
                    vm.data.results = res;
                    vm.data.total_results = res.value.length;
                    vm.data.searching = false;
                }, function(err) {
                    vm.data.searching = false;
                    vm.data.error = err.error;
                });
            }


            function _addFilter() {
                vm.data.searchForm.filter.push({
                    value: '',
                    operator: '',
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
                        _q += '$filter';

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
        }];

        return {
            restrict: 'EA',
            scope: {},
            link: function(scope, element, attrs, controller) {},
            templateUrl: 'explorer.bootstrap.html',
            controller: controller,
            controllerAs: 'vm',
            bindToController: {
                search: '='
            }
        };
    }
})();
