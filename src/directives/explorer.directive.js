(function () {
	'use strict';
	angular
		.module('rr.api.v2.explorer.directive.explorer', [])
		.directive('apiExplorer', Directive);

	Directive.$inject = ['PropertyFactory'];

	function Directive(PropertyFactory) {
		return {
			restrict: 'EA',
			scope: {},
			templateUrl: 'explorer.bootstrap.html',
			link: function (scope, element, attrs) {},
			controller: function ($scope){
				$scope.data = {
					searchForm: {
						select: [{value:''}],
						filter: [{value:'', operator: ''}],
						orderby: [{value:'', direction: 'asc'}],
						top: '',
						skip: ''
					},
					request: '',
					results: []
				};

				/* --- Bind Method Handles --- */
				$scope.search = _search;
				$scope.addSelect = _addSelect;
				$scope.addFilter = _addFilter;
				$scope.addOrderby = _addOrderby;

				//We have to update the formatted request panel
				$scope.watchCollection('data.searchForm.select', _updateRequest);
				$scope.watchCollection('data.searchForm.filter', _updateRequest);
				$scope.watchCollection('data.searchForm.orderby', _updateRequest);
				$scope.watch('data.searchForm.top', _updateRequest);
				$scope.watch('data.searchForm.skip', _updateRequest);


				/* --- Methods --- */
				function _search() {

				}

				function _addSelect() {
					$scope.data.searchForm.select.push({
						value: ''
					});
				}

				function _addFilter() {
					$scope.data.searchForm.filter.push({
						value: ''
					});
				}

				function _addOrderby() {
					$scope.data.searchForm.orderby.push({
						value: ''
					});
				}

				function _updateRequestComplex(newVal, oldVal) {
					if(newVal != oldVal){
						_buildQuery();
					}
				}

				/**
				 * This method handles building the query string based on the selected
				 * parameters
				 * 
				 * @return void
				 */
				function _buildQuery(){
					var _q = Constants.v2.apiUrl + 'property?';
					var i = 0;
					var filter_array = [];

					//select
					if($scope.data.searchForm.select.length)
						_q += '$select=';

					_q += $scope.data.searchForm.select.map(function (select) {
						return select.value
					}).join(', ');

					//filter
					if($scope.data.searchForm.filter.length)
						if($scope.data.searchForm.select.length)
							_q += '&$filter=';
						else
							_q += '$filter=';

					filter_array = $scope.data.searchForm.filter.map(function (filter) {
						return filter.value
					});

					for(var i = 0; i < $scope.data.searchForm.filter.length; i++){
						_q += filter_array[i];

						if($scope.data.searchForm.filter[i].operator != '')
							_q += ' ' + $scope.data.searchForm.filter[i].operator;

						if(i + 1 < $scope.data.searchForm.filter.length)
							_q += ' ';
					}

					//orderby
					if($scope.data.searchForm.orderby.length)
						if($scope.data.searchForm.select.length && $scope.data.searchForm.filter.length)
							_q += '&$filter=';
						else
							_q += '$filter=';

					_q += $scope.data.searchForm.orderby.map(function (orderby) {
						return orderby.value + ' ' + orderby.direction
					}).join(', ');

					//top
					if($scope.data.searchForm.top != '')
						_q += '$top=' + $scope.data.searchForm.top;

					//skip
					if($scope.data.searchForm.skip != '')
						_q += '$skip=' + $scope.data.searchForm.skip;
				}
			}
		};
	}
})();