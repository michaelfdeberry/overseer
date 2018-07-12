angular.module("overseer").service("configuration", [
    "$q",
    "$http",
    function ($q, $http) {
        "use strict";

        var self = this;
        var endpoint = "/services/config";

        var cache = {
            printers: {}
        };
        
        self.clearCache = function() {
            cache = {
                printers: {}
            };
        };

        self.getConfiguration = function() {
            return $http.get(endpoint + "/configuration").then(function(result) {
                angular.forEach(result.data.printers, function (printer) {
                    cache.printers[printer.id] = printer;
                });

                cache.settings = result.data.settings;
                cache.users = result.data.users;

                return result.data;
            });
        };

        self.getPrinters = function () {
            if (Object.keys(cache.printers).length) {
                var printers = [];
                angular.forEach(cache.printers, function(printer) {
                    printers.push(printer);
                });

                return $q.resolve(printers);
            }

            return $http.get(endpoint).then(function (result) {
                angular.forEach(result.data, function (printer) {
                    cache.printers[printer.id] = printer;
                });

                return result.data;
            });
        };

        self.getPrinter = function(printerId) {
            if (cache.printers[printerId]) {
                return $q.resolve(cache.printers[printerId]);
            }
            
            return $http.get(endpoint + "/" + printerId).then(function(result) {                 
                return result.data;
            });
        };

        self.createPrinter = function (printer) {            
            return $http.put(endpoint, printer).then(function (result) {
                cache.printers[result.data.id] = result.data;
                return result.data;
            });
        };

        self.updatePrinter = function (printer) {
            return $http.post(endpoint, printer).then(function(result) {
                cache.printers[result.data.id] = result.data;
                return result.data;
            });
        };

        self.deletePrinter = function (printer) {
            return $http.delete(endpoint + "/" + printer.id).then(function() {
                delete cache.printers[printer.id];
            });
        };

        self.getSettings = function() {
            if (cache.settings) {
                return $q.resolve(cache.settings);
            }

            return $http.get(endpoint + "/settings").then(function(result) {
                cache.settings = result.data;
                return result.data;
            });
        };

        self.updateSettings = function(settings) {
            return $http.post(endpoint + "/settings", settings).then(function(result) {
                cache.settings = result.data;
                return result.data;
            });
        };

        self.getUsers = function() {
            if (cache.users) {
                $q.resolve(cache.users);
            }

            return $http.get(endpoint + "/users").then(function(result) {
                cache.users = result.data;
                return result.data;
            });
        };

        function handleUserError(e) {
            if (e.status === 400 && e.data && e.data.error) {
                return $q.reject(e.data.error);
            } else {
                return $q.reject("An Unknown Error Occurred");
            }
        }

        self.addUser = function(user) {
            return $http.put(endpoint + "/users", user).then(function(result) {
                cache.users.push(result.data);
                return result.data;
            }, handleUserError);
        };

        self.changeUserPassword = function(user) {
            return $http.post(endpoint + "/users", user).then(function(result) {               
                return result.data;
            }, handleUserError);
        };

        self.removeUser = function(userId) {
            return $http.delete(endpoint + "/users/" + userId).then(function() {
                var users = [];
                angular.forEach(cache.users, function(u) {
                    if (u.id !== userId) {
                        users.push(u);
                    }
                });

                cache.users = users;
            });
        };

        self.logoutUser = function (userId) {
            return $http.post(endpoint + "/logout/" + userId).then(function(result) {
                var user = result.data;
                for (var i = 0; i < cache.users.length; i++) {
                    var u = cache.users[i];
                    if (u.id === user.id) {
                        angular.copy(user, u);
                        return u;
                    }
                }
            });
        };

        self.addCertificateException = function(exception) {
            return $http.put(endpoint + "/certificate", exception);
        };
    }
]);