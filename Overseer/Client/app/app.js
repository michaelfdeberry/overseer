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
                .when("/configuration/add", {
                    templateUrl: "views/configuration/add.html",
                    controller: "addPrinterController",
                    controllerAs: "ctrl"
                })
                .when("/configuration/edit/:id", {
                    templateUrl: "views/configuration/edit.html",
                    controller: "editPrinterController",
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
                .dark();

            $httpProvider.interceptors.push([function () {
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
                        return config;
                    },
                    response: function (response) {
                        stopLoader();                        
                        return response;
                    },
                    responseError: function (response) {
                        stopLoader();
                        return response;
                    }
                };
            }]);
        }
    ])
    .controller("appCtrl", ["$rootScope", function ($rootScope) {
        "use strict";

        $.connection.statusHub.client.statusUpdate = function (status) { 
            $rootScope.$broadcast("$StatusUpdate$", status);
        };

        $.connection.hub.url = "/push";
        $.connection.hub.start().done(function () {
            $.connection.statusHub.server.startMonitoring();
        });
    }]);