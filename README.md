# OmniGraffle Isometric Plugin

An OmniGraffle plugin that transforms 2D shapes and lines into isometric projections.

## Installation

1. Download the code as a ZIP archive
2. Unpack the archive
3. Double-click `IsometricPlugIn.omnigrafflejs` in Finder to install

Alternatively, drag the file into **Automation > Configure... > Plugins**.

## Usage

Select one or more shapes (or lines), then choose an action from **Automation > IsometricPlugin**.

### Main Action

| Action | Description |
|--------|-------------|
| **Make Isometric Plane…** | Opens a dialog to choose plane type and options (including non-destructive duplicate mode) |

### Quick Plane Actions

Transform shapes directly into isometric surfaces:

| Action | Description |
|--------|-------------|
| **Make Left Plane** | Left-facing vertical surface (skew +30°) |
| **Make Right Plane** | Right-facing vertical surface (skew -30°) |
| **Make Top-Left Plane** | Top surface tilted left (skew -30°, rotate 60°) |
| **Make Top-Right Plane** | Top surface tilted right (skew +30°, rotate -60°) |

### Individual Operations

The plane actions above combine scale + skew. Use these when you need just one step:

| Action | Use Case |
|--------|----------|
| **Skew Vertically (+30°)** | Tilt shape for left plane (without scaling) |
| **Skew Vertically (-30°)** | Tilt shape for right plane (without scaling) |
| **Scale Horizontally (cos30)** | Compress width before skewing |
| **Scale Horizontally (cos30 inv)** | Undo horizontal compression |
| **Scale Vertically (cos30)** | Compress height (e.g., for floor/ceiling planes) |
| **Scale Vertically (cos30 inv)** | Undo vertical compression |

### Example: Isometric Cube

1. Create three identical squares
2. Apply **Make Left Plane** to the first (left face)
3. Apply **Make Right Plane** to the second (right face)
4. Apply **Make Top-Right Plane** to the third (top face)
5. Position the three planes to form a cube

### Notes

- Groups are supported; all shapes within a group are transformed
- **Lines are supported** - connectors transform along with shapes
- Multi-select works correctly; all selected objects share a common reference point
- Shapes are converted to Bezier paths (irreversible)
- Text may distort; add labels after transformation
- **Pre-rotated shapes**: For best results, reset rotation to 0° before transforming
- **Icons**: Requires macOS 11+ / iOS 14+ for SF Symbol icons

## Version History

- **0.9** - Added Form-based action with options, SF Symbol icons, simplified menu
- **0.8** - Added line support, fixed multi-select alignment, added duplicate-then-transform
- **0.7** - Fixed multi-selection bug, refactored codebase
- **0.6** - Added group support and makePlane methods
- **0.5** - Added scale methods
- **0.4** - Initial release

## Author

Andrey Golovanov
