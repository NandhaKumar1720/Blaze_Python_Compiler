const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');  // For generating unique hashes of code

const app = express();
const PORT = 3000;

// Middleware to parse JSON data
app.use(express.json());

// JDoodle API Credentials (Replace these with your actual credentials)
const clientId = "your_client_id";  // Replace with your JDoodle Client ID
const clientSecret = "your_client_secret";  // Replace with your JDoodle Client Secret

// POST route to execute the Python code using JDoodle API
app.post('/', (req, res) => {
    const { code, input } = req.body;

    if (!code) {
        return res.status(400).json({ output: 'Error: No code provided!' });
    }

    // Prepare the payload to send to JDoodle API
    const payload = {
        script: code,  // Python code
        language: "python3",  // Language for JDoodle (python3 in this case)
        versionIndex: "0",  // Version index (0 corresponds to Python 3)
        stdin: input || "",  // Provide input if available
        clientId:2ffb5d8efe0b8c0487b9f2b3dfe5ad42 ,  // Your JDoodle client ID
        clientSecret:40d74c8cb98ffcae804aacfa847211a9ea3316c311f2ad10c305069b8247e040   // Your JDoodle client secret
    };

    // Send request to JDoodle API
    axios.post('https://api.jdoodle.com/v1/execute', payload)
        .then(response => {
            // JDoodle API returns output in response.data.output
            res.json({ output: response.data.output || 'No output' });
        })
        .catch(error => {
            console.error("JDoodle API error:", error);
            res.status(500).json({ output: `Error with JDoodle API: ${error.message}` });
        });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
