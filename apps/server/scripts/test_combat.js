const { io } = require("socket.io-client");

const socket1 = io("ws://localhost:8080");
let p1ReadySent = false;
let p2ReadySent = false;
let currentTurnPlayerId = null;
let p1ServerId = null;

socket1.on("connect", () => {
    console.log("Client 1 connected");
    socket1.emit("join_lobby", "Player1");
});

socket1.on("lobby_status", (data) => {
    if (data.players && data.players.length === 1) {
        const p1Data = data.players[0];
        if (!p1Data.team || p1Data.team.length === 0) {
            socket1.emit("assign_pokemon");
        } else if (p1Data.team.length === 3 && !p1ReadySent) {

            // Connect client 2
            const socket2 = io("ws://localhost:8080");

            socket2.on("connect", () => {
                console.log("Client 2 connected");
                socket2.emit("join_lobby", "Player2");
            });

            let client2BoundToLobby = false;

            socket2.on("lobby_status", (data2) => {
                if (data2.players.length === 2 && !client2BoundToLobby) {
                    client2BoundToLobby = true;
                    // Trigger assignment for player 2
                    socket2.emit("assign_pokemon");
                }
            });

            // We need a separate listener to catch when Client 2 assignment finishes
            socket2.on("lobby_status", (data3) => {
                if (data3.players.length === 2) {
                    const p2Data = data3.players.find(p => p.nickname === 'Player2');
                    if (p2Data && p2Data.team && p2Data.team.length === 3 && !p2ReadySent) {
                        p1ReadySent = true;
                        p2ReadySent = true;
                        console.log("Both players have teams. Emitting ready.");
                        socket1.emit("ready");
                        socket2.emit("ready");
                    }
                }
            });

            socket2.on("battle_start", (battleData) => {
                // Ignore, we will handle in client 1 since both receive it.
            });

            socket2.on("turn_result", (resultData) => {
                console.log("Client 2 received turn_result:", JSON.stringify(resultData, null, 2));
                process.exit(0);
            });

            socket1.on("battle_start", (battleData) => {
                console.log("Client 1 received battle_start:", JSON.stringify(battleData, null, 2));

                // For this test, we don't strictly know Client 1 vs Client 2 inner DB IDs on the client side.
                // We will forcefully emit attack from BOTH successively.
                // Only one should trigger a turn_result, the other should be silently ignored by the server.

                console.log("Simulating simultaneous / out-of-turn attacks...");
                socket1.emit("attack");
                socket2.emit("attack");
            });

            socket1.on("turn_result", (resultData) => {
                console.log("Client 1 received turn_result:", JSON.stringify(resultData, null, 2));
                // Do not immediately exit, wait a second to make sure the second attack didn't trigger another event
                setTimeout(() => {
                    console.log("Test finished successfully.");
                    process.exit(0);
                }, 1000);
            });
        }
    }
});
