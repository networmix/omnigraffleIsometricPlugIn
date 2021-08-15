var _ = function(){
    var action = new PlugIn.Action(function(selection){
        var isometricLib = this.IsometricLib
        shape = selection.graphics[0]
        if (shape.shape !== "Bezier") {
            shape.shape = "Bezier"
        }
        if (shape.hasOwnProperty("shapeControlPoints")) {
            shape.shapeControlPoints = isometricLib.skewY(shape.shapeControlPoints, 30)
        }
    });

    // result determines if the action menu item is enabled
    action.validate = function(selection){
        // check to see if any graphics are selected
        if (selection.graphics.length > 0){return true} else {return false}
    };

    return action;
}();
_;