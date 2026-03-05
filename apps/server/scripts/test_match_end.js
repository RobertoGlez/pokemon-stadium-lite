// B-US-08 Verification: Match End & Winner Declaration
const { io } = require("socket.io-client");

let p1AssignSent = false;
let p2Created = false;
let p2AssignSent = false;
let p1ReadySent = false;
let p2ReadySent = false;
let battleStarted = false;
let turnCount = 0;
let socket2 = null;

const socket1 = io("ws://localhost:8080");

socket1.on("connect", () => {
    console.log("Client 1 connected");
    socket1.emit("join_lobby", "Player1");
});

socket1.on("lobby_status", (data) => {
    const p1Data = data.players.find(p => p.nickname === 'Player1');
    if (!p1Data) return;

    if ((!p1Data.team || p1Data.team.length === 0) && !p1AssignSent) {
        p1AssignSent = true;
        socket1.emit("assign_pokemon");
        return;
    }

    if (p1Data.team && p1Data.team.length === 3 && !p2Created) {
        p2Created = true;
        console.log("P1 has team. Connecting P2.");
        socket2 = io("ws://localhost:8080");

        socket2.on("connect", () => {
            console.log("Client 2 connected");
            socket2.emit("join_lobby", "Player2");
        });

        socket2.on("lobby_status", (data2) => {
            const p2Data = data2.players.find(p => p.nickname === 'Player2');
            if (!p2Data) return;

            if ((!p2Data.team || p2Data.team.length === 0) && !p2AssignSent) {
                p2AssignSent = true;
                socket2.emit("assign_pokemon");
                return;
            }

            if (p2Data.team && p2Data.team.length === 3 && !p2ReadySent) {
                p1ReadySent = true;
                p2ReadySent = true;
                console.log("Both teams ready. Sending ready signal.");
                socket1.emit("ready");
                socket2.emit("ready");
            }
        });

        const onBattleStart = (battleData) => {
            if (battleStarted) return;
            battleStarted = true;
            console.log("==== BATTLE STARTED ====");
            console.log("First turn:", battleData.currentTurnPlayerId);

            setTimeout(() => {
                socket1.emit("attack");
                socket2.emit("attack");
            }, 300);
        };

        socket1.on("battle_start", onBattleStart);
        socket2.on("battle_start", onBattleStart);

        socket1.on("turn_result", (data) => {
            turnCount++;

            if (data.pokemonFainted) {
                console.log(`=====> Turn ${turnCount}: POKEMON FAINTED <=====`);
                if (data.nextDefenderPokemon) {
                    console.log("Next Pokemon:", data.nextDefenderPokemon.name, `HP: ${data.nextDefenderPokemon.stats.currentHp}`);
                } else {
                    console.log("No more Pokemon available for defender.");
                }
            }

            if (data.matchFinished) {
                console.log(`=====> Turn ${turnCount}: MATCH FINISHED flag received <=====`);
            } else {
                // Keep attacking
                setTimeout(() => {
                    socket1.emit("attack");
                    socket2.emit("attack");
                }, 3); // Super fast attacks to end quickly
            }
        });

        const onBattleEnd = (data) => {
            console.log("==== BATTLE END RECEIVED ====");
            console.log(`Winner ID: ${data.winnerId}`);
            console.log(`Winner Name: ${data.winnerName}`);
            console.log("TEST SUCCESSFUL — B-US-08 VERIFIED");
            process.exit(0);
        };

        socket1.on("battle_end", onBattleEnd);
        socket2.on("battle_end", onBattleEnd);
    }
});

setTimeout(() => {
    console.log("TEST TIMED OUT after 60s");
    process.exit(1);
}, 60000);
