const express = require("express");
const server = express();
const httpServer = require("http").createServer(server);

const port = process.env.PORT || 3000;

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
    console.log("a user has connected...")

    socket.on("move", (move) => {
        console.log(move);
        io.emit('move', move)
    })
})

httpServer.listen(port, () => console.log(`listening port:${port}`));