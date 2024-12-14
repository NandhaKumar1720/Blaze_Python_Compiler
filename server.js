const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');  // For generating unique hashes of code

const app = express();
const PORT = 3000;

// Middleware to parse JSON data
app.use(express.json());

// Use in-memory cache to store Python code (not binaries)
const cachedPythonCode = {};

// POST route to execute the Python code
app.post('/', (req, res) => {
    const { code, input } = req.body;

    if (!code) {
        return res.status(400).json({ output: 'Error: No code provided!' });
    }

    // Generate a unique hash for the given code
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const pythonFile = path.join(__dirname, `${codeHash}.py`);

    // If the Python code is already cached, skip file writing
    if (cachedPythonCode[codeHash]) {
        return executePython(pythonFile, input, res);
    }

    // Otherwise, save the code to a temporary file
    fs.writeFileSync(pythonFile, code);

    // Cache the Python code in memory
    cachedPythonCode[codeHash] = pythonFile;
    executePython(pythonFile, input, res);
});

// Function to execute the Python code
function executePython(pythonFile, input, res) {
    // If input is provided, use echo to pass it to the Python program
    const runCommand = input ? `echo "${input}" | python ${pythonFile}` : `python ${pythonFile}`;

    exec(runCommand, (runErr, runStdout, runStderr) => {
        if (runErr) {
            return res.json({ output: `Runtime Error:\n${runStderr || runStdout}` });
        }
        res.json({ output: runStdout || 'No output' });
    });
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
