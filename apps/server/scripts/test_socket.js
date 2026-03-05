const { io } = require("socket.io-client");

const socket1 = io("ws://localhost:8080");

socket1.on("connect", () => {
    console.log("Client 1 connected with id:", socket1.id);
    console.log("Sending join_lobby for Player1");
    socket1.emit("join_lobby", "Player1");
});

socket1.on("lobby_status", (data) => {
    console.log("Client 1 received lobby_status:", JSON.stringify(data, null, 2));

    // Check if player 1 is alone
    if (data.players && data.players.length === 1) {
        // Player 1 joined alone, let's ask for assignments
        const p1Data = data.players[0];
        if (!p1Data.team || p1Data.team.length === 0) {
            console.log("Requesting team for Player1");
            socket1.emit("assign_pokemon");
        } else {
            console.log("Player 1 has team:", p1Data.team);

            // Connect client 2
            const socket2 = io("ws://localhost:8080");

            socket2.on("connect", () => {
                console.log("Client 2 connected with id:", socket2.id);
                console.log("Sending join_lobby for Player2");
                socket2.emit("join_lobby", "Player2");
            });

            socket2.on("lobby_status", (data2) => {
                console.log("Client 2 received lobby_status:", JSON.stringify(data2, null, 2));
                if (data2.players.length === 2) {
                    const p2Data = data2.players.find(p => p.nickname === 'Player2');
                    if (!p2Data.team || p2Data.team.length === 0) {
                        console.log("Requesting team for Player2...");
                        socket2.emit("assign_pokemon");
                    } else {
                        console.log("Player 2 has team:", p2Data.team);
                        console.log("Both players have teams. Test finished.");
                        socket2.disconnect();
                        socket1.disconnect();
                        process.exit(0);
                    }
                }
            });
        }
    } else if (data.players && data.players.length === 2) {
        // Ignore, handled by client 2
    }
});

socket1.on("connect_error", (err) => {
    console.error("Client 1 connection error:", err.message);
    process.exit(1);
});
