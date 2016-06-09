angular.module("rr.api.v2.explorer.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("explorer.bootstrap.html","<div class=\"row\">\n	<!-- FORM -->\n	<div class=\"col-md-6 col-sm-4 col-xs-12\">\n		<form ng-submit=\"search()\" role=\"form\" class=\"form-horizontal\">\n			<!-- SELECT -->\n			<div class=\"form-group\">\n				<label class=\"control-label col-sm-2\" for=\"select\">$select:</label>\n				<div class=\"col-sm-10\">\n					<input class=\"form-control\" ng-repeat=\"select in vm.data.searchForm.select track by $index\" name=\"select[]\" ng-model=\"vm.data.searchForm.select[$index]\" id=\"select_{{$index+1}}\" value=\"select.value\" type=\"text\"/>\n				</div>\n			</div>\n			<!-- FILTER -->\n			<div class=\"form-group\">\n				<label class=\"control-label col-sm-2\" for=\"filter\">$filter:</label>\n				<div class=\"col-sm-10\">\n					<input ng-repeat-start=\"filter in vm.data.searchForm.filter track by $index\" name=\"filter[]\" class=\"form-control\" ng-model=\"vm.data.searchForm.filter[$index].value\" id=\"filter_{{$index+1}}\" type=\"text\"/>\n					<input ng-repeat-end class=\"form-control\" ng-if=\"vm.data.searchform.filter.length > $index\" ng-model=\"vm.data.searchForm.filter[$index].operator\">\n				</div>\n			</div>\n			<!-- ORDERBY -->\n			<div class=\"form-group\">\n				<label class=\"control-label col-sm-2\" for=\"orderby\">$orderby:</label>\n				<div class=\"col-sm-7\" ng-repeat-start=\"orderby in vm.data.searchForm.orderby track by $index\">\n					<input name=\"orderby[]\" ng-model=\"vm.data.searchForm.orderby[$index]\" id=\"orderby_input_{{$index+1}}\" class=\"form-control\" value=\"orderby.value\" type=\"text\"/>\n				</div>\n				<div class=\"col-sm-3\" ng-repeat-end>\n					<select ng-model=\"vm.data.searchForm.orderby[$index].direction\" class=\"form-control\">\n						<option value=\"asc\" selected>asc</option>\n						<option value=\"desc\">desc</option>\n					</select>\n				</div>\n			</div>\n			<!-- TOP -->\n			<div class=\"form-group\">\n				<label class=\"control-label col-sm-2\" for=\"top\">$top:</label>\n				<div class=\"col-sm-10\">\n					<input name=\"top\" class=\"form-control\" id=\"top\" type=\"text\"/>\n				</div>\n			</div>\n			<!-- SKIP -->\n			<div class=\"form-group\">\n				<label class=\"control-label col-sm-2\" for=\"skip\">$skip:</label>\n				<div class=\"col-sm-10\">\n					<input name=\"skip\" class=\"form-control\" id=\"skip\" type=\"text\"/>\n				</div>\n			</div>\n			<button type=\"submit\" value=\"search\">Search</button>\n		</form>\n	</div>\n	<!-- QUERY -->\n	<div class=\"col-md-6 col-sm-4 col-xs-12\">\n		<h3>Request</h3>\n		<code>{{vm.data.request}}</code>\n	</div>\n	<!-- RESULTS -->\n	<div class=\"col-md-12 col-sm-4 col-xs-12\">\n		<h3 class=\"text-center\">Results</h3>\n		{{vm.data.results | json}}\n	</div>\n</div>");}]);