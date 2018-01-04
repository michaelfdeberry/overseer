angular.module("overseer").controller("editPrinterController", [
    "$scope",
    "$location",
    "$routeParams",
    "$mdDialog",
    "configuration",
    function ($scope, $location, $routeParams, $mdDialog, configurationService) {
        "use strict";

        var self = this;
        self.loading = true;        
        
        configurationService.getPrinter($routeParams.id).then(function (printer) {            
            self.model = angular.copy(printer);
            self.currentName = printer.name;
            self.configTemplateUrl = "views/configuration/" + self.model.printerType + ".html";
            self.loading = false;
        });

        self.updatePrinter = function () {
            self.loading = true;
            configurationService.updatePrinter(self.model).then(function () {
                $location.path("/configuration");
            });
        };

        self.deletePrinter = function() {
            var confirm = $mdDialog.confirm()
                .title("Delete Printer")
                .textContent("Are you sure you want remove this printer?")
                .ok("Yes")
                .cancel("No");

            $mdDialog.show(confirm).then(function () {
                configurationService.deletePrinter(self.model).then(function () {
                    $location.path("/configuration");
                });
            }, function () { });
        };
    }
]);