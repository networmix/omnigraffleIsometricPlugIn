var _ = function() {
    var action = new PlugIn.Action(function(selection) {
        var lib = this.IsometricLib;
        for (var i = 0; i < selection.graphics.length; i++) {
            lib.makePlane(selection.graphics[i], 'topLeft');
        }
    });
    action.validate = function(selection) {
        return selection.graphics.length > 0;
    };
    return action;
}();
_;
