var _ = function() {
    var action = this.IsometricLib.createAction(function(graphic, lib) {
        lib.applySkewY(graphic, 30);
    });
    return action;
}.call(this);
_;
