
angular.module('askApp')
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.headers.patch = {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }])
    .controller('RespondantListCtrl', function($scope, $http, $routeParams, $location, history, surveyFactory) {

    $scope.page_title = "Search Results"
    $scope.user = app.user || {};
    $scope.searchTerm = $location.search().q;
    
    // Setup respondent table params and options
    var complete = ($scope.user.is_staff !== true);
    $scope.respondentTable={
        resource:'/api/v1/dashrespondant/search',
        params:{complete:complete},
        options:{limit:0, user:$scope.user}
    };

    
    $scope.survey = {};
    $scope.survey.slug = $routeParams.survey_slug;

    $scope.viewPath = app.server + '/static/survey/';
    $scope.activePage = 'responses';

    surveyFactory.getSurvey(function (data) {
        data.questions.reverse();
        $scope.survey = data;
    });


    $scope.getAnswer = function(questionSlug, respondent) {
        return history.getAnswer(questionSlug, respondent);

    };


    $scope.showNext20 = function(surveyFilter) {
        $scope.gettingNext20 = true;
        $http.get($scope.meta.next)
            .success(function (data, callback) {
                _.each(data.objects, function(respondent, index) {
                    $scope.respondents.push(respondent);
                });
                $scope.gettingNext20 = false;
                $scope.meta = data.meta;
            }).error(function (data) {
                console.log(data);
            }); 
    };

    
    $scope.getTitle = function() {
        return history.getTitle($scope.respondent);
    };


});
