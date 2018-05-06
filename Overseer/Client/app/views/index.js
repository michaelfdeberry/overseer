angular.module("overseer").controller("indexController", [
    "$q",
    "$scope",
    "configuration",
    function ($q, $scope, configuration) {
        "use strict";

        var self = this;
        self.loading = true;

        $q.all({
            printers: configuration.getPrinters(),
            settings: configuration.getSettings()
        }).then(function(results) {
            self.loading = false;
            self.settings = results.settings;
            self.printers = self.settings.hideDisabledPrinters ? _.filter(results.printers, { disabled: false }) : results.printers;
        });        
    }
]);