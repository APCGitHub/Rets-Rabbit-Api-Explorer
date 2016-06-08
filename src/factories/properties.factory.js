(function () {
	'use strict';

	angular
		.module('rr.api.v2.explorer.factory.properties', [])
		.factory('PropertyFactory', Factory);

	Factory.$inject = ['$http', '$q', 'Constants'];

	function Factory($http, $q, Constants) {
		var factory = {
			search: _search,
			findOne: _findOne
		};

		return factory;

		function _search(query) {
			var deferred = $q.defer();

			$http.get(Constants.v2.apiUrl + 'property')
			.success(function (res){
				var listings = res.value;
				deferred.resolve(listings);
			}).error(function (err){
				deferred.reject(err);
			});

			return deferred.promise;
		}

		function _findOne(id){
			var deferred = $q.defer();
			$http.get(Constants.v2.apiUrl + 'property/' + id)
			.success(function (res){
				var listing = res.value;
				deferred.resolve(listing);
			}).error(function (err){
				deferred.reject(err);
			});
			return deferred.promise;
		}
	}
})();