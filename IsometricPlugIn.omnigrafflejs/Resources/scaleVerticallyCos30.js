var _ = function() {
    var action = this.IsometricLib.createAction(function(graphic, lib) {
        lib.applyScale(graphic, 'y', lib.COS_30);
    });
    return action;
}.call(this);
_;
