(function () {
	'use strict';
	
	angular.module('rr.api.v2.explorer', [
		'rets-rabbit-angular',
		'ngAnimate',
		'nemLogging',
		'ui-leaflet',
		'rr.api.v2.explorer.directives',
		'rr.api.v2.explorer.filters',
		'rr.api.v2.explorer.templates'
	]);
})();