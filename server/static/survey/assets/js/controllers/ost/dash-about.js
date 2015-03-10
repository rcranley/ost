angular.module('askApp').controller('DashAboutCtrl', function($scope, $rootScope, $routeParams, $window, surveyFactory) {
    $scope.page_title = "About the Central Coast Monitoring Dashboard";
    $rootScope.activePage = 'about';
});
