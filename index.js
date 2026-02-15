const fs = require('fs');
const ELK = require('elkjs');
const { preprocessGraph } = require('./src/preprocessor');
const { validateGraph } = require('./src/validator');
const { renderGraphToSVG } = require('./src/renderer');

const elk = new ELK();

const args = process.argv.slice(2);
if (args.length !== 1) {
    console.error('Usage: node index.js <input-graph.json>');
    process.exit(1);
}

const inputFile = args[0];
const outputFile = inputFile.replace('.json', '.svg');

try {
    const fileContent = fs.readFileSync(inputFile, 'utf8');
    const graph = JSON.parse(fileContent);

    // Basic validation
    if (!graph.id && !graph.children) {
        console.error('Error: Input JSON does not look like an ELK graph.');
        process.exit(1);
    }

    console.log(`Processing ${inputFile}...`);

    // Preprocess graph (configure ports, remove ports from subsystems, set defaults)
    preprocessGraph(graph);

    // Validate graph (check for disconnected ports)
    validateGraph(graph);

    elk.layout(graph)
        .then(layoutedGraph => {
            const svg = renderGraphToSVG(layoutedGraph);
            fs.writeFileSync(outputFile, svg);
            console.log(`Successfully generated ${outputFile}`);
        })
        .catch(err => {
            console.error('ELK Layout Error:', err);
            process.exit(1);
        });

} catch (err) {
    console.error(`Error reading or parsing file: ${err.message}`);
    process.exit(1);
}
