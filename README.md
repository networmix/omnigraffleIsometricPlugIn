# OmniGraffle Isometric Plugin

Transform 2D shapes and lines into isometric projections.

## Installation

1. Download `IsometricPlugIn.omnigrafflejs`
2. Double-click to install, or drag into **Automation > Configure... > Plugins**

## Usage

Select shapes or lines, then choose from **Automation > IsometricPlugin**:

| Action | Result |
|--------|--------|
| **Make Left Plane** | Left-facing vertical wall |
| **Make Right Plane** | Right-facing vertical wall |
| **Make Top-Left Plane** | Horizontal surface, left side closer |
| **Make Top-Right Plane** | Horizontal surface, right side closer |

### Isometric Cube Example

1. Create three identical rectangles
2. Apply **Make Left Plane** to the first
3. Apply **Make Right Plane** to the second
4. Apply **Make Top-Right Plane** to the third
5. Position to form a cube

### Technical Details

- Shapes are converted to Bezier paths (allows point manipulation)
- Text is rotated but not geometrically transformed (trade-off: keeps text editable in OmniGraffle)
- Groups are flattened; all graphics share a common transformation origin
- Multi-selection supported; objects transform relative to combined bounding box
- Undo works correctly (Cmd+Z reverts the entire transformation)

### Transformation Math

| Plane | Method |
|-------|--------|
| Left/Right | Scale X by cos(30°), skew Y by ±30° |
| TopLeft/TopRight | Isometric projection matrix |

## Version History

- **1.2** - Fixed top plane distortion, fixed text rotation alignment
- **1.1** - Fixed undo behavior for multi-object transforms
- **1.0** - Simplified to 4 core plane actions

## Author

Andrey Golovanov
