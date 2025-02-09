import { initMap, addMarker } from './map.js';
import { sendWebSocketMessage, onWebSocketMessage } from './websocket.js';

let map; // Instance de la carte Google Maps
let markers = {}; // Stocker les marqueurs par email

// Initialise la carte et récupère la géolocalisation de l'utilisateur
window.initMap = () => {
    const mapElement = document.getElementById('map');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userCoords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            map = initMap(mapElement, userCoords);
            console.log('Carte centrée sur la position de l’utilisateur :', userCoords);
        },
        () => {
            const defaultCoords = { lat: 48.8566, lng: 2.3522 }; // Paris
            map = initMap(mapElement, defaultCoords);
            console.log('Carte centrée sur la position par défaut :', defaultCoords);
        }
    );
};

// Gestion de la modal de connexion
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;

    navigator.geolocation.getCurrentPosition((position) => {
        const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        };

        sendWebSocketMessage({
            type: 'add-user',
            email: email,
            name: name,
            latitude: userCoords.lat,
            longitude: userCoords.lng,
            //longitude:50,
            isConnected:true,
        });

        addMarker(userCoords.lat, userCoords.lng, name, email);
        console.log(`Utilisateur connecté : ${name} (${email})`);
    });

    loginModal.style.display = 'none';
});

// Gestion des messages WebSocket
onWebSocketMessage((data) => {
    if (data.type === 'users-list') {
        data.users.forEach((user) => {
            if (!markers[user.email]) {
                addMarker(user.latitude, user.longitude, user.name, user.email);
                markers[user.email] = true;
            }
        });
    }

    if (data.type === 'error') {
        console.error('Erreur reçue du serveur WebSocket :', data.message);
    }
});