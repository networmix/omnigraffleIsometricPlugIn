var _ = function() {
    var IsometricLib = new PlugIn.Library(new Version("0.7"));

    var COS_30 = Math.sqrt(3) / 2;
    var COS_30_INV = 2 / Math.sqrt(3);

    // Vertical shear transformation on points
    IsometricLib.skewY = function(points, deg, zeroOffset) {
        zeroOffset = zeroOffset || 0;
        var newPoints = [];
        var tanDeg = Math.tan(deg * Math.PI / 180);
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            newPoints.push(new Point(p.x, p.y + (p.x - zeroOffset) * tanDeg));
        }
        return newPoints;
    };

    IsometricLib.scaleX = function(size, factor) {
        return new Size(size.width * factor, size.height);
    };

    IsometricLib.scaleY = function(size, factor) {
        return new Size(size.width, size.height * factor);
    };

    // Recursively extract all non-Group graphics
    IsometricLib.getAllGraphics = function(graphic) {
        var result = [];
        if (graphic instanceof Group) {
            var queue = [].concat(graphic.graphics);
            while (queue.length) {
                var elt = queue.pop();
                if (elt instanceof Group) {
                    queue = queue.concat(elt.graphics);
                } else {
                    result.push(elt);
                }
            }
        } else {
            result.push(graphic);
        }
        return result;
    };

    // Apply vertical skew to all shapes in a graphic (skips Lines)
    IsometricLib.applySkewY = function(graphic, deg) {
        var graphics = this.getAllGraphics(graphic);
        var zeroOffset = graphic.geometry.minX;
        for (var i = 0; i < graphics.length; i++) {
            var g = graphics[i];
            if (typeof g.shape === 'undefined') continue;
            if (g.shape !== "Bezier") g.shape = "Bezier";
            if (g.shapeControlPoints) {
                g.shapeControlPoints = this.skewY(g.shapeControlPoints, deg, zeroOffset);
            }
        }
    };

    // Scale graphic's bounding box
    IsometricLib.applyScale = function(graphic, axis, factor) {
        var geom = graphic.geometry;
        geom.size = (axis === 'x')
            ? this.scaleX(geom.size, factor)
            : this.scaleY(geom.size, factor);
        graphic.geometry = geom;
    };

    // Transform shape into isometric plane
    IsometricLib.makePlane = function(graphic, planeType) {
        var skewAngle, rotation = 0;
        switch (planeType) {
            case 'left':     skewAngle = 30;  break;
            case 'right':    skewAngle = -30; break;
            case 'topLeft':  skewAngle = -30; rotation = 60;  break;
            case 'topRight': skewAngle = 30;  rotation = -60; break;
            default: throw new Error("Invalid plane type: " + planeType);
        }
        this.applyScale(graphic, 'x', COS_30);
        this.applySkewY(graphic, skewAngle);
        if (rotation) graphic.rotation = rotation;
    };

    // Process all selected graphics
    IsometricLib.processSelection = function(selection, fn) {
        for (var i = 0; i < selection.graphics.length; i++) {
            fn(selection.graphics[i]);
        }
    };

    // Create action with validation
    IsometricLib.createAction = function(actionFn) {
        var lib = this;
        var action = new PlugIn.Action(function(selection) {
            lib.processSelection(selection, function(graphic) {
                actionFn(graphic, lib);
            });
        });
        action.validate = function(selection) {
            return selection.graphics.length > 0;
        };
        return action;
    };

    IsometricLib.COS_30 = COS_30;
    IsometricLib.COS_30_INV = COS_30_INV;

    return IsometricLib;
}();
_;
