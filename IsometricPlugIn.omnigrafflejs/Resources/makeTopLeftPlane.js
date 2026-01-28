var _ = function() {
    var action = this.IsometricLib.createAction(function(graphic, lib) {
        lib.makePlane(graphic, 'topLeft');
    });
    return action;
}.call(this);
_;
