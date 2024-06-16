import { Socket } from "socket.io";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv"
import { UserManager } from "./managers/UsersManager";

dotenv.config();

const http = require("http")
const {Server} = require("socket.io");
const app = express();

const server = http.createServer(http);
const io = new Server(server, {
    cors: "*"
});

const userManager = new UserManager();
io.on("connection",(socket: Socket) =>{
    console.log("User Joined");
    userManager.addUser("randomUser", socket);
    socket.on("disconnect", () => {
        console.log("User Disconnected");
        userManager.removeUser(socket.id);
    })
});


const port = process.env.PORT || 3000;

server.listen(port, () =>{
    console.log(`Server is running at http://localhost:${port}`)
})


