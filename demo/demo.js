

      var app = angular.module('app', ['ui.bootstrap', 'ui.router', 'ui.router.yesNoCancel']);

      app.config(function($stateProvider, $urlRouterProvider, uiRouterYesNoCancelProvider){

        uiRouterYesNoCancelProvider.setupState({name :'otherState'}, function(){return true}, 'Yes or no before going back?', function(){console.log('yes')}, function(){console.log('no')}, function(){console.log('cancel')});


        $stateProvider
        .state('someState',
        {
          url: "/state",
          template: '<div><a ui-sref="otherState">go somehwere else</a><br><form name="myForm" novalidate class="simple-form"><input ng-model="model"><br></form><br>{{model}}</div>',
          controller: function($state, $scope, $modal, uiRouterYesNoCancel, $timeout, $window){
            uiRouterYesNoCancel.setupState(null, function(){return $scope.myForm.$dirty}, null, function(){return $scope.save();});
            $scope.model = $window.localStorage.getItem('saveText') || 'edit me!';
            $scope.save = function(){
              return $timeout(function(){$window.localStorage.setItem('saveText', $scope.model)}, 1000);
            };
          }
        })
      .state('otherState',
        {
          controller: function(uiRouterYesNoCancel, $scope){
            $scope.on = uiRouterYesNoCancel.isRegistered();
            $scope.unregister = function(){
              uiRouterYesNoCancel.unregister();
              $scope.on = !$scope.on;
            };
            $scope.register = function(){
              $scope.on = !$scope.on;
              uiRouterYesNoCancel.setupState({name :'otherState'}, function(){return true}, 'Yes or no before going back?', function(){console.log('yes')}, function(){console.log('no')}, function(){console.log('cancel')});
            };
          },
          url: "/other",
          template: '<div><a ui-sref="someState">Click here!</a> <button ng-disabled="!on" class="btn btn-warning" ng-click="unregister()">'+
          'Unregister</button><button ng-disabled="on" class="btn btn-primary" ng-click="register()">Register</button></div>'
        });


        $urlRouterProvider.otherwise('state');

      });

      app.controller('MainCtrl', function($state){
      });
