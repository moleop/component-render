const { create } = require('xmlbuilder2');
const config = require('./config');

function renderGraphToSVG(root) {
    const width = root.width || config.layout.defaultWidth;
    const height = root.height || config.layout.defaultHeight;

    const doc = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: width,
            height: height,
            viewBox: `0 0 ${width} ${height}`,
            style: `font-family: ${config.styles.fontFamily};`
        });

    // Definitions
    const defs = doc.ele('defs');
    
    // Arrowhead marker
    defs.ele('marker', {
        id: 'arrowhead',
        markerWidth: '10',
        markerHeight: '7',
        refX: '10',
        refY: '3.5',
        orient: 'auto'
    }).ele('polygon', { points: '0 0, 10 3.5, 0 7', fill: config.styles.edge.stroke });

    // Render the root and its descendants
    renderNode(doc, root, true);

    return doc.end({ prettyPrint: true });
}

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
    renderLabel(group, node, width, height);

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
    renderLabel(group, node, width, height);

    // Render Ports
    if (node.ports) {
        node.ports.forEach(port => {
            const px = port.x || 0;
            const py = port.y || 0;
            const pw = port.width || config.styles.port.defaultWidth;
            const ph = port.height || config.styles.port.defaultHeight;

            group.ele('rect', {
                x: px,
                y: py,
                width: pw,
                height: ph,
                fill: config.styles.port.fill,
                stroke: config.styles.port.stroke,
                'stroke-width': config.styles.port.strokeWidth,
                class: 'port'
            });
        });
    }

    // Render UML Component Symbol (Top Right)
    // Only if the node is large enough to support it visually
    if (width > 40 && height > 20) {
        const symbolGroup = group.ele('g', {
            transform: `translate(${width - 25}, 5)`
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
}

function renderLabel(group, node, nodeWidth, nodeHeight) {
    if (node.labels && node.labels.length > 0) {
        node.labels.forEach(label => {
            let lx, ly;
            
            const hasLayout = (label.width !== undefined && label.width > 0);

            if (!hasLayout) {
                // Fallback: Center in node
                lx = (nodeWidth || 0) / 2;
                ly = 15; // A bit from the top
            } else {
                 lx = (label.x || 0) + label.width / 2;
                 ly = (label.y || 0) + label.height / 1.5;
            }

            // Text element
            const textEl = group.ele('text', {
                x: lx,
                y: ly,
                'text-anchor': 'middle',
                'font-size': config.styles.node.labelFontSize,
                fill: config.styles.node.labelFill
            });
            textEl.txt(label.text);
        });
    }
}

function renderEdge(parent, edge) {
    if (!edge.sections) return;

    edge.sections.forEach(section => {
        let pathData = `M ${section.startPoint.x} ${section.startPoint.y}`;

        if (section.bendPoints) {
            section.bendPoints.forEach(bp => {
                pathData += ` L ${bp.x} ${bp.y}`;
            });
        }

        pathData += ` L ${section.endPoint.x} ${section.endPoint.y}`;

        parent.ele('path', {
            d: pathData,
            fill: config.styles.edge.fill,
            stroke: config.styles.edge.stroke,
            'stroke-width': config.styles.edge.strokeWidth,
            'marker-end': 'url(#arrowhead)'
        });
        
        // Edge Labels
        if (edge.labels) {
             edge.labels.forEach(label => {
                const lx = label.x || 0;
                const ly = label.y || 0;
                parent.ele('text', {
                    x: lx,
                    y: ly + 10,
                    'font-size': config.styles.edge.labelFontSize,
                    fill: config.styles.edge.labelFill
                }).txt(label.text);
             });
        }
    });
}

module.exports = {
    renderGraphToSVG
};
