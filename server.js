const express = require("express");
const bodyParser = require("body-parser");
const { Worker } = require("worker_threads");
const cors = require("cors");
const crypto = require("crypto");
const http = require("http");

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Middleware for JSON parsing
app.use(bodyParser.json());

// In-memory cache to store compiled results
const cache = new Map();
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_SIZE = 100;

// Helper to clean up the cache periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, { timestamp }] of cache.entries()) {
        if (now - timestamp > CACHE_EXPIRATION_TIME) {
            cache.delete(key);
        }
    }
}, 60000); // Run every minute

// POST endpoint for Python code execution
app.post("/", (req, res) => {
    const { code, input } = req.body;

    // Validate input
    if (!code) {
        return res.status(400).json({ error: { fullError: "Error: No code provided!" } });
    }

    // Generate a unique hash for the code
    const codeHash = crypto.createHash("md5").update(code).digest("hex");

    // Check if result is cached
    if (cache.has(codeHash)) {
        return res.json({ output: cache.get(codeHash).result });
    }

    // Create a worker thread for Python code execution
    const worker = new Worker("./python-worker.js", {
        workerData: { code, input },
    });

    worker.on("message", (result) => {
        // Cache the result if successful
        if (result.output) {
            if (cache.size >= MAX_CACHE_SIZE) {
                // Remove the oldest cache entry
                const oldestKey = [...cache.keys()][0];
                cache.delete(oldestKey);
            }
            cache.set(codeHash, { result: result.output, timestamp: Date.now() });
        }
        res.json(result);
    });

    worker.on("error", (err) => {
        res.status(500).json({ error: { fullError: `Worker error: ${err.message}` } });
    });

    worker.on("exit", (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "Server is healthy!" });
});


// Self-pinging mechanism to keep the server alive
setInterval(() => {
    http.get(`http://localhost:${port}/health`, (res) => {
        console.log("Health check pinged!");
    });
}, 1 * 60 * 1000); // Ping every 5 minutes

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
