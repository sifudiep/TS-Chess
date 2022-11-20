import express from "express"
const server = express();
import http from "http"
const httpServer = http.createServer(server);
import {Request, Response} from "express"
import { Coordinate } from "./classes/Coordinate.js";
import { PieceColor } from "./enum/PieceColor.js";

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 5000;
function generateID() : string {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    //return id of format "aaaaaaaa"
    return s4() + s4()
}

server.use('/public', express.static(__dirname + '/public'));
server.use('/pieces', express.static(__dirname + '/pieces'));
server.use('/sfx', express.static(__dirname + '/sfx'))

server.get('/', (req : Request, res : Response) => {
    res.sendFile(__dirname + "/public/home.html");
})

import { Server, Socket } from "socket.io";

const io = new Server(httpServer, {
    cors: { origin: '*' }   
})

type socketRoomData = {
    [id : string] : {
        moveArray: Coordinate[];
        turn : PieceColor;
        players : any[];
        whiteId? : string;
        blackId? : string;
    }
}

const socketRoomData : socketRoomData = {}

function createLobby(id : string) {
    console.log(`creating room with id : ${id}`);
    socketRoomData[id] = {
        moveArray : [],
        turn : PieceColor.White,
        players: []
    }
    server.get(`/${id}`, (req : Request, res : Response) => {
        res.sendFile(__dirname + "/public/chess.html");
    })
}

io.on('connection', (socket : Socket) => {
    console.log(`Got connection from ${socket}`);
    socket.on("lobby", (lobbyId : string | undefined) => {
        if (lobbyId == undefined) {
            throw new Error("ERROR : lobbyId is undefined...")
        }

        socketRoomData[lobbyId].players.push(socket.id);
        socket.join(lobbyId);
        socket.emit("get-board", { moveArray : socketRoomData[lobbyId].moveArray, turn: socketRoomData[lobbyId].turn  });

        console.log(socketRoomData[lobbyId]);
        if (socketRoomData[lobbyId].players.length <= 2) {
            let pieceColor;
            if (socket.id === socketRoomData[lobbyId].players[0]) {
                pieceColor = PieceColor.White;
            } else if (socket.id === socketRoomData[lobbyId].players[1]) {
                pieceColor = PieceColor.Black;
            }
            console.log(`pieceColor : ${pieceColor}`);
            socket.emit("player-connect", pieceColor);
        } else {
            socket.emit("spectator-connect")
        }
    })


    socket.on("create-lobby", () => {
        console.log(`SOCKET ON CREATE-LOBBY`);
        const id = generateID();
        createLobby(id);
        socket.emit("redirect", id);
    })
    
    socket.on("move", (move) => {
        socketRoomData[move.lobbyId].turn = move.turn;
        socketRoomData[move.lobbyId].moveArray.push(move.coordinate)
        io.to(move.lobbyId).emit('move', move)
    })


    // socket.on('disconnect', () => {
    //     if (socketRoomData[lobbyId] !== undefined) {
    //         removeSocketId(socket.id)
    //         if (socketRoomData[lobbyId].players.length === 0) {
    //             socketRoomData[lobbyId].moveArray = [];
    //             socketRoomData[lobbyId].turn = PieceColor.White;
    //         }
    //     }
    // })
})

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



httpServer.listen(port, () => console.log(`listening port:${port}`));

