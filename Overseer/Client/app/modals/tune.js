angular.module("overseer")
    .service("tuneModal", [
        "$mdDialog",
        function ($mdDialog) {
            "use strict";

            this.open = function(printer, status) {
                $mdDialog.show({
                    controllerAs: "ctrl",
                    controller: "tuneModalController",
                    templateUrl: "modals/tune.html",
                    clickOutsideToClose: true,
                    locals: {
                        printer: printer,
                        status: status
                    }
                });
            };
        }
    ])
    .controller("tuneModalController", [
        "$scope",
        "$mdDialog",
        "controlService",
        "printer",
        "status",
        function ($scope, $mdDialog, controlService, printer, status) {
            "use strict";

            var self = this;
            self.printer = printer;
            self.status = status;
            self.fanSpeed = 0;
            self.feedRate = 100;
            self.flowRates = _.map(printer.config.tools, function() { return 100; });

            self.ngModelOptions = {
                debounce: 400
            };

            $scope.$on("$StatusUpdate$", function(event, status) {                
                var printerStatus = status[self.printer.id];
                if (printerStatus) {
                    self.status = printerStatus;
                    $scope.$digest();
                }
            });
            
            function lockUi(promise) {
                self.busy = true;
                return promise.then(function() { self.busy = false; });
            }

            self.pause = function() {
                lockUi(controlService.pause(printer.id));
            };

            self.resume = function() {
                lockUi(controlService.resume(printer.id));
            };

            self.cancel = function () {
                var confirm = $mdDialog.confirm()
                    .title("Cancel Print")
                    .textContent("Are you sure you want to cancel this print?")
                    .ok("Yes")
                    .cancel("No")
					.multiple(true);
                
                $mdDialog.show(confirm).then(function () { 
                    lockUi(controlService.cancel(printer.id)).then(function(){
						self.hide();
					});
                }, function () { });
            };

            self.increaseTemp = function (toolName) {
                var tool = _.find(status.temperatures, { name: toolName });
                tool.target += 1;

                lockUi(controlService.setTemperature(printer.id, toolName, tool.target));
            };

            self.decreaseTemp = function (toolName) {
                var tool = _.find(status.temperatures, { name: toolName });
                tool.target -= 1;

                lockUi(controlService.setTemperature(printer.id, toolName, tool.target));
            };

            self.setFeedRate = function() {
                lockUi(controlService.setFeedRate(printer.id, self.feedRate));
            };

            self.setFlowRate = function (index) {
                var toolName = self.printer.config.tools[index];
                lockUi(controlService.setFlowRate(printer.id, toolName, self.flowRates[index]));
            };

            self.setFanSpeed = function() {
                lockUi(controlService.setFanSpeed(printer.id, self.fanSpeed));
            };

            self.hide = function() {
                $mdDialog.hide();
            };
        }
    ]);