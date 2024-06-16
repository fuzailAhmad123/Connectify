"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const RoomManager_1 = require("./RoomManager");
class UserManager {
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager_1.RoomManager();
    }
    addUser(name, socket) {
        this.users.push({
            name, socket
        });
        this.queue.push(socket.id);
        console.log("User Added - ", name);
        socket.emit("lobby");
        this.clearQueue(socket);
        this.initHandlers(socket);
    }
    removeUser(socketId) {
        //check filtering logic 
        const user = this.users.find(x => x.socket.id === socketId);
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x !== socketId);
    }
    clearQueue(socket) {
        if (this.queue.length < 2) {
            return;
        }
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        console.log("ID_1  : ", id1 + "ID_2 : ", id2);
        //popping lastID from queue and finding it in users array.
        const user1 = this.users.find(x => x.socket.id === id1);
        const user2 = this.users.find(x => x.socket.id === id2);
        if (!user1 || !user2) {
            return;
        }
        console.log("Creating room");
        const room = this.roomManager.createRoom(user1, user2);
        this.clearQueue(socket);
    }
    initHandlers(socket) {
        socket.on("offer", ({ sdp, roomId }) => {
            console.log("RoomID in IH : ", roomId);
            console.log("Offer received");
            this.roomManager.onOffer(roomId, sdp, socket.id);
        });
        socket.on("answer", ({ sdp, roomId }) => {
            console.log("Offer received");
            this.roomManager.onAnswer(roomId, sdp, socket.id);
            socket.on("add-ice-candidate", ({ candidate, roomId, type }) => {
                this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
            });
        });
    }
}
exports.UserManager = UserManager;
