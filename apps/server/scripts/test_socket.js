const { io } = require("socket.io-client");

const socket1 = io("ws://localhost:8080");

socket1.on("connect", () => {
    console.log("Client 1 connected with id:", socket1.id);

    // Join lobby
    console.log("Sending join_lobby for Player1");
    socket1.emit("join_lobby", "Player1");
});

socket1.on("lobby_status", (data) => {
    console.log("Client 1 received lobby_status:", data);

    // Only connect client 2 after client 1 receives its first status
    if (data.players.length === 1) {
        const socket2 = io("ws://localhost:8080");

        socket2.on("connect", () => {
            console.log("Client 2 connected with id:", socket2.id);
            console.log("Sending join_lobby for Player2");
            socket2.emit("join_lobby", "Player2");
        });

        socket2.on("lobby_status", (data2) => {
            console.log("Client 2 received lobby_status:", data2);
            socket2.disconnect();
        });
    } else if (data.players.length === 2) {
        socket1.disconnect();
        console.log("Test finished.");
        process.exit(0);
    }
});

socket1.on("connect_error", (err) => {
    console.error("Client 1 connection error:", err.message);
    process.exit(1);
});
