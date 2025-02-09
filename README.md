# Projet WebSocket
Ce projet permet de créer une application de communication en temps réel via WebSocket, où les utilisateurs peuvent se connecter, s'envoyer des messages et interagir en utilisant WebRTC pour la communication audio/vidéo. Le serveur WebSocket gère les connexions et la gestion des utilisateurs via une API distante.


## Prérequis
Node.js : Version 14 ou supérieure
Navigateur : Dernière version de Chrome, Firefox ou Edge pour une meilleure compatibilité avec WebSocket.

## Installation
1. Cloner le projet
   Clonez le dépôt sur votre machine locale :

```bash
git clone https://github.com/MelinaClouet/webSocket2.0.git
cd project-websocket
```

2. Installer les dépendances

Assurez-vous d'avoir Node.js installé, puis exécutez la commande suivante pour installer toutes les dépendances nécessaires :

```bash
npm install
```

3. Démarrer le serveur WebSocket (Back-End)

Depuis le répertoire backend, ouvrez votre terminal et lancez le serveur WebSocket avec Node.js :

```bash
cd backend
node websocket-server.js
```

Cela démarrera le serveur WebSocket sur le port 8080 (modifiable dans le fichier websocket-server.js).


4. Démarrer le Front-End
   Depuis le répertoire frontend, ouvrez votre terminal et lancez l'application front-end avec Node.js :

```bash
node server.js
```

Cela démarrera un serveur qui sera accessible via http://localhost:3000 dans votre navigateur.

## Structure du Projet
```bash
/project-directory
│
├── /backend/
│   ├── websocket-server.js
│
├── /frontend/
│   ├── /public/
│   │   ├── /js/
│   │   │   ├── main.js
│   │   │   ├── map.js
│   │   │   ├── webrtc.js
│   │   │   ├── websocket.js
│   │   ├── index.html
│
└── server.js
```

### Backend
* websocket-server.js : Le serveur WebSocket qui gère les connexions des clients, les messages reçus et l'interface avec l'API distante pour récupérer les informations des utilisateurs.

### Frontend
* public/index.html : La page HTML principale qui contient l'interface utilisateur.
* public/js/main.js : Le fichier JavaScript qui gère l'interaction avec le serveur WebSocket et le traitement des messages reçus.
* public/js/map.js : Le fichier JavaScript pour la gestion de la carte Google Maps.
* public/js/webrtc.js : Le fichier JavaScript pour la gestion des connexions WebRTC (audio/vidéo).
* public/js/websocket.js : Le fichier JavaScript qui gère l'initialisation de la connexion WebSocket.


### Server.js
* server.js : Le fichier qui permet d'héberger le front-end et d'exécuter d'autres services si nécessaire.


## Fonctionnement du Serveur WebSocket
Le serveur WebSocket gère la communication en temps réel entre les clients connectés. Lorsque qu'un utilisateur se connecte, le serveur envoie la liste des utilisateurs actifs et met à jour les informations des utilisateurs dans la base de données distante via l'API.

### Connexion et Communication
* Lorsqu'un utilisateur se connecte, le serveur WebSocket envoie la liste des utilisateurs à tous les autres clients connectés.
* Les utilisateurs peuvent envoyer des messages de type offer, answer, et update-user qui sont traités par le serveur WebSocket pour mettre à jour la base de données distante.

### API Distante
* Le back-end communique avec une API distante pour la gestion des utilisateurs. Cette API permet d'ajouter, mettre à jour, et récupérer les informations des utilisateurs dans une base de données.

### Gestion des Connexions WebSocket
* Le serveur WebSocket gère les connexions et déconnexions des utilisateurs, et met à jour leur statut (isConnected) dans la base de données distante.

### Gestion des WebRTC
* Le serveur WebSocket prend en charge la gestion des offres et réponses WebRTC entre les clients pour permettre la communication en temps réel (audio/vidéo).

## Conclusion
Ce projet implémente une solution de communication en temps réel avec WebSocket, en interagissant avec une API distante pour gérer les utilisateurs. Il peut être étendu pour inclure des fonctionnalités supplémentaires telles que la gestion des messages privés, des notifications en temps réel, et bien plus encore.

