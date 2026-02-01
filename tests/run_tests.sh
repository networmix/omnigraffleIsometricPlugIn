#!/bin/bash
#
# Automated tests for OmniGraffle Isometric Plugin
# Runs via AppleScript/JavaScript in OmniGraffle
#

set -e

echo "=========================================="
echo "OmniGraffle Isometric Plugin Tests"
echo "=========================================="
echo ""

# Check if OmniGraffle is running
if ! pgrep -x "OmniGraffle" > /dev/null; then
    echo "Starting OmniGraffle..."
    open -a OmniGraffle
    sleep 3
fi

# Test 1: Plugin Loading
echo "Test 1: Plugin Loading..."
RESULT=$(osascript -e '
tell application "OmniGraffle"
    set jsCode to "
        var result = { test: \"Plugin Loading\", passed: false };
        try {
            var plugin = PlugIn.find(\"com.networmix.OmniGraffleIsometricPlugin\");
            if (plugin) {
                result.pluginFound = true;
                result.pluginId = plugin.identifier;
                result.version = plugin.version.versionString;

                var lib = plugin.library(\"IsometricLib\");
                if (lib) {
                    result.libraryFound = true;
                    result.libraryVersion = lib.version.versionString;
                    result.passed = true;
                } else {
                    result.error = \"Library IsometricLib not found\";
                }
            } else {
                result.error = \"Plugin not found\";
            }
        } catch(e) {
            result.error = e.message;
        }
        JSON.stringify(result, null, 2);
    "
    evaluate javascript jsCode
end tell
')
echo "$RESULT"
echo ""

# Test 2: Constants
echo "Test 2: Constants Verification..."
RESULT=$(osascript -e '
tell application "OmniGraffle"
    set jsCode to "
        var result = { test: \"Constants\", checks: {}, passed: false };
        try {
            var lib = PlugIn.find(\"com.networmix.OmniGraffleIsometricPlugin\").library(\"IsometricLib\");

            // Check COS_30 = sqrt(3)/2 ≈ 0.866
            result.checks.cos30Value = Math.abs(lib.COS_30 - Math.sqrt(3)/2) < 0.0001;
            result.values = { COS_30: lib.COS_30, expected: Math.sqrt(3)/2 };

            // Check SIN_30 = 0.5
            result.checks.sin30Value = lib.SIN_30 === 0.5;
            result.values.SIN_30 = lib.SIN_30;

            // Check makePlane function exists
            result.checks.makePlaneExists = typeof lib.makePlane === \"function\";

            result.passed = Object.keys(result.checks).every(function(k) { return result.checks[k]; });
        } catch(e) {
            result.error = e.message;
        }
        JSON.stringify(result, null, 2);
    "
    evaluate javascript jsCode
end tell
')
echo "$RESULT"
echo ""

# Test 3: Make Left Plane - Create a new document for testing
echo "Test 3: Make Left Plane..."
RESULT=$(osascript << 'APPLESCRIPT'
tell application "OmniGraffle"
    activate
    delay 0.5

    -- Create a new document for testing
    set newDoc to make new document with properties {name:"Isometric Test"}
    delay 1

    set jsCode to "
        var result = { test: 'Make Left Plane', checks: {}, passed: false };
        try {
            var lib = PlugIn.find('com.networmix.OmniGraffleIsometricPlugin').library('IsometricLib');
            var portfolio = document.portfolio;
            var canvas = portfolio.canvases[0];

            if (!canvas) {
                result.error = 'No canvas available';
            } else {
                var layer = canvas.layers[0];

                // Create a test rectangle at known position
                var rect = layer.addShape('Rectangle', new Rect(100, 100, 100, 50));
                rect.text = 'Test';

                // Store original properties
                var originalX = rect.geometry.x;
                var originalWidth = rect.geometry.width;

                // Apply left plane transformation
                lib.makePlane([rect], 'left');

                // Verify transformation
                // Left plane: Scale X by cos(30°), skew Y by +30°
                result.checks.convertedToBezier = rect.shape === 'Bezier';

                // Text should be rotated +30° for left plane
                result.checks.textRotation = rect.textRotation === 30;

                // Width should be scaled by cos(30°) ≈ 0.866
                var newWidth = rect.geometry.width;
                var expectedWidth = originalWidth * lib.COS_30;
                result.checks.widthScaled = Math.abs(newWidth - expectedWidth) < 5;

                result.passed = Object.keys(result.checks).every(function(k) { return result.checks[k]; });
                result.details = {
                    originalWidth: originalWidth,
                    newWidth: newWidth,
                    expectedWidth: expectedWidth,
                    textRotation: rect.textRotation
                };
            }
        } catch(e) {
            result.error = e.message;
            result.stack = e.stack;
        }
        JSON.stringify(result, null, 2);
    "
    set testResult to evaluate javascript jsCode
    return testResult
end tell
APPLESCRIPT
)
echo "$RESULT"
echo ""

# Test 4: Make Right Plane
echo "Test 4: Make Right Plane..."
RESULT=$(osascript << 'APPLESCRIPT'
tell application "OmniGraffle"
    set jsCode to "
        var result = { test: 'Make Right Plane', checks: {}, passed: false };
        try {
            var lib = PlugIn.find('com.networmix.OmniGraffleIsometricPlugin').library('IsometricLib');
            var portfolio = document.portfolio;
            var canvas = portfolio.canvases[0];

            if (!canvas) {
                result.error = 'No canvas available';
            } else {
                var layer = canvas.layers[0];

                // Create a test rectangle
                var rect = layer.addShape('Rectangle', new Rect(300, 100, 100, 50));
                rect.text = 'Right';

                var originalWidth = rect.geometry.width;

                // Apply right plane transformation
                lib.makePlane([rect], 'right');

                // Verify transformation
                result.checks.convertedToBezier = rect.shape === 'Bezier';

                // Text should be rotated -30° for right plane
                result.checks.textRotation = rect.textRotation === -30;

                // Width should be scaled by cos(30°)
                var newWidth = rect.geometry.width;
                var expectedWidth = originalWidth * lib.COS_30;
                result.checks.widthScaled = Math.abs(newWidth - expectedWidth) < 5;

                result.passed = Object.keys(result.checks).every(function(k) { return result.checks[k]; });
                result.details = {
                    textRotation: rect.textRotation,
                    widthScaled: newWidth / originalWidth
                };
            }
        } catch(e) {
            result.error = e.message;
            result.stack = e.stack;
        }
        JSON.stringify(result, null, 2);
    "
    evaluate javascript jsCode
end tell
APPLESCRIPT
)
echo "$RESULT"
echo ""

# Test 5: Make Top-Left Plane
echo "Test 5: Make Top-Left Plane..."
RESULT=$(osascript << 'APPLESCRIPT'
tell application "OmniGraffle"
    set jsCode to "
        var result = { test: 'Make Top-Left Plane', checks: {}, passed: false };
        try {
            var lib = PlugIn.find('com.networmix.OmniGraffleIsometricPlugin').library('IsometricLib');
            var portfolio = document.portfolio;
            var canvas = portfolio.canvases[0];

            if (!canvas) {
                result.error = 'No canvas available';
            } else {
                var layer = canvas.layers[0];

                // Create a test rectangle
                var rect = layer.addShape('Rectangle', new Rect(100, 250, 100, 100));
                rect.text = 'TopL';

                // Apply top-left plane transformation
                lib.makePlane([rect], 'topLeft');

                // Verify transformation
                result.checks.convertedToBezier = rect.shape === 'Bezier';

                // Text should be rotated +30° for top-left plane
                result.checks.textRotation = rect.textRotation === 30;

                // Shape should be transformed (isometric projection)
                result.checks.hasControlPoints = rect.shapeControlPoints && rect.shapeControlPoints.length > 0;

                result.passed = Object.keys(result.checks).every(function(k) { return result.checks[k]; });
                result.details = {
                    textRotation: rect.textRotation,
                    pointCount: rect.shapeControlPoints ? rect.shapeControlPoints.length : 0
                };
            }
        } catch(e) {
            result.error = e.message;
            result.stack = e.stack;
        }
        JSON.stringify(result, null, 2);
    "
    evaluate javascript jsCode
end tell
APPLESCRIPT
)
echo "$RESULT"
echo ""

# Test 6: Make Top-Right Plane
echo "Test 6: Make Top-Right Plane..."
RESULT=$(osascript << 'APPLESCRIPT'
tell application "OmniGraffle"
    set jsCode to "
        var result = { test: 'Make Top-Right Plane', checks: {}, passed: false };
        try {
            var lib = PlugIn.find('com.networmix.OmniGraffleIsometricPlugin').library('IsometricLib');
            var portfolio = document.portfolio;
            var canvas = portfolio.canvases[0];

            if (!canvas) {
                result.error = 'No canvas available';
            } else {
                var layer = canvas.layers[0];

                // Create a test rectangle
                var rect = layer.addShape('Rectangle', new Rect(300, 250, 100, 100));
                rect.text = 'TopR';

                // Apply top-right plane transformation
                lib.makePlane([rect], 'topRight');

                // Verify transformation
                result.checks.convertedToBezier = rect.shape === 'Bezier';

                // Text should be rotated -30° for top-right plane
                result.checks.textRotation = rect.textRotation === -30;

                // Shape should be transformed
                result.checks.hasControlPoints = rect.shapeControlPoints && rect.shapeControlPoints.length > 0;

                result.passed = Object.keys(result.checks).every(function(k) { return result.checks[k]; });
                result.details = {
                    textRotation: rect.textRotation,
                    pointCount: rect.shapeControlPoints ? rect.shapeControlPoints.length : 0
                };
            }
        } catch(e) {
            result.error = e.message;
            result.stack = e.stack;
        }
        JSON.stringify(result, null, 2);
    "
    evaluate javascript jsCode
end tell
APPLESCRIPT
)
echo "$RESULT"
echo ""

# Test 7: Line Transformation
echo "Test 7: Line Transformation..."
RESULT=$(osascript << 'APPLESCRIPT'
tell application "OmniGraffle"
    set jsCode to "
        var result = { test: 'Line Transformation', checks: {}, passed: false };
        try {
            var lib = PlugIn.find('com.networmix.OmniGraffleIsometricPlugin').library('IsometricLib');
            var portfolio = document.portfolio;
            var canvas = portfolio.canvases[0];

            if (!canvas) {
                result.error = 'No canvas available';
            } else {
                // Create a horizontal test line
                var line = canvas.addLine(new Point(500, 100), new Point(600, 100));

                // Store original points
                var originalStart = { x: line.points[0].x, y: line.points[0].y };
                var originalEnd = { x: line.points[1].x, y: line.points[1].y };
                var originalLength = originalEnd.x - originalStart.x;

                // Apply left plane transformation
                lib.makePlane([line], 'left');

                // Verify line was transformed
                var newStart = line.points[0];
                var newEnd = line.points[1];

                // Start point is at origin (leftmost), so x stays same, y stays same
                result.checks.startAtOrigin = newStart.x === originalStart.x && newStart.y === originalStart.y;

                // End point should be skewed (y changes due to +30° skew)
                result.checks.endYChanged = newEnd.y !== originalEnd.y;

                // Horizontal distance should be scaled by cos(30°)
                var newHorizontalDist = newEnd.x - newStart.x;
                var expectedDist = originalLength * lib.COS_30;
                result.checks.xScaled = Math.abs(newHorizontalDist - expectedDist) < 0.01;

                // End point Y should increase (positive skew for left plane)
                result.checks.endYIncreased = newEnd.y > originalEnd.y;

                result.passed = Object.keys(result.checks).every(function(k) { return result.checks[k]; });
                result.details = {
                    original: { start: originalStart, end: originalEnd },
                    transformed: { start: { x: newStart.x, y: newStart.y }, end: { x: newEnd.x, y: newEnd.y } },
                    horizontalScaling: newHorizontalDist / originalLength
                };
            }
        } catch(e) {
            result.error = e.message;
            result.stack = e.stack;
        }
        JSON.stringify(result, null, 2);
    "
    evaluate javascript jsCode
end tell
APPLESCRIPT
)
echo "$RESULT"
echo ""

# Test 8: Multiple Objects with Shared Origin
echo "Test 8: Multiple Objects (Shared Origin)..."
RESULT=$(osascript << 'APPLESCRIPT'
tell application "OmniGraffle"
    set jsCode to "
        var result = { test: 'Multiple Objects', checks: {}, passed: false };
        try {
            var lib = PlugIn.find('com.networmix.OmniGraffleIsometricPlugin').library('IsometricLib');
            var portfolio = document.portfolio;
            var canvas = portfolio.canvases[0];

            if (!canvas) {
                result.error = 'No canvas available';
            } else {
                var layer = canvas.layers[0];

                // Create two rectangles side by side
                var rect1 = layer.addShape('Rectangle', new Rect(100, 450, 50, 50));
                var rect2 = layer.addShape('Rectangle', new Rect(160, 450, 50, 50));

                // Store original gap between rectangles
                var originalGap = rect2.geometry.x - (rect1.geometry.x + rect1.geometry.width);

                // Transform both together
                lib.makePlane([rect1, rect2], 'left');

                // Both should be converted to Bezier
                result.checks.rect1Bezier = rect1.shape === 'Bezier';
                result.checks.rect2Bezier = rect2.shape === 'Bezier';

                // Check that relative positions are preserved (scaled gap)
                var newGap = rect2.geometry.x - (rect1.geometry.x + rect1.geometry.width);
                var expectedGap = originalGap * lib.COS_30;
                result.checks.gapPreserved = Math.abs(newGap - expectedGap) < 5;

                result.passed = Object.keys(result.checks).every(function(k) { return result.checks[k]; });
                result.details = {
                    originalGap: originalGap,
                    newGap: newGap,
                    expectedGap: expectedGap
                };
            }
        } catch(e) {
            result.error = e.message;
            result.stack = e.stack;
        }
        JSON.stringify(result, null, 2);
    "
    evaluate javascript jsCode
end tell
APPLESCRIPT
)
echo "$RESULT"
echo ""

# Test 9: Empty Selection Handling
echo "Test 9: Empty Selection Handling..."
RESULT=$(osascript -e '
tell application "OmniGraffle"
    set jsCode to "
        var result = { test: \"Empty Selection\", checks: {}, passed: false };
        try {
            var lib = PlugIn.find(\"com.networmix.OmniGraffleIsometricPlugin\").library(\"IsometricLib\");

            // Empty array should not throw
            lib.makePlane([], \"left\");
            result.checks.emptyArrayOK = true;

            // Null should not throw
            lib.makePlane(null, \"left\");
            result.checks.nullOK = true;

            result.passed = Object.keys(result.checks).every(function(k) { return result.checks[k]; });
        } catch(e) {
            result.error = e.message;
        }
        JSON.stringify(result, null, 2);
    "
    evaluate javascript jsCode
end tell
')
echo "$RESULT"
echo ""

# Test 10: Invalid Plane Type
echo "Test 10: Invalid Plane Type Handling..."
RESULT=$(osascript << 'APPLESCRIPT'
tell application "OmniGraffle"
    set jsCode to "
        var result = { test: 'Invalid Plane Type', checks: {}, passed: false };
        try {
            var lib = PlugIn.find('com.networmix.OmniGraffleIsometricPlugin').library('IsometricLib');
            var portfolio = document.portfolio;
            var canvas = portfolio.canvases[0];

            if (!canvas) {
                result.error = 'No canvas available';
            } else {
                var layer = canvas.layers[0];
                var rect = layer.addShape('Rectangle', new Rect(500, 450, 50, 50));

                // Try invalid plane type
                var errorThrown = false;
                try {
                    lib.makePlane([rect], 'invalid');
                } catch(e) {
                    errorThrown = true;
                    result.checks.errorMessage = e.message.indexOf('Invalid plane type') >= 0;
                }

                result.checks.throwsError = errorThrown;
                result.passed = result.checks.throwsError && result.checks.errorMessage;
            }
        } catch(e) {
            result.error = e.message;
        }
        JSON.stringify(result, null, 2);
    "
    evaluate javascript jsCode
end tell
APPLESCRIPT
)
echo "$RESULT"
echo ""

# Test 11: Shape Without Text
echo "Test 11: Shape Without Text..."
RESULT=$(osascript << 'APPLESCRIPT'
tell application "OmniGraffle"
    set jsCode to "
        var result = { test: 'Shape Without Text', checks: {}, passed: false };
        try {
            var lib = PlugIn.find('com.networmix.OmniGraffleIsometricPlugin').library('IsometricLib');
            var portfolio = document.portfolio;
            var canvas = portfolio.canvases[0];

            if (!canvas) {
                result.error = 'No canvas available';
            } else {
                var layer = canvas.layers[0];

                // Create shape without text
                var rect = layer.addShape('Rectangle', new Rect(600, 100, 50, 50));
                // Don't set text

                var originalRotation = rect.textRotation || 0;

                // Transform
                lib.makePlane([rect], 'left');

                // Shape should be transformed
                result.checks.convertedToBezier = rect.shape === 'Bezier';

                // Text rotation should not be modified for empty text
                result.checks.noTextRotationChange = (rect.textRotation || 0) === originalRotation;

                result.passed = Object.keys(result.checks).every(function(k) { return result.checks[k]; });
            }
        } catch(e) {
            result.error = e.message;
            result.stack = e.stack;
        }
        JSON.stringify(result, null, 2);
    "
    evaluate javascript jsCode
end tell
APPLESCRIPT
)
echo "$RESULT"
echo ""

# Test 12: Isometric Cube Assembly (Integration Test)
echo "Test 12: Isometric Cube Assembly (Integration)..."
RESULT=$(osascript << 'APPLESCRIPT'
tell application "OmniGraffle"
    set jsCode to "
        var result = { test: 'Isometric Cube Assembly', checks: {}, passed: false };
        try {
            var lib = PlugIn.find('com.networmix.OmniGraffleIsometricPlugin').library('IsometricLib');
            var portfolio = document.portfolio;
            var canvas = portfolio.canvases[0];

            if (!canvas) {
                result.error = 'No canvas available';
            } else {
                var layer = canvas.layers[0];
                var size = 60;

                // Create three squares for cube faces
                var leftFace = layer.addShape('Rectangle', new Rect(100, 550, size, size));
                leftFace.fillColor = Color.RGB(0.8, 0.2, 0.2, 1); // Red

                var rightFace = layer.addShape('Rectangle', new Rect(200, 550, size, size));
                rightFace.fillColor = Color.RGB(0.2, 0.8, 0.2, 1); // Green

                var topFace = layer.addShape('Rectangle', new Rect(300, 550, size, size));
                topFace.fillColor = Color.RGB(0.2, 0.2, 0.8, 1); // Blue

                // Transform each face
                lib.makePlane([leftFace], 'left');
                lib.makePlane([rightFace], 'right');
                lib.makePlane([topFace], 'topRight');

                // Verify all were transformed
                result.checks.leftFaceBezier = leftFace.shape === 'Bezier';
                result.checks.rightFaceBezier = rightFace.shape === 'Bezier';
                result.checks.topFaceBezier = topFace.shape === 'Bezier';

                // Verify they have control points
                result.checks.leftFacePoints = leftFace.shapeControlPoints.length > 0;
                result.checks.rightFacePoints = rightFace.shapeControlPoints.length > 0;
                result.checks.topFacePoints = topFace.shapeControlPoints.length > 0;

                result.passed = Object.keys(result.checks).every(function(k) { return result.checks[k]; });
                result.details = {
                    leftPointCount: leftFace.shapeControlPoints.length,
                    rightPointCount: rightFace.shapeControlPoints.length,
                    topPointCount: topFace.shapeControlPoints.length
                };
            }
        } catch(e) {
            result.error = e.message;
            result.stack = e.stack;
        }
        JSON.stringify(result, null, 2);
    "
    evaluate javascript jsCode
end tell
APPLESCRIPT
)
echo "$RESULT"
echo ""

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo "All tests completed. Review output above for PASSED/FAILED status."
echo ""
echo "NOTE: Undo behavior cannot be tested via osascript."
echo "To verify undo works correctly:"
echo "  1. Open OmniGraffle manually"
echo "  2. Select shapes and run transformations from Automation menu"
echo "  3. Press Cmd+Z to verify undo restores original state"
echo ""
