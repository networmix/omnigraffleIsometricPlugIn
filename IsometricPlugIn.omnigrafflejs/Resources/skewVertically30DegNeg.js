var _ = function () {
    var action = new PlugIn.Action(function (selection) {
        var lib = this.IsometricLib;
        lib.applySkewYMulti(selection.graphics, -30);
    });
    action.validate = function (selection) {
        return selection.graphics.length > 0;
    };
    return action;
}();
_;
