angular.module("overseer", ["ngRoute", "ngAnimate", "ngMaterial", "pascalprecht.translate"]);

angular.module("overseer")
    .config([
        "$routeProvider",
        "$mdThemingProvider",
        "$httpProvider",
        function ($routeProvider, $mdThemingProvider, $httpProvider) {
            "use strict";

            $routeProvider
                .when("/", {
                    templateUrl: "views/index.html",
                    controller: "indexController",
                    controllerAs: "ctrl"
                })
                .when("/configuration", {
                    templateUrl: "views/configuration/index.html",
                    controller: "configurationController",
                    controllerAs: "ctrl"
                })
                .when("/configuration/printers/add", {
                    templateUrl: "views/configuration/addPrinter.html",
                    controller: "addPrinterController",
                    controllerAs: "ctrl"
                })
                .when("/configuration/printers/edit/:id", {
                    templateUrl: "views/configuration/editPrinter.html",
                    controller: "editPrinterController",
                    controllerAs: "ctrl"
                })
                .when("/configuration/users/add", {
                    templateUrl: "views/configuration/addUser.html",
                    controller: "addUserController",
                    controllerAs: "ctrl"
                })
                .when("/configuration/users/edit/:id", {
                    templateUrl: "views/configuration/editUser.html",
                    controller: "editUserController",
                    controllerAs: "ctrl"
                })
                .when("/login", {
                    templateUrl: "views/login.html",
                    controller: "loginController",
                    controllerAs: "ctrl"
                })
                .otherwise("/");

            $mdThemingProvider.definePalette("overseerPalette", {
                "50": "e6f0fd",
                "100": "c1d9fa",
                "200": "97c0f6",
                "300": "6da6f2",
                "400": "4e93f0",
                "500": "2f80ed",
                "600": "2a78eb",
                "700": "236de8",
                "800": "1d63e5",
                "900": "1250e0",
                "A100": "ffffff",
                "A200": "dbe5ff",
                "A400": "a8bfff",
                "A700": "8facff",
                "contrastDefaultColor": "light",
                "contrastDarkColors": [
                    "50",
                    "100",
                    "200",
                    "300",
                    "400",
                    "A100",
                    "A200",
                    "A400",
                    "A700"
                ],
                "contrastLightColors": [
                    "500",
                    "600",
                    "700",
                    "800",
                    "900"
                ]
            });

            $mdThemingProvider.theme("default")
                .primaryPalette("overseerPalette", { default: "500" })
                .accentPalette("overseerPalette", { default: "800" })
                .dark();


            $mdThemingProvider.enableBrowserColor();

            $httpProvider.interceptors.push(["$q", "$location", function ($q, $location) {
                var activeRequest = 0;
                var timeout;

                function startLoader() {
                    if (activeRequest === 0) {
                        NProgress.start();

                        timeout = setTimeout(function () {
                            activeRequest = 0;
                            stopLoader();
                        }, 30 * 1000);
                    }
                    activeRequest++;
                }

                function stopLoader() {
                    activeRequest--;
                    if (activeRequest <= 0) {
                        if (timeout) {
                            clearTimeout(timeout);
                        }

                        activeRequest = 0;
                        NProgress.done();
                    }
                }

                return {
                    request: function (config) {
                        startLoader();
                        
                        if (window.localStorage.activeUser) {
                            var user = JSON.parse(window.localStorage.activeUser);
                            config.headers.Authorization = "Bearer " + user.token;
                        }
                    
                        return config;
                    },
                    response: function (response) {
                        stopLoader();
                        return response;
                    },
                    responseError: function (response) {
                        stopLoader();

                        //redirect to login if unauthorized status code is returned
                        if (response.status === 401 || response.status === 403) {
                            delete window.localStorage.activeUser;
                            $location.path("/login");
                        }

                        return $q.reject(response);
                    }
                };
            }]);
        }
    ])
    .controller("appCtrl", [
        "$rootScope", 
        "$location", 
        "authentication", 
        "configuration",
        function ($rootScope, $location, authentication, configuration) {
            "use strict";

            var self = this;
            var monitoringEnabled;

            Object.defineProperties(self, {
                showMenu: {
                    get: function() {
                        return authentication.authToken;
                    }
                }
            });

            self.logout = function() {
                authentication.logout();
                $location.path("/login");
            };

            $.connection.hub.url = "/push";
            $.connection.statusHub.client.statusUpdate = function (status) {
                $rootScope.$broadcast("$StatusUpdate$", status);
            };

            $rootScope.$watch(function () { return authentication.authToken; }, function(current, previous) {
                if (current) {
                    //a user logged in or the page loaded with a logged in user
                    subscribeToStatusUpdates();
                } else if (previous) {
                    //a user logged out, or a request returned a 401 or 403
                    configuration.clearCache();
                    unsubscribeFromStatusUpdates();
                }
            });
        
            function unsubscribeFromStatusUpdates() {
                if (!$.connection.hub) return;

                monitoringEnabled = false;
                $.connection.hub.stop();
            }

            function subscribeToStatusUpdates() {
                if (monitoringEnabled) return;

                $.connection.hub.start().done(function () {
                    var token = authentication.activeUser ? authentication.activeUser.token : "";
                    $.connection.statusHub.server.startMonitoring(token).then(function(enabled) {
                        monitoringEnabled = enabled;
                    });
                });
            }

            //attempt to subscribe to updates. If user authentication is required the server won't send updates.
            subscribeToStatusUpdates();
    }
]);