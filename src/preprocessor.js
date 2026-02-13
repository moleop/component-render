const config = require('./config');

function preprocessGraph(node) {
    const isSubsystem = node.children && node.children.length > 0;

    // Recursively process children first
    if (isSubsystem) {
        node.children.forEach(child => preprocessGraph(child));
        
        // Per user requirement: Subsystems never have ports.
        // We warn if we find ports on a subsystem and remove them to enforce the rule.
        if (node.ports && node.ports.length > 0) {
            console.warn(`Warning: Subsystem '${node.id}' has ports defined, but subsystems should not have ports. Removing them.`);
            delete node.ports;
        }
    }

    // Configure ports for Components (leaf nodes)
    if (!isSubsystem && node.ports) {
        node.ports.forEach(port => {
            // Default dimensions if missing
            if (!port.width) port.width = config.styles.port.defaultWidth;
            if (!port.height) port.height = config.styles.port.defaultHeight;

            // Ensure layoutOptions exists
            if (!port.layoutOptions) port.layoutOptions = {};

            // Set border offset to negative half of dimension to straddle the border
            // This is the key to the UML port look
            port.layoutOptions['elk.port.borderOffset'] = -port.width / 2;
        });
    }

    // Ensure root and subsystems use the layered algorithm if not specified
    // (This was part of the original logic, preserving it here)
    if (isSubsystem || !node.id) { // Root often has no ID or is just a container
         if (!node.layoutOptions) {
            node.layoutOptions = {};
        }
        if (!node.layoutOptions['elk.algorithm']) {
            node.layoutOptions['elk.algorithm'] = config.layout.algorithm;
        }
    }
}

module.exports = {
    preprocessGraph
};
