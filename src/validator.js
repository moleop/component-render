function validateGraph(graph) {
    const allPortIds = new Set();
    const connectedPortIds = new Set();

    // Helper to traverse nodes and collect port IDs
    function collectPorts(node) {
        if (node.ports) {
            node.ports.forEach(port => {
                allPortIds.add(port.id);
            });
        }
        if (node.children) {
            node.children.forEach(child => collectPorts(child));
        }
    }

    // Helper to traverse nodes and collect connected port IDs from edges
    function collectEdges(node) {
        if (node.edges) {
            node.edges.forEach(edge => {
                if (edge.sources) {
                    edge.sources.forEach(source => connectedPortIds.add(source));
                }
                if (edge.targets) {
                    edge.targets.forEach(target => connectedPortIds.add(target));
                }
            });
        }
        if (node.children) {
            node.children.forEach(child => collectEdges(child));
        }
    }

    collectPorts(graph);
    collectEdges(graph);

    const unconnectedPorts = [];
    allPortIds.forEach(portId => {
        if (!connectedPortIds.has(portId)) {
            unconnectedPorts.push(portId);
        }
    });

    if (unconnectedPorts.length > 0) {
        console.warn('Warning: The following ports are not connected to any edge:', unconnectedPorts.join(', '));
    }
}

module.exports = {
    validateGraph
};
