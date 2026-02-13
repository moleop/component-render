module.exports = {
    layout: {
        algorithm: 'layered',
        defaultWidth: 800,
        defaultHeight: 600
    },
    styles: {
        fontFamily: 'sans-serif',
        node: {
            fill: '#ffffff',
            stroke: '#333',
            strokeWidth: 2,
            rx: 5,
            labelFontSize: '12px',
            labelFill: '#000'
        },
        subsystem: {
            fill: '#f9f9f9',
            stroke: '#333',
            strokeWidth: 2,
            rx: 5,
            labelFontSize: '12px',
            labelFill: '#000'
        },
        port: {
            fill: '#ffffff',
            stroke: '#333',
            strokeWidth: 1,
            defaultWidth: 12,
            defaultHeight: 12
        },
        edge: {
            stroke: '#333',
            strokeWidth: 2,
            fill: 'none',
            labelFontSize: '10px',
            labelFill: '#555'
        },
        symbol: {
            fill: '#ffffff',
            stroke: '#333',
            strokeWidth: 1.5
        }
    }
};
