const config = require('../config');
const { calculatePortSide, getDirectionVector } = require('../utils/geometry');

function renderPort(parent, port, nodeWidth, nodeHeight) {
    const px = port.x || 0;
    const py = port.y || 0;
    const pw = port.width || config.styles.port.defaultWidth;
    const ph = port.height || config.styles.port.defaultHeight;

    // Render Interfaces first (so they are behind the port body)
    if (port.interfaces && port.interfaces.length > 0) {
        renderInterfaces(parent, port, px, py, pw, ph, nodeWidth, nodeHeight);
    }

    // Render Port Body
    parent.ele('rect', {
        x: px,
        y: py,
        width: pw,
        height: ph,
        fill: config.styles.port.fill,
        stroke: config.styles.port.stroke,
        'stroke-width': config.styles.port.strokeWidth,
        class: 'port'
    });
}

function renderInterfaces(parent, port, px, py, pw, ph, nodeWidth, nodeHeight) {
    const side = calculatePortSide(px, py, pw, ph, nodeWidth, nodeHeight);
    const { dx, dy } = getDirectionVector(side);
    
    const count = port.interfaces.length;
    const gap = config.styles.interface.gap;
    const totalSpan = (count - 1) * gap;
    const startOffset = -totalSpan / 2;

    const cx = px + pw / 2;
    const cy = py + ph / 2;

    port.interfaces.forEach((iface, index) => {
        const currentOffset = startOffset + index * gap;
        
        let startX = cx;
        let startY = cy;
        let endX = cx + dx * config.styles.interface.stickLength;
        let endY = cy + dy * config.styles.interface.stickLength;

        // Apply offset perpendicular to direction
        if (dx !== 0) { // Horizontal direction, offset Y
            startY += currentOffset;
            endY += currentOffset;
        } else { // Vertical direction, offset X
            startX += currentOffset;
            endX += currentOffset;
        }

        // Draw Stick
        parent.ele('line', {
            x1: startX, y1: startY,
            x2: endX, y2: endY,
            stroke: config.styles.interface.stroke,
            'stroke-width': config.styles.interface.strokeWidth
        });

        const symSize = config.styles.interface.symbolSize;
        const symCX = endX + dx * symSize;
        const symCY = endY + dy * symSize;

        if (iface.type === 'provided') {
            // Lollipop (Circle)
            parent.ele('circle', {
                cx: symCX,
                cy: symCY,
                r: symSize,
                fill: config.styles.interface.fill,
                stroke: config.styles.interface.stroke,
                'stroke-width': config.styles.interface.strokeWidth
            });
        } else if (iface.type === 'required') {
            // Socket (Arc)
            let rotation = 0;
            if (side === 'SOUTH') rotation = 90;
            if (side === 'WEST') rotation = 180;
            if (side === 'NORTH') rotation = 270;

            const socketGroup = parent.ele('g', {
                transform: `translate(${symCX}, ${symCY}) rotate(${rotation})`
            });

            // Draw semi-circle
            socketGroup.ele('path', {
                d: `M 0 -${symSize} A ${symSize} ${symSize} 0 0 0 0 ${symSize}`,
                fill: 'none',
                stroke: config.styles.interface.stroke,
                'stroke-width': config.styles.interface.strokeWidth
            });
        }
        
        // Render Label
        if (iface.label) {
            renderInterfaceLabel(parent, iface.label, symCX, symCY, side, symSize, count === 1);
        }
    });
}

function renderInterfaceLabel(parent, text, cx, cy, side, symbolSize, isSingle = false) {
    const offset = config.styles.interface.textOffset + symbolSize;
    let lx = cx;
    let ly = cy;
    let anchor = 'middle';
    
    // Position text based on side
    if (side === 'EAST') {
        lx += offset;
        anchor = 'start';
        ly += isSingle ? -7 : 3; 
    } else if (side === 'WEST') {
        lx -= offset;
        anchor = 'end';
        ly += isSingle ? -7 : 3;
    } else if (side === 'SOUTH') {
        ly += offset + 10; // Below symbol
        anchor = 'middle';
        if (isSingle) {
            lx += 5;
            anchor = 'start';
        }
    } else if (side === 'NORTH') {
        ly -= offset + 2; // Above symbol
        anchor = 'middle';
        if (isSingle) {
            lx += 5;
            anchor = 'start';
        }
    }

    parent.ele('text', {
        x: lx,
        y: ly,
        'text-anchor': anchor,
        'font-size': config.styles.interface.labelFontSize,
        fill: config.styles.interface.labelFill
    }).txt(text);
}

module.exports = {
    renderPort
};
