(function(angular){
  var yesNoCancel = angular.module('ui.router.yesNoCancel', ['ui.bootstrap', 'ui.router']);

  yesNoCancel.provider('uiRouterYesNoCancel', function(){
    this.$get = ['$state', '$rootScope', '$modal', function($state, $rootScope, $modal){
      this.setupState = function(fromState, condition, message, yes, no, cancel){
        fromState = fromState || $state.$current;
        fromState = $state.get(fromState.name);
        console.log(fromState);
        message = message || 'Do you want to save?';
        var noop = function(){};
        fromState.yes = yes || noop;
        fromState.no = no || noop;
        fromState.cancel = cancel || noop;
        fromState.condition = condition;

        fromState.allowRouting = false;

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams){
          if(fromState.allowRouting || fromState.condition()){
            return false;
          }
          event.preventDefault();
          var modalHtml = '<div class="modal-body">' + message + '</div>' + '<div class="modal-footer"><button class="btn btn-primary" ng-click="yes()">Yes</button><button class="btn btn-primary" ng-click="no()">No</button><button class="btn btn-warning" ng-click="cancel()">Cancel</button></div>';

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

          modalInstance.result.then(function(result){
            switch(result){
              case 0: fromState.yes(); fromState.
            }
          });


        });
      };
      return this;
    }];
  });

})(angular);
