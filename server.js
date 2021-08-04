const PieceColor = require("./enum/PieceColor.js").PieceColor
const express = require("express");
const server = express();
const httpServer = require("http").createServer(server);

const port = process.env.PORT || 3000;

let moveArray = [];
let turn = PieceColor.White;

server.use('/public', express.static(__dirname + '/public'));
server.use('/pieces', express.static(__dirname + '/pieces'));
server.use('/sfx', express.static(__dirname + '/sfx'))

server.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
})

const io = require('socket.io')(httpServer, {
    cors: { origin: '*' }
});

let players = [];

io.on('connection', (socket) => {
    players.push(socket.id);

    socket.on("reset", () => {
        moveArray = [];
        turn = PieceColor.White;
        io.emit("redraw-board");
    }) 

    socket.on("move", (move) => {
        turn = move.turn;
        moveArray.push(move.coordinate);
        io.emit('move', move)
    })

    socket.emit("get-board", { moveArray, turn });

    if (io.engine.clientsCount <= 2) {
        let pieceColor;
        if (socket.id === players[0]) {
            pieceColor = PieceColor.White;
        } else if (socket.id === players[1]) {
            pieceColor = PieceColor.Black;
        }
        socket.emit("success-connect", pieceColor);
    }

    socket.on('disconnect', () => {
        removeSocketId(players, socket.id)
        if (io.engine.clientsCount === 0) {
            moveArray = [];
            turn = PieceColor.White;
            return;
        }

    })
})

function removeSocketId(array, id) {
    let newArray = []
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== id) newArray.push(array[i]);
    }
    if (newArray[0] !== players[0]) {
        io.to(players[2]).emit("success-connect", PieceColor.White)
    } else if (newArray[1] !== players[1]) {
        io.to(players[2]).emit("success-connect", PieceColor.Black)
    }
    players = newArray;
}



httpServer.listen(port, () => console.log(`listening port:${port}`));