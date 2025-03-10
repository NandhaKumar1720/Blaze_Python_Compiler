const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { spawn } = require("child_process");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend

wss.on("connection", (ws) => {
    console.log("New WebSocket connection established!");

    // Start a shell session (bash or sh)
    const shell = spawn("bash", [], { shell: true });

    // Send data from shell to WebSocket
    shell.stdout.on("data", (data) => {
        ws.send(data.toString());
    });

    shell.stderr.on("data", (data) => {
        ws.send(data.toString());
    });

    // Receive input from WebSocket and write to the shell
    ws.on("message", (message) => {
        shell.stdin.write(message + "\n");
    });

    // Handle process exit
    shell.on("close", () => {
        ws.close();
    });

    ws.on("close", () => {
        shell.kill();
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
