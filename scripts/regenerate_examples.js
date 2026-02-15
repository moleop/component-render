const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const examplesDir = path.join(__dirname, '../examples');
const indexFile = path.join(__dirname, '../index.js');

try {
    const files = fs.readdirSync(examplesDir).filter(file => file.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(examplesDir, file);
        console.log(`Processing ${file}...`);
        try {
            execSync(`node "${indexFile}" "${filePath}"`, { stdio: 'inherit' });
        } catch (error) {
            console.error(`Error processing ${file}:`, error.message);
        }
    });
} catch (error) {
    console.error('Error reading examples directory:', error.message);
}
