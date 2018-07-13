angular.module("overseer").controller("addUserController", [
    "$scope",
    "$location",
    "configuration",
    function ($scope, $location, configuration) {
        "use strict";

        var self = this;
        self.user = {};
        self.lifetimes = [null, 1, 7, 30, 90];

        self.addUser = function () {
            self.loading = true;
            configuration.addUser(self.user).then(function () {
                $location.path("/configuration/users");
            }, function (e) {
                self.error = e;
            }).finally(function () {
                self.loading = false;
            });
        };
    }
]);