import express from "express";
var server = express();
import http from "http";
var httpServer = http.createServer(server);
import { PieceColor } from "./enum/PieceColor.js";
import path from 'path';
import { fileURLToPath } from 'url';
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var port = process.env.PORT || 5000;
function generateID() {
    var s4 = function () {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };
    //return id of format "aaaaaaaa"
    return s4() + s4();
}
server.use('/public', express.static(__dirname + '/public'));
server.use('/pieces', express.static(__dirname + '/pieces'));
server.use('/sfx', express.static(__dirname + '/sfx'));
server.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/home.html");
});
import { Server } from "socket.io";
var io = new Server(httpServer, {
    cors: { origin: '*' }
});
var socketRoomData = {};
function createLobby(id) {
    console.log("creating room with id : ".concat(id));
    socketRoomData[id] = {
        moveArray: [],
        turn: PieceColor.White,
        players: []
    };
    server.get("/".concat(id), function (req, res) {
        res.sendFile(__dirname + "/public/chess.html");
    });
}
io.on('connection', function (socket) {
    console.log("Got connection from ".concat(socket));
    socket.on("lobby", function (lobbyId) {
        if (lobbyId == undefined) {
            throw new Error("ERROR : lobbyId is undefined...");
        }
        socketRoomData[lobbyId].players.push(socket.id);
        socket.join(lobbyId);
        socket.emit("get-board", { moveArray: socketRoomData[lobbyId].moveArray, turn: socketRoomData[lobbyId].turn });
        console.log(socketRoomData[lobbyId]);
        if (socketRoomData[lobbyId].players.length <= 2) {
            var pieceColor = void 0;
            if (socket.id === socketRoomData[lobbyId].players[0]) {
                pieceColor = PieceColor.White;
            }
            else if (socket.id === socketRoomData[lobbyId].players[1]) {
                pieceColor = PieceColor.Black;
            }
            console.log("pieceColor : ".concat(pieceColor));
            socket.emit("player-connect", pieceColor);
        }
        else {
            socket.emit("spectator-connect");
        }
    });
    socket.on("create-lobby", function () {
        console.log("SOCKET ON CREATE-LOBBY");
        var id = generateID();
        createLobby(id);
        socket.emit("redirect", id);
    });
    socket.on("move", function (move) {
        socketRoomData[move.lobbyId].turn = move.turn;
        socketRoomData[move.lobbyId].moveArray.push(move.coordinate);
        io.to(move.lobbyId).emit('move', move);
    });
    // socket.on('disconnect', () => {
    //     if (socketRoomData[lobbyId] !== undefined) {
    //         removeSocketId(socket.id)
    //         if (socketRoomData[lobbyId].players.length === 0) {
    //             socketRoomData[lobbyId].moveArray = [];
    //             socketRoomData[lobbyId].turn = PieceColor.White;
    //         }
    //     }
    // })
});
// To solve reconnect use localStorage:
// 1. createId for White & CreateId for Black and store in socketRoomData object
// 2. Once a player connects to room and registers as White/Black, send the whiteId and blackId to each person and store on localStorage. 
//      When user loads url, check if id matches with socketRoomData ids, 
//      if it does not match then user is spectator. If match then he is black/white.
// function removeSocketId(id) {
//     let newArray = [];
//     for (let i = 0; i < socketRoomData[lobbyId].players.length; i++) {
//         if (socketRoomData[lobbyId].players[i] !== id) newArray.push(socketRoomData[lobbyId].players[i]);
//     }
//     if (newArray[0] !== socketRoomData[lobbyId].players[0]) {
//         io.to(socketRoomData[lobbyId].players[2]).emit("player-connect", PieceColor.White)
//     } else if (newArray[1] !== socketRoomData[lobbyId].players[1]) {
//         io.to(socketRoomData[lobbyId].players[2]).emit("player-connect", PieceColor.Black)
//     }
//     socketRoomData[lobbyId].players = newArray;
// }
httpServer.listen(port, function () { return console.log("listening port:".concat(port)); });
