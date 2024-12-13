// Import required libraries
import express from 'express';  // For setting up the server
import bodyParser from 'body-parser';  // For parsing incoming request bodies
import fetch from 'node-fetch';  // To make requests to JDoodle API
import cors from 'cors';  // To handle CORS issues (if your frontend is on a different domain)

const app = express();  // Initialize the Express application

// Enable CORS for all origins (or specify allowed origins if needed)
app.use(cors());  

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// POST route to run the Python code
app.post('/run', async (req, res) => {
    const { code, input } = req.body;  // Extract the code and input from the request body

    // Payload for the JDoodle API
    const payload = {
        script: code,  // The Python code from the frontend
        stdin: input,  // The input provided by the user
        language: 'python',  // Set the language to Python
        versionIndex: '4',  // Use version 4 of JDoodle API
        clientId: '2ffb5d8efe0b8c0487b9f2b3dfe5ad42',  // Your JDoodle client ID
        clientSecret: '4c42bfb0db5ec6db679158bedd0cb2af06a8256be4b9c0b4bde48980365b160b',  // Your JDoodle client secret
    };

    try {
        // Send POST request to JDoodle API
        const response = await fetch('https://api.jdoodle.com/v1/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        // Check if the response from JDoodle API is okay
        if (!response.ok) {
            throw new Error(`JDoodle API error: ${response.statusText}`);
        }

        // Parse the response from JDoodle API
        const data = await response.json();
        res.json(data);  // Send the response back to the frontend
    } catch (error) {
        // If an error occurs, return a 500 error
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Error executing code. Try again later.' });
    }
});

// Set the port dynamically (Render will assign this automatically) or use 10000 as fallback for local testing
const PORT = process.env.PORT || 10000;

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
