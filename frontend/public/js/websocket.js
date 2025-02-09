const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => {
    console.log("Connexion WebSocket réussie");
};

socket.onmessage = (event) => {
    console.log("Message du serveur :", event.data);
};

socket.onerror = (error) => {
    console.error("Erreur WebSocket :", error);
};

socket.onclose = () => {
    console.log("Connexion WebSocket fermée");
};

// Fonction pour envoyer des données utilisateur au serveur WebSocket
export function sendWebSocketMessage(data) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    } else {
        console.error("Le WebSocket n’est pas connecté.");
    }
}

// Fonction pour gérer les messages reçus du serveur WebSocket
export function onWebSocketMessage(callback) {
    socket.onmessage = (event) => {
        let data;
        try {
            data = JSON.parse(event.data); // Traiter les données JSON
        } catch (error) {
            data = { type: "raw", message: event.data }; // Si ce n'est pas JSON
        }
        callback(data);
    };
}