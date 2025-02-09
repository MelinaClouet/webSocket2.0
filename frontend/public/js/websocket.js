import { initMap, addMarker } from './map.js';
const socket = new WebSocket("wss://privacy-a-compensation-terrain.trycloudflare.com     ");
let usersList = []; // Liste des utilisateurs connectés
import {onAnswerReceived,onOfferReceived,onIceCandidateReceived, initWebRTC} from './webrtc.js';



socket.onopen = () => {
    console.log("✅ Connexion WebSocket réussie");
    initWebRTC();
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

    switch (data.type){
        case 'update-users':
            data.users.forEach((user) => {
                addMarker(user.latitude, user.longitude, user.name, user.email);
            });
        case 'sdp-offer':
            onOfferReceived(data.offer);
            break;
        case 'sdp-answer':
            onAnswerReceived(data.answer);
            break;
        case 'new-ice-candidate':
            onIceCandidateReceived(data.candidate);
            break;

        default:
            console.warn("⚠️ Type de message WebSocket inconnu :", data);

    }

    if (data.type === 'update-users') {
        console.log("👥 Mise à jour de la liste des utilisateurs :", data.users);

    }
};

socket.onerror = (error) => {
    console.error("❌ Erreur WebSocket :", error);
};

socket.onclose = () => {
    console.log("🔴 Connexion WebSocket fermée");
};

// Fonction pour envoyer un message
export function sendWebSocketMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error("❌ WebSocket n'est pas connecté ou est fermé.");
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
