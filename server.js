
const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {
    const { code, input } = req.body;

    if (!code) {
        return res.status(400).json({ output: 'Error: No code provided!' });
    }

    const sourceFile = path.join(__dirname, 'temp.py');

    // Write the code to a temporary file
    fs.writeFileSync(sourceFile, code);

    try {
        // Run the Python script
        const runProcess = spawn('python', [sourceFile], { stdio: 'pipe' });

        let output = '';

        runProcess.stdout.on('data', (data) => (output += data.toString()));
        runProcess.stderr.on('data', (data) => (output += data.toString()));

        runProcess.on('close', () => {
            res.json({ output: output || 'No output' });

            // Cleanup temporary file
            fs.unlinkSync(sourceFile);
        });
    } catch (error) {
        res.json({ output: `Error: ${error.message}` });

        // Cleanup temporary file in case of an error
        if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
