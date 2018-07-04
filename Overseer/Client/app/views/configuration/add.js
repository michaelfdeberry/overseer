angular.module("overseer").controller("addPrinterController", [
    "$location",
    "$mdToast",
    "configuration",   
    function($location, $mdToast, configuration) {
        "use strict";

        var self = this;
        
        self.printerTypes = ["Octoprint", "RepRap"]; 
        self.model = {};   
        
        Object.defineProperty(self, "configTemplateUrl", {
            get: function() {
                if (!self.model.printerType) return;

                return "views/configuration/" + self.model.printerType + ".html";
            }
        });

        self.addPrinter = function () {
            self.loading = true;
            self.model.config.printerType = self.model.printerType;            

            configuration.createPrinter(self.model).then(function () {
                self.loading = false;
                $location.path("/configuration");
            }, function(response) {
                var toast = $mdToast.simple()
                    .textContent(response.data.error)
                    .position("bottom right")
                    .hideDelay(3000)
                    .toastClass("toast-error");

                $mdToast.show(toast);
            });
        };
    }
]);