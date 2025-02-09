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
            ws.email = data.email;
            if (data.type === "add-user") {
                console.log(`✅ Tentative d'ajout ou mise à jour de l'utilisateur : ${data.email}`);

                try {
                    // Vérifier si l'utilisateur existe déjà avec un GET sur l'email
                    const userResponse = await axios.get(`${API_URL}/email/${data.email}`);
                    const existingUser = userResponse.data;

                    if (existingUser) {
                        console.log(`🔄 L'utilisateur existe déjà. Mise à jour des coordonnées pour ${data.email}`);

                        // Mise à jour des coordonnées avec un PUT
                        await axios.put(`${API_URL}/${data.email}`, {
                            name: data.name,
                            email: data.email,
                            latitude: data.latitude,
                            longitude: data.longitude,
                            isConnected: true,
                        });
                    } else {
                        console.log(`🆕 Nouvel utilisateur détecté. Ajout en base.`);

                        // Ajout du nouvel utilisateur avec un POST
                        await axios.post(API_URL, {
                            name: data.name,
                            email: data.email,
                            latitude: data.latitude,
                            longitude: data.longitude,
                            isConnected: true,
                        });
                    }

                    // Récupérer la liste mise à jour des utilisateurs
                    const usersResponse = await axios.get(`${API_URL}/connect`);
                    const updatedUsers = usersResponse.data;

                    console.log("✅ Liste mise à jour :", updatedUsers);

                    // Diffuser les utilisateurs mis à jour à tous les clients connectés
                    console.log("📡 Diffusion des utilisateurs mis à jour...");
                    broadcast({
                        type: "update-users",
                        users: updatedUsers,
                    });

                } catch (error) {
                    console.error("❌ Erreur lors du traitement de l'utilisateur :", error);

                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Erreur lors de l'ajout ou de la mise à jour de l'utilisateur.",
                    }));
                }
            }
            else {
                console.log("❌ Type de message inconnu :", data.type);
                ws.send(JSON.stringify({ type: "error", message: "Type de message non valide." }));
            }
        } catch (error) {
            console.error("❌ Erreur traitement message :", error);
            ws.send(JSON.stringify({ type: "error", message: "Erreur serveur." }));
        }
    });

    ws.on("close", async () => {
        console.log("🔴 Client WebSocket déconnecté");
        console.log(`📡 Nombre de clients connectés : ${wss.clients.size}`);

        try {
            // Récupérer l'email de l'utilisateur déconnecté (tu dois stocker cette info lors de la connexion)
            const email = ws.email; // Tu devras assigner l'email à ws.email lors de l'ajout

            if (email) {
                console.log(`🔄 Mise à jour de l'état de connexion pour ${email}`);

                await axios.put(`${API_URL}/disconnect/${email}`, {
                    isConnected: false,
                });

                // Récupérer la liste mise à jour des utilisateurs connectés
                const usersResponse = await axios.get(`${API_URL}/connect`);
                const updatedUsers = usersResponse.data;

                console.log("📡 Diffusion des utilisateurs mis à jour...");
                broadcast({
                    type: "update-users",
                    users: updatedUsers,
                });
            } else {
                console.warn("⚠ Aucun email stocké pour ce client WebSocket.");
            }
        } catch (error) {
            console.error("❌ Erreur lors de la mise à jour de la déconnexion :", error);
        }
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
