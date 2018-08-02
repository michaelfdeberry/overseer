angular.module("overseer").controller("editPrinterController", [
    "$scope",
    "$location",
    "$routeParams",
    "$mdDialog",
    "$translate",
    "configuration",
    "addEditPrinterService",
    function ($scope, $location, $routeParams, $mdDialog, $translate, configurationService, addEditPrinterService) {
        "use strict";

        var self = this; 
        addEditPrinterService.bind(self);
        
        self.loading = true;
        configurationService.getPrinter($routeParams.id).then(function (printer) {            
            self.model = angular.copy(printer);
            self.currentName = printer.name;
            self.loading = false;
        });

        self.updatePrinter = function () {
            self.loading = true;
            configurationService.updatePrinter(self.model).then(function () {
                $location.path("/configuration/printers");
            });
        };

        self.deletePrinter = function() {
            self.loading = true;
            var confirm = $mdDialog.confirm()
                .title($translate.instant("warning"))
                .textContent($translate.instant("deletePrinterPrompt"))
                .ok($translate.instant("yes"))
                .cancel($translate.instant("no"));

            $mdDialog.show(confirm).then(function () {
                configurationService.deletePrinter(self.model).then(function () {
                    $location.path("/configuration/printers");
                });
            }, function () { });
        };
    }
]);