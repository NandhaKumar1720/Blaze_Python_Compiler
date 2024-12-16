const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// JDoodle API credentials
const CLIENT_ID = '2ffb5d8efe0b8c0487b9f2b3dfe5ad42';
const CLIENT_SECRET = '40d74c8cb98ffcae804aacfa847211a9ea3316c311f2ad10c305069b8247e040';
const JDoodle_API_URL = 'https://api.jdoodle.com/v1/execute';

app.use(cors());
app.use(express.json());

// Serve static files (e.g., HTML, CSS, JS files)
app.use(express.static(path.join(__dirname, 'public')));

// Handle code execution requests from front-end (e.g., Python code)
app.post('/execute', async (req, res) => {
    const { code, input } = req.body;

    if (!code) {
        return res.status(400).json({ output: 'Error: No code provided!' });
    }

    try {
        // JDoodle API payload
        const payload = {
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            script: code,
            stdin: input || '',
            language: 'python3', // Python 3 language
            versionIndex: '3'    // Python 3 version index
        };

        // Send a POST request to JDoodle API
        const response = await axios.post(JDoodle_API_URL, payload);

        // Send the output back to the front-end
        res.json({ output: response.data.output || 'No output' });
    } catch (error) {
        console.error('Error:', error.message || error.response.data);
        res.status(500).json({ output: 'Error: Unable to execute the code.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
