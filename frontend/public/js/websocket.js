import { initMap, addMarker } from './map.js';
const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => {
    console.log("✅ Connexion WebSocket réussie");
};

socket.onmessage = (event) => {
    console.log("📩 Message brut reçu du serveur :", event.data);

    let data;
    try {
        data = JSON.parse(event.data);
        console.log("📨 Message JSON parsé :", data);
    } catch (error) {
        console.error("❌ Erreur lors du parsing JSON :", error);
        return;
    }

    if (data.type === 'update-users') {
        console.log("👥 Mise à jour de la liste des utilisateurs :", data.users);
        data.users.forEach((user) => {
            addMarker(user.latitude, user.longitude, user.name, user.email);
        });
    }
};

socket.onerror = (error) => {
    console.error("❌ Erreur WebSocket :", error);
};

socket.onclose = () => {
    console.log("🔴 Connexion WebSocket fermée");
};

// Fonction pour envoyer un message
export function sendWebSocketMessage(data) {
    if (socket.readyState === WebSocket.OPEN) {
        console.log("📤 Envoi de données via WebSocket :", data);
        socket.send(JSON.stringify(data));
    } else {
        console.error("❌ Le WebSocket n’est pas connecté.");
    }
}

// Fonction pour écouter les messages sans écraser onmessage
export function onWebSocketMessage(callback) {
    socket.addEventListener("message", (event) => {
        let data;
        try {
            data = JSON.parse(event.data);
        } catch (error) {
            data = { type: "raw", message: event.data };
        }
        callback(data);
    });
}
