(function(angular){
  /* Define the module. */
  var yesNoCancel = angular.module('ui.router.yesNoCancel', ['ui.bootstrap', 'ui.router']);

  /* Run the initialization.
   * Injecting uiRouterYesNoCancel service here
   * registers the registerList collected by the provider in config phase.
   */
  yesNoCancel.run(['uiRouterYesNoCancel', '$rootScope', '$uibModal', '$state', '$q', function(a, $rootScope, $uibModal, $state, $q){
      var proceed = function(fromState, toState, toParams){
          fromState.uiRouterYesNoCancel.allowRouting = true; $state.go(toState, toParams);
      };

      /* on $stateChangeStart */
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        /* check if routing is allowed. */
        if(!fromState.uiRouterYesNoCancel || fromState.uiRouterYesNoCancel.allowRouting || !fromState.uiRouterYesNoCancel.condition()){
          return;
        }
        /* if not allowed:  */
        event.preventDefault();

        var scope;
        var deferred = $q.defer();

        var modalCtrl = ['$scope', function($scope){
          $scope.message = fromState.uiRouterYesNoCancel.message;
          scope=$scope;
          $scope.disabled = false;
          $scope.yes = function(){
            $scope.disabled = true;
            $q.when(fromState.uiRouterYesNoCancel.yes()).then(function(){
              deferred.resolve();
            });
          };
          $scope.no = function(){
            $scope.disabled = true;
            $q.when(fromState.uiRouterYesNoCancel.no()).then(function(){
              deferred.resolve();
            });
          };
        }];

        deferred.promise.then(function(){
          scope.$close();
        });

        /* set up the $uibModal  settings and open the modal*/
        var modalHtml = '<div class="modal-body">{{message}}</div>'+
        '<div class="modal-footer"><button ng-disabled="disabled" class="btn btn-primary" ng-click="yes()">Yes</button>'+
        '<button ng-disabled="disabled" class="btn btn-primary" ng-click="no()">No</button><button class="btn btn-warning" ng-click="$dismiss()">Cancel</button></div>';

        var modalInstance = $uibModal.open({
            template: modalHtml,
            controller: modalCtrl
          });

        /* the result promise is resolved when the modalInstance closes or is dismissed */
        modalInstance.result.then(function(){
          /* If closed, it's closed by yes or no button.
           * So route.
           */
          proceed(fromState, toState, toParams);
        },
        function(){
          console.log('proceed: '+fromState.name);
          /* If dismissed, call the cancel functoin and then route back to previous state (only necessary for URL history). */
          $q.when(fromState.uiRouterYesNoCancel.cancel()).then(function(){$state.go(fromState, fromParams)});
        });
      });
  }]);

  yesNoCancel.provider('uiRouterYesNoCancel', function(){
    var registerList = [];

    this.setupState = function(fromState, condition, message, yes, no, cancel){
      registerList.push(arguments);
    }

    this.$get = ['$state', '$rootScope', '$uibModal', '$urlRouter', function($state, $rootScope, $uibModal, $urlRouter){
      var setup = false;
      var self = this;
      this.isRegistered = function(){
        var state = state || $state.$current;
        state = $state.get(state.name);
        return !!state.uiRouterYesNoCancel;
      };

      this.unregister = function(state){
        var state = state || $state.$current;
        state = $state.get(state.name);

        delete state.uiRouterYesNoCancel;
        delete state.onEnter;
      }

      this.setupState = function(fromState, condition, message, yes, no, cancel){
        fromState = fromState || $state.$current;
        fromState = $state.get(fromState.name);
        var noop = function(){};
        fromState.uiRouterYesNoCancel = {};
        fromState.uiRouterYesNoCancel.message = message || 'Do you want to save?';
        fromState.uiRouterYesNoCancel.yes = yes || noop;
        fromState.uiRouterYesNoCancel.no = no || noop;
        fromState.uiRouterYesNoCancel.cancel = cancel || noop;
        fromState.uiRouterYesNoCancel.condition = condition;
        fromState.uiRouterYesNoCancel.allowRouting = false;
        fromState.onEnter = function(){
          fromState.uiRouterYesNoCancel.allowRouting = false;
        }
      };

      angular.forEach(registerList, function(args){
        self.setupState.apply(self, args);
      });

      registerList = [];

      return this;
    }];
  });

})(angular);
