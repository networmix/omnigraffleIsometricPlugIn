var _ = function() {
    var action = this.IsometricLib.createAction(function(graphic, lib) {
        lib.applyScale(graphic, 'x', lib.COS_30);
    });
    return action;
}.call(this);
_;
