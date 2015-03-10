angular.module('askApp').controller('DashExploreCtrl', function($scope, $rootScope, $http, $routeParams, $location, dashData, chartUtils) {
    $scope.page_title = 'Community Overview';
    $rootScope.activePage = 'explore';
    
    // Setup respondent table params and options
    var complete = ($scope.user.is_staff !== true)
    $scope.respondentTable={
        resource:'/api/v1/dashrespondant/',
        params:{complete:complete},
        options:{limit:10}
    };

    
    //
    // Charts
    //
    
    $scope.charts = {};

    function buildChart(questionSlug, options) {
        var options, onFail, onSuccess;
        onFail = function (data) {
            if (data.message && data.message.length > 0) {
                $scope.charts[questionSlug] = { message: data.message };
            } else {
                $scope.charts[questionSlug] = { message: "Failed to retrieve data." };
            }
        };
        
        onSuccess = function (chartConfig) {
            $scope.charts[questionSlug] = chartConfig;
        };

        
        if (options.type === 'pie') {
            chartUtils.buildPieChart($routeParams.surveySlug, questionSlug,
                [], options, onSuccess, onFail);
        } else if (options.type === 'bar') {
            chartUtils.buildStackedBarChart($routeParams.surveySlug, questionSlug,
                [], options, onSuccess, onFail);
        }
    }
    Highcharts.setOptions({
        chart: {
            style: {
                fontFamily: "'Gotham Rounded SSm A', 'Gotham Rounded SSm B'"
            }
        }
    });
    buildChart('org-type', {type: 'pie', title: "Primary organization type", yLabel: "Org Type"});
    buildChart('proj-num-people', {type: 'pie', title: "Number of project participants over the last year (2013-2014)", yLabel: "Number of Projects"});
    buildChart('proj-data-years', {type: 'pie', title: "Project Duration", yLabel: "Number of Projects"});
    buildChart('proj-data-frequency', {type: 'pie', title: "Sampling frequency at a typical project site (times/year)", yLabel: "Number of Projects"});


});
