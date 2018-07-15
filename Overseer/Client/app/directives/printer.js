angular.module("overseer").directive("printer",
    function () {
        "use strict";

        return {
            restrict: "E",
            scope: true,
            replace: true,
            templateUrl: "directives/printer.html",
            bindToController: {
                model: "="
            },
            controller: [
                "$q",
                "$scope",
                "controlService",
                "$mdDialog",
                "tuneModal",
                function ($q, $scope, controlService, $mdDialog, tuneModal) {
                    var self = this;
                    self.connecting = true;
                    self.cacheBuster = Date.now();

                    Object.defineProperties(self, {
                        isPrinting: {
                            get: function () {
                                if (!self.status) return;
                                return self.status.state === "Printing";
                            }
                        },
                        isPaused: {
                            get: function () {
                                if (!self.status) return;
                                return self.status.state === "Paused";
                            }
                        },
                        isIdle: {
                            get: function() {
                                if (!self.status) return;
                                return self.status.state === "Idle";
                            }
                        },
                        isDisconnected: {
                            get: function() {
                                if (!self.status) return true;
                                return !self.isDisabled && self.status.state === "Disconnected" || self.status.state === "Offline";
                            }
                        },
                        isDisabled: {
                            get: function() {
                                return !self.connecting && self.model.disabled;
                            }
                        },
                        webcamUrl: {
                            get: function() {
                                var url = self.model.config.webCamUrl;
                                return  url + (url.indexOf("?") >= 0 ? "&" : "?") + "cb=" + self.cacheBuster;
                            }
                        }
                    });

                    $scope.$on("$StatusUpdate$", function (event, status) { 
                        self.connecting = false;   

                        var printerStatus = status[self.model.id];
                        if (printerStatus) {
                            self.status = printerStatus;
                        }

                        $scope.$digest();                   
                    });

                    self.toggleZoom = function () {
                        self.zoom = !self.zoom;
                    };

                    self.tune = function () {
                        tuneModal.open(self.model, self.status);
                    };

                    self.pause = function () {
                        if (!self.isPrinting) return;

                        controlService.pause(self.model.id);
                    };

                    self.resume = function () {
                        if (!self.isPaused) return;

                        controlService.resume(self.model.id);
                    };

                    self.cancel = function () {
                        if (!self.isPrinting) return;

                        var confirm = $mdDialog.confirm()
                            .title("Cancel Print")
                            .textContent("Are you sure you want to cancel this print?")
                            .ok("Yes")
                            .cancel("No");

                        $mdDialog.show(confirm).then(function() {
                            controlService.cancel(self.model.id);
                        }, function(){});
                    };

                    self.getActualTemp = function(tool) {
                        return getTemp(tool, "actual");
                    };

                    self.getTargetTemp = function(tool) {
                        return getTemp(tool, "target");
                    };

                    function getTemp(tool, tempProperty) {
                        if (!self.status || !self.status.temperatures) return 0;

                        return self.status.temperatures[tool][tempProperty];
                    }
                }
            ],
            controllerAs: "printerCtrl"
        };
    }
);