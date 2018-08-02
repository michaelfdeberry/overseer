angular.module("overseer").filter("duration", function () {
    "use strict";

    return function (value) {
        if (!value) return "00:00:00";

        var d = Number(value);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);

        return (h < 100 ? ("0" + h).slice(-2) : h) + "h " + ("0" + m).slice(-2) + "m";
    };
});