# Étape 1 : Image de base officielle Node.js
FROM node:20.19.3

# Étape 2 : Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier les fichiers de dépendances
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier tous les fichiers dans le conteneur
COPY . .

# Étape 6 : Compiler Tailwind CSS (optionnel si déjà compilé localement)
# RUN npm run build-css

# Étape 7 : Exposer le port de l'application
EXPOSE 5000

# Étape 8 : Lancer l’application
CMD ["bash", "./start.sh", "docker"]
