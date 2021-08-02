const PieceColor = require("./enum/PieceColor.js")
const express = require("express");
const { createLogicalAnd } = require("typescript");
const server = express();
const httpServer = require("http").createServer(server);



const port = process.env.PORT || 3000;

let moveArray = [];
let turn = PieceColor.White;

server.use('/public' ,express.static(__dirname + '/public'));
server.use('/pieces', express.static(__dirname + '/pieces'));
server.use('/sfx', express.static(__dirname + '/sfx'))

server.get('/*', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
})

const io = require('socket.io')(httpServer, {
    cors: { origin: '*'}
});

io.on('connection', (socket) => {
    socket.on("move", (move) => {
        turn = move.turn;
        moveArray.push(move.coordinate);
        io.emit('move', move)
        console.log(`MOVE: ${move.coordinate}`)
    })

    socket.on("connect-player", (isPlayer) => {
        console.log("player connected! " + io.engine.clientsCount);
        io.emit("get-board", {moveArray});
        if (io.engine.clientsCount <= 2) {
            console.log("successfull connection!!!");
            io.emit("success-connect", {
                isPlayer : true,
                playerName : `Player-${io.engine.clientsCount}`
            });
        }
    })
})

io.on('disconnect', () => {
    if (io.engine.clientsCount === 0) {
        moveArray = [];
        turn = PieceColor.White;
    }
})

httpServer.listen(port, () => console.log(`listening port:${port}`));