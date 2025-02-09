const WebSocket = require("ws");
const axios = require("axios");

const PORT = 8080;
const API_URL = "http://localhost:4000/api/users";

const wss = new WebSocket.Server({ port: PORT });

console.log(`✅ WebSocket Server en cours d'exécution sur ws://localhost:${PORT}`);

wss.on("connection", async (ws) => {
    console.log("✅ Nouveau client WebSocket connecté !");
    console.log(`📡 Nombre de clients connectés : ${wss.clients.size}`);

    try {
        const usersResponse = await axios.get(API_URL + "/connect");
        ws.send(JSON.stringify({
            type: "update-users",
            users: usersResponse.data
        }));
        console.log("✅ Liste des utilisateurs envoyée au client.");
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
    }

    ws.on("message", async (message) => {
        console.log("📩 Message reçu :", message);
        try {
            const data = JSON.parse(message);

            if (data.type === "add-user") {
                console.log(`✅ Nouvel utilisateur ajouté : ${data.name}`);

                await axios.post(API_URL, {
                    name: data.name,
                    email: data.email,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    isConnected: true,
                });

                const usersResponse = await axios.get(API_URL + "/connect");
                const updatedUsers = usersResponse.data;

                console.log("✅ Liste mise à jour :", updatedUsers);

                console.log("📡 Diffusion des utilisateurs mis à jour...");
                broadcast({
                    type: "update-users",
                    users: updatedUsers,
                });
            } else {
                console.log("❌ Type de message inconnu :", data.type);
                ws.send(JSON.stringify({ type: "error", message: "Type de message non valide." }));
            }
        } catch (error) {
            console.error("❌ Erreur traitement message :", error);
            ws.send(JSON.stringify({ type: "error", message: "Erreur serveur." }));
        }
    });

    ws.on("close", () => {
        console.log("🔴 Client WebSocket déconnecté");
        console.log(`📡 Nombre de clients connectés : ${wss.clients.size}`);
    });
});

function broadcast(message) {
    console.log("📡 Envoi à tous les clients connectés :", message);
    console.log(`📡 Clients actuellement connectés : ${wss.clients.size}`);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}
