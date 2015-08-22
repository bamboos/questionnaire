var auth = angular.module('auth', []);

auth.factory('AuthService', function ($http, Session) {
    var authService = {};

    authService.login = function (username, password) {
        return $http.post('/app_dev.php/login_check',
            '_username=' + username +
            '&_password=' + password
            , {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {

                if (response.data.success) {
                    Session.create('user-' + response.data.user, response.data.user);
                    return response.data.user;
                }
            });
    };

    authService.isAuthenticated = function () {
        return typeof Session.user !== "undefined" && Session.user !== '';
    };

    return authService;
});