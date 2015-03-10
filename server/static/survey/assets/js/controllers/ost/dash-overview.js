
angular.module('askApp').controller('DashOverviewCtrl', function($scope, $rootScope, $http, $routeParams, $location, dashData, chartUtils, survey) {

    $scope.page_title = "Monitoring Activities";
    $scope.loadingSurveys = true;
    function initPage () {
        $rootScope.activePage = 'overview';

        // Setup respondent table params and options
        var complete = ($scope.user.is_staff !== true)
        $scope.respondentTable={
            resource:'/api/v1/dashrespondant/',
            params:{complete:complete },
            options:{limit:500, user:$scope.user}
        };

        $scope.mapSettings = {
            questionSlugPattern: '*-collection-points',
            lat: 35.8336630,
            lng: -122.0000000,
            zoom: 7
        };

        $rootScope.$watch('filters.ecosystemFeatures', function(newVal, oldVal) {
            
            // Update $scope.respondentTable so it reloads with new filters in place
            if (newVal) {
                $scope.respondentTable.params.ef = newVal;
                $scope.updateMap();
            }


        });
    }

    //
    // Map
    // 
    $scope.updateMap = function (action) {
        /*
        Params:
        - action - The only action this supports is 'clear'. This clears the map and the filters.

        - builds the filtersJson based on the $rootScope.filters.ecosystemFeatures
        - Builds URL's for points and polys (note: polys does not contain the geometry, only the ID of a grid cell).
        - Calls getPoints and getPolys and defines their callbacks.
        - Puts points on $scope.mapSettings.mapPoints
        - Puts polys $scope.mapSettings.mapPlanningUnits

        */
        if (action === 'clear') {
            $(".sidebar_nav .multi-select2").select2('data', null);
            $rootScope.filters.ecosystemFeatures = [];
            //$scope.$apply();
        }

        var filtersJson = _.map($rootScope.filters.ecosystemFeatures, function (label) {
            var slug = ecosystemLabelToSlug(label);
            if (slug.length>0) {
                return {'ecosystem-features': slug};
            } else {
                return null;
            }
        });
        filtersJson = _.flatten(filtersJson);

        var pointsUrl = pointsApiUrl($routeParams.surveySlug, '*-collection-points', filtersJson),
            polysUrl = polysApiUrl($routeParams.surveySlug, '*-collection-areas', filtersJson);
        
        $scope.activeEcosystemFeatures = _.pluck(filtersJson, 'ecosystem-features')
        getPoints(pointsUrl, function (points) {
            $scope.mapSettings.mapPoints = points;
            var uniq = [];
            _.each(points, function (point) {
                if (! _.contains(uniq, point.qSlug)) {
                    uniq.push(point.qSlug);
                }
            });
            $scope.uniqueEcosystemFeatureSlugs = uniq;
        });
    
        getPolys(polysUrl, function (polys) {
            $scope.mapSettings.mapPlanningUnits = polys;
        });
    }

    function pointsApiUrl (sSlug, qSlug, filtersJson) {
        var url = ['/reports/geojson', sSlug, qSlug];
        if (filtersJson && !_.isEmpty(filtersJson)) {
            url.push('?filters=' + JSON.stringify(filtersJson));
        }
        return url.join('/');
    }

    function polysApiUrl (sSlug, qSlug, filtersJson) {
        var url = ['/reports/planningunits', sSlug, qSlug];
        if (filtersJson && !_.isEmpty(filtersJson)) {
            url.push('?filters=' + JSON.stringify(filtersJson));
        }
        return url.join('/');
    }
    
    function getPoints (url, success_callback) {
        $http.get(url).success(function(data) {
            // Set points collection (bound to directive)
            var points = [];
            _.each(data.geojson, function (item) {
                if (item.geojson) {
                    var feature = JSON.parse(item.geojson)
                      , lat = feature.geometry.coordinates[1]
                      , lng = feature.geometry.coordinates[0]
                      , uuid = feature.properties.activity
                      , qSlug = feature.properties.label
                      ;
                    if (lat && lng && uuid && qSlug) {
                        points.push({
                            lat: lat,
                            lng: lng,
                            uuid: uuid,
                            qSlug: qSlug});
                    }
                };
                
            });

            success_callback(points);
        });
    }


    function getPolys (url, success_callback) {
        $http.get(url).success(function(data) {
            success_callback(data.answers);
        });
    }

    function ecosystemLabelToSlug (label) {
        return survey.ecosystemLabelToSlug(label);
    }

    $scope.ecosystemSlugToLabel = function (slug) {
        return survey.ecosystemSlugToLabel(slug);
    }

    $scope.ecosystemSlugToColor = function (slug) {
        return survey.ecosystemSlugToColor(slug);
    };


    //
    // Paginated respondent table
    //
    $scope.goToPage = function (page, ecosystemFeatureLabels) {
        var meta = $scope.meta || {}
            , limit = 8
            , offset = limit * (page - 1)
            , url = [
                '/api/v1/completerespondant/?format=json&limit='+limit
                , '&offset='+offset
                , '&ef='+ecosystemFeatureLabels.join(',')
              ].join('')
            ;
        $http.get(url).success(function (data) {
            $scope.respondents = data.objects;
            $scope.meta = data.meta;
            $scope.currentPage = page;
        });
    };


    //
    // Charts
    //
    $scope.charts = {};

    initPage();
});
