angular.module("rr.api.v2.explorer.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("explorer.bootstrap.html","<div class=\"row\">\n	<!-- FORM -->\n	<div class=\"col-md-6 col-sm-4 col-xs-12\">\n		<h3>Build Query</h3>\n		<form ng-submit=\"vm.search()\" role=\"form\" class=\"form-horizontal\">\n			<!-- SELECT -->\n			<div class=\"form-group\">\n				<label class=\"control-label col-sm-2\" for=\"select\">$select:</label>\n				<div class=\"col-sm-10\">\n					<input class=\"form-control\" ng-change=\"vm.updateQuery()\" name=\"select\" ng-model=\"vm.data.searchForm.select\" id=\"select\" type=\"text\"/>\n				</div>\n			</div>\n			<!-- FILTER -->\n			<div class=\"form-group\">\n				<label class=\"control-label col-sm-2\" for=\"filter\">$filter:</label>\n				<div class=\"col-sm-10\">\n					<div class=\"row\" ng-repeat-start=\"filter in vm.data.searchForm.filter track by $index\">\n						<div class=\"col-sm-10\">\n							<input  \n								ng-change=\"vm.updateQuery()\" \n								name=\"filter[]\" \n								class=\"form-control\" \n								ng-model=\"vm.data.searchForm.filter[$index].value\" \n								id=\"filter_{{$index+1}}\" \n								type=\"text\"/>\n						</div>\n						<!-- REMOVE FILTER -->\n						<div class=\"col-sm-2\">\n							<button type=\"button\" ng-if=\"$index > 0\" class=\"btn btn-danger\" ng-click=\"vm.removeFilter(filter)\"><i class=\"fa fa-trash-o\"></i></button>\n						</div>\n					</div>\n					<!-- JOIN: AND | OR -->\n					<div class=\"row\" ng-repeat-end ng-if=\"$index + 1 < vm.data.searchForm.filter.length\" style=\"margin-top:15px; margin-bottom:15px\">\n						<div class=\"col-sm-10\">\n							<div class=\"row\">\n								<div class=\"col-sm-4 col-sm-offset-4 text-center\">\n									<select ng-model=\"vm.data.searchForm.filter[$index].join\" class=\"form-control\" ng-change=\"vm.updateQuery()\">\n										<option value=\"and\" selected>and</option>\n										<option value=\"or\">or</option>\n									</select>\n								</div>\n							</div>\n						</div>\n					</div>\n				</div>\n				<!-- ADD FILTER -->\n				<div class=\"col-sm-4 col-sm-offset-4 text-center\" style=\"margin-top:20px\">\n					<button type=\"button\" class=\"btn btn-success\" ng-click=\"vm.addFilter()\">Add Filter</button>\n				</div>\n			</div>\n			<!-- ORDERBY -->\n			<div class=\"form-group\">\n				<label class=\"control-label col-sm-2\" for=\"orderby\">$orderby:</label>\n				<div class=\"col-sm-7\" ng-repeat-start=\"orderby in vm.data.searchForm.orderby track by $index\">\n					<input \n						name=\"orderby[]\" \n						ng-model=\"vm.data.searchForm.orderby[$index].value\" \n						id=\"orderby_input_{{$index+1}}\" \n						class=\"form-control\" \n						value=\"orderby.value\"\n						ng-change=\"vm.updateQuery()\"\n						type=\"text\"/>\n				</div>\n				<div class=\"col-sm-3\" ng-repeat-end>\n					<select ng-model=\"vm.data.searchForm.orderby[$index].direction\" class=\"form-control\" ng-change=\"vm.updateQuery()\">\n						<option value=\"asc\" selected>asc</option>\n						<option value=\"desc\">desc</option>\n					</select>\n				</div>\n			</div>\n			<!-- TOP -->\n			<div class=\"form-group\">\n				<label class=\"control-label col-sm-2\" for=\"top\">$top:</label>\n				<div class=\"col-sm-10\">\n					<input ng-change=\"vm.updateQuery()\" ng-model=\"vm.data.searchForm.top\" name=\"top\" class=\"form-control\" id=\"top\" type=\"text\"/>\n				</div>\n			</div>\n			<!-- SKIP -->\n			<div class=\"form-group\">\n				<label class=\"control-label col-sm-2\" for=\"skip\">$skip:</label>\n				<div class=\"col-sm-10\">\n					<input ng-change=\"vm.updateQuery()\" ng-model=\"vm.data.searchForm.skip\" name=\"skip\" class=\"form-control\" id=\"skip\" type=\"text\"/>\n				</div>\n			</div>\n			<button type=\"submit\" class=\"btn btn-primary\" value=\"search\">Search</button>\n		</form>\n	</div>\n	<!-- QUERY -->\n	<div class=\"col-md-6 col-sm-4 col-xs-12\">\n		<h3>Request</h3>\n		<code style=\"display:block\">\n			{{vm.data.fullRequest}}\n		</code>\n	</div>\n	<!-- RESULTS -->\n	<div class=\"col-md-12 col-sm-4 col-xs-12\">\n		<h3 class=\"text-center\">Results</h3>\n		<div class=\"results\" ng-if=\"vm.data.results && !vm.data.error\">\n			{{vm.data.results | json}}\n		</div>\n		<div class=\"error\" ng-if=\"vm.data.error\">\n			{{vm.data.error | json}}\n		</div>\n	</div>\n</div>");}]);