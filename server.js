const PieceColor = require("./enum/PieceColor.js").PieceColor
const express = require("express");
const server = express();
const httpServer = require("http").createServer(server);

const port = process.env.PORT || 3000;

let lobbyId;

let generateID = () => {
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

server.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/home.html");
})

const io = require('socket.io')(httpServer, {
    cors: { origin: '*' }
});


let socketRoomData = {
    
}

function createLobby(id) {
    socketRoomData[id] = {
        moveArray : [],
        turn : PieceColor.White,
        players: []
    }
    server.get(`/${id}`, (req, res) => {
        res.sendFile(__dirname + "/public/chess.html");
    })
}

io.on('connection', (socket) => {
    socket.on("lobby", (data) => {
        lobbyId = data;
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
        lobbyId = generateID();
        createLobby(lobbyId);
        socket.emit("redirect", lobbyId);
    })

    socket.on("reset", () => {
        socketRoomData[move.lobbyId].moveArray = [];
        socketRoomData[move.lobbyId].turn = PieceColor.White;
        io.emit("redraw-board");
    })

    socket.on("move", (move) => {
        socketRoomData[move.lobbyId].turn = move.turn;
        socketRoomData[move.lobbyId].moveArray.push(move.coordinate)
        io.to(move.lobbyId).emit('move', move)
    })


    socket.on('disconnect', () => {
        if (socketRoomData[lobbyId] !== undefined) {
            removeSocketId(socket.id)
            if (socketRoomData[lobbyId].players.length === 0) {
                socketRoomData[lobbyId].moveArray = [];
                socketRoomData[lobbyId].turn = PieceColor.White;
            }
        }
    })
})

function removeSocketId(id) {
    let newArray = [];
    for (let i = 0; i < socketRoomData[lobbyId].players.length; i++) {
        if (socketRoomData[lobbyId].players[i] !== id) newArray.push(socketRoomData[lobbyId].players[i]);
    }
    if (newArray[0] !== socketRoomData[lobbyId].players[0]) {
        io.to(socketRoomData[lobbyId].players[2]).emit("player-connect", PieceColor.White)
    } else if (newArray[1] !== socketRoomData[lobbyId].players[1]) {
        io.to(socketRoomData[lobbyId].players[2]).emit("player-connect", PieceColor.Black)
    }
    socketRoomData[lobbyId].players = newArray;
}



httpServer.listen(port, () => console.log(`listening port:${port}`));