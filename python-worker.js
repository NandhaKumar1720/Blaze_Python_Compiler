const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Utility function to clean up temporary files
function cleanupFiles(...files) {
    files.forEach((file) => {
        try {
            fs.unlinkSync(file);
        } catch (err) {
            // Ignore errors (for files that may not exist)
        }
    });
}

// Worker logic
(async () => {
    const { code, input } = workerData;

    // Paths for temporary Python script
    const tmpDir = os.tmpdir();
    const sourceFile = path.join(tmpDir, `temp_${Date.now()}.py`);

    try {
        // Write the Python code to the source file
        fs.writeFileSync(sourceFile, code);

        // Execute the Python code using Python's execSync
        const pythonCommand = "python3"; // Use python3 if that's the correct interpreter in your environment
        let output = "";

        try {
            output = execSync(`${pythonCommand} ${sourceFile}`, {
                input, // Pass input to the Python script
                encoding: "utf-8", // Ensures we get the output as a string
            });
        } catch (error) {
            // Clean up files before sending an error message
            cleanupFiles(sourceFile);
            return parentPort.postMessage({
                error: { fullError: `Runtime Error:\n${error.message}` },
            });
        }

        // Clean up temporary Python file after execution
        cleanupFiles(sourceFile);

        // Send the output back to the main thread
        parentPort.postMessage({
            output: output || "No output received!",
        });
    } catch (err) {
        // Clean up files and send server error if anything goes wrong
        cleanupFiles(sourceFile);
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
