angular.module("overseer").service("addEditPrinterService", function() {
    "use strict";
    
    var octoprintPrinterType = "Octoprint";
    var reprapPrinterType = "RepRap";

    var printerTypes = [
        octoprintPrinterType, 
        reprapPrinterType
    ];

    var printerSubtypes = {
        restful: [octoprintPrinterType, reprapPrinterType]
    };
    
    this.bind = function(controller) {        
        Object.defineProperties(controller, {
            printerTypes: {
                get: function() {
                    return printerTypes;
                }
            },

            printerSubtypes: {
                get: function() {
                    return printerSubtypes;
                }  
            },

            configTemplateUrl: {
                get: function() {
                    if (!controller.model) return;
                    if (!controller.model.printerType) return;

                    return "views/configuration/" + controller.model.printerType + ".html";
                }
            },

            isRestfulProvider: {
                get: function() {
                    if (!controller.model) return;
                    if (!controller.model.printerType) return;

                    return printerSubtypes.restful.indexOf(controller.model.printerType) >= 0;
                }
            }
        });
    };
});