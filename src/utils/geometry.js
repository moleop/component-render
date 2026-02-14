/**
 * Calculates the side of a node on which a port resides.
 * @param {number} px Port X coordinate
 * @param {number} py Port Y coordinate
 * @param {number} pw Port Width
 * @param {number} ph Port Height
 * @param {number} nodeWidth Node Width
 * @param {number} nodeHeight Node Height
 * @returns {'NORTH' | 'SOUTH' | 'EAST' | 'WEST'} The side the port is on.
 */
function calculatePortSide(px, py, pw, ph, nodeWidth, nodeHeight) {
    const cx = px + pw / 2;
    const cy = py + ph / 2;

    const distWest = cx;
    const distEast = nodeWidth - cx;
    const distNorth = cy;
    const distSouth = nodeHeight - cy;

    const minDist = Math.min(distWest, distEast, distNorth, distSouth);

    if (minDist === distEast) return 'EAST';
    if (minDist === distWest) return 'WEST';
    if (minDist === distSouth) return 'SOUTH';
    return 'NORTH';
}

/**
 * Returns the direction vector for a given side.
 * @param {string} side 
 * @returns {{dx: number, dy: number}}
 */
function getDirectionVector(side) {
    if (side === 'EAST') return { dx: 1, dy: 0 };
    if (side === 'WEST') return { dx: -1, dy: 0 };
    if (side === 'SOUTH') return { dx: 0, dy: 1 };
    if (side === 'NORTH') return { dx: 0, dy: -1 };
    return { dx: 0, dy: 0 }; // Should not happen
}

module.exports = {
    calculatePortSide,
    getDirectionVector
};
