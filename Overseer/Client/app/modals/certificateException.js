angular.module("overseer")
    .service("certificateExceptionModal", [
        "$mdDialog",
        function($mdDialog) {
            "use strict";

            this.open = function(certificateDetails) {
                return $mdDialog.show({
                    controllerAs: "ctrl",
                    controller: "certificateExceptionModalController",
                    templateUrl: "modals/certificateException.html",
                    clickOutsideToClose: false,
                    locals: {
                        certificateDetails: certificateDetails
                    }
                });
            };
        }
    ])
    .controller("certificateExceptionModalController", [
        "$scope",
        "$mdDialog",
        "configuration",
        "certificateDetails",
        function($scope, $mdDialog, configuration, certificateDetails) {
            "use strict";

            var self = this;
            self.certificateDetails = certificateDetails;

            self.cancel = function() {
                $mdDialog.cancel();
            };

            self.addException = function() {
                configuration.addCertificateException(certificateDetails).then(function() {
                    $mdDialog.hide(true);
                }, function() {
                    $mdDialog.cancel();
                });
            };
        }
    ]);