angular.module('app', ['app.controller.default'])
    .directive("contenteditable", function() {
        return {
            require: "ngModel",
            link: function(scope, element, attrs, ngModel) {

                function read() {
                    ngModel.$setViewValue(element.html());
                }

                ngModel.$render = function() {
                    element.html(ngModel.$viewValue || "");
                };

                element.bind("blur", function() {
                    scope.$apply(read);
                });
            }
        };
    });
;

