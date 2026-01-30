# OmniGraffle Automation API Reference

Complete reference for OmniGraffle's Omni Automation JavaScript API.

## Geometry Classes

### Point

Represents a 2D coordinate on the canvas.

```javascript
// Constructor
var p = new Point(x, y);

// Static properties
Point.zero      // Point(0, 0)
Point.unitX     // Point(1, 0)
Point.unitY     // Point(0, 1)

// Instance properties
p.x             // Number: horizontal coordinate
p.y             // Number: vertical coordinate
p.length        // Number: distance from origin (read-only)
p.negative      // Point: component-wise negative (read-only)
p.normalized    // Point: unit vector in same direction (read-only)

// Instance methods
p.add(point)        // Returns new Point with components added
p.subtract(point)   // Returns new Point with components subtracted
p.scale(factor)     // Returns new Point with components multiplied
p.distanceTo(point) // Returns Number: distance between points
p.dot(point)        // Returns Number: dot product
```

### Size

Represents dimensions.

```javascript
// Constructor
var s = new Size(width, height);

// Instance properties
s.width     // Number: horizontal dimension
s.height    // Number: vertical dimension
```

**Note**: Modifying a Size and reassigning it to a graphic's geometry requires explicitly setting the geometry property back.

### Rect

Represents a bounding rectangle.

```javascript
// Constructor
var r = new Rect(x, y, width, height);

// Position properties
r.origin    // Point: top-left corner
r.x         // Number: left edge x-coordinate
r.y         // Number: top edge y-coordinate
r.center    // Point: center point (read-only)

// Dimension properties
r.size      // Size: width and height
r.width     // Number: horizontal dimension
r.height    // Number: vertical dimension

// Edge properties (read-only)
r.minX      // Number: leftmost x
r.maxX      // Number: rightmost x
r.minY      // Number: topmost y
r.maxY      // Number: bottommost y
r.midX      // Number: horizontal center
r.midY      // Number: vertical center

// State properties (read-only)
r.standardized  // Rect: with positive width/height
r.integral      // Rect: with integer values
r.isEmpty       // Boolean
r.isInfinite    // Boolean
r.isNull        // Boolean

// Methods
r.union(rect)              // Returns Rect: bounding box of both
r.intersect(rect)          // Returns Rect: overlapping area
r.containsRect(rect)       // Returns Boolean
r.containsPoint(point)     // Returns Boolean
r.intersects(rect)         // Returns Boolean
r.insetBy(dx, dy)          // Returns Rect: shrunk by amounts
r.offsetBy(dx, dy)         // Returns Rect: shifted by amounts
```

## Graphics Classes

### Graphic (Abstract Base)

Base class for all visual elements. Cannot be instantiated directly.

```javascript
// Geometry
g.geometry          // Rect: bounding box
g.rotation          // Number: rotation in degrees

// Appearance
g.strokeColor       // Color
g.strokeThickness   // Number: points
g.strokeType        // StrokeType enum
g.strokeCap         // LineCap enum
g.strokeJoin        // LineJoin enum
g.strokePattern     // StrokeDash enum

// State
g.locked            // Boolean
g.name              // String or null

// Hierarchy
g.layer             // Layer containing this graphic
g.connectedLines    // Array of connected Line objects

// Flip
g.flippedHorizontally   // Boolean
g.flippedVertically     // Boolean

// Methods
g.remove()                          // Delete from canvas
g.orderAbove(graphic)               // Move above another graphic
g.orderBelow(graphic)               // Move below another graphic
g.duplicateTo(point, canvas)        // Copy to location, returns new graphic
g.duplicateReferenceTo(point, canvas)  // Copy as reference
g.setUserData(key, value)           // Store custom data
```

### Solid extends Graphic

Graphics with fill, image, and text capabilities.

```javascript
// Fill
s.fillType      // FillType enum
s.fillColor     // Color
s.gradientColor // Color (for gradient fills)

// Image
s.image             // ImageReference or null
s.imageOffset       // Point (percent values, 1 = 100%)
s.imageOpacity      // Number: 0-1
s.imagePage         // Number: page for multi-page formats
s.imageSizing       // ImageSizing enum (Manual=0, Stretched=1, Tiled=2)

// Text
s.text              // String
s.textColor         // Color
s.fontName          // String: PostScript font name
s.textSize          // Number: font size
s.textRotation      // Number: degrees
s.autosizing        // TextAutosizing enum
s.textHorizontalAlignment   // HorizontalTextAlignment enum
s.textVerticalPlacement     // VerticalTextPlacement enum
s.textHorizontalPadding     // Number
s.textVerticalPadding       // Number

// Corner
s.cornerRadius      // Number

// Magnets (connection points)
s.magnets           // Array of Point (normalized -1 to 1)
```

### Shape extends Solid

Geometric shapes with customizable geometry.

```javascript
// Shape type
sh.shape            // String: shape name ("Rectangle", "Circle", "Bezier", etc.)

// Bezier control
sh.shapeVertices        // Array of Point (vertices, read-only for non-Bezier)
sh.shapeControlPoints   // Array of Point (all control points including curves)
```

**Critical**: To modify `shapeControlPoints`, first set `shape = "Bezier"`. This converts the shape to a bezier path and allows point manipulation. This conversion is irreversible.

**Built-in shapes**: Rectangle, Circle, Diamond, Horizontal Cylinder, Vertical Cylinder, Parallelogram, Cloud, Plus, Star, Pentagon, Hexagon, Octagon, Arrow, DoubleArrow, AdjustableArrow, and many more.

### Line extends Graphic

Connectors between graphics or points.

```javascript
// Points
l.points            // Array of Point: line vertices
l.bezierPoints      // Array of Point: bezier control points

// Line style
l.lineType          // LineType enum (Straight, Curved, Orthogonal, Bezier)

// Endpoints
l.head              // Graphic or null (connected graphic at head)
l.tail              // Graphic or null (connected graphic at tail)
l.headType          // LineEndpointType enum
l.tailType          // LineEndpointType enum
l.headScale         // Number
l.tailScale         // Number
l.headMagnet        // Number: magnet index or -1
l.tailMagnet        // Number: magnet index or -1

// Hop behavior (line crossings)
l.hopType           // HopType enum
```

**LineType enum**: Straight, Curved, Orthogonal, Bezier

**LineEndpointType enum**: None, FilledArrow, Arrow, FilledCircle, Circle, FilledSquare, Square, FilledDiamond, Diamond, and many more.

### Group extends Graphic

Container for multiple graphics.

```javascript
// Constructor
var group = new Group(graphicsArray);  // Create group from array of graphics

// Children
g.graphics      // Array of child Graphic objects

// Methods
g.ungroup()     // Dissolve group, returns array of former children
```

**Note**: Groups can be nested. Use recursive iteration to access all leaf graphics.

**Important behaviors**:
- `new Group(graphics)` removes graphics from canvas and adds them to the group
- `ungroup()` returns graphics to canvas preserving z-order
- Scaling a group's geometry scales all children proportionally (preserves relative positions)

### Subgraph extends Group

Collapsible container.

```javascript
sg.collapsed    // Boolean: whether subgraph is collapsed
sg.shape        // String: shape when collapsed
```

### Table extends Group

Grid-based container.

```javascript
t.columns       // Number of columns
t.rows          // Number of rows
t.graphicAt(row, column)    // Returns Graphic at cell
```

## Canvas Class

The drawing surface containing graphics.

```javascript
// Graphics
c.graphics              // Array of all Graphic objects
c.layers                // Array of Layer objects
c.background            // Graphic: canvas background

// Dimensions
c.size                  // Size: canvas dimensions
c.grid                  // Grid object

// Autosizing
c.autosizesDown         // Boolean
c.autosizesLeft         // Boolean
c.autosizesRight        // Boolean
c.autosizesUp           // Boolean
c.canvasSizingMode      // CanvasSizingMode enum

// Creation methods
c.addShape(shapeName, rect)     // Returns Shape
c.newShape()                     // Returns zero-sized Rectangle
c.addLine(startPoint, endPoint) // Returns Line
c.newLine()                      // Returns zero-length Line
c.addText(string, point)        // Returns Shape with text, no stroke

// Duplication
c.duplicate(graphics)           // Returns Array of new graphics

// Finding
c.graphicWithId(id)             // Returns Graphic or null
c.graphicWithName(name)         // Returns first match or null
c.allGraphicsWithUserDataForKey(key, value)  // Returns Array

// Layout
c.layout()                      // Auto-layout all graphics
c.layoutGraphics(graphics)      // Auto-layout specific graphics

// Connections
c.connect(graphic1, graphic2)   // Create line between graphics

// Combining
c.combine(graphics)             // Combine into single shape
```

## Color Class

Color representation with multiple color spaces.

```javascript
// Constructors
Color.RGB(r, g, b, a)       // Red, Green, Blue, Alpha (0-1)
Color.HSB(h, s, b, a)       // Hue, Saturation, Brightness, Alpha (0-1)
Color.White(w, a)           // Grayscale (0=black, 1=white), Alpha

// Preset colors
Color.black, Color.white, Color.red, Color.blue, Color.green
Color.yellow, Color.orange, Color.purple, Color.brown, Color.cyan
Color.magenta, Color.gray, Color.darkGray, Color.clear

// Instance properties (read-only)
c.red, c.green, c.blue      // RGB components (0-1)
c.hue, c.saturation, c.brightness   // HSB components
c.white                     // Grayscale value
c.alpha                     // Transparency (0=transparent, 1=opaque)
c.colorSpace                // ColorSpace enum
c.hex                       // String: 6-character hex (RGB only)

// Methods
c.blend(otherColor, fraction)   // Returns blended Color
```

## Document and Application

### GraffleDocument

```javascript
doc.portfolio       // Portfolio: document structure
doc.windows         // Array of Window objects
doc.name            // String: document name
```

### Application

```javascript
app.documents               // Array of Document objects
app.version                 // Version object
app.buildVersion            // Version object
app.platformName            // String
```

## Selection Object

Passed to action handlers.

```javascript
selection.graphics      // Array of selected Graphic objects
selection.canvas        // Canvas: current canvas
selection.document      // Document: current document
selection.view          // GraphicView: current view
```

## Enumerations

### FillType
Solid, Linear Gradient, Radial Gradient, Double Linear Gradient, Double Radial Gradient, Stipple, Squiggle, Plastic, Marker

### StrokeType
Single, Double, Freehand, Plastic, Inner, Outer

### LineCap
Butt, Round, Square

### LineJoin
Miter, Round, Bevel

### HorizontalTextAlignment
Left, Center, Right, Justify

### VerticalTextPlacement
Top, Middle, Bottom

### TextAutosizing
Overflow, Full, Vertical, Clip

## Plugin Infrastructure

### PlugIn.Library

```javascript
var lib = new PlugIn.Library(new Version("1.0"));
lib.name        // String: library identifier
lib.plugIn      // PlugIn: parent plugin
lib.version     // Version object
```

### PlugIn.Action

```javascript
var action = new PlugIn.Action(function(selection) {
    // Action implementation
});

action.validate = function(selection) {
    // Return true if action should be enabled
    return selection.graphics.length > 0;
};
```

### Form

```javascript
var form = new Form();

// Field types
new Form.Field.Option(key, label, values, names, defaultValue)
new Form.Field.Checkbox(key, label, defaultValue)
new Form.Field.String(key, label, defaultValue)
new Form.Field.Date(key, label, defaultValue)

form.addField(field);

form.show(title, confirmLabel).then(function(result) {
    var value = result.values[key];
});
```

### Version

```javascript
new Version("1.0")
new Version("1.2.3")
v.versionString     // String representation
v.equals(other)     // Boolean comparison
v.atLeast(other)    // Boolean: >= comparison
v.isAfter(other)    // Boolean: > comparison
v.isBefore(other)   // Boolean: < comparison
```

## Portfolio Class

Manages canvases within a document.

```javascript
var portfolio = document.portfolio;

// Properties
portfolio.canvases      // Array of Canvas objects (read-only, use index access)

// Methods
portfolio.addCanvas()   // Create new canvas, returns Canvas
```

**Note**: `portfolio.canvases` is read-only. Use index access in loops:
```javascript
for (var i = 0; i < portfolio.canvases.length; i++) {
    var canvas = portfolio.canvases[i];
}
```

## Layer Class

Layers organize graphics within a canvas.

```javascript
// Access layers
var layers = canvas.layers;
var defaultLayer = canvas.layers[0];

// Properties
layer.name              // String: layer name
layer.locked            // Boolean: layer is locked
layer.visible           // Boolean: layer is visible
layer.prints            // Boolean: layer prints

// Methods
layer.addShape(shapeName, rect)     // Returns Shape (rect is REQUIRED)
layer.newShape()                    // Returns zero-sized Rectangle
layer.orderAbove(otherLayer)        // Reorder layer
layer.orderBelow(otherLayer)        // Reorder layer
layer.remove()                      // Delete layer
```

**Important**: Unlike `canvas.addShape()`, `layer.addShape()` requires the rect parameter. Use `canvas.addLine()` for lines (layers don't have `addLine`).

## Error Handling

```javascript
try {
    // Risky operation
} catch (error) {
    console.log("Error: " + error.message);
    console.log("Stack: " + error.stack);
}
```

Errors are thrown for:
- Invalid shape names
- Accessing properties on null objects
- Permission errors
- Invalid parameter types

## Quirks and Gotchas

### Rotation Normalization
OmniGraffle normalizes rotation values to 0-360 range:
- `-60°` becomes `300°`
- Check with: `Math.abs(rotation - 360 - expectedNegative) < 1`

### Z-Order and Overlapping Fills
`ungroup()` preserves z-order. If shapes appear hidden after ungrouping, check for overlapping fills (e.g., white shapes covering each other). Use `orderAbove()`/`orderBelow()` to adjust if needed:
```javascript
graphic.orderBelow(otherGraphic);  // Move graphic behind other
graphic.orderAbove(otherGraphic);  // Move graphic in front
```

### Geometry Modification Pattern
Always reassign geometry after modification:
```javascript
var geom = graphic.geometry;
geom.size = new Size(newWidth, newHeight);
graphic.geometry = geom;  // Must reassign!
```

### Text Rotation is Additive
When transforming shapes with text, add to existing rotation:
```javascript
graphic.textRotation = (graphic.textRotation || 0) + additionalRotation;
```

### Text Rotation Direction
OmniGraffle uses standard mathematical rotation direction:
- **Positive rotation (+30°)** = Counter-clockwise (top of text moves left, baseline tilts up-right)
- **Negative rotation (-30°)** = Clockwise (top of text moves right, baseline tilts down-right)

To align text with an edge:
- Edge going **up-right** (ascending slope): use **positive** rotation (+30°)
- Edge going **down-right** (descending slope): use **negative** rotation (-30°)

### Canvas Coordinates
Graphics can have negative coordinates (above/left of canvas origin). Use `scope all graphics` when exporting to capture everything.

### Temporary Grouping Breaks Undo
Using `new Group(graphics)` + geometry scaling + `ungroup()` corrupts the undo stack. After undo, height dimensions are wrong while width is correct. This is a known OmniGraffle bug.

**Workaround**: Transform each graphic individually using a shared origin instead of temporary grouping:
```javascript
// Calculate shared bounds, then transform each graphic individually
var bounds = getCombinedBounds(graphics);
for (var i = 0; i < graphics.length; i++) {
    transformGraphic(graphics[i], bounds.minX);  // Use shared origin
}
```

### Undo Granularity
Each `evaluate javascript` call is one atomic undo step. All operations within a single plugin action undo together. There is no `beginUndo()`/`endUndo()` API for custom undo grouping.

### Graphics Don't Have duplicate() Method
Individual graphics don't have a `duplicate()` method. Use `canvas.duplicate()` instead:
```javascript
// WRONG: var copy = graphic.duplicate();
// RIGHT:
var copies = canvas.duplicate([graphic]);  // Returns array
var copy = copies[0];
```

Or use `duplicateTo()` to copy to a specific location:
```javascript
var copy = graphic.duplicateTo(new Point(x, y), targetCanvas);
```

### Layer.addShape() vs Canvas.addShape()
- `canvas.addShape(shapeName, rect)` - rect is optional (creates zero-sized shape if omitted)
- `layer.addShape(shapeName, rect)` - rect is **required**

```javascript
// Canvas - both work
canvas.addShape("Rectangle");  // Zero-sized at origin
canvas.addShape("Rectangle", new Rect(0, 0, 100, 50));

// Layer - rect required
layer.addShape("Rectangle", new Rect(0, 0, 100, 50));  // Works
// layer.addShape("Rectangle");  // ERROR: requires bounds argument
```
