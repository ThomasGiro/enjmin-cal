# ENJMIN-Calendar
#### Ou comment se debarasser du site du CNAM

Nécessite Node.js et npm.

## Installation :

Installez les packages nécessaires : 
```
npm install
```

Suivez l'étape 1 du quickstart de l'API de Google Calendar enfin d'avoir dans le repertoire le fichier `client_secret.json`:  
https://developers.google.com/google-apps/calendar/quickstart/nodejs?hl=Fr#step_1_turn_on_the_api_name

Copiez le fichier `default-config.js`, renommez le `config.js` et remplacez les variables avec l'identifiant unique et le code de scolarité trouvable sur l'ENT du CNAM. Ses codes sont inclus dans le lien du planning.

Créez également un calendrier sur votre compte Google et mettez son identifiants dans le fichier de configuration.

Enfin exécutez le programme : 
```
node index.js
```

Le programme actualisera le planning sur le calendrier spécifié toutes les 4 heures.