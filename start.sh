#!/bin/bash

echo " Lancement de l'application..."

# Choix du fichier .env
if [ "$1" == "docker" ]; then
  echo " Mode Docker → chargement de .env.docker"
  ENV_FILE=".env.docker"
else
  echo " Mode local → chargement de .env"
  ENV_FILE=".env"
fi

# Vérifie que le fichier existe
if [ ! -f "$ENV_FILE" ]; then
  echo " Fichier $ENV_FILE introuvable"
  exit 1
fi

# Exporter les variables d'environnement
export $(grep -v '^#' $ENV_FILE | xargs)

# Lancer l’application Node.js
node server.js
