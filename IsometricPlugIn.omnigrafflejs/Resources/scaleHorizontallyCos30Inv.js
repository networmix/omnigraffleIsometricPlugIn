var _ = function() {
    var action = this.IsometricLib.createAction(function(graphic, lib) {
        lib.applyScale(graphic, 'x', lib.COS_30_INV);
    });
    return action;
}.call(this);
_;
