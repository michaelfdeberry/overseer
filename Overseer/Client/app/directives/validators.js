angular.module("overseer")
    .directive("match", function () {
        "use strict";

        return {
            require: ["match", "ngModel"],
            bindToController: {
                match: "="
            },
            link: function (scope, elem, attrs, ctrls) {
                var ctrl = ctrls[0];
                var ngModel = ctrls[1];

                ngModel.$parsers.unshift(validate);

                scope.$watch(function () { return ctrl.match; }, function () {
                    validate(ngModel.$viewValue);
                });

                function validate(value) {
                    var isValid = ctrl.match === value;
                    ngModel.$setValidity("match", isValid);

                    return isValid ? value : undefined;
                }
            },
            controller: function () {
            }
        };
    });