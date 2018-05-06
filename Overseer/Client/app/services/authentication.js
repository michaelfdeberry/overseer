angular.module("overseer").service("authentication", [
    "$q",
    "$http",
    function ($q, $http) {
        "use strict";

        var self = this;
        var endpoint = "/services/auth";
        
        Object.defineProperties(self, {
            activeUser: {
                get: function() {
                    if (window.localStorage.activeUser) {
                        return JSON.parse(window.localStorage.activeUser);
                    }
                }, 
                set: function(value) {
                    if (!value) {
                        delete window.localStorage.activeUser;
                    } else {
                        window.localStorage.activeUser = JSON.stringify(value);
                    }
                }
            },
            authToken: {
                get: function() {
                    if (self.activeUser) return "Bearer " + self.activeUser.token;
                }
            }
        });

        self.login = function (user) {
            return $q(function (resolve, reject) {
                $http.post(endpoint, user).then(function (result) {
                    self.activeUser = result.data;
                    resolve();
                }, function (error) {
                    reject(error.status === 400 ? error.data : "An unknown error occurred.");
                });
            });
        };

        self.logout = function () {
            return $http.delete(endpoint + "/logout").then(function () {
                self.activeUser = undefined;
            });
        };
    }
]);