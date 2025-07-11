# Presence App

## Installation

1. Cloner le repo
2. Copier `.env.example` en `.env` et configurer `MONGODB_URI`, `JWT_SECRET`, SMTP etc.
3. Installer les dépendances: `npm install`
4. Créer l’admin: `node seed-admin.js`
5. Lancer le serveur: `npm start`

## Fonctionnalités

- Inscription / connexion avec validation email via code 2FA
- Dashboard admin avec liste utilisateurs & statut de présence
- Pointage utilisateur avec géolocalisation et statut (présent, retard, absent)
- Gestion JWT & rôles
- Marquage manuel des absents par admin

## Frontend

- Tout est dans `public/index.html`
- Utilise Tailwind CSS compilé localement
- Communication via fetch API

## Backend

- Express.js + MongoDB
- Routes: `/auth`, `/attendance`, `/admin`