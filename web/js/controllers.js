var appControllers = angular.module('appControllers', []);

appControllers.controller('RegistrationController', ['$scope', '$http', function($scope, $http) {
    $http.get('/app_dev.php/categories').then(function(response) {
        $scope.categories = response.data;
    });

    $scope.user = {
        name: '',
        email: '',
        categories: []
    };

    $scope.save = function(user) {
        $http.post('/app_dev.php/registration',
            'name=' + user.name +
            '&email=' + user.email +
            '&categories=' + user.categories.map(function(value) { return value.id;})
        , {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function() {
            $scope.user = {
                name: '',
                email: '',
                categories: []
            }
        });
    }
}]);

appControllers.controller('AdminLoginController', ['$rootScope', '$scope', '$location', 'AuthService', function($rootScope, $scope, $location, AuthService) {
    $scope.checkLogin = function(username, password) {
        AuthService.login(username, password).then(function(user) {
            $rootScope.$broadcast('login-success');
            $rootScope.user = user;
        });
    }
}]);

appControllers.controller('AdminPanelController', ['$q', '$scope', '$http', function($q, $scope, $http) {
    $q.all([
        $http.get('/app_dev.php/manage/user'),
        $http.get('/app_dev.php/categories')
    ]).then(function(values) {
        $scope.users = values[0].data;
        $scope.categories = values[1].data;

        angular.forEach($scope.users, function(user) {
            var userCategoriesIds = user.categories;
            user.categories = [];

            angular.forEach($scope.categories, function(category) {

                if (userCategoriesIds.indexOf(category.id) !== -1) {
                    user.categories.push(category.name);
                }
            });
        });

        $scope.sortByKey = function(key, order) {
            order = order == 'ASC' ? 1 : -1;

            $scope.users.sort(function(a, b) {

                if (a[key] < b[key]) {
                    return -1 * order;
                }

                if (a[key] > b[key]) {
                    return 1 * order;
                }

                return 0;
            });
        }
    });

    $scope.delete = function(id) {
        $http.delete('/app_dev.php/manage/user/' + id).then(function(response) {

            if (response.data.success) {

                for (var i in $scope.users) {

                    if ($scope.users[i].id == id) {
                        $scope.users.splice(i, 1);
                        break;
                    }
                }
            }
        });
    }
}]);

appControllers.controller('AdminEditUserController', ['$q', '$scope', '$http', '$routeParams', function($q, $scope, $http, $routeParams) {

    $q.all([
        $http.get('/app_dev.php/manage/user/' + $routeParams.userId),
        $http.get('/app_dev.php/categories')
    ]).then(function(values) {
        $scope.user = values[0].data;
        $scope.categories = values[1].data;
        var userCategoriesIds = $scope.user.categories;

        $scope.user.categories = [];

        angular.forEach($scope.categories, function(category) {

            if (userCategoriesIds.indexOf(category.id) !== -1) {
                $scope.user.categories.push({
                    id: category.id,
                    name: category.name
                });
            }
        });
    });

    $scope.save = function(user) {
        $http.put('/app_dev.php/manage/user/' + $routeParams.userId,
            'name=' + user.name +
            '&email=' + user.email +
            '&categories=' + user.categories.map(function(value) { return value.id;})
            , {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function() {

            });
    }
}]);