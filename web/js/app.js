var questionnaireApp = angular.module('questionnaireApp', [
    'ngRoute',
    'auth',
    'appControllers'
]);

questionnaireApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/registration', {
                templateUrl: '/partials/registration.html',
                controller: 'RegistrationController'
            }).
            when('/login', {
                templateUrl: 'partials/login.html',
                controller: 'AdminLoginController'
            }).
            when('/panel', {
                templateUrl: 'partials/panel.html',
                controller: 'AdminPanelController',
                resolve: {
                    auth: function resolveAuthentication(AuthResolver) {
                        //console.log('resolve');
                        return AuthResolver.resolve();
                    }
                }
            }).
            when('/edit-user/:userId', {
                templateUrl: 'partials/edit-user.html',
                controller: 'AdminEditUserController',
                resolve: {
                    auth: function resolveAuthentication(AuthResolver) {
                        //console.log('resolve');
                        return AuthResolver.resolve();
                    }
                }
            });
    }]
);

questionnaireApp.factory('AuthResolver', function ($q, $rootScope, $location) {
    return {
        resolve: function () {
            var deferred = $q.defer();
            var unwatch = $rootScope.$watch('isAuthenticatedUser', function (isAuthenticatedUser) {

                if (angular.isDefined(isAuthenticatedUser)) {

                    if (isAuthenticatedUser) {
                        deferred.resolve(isAuthenticatedUser);
                    } else {
                        deferred.reject();
                        $location.path('/login');
                    }

                    unwatch();
                }/* else {
                    deferred.reject();
                    $location.path('/login');
                }*/
            });

            return deferred.promise;
        }
    };
});

questionnaireApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push([
        '$injector',
        '$location',
        'SECURED',
        '$q',
        function ($injector, $location, SECURED, $q) {

            if (SECURED.indexOf($location.path()) !== -1) {
                return $injector.get('AuthInterceptor');
            } else {
                return $q.resolve();
            }
        }
    ]);
}]);

questionnaireApp.factory('AuthInterceptor', function ($rootScope, $q) {
    return {
        responseError: function (response) {
            $rootScope.$broadcast({
                401: 'not-authenticated',
                403: 'not-authenticated'
            }[response.status], response);

            return $q.reject(response);
        }
    };
});

questionnaireApp.service('Session', function() {
    this.create = function(id, user) {
        this.id = id;
        this.user = user;
    };

    this.destroy = function() {
        this.id = '';
        this.user = '';
    }
});

questionnaireApp.constant('SECURED', [
    '/panel',
    '/edit-user/:userId'
]);

questionnaireApp.run(function ($rootScope, $location, AuthService, SECURED, Session, $http) {
    $rootScope.$on('$locationChangeStart', function(event, next) {
        //console.log(event);
    });

    $rootScope.$on('$routeChangeStart', function (event, next) {
        //console.log(next.$$route.originalPath);
        if (SECURED.indexOf(next.$$route.originalPath) !== -1 && !AuthService.isAuthenticated()) {
            //event.preventDefault();
            //$rootScope.$broadcast('not-authenticated');
            //$rootScope.isAuthenticatedUser = false;
        }

        if (next.$$route.originalPath == '/login' && AuthService.isAuthenticated() && $rootScope.previousPath !== undefined) {
            event.preventDefault();
            $location.path($rootScope.previousPath);
        }

        $rootScope.isLoginPage = next.$$route.originalPath == '/login' ? true : false;
    });

    $rootScope.$on('$routeChangeSuccess', function(event, next) {
        $rootScope.previousPath = next.$$route.originalPath;
    });

    $rootScope.$on('not-authenticated', function (event, next) {
        Session.destroy();
        $location.path('/login');
    });

    $rootScope.$on('login-success', function (event, next) {
        $rootScope.isAuthenticatedUser = AuthService.isAuthenticated();
        $location.path('/panel');
    });

    $rootScope.isAuthenticated = AuthService.isAuthenticated;

    // get logged user info
    $http.get('/app_dev.php/profile').then(function(response) {

        if (!response.data.success) {
            Session.create('user-' + response.data.user, response.data.user);
            $rootScope.isAuthenticatedUser = AuthService.isAuthenticated();
        } else {
            $rootScope.isAuthenticatedUser = false;
        }
    });

    $rootScope.logout = function() {
        $http.get('/app_dev.php/logout').then(function(response) {
            $rootScope.$broadcast('not-authenticated');
        });
    }
})

questionnaireApp.filter('joinBy', function () {
    return function (input,delimiter) {
        return (input || []).join(delimiter || ',');
    };
});

questionnaireApp.directive('back', ['$window', function($window) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.bind('click', function () {
                $window.history.back();
            });
        }
    };
}]);

questionnaireApp.directive('sortColumn', [function() {
    return {
        restrict: 'A',

        template: function(elem, attr) {
            var sortBy = attr.scSortBy;
            return '<a href="#" eat-click ng-click="sort({key: \'' + sortBy + '\', order: sortOrder}); sortData();"><span class="glyphicon glyphicon-sort" aria-hidden="true"></span></a>' +
                    '&nbsp;' + $(elem).text();
        },

        scope: {
            sort: '&onSort'
        },

        link: function (scope, elem, attrs) {

            if (scope.$parent.sortColumnDirective === undefined) {
                scope.$parent.sortColumnDirective = [];
            }

            scope.$parent.sortColumnDirective.push(elem);

            scope.sortOrder = 'ASC';

            scope.sortData = function() {
                $(elem).find('span.glyphicon').removeClass('glyphicon-sort');
                $(elem).find('span.glyphicon').removeClass('glyphicon-sort-by-' + attrs.scSortType + (scope.sortOrder == 'ASC' ? '' : '-alt'));
                $(elem).find('span.glyphicon').addClass('glyphicon-sort-by-' + attrs.scSortType + (scope.sortOrder == 'ASC' ? '-alt' : ''));

                for (var i in scope.$parent.sortColumnDirective) {
                    var el = scope.$parent.sortColumnDirective[i];

                    if (el != elem) {
                        $(el).find('span.glyphicon').removeClass(
                            'glyphicon-sort-by-alphabet ' +
                            'glyphicon-sort-by-alphabet-alt ' +
                            'glyphicon-sort-by-order ' +
                            'glyphicon-sort-by-order-alt'
                        ).addClass('glyphicon-sort');
                    }
                }

                scope.sortOrder = scope.sortOrder == 'ASC' ? 'DESC' : 'ASC';
            }
        }
    };
}]);

questionnaireApp.directive('eatClick', function() {
    return function(scope, element, attrs) {
        $(element).click(function(event) {
            event.preventDefault();
        });
    }
});

/*
questionnaireApp.directive('loginDialog', function() {
    return {
        restrict: 'A',
        template: '<div ng-if="visible" ng-include="\'partials/login.html\'">',
        link: function (scope) {
            var showDialog = function() {
                scope.visible = true;
            };

            scope.visible = false;
            scope.$on('not-authenticated', showDialog);
        }
    };
});*/
