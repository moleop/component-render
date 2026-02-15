const fs = require('fs');
const path = require('path');

// Helper to create a component with complex ports
function createComponent(id, label) {
    return {
        id: id,
        width: 140, 
        height: 100,
        labels: [{ text: label }],
        ports: [
            // Standard Input
            { id: `${id}_pIn`, width: 15, height: 15, side: "WEST", interfaces: [{ type: 'provided', label: 'In' }] },
            // Standard Output
            { id: `${id}_pOut`, width: 15, height: 15, side: "EAST", interfaces: [{ type: 'required', label: 'Out' }] },
            // Mixed Interface Port (Bi-directional/Complex)
            { 
                id: `${id}_pMix`, 
                width: 15, 
                height: 15, 
                side: "NORTH", 
                interfaces: [
                    { type: 'provided', label: 'Prov' },
                    { type: 'required', label: 'Req' }
                ] 
            },
            // Another Mixed Port
            { 
                id: `${id}_pMix2`, 
                width: 15, 
                height: 15, 
                side: "SOUTH", 
                interfaces: [
                    { type: 'provided', label: 'Status' },
                    { type: 'required', label: 'Ctrl' }
                ] 
            }
        ]
    };
}

function createSubsystem(subId, label) {
    const children = [];
    for (let i = 1; i <= 4; i++) {
        children.push(createComponent(`${subId}_c${i}`, `${label} C${i}`));
    }
    
    return {
        id: subId,
        labels: [{ text: label }],
        children: children,
        edges: [] // We will handle edges globally to ensure cross-subsystem complexity
    };
}

// Stress Test 1: "Layered Complexity" - Heavy inter-layer communication
function generateStressTest1() {
    const root = {
        id: "root",
        layoutOptions: { 
            "elk.algorithm": "layered",
            "elk.spacing.nodeNode": "100", 
            "elk.layered.spacing.nodeNodeBetweenLayers": "150"
        },
        children: [
            createSubsystem("subA", "Layer A"),
            createSubsystem("subB", "Layer B"),
            createSubsystem("subC", "Layer C"),
            createSubsystem("subD", "Layer D")
        ],
        edges: []
    };

    // 1. Direct Parallel Connections (A1->B1, A2->B2, etc.)
    // using the Mixed ports for maximum visual noise
    for (let i = 1; i <= 4; i++) {
        root.edges.push({ id: `e_AB_${i}`, sources: [`subA_c${i}_pMix`], targets: [`subB_c${i}_pMix`] });
        root.edges.push({ id: `e_BC_${i}`, sources: [`subB_c${i}_pMix2`], targets: [`subC_c${i}_pMix2`] });
        root.edges.push({ id: `e_CD_${i}`, sources: [`subC_c${i}_pOut`], targets: [`subD_c${i}_pIn`] });
    }

    // 2. Cross connections (A1 -> B2, A2 -> B3...)
    for (let i = 1; i <= 3; i++) {
        root.edges.push({ id: `e_cross_AB_${i}`, sources: [`subA_c${i}_pOut`], targets: [`subB_c${i+1}_pIn`] });
    }

    // 3. Long Jumps (A -> C, B -> D)
    root.edges.push({ id: `e_jump_AC_1`, sources: [`subA_c1_pMix2`], targets: [`subC_c4_pMix`] });
    root.edges.push({ id: `e_jump_BD_1`, sources: [`subB_c2_pOut`], targets: [`subD_c3_pIn`] });

    // 4. Feedback Loops (D -> A)
    root.edges.push({ id: `e_feed_DA_1`, sources: [`subD_c1_pMix`], targets: [`subA_c4_pMix2`] });

    fs.writeFileSync(path.join(__dirname, '../examples/stress_test_layered.json'), JSON.stringify(root, null, 2));
    console.log("Generated examples/stress_test_layered.json");
}

// Stress Test 2: "The Spaghetti" - Random dense connections
function generateStressTest2() {
    const root = {
        id: "root",
        layoutOptions: { 
            "elk.algorithm": "layered",
            "elk.direction": "RIGHT",
            "elk.spacing.nodeNode": "120",
            "elk.layered.spacing.nodeNodeBetweenLayers": "180"
        },
        children: [
            createSubsystem("sub1", "Alpha"),
            createSubsystem("sub2", "Beta"),
            createSubsystem("sub3", "Gamma"),
            createSubsystem("sub4", "Delta")
        ],
        edges: []
    };

    const subsystems = ["sub1", "sub2", "sub3", "sub4"];
    const ports = ["pIn", "pOut", "pMix", "pMix2"];

    // Fully connect every component in sub1 to random components in other subsystems
    // and vice versa.
    let edgeCount = 0;
    
    subsystems.forEach((srcSub, i) => {
        subsystems.forEach((tgtSub, j) => {
            if (i === j) return; // Skip internal for now

            // Create 2 connections per subsystem pair
            root.edges.push({
                id: `edge_${edgeCount++}`,
                sources: [`${srcSub}_c1_pMix`],
                targets: [`${tgtSub}_c2_pMix`]
            });
            
            root.edges.push({
                id: `edge_${edgeCount++}`,
                sources: [`${srcSub}_c3_pMix2`],
                targets: [`${tgtSub}_c4_pMix2`]
            });

             // Connect In/Out
             root.edges.push({
                id: `edge_${edgeCount++}`,
                sources: [`${srcSub}_c2_pOut`],
                targets: [`${tgtSub}_c3_pIn`]
            });
        });
    });

    // Add some mixed interface connections specifically
    root.edges.push({ id: `mix_special_1`, sources: [`sub1_c1_pMix`], targets: [`sub4_c4_pMix`] });
    root.edges.push({ id: `mix_special_2`, sources: [`sub2_c2_pMix2`], targets: [`sub3_c3_pMix2`] });

    fs.writeFileSync(path.join(__dirname, '../examples/stress_test_spaghetti.json'), JSON.stringify(root, null, 2));
    console.log("Generated examples/stress_test_spaghetti.json");
}

generateStressTest1();
generateStressTest2();
