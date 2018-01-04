angular.module("overseer").controller("configurationController", [
    "$scope",
    "$q",
    "configuration",
    function($scope, $q, configurationService) {
        "use strict";

        var self = this;
        self.intervals = [1000, 5000, 10000, 15000, 20000];        

        self.loading = true;
        $q.all({
            printers: configurationService.getPrinters(),
            settings: configurationService.getSettings()
        }).then(function(result) {
            self.loading = false;
            self.settingsPristine = result.settings;
            self.settings = angular.copy(result.settings);
            self.printers = result.printers;
            });

        self.updateSettings = function() {
            configurationService.updateSettings(self.settings).then(function(updatedSettings) {
                self.settingsPristine = updatedSettings;
                self.settings = angular.copy(updatedSettings);
                $scope.settingsForm.$setPristine();
            });
        };

        self.revertSettings = function() {
            self.settings = angular.copy(self.settingsPristine);
            $scope.settingsForm.$setPristine();
        };
    }
]);