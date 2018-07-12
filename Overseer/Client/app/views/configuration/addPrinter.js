angular.module("overseer").controller("addPrinterController", [
    "$location",
    "$mdToast",
    "configuration",   
    "certificateExceptionModal",
    "$translate",
    function($location, $mdToast, configuration, certificateExceptionModal, $translate) {
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
                if (response.data.error === "Certificate_Exception") {
                    certificateExceptionModal.open(response.data.properties).then(function(retry) {
                        if (retry) {
                            self.addPrinter();
                        }
                    });
                } else {
                    $translate(response.data.error).then(function(errorMessage){
                        var toast = $mdToast.simple()
                            .textContent(errorMessage || "An Unknown Error Occurred")
                            .position("bottom right")
                            .hideDelay(3000)
                            .toastClass("toast-error");

                        $mdToast.show(toast);                    
                        self.loading = false;
                    });         
                }                              
            });
        };
    }
]);