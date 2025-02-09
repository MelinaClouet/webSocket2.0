const WebSocket = require("ws");
const axios = require("axios");

const PORT = 8080; // Port du serveur WebSocket
const API_URL = "http://localhost:4000/api/users"; // API pour la gestion des utilisateurs
let clients = []; // Liste des utilisateurs connectés

const wss = new WebSocket.Server({ port: PORT });

console.log(`✅ WebSocket Server en cours d'exécution sur ws://localhost:${PORT}`);

wss.on("connection", async (ws) => {
    console.log("✅ Nouveau client WebSocket connecté !");
    console.log(`📡 Nombre de clients connectés : ${wss.clients.size}`);

    try {
        // Lorsqu'un utilisateur se connecte, l'ajouter à la liste des clients
        clients.push(ws);

        // Envoyer la liste des utilisateurs à tous les clients connectés
        sendUsersList();

        // Envoyer les utilisateurs actuels à ce client
        const usersResponse = await axios.get(`${API_URL}/connect`);
        ws.send(JSON.stringify({
            type: "update-users",
            users: usersResponse.data
        }));

        console.log("✅ Liste des utilisateurs envoyée au client.");
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
    }

    // Lors de la réception d'un message
    ws.on("message", async (message) => {
        console.log("📩 Message reçu :", message);
        try {
            const data = JSON.parse(message);
            ws.email = data.email; // Associer l'email de l'utilisateur à la connexion WebSocket
            if (data.type === 'offer') {
                // Handle offer
                handleOffer(ws, data);
            }
            if (data.type === 'answer') {
                // Handle answer
                handleAnswer(ws, data);
            }
            if (data.type === "add-user") {
                console.log(`✅ Tentative d'ajout ou mise à jour de l'utilisateur : ${data.email}`);

                try {
                    // Vérifier si l'utilisateur existe déjà dans la base de données
                    const userResponse = await axios.get(`${API_URL}/email/${data.email}`);
                    const existingUser = userResponse.data;

                    if (existingUser) {
                        console.log(`🔄 L'utilisateur existe déjà. Mise à jour des coordonnées pour ${data.email}`);

                        // Mise à jour des coordonnées de l'utilisateur
                        await axios.put(`${API_URL}/${data.email}`, {
                            name: data.name,
                            email: data.email,
                            latitude: data.latitude,
                            longitude: data.longitude,
                            isConnected: true,
                        });
                    } else {
                        console.log(`🆕 Nouvel utilisateur détecté. Ajout en base.`);

                        // Ajout du nouvel utilisateur
                        await axios.post(API_URL, {
                            name: data.name,
                            email: data.email,
                            latitude: data.latitude,
                            longitude: data.longitude,
                            isConnected: true,
                        });
                    }

                    // Récupérer la liste mise à jour des utilisateurs
                    const updatedUsersResponse = await axios.get(`${API_URL}/connect`);
                    const updatedUsers = updatedUsersResponse.data;

                    console.log("✅ Liste mise à jour :", updatedUsers);

                    // Diffuser les utilisateurs mis à jour à tous les clients
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
            else if (data.type === "update-user") {

                console.log(`🔄 L'utilisateur existe déjà. Mise à jour des coordonnées pour ${data.email}`);

                // Mise à jour des coordonnées de l'utilisateur
                await axios.put(`${API_URL}/${data.email}`, {
                    name: data.name,
                    email: data.email,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    isConnected: true,
                });
                const updatedUsersResponse = await axios.get(`${API_URL}/connect`);
                const updatedUsers = updatedUsersResponse.data;

                console.log("✅ Liste mise à jour :", updatedUsers);

                // Diffuser les utilisateurs mis à jour à tous les clients
                broadcast({
                    type: "update-users",
                    users: updatedUsers,
                });

            }
            else if (data.type === "sdp-offer") {
                // Gérer l'offre SDP reçue
                console.log("📩 Offre SDP reçue :", data.offer);
                ws.peerConnection = await handleOffer(data.offer, ws);
            }
            else if (data.type === "sdp-answer") {
                // Gérer la réponse SDP
                console.log("📩 Réponse SDP reçue :", data.answer);
                handleAnswer(data.answer, ws);
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

    // Lors de la fermeture de la connexion WebSocket
    ws.on("close", async () => {
        console.log("🔴 Client WebSocket déconnecté");
        console.log(`📡 Nombre de clients connectés : ${wss.clients.size}`);

        try {
            // Récupérer l'email de l'utilisateur déconnecté
            const email = ws.email;
            if (email) {
                console.log(`🔄 Mise à jour de l'état de connexion pour ${email}`);

                await axios.put(`${API_URL}/disconnect/${email}`, {
                    isConnected: false,
                });

                // Récupérer la liste mise à jour des utilisateurs
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

// Diffuser un message à tous les clients connectés
function broadcast(message) {
    console.log("📡 Envoi à tous les clients connectés :", message);
    console.log(`📡 Clients actuellement connectés : ${wss.clients.size}`);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// Envoyer la liste des utilisateurs à tous les clients connectés
function sendUsersList() {
    const users = clients.map(client => client._socket.remoteAddress); // Exemple avec l'adresse IP
    const message = JSON.stringify({ type: 'users-list', users });
    clients.forEach(client => client.send(message));
}
// Handle WebRTC offer
const handleOffer = (ws, offer) => {
    // Broadcast the offer to all other clients
    wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(offer));
        }
    });
};

// Handle WebRTC answer
const handleAnswer = (ws, answer) => {
    // Broadcast the answer to all other clients
    wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(answer));
        }
    });
};