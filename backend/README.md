
# Systemair Backend API

Backend Express.js pour le système de gestion Systemair avec MySQL et Socket.IO.

## Installation

1. Cloner le projet
2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Configurer la base de données MySQL :
   - Créer une base de données MySQL
   - Modifier les paramètres dans le fichier `.env`

4. Initialiser la base de données :
   ```bash
   npm run init-db
   ```

5. Démarrer le serveur :
   ```bash
   npm run dev
   ```

## Configuration

Modifier le fichier `.env` avec vos paramètres :

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=systemair_db
PORT=3001
JWT_SECRET=votre_secret_jwt
CORS_ORIGIN=http://localhost:5173
```

## Endpoints API

### Authentification (`/api/auth`)
- `POST /login` - Connexion
- `POST /register` - Inscription
- `GET /me` - Profil utilisateur
- `POST /logout` - Déconnexion
- `PUT /change-password` - Changer mot de passe

### Utilisateurs (`/api/users`)
- `GET /` - Liste des utilisateurs (admin)
- `PATCH /:id/activate` - Activer utilisateur (admin)
- `PATCH /:id/deactivate` - Désactiver utilisateur (admin)
- `PATCH /:id/role` - Modifier rôle (admin)
- `DELETE /:id` - Supprimer utilisateur (admin)

### Produits (`/api/products`)
- `GET /` - Liste des produits
- `GET /:id` - Détails produit
- `POST /` - Créer produit (admin/magasinier)
- `PUT /:id` - Modifier produit (admin/magasinier)
- `PATCH /:id/stock` - Modifier stock
- `DELETE /:id` - Supprimer produit (admin/magasinier)

### Projets (`/api/projects`)
- `GET /` - Liste des projets
- `POST /` - Créer projet (admin/commercial/directeur_commercial)
- `PUT /:id` - Modifier projet
- `DELETE /:id` - Supprimer projet

### Demandes d'achat (`/api/purchases`)
- `GET /` - Liste des demandes
- `POST /` - Créer demande
- `PATCH /:id/approve` - Approuver demande
- `PATCH /:id/reject` - Rejeter demande

### Livraisons (`/api/deliveries`)
- `GET /` - Liste des livraisons
- `POST /` - Créer livraison
- `PATCH /:id/status` - Modifier statut

## Socket.IO

Le serveur Socket.IO est configuré pour les mises à jour temps réel :
- Connexion sur le même port que l'API
- Événements automatiques pour les CRUD produits
- Support des rooms pour notifications ciblées

## Compte Admin par défaut

- Email: `admin@systemair.ma`
- Mot de passe: `admin123`

## Structure des dossiers

```
backend/
├── api/              # Configuration Socket.IO
├── middleware/       # Middlewares (auth, upload)
├── models/          # Modèles de données
├── public/          # Fichiers statiques
│   └── uploads/     # Images uploadées
├── routes/          # Routes API
├── .env             # Variables d'environnement
├── init-db.js       # Script d'initialisation DB
└── server.js        # Point d'entrée
```

## Technologies utilisées

- Express.js
- MySQL2
- Socket.IO
- JWT pour l'authentification
- Multer pour l'upload de fichiers
- Bcryptjs pour le hashage des mots de passe
