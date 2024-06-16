"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const UsersManager_1 = require("./managers/UsersManager");
dotenv_1.default.config();
const http = require("http");
const { Server } = require("socket.io");
const app = (0, express_1.default)();
const server = http.createServer(http);
const io = new Server(server, {
    cors: "*"
});
const userManager = new UsersManager_1.UserManager();
io.on("connection", (socket) => {
    console.log("User Joined");
    userManager.addUser("randomUser", socket);
    socket.on("disconnect", () => {
        console.log("User Disconnected");
        userManager.removeUser(socket.id);
    });
});
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
