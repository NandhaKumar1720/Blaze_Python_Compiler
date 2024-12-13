import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';  // Import fetch for API requests
import cors from 'cors';  // Import CORS

const app = express();

// Enable CORS for all origins (or specify allowed origins)
app.use(cors());

// Middleware to parse incoming JSON request bodies
app.use(bodyParser.json());

// POST endpoint to execute code
app.post('/run', async (req, res) => {
    const { code, input } = req.body;  // Extract code and input from the request

    const payload = {
        script: code,
        stdin: input,
        language: 'python',
        versionIndex: '4',
        clientId: '2ffb5d8efe0b8c0487b9f2b3dfe5ad42',  // JDoodle client ID
        clientSecret: '40d74c8cb98ffcae804aacfa847211a9ea3316c311f2ad10c305069b8247e040',  // JDoodle client secret
    };

    try {
        // Sending request to JDoodle API to execute the code
        const response = await fetch('https://api.jdoodle.com/v1/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        // If the response from JDoodle API is not ok, throw an error
        if (!response.ok) {
            const errorMessage = `JDoodle API error: ${response.statusText}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        const data = await response.json();
        res.json(data);  // Send the output back to the frontend
    } catch (error) {
        // Log error details and send a 500 response to the frontend
        console.error('Backend Error:', error);
        res.status(500).json({ error: 'Error executing code. Try again later.' });
    }
});

// Use a dynamic port if available, otherwise default to 10000
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
