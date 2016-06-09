(function() {
    'use strict';
    angular
        .module('rr.api.v2.explorer.directive.explorer', [])
        .directive('apiExplorer', Directive);

    Directive.$inject = ['ApiConfig', 'PropertyFactory'];

    function Directive(ApiConfig, PropertyFactory) {
        return {
            restrict: 'EA',
            scope: {},
            templateUrl: 'explorer.bootstrap.html',
            controller: _controller,
            controllerAs: 'vm',
            bindToController: true
        };

        function _controller() {
        	var vm = this;

            vm.data = {
                searchForm: {
                    select: '',
                    filter: [{ value: '', operator: '', join: 'and'}],
                    orderby: [{ value: '', direction: 'asc' }],
                    top: '',
                    skip: ''
                },
                fullRequest: ApiConfig.apiUrl + 'property?',
                request: '',
                results: null,
                total_results: -1,
                error: null
            };

            /* --- Bind Method Handles --- */
            vm.search = _search;
            vm.addFilter = _addFilter;
            vm.removeFilter = _removeFilter;
            vm.addOrderby = _addOrderby;
            vm.removeOrderby = _removeOrderby;
            vm.updateQuery = _buildQuery;

            /* --- Methods --- */
            function _search() {
                vm.data.total_results = -1;
            	PropertyFactory.search(vm.data.request).then(function (res){
            		vm.data.error = null;
            		vm.data.results = res;
                    vm.data.total_results = res.value.length;
            	}, function (err) {
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

            function _removeFilter(filter){
            	var i = vm.data.searchForm.filter.indexOf(filter);
            	vm.data.searchForm.filter.splice(i, 1);
            }

            function _addOrderby() {
                vm.data.searchForm.orderby.push({
                    value: '',
                    direction: 'asc'
                });
            }

            function _removeOrderby(orderby){
            	var i = vm.data.searchForm.orderby.indexOf(orderby);
            	vm.data.searchForm.orderby.splice(i, 1);
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
                var filter_array = [];

                //select
                 if (vm.data.searchForm.select !== '')
                    _q += '$select=' + vm.data.searchForm.select;

                //filter
                if (vm.data.searchForm.filter.length)
                    if (vm.data.searchForm.select !== '')
                        _q += '&$filter=';
                    else
                        _q += '$filter=';

                filter_array = vm.data.searchForm.filter.map(function(filter) {
                    return filter.value
                });

                for (var i = 0; i < vm.data.searchForm.filter.length; i++) {
                    _q += filter_array[i];

                    if (vm.data.searchForm.filter[i].value !== '' && i + 1 < vm.data.searchForm.filter.length){
                        _q += ' ' + vm.data.searchForm.filter[i].join;
                    }

                    if (i + 1 < vm.data.searchForm.filter.length)
                        _q += ' ';
                }

                //orderby
                if (vm.data.searchForm.orderby.length)
                    if (vm.data.searchForm.select !== '' && vm.data.searchForm.filter.length)
                        _q += '&$orderby=';
                    else
                        _q += '$orderby=';

                _q += vm.data.searchForm.orderby.map(function(orderby) {
                	if(orderby.value !== '')
                    	return orderby.value + ' ' + orderby.direction;
                    else
                    	return '';
                }).join(', ');

                //top
                if (vm.data.searchForm.top != '')
                    _q += '&$top=' + vm.data.searchForm.top;

                //skip
                if (vm.data.searchForm.skip != '')
                    _q += '&$skip=' + vm.data.searchForm.skip;

                vm.data.fullRequest = ApiConfig.apiUrl + 'property?' + _q;
                vm.data.request = _q;
            }
        }
    }
})();
