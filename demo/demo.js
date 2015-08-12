      var app = angular.module('app', ['ui.bootstrap', 'ui.router', 'ui.router.yesNoCancel']);

      app.config(function($stateProvider, $urlRouterProvider){
        $stateProvider
        .state('someState',
        {
          url: "/state",
          template: '<div><a ui-sref="otherState">go somehwere else</a><br><form name="myForm" novalidate class="simple-form"><input ng-model="model">Model: <text>{{model}}</text></form><br>{{saveText}}</div>',
          controller: function($state, $scope, $modal, uiRouterYesNoCancel){
            uiRouterYesNoCancel.setupState(undefined, function(){return $scope.myForm.$dirty}, 'Test');
            $scope.saveText = "edit this";
            $scope.model = $scope.saveText;
            var disAllowRouting = true;
            /*$scope.$on('$stateChangeStart', function(event, toState, toParams){
              if($scope.myForm.$dirty && disAllowRouting){
              event.preventDefault();
              var modalHtml = '<div class="modal-body">Do you want to save?</div>' + '<div class="modal-footer"><button class="btn btn-primary" ng-click="yes()">Yes</button><button class="btn btn-primary" ng-click="no()">No</button><button class="btn btn-warning" ng-click="cancel()">Cancel</button></div>';

                        var modalInstance = $modal.open({
                            template: modalHtml,
                            controller: function($scope, $modalInstance) {
                $scope.yes = function() {
                    $modalInstance.close(0);
                };
                $scope.no = function() {
                    $modalInstance.close(1);
                };
                $scope.cancel = function() {
                    $modalInstance.close(2);
                };
            }
                        });

                        modalInstance.result.then(function(value) {
                          switch(value){
                            case 0:  $scope.save(); disAllowRouting = false; $state.go(toState, toParams); break;
                            case 1:  disAllowRouting = false; $state.go(toState, toParams); break;
                            case 2:  break;
                          }
                        }, function() {
                            //Modal dismissed
                        });
            }});*/
            $scope.save = function(){
              console.log('saved' + $scope.model);
              $scope.saveText = $scope.model;
            };
          }
        })
      .state('otherState',
        {
          url: "/other",
          template: '<div ng-yes-no-cancel="Yes, no or cancel?" ng-yes="test=\'yes\'" ng-no="test=\'no\'" ng-cancel="test=\'cancel\'">Click here!</div><div>{{test}}</div>'
        });

      $urlRouterProvider.otherwise('state');

      });

      app.controller('MainCtrl', function($state){
      });
