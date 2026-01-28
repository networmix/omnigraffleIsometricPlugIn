var _ = function () {
    var action = new PlugIn.Action(function (selection) {
        var lib = this.IsometricLib;
        for (var i = 0; i < selection.graphics.length; i++) {
            lib.applyScale(selection.graphics[i], 'y', lib.COS_30_INV);
        }
    });
    action.validate = function (selection) {
        return selection.graphics.length > 0;
    };
    return action;
}();
_;
