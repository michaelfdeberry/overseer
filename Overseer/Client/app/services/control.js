angular.module("overseer").service("controlService", ["$http", function($http) {
    "use strict";

    var self = this;
    var endpoint = "/services/control/";

    self.pause = function(printerId) {
        return $http.get(endpoint + printerId + "/pause");
    };

    self.resume = function(printerId) {
        return $http.get(endpoint + printerId + "/resume");
    };

    self.cancel = function(printerId) {
        return $http.get(endpoint + printerId + "/cancel");
    };

    self.setTemperature = function(printerId, tool, temp) {
        return $http.get(endpoint + printerId + "/temp/" + tool + "/" + temp);
    };

    self.setFeedRate = function(printerId, feedRate) {
        return $http.get(endpoint + printerId + "/feed/" + feedRate);
    };

    self.setFlowRate = function(printerId, tool, flowRate) {
        return $http.get(endpoint + printerId + "/flow/" + tool + "/" + flowRate);
    };

    self.setFanSpeed = function(printerId, speed) {
        return $http.get(endpoint + printerId + "/fan/" + speed);
    };
}]);