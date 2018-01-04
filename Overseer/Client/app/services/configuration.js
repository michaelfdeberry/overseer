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

        self.getPrinter = function(printerId) {
            if (cache.printers[printerId]) {
                return $q.resolve(cache.printers[printerId]);
            }
            
            return $http.get(endpoint + "/" + printerId).then(function(result) {                 
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
    }
]);