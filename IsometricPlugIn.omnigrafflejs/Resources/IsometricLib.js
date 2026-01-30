var _ = function () {
    var IsometricLib = new PlugIn.Library(new Version("1.2"));

    // Constants
    var COS_30 = Math.sqrt(3) / 2;  // ≈ 0.866
    var SIN_30 = 0.5;

    // Get all leaf graphics from a list of graphics (flattens nested groups)
    function getAllLeafGraphics(graphics) {
        var result = [];
        var queue = graphics.slice();
        while (queue.length) {
            var g = queue.pop();
            if (g instanceof Group) {
                queue = queue.concat(g.graphics);
            } else {
                result.push(g);
            }
        }
        return result;
    }

    // Calculate combined bounding box for multiple graphics
    function getCombinedBounds(graphics) {
        if (graphics.length === 0) return null;

        var minX = Infinity, minY = Infinity;
        var maxX = -Infinity, maxY = -Infinity;

        for (var i = 0; i < graphics.length; i++) {
            var geom = graphics[i].geometry;
            minX = Math.min(minX, geom.minX);
            minY = Math.min(minY, geom.minY);
            maxX = Math.max(maxX, geom.maxX);
            maxY = Math.max(maxY, geom.maxY);
        }

        return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
    }

    // Transform points for LEFT plane (vertical wall facing left)
    // Scale X by cos(30°), then skew Y by +30°
    function transformPointsLeft(points, originX) {
        var result = [];
        var tanAngle = Math.tan(30 * Math.PI / 180);
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            var scaledX = originX + (p.x - originX) * COS_30;
            var skewedY = p.y + (scaledX - originX) * tanAngle;
            result.push(new Point(scaledX, skewedY));
        }
        return result;
    }

    // Transform points for RIGHT plane (vertical wall facing right)
    // Scale X by cos(30°), then skew Y by -30°
    function transformPointsRight(points, originX) {
        var result = [];
        var tanAngle = Math.tan(-30 * Math.PI / 180);
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            var scaledX = originX + (p.x - originX) * COS_30;
            var skewedY = p.y + (scaledX - originX) * tanAngle;
            result.push(new Point(scaledX, skewedY));
        }
        return result;
    }

    // Transform points for TOP-LEFT plane (horizontal surface, left side closer)
    // Uses isometric projection matrix for top view
    function transformPointsTopLeft(points, originX, originY) {
        var result = [];
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            var dx = p.x - originX;
            var dy = originY - p.y;  // Flip Y so "up" is positive

            // Isometric projection for top face (left-facing)
            var newX = originX + (dx + dy) * COS_30;
            var newY = originY - (dy - dx) * SIN_30;

            result.push(new Point(newX, newY));
        }
        return result;
    }

    // Transform points for TOP-RIGHT plane (horizontal surface, right side closer)
    // Uses isometric projection matrix for top view (mirrored)
    function transformPointsTopRight(points, originX, originY) {
        var result = [];
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            var dx = p.x - originX;
            var dy = originY - p.y;  // Flip Y so "up" is positive

            // Isometric projection for top face (right-facing) - mirror of topLeft
            var newX = originX + (dx - dy) * COS_30;
            var newY = originY - (dy + dx) * SIN_30;

            result.push(new Point(newX, newY));
        }
        return result;
    }

    // Transform a single graphic based on plane type
    function transformGraphic(graphic, planeType, bounds) {
        var originX = bounds.minX;
        var originY = bounds.maxY;  // Bottom of bounding box for top planes

        // Handle text rotation to align with front edge of isometric projection
        // left: vertical wall, skewed +30°, text +30°
        // right: vertical wall, skewed -30°, text -30°
        // topLeft: front edge rises to right at +30°, text +30°
        // topRight: front edge falls to right at -30°, text -30°
        if (graphic.text && graphic.text.length > 0) {
            if (planeType === 'left' || planeType === 'topLeft') {
                graphic.textRotation = (graphic.textRotation || 0) + 30;
            } else {
                graphic.textRotation = (graphic.textRotation || 0) - 30;
            }
        }

        // Handle shapes
        if (typeof graphic.shape !== 'undefined') {
            if (graphic.shape !== "Bezier") {
                graphic.shape = "Bezier";
            }

            if (graphic.shapeControlPoints) {
                var points = graphic.shapeControlPoints;

                if (planeType === 'left') {
                    points = transformPointsLeft(points, originX);
                } else if (planeType === 'right') {
                    points = transformPointsRight(points, originX);
                } else if (planeType === 'topLeft') {
                    points = transformPointsTopLeft(points, originX, originY);
                } else if (planeType === 'topRight') {
                    points = transformPointsTopRight(points, originX, originY);
                }

                graphic.shapeControlPoints = points;
            }
        }

        // Handle lines
        if (graphic instanceof Line) {
            var points = graphic.points;

            if (planeType === 'left') {
                points = transformPointsLeft(points, originX);
            } else if (planeType === 'right') {
                points = transformPointsRight(points, originX);
            } else if (planeType === 'topLeft') {
                points = transformPointsTopLeft(points, originX, originY);
            } else if (planeType === 'topRight') {
                points = transformPointsTopRight(points, originX, originY);
            }

            graphic.points = points;
        }
    }

    /**
     * Transform graphics to an isometric plane.
     * Transforms each graphic individually to ensure proper undo behavior.
     *
     * @param {Array} graphics - Array of graphics to transform
     * @param {string} planeType - 'left', 'right', 'topLeft', or 'topRight'
     */
    IsometricLib.makePlane = function (graphics, planeType) {
        if (!graphics || graphics.length === 0) {
            return;
        }

        var validTypes = ['left', 'right', 'topLeft', 'topRight'];
        if (validTypes.indexOf(planeType) === -1) {
            throw new Error("Invalid plane type: " + planeType);
        }

        // Get all leaf graphics (flatten any groups in the selection)
        var leaves = getAllLeafGraphics(graphics);
        if (leaves.length === 0) {
            return;
        }

        // Calculate combined bounding box for all graphics
        var bounds = getCombinedBounds(leaves);

        // Transform each leaf graphic individually
        for (var i = 0; i < leaves.length; i++) {
            transformGraphic(leaves[i], planeType, bounds);
        }
    };

    // Export constants for reference
    IsometricLib.COS_30 = COS_30;
    IsometricLib.SIN_30 = SIN_30;

    return IsometricLib;
}();
_;
