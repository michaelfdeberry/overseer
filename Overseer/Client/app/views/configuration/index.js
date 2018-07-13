angular.module("overseer").controller("configurationController", [
    "$scope",
    "$q",
    "$mdDialog",
    "$location",
    "$translate",
    "$routeParams",
    "configuration",
    "authentication",
    function ($scope, $q, $mdDialog, $location, $translate, $routeParams, configurationService, authentication) {
        "use strict";

        var self = this;
        self.intervals = [1000, 5000, 10000, 15000, 20000];

        self.loading = true;
        self.ready = false;
        self.activeTab = $routeParams.tab;

        configurationService.getConfiguration().then(function (configuration) {
            self.loading = false;
            self.ready = true;
            self.settingsPristine = configuration.settings;
            self.settings = angular.copy(configuration.settings);
            self.printers = configuration.printers;
            self.users = configuration.users;
        });

        self.setTabPath = function(path) {
            $location.update_path("/configuration/" + (path || ""));
        };

        self.updateSettings = function () {
            if (self.settings.requiresAuthentication && !self.users.length) {
                var confirm = $mdDialog.confirm()
                    .title($translate.instant("warning"))
                    .textContent($translate.instant("requiresAutnenticationPrompt"))
                    .ok($translate.instant("addUser"))
                    .cancel($translate.instant("cancel"));

                $mdDialog.show(confirm).then(function () {
                    $location.path("/configuration/users/add");
                }, function () {
                    self.revertSettings();
                });
            } else {
                self.loading = true;

                configurationService.updateSettings(self.settings).then(function (updatedSettings) {
                    self.loading = false;

                    //if user authentication was turned off logout the user this will put the UI in non user mode
                    if (self.settingsPristine.requiresAuthentication && !updatedSettings.requiresAuthentication) {
                        authentication.logout();
                        return;
                    }

                    //if user authentication was turned on force the user to log in
                    if (!self.settingsPristine.requiresAuthentication && updatedSettings.requiresAuthentication) {
                        $location.path("/login");
                        return;
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