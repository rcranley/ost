angular.module('askApp').factory('surveyFactory', function($http, $location) {
    return {
        survey : {},
        getSurvey: function(callback) {
            var self = this;
            var surveySlug = 'monitoring-project';
            $http.get('/api/v1/surveyreport/' + surveySlug + '/?format=json', {cache:true}).success(function(data) {
                self.survey = data;
            }).success(callback);
        },

        searchRespondants : function(q){
            $location.path('/RespondentList/monitoring-project/').search({q: q});
        }

        

    }
});
