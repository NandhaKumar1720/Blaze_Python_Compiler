import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch'; // For making API requests
import cors from 'cors'; // To handle cross-origin requests

const app = express();

// Enable CORS for all origins (or specify allowed origins)
app.use(cors());

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// POST endpoint to execute Python code using OneCompiler API
app.post('/run', async (req, res) => {
    const { code, input } = req.body; // Extract code and input from the request

    const payload = {
        language: 'python', // Language is set to Python
        stdin: input, // Input for the code
        files: [
            {
                name: 'index.py', // Python script name
                content: code // Python code content
            }
        ]
    };

    try {
        // Make a POST request to OneCompiler API
        const response = await fetch('https://onecompiler-apis.p.rapidapi.com/api/v1/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com',
                'x-rapidapi-key': '7998bb912dmsh687302b90d54c6ep1bafa1jsn83def16b4479' // Your RapidAPI Key
            },
            body: JSON.stringify(payload), // Send the payload as JSON
        });

        // Check if the response from the API is successful
        if (!response.ok) {
            const errorMessage = `OneCompiler API error: ${response.statusText}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        const data = await response.json();
        res.json(data); // Send the output from the OneCompiler API back to the frontend
    } catch (error) {
        // Log error details and send a 500 response to the frontend
        console.error('Backend Error:', error);
        res.status(500).json({ error: 'Error executing Python code. Try again later.' });
    }
});

// Use a dynamic port if available, otherwise default to 10000
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
