(function () {
    var app = angular.module('nektime', ['ngAnimate', 'ngRoute', 'ngStorage', 'angular-loading-bar']);
    app.config(['$routeProvider', '$locationProvider', '$httpProvider', '$interpolateProvider', function ($routeProvider, $locationProvider, $httpProvider, $interpolateProvider) {
        $interpolateProvider.startSymbol('{@');
        $interpolateProvider.endSymbol('@}');
        $routeProvider
            .when('/', {
                templateUrl: '/static/tpl/home.html',
            })
            .when('/register', {
                templateUrl: '/static/tpl/register.html',
            })
            .when('/question', {
                templateUrl: '/static/tpl/question.html',
                controller: 'questionCtrl'
            })
            .when('/write', {
                templateUrl: '/static/tpl/write.html',
                controller: 'writeCtrl'
            })
            .when('/questions', {
                templateUrl: '/static/tpl/question-list.html',
                controller: 'questionListCtrl'
            })
            .otherwise({redirectTo: '/'});
        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('$q', '$location', '$localStorage', 'Base64', function ($q, $location, $localStorage, Base64) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};
                    if ($localStorage.token) {
                        config.headers.Authorization = "Basic " + Base64.encode($localStorage.token + ":")
                    }
                    return config;
                },
                'responseError': function (response) {
                    if (response.status === 401 || response.status === 403) {
                        console.error("Login Required");
                        delete $localStorage.token;
                    }
                    return $q.reject(response);
                }
            };
        });
    }]);

    app.factory('authService', ['$http', '$rootScope', '$localStorage', 'Base64', function ($http, $rootScope, $localStorage, Base64) {
        return {
            login: function (username, password, callback) {
                var authdata = Base64.encode(username + ":" + password);
                var param = {
                    method: 'post',
                    url: '/api/token',
                    headers: {
                        "Authorization": "Basic " + authdata
                    }
                };

                $http(param).success(function (res) {
                    if (res.status == 1) {
                        return console.error("Login Failed");
                    } else {
                        $localStorage.token = res.token;
                        $rootScope.auth = {
                            username: res.username,
                            token: res.token
                        }
                    }
                });
            },
            logout: function () {
                delete $localStorage.token;
                delete $rootScope.auth;
            },
            getinfo: function () {
                $http.get('/api/token').success(function (res) {
                    $rootScope.auth = {
                        username: res.username
                    };
                })
            }
        }
    }]);

    app.controller('authCtrl', ['$scope', '$localStorage', 'authService', function($scope, $localStorage, authService) {
        if ($localStorage.token) {
            authService.getinfo();
        }
        $scope.login = function() {
            authService.login($scope.model.username, $scope.model.password);
        };
        $scope.logout = function() {
            authService.logout();
        };

        $scope.loginmenu = true;
        $scope.loginbox = true;
    }]);
    app.controller('questionCtrl', ['$http', '$scope', function($http, $scope) {
        $scope.sendWrite = function() {
            $http.post('/api/questions', {"text": $scope.model.text}).success(function(res) {
                console.log(res);
            });
        }
    }]);
    app.controller('questionListCtrl', ['$http', '$scope', function($http, $scope) {
        $http.get('/api/questions').success(function(res) {
            $scope.rows = res;
        });
    }]);
    app.directive("slideToggle", function() {
        return {
            restrict: 'A',
            scope: {
                isOpen: '=slideToggle'
            },
            link: function(scope, element, attr) {
                var slideDuration = 200;
                scope.$watch('isOpen', function(n, o) {
                    if(n !== o) {
                        element.stop().slideToggle(slideDuration);
                    }
                })
            }
        }
    });
    app.factory('Base64', function () {
        /* jshint ignore:start */

        var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

        return {
            encode: function (input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                do {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";
                } while (i < input.length);

                return output;
            },

            decode: function (input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
                var base64test = /[^A-Za-z0-9\+\/\=]/g;
                if (base64test.exec(input)) {
                    window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
                }
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                do {
                    enc1 = keyStr.indexOf(input.charAt(i++));
                    enc2 = keyStr.indexOf(input.charAt(i++));
                    enc3 = keyStr.indexOf(input.charAt(i++));
                    enc4 = keyStr.indexOf(input.charAt(i++));

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output = output + String.fromCharCode(chr1);

                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }

                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";

                } while (i < input.length);

                return output;
            }
        };
    });
})();