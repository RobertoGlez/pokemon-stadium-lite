const { io } = require("socket.io-client");

const socket1 = io("ws://localhost:8080");
let p1ReadySent = false;
let p2ReadySent = false;

socket1.on("connect", () => {
    console.log("Client 1 connected with id:", socket1.id);
    console.log("Sending join_lobby for Player1");
    socket1.emit("join_lobby", "Player1");
});

socket1.on("lobby_status", (data) => {
    if (data.players && data.players.length === 1) {
        const p1Data = data.players[0];
        if (!p1Data.team || p1Data.team.length === 0) {
            socket1.emit("assign_pokemon");
        } else if (p1Data.team.length === 3 && !p1ReadySent) { // team is assigned
            // Connect client 2
            const socket2 = io("ws://localhost:8080");

            socket2.on("connect", () => {
                console.log("Client 2 connected with id:", socket2.id);
                socket2.emit("join_lobby", "Player2");
            });

            socket2.on("lobby_status", (data2) => {
                if (data2.players.length === 2) {
                    const p2Data = data2.players.find(p => p.nickname === 'Player2');

                    if (!p2Data.team || p2Data.team.length === 0) {
                        socket2.emit("assign_pokemon");
                    } else if (p2Data.team.length === 3 && !p2ReadySent) {
                        console.log("Both players have teams. Emitting ready.");
                        p1ReadySent = true;
                        p2ReadySent = true;
                        socket1.emit("ready");
                        socket2.emit("ready");
                    }
                }
            });

            socket2.on("battle_start", (battleData) => {
                console.log("Client 2 received battle_start:", JSON.stringify(battleData, null, 2));
            });
        }
    }
});

socket1.on("battle_start", (battleData) => {
    console.log("Client 1 received battle_start:", JSON.stringify(battleData, null, 2));
    setTimeout(() => process.exit(0), 1000); // give time to print
});
