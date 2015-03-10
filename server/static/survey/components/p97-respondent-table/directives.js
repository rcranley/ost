/*
    
    Displays a list of respondants in a sortable pagiantated table. 
    
    Usage:

        <table respondant-table 
               resource='/api/v1/completerespondant/' 
               params='data.queryParams'
               options='{page_size:15}'>

    Inputs:

        resource - the API endpoint, e.g. '/api/v1/dashrespondant', '/api/v1/dashrespondant/search'
        params - An object whose keyword/values are added as query parmameters on the request. 
               - complete : [BOOLEAN]
               - ef : [ARRAY] A list of ecofsystem features labels as strings
               - q: [STRING] A query term to search on, only used when using 
                             the '/api/v1/dashrespondant/search' endpoint
        options: Object containing the following options:
               - limit : [INTEGER] Number of records to show per page 
        

*/

angular.module('askApp')
    .directive('respondentsTable', ['$http', '$location', 'surveyFactory', 'survey', function(http, location, surveyFactory, survey) {

    return {
        restrict: 'EA',
        templateUrl : app.viewPath +'components/p97-respondent-table/templates/table.html',
        scope: {
                resource:'=',
                options:'=',
                params:'='
            },

        link: function (scope, element, attrs) {
            scope.respondents = null;
            scope.orderBy = null;
            scope.meta = null;
            scope.http = http;
            scope.surveySlug = surveyFactory.survey.slug;
            scope.location = location;
            scope.ecosystemLabelToSlug = survey.ecosystemLabelToSlug
            scope.ecosystemSlugToColor = survey.ecosystemSlugToColor
            // Get the search term from the URL
            scope.searchTerm = scope.location.search().q;

            // Paginated respondent table
            scope.goToPage = function (page) {
                /*
                Page is a page index
                */
                
                var meta = scope.meta || {}
                    , offset = scope.options.limit * (page - 1);

                var url = scope.build_url(offset, page);
                console.log("Fetching results from " + url);

                scope.http.get(url).success(function (data) {
                    
                    // make sure the to parts is not grater than the total count.
                    var results_to = data.meta.offset + data.meta.limit;

                    results_to = ( results_to > data.meta.total_count ) ? data.meta.total_count : results_to;

                    scope.respondents = data.objects;
                    _.each(scope.respondents, function(r) {
                        r.parsed_ecosystem_features = _.object(_.map(r.ecosystem_features.split(';'),function(s){return [scope.ecosystemLabelToSlug(s.trim())+'points', s.trim()]}))                        
                    })
                    scope.meta = data.meta;
                    scope.currentPage = page;
                    scope.results_from = scope.meta.offset + 1;
                    scope.results_to = results_to;
                });
            };

            scope.setOrderBy = function(field){
                if (scope.orderBy === field){
                    scope.orderBy = "-"+field;
                } else if (scope.orderBy === '-'+field){
                    scope.orderBy = null;
                } else {
                    scope.orderBy = field;
                }
            };

            scope.showRespondent = function(respondent){
                /*
                This is the row click callback that takes the user to the respondaent detail page.
                */
                scope.location.path('/RespondentDetail/'+respondent.survey_slug+'/'+respondent.uuid );
            };

            scope.build_url = function(offset, page){
                /*
                    Builds a URL based on pagination, user permissions, and search terms.
                    
                    Inputs:
                        offset: [INTEGER] the 0-based page offset
                        page: [INTEGER] 1-based page index. This is only used on the search mode endpoint 
                                        and should not be generalize.


                    /resource/?format='json'&limit=XX&offset=YY&q=SSSSS&complete=BOOL
                */

                // Attach pagination
                var url = [ 
                            scope.resource ,
                            '?format=json',
                          ];

                // Added pagination is limit is positive
                if (scope.options.limit > 0){
                    url.push('&limit='+scope.options.limit);
                    url.push('&offset='+offset);
                }

                // Deal with search term
                if (scope.searchTerm) {
                    url.push('&q='+scope.searchTerm);
                };

                // Deal with staff users
                if (!scope.$parent.user.is_staff){
                    url.push('&complete=true')
                }

                // If search mode add the page number. This is becuase of
                // an artifact of the dashrespodant/search endpoint. 
                if (scope.resource.search('/search') >= 0){
                    url.push('&page='+page);    
                }

                // Add any ecosystem filters if necessary
                if (scope.params.ef && scope.params.ef.length > 0){
                    var txt = '&ef='+scope.params.ef.join(',');
                    url.push(txt);
                }
                
                url = url.join('');
                return url;
            };
            // Load data when the resource is defined.
            scope.$watch('resource', function(newVal){
                if (newVal && scope.respondents === null){
                    scope.goToPage(1);
                }
            });

            // Watch the params to see if ef changed
            scope.$watch('params.ef', function(newVal){
                if (newVal) {
                    scope.goToPage(1);
                }

            });


        }
    };
}]);

