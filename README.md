# uiRouterYesNoCancel
Service module for ui.router, compatible with angular-bootstrap v. 1.3.2. Lets you watch for certain state changes, waits for confirmation and executes/routes depending on confirmation result.
#Dependencies
* **angular:** ~1.5.3
* **ui-router:** ~0.2.15
* **angular-bootstrap:** ~1.3.2
* **bootstrap-css:** ~3.3.6

# Usage:
1. Add the following line in your bower.json file: `"ui-router-yesnocancel": "https://github.com/JedI-O/uiRouterYesNoCancel.git#master"`
2. Execute `bower install`
3. Include the *YesNoCancel*-Module in your app.js file like this: `var app = angular.module('myModule', ['ui.router.yesNoCancel']);`