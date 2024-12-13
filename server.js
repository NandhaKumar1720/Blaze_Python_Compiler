// Ensure to import the necessary libraries
import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';  // Import fetch for API requests

const app = express();  // Initialize the Express application

// Enable JSON body parsing for incoming requests
app.use(bodyParser.json());

// POST endpoint to handle the code execution
app.post('/run', async (req, res) => {
    const { code, input } = req.body;  // Extract code and input from the request body

    const payload = {
        script: code,   // The Python code from the frontend
        stdin: input,   // Input provided by the user
        language: 'python',  // Language set to Python
        versionIndex: '4',   // JDoodle version index (use version 4)
        clientId: '2ffb5d8efe0b8c0487b9f2b3dfe5ad42',  // Replace with your JDoodle client ID
        clientSecret: '4c42bfb0db5ec6db679158bedd0cb2af06a8256be4b9c0b4bde48980365b160b',  // Replace with your JDoodle client secret
    };

    try {
        // Send a POST request to the JDoodle API to execute the code
        const response = await fetch('https://api.jdoodle.com/v1/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`JDoodle API error: ${response.statusText}`);
        }

        const data = await response.json();  // Parse the API response
        res.json(data);  // Return the result back to the frontend
    } catch (error) {
        // Handle any errors during the fetch process
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Error executing code. Try again later.' });
    }
});

// Set the port dynamically or use 10000 as a fallback
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
