(function() {
    'use strict';
    angular
        .module('rr.api.v2.explorer.directive.explorer', [])
        .directive('apiExplorer', Directive);

    Directive.$inject = [];

    function Directive() {
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
                    select: [{ value: '' }],
                    filter: [{ value: '', operator: '' }],
                    orderby: [{ value: '', direction: 'asc' }],
                    top: '',
                    skip: ''
                },
                request: '',
                results: []
            };

            // /* --- Bind Method Handles --- */
            // vm.search = _search;
            // vm.addSelect = _addSelect;
            // vm.addFilter = _addFilter;
            // vm.addOrderby = _addOrderby;

            // //We have to update the formatted request panel
            // vm.watchCollection('data.searchForm.select', _updateRequest);
            // vm.watchCollection('data.searchForm.filter', _updateRequest);
            // vm.watchCollection('data.searchForm.orderby', _updateRequest);
            // vm.watch('data.searchForm.top', _updateRequest);
            // vm.watch('data.searchForm.skip', _updateRequest);


            // /* --- Methods --- */
            // function _search() {

            // }

            // function _addSelect() {
            //     vm.data.searchForm.select.push({
            //         value: ''
            //     });
            // }

            // function _addFilter() {
            //     vm.data.searchForm.filter.push({
            //         value: ''
            //     });
            // }

            // function _addOrderby() {
            //     vm.data.searchForm.orderby.push({
            //         value: ''
            //     });
            // }

            // function _updateRequestComplex(newVal, oldVal) {
            //     if (newVal != oldVal) {
            //         _buildQuery();
            //     }
            // }

            // /**
            //  * This method handles building the query string based on the selected
            //  * parameters
            //  * 
            //  * @return void
            //  */
            // function _buildQuery() {
            //     var _q = Constants.v2.apiUrl + 'property?';
            //     var i = 0;
            //     var filter_array = [];

            //     //select
            //     if (vm.data.searchForm.select.length)
            //         _q += '$select=';

            //     _q += vm.data.searchForm.select.map(function(select) {
            //         return select.value
            //     }).join(', ');

            //     //filter
            //     if (vm.data.searchForm.filter.length)
            //         if (vm.data.searchForm.select.length)
            //             _q += '&$filter=';
            //         else
            //             _q += '$filter=';

            //     filter_array = vm.data.searchForm.filter.map(function(filter) {
            //         return filter.value
            //     });

            //     for (var i = 0; i < vm.data.searchForm.filter.length; i++) {
            //         _q += filter_array[i];

            //         if (vm.data.searchForm.filter[i].operator != '')
            //             _q += ' ' + vm.data.searchForm.filter[i].operator;

            //         if (i + 1 < vm.data.searchForm.filter.length)
            //             _q += ' ';
            //     }

            //     //orderby
            //     if (vm.data.searchForm.orderby.length)
            //         if (vm.data.searchForm.select.length && vm.data.searchForm.filter.length)
            //             _q += '&$filter=';
            //         else
            //             _q += '$filter=';

            //     _q += vm.data.searchForm.orderby.map(function(orderby) {
            //         return orderby.value + ' ' + orderby.direction
            //     }).join(', ');

            //     //top
            //     if (vm.data.searchForm.top != '')
            //         _q += '$top=' + vm.data.searchForm.top;

            //     //skip
            //     if (vm.data.searchForm.skip != '')
            //         _q += '$skip=' + vm.data.searchForm.skip;
            // }
        }
    }
})();
