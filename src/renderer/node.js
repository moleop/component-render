const config = require('../config');
const { renderPort } = require('./port');
const { renderEdge } = require('./edge');

/**
 * Entry point for rendering a node (component or subsystem)
 * @param {object} parent SVG parent element
 * @param {object} node ELK node object
 * @param {boolean} isGraphRoot Whether this is the root node
 */
function renderNode(parent, node, isGraphRoot = false) {
    const hasChildren = node.children && node.children.length > 0;

    if (isGraphRoot) {
        // Root is special, usually just a container
        if (hasChildren) {
            node.children.forEach(child => renderNode(parent, child, false));
        }
        if (node.edges) {
            node.edges.forEach(edge => renderEdge(parent, edge));
        }
        return;
    }

    // Determine if it is a Subsystem or a Component
    if (hasChildren) {
        renderSubsystem(parent, node);
    } else {
        renderComponent(parent, node);
    }
}

function renderSubsystem(parent, node) {
    const x = node.x || 0;
    const y = node.y || 0;
    const width = node.width || 0;
    const height = node.height || 0;

    const group = parent.ele('g', {
        transform: `translate(${x}, ${y})`,
        id: node.id,
        class: 'subsystem'
    });

    // Render Subsystem Body
    if (width > 0 && height > 0) {
        group.ele('rect', {
            width: width,
            height: height,
            fill: config.styles.subsystem.fill,
            stroke: config.styles.subsystem.stroke,
            'stroke-width': config.styles.subsystem.strokeWidth,
            rx: config.styles.subsystem.rx
        });
    }

    // Render Label
    renderLabel(group, node, width, height, false);

    // Render Children (Components or nested Subsystems)
    if (node.children) {
        node.children.forEach(child => {
            renderNode(group, child);
        });
    }

    // Render Internal Edges
    // Important: Rendered after children so they appear on top
    if (node.edges) {
        node.edges.forEach(edge => {
            renderEdge(group, edge);
        });
    }
}

function renderComponent(parent, node) {
    const x = node.x || 0;
    const y = node.y || 0;
    const width = node.width || 0;
    const height = node.height || 0;

    const group = parent.ele('g', {
        transform: `translate(${x}, ${y})`,
        id: node.id,
        class: 'component'
    });

    // Render Component Body
    if (width > 0 && height > 0) {
        group.ele('rect', {
            width: width,
            height: height,
            fill: config.styles.node.fill,
            stroke: config.styles.node.stroke,
            'stroke-width': config.styles.node.strokeWidth,
            rx: config.styles.node.rx
        });
    }

    // Render Label
    renderLabel(group, node, width, height, true);

    // Render Ports
    if (node.ports) {
        node.ports.forEach(port => {
            renderPort(group, port, width, height);
        });
    }

    // Render UML Component Symbol (Top Right)
    // Only if the node is large enough to support it visually
    if (width > 40 && height > 20) {
        renderUMLSymbol(group, width);
    }
}

function renderUMLSymbol(group, nodeWidth) {
    const symbolGroup = group.ele('g', {
        transform: `translate(${nodeWidth - 25}, 5)`
    });

    // Main box
    symbolGroup.ele('rect', {
        x: 0, y: 0,
        width: 20, height: 16,
        fill: config.styles.symbol.fill,
        stroke: config.styles.symbol.stroke,
        'stroke-width': config.styles.symbol.strokeWidth
    });

    // Top prong
    symbolGroup.ele('rect', {
        x: -4, y: 3,
        width: 8, height: 4,
        fill: config.styles.symbol.fill,
        stroke: config.styles.symbol.stroke,
        'stroke-width': config.styles.symbol.strokeWidth
    });

    // Bottom prong
    symbolGroup.ele('rect', {
        x: -4, y: 9,
        width: 8, height: 4,
        fill: config.styles.symbol.fill,
        stroke: config.styles.symbol.stroke,
        'stroke-width': config.styles.symbol.strokeWidth
    });
}

function renderLabel(group, node, nodeWidth, nodeHeight, isComponent = false) {
    if (node.labels && node.labels.length > 0) {
        node.labels.forEach(label => {
            let lx, ly;
            let anchor = 'middle';
            let baseline = 'auto'; // Default baseline
            
            const hasLayout = (label.width !== undefined && label.width > 0);

            if (!hasLayout) {
                // Fallback: 
                if (isComponent) {
                    // Center in node
                    lx = (nodeWidth || 0) / 2;
                    ly = (nodeHeight || 0) / 2;
                    baseline = 'middle';
                } else {
                    // Top (Subsystem)
                    lx = (nodeWidth || 0) / 2;
                    ly = 15; // A bit from the top
                }
            } else {
                 lx = (label.x || 0) + label.width / 2;
                 ly = (label.y || 0) + label.height / 1.5;
            }

            // Text element
            const textEl = group.ele('text', {
                x: lx,
                y: ly,
                'text-anchor': anchor,
                'dominant-baseline': baseline,
                'font-size': config.styles.node.labelFontSize,
                fill: config.styles.node.labelFill
            });
            textEl.txt(label.text);
        });
    }
}

module.exports = {
    renderNode
};
