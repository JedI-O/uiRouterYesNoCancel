(function(angular){
  /* Define the module. */
  var yesNoCancel = angular.module('ui.router.yesNoCancel', ['ui.bootstrap', 'ui.router']);

  /* Run the initialization.
   * Injecting uiRouterYesNoCancel service here
   * registers the registerList collected by the provider.
   */
  yesNoCancel.run(['uiRouterYesNoCancel', '$rootScope', '$modal', '$state', '$q', function(a, $rootScope, $modal, $state, $q){
      var proceed = function(fromState, toState, toParams){
        return function(){
          fromState.uiRouterYesNoCancel.allowRouting = true; $state.go(toState, toParams);
        }
      };
      /* on $stateChangeStart */
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        /* check if routing is allowed. */
        if(!fromState.uiRouterYesNoCancel || fromState.uiRouterYesNoCancel.allowRouting || !fromState.uiRouterYesNoCancel.condition()){
          return;
        }
        /* if not allowed:  */
        event.preventDefault();

        /* set up the $modal  settings and open the modal*/
        var modalHtml = '<div class="modal-body">' + fromState.uiRouterYesNoCancel.message + '</div>' + '<div class="modal-footer"><button class="btn btn-primary" ng-click="yes()">Yes</button><button class="btn btn-primary" ng-click="no()">No</button><button class="btn btn-warning" ng-click="cancel()">Cancel</button></div>';

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
              $modalInstance.dismiss();
            };
          }
        });

        /* the result promise is resolved when the modalInstance closes or is dismissed */
        modalInstance.result.then(function(result){
          /* I close, it's closed by yes or no button.
           * So call the appropriate functions and then route.
           */
          switch(result){
            case 0: $q.when(fromState.uiRouterYesNoCancel.yes()).then(proceed(fromState, toState, toParams)); break;
            case 1: $q.when(fromState.uiRouterYesNoCancel.no()).then(proceed(fromState, toState, toParams)); break;
          }
        },
        function(){
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

    this.$get = ['$state', '$rootScope', '$modal', '$urlRouter', function($state, $rootScope, $modal, $urlRouter){
      var setup = false;
      var self = this;

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
