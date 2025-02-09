let localStream = null;
let socket = null;
let peerConnection;

export function initWebRTC() {
    // Vérification si le navigateur supporte WebRTC
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("WebRTC non supporté par ce navigateur.");
        return;
    }

    // Accès à la caméra et au micro
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            localStream = stream;
            const localVideo = document.getElementById("localVideo");
            localVideo.srcObject = stream;

            // Maintenant que le flux est prêt, on peut démarrer WebRTC
            startWebRTCConnection(localStream);
        })
        .catch((err) => {
            console.error("Erreur d'accès à la caméra/micro : ", err);
        });
}

// Fonction pour démarrer la connexion WebRTC
export function startWebRTCConnection(localStream) {
    if (!localStream) {
        console.error("❌ localStream n'est pas disponible, WebRTC ne peut pas démarrer.");
        return;
    }

    // Initialiser peerConnection ici
    peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
        ],
    });

    // Ajouter le flux local à la connexion WebRTC
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
        const remoteVideo = document.createElement("video");
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.autoplay = true;
        document.getElementById("videoContainer").appendChild(remoteVideo);
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            sendWebSocketMessage({ type: 'new-ice-candidate', candidate: event.candidate });
        }
    };
}

export function onOfferReceived(offer) {
    // Vérifie si peerConnection est initialisé
    if (!peerConnection) {
        console.error("❌ peerConnection n'est pas encore initialisé.");
        return;
    }

    // Vérifier que l'offer est valide et qu'il contient les propriétés nécessaires
    if (!offer || !offer.type || !offer.sdp) {
        console.error("❌ L'offre SDP est invalide :", offer);
        return;
    }

    // Créer une description de session à partir de l'offre reçue
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => {
            return peerConnection.createAnswer();
        })
        .then((answer) => {
            return peerConnection.setLocalDescription(answer);
        })
        .then(() => {
            sendWebSocketMessage({ type: 'sdp-answer', answer: peerConnection.localDescription });
        })
        .catch((err) => {
            console.error("Erreur lors de la gestion de l'offre : ", err);
        });
}


export function onAnswerReceived(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        .catch((err) => {
            console.error("Erreur lors du traitement de la réponse : ", err);
        });
}

export function onIceCandidateReceived(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        .catch((err) => {
            console.error("Erreur lors de l'ajout du candidat ICE : ", err);
        });
}

// Fonction pour envoyer un message via WebSocket
function sendWebSocketMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    }
}
