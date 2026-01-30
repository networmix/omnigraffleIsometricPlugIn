var _ = function () {
    var action = new PlugIn.Action(function (selection) {
        this.IsometricLib.makePlane(selection.graphics, 'topRight');
    });
    action.validate = function (selection) {
        return selection.graphics.length > 0;
    };
    return action;
}();
_;
