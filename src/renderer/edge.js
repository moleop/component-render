const config = require('../config');

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
            'stroke-width': config.styles.edge.strokeWidth
            // 'marker-end': 'url(#arrowhead)' // Removed per user request
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

    // Render Junction Points
    if (edge.junctionPoints) {
        edge.junctionPoints.forEach(jp => {
            parent.ele('circle', {
                cx: jp.x,
                cy: jp.y,
                r: config.styles.edge.junctionPointRadius,
                fill: config.styles.edge.junctionPointFill
            });
        });
    }
}

module.exports = {
    renderEdge
};
