angular.module("overseer").controller("addPrinterController", [
    "$location",
    "configuration",
    function($location, configuration) {
        "use strict";

        var self = this;
        
        self.printerTypes = ["Octoprint", "RepRap"]; 
        self.model = {};   
        
        Object.defineProperty(self, "configTemplateUrl", {
            get: function() {
                return "view/configuration/" + self.model.printerType + ".html";
            }
        });

        self.addPrinter = function () {
            self.loading = true;
            self.model.config.printerType = self.model.printerType;            

            configuration.createPrinter(self.model).then(function () {
                self.loading = false;
                $location.path("/configuration");
            });
        };

        self.getConfigTemplateUrl = function() {
            return "views/configuration/" + self.model.printerType + ".html";
        };
    }
]);