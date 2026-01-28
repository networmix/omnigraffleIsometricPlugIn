var _ = function () {
    var IsometricLib = new PlugIn.Library(new Version("0.9"));

    var COS_30 = Math.sqrt(3) / 2;
    var COS_30_INV = 2 / Math.sqrt(3);

    // Vertical shear transformation on points
    IsometricLib.skewY = function (points, deg, zeroOffset) {
        zeroOffset = zeroOffset || 0;
        var newPoints = [];
        var tanDeg = Math.tan(deg * Math.PI / 180);
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            newPoints.push(new Point(p.x, p.y + (p.x - zeroOffset) * tanDeg));
        }
        return newPoints;
    };

    IsometricLib.scaleX = function (size, factor) {
        return new Size(size.width * factor, size.height);
    };

    IsometricLib.scaleY = function (size, factor) {
        return new Size(size.width, size.height * factor);
    };

    // Recursively extract all non-Group graphics
    IsometricLib.getAllGraphics = function (graphic) {
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

    // Apply vertical skew to all graphics (shapes and lines)
    // Optional zeroOffset parameter for multi-select alignment
    IsometricLib.applySkewY = function (graphic, deg, zeroOffset) {
        var graphics = this.getAllGraphics(graphic);
        if (zeroOffset === undefined) {
            zeroOffset = graphic.geometry.minX;
        }
        for (var i = 0; i < graphics.length; i++) {
            var g = graphics[i];
            // Handle Lines
            if (g instanceof Line) {
                g.points = this.skewY(g.points, deg, zeroOffset);
                continue;
            }
            // Handle Shapes
            if (typeof g.shape === 'undefined') continue;
            if (g.shape !== "Bezier") g.shape = "Bezier";
            if (g.shapeControlPoints) {
                g.shapeControlPoints = this.skewY(g.shapeControlPoints, deg, zeroOffset);
            }
        }
    };

    // Scale graphic's bounding box
    IsometricLib.applyScale = function (graphic, axis, factor) {
        var geom = graphic.geometry;
        geom.size = (axis === 'x')
            ? this.scaleX(geom.size, factor)
            : this.scaleY(geom.size, factor);
        graphic.geometry = geom;
    };

    // Transform shape into isometric plane
    // Optional zeroOffset parameter for multi-select alignment
    IsometricLib.makePlane = function (graphic, planeType, zeroOffset) {
        var skewAngle, rotation = 0;
        switch (planeType) {
            case 'left': skewAngle = 30; break;
            case 'right': skewAngle = -30; break;
            case 'topLeft': skewAngle = -30; rotation = 60; break;
            case 'topRight': skewAngle = 30; rotation = -60; break;
            default: throw new Error("Invalid plane type: " + planeType);
        }
        this.applyScale(graphic, 'x', COS_30);
        this.applySkewY(graphic, skewAngle, zeroOffset);
        if (rotation) graphic.rotation = graphic.rotation + rotation;
    };

    // Compute combined bounding box minX for multiple graphics
    IsometricLib.getSharedMinX = function (graphics) {
        var minX = Infinity;
        for (var i = 0; i < graphics.length; i++) {
            var gMinX = graphics[i].geometry.minX;
            if (gMinX < minX) minX = gMinX;
        }
        return minX;
    };

    // Apply skew to multiple graphics as a unit (shared zeroOffset)
    IsometricLib.applySkewYMulti = function (graphics, deg) {
        var sharedMinX = this.getSharedMinX(graphics);
        for (var i = 0; i < graphics.length; i++) {
            this.applySkewY(graphics[i], deg, sharedMinX);
        }
    };

    // Transform multiple graphics as a unit (shared zeroOffset)
    IsometricLib.makePlaneMulti = function (graphics, planeType) {
        var sharedMinX = this.getSharedMinX(graphics);
        for (var i = 0; i < graphics.length; i++) {
            this.makePlane(graphics[i], planeType, sharedMinX);
        }
    };

    // Duplicate graphics on canvas and return the duplicates
    IsometricLib.duplicateGraphics = function (canvas, graphics) {
        return canvas.duplicate(graphics);
    };

    // Duplicate and transform multiple graphics
    IsometricLib.duplicateAndMakePlane = function (canvas, graphics, planeType) {
        var duplicates = this.duplicateGraphics(canvas, graphics);
        this.makePlaneMulti(duplicates, planeType);
        return duplicates;
    };

    IsometricLib.COS_30 = COS_30;
    IsometricLib.COS_30_INV = COS_30_INV;

    return IsometricLib;
}();
_;
