const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

(async () => {
    const { code } = workerData;
    const tmpDir = os.tmpdir();
    const sourceFile = path.join(tmpDir, `temp_${Date.now()}.py`);
    const correctedFile = path.join(tmpDir, `corrected_${Date.now()}.py`);

    fs.writeFileSync(sourceFile, code);

    try {
        // Auto-correct code using `autopep8`
        execSync(`autopep8 --in-place --aggressive --aggressive ${sourceFile}`);
        const correctedCode = fs.readFileSync(sourceFile, "utf-8");

        // Send corrected code back
        parentPort.postMessage({ correctedCode });
    } catch (error) {
        parentPort.postMessage({ correctedCode: code }); // Return original if correction fails
    } finally {
        fs.unlinkSync(sourceFile);
    }
})();
