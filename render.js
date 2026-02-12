const fs = require('fs');
const ELK = require('elkjs');
const { create } = require('xmlbuilder2');

const elk = new ELK();

const args = process.argv.slice(2);
if (args.length !== 1) {
    console.error('Usage: node render.js <input-graph.json>');
    process.exit(1);
}

const inputFile = args[0];
const outputFile = inputFile.replace('.json', '.svg');

try {
    const fileContent = fs.readFileSync(inputFile, 'utf8');
    const graph = JSON.parse(fileContent);

    // Basic validation
    if (!graph.id && !graph.children) {
        console.error('Error: Input JSON does not look like an ELK graph.');
        process.exit(1);
    }

    console.log(`Processing ${inputFile}...`);

    // Ensure root has layout options for layered algorithm if not specified
    if (!graph.layoutOptions) {
        graph.layoutOptions = {};
    }
    if (!graph.layoutOptions['elk.algorithm']) {
        graph.layoutOptions['elk.algorithm'] = 'layered';
    }

    elk.layout(graph)
        .then(layoutedGraph => {
            const svg = renderGraphToSVG(layoutedGraph);
            fs.writeFileSync(outputFile, svg);
            console.log(`Successfully generated ${outputFile}`);
        })
        .catch(err => {
            console.error('ELK Layout Error:', err);
            process.exit(1);
        });

} catch (err) {
    console.error(`Error reading or parsing file: ${err.message}`);
    process.exit(1);
}

function renderGraphToSVG(root) {
    const width = root.width || 800;
    const height = root.height || 600;

    const doc = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: width,
            height: height,
            viewBox: `0 0 ${width} ${height}`,
            style: 'font-family: sans-serif;'
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
    }).ele('polygon', { points: '0 0, 10 3.5, 0 7', fill: '#333' });

    // Render the root and its descendants
    renderNode(doc, root);

    return doc.end({ prettyPrint: true });
}

function renderNode(parent, node) {
    const x = node.x || 0;
    const y = node.y || 0;
    const width = node.width || 0;
    const height = node.height || 0;

    // Create a group for this node
    // The group is translated to the node's position relative to its parent
    const group = parent.ele('g', {
        transform: `translate(${x}, ${y})`,
        id: node.id,
        class: 'node'
    });

    // Render the node body (rectangle)
    const isRoot = parent.node.nodeName === 'svg';
    
    if (!isRoot && width > 0 && height > 0) {
        group.ele('rect', {
            width: width,
            height: height,
            fill: node.children ? '#f9f9f9' : '#ffffff', // Container vs Leaf
            stroke: '#333',
            'stroke-width': '2',
            rx: '5'
        });
    }

    // Render Label
    if (node.labels && node.labels.length > 0) {
        node.labels.forEach(label => {
            let lx, ly;
            
            // Check if label has valid layout info
            const hasLayout = (label.width !== undefined && label.width > 0);

            if (!hasLayout) {
                // Fallback: Center in node
                lx = (width || 0) / 2;
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
                'font-size': '12px',
                fill: '#000'
            });
            textEl.txt(label.text);
        });
    }

    // Render Ports
    if (node.ports) {
        node.ports.forEach(port => {
            const px = port.x || 0;
            const py = port.y || 0;
            const pw = port.width || 8;
            const ph = port.height || 8;

            group.ele('rect', {
                x: px,
                y: py,
                width: pw,
                height: ph,
                fill: '#666',
                stroke: '#333',
                'stroke-width': '1',
                class: 'port'
            });
        });
    }

    // Recurse for children
    // IMPORTANT: Render children BEFORE edges so edges are drawn on top of children
    if (node.children) {
        node.children.forEach(child => {
            renderNode(group, child);
        });
    }

    // Render Edges
    if (node.edges) {
        node.edges.forEach(edge => {
            renderEdge(group, edge);
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
            fill: 'none',
            stroke: '#333',
            'stroke-width': '2',
            'marker-end': 'url(#arrowhead)'
        });
        
        // Edge Labels?
        if (edge.labels) {
             edge.labels.forEach(label => {
                const lx = label.x || 0;
                const ly = label.y || 0;
                parent.ele('text', {
                    x: lx,
                    y: ly + 10,
                    'font-size': '10px',
                    fill: '#555'
                }).txt(label.text);
             });
        }
    });
}
