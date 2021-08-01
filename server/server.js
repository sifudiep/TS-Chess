const http = require("http").createServer();

const io = require('socket.io')(http, {
    cors: { origin: '*'}
});

io.on('connection', (socket) => {
    console.log("a user has connected...")

    socket.on("move", (move) => {
        console.log(move);
        io.emit('move', move)
    })
})

http.listen(8080, () => console.log('listening localhost:8080'));