angular.module("overseer").directive("resizer", ["$window", function($window) {
    "use strict";

    return {
        restict: "E",
        transclude: true,
        template: "<div ng-transclude></div>",
        replace: true,
        scope: {
            count: "=",
            output: "="
        },
        link: function (scope) {            
            var body = $window.document.body;
            var width;
            var height;

            scope.output = {};
            Object.defineProperties(scope.output, {
                width: {
                    get: function () { 
                        return width;
                    }
                },
                height: {
                    get: function () { 
                        return height;
                    }
                }
            });

            function calculate() {
                var header = $window.document.getElementById("header");
                var availableHeight = body.clientHeight - Math.max(header.clientHeight, 64);
                var defaultRatio = 16 / 9;
                var ratio = window.devicePixelRatio || 1;

                if (body.clientWidth / ratio < 960) {
                    width = 100;
                    height = body.clientWidth / (4/3);                
                } else {         
                    var rows = 1;                                       
                    if (scope.count > 2 && scope.count <= 4) {
                        rows = 2;
                    } else if (scope.count > 4) {
                        rows = Math.floor(scope.count / 4) + (scope.count % 4 > 0 ? 1 : 0);                        
                    }
                    
                    var columns = Math.ceil(scope.count / rows);
                    width = 100 / columns; 
                    height = rows > 4 ? body.width / columns / defaultRatio : availableHeight / rows;
                }
            }
            
            function onResize() {
                calculate();
                scope.$digest();
            }

            $window.addEventListener("resize", onResize);

            scope.$on("$destroy", function() {
                $window.removeEventListener("resize", onResize);
            });

            calculate();
        }
    };
}]);