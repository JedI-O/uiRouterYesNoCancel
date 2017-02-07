(function(angular){
  /* Define the module. */
  var yesNoCancel = angular.module('ui.router.yesNoCancel', ['ui.bootstrap', 'ui.router']);

  /* Run the initialization.
   * Injecting uiRouterYesNoCancel service here
   * registers the registerList collected by the provider in config phase.
   */
  yesNoCancel.run(['uiRouterYesNoCancel', '$rootScope', '$uibModal', '$state', '$q',
    function(a, $rootScope, $uibModal, $state, $q){
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
        var deferred = $q.defer(); //creation of a deferred with a state pending

        var modalCtrl = ['$scope', function($scope){
          $scope.message = fromState.uiRouterYesNoCancel.message;
	      $scope.title = fromState.uiRouterYesNoCancel.title;
          $scope.buttonYes = fromState.uiRouterYesNoCancel.buttonYes;
	      $scope.buttonNo = fromState.uiRouterYesNoCancel.buttonNo;
	      $scope.buttonCancel = fromState.uiRouterYesNoCancel.buttonCancel;
          scope = $scope;
          $scope.disabled = false;
          $scope.yes = function(){
            $scope.disabled = true;
            $q.when(fromState.uiRouterYesNoCancel.yes()).then(function(data){
              //resolve promise if yes() evaluates to true, undefined or null, else call $dismiss() to close modalInstance
              if(data || typeof data === 'undefined' || data == null){
                deferred.resolve(); //deferred state changed to resolved
              } else $scope.$dismiss();
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
        var modalHtml = '<div class="modal-header">'+
	      '<h2 class="modal-title">{{title}}</h2>'+
	      '</div>'+
	      '<div class="modal-small-body">{{message}}</div>'+
          '<div class="modal-footer  modal-small-footer"><button class="btn btn-default" ng-click="$dismiss()">{{buttonCancel}}</button>'+
	      '<button ng-disabled="disabled" class="btn btn-danger" ng-click="no()" style="margin-left:25px">{{buttonNo}}</button>'+
	      '<button ng-disabled="disabled" class="btn btn-primary" ng-click="yes()" style="margin-left:25px">{{buttonYes}}</button>'+
          '</div>';

        var modalInstance = $uibModal.open({
            template: modalHtml,
            controller: modalCtrl,
	        windowClass: 'modal-small-content'
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
          /* If dismissed, call the cancel function and then route back to previous state (only necessary for URL history). */
          $q.when(fromState.uiRouterYesNoCancel.cancel()).then(function(){$state.go(fromState, fromParams)});
        });
      });
  }]);

  yesNoCancel.provider('uiRouterYesNoCancel', function(){
    var registerList = [];

    this.setupState = function(fromState, condition, message, title, yes, no, cancel){
      registerList.push(arguments);
    };

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
      };

      this.setupState = function(fromState, condition, message, yes, no, cancel){
        fromState = fromState || $state.$current;
        fromState = $state.get(fromState.name);
        var noop = function(){};
        fromState.uiRouterYesNoCancel = {};
        fromState.uiRouterYesNoCancel.message = message[0] || 'Do you want to save?';
	    fromState.uiRouterYesNoCancel.title = message[1] || 'Are you Sure';
	    fromState.uiRouterYesNoCancel.buttonYes = message[2] || 'Yes';
	    fromState.uiRouterYesNoCancel.buttonNo = message[3] || 'No';
	    fromState.uiRouterYesNoCancel.buttonCancel = message[4] || 'Cancel';
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
