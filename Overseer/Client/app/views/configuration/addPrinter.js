angular.module("overseer").controller("addPrinterController", [
    "$location",
    "$mdToast",
    "configuration",   
    "certificateExceptionModal",
    "$translate",
    "addEditPrinterService",
    function($location, $mdToast, configuration, certificateExceptionModal, $translate, addEditPrinterService) {
        "use strict";

        var self = this;
        self.model = {};

        addEditPrinterService.bind(self);        
        
        self.addPrinter = function () {
            self.loading = true;
            self.model.config.printerType = self.model.printerType;            

            configuration.createPrinter(self.model).then(function () {
                self.loading = false;
                $location.path("/configuration/printers");
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