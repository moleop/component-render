const fs = require('fs');
const path = require('path');

const examplesDir = path.join(__dirname, '../examples');

function removeSize(node) {
    if (node.width) delete node.width;
    if (node.height) delete node.height;
    
    if (node.children) {
        node.children.forEach(child => removeSize(child));
    }
}

try {
    const files = fs.readdirSync(examplesDir).filter(file => file.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(examplesDir, file);
        console.log(`Processing ${file}...`);
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const json = JSON.parse(data);
            
            removeSize(json);
            
            fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
        } catch (error) {
            console.error(`Error processing ${file}:`, error.message);
        }
    });
    console.log('Finished removing size information from examples.');
} catch (error) {
    console.error('Error reading examples directory:', error.message);
}
