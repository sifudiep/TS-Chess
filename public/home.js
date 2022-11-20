const socket = io("https://ts-chess.onrender.com/");
// const socket = io("ws://localhost:3000")

socket.on('redirect', (data) => {
    window.location.href += data
})

function createLobby() {
    console.log(`click!`);
    socket.emit("create-lobby")

}


