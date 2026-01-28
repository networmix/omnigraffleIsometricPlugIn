var _ = function() {
    var action = new PlugIn.Action(function(selection) {
        var lib = this.IsometricLib;
        for (var i = 0; i < selection.graphics.length; i++) {
            lib.applySkewY(selection.graphics[i], 30);
        }
    });
    action.validate = function(selection) {
        return selection.graphics.length > 0;
    };
    return action;
}();
_;
