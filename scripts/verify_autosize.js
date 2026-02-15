const { preprocessGraph } = require('../src/preprocessor');
const config = require('../src/config');
const assert = require('assert');

console.log('Running auto-sizing verification...');

const PORT_PITCH = 40;
const NODE_PADDING = 40;
const DEFAULT_WIDTH = config.styles.node.defaultWidth; // 140
const DEFAULT_HEIGHT = config.styles.node.defaultHeight; // 80

function createNode(id, width, height, ports) {
    return { id, width, height, ports, children: [] };
}

function createPorts(count, side) {
    const ports = [];
    for (let i = 0; i < count; i++) {
        ports.push({
            id: `p${i}`,
            layoutOptions: { 'elk.port.side': side }
        });
    }
    return ports;
}

// Test 1: No ports -> Default size
const node1 = createNode('n1', undefined, undefined, []);
preprocessGraph(node1);
assert.strictEqual(node1.width, DEFAULT_WIDTH, 'Node 1 width should be default');
assert.strictEqual(node1.height, DEFAULT_HEIGHT, 'Node 1 height should be default');
console.log('Test 1 Passed: No ports -> Default size');

// Test 2: Few ports (1 East) -> Default size (assuming 1*40+40 < 80? No, 80=80. Let's see)
// Required height = 1 * 40 + 40 = 80. Default is 80. So it should match.
const node2 = createNode('n2', undefined, undefined, createPorts(1, 'EAST'));
preprocessGraph(node2);
assert.strictEqual(node2.height, DEFAULT_HEIGHT, 'Node 2 height should be default');
console.log('Test 2 Passed: 1 Port East -> Default size');

// Test 3: Many ports (10 East) -> calculated size
// Required height = 10 * 40 + 40 = 440.
const node3 = createNode('n3', undefined, undefined, createPorts(10, 'EAST'));
preprocessGraph(node3);
const expectedHeight3 = 10 * PORT_PITCH + NODE_PADDING;
assert.strictEqual(node3.height, expectedHeight3, `Node 3 height should be ${expectedHeight3}, got ${node3.height}`);
console.log(`Test 3 Passed: 10 Ports East -> ${node3.height}`);

// Test 4: Many ports (10 North) -> calculated size
// Required width = 10 * 40 + 40 = 440.
const node4 = createNode('n4', undefined, undefined, createPorts(10, 'NORTH'));
preprocessGraph(node4);
const expectedWidth4 = 10 * PORT_PITCH + NODE_PADDING;
assert.strictEqual(node4.width, expectedWidth4, `Node 4 width should be ${expectedWidth4}, got ${node4.width}`);
console.log(`Test 4 Passed: 10 Ports North -> ${node4.width}`);

// Test 5: User specified size larger than required
const userWidth = 1000;
const node5 = createNode('n5', userWidth, undefined, createPorts(1, 'NORTH'));
preprocessGraph(node5);
assert.strictEqual(node5.width, userWidth, 'Node 5 width should be user specified');
console.log('Test 5 Passed: User size (large) preserved');

// Test 6: User specified size smaller than required -> Required size wins
const smallUserWidth = 50;
const node6 = createNode('n6', smallUserWidth, undefined, createPorts(10, 'NORTH'));
preprocessGraph(node6);
const expectedWidth6 = 10 * PORT_PITCH + NODE_PADDING; // 440
assert.strictEqual(node6.width, expectedWidth6, `Node 6 width should be ${expectedWidth6}, got ${node6.width}`);
console.log('Test 6 Passed: User size (small) overridden by required size');

console.log('All verification tests passed!');
