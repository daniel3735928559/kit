var app = angular.module('app',[]);

app.controller("DemoController", ['$scope', function($scope){
    $scope.node = {"name":"Sample",
		   "data":"<node>Lorem Ipsum</node>",
		   "editing":true,
		   "change":false};
    $scope.finish = function(){
	console.log("FINISH",arguments);
    };
}]);



