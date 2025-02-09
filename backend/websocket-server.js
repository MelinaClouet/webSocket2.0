const WebSocket = require("ws");
const axios = require("axios"); // Importer axios pour les appels HTTP

const PORT = 8080;
const API_URL = "http://localhost:4000/api/users"; // URL de l'API REST

const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket Server en cours d'exécution sur ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
    console.log("Nouvelle connexion WebSocket");

    // Lorsque le serveur reçoit un message
    ws.on("message", async (message) => {
        try {
            // Convertir le message en objet JSON
            const data = JSON.parse(message);

            // Vérifier le type de message
            if (data.type === "add-user") {
                console.log(`Nouvel utilisateur reçu : ${data.name} (${data.email})`);
                console.log(`Position : Latitude ${data.latitude}, Longitude ${data.longitude}`);

                // Envoyer les données à l'API REST
                const response = await axios.post(API_URL, {
                    name: data.name,
                    email: data.email,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    isConnected: true,
                });

                console.log("Réponse de l'API :", response.data);

                // Répondre au client WebSocket avec une confirmation
                ws.send(
                    JSON.stringify({
                        type: "success",
                        message: `Utilisateur ${data.name} ajouté avec succès.`,
                    })
                );

                // Récupérer la liste mise à jour des utilisateurs
                const usersResponse = axios.get(API_URL + "/connected")
                    .then(response => {
                        console.log("Réponse du serveur :", response.data);
                    })
                    .catch(error => {
                        console.error("Erreur lors de la connexion :", error);
                    });
                const updatedUsers = usersResponse.data;

                // Envoyer la liste mise à jour à tous les clients connectés
                broadcast({
                    type: "update-users",
                    users: updatedUsers,
                });


            } else {
                console.log("Type de message inconnu :", data.type);

                // Répondre avec une erreur
                ws.send(
                    JSON.stringify({
                        type: "error",
                        message: "Type de message non valide.",
                    })
                );
            }
        } catch (error) {
            console.error("Erreur lors du traitement du message :", error);

            // Répondre avec une erreur en cas de problème
            ws.send(
                JSON.stringify({
                    type: "error",
                    message: "Erreur lors de l'ajout de l'utilisateur.",
                })
            );
        }
    });

    // Lorsque la connexion est fermée
    ws.on("close", () => {
        console.log("Connexion WebSocket fermée");
    });
});
function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}