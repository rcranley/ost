
angular.module('askApp').controller('DashWelcomeCtrl', function($scope, $rootScope, $routeParams, $window, surveyFactory) {
    
    //$scope.screen_height = angular.element($window).height();
    $scope.page_title = "Welcome to the Central Coast Monitoring Dashboard!";
    $rootScope.activePage = 'welcome';

});
