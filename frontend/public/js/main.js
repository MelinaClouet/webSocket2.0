import { initMap, addMarker, updateMarker } from './map.js'; // Assurez-vous que vous avez une fonction `updateMarker`
import { sendWebSocketMessage, onWebSocketMessage } from './websocket.js';

let map; // Instance de la carte Google Maps
let markers = {}; // Stocker les marqueurs par email
let userCoords = null; // Coordonnées de l'utilisateur

// Fonction pour actualiser la position de l'utilisateur
const updateUserPosition = () => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            userCoords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            // Si la carte est initialisée, on la centre sur la nouvelle position
            if (map) {
                map.setCenter(userCoords);
            }

            // Si l'utilisateur est déjà marqué sur la carte, on met à jour sa position
            const email = document.getElementById('email').value;
            if (markers[email]) {
                updateMarker(email, userCoords.lat, userCoords.lng);
            }

            console.log('Position mise à jour :', userCoords);

            // Envoie de la nouvelle position via WebSocket
            sendWebSocketMessage({
                type: 'update-user',
                name: document.getElementById('name').value,
                email: email,
                latitude: userCoords.lat,
                longitude: userCoords.lng,
                isConnected: true,
            });
        },
        (error) => {
            console.error('Erreur de géolocalisation :', error);
        }
    );
};

// Initialise la carte et récupère la géolocalisation de l'utilisateur
window.initMap = () => {
    const mapElement = document.getElementById('map');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            userCoords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            map = initMap(mapElement, userCoords);
            console.log('Carte centrée sur la position de l’utilisateur :', userCoords);

            // Mise à jour de la position toutes les 20 secondes
            setInterval(updateUserPosition, 20000); // Réactualiser toutes les 20 secondes
        },
        () => {
            const defaultCoords = { lat: 48.8566, lng: 2.3522 }; // Paris
            map = initMap(mapElement, defaultCoords);
            console.log('Carte centrée sur la position par défaut :', defaultCoords);

            // Mise à jour de la position toutes les 20 secondes
            setInterval(updateUserPosition, 20000); // Réactualiser toutes les 20 secondes
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
            isConnected: true,
        });

        addMarker(userCoords.lat, userCoords.lng, name, email);
        console.log(`Utilisateur connecté : ${name} (${email})`);
    });

    loginModal.style.display = 'none';
});
