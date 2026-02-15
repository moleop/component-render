# UML Component Diagram Renderer

A lightweight Node.js tool that renders UML 2.x Component Diagrams from a JSON graph description. It uses [elkjs](https://github.com/kieler/elkjs) for automatic layout and [xmlbuilder2](https://oozcitak.github.io/xmlbuilder2/) for SVG generation.

## Features

- **Components**: Rendered as standard UML components with the characteristic symbol in the top-right corner.
- **Subsystems**: Container nodes that can group multiple components.
- **Ports**: Supports ports on component boundaries.
- **Interfaces**:
    - **Provided Interface**: Rendered as a "lollipop" (circle).
    - **Required Interface**: Rendered as a "socket" (arc).
    - **Multiple Interfaces**: Automatically adjusts port size and interface offsets to prevent overlap.
- **Automatic Layout**: Uses the Eclipse Layout Kernel (ELK) Layered algorithm for clean, readable diagrams.
- **SVG Output**: Generates high-quality vector graphics suitable for web and print.

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd diagram_renderer
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

Run the tool with the path to your input JSON file:

```bash
node index.js path/to/input.json
```

The tool will generate an SVG file in the same directory (e.g., `path/to/input.svg`).

## Input Format

The input must be a JSON object following the ELK Graph structure, with custom properties for UML semantics.

### Example JSON

```json
{
  "id": "root",
  "children": [
    {
      "id": "component1",
      "width": 100,
      "height": 80,
      "labels": [{ "text": "Auth Service" }],
      "ports": [
        {
          "id": "p1",
          "width": 15,
          "height": 15,
          "side": "EAST",
          "interfaces": [
            {
              "type": "provided",
              "label": "IAuth"
            }
          ]
        }
      ]
    },
    {
      "id": "component2",
      "width": 100,
      "height": 80,
      "labels": [{ "text": "User DB" }],
      "ports": [
        {
          "id": "p2",
          "width": 15,
          "height": 15,
          "side": "WEST",
          "interfaces": [
            {
              "type": "required",
              "label": "IAuth"
            }
          ]
        }
      ]
    }
  ],
  "edges": [
    {
      "id": "e1",
      "sources": ["p1"],
      "targets": ["p2"]
    }
  ]
}
```

### Key Properties

- **`id`**: Unique identifier for the node/edge.
- **`children`**: Array of child nodes (for Subsystems or the Root).
- **`ports`**: Array of port objects attached to a node.
- **`interfaces`**: Array of interface objects attached to a port.
    - `type`: `"provided"` or `"required"`.
    - `label`: Text label for the interface.
- **`layoutOptions`**: Optional ELK-specific layout configuration.
