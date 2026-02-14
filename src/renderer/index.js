const { create } = require('xmlbuilder2');
const config = require('../config');
const { renderNode } = require('./node');

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

module.exports = {
    renderGraphToSVG
};
