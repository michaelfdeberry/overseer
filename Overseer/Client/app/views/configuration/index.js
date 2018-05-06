angular.module("overseer").controller("configurationController", [
    "$scope",
    "$q",
    "$mdDialog",
    "$location",
    "$translate",
    "configuration",
    "authentication",
    function ($scope, $q, $mdDialog, $location, $translate, configurationService, authentication) {
        "use strict";

        var self = this;
        self.intervals = [1000, 5000, 10000, 15000, 20000];
        self.lifetimes = [null, 1, 7, 30, 90];

        self.loading = true;
        self.ready = false;

        configurationService.getConfiguration().then(function (configuration) {
            self.loading = false;
            self.ready = true;
            self.settingsPristine = configuration.settings;
            self.settings = angular.copy(configuration.settings);
            self.printers = configuration.printers;
            self.users = configuration.users;
        });

        self.updateSettings = function () {
            if (self.settings.requiresUserAuthentication && !self.users.length) {
                var confirm = $mdDialog.confirm()
                    .title($translate.instant("warning"))
                    .textContent($translate.instant("requiresAutnenticationPrompt"))
                    .ok($translate.instant("addUser"))
                    .cancel($translate.instant("cancel"));

                $mdDialog.show(confirm).then(function () {
                    $location.path("/configuration/users/add");
                },
                    function () {
                        self.revertSettings();
                    });
            } else {
                self.loading = true;

                configurationService.updateSettings(self.settings).then(function (updatedSettings) {
                    self.loading = false;

                    //if user authentication was turned on, logout the user, if they exist
                    if (self.settingsPristine.requiresUserAuthentication && !updatedSettings.requiresUserAuthentication) {
                        authentication.logout();
                    }

                    //the user would be redirected with the next request, but redirect immediately just to prevent any potential confusion. 
                    if (!self.settingsPristine.requiresUserAuthentication && updatedSettings.requiresUserAuthentication) {
                        $location.path("/login");
                    }

                    self.settingsPristine = updatedSettings;
                    self.settings = angular.copy(updatedSettings);
                    self.settingsForm.$setPristine();
                });
            }
        };

        self.revertSettings = function () {
            self.settings = angular.copy(self.settingsPristine);
            self.settingsForm.$setPristine();
        };
    }
]);