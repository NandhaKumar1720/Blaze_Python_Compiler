const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Utility function to clean up files
function cleanupFiles(...files) {
    files.forEach((file) => {
        try {
            fs.unlinkSync(file);
        } catch (err) {
            // Ignore file deletion errors
        }
    });
}

// Function to auto-correct Python code
function autoCorrectPythonCode(code) {
    const tmpDir = os.tmpdir();
    const sourceFile = `${tmpDir}/temp_${Date.now()}.py`;

    try {
        // Write code to temporary file
        fs.writeFileSync(sourceFile, code);

        // Run autopep8 to format code
        const correctedCode = execSync(`autopep8 --aggressive --aggressive ${sourceFile}`, {
            encoding: "utf-8",
        });

        cleanupFiles(sourceFile);
        return correctedCode;
    } catch (error) {
        cleanupFiles(sourceFile);
        return code; // If auto-correction fails, return the original code
    }
}

// Worker logic
(async () => {
    let { code, input } = workerData;

    // Auto-correct the Python code
    const correctedCode = autoCorrectPythonCode(code);

    // If corrected code is different, return correction before execution
    if (correctedCode !== code) {
        return parentPort.postMessage({
            correctedCode,
            message: "Code was automatically corrected.",
        });
    }

    // Temporary file for execution
    const tmpDir = os.tmpdir();
    const sourceFile = `${tmpDir}/temp_${Date.now()}.py`;

    try {
        // Write corrected Python code to file
        fs.writeFileSync(sourceFile, correctedCode);

        // Execute Python code
        const pythonCommand = "python3";
        let output = "";

        try {
            output = execSync(`${pythonCommand} ${sourceFile}`, {
                input,
                encoding: "utf-8",
            });
        } catch (error) {
            cleanupFiles(sourceFile);
            return parentPort.postMessage({
                error: { fullError: `Runtime Error:\n${error.message}` },
            });
        }

        cleanupFiles(sourceFile);
        parentPort.postMessage({ output });
    } catch (err) {
        cleanupFiles(sourceFile);
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
