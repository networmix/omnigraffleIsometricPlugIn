var _ = function () {
    var action = new PlugIn.Action(function (selection) {
        var lib = this.IsometricLib;
        var graphics = selection.graphics;
        var canvas = selection.canvas;

        // Create form
        var form = new Form();

        // Plane type dropdown
        var planeTypes = ['left', 'right', 'topLeft', 'topRight'];
        var planeNames = ['Left Plane', 'Right Plane', 'Top-Left Plane', 'Top-Right Plane'];
        var planeMenu = new Form.Field.Option(
            'planeType',
            'Plane Type',
            planeTypes,
            planeNames,
            'left'
        );
        form.addField(planeMenu);

        // Duplicate checkbox
        var duplicateCheck = new Form.Field.Checkbox(
            'duplicate',
            'Duplicate first (preserve originals)',
            false
        );
        form.addField(duplicateCheck);

        // Show form and process
        form.show('Make Isometric Plane', 'Transform').then(function (result) {
            var planeType = result.values['planeType'];
            var shouldDuplicate = result.values['duplicate'];

            if (shouldDuplicate) {
                lib.duplicateAndMakePlane(canvas, graphics, planeType);
            } else {
                lib.makePlaneMulti(graphics, planeType);
            }
        });
    });

    action.validate = function (selection) {
        return selection.graphics.length > 0;
    };

    return action;
}();
_;
