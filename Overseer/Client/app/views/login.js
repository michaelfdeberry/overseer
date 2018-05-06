angular.module("overseer").controller("loginController", ["$location", "authentication", function($location, authentication) {
    "use strict";

    var self = this;

    self.user = {};

    self.login = function() {
        self.loading = true;
        self.error = undefined;

        authentication.login(self.user).then(function() {
            self.loading = false;
            $location.path("/");
        }, function(error) {
            self.loading = false;
            self.error = error;
        });
    };
}]);