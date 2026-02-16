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
    if (!isSubsystem) {
        // Ensure layoutOptions exists
        if (!node.layoutOptions) node.layoutOptions = {};
        
        // FIX: Force ELK to respect the side constraint for ports
        node.layoutOptions['elk.portConstraints'] = 'FIXED_SIDE';

        let northPorts = 0;
        let southPorts = 0;
        let eastPorts = 0;
        let westPorts = 0;

        if (node.ports) {
            node.ports.forEach(port => {
                // Ensure layoutOptions exists
                if (!port.layoutOptions) port.layoutOptions = {};

                // Determine side (default to EAST if unknown, assuming layered right layout)
                let side = 'EAST'; 
                if (port.layoutOptions['elk.port.side']) {
                    side = port.layoutOptions['elk.port.side'];
                } else {
                    // Explicitly set default side to EAST so ELK knows where to place it
                    port.layoutOptions['elk.port.side'] = 'EAST';
                }

                if (side === 'NORTH') northPorts++;
                else if (side === 'SOUTH') southPorts++;
                else if (side === 'WEST') westPorts++;
                else eastPorts++; // Default to EAST
                
                const isNorthSouth = (side === 'NORTH' || side === 'SOUTH');
                // Default assumes horizontal layout (EAST/WEST ports most common)
    
                // Default dimensions
                if (!port.width) port.width = config.styles.port.defaultWidth;
                if (!port.height) port.height = config.styles.port.defaultHeight;
    
                // If interfaces > 1, make the port "broader" along the edge to accommodate them
                const hasMultipleInterfaces = port.interfaces && port.interfaces.length > 1;
                
                if (hasMultipleInterfaces) {
                    if (isNorthSouth) {
                         // Along N/S edge, "broader" means wider
                         port.width = Math.max(port.width, config.styles.port.broadenedWidth); 
                    } else {
                         // Along E/W edge, "broader" means taller
                         port.height = Math.max(port.height, config.styles.port.broadenedHeight);
                    }
                }
    
                // Ensure layoutOptions exists
                if (!port.layoutOptions) port.layoutOptions = {};
    
                // Set border offset to negative half of dimension perpendicular to the border
                if (isNorthSouth) {
                    // Perpendicular is height
                    port.layoutOptions['elk.port.borderOffset'] = -port.height / 2;
                } else {
                    // Perpendicular is width (East/West)
                    port.layoutOptions['elk.port.borderOffset'] = -port.width / 2;
                }
            });
        }

        // Calculate minimum dimensions based on ports
        // We need enough space for the ports plus some padding.
        // Assuming a certain spacing between ports (e.g., 20px) and some margin.
        const portSpacing = 25; 
        const margin = 20;

        const requiredWidth = Math.max(northPorts, southPorts) * portSpacing + margin;
        const requiredHeight = Math.max(eastPorts, westPorts) * portSpacing + margin;

        // Enforce minimum dimensions for components
        // Use the maximum of: existing width (if any), default width, or required width based on ports
        const currentWidth = node.width || 0;
        node.width = Math.max(currentWidth, config.styles.node.defaultWidth, requiredWidth);

        const currentHeight = node.height || 0;
        node.height = Math.max(currentHeight, config.styles.node.defaultHeight, requiredHeight);
    }

    // Ensure root and subsystems use the layered algorithm if not specified
    // Also inject generous default spacing to prevent overlap of interface symbols
    if (isSubsystem || !node.id) { // Root often has no ID or is just a container
         if (!node.layoutOptions) {
            node.layoutOptions = {};
        }
        if (!node.layoutOptions['elk.algorithm']) {
            node.layoutOptions['elk.algorithm'] = config.layout.algorithm;
        }
        
        // Inject default spacing if not present
        if (!node.layoutOptions['elk.spacing.nodeNode']) {
            node.layoutOptions['elk.spacing.nodeNode'] = '100';
        }
        if (!node.layoutOptions['elk.layered.spacing.nodeNodeBetweenLayers']) {
            node.layoutOptions['elk.layered.spacing.nodeNodeBetweenLayers'] = '150';
        }
        if (!node.layoutOptions['elk.layered.spacing.edgeNodeBetweenLayers']) {
            node.layoutOptions['elk.layered.spacing.edgeNodeBetweenLayers'] = '80';
        }
        
        // Ensure hierarchy handling is enabled for layered layout
        if (!node.layoutOptions['elk.hierarchyHandling']) {
            node.layoutOptions['elk.hierarchyHandling'] = 'INCLUDE_CHILDREN';
        }

        // Ensure subsystems have padding so ports don't touch the border
        if (node.id && !node.layoutOptions['elk.padding']) {
            node.layoutOptions['elk.padding'] = '[top=40,left=40,bottom=40,right=40]';
        }
    }
}

module.exports = {
    preprocessGraph
};
