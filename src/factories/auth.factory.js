(function () {
	'use strict';

	angular
		.module('rr.api.v2.explorer.factory.auth', [])
		.factory('AuthFactory', Factory);

	Factory.$inject = ['$http', '$q', '$window', 'Constants'];

	function Factory($http, $q, $window, Constants) {
		var factory = {
			getToken: _getToken
		};

		return factory;

		function _getToken(){
			var deferred = $q.defer();

			$http({
				method: 'POST',
				url: Constants.apiUrl + 'oauth/access_token',
				data: {
					client_id: Constants.clientId,
					client_secret: Constants.clientSecret,
					grant_type: 'credentials'
				}
			}).success(function (res){
				var token = res.token;
				deferred.resolve(token);
			}).error(function (err){
				deferred.reject(err);
			});

			return deferred;
		}
	}
})();