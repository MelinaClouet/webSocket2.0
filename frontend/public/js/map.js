let map; // Carte Google Maps
let markers = []; // Liste des marqueurs ajoutés

/**
 * Initialise la carte Google Maps centrée sur une position.
 * @param {HTMLElement} mapElement - L'élément DOM qui contiendra la carte.
 * @param {Object} coords - Les coordonnées pour centrer la carte ({ lat, lng }).
 * @param {number} zoom - Niveau de zoom de la carte (par défaut : 12).
 */
export function initMap(mapElement, coords, zoom = 12) {
    map = new google.maps.Map(mapElement, {
        center: { lat: coords.lat, lng: coords.lng },
        zoom: zoom,
    });

    console.log("Carte Google Maps initialisée avec succès :", map);
    return map; // Retourne la carte pour les autres fonctions
}

/**
 * Ajoute un marqueur sur la carte.
 * @param {number} latitude - Latitude du marqueur.
 * @param {number} longitude - Longitude du marqueur.
 * @param {string} label - Libellé du marqueur.
 * @param {string} email - Identifiant unique du marqueur (ex : email de l'utilisateur).
 */
export function addMarker(latitude, longitude, label, email) {
    const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: label,
    });

    // Ajouter le marqueur avec son identifiant
    markers.push({
        email: email,
        marker: marker,
    });

    console.log("Marqueur ajouté :", { latitude, longitude, label, email });
}

export const updateMarker = (email, lat, lng) => {
    const marker = markers[email]; // Récupère le marqueur par email

    if (marker) {
        // Met à jour la position du marqueur
        marker.setPosition(new google.maps.LatLng(lat, lng));

        console.log(`Marqueur mis à jour pour ${email} à la position: ${lat}, ${lng}`);
    } else {
        console.log(`Marqueur pour ${email} non trouvé.`);
    }
};