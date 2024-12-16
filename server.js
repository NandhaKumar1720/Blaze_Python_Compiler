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
        // Run the Python script (use python3 if needed)
        const runProcess = spawn('python3', [sourceFile], { stdio: 'pipe' });

        let output = '';

        // Collect output from Python script
        runProcess.stdout.on('data', (data) => {
            console.log('Python Output:', data.toString());  // For debugging
            output += data.toString();
        });

        // Collect error output from Python script
        runProcess.stderr.on('data', (data) => {
            console.error('Python Error:', data.toString());  // For debugging
            output += data.toString();
        });

        // Handle process close
        runProcess.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({ output: 'Error: Code execution failed' });
            }

            res.json({ output: output || 'No output' });

            // Cleanup temporary file
            fs.unlinkSync(sourceFile);
        });

        // Timeout in case the code runs too long
        setTimeout(() => {
            runProcess.kill();  // Kill the process if it takes too long
            res.status(500).json({ output: 'Error: Code execution timed out' });

            // Cleanup temporary file if timeout occurs
            if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile);
        }, 30000); // Timeout after 30 seconds

    } catch (error) {
        console.error('Error running code:', error.message);
        res.status(500).json({ output: `Server Error: ${error.message}` });

        // Cleanup temporary file in case of an error
        if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
