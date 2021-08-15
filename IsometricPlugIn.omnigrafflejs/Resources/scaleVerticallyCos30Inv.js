var _ = function(){
    var action = new PlugIn.Action(function(selection){
        var isometricLib = this.IsometricLib
        shape = selection.graphics[0]
        if (shape.shape !== "Bezier") {
            shape.shape = "Bezier"
        }
        newGeometry = shape.geometry
        newGeometry.size = isometricLib.scaleY(newGeometry.size, 2 / Math.sqrt(3))
        shape.geometry = newGeometry
    });

    // result determines if the action menu item is enabled
    action.validate = function(selection){
        // check to see if any graphics are selected
        if (selection.graphics.length > 0){return true} else {return false}
    };

    return action;
}();
_;