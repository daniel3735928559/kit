app = app || angular.module('app', []);

app.controller("KitController", ['$scope', function($scope){
    $scope.test = "hello";
    $scope.initialize = function(){
	console.log("DATA",$scope.data);
	$scope.kit = new Kit(
	    {'input':$scope.input,
	     'container':$scope.container,
	     'output':$scope.done,
	     'data':$scope.data || "<node />"
	    }
	);
    }
    $scope.done = function(doc){
	console.log("DONE",$scope.change,$scope.data);
	if($scope.kit && $scope.change) $scope.data = $scope.kit.get_text();
	console.log("DD",$scope.data);
	$scope.output.innerHTML = "";
	$scope.output.appendChild(doc);
	$scope.finish($scope.nodeid);
    }

    //setTimeout($scope.initialize, 0);
}])
    .directive('kit',function(){
	return {
	    restrict: 'E',
	    scope:{
		data: '=data',
		editing: '=editing',
		finish: '=finish',
		change: '=change',
		nodeid: '=nodeid'
	    },
	    templateUrl:"kit_template.html",
	    // templateUrl: function(element,attrs){
	    // 	return attrs.template;
	    // },
	    controller: 'KitController',
	    link: function(scope, element, attrs){
		console.log("linking");
		scope.container = element[0].getElementsByClassName('kit_container')[0];
		scope.input = element[0].getElementsByClassName('kit_area')[0];
		scope.output = element[0].getElementsByClassName('kit_output')[0];
		scope.initialize();
		scope.$watch('editing',function(oldValue, newValue){
		    console.log("ec");
		    if(newValue !== oldValue){
			console.log(scope.editing)
			if(!(scope.editing) && scope.kit && scope.done){
			    scope.done(scope.kit.render(),true);
			}
		    }
		});
	    }
	}
    });

