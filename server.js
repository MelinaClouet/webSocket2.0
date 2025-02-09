const express = require("express");
const path = require("path");
//const { startWebSocketServer } = require("./backend/websocket-server.js");
const app = express();
const port = 3000;

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, "/frontend/public")));

// Démarrer le serveur HTTP
const server = app.listen(port, () => {
    console.log(`Frontend disponible sur http://localhost:${port}`);
});

