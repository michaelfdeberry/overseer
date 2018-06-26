angular.module("overseer").controller("editUserController", [
    "$location", 
    "$routeParams",
    "$mdDialog",
    "$translate",
    "configuration", 
    "authentication",
    function($location, $routeParams, $mdDialog, $translate, configuration, authentication) {
        "use strict";

        var self = this;

        self.loading = true;
        self.lifetimes = [null, 1, 7, 30, 90];
        
        configuration.getSettings()
            .then(function(settings) {
                self.settings = settings;
            });

        configuration.getUsers()
            .then(function(users) {
                self.users = users;

                for (var i = 0; i < users.length; i++) {
                    var user = users[i];
                    if (user.id == $routeParams.id) {
                        self.user = user;
                        return;
                    }
                }
            })
            .finally(cancelLoading);

        self.logout = function() {
            if (self.user.id === authentication.activeUser.id) {
                authentication.logout();
                $location.path("/login");
            } else {
                configuration.logoutUser(self.user.id).then(function(user) {
                    self.user = user;
                });
            }
        };

        self.changePassword = function() {
            self.loading = true;
            return configuration.changePassword(self.user)
                .then(gotoConfiguration, handleError)
                .finally(cancelLoading);
        };

        self.deleteUser = function() {
            if (self.users.length === 1 && self.settings.requiresAuthentication) {
                var alert = $mdDialog.alert()
                    .title($translate.instant("warning"))
                    .textContent($translate.instant("deleteLastUserPrompt"))
                    .ok($translate.instant("dismiss"));

                $mdDialog.show(alert);
                return;
            }

            var confirm = $mdDialog.confirm()
                .title($translate.instant("warning"))
                .textContent($translate.instant("deleteUserPrompt"))
                .ok($translate.instant("yes"))
                .cancel($translate.instant("no"));

            $mdDialog.show(confirm).then(function() {
                self.loading = true;
                return configuration.removeUser(self.user.id)
                    .then(gotoConfiguration, handleError)
                    .finally(cancelLoading);
            });            
        };

        function gotoConfiguration() {
            $location.path("/configuration");
        }

        function handleError(e) {
            self.error = e;
        }

        function cancelLoading() {
            self.loading = false;
        }
    }
]);